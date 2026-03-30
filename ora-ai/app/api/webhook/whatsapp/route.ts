import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { askHina } from "@/lib/hina";

const MessagingResponse = twilio.twiml.MessagingResponse;

// Mémoire de conversation courte (en production, utiliser une base de données)
// Clé = numéro de téléphone, valeur = tableau de messages
const conversationMemory = new Map<
  string,
  { role: "user" | "assistant"; content: string }[]
>();

const MAX_HISTORY = 6; // 3 échanges max en mémoire

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const from = formData.get("From") as string; // ex: whatsapp:+68987654321
    const body = formData.get("Body") as string; // Message du client

    if (!from || !body) {
      return new NextResponse("Paramètres manquants", { status: 400 });
    }

    // Récupérer l'historique de cette conversation
    const history = conversationMemory.get(from) || [];

    // Appel à l'agent Hina
    const hinaResponse = await askHina(body.trim(), history);

    // Mettre à jour l'historique
    const updatedHistory = [
      ...history,
      { role: "user" as const, content: body.trim() },
      { role: "assistant" as const, content: hinaResponse.message },
    ];

    // Garder seulement les derniers échanges
    conversationMemory.set(
      from,
      updatedHistory.slice(-MAX_HISTORY)
    );

    // Répondre via Twilio TwiML
    const twiml = new MessagingResponse();
    twiml.message(hinaResponse.message);

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Erreur webhook WhatsApp:", error);

    // En cas d'erreur, répondre au client
    const twiml = new MessagingResponse();
    twiml.message(
      "Désolé, je rencontre une difficulté technique. Veuillez réessayer dans quelques instants ou nous appeler directement. Māuruuru 🙏"
    );

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
