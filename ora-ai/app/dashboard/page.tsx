"use client";

import { useState } from "react";

const agents = [
  { name: "Teva", role: "Réseaux Sociaux", emoji: "📱", active: true, tasks: 142, color: "bg-pink-500" },
  { name: "Hina", role: "Service Client", emoji: "💬", active: true, tasks: 87, color: "bg-lagoon" },
"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const agents = [
  { name: "Teva", role: "Réseaux Sociaux", emoji: "📱", active: true, tasks: 142, color: "bg-pink-500" },
  { name: "Hina", role: "Service Client", emoji: "💬", active: true, tasks: 87, color: "bg-lagoon" },
  { name: "Reva", role: "SEO & Contenu", emoji: "✍️", active: false, tasks: 0, color: "bg-purple-500" },
  { name: "Manu", role: "Recrutement", emoji: "👔", active: false, tasks: 0, color: "bg-gold" },
  { name: "Ari", role: "Prospection", emoji: "🎯", active: true, tasks: 34, color: "bg-ocean" },
  ];

const recentActivity = [
  { agent: "Teva", action: "Publication Instagram publiée", time: "il y a 2 min", icon: "📸" },
  { agent: "Hina", action: "Message WhatsApp répondu", time: "il y a 5 min", icon: "💬" },
  { agent: "Ari", action: "3 nouveaux prospects contactés", time: "il y a 12 min", icon: "🎯" },
  { agent: "Teva", action: "Story Facebook créée", time: "il y a 1h", icon: "📱" },
  { agent: "Hina", action: "Rendez-vous confirmé", time: "il y a 2h", icon: "📅" },
  ];

