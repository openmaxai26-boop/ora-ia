import { NextRequest, NextResponse } from "next/server";
import { askHina } from "@/lib/hina";

// Mémoire de conversation courte (en production, utiliser une base de données)
const conversationMemory = new Map<
  string,
  { role: "user" | "assistant"; content: string }[]
>();

const MAX_HISTORY = 6;

// ─────────────────────────────────────────────────────────
// GET — Vérification du webhook par Meta (étape obligatoire)
// ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ Webhook WhatsApp vérifié par Meta");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("❌ Token de vérification invalide");
  return new NextResponse("Forbidden", { status: 403 });
}

// ─────────────────────────────────────────────────────────
// POST — Réception des messages WhatsApp entrants
// ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Extraire le message de la structure JSON de Meta
    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    const phoneNumberId = change?.value?.metadata?.phone_number_id;

    // Ignorer les non-messages (statuts de livraison, etc.)
    if (!message || message.type !== "text") {
      return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    const from = message.from; // Numéro du client (format: 68987654321)
    const userText = message.text.body;

    // Récupérer l'historique de cette conversation
    const history = conversationMemory.get(from) || [];

    // Appel à l'agent Hina
    const hinaResponse = await askHina(userText.trim(), history);

    // Mettre à jour l'historique
    const updatedHistory = [
      ...history,
      { role: "user" as const, content: userText.trim() },
      { role: "assistant" as const, content: hinaResponse.message },
    ];
    conversationMemory.set(from, updatedHistory.slice(-MAX_HISTORY));

    // Envoyer la réponse via l'API Graph de Meta (GRATUIT)
    const metaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: hinaResponse.message },
        }),
      }
    );

    if (!metaResponse.ok) {
      const err = await metaResponse.text();
      console.error("Erreur envoi Meta:", err);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Erreur webhook WhatsApp Meta:", error);
    // Meta attend toujours un 200 même en cas d'erreur interne
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
