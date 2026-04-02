// ============================================================
// POST /api/agents/[id]/run
// Déclenche l'exécution d'un agent IA pour un utilisateur.
// Chaque agent a sa propre logique métier dans lib/services/.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import type { AgentId, ApiResponse } from "@/lib/types";
import { AGENTS_MAP } from "@/lib/config/agents";

// Import des services agents
import { generatePost, publishToFacebook, publishToInstagram, buildTevaTask } from "@/lib/services/teva.service";
import { generateReply, bookAppointment, buildHinaTask } from "@/lib/services/hina.service";
import { generateArticle, publishToWordPress, publishToWix, buildRevaTask } from "@/lib/services/reva.service";
import { generateJobOffer, publishToLinkedIn, buildManuTask } from "@/lib/services/manu.service";
import { searchProspects, generateProspectMessage, sendLinkedInMessage, buildAriTask } from "@/lib/services/ari.service";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface RunAgentBody {
  userId: string;
  // Paramètres spécifiques à chaque agent (tous optionnels)
  topic?: string;           // Teva : sujet du post
  message?: string;         // Hina : message entrant
  from?: string;            // Hina : expéditeur
  platform?: string;        // Hina/Teva : plateforme cible
  keyword?: string;         // Reva : mot-clé SEO
  jobTitle?: string;        // Manu : titre du poste
  skills?: string[];        // Manu : compétences requises
  targetSector?: string;    // Ari : secteur à prospecter
  targetLocation?: string;  // Ari : lieu à cibler
}

