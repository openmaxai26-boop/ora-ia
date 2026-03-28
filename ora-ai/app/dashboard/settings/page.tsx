"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useCurrentUser } from "@/lib/hooks/useDashboard";
import {
  getProfile,
  updateProfile,
  getNotifications,
  updateNotifications,
  getSubscription,
  PLAN_LABELS,
  type UserProfile,
  type UserNotifications,
  type UserSubscription,
} from "@/lib/db/settings";

export default function SettingsPage() {
  const searchParams  = useSearchParams();
  const { user, loading: userLoading } = useCurrentUser();

  // ——— État chargement ———
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ——— Checkout Stripe ———
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError,   setCheckoutError]   = useState<string | null>(null);

  // Message retour checkout Stripe
  const checkoutStatus = searchParams.get("checkout");

  // ——— Données Supabase ———
  const [profile,       setProfile]       = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<UserNotifications | null>(null);
  const [subscription,  setSubscription]  = useState<UserSubscription | null>(null);

  // ——— Champs profil (formulaire local) ———
  const [profileForm, setProfileForm] = useState({
    entreprise: "",
    secteur:    "Commerce & Artisanat",
    island:     "Tahiti",
    email:      "",
    whatsapp:   "",
    langue:     "Français",
  });

  // ——— Champs notifications ———
  const [notifForm, setNotifForm] = useState({
    email:             true,
    whatsapp:          true,
    rapport_quotidien: true,
    rapport_hebdo:     true,
    alertes_erreur:    true,
  });

  // ——— Chargement initial ———
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const [profileData, notifData, subData] = await Promise.all([
          getProfile(),
          getNotifications(),
          getSubscription(),
        ]);
        if (profileData) {
          setProfile(profileData);
          setProfileForm({
            entreprise: profileData.entreprise || "",
            secteur:    profileData.secteur    || "Commerce & Artisanat",
            island:     profileData.island     || "Tahiti",
            email:      profileData.email      || user?.email || "",
            whatsapp:   profileData.whatsapp   || "",
            langue:     profileData.langue     || "Français",
          });
        }
        if (notifData) {
          setNotifications(notifData);
          setNotifForm({
            email:             notifData.email,
            whatsapp:          notifData.whatsapp,
            rapport_quotidien: notifData.rapport_quotidien,
            rapport_hebdo:     notifData.rapport_hebdo,
            alertes_erreur:    notifData.alertes_erreur,
          });
        }
        if (subData) setSubscription(subData);
      } catch (err) {
        console.error("Erreur chargement settings:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!userLoading) loadSettings();
  }, [user, userLoading]);

  // ——— Sauvegarde profil + notifs ———
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const [profileResult, notifResult] = await Promise.all([
        updateProfile(profileForm),
        updateNotifications(notifForm),
      ]);
      if (!profileResult.success) throw new Error(profileResult.error);
      if (!notifResult.success)   throw new Error(notifResult.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  // ——— Toggle notification (sauvegarde immédiate) ———
  const toggleNotif = async (key: keyof typeof notifForm) => {
    const newVal  = !notifForm[key];
    setNotifForm((n) => ({ ...n, [key]: newVal }));
    await updateNotifications({ [key]: newVal });
  };

  // ——— Checkout Stripe ———
  const handleUpgrade = async (plan: "pro" | "business") => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur Stripe");
      if (data.url) window.location.href = data.url;
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ——— Portail client Stripe (gérer abonnement existant) ———
  const handleManageSubscription = () => {
    window.location.href = "/api/stripe/checkout?action=portal";
  };

  // ——— Plan affiché ———
  const planInfo = subscription ? PLAN_LABELS[subscription.plan] : PLAN_LABELS.starter;

  // ——— Chargement ———
  if (loading || userLoading) {
    return (
      <DashboardLayout active="settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-lagoon border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-ocean/50 text-sm">Chargement des paramètres...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout active="settings">
      <div className="max-w-4xl">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-ocean">Paramètres</h1>
          <p className="text-ocean/50">Configurez votre compte et vos préférences</p>
        </div>

        {/* Retour checkout Stripe */}
        {checkoutStatus === "success" && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
            <span>🎉</span> Abonnement activé avec succès ! Bienvenue sur votre nouveau plan.
          </div>
        )}
        {checkoutStatus === "canceled" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
            <span>↩</span> Paiement annulé. Votre plan actuel est conservé.
          </div>
        )}

        {/* Notification sauvegarde */}
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
            <span>✓</span> Modifications sauvegardées avec succès
          </div>
        )}
        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
            <span>✗</span> {saveError}
          </div>
        )}
        {checkoutError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
            <span>✗</span> {checkoutError}
          </div>
        )}

        <div className="space-y-8">

          {/* ——— Profil entreprise ——— */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-ocean font-bold text-lg">Profil de l&apos;entreprise</h2>
              {user && (
                <span className="text-xs text-ocean/30 bg-gray-50 px-3 py-1 rounded-full">
                  {user.email}
                </span>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: "Nom de l'entreprise", key: "entreprise", placeholder: "Ex: Poerava Artisanat" },
                { label: "Secteur d'activité",  key: "secteur",    placeholder: "Ex: Commerce & Artisanat" },
                { label: "Île / Atoll",         key: "island",     placeholder: "Ex: Tahiti, Moorea, Bora Bora..." },
                { label: "Email de contact",    key: "email",      placeholder: "contact@votreentreprise.pf" },
                { label: "Numéro WhatsApp",     key: "whatsapp",   placeholder: "+689 87 00 00 00" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-ocean font-semibold text-sm mb-2">{field.label}</label>
                  <input
                    type="text"
                    value={profileForm[field.key as keyof typeof profileForm]}
                    placeholder={field.placeholder}
                    onChange={(e) => setProfileForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition-all text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-ocean font-semibold text-sm mb-2">Langue préférée</label>
                <select
                  value={profileForm.langue}
                  onChange={(e) => setProfileForm((p) => ({ ...p, langue: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition-all text-sm"
                >
                  <option>Français</option>
                  <option>Français & Tahitien</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>

          {/* ——— Notifications ——— */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-ocean font-bold text-lg mb-6">Notifications</h2>
            <div className="space-y-4">
              {[
                { key: "email"             as const, label: "Notifications par email",   desc: "Recevez les alertes par email" },
                { key: "whatsapp"          as const, label: "Notifications WhatsApp",    desc: "Recevez les alertes sur WhatsApp" },
                { key: "rapport_quotidien" as const, label: "Rapport quotidien",         desc: "Un résumé chaque matin à 8h" },
                { key: "rapport_hebdo"     as const, label: "Rapport hebdomadaire",      desc: "Bilan complet chaque lundi" },
                { key: "alertes_erreur"    as const, label: "Alertes d'erreur",          desc: "Soyez notifié si un agent rencontre un problème" },
              ].map((notif) => (
                <div key={notif.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="font-semibold text-ocean text-sm">{notif.label}</div>
                    <div className="text-ocean/40 text-xs">{notif.desc}</div>
                  </div>
                  <button
                    onClick={() => toggleNotif(notif.key)}
                    className={"relative w-12 h-6 rounded-full transition-all " + (notifForm[notif.key] ? "bg-lagoon" : "bg-gray-200")}
                  >
                    <span className={"absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all " + (notifForm[notif.key] ? "left-7" : "left-1")} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ——— Abonnement ——— */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-ocean font-bold text-lg mb-6">Abonnement</h2>

            {/* Plan actuel */}
            <div className="flex items-center justify-between p-5 bg-lagoon/5 border border-lagoon/20 rounded-xl mb-4">
              <div>
                <div className={"font-black text-xl " + planInfo.color}>Plan {planInfo.label}</div>
                <div className="text-ocean/60 text-sm">{planInfo.price} — Sans engagement</div>
                <div className="text-lagoon text-xs font-semibold mt-1">
                  ✓ {planInfo.features.join(" · ✓ ")}
                </div>
                {subscription?.status === "trialing" && (
                  <div className="mt-1 text-xs text-amber-500 font-semibold">⏱ Période d&apos;essai en cours</div>
                )}
                {subscription?.status === "past_due" && (
                  <div className="mt-1 text-xs text-red-400 font-semibold">⚠ Paiement en attente — Mettez à jour votre moyen de paiement</div>
                )}
                {subscription?.cancel_at_period_end && (
                  <div className="mt-1 text-xs text-red-400 font-semibold">⚠ Résiliation programmée en fin de période</div>
                )}
              </div>
              <div className="text-right space-y-2">
                {/* Bouton upgrade */}
                {subscription?.plan !== "business" && (
                  <button
                    onClick={() => handleUpgrade(subscription?.plan === "starter" ? "pro" : "business")}
                    disabled={checkoutLoading}
                    className="block bg-ocean text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-lagoon transition-colors disabled:opacity-60"
                  >
                    {checkoutLoading ? "Redirection..." : subscription?.plan === "starter" ? "Passer au Pro" : "Passer au Business"}
                  </button>
                )}
                {/* Gérer abonnement (portail Stripe) */}
                {subscription?.stripe_subscription_id && (
                  <button
                    onClick={handleManageSubscription}
                    className="block text-ocean/50 text-xs hover:text-lagoon transition-colors"
                  >
                    Gérer mon abonnement
                  </button>
                )}
              </div>
            </div>

            {/* Comparatif plans */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {Object.entries(PLAN_LABELS).map(([key, plan]) => (
                <div
                  key={key}
                  className={"rounded-xl p-4 border-2 " + (subscription?.plan === key ? "border-lagoon bg-lagoon/5" : "border-gray-100")}
                >
                  <div className={"font-bold text-sm " + plan.color}>{plan.label}</div>
                  <div className="text-ocean/60 text-xs mt-1">{plan.price}</div>
                  <ul className="mt-2 space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-ocean/50 text-xs">✓ {f}</li>
                    ))}
                  </ul>
                  {subscription?.plan === key
                    ? <div className="mt-2 text-xs text-lagoon font-bold">Plan actuel</div>
                    : key !== "starter" && subscription?.plan !== key && (
                      <button
                        onClick={() => handleUpgrade(key as "pro" | "business")}
                        disabled={checkoutLoading}
                        className="mt-2 text-xs text-ocean/40 hover:text-lagoon transition-colors font-semibold disabled:opacity-40"
                      >
                        Choisir ce plan →
                      </button>
                    )
                  }
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-ocean/40">
              💡 Éligible à l&apos;Aide à la Création Numérique (ACN) de la DGEN.
              Renseignez-vous pour obtenir un remboursement partiel.
            </div>
          </div>

          {/* ——— Zone de danger ——— */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
            <h2 className="text-red-500 font-bold text-lg mb-4">Zone de danger</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-ocean text-sm">Supprimer le compte</div>
                <div className="text-ocean/40 text-xs">Cette action est irréversible. Toutes vos données seront supprimées.</div>
              </div>
              <button className="border-2 border-red-200 text-red-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                Supprimer
              </button>
            </div>
          </div>

          {/* ——— Bouton sauvegarde ——— */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-lagoon text-white px-8 py-3 rounded-xl font-bold hover:bg-ocean transition-colors lagoon-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
