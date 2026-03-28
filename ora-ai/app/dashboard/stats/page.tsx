"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useCurrentUser, useAgentStats, useRecentTasks, useDashboardStats, timeAgo } from "@/lib/hooks/useDashboard";
import { AGENTS } from "@/lib/config/agents";

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  failed:  "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
  running: "bg-blue-100 text-blue-600",
  skipped: "bg-gray-100 text-gray-500",
};

export default function StatsPage() {
  const { user } = useCurrentUser();
  const userId = user?.id ?? null;

  const { stats, loading: statsLoading } = useDashboardStats(userId);
  const { agentTaskCounts, loading: agentLoading } = useAgentStats(userId);
  const { tasks, loading: tasksLoading } = useRecentTasks(userId, { limit: 20 });

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-ocean">Statistiques</h1>
          <p className="text-ocean/50">Vue d'ensemble de l'activité de vos agents IA</p>
        </div>

        {/* KPIs globaux */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total tâches", value: statsLoading ? "—" : stats.totalTasks, icon: "✅", color: "text-lagoon" },
            { label: "Messages traités", value: statsLoading ? "—" : stats.messagesHandled, icon: "💬", color: "text-purple-500" },
            { label: "Agents actifs", value: statsLoading ? "—" : stats.activeAgents, icon: "🤖", color: "text-green-500" },
            { label: "Temps économisé", value: statsLoading ? "—" : stats.timeSavedHours + "h", icon: "⏱️", color: "text-gold" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className={"text-3xl font-black " + s.color}>{s.value}</div>
              <div className="text-ocean/50 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Performance par agent */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-ocean font-bold text-lg mb-6">Performance par agent</h2>

            {agentLoading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {AGENTS.map((agent) => {
                  const counts = agentTaskCounts[agent.id] ?? { total: 0, success: 0, today: 0 };
                  const rate = counts.total > 0
                    ? Math.round((counts.success / counts.total) * 100)
                    : 0;

                  return (
                    <div key={agent.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{agent.emoji}</span>
                          <span className="font-semibold text-ocean text-sm">{agent.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-ocean/50 text-xs">{counts.total} tâches</span>
                          <span className="text-ocean font-bold text-sm ml-3">{rate}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-lagoon h-2 rounded-full transition-all duration-500"
                          style={{ width: rate + "%" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Répartition par statut */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-ocean font-bold text-lg mb-6">Répartition des tâches</h2>

            {tasksLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (() => {
              const counts = tasks.reduce((acc, t) => {
                acc[t.status] = (acc[t.status] ?? 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              const total = tasks.length || 1;
              const statuses = [
                { key: "success", label: "Succès", color: "bg-green-500" },
                { key: "failed",  label: "Échoué", color: "bg-red-400" },
                { key: "pending", label: "En attente", color: "bg-yellow-400" },
                { key: "running", label: "En cours", color: "bg-blue-400" },
              ];

              return (
                <div className="space-y-3">
                  {statuses.map(({ key, label, color }) => {
                    const n = counts[key] ?? 0;
                    const pct = Math.round((n / total) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-ocean/70 text-sm">{label}</span>
                          <span className="text-ocean font-bold text-sm">{n}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={color + " h-2 rounded-full transition-all duration-500"}
                            style={{ width: pct + "%" }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {tasks.length === 0 && (
                    <p className="text-ocean/40 text-sm text-center py-6">
                      Aucune tâche pour l'instant
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Historique des tâches */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-ocean font-bold text-lg mb-6">Historique des tâches</h2>

          {tasksLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-ocean/40 text-sm text-center py-8">
              Aucune tâche enregistrée. Lancez un agent pour commencer ! 🚀
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-ocean/40 border-b border-gray-100">
                    <th className="text-left pb-3 font-semibold">Agent</th>
                    <th className="text-left pb-3 font-semibold">Tâche</th>
                    <th className="text-left pb-3 font-semibold">Plateforme</th>
                    <th className="text-left pb-3 font-semibold">Statut</th>
                    <th className="text-right pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-semibold text-ocean capitalize">{task.agentId}</td>
                      <td className="py-3 text-ocean/70 max-w-xs truncate">{task.title}</td>
                      <td className="py-3 text-ocean/50">{task.platform}</td>
                      <td className="py-3">
                        <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (STATUS_COLORS[task.status] ?? "bg-gray-100 text-gray-500")}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 text-ocean/40 text-right text-xs">{timeAgo(task.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