export default function Dashboard() {
    const [activeAgents] = useState(agents.filter((a) => a.active).length);
    const [totalTasks] = useState(agents.reduce((sum, a) => sum + a.tasks, 0));
  
    return (
          <DashboardLayout>
                <div className="p-8">
                  {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                                  <div>
                                              <h1 className="text-2xl font-black text-ocean">Tableau de bord</h1>h1>
                                              <p className="text-ocean/50">Bonjour 👋 — Voici ce qui se passe aujourd&apos;hui</p>p>
                                  </div>div>
                                  <a
                                                href="/dashboard/agents"
                                                className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold hover:bg-ocean transition-colors"
                                              >
                                              + Activer un agent
                                  </a>a>
                        </div>div>
                
                  {/* Stats */}
                        <div className="grid grid-cols-4 gap-6 mb-8">
                          {[
            { label: "Agents actifs", value: activeAgents, icon: "🤖", color: "text-lagoon" },
            { label: "Tâches réalisées", value: totalTasks, icon: "✅", color: "text-green-500" },
            { label: "Messages envoyés", value: "234", icon: "💬", color: "text-purple-500" },
            { label: "Temps économisé", value: "14h", icon: "⏱️", color: "text-gold" },
                      ].map((stat) => (
                                    <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                                  <div className="text-3xl mb-3">{stat.icon}</div>div>
                                                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>div>
                                                  <div className="text-ocean/50 text-sm mt-1">{stat.label}</div>div>
                                    </div>div>
                                  ))}
                        </div>div>
                
                        <div className="grid grid-cols-3 gap-8">
                          {/* Agents list */}
                                  <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                              <div className="flex items-center justify-between mb-6">
                                                            <h2 className="text-ocean font-bold text-lg">Mes agents</h2>h2>
                                                            <a href="/dashboard/agents" className="text-lagoon text-sm font-semibold hover:underline">
                                                                            Voir tous →
                                                            </a>a>
                                              </div>div>
                                              <div className="space-y-4">
                                                {agents.map((agent) => (
                            <div key={agent.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                              <div className={`w-12 h-12 ${agent.color} rounded-xl flex items-center justify-center text-2xl`}>
                                                {agent.emoji}
                                              </div>div>
                                              <div className="flex-1">
                                                                  <div className="font-bold text-ocean">Agent {agent.name}</div>div>
                                                                  <div className="text-ocean/50 text-sm">{agent.role}</div>div>
                                              </div>div>
                                              <div className="text-right">
                                                {agent.active ? (
                                                    <>
                                                                            <div className="text-green-500 font-bold text-sm flex items-center gap-1 justify-end">
                                                                                                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                                                                      Actif
                                                                              </div>div>
                                                                            <div className="text-ocean/40 text-xs">{agent.tasks} tâches aujourd&apos;hui</div>div>
                                                    </>>
                                                  ) : (
                                                    <a
                                                                              href="/dashboard/agents"
                                                                              className="bg-lagoon/10 text-lagoon text-xs font-semibold px-3 py-1 rounded-full hover:bg-lagoon hover:text-white transition-colors"
                                                                            >
                                                                            Activer
                                                    </a>a>
                                                                  )}
                                              </div>div>
                            </div>div>
                          ))}
                                              </div>div>
                                  </div>div>
                        
                          {/* Activity feed */}
                                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                              <div className="flex items-center justify-between mb-6">
                                                            <h2 className="text-ocean font-bold text-lg">Activité récente</h2>h2>
                                                            <a href="/dashboard/stats" className="text-lagoon text-sm font-semibold hover:underline">
                                                                            Stats →
                                                            </a>a>
                                              </div>div>
                                              <div className="space-y-4">
                                                {recentActivity.map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                              <span className="text-xl">{item.icon}</span>span>
                                              <div className="flex-1 min-w-0">
                                                                  <p className="text-ocean/80 text-sm font-medium">{item.action}</p>p>
                                                                  <div className="flex items-center gap-2 mt-1">
                                                                                        <span className="text-lagoon text-xs font-semibold">{item.agent}</span>span>
                                                                                        <span className="text-ocean/30 text-xs">{item.time}</span>span>
                                                                  </div>div>
                                              </div>div>
                            </div>div>
                          ))}
                                              </div>div>
                                  </div>div>
                        </div>div>
                
                  {/* Quick actions */}
                        <div className="mt-8 grid grid-cols-3 gap-6">
                          {[
            { icon: "📊", label: "Voir les statistiques", href: "/dashboard/stats", color: "bg-lagoon/10 text-lagoon" },
            { icon: "🔗", label: "Gérer les intégrations", href: "/dashboard/integrations", color: "bg-ocean/10 text-ocean" },
            { icon: "⚙️", label: "Paramètres du compte", href: "/dashboard/settings", color: "bg-purple-50 text-purple-600" },
                      ].map((action) => (
                                    <a
                                                    key={action.label}
                                                    href={action.href}
                                                    className={`${action.color} rounded-2xl p-5 flex items-center gap-4 font-semibold hover:shadow-md transition-all`}
                                                  >
                                                  <span className="text-2xl">{action.icon}</span>span>
                                      {action.label}
                                    </a>a>
                                  ))}
                        </div>div>
                </div>div>
          </DashboardLayout>DashboardLayout>
        );
}</></DashboardLayout>{ name: "Reva", role: "SEO & Contenu", emoji: "✍️", active: false, tasks: 0, color: "bg-purple-500" },
  { name: "Manu", role: "Recrutement", emoji: "👔", active: false, tasks: 0, color: "bg-gold" },
  { name: "Ari", role: "Prospection", emoji: "🎯", active: true, tasks: 34, color: "bg-ocean" },
  ];

const recentActivity = [
  { agent: "Teva", action: "Publication Instagram publiée", time: "il y a 2 min", icon: "📸" },
  { agent: "Hina", action: "Message WhatsApp répondu", time: "il y a 5 min", icon: "💬" },
  { agent: "Ari", action: "3 nouveaux prospects contactés", time: "il y a 12 min", icon: "🎯" },
  { agent: "Teva", action: "Story Facebook créée", time: "il y a 1h", icon: "📱" },
  { agent: "Hina", action: "Rendez-vous confirmé", time: "il y a 2h", icon: "📅" },
  ];

