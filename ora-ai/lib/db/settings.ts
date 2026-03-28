import { getSupabaseBrowserClient, getSupabaseServerClient } from "@/lib/db/supabase";

// ============================================================
// TYPES
// ============================================================

export interface UserProfile {
  id: string;
  user_id: string;
  entreprise: string;
  secteur: string;
  island: string;
  email: string;
  whatsapp: string;
  langue: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserNotifications {
  id: string;
  user_id: string;
  email: boolean;
  whatsapp: boolean;
  rapport_quotidien: boolean;
  rapport_hebdo: boolean;
  alertes_erreur: boolean;
  updated_at?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: "starter" | "pro" | "business";
  status: "active" | "canceled" | "past_due" | "trialing";
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// PROFIL
// ============================================================

/**
 * Récupère le profil de l'utilisateur connecté
 * Utilise côté client
 */
export async function getProfile(): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // Si le profil n'existe pas encore, on en crée un vide
    if (error.code === "PGRST116") {
      return createDefaultProfile(user.id, user.email ?? "");
    }
    console.error("Erreur getProfile:", error);
    return null;
  }
  return data as UserProfile;
}

/**
 * Crée un profil par défaut pour un nouvel utilisateur
 */
async function createDefaultProfile(userId: string, email: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();

  const defaultProfile: Omit<UserProfile, "id" | "created_at" | "updated_at"> = {
    user_id: userId,
    entreprise: "",
    secteur: "Commerce & Artisanat",
    island: "Tahiti",
    email: email,
    whatsapp: "",
    langue: "Français",
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(defaultProfile)
    .select()
    .single();

  if (error) {
    console.error("Erreur createDefaultProfile:", error);
    return null;
  }
  return data as UserProfile;
}

/**
 * Met à jour le profil de l'utilisateur
 */
export async function updateProfile(
  updates: Partial<Omit<UserProfile, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) {
    console.error("Erreur updateProfile:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ============================================================
// NOTIFICATIONS
// ============================================================

/**
 * Récupère les préférences de notification de l'utilisateur
 */
export async function getNotifications(): Promise<UserNotifications | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_notifications")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // Si n'existe pas encore, créer les préférences par défaut
    if (error.code === "PGRST116") {
      return createDefaultNotifications(user.id);
    }
    console.error("Erreur getNotifications:", error);
    return null;
  }
  return data as UserNotifications;
}

/**
 * Crée des préférences de notification par défaut
 */
async function createDefaultNotifications(userId: string): Promise<UserNotifications | null> {
  const supabase = getSupabaseBrowserClient();

  const defaults = {
    user_id: userId,
    email: true,
    whatsapp: true,
    rapport_quotidien: true,
    rapport_hebdo: true,
    alertes_erreur: true,
  };

  const { data, error } = await supabase
    .from("user_notifications")
    .insert(defaults)
    .select()
    .single();

  if (error) {
    console.error("Erreur createDefaultNotifications:", error);
    return null;
  }
  return data as UserNotifications;
}

/**
 * Met à jour les préférences de notification
 */
export async function updateNotifications(
  updates: Partial<Omit<UserNotifications, "id" | "user_id" | "updated_at">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("user_notifications")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) {
    console.error("Erreur updateNotifications:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ============================================================
// ABONNEMENT
// ============================================================

/**
 * Récupère l'abonnement actif de l'utilisateur
 */
export async function getSubscription(): Promise<UserSubscription | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Aucun abonnement actif — retourner un plan par défaut "starter"
      return {
        id: "",
        user_id: user.id,
        plan: "starter",
        status: "active",
        cancel_at_period_end: false,
      };
    }
    console.error("Erreur getSubscription:", error);
    return null;
  }
  return data as UserSubscription;
}

// ============================================================
// SERVER-SIDE HELPERS (pour Route Handlers / Server Components)
// ============================================================

/**
 * Récupère le profil côté serveur (pour server components ou API routes)
 */
export async function getProfileServer(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Erreur getProfileServer:", error);
    return null;
  }
  return data as UserProfile;
}

// ============================================================
// PLAN LABELS (utilitaires UI)
// ============================================================

export const PLAN_LABELS: Record<string, { label: string; price: string; color: string; features: string[] }> = {
  starter: {
    label: "Starter",
    price: "4 900 XPF/mois",
    color: "text-blue-500",
    features: ["1 agent IA", "Support email", "100 actions/mois"],
  },
  pro: {
    label: "Pro",
    price: "9 900 XPF/mois",
    color: "text-lagoon",
    features: ["3 agents IA", "Support WhatsApp", "Connexions illimitées"],
  },
  business: {
    label: "Business",
    price: "24 900 XPF/mois",
    color: "text-purple-500",
    features: ["5 agents IA", "Support prioritaire 24/7", "API personnalisée"],
  },
};
