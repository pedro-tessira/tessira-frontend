import type { ValueStream, Domain, Initiative, WorkAllocation, StaffingStatus } from "./types";
import { horizonEmployees } from "@/modules/horizon/data";

function daysFromNow(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// ── Value Streams ────────────────────────────────────────
export const valueStreams: ValueStream[] = [
  { id: "vs-01", name: "Payments", description: "End-to-end payment processing, billing, and financial operations delivering revenue capabilities to merchants and customers." },
  { id: "vs-02", name: "Bookings", description: "Reservation and booking flow from search to confirmation, ensuring seamless user experiences." },
  { id: "vs-03", name: "Partner Integrations", description: "Third-party partner connectivity, onboarding, and data exchange powering the partner ecosystem." },
  { id: "vs-04", name: "Merchant Operations", description: "Tools and workflows enabling merchants to manage their business operations effectively." },
  { id: "vs-05", name: "Checkout Experience", description: "The complete checkout journey from cart to confirmation, optimizing conversion and user satisfaction." },
];

// ── Domains ──────────────────────────────────────────────
export const domains: Domain[] = [
  { id: "dom-01", name: "Auth Platform", description: "Authentication, authorization, and identity services powering secure access across all products.", owningTeamId: "team-001", owningTeamName: "Platform Core" },
  { id: "dom-02", name: "Payments Platform", description: "End-to-end payment processing, billing, and checkout infrastructure.", owningTeamId: "team-002", owningTeamName: "Backend Services" },
  { id: "dom-03", name: "Checkout Platform", description: "Checkout flow, cart management, and order processing.", owningTeamId: "team-002", owningTeamName: "Backend Services" },
  { id: "dom-04", name: "Frontend Platform", description: "Internal tooling, SDKs, and developer productivity improvements across the engineering org.", owningTeamId: "team-003", owningTeamName: "Frontend" },
  { id: "dom-05", name: "Observability", description: "Monitoring, alerting, logging, and tracing infrastructure for production systems.", owningTeamId: "team-004", owningTeamName: "Data & Observability" },
  { id: "dom-06", name: "Data Platform", description: "Data infrastructure, pipelines, and analytical workloads.", owningTeamId: "team-004", owningTeamName: "Data & Observability" },
];

// ── Initiatives (with HLE) ──────────────────────────────
export const initiatives: Initiative[] = [
  {
    id: "init-01", name: "Auth Refactor", description: "Modernize the authentication layer with OIDC compliance and multi-tenant support.",
    status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(9),
    domainIds: ["dom-01"], valueStreamIds: ["vs-01", "vs-05"],
    estimate: {
      totalEffortDays: 30,
      roleBreakdown: [{ role: "Backend", days: 20 }, { role: "DevOps", days: 5 }, { role: "Frontend", days: 5 }],
      confidence: "high",
      drivers: "Strong domain knowledge in team. Well-scoped OIDC migration path.",
    },
  },
  {
    id: "init-02", name: "Stripe Migration", description: "Migrate from legacy billing to the new Stripe-based billing engine.",
    status: "active", startDate: daysFromNow(0), endDate: daysFromNow(14),
    domainIds: ["dom-02"], valueStreamIds: ["vs-01"],
    estimate: {
      totalEffortDays: 40,
      roleBreakdown: [{ role: "Backend", days: 25 }, { role: "Frontend", days: 10 }, { role: "Data", days: 5 }],
      confidence: "medium",
      drivers: "Dependency on Stripe API timelines. Requires data migration testing.",
    },
  },
  {
    id: "init-03", name: "API Gateway Hardening", description: "Rate limiting, circuit breakers, and observability for the API gateway.",
    status: "active", startDate: daysFromNow(4), endDate: daysFromNow(18),
    domainIds: ["dom-01", "dom-05"], valueStreamIds: ["vs-01", "vs-02", "vs-03"],
    estimate: {
      totalEffortDays: 35,
      roleBreakdown: [{ role: "Backend", days: 15 }, { role: "DevOps", days: 15 }, { role: "Data", days: 5 }],
      confidence: "medium",
      drivers: "Cross-cutting concern. Needs coordination across multiple teams.",
    },
  },
  {
    id: "init-04", name: "Checkout Performance", description: "Reduce P95 checkout latency from 1.8s to under 500ms.",
    status: "planned", startDate: daysFromNow(10), endDate: daysFromNow(28),
    domainIds: ["dom-03"], valueStreamIds: ["vs-05"],
    estimate: {
      totalEffortDays: 50,
      roleBreakdown: [{ role: "Backend", days: 20 }, { role: "Frontend", days: 20 }, { role: "Data", days: 10 }],
      confidence: "low",
      drivers: "Requires profiling and root cause analysis. Unknown bottlenecks in payment flow.",
    },
  },
  {
    id: "init-05", name: "Dashboard v2", description: "Redesign the main product dashboard with new analytics widgets and real-time data.",
    status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(12),
    domainIds: ["dom-04"], valueStreamIds: ["vs-04"],
    estimate: {
      totalEffortDays: 25,
      roleBreakdown: [{ role: "Frontend", days: 18 }, { role: "Backend", days: 5 }, { role: "Data", days: 2 }],
      confidence: "high",
      drivers: "Clear design specs. Reusing existing component library.",
    },
  },
  {
    id: "init-06", name: "Design System Refresh", description: "Update component library with new tokens, accessibility fixes, and dark mode.",
    status: "planned", startDate: daysFromNow(10), endDate: daysFromNow(23),
    domainIds: ["dom-04"], valueStreamIds: ["vs-04", "vs-05"],
    estimate: {
      totalEffortDays: 20,
      roleBreakdown: [{ role: "Frontend", days: 18 }, { role: "DevOps", days: 2 }],
      confidence: "high",
      drivers: "Design tokens already defined. Incremental rollout planned.",
    },
  },
  {
    id: "init-07", name: "Pipeline Performance", description: "Optimize data ingestion pipeline throughput by 3x.",
    status: "active", startDate: daysFromNow(-3), endDate: daysFromNow(11),
    domainIds: ["dom-05", "dom-06"], valueStreamIds: ["vs-02"],
    estimate: {
      totalEffortDays: 28,
      roleBreakdown: [{ role: "Data", days: 18 }, { role: "DevOps", days: 8 }, { role: "Backend", days: 2 }],
      confidence: "medium",
      drivers: "Pipeline bottlenecks partially identified. Spark tuning needed.",
    },
  },
  {
    id: "init-08", name: "Data Lake Migration", description: "Migrate analytical workloads from Redshift to the new data lake architecture.",
    status: "active", startDate: daysFromNow(0), endDate: daysFromNow(18),
    domainIds: ["dom-06"], valueStreamIds: ["vs-02", "vs-04"],
    estimate: {
      totalEffortDays: 45,
      roleBreakdown: [{ role: "Data", days: 30 }, { role: "DevOps", days: 10 }, { role: "Backend", days: 5 }],
      confidence: "low",
      drivers: "Large data volume. Unknown schema compatibility issues. Needs parallel run.",
    },
  },
];

// ── Work Allocations ─────────────────────────────────────
export const workAllocations: WorkAllocation[] = [
  { id: "wa-01", employeeId: "emp-001", employeeName: "Sarah Chen", initiativeId: "init-01", initiativeName: "Auth Refactor", role: "Backend", percentage: 60, startDate: daysFromNow(-5), endDate: daysFromNow(9), teamId: "team-001", teamName: "Platform Core" },
  { id: "wa-02", employeeId: "emp-001", employeeName: "Sarah Chen", initiativeId: "init-03", initiativeName: "API Gateway Hardening", role: "Backend", percentage: 30, startDate: daysFromNow(10), endDate: daysFromNow(20), teamId: "team-001", teamName: "Platform Core" },
  { id: "wa-03", employeeId: "emp-002", employeeName: "Marcus Rivera", initiativeId: "init-02", initiativeName: "Stripe Migration", role: "Backend", percentage: 80, startDate: daysFromNow(0), endDate: daysFromNow(14), teamId: "team-002", teamName: "Backend Services" },
  { id: "wa-04", employeeId: "emp-003", employeeName: "Aisha Patel", initiativeId: "init-06", initiativeName: "Design System Refresh", role: "Frontend", percentage: 50, startDate: daysFromNow(0), endDate: daysFromNow(17), teamId: "team-003", teamName: "Frontend" },
  { id: "wa-05", employeeId: "emp-003", employeeName: "Aisha Patel", initiativeId: "init-05", initiativeName: "Dashboard v2", role: "Frontend", percentage: 40, startDate: daysFromNow(0), endDate: daysFromNow(12), teamId: "team-003", teamName: "Frontend" },
  { id: "wa-06", employeeId: "emp-004", employeeName: "Jonas Eriksson", initiativeId: "init-03", initiativeName: "API Gateway Hardening", role: "DevOps", percentage: 70, startDate: daysFromNow(4), endDate: daysFromNow(18), teamId: "team-001", teamName: "Platform Core" },
  { id: "wa-07", employeeId: "emp-005", employeeName: "Mei Tanaka", initiativeId: "init-04", initiativeName: "Checkout Performance", role: "Backend", percentage: 100, startDate: daysFromNow(0), endDate: daysFromNow(28), teamId: "team-002", teamName: "Backend Services" },
  { id: "wa-08", employeeId: "emp-006", employeeName: "Alex Novak", initiativeId: "init-07", initiativeName: "Pipeline Performance", role: "Data", percentage: 50, startDate: daysFromNow(0), endDate: daysFromNow(11), teamId: "team-004", teamName: "Data & Observability" },
  { id: "wa-09", employeeId: "emp-006", employeeName: "Alex Novak", initiativeId: "init-08", initiativeName: "Data Lake Migration", role: "Data", percentage: 40, startDate: daysFromNow(15), endDate: daysFromNow(28), teamId: "team-004", teamName: "Data & Observability" },
  { id: "wa-10", employeeId: "emp-007", employeeName: "Priya Sharma", initiativeId: "init-05", initiativeName: "Dashboard v2", role: "Frontend", percentage: 80, startDate: daysFromNow(-5), endDate: daysFromNow(9), teamId: "team-003", teamName: "Frontend" },
  { id: "wa-11", employeeId: "emp-010", employeeName: "Carlos Mendez", initiativeId: "init-07", initiativeName: "Pipeline Performance", role: "DevOps", percentage: 70, startDate: daysFromNow(0), endDate: daysFromNow(11), teamId: "team-004", teamName: "Data & Observability" },
  { id: "wa-12", employeeId: "emp-012", employeeName: "Tomasz Kowalski", initiativeId: "init-08", initiativeName: "Data Lake Migration", role: "Data", percentage: 90, startDate: daysFromNow(0), endDate: daysFromNow(18), teamId: "team-004", teamName: "Data & Observability" },
];

// ── Helpers ──────────────────────────────────────────────

export function getValueStream(id: string) {
  return valueStreams.find((vs) => vs.id === id) ?? null;
}

export function getDomain(id: string) {
  return domains.find((d) => d.id === id) ?? null;
}

export function getInitiative(id: string) {
  return initiatives.find((i) => i.id === id) ?? null;
}

export function getInitiativesForDomain(domainId: string) {
  return initiatives.filter((i) => i.domainIds.includes(domainId));
}

export function getInitiativesForValueStream(vsId: string) {
  return initiatives.filter((i) => i.valueStreamIds.includes(vsId));
}

export function getAllocationsForInitiative(initiativeId: string) {
  return workAllocations.filter((a) => a.initiativeId === initiativeId);
}

export function getAllocationsForDomain(domainId: string) {
  const initIds = new Set(getInitiativesForDomain(domainId).map((i) => i.id));
  return workAllocations.filter((a) => initIds.has(a.initiativeId));
}

export function getDomainLoadPercent(domainId: string): number {
  const allocs = getAllocationsForDomain(domainId);
  return allocs.reduce((sum, a) => sum + a.percentage, 0);
}

export function getDomainFTE(domainId: string): number {
  const allocs = getAllocationsForDomain(domainId);
  return Math.round(allocs.reduce((sum, a) => sum + a.percentage, 0) / 10) / 10;
}

export function getEngineersForDomain(domainId: string) {
  const allocs = getAllocationsForDomain(domainId);
  const empIds = [...new Set(allocs.map((a) => a.employeeId))];
  return empIds.map((id) => horizonEmployees.find((e) => e.id === id)!).filter(Boolean);
}

export function getDomainsForInitiative(initiativeId: string) {
  const init = getInitiative(initiativeId);
  if (!init) return [];
  return init.domainIds.map((id) => getDomain(id)!).filter(Boolean);
}

export function getValueStreamsForInitiative(initiativeId: string) {
  const init = getInitiative(initiativeId);
  if (!init) return [];
  return init.valueStreamIds.map((id) => getValueStream(id)!).filter(Boolean);
}

export function getAllocationLoad(initiativeId: string): number {
  return getAllocationsForInitiative(initiativeId).reduce((s, a) => s + a.percentage, 0);
}

export function getDomainsForValueStream(vsId: string) {
  const inits = getInitiativesForValueStream(vsId);
  const domainIds = new Set(inits.flatMap((i) => i.domainIds));
  return [...domainIds].map((id) => getDomain(id)!).filter(Boolean);
}

export function getEngineersForValueStream(vsId: string) {
  const inits = getInitiativesForValueStream(vsId);
  const initIds = new Set(inits.map((i) => i.id));
  const allocs = workAllocations.filter((a) => initIds.has(a.initiativeId));
  const empIds = [...new Set(allocs.map((a) => a.employeeId))];
  return empIds.map((id) => horizonEmployees.find((e) => e.id === id)!).filter(Boolean);
}

// ── Initiative Planning Helpers ──────────────────────────

/** Duration in working days (approximate: total calendar days * 5/7) */
export function getInitiativeDurationWeekdays(init: Initiative): number {
  const start = new Date(init.startDate);
  const end = new Date(init.endDate);
  const calendarDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  return Math.max(1, Math.round(calendarDays * 5 / 7));
}

/** Required FTE = total effort days / working days in duration */
export function getRequiredFTE(init: Initiative): number {
  const workdays = getInitiativeDurationWeekdays(init);
  return Math.round((init.estimate.totalEffortDays / workdays) * 10) / 10;
}

/** Required FTE broken down by role */
export function getRequiredFTEByRole(init: Initiative): { role: string; days: number; fte: number }[] {
  const workdays = getInitiativeDurationWeekdays(init);
  return init.estimate.roleBreakdown.map((rb) => ({
    role: rb.role,
    days: rb.days,
    fte: Math.round((rb.days / workdays) * 10) / 10,
  }));
}

/** Allocated FTE by role for an initiative */
export function getAllocatedFTEByRole(initiativeId: string): Record<string, number> {
  const allocs = getAllocationsForInitiative(initiativeId);
  const byRole: Record<string, number> = {};
  for (const a of allocs) {
    byRole[a.role] = (byRole[a.role] || 0) + a.percentage;
  }
  // Convert percentages to FTE
  for (const role of Object.keys(byRole)) {
    byRole[role] = Math.round(byRole[role] / 10) / 10;
  }
  return byRole;
}

/** Allocated FTE = sum of allocation percentages / 100 */
export function getAllocatedFTE(initiativeId: string): number {
  const allocs = getAllocationsForInitiative(initiativeId);
  const totalPct = allocs.reduce((s, a) => s + a.percentage, 0);
  return Math.round(totalPct / 10) / 10;
}

/** Staffing status based on required vs allocated FTE */
export function getStaffingStatus(init: Initiative): StaffingStatus {
  const required = getRequiredFTE(init);
  const allocated = getAllocatedFTE(init.id);
  if (allocated < required * 0.85) return "understaffed";
  if (allocated > required * 1.15) return "overstaffed";
  return "balanced";
}

/** Get FTE allocated per initiative for a given set of initiative IDs */
export function getFTEByInitiative(initiativeIds: string[]): { initiativeId: string; initiativeName: string; allocatedFTE: number; requiredFTE: number; status: StaffingStatus }[] {
  return initiativeIds.map((id) => {
    const init = getInitiative(id);
    if (!init) return null;
    return {
      initiativeId: id,
      initiativeName: init.name,
      allocatedFTE: getAllocatedFTE(id),
      requiredFTE: getRequiredFTE(init),
      status: getStaffingStatus(init),
    };
  }).filter(Boolean) as any[];
}

/** Get allocation breakdown per initiative for a specific employee */
export function getEmployeeInitiativeAllocations(employeeId: string) {
  return workAllocations
    .filter((a) => a.employeeId === employeeId)
    .map((a) => ({
      initiativeId: a.initiativeId,
      initiativeName: a.initiativeName,
      percentage: a.percentage,
      startDate: a.startDate,
      endDate: a.endDate,
    }));
}
