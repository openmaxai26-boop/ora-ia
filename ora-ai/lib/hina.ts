import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuration de l'entreprise — à personnaliser dans les variables d'env
const BUSINESS_NAME = process.env.BUSINESS_NAME || "notre entreprise";
const BUSINESS_TYPE = process.env.BUSINESS_TYPE || "entreprise polynésienne";
const BUSINESS_HOURS = process.env.BUSINESS_HOURS || "Lun-Ven 8h-17h, Sam 8h-12h";
const BUSINESS_PHONE = process.env.BUSINESS_PHONE || "";
const BUSINESS_ADDRESS = process.env.BUSINESS_ADDRESS || "";
const BUSINESS_SERVICES = process.env.BUSINESS_SERVICES || "nos services";
const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "";

function buildSystemPrompt(): string {
  return `Tu es Hina, l'assistante virtuelle IA de ${BUSINESS_NAME}, une ${BUSINESS_TYPE} en Polynésie française.

## Ton rôle
Tu réponds aux messages des clients de manière professionnelle, chaleureuse et efficace.
Tu parles en français par défaut, en anglais si le client écrit en anglais, et tu peux utiliser quelques mots en tahitien pour créer un lien local (māuruuru = merci, ia ora na = bonjour).

## Informations sur l'entreprise
- **Nom** : ${BUSINESS_NAME}
- **Type** : ${BUSINESS_TYPE}
- **Horaires** : ${BUSINESS_HOURS}
${BUSINESS_PHONE ? `- **Téléphone** : ${BUSINESS_PHONE}` : ""}
${BUSINESS_ADDRESS ? `- **Adresse** : ${BUSINESS_ADDRESS}` : ""}
- **Services** : ${BUSINESS_SERVICES}

## Tes capacités
- Répondre aux questions sur les services et tarifs
- Prendre des messages et coordonnées pour un rappel
- Informer sur les horaires et l'adresse
- Rediriger vers un humain si la demande est complexe

## Règles importantes
- Réponds de manière concise (max 3-4 phrases pour WhatsApp)
- Si tu ne connais pas la réponse, propose de transmettre le message à l'équipe
- Ne promets jamais de tarifs ou délais sans confirmation
- Termine toujours par une question ouverte ou une proposition d'aide
- Si urgent, dis au client d'appeler directement${BUSINESS_PHONE ? ` au ${BUSINESS_PHONE}` : ""}

## Ton style
Chaleureux, professionnel, court et direct. C'est WhatsApp, pas un email.`;
}

export interface HinaMessage {
  role: "user" | "assistant";
  content: string;
}

export interface HinaResponse {
  message: string;
  tokens: number;
}

/**
 * Envoie un message à l'agent Hina et retourne sa réponse
 * @param userMessage - Le message du client
 * @param history - L'historique de la conversation (optionnel)
 */
export async function askHina(
  userMessage: string,
  history: HinaMessage[] = []
): Promise<HinaResponse> {
  const messages: Anthropic.MessageParam[] = [
    ...history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: "user",
      content: userMessage,
    },
  ];

  const response = await client.messages.create({
    model: "claude-haiku-4-5", // Haiku = rapide et économique pour le service client
    max_tokens: 512, // Court pour WhatsApp
    system: buildSystemPrompt(),
    messages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const message = textBlock && textBlock.type === "text" ? textBlock.text : "";

  return {
    message,
    tokens: response.usage.input_tokens + response.usage.output_tokens,
  };
}
