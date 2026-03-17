/**
 * Horizon Decision Engine
 *
 * Computes delivery risks, recommended actions, and delay estimates
 * by analyzing initiative staffing, engineer availability, and allocation gaps.
 */

import {
  initiatives,
  workAllocations,
  valueStreams,
  domains,
  getRequiredFTE,
  getRequiredFTEByRole,
  getAllocatedFTE,
  getAllocatedFTEByRole,
  getStaffingStatus,
  getAllocationsForInitiative,
  getInitiativesForValueStream,
} from "@/modules/work/data";
import { allocations, availabilityWindows, horizonEmployees, horizonTeams } from "../data";
import type { Initiative, StaffingStatus } from "@/modules/work/types";

// ── Types ──────────────────────────────────────────────

export type DeliveryRiskLevel = "low" | "medium" | "high" | "critical";

export interface RoleGap {
  role: string;
  requiredFTE: number;
  allocatedFTE: number;
  gapFTE: number;
}

export interface RecommendedAction {
  id: string;
  type: "add_role" | "reassign" | "delay" | "reduce_scope" | "split_allocation";
  priority: "high" | "medium" | "low";
  label: string;
  detail: string;
  initiativeId?: string;
  initiativeName?: string;
  engineerId?: string;
  engineerName?: string;
}

export interface InitiativeRisk {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  deliveryRisk: DeliveryRiskLevel;
  riskScore: number; // 0-100
  riskReasons: string[];
  staffingStatus: StaffingStatus;
  confidence: string;
  requiredFTE: number;
  allocatedFTE: number;
  roleGaps: RoleGap[];
  estimatedDelayDays: number;
  domainIds: string[];
  valueStreamIds: string[];
  recommendations: RecommendedAction[];
  allocations: { name: string; role: string; percentage: number }[];
  totalEffortDays: number;
}

export interface ValueStreamSummary {
  id: string;
  name: string;
  initiativeCount: number;
  atRiskCount: number;
  understaffedCount: number;
  totalFTEGap: number;
  initiatives: InitiativeRisk[];
}

export interface EngineerCapacity {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  currentAllocation: number;
  freeCapacity: number;
  isAvailable: boolean;
  activeInitiatives: { id: string; name: string; percentage: number }[];
  role?: string;
  skill?: string;
}

export interface DecisionSummary {
  criticalRisks: InitiativeRisk[];
  allInitiativeRisks: InitiativeRisk[];
  recommendations: RecommendedAction[];
  valueStreamSummaries: ValueStreamSummary[];
  engineerCapacities: EngineerCapacity[];
  stats: {
    totalInitiatives: number;
    atRiskCount: number;
    criticalCount: number;
    totalFTEGap: number;
    avgDeliveryRisk: number;
    constrainedEngineers: number;
    availableEngineers: number;
    totalRecommendations: number;
  };
}

// ── Employee enrichment (reused from capacity page) ─────

const employeeEnrichment: Record<string, { role: string; skill: string }> = {
  "emp-001": { role: "Staff Engineer", skill: "Platform" },
  "emp-002": { role: "Senior Engineer", skill: "Backend" },
  "emp-003": { role: "Senior Engineer", skill: "Frontend" },
  "emp-004": { role: "Engineer", skill: "Platform" },
  "emp-005": { role: "Senior Engineer", skill: "Backend" },
  "emp-006": { role: "Engineer", skill: "Data" },
  "emp-007": { role: "Senior Engineer", skill: "Frontend" },
  "emp-008": { role: "Engineering Manager", skill: "Leadership" },
  "emp-009": { role: "VP Engineering", skill: "Leadership" },
  "emp-010": { role: "Engineer", skill: "Data" },
  "emp-011": { role: "Junior Engineer", skill: "Frontend" },
  "emp-012": { role: "Engineer", skill: "Data" },
};

// ── Helpers ─────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);

function computeDeliveryRisk(init: Initiative): { level: DeliveryRiskLevel; score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // 1. Staffing gap
  const required = getRequiredFTE(init);
  const allocated = getAllocatedFTE(init.id);
  const gapRatio = required > 0 ? (required - allocated) / required : 0;

  if (gapRatio > 0.4) { score += 35; reasons.push(`${Math.round(gapRatio * 100)}% understaffed`); }
  else if (gapRatio > 0.2) { score += 20; reasons.push(`${Math.round(gapRatio * 100)}% understaffed`); }
  else if (gapRatio > 0) { score += 10; reasons.push("Minor staffing gap"); }

  // 2. Confidence level
  if (init.estimate.confidence === "low") { score += 25; reasons.push("Low confidence estimate"); }
  else if (init.estimate.confidence === "medium") { score += 10; reasons.push("Medium confidence"); }

  // 3. Role gaps (missing roles entirely)
  const roleReqs = getRequiredFTEByRole(init);
  const allocByRole = getAllocatedFTEByRole(init.id);
  const missingRoles = roleReqs.filter((r) => (allocByRole[r.role] || 0) < r.fte * 0.3);
  if (missingRoles.length > 0) {
    score += missingRoles.length * 10;
    reasons.push(`Missing ${missingRoles.map((r) => r.role).join(", ")} capacity`);
  }

  // 4. Availability risk — check if allocated engineers are going on PTO during initiative
  const allocs = getAllocationsForInitiative(init.id);
  const ptoConflicts = allocs.filter((a) => {
    return availabilityWindows.some(
      (w) =>
        w.employeeId === a.employeeId &&
        w.status === "unavailable" &&
        w.startDate <= init.endDate &&
        w.endDate >= init.startDate
    );
  });
  if (ptoConflicts.length > 0) {
    score += ptoConflicts.length * 5;
    reasons.push(`${ptoConflicts.length} engineer(s) have absences during initiative`);
  }

  // 5. Timeline pressure (already started but not fully staffed)
  if (init.status === "active" && gapRatio > 0.15) {
    score += 10;
    reasons.push("Active initiative with staffing gap");
  }

  const level: DeliveryRiskLevel =
    score >= 60 ? "critical" :
    score >= 40 ? "high" :
    score >= 20 ? "medium" : "low";

  return { level, score: Math.min(100, score), reasons };
}