// ------------------------------------------------------------
// POST handler
// ------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const agentId = params.id as AgentId;

  // Validation de l'agent
  const agent = AGENTS_MAP[agentId];
  if (!agent) {
    return NextResponse.json(
      { success: false, error: "Agent introuvable : " + agentId } satisfies ApiResponse<never>,
      { status: 404 }
    );
  }

  // Parse du body
  let body: RunAgentBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Body JSON invalide" } satisfies ApiResponse<never>,
      { status: 400 }
    );
  }

  if (!body.userId) {
    return NextResponse.json(
      { success: false, error: "userId requis" } satisfies ApiResponse<never>,
      { status: 400 }
    );
  }

  // TODO: vérifier l'authentification de l'utilisateur
  // const session = await getServerSession(authOptions);
  // if (!session || session.user.id !== body.userId) {
  //   return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  // }

  // TODO: vérifier que le plan de l'utilisateur permet cet agent
  // const user = await db.user.findUnique({ where: { id: body.userId } });
  // if (!canUseAgent(user.plan, agentId)) {
  //   return NextResponse.json({ success: false, error: "Plan insuffisant" }, { status: 403 });
  // }

  try {
    switch (agentId) {
      // ----------------------------------------------------------
      // TEVA — Publication réseaux sociaux
      // ----------------------------------------------------------
      case "teva": {
        const config = {
          userId: body.userId,
          tone: "professionnel" as const,
          language: "fr-pf" as const,
          sector: "Commerce",
          postFrequency: 5,
          platforms: ["instagram", "facebook"] as ("facebook" | "instagram" | "tiktok")[],
        };

        const postResult = await generatePost(config, body.topic);
        if (!postResult.success) {
          return NextResponse.json(postResult, { status: 500 });
        }

        // Publication sur la/les plateforme(s) demandée(s)
        const publishResult = body.platform === "facebook"
          ? await publishToFacebook(postResult.data, "mock_page_id")
          : await publishToInstagram(postResult.data, "mock_ig_id");

        if (!publishResult.success) {
          return NextResponse.json(publishResult, { status: 500 });
        }

        const task = buildTevaTask(postResult.data, body.userId);
        // TODO: await db.task.create({ data: { ...task, id: generateId() } });

        return NextResponse.json({
          success: true,
          data: { post: postResult.data, publish: publishResult.data, task },
        });
      }

      // ----------------------------------------------------------
      // HINA — Service client WhatsApp / Messenger
      // ----------------------------------------------------------
      case "hina": {
        if (!body.message || !body.from) {
          return NextResponse.json(
            { success: false, error: "message et from requis pour Hina" } satisfies ApiResponse<never>,
            { status: 400 }
          );
        }

        const ctx = {
          userId: body.userId,
          from: body.from,
          history: [],
          sector: "Commerce",
          entreprise: "Ora AI",
          langue: "fr-pf" as const,
        };

        const replyResult = await generateReply(ctx, body.message);
        if (!replyResult.success) {
          return NextResponse.json(replyResult, { status: 500 });
        }

        const incomingMsg = {
          platform: (body.platform ?? "whatsapp") as "whatsapp" | "messenger",
          from: body.from,
          body: body.message,
          receivedAt: new Date().toISOString(),
          messageId: "in_" + Date.now(),
        };

        const task = buildHinaTask(incomingMsg, replyResult.data);
        // TODO: await db.task.create({ data: { ...task, id: generateId() } });

        return NextResponse.json({
          success: true,
          data: { reply: replyResult.data, task },
        } satisfies ApiResponse<{ reply: string; task: typeof task }>);
      }

      // ----------------------------------------------------------
      // REVA — SEO & articles de blog
      // ----------------------------------------------------------
      case "reva": {
        const config = {
          userId: body.userId,
          entreprise: "Ora AI",
          sector: "Commerce",
          language: "fr-pf" as const,
          targetLocation: body.targetLocation ?? "Tahiti",
          articlesPerMonth: 30,
          platform: "wordpress" as const,
        };

        const keyword = {
          keyword: body.keyword ?? "commerce Tahiti",
          intent: "informational" as const,
        };

        const articleResult = await generateArticle(config, keyword);
        if (!articleResult.success) {
          return NextResponse.json(articleResult, { status: 500 });
        }

        const publishResult = await publishToWordPress(articleResult.data, config);
        if (!publishResult.success) {
          return NextResponse.json(publishResult, { status: 500 });
        }

        const task = buildRevaTask(articleResult.data, publishResult.data, body.userId);
        // TODO: await db.task.create({ data: { ...task, id: generateId() } });

        return NextResponse.json({
          success: true,
          data: { article: articleResult.data, publish: publishResult.data, task },
        });
      }

      // ----------------------------------------------------------
      // MANU — Recrutement
      // ----------------------------------------------------------
      case "manu": {
        if (!body.jobTitle) {
          return NextResponse.json(
            { success: false, error: "jobTitle requis pour Manu" } satisfies ApiResponse<never>,
            { status: 400 }
          );
        }

        const config = {
          userId: body.userId,
          entreprise: "Ora AI",
          sector: "Commerce",
          location: body.targetLocation ?? "Tahiti",
        };

        const offerResult = await generateJobOffer(
          config,
          body.jobTitle,
          body.skills ?? [],
          "CDI"
        );
        if (!offerResult.success) {
          return NextResponse.json(offerResult, { status: 500 });
        }

        const publishResult = await publishToLinkedIn(
          offerResult.data,
          "mock_org_id"
        );

        const task = buildManuTask(offerResult.data, "job_post", body.userId, "linkedin");
        // TODO: await db.task.create({ data: { ...task, id: generateId() } });

        const jobOffer = {
          ...offerResult.data,
          requirements: offerResult.data.skills.length > 0
            ? offerResult.data.skills
            : ["Expérience dans le domaine", "Bonne communication", "Esprit d'équipe"],
          benefits: [
            "Environnement de travail agréable au fenua",
            "Salaire selon profil et expérience",
            "Formation et montée en compétences",
            "Équipe dynamique et bienveillante",
          ],
        };
        return NextResponse.json({
          success: true,
          data: { jobOffer, publish: publishResult, task },
        });
      }

      // ----------------------------------------------------------
      // ARI — Prospection
      // ----------------------------------------------------------
      case "ari": {
        const config = {
          userId: body.userId,
          entreprise: "Ora AI",
          sector: "Commerce",
          targetSectors: [body.targetSector ?? "Commerce"],
          targetLocations: [body.targetLocation ?? "Tahiti"],
          tone: "chaleureux" as const,
          language: "fr-pf" as const,
          maxProspectsPerDay: 20,
          followUpDelayDays: 3,
          maxFollowUps: 2,
        };

        const filters = {
          sectors: config.targetSectors,
          locations: config.targetLocations,
          platform: "linkedin" as const,
        };

        const prospectsResult = await searchProspects(config, filters, 5);
        if (!prospectsResult.success) {
          return NextResponse.json(prospectsResult, { status: 500 });
        }

        // Envoi du premier message à chaque prospect trouvé
        const results = await Promise.all(
          prospectsResult.data.map(async (prospect) => {
            const msgResult = await generateProspectMessage(config, prospect);
            if (!msgResult.success) return null;

            await sendLinkedInMessage(msgResult.data, prospect);
            const task = buildAriTask(prospect, "prospect_message", body.userId);
            // TODO: await db.task.create({ data: { ...task, id: generateId() } });
            return { prospect, message: msgResult.data, task };
          })
        );

        const validResults = results.filter(Boolean) as { prospect: typeof prospectsResult.data[0]; message: string; task: ReturnType<typeof buildAriTask> }[];
        return NextResponse.json({
          success: true,
          data: {
            prospectsFound: prospectsResult.data.length,
            messagesSent: validResults.length,
            prospects: prospectsResult.data,
            messages: validResults.map((r) => ({ prospect: r.prospect, message: r.message })),
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Agent non implémenté : " + agentId } satisfies ApiResponse<never>,
          { status: 501 }
        );
    }
  } catch (error) {
    console.error("[/api/agents/" + agentId + "/run]", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------
// GET handler — statut de l'agent
// ------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const agentId = params.id as AgentId;
  const agent = AGENTS_MAP[agentId];

  if (!agent) {
    return NextResponse.json(
      { success: false, error: "Agent introuvable : " + agentId } satisfies ApiResponse<never>,
      { status: 404 }
    );
  }

  // TODO: récupérer le vrai statut depuis la DB
  // const stats = await db.agentStats.findFirst({ where: { agentId }, orderBy: { createdAt: "desc" } });

  return NextResponse.json({
    success: true,
    data: {
      agent,
      status: "active",
      lastRunAt: null,
      tasksToday: 0,
    },
  } satisfies ApiResponse<{ agent: typeof agent; status: string; lastRunAt: null; tasksToday: number }>);
}
