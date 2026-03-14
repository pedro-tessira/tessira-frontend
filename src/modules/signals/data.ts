import type {
  OrgSignal, TeamSignal, CapacityEntry, ResilienceEntry, AlertItem,
  DomainRisk, OwnershipLoad, RiskForecast,
} from "./types";
import { getSkillCoverage, getSPOFRisks, getOwnerConcentration, MOCK_DOMAINS, MOCK_SKILLS, MOCK_ASSIGNMENTS } from "@/modules/skills/data";
import { availabilityWindows } from "@/modules/horizon/data";

export const MOCK_ORG_SIGNALS: OrgSignal[] = [
  {
    id: "sig-01", label: "Org Health Score", value: 7.4, unit: "/10",
    status: "healthy", trend: "up", trendValue: "+0.5 vs last sprint",
    description: "Composite score across delivery, capacity, and resilience.",
    history: [6.8, 6.9, 7.0, 6.9, 7.1, 7.2, 7.4], delta: "+0.5",
  },
  {
    id: "sig-02", label: "Delivery On-Track", value: 78, unit: "%",
    status: "warning", trend: "down", trendValue: "−4% vs last sprint",
    description: "Percentage of active streams meeting planned milestones.",
    history: [85, 84, 82, 83, 80, 82, 78], delta: "−4",
  },
  {
    id: "sig-03", label: "Avg Allocation", value: 84, unit: "%",
    status: "warning", trend: "up", trendValue: "+6% vs last sprint",
    description: "Average engineer allocation across all teams.",
    history: [72, 74, 76, 78, 78, 80, 84], delta: "+6",
  },
  {
    id: "sig-04", label: "Open Escalations", value: 3, unit: "",
    status: "warning", trend: "up", trendValue: "+2 this week",
    description: "Unresolved escalations requiring leadership attention.",
    history: [1, 0, 1, 2, 1, 1, 3], delta: "+2",
  },
  {
    id: "sig-05", label: "SPOF Exposure", value: 7, unit: " skills",
    status: "critical", trend: "stable", trendValue: "No change",
    description: "Skills with a single owner and zero backup coverage.",
    history: [5, 6, 6, 7, 7, 7, 7], delta: "0",
  },
  {
    id: "sig-06", label: "Team Coverage", value: 91, unit: "%",
    status: "healthy", trend: "stable", trendValue: "Stable",
    description: "Percentage of critical skills with at least one backup.",
    history: [88, 89, 89, 90, 90, 91, 91], delta: "+1",
  },
];

