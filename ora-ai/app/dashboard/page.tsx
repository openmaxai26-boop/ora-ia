"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useCurrentUser, useDashboardStats, useRecentTasks, useAgentStats, timeAgo } from "@/lib/hooks/useDashboard";
import { AGENTS } from "@/lib/config/agents";

const AGENT_ICONS: Record<string, string> = {
  teva: "📸",
  hina: "💬",
  reva: "✍️",
  manu: "👔",
  ari: "🎯",
};

export default function Dashboard() {
  const { user, loading: userLoading } = useCurrentUser();
  const userId = user?.id ?? null;

  const { stats, loading: statsLoading } = useDashboardStats(userId);
  const { tasks, loading: tasksLoading } = useRecentTasks(userId, { limit: 5 });
  const { agentTaskCounts, loading: agentLoading } = useAgentStats(userId);

  const loading = userLoading || statsLoading;

  const firstName = user?.entreprise
    ? user.entreprise.split(" ")[0]
    : "Ia ora na";

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-ocean">Tableau de bord</h1>
            <p className="text-ocean/50">
              {userLoading
                ? "Chargement..."
                : "Ia ora na, " + firstName + " 👋 — Voici ce qui se passe aujourd'hui"}
            </p>
          </div>
          <a
            href="/dashboard/agents"
            className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold hover:bg-ocean transition-colors"
          >
            + Activer un agent
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Agents actifs",
              value: loading ? "—" : stats.activeAgents,
              icon: "🤖",
              color: "text-lagoon",
            },
            {
              label: "Tâches réalisées",
              value: loading ? "—" : stats.totalTasks,
              icon: "✅",
              color: "text-green-500",
            },
            {
              label: "Messages traités",
              value: loading ? "—" : stats.messagesHandled,
              icon: "💬",
              color: "text-purple-500",
            },
            {
              label: "Temps économisé",
              value: loading ? "—" : stats.timeSavedHours + "h",
              icon: "⏱️",
              color: "text-gold",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className={"text-3xl font-black " + stat.color}>
                {stat.value}
              </div>
              <div className="text-ocean/50 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Liste des agents */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-ocean font-bold text-lg">Mes agents</h2>
              <a
                href="/dashboard/agents"
                className="text-lagoon text-sm font-semibold hover:underline"
              >
                Voir tous →
              </a>
            </div>

            <div className="space-y-4">
              {AGENTS.map((agent) => {
                const counts = agentTaskCounts[agent.id] ?? { total: 0, success: 0, today: 0 };
                const isActive = !agentLoading && counts.today > 0;

                return (
                  <div
                    key={agent.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div
                      className={
                        "w-12 h-12 " +
                        agent.bgColor +
                        " rounded-xl flex items-center justify-center text-2xl"
                      }
                    >
                      {agent.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-ocean">Agent {agent.name}</div>
                      <div className="text-ocean/50 text-sm">{agent.role}</div>
                    </div>
                    <div className="text-right">
                      {agentLoading ? (
                        <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
                      ) : isActive ? (
                        <>
                          <div className="text-green-500 font-bold text-sm flex items-center gap-1 justify-end">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Actif
                          </div>
                          <div className="text-ocean/40 text-xs">
                            {counts.today} tâches aujourd'hui
                          </div>
                        </>
                      ) : (
                        <a
                          href="/dashboard/agents"
                          className="bg-lagoon/10 text-lagoon text-xs font-semibold px-3 py-1 rounded-full hover:bg-lagoon hover:text-white transition-colors"
                        >
                          Activer
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-ocean font-bold text-lg">Activité récente</h2>
              <a
                href="/dashboard/stats"
                className="text-lagoon text-sm font-semibold hover:underline"
              >
                Stats →
              </a>
            </div>

            {tasksLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-ocean/40 text-sm text-center py-8">
                Aucune activité pour l'instant.<br />
                Activez un agent pour commencer ! 🚀
              </p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <span className="text-xl">
                      {AGENT_ICONS[task.agentId] ?? "🤖"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-ocean/80 text-sm font-medium truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lagoon text-xs font-semibold capitalize">
                          {task.agentId}
                        </span>
                        <span className="text-ocean/30 text-xs">
                          {timeAgo(task.createdAt)}
                        </span>
                        <span
                          className={
                            "text-xs px-1.5 py-0.5 rounded-full " +
                            (task.status === "success"
                              ? "bg-green-50 text-green-600"
                              : task.status === "failed"
                              ? "bg-red-50 text-red-500"
                              : "bg-gray-100 text-gray-500")
                          }
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          {[
            {
              icon: "📊",
              label: "Voir les statistiques",
              href: "/dashboard/stats",
              color: "bg-lagoon/10 text-lagoon",
            },
            {
              icon: "🔗",
              label: "Gérer les intégrations",
              href: "/dashboard/integrations",
              color: "bg-ocean/10 text-ocean",
            },
            {
              icon: "⚙️",
              label: "Paramètres du compte",
              href: "/dashboard/settings",
              color: "bg-purple-50 text-purple-600",
            },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={action.color + " rounded-2xl p-5 flex items-center gap-4 font-semibold hover:shadow-md transition-all"}
            >
              <span className="text-2xl">{action.icon}</span>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
