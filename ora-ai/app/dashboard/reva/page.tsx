"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const KEYWORDS = [
  "artisanat tahitien",
  "restaurant Papeete",
  "hôtel Bora Bora",
  "location voiture Moorea",
  "cours de plongée Rangiroa",
];

interface ArticleResult {
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  wordCount?: number;
}

export default function RevaPage() {
  const [keyword, setKeyword]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<ArticleResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [tab, setTab]           = useState<"preview" | "html">("preview");

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/agents/reva/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo", keyword: keyword.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data.data.article);
      } else {
        setError(data.error ?? "Erreur lors de la génération");
      }
    } catch {
      setError("Impossible de contacter l'agent.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(tab === "html" ? result.content : result.title + "\n\n" + result.metaDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout active="agents">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/agents" className="text-ocean/40 hover:text-ocean text-sm transition-colors">← Agents</Link>
          <div className="w-px h-4 bg-gray-200" />
          <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center text-xl">✍️</div>
          <div>
            <h1 className="text-xl font-black text-ocean">Reva — SEO & Blog</h1>
            <p className="text-ocean/50 text-sm">Génère des articles optimisés pour Google</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6">
          <div>
            <label className="block text-ocean font-semibold text-sm mb-2">Mot-clé SEO cible</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Ex: restaurant tahitien Papeete..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/30"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {KEYWORDS.map((k) => (
                <button
                  key={k}
                  onClick={() => setKeyword(k)}
                  className="text-xs text-ocean/50 bg-gray-100 hover:bg-lagoon/10 hover:text-lagoon px-2 py-1 rounded-full transition-colors"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !keyword.trim()}
            className="w-full bg-lagoon text-white py-3 rounded-xl font-bold hover:bg-ocean transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? "Rédaction en cours…" : "✍️ Générer l'article"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-ocean text-lg">{result.title}</h2>
                <p className="text-ocean/40 text-xs mt-1">{result.wordCount ?? "~"} mots · {result.keywords?.slice(0,3).join(", ")}</p>
              </div>
              <button
                onClick={handleCopy}
                className={"text-xs font-semibold px-3 py-1.5 rounded-full transition-colors " +
                  (copied ? "bg-green-100 text-green-600" : "bg-lagoon/10 text-lagoon hover:bg-lagoon hover:text-white")}
              >
                {copied ? "✓ Copié !" : "Copier"}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-ocean/40 mb-1">META DESCRIPTION (Google)</p>
              <p className="text-sm text-ocean/70">{result.metaDescription}</p>
            </div>

            {/* Onglets */}
            <div className="flex gap-2 border-b border-gray-100">
              <button
                onClick={() => setTab("preview")}
                className={"text-sm font-semibold pb-2 border-b-2 transition-colors " +
                  (tab === "preview" ? "border-lagoon text-lagoon" : "border-transparent text-ocean/40 hover:text-ocean")}
              >
                Aperçu
              </button>
              <button
                onClick={() => setTab("html")}
                className={"text-sm font-semibold pb-2 border-b-2 transition-colors " +
                  (tab === "html" ? "border-lagoon text-lagoon" : "border-transparent text-ocean/40 hover:text-ocean")}
              >
                HTML
              </button>
            </div>

            {tab === "preview" ? (
              <div
                className="prose prose-sm max-w-none text-ocean/80 [&_h1]:text-ocean [&_h1]:font-black [&_h2]:text-ocean [&_h2]:font-bold [&_strong]:text-ocean"
                dangerouslySetInnerHTML={{ __html: result.content }}
              />
            ) : (
              <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                {result.content}
              </pre>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
