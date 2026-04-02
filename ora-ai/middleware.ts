// ============================================================
// ORA AI — Middleware Next.js
// Protège les routes /dashboard/* et /api/* (sauf webhooks)
// Rafraîchit la session Supabase à chaque requête
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes publiques accessibles sans authentification
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/api/webhooks/whatsapp",
  "/api/webhooks/messenger",
  "/api/webhook/whatsapp",  // Meta Cloud API webhook
  "/auth/callback",
];

// Routes protégées nécessitant une session active
const PROTECTED_PREFIXES = ["/dashboard", "/api/agents", "/api/tasks"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les assets statiques et les routes publiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js)$/) ||
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r))
  ) {
    return NextResponse.next();
  }

  // Créer la réponse et le client Supabase SSR
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Récupérer l'utilisateur courant (rafraîchit la session si nécessaire)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Vérifier si la route nécessite une authentification
  const requiresAuth = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (requiresAuth && !user) {
    // Rediriger vers /login avec l'URL de retour
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si déjà connecté et tente d'accéder à /login → rediriger vers /dashboard
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Headers de sécurité
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-XSS-Protection", "1; mode=block");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Correspond à toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
