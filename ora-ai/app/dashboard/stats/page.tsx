"use client";

const weeklyData = [
  { day: "Lun", taches: 45, messages: 28, posts: 8 },
  { day: "Mar", taches: 62, messages: 35, posts: 12 },
  { day: "Mer", taches: 38, messages: 19, posts: 6 },
  { day: "Jeu", taches: 78, messages: 52, posts: 14 },
  { day: "Ven", taches: 91, messages: 67, posts: 18 },
  { day: "Sam", taches: 55, messages: 41, posts: 10 },
  { day: "Dim", taches: 34, messages: 22, posts: 5 },
  ];

const agentStats = [
  { name: "Teva", emoji: "📱", color: "bg-pink-500", taches: 142, progression: 78 },
  { name: "Hina", emoji: "💬", color: "bg-lagoon", taches: 87, progression: 62 },
  { name: "Ari", emoji: "🎯", color: "bg-ocean", taches: 34, progression: 34 },
  ];

const maxTaches = Math.max(...weeklyData.map((d) => d.taches));

export default function StatsPage() {
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
            { icon: "📊", label: "Statistiques", href: "/dashboard/stats", active: true },
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
                                              <h1 className="text-2xl font-black text-ocean">Statistiques</h1>h1>
                                              <p className="text-ocean/50">Performance de vos agents cette semaine</p>p>
                                  </div>div>
                                  <div className="flex gap-2">
                                    {["7j", "30j", "3m"].map((period, i) => (
                          <button
                                            key={period}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                                i === 0
                                                                  ? "bg-lagoon text-white"
                                                                  : "bg-white text-ocean/60 border border-gray-200 hover:border-lagoon/30"
                                            }`}
                                          >
                            {period}
                          </button>button>
                        ))}
                                  </div>div>
                        </div>div>
                
                  {/* Summary cards */}
                        <div className="grid grid-cols-4 gap-6 mb-8">
                          {[
            { label: "Tâches totales", value: "403", change: "+23%", icon: "✅", color: "text-green-500" },
            { label: "Messages envoyés", value: "264", change: "+18%", icon: "💬", color: "text-lagoon" },
            { label: "Posts publiés", value: "73", change: "+31%", icon: "📱", color: "text-pink-500" },
            { label: "Temps économisé", value: "98h", change: "+15%", icon: "⏱️", color: "text-gold" },
                      ].map((stat) => (
                                    <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                                  <div className="text-3xl mb-3">{stat.icon}</div>div>
                                                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>div>
                                                  <div className="text-ocean/50 text-sm mt-1">{stat.label}</div>div>
                                                  <div className="text-green-500 text-xs font-semibold mt-2">{stat.change} vs semaine dernière</div>div>
                                    </div>div>
                                  ))}
                        </div>div>
                
                        <div className="grid grid-cols-3 gap-8">
                          {/* Bar chart */}
                                  <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                              <h2 className="text-ocean font-bold text-lg mb-6">Tâches par jour</h2>h2>
                                              <div className="flex items-end gap-3 h-48">
                                                {weeklyData.map((d) => (
                            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                                              <span className="text-xs text-ocean/40 font-medium">{d.taches}</span>span>
                                              <div
                                                                    className="w-full bg-lagoon/20 rounded-t-lg relative overflow-hidden transition-all"
                                                                    style={{ height: `${(d.taches / maxTaches) * 160}px` }}
                                                                  >
                                                                  <div
                                                                                          className="absolute bottom-0 left-0 right-0 bg-lagoon rounded-t-lg"
                                                                                          style={{ height: "100%" }}
                                                                                        />
                                              </div>div>
                                              <span className="text-xs text-ocean/40">{d.day}</span>span>
                            </div>div>
                          ))}
                                              </div>div>
                                  </div>div>
                        
                          {/* Agent performance */}
                                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                              <h2 className="text-ocean font-bold text-lg mb-6">Performance agents</h2>h2>
                                              <div className="space-y-6">
                                                {agentStats.map((agent) => (
                            <div key={agent.name}>
                                              <div className="flex items-center justify-between mb-2">
                                                                  <div className="flex items-center gap-2">
                                                                                        <span className="text-lg">{agent.emoji}</span>span>
                                                                                        <span className="font-semibold text-ocean text-sm">Agent {agent.name}</span>span>
                                                                  </div>div>
                                                                  <span className="text-ocean/40 text-xs">{agent.taches} tâches</span>span>
                                              </div>div>
                                              <div className="w-full bg-gray-100 rounded-full h-2">
                                                                  <div
                                                                                          className={`${agent.color} h-2 rounded-full transition-all`}
                                                                                          style={{ width: `${agent.progression}%` }}
                                                                                        />
                                              </div>div>
                                              <div className="text-xs text-ocean/30 mt-1">{agent.progression}% de l&apos;objectif</div>div>
                            </div>div>
                          ))}
                                              </div>div>
                                  
                                              <div className="mt-8 pt-6 border-t border-gray-100">
                                                            <h3 className="text-ocean font-semibold text-sm mb-4">Répartition des tâches</h3>h3>
                                                            <div className="space-y-2">
                                                              {[
            { label: "Réseaux sociaux", pct: 54, color: "bg-pink-400" },
            { label: "Service client", pct: 33, color: "bg-lagoon" },
            { label: "Prospection", pct: 13, color: "bg-ocean" },
                            ].map((item) => (
                                                <div key={item.label} className="flex items-center gap-3">
                                                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                                                    <span className="text-xs text-ocean/60 flex-1">{item.label}</span>span>
                                                                    <span className="text-xs font-bold text-ocean">{item.pct}%</span>span>
                                                </div>div>
                                              ))}
                                                            </div>div>
                                              </div>div>
                                  </div>div>
                        </div>div>
                
                  {/* Recent activity table */}
                        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                  <h2 className="text-ocean font-bold text-lg mb-6">Détail des activités</h2>h2>
                                  <div className="overflow-x-auto">
                                              <table className="w-full">
                                                            <thead>
                                                                            <tr className="text-left border-b border-gray-100">
                                                                                              <th className="pb-3 text-xs font-semibold text-ocean/40 uppercase tracking-wider">Agent</th>th>
                                                                                              <th className="pb-3 text-xs font-semibold text-ocean/40 uppercase tracking-wider">Action</th>th>
                                                                                              <th className="pb-3 text-xs font-semibold text-ocean/40 uppercase tracking-wider">Plateforme</th>th>
                                                                                              <th className="pb-3 text-xs font-semibold text-ocean/40 uppercase tracking-wider">Date</th>th>
                                                                                              <th className="pb-3 text-xs font-semibold text-ocean/40 uppercase tracking-wider">Statut</th>th>
                                                                            </tr>tr>
                                                            </thead>thead>
                                                            <tbody className="divide-y divide-gray-50">
                                                              {[
            { agent: "Teva", emoji: "📱", action: "Publication Instagram", platform: "Instagram", date: "Auj. 14h32", status: "Succès" },
            { agent: "Hina", emoji: "💬", action: "Réponse client", platform: "WhatsApp", date: "Auj. 13h15", status: "Succès" },
            { agent: "Ari", emoji: "🎯", action: "Message prospection", platform: "LinkedIn", date: "Auj. 11h00", status: "Succès" },
            { agent: "Teva", emoji: "📱", action: "Story Facebook", platform: "Facebook", date: "Auj. 09h45", status: "Succès" },
            { agent: "Hina", emoji: "💬", action: "Prise de rendez-vous", platform: "Messenger", date: "Hier 16h20", status: "Succès" },
                            ].map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50">
                                                                    <td className="py-3">
                                                                                          <div className="flex items-center gap-2">
                                                                                                                  <span>{row.emoji}</span>span>
                                                                                                                  <span className="text-sm font-semibold text-ocean">{row.agent}</span>span>
                                                                                            </div>div>
                                                                    </td>td>
                                                                    <td className="py-3 text-sm text-ocean/70">{row.action}</td>td>
                                                                    <td className="py-3">
                                                                                          <span className="bg-gray-100 text-ocean/60 text-xs px-2 py-1 rounded-full">{row.platform}</span>span>
                                                                    </td>td>
                                                                    <td className="py-3 text-xs text-ocean/40">{row.date}</td>td>
                                                                    <td className="py-3">
                                                                                          <span className="text-green-500 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">{row.status}</span>span>
                                                                    </td>td>
                                                </tr>tr>
                                              ))}
                                                            </tbody>tbody>
                                              </table>table>
                                  </div>div>
                        </div>div>
                </main>main>
          </div>div>
        );
}</div>
