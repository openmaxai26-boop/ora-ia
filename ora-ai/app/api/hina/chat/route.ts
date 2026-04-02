import { NextRequest, NextResponse } from "next/server";
import { askHina, HinaMessage } from "@/lib/hina";

// Limite : 1 requête par 500ms par IP (simple, sans Redis)
const rateLimitMap = new Map<string, number>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip) ?? 0;
  if (now - last < 500) return true;
  rateLimitMap.set(ip, now);
  // Nettoyer les entrées vieilles de plus de 1 minute
  if (rateLimitMap.size > 1000) {
    Array.from(rateLimitMap.entries()).forEach(([key, ts]) => {
      if (now - ts > 60_000) rateLimitMap.delete(key);
    });
  }
  return false;
}

export async function POST(request: NextRequest) {
  // Rate limiting par IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de requêtes. Veuillez patienter." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { message, history = [] } = body as {
      message: string;
      history: HinaMessage[];
    };

    // Validation
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Le champ 'message' est requis" }, { status: 400 });
    }
    if (message.trim().length > 1000) {
      return NextResponse.json({ error: "Message trop long (max 1000 caractères)" }, { status: 400 });
    }
    if (!Array.isArray(history) || history.length > 20) {
      return NextResponse.json({ error: "Historique invalide" }, { status: 400 });
    }

    // Vérifier que la clé API est configurée
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Service IA non configuré. Ajoutez ANTHROPIC_API_KEY dans les variables d'environnement." },
        { status: 503 }
      );
    }

    const response = await askHina(message.trim(), history);

    return NextResponse.json({
      reply: response.message,
      tokens: response.tokens,
    });
  } catch (error) {
    console.error("Erreur agent Hina:", error);
    return NextResponse.json(
      { error: "Erreur interne. Réessayez dans quelques instants." },
      { status: 500 }
    );
  }
}
