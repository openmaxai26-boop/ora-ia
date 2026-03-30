"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithPassword } from "@/lib/auth/supabase-auth";

export default function SignupPage() {
    const router = useRouter();

  const [entreprise, setEntreprise]   = useState("");
    const [email,      setEmail]        = useState("");
    const [password,   setPassword]     = useState("");
    const [confirm,    setConfirm]      = useState("");
    const [loading,    setLoading]      = useState(false);
    const [error,      setError]        = useState<string | null>(null);
    const [success,    setSuccess]      = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // ——— Validation basique ———
        if (password.length < 8) {
                setError("Le mot de passe doit contenir au moins 8 caractères.");
                return;
        }
        if (password !== confirm) {
                setError("Les mots de passe ne correspondent pas.");
                return;
        }
        if (!entreprise.trim()) {
                setError("Le nom de votre entreprise est requis.");
                return;
        }

        setLoading(true);

        const result = await signUpWithPassword(email, password, {
                data: { entreprise: entreprise.trim() },
        });

        setLoading(false);

        if (!result.success) {
                setError(result.error ?? "Erreur lors de l'inscription.");
                return;
        }

        // ——— Succès : afficher un message de confirmation email ———
        setSuccess(true);
  };

  // ——— Écran de confirmation après inscription ———
  if (success) {
        return (
                <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
                        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
                                  <div className="w-16 h-16 bg-lagoon/15 rounded-full flex items-center justify-center mx-auto mb-4">
                                              <span className="text-3xl">📬</span>span>
                                  </div>div>
                                  <h1 className="text-2xl font-black text-ocean mb-2">
                                              Vérifiez votre email
                                  </h1>h1>
                                  <p className="text-ocean/60 mb-6">
                                              Un lien de confirmation a été envoyé à{" "}
                                              <strong className="text-ocean">{email}</strong>strong>. Cliquez dessus
                                              pour activer votre compte Ora AI.
                                  </p>p>
                                  <button
                                                onClick={() => router.push("/login")}
                                                className="w-full bg-lagoon text-white py-3 rounded-full font-bold hover:bg-ocean transition-colors"
                                              >
                                              Aller à la page de connexion
                                  </button>button>
                        </div>div>
                </div>div>
              );
  }
  
    return (
          <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                  {/* Logo */}
                        <div className="text-center mb-8">
                                  <a href="/" className="inline-flex items-center gap-2 justify-center">
                                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lagoon to-ocean flex items-center justify-center">
                                                            <span className="text-white font-black text-lg">O</span>span>
                                              </div>div>
                                              <span className="text-2xl font-black text-ocean">
                                                            Ora <span className="text-lagoon">AI</span>span>
                                              </span>span>
                                  </a>a>
                                  <h1 className="text-xl font-bold text-ocean mt-4 mb-1">
                                              Créer votre compte
                                  </h1>h1>
                                  <p className="text-ocean/50 text-sm">
                                              Commencez gratuitement — sans carte bancaire
                                  </p>p>
                        </div>div>
                
                  {/* Formulaire */}
                        <form onSubmit={handleSignup} className="space-y-4">
                          {/* Entreprise */}
                                  <div>
                                              <label className="block text-sm font-semibold text-ocean mb-1">
                                                            Nom de votre entreprise
                                              </label>label>
                                              <input
                                                              type="text"
                                                              value={entreprise}
                                                              onChange={(e) => setEntreprise(e.target.value)}
                                                              placeholder="Ex : Pâtisserie Moana, Hôtel Tiare…"
                                                              required
                                                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean placeholder-ocean/30 focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition"
                                                            />
                                  </div>div>
                        
                          {/* Email */}
                                  <div>
                                              <label className="block text-sm font-semibold text-ocean mb-1">
                                                            Adresse email
                                              </label>label>
                                              <input
                                                              type="email"
                                                              value={email}
                                                              onChange={(e) => setEmail(e.target.value)}
                                                              placeholder="vous@entreprise.pf"
                                                              required
                                                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean placeholder-ocean/30 focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition"
                                                            />
                                  </div>div>
                        
                          {/* Mot de passe */}
                                  <div>
                                              <label className="block text-sm font-semibold text-ocean mb-1">
                                                            Mot de passe
                                              </label>label>
                                              <input
                                                              type="password"
                                                              value={password}
                                                              onChange={(e) => setPassword(e.target.value)}
                                                              placeholder="8 caractères minimum"
                                                              required
                                                              minLength={8}
                                                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean placeholder-ocean/30 focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition"
                                                            />
                                  </div>div>
                        
                          {/* Confirmation */}
                                  <div>
                                              <label className="block text-sm font-semibold text-ocean mb-1">
                                                            Confirmer le mot de passe
                                              </label>label>
                                              <input
                                                              type="password"
                                                              value={confirm}
                                                              onChange={(e) => setConfirm(e.target.value)}
                                                              placeholder="Répétez votre mot de passe"
                                                              required
                                                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean placeholder-ocean/30 focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition"
                                                            />
                                  </div>div>
                        
                          {/* Erreur */}
                          {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                          {error}
                        </div>div>
                                  )}
                        
                          {/* Bouton */}
                                  <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-lagoon text-white py-3 rounded-full font-bold hover:bg-ocean transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                                              >
                                    {loading ? "Création du compte…" : "Créer mon compte →"}
                                  </button>button>
                        </form>form>
                
                  {/* Lien login */}
                        <p className="text-center text-sm text-ocean/50 mt-6">
                                  Déjà un compte ?{" "}
                                  <a
                                                href="/login"
                                                className="text-lagoon font-semibold hover:text-ocean transition-colors"
                                              >
                                              Se connecter
                                  </a>a>
                        </p>p>
                
                  {/* Mention légale */}
                        <p className="text-center text-xs text-ocean/30 mt-4">
                                  En créant un compte, vous acceptez nos{" "}
                                  <a href="#" className="underline hover:text-ocean/60">
                                              conditions d&apos;utilisation
                                  </a>a>
                                  .
                        </p>p>
                </div>div>
          </div>div>
        );
}</div>
