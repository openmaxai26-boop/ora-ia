// ============================================================
// HINA — Service Client
// Gère les conversations entrantes WhatsApp & Messenger,
// les réponses IA et la prise de rendez-vous
// ============================================================

import type { Task, ApiResponse } from "@/lib/types";

// ------------------------------------------------------------
// Types locaux
// ------------------------------------------------------------

export interface IncomingMessage {
    platform: "whatsapp" | "messenger";
    from: string;          // numéro de téléphone ou PSID Facebook
  fromName?: string;
    body: string;
    receivedAt: string;
    messageId: string;
}

export interface OutgoingMessage {
    to: string;
    body: string;
    platform: "whatsapp" | "messenger";
    replyToId?: string;
}

export interface ConversationContext {
    userId: string;        // id interne du compte Ora AI
  from: string;
    history: { role: "user" | "assistant"; content: string }[];
    sector: string;
    entreprise: string;
    langue: "fr" | "fr-pf";
}

export interface Appointment {
    clientName: string;
    clientPhone?: string;
    date: string;          // ISO 8601
  reason: string;
    confirmedAt: string;
}

export interface HinaConfig {
    userId: string;
    entreprise: string;
    sector: string;
    langue: "fr" | "fr-pf";
    escaladePhone?: string;  // n° WhatsApp humain pour escalade
  greetingMessage?: string;
}

// ------------------------------------------------------------
// Génération de réponse IA
// ------------------------------------------------------------

/**
 * Génère une réponse contextuelle au message client.
 * Utilise l'historique de conversation pour la cohérence.
 * À connecter à Claude API ou OpenAI.
 */
export async function generateReply(
    ctx: ConversationContext,
    message: string
  ): Promise<ApiResponse<string>> {
    // TODO: appel réel à l'API IA
  // const response = await anthropic.messages.create({
  //   model: "claude-3-5-haiku-20241022",
  //   system: buildSystemPrompt(ctx),
  //   messages: [...ctx.history, { role: "user", content: message }],
  // });

  // Détection d'intention simple (sera remplacée par NLU)
  const lower = message.toLowerCase();

  if (lower.includes("heure") || lower.includes("ouvert") || lower.includes("horaire")) {
        return {
                success: true,
                data: `Ia ora na 🌺 Nous sommes ouverts du lundi au vendredi de 8h à 17h et le samedi de 8h à 12h. Puis-je vous aider pour autre chose ?`,
        };
  }

  if (lower.includes("rendez-vous") || lower.includes("réservation") || lower.includes("rdv")) {
        return {
                success: true,
                data: `Avec plaisir ! Pour prendre un rendez-vous, pouvez-vous me donner votre disponibilité et le motif de votre visite ? 📅`,
        };
  }

  if (lower.includes("prix") || lower.includes("tarif") || lower.includes("coût")) {
        return {
                success: true,
                data: `Bonjour ! Nos tarifs dépendent de vos besoins. Je vous invite à consulter notre page ou à nous contacter directement pour un devis personnalisé. 😊`,
        };
  }

  return {
        success: true,
        data: `Ia ora na ! Merci pour votre message. Notre équipe de ${ctx.entreprise} vous répondra dans les plus brefs délais. En attendant, puis-je vous aider ? 🌸`,
  };
}

// ------------------------------------------------------------
// Envoi de message (WhatsApp Cloud API / Messenger API)
// ------------------------------------------------------------

/**
 * Envoie un message via WhatsApp Cloud API.
 * Nécessite : WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN
 */
export async function sendWhatsApp(
    msg: OutgoingMessage
  ): Promise<ApiResponse<{ messageId: string }>> {
    // TODO: appel réel
  // await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${accessToken}` },
  //   body: JSON.stringify({ messaging_product: "whatsapp", to: msg.to, text: { body: msg.body } }),
  // });
  console.log(`[Hina] WhatsApp → ${msg.to}: ${msg.body.substring(0, 40)}`);
    return { success: true, data: { messageId: `wa_${Date.now()}` } };
}

/**
 * Envoie un message via Messenger API.
 * Nécessite : MESSENGER_PAGE_ACCESS_TOKEN
 */
export async function sendMessenger(
    msg: OutgoingMessage
  ): Promise<ApiResponse<{ messageId: string }>> {
    // TODO: appel réel
  // await fetch("https://graph.facebook.com/v19.0/me/messages", {...});
  console.log(`[Hina] Messenger → ${msg.to}: ${msg.body.substring(0, 40)}`);
    return { success: true, data: { messageId: `ms_${Date.now()}` } };
}

// ------------------------------------------------------------
// Prise de rendez-vous
// ------------------------------------------------------------

export async function bookAppointment(
    appt: Appointment,
    calendarId?: string
  ): Promise<ApiResponse<{ eventId: string }>> {
    // TODO: Google Calendar API
  // await calendar.events.insert({ calendarId, resource: {...} });
  console.log(`[Hina] RDV créé : ${appt.clientName} le ${appt.date}`);
    return { success: true, data: { eventId: `evt_${Date.now()}` } };
}

// ------------------------------------------------------------
// Escalade vers humain
// ------------------------------------------------------------

export function shouldEscalate(message: string): boolean {
    const escalateKeywords = [
          "plainte", "réclamation", "remboursement", "problème grave",
          "urgent", "urgence", "parler à quelqu'un", "responsable",
        ];
    return escaladeKeywords.some((kw) =>
          message.toLowerCase().includes(kw)
                                   );
}

// Helper spelling fix
const escaladeKeywords = [
    "plainte", "réclamation", "remboursement", "problème grave",
    "urgent", "urgence", "parler à quelqu'un", "responsable",
  ];

// ------------------------------------------------------------
// Builder de tâche
// ------------------------------------------------------------

export function buildHinaTask(
    msg: IncomingMessage,
    reply: string
  ): Omit<Task, "id"> {
    return {
          agentId: "hina",
          type: "customer_reply",
          status: "success",
          platform: msg.platform,
          title: `Réponse ${msg.platform} à ${msg.fromName ?? msg.from}`,
          executedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          metadata: { from: msg.from, inbound: msg.body, outbound: reply },
    };
}
