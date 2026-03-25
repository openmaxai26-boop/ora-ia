"use client";

export default function Footer() {
    return (
          <footer className="gradient-bg text-white">
            {/* CTA Banner */}
                <div className="border-b border-white/10">
                        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
                                  <h2 className="text-4xl md:text-5xl font-black mb-4">
                                              Prêt à automatiser votre <br />
                                              <span className="text-lagoon">entreprise au fenua ?</span>span>
                                  </h2>h2>
                                  <p className="text-white/60 text-xl mb-8">
                                              Rejoignez les premières entreprises polynésiennes à utiliser l&apos;IA pour grandir.
                                  </p>p>
                                  <a
                                                href="#tarifs"
                                                className="inline-block bg-lagoon text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-ocean transition-all lagoon-glow"
                                              >
                                              Démarrer gratuitement — sans CB
                                  </a>a>
                        </div>div>
                </div>div>
          
            {/* Footer links */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="grid md:grid-cols-4 gap-8 mb-12">
                          {/* Brand */}
                                  <div className="md:col-span-1">
                                              <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lagoon to-white/20 flex items-center justify-center">
                                                                            <span className="text-white font-bold text-sm">O</span>span>
                                                            </div>div>
                                                            <span className="text-xl font-bold">
                                                                            Ora <span className="text-lagoon">AI</span>span>
                                                            </span>span>
                                              </div>div>
                                              <p className="text-white/50 text-sm leading-relaxed">
                                                            La première plateforme d&apos;agents IA conçue pour les entreprises de Polynésie
                                                            française.
                                              </p>p>
                                  </div>div>
                        
                          {/* Produit */}
                                  <div>
                                              <h4 className="font-bold text-white mb-4">Produit</h4>h4>
                                              <ul className="space-y-2 text-white/50 text-sm">
                                                            <li>
                                                                            <a href="#agents" className="hover:text-lagoon transition-colors">
                                                                                              Les agents
                                                                            </a>a>
                                                            </li>li>
                                                            <li>
                                                                            <a href="#comment" className="hover:text-lagoon transition-colors">
                                                                                              Comment ça marche
                                                                            </a>a>
                                                            </li>li>
                                                            <li>
                                                                            <a href="#tarifs" className="hover:text-lagoon transition-colors">
                                                                                              Tarifs
                                                                            </a>a>
                                                            </li>li>
                                              </ul>ul>
                                  </div>div>
                        
                          {/* Agents */}
                                  <div>
                                              <h4 className="font-bold text-white mb-4">Agents</h4>h4>
                                              <ul className="space-y-2 text-white/50 text-sm">
                                                            <li>
                                                                            <a href="#agents" className="hover:text-lagoon transition-colors">
                                                                                              Teva — Réseaux sociaux
                                                                            </a>a>
                                                            </li>li>
                                                            <li>
                                                                            <a href="#agents" className="hover:text-lagoon transition-colors">
                                                                                              Hina — Service client
                                                                            </a>a>
                                                            </li>li>
                                                            <li>
                                                                            <a href="#agents" className="hover:text-lagoon transition-colors">
                                                                                              Reva — SEO & Contenu
                                                                            </a>a>
                                                            </li>li>
                                                            <li>
                                                                            <a href="#agents" className="hover:text-lagoon transition-colors">
                                                                                              Manu — Recrutement
                                                                            </a>a>
                                                            </li>li>
                                                            <li>
                                                                            <a href="#agents" className="hover:text-lagoon transition-colors">
                                                                                              Ari — Prospection
                                                                            </a>a>
                                                            </li>li>
                                              </ul>ul>
                                  </div>div>
                        
                          {/* Contact */}
                                  <div>
                                              <h4 className="font-bold text-white mb-4">Contact</h4>h4>
                                              <ul className="space-y-2 text-white/50 text-sm">
                                                            <li>📍 Papeete, Tahiti</li>li>
                                                            <li>📱 WhatsApp disponible</li>li>
                                                            <li>✉️ contact@ora-ai.pf</li>li>
                                              </ul>ul>
                                  </div>div>
                        </div>div>
                
                        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-sm">
                                  <p>© 2025 Ora AI — Tous droits réservés</p>p>
                                  <div className="flex gap-6">
                                              <a href="#" className="hover:text-lagoon transition-colors">
                                                            Mentions légales
                                              </a>a>
                                              <a href="#" className="hover:text-lagoon transition-colors">
                                                            Confidentialité
                                              </a>a>
                                              <a href="#" className="hover:text-lagoon transition-colors">
                                                            CGU
                                              </a>a>
                                  </div>div>
                        </div>div>
                </div>div>
          </footer>footer>
        );
}</footer>
