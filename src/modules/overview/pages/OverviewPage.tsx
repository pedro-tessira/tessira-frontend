import { CalendarRange, Users2, Zap, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ── KPI cards ── */
const METRICS = [
  { label: "Active Streams", value: "14", icon: CalendarRange, trend: "+2 this sprint" },
  { label: "Team Allocation", value: "82%", icon: Users2, trend: "3 available" },
  { label: "Skill Coverage", value: "91%", icon: Zap, trend: "3 gaps identified" },
  { label: "Health Score", value: "7.4", icon: Activity, trend: "Stable" },
];

/* ── Chart data ── */
const CAPACITY_TREND = Array.from({ length: 12 }, (_, i) => {
  const week = `W${i + 1}`;
  const base = 75 + Math.round(Math.sin(i * 0.6) * 12 + (Math.random() - 0.5) * 6);
  return { week, allocation: Math.min(100, Math.max(50, base)) };
});

const TEAMS = ["Platform", "Backend", "Frontend", "Mobile", "Data", "DevOps"];
const SKILL_CATEGORIES = ["Languages", "Infra", "Observability", "Security", "Architecture", "Testing"];

const HEATMAP_DATA: { team: string; skill: string; coverage: number }[] = [];
TEAMS.forEach((team) => {
  SKILL_CATEGORIES.forEach((skill) => {
    HEATMAP_DATA.push({ team, skill, coverage: Math.round(40 + Math.random() * 60) });
  });
});

const TEAM_ALLOCATION = [
  { team: "Platform", allocation: 94 },
  { team: "Backend", allocation: 67 },
  { team: "Frontend", allocation: 88 },
  { team: "Mobile", allocation: 72 },
  { team: "Data", allocation: 55 },
  { team: "DevOps", allocation: 102 },
];

const DELIVERY_RISK = [
  { stream: "Auth Rewrite", risk: 82 },
  { stream: "Billing v3", risk: 45 },
  { stream: "API Gateway", risk: 71 },
  { stream: "Mobile SDK", risk: 30 },
  { stream: "Observability", risk: 58 },
];

/* ── Helpers ── */
function allocationColor(v: number) {
  if (v >= 95) return "hsl(var(--destructive))";
  if (v >= 80) return "hsl(var(--warning))";
  return "hsl(var(--success))";
}

function riskColor(v: number) {
  if (v >= 70) return "hsl(var(--destructive))";
  if (v >= 50) return "hsl(var(--warning))";
  return "hsl(var(--success))";
}

function heatmapBg(coverage: number) {
  if (coverage >= 80) return "bg-primary/20";
  if (coverage >= 60) return "bg-warning/15";
  return "bg-destructive/15";
}

function heatmapText(coverage: number) {
  if (coverage >= 80) return "text-primary";
  if (coverage >= 60) return "text-warning";
  return "text-destructive";
}

/* ── Component ── */
export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Engineering capacity and operational health at a glance.
        </p>
      </div>

      {/* KPI Cards */}
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

      {/* Row 1: Capacity Trend | Skill Coverage Heatmap */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Capacity Trend */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Capacity Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Team allocation % over the last 12 weeks</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CAPACITY_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 110]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, "Allocation"]}
                  />
                  <Line type="monotone" dataKey="allocation" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skill Coverage Heatmap */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Skill Coverage</CardTitle>
            <p className="text-xs text-muted-foreground">Proficiency coverage by team and skill category</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr>
                    <th className="text-left py-1.5 pr-2 text-muted-foreground font-medium" />
                    {SKILL_CATEGORIES.map((s) => (
                      <th key={s} className="text-center px-1 py-1.5 text-muted-foreground font-medium truncate max-w-[72px]">
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TEAMS.map((team) => (
                    <tr key={team}>
                      <td className="pr-2 py-1 text-xs font-medium text-foreground whitespace-nowrap">{team}</td>
                      {SKILL_CATEGORIES.map((skill) => {
                        const cell = HEATMAP_DATA.find((d) => d.team === team && d.skill === skill)!;
                        return (
                          <td key={skill} className="px-1 py-1">
                            <div
                              className={`rounded px-1.5 py-1 text-center font-mono font-medium tabular-nums ${heatmapBg(cell.coverage)} ${heatmapText(cell.coverage)}`}
                            >
                              {cell.coverage}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Team Allocation | Delivery Risk */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Team Allocation */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Team Allocation</CardTitle>
            <p className="text-xs text-muted-foreground">Current allocation by team</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TEAM_ALLOCATION} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0, 110]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="team" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={64} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, "Allocation"]}
                  />
                  <Bar dataKey="allocation" radius={[0, 4, 4, 0]} barSize={18}>
                    {TEAM_ALLOCATION.map((entry, i) => (
                      <Cell key={i} fill={allocationColor(entry.allocation)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Risk */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Delivery Risk</CardTitle>
            <p className="text-xs text-muted-foreground">Risk score by delivery stream</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DELIVERY_RISK} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stream" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                    formatter={(v: number) => [v, "Risk Score"]}
                  />
                  <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={18}>
                    {DELIVERY_RISK.map((entry, i) => (
                      <Cell key={i} fill={riskColor(entry.risk)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Activity | Attention Needed */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
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
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Attention Needed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
