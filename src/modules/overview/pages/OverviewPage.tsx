import { CalendarRange, Users2, Zap, Activity, TrendingUp, AlertTriangle } from "lucide-react";

const METRICS = [
  { label: "Active Streams", value: "14", icon: CalendarRange, trend: "+2 this sprint" },
  { label: "Team Allocation", value: "82%", icon: Users2, trend: "3 available" },
  { label: "Skill Coverage", value: "91%", icon: Zap, trend: "3 gaps identified" },
  { label: "Health Score", value: "7.4", icon: Activity, trend: "Stable" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Engineering capacity and operational health at a glance.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-border/50 bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {m.label}
              </span>
              <m.icon size={16} strokeWidth={1.8} className="text-muted-foreground/60" />
            </div>
            <div className="text-2xl font-bold tabular-nums">{m.value}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp size={12} />
              {m.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            {[
              "Sprint 24 planning completed",
              "3 team members returning from PTO",
              "Skill gap alert: Platform Observability",
              "Horizon timeline updated for Q2",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Attention Needed</h2>
          <div className="space-y-3">
            {[
              { text: "Single point of failure: Auth service", severity: "high" },
              { text: "Capacity below 70% for Backend squad", severity: "medium" },
              { text: "2 delivery streams at risk", severity: "high" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <AlertTriangle
                  size={14}
                  className={
                    item.severity === "high"
                      ? "mt-0.5 shrink-0 text-destructive"
                      : "mt-0.5 shrink-0 text-warning"
                  }
                />
                <span className="text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
