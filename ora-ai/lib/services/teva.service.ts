// ============================================================
// TEVA — Service Réseaux Sociaux
// Gère la génération et la publication de contenu
// sur Facebook, Instagram et TikTok
// ============================================================

import type { Task, ApiResponse } from "@/lib/types";

// ------------------------------------------------------------
// Types locaux
// ------------------------------------------------------------

export interface SocialPost {
    platform: "facebook" | "instagram" | "tiktok";
    caption: string;
    hashtags: string[];
    imagePrompt?: string;    // prompt pour générer l'image via DALL-E / Replicate
  scheduledAt?: string;    // si vide → publication immédiate
}

export interface TevaConfig {
    userId: string;
    tone: "professionnel" | "décontracté" | "promotionnel";
    language: "fr" | "fr-pf";   // fr-pf = français + mots tahitiens
  sector: string;              // ex: "Artisanat", "Restauration"
  postFrequency: number;       // posts par semaine
  platforms: ("facebook" | "instagram" | "tiktok")[];
    pageId?: string;             // Facebook Page ID
  igAccountId?: string;        // Instagram Business Account ID
}

// ------------------------------------------------------------
// Génération de contenu (appelle OpenAI / Claude API)
// ------------------------------------------------------------

/**
 * Génère un post adapté au marché polynésien.
 * À connecter à l'API d'IA (OpenAI GPT-4o, Claude 3.5…)
 */
export async function generatePost(
    config: TevaConfig,
    topic?: string
  ): Promise<ApiResponse<SocialPost>> {
    // TODO: remplacer par appel réel à l'API IA
  // const prompt = buildPrompt(config, topic);
  // const response = await openai.chat.completions.create({...});

  const mockPost: SocialPost = {
        platform: config.platforms[0] ?? "instagram",
        caption: `✨ ${topic ?? "Découvrez nos nouveautés"} — Venez nous rendre visite à Tahiti ! 🌺`,
        hashtags: [
                "#Polynésie",
                "#Fenua",
                "#Tahiti",
                `#${config.sector.replace(/\s/g, "")}`,
                "#MadeInFenua",
                "#VivreEnPolynésie",
              ],
        imagePrompt: `Beautiful ${config.sector} product from Tahiti, tropical background, professional photography`,
        scheduledAt: new Date(Date.now() + 3_600_000).toISOString(), // +1h
  };

  return { success: true, data: mockPost };
}

// ------------------------------------------------------------
// Publication (appelle les APIs Facebook / Instagram Graph)
// ------------------------------------------------------------

/**
 * Publie un post via l'API Facebook Graph.
 * Nécessite : FACEBOOK_PAGE_ACCESS_TOKEN dans les variables d'env.
 */
export async function publishToFacebook(
    post: SocialPost,
    pageId: string
  ): Promise<ApiResponse<{ postId: string }>> {
    // TODO: appel réel
  // const res = await fetch(
  //   `https://graph.facebook.com/${pageId}/feed`,
  //   { method: "POST", body: JSON.stringify({ message: post.caption, ...}) }
  // );
  console.log(`[Teva] Facebook publish to page ${pageId}:`, post.caption.substring(0, 40));
    return { success: true, data: { postId: `fb_mock_${Date.now()}` } };
}

/**
 * Publie un post via l'API Instagram Graph.
 * Nécessite : INSTAGRAM_ACCESS_TOKEN dans les variables d'env.
 */
export async function publishToInstagram(
    post: SocialPost,
    igAccountId: string
  ): Promise<ApiResponse<{ mediaId: string }>> {
    // TODO: appel réel
  // Étape 1 : créer le media container
  // Étape 2 : publier le container
  console.log(`[Teva] Instagram publish to account ${igAccountId}`);
    return { success: true, data: { mediaId: `ig_mock_${Date.now()}` } };
}

// ------------------------------------------------------------
// Création de tâche (enregistrement en DB)
// ------------------------------------------------------------

export function buildTevaTask(
    post: SocialPost,
    userId: string
  ): Omit<Task, "id"> {
    return {
          agentId: "teva",
          type: post.platform === "facebook" ? "social_post" : "social_post",
          status: "pending",
          platform: post.platform,
          title: `Publication ${post.platform} — ${post.caption.substring(0, 50)}…`,
          scheduledAt: post.scheduledAt,
          createdAt: new Date().toISOString(),
          metadata: {
                  userId,
                  caption: post.caption,
                  hashtags: post.hashtags,
                  imagePrompt: post.imagePrompt,
          },
    };
}
