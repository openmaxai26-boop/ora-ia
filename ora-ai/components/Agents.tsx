"use client";

const agents = [
  {
        name: "Teva",
        emoji: "📱",
        role: "Agent Réseaux Sociaux",
        color: "from-pink-500 to-coral",
        description:
                "Crée et publie automatiquement du contenu sur Facebook, Instagram et TikTok. Photos, légendes, hashtags — tout est adapté au marché polynésien.",
        features: [
                "Publication automatique",
                "Visuels générés par IA",
                "Contenu en français & tahitien",
                "Statistiques en temps réel",
              ],
  },
  {
        name: "Hina",
        emoji: "💬",
        role: "Agent Service Client",
        color: "from-lagoon to-teal-400",
        description:
                "Répond à vos clients sur WhatsApp, Messenger et votre site web, 24h/24. Gère les demandes, réservations et réclamations sans intervention humaine.",
        features: [
                "Disponible 24h/24 7j/7",
                "WhatsApp & Messenger",
                "Prise de rendez-vous",
                "Escalade vers humain si besoin",
              ],
  },
  {
        name: "Reva",
        emoji: "✍️",
        role: "Agent SEO & Contenu",
        color: "from-purple-500 to-indigo-500",
        description:
                "Rédige et publie des articles de blog optimisés pour Google. Jusqu'à 30 articles par mois pour améliorer votre visibilité en ligne.",
        features: [
                "30 articles/mois",
                "Optimisation SEO Google",
                "Adapté au marché local",
                "Pub sur votre site automatiquement",
              ],
  },
  {
        name: "Manu",
        emoji: "👔",
        role: "Agent Recrutement",
        color: "from-gold to-orange-400",
        description:
                "Publie vos offres d'emploi, collecte et trie automatiquement les candidatures selon vos critères. Vous ne voyez que les meilleurs profils.",
        features: [
                "Publication des offres",
                "Tri automatique des CV",
                "Score des candidats",
                "Rapport de présélection",
              ],
  },
  {
        name: "Ari",
        emoji: "🎯",
        role: "Agent Prospection",
        color: "from-ocean to-blue-400",
        description:
                "Identifie des prospects sur les réseaux sociaux et envoie des messages personnalisés pour développer votre clientèle automatiquement.",
        features: [
                "Ciblage intelligent",
                "Messages personnalisés",
                "Suivi des relances",
                "Rapport hebdomadaire",
              ],
  },
  ];

export default function Agents() {
    return (
          <section id="agents" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                  {/* Header */}
                        <div className="text-center mb-16">
                                  <div className="inline-block bg-lagoon/10 text-lagoon font-semibold px-4 py-2 rounded-full text-sm mb-4">
                                              Vos 5 agents IA
                                  </div>
                                  <h2 className="text-4xl md:text-5xl font-black text-ocean mb-4">
                                              Une équipe IA complète, <br />
                                              <span className="text-lagoon">prête à travailler pour vous</span>
                                  </h2>
                                  <p className="text-ocean/60 text-xl max-w-2xl mx-auto">
                                              Chaque agent est spécialisé dans un domaine. Activez ceux dont vous avez besoin,
                                              désactivez les autres à tout moment.
                                  </p>
                        </div>
                
                  {/* Agents grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {agents.map((agent) => (
                        <div
                                        key={agent.name}
                                        className="card-hover bg-white border border-gray-100 rounded-2xl p-8 shadow-sm"
                                      >
                          {/* Agent avatar */}
                                      <div
                                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-3xl mb-6`}
                                                      >
                                        {agent.emoji}
                                      </div>
                        
                          {/* Agent info */}
                                      <div className="mb-2 text-xs font-semibold text-ocean/40 uppercase tracking-wider">
                                        {agent.role}
                                      </div>
                                      <h3 className="text-2xl font-black text-ocean mb-3">Agent {agent.name}</h3>
                                      <p className="text-ocean/60 mb-6 leading-relaxed">{agent.description}</p>
                        
                          {/* Features */}
                                      <ul className="space-y-2">
                                        {agent.features.map((f) => (
                                                          <li key={f} className="flex items-center gap-2 text-sm text-ocean/70">
                                                                              <span className="w-4 h-4 bg-lagoon/20 text-lagoon rounded-full flex items-center justify-center text-xs font-bold">
                                                                                                    ✓
                                                                              </span>
                                                            {f}
                                                          </li>
                                                        ))}
                                      </ul>
                        </div>
                      ))}
                        
                          {/* Coming soon card */}
                                  <div className="card-hover bg-ocean/5 border-2 border-dashed border-ocean/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                              <div className="text-4xl mb-4">🚀</div>
                                              <h3 className="text-xl font-bold text-ocean/50 mb-2">Bientôt disponible</h3>
                                              <p className="text-ocean/40 text-sm">Agent Comptabilité, Agent Tourisme & Réservations...</p>
                                  </div>
                        </div>
                </div>
          </section>
        );
}
