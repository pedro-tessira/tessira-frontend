import type {
  OrgSignal, TeamSignal, CapacityEntry, ResilienceEntry, AlertItem,
  StreamRisk, OwnershipLoad, RiskForecast, SignalStatus, TrendDirection,
  PriorityRisk,
} from "./types";
import { getSkillCoverage, getSPOFRisks, getOwnerConcentration, MOCK_DOMAINS, MOCK_SKILLS, MOCK_ASSIGNMENTS } from "@/modules/skills/data";
import { availabilityWindows } from "@/modules/horizon/data";
import {
  valueStreams, initiatives, workAllocations,
  getInitiativesForValueStream, getAllocationsForInitiative,
} from "@/modules/work/data";

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
    totalScore += Math.min(rawScore / 2.0, 1.0);

    if (owners <= 1 && backups === 0) spofCount++;
    const effectivePeople = owners + backups;
    if (effectivePeople < minOwners) minOwners = effectivePeople;
  });

  const coverageScore = Math.round((totalScore / teamSkillIds.length) * 100);
  const busFactor = minOwners === Infinity ? 5 : Math.min(minOwners, 5);

  return { coverageScore, spofCount, busFactor };
}

/**
 * Delivery Health Score = weighted composite (0-10).
 */
export function computeHealthScore(
  allocationPct: number,
  coverageScore: number,
  spofCount: number,
  busFactor: number,
  weights = { allocation: 0.3, coverage: 0.3, spof: 0.2, busFactor: 0.2 },
): number {
  const allocScore = Math.max(0, Math.min(10, (100 - allocationPct) / 5));
  const covScore = coverageScore / 10;
  const spofScore = Math.max(0, 10 - spofCount * 2);
  const bfScore = Math.min(busFactor * 2.5, 10);

  const weighted =
    allocScore * weights.allocation +
    covScore * weights.coverage +
    spofScore * weights.spof +
    bfScore * weights.busFactor;
  return Math.round(weighted * 10) / 10;
}

function deriveDeliveryLoad(allocationPct: number): SignalStatus {
  if (allocationPct >= 90) return "critical";
  if (allocationPct >= 80) return "warning";
  return "healthy";
}

function generateTeamAlerts(
  teamName: string,
  teamId: string,
  allocationPct: number,
  spofCount: number,
  busFactor: number,
  onLeave: number,
): string[] {
  const alerts: string[] = [];

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

  if (allocationPct >= 90) {
    alerts.push(`Team at ${allocationPct}% allocation — approaching capacity ceiling`);
  }

  if (busFactor < 2) {
    alerts.push(`Bus factor of ${busFactor} — critical knowledge concentration risk`);
  }

  if (onLeave > 0) {
    alerts.push(`${onLeave} member${onLeave > 1 ? "s" : ""} on leave — reduced capacity`);
  }

  return alerts;
}

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

export const MOCK_TEAM_SIGNALS: TeamSignal[] = computeTeamSignals();

// ── Org Signals (renamed: "Delivery Health Score" instead of "Org Health") ──

function computeOrgSignals(): OrgSignal[] {
  const teams = MOCK_TEAM_SIGNALS;
  const avgHealth = +(teams.reduce((s, t) => s + t.healthScore, 0) / teams.length).toFixed(1);
  const avgAllocation = Math.round(teams.reduce((s, t) => s + t.allocation, 0) / teams.length);
  const totalSpofs = teams.reduce((s, t) => s + t.spofCount, 0);
  const avgCoverage = Math.round(teams.reduce((s, t) => s + t.coverageScore, 0) / teams.length);
  const teamsAtRisk = teams.filter((t) => t.deliveryLoad !== "healthy").length;

  return [
    {
      id: "sig-01", label: "Delivery Health Score", value: avgHealth, unit: "/10",
      status: avgHealth >= 7 ? "healthy" : avgHealth >= 5.5 ? "warning" : "critical",
      trend: "stable", trendValue: "Composite of all teams",
      description: "Weighted composite: allocation pressure (30%), coverage (30%), SPOF exposure (20%), bus factor (20%).",
      history: [6.8, 6.9, 7.0, 6.9, 7.1, 7.2, avgHealth], delta: "0",
    },
    {
      id: "sig-02", label: "SPOF Exposure", value: totalSpofs, unit: " skills",
      status: totalSpofs >= 5 ? "critical" : totalSpofs >= 3 ? "warning" : "healthy",
      trend: "stable", trendValue: "Skills with single owner, no backup",
      description: "Skills with a single owner and zero backup coverage.",
      history: [5, 6, 6, 7, 7, 7, totalSpofs], delta: "0",
    },
    {
      id: "sig-03", label: "Skill Coverage", value: avgCoverage, unit: "%",
      status: avgCoverage >= 75 ? "healthy" : avgCoverage >= 60 ? "warning" : "critical",
      trend: "stable", trendValue: "Across all team skills",
      description: "Average skill coverage score across all teams.",
      history: [60, 62, 63, 65, 65, 66, avgCoverage], delta: "0",
    },
    {
      id: "sig-04", label: "Teams Under Pressure", value: teamsAtRisk, unit: "",
      status: teamsAtRisk >= 3 ? "critical" : teamsAtRisk >= 1 ? "warning" : "healthy",
      trend: teamsAtRisk >= 2 ? "up" : "stable", trendValue: `${teamsAtRisk} of ${teams.length} teams`,
      description: "Teams with delivery load at warning or critical levels.",
      history: [1, 1, 2, 2, 2, 3, teamsAtRisk], delta: "0",
    },
  ];
}

