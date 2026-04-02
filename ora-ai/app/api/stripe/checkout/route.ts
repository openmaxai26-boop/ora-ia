// ============================================================
// Route Stripe Checkout
//
// POST /api/stripe/checkout
// Body : { plan: "starter" | "pro" | "business" }
//
// Crée une Stripe Checkout Session et retourne l'URL de paiement
// L'utilisateur est redirigé vers Stripe puis revient sur /dashboard/settings
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/db/supabase";
import { PLAN_PRICES_XPF, type StripePlan } from "@/lib/db/stripe";

// Plan -> Stripe Price ID mapping
const PLAN_PRICE_IDS: Record<StripePlan, string | undefined> = {
  starter:  process.env.STRIPE_PRICE_STARTER,
  pro:      process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

export async function POST(req: NextRequest) {
  // ——— 1. Vérifier l'authentification ———
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // ——— 2. Lire le plan demandé ———
  let plan: StripePlan;
  try {
    const body = await req.json();
    plan = body.plan as StripePlan;
    if (!["starter", "pro", "business"].includes(plan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: "Price ID Stripe non configuré pour ce plan" },
      { status: 500 }
    );
  }

  // ——— 3. Récupérer le customer Stripe existant (si déjà client) ———
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .single();

  const existingCustomerId = (existingSub as { stripe_customer_id?: string } | null)?.stripe_customer_id ?? undefined;

  // ——— 4. Créer la session Stripe Checkout ———
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripe();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode:               "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price:    priceId,
          quantity: 1,
        },
      ],
      // URL de retour après paiement réussi
      success_url: appUrl + "/dashboard/settings?checkout=success",
      // URL de retour si l'utilisateur annule
      cancel_url:  appUrl + "/dashboard/settings?checkout=canceled",
      // Metadata pour retrouver l'utilisateur dans le webhook
      metadata: {
        userId: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
        },
      },
      // Pré-remplir l'email
      customer_email: existingCustomerId ? undefined : (user.email ?? undefined),
      customer:       existingCustomerId ?? undefined,
      // Paramètres de locale (français)
      locale: "fr",
      // Autoriser le code promo (optionnel)
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("[Stripe Checkout] Session créée :", session.id, "plan :", plan, "userId :", user.id);

    return NextResponse.json({
      url:       session.url,
      sessionId: session.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe inconnue";
    console.error("[Stripe Checkout] Erreur création session :", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================
// Route Portal Client Stripe (gestion abonnement existant)
//
// POST /api/stripe/checkout?action=portal
// Redirige vers le portail Stripe pour gérer l'abonnement
// ============================================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action !== "portal") {
    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  }

  // Vérifier l'authentification
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Récupérer le customer Stripe
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .single();

  const subTyped = sub as { stripe_customer_id?: string } | null;
  if (!subTyped?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Aucun abonnement Stripe trouvé" },
      { status: 404 }
    );
  }

  try {
    const stripe  = getStripe();
    const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const portalParams: Stripe.BillingPortal.SessionCreateParams = {
      customer:   subTyped.stripe_customer_id,
      return_url: appUrl + "/dashboard/settings",
    };

    // Ajouter la configuration du portail si définie
    const configId = process.env.STRIPE_PORTAL_CONFIGURATION_ID;
    if (configId) {
      portalParams.configuration = configId;
    }

    const portalSession = await stripe.billingPortal.sessions.create(portalParams);

    console.log("[Stripe Portal] Session créée pour customer :", subTyped.stripe_customer_id);

    return NextResponse.redirect(portalSession.url);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe inconnue";
    console.error("[Stripe Portal] Erreur :", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
