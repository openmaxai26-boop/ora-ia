"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/db/supabase";

type PlanKey = "starter" | "pro" | "business";

const plans: {
    name: string;
    planKey: PlanKey | null;
    price: string;
    currency: string;
    period: string;
    description: string;
    color: string;
    badge: string | null;
    features: string[];
    cta: string;
    ctaStyle: string;
}[] = [
  {
        name: "Starter",
        planKey: "starter",
        price: "4 900",
        currency: "XPF",
        period: "/mois",
        description: "Parfait pour démarrer avec l'IA",
        color: "border-gray-200",
        badge: null,
        features: [
                "1 agent IA au choix",
                "Tableau de bord basique",
                "Support par email",
                "Connexion 2 réseaux sociaux",
                "Rapports hebdomadaires",
              ],
        cta: "Commencer",
        ctaStyle: "border-2 border-lagoon text-lagoon hover:bg-lagoon hover:text-white",
  },
  {
        name: "Pro",
        planKey: "pro",
        price: "9 900",
        currency: "XPF",
        period: "/mois",
        description: "Pour les entreprises ambitieuses",
        color: "border-lagoon",
        badge: "Le plus populaire",
        features: [
                "3 agents IA au choix",
                "Tableau de bord complet",
                "Support prioritaire WhatsApp",
                "Connexions illimitées",
                "Rapports quotidiens",
                "Configuration personnalisée",
                "Contenu adapté au fenua",
              ],
        cta: "Démarrer en Pro",
        ctaStyle: "bg-lagoon text-white hover:bg-ocean",
  },
  {
        name: "Business",
        planKey: "business",
        price: "19 900",
        currency: "XPF",
        period: "/mois",
        description: "Pour les grandes structures",
        color: "border-ocean",
        badge: null,
        features: [
                "5 agents IA (tous inclus)",
                "Tableau de bord avancé",
                "Manager dédié",
                "Connexions illimitées",
                "Rapports en temps réel",
                "Configuration sur mesure",
                "Intégration sur votre site web",
                "Formation de votre équipe",
              ],
        cta: "Nous contacter",
        ctaStyle: "bg-ocean text-white hover:bg-lagoon",
  },
  ];

export default function Pricing() {
    const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
    const router = useRouter();

  const handleSubscribe = async (planKey: PlanKey | null) => {
    // Plan "Business" → contact direct
    if (!planKey || planKey === "business") {
      window.location.href = "mailto:contact@ora-ai.pf?subject=Demande%20plan%20Business%20%E2%80%94%20Ora%20AI";
      return;
    }

    setLoadingPlan(planKey);

    try {
      // Vérifier si l'utilisateur est connecté
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Pas connecté → inscription d'abord
        router.push("/signup?plan=" + planKey);
        return;
      }

      // Plan Starter sans paiement → aller au dashboard directement
      if (planKey === "starter") {
        router.push("/dashboard");
        return;
      }

      // Appeler l'API Stripe Checkout pour les plans payants
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la création du paiement");
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("[Pricing] Erreur checkout :", err);
      alert("Une erreur est survenue. Veuillez réessayer dans quelques instants.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
        <section id="tarifs" className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                      <div className="text-center mb-16">
                                <div className="inline-block bg-lagoon/10 text-lagoon font-semibold px-4 py-2 rounded-full text-sm mb-4">
                                            Tarifs transparents
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-ocean mb-4">
                                            Un prix juste,{" "}
                                            <span className="text-lagoon"> adapté au fenua</span>
                                </h2>
                                <p className="text-ocean/60 text-xl max-w-2xl mx-auto">
                                            Tarifs en Francs CFP. Sans engagement. Éligible à l&apos;Aide à la
                                            Création Numérique (ACN) de la DGEN.
                                </p>
                      </div>
              
                {/* Plans */}
                      <div className="grid md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan) => {
                      const isLoading = loadingPlan === plan.planKey;
                      return (
                                      <div
                                                        key={plan.name}
                                                        className={`relative border-2 ${plan.color} rounded-2xl p-8 card-hover ${
                                                                            plan.badge ? "shadow-xl" : "shadow-sm"
                                                        }`}
                                                      >
                                        {/* Badge */}
                                        {plan.badge && (
                                                                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lagoon text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                                                                            {plan.badge}
                                                                          </div>
                                                      )}
                                                      <div className="mb-6">
                                                                        <h3 className="text-xl font-bold text-ocean mb-1">
                                                                          {plan.name}
                                                                        </h3>
                                                                        <p className="text-ocean/50 text-sm mb-4">
                                                                          {plan.description}
                                                                        </p>
                                                                        <div className="flex items-baseline gap-1">
                                                                                            <span className="text-4xl font-black text-ocean">
                                                                                              {plan.price}
                                                                                              </span>
                                                                                            <span className="text-ocean/50 font-medium">
                                                                                              {plan.currency} {plan.period}
                                                                                              </span>
                                                                        </div>
                                                      </div>
                                      
                                                      <ul className="space-y-3 mb-8">
                                                        {plan.features.map((f) => (
                                                                            <li
                                                                                                    key={f}
                                                                                                    className="flex items-start gap-3 text-sm text-ocean/70"
                                                                                                  >
                                                                                                  <span className="mt-0.5 w-5 h-5 bg-lagoon/15 text-lagoon rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                                                                                                          ✓
                                                                                                    </span>
                                                                              {f}
                                                                            </li>
                                                                          ))}
                                                      </ul>
                                      
                                                      <button
                                                                          onClick={() => handleSubscribe(plan.planKey)}
                                                                          disabled={isLoading}
                                                                          className={`block w-full text-center px-6 py-3 rounded-full font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${plan.ctaStyle}`}
                                                                        >
                                                        {isLoading ? "Chargement..." : plan.cta}
                                                      </button>
                                      </div>
                                    );
        })}
                      </div>
              
                {/* ACN Note */}
                      <div className="mt-12 bg-ocean/5 border border-ocean/10 rounded-2xl p-6 text-center">
                                <p className="text-ocean/70">
                                            💡 <strong>Bon à savoir :</strong> L&apos;Aide à la Création
                                            Numérique (ACN) de la DGEN peut financer une partie de votre
                                            abonnement Ora AI. Renseignez-vous auprès de{" "}
                                            <span className="text-lagoon font-semibold">
                                                          la Direction Générale de l&apos;Économie Numérique
                                            </span>
                                            .
                                </p>
                      </div>
              </div>
        </section>
      );
}
