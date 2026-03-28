// ============================================================
// GET /auth/callback
// Point d'entrée après confirmation email ou OAuth Supabase.
// Échange le code PKCE contre une session, puis redirige.
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Gérer les erreurs renvoyées par Supabase (ex: lien expiré)
  if (errorParam) {
    console.error("[Auth Callback] Erreur Supabase :", errorParam, errorDescription);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set(
      "error",
      errorDescription ?? "Lien de confirmation invalide ou expiré."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    // Pas de code → rediriger vers login
    return NextResponse.redirect(new URL("/login", origin));
  }

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // Échanger le code PKCE contre une session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback] Erreur échange de code :", error.message);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "La confirmation a échoué. Réessayez.");
    return NextResponse.redirect(loginUrl);
  }

  // Première connexion : s'assurer que le profil existe dans public.users
  if (data.user) {
    const { error: profileError } = await supabase
      .from("users" as never)
      .upsert(
        {
          id: data.user.id,
          email: data.user.email ?? "",
          entreprise: data.user.user_metadata?.entreprise ?? "",
          secteur: data.user.user_metadata?.secteur ?? "",
          island: data.user.user_metadata?.island ?? "Tahiti",
          langue: data.user.user_metadata?.langue ?? "fr",
          email_verified: true,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("[Auth Callback] Erreur upsert profil :", profileError.message);
      // Ne pas bloquer la connexion pour autant
    }
  }

  // Rediriger vers le dashboard (ou l'URL demandée)
  const redirectUrl = new URL(next.startsWith("/") ? next : "/dashboard", origin);
  return NextResponse.redirect(redirectUrl);
}
