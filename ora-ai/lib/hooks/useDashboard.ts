// ============================================================
// ORA AI — Hooks React pour les données du dashboard
// Requêtes Supabase côté client avec gestion du chargement
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/supabase-auth";
import { AGENTS } from "@/lib/config/agents";
import type { Task, UserProfile, AgentId, DashboardStats } from "@/lib/types";

// ------------------------------------------------------------
// Hook : utilisateur courant
// ------------------------------------------------------------

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

// ------------------------------------------------------------
// Hook : stats du dashboard principal
// ------------------------------------------------------------

export function useDashboardStats(userId: string | null) {
  const [stats, setStats] = useState<DashboardStats>({
    activeAgents: 0,
    totalTasks: 0,
    messagesHandled: 0,
    timeSavedHours: 0,
    updatedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      // Appel de la fonction RPC Supabase
      const { data, error: rpcError } = await (supabase as any)
        .rpc("get_dashboard_stats", { p_user_id: userId });

      if (rpcError) throw rpcError;

      if (data && Array.isArray(data) && data[0]) {
        const row = data[0] as {
          active_agents: number;
          total_tasks: number;
          messages_handled: number;
          time_saved_hours: number;
        };
        setStats({
          activeAgents: row.active_agents ?? 0,
          totalTasks: row.total_tasks ?? 0,
          messagesHandled: row.messages_handled ?? 0,
          timeSavedHours: parseFloat((row.time_saved_hours ?? 0).toFixed(1)),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError("Impossible de charger les statistiques.");
      console.error("[useDashboardStats]", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// ------------------------------------------------------------
// Hook : liste des tâches récentes
// ------------------------------------------------------------

export function useRecentTasks(
  userId: string | null,
  options: { agentId?: AgentId; limit?: number } = {}
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { agentId, limit = 10 } = options;

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      let query = (supabase as any)
        .from("tasks" as never)
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (agentId) query = query.eq("agent_id", agentId) as typeof query;

      const { data, error: dbError, count } = await query;

      if (dbError) throw dbError;

      // Mapper snake_case DB → camelCase TypeScript
      const mapped = (data ?? []).map((t: Record<string, unknown>) => ({
        id: t.id as string,
        agentId: t.agent_id as AgentId,
        type: t.type as Task["type"],
        status: t.status as Task["status"],
        platform: t.platform as Task["platform"],
        title: t.title as string,
        description: t.description as string | undefined,
        scheduledAt: t.scheduled_at as string | undefined,
        executedAt: t.executed_at as string | undefined,
        createdAt: t.created_at as string,
        error: t.error as string | undefined,
        metadata: t.metadata as Task["metadata"],
      }));

      setTasks(mapped);
      setTotal(count ?? 0);
    } catch (err) {
      setError("Impossible de charger les tâches.");
      console.error("[useRecentTasks]", err);
    } finally {
      setLoading(false);
    }
  }, [userId, agentId, limit]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Écoute en temps réel des nouvelles tâches
  useEffect(() => {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel("tasks_realtime")
      .on(
        "postgres_changes" as never,
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: "user_id=eq." + userId,
        },
        () => {
          fetchTasks(); // Rafraîchir à chaque changement
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchTasks]);

  return { tasks, total, loading, error, refetch: fetchTasks };
}

// ------------------------------------------------------------
// Hook : stats par agent (pour la page /dashboard/stats)
// ------------------------------------------------------------

export function useAgentStats(userId: string | null) {
  const [agentTaskCounts, setAgentTaskCounts] = useState<
    Record<AgentId, { total: number; success: number; today: number }>
  >({} as Record<AgentId, { total: number; success: number; today: number }>);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetch() {
      const supabase = getSupabaseBrowserClient();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data } = await (supabase as any)
        .from("tasks" as never)
        .select("agent_id, status, created_at")
        .eq("user_id", userId);

      const counts = {} as Record<AgentId, { total: number; success: number; today: number }>;

      for (const agent of AGENTS) {
        const agentTasks = (data ?? []).filter(
          (t: Record<string, unknown>) => t.agent_id === agent.id
        );
        counts[agent.id] = {
          total: agentTasks.length,
          success: agentTasks.filter(
            (t: Record<string, unknown>) => t.status === "success"
          ).length,
          today: agentTasks.filter(
            (t: Record<string, unknown>) =>
              new Date(t.created_at as string) >= todayStart
          ).length,
        };
      }

      setAgentTaskCounts(counts);
      setLoading(false);
    }

    fetch();
  }, [userId]);

  return { agentTaskCounts, loading };
}

// ------------------------------------------------------------
// Hook : intégrations connectées
// ------------------------------------------------------------

export function useIntegrations(userId: string | null) {
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetch() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await (supabase as any)
        .from("integrations" as never)
        .select("platform, connected")
        .eq("user_id", userId);

      const map: Record<string, boolean> = {};
      (data ?? []).forEach((i: Record<string, unknown>) => {
        map[i.platform as string] = Boolean(i.connected);
      });

      setIntegrations(map);
      setLoading(false);
    }

    fetch();
  }, [userId]);

  return { integrations, loading };
}

// ------------------------------------------------------------
// Utilitaire : formater une date relative
// ------------------------------------------------------------

export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return "il y a " + minutes + " min";
  if (hours < 24) return "il y a " + hours + "h";
  return "il y a " + days + "j";
}
