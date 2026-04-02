"use client";

const steps = [
  {
        number: "01",
        emoji: "🔧",
        title: "Choisissez vos agents",
        description:
                "Sélectionnez les agents IA dont vous avez besoin parmi les 5 disponibles. Pas besoin de tout prendre d'un coup.",
  },
  {
        number: "02",
        emoji: "⚙️",
        title: "Configurez en 5 minutes",
        description:
                "Répondez à quelques questions sur votre entreprise. Vos agents apprennent votre secteur, vos produits et votre ton.",
  },
  {
        number: "03",
        emoji: "🔗",
        title: "Connectez vos outils",
        description:
                "WhatsApp, Facebook, Instagram, Gmail... Connectez vos comptes en un clic. Aucune ligne de code.",
  },
  {
        number: "04",
        emoji: "🤖",
        title: "Laissez l'IA travailler",
        description:
                "Vos agents démarrent immédiatement. Suivez tout en temps réel depuis votre tableau de bord, 24h/24.",
  },
  ];

export default function HowItWorks() {
    return (
          <section id="comment" className="py-24 bg-sand">
                <div className="max-w-7xl mx-auto px-6">
                  {/* Header */}
                        <div className="text-center mb-16">
                                  <div className="inline-block bg-lagoon/10 text-lagoon font-semibold px-4 py-2 rounded-full text-sm mb-4">
                                              Simple comme bonjour
                                  </div>
                                  <h2 className="text-4xl md:text-5xl font-black text-ocean mb-4">
                                              Opérationnel en{" "}
                                              <span className="text-lagoon"> moins de 10 minutes</span>
                                  </h2>
                                  <p className="text-ocean/60 text-xl max-w-2xl mx-auto">
                                              Aucune compétence technique requise. Si vous savez envoyer un WhatsApp, vous savez
                                              utiliser Ora AI.
                                  </p>
                        </div>
                
                  {/* Steps */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                          {steps.map((step, i) => (
                        <div key={step.number} className="relative">
                          {/* Connector line */}
                          {i < steps.length - 1 && (
                                          <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-lagoon/40 to-transparent z-0" />
                                        )}
                                      <div className="relative z-10 bg-white rounded-2xl p-8 shadow-sm card-hover text-center">
                                                      <div className="text-5xl mb-4">{step.emoji}</div>
                                                      <div className="text-lagoon font-black text-lg mb-2">{step.number}</div>
                                                      <h3 className="text-ocean font-bold text-xl mb-3">{step.title}</h3>
                                                      <p className="text-ocean/60 leading-relaxed">{step.description}</p>
                                      </div>
                        </div>
                      ))}
                        </div>
                
                  {/* Integrations */}
                        <div className="mt-20 text-center">
                                  <p className="text-ocean/50 font-medium mb-8 text-sm uppercase tracking-wider">
                                              Compatible avec vos outils du quotidien
                                  </p>
                                  <div className="flex flex-wrap justify-center gap-4">
                                    {[
                          "WhatsApp",
                          "Facebook",
                          "Instagram",
                          "TikTok",
                          "Gmail",
                          "Google Calendar",
                          "Stripe",
                          "Notion",
                        ].map((tool) => (
                                        <span
                                                          key={tool}
                                                          className="bg-white border border-gray-200 text-ocean/70 px-5 py-2 rounded-full text-sm font-medium shadow-sm"
                                                        >
                                          {tool}
                                        </span>
                                      ))}
                                  </div>
                        </div>
                </div>
          </section>
        );
}
