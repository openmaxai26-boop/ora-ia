import { getSupabaseServerClient } from "@/lib/db/supabase";

// ============================================================
// TYPES
// ============================================================

export type StripePlan = "starter" | "pro" | "business";
export type StripeSubStatus = "active" | "canceled" | "past_due" | "trialing";

export interface StripeSubscriptionData {
  stripeCustomerId:     string;
  stripeSubscriptionId: string;
  stripePriceId:        string;
  plan:                 StripePlan;
  status:               StripeSubStatus;
  currentPeriodStart:   string;   // ISO date
  currentPeriodEnd:     string;   // ISO date
  cancelAtPeriodEnd:    boolean;
  trialStart?:          string;
  trialEnd?:            string;
}

// ============================================================
// RÉSOLUTION PLAN DEPUIS STRIPE PRICE ID
// ============================================================

/**
 * Convertit un Stripe Price ID en plan Ora AI
 * Les Price IDs sont définis dans les variables d'env
 */
export function resolvePlanFromPriceId(priceId: string): StripePlan {
  const priceMap: Record<string, StripePlan> = {
    [process.env.STRIPE_PRICE_STARTER  ?? "price_starter"]:  "starter",
    [process.env.STRIPE_PRICE_PRO      ?? "price_pro"]:      "pro",
    [process.env.STRIPE_PRICE_BUSINESS ?? "price_business"]: "business",
  };
  return priceMap[priceId] ?? "starter";
}

/**
 * Prix en XPF par plan
 */
export const PLAN_PRICES_XPF: Record<StripePlan, number> = {
  starter:  4900,
  pro:      9900,
  business: 24900,
};

// ============================================================
// LOOKUP : userId depuis stripeCustomerId
// ============================================================

/**
 * Retrouve le user_id Supabase depuis un Stripe customer ID
 */
export async function getUserIdByStripeCustomer(
  stripeCustomerId: string
): Promise<string | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();

  if (error || !data) {
    console.error("[Stripe DB] getUserIdByStripeCustomer error:", error?.message);
    return null;
  }
  return data.user_id as string;
}

// ============================================================
// UPSERT : créer ou mettre à jour un abonnement
// ============================================================

/**
 * Crée ou met à jour l'abonnement d'un utilisateur
 * Appelé par le webhook Stripe lors des événements d'abonnement
 */
export async function upsertSubscription(
  userId: string,
  data: StripeSubscriptionData
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServerClient();

  const record = {
    user_id:                userId,
    plan:                   data.plan,
    status:                 data.status,
    price_xpf:              PLAN_PRICES_XPF[data.plan],
    stripe_customer_id:     data.stripeCustomerId,
    stripe_subscription_id: data.stripeSubscriptionId,
    stripe_price_id:        data.stripePriceId,
    current_period_start:   data.currentPeriodStart,
    current_period_end:     data.currentPeriodEnd,
    cancel_at_period_end:   data.cancelAtPeriodEnd,
    trial_start:            data.trialStart ?? null,
    trial_end:              data.trialEnd   ?? null,
    updated_at:             new Date().toISOString(),
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(record, {
      onConflict:            "stripe_subscription_id",
      ignoreDuplicates:      false,
    });

  if (error) {
    console.error("[Stripe DB] upsertSubscription error:", error.message);
    return { success: false, error: error.message };
  }

  console.log("[Stripe DB] Abonnement mis à jour :", data.stripeSubscriptionId, "→", data.plan, data.status);
  return { success: true };
}

// ============================================================
// CANCEL : marquer un abonnement comme annulé
// ============================================================

/**
 * Marque un abonnement comme annulé dans Supabase
 * Déclenché par l'événement Stripe customer.subscription.deleted
 */
export async function cancelSubscription(
  stripeSubscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status:       "canceled",
      canceled_at:  new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    console.error("[Stripe DB] cancelSubscription error:", error.message);
    return { success: false, error: error.message };
  }

  console.log("[Stripe DB] Abonnement annulé :", stripeSubscriptionId);
  return { success: true };
}

// ============================================================
// CHECKOUT : créer un customer Stripe depuis un checkout.session
// ============================================================

/**
 * Enregistre le customer Stripe lors d'un checkout.session.completed
 * Appelé quand un utilisateur souscrit pour la première fois
 */
export async function handleCheckoutCompleted(opts: {
  userId:              string;
  stripeCustomerId:    string;
  stripeSubId:         string;
  stripePriceId:       string;
  currentPeriodStart:  string;
  currentPeriodEnd:    string;
  trialEnd?:           string;
}): Promise<{ success: boolean; error?: string }> {
  const plan = resolvePlanFromPriceId(opts.stripePriceId);
  const status: StripeSubStatus = opts.trialEnd ? "trialing" : "active";

  return upsertSubscription(opts.userId, {
    stripeCustomerId:     opts.stripeCustomerId,
    stripeSubscriptionId: opts.stripeSubId,
    stripePriceId:        opts.stripePriceId,
    plan,
    status,
    currentPeriodStart:   opts.currentPeriodStart,
    currentPeriodEnd:     opts.currentPeriodEnd,
    cancelAtPeriodEnd:    false,
    trialEnd:             opts.trialEnd,
  });
}
