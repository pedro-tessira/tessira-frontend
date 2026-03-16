import type {
  OrgSignal, TeamSignal, CapacityEntry, ResilienceEntry, AlertItem,
  DomainRisk, OwnershipLoad, RiskForecast, SignalStatus, TrendDirection,
} from "./types";
import { getSkillCoverage, getSPOFRisks, getOwnerConcentration, MOCK_DOMAINS, MOCK_SKILLS, MOCK_ASSIGNMENTS } from "@/modules/skills/data";
import { availabilityWindows } from "@/modules/horizon/data";

// ── Capacity data (static — represents current team allocation snapshot) ──

export const MOCK_CAPACITY: CapacityEntry[] = [
  { teamId: "team-001", teamName: "Platform Core", totalCapacity: 4, allocated: 3.7, available: 0.3, onLeave: 1, overloaded: 1, trend: "up", riskLevel: "warning" },
  { teamId: "team-002", teamName: "Backend Services", totalCapacity: 5, allocated: 4.4, available: 0.6, onLeave: 0, overloaded: 0, trend: "stable", riskLevel: "warning" },
  { teamId: "team-003", teamName: "Product Frontend", totalCapacity: 4, allocated: 3.0, available: 1.0, onLeave: 0, overloaded: 0, trend: "down", riskLevel: "healthy" },
  { teamId: "team-004", teamName: "Data & Observability", totalCapacity: 3, allocated: 2.8, available: 0.2, onLeave: 0, overloaded: 1, trend: "up", riskLevel: "critical" },
  { teamId: "team-005", teamName: "Engineering Leadership", totalCapacity: 4, allocated: 2.6, available: 1.4, onLeave: 0, overloaded: 0, trend: "stable", riskLevel: "healthy" },
];

// ── Resilience data (static — area-level coverage) ──

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

// ── Derived Team Signals ──

/**
 * Compute team coverage score from skill assignments.
 * For each skill owned by the team, score = owners*1.0 + backups*0.6 + learners*0.3
 * Normalize to 0-100 where 2.0 raw score per skill = 100%.
 */
function computeTeamCoverage(teamId: string): { coverageScore: number; spofCount: number; busFactor: number } {
  const teamAssignments = MOCK_ASSIGNMENTS.filter((a) => a.teamId === teamId);
  const teamSkillIds = [...new Set(teamAssignments.map((a) => a.skillId))];

  if (teamSkillIds.length === 0) return { coverageScore: 100, spofCount: 0, busFactor: 5 };

  let totalScore = 0;
  let spofCount = 0;
  let minOwners = Infinity;

  teamSkillIds.forEach((skillId) => {
    const skillAssignments = MOCK_ASSIGNMENTS.filter((a) => a.skillId === skillId);
    const owners = skillAssignments.filter((a) => a.role === "owner").length;
    const backups = skillAssignments.filter((a) => a.role === "backup").length;
    const learners = skillAssignments.filter((a) => a.role === "learner").length;

    const rawScore = owners * 1.0 + backups * 0.6 + learners * 0.3;
    totalScore += Math.min(rawScore / 2.0, 1.0); // normalize per skill, cap at 100%

    if (owners <= 1 && backups === 0) spofCount++;
    const effectivePeople = owners + backups;
    if (effectivePeople < minOwners) minOwners = effectivePeople;
  });

  const coverageScore = Math.round((totalScore / teamSkillIds.length) * 100);
  const busFactor = minOwners === Infinity ? 5 : Math.min(minOwners, 5);

  return { coverageScore, spofCount, busFactor };
}

/**
 * Health Score = weighted composite (0-10):
 *   - Allocation pressure: lower allocation = healthier
 *   - Coverage score: higher coverage = healthier
 *   - SPOF count: fewer SPOFs = healthier
 *   - Bus factor: higher bus factor = healthier
 *
 * Weights are normalized so they always sum to 1.0.
 */
export function computeHealthScore(
  allocationPct: number,
  coverageScore: number,
  spofCount: number,
  busFactor: number,
  weights = { allocation: 0.3, coverage: 0.3, spof: 0.2, busFactor: 0.2 },
): number {
  // Allocation: 100%→0, 50%→10. Invert and scale.
  const allocScore = Math.max(0, Math.min(10, (100 - allocationPct) / 5));
  // Coverage: 0%→0, 100%→10
  const covScore = coverageScore / 10;
  // SPOFs: 0→10, 5+→0
  const spofScore = Math.max(0, 10 - spofCount * 2);
  // Bus factor: 0→0, 4+→10
  const bfScore = Math.min(busFactor * 2.5, 10);

  const weighted =
    allocScore * weights.allocation +
    covScore * weights.coverage +
    spofScore * weights.spof +
    bfScore * weights.busFactor;
  return Math.round(weighted * 10) / 10;
}

/**
 * Derive delivery load status from allocation percentage.
 */
function deriveDeliveryLoad(allocationPct: number): SignalStatus {
  if (allocationPct >= 90) return "critical";
  if (allocationPct >= 80) return "warning";
  return "healthy";
}

