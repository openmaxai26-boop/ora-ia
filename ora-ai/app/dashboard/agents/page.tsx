"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCurrentUser, useAgentStats, useRecentTasks } from "@/lib/hooks/useDashboard";
import { AGENTS, getAgentsForPlan } from "@/lib/config/agents";
import type { AgentId } from "@/lib/types";

export default function AgentsPage() {
  const { user } = useCurrentUser();
  const userId = user?.id ?? null;
  const userPlan = user?.plan ?? "starter";

  const { agentTaskCounts, loading: agentLoading } = useAgentStats(userId);
  const [runningAgent, setRunningAgent] = useState<AgentId | null>(null);
  const [runResult, setRunResult] = useState<{ agentId: AgentId; message: string } | null>(null);

  const availableAgents = getAgentsForPlan(userPlan);
  const availableIds = new Set(availableAgents.map((a) => a.id));

  const handleRunAgent = async (agentId: AgentId) => {
    if (!userId || runningAgent) return;
    setRunningAgent(agentId);
    setRunResult(null);

    try {
      const res = await fetch("/api/agents/" + agentId + "/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      setRunResult({
        agentId,
        message: data.success
          ? "Agent " + agentId + " exécuté avec succès ✅"
          : "Erreur : " + (data.error ?? "inconnue"),
      });
    } catch {
      setRunResult({ agentId, message: "Erreur réseau. Réessayez." });
    } finally {
      setRunningAgent(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-ocean">Mes agents IA</h1>
          <p className="text-ocean/50">
            Gérez et lancez vos agents selon votre plan{" "}
            <span className="font-semibold text-lagoon capitalize">{userPlan}</span>
          </p>
        </div>

        {/* Message résultat */}
        {runResult && (
          <div
            className={
              "mb-6 px-4 py-3 rounded-xl text-sm font-medium " +
              (runResult.message.includes("succès")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200")
            }
          >
            {runResult.message}
          </div>
        )}

        {/* Grille des agents */}
        <div className="grid grid-cols-1 gap-6">
          {AGENTS.map((agent) => {
            const isAvailable = availableIds.has(agent.id);
            const counts = agentTaskCounts[agent.id] ?? { total: 0, success: 0, today: 0 };
            const isRunning = runningAgent === agent.id;

            return (
              <div
                key={agent.id}
                className={
                  "bg-white rounded-2xl shadow-sm border p-6 transition-all " +
                  (isAvailable ? "border-gray-100 hover:shadow-md" : "border-gray-100 opacity-60")
                }
              >
                <div className="flex items-start gap-5">
                  {/* Icône */}
                  <div
                    className={
                      "w-14 h-14 rounded-2xl " +
                      agent.bgColor +
                      " flex items-center justify-center text-3xl flex-shrink-0"
                    }
                  >
                    {agent.emoji}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-ocean text-lg">{agent.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-ocean/50">
                        {agent.role}
                      </span>
                      {!isAvailable && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gold/20 text-gold">
                          Plan {agent.plan}
                        </span>
                      )}
                    </div>

                    <p className="text-ocean/60 text-sm mb-3">{agent.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agent.features.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="text-xs bg-gray-50 text-ocean/60 px-2 py-1 rounded-lg"
                        >
                          {f}
                        </span>
                      ))}
                      {agent.features.length > 3 && (
                        <span className="text-xs text-ocean/40 px-2 py-1">
                          +{agent.features.length - 3} autres
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    {isAvailable && !agentLoading && (
                      <div className="flex items-center gap-4 text-sm text-ocean/50">
                        <span>{counts.total} tâches au total</span>
                        <span>·</span>
                        <span className="text-green-600 font-semibold">{counts.success} succès</span>
                        <span>·</span>
                        <span className="text-lagoon font-semibold">{counts.today} aujourd'hui</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {isAvailable ? (
                      <button
                        onClick={() => handleRunAgent(agent.id)}
                        disabled={!!runningAgent}
                        className={
                          "px-5 py-2 rounded-xl font-bold text-sm transition-all " +
                          (isRunning
                            ? "bg-lagoon/20 text-lagoon cursor-wait"
                            : "bg-lagoon text-white hover:bg-ocean disabled:opacity-50")
                        }
                      >
                        {isRunning ? "Exécution…" : "▶ Lancer"}
                      </button>
                    ) : (
                      <a
                        href="/dashboard/settings"
                        className="px-5 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-gold to-orange-400 text-white hover:shadow-md transition-all"
                      >
                        Upgrader
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
