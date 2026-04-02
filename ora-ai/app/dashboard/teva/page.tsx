"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const TOPICS = [
  "Promotion du week-end — -20% sur toute la boutique",
  "Nouveau produit : vanille bio de Tahaa",
  "Événement : marché artisanal samedi à Papeete",
  "Conseil : 3 astuces pour entretenir votre pareu",
  "Témoignage client : merci pour votre fidélité",
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "facebook",  label: "Facebook",  icon: "👍" },
  { id: "tiktok",    label: "TikTok",    icon: "🎵" },
];

interface PostResult {
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  platform: string;
}

export default function TevaPage() {
  const [topic, setTopic]         = useState("");
  const [platform, setPlatform]   = useState("instagram");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<PostResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/agents/teva/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo", topic: topic.trim(), platform }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ ...data.data.post, platform });
      } else {
        setError(data.error ?? "Erreur lors de la génération");
      }
    } catch {
      setError("Impossible de contacter l'agent. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = result.caption + "\n\n" + result.hashtags.map((h) => "#" + h).join(" ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout active="agents">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/agents" className="text-ocean/40 hover:text-ocean text-sm transition-colors">
            ← Agents
          </Link>
          <div className="w-px h-4 bg-gray-200" />
          <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center text-xl">📸</div>
          <div>
            <h1 className="text-xl font-black text-ocean">Teva — Réseaux Sociaux</h1>
            <p className="text-ocean/50 text-sm">Génère des posts adaptés au fenua</p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6">
          <div>
            <label className="block text-ocean font-semibold text-sm mb-2">Sujet du post</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Promotion sur nos colliers de coquillage ce week-end..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/30 resize-none"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="text-xs text-ocean/50 bg-gray-100 hover:bg-lagoon/10 hover:text-lagoon px-2 py-1 rounded-full transition-colors"
                >
                  {t.substring(0, 40)}…
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-ocean font-semibold text-sm mb-2">Plateforme</label>
            <div className="flex gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={"flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all " +
                    (platform === p.id
                      ? "border-lagoon bg-lagoon/10 text-lagoon"
                      : "border-gray-200 text-ocean/60 hover:border-lagoon/40")}
                >
                  <span>{p.icon}</span>{p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-lagoon text-white py-3 rounded-xl font-bold hover:bg-ocean transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? "Génération en cours…" : "✨ Générer le post"}
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Résultat */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-ocean">Post généré pour {result.platform}</h2>
              <button
                onClick={handleCopy}
                className={"text-xs font-semibold px-3 py-1.5 rounded-full transition-colors " +
                  (copied ? "bg-green-100 text-green-600" : "bg-lagoon/10 text-lagoon hover:bg-lagoon hover:text-white")}
              >
                {copied ? "✓ Copié !" : "Copier"}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-ocean text-sm leading-relaxed whitespace-pre-wrap">{result.caption}</p>
            </div>

            {result.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-lagoon font-medium">#{tag}</span>
                ))}
              </div>
            )}

            {result.imagePrompt && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-ocean/40 font-semibold uppercase tracking-wider mb-2">
                  Prompt pour la photo
                </p>
                <p className="text-xs text-ocean/60 italic">{result.imagePrompt}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              className="text-sm text-ocean/40 hover:text-lagoon transition-colors font-medium"
            >
              ↻ Régénérer
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
