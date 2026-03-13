import type {
  OrgSignal, TeamSignal, CapacityEntry, ResilienceEntry, AlertItem,
} from "./types";

export const MOCK_ORG_SIGNALS: OrgSignal[] = [
  {
    id: "sig-01", label: "Org Health Score", value: 7.4, unit: "/10",
    status: "healthy", trend: "stable", trendValue: "+0.1 vs last sprint",
    description: "Composite score across delivery, capacity, and resilience.",
  },
  {
    id: "sig-02", label: "Delivery On-Track", value: 78, unit: "%",
    status: "warning", trend: "down", trendValue: "−4% vs last sprint",
    description: "Percentage of active streams meeting planned milestones.",
  },
  {
    id: "sig-03", label: "Avg Allocation", value: 84, unit: "%",
    status: "warning", trend: "up", trendValue: "+6% vs last sprint",
    description: "Average engineer allocation across all teams.",
  },
  {
    id: "sig-04", label: "Open Escalations", value: 3, unit: "",
    status: "warning", trend: "up", trendValue: "+2 this week",
    description: "Unresolved escalations requiring leadership attention.",
  },
  {
    id: "sig-05", label: "SPOF Exposure", value: 7, unit: " skills",
    status: "critical", trend: "stable", trendValue: "No change",
    description: "Skills with a single owner and zero backup coverage.",
  },
  {
    id: "sig-06", label: "Team Coverage", value: 91, unit: "%",
    status: "healthy", trend: "stable", trendValue: "Stable",
    description: "Percentage of critical skills with at least one backup.",
  },
];

export const MOCK_TEAM_SIGNALS: TeamSignal[] = [
  {
    teamId: "team-001", teamName: "Platform Core", memberCount: 4,
    allocation: 92, deliveryLoad: "warning", sprintVelocityTrend: "stable",
    healthScore: 7.1, openEscalations: 1, spofCount: 3, coverageScore: 68,
    alerts: ["Auth SPOF — Sarah Chen is sole owner", "Jonas Eriksson on leave — reduced capacity"],
  },
  {
    teamId: "team-002", teamName: "Backend Services", memberCount: 5,
    allocation: 88, deliveryLoad: "warning", sprintVelocityTrend: "down",
    healthScore: 6.8, openEscalations: 1, spofCount: 2, coverageScore: 72,
    alerts: ["Payment integration sole-owner risk", "Sprint velocity declining 3 consecutive sprints"],
  },
  {
    teamId: "team-003", teamName: "Product Frontend", memberCount: 4,
    allocation: 76, deliveryLoad: "healthy", sprintVelocityTrend: "up",
    healthScore: 8.2, openEscalations: 0, spofCount: 0, coverageScore: 95,
    alerts: [],
  },
  {
    teamId: "team-004", teamName: "Data & Observability", memberCount: 3,
    allocation: 94, deliveryLoad: "critical", sprintVelocityTrend: "down",
    healthScore: 5.9, openEscalations: 1, spofCount: 1, coverageScore: 78,
    alerts: ["Team at 94% allocation — near capacity ceiling", "Tomasz Kowalski offboarding — IaC knowledge transfer needed"],
  },
  {
    teamId: "team-005", teamName: "Engineering Leadership", memberCount: 4,
    allocation: 65, deliveryLoad: "healthy", sprintVelocityTrend: "stable",
    healthScore: 8.5, openEscalations: 0, spofCount: 0, coverageScore: 100,
    alerts: [],
  },
];

export const MOCK_CAPACITY: CapacityEntry[] = [
  { teamId: "team-001", teamName: "Platform Core", totalCapacity: 4, allocated: 3.7, available: 0.3, onLeave: 1, overloaded: 1, trend: "up", riskLevel: "warning" },
  { teamId: "team-002", teamName: "Backend Services", totalCapacity: 5, allocated: 4.4, available: 0.6, onLeave: 0, overloaded: 0, trend: "stable", riskLevel: "warning" },
  { teamId: "team-003", teamName: "Product Frontend", totalCapacity: 4, allocated: 3.0, available: 1.0, onLeave: 0, overloaded: 0, trend: "down", riskLevel: "healthy" },
  { teamId: "team-004", teamName: "Data & Observability", totalCapacity: 3, allocated: 2.8, available: 0.2, onLeave: 0, overloaded: 1, trend: "up", riskLevel: "critical" },
  { teamId: "team-005", teamName: "Engineering Leadership", totalCapacity: 4, allocated: 2.6, available: 1.4, onLeave: 0, overloaded: 0, trend: "stable", riskLevel: "healthy" },
];

