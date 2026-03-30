import { NextRequest, NextResponse } from "next/server";
import { askHina, HinaMessage } from "@/lib/hina";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body as {
      message: string;
      history: HinaMessage[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Le champ 'message' est requis" },
        { status: 400 }
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
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
