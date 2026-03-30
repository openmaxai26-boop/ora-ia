"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/db/supabase";

export default function Navbar() {
  const [open,       setOpen]       = useState(false);
  const [loggedIn,   setLoggedIn]   = useState(false);
  const [userEmail,  setUserEmail]  = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const router = useRouter();

  // ——— Vérifier l'état de connexion au montage + écouter les changements ———
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Lire la session courante
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
      setUserEmail(user?.email ?? null);
      setAuthLoaded(true);
    });

    // Écouter les changements d'auth (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ——— Déconnexion ———
  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-lagoon/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lagoon to-ocean flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="text-xl font-bold text-ocean">
            Ora <span className="text-lagoon">AI</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#agents"  className="text-ocean/70 hover:text-lagoon transition-colors font-medium">Agents</a>
          <a href="#comment" className="text-ocean/70 hover:text-lagoon transition-colors font-medium">Comment ça marche</a>
          <a href="#tarifs"  className="text-ocean/70 hover:text-lagoon transition-colors font-medium">Tarifs</a>
        </div>

        {/* CTA Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {!authLoaded ? (
            // Skeleton pendant le chargement Auth
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-gray-100 rounded-full animate-pulse" />
              <div className="w-28 h-9 bg-lagoon/20 rounded-full animate-pulse" />
            </div>
          ) : loggedIn ? (
            // Utilisateur connecté
            <>
              <span className="text-ocean/50 text-sm hidden lg:block truncate max-w-[140px]" title={userEmail ?? ""}>
                {userEmail}
              </span>
              <a
                href="/dashboard"
                className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold hover:bg-ocean transition-colors"
              >
                Mon dashboard
              </a>
              <button
                onClick={handleLogout}
                className="text-ocean/50 font-medium hover:text-red-400 transition-colors text-sm"
              >
                Déconnexion
              </button>
            </>
          ) : (
            // Utilisateur non connecté
            <>
              <a href="/login" className="text-ocean font-medium hover:text-lagoon transition-colors">
                Connexion
              </a>
              <a
                href="#tarifs"
                className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold hover:bg-ocean transition-colors"
              >
                Essai gratuit
              </a>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-ocean">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-lagoon/20 px-6 py-4 flex flex-col gap-4">
          <a href="#agents"  onClick={() => setOpen(false)} className="text-ocean font-medium">Agents</a>
          <a href="#comment" onClick={() => setOpen(false)} className="text-ocean font-medium">Comment ça marche</a>
          <a href="#tarifs"  onClick={() => setOpen(false)} className="text-ocean font-medium">Tarifs</a>

          <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
            {loggedIn ? (
              <>
                <a
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold text-center"
                >
                  Mon dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="text-ocean/50 text-sm font-medium hover:text-red-400 transition-colors text-center"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-ocean font-medium text-center"
                >
                  Connexion
                </a>
                <a
                  href="#tarifs"
                  onClick={() => setOpen(false)}
                  className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold text-center"
                >
                  Essai gratuit
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
