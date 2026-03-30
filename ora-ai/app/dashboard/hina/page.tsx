"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  tokens?: number;
}

export default function HinaTest() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ia ora na ! 👋 Je suis Hina, votre assistante IA. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/hina/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, tokens: data.tokens },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "❌ Erreur : " + (data.error || "Problème technique"),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Impossible de contacter l'agent. Vérifiez votre clé API.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-lagoon rounded-2xl flex items-center justify-center text-2xl">
          💬
        </div>
        <div>
          <h1 className="text-xl font-black text-ocean">Agent Hina — Test en direct</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-ocean/50">Connecté à Claude AI</span>
          </div>
        </div>
        <div className="ml-auto bg-lagoon/10 text-lagoon text-xs font-semibold px-3 py-1.5 rounded-full">
          Simulateur WhatsApp
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-lagoon rounded-full flex items-center justify-center text-white text-sm font-bold mr-2 shrink-0 mt-1">
                H
              </div>
            )}
            <div
              className={`max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-ocean text-white rounded-tr-sm"
                  : "bg-white text-ocean shadow-sm border border-gray-100 rounded-tl-sm"
              }`}
            >
              {msg.content}
              {msg.tokens && (
                <div className="text-xs opacity-50 mt-1">{msg.tokens} tokens</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-lagoon rounded-full flex items-center justify-center text-white text-sm font-bold mr-2 shrink-0">
              H
            </div>
            <div className="bg-white text-ocean shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-lagoon rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-lagoon rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-lagoon rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-8 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Écrivez un message comme un client WhatsApp..."
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm text-ocean outline-none focus:ring-2 focus:ring-lagoon/30"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-lagoon text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-ocean transition-colors disabled:opacity-50"
          >
            ➤
          </button>
        </div>
        <p className="text-center text-xs text-ocean/30 mt-2">
          Simulateur de test — les vraies conversations passent par WhatsApp via Twilio
        </p>
      </div>
    </div>
  );
}
