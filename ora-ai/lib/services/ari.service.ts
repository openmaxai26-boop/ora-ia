// ============================================================
// ARI — Service Prospection
// Identifie des prospects sur LinkedIn & Instagram,
// envoie des messages personnalisés et gère les séquences
// de relance automatiques pour développer la clientèle
// ============================================================

import type { Task, ApiResponse } from "@/lib/types";

// ------------------------------------------------------------
// Types locaux
// ------------------------------------------------------------

export interface Prospect {
  id: string;
  name: string;
  company?: string;
  role?: string;
  sector?: string;
  location?: string;
  linkedinUrl?: string;
  instagramHandle?: string;
  email?: string;
  phone?: string;
  source: "linkedin" | "instagram";
  foundAt: string;
  tags?: string[];
}

export type ProspectStatus =
  | "identified"   // trouvé, pas encore contacté
  | "contacted"    // 1er message envoyé
  | "replied"      // a répondu
  | "hot"          // intéressé, à suivre
  | "converted"    // devenu client
  | "unresponsive" // aucune réponse après relances
  | "not_interested";

export interface ProspectContact {
  prospectId: string;
  status: ProspectStatus;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  notes?: string;
  messages: ProspectMessage[];
}

export interface ProspectMessage {
  id: string;
  prospectId: string;
  platform: "linkedin" | "instagram";
  content: string;
  sentAt: string;
  isFollowUp: boolean;
  followUpNumber?: number; // 1, 2, 3…
}

export interface AriConfig {
  userId: string;
  entreprise: string;
  sector: string;
  targetSectors: string[];     // secteurs à cibler
  targetLocations: string[];   // ex: ["Tahiti", "Moorea", "Bora-Bora"]
  tone: "professionnel" | "chaleureux" | "direct";
  language: "fr" | "fr-pf";
  maxProspectsPerDay: number;  // limite pour éviter les bannissements
  followUpDelayDays: number;   // délai entre relances (ex: 3)
  maxFollowUps: number;        // nb max de relances (ex: 3)
  linkedinAccessToken?: string;
  notionDatabaseId?: string;   // CRM Notion pour stocker les leads
}

export interface SearchFilters {
  sectors?: string[];
  locations?: string[];
  roles?: string[];
  companySize?: "1-10" | "11-50" | "51-200" | "201+";
  platform: "linkedin" | "instagram";
}

// ------------------------------------------------------------
// Recherche de prospects (LinkedIn Sales Navigator / Instagram)
// ------------------------------------------------------------

/**
 * Recherche des prospects selon les filtres définis.
 * LinkedIn : LinkedIn API / Sales Navigator
 * Instagram : scraping responsable via Apify ou Phantombuster
 */
export async function searchProspects(
  config: AriConfig,
  filters: SearchFilters,
  limit = 20
): Promise<ApiResponse<Prospect[]>> {
  // TODO: appel réel à LinkedIn API ou Apify
  // LinkedIn:
  // const res = await fetch("https://api.linkedin.com/v2/people?...", {
  //   headers: { Authorization: "Bearer " + config.linkedinAccessToken },
  // });
  // Instagram:
  // const apifyClient = new ApifyClient({ token: process.env.APIFY_TOKEN });
  // const run = await apifyClient.actor("apify/instagram-profile-scraper").call({...});

  const mockProspects: Prospect[] = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
    id: "prospect_" + Date.now() + "_" + i,
    name: ["Marie Teriitahi", "Jean-Louis Temarii", "Heiura Salmon", "Teiva Tefaafana", "Moana Chung"][i] ?? "Prospect " + i,
    company: ["Fare Natura", "Tahiti Business", "Poerava Events", "Te Fenua Foods", "Pacific Digital"][i] ?? "Entreprise " + i,
    role: ["Directrice", "Gérant", "Responsable marketing", "Co-fondateur", "Community Manager"][i] ?? "Poste " + i,
    sector: filters.sectors?.[0] ?? config.targetSectors[0] ?? "Commerce",
    location: filters.locations?.[0] ?? config.targetLocations[0] ?? "Tahiti",
    linkedinUrl: filters.platform === "linkedin" ? "https://linkedin.com/in/mock-profile-" + i : undefined,
    instagramHandle: filters.platform === "instagram" ? "@mock_handle_" + i : undefined,
    source: filters.platform,
    foundAt: new Date().toISOString(),
    tags: [filters.sectors?.[0] ?? "Commerce", filters.locations?.[0] ?? "Tahiti"],
  }));

  return { success: true, data: mockProspects };
}

