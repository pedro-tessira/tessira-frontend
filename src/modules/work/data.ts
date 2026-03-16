import type { Stream, Initiative, WorkAllocation } from "./types";
import { horizonEmployees } from "@/modules/horizon/data";

function daysFromNow(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// ── Streams ──────────────────────────────────────────────
export const streams: Stream[] = [
  { id: "str-01", name: "Auth Platform", description: "Authentication, authorization, and identity services powering secure access across all products.", owningTeamId: "team-001", owningTeamName: "Platform Core" },
  { id: "str-02", name: "Payments Platform", description: "End-to-end payment processing, billing, and checkout infrastructure.", owningTeamId: "team-002", owningTeamName: "Backend Services" },
  { id: "str-03", name: "Developer Experience", description: "Internal tooling, SDKs, and developer productivity improvements across the engineering org.", owningTeamId: "team-003", owningTeamName: "Frontend" },
  { id: "str-04", name: "Mobile SDK", description: "Cross-platform mobile SDK for native and hybrid app integrations.", owningTeamId: "team-003", owningTeamName: "Frontend" },
  { id: "str-05", name: "Observability", description: "Monitoring, alerting, logging, and tracing infrastructure for production systems.", owningTeamId: "team-004", owningTeamName: "Data & Observability" },
];

// ── Initiatives ──────────────────────────────────────────
export const initiatives: Initiative[] = [
  { id: "init-01", name: "Auth Refactor", description: "Modernize the authentication layer with OIDC compliance and multi-tenant support.", status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(9), streamIds: ["str-01"] },
  { id: "init-02", name: "Billing v3 Migration", description: "Migrate from legacy billing to the new v3 billing engine with Stripe integration.", status: "active", startDate: daysFromNow(0), endDate: daysFromNow(14), streamIds: ["str-02"] },
  { id: "init-03", name: "API Gateway Hardening", description: "Rate limiting, circuit breakers, and observability for the API gateway.", status: "active", startDate: daysFromNow(4), endDate: daysFromNow(18), streamIds: ["str-01", "str-05"] },
  { id: "init-04", name: "Checkout Performance", description: "Reduce P95 checkout latency from 1.8s to under 500ms.", status: "planned", startDate: daysFromNow(10), endDate: daysFromNow(28), streamIds: ["str-02"] },
  { id: "init-05", name: "Dashboard v2", description: "Redesign the main product dashboard with new analytics widgets and real-time data.", status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(12), streamIds: ["str-03"] },
  { id: "init-06", name: "Design System Refresh", description: "Update component library with new tokens, accessibility fixes, and dark mode.", status: "planned", startDate: daysFromNow(10), endDate: daysFromNow(23), streamIds: ["str-03", "str-04"] },
  { id: "init-07", name: "Pipeline Performance", description: "Optimize data ingestion pipeline throughput by 3x.", status: "active", startDate: daysFromNow(-3), endDate: daysFromNow(11), streamIds: ["str-05"] },
  { id: "init-08", name: "Data Lake Migration", description: "Migrate analytical workloads from Redshift to the new data lake architecture.", status: "active", startDate: daysFromNow(0), endDate: daysFromNow(18), streamIds: ["str-05"] },
];

// ── Work Allocations ─────────────────────────────────────
// These mirror the existing horizon allocations but are keyed to initiatives
export const workAllocations: WorkAllocation[] = [
  { id: "wa-01", employeeId: "emp-001", employeeName: "Sarah Chen", initiativeId: "init-01", initiativeName: "Auth Refactor", percentage: 60, startDate: daysFromNow(-5), endDate: daysFromNow(9), teamId: "team-001", teamName: "Platform Core" },
  { id: "wa-02", employeeId: "emp-001", employeeName: "Sarah Chen", initiativeId: "init-03", initiativeName: "API Gateway Hardening", percentage: 30, startDate: daysFromNow(10), endDate: daysFromNow(20), teamId: "team-001", teamName: "Platform Core" },
  { id: "wa-03", employeeId: "emp-002", employeeName: "Marcus Rivera", initiativeId: "init-02", initiativeName: "Billing v3 Migration", percentage: 80, startDate: daysFromNow(0), endDate: daysFromNow(14), teamId: "team-002", teamName: "Backend Services" },
  { id: "wa-04", employeeId: "emp-003", employeeName: "Aisha Patel", initiativeId: "init-06", initiativeName: "Design System Refresh", percentage: 50, startDate: daysFromNow(0), endDate: daysFromNow(17), teamId: "team-003", teamName: "Frontend" },
  { id: "wa-05", employeeId: "emp-003", employeeName: "Aisha Patel", initiativeId: "init-05", initiativeName: "Dashboard v2", percentage: 40, startDate: daysFromNow(0), endDate: daysFromNow(12), teamId: "team-003", teamName: "Frontend" },
  { id: "wa-06", employeeId: "emp-004", employeeName: "Jonas Eriksson", initiativeId: "init-03", initiativeName: "API Gateway Hardening", percentage: 70, startDate: daysFromNow(4), endDate: daysFromNow(18), teamId: "team-001", teamName: "Platform Core" },
  { id: "wa-07", employeeId: "emp-005", employeeName: "Mei Tanaka", initiativeId: "init-04", initiativeName: "Checkout Performance", percentage: 100, startDate: daysFromNow(0), endDate: daysFromNow(28), teamId: "team-002", teamName: "Backend Services" },
  { id: "wa-08", employeeId: "emp-006", employeeName: "Alex Novak", initiativeId: "init-07", initiativeName: "Pipeline Performance", percentage: 50, startDate: daysFromNow(0), endDate: daysFromNow(11), teamId: "team-004", teamName: "Data & Observability" },
  { id: "wa-09", employeeId: "emp-006", employeeName: "Alex Novak", initiativeId: "init-08", initiativeName: "Data Lake Migration", percentage: 40, startDate: daysFromNow(15), endDate: daysFromNow(28), teamId: "team-004", teamName: "Data & Observability" },
  { id: "wa-10", employeeId: "emp-007", employeeName: "Priya Sharma", initiativeId: "init-05", initiativeName: "Dashboard v2", percentage: 80, startDate: daysFromNow(-5), endDate: daysFromNow(9), teamId: "team-003", teamName: "Frontend" },
  { id: "wa-11", employeeId: "emp-010", employeeName: "Carlos Mendez", initiativeId: "init-07", initiativeName: "Pipeline Performance", percentage: 70, startDate: daysFromNow(0), endDate: daysFromNow(11), teamId: "team-004", teamName: "Data & Observability" },
  { id: "wa-12", employeeId: "emp-012", employeeName: "Tomasz Kowalski", initiativeId: "init-08", initiativeName: "Data Lake Migration", percentage: 90, startDate: daysFromNow(0), endDate: daysFromNow(18), teamId: "team-004", teamName: "Data & Observability" },
];

// ── Helpers ──────────────────────────────────────────────

export function getStream(id: string) {
  return streams.find((s) => s.id === id) ?? null;
}

export function getInitiative(id: string) {
  return initiatives.find((i) => i.id === id) ?? null;
}

export function getInitiativesForStream(streamId: string) {
  return initiatives.filter((i) => i.streamIds.includes(streamId));
}

export function getAllocationsForInitiative(initiativeId: string) {
  return workAllocations.filter((a) => a.initiativeId === initiativeId);
}

export function getAllocationsForStream(streamId: string) {
  const initIds = new Set(getInitiativesForStream(streamId).map((i) => i.id));
  return workAllocations.filter((a) => initIds.has(a.initiativeId));
}

export function getStreamLoadPercent(streamId: string): number {
  const allocs = getAllocationsForStream(streamId);
  return allocs.reduce((sum, a) => sum + a.percentage, 0);
}

export function getEngineersForStream(streamId: string) {
  const allocs = getAllocationsForStream(streamId);
  const empIds = [...new Set(allocs.map((a) => a.employeeId))];
  return empIds.map((id) => horizonEmployees.find((e) => e.id === id)!).filter(Boolean);
}

export function getStreamsForInitiative(initiativeId: string) {
  const init = getInitiative(initiativeId);
  if (!init) return [];
  return init.streamIds.map((id) => getStream(id)!).filter(Boolean);
}

export function getAllocationLoad(initiativeId: string): number {
  return getAllocationsForInitiative(initiativeId).reduce((s, a) => s + a.percentage, 0);
}