export default function Dashboard() {
    const [activeAgents] = useState(agents.filter((a) => a.active).length);
    const [totalTasks] = useState(agents.reduce((sum, a) => sum + a.tasks, 0));

  return (
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar */}
              <aside className="fixed left-0 top-0 bottom-0 w-64 gradient-bg text-white flex flex-col z-40">
                      <div className="p-6 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-lagoon flex items-center justify-center">
                                                          <span className="font-bold text-white text-sm">O</span>span>
                                            </div>div>
                                            <span className="text-xl font-bold">Ora <span className="text-lagoon">AI</span>span></span>span>
                                </div>div>
                      </div>div>
                      <nav className="flex-1 p-4 space-y-1">
                        {[
          { icon: "🏠", label: "Tableau de bord", active: true },
          { icon: "🤖", label: "Mes agents", active: false },
          { icon: "📊", label: "Statistiques", active: false },
          { icon: "🔗", label: "Intégrations", active: false },
          { icon: "⚙️", label: "Paramètres", active: false },
                    ].map((item) => (
                                  <button
                                                  key={item.label}
                                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                                    item.active
                                                                      ? "bg-lagoon/20 text-lagoon"
                                                                      : "text-white/60 hover:bg-white/10 hover:text-white"
                                                  }`}
                                                >
                                                <span>{item.icon}</span>span>
                                    {item.label}
                                  </button>button>
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
                {/* Header */}
                      <div className="flex items-center justify-between mb-8">
                                <div>
                                            <h1 className="text-2xl font-black text-ocean">Tableau de bord</h1>h1>
                                            <p className="text-ocean/50">Bonjour 👋 — Voici ce qui se passe aujourd&apos;hui</p>p>
                                </div>div>
                                <button className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold hover:bg-ocean transition-colors">
                                            + Activer un agent
                                </button>button>
                      </div>div>
              
                {/* Stats */}
                      <div className="grid grid-cols-4 gap-6 mb-8">
                        {[
          { label: "Agents actifs", value: activeAgents, icon: "🤖", color: "text-lagoon" },
          { label: "Tâches réalisées", value: totalTasks, icon: "✅", color: "text-green-500" },
          { label: "Messages envoyés", value: "234", icon: "💬", color: "text-purple-500" },
          { label: "Temps économisé", value: "14h", icon: "⏱️", color: "text-gold" },
                    ].map((stat) => (
                                  <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                                <div className="text-3xl mb-3">{stat.icon}</div>div>
                                                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>div>
                                                <div className="text-ocean/50 text-sm mt-1">{stat.label}</div>div>
                                  </div>div>
                                ))}
                      </div>div>
              
                      <div className="grid grid-cols-3 gap-8">
                        {/* Agents list */}
                                <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <h2 className="text-ocean font-bold text-lg mb-6">Mes agents</h2>h2>
                                            <div className="space-y-4">
                                              {agents.map((agent) => (
                          <div key={agent.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div className={`w-12 h-12 ${agent.color} rounded-xl flex items-center justify-center text-2xl`}>
                                              {agent.emoji}
                                            </div>div>
                                            <div className="flex-1">
                                                                <div className="font-bold text-ocean">Agent {agent.name}</div>div>
                                                                <div className="text-ocean/50 text-sm">{agent.role}</div>div>
                                            </div>div>
                                            <div className="text-right">
                                              {agent.active ? (
                                                  <>
                                                                          <div className="text-green-500 font-bold text-sm flex items-center gap-1 justify-end">
                                                                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                                                                    Actif
                                                                          </div>div>
                                                                          <div className="text-ocean/40 text-xs">{agent.tasks} tâches aujourd&apos;hui</div>div>
                                                  </>>
                                                ) : (
                                                  <button className="bg-lagoon/10 text-lagoon text-xs font-semibold px-3 py-1 rounded-full hover:bg-lagoon hover:text-white transition-colors">
                                                                          Activer
                                                  </button>button>
                                                                )}
                                            </div>div>
                          </div>div>
                        ))}
                                            </div>div>
                                </div>div>
                      
                        {/* Activity feed */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <h2 className="text-ocean font-bold text-lg mb-6">Activité récente</h2>h2>
                                            <div className="space-y-4">
                                              {recentActivity.map((item, i) => (
                          <div key={i} className="flex items-start gap-3">
                                            <span className="text-xl">{item.icon}</span>span>
                                            <div className="flex-1 min-w-0">
                                                                <p className="text-ocean/80 text-sm font-medium">{item.action}</p>p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                                      <span className="text-lagoon text-xs font-semibold">{item.agent}</span>span>
                                                                                      <span className="text-ocean/30 text-xs">{item.time}</span>span>
                                                                </div>div>
                                            </div>div>
                          </div>div>
                        ))}
                                            </div>div>
                                </div>div>
                      </div>div>
              </main>main>
        </div>div>
      );
}</></div>
