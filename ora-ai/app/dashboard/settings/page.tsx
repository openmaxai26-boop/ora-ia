"use client";

import { useState } from "react";

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
          email: true,
          whatsapp: true,
          rapport_quotidien: true,
          rapport_hebdo: true,
          alertes_erreur: true,
    });

  const [profile, setProfile] = useState({
        entreprise: "Poerava Artisanat",
        secteur: "Commerce & Artisanat",
        island: "Tahiti",
        email: "contact@poerava.pf",
        whatsapp: "+689 87 00 00 00",
        langue: "Français",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
  };

  return (
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar */}
              <aside className="fixed left-0 top-0 bottom-0 w-64 gradient-bg text-white flex flex-col z-40">
                      <div className="p-6 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-lagoon flex items-center justify-center">
                                                          <span className="font-bold text-white text-sm">O</span>span>
                                            </div>div>
                                            <span className="text-xl font-bold">
                                                          Ora <span className="text-lagoon">AI</span>span>
                                            </span>span>
                                </div>div>
                      </div>div>
                      <nav className="flex-1 p-4 space-y-1">
                        {[
          { icon: "🏠", label: "Tableau de bord", href: "/dashboard", active: false },
          { icon: "🤖", label: "Mes agents", href: "/dashboard/agents", active: false },
          { icon: "📊", label: "Statistiques", href: "/dashboard/stats", active: false },
          { icon: "🔗", label: "Intégrations", href: "/dashboard/integrations", active: false },
          { icon: "⚙️", label: "Paramètres", href: "/dashboard/settings", active: true },
                    ].map((item) => (
                                  <a
                                                  key={item.label}
                                                  href={item.href}
                                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                                    item.active
                                                                      ? "bg-lagoon/20 text-lagoon"
                                                                      : "text-white/60 hover:bg-white/10 hover:text-white"
                                                  }`}
                                                >
                                                <span>{item.icon}</span>span>
                                    {item.label}
                                  </a>a>
                                ))}
                      </nav>nav>
                      <div className="p-4 border-t border-white/10">
                                <div className="bg-white/10 rounded-xl p-4">
                                            <p className="text-xs text-white/50 mb-1">Plan actuel</p>p>
                                            <p className="font-bold text-lagoon">Pro</p>p>
                                            <p className="text-xs text-white/50 mt-1">9 900 XPF/mois</p>p>
                                </div>div>
                      </div>div>
              </aside>aside>
        
          {/* Main content */}
              <main className="ml-64 p-8 max-w-4xl">
                      <div className="mb-8">
                                <h1 className="text-2xl font-black text-ocean">Paramètres</h1>h1>
                                <p className="text-ocean/50">Configurez votre compte et vos préférences</p>p>
                      </div>div>
              
                {saved && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
                                <span>✓</span>span> Modifications sauvegardées avec succès
                    </div>div>
                      )}
              
                      <div className="space-y-8">
                        {/* Profile section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <h2 className="text-ocean font-bold text-lg mb-6">Profil de l&apos;entreprise</h2>h2>
                                            <div className="grid md:grid-cols-2 gap-5">
                                              {[
          { label: "Nom de l'entreprise", key: "entreprise" },
          { label: "Secteur d'activité", key: "secteur" },
          { label: "Île / Atoll", key: "island" },
          { label: "Email de contact", key: "email" },
          { label: "Numéro WhatsApp", key: "whatsapp" },
                        ].map((field) => (
                                          <div key={field.key}>
                                                            <label className="block text-ocean font-semibold text-sm mb-2">
                                                              {field.label}
                                                            </label>label>
                                                            <input
                                                                                  type="text"
                                                                                  value={profile[field.key as keyof typeof profile]}
                                                                                  onChange={(e) =>
                                                                                                          setProfile((p) => ({ ...p, [field.key]: e.target.value }))
                                                                                    }
                                                                                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition-all text-sm"
                                                                                />
                                          </div>div>
                                        ))}
                                                          <div>
                                                                          <label className="block text-ocean font-semibold text-sm mb-2">
                                                                                            Langue préférée
                                                                          </label>label>
                                                                          <select
                                                                                              value={profile.langue}
                                                                                              onChange={(e) => setProfile((p) => ({ ...p, langue: e.target.value }))}
                                                                                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition-all text-sm"
                                                                                            >
                                                                                            <option>Français</option>option>
                                                                                            <option>Français & Tahitien</option>option>
                                                                                            <option>English</option>option>
                                                                          </select>select>
                                                          </div>div>
                                            </div>div>
                                </div>div>
                      
                        {/* Notifications section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <h2 className="text-ocean font-bold text-lg mb-6">Notifications</h2>h2>
                                            <div className="space-y-4">
                                              {[
          { key: "email", label: "Notifications par email", desc: "Recevez les alertes par email" },
          { key: "whatsapp", label: "Notifications WhatsApp", desc: "Recevez les alertes sur WhatsApp" },
          { key: "rapport_quotidien", label: "Rapport quotidien", desc: "Un résumé chaque matin à 8h" },
          { key: "rapport_hebdo", label: "Rapport hebdomadaire", desc: "Bilan complet chaque lundi" },
          { key: "alertes_erreur", label: "Alertes d'erreur", desc: "Soyez notifié si un agent rencontre un problème" },
                        ].map((notif) => (
                                          <div key={notif.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                                            <div>
                                                                                <div className="font-semibold text-ocean text-sm">{notif.label}</div>div>
                                                                                <div className="text-ocean/40 text-xs">{notif.desc}</div>div>
                                                            </div>div>
                                                            <button
                                                                                  onClick={() =>
                                                                                                          setNotifications((n) => ({
                                                                                                                                    ...n,
                                                                                                                                    [notif.key]: !n[notif.key as keyof typeof n],
                                                                                                            }))
                                                                                    }
                                                                                  className={`relative w-12 h-6 rounded-full transition-all ${
                                                                                                          notifications[notif.key as keyof typeof notifications]
                                                                                                            ? "bg-lagoon"
                                                                                                            : "bg-gray-200"
                                                                                    }`}
                                                                                >
                                                                                <span
                                                                                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                                                                                                                                  notifications[notif.key as keyof typeof notifications]
                                                                                                                                    ? "left-7"
                                                                                                                                    : "left-1"
                                                                                                          }`}
                                                                                                      />
                                                            </button>button>
                                          </div>div>
                                        ))}
                                            </div>div>
                                </div>div>
                      
                        {/* Plan section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <h2 className="text-ocean font-bold text-lg mb-6">Abonnement</h2>h2>
                                            <div className="flex items-center justify-between p-5 bg-lagoon/5 border border-lagoon/20 rounded-xl">
                                                          <div>
                                                                          <div className="font-black text-ocean text-xl">Plan Pro</div>div>
                                                                          <div className="text-ocean/60 text-sm">9 900 XPF/mois — Sans engagement</div>div>
                                                                          <div className="text-lagoon text-xs font-semibold mt-1">
                                                                                            ✓ 3 agents IA · ✓ Support WhatsApp · ✓ Connexions illimitées
                                                                          </div>div>
                                                          </div>div>
                                                          <div className="text-right">
                                                                          <a
                                                                                              href="#"
                                                                                              className="block bg-ocean text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-lagoon transition-colors mb-2"
                                                                                            >
                                                                                            Passer au Business
                                                                          </a>a>
                                                                          <a href="#" className="text-ocean/40 text-xs hover:text-red-400 transition-colors">
                                                                                            Résilier l&apos;abonnement
                                                                          </a>a>
                                                          </div>div>
                                            </div>div>
                                            <div className="mt-4 text-xs text-ocean/40">
                                                          💡 Éligible à l&apos;Aide à la Création Numérique (ACN) de la DGEN. Renseignez-vous pour obtenir un remboursement partiel.
                                            </div>div>
                                </div>div>
                      
                        {/* Danger zone */}
                                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                                            <h2 className="text-red-500 font-bold text-lg mb-4">Zone de danger</h2>h2>
                                            <div className="flex items-center justify-between">
                                                          <div>
                                                                          <div className="font-semibold text-ocean text-sm">Supprimer le compte</div>div>
                                                                          <div className="text-ocean/40 text-xs">Cette action est irréversible. Toutes vos données seront supprimées.</div>div>
                                                          </div>div>
                                                          <button className="border-2 border-red-200 text-red-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                                                                          Supprimer
                                                          </button>button>
                                            </div>div>
                                </div>div>
                      
                        {/* Save button */}
                                <div className="flex justify-end">
                                            <button
                                                            onClick={handleSave}
                                                            className="bg-lagoon text-white px-8 py-3 rounded-xl font-bold hover:bg-ocean transition-colors lagoon-glow"
                                                          >
                                                          Sauvegarder les modifications
                                            </button>button>
                                </div>div>
                      </div>div>
              </main>main>
        </div>div>
      );
}</div>
