"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/db/supabase";
import { getSubscription, PLAN_LABELS, type UserSubscription } from "@/lib/db/settings";

// ——————————————————————————————————————————————
// Navigation items
// ——————————————————————————————————————————————
const navItems = [
  { icon: "🏠", label: "Tableau de bord", href: "/dashboard" },
  { icon: "🤖", label: "Mes agents",       href: "/dashboard/agents" },
  { icon: "📊", label: "Statistiques",     href: "/dashboard/stats" },
  { icon: "🔗", label: "Intégrations",     href: "/dashboard/integrations" },
  { icon: "⚙️", label: "Paramètres",      href: "/dashboard/settings" },
];

// ——————————————————————————————————————————————
// Props
// ——————————————————————————————————————————————
interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Clé de l'item actif dans la nav (ex: "settings"). Déduit de l'URL si absent. */
  active?: string;
}

// ——————————————————————————————————————————————
// Component
// ——————————————————————————————————————————————
export default function DashboardLayout({ children, active }: DashboardLayoutProps) {
  const pathname  = usePathname();
  const router    = useRouter();

  const [subscription, setSubscription]   = useState<UserSubscription | null>(null);
  const [userEmail, setUserEmail]         = useState<string | null>(null);
  const [loggingOut, setLoggingOut]       = useState(false);

  // ——— Charger abonnement + email utilisateur ———
  useEffect(() => {
    async function loadUserData() {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
      const sub = await getSubscription();
      setSubscription(sub);
    }
    loadUserData();
  }, []);

  // ——— Déconnexion Supabase Auth ———
  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ——— Plan affiché dans la sidebar ———
  const planInfo = subscription ? PLAN_LABELS[subscription.plan] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ——— Sidebar ——— */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 gradient-bg text-white flex flex-col z-40">

        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lagoon flex items-center justify-center">
              <span className="font-bold text-white text-sm">O</span>
            </div>
            <span className="text-xl font-bold">
              Ora <span className="text-lagoon">AI</span>
            </span>
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = active
              ? item.href.includes(active)
              : item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <a
                key={item.label}
                href={item.href}
                className={
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all " +
                  (isActive
                    ? "bg-lagoon/20 text-lagoon"
                    : "text-white/60 hover:bg-white/10 hover:text-white")
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Plan actuel + déconnexion */}
        <div className="p-4 border-t border-white/10">
          {/* Badge plan */}
          <div className="bg-white/10 rounded-xl p-4 mb-3">
            <p className="text-xs text-white/50 mb-1">Plan actuel</p>
            {planInfo ? (
              <>
                <p className={"font-bold " + planInfo.color}>{planInfo.label}</p>
                <p className="text-xs text-white/50 mt-1">{planInfo.price}</p>
              </>
            ) : (
              <>
                <div className="h-4 w-16 bg-white/20 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
              </>
            )}
          </div>

          {/* Email utilisateur */}
          {userEmail && (
            <p className="text-white/30 text-xs px-2 mb-1 truncate" title={userEmail}>
              {userEmail}
            </p>
          )}

          {/* Bouton déconnexion */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors px-2 py-2 rounded-lg hover:bg-white/5 disabled:opacity-50"
          >
            <span>{loggingOut ? "⏳" : "🚪"}</span>
            {loggingOut ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>
      </aside>

      {/* ——— Contenu principal ——— */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
