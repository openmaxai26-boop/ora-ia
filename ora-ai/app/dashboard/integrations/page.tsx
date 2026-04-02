"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCurrentUser, useIntegrations } from "@/lib/hooks/useDashboard";
import { getSupabaseBrowserClient } from "@/lib/db/supabase";

const ALL_INTEGRATIONS = [
  { platform: "whatsapp",       label: "WhatsApp Business", icon: "💬", category: "Messagerie", description: "Recevez et répondez aux messages WhatsApp automatiquement via Hina" },
  { platform: "messenger",      label: "Facebook Messenger", icon: "📨", category: "Messagerie", description: "Gérez vos messages Messenger 24h/24 avec Hina" },
  { platform: "instagram",      label: "Instagram Business", icon: "📸", category: "Réseaux sociaux", description: "Publiez des posts, stories et reels automatiquement via Teva" },
  { platform: "facebook",       label: "Facebook Page", icon: "👍", category: "Réseaux sociaux", description: "Publiez du contenu sur votre page Facebook via Teva" },
  { platform: "tiktok",         label: "TikTok Business", icon: "🎵", category: "Réseaux sociaux", description: "Créez et publiez des vidéos TikTok avec Teva" },
  { platform: "linkedin",       label: "LinkedIn Company", icon: "💼", category: "Pro", description: "Publiez des offres d'emploi (Manu) et prospectez des clients (Ari)" },
  { platform: "wordpress",      label: "WordPress", icon: "📝", category: "SEO", description: "Publiez automatiquement des articles SEO via Reva" },
  { platform: "wix",            label: "Wix", icon: "🌐", category: "SEO", description: "Publiez du contenu sur votre site Wix via Reva" },
  { platform: "google_calendar",label: "Google Agenda", icon: "📅", category: "Productivité", description: "Planifiez les rendez-vous confirmés par Hina et les entretiens de Manu" },
  { platform: "notion",         label: "Notion CRM", icon: "🗂️", category: "CRM", description: "Synchronisez vos prospects Ari dans votre base Notion" },
  { platform: "stripe",         label: "Stripe", icon: "💳", category: "Paiement", description: "Gérez votre abonnement Ora AI" },
];

const CATEGORIES = Array.from(new Set(ALL_INTEGRATIONS.map((i) => i.category)));

export default function IntegrationsPage() {
  const { user } = useCurrentUser();
  const userId = user?.id ?? null;

  const { integrations, loading } = useIntegrations(userId);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Tous");

  const displayed =
    activeCategory === "Tous"
      ? ALL_INTEGRATIONS
      : ALL_INTEGRATIONS.filter((i) => i.category === activeCategory);

  const connectedCount = Object.values(integrations).filter(Boolean).length;

  const handleToggle = async (platform: string, currentlyConnected: boolean) => {
    if (!userId || saving) return;
    setSaving(platform);

    try {
      const supabase = getSupabaseBrowserClient();
      const integ = ALL_INTEGRATIONS.find((i) => i.platform === platform)!;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("integrations")
        .upsert(
          {
            user_id: userId,
            platform,
            label: integ.label,
            icon: integ.icon,
            connected: !currentlyConnected,
            connected_at: !currentlyConnected ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,platform" }
        );

      // Rafraîchir la page pour refléter le changement
      // (le hook useIntegrations sera remis à jour au prochain render)
      window.location.reload();
    } catch (err) {
      console.error("Erreur toggle intégration :", err);
    } finally {
      setSaving(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-ocean">Intégrations</h1>
            <p className="text-ocean/50">
              {loading
                ? "Chargement..."
                : connectedCount + " intégration" + (connectedCount > 1 ? "s" : "") + " connectée" + (connectedCount > 1 ? "s" : "")}
            </p>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {["Tous", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                "px-4 py-2 rounded-full text-sm font-semibold transition-all " +
                (activeCategory === cat
                  ? "bg-lagoon text-white"
                  : "bg-white text-ocean/60 border border-gray-200 hover:border-lagoon hover:text-lagoon")
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grille des intégrations */}
        <div className="grid grid-cols-1 gap-4">
          {displayed.map((integ) => {
            const connected = integrations[integ.platform] ?? false;
            const isSaving = saving === integ.platform;

            return (
              <div
                key={integ.platform}
                className={
                  "bg-white rounded-2xl border p-5 flex items-center gap-5 transition-all " +
                  (connected
                    ? "border-green-200 bg-green-50/30"
                    : "border-gray-100 hover:border-lagoon/30")
                }
              >
                {/* Icône */}
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {integ.icon}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-ocean">{integ.label}</span>
                    <span className="text-xs text-ocean/40 bg-gray-100 px-2 py-0.5 rounded-full">
                      {integ.category}
                    </span>
                  </div>
                  <p className="text-ocean/50 text-sm truncate">{integ.description}</p>
                </div>

                {/* Toggle */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  {connected && (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Connecté
                    </span>
                  )}
                  <button
                    onClick={() => handleToggle(integ.platform, connected)}
                    disabled={!!saving || loading}
                    className={
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 " +
                      (connected
                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                        : "bg-lagoon text-white hover:bg-ocean")
                    }
                  >
                    {isSaving ? "…" : connected ? "Déconnecter" : "Connecter"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
