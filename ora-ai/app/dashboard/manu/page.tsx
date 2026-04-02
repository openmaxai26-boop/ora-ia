"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const JOB_EXAMPLES = [
  { title: "Serveur / Serveuse", skills: ["accueil clients", "prise de commandes", "travail en équipe"] },
  { title: "Développeur Web", skills: ["React", "Node.js", "TypeScript"] },
  { title: "Community Manager", skills: ["réseaux sociaux", "création de contenu", "Canva"] },
  { title: "Vendeur(se) boutique", skills: ["conseil client", "caisse", "merchandising"] },
];

interface JobResult {
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  location: string;
  contractType: string;
}

export default function ManuPage() {
  const [jobTitle, setJobTitle]   = useState("");
  const [skills, setSkills]       = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<JobResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };

  const loadExample = (ex: typeof JOB_EXAMPLES[0]) => {
    setJobTitle(ex.title);
    setSkills(ex.skills);
  };

  const handleGenerate = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/agents/manu/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo", jobTitle: jobTitle.trim(), skills }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data.data.jobOffer);
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
    const text = `${result.title}\n\n${result.description}\n\nProfil recherché :\n${result.requirements.map(r => "• " + r).join("\n")}\n\nAvantages :\n${result.benefits.map(b => "• " + b).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout active="agents">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/agents" className="text-ocean/40 hover:text-ocean text-sm transition-colors">← Agents</Link>
          <div className="w-px h-4 bg-gray-200" />
          <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-xl">👔</div>
          <div>
            <h1 className="text-xl font-black text-ocean">Manu — Recrutement</h1>
            <p className="text-ocean/50 text-sm">Génère des offres d'emploi attractives</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6">
          <div>
            <label className="block text-ocean font-semibold text-sm mb-2">Poste à pourvoir</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex: Responsable boutique à Papeete..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/30"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {JOB_EXAMPLES.map((ex) => (
                <button
                  key={ex.title}
                  onClick={() => loadExample(ex)}
                  className="text-xs text-ocean/50 bg-gray-100 hover:bg-lagoon/10 hover:text-lagoon px-2 py-1 rounded-full transition-colors"
                >
                  {ex.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-ocean font-semibold text-sm mb-2">Compétences requises</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Ajouter une compétence…"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-ocean focus:outline-none focus:ring-2 focus:ring-lagoon/30"
              />
              <button
                onClick={addSkill}
                className="bg-lagoon/10 text-lagoon px-4 py-2 rounded-xl text-sm font-semibold hover:bg-lagoon hover:text-white transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 bg-lagoon/10 text-lagoon text-xs font-medium px-3 py-1 rounded-full"
                >
                  {s}
                  <button onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} className="hover:text-red-500 ml-1">×</button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !jobTitle.trim()}
            className="w-full bg-lagoon text-white py-3 rounded-xl font-bold hover:bg-ocean transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? "Rédaction en cours…" : "👔 Générer l'offre d'emploi"}
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
                <p className="text-ocean/40 text-xs">{result.contractType} · {result.location}</p>
              </div>
              <button
                onClick={handleCopy}
                className={"text-xs font-semibold px-3 py-1.5 rounded-full transition-colors " +
                  (copied ? "bg-green-100 text-green-600" : "bg-lagoon/10 text-lagoon hover:bg-lagoon hover:text-white")}
              >
                {copied ? "✓ Copié !" : "Copier"}
              </button>
            </div>

            <p className="text-ocean/70 text-sm leading-relaxed">{result.description}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-ocean text-sm mb-2">Profil recherché</h3>
                <ul className="space-y-1">
                  {result.requirements?.map((r, i) => (
                    <li key={i} className="text-sm text-ocean/60 flex items-start gap-2">
                      <span className="text-lagoon mt-0.5">✓</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-ocean text-sm mb-2">Ce que nous offrons</h3>
                <ul className="space-y-1">
                  {result.benefits?.map((b, i) => (
                    <li key={i} className="text-sm text-ocean/60 flex items-start gap-2">
                      <span className="text-gold mt-0.5">★</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