// ------------------------------------------------------------
// Génération de message personnalisé (Claude API / OpenAI)
// ------------------------------------------------------------

/**
 * Génère un message de prospection ultra-personnalisé.
 * Adapté au contexte polynésien et au profil du prospect.
 * À connecter à Claude API.
 */
export async function generateProspectMessage(
  config: AriConfig,
  prospect: Prospect,
  isFollowUp = false,
  followUpNumber = 1
): Promise<ApiResponse<string>> {
  // TODO: appel réel à l'API IA
  // const response = await anthropic.messages.create({
  //   model: "claude-3-5-haiku-20241022",
  //   system: buildProspectingSystemPrompt(config),
  //   messages: [{ role: "user", content: buildMessagePrompt(prospect, isFollowUp, followUpNumber) }],
  // });

  if (!isFollowUp) {
    const message =
      "Ia ora na " +
      prospect.name.split(" ")[0] +
      " ! 🌺\n\n" +
      "J'ai découvert votre profil et le travail de " +
      (prospect.company ?? "votre entreprise") +
      " — impressionnant ce que vous faites dans le secteur " +
      (prospect.sector ?? "de votre activité") +
      " au fenua.\n\n" +
      "Chez " +
      config.entreprise +
      ", on aide les entreprises polynésiennes à automatiser leur communication et leur développement commercial grâce à l'IA. " +
      "Résultat : nos clients gagnent en moyenne 10h/semaine tout en augmentant leur visibilité.\n\n" +
      "Est-ce que ça vous parlerait d'en discuter 15 minutes cette semaine ?\n\nMauruuru 🙏";
    return { success: true, data: message };
  }

  const followUpMessages = [
    "Ia ora na " +
      prospect.name.split(" ")[0] +
      " ! Je reviens vers vous concernant mon message précédent sur l'automatisation IA pour " +
      (prospect.company ?? "votre entreprise") +
      ". Avez-vous eu l'occasion d'y réfléchir ? 😊",
    "Bonjour " +
      prospect.name.split(" ")[0] +
      " ! Pour ne pas vous importuner, ce sera mon dernier message. " +
      "Si vous souhaitez un jour explorer comment l'IA peut booster " +
      (prospect.company ?? "votre activité") +
      " au fenua, je suis disponible. Mauruuru et bonne continuation ! 🌸",
  ];

  return {
    success: true,
    data: followUpMessages[Math.min(followUpNumber - 1, followUpMessages.length - 1)],
  };
}

// ------------------------------------------------------------
// Envoi de message (LinkedIn Messaging / Instagram DM)
// ------------------------------------------------------------

/**
 * Envoie un message LinkedIn via l'API Messaging.
 * Nécessite : LINKEDIN_ACCESS_TOKEN
 */
export async function sendLinkedInMessage(
  message: string,
  prospect: Prospect
): Promise<ApiResponse<{ messageId: string }>> {
  // TODO: appel réel à l'API LinkedIn Messaging
  // const res = await fetch("https://api.linkedin.com/v2/messages", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: "Bearer " + accessToken,
  //   },
  //   body: JSON.stringify({
  //     recipients: [{ person: { profileUrn: prospect.linkedinUrn } }],
  //     subject: "Collaboration Ora AI",
  //     body: message,
  //   }),
  // });

  console.log("[Ari] LinkedIn DM →", prospect.name, ":", message.substring(0, 60));

  return { success: true, data: { messageId: "li_msg_" + Date.now() } };
}

