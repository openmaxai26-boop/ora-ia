"use client";

import { useState } from "react";

const integrations = [
  {
        category: "Réseaux sociaux",
        items: [
          { name: "Facebook", icon: "📘", connected: true, description: "Page et Messenger connectés" },
          { name: "Instagram", icon: "📸", connected: true, description: "Compte professionnel connecté" },
          { name: "TikTok", icon: "🎵", connected: false, description: "Publiez des vidéos automatiquement" },
          { name: "LinkedIn", icon: "💼", connected: false, description: "Prospection et recrutement" },
              ],
  },
  {
        category: "Messagerie",
        items: [
          { name: "WhatsApp Business", icon: "💬", connected: true, description: "Numéro WhatsApp lié" },
          { name: "Gmail", icon: "✉️", connected: false, description: "Gestion des emails entrants" },
          { name: "Messenger", icon: "💭", connected: true, description: "Réponses automatiques activées" },
              ],
  },
  {
        category: "Productivité",
        items: [
          { name: "Google Calendar", icon: "📅", connected: false, description: "Prise de rendez-vous automatique" },
          { name: "Notion", icon: "📝", connected: false, description: "Synchronisation des rapports" },
          { name: "Stripe", icon: "💳", connected: false, description: "Paiements et abonnements" },
              ],
  },
  {
        category: "Site web",
        items: [
          { name: "WordPress", icon: "🌐", connected: false, description: "Publication d'articles SEO" },
          { name: "Wix", icon: "🎨", connected: false, description: "Mise à jour de contenu" },
          { name: "Shopify", icon: "🛒", connected: false, description: "E-commerce & notifications" },
              ],
  },
  ];

export default function IntegrationsPage() {
    const [items, setItems] = useState(integrations);

  const toggleConnection = (cat: string, name: string) => {
        setItems((prev) =>
                prev.map((c) =>
                          c.category === cat
                                   ? {
                                                   ...c,
                                                   items: c.items.map((i) =>
                                                                     i.name === name ? { ...i, connected: !i.connected } : i
                                                                                    ),
                                   }
                            : c
                               )
                     );
  };

  const totalConnected = items.flatMap((c) => c.items).filter((i) => i.connected).length;

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
          { icon: "🔗", label: "Intégrations", href: "/dashboard/integrations", active: true },
          { icon: "⚙️", label: "Paramètres", href: "/dashboard/settings", active: false },
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
              <main className="ml-64 p-8">
                      <div className="flex items-center justify-between mb-8">
                                <div>
                                            <h1 className="text-2xl font-black text-ocean">Intégrations</h1>h1>
                                            <p className="text-ocean/50">
                                              {totalConnected} connexion(s) active(s) sur {items.flatMap((c) => c.items).length} disponibles
                                            </p>p>
                                </div>div>
                                <div className="bg-lagoon/10 text-lagoon text-sm font-semibold px-4 py-2 rounded-full">
                                            ✓ Connexions illimitées — Plan Pro
                                </div>div>
                      </div>div>
              
                      <div className="space-y-8">
                        {items.map((category) => (
                      <div key={category.category}>
                                    <h2 className="text-ocean font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <span className="w-6 h-px bg-lagoon" />
                                      {category.category}
                                    </h2>h2>
                                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                      {category.items.map((item) => (
                                          <div
                                                                key={item.name}
                                                                className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                                                                                        item.connected ? "border-lagoon/30" : "border-gray-100"
                                                                }`}
                                                              >
                                                              <div className="flex items-start justify-between mb-3">
                                                                                    <div className="flex items-center gap-3">
                                                                                                            <span className="text-2xl">{item.icon}</span>span>
                                                                                                            <div>
                                                                                                                                      <div className="font-bold text-ocean text-sm">{item.name}</div>div>
                                                                                                                                      <div className="text-ocean/40 text-xs">{item.description}</div>div>
                                                                                                              </div>div>
                                                                                      </div>div>
                                                              </div>div>
                                                              <button
                                                                                      onClick={() => toggleConnection(category.category, item.name)}
                                                                                      className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
                                                                                                                item.connected
                                                                                                                  ? "bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500"
                                                                                                                  : "bg-lagoon/10 text-lagoon hover:bg-lagoon hover:text-white"
                                                                                        }`}
                                                                                    >
                                                                {item.connected ? "✓ Connecté — Déconnecter" : "+ Connecter"}
                                                              </button>button>
                                          </div>div>
                                        ))}
                                    </div>div>
                      </div>div>
                    ))}
                      </div>div>
              
                {/* Help section */}
                      <div className="mt-10 bg-ocean/5 border border-ocean/10 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                            <span className="text-3xl">💡</span>span>
                                            <div>
                                                          <h3 className="font-bold text-ocean mb-1">Besoin d&apos;aide pour connecter vos outils ?</h3>h3>
                                                          <p className="text-ocean/60 text-sm mb-3">
                                                                          Notre équipe à Papeete vous accompagne pas à pas pour configurer vos intégrations, même sans compétences techniques.
                                                          </p>p>
                                                          <a
                                                                            href="https://wa.me/689"
                                                                            className="inline-block bg-lagoon text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-ocean transition-colors"
                                                                          >
                                                                          Contacter le support WhatsApp →
                                                          </a>a>
                                            </div>div>
                                </div>div>
                      </div>div>
              </main>main>
        </div>div>
      );
}</div>
