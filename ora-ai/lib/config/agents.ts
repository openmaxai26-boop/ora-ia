// ============================================================
// ORA AI — Configuration centrale des 5 agents IA
// Source de vérité unique : toute l'UI lit depuis ici
// ============================================================

import type { Agent } from "@/lib/types";

export const AGENTS: Agent[] = [
  {
        id: "teva",
        name: "Teva",
        emoji: "📱",
        role: "Agent Réseaux Sociaux",
        description:
                "Crée et publie automatiquement du contenu sur Facebook, Instagram et TikTok. Photos, légendes, hashtags — tout est adapté au marché polynésien.",
        color: "from-pink-500 to-coral",
        bgColor: "bg-pink-500",
        plan: "starter",
        platforms: ["facebook", "instagram", "tiktok"],
        features: [
                "Publication automatique quotidienne",
                "Visuels générés par IA",
                "Contenu en français & tahitien",
                "Hashtags locaux optimisés",
                "Stories et Reels",
                "Statistiques en temps réel",
              ],
  },
  {
        id: "hina",
        name: "Hina",
        emoji: "💬",
        role: "Agent Service Client",
        description:
                "Répond à vos clients sur WhatsApp, Messenger et votre site web, 24h/24. Gère les demandes, réservations et réclamations sans intervention humaine.",
        color: "from-lagoon to-teal-400",
        bgColor: "bg-lagoon",
        plan: "starter",
        platforms: ["whatsapp", "messenger"],
        features: [
                "Disponible 24h/24 7j/7",
                "WhatsApp Business & Messenger",
                "Prise de rendez-vous automatique",
                "Réponses en français & tahitien",
                "Escalade vers humain si besoin",
                "Historique des conversations",
              ],
  },
  {
        id: "reva",
        name: "Reva",
        emoji: "✍️",
        role: "Agent SEO & Contenu",
        description:
                "Rédige et publie des articles de blog optimisés pour Google. Jusqu'à 30 articles par mois pour améliorer votre visibilité en ligne.",
        color: "from-purple-500 to-indigo-500",
        bgColor: "bg-purple-500",
        plan: "business",
        platforms: ["wordpress", "wix"],
        features: [
                "30 articles optimisés/mois",
                "Mots-clés locaux (Tahiti, Moorea…)",
                "Structure SEO on-page",
                "Publication automatique",
                "Rapport de performance Google",
                "Intégration Google Search Console",
              ],
  },
  {
        id: "manu",
        name: "Manu",
        emoji: "👔",
        role: "Agent Recrutement",
        description:
                "Publie vos offres d'emploi, collecte et trie automatiquement les candidatures selon vos critères. Vous ne voyez que les meilleurs profils.",
        color: "from-gold to-orange-400",
        bgColor: "bg-gold",
        plan: "business",
        platforms: ["linkedin"],
        features: [
                "Publication multi-plateformes",
                "Tri automatique des CV",
                "Score IA des candidats",
                "Rapport de présélection",
                "Agenda des entretiens",
                "Relance automatique",
              ],
  },
  {
        id: "ari",
        name: "Ari",
        emoji: "🎯",
        role: "Agent Prospection",
        description:
                "Identifie des prospects sur les réseaux sociaux et envoie des messages personnalisés pour développer votre clientèle automatiquement.",
        color: "from-ocean to-blue-400",
        bgColor: "bg-ocean",
        plan: "pro",
        platforms: ["linkedin", "instagram"],
        features: [
                "Ciblage intelligent par secteur",
                "Messages ultra-personnalisés",
                "Séquence de relances automatique",
                "Détection des réponses chaudes",
                "Rapport hebdomadaire de leads",
                "Intégration CRM (Notion)",
              ],
  },
  ];

// Map pour accès O(1) par id
export const AGENTS_MAP = Object.fromEntries(
    AGENTS.map((a) => [a.id, a])
  ) as Record<string, Agent>;

// Agents disponibles selon le plan
export function getAgentsForPlan(plan: "starter" | "pro" | "business"): Agent[] {
    const planRank = { starter: 0, pro: 1, business: 2 };
    return AGENTS.filter((a) => planRank[a.plan] <= planRank[plan]);
}

// Plan minimum requis pour un agent
export const PLAN_LIMITS = {
    starter: { agentCount: 1, label: "Starter — 4 900 XPF/mois" },
    pro: { agentCount: 3, label: "Pro — 9 900 XPF/mois" },
    business: { agentCount: 5, label: "Business — 19 900 XPF/mois" },
} as const;
