import { Link } from "react-router-dom";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { SignalBadge, TrendIndicator, CapacityBar, ScoreGauge } from "../components/SignalIndicators";
import { MOCK_TEAM_SIGNALS } from "../data";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle } from "lucide-react";

export default function TeamSignalsPage() {
  const sorted = [...MOCK_TEAM_SIGNALS].sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Team Signals"
        description="Compare delivery pressure, health, and operational status across teams."
        breadcrumbs={[
          { label: "Signals", href: "/app/signals" },
          { label: "Teams" },
        ]}
      />

      <div className="space-y-4">
        {sorted.map((team) => (
          <div key={team.teamId} className="rounded-lg border border-border/50 bg-card">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
              <div className="flex items-center gap-3">
                <Link
                  to={`/app/people/teams/${team.teamId}`}
                  className="text-sm font-semibold hover:text-primary tessira-transition"
                >
                  {team.teamName}
                </Link>
                <span className="text-xs text-muted-foreground">{team.memberCount} members</span>
              </div>
              <SignalBadge status={team.deliveryLoad} />
            </div>

            {/* Metrics */}
            <div className="p-5">
              <div className="grid gap-6 sm:grid-cols-4">
                <ScoreGauge score={team.healthScore} label="Health Score" />

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Allocation</div>
                  <div className="text-xl font-bold tabular-nums">
                    {team.allocation}%
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        team.allocation >= 90 ? "bg-destructive" : team.allocation >= 80 ? "bg-warning" : "bg-success"
                      )}
                      style={{ width: `${team.allocation}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Velocity Trend</div>
                  <TrendIndicator direction={team.sprintVelocityTrend} value={
                    team.sprintVelocityTrend === "up" ? "Improving" :
                    team.sprintVelocityTrend === "down" ? "Declining" : "Stable"
                  } />
                  <div className="text-xs text-muted-foreground">
                    {team.openEscalations > 0 ? `${team.openEscalations} open escalation${team.openEscalations > 1 ? "s" : ""}` : "No escalations"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Coverage</div>
                  <div className="text-xl font-bold tabular-nums">
                    {team.coverageScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {team.spofCount > 0
                      ? <span className="text-destructive font-medium">{team.spofCount} SPOF{team.spofCount > 1 ? "s" : ""}</span>
                      : <span className="text-success">No SPOFs</span>
                    }
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {team.alerts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50 space-y-1.5">
                  {team.alerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle size={12} className="text-warning mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{alert}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
