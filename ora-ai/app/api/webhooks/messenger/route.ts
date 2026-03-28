// ============================================================
// Webhook Messenger (Facebook) → Hina
//
// GET  /api/webhooks/messenger — vérification Meta (challenge)
// POST /api/webhooks/messenger — messages entrants → Hina
//
// Configuration Meta :
//   Webhook URL    : https://votre-domaine.com/api/webhooks/messenger
//   Verify token   : MESSENGER_VERIFY_TOKEN (variable .env)
//   Subscriptions  : messages, messaging_postbacks
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import {
  generateReply,
  sendMessenger,
  shouldEscalate,
  buildHinaTask,
} from "@/lib/services/hina.service";
import type { IncomingMessage } from "@/lib/services/hina.service";
import { createHmac, timingSafeEqual } from "crypto";

// ------------------------------------------------------------
// GET — Vérification du webhook par Meta
// ------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.MESSENGER_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Webhook Messenger] Vérification réussie ✅");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[Webhook Messenger] Vérification échouée — token invalide");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ------------------------------------------------------------
// POST — Réception des messages entrants
// ------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Vérification de la signature X-Hub-Signature-256 (sécurité Meta)
  const signature = req.headers.get("x-hub-signature-256");
  const rawBody = await req.text();

  if (!verifySignature(rawBody, signature)) {
    console.warn("[Webhook Messenger] Signature invalide — requête rejetée");
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  let body: MessengerWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  if (body.object !== "page") {
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  // Traitement de chaque entrée
  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      // Ignorer les messages envoyés par la page elle-même (echo)
      if (event.message?.is_echo) continue;

      // Ignorer les postbacks (boutons) pour l'instant
      if (event.postback) {
        console.log("[Webhook Messenger] Postback ignoré :", event.postback.payload);
        continue;
      }

      if (!event.message?.text) continue;

      const psid = event.sender.id;  // Page-Scoped ID du client
      const messageText = event.message.text;
      const timestamp = event.timestamp;

      console.log("[Webhook Messenger] Message entrant de PSID", psid, ":", messageText.substring(0, 60));

      // Contexte de conversation
      const ctx = {
        userId: "system", // TODO: retrouver le userId via le PSID
        from: psid,
        history: [],      // TODO: charger l'historique depuis la DB
        sector: "Commerce",
        entreprise: "Votre entreprise",
        langue: "fr-pf" as const,
      };

      // Escalade si nécessaire
      if (shouldEscalate(messageText)) {
        await sendMessenger({
          to: psid,
          body: "Ia ora na ! Je vous passe un de nos conseillers. Merci de patienter quelques instants. 🙏",
          platform: "messenger",
        });
        continue;
      }

      // Générer la réponse IA
      const replyResult = await generateReply(ctx, messageText);
      if (!replyResult.success) {
        console.error("[Webhook Messenger] Erreur génération réponse :", replyResult.error);
        continue;
      }

      // Envoyer la réponse
      await sendMessenger({
        to: psid,
        body: replyResult.data,
        platform: "messenger",
        replyToId: event.message.mid,
      });

      // Créer et enregistrer la tâche
      const incomingMsg: IncomingMessage = {
        platform: "messenger",
        from: psid,
        body: messageText,
        receivedAt: new Date(timestamp).toISOString(),
        messageId: event.message.mid,
      };

      const task = buildHinaTask(incomingMsg, replyResult.data);
      // TODO: await db.task.create({ data: { ...task, id: generateId(), userId: ctx.userId } });
      console.log("[Webhook Messenger] Tâche créée :", task.title);
    }
  }

  // Meta attend toujours un 200 OK
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// ------------------------------------------------------------
// Vérification de la signature HMAC-SHA256
// ------------------------------------------------------------

function verifySignature(rawBody: string, signature: string | null): boolean {
  const appSecret = process.env.MESSENGER_APP_SECRET;
  if (!appSecret || !signature) return false;

  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ------------------------------------------------------------
// Types du payload Messenger
// ------------------------------------------------------------

interface MessengerWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    messaging: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        is_echo?: boolean;
        attachments?: Array<{ type: string; payload: Record<string, unknown> }>;
      };
      postback?: {
        title: string;
        payload: string;
        referral?: { ref: string; source: string; type: string };
      };
      read?: { watermark: number };
      delivery?: { watermark: number; mids: string[] };
    }>;
  }>;
}
