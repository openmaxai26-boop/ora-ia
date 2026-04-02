"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPassword, resetPassword } from "@/lib/auth/supabase-auth";

type Mode = "login" | "forgot";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Lire les messages/erreurs passés en query params (ex: depuis /auth/callback)
  useEffect(() => {
    const msg = searchParams.get("message");
    const err = searchParams.get("error");
    if (msg) setMessage(msg);
    if (err) setError(err);
  }, [searchParams]);

  // Connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signInWithPassword(email, password);

    if (!result.success) {
      setError(result.error ?? "Erreur inconnue.");
      setLoading(false);
      return;
    }

    // Redirection vers /dashboard (ou l'URL demandée avant la redirection)
    const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
    router.push(redirectTo);
    router.refresh();
  };

  // Mot de passe oublié
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await resetPassword(email);

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Erreur inconnue.");
      return;
    }

    setMessage("Email de réinitialisation envoyé ! Vérifiez votre boîte.");
    setMode("login");
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-lagoon/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-lagoon/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-lagoon flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-2xl font-bold text-white">
              Ora <span className="text-lagoon">AI</span>
            </span>
          </a>
          <h1 className="text-white/80 mt-4 text-lg">
            {mode === "login" ? "Bienvenue sur votre espace" : "Réinitialiser le mot de passe"}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Message de succès */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {mode === "login" ? (
            <>
              <h2 className="text-2xl font-black text-ocean mb-2">Connexion</h2>
              <p className="text-ocean/50 text-sm mb-8">
                Accédez à votre tableau de bord Ora AI
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-ocean font-semibold text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.pf"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean placeholder:text-ocean/30 focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition-all"
                  />
                </div>

                <div>
                  <label className="block text-ocean font-semibold text-sm mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean placeholder:text-ocean/30 focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setError(null); setMessage(null); }}
                    className="text-lagoon text-xs font-medium mt-2 block text-right hover:underline w-full"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lagoon text-white py-3 rounded-xl font-bold text-lg hover:bg-ocean transition-colors disabled:opacity-60 lagoon-glow"
                >
                  {loading ? "Connexion en cours..." : "Se connecter"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-ocean/50 text-sm">
                  Pas encore de compte ?{" "}
                  <a href="/#tarifs" className="text-lagoon font-semibold hover:underline">
                    Démarrer gratuitement
                  </a>
                </p>
              </div>

              {/* Accès démo */}
              <div className="mt-4 bg-lagoon/10 rounded-xl p-4 text-center">
                <p className="text-lagoon text-xs font-semibold mb-2">
                  🎯 Accès démo disponible
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-ocean text-xs font-medium hover:text-lagoon transition-colors"
                >
                  Voir le tableau de bord sans compte →
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-ocean mb-2">
                Mot de passe oublié
              </h2>
              <p className="text-ocean/50 text-sm mb-8">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-ocean font-semibold text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.pf"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ocean placeholder:text-ocean/30 focus:outline-none focus:ring-2 focus:ring-lagoon/40 focus:border-lagoon transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lagoon text-white py-3 rounded-xl font-bold text-lg hover:bg-ocean transition-colors disabled:opacity-60"
                >
                  {loading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>

              <button
                onClick={() => { setMode("login"); setError(null); setMessage(null); }}
                className="mt-6 text-ocean/50 text-sm hover:text-ocean transition-colors w-full text-center"
              >
                ← Retour à la connexion
              </button>
            </>
          )}
        </div>

        <p className="text-white/30 text-xs text-center mt-6">
          © 2026 Ora AI — Papeete, Polynésie française
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lagoon border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
