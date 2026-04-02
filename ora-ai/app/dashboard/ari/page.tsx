"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const SECTORS = ["Commerce & Artisanat", "Restauration", "Hôtellerie", "Services", "BTP", "Santé", "Éducation"];
const LOCATIONS = ["Tahiti", "Moorea", "Bora Bora", "Raiatea", "Huahine", "Rangiroa", "Toutes les îles"];
const PLATFORMS = [
  { id: "linkedin",  label: "LinkedIn",  icon: "💼" },
  { id: "instagram", label: "Instagram", icon: "📸" },
];

interface Prospect {
  id: string;
  name: string;
  company?: string;
  role?: string;
  sector?: string;
  location?: string;
  source: string;
}

interface MessageResult {
  prospect: Prospect;
  message: string;
}

export default function AriPage() {
  const [sector, setSector]     = useState("Commerce & Artisanat");
  const [location, setLocation] = useState("Tahiti");
  const [platform, setPlatform] = useState("linkedin");
  const [loading, setLoading]   = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [messages, setMessages]   = useState<MessageResult[]>([]);
  const [error, setError]         = useState<string | null>(null);
  const [step, setStep]           = useState<"search" | "messages">("search");

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setProspects([]);
    setMessages([]);

    try {
      const res = await fetch("/api/agents/ari/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo", targetSector: sector, targetLocation: location, platform }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProspects(data.data.prospects ?? []);
        setMessages(data.data.messages ?? []);
        setStep("messages");
      } else {
        setError(data.error ?? "Erreur lors de la recherche");
      }
    } catch {
      setError("Impossible de contacter l'agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout active="agents">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/agents" className="text-ocean/40 hover:text-ocean text-sm transition-colors">← Agents</Link>
          <div className="w-px h-4 bg-gray-200" />
          <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-xl">🎯</div>
          <div>
            <h1 className="text-xl font-black text-ocean">Ari — Prospection</h1>
            <p className="text-ocean/50 text-sm">Identifie des prospects et génère des messages personnalisés</p>
          </div>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-ocean font-semibold text-sm mb-2">Secteur cible</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/30"
              >
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-ocean font-semibold text-sm mb-2">Localisation</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/30"
              >
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-ocean font-semibold text-sm mb-2">Plateforme</label>
              <div className="flex gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={"flex-1 flex items-center justify-center gap-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all " +
                      (platform === p.id
                        ? "border-lagoon bg-lagoon/10 text-lagoon"
                        : "border-gray-200 text-ocean/60 hover:border-lagoon/40")}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-lagoon text-white py-3 rounded-xl font-bold hover:bg-ocean transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? "Recherche en cours…" : "🎯 Rechercher des prospects"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
        )}

        {/* Résultats */}
        {step === "messages" && prospects.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-ocean">{prospects.length} prospects trouvés — Messages personnalisés</h2>
            {messages.slice(0, 5).map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-lagoon to-ocean rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {item.prospect.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-ocean text-sm">{item.prospect.name}</p>
                    <p className="text-ocean/40 text-xs">{item.prospect.role} · {item.prospect.company} · {item.prospect.location}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-ocean/70 leading-relaxed whitespace-pre-wrap">{item.message}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(item.message); }}
                  className="mt-2 text-xs text-ocean/40 hover:text-lagoon transition-colors"
                >
                  Copier ce message
                </button>
              </div>
            ))}

            <button
              onClick={() => { setStep("search"); setProspects([]); setMessages([]); }}
              className="text-sm text-ocean/40 hover:text-ocean transition-colors font-medium"
            >
              ← Nouvelle recherche
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