export const MOCK_ORG_SIGNALS: OrgSignal[] = computeOrgSignals();

// ── Initiative-Linked Alerts ──

function findInitiativeForTeam(teamId: string): { id: string; name: string } | null {
  const alloc = workAllocations.find((a) => a.teamId === teamId);
  if (alloc) {
    const init = initiatives.find((i) => i.id === alloc.initiativeId);
    if (init) return { id: init.id, name: init.name };
  }
  return null;
}

function findInitiativeForEmployee(employeeName: string): { id: string; name: string } | null {
  const alloc = workAllocations.find((a) => a.employeeName === employeeName);
  if (alloc) {
    const init = initiatives.find((i) => i.id === alloc.initiativeId);
    if (init) return { id: init.id, name: init.name };
  }
  return null;
}

function computeAlerts(): AlertItem[] {
  const alerts: AlertItem[] = [];
  const teams = MOCK_TEAM_SIGNALS;

  // Capacity alerts — linked to initiatives
  teams.filter((t) => t.allocation >= 90).forEach((t, i) => {
    const initRef = findInitiativeForTeam(t.teamId);
    alerts.push({
      id: `a-cap-${i}`,
      severity: "critical",
      message: `${t.teamName} at ${t.allocation}% allocation — approaching capacity ceiling`,
      source: "Delivery Pressure",
      timestamp: "Current",
      initiativeId: initRef?.id,
      initiativeName: initRef?.name,
      rootCauses: [
        `${t.memberCount} members covering ${t.spofCount > 0 ? `${t.spofCount} SPOF skill areas` : "high workload"}`,
        initRef ? `Primary initiative: ${initRef.name}` : "Multiple concurrent initiatives",
      ],
      recommendedActions: [
        `Reduce ${t.teamName} allocation below 85%`,
        "Defer lower-priority initiatives",
      ],
    });
  });

  // SPOF alerts — linked to initiatives
  const spofRisks = getSPOFRisks();
  const criticalSpofs = spofRisks.filter((s) => s.severity === "critical");
  if (criticalSpofs.length > 0) {
    const initRef = findInitiativeForEmployee(criticalSpofs[0].ownerName);
    alerts.push({
      id: "a-spof-crit",
      severity: "critical",
      message: `${criticalSpofs.length} critical SPOF${criticalSpofs.length > 1 ? "s" : ""}: ${criticalSpofs.map((s) => s.skillName).join(", ")}`,
      source: "Resilience",
      timestamp: "Current",
      initiativeId: initRef?.id,
      initiativeName: initRef?.name,
      rootCauses: criticalSpofs.map((s) => `${s.skillName} owned solely by ${s.ownerName} (${s.ownerTeam})`),
      recommendedActions: criticalSpofs.map((s) => `Assign backup owner for ${s.skillName}`),
    });
  }

  // Concentration alerts — linked to initiatives
  const concentration = getOwnerConcentration();
  concentration.filter((c) => c.criticalSkillCount >= 4).forEach((c, i) => {
    const initRef = findInitiativeForEmployee(c.employeeName);
    alerts.push({
      id: `a-conc-${i}`,
      severity: "warning",
      message: `${c.employeeName} owns ${c.criticalSkillCount} critical skills — high concentration risk`,
      source: "Resilience",
      timestamp: "Current",
      initiativeId: initRef?.id,
      initiativeName: initRef?.name,
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
    const initRef = findInitiativeForTeam(t.teamId);
    alerts.push({
      id: `a-bf-${i}`,
      severity: "warning",
      message: `${t.teamName} bus factor of ${t.busFactor} — losing one person impacts operations`,
      source: "Resilience",
      timestamp: "Current",
      initiativeId: initRef?.id,
      initiativeName: initRef?.name,
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

// ── Stream Risk Map (renamed from Domain Risk Map) ──
// Now maps to Value Streams from Work module

export function getStreamRisks(): StreamRisk[] {
  const coverage = getSkillCoverage();
  const spofs = getSPOFRisks();

  return valueStreams.map((vs) => {
    // Get initiatives for this value stream
    const vsInits = getInitiativesForValueStream(vs.id);
    
    // Get all allocations for these initiatives
    const initIds = new Set(vsInits.map((i) => i.id));
    const vsAllocs = workAllocations.filter((a) => initIds.has(a.initiativeId));
    
    // Get unique team IDs involved
    const teamIds = [...new Set(vsAllocs.map((a) => a.teamId))];
    
    // Aggregate domain IDs from initiatives
    const domainIds = [...new Set(vsInits.flatMap((i) => i.domainIds))];
    
    // Get skills for these domains
    const domainSkills = MOCK_SKILLS.filter((s) => domainIds.includes(s.domainId));
    const domainCoverage = coverage.filter((c) => domainIds.includes(c.domainId));
    const domainSpofs = spofs.filter((sp) => domainSkills.some((s) => s.id === sp.skillId));

    const avgCov = domainCoverage.length > 0
      ? Math.round(domainCoverage.reduce((s, c) => s + c.coverageScore, 0) / domainCoverage.length * 50)
      : 100;

    let riskLevel: SignalStatus = "healthy";
    if (domainSpofs.some((sp) => sp.severity === "critical")) riskLevel = "critical";
    else if (domainSpofs.length > 0 || avgCov < 60) riskLevel = "warning";

    return {
      streamId: vs.id,
      stream: vs.name,
      spofCount: domainSpofs.length,
      coveragePct: Math.min(avgCov, 100),
      riskLevel,
      skills: domainSkills.map((s) => s.name),
      initiativeCount: vsInits.length,
    };
  }).sort((a, b) => {
    const order: Record<string, number> = { critical: 0, warning: 1, healthy: 2 };
    return order[a.riskLevel] - order[b.riskLevel];
  });
}

// ── Priority Risks (new — top of Signals Overview) ──

export function getPriorityRisks(): PriorityRisk[] {
  const risks: PriorityRisk[] = [];
  const teams = MOCK_TEAM_SIGNALS;
  const spofs = getSPOFRisks();

  // For each value stream, check for risks through initiatives
  valueStreams.forEach((vs) => {
    const vsInits = getInitiativesForValueStream(vs.id);

    vsInits.forEach((init) => {
      const allocs = getAllocationsForInitiative(init.id);
      const totalAlloc = allocs.reduce((s, a) => s + a.percentage, 0);
      const avgAllocPerPerson = allocs.length > 0 ? Math.round(totalAlloc / allocs.length) : 0;
      const persons = allocs.map((a) => a.employeeName);

      // Allocation pressure: check if people on this initiative are overloaded
      const overloadedPersons = allocs.filter((a) => {
        const totalForPerson = workAllocations
          .filter((wa) => wa.employeeId === a.employeeId)
          .reduce((s, wa) => s + wa.percentage, 0);
        return totalForPerson > 95;
      });

      if (overloadedPersons.length > 0) {
        risks.push({
          id: `pr-alloc-${init.id}`,
          streamName: vs.name,
          streamId: vs.id,
          initiativeId: init.id,
          initiativeName: init.name,
          riskType: "allocation",
          severity: "critical",
          description: `${overloadedPersons.length} engineer${overloadedPersons.length > 1 ? "s" : ""} overloaded (>95% allocated)`,
          impactedPersons: overloadedPersons.map((a) => a.employeeName),
          allocationPressure: avgAllocPerPerson,
        });
      }

      // SPOF risk: check if people on this initiative are sole owners of critical skills
      const initPersonNames = new Set(persons);
      const initSpofs = spofs.filter((s) => initPersonNames.has(s.ownerName) && s.severity === "critical");

      if (initSpofs.length > 0) {
        risks.push({
          id: `pr-spof-${init.id}`,
          streamName: vs.name,
          streamId: vs.id,
          initiativeId: init.id,
          initiativeName: init.name,
          riskType: "spof",
          severity: "critical",
          description: `${initSpofs.length} SPOF skill${initSpofs.length > 1 ? "s" : ""} depend on engineers in this initiative`,
          impactedPersons: [...new Set(initSpofs.map((s) => s.ownerName))],
          spofCount: initSpofs.length,
        });
      }
    });
  });

  // De-duplicate by initiative (keep highest severity)
  const byInit = new Map<string, PriorityRisk>();
  risks.forEach((r) => {
    const existing = byInit.get(r.initiativeId);
    if (!existing || (r.severity === "critical" && existing.severity !== "critical")) {
      byInit.set(r.initiativeId, r);
    }
  });

  return [...byInit.values()].sort((a, b) => {
    const order = { critical: 0, warning: 1 };
    return order[a.severity] - order[b.severity];
  });
}

// ── Ownership Load ──

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
