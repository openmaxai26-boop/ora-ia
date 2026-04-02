// ============================================================
// ORA AI — Helpers Supabase Auth
// Fonctions d'authentification pour les composants client
// et les Server Actions Next.js
// ============================================================

"use client";

import { getSupabaseBrowserClient } from "@/lib/db/supabase";
import type { UserProfile } from "@/lib/types";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface AuthResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  entreprise: string;
  secteur: string;
  island?: string;
  langue?: "fr" | "fr-pf" | "en";
}

// ------------------------------------------------------------
// Connexion par email + mot de passe
// ------------------------------------------------------------

export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Traduction des messages d'erreur Supabase
    const errorMessages: Record<string, string> = {
      "Invalid login credentials": "Email ou mot de passe incorrect.",
      "Email not confirmed": "Veuillez confirmer votre email avant de vous connecter.",
      "Too many requests": "Trop de tentatives. Réessayez dans quelques minutes.",
    };
    return {
      success: false,
      error: errorMessages[error.message] ?? "Erreur de connexion. Réessayez.",
    };
  }

  return { success: true, redirectTo: "/dashboard" };
}

// ------------------------------------------------------------
// Inscription
// ------------------------------------------------------------

export async function signUp(data: SignUpData): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        // Métadonnées stockées dans auth.users.raw_user_meta_data
        entreprise: data.entreprise,
        secteur: data.secteur,
        island: data.island ?? "Tahiti",
        langue: data.langue ?? "fr",
      },
    },
  });

  if (error) {
    const errorMessages: Record<string, string> = {
      "User already registered": "Un compte existe déjà avec cet email.",
      "Password should be at least 6 characters": "Le mot de passe doit contenir au moins 6 caractères.",
      "Unable to validate email address: invalid format": "Format d'email invalide.",
    };
    return {
      success: false,
      error: errorMessages[error.message] ?? "Erreur lors de l'inscription. Réessayez.",
    };
  }

  return {
    success: true,
    redirectTo: "/login?message=Vérifiez votre email pour confirmer votre compte.",
  };
}

// ------------------------------------------------------------
// Déconnexion
// ------------------------------------------------------------

export async function signOut(): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: "Erreur lors de la déconnexion." };
  }

  return { success: true, redirectTo: "/login" };
}

// ------------------------------------------------------------
// Mot de passe oublié — envoi email de réinitialisation
// ------------------------------------------------------------

export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: "Impossible d'envoyer l'email. Vérifiez l'adresse." };
  }

  return {
    success: true,
    redirectTo: "/login?message=Email de réinitialisation envoyé. Vérifiez votre boîte.",
  };
}

// ------------------------------------------------------------
// Mise à jour du mot de passe (depuis le lien de réinitialisation)
// ------------------------------------------------------------

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { success: false, error: "Impossible de mettre à jour le mot de passe." };
  }

  return { success: true, redirectTo: "/dashboard" };
}

// ------------------------------------------------------------
// Récupérer l'utilisateur courant (côté client)
// ------------------------------------------------------------

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Récupérer le profil étendu depuis la table public.users
  const { data: profile } = await (supabase as any)
    .from("users" as never)
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as UserProfile | null;
}

// ------------------------------------------------------------
// Hook : écouter les changements d'état d'auth
// À utiliser dans un Provider React au niveau de layout.tsx
// ------------------------------------------------------------

export function onAuthStateChange(
  callback: (user: UserProfile | null) => void
) {
  const supabase = getSupabaseBrowserClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }

    const { data: profile } = await (supabase as any)
      .from("users" as never)
      .select("*")
      .eq("id", session.user.id)
      .single();

    callback((profile as unknown as UserProfile) ?? null);
  });

  // Retourner la fonction de désabonnement
  return () => subscription.unsubscribe();
}
