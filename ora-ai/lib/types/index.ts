// ============================================================
// ORA AI — Types TypeScript centralisés
// ============================================================

// ------------------------------------------------------------
// AGENTS
// ------------------------------------------------------------

export type AgentId = "teva" | "hina" | "reva" | "manu" | "ari";

export type AgentPlan = "starter" | "pro" | "business";

export type AgentStatus = "active" | "inactive" | "error" | "configuring";

export interface Agent {
    id: AgentId;
    name: string;
    emoji: string;
    role: string;
    description: string;
    color: string;          // Tailwind gradient class
  bgColor: string;        // Tailwind bg class
  plan: AgentPlan;        // plan minimum requis
  platforms: Platform[];  // plateformes supportées
  features: string[];
}

// ------------------------------------------------------------
// TÂCHES
// ------------------------------------------------------------

export type TaskType =
    | "social_post"
  | "social_story"
  | "customer_reply"
  | "appointment"
  | "seo_article"
  | "job_post"
  | "cv_analysis"
  | "prospect_message"
  | "prospect_followup";

export type TaskStatus = "pending" | "running" | "success" | "failed" | "skipped";

export interface Task {
    id: string;
    agentId: AgentId;
    type: TaskType;
    status: TaskStatus;
    platform: Platform;
    title: string;
    description?: string;
    scheduledAt?: string;  // ISO 8601
  executedAt?: string;
    createdAt: string;
    error?: string;
    metadata?: Record<string, unknown>;
}

// ------------------------------------------------------------
// INTÉGRATIONS / PLATEFORMES
// ------------------------------------------------------------

export type Platform =
    | "facebook"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "whatsapp"
  | "messenger"
  | "gmail"
  | "google_calendar"
  | "notion"
  | "stripe"
  | "wordpress"
  | "wix"
  | "shopify";

export interface Integration {
    platform: Platform;
    label: string;
    icon: string;
    connected: boolean;
    accessToken?: string;    // stocké côté serveur, jamais exposé au client
  refreshToken?: string;
    expiresAt?: string;
    accountName?: string;    // ex: "Page Poerava Artisanat"
  accountId?: string;
    scopes?: string[];
    connectedAt?: string;
}

// ------------------------------------------------------------
// UTILISATEUR / COMPTE
// ------------------------------------------------------------

export type UserPlan = "starter" | "pro" | "business";

export interface UserProfile {
    id: string;
    email: string;
    entreprise: string;
    secteur: string;
    island: string;
    whatsapp?: string;
    langue: "fr" | "fr-pf" | "en";
    plan: UserPlan;
    createdAt: string;
}

export interface Subscription {
    plan: UserPlan;
    priceXPF: number;
    renewsAt: string;
    cancelledAt?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}

// ------------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------------

export interface NotificationPreferences {
    email: boolean;
    whatsapp: boolean;
    rapport_quotidien: boolean;
    rapport_hebdo: boolean;
    alertes_erreur: boolean;
}

// ------------------------------------------------------------
// STATISTIQUES
// ------------------------------------------------------------

export interface AgentStats {
    agentId: AgentId;
    period: "day" | "week" | "month";
    tasksTotal: number;
    tasksSuccess: number;
    tasksFailed: number;
    messagesHandled?: number;
    postsPublished?: number;
    prospectsContacted?: number;
    timeSavedMinutes: number;
}

export interface DashboardStats {
    activeAgents: number;
    totalTasks: number;
    messagesHandled: number;
    timeSavedHours: number;
    updatedAt: string;
}

// ------------------------------------------------------------
// RÉPONSES API
// ------------------------------------------------------------

export interface ApiSuccess<T> {
    success: true;
    data: T;
}

export interface ApiError {
    success: false;
    error: string;
    code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ------------------------------------------------------------
// WEBHOOKS (entrants)
// ------------------------------------------------------------

export interface WebhookPayload {
    source: Platform;
    event: string;
    data: Record<string, unknown>;
    receivedAt: string;
}