function estimateDelay(init: Initiative): number {
  const required = getRequiredFTE(init);
  const allocated = getAllocatedFTE(init.id);
  if (allocated >= required * 0.85) return 0;
  if (allocated === 0) return 14; // 2 weeks estimated delay if no allocation

  // Approximate: delay = (gap / allocated) * remaining duration
  const endDate = new Date(init.endDate);
  const remaining = Math.max(1, Math.round((endDate.getTime() - Date.now()) / 86400000));
  const gap = required - allocated;
  return Math.round((gap / allocated) * remaining * 0.5); // conservative multiplier
}

function generateRecommendations(initRisk: InitiativeRisk, engineerCapacities: EngineerCapacity[]): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  let actionIdx = 0;

  // 1. For each role gap, suggest adding capacity
  for (const gap of initRisk.roleGaps) {
    if (gap.gapFTE <= 0) continue;

    // Find available engineers with matching skill
    const candidates = engineerCapacities
      .filter((e) => e.freeCapacity >= 30 && e.skill?.toLowerCase() === gap.role.toLowerCase())
      .sort((a, b) => b.freeCapacity - a.freeCapacity);

    if (candidates.length > 0) {
      const best = candidates[0];
      actions.push({
        id: `rec-${initRisk.id}-${actionIdx++}`,
        type: "reassign",
        priority: gap.gapFTE > 0.5 ? "high" : "medium",
        label: `Reassign ${best.name} (${best.freeCapacity}% free)`,
        detail: `Add ${gap.role} capacity to ${initRisk.name}. ${best.name} has ${best.freeCapacity}% free capacity.`,
        initiativeId: initRisk.id,
        initiativeName: initRisk.name,
        engineerId: best.id,
        engineerName: best.name,
      });
    } else {
      actions.push({
        id: `rec-${initRisk.id}-${actionIdx++}`,
        type: "add_role",
        priority: "high",
        label: `Add 1 ${gap.role} to ${initRisk.name}`,
        detail: `${gap.role} capacity gap of ${gap.gapFTE} FTE. No available engineers with matching skill found.`,
        initiativeId: initRisk.id,
        initiativeName: initRisk.name,
      });
    }
  }

  // 2. If delay is significant, suggest timeline adjustment
  if (initRisk.estimatedDelayDays >= 5) {
    actions.push({
      id: `rec-${initRisk.id}-${actionIdx++}`,
      type: "delay",
      priority: initRisk.estimatedDelayDays >= 10 ? "high" : "medium",
      label: `Consider +${initRisk.estimatedDelayDays}d extension`,
      detail: `Current staffing suggests a ~${initRisk.estimatedDelayDays} day delay for ${initRisk.name}. Consider extending the timeline or reducing scope.`,
      initiativeId: initRisk.id,
      initiativeName: initRisk.name,
    });
  }

  // 3. If confidence is low, suggest scope reduction
  if (initRisk.confidence === "low") {
    actions.push({
      id: `rec-${initRisk.id}-${actionIdx++}`,
      type: "reduce_scope",
      priority: "medium",
      label: `Review scope of ${initRisk.name}`,
      detail: `Low confidence estimate. Consider breaking into smaller milestones or reducing scope to de-risk delivery.`,
      initiativeId: initRisk.id,
      initiativeName: initRisk.name,
    });
  }

  return actions;
}

// ── Main computation ────────────────────────────────────