export const MOCK_TEAM_SIGNALS: TeamSignal[] = [
  {
    teamId: "team-001", teamName: "Platform Core", memberCount: 4,
    allocation: 92, deliveryLoad: "warning", sprintVelocityTrend: "stable",
    healthScore: 7.1, openEscalations: 1, spofCount: 3, coverageScore: 68,
    alerts: ["Auth SPOF — Sarah Chen is sole owner", "Jonas Eriksson on leave — reduced capacity"],
    busFactor: 2,
  },
  {
    teamId: "team-002", teamName: "Backend Services", memberCount: 5,
    allocation: 88, deliveryLoad: "warning", sprintVelocityTrend: "down",
    healthScore: 6.8, openEscalations: 1, spofCount: 2, coverageScore: 72,
    alerts: ["Payment integration sole-owner risk", "Sprint velocity declining 3 consecutive sprints"],
    busFactor: 2,
  },
  {
    teamId: "team-003", teamName: "Product Frontend", memberCount: 4,
    allocation: 76, deliveryLoad: "healthy", sprintVelocityTrend: "up",
    healthScore: 8.2, openEscalations: 0, spofCount: 0, coverageScore: 95,
    alerts: [],
    busFactor: 4,
  },
  {
    teamId: "team-004", teamName: "Data & Observability", memberCount: 3,
    allocation: 94, deliveryLoad: "critical", sprintVelocityTrend: "down",
    healthScore: 5.9, openEscalations: 1, spofCount: 1, coverageScore: 78,
    alerts: ["Team at 94% allocation — near capacity ceiling", "Tomasz Kowalski offboarding — IaC knowledge transfer needed"],
    busFactor: 1,
  },
  {
    teamId: "team-005", teamName: "Engineering Leadership", memberCount: 4,
    allocation: 65, deliveryLoad: "healthy", sprintVelocityTrend: "stable",
    healthScore: 8.5, openEscalations: 0, spofCount: 0, coverageScore: 100,
    alerts: [],
    busFactor: 4,
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
  {
    id: "a-01", severity: "critical",
    message: "Data & Observability team at 94% allocation — approaching capacity ceiling",
    source: "Capacity", timestamp: "2h ago",
    rootCauses: [
      "3 team members covering 6 critical skill areas",
      "Tomasz Kowalski offboarding reduces effective capacity",
      "No capacity buffer for unplanned work",
    ],
    recommendedActions: [
      "Reduce Data & Observability allocation below 85%",
      "Defer lower-priority observability initiatives",
      "Accelerate IaC knowledge transfer before offboarding completes",
    ],
  },
  {
    id: "a-02", severity: "critical",
    message: "Auth service SPOF: Sarah Chen is sole owner with no backup",
    source: "Resilience", timestamp: "4h ago",
    rootCauses: [
      "OAuth / OIDC implementation owned by 1 person",
      "Service Mesh configuration owned by 1 person",
      "No cross-training plan established for auth domain",
    ],
    recommendedActions: [
      "Assign backup owner for OAuth / OIDC implementation",
      "Start cross-training program for Service Mesh Config",
      "Document auth system runbooks for emergency use",
    ],
  },
  {
    id: "a-03", severity: "warning",
    message: "Backend Services sprint velocity declining for 3 consecutive sprints",
    source: "Delivery", timestamp: "1d ago",
    rootCauses: [
      "Marcus Rivera context-switching across 5 critical skill areas",
      "Payment domain complexity increasing without backup coverage",
      "Technical debt in settlement logic slowing development",
    ],
    recommendedActions: [
      "Investigate velocity drop in Backend Services team",
      "Reduce Marcus Rivera's ownership load — assign backups for Fraud Rules",
      "Allocate sprint capacity for settlement logic refactoring",
    ],
  },
  {
    id: "a-04", severity: "warning",
    message: "Tomasz Kowalski offboarding — IaC knowledge transfer incomplete",
    source: "People", timestamp: "1d ago",
    rootCauses: [
      "Infrastructure as Code skill has no backup",
      "Knowledge transfer started late in offboarding process",
    ],
    recommendedActions: [
      "Prioritize IaC knowledge transfer sessions this sprint",
      "Assign Alex Novak as IaC backup with dedicated pairing time",
    ],
  },
  {
    id: "a-05", severity: "warning",
    message: "Platform Core: Jonas Eriksson on leave reduces team to 75% capacity",
    source: "Capacity", timestamp: "2d ago",
    rootCauses: [
      "Jonas Eriksson is backup for Session Management",
      "Team already at 92% allocation before leave",
    ],
    recommendedActions: [
      "Defer non-critical Platform Core work during leave period",
      "Ensure Session Management coverage with remaining team",
    ],
  },
  {
    id: "a-06", severity: "info",
    message: "Product Frontend health score improved to 8.2 (+0.4)",
    source: "Health", timestamp: "3d ago",
  },
];

// ── Derived helpers ──

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

// ── Domain Risk Map ──

export function getDomainRisks(): DomainRisk[] {
  const coverage = getSkillCoverage();
  const spofs = getSPOFRisks();

  return MOCK_DOMAINS.map((domain) => {
    const domainSkills = MOCK_SKILLS.filter((s) => s.domainId === domain.id);
    const domainCoverage = coverage.filter((c) => c.domainId === domain.id);
    const domainSpofs = spofs.filter((sp) => domainSkills.some((s) => s.id === sp.skillId));

    const avgCov = domainCoverage.length > 0
      ? Math.round(domainCoverage.reduce((s, c) => s + c.coverageScore, 0) / domainCoverage.length * 50)
      : 100;

    let riskLevel: "healthy" | "warning" | "critical" = "healthy";
    if (domainSpofs.some((sp) => sp.severity === "critical")) riskLevel = "critical";
    else if (domainSpofs.length > 0 || avgCov < 60) riskLevel = "warning";

    return {
      domain: domain.name,
      spofCount: domainSpofs.length,
      coveragePct: Math.min(avgCov, 100),
      riskLevel,
      skills: domainSkills.map((s) => s.name),
    };
  }).sort((a, b) => {
    const order = { critical: 0, warning: 1, healthy: 2 };
    return order[a.riskLevel] - order[b.riskLevel];
  });
}

// ── Ownership Load (for Signals context) ──

export function getOwnershipLoad(): OwnershipLoad[] {
  const concentration = getOwnerConcentration();
  return concentration.map((c) => ({
    employeeId: c.employeeId,
    employeeName: c.employeeName,
    teamName: c.teamName,
    criticalOwnerships: c.criticalSkillCount,
    skills: c.skills.map((s) => s.name),
  }));
}

// ── Risk Forecasting (from Horizon PTO data) ──

export function getRiskForecasts(): RiskForecast[] {
  const now = new Date();
  const twoWeeksOut = new Date();
  twoWeeksOut.setDate(now.getDate() + 14);

  const upcomingPTO = availabilityWindows.filter((w) => {
    if (w.status !== "unavailable") return false;
    const start = new Date(w.startDate);
    return start >= now && start <= twoWeeksOut;
  });

  // Map PTO to risk forecasts by checking if the person owns critical skills
  const forecasts: RiskForecast[] = [];

  upcomingPTO.forEach((pto) => {
    const ownedSkills = MOCK_ASSIGNMENTS.filter(
      (a) => a.employeeName === pto.employeeName && a.role === "owner"
    );
    if (ownedSkills.length === 0) return;

    const criticalSkills = ownedSkills.filter((a) => {
      const skill = MOCK_SKILLS.find((s) => s.id === a.skillId);
      return skill && (skill.criticality === "critical" || skill.criticality === "high");
    });

    const impactedAreas = criticalSkills.map((a) => {
      const skill = MOCK_SKILLS.find((s) => s.id === a.skillId);
      return skill?.name ?? a.skillId;
    });

    // Simulate projected coverage drop
    const projectedCoverage = Math.max(20, 100 - (impactedAreas.length * 15));

    const startStr = new Date(pto.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = new Date(pto.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    forecasts.push({
      employeeName: pto.employeeName,
      teamName: pto.teamName,
      reason: pto.reason ?? "PTO",
      dateRange: `${startStr} – ${endStr}`,
      impactedAreas,
      projectedCoverage,
    });
  });

  return forecasts.sort((a, b) => a.projectedCoverage - b.projectedCoverage);
}
