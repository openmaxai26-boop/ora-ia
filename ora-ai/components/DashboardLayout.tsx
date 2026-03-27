"use client";

import { usePathname } from "next/navigation";

const navItems = [
  { icon: "🏠", label: "Tableau de bord", href: "/dashboard" },
  { icon: "🤖", label: "Mes agents", href: "/dashboard/agents" },
  { icon: "📊", label: "Statistiques", href: "/dashboard/stats" },
  { icon: "🔗", label: "Intégrations", href: "/dashboard/integrations" },
  { icon: "⚙️", label: "Paramètres", href: "/dashboard/settings" },
  ];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();

  return (
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar */}
              <aside className="fixed left-0 top-0 bottom-0 w-64 gradient-bg text-white flex flex-col z-40">
                      <div className="p-6 border-b border-white/10">
                                <a href="/" className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-lagoon flex items-center justify-center">
                                                          <span className="font-bold text-white text-sm">O</span>span>
                                            </div>div>
                                            <span className="text-xl font-bold">
                                                          Ora <span className="text-lagoon">AI</span>span>
                                            </span>span>
                                </a>a>
                      </div>div>
              
                      <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                      const isActive =
                                      item.href === "/dashboard"
                                        ? pathname === "/dashboard"
                                        : pathname.startsWith(item.href);
                      return (
                                      <a
                                                        key={item.label}
                                                        href={item.href}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                                            isActive
                                                                              ? "bg-lagoon/20 text-lagoon"
                                                                              : "text-white/60 hover:bg-white/10 hover:text-white"
                                                        }`}
                                                      >
                                                      <span>{item.icon}</span>span>
                                        {item.label}
                                      </a>a>
                                    );
        })}
                      </nav>nav>
              
                      <div className="p-4 border-t border-white/10">
                                <div className="bg-white/10 rounded-xl p-4">
                                            <p className="text-xs text-white/50 mb-1">Plan actuel</p>p>
                                            <p className="font-bold text-lagoon">Pro</p>p>
                                            <p className="text-xs text-white/50 mt-1">9 900 XPF/mois</p>p>
                                </div>div>
                                <a
                                              href="/login"
                                              className="mt-3 flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors px-2 py-2"
                                            >
                                            <span>🚪</span>span> Déconnexion
                                </a>a>
                      </div>div>
              </aside>aside>
        
          {/* Main content */}
              <main className="ml-64">{children}</main>main>
        </div>div>
      );
}</div>