export function computeDecisionSummary(): DecisionSummary {
  // 1. Compute engineer capacities
  const engineerCapacities: EngineerCapacity[] = horizonEmployees.map((emp) => {
    const activeAllocs = allocations.filter(
      (a) => a.employeeId === emp.id && a.startDate <= today && a.endDate >= today
    );
    const totalAlloc = activeAllocs.reduce((s, a) => s + a.percentage, 0);
    const isUnavailable = availabilityWindows.some(
      (w) => w.employeeId === emp.id && w.status === "unavailable" && w.startDate <= today && w.endDate >= today
    );
    const enrichment = employeeEnrichment[emp.id];

    return {
      id: emp.id,
      name: emp.name,
      teamId: emp.teamId,
      teamName: emp.teamName,
      currentAllocation: totalAlloc,
      freeCapacity: Math.max(0, 100 - totalAlloc),
      isAvailable: !isUnavailable,
      activeInitiatives: activeAllocs.map((a) => ({ id: a.id, name: a.initiative, percentage: a.percentage })),
      role: enrichment?.role,
      skill: enrichment?.skill,
    };
  });

  // 2. Compute initiative risks
  const activeInits = initiatives.filter((i) => i.status !== "completed");
  const allInitiativeRisks: InitiativeRisk[] = activeInits.map((init) => {
    const risk = computeDeliveryRisk(init);
    const roleReqs = getRequiredFTEByRole(init);
    const allocByRole = getAllocatedFTEByRole(init.id);
    const allocs = getAllocationsForInitiative(init.id);

    const roleGaps: RoleGap[] = roleReqs.map((r) => ({
      role: r.role,
      requiredFTE: r.fte,
      allocatedFTE: allocByRole[r.role] || 0,
      gapFTE: Math.round((r.fte - (allocByRole[r.role] || 0)) * 10) / 10,
    }));

    const initRisk: InitiativeRisk = {
      id: init.id,
      name: init.name,
      status: init.status,
      startDate: init.startDate,
      endDate: init.endDate,
      deliveryRisk: risk.level,
      riskScore: risk.score,
      riskReasons: risk.reasons,
      staffingStatus: getStaffingStatus(init),
      confidence: init.estimate.confidence,
      requiredFTE: getRequiredFTE(init),
      allocatedFTE: getAllocatedFTE(init.id),
      roleGaps: roleGaps.filter((g) => g.gapFTE > 0),
      estimatedDelayDays: estimateDelay(init),
      domainIds: init.domainIds,
      valueStreamIds: init.valueStreamIds,
      recommendations: [],
      allocations: allocs.map((a) => ({ name: a.employeeName, role: a.role, percentage: a.percentage })),
      totalEffortDays: init.estimate.totalEffortDays,
    };

    initRisk.recommendations = generateRecommendations(initRisk, engineerCapacities);
    return initRisk;
  });

  // Sort by risk score descending
  allInitiativeRisks.sort((a, b) => b.riskScore - a.riskScore);

  const criticalRisks = allInitiativeRisks.filter((r) => r.deliveryRisk === "critical" || r.deliveryRisk === "high");

  // 3. Aggregate recommendations
  const recommendations = allInitiativeRisks.flatMap((r) => r.recommendations);
  recommendations.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });

  // 4. Value stream summaries
  const valueStreamSummaries: ValueStreamSummary[] = valueStreams.map((vs) => {
    const vsInits = allInitiativeRisks.filter((r) => r.valueStreamIds.includes(vs.id));
    const atRisk = vsInits.filter((r) => r.deliveryRisk === "high" || r.deliveryRisk === "critical");
    const understaffed = vsInits.filter((r) => r.staffingStatus === "understaffed");
    const totalGap = vsInits.reduce((s, r) => s + r.roleGaps.reduce((g, rg) => g + Math.max(0, rg.gapFTE), 0), 0);

    return {
      id: vs.id,
      name: vs.name,
      initiativeCount: vsInits.length,
      atRiskCount: atRisk.length,
      understaffedCount: understaffed.length,
      totalFTEGap: Math.round(totalGap * 10) / 10,
      initiatives: vsInits,
    };
  }).filter((vs) => vs.initiativeCount > 0);

  // 5. Stats
  const atRiskCount = allInitiativeRisks.filter((r) => r.deliveryRisk !== "low").length;
  const criticalCount = criticalRisks.length;
  const totalFTEGap = allInitiativeRisks.reduce((s, r) => s + r.roleGaps.reduce((g, rg) => g + Math.max(0, rg.gapFTE), 0), 0);
  const avgRisk = allInitiativeRisks.length > 0
    ? Math.round(allInitiativeRisks.reduce((s, r) => s + r.riskScore, 0) / allInitiativeRisks.length)
    : 0;
  const constrained = engineerCapacities.filter((e) => e.isAvailable && e.freeCapacity < 20).length;
  const available = engineerCapacities.filter((e) => e.isAvailable && e.freeCapacity >= 50).length;

  return {
    criticalRisks,
    allInitiativeRisks,
    recommendations,
    valueStreamSummaries,
    engineerCapacities,
    stats: {
      totalInitiatives: allInitiativeRisks.length,
      atRiskCount,
      criticalCount,
      totalFTEGap: Math.round(totalFTEGap * 10) / 10,
      avgDeliveryRisk: avgRisk,
      constrainedEngineers: constrained,
      availableEngineers: available,
      totalRecommendations: recommendations.length,
    },
  };
}

// ── Domain helpers (re-export convenience) ──────────────

export function getDomainName(id: string): string {
  return domains.find((d) => d.id === id)?.name ?? id;
}

export function getValueStreamName(id: string): string {
  return valueStreams.find((v) => v.id === id)?.name ?? id;
}
