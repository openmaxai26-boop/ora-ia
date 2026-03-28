// ============================================================
// ORA AI — Client Supabase
// Fournit les clients server-side et client-side Supabase
// avec les types TypeScript générés depuis le schéma DB
// ============================================================

import { createClient } from "@supabase/supabase-js";
import type {
  UserProfile,
  Subscription,
  Task,
  Integration,
  AgentStats,
  NotificationPreferences,
} from "@/lib/types";

// ------------------------------------------------------------
// Variables d'environnement (obligatoires)
// ------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variables d'environnement Supabase manquantes : " +
    "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises."
  );
}

// ------------------------------------------------------------
// Types de la base de données
// ------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile & {
          hashed_password?: string;
          email_verified: boolean;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
        };
        Insert: Omit<UserProfile, "id" | "createdAt"> & {
          id?: string;
          hashed_password?: string;
          email_verified?: boolean;
        };
        Update: Partial<UserProfile>;
      };
      subscriptions: {
        Row: Subscription & { id: string; userId: string; updatedAt: string };
        Insert: Omit<Subscription, "id"> & { userId: string };
        Update: Partial<Subscription>;
      };
      tasks: {
        Row: Task & { userId: string; updatedAt: string };
        Insert: Omit<Task, "id"> & { userId: string; id?: string };
        Update: Partial<Task>;
      };
      integrations: {
        Row: Integration & { id: string; userId: string; updatedAt: string };
        Insert: Omit<Integration, "id"> & { userId: string; id?: string };
        Update: Partial<Integration>;
      };
      agent_stats: {
        Row: AgentStats & { id: string; userId: string; createdAt: string };
        Insert: Omit<AgentStats, "id"> & { userId: string; id?: string };
        Update: Partial<AgentStats>;
      };
      conversations: {
        Row: {
          id: string;
          userId: string;
          platform: "whatsapp" | "messenger";
          contactId: string;       // numéro E.164 ou PSID Facebook
          contactName?: string;
          history: { role: "user" | "assistant"; content: string; at: string }[];
          lastMessageAt: string;
          createdAt: string;
        };
        Insert: {
          userId: string;
          platform: "whatsapp" | "messenger";
          contactId: string;
          contactName?: string;
          history?: { role: "user" | "assistant"; content: string; at: string }[];
        };
        Update: {
          history?: { role: "user" | "assistant"; content: string; at: string }[];
          lastMessageAt?: string;
          contactName?: string;
        };
      };
      notification_preferences: {
        Row: NotificationPreferences & { id: string; userId: string; updatedAt: string };
        Insert: NotificationPreferences & { userId: string; id?: string };
        Update: Partial<NotificationPreferences>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_dashboard_stats: {
        Args: { p_user_id: string };
        Returns: {
          active_agents: number;
          total_tasks: number;
          messages_handled: number;
          time_saved_hours: number;
        };
      };
    };
    Enums: {
      agent_id: "teva" | "hina" | "reva" | "manu" | "ari";
      task_status: "pending" | "running" | "success" | "failed" | "skipped";
      user_plan: "starter" | "pro" | "business";
      platform: "facebook" | "instagram" | "tiktok" | "linkedin" | "whatsapp" | "messenger" | "gmail" | "google_calendar" | "notion" | "stripe" | "wordpress" | "wix" | "shopify";
    };
  };
}

// ------------------------------------------------------------
// Client navigateur (côté client — clé anon publique)
// À utiliser dans les composants React et hooks client
// ------------------------------------------------------------

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return browserClient;
}

// ------------------------------------------------------------
// Client serveur (côté serveur — service role key)
// À utiliser dans les Route Handlers et Server Actions UNIQUEMENT
// ⚠️  Ne jamais exposer côté client
// ------------------------------------------------------------

export function getSupabaseServerClient() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante — client serveur non disponible");
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ------------------------------------------------------------
// Helpers CRUD — Tasks
// ------------------------------------------------------------

export async function createTask(
  userId: string,
  task: Omit<Task, "id">
): Promise<Task> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("tasks")
    .insert({ ...task, userId })
    .select()
    .single();

  if (error) throw new Error("Erreur création tâche : " + error.message);
  return data as Task;
}

export async function getTasksByUser(
  userId: string,
  options: {
    agentId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ tasks: Task[]; total: number }> {
  const db = getSupabaseServerClient();
  const { limit = 20, offset = 0, agentId, status } = options;

  let query = db
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  if (agentId) query = query.eq("agentId", agentId);
  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) throw new Error("Erreur lecture tâches : " + error.message);

  return { tasks: (data ?? []) as Task[], total: count ?? 0 };
}

// ------------------------------------------------------------
// Helpers CRUD — Integrations
// ------------------------------------------------------------

export async function getUserIntegrations(userId: string): Promise<Integration[]> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("integrations")
    .select("*")
    .eq("userId", userId);

  if (error) throw new Error("Erreur lecture intégrations : " + error.message);
  return (data ?? []) as Integration[];
}

export async function upsertIntegration(
  userId: string,
  integration: Integration
): Promise<Integration> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("integrations")
    .upsert({ ...integration, userId }, { onConflict: "userId,platform" })
    .select()
    .single();

  if (error) throw new Error("Erreur upsert intégration : " + error.message);
  return data as Integration;
}

// ------------------------------------------------------------
// Helpers CRUD — Conversations (Hina)
// ------------------------------------------------------------

export async function getOrCreateConversation(
  userId: string,
  platform: "whatsapp" | "messenger",
  contactId: string,
  contactName?: string
) {
  const db = getSupabaseServerClient();

  // Chercher une conversation existante
  const { data: existing } = await db
    .from("conversations")
    .select("*")
    .eq("userId", userId)
    .eq("platform", platform)
    .eq("contactId", contactId)
    .single();

  if (existing) return existing;

  // Créer une nouvelle conversation
  const { data, error } = await db
    .from("conversations")
    .insert({
      userId,
      platform,
      contactId,
      contactName,
      history: [],
    })
    .select()
    .single();

  if (error) throw new Error("Erreur création conversation : " + error.message);
  return data;
}

export async function appendConversationMessage(
  conversationId: string,
  message: { role: "user" | "assistant"; content: string }
) {
  const db = getSupabaseServerClient();
  const at = new Date().toISOString();

  // Utiliser la fonction RPC pour append atomique dans le JSONB
  const { error } = await db.rpc("append_conversation_message" as never, {
    p_conversation_id: conversationId,
    p_role: message.role,
    p_content: message.content,
    p_at: at,
  });

  if (error) {
    // Fallback : lecture + écriture manuelle
    const { data: conv } = await db
      .from("conversations")
      .select("history")
      .eq("id", conversationId)
      .single();

    const history = (conv?.history as { role: string; content: string; at: string }[]) ?? [];
    history.push({ ...message, at });

    await db
      .from("conversations")
      .update({ history, lastMessageAt: at })
      .eq("id", conversationId);
  }
}

// ------------------------------------------------------------
// Helpers CRUD — User & Subscription
// ------------------------------------------------------------

export async function getUserById(userId: string): Promise<UserProfile | null> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("subscriptions")
    .select("*")
    .eq("userId", userId)
    .order("renewsAt", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as Subscription;
}
