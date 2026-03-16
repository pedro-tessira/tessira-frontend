/* ── Overview Dashboard Data ── */

export const METRICS = [
  { label: "Active Initiatives", value: "6", trend: "+2 this sprint", link: "/app/work/initiatives" },
  { label: "Active Streams", value: "5", trend: "All domains covered", link: "/app/work" },
  { label: "Free Capacity", value: "45%", trend: "Across 12 engineers", link: "/app/horizon" },
  { label: "Skill Coverage", value: "91%", trend: "3 gaps identified", link: "/app/skills" },
];

/* Capacity Forecast — next 4 weeks projected */
export const CAPACITY_FORECAST = [
  { week: "This week", current: 82, projected: 82 },
  { week: "Week 2", current: null, projected: 78 },
  { week: "Week 3", current: null, projected: 71 },
  { week: "Week 4", current: null, projected: 85 },
];

/* Delivery Streams Load */
export const STREAM_LOAD = [
  { stream: "Auth Service", fte: 4.2, status: "heavy" as const },
  { stream: "Billing v3", fte: 2.8, status: "normal" as const },
  { stream: "API Gateway", fte: 3.5, status: "heavy" as const },
  { stream: "Mobile SDK", fte: 1.6, status: "light" as const },
  { stream: "Observability", fte: 2.1, status: "normal" as const },
];

/* Skill Coverage Heatmap */
export const TEAMS = ["Platform", "Backend", "Frontend", "Mobile", "Data", "DevOps"];
export const SKILL_CATEGORIES = ["Languages", "Infra", "Observability", "Security", "Architecture", "Testing"];

export interface HeatmapCell {
  team: string;
  skill: string;
  coverage: number;
}

const seed = (t: number, s: number) => Math.abs(Math.sin(t * 13 + s * 7) * 9999) % 1;

export const HEATMAP_DATA: HeatmapCell[] = [];
TEAMS.forEach((team, ti) => {
  SKILL_CATEGORIES.forEach((skill, si) => {
    HEATMAP_DATA.push({ team, skill, coverage: Math.round(40 + seed(ti, si) * 60) });
  });
});

/* System Resilience Map */
export const SYSTEMS = ["Auth", "Payments", "API GW", "Search", "Notifications"];
export const ENGINEERS = ["A. Morgan", "S. Chen", "M. Johnson", "P. Patel", "T. Weber", "L. Müller"];

export interface ResilienceCell {
  system: string;
  engineer: string;
  level: 0 | 1 | 2 | 3; // 0=none, 1=aware, 2=proficient, 3=owner
}

export const RESILIENCE_DATA: ResilienceCell[] = [];
SYSTEMS.forEach((system, si) => {
  ENGINEERS.forEach((engineer, ei) => {
    const v = seed(si + 3, ei + 5);
    const level = si === ei ? 3 : v > 0.7 ? 2 : v > 0.4 ? 1 : 0;
    RESILIENCE_DATA.push({ system, engineer, level: level as 0 | 1 | 2 | 3 });
  });
});

/* Team Allocation */
export const TEAM_ALLOCATION = [
  { team: "Platform", allocation: 94 },
  { team: "Backend", allocation: 67 },
  { team: "Frontend", allocation: 88 },
  { team: "Mobile", allocation: 72 },
  { team: "Data", allocation: 55 },
  { team: "DevOps", allocation: 102 },
];

/* Delivery Risk */
export const DELIVERY_RISK = [
  { stream: "Auth Rewrite", risk: 82 },
  { stream: "Billing v3", risk: 45 },
  { stream: "API Gateway", risk: 71 },
  { stream: "Mobile SDK", risk: 30 },
  { stream: "Observability", risk: 58 },
];

/* Signals */
export const SIGNALS = [
  { text: "SPOF detected: Auth service owned by 1 engineer", severity: "critical" as const, module: "/app/skills/risk" },
  { text: "Platform team allocation at 94%", severity: "high" as const, module: "/app/signals/capacity" },
  { text: "Skill gap: Mobile — Security coverage at 42%", severity: "high" as const, module: "/app/skills/coverage" },
  { text: "2 delivery streams risk score above 70", severity: "medium" as const, module: "/app/signals/resilience" },
];

/* Recent Activity */
export const RECENT_ACTIVITY = [
  "Sprint 24 planning completed",
  "3 team members returning from PTO",
  "Skill gap alert: Platform Observability",
  "Horizon timeline updated for Q2",
];

/* ── Helpers ── */
export function allocationColor(v: number) {
  if (v >= 95) return "hsl(var(--destructive))";
  if (v >= 80) return "hsl(var(--warning))";
  return "hsl(var(--success))";
}

export function riskColor(v: number) {
  if (v >= 70) return "hsl(var(--destructive))";
  if (v >= 50) return "hsl(var(--warning))";
  return "hsl(var(--success))";
}

export function streamLoadColor(status: "heavy" | "normal" | "light") {
  if (status === "heavy") return "hsl(var(--warning))";
  if (status === "light") return "hsl(var(--muted-foreground))";
  return "hsl(var(--primary))";
}

export function heatmapBg(coverage: number) {
  if (coverage >= 80) return "bg-primary/20";
  if (coverage >= 60) return "bg-warning/15";
  return "bg-destructive/15";
}

export function heatmapText(coverage: number) {
  if (coverage >= 80) return "text-primary";
  if (coverage >= 60) return "text-warning";
  return "text-destructive";
}

export function resilienceBg(level: number) {
  if (level === 3) return "bg-primary/25";
  if (level === 2) return "bg-primary/12";
  if (level === 1) return "bg-muted";
  return "bg-transparent";
}

export function resilienceLabel(level: number) {
  if (level === 3) return "Owner";
  if (level === 2) return "Proficient";
  if (level === 1) return "Aware";
  return "—";
}

export function resilienceText(level: number) {
  if (level === 3) return "text-primary font-semibold";
  if (level === 2) return "text-primary/70";
  if (level === 1) return "text-muted-foreground";
  return "text-muted-foreground/30";
}
