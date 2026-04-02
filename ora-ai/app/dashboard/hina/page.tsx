"use client";
import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  tokens?: number;
}

const QUICK_QUESTIONS = [
  "Quels sont vos horaires ?",
  "Comment prendre rendez-vous ?",
  "Quels sont vos tarifs ?",
  "Où êtes-vous situés ?",
  "Bonjour, je voudrais une info sur vos services",
];

export default function HinaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ia ora na ! 👋 Je suis Hina, votre assistante IA. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userMessage = (text ?? input).trim();
    if (!userMessage || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/hina/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply, tokens: data.tokens }]);
        setTotalTokens((t) => t + (data.tokens ?? 0));
      } else {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "❌ " + (data.error ?? "Erreur inattendue. Vérifiez que ANTHROPIC_API_KEY est configurée."),
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "❌ Impossible de contacter l'agent. Vérifiez votre connexion et la clé API.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Ia ora na ! 👋 Je suis Hina, votre assistante IA. Comment puis-je vous aider aujourd'hui ?",
    }]);
    setTotalTokens(0);
  };

  return (
    <DashboardLayout active="agents">
      <div className="h-[calc(100vh-4rem)] flex flex-col -m-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4 flex-shrink-0">
          <Link href="/dashboard/agents" className="text-ocean/40 hover:text-ocean text-sm font-medium transition-colors">
            ← Agents
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <div className="w-10 h-10 bg-lagoon/10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
            💬
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black text-ocean">Hina — Service Client IA</h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-ocean/40">Alimenté par Claude AI · {totalTokens > 0 && `${totalTokens} tokens utilisés`}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-lagoon/10 text-lagoon text-xs font-semibold px-3 py-1.5 rounded-full">
              Simulateur WhatsApp
            </span>
            <button
              onClick={clearChat}
              className="text-ocean/30 hover:text-ocean/60 text-xs transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 bg-lagoon rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">H</div>
              )}
              <div className={`max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-ocean text-white rounded-tr-sm"
                  : "bg-white text-ocean shadow-sm border border-gray-100 rounded-tl-sm"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.tokens && (
                  <div className="text-xs opacity-40 mt-1 text-right">{msg.tokens} tokens</div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-lagoon rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0">H</div>
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 bg-lagoon rounded-full animate-bounce" style={{ animationDelay: d + "ms" }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Questions rapides */}
        <div className="bg-white border-t border-gray-100 px-8 py-2 flex gap-2 overflow-x-auto flex-shrink-0">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={loading}
              className="text-xs text-ocean/60 bg-gray-100 hover:bg-lagoon/10 hover:text-lagoon px-3 py-1.5 rounded-full whitespace-nowrap transition-colors disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-8 py-4 flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Écrivez un message comme un client WhatsApp..."
              className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm text-ocean outline-none focus:ring-2 focus:ring-lagoon/30 transition-all"
              disabled={loading}
              maxLength={1000}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-lagoon text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-ocean transition-colors disabled:opacity-40 text-lg"
            >
              ➤
            </button>
          </div>
          <p className="text-center text-xs text-ocean/25 mt-2">
            Simulateur de test · Les vraies conversations passent par WhatsApp via Meta Cloud API
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
