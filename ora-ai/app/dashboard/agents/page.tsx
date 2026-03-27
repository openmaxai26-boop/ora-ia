"use client";

import { useState } from "react";

const allAgents = [
  {
        name: "Teva",
        emoji: "📱",
        role: "Réseaux Sociaux",
        color: "from-pink-500 to-coral",
        bgColor: "bg-pink-500",
        description:
                "Crée et publie automatiquement du contenu sur Facebook, Instagram et TikTok.",
        features: [
                "Publication automatique",
                "Visuels générés par IA",
                "Contenu en français & tahitien",
                "Statistiques en temps réel",
              ],
        plan: "Pro",
        active: true,
        tasks: 142,
        platforms: ["Facebook", "Instagram", "TikTok"],
  },
  {
        name: "Hina",
        emoji: "💬",
        role: "Service Client",
        color: "from-lagoon to-teal-400",
        bgColor: "bg-lagoon",
        description:
                "Répond à vos clients sur WhatsApp, Messenger et votre site web, 24h/24.",
        features: [
                "Disponible 24h/24 7j/7",
                "WhatsApp & Messenger",
                "Prise de rendez-vous",
                "Escalade vers humain si besoin",
              ],
        plan: "Pro",
        active: true,
        tasks: 87,
        platforms: ["WhatsApp", "Messenger", "Site web"],
  },
  {
        name: "Reva",
        emoji: "✍️",
        role: "SEO & Contenu",
        color: "from-purple-500 to-indigo-500",
        bgColor: "bg-purple-500",
        description:
                "Rédige et publie des articles de blog optimisés pour Google.",
        features: [
                "30 articles/mois",
                "Optimisation SEO Google",
                "Adapté au marché local",
                "Publication automatique",
              ],
        plan: "Business",
        active: false,
        tasks: 0,
        platforms: ["WordPress", "Wix", "Ghost"],
  },
  {
        name: "Manu",
        emoji: "👔",
        role: "Recrutement",
        color: "from-gold to-orange-400",
        bgColor: "bg-gold",
        description:
                "Publie vos offres d'emploi et trie automatiquement les candidatures.",
        features: [
                "Publication des offres",
                "Tri automatique des CV",
                "Score des candidats",
                "Rapport de présélection",
              ],
        plan: "Business",
        active: false,
        tasks: 0,
        platforms: ["LinkedIn", "Indeed", "Meteojob"],
  },
  {
        name: "Ari",
        emoji: "🎯",
        role: "Prospection",
        color: "from-ocean to-blue-400",
        bgColor: "bg-ocean",
        description:
                "Identifie des prospects et envoie des messages personnalisés automatiquement.",
        features: [
                "Ciblage intelligent",
                "Messages personnalisés",
                "Suivi des relances",
                "Rapport hebdomadaire",
              ],
        plan: "Pro",
        active: true,
        tasks: 34,
        platforms: ["LinkedIn", "Instagram", "Email"],
  },
  ];

export default function AgentsPage() {
    const [agents, setAgents] = useState(allAgents);
    const [selected, setSelected] = useState<string | null>(null);

  const toggleAgent = (name: string) => {
        setAgents((prev) =>
                prev.map((a) => (a.name === name ? { ...a, active: !a.active } : a))
                      );
  };

  const selectedAgent = agents.find((a) => a.name === selected);

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
          { icon: "🤖", label: "Mes agents", href: "/dashboard/agents", active: true },
          { icon: "📊", label: "Statistiques", href: "/dashboard/stats", active: false },
          { icon: "🔗", label: "Intégrations", href: "/dashboard/integrations", active: false },
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
                                            <h1 className="text-2xl font-black text-ocean">Mes agents IA</h1>h1>
                                            <p className="text-ocean/50">
                                              {agents.filter((a) => a.active).length} agent(s) actif(s) sur {agents.length}
                                            </p>p>
                                </div>div>
                                <div className="flex items-center gap-3">
                                            <span className="text-xs text-ocean/40 bg-white border border-gray-100 px-3 py-1 rounded-full">
                                                          Plan Pro — 3 agents inclus
                                            </span>span>
                                            <a
                                                            href="#"
                                                            className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold hover:bg-ocean transition-colors text-sm"
                                                          >
                                                          Passer au Business
                                            </a>a>
                                </div>div>
                      </div>div>
              
                {/* Agents grid */}
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {agents.map((agent) => (
                      <div
                                      key={agent.name}
                                      className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all cursor-pointer ${
                                                        selected === agent.name
                                                          ? "border-lagoon shadow-lg"
                                                          : "border-gray-100 hover:border-lagoon/30"
                                      }`}
                                      onClick={() => setSelected(selected === agent.name ? null : agent.name)}
                                    >
                                    <div className="flex items-start justify-between mb-4">
                                                    <div
                                                                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl`}
                                                                      >
                                                      {agent.emoji}
                                                    </div>div>
                                                    <div className="flex items-center gap-2">
                                                      {agent.active ? (
                                                          <span className="flex items-center gap-1 text-green-500 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">
                                                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                                                Actif
                                                          </span>span>
                                                        ) : (
                                                          <span className="text-ocean/30 text-xs font-semibold bg-gray-50 px-2 py-1 rounded-full">
                                                                                Inactif
                                                          </span>span>
                                                                      )}
                                                    </div>div>
                                    </div>div>
                      
                                    <div className="text-xs font-semibold text-ocean/40 uppercase tracking-wider mb-1">
                                      {agent.role}
                                    </div>div>
                                    <h3 className="text-lg font-black text-ocean mb-2">
                                                    Agent {agent.name}
                                    </h3>h3>
                                    <p className="text-ocean/60 text-sm mb-4 leading-relaxed">
                                      {agent.description}
                                    </p>p>
                      
                        {agent.active && (
                                                      <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                                                        <div className="text-2xl font-black text-lagoon">
                                                                          {agent.tasks}
                                                                        </div>div>
                                                                        <div className="text-xs text-ocean/40">tâches aujourd&apos;hui</div>div>
                                                      </div>div>
                                    )}
                      
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {agent.platforms.map((p) => (
                                                        <span
                                                                              key={p}
                                                                              className="bg-gray-100 text-ocean/60 text-xs px-2 py-1 rounded-full"
                                                                            >
                                                          {p}
                                                        </span>span>
                                                      ))}
                                    </div>div>
                      
                                    <button
                                                      onClick={(e) => {
                                                                          e.stopPropagation();
                                                                          if (agent.plan === "Business") return;
                                                                          toggleAgent(agent.name);
                                                      }}
                                                      className={`w-full py-2 rounded-xl font-semibold text-sm transition-all ${
                                                                          agent.plan === "Business"
                                                                            ? "bg-gray-100 text-ocean/40 cursor-not-allowed"
                                                                            : agent.active
                                                                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                                                                            : "bg-lagoon/10 text-lagoon hover:bg-lagoon hover:text-white"
                                                      }`}
                                                    >
                                      {agent.plan === "Business"
                                                          ? "🔒 Plan Business requis"
                                                          : agent.active
                                                          ? "Désactiver"
                                                          : "Activer"}
                                    </button>button>
                      </div>div>
                    ))}
                      </div>div>
              </main>main>
        </div>div>
      );
}</div>