/**
 * Generate contextual alerts for a team based on derived data.
 */
function generateTeamAlerts(
  teamName: string,
  teamId: string,
  allocationPct: number,
  spofCount: number,
  busFactor: number,
  onLeave: number,
): string[] {
  const alerts: string[] = [];

  // SPOF alerts
  if (spofCount > 0) {
    const teamSpofs = MOCK_ASSIGNMENTS
      .filter((a) => a.teamId === teamId && a.role === "owner")
      .filter((a) => {
        const allForSkill = MOCK_ASSIGNMENTS.filter((sa) => sa.skillId === a.skillId);
        return allForSkill.filter((sa) => sa.role === "owner").length <= 1
          && allForSkill.filter((sa) => sa.role === "backup").length === 0;
      });
    const uniqueSpofOwners = [...new Set(teamSpofs.map((a) => a.employeeName))];
    uniqueSpofOwners.forEach((name) => {
      const skills = teamSpofs.filter((a) => a.employeeName === name);
      const skillNames = skills.map((a) => {
        const skill = MOCK_SKILLS.find((s) => s.id === a.skillId);
        return skill?.name ?? a.skillId;
      });
      alerts.push(`${name} is sole owner of ${skillNames.join(", ")} — no backup`);
    });
  }

  // Capacity alerts
  if (allocationPct >= 90) {
    alerts.push(`Team at ${allocationPct}% allocation — approaching capacity ceiling`);
  }

  // Bus factor alert
  if (busFactor < 2) {
    alerts.push(`Bus factor of ${busFactor} — critical knowledge concentration risk`);
  }

  // Leave alert
  if (onLeave > 0) {
    alerts.push(`${onLeave} member${onLeave > 1 ? "s" : ""} on leave — reduced capacity`);
  }

  return alerts;
}

/**
 * Compute all team signals from skills + capacity source data.
 * Accepts optional normalized weights for health score computation.
 */
export function computeTeamSignals(
  weights?: { allocation: number; coverage: number; spof: number; busFactor: number },
): TeamSignal[] {
  return MOCK_CAPACITY.map((cap) => {
    const allocationPct = Math.round((cap.allocated / cap.totalCapacity) * 100);
    const { coverageScore, spofCount, busFactor } = computeTeamCoverage(cap.teamId);
    const healthScore = computeHealthScore(allocationPct, coverageScore, spofCount, busFactor, weights);
    const deliveryLoad = deriveDeliveryLoad(allocationPct);
    const alerts = generateTeamAlerts(cap.teamName, cap.teamId, allocationPct, spofCount, busFactor, cap.onLeave);

    return {
      teamId: cap.teamId,
      teamName: cap.teamName,
      memberCount: cap.totalCapacity,
      allocation: allocationPct,
      deliveryLoad,
      capacityTrend: cap.trend,
      healthScore,
      spofCount,
      coverageScore,
      alerts,
      busFactor,
    };
  });
}

// Backwards-compatible export (default weights)
export const MOCK_TEAM_SIGNALS: TeamSignal[] = computeTeamSignals();

// ── Org Signals (derived from team signals) ──

function computeOrgSignals(): OrgSignal[] {
  const teams = MOCK_TEAM_SIGNALS;
  const avgHealth = +(teams.reduce((s, t) => s + t.healthScore, 0) / teams.length).toFixed(1);
  const avgAllocation = Math.round(teams.reduce((s, t) => s + t.allocation, 0) / teams.length);
  const totalSpofs = teams.reduce((s, t) => s + t.spofCount, 0);
  const avgCoverage = Math.round(teams.reduce((s, t) => s + t.coverageScore, 0) / teams.length);
  const teamsAtRisk = teams.filter((t) => t.deliveryLoad !== "healthy").length;

  return [
    {
      id: "sig-01", label: "Org Health Score", value: avgHealth, unit: "/10",
      status: avgHealth >= 7 ? "healthy" : avgHealth >= 5.5 ? "warning" : "critical",
      trend: "stable", trendValue: "Composite of all teams",
      description: "Weighted composite across allocation, coverage, SPOFs, and bus factor.",
      history: [6.8, 6.9, 7.0, 6.9, 7.1, 7.2, avgHealth], delta: "0",
    },
    {
      id: "sig-02", label: "Avg Allocation", value: avgAllocation, unit: "%",
      status: avgAllocation >= 85 ? "critical" : avgAllocation >= 75 ? "warning" : "healthy",
      trend: avgAllocation >= 80 ? "up" : "stable", trendValue: `${avgAllocation}% avg across teams`,
      description: "Average engineer allocation across all teams.",
      history: [72, 74, 76, 78, 78, 80, avgAllocation], delta: avgAllocation >= 80 ? "+2" : "0",
    },
    {
      id: "sig-03", label: "SPOF Exposure", value: totalSpofs, unit: " skills",
      status: totalSpofs >= 5 ? "critical" : totalSpofs >= 3 ? "warning" : "healthy",
      trend: "stable", trendValue: "Skills with single owner, no backup",
      description: "Skills with a single owner and zero backup coverage.",
      history: [5, 6, 6, 7, 7, 7, totalSpofs], delta: "0",
    },
    {
      id: "sig-04", label: "Avg Coverage", value: avgCoverage, unit: "%",
      status: avgCoverage >= 75 ? "healthy" : avgCoverage >= 55 ? "warning" : "critical",
      trend: "stable", trendValue: "Across all team skills",
      description: "Average skill coverage score across all teams.",
      history: [60, 62, 63, 65, 65, 66, avgCoverage], delta: "0",
    },
    {
      id: "sig-05", label: "Teams At Risk", value: teamsAtRisk, unit: "",
      status: teamsAtRisk >= 3 ? "critical" : teamsAtRisk >= 1 ? "warning" : "healthy",
      trend: teamsAtRisk >= 2 ? "up" : "stable", trendValue: `${teamsAtRisk} of ${teams.length} teams`,
      description: "Teams with delivery load at warning or critical levels.",
      history: [1, 1, 2, 2, 2, 3, teamsAtRisk], delta: "0",
    },
  ];
}

