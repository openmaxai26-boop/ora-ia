"use client";

import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login - redirect to dashboard
        setTimeout(() => {
                window.location.href = "/dashboard";
        }, 1000);
  };

  return (
        <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
          {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-lagoon/10 rounded-full blur-3xl" />
                      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-lagoon/5 rounded-full blur-3xl" />
              </div>div>
        
              <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                      <div className="text-center mb-8">
                                <a href="/" className="inline-flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-lagoon flex items-center justify-center">
                                                          <span className="text-white font-bold text-lg">O</span>span>
                                            </div>div>
                                            <span className="text-2xl font-bold text-white">
                                                          Ora <span className="text-lagoon">AI</span>span>
                                            </span>span>
                                </a>a>
                                <h1 className="text-white/80 mt-4 text-lg">
                                            Bienvenue sur votre espace
                                </h1>h1>
                      </div>div>
              
                {/* Card */}
                      <div className="bg-white rounded-2xl p-8 shadow-2xl">
                                <h2 className="text-2xl font-black text-ocean mb-2">Connexion</h2>h2>
                                <p className="text-ocean/50 text-sm mb-8">
                                            Accédez à votre tableau de bord Ora AI
                                </p>p>
                      
                                <form onSubmit={handleSubmit} className="space-y-5">
                                            <div>
                                                          <label className="block text-ocean font-semibold text-sm mb-2">
                                                                          Email
                                                          </label>label>
                                                          <input
                                                                            type="email"
                                                                            value={email}
                                                                            onChange={(e) => setEmail(e.target.value)}
                                                                            placeholder="vous@exemple.pf"
                                                                            required
                                                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean placeholder:text-ocean/30 focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition-all"
                                                                          />
                                            </div>div>
                                
                                            <div>
                                                          <label className="block text-ocean font-semibold text-sm mb-2">
                                                                          Mot de passe
                                                          </label>label>
                                                          <input
                                                                            type="password"
                                                                            value={password}
                                                                            onChange={(e) => setPassword(e.target.value)}
                                                                            placeholder="••••••••"
                                                                            required
                                                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean placeholder:text-ocean/30 focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition-all"
                                                                          />
                                                          <a
                                                                            href="#"
                                                                            className="text-lagoon text-xs font-medium mt-2 block text-right hover:underline"
                                                                          >
                                                                          Mot de passe oublié ?
                                                          </a>a>
                                            </div>div>
                                
                                            <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="w-full bg-lagoon text-white py-3 rounded-xl font-bold text-lg hover:bg-ocean transition-colors disabled:opacity-60 lagoon-glow"
                                                          >
                                              {loading ? "Connexion en cours..." : "Se connecter"}
                                            </button>button>
                                </form>form>
                      
                                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                            <p className="text-ocean/50 text-sm">
                                                          Pas encore de compte ?{" "}
                                                          <a href="#tarifs" className="text-lagoon font-semibold hover:underline">
                                                                          Démarrer gratuitement
                                                          </a>a>
                                            </p>p>
                                </div>div>
                      
                        {/* Demo access */}
                                <div className="mt-4 bg-lagoon/10 rounded-xl p-4 text-center">
                                            <p className="text-lagoon text-xs font-semibold mb-2">
                                                          🎯 Accès démo disponible
                                            </p>p>
                                            <button
                                                            onClick={() => { window.location.href = "/dashboard"; }}
                                                            className="text-ocean text-xs font-medium hover:text-lagoon transition-colors"
                                                          >
                                                          Voir le tableau de bord sans compte →
                                            </button>button>
                                </div>div>
                      </div>div>
              
                {/* Footer note */}
                      <p className="text-white/30 text-xs text-center mt-6">
                                © 2025 Ora AI — Papeete, Polynésie française
                      </p>p>
              </div>div>
        </div>div>
      );
}</div>
