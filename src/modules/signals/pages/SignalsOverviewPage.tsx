import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, Users2, Gauge, Shield, ArrowRight, AlertTriangle, AlertCircle, Info,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { SignalDot, TrendIndicator, SignalBadge } from "../components/SignalIndicators";
import { Sparkline } from "../components/Sparkline";
import { MOCK_ORG_SIGNALS, MOCK_ALERTS, MOCK_TEAM_SIGNALS, getSignalsStats } from "../data";
import { cn } from "@/shared/lib/utils";

const ALERT_ICON = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};
const ALERT_COLOR = {
  critical: "text-destructive",
  warning: "text-warning",
  info: "text-muted-foreground",
};

function sparklineColor(status: string): "success" | "warning" | "destructive" | "default" {
  if (status === "healthy") return "success";
  if (status === "warning") return "warning";
  if (status === "critical") return "destructive";
  return "default";
}

export default function SignalsOverviewPage() {
  const stats = getSignalsStats();
  const topAlerts = MOCK_ALERTS.slice(0, 5);
  const teamsSorted = [...MOCK_TEAM_SIGNALS].sort((a, b) => a.healthScore - b.healthScore);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title="Signals"
        description="Operational health, delivery pressure, and organizational resilience indicators."
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Org Health" value={stats.avgHealthScore} icon={Activity} detail="Avg across teams" />
        <StatCard label="Teams At Risk" value={stats.teamsAtRisk} icon={Users2} detail={`of ${MOCK_TEAM_SIGNALS.length} teams`} className={stats.teamsAtRisk > 0 ? "border-warning/30" : ""} />
        <StatCard label="Open Escalations" value={stats.totalEscalations} icon={AlertTriangle} detail={`${stats.criticalAlerts} critical alerts`} className={stats.totalEscalations > 0 ? "border-warning/30" : ""} />
        <StatCard label="Critical Resilience" value={stats.criticalResilience} icon={Shield} detail="Areas needing backup" className={stats.criticalResilience > 0 ? "border-destructive/30" : ""} />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: "/app/signals/teams", icon: Users2, label: "Team Signals", desc: "Compare team health and delivery pressure" },
          { to: "/app/signals/capacity", icon: Gauge, label: "Capacity & Load", desc: `Avg ${stats.avgAllocation}% allocation` },
          { to: "/app/signals/resilience", icon: Shield, label: "Resilience", desc: `${stats.criticalResilience} critical areas` },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-lg border border-border/50 bg-card p-5 hover:border-primary/20 tessira-transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <link.icon size={18} strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{link.label}</h3>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-primary tessira-transition" />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Key signals with sparklines */}
        <div className="lg:col-span-3 rounded-lg border border-border/50 bg-card">
          <div className="border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Key Indicators</h3>
            <p className="text-[11px] text-muted-foreground">Last 7 sprints</p>
          </div>
          <div className="divide-y divide-border/50">
            {MOCK_ORG_SIGNALS.map((sig) => (
              <div key={sig.id} className="flex items-center gap-4 px-5 py-3">
                <SignalDot status={sig.status} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{sig.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{sig.description}</div>
                </div>
                {sig.history && (
                  <Sparkline data={sig.history} color={sparklineColor(sig.status)} />
                )}
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold tabular-nums">
                    {sig.value}<span className="text-xs font-normal text-muted-foreground">{sig.unit}</span>
                  </div>
                  <TrendIndicator direction={sig.trend} value={sig.trendValue} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts with root causes & recommended actions */}
        <div className="lg:col-span-2 rounded-lg border border-border/50 bg-card">
          <div className="border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Active Alerts</h3>
          </div>
          <div className="divide-y divide-border/50">
            {topAlerts.map((alert) => {
              const Icon = ALERT_ICON[alert.severity];
              const isExpanded = expandedAlert === alert.id;
              const hasDetails = alert.rootCauses || alert.recommendedActions;

              return (
                <div key={alert.id} className="px-5 py-3">
                  <button
                    onClick={() => hasDetails && setExpandedAlert(isExpanded ? null : alert.id)}
                    className={cn(
                      "flex items-start gap-2.5 w-full text-left",
                      hasDetails && "cursor-pointer hover:bg-accent/20 -mx-2 px-2 -my-1 py-1 rounded-md tessira-transition"
                    )}
                  >
                    <Icon size={14} className={cn("mt-0.5 shrink-0", ALERT_COLOR[alert.severity])} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs leading-relaxed">{alert.message}</div>
                      <div className="text-[11px] text-muted-foreground/60 mt-0.5">
                        {alert.source} · {alert.timestamp}
                      </div>
                    </div>
                    {hasDetails && (
                      isExpanded
                        ? <ChevronUp size={12} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                        : <ChevronDown size={12} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 ml-5 space-y-2.5 text-xs">
                      {alert.rootCauses && (
                        <div>
                          <div className="font-medium text-muted-foreground uppercase tracking-wider text-[10px] mb-1">Root Causes</div>
                          <ul className="space-y-0.5">
                            {alert.rootCauses.map((cause, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                                <span className="text-destructive mt-0.5">•</span> {cause}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {alert.recommendedActions && (
                        <div>
                          <div className="font-medium text-muted-foreground uppercase tracking-wider text-[10px] mb-1">Recommended Actions</div>
                          <ul className="space-y-0.5">
                            {alert.recommendedActions.map((action, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-primary/80">
                                <span className="mt-0.5">→</span> {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team health ranking with bus factor */}
      <div className="rounded-lg border border-border/50 bg-card">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
          <h3 className="text-sm font-semibold">Team Health Ranking</h3>
          <Link to="/app/signals/teams" className="text-xs text-primary hover:underline">View details</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Health</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Allocation</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Load</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">SPOFs</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Bus Factor</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {teamsSorted.map((t) => (
                <tr key={t.teamId} className="hover:bg-accent/10 tessira-transition">
                  <td className="px-4 py-3">
                    <Link to={`/app/people/teams/${t.teamId}`} className="font-medium hover:text-primary tessira-transition">
                      {t.teamName}
                    </Link>
                    <div className="text-xs text-muted-foreground">{t.memberCount} members</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "font-bold tabular-nums",
                      t.healthScore >= 7.5 ? "text-success" : t.healthScore >= 6 ? "text-warning" : "text-destructive"
                    )}>
                      {t.healthScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">{t.allocation}%</td>
                  <td className="px-4 py-3 text-center"><SignalBadge status={t.deliveryLoad} /></td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("tabular-nums font-medium", t.spofCount > 0 ? "text-destructive" : "text-muted-foreground")}>
                      {t.spofCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "tabular-nums font-medium",
                      (t.busFactor ?? 0) < 2 ? "text-destructive" : (t.busFactor ?? 0) < 3 ? "text-warning" : "text-muted-foreground"
                    )}>
                      {t.busFactor ?? "–"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">{t.coverageScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
