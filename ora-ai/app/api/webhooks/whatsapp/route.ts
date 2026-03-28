// ============================================================
// Webhook WhatsApp Cloud API → Hina
//
// GET  /api/webhooks/whatsapp — vérification Meta (challenge)
// POST /api/webhooks/whatsapp — messages entrants → Hina
//
// Configuration Meta :
//   Webhook URL    : https://votre-domaine.com/api/webhooks/whatsapp
//   Verify token   : WHATSAPP_VERIFY_TOKEN (variable .env)
//   Subscriptions  : messages, message_deliveries
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import {
  generateReply,
  sendWhatsApp,
  shouldEscalate,
  buildHinaTask,
} from "@/lib/services/hina.service";
import type { IncomingMessage } from "@/lib/services/hina.service";

// ------------------------------------------------------------
// GET — Vérification du webhook par Meta
// ------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Vérification du token (doit correspondre à WHATSAPP_VERIFY_TOKEN dans .env)
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Webhook WhatsApp] Vérification réussie ✅");
    // Meta attend la valeur du challenge en texte brut
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[Webhook WhatsApp] Vérification échouée — token invalide");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ------------------------------------------------------------
// POST — Réception des messages entrants
// ------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: WhatsAppWebhookPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  // Vérification que c'est bien un événement WhatsApp Business
  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  // Traitement de chaque entrée (Meta peut en envoyer plusieurs à la fois)
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages?.length) continue;

      for (const msg of value.messages) {
        // Ignorer les messages non-texte (images, audio, etc.) pour l'instant
        if (msg.type !== "text") {
          console.log("[Webhook WhatsApp] Message non-texte ignoré :", msg.type);
          continue;
        }

        const from = msg.from; // numéro de téléphone E.164
        const messageText = msg.text?.body ?? "";
        const contactName = value.contacts?.find((c) => c.wa_id === from)?.profile?.name;

        console.log("[Webhook WhatsApp] Message entrant de", from, ":", messageText.substring(0, 60));

        // Construire le contexte de conversation
        const ctx = {
          userId: "system", // TODO: retrouver le userId via le numéro de téléphone
          from,
          history: [],      // TODO: charger l'historique depuis la DB
          sector: "Commerce",
          entreprise: "Votre entreprise",
          langue: "fr-pf" as const,
        };

        // Escalade vers humain si besoin
        if (shouldEscalate(messageText)) {
          const escaladeMsg = {
            to: from,
            body: "Ia ora na ! Je vous passe un de nos conseillers qui pourra mieux vous aider. Merci de patienter quelques instants. 🙏",
            platform: "whatsapp" as const,
          };
          await sendWhatsApp(escaladeMsg);

          // TODO: notifier le numéro d'escalade
          // await sendWhatsApp({ to: hinaConfig.escaladePhone, body: "Escalade client : " + from });
          continue;
        }

        // Générer et envoyer la réponse IA
        const replyResult = await generateReply(ctx, messageText);
        if (!replyResult.success) {
          console.error("[Webhook WhatsApp] Erreur génération réponse :", replyResult.error);
          continue;
        }

        const outgoing = {
          to: from,
          body: replyResult.data,
          platform: "whatsapp" as const,
        };
        await sendWhatsApp(outgoing);

        // Construire et enregistrer la tâche
        const incomingMsg: IncomingMessage = {
          platform: "whatsapp",
          from,
          fromName: contactName,
          body: messageText,
          receivedAt: new Date(parseInt(msg.timestamp) * 1000).toISOString(),
          messageId: msg.id,
        };

        const task = buildHinaTask(incomingMsg, replyResult.data);
        // TODO: await db.task.create({ data: { ...task, id: generateId(), userId: ctx.userId } });
        console.log("[Webhook WhatsApp] Tâche créée :", task.title);
      }
    }
  }

  // Meta attend toujours un 200 OK, sinon il retente
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// ------------------------------------------------------------
// Types du payload WhatsApp Cloud API
// ------------------------------------------------------------

interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: string;
          text?: { body: string };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}
