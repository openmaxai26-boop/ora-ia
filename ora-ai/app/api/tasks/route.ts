// ============================================================
// GET  /api/tasks       — liste les tâches d'un utilisateur
// POST /api/tasks       — crée une nouvelle tâche
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import type { Task, AgentId, TaskStatus, ApiResponse } from "@/lib/types";

// ------------------------------------------------------------
// Données mock (remplacer par la vraie DB)
// ------------------------------------------------------------

// TODO: remplacer par Prisma / Supabase / Drizzle
// import { db } from "@/lib/db";

const MOCK_TASKS: Task[] = [
  {
    id: "task_001",
    agentId: "teva",
    type: "social_post",
    status: "success",
    platform: "instagram",
    title: "Publication Instagram — Ia ora na Tahiti 🌺",
    executedAt: new Date(Date.now() - 3_600_000).toISOString(),
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    metadata: { caption: "Ia ora na Tahiti 🌺", hashtags: ["#Polynésie", "#Fenua"] },
  },
  {
    id: "task_002",
    agentId: "hina",
    type: "customer_reply",
    status: "success",
    platform: "whatsapp",
    title: "Réponse WhatsApp à +689 87 12 34 56",
    executedAt: new Date(Date.now() - 7_200_000).toISOString(),
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
    metadata: { from: "+689 87 12 34 56", inbound: "Quels sont vos horaires ?", outbound: "Bonjour ! Nous sommes ouverts…" },
  },
  {
    id: "task_003",
    agentId: "reva",
    type: "seo_article",
    status: "success",
    platform: "wordpress",
    title: "Article SEO : artisanat Tahiti guide complet 2026",
    executedAt: new Date(Date.now() - 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    metadata: { slug: "artisanat-tahiti-guide-2026", wordCount: 1200 },
  },
  {
    id: "task_004",
    agentId: "manu",
    type: "job_post",
    status: "pending",
    platform: "linkedin",
    title: "Offre publiée : Responsable boutique — Papeete",
    scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
    createdAt: new Date().toISOString(),
    metadata: { jobTitle: "Responsable boutique", location: "Papeete" },
  },
  {
    id: "task_005",
    agentId: "ari",
    type: "prospect_message",
    status: "success",
    platform: "linkedin",
    title: "1er contact : Marie Teriitahi (Fare Natura)",
    executedAt: new Date(Date.now() - 1_800_000).toISOString(),
    createdAt: new Date(Date.now() - 1_800_000).toISOString(),
    metadata: { prospectName: "Marie Teriitahi", company: "Fare Natura" },
  },
];

// ------------------------------------------------------------
// GET /api/tasks
// ------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");
  const agentId = searchParams.get("agentId") as AgentId | null;
  const status = searchParams.get("status") as TaskStatus | null;
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "userId requis" } satisfies ApiResponse<never>,
      { status: 400 }
    );
  }

  // TODO: remplacer par requête réelle en DB
  // const tasks = await db.task.findMany({
  //   where: {
  //     userId,
  //     ...(agentId ? { agentId } : {}),
  //     ...(status ? { status } : {}),
  //   },
  //   orderBy: { createdAt: "desc" },
  //   take: limit,
  //   skip: offset,
  // });
  // const total = await db.task.count({ where: { userId, ... } });

  let tasks = MOCK_TASKS;
  if (agentId) tasks = tasks.filter((t) => t.agentId === agentId);
  if (status) tasks = tasks.filter((t) => t.status === status);

  const paginated = tasks.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    data: {
      tasks: paginated,
      total: tasks.length,
      limit,
      offset,
    },
  } satisfies ApiResponse<{ tasks: Task[]; total: number; limit: number; offset: number }>);
}

// ------------------------------------------------------------
// POST /api/tasks
// ------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: Omit<Task, "id"> & { userId: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Body JSON invalide" } satisfies ApiResponse<never>,
      { status: 400 }
    );
  }

  // Validation minimale
  if (!body.userId || !body.agentId || !body.type || !body.status) {
    return NextResponse.json(
      { success: false, error: "userId, agentId, type et status sont requis" } satisfies ApiResponse<never>,
      { status: 400 }
    );
  }

  // TODO: vérifier l'authentification
  // const session = await getServerSession(authOptions);
  // if (!session || session.user.id !== body.userId) {
  //   return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  // }

  const newTask: Task = {
    id: "task_" + Date.now(),
    agentId: body.agentId,
    type: body.type,
    status: body.status,
    platform: body.platform,
    title: body.title,
    description: body.description,
    scheduledAt: body.scheduledAt,
    executedAt: body.executedAt,
    createdAt: new Date().toISOString(),
    error: body.error,
    metadata: body.metadata,
  };

  // TODO: persistance réelle
  // const saved = await db.task.create({ data: { ...newTask, userId: body.userId } });

  return NextResponse.json(
    { success: true, data: newTask } satisfies ApiResponse<Task>,
    { status: 201 }
  );
}
