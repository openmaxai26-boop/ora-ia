// ============================================================
// GET  /api/tasks  — liste les tâches d'un utilisateur
// POST /api/tasks  — crée une nouvelle tâche
// Branché sur Supabase (table public.tasks)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import type { Task, AgentId, TaskStatus, ApiResponse } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/db/supabase";

// ============================================================
// GET /api/tasks?limit=20&agentId=teva&status=success
// ============================================================
export async function GET(req: NextRequest) {
    const supabase = getSupabaseServerClient();

  // ——— Auth ———
  const {
        data: { user },
        error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Non authentifié" },
          { status: 401 }
              );
  }

  // ——— Paramètres de filtre (optionnels) ———
  const { searchParams } = new URL(req.url);
    const limit  = Math.min(parseInt(searchParams.get("limit")  ?? "20"), 100);
    const agentId = searchParams.get("agentId") as AgentId | null;
    const status  = searchParams.get("status")  as TaskStatus | null;

  // ——— Requête Supabase ———
  let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

  if (agentId) query = query.eq("agent_id", agentId);
    if (status)  query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
        console.error("[GET /api/tasks] Erreur Supabase :", error.message);
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: error.message },
          { status: 500 }
              );
  }

  // ——— Mapper les colonnes snake_case → camelCase ———
  const tasks: Task[] = (data ?? []).map((row) => ({
        id:          row.id,
        agentId:     row.agent_id     as AgentId,
        type:        row.type,
        status:      row.status       as TaskStatus,
        platform:    row.platform,
        title:       row.title,
        description: row.description  ?? undefined,
        scheduledAt: row.scheduled_at ?? undefined,
        executedAt:  row.executed_at  ?? undefined,
        error:       row.error        ?? undefined,
        metadata:    row.metadata     ?? {},
        createdAt:   row.created_at,
        updatedAt:   row.updated_at,
  }));

  return NextResponse.json<ApiResponse<Task[]>>({ success: true, data: tasks });
}

// ============================================================
// POST /api/tasks
// Body : { agentId, type, platform, title, description?, metadata? }
// ============================================================
export async function POST(req: NextRequest) {
    const supabase = getSupabaseServerClient();

  // ——— Auth ———
  const {
        data: { user },
        error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Non authentifié" },
          { status: 401 }
              );
  }

  // ——— Lecture du body ———
  let body: {
        agentId:      AgentId;
        type:         string;
        platform:     string;
        title:        string;
        description?: string;
        metadata?:    Record<string, unknown>;
  };

  try {
        body = await req.json();
  } catch {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Body JSON invalide" },
          { status: 400 }
              );
  }

  const { agentId, type, platform, title, description, metadata } = body;

  if (!agentId || !type || !platform || !title) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Champs obligatoires manquants : agentId, type, platform, title" },
          { status: 400 }
              );
  }

  // ——— Insertion en base ———
  const { data, error } = await supabase
      .from("tasks")
      .insert({
              user_id:     user.id,
              agent_id:    agentId,
              type,
              platform,
              title,
              description: description ?? null,
              metadata:    metadata    ?? {},
              status:      "pending",
      })
      .select()
      .single();

  if (error) {
        console.error("[POST /api/tasks] Erreur Supabase :", error.message);
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: error.message },
          { status: 500 }
              );
  }

  const task: Task = {
        id:          data.id,
        agentId:     data.agent_id  as AgentId,
        type:        data.type,
        status:      data.status    as TaskStatus,
        platform:    data.platform,
        title:       data.title,
        description: data.description ?? undefined,
        scheduledAt: data.scheduled_at ?? undefined,
        executedAt:  data.executed_at  ?? undefined,
        error:       data.error        ?? undefined,
        metadata:    data.metadata     ?? {},
        createdAt:   data.created_at,
        updatedAt:   data.updated_at,
  };

  return NextResponse.json<ApiResponse<Task>>(
    { success: true, data: task },
    { status: 201 }
      );
}