export const MOCK_ORG_SIGNALS: OrgSignal[] = computeOrgSignals();

// ── Alerts (derived from team data — no escalation source) ──

function computeAlerts(): AlertItem[] {
  const alerts: AlertItem[] = [];
  const teams = MOCK_TEAM_SIGNALS;

  // Capacity alerts
  teams.filter((t) => t.allocation >= 90).forEach((t, i) => {
    alerts.push({
      id: `a-cap-${i}`,
      severity: "critical",
      message: `${t.teamName} at ${t.allocation}% allocation — approaching capacity ceiling`,
      source: "Capacity",
      timestamp: "Current",
      rootCauses: [
        `${t.memberCount} members covering ${t.spofCount > 0 ? `${t.spofCount} SPOF skill areas` : "high workload"}`,
        "Limited capacity buffer for unplanned work",
      ],
      recommendedActions: [
        `Reduce ${t.teamName} allocation below 85%`,
        "Defer lower-priority initiatives",
      ],
    });
  });

  // SPOF alerts
  const spofRisks = getSPOFRisks();
  const criticalSpofs = spofRisks.filter((s) => s.severity === "critical");
  if (criticalSpofs.length > 0) {
    alerts.push({
      id: "a-spof-crit",
      severity: "critical",
      message: `${criticalSpofs.length} critical SPOF${criticalSpofs.length > 1 ? "s" : ""}: ${criticalSpofs.map((s) => s.skillName).join(", ")}`,
      source: "Resilience",
      timestamp: "Current",
      rootCauses: criticalSpofs.map((s) => `${s.skillName} owned solely by ${s.ownerName} (${s.ownerTeam})`),
      recommendedActions: criticalSpofs.map((s) => `Assign backup owner for ${s.skillName}`),
    });
  }

  // Concentration alerts
  const concentration = getOwnerConcentration();
  concentration.filter((c) => c.criticalSkillCount >= 4).forEach((c, i) => {
    alerts.push({
      id: `a-conc-${i}`,
      severity: "warning",
      message: `${c.employeeName} owns ${c.criticalSkillCount} critical skills — high concentration risk`,
      source: "Resilience",
      timestamp: "Current",
      rootCauses: [
        `${c.employeeName} is sole owner of: ${c.skills.map((s) => s.name).join(", ")}`,
        "Context-switching across too many critical areas",
      ],
      recommendedActions: [
        `Reduce ${c.employeeName}'s ownership load — assign backups`,
        "Prioritize cross-training for highest-criticality skills",
      ],
    });
  });

  // Bus factor alerts
  teams.filter((t) => (t.busFactor ?? 0) < 2).forEach((t, i) => {
    alerts.push({
      id: `a-bf-${i}`,
      severity: "warning",
      message: `${t.teamName} bus factor of ${t.busFactor} — losing one person impacts operations`,
      source: "Resilience",
      timestamp: "Current",
      rootCauses: [
        "Critical skills concentrated in too few people",
        `${t.spofCount} skills have no backup coverage`,
      ],
      recommendedActions: [
        `Start cross-training program in ${t.teamName}`,
        "Identify highest-risk skills for immediate backup assignment",
      ],
    });
  });

  // Healthy team info
  teams.filter((t) => t.healthScore >= 7.5).forEach((t, i) => {
    alerts.push({
      id: `a-info-${i}`,
      severity: "info",
      message: `${t.teamName} health score of ${t.healthScore} — well balanced`,
      source: "Health",
      timestamp: "Current",
    });
  });

  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export const MOCK_ALERTS: AlertItem[] = computeAlerts();

// ── Derived helpers ──

export function getSignalsStats() {
  const teams = MOCK_TEAM_SIGNALS;
  return {
    avgHealthScore: +(teams.reduce((s, t) => s + t.healthScore, 0) / teams.length).toFixed(1),
    teamsAtRisk: teams.filter((t) => t.deliveryLoad !== "healthy").length,
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