/**
 * Envoie un message Instagram via l'API Messenger.
 * Nécessite : INSTAGRAM_ACCESS_TOKEN (compte pro)
 */
export async function sendInstagramDM(
  message: string,
  prospect: Prospect
): Promise<ApiResponse<{ messageId: string }>> {
  // TODO: appel réel à l'API Instagram DM
  // Nécessite que le prospect ait d'abord initié une conversation
  // (limitation de l'API Meta pour éviter le spam)
  // const res = await fetch("https://graph.facebook.com/v19.0/me/messages", {
  //   method: "POST",
  //   headers: { Authorization: "Bearer " + accessToken },
  //   body: JSON.stringify({ recipient: { id: prospectIgId }, message: { text: message } }),
  // });

  console.log("[Ari] Instagram DM →", prospect.instagramHandle, ":", message.substring(0, 60));

  return { success: true, data: { messageId: "ig_msg_" + Date.now() } };
}

// ------------------------------------------------------------
// Gestion des séquences de relance
// ------------------------------------------------------------

/**
 * Détermine si un prospect doit recevoir une relance.
 * Retourne true si le délai est écoulé et qu'on n'a pas atteint le max.
 */
export function shouldFollowUp(
  contact: ProspectContact,
  config: AriConfig
): boolean {
  if (contact.status === "replied" || contact.status === "hot" || contact.status === "converted") {
    return false; // a répondu, géré manuellement
  }
  if (contact.status === "not_interested" || contact.status === "unresponsive") {
    return false; // ne plus contacter
  }

  const sentMessages = contact.messages.filter((m) => m.isFollowUp);
  if (sentMessages.length >= config.maxFollowUps) {
    return false; // max relances atteint
  }

  if (!contact.lastContactAt) return false;

  const daysSinceLastContact =
    (Date.now() - new Date(contact.lastContactAt).getTime()) / 86_400_000;

  return daysSinceLastContact >= config.followUpDelayDays;
}

// ------------------------------------------------------------
// Intégration CRM Notion
// ------------------------------------------------------------

/**
 * Enregistre ou met à jour un prospect dans la base Notion.
 * Nécessite : NOTION_API_KEY + NOTION_DATABASE_ID
 */
export async function syncToNotion(
  prospect: Prospect,
  contact: ProspectContact
): Promise<ApiResponse<{ pageId: string }>> {
  // TODO: appel réel à l'API Notion
  // const notion = new Client({ auth: process.env.NOTION_API_KEY });
  // const response = await notion.pages.create({
  //   parent: { database_id: notionDatabaseId },
  //   properties: {
  //     Name: { title: [{ text: { content: prospect.name } }] },
  //     Company: { rich_text: [{ text: { content: prospect.company ?? "" } }] },
  //     Status: { select: { name: contact.status } },
  //     Platform: { select: { name: prospect.source } },
  //     Location: { rich_text: [{ text: { content: prospect.location ?? "" } }] },
  //   },
  // });

  console.log("[Ari] Notion sync →", prospect.name, "| Status:", contact.status);

  return { success: true, data: { pageId: "notion_" + Date.now() } };
}

// ------------------------------------------------------------
// Builder de tâche
// ------------------------------------------------------------

export function buildAriTask(
  prospect: Prospect,
  action: "prospect_message" | "prospect_followup",
  userId: string
): Omit<Task, "id"> {
  return {
    agentId: "ari",
    type: action,
    status: "success",
    platform: prospect.source,
    title:
      action === "prospect_message"
        ? "1er contact : " + prospect.name + " (" + (prospect.company ?? prospect.source) + ")"
        : "Relance : " + prospect.name + " (" + (prospect.company ?? prospect.source) + ")",
    executedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    metadata: {
      userId,
      prospectId: prospect.id,
      prospectName: prospect.name,
      company: prospect.company,
      platform: prospect.source,
      location: prospect.location,
    },
  };
}
