// ============================================================
// Webhook Stripe -> Ora AI
//
// POST /api/webhooks/stripe
//
// Événements gérés :
//   checkout.session.completed      -> nouvel abonnement
//   customer.subscription.updated   -> changement de plan / renouvellement
//   customer.subscription.deleted   -> résiliation
//   invoice.payment_failed          -> paiement échoué -> statut past_due
//   invoice.payment_succeeded       -> paiement réussi -> statut active
//
// Configuration Stripe Dashboard :
//   Webhook URL : https://votre-domaine.com/api/webhooks/stripe
//   Signing secret : STRIPE_WEBHOOK_SECRET (variable .env)
//   Écouter : checkout.session.completed, customer.subscription.*,
//              invoice.payment_failed, invoice.payment_succeeded
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  upsertSubscription,
  cancelSubscription,
  getUserIdByStripeCustomer,
  handleCheckoutCompleted,
  resolvePlanFromPriceId,
  type StripeSubStatus,
} from "@/lib/db/stripe";

// ============================================================
// Désactiver le body parsing de Next.js
// Stripe a besoin du body brut pour vérifier la signature HMAC
// ============================================================
export const runtime = "nodejs";

// ============================================================
// Initialisation Stripe SDK
// ============================================================
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante");
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" });
}

// ============================================================
// POST — Réception des événements Stripe
// ============================================================
export async function POST(req: NextRequest) {
  // ——— 1. Lire le body brut (nécessaire pour la vérification de signature) ———
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.warn("[Webhook Stripe] Signature manquante");
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook Stripe] STRIPE_WEBHOOK_SECRET manquant");
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });
  }

  // ——— 2. Vérifier la signature Stripe ———
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Signature invalide";
    console.error("[Webhook Stripe] Signature invalide :", message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  console.log("[Webhook Stripe] Événement reçu :", event.type, event.id);

  // ——— 3. Router vers le bon handler ———
  try {
    switch (event.type) {
      // ——— Nouveau checkout complété (premier abonnement) ———
      case "checkout.session.completed":
        await handleCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;

      // ——— Abonnement mis à jour (upgrade, downgrade, renouvellement, cancel schedule) ———
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      // ——— Abonnement résilié ———
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // ——— Paiement échoué ———
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // ——— Paiement réussi (renouvellement) ———
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        // Événement non géré — OK, Stripe ne doit pas recevoir d'erreur
        console.log("[Webhook Stripe] Événement non géré (ignoré) :", event.type);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[Webhook Stripe] Erreur traitement événement :", event.type, message);
    // Retourner 500 pour que Stripe retente l'envoi
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Stripe attend toujours un 200
  return NextResponse.json({ received: true }, { status: 200 });
}

// ============================================================
// HANDLERS PAR ÉVÉNEMENT
// ============================================================

// ——— checkout.session.completed ———
async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") {
    console.log("[Webhook Stripe] Checkout non-subscription ignoré");
    return;
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("[Webhook Stripe] checkout.session.completed : userId manquant dans metadata");
    return;
  }

  const stripeCustomerId     = session.customer as string;
  const stripeSubId          = session.subscription as string;

  // Récupérer les détails de l'abonnement pour avoir le Price ID
  const stripe         = getStripe();
  const subscription   = await stripe.subscriptions.retrieve(stripeSubId);
  const priceItem      = subscription.items.data[0];
  const stripePriceId  = priceItem?.price?.id ?? "";

  await handleCheckoutCompleted({
    userId,
    stripeCustomerId,
    stripeSubId,
    stripePriceId,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd:   new Date(subscription.current_period_end   * 1000).toISOString(),
    trialEnd: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : undefined,
  });

  console.log("[Webhook Stripe] Nouvel abonnement enregistré pour userId :", userId);
}

// ——— customer.subscription.updated ———
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;

  const userId = await getUserIdByStripeCustomer(stripeCustomerId);
  if (!userId) {
    console.error("[Webhook Stripe] subscription.updated : userId introuvable pour customer :", stripeCustomerId);
    return;
  }

  const priceItem     = subscription.items.data[0];
  const stripePriceId = priceItem?.price?.id ?? "";
  const plan          = resolvePlanFromPriceId(stripePriceId);

  // Mapper le statut Stripe vers notre enum
  const statusMap: Partial<Record<Stripe.Subscription.Status, StripeSubStatus>> = {
    active:   "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
  };
  const status: StripeSubStatus = statusMap[subscription.status] ?? "active";

  await upsertSubscription(userId, {
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId,
    plan,
    status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd:   new Date(subscription.current_period_end   * 1000).toISOString(),
    cancelAtPeriodEnd:  subscription.cancel_at_period_end,
    trialEnd: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : undefined,
  });

  console.log("[Webhook Stripe] Abonnement mis à jour :", subscription.id, "plan:", plan, "statut:", status);
}

// ——— customer.subscription.deleted ———
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const result = await cancelSubscription(subscription.id);
  if (!result.success) {
    throw new Error("Erreur annulation abonnement : " + result.error);
  }
  console.log("[Webhook Stripe] Abonnement annulé :", subscription.id);
}

// ——— invoice.payment_failed ———
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string;
  if (!stripeCustomerId) return;

  const userId = await getUserIdByStripeCustomer(stripeCustomerId);
  if (!userId) {
    console.warn("[Webhook Stripe] invoice.payment_failed : userId introuvable pour customer :", stripeCustomerId);
    return;
  }

  // Mettre le statut en past_due
  const supabase = (await import("@/lib/db/supabase")).getSupabaseServerClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status:     "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId)
    .eq("status",             "active");

  if (error) {
    throw new Error("Erreur mise à jour past_due : " + error.message);
  }

  // TODO: envoyer un email de relance via Resend
  // await sendPaymentFailedEmail(userId, invoice.hosted_invoice_url);

  console.log("[Webhook Stripe] Paiement échoué — userId :", userId, "facture :", invoice.id);
}

// ——— invoice.payment_succeeded ———
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Ignorer les factures de checkout (déjà gérées par checkout.session.completed)
  if (invoice.billing_reason === "subscription_create") return;

  const stripeCustomerId = invoice.customer as string;
  if (!stripeCustomerId) return;

  const userId = await getUserIdByStripeCustomer(stripeCustomerId);
  if (!userId) return;

  // Remettre le statut en active si était past_due
  const supabase = (await import("@/lib/db/supabase")).getSupabaseServerClient();
  await supabase
    .from("subscriptions")
    .update({
      status:     "active",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId)
    .eq("status",             "past_due");

  // TODO: envoyer un email de confirmation de paiement
  // await sendPaymentSuccessEmail(userId, invoice.hosted_invoice_url);

  console.log("[Webhook Stripe] Paiement réussi — userId :", userId, "facture :", invoice.id);
}