export const MOCK_RESILIENCE: ResilienceEntry[] = [
  { area: "Auth & Identity", domain: "System", ownerCount: 1, backupCount: 0, coverageScore: 35, status: "critical", riskDetail: "Single owner (Sarah Chen), no backup. PTO or attrition creates immediate delivery risk.", linkedTeam: "Platform Core" },
  { area: "Payment Processing", domain: "System", ownerCount: 1, backupCount: 0, coverageScore: 40, status: "critical", riskDetail: "Marcus Rivera is sole owner of Stripe integration and PCI compliance knowledge.", linkedTeam: "Backend Services" },
  { area: "Service Mesh Config", domain: "System", ownerCount: 1, backupCount: 0, coverageScore: 30, status: "critical", riskDetail: "Critical infrastructure skill with single owner and no cross-training plan.", linkedTeam: "Platform Core" },
  { area: "Infrastructure as Code", domain: "Tooling", ownerCount: 1, backupCount: 0, coverageScore: 45, status: "warning", riskDetail: "Tomasz Kowalski is offboarding — knowledge transfer urgently needed.", linkedTeam: "Data & Observability" },
  { area: "Distributed Tracing", domain: "Tooling", ownerCount: 1, backupCount: 0, coverageScore: 50, status: "warning", riskDetail: "Alex Novak is sole operator. No documented runbooks.", linkedTeam: "Data & Observability" },
  { area: "Kafka Operations", domain: "Platform", ownerCount: 1, backupCount: 1, coverageScore: 70, status: "healthy", riskDetail: "Carlos Mendez owns, Alex Novak is backup. Adequate for current scale.", linkedTeam: "Data & Observability" },
  { area: "React Architecture", domain: "Platform", ownerCount: 1, backupCount: 1, coverageScore: 80, status: "healthy", riskDetail: "Aisha Patel owns, Priya Sharma is proficient backup.", linkedTeam: "Product Frontend" },
  { area: "On-Call Coordination", domain: "Practice", ownerCount: 1, backupCount: 1, coverageScore: 85, status: "healthy", riskDetail: "David Okafor owns, Lin Zhou is backup. Well-documented process.", linkedTeam: "Engineering Leadership" },
  { area: "Datadog / APM", domain: "Tooling", ownerCount: 1, backupCount: 0, coverageScore: 50, status: "warning", riskDetail: "Alex Novak sole owner — concentration risk across observability stack.", linkedTeam: "Data & Observability" },
  { area: "Rate Limiting", domain: "System", ownerCount: 1, backupCount: 0, coverageScore: 55, status: "warning", riskDetail: "Marcus Rivera owns, Mei Tanaka is learning but not yet backup-ready.", linkedTeam: "Backend Services" },
];

export const MOCK_ALERTS: AlertItem[] = [
  { id: "a-01", severity: "critical", message: "Data & Observability team at 94% allocation — approaching capacity ceiling", source: "Capacity", timestamp: "2h ago" },
  { id: "a-02", severity: "critical", message: "Auth service SPOF: Sarah Chen is sole owner with no backup", source: "Resilience", timestamp: "4h ago" },
  { id: "a-03", severity: "warning", message: "Backend Services sprint velocity declining for 3 consecutive sprints", source: "Delivery", timestamp: "1d ago" },
  { id: "a-04", severity: "warning", message: "Tomasz Kowalski offboarding — IaC knowledge transfer incomplete", source: "People", timestamp: "1d ago" },
  { id: "a-05", severity: "warning", message: "Platform Core: Jonas Eriksson on leave reduces team to 75% capacity", source: "Capacity", timestamp: "2d ago" },
  { id: "a-06", severity: "info", message: "Product Frontend health score improved to 8.2 (+0.4)", source: "Health", timestamp: "3d ago" },
];

// Derived helpers
export function getSignalsStats() {
  const teams = MOCK_TEAM_SIGNALS;
  return {
    avgHealthScore: +(teams.reduce((s, t) => s + t.healthScore, 0) / teams.length).toFixed(1),
    teamsAtRisk: teams.filter((t) => t.deliveryLoad !== "healthy").length,
    totalEscalations: teams.reduce((s, t) => s + t.openEscalations, 0),
    criticalAlerts: MOCK_ALERTS.filter((a) => a.severity === "critical").length,
    avgAllocation: Math.round(teams.reduce((s, t) => s + t.allocation, 0) / teams.length),
    criticalResilience: MOCK_RESILIENCE.filter((r) => r.status === "critical").length,
  };
}
