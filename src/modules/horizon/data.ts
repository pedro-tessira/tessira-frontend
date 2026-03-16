import type {
  TimelineEvent,
  TimelineStream,
  AvailabilityWindow,
  HorizonStats,
  ShareLink,
  HorizonEmployee,
  Allocation,
} from "./types";

// ── Helpers ──────────────────────────────────────────────
function daysFromNow(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// ── Employees (scheduling roster) ────────────────────────
export const horizonEmployees: HorizonEmployee[] = [
  { id: "emp-001", name: "Sarah Chen", teamId: "team-001", teamName: "Platform Core" },
  { id: "emp-002", name: "Marcus Rivera", teamId: "team-002", teamName: "Backend Services" },
  { id: "emp-003", name: "Aisha Patel", teamId: "team-003", teamName: "Frontend" },
  { id: "emp-004", name: "Jonas Eriksson", teamId: "team-001", teamName: "Platform Core" },
  { id: "emp-005", name: "Mei Tanaka", teamId: "team-002", teamName: "Backend Services" },
  { id: "emp-006", name: "Alex Novak", teamId: "team-004", teamName: "Data & Observability" },
  { id: "emp-007", name: "Priya Sharma", teamId: "team-003", teamName: "Frontend" },
  { id: "emp-008", name: "David Okafor", teamId: "team-005", teamName: "Engineering Leadership" },
  { id: "emp-009", name: "Lin Zhou", teamId: "team-005", teamName: "Engineering Leadership" },
  { id: "emp-010", name: "Carlos Mendez", teamId: "team-004", teamName: "Data & Observability" },
  { id: "emp-011", name: "Emma Wilson", teamId: "team-003", teamName: "Frontend" },
  { id: "emp-012", name: "Tomasz Kowalski", teamId: "team-004", teamName: "Data & Observability" },
];

export const horizonTeams = [
  { id: "all", name: "All Teams" },
  { id: "team-001", name: "Platform Core" },
  { id: "team-002", name: "Backend Services" },
  { id: "team-003", name: "Frontend" },
  { id: "team-004", name: "Data & Observability" },
  { id: "team-005", name: "Engineering Leadership" },
];

// ── Timeline Events ──────────────────────────────────────
export const timelineEvents: TimelineEvent[] = [
  // ── Global events ──
  { id: "ev-g1", title: "Company All-Hands", type: "all_hands", status: "planned", startDate: daysFromNow(7), endDate: daysFromNow(7), isGlobal: true, description: "Quarterly all-hands meeting" },
  { id: "ev-g2", title: "Hackathon Week", type: "custom", status: "planned", startDate: daysFromNow(24), endDate: daysFromNow(28), isGlobal: true, isManual: true },
  { id: "ev-g3", title: "SOC 2 Audit Start", type: "milestone", status: "planned", startDate: daysFromNow(20), endDate: daysFromNow(20), isGlobal: true, description: "External audit begins" },
  { id: "ev-g4", title: "Q2 Planning Complete", type: "milestone", status: "completed", startDate: daysFromNow(-10), endDate: daysFromNow(-10), isGlobal: true },
  { id: "ev-g5", title: "v2.4.0 Release", type: "release", status: "planned", startDate: daysFromNow(8), endDate: daysFromNow(9), isGlobal: true, teamName: "Platform Core" },
  { id: "ev-g6", title: "Dashboard v2 Launch", type: "release", status: "planned", startDate: daysFromNow(14), endDate: daysFromNow(14), isGlobal: true, teamName: "Frontend" },

  // ── Team syncs (appear on employee lanes of that team) ──
  { id: "ev-ts1", title: "Platform Sync", type: "team_sync", status: "active", startDate: daysFromNow(0), endDate: daysFromNow(0), teamId: "team-001", teamName: "Platform Core" },
  { id: "ev-ts2", title: "Frontend Standup", type: "team_sync", status: "active", startDate: daysFromNow(1), endDate: daysFromNow(1), teamId: "team-003", teamName: "Frontend" },
  { id: "ev-ts3", title: "Backend Retro", type: "team_sync", status: "planned", startDate: daysFromNow(5), endDate: daysFromNow(5), teamId: "team-002", teamName: "Backend Services" },

  // ── Individual events ──
  // PTO / Vacation
  { id: "ev-p1", title: "Vacation", type: "vacation", status: "active", startDate: daysFromNow(-1), endDate: daysFromNow(3), employeeId: "emp-004", employeeName: "Jonas Eriksson" },
  { id: "ev-p2", title: "PTO", type: "pto", status: "planned", startDate: daysFromNow(6), endDate: daysFromNow(10), employeeId: "emp-002", employeeName: "Marcus Rivera" },
  { id: "ev-p3", title: "PTO", type: "pto", status: "planned", startDate: daysFromNow(12), endDate: daysFromNow(14), employeeId: "emp-006", employeeName: "Alex Novak" },
  { id: "ev-p4", title: "Vacation", type: "vacation", status: "planned", startDate: daysFromNow(18), endDate: daysFromNow(22), employeeId: "emp-003", employeeName: "Aisha Patel" },
  { id: "ev-p5", title: "PTO", type: "pto", status: "planned", startDate: daysFromNow(3), endDate: daysFromNow(4), employeeId: "emp-010", employeeName: "Carlos Mendez" },

  // Onboarding
  { id: "ev-o1", title: "Onboarding", type: "onboarding", status: "planned", startDate: daysFromNow(15), endDate: daysFromNow(29), employeeId: "emp-011", employeeName: "Emma Wilson", description: "Full onboarding program" },

  // Incident
  { id: "ev-i1", title: "Auth Degradation", type: "incident", status: "completed", startDate: daysFromNow(-3), endDate: daysFromNow(-2), employeeId: "emp-001", employeeName: "Sarah Chen" },

  // Sprint work (per person)
  { id: "ev-s1", title: "Auth Refactor", type: "sprint", status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(9), employeeId: "emp-001", employeeName: "Sarah Chen" },
  { id: "ev-s2", title: "API Gateway", type: "sprint", status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(9), employeeId: "emp-004", employeeName: "Jonas Eriksson" },
  { id: "ev-s3", title: "Dashboard v2", type: "sprint", status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(9), employeeId: "emp-007", employeeName: "Priya Sharma" },
  { id: "ev-s4", title: "Pipeline Perf", type: "sprint", status: "active", startDate: daysFromNow(-3), endDate: daysFromNow(11), employeeId: "emp-010", employeeName: "Carlos Mendez" },
  { id: "ev-s5", title: "Design System", type: "sprint", status: "planned", startDate: daysFromNow(10), endDate: daysFromNow(23), employeeId: "emp-003", employeeName: "Aisha Patel" },

  // Custom
  { id: "ev-c1", title: "Conference Talk", type: "custom", status: "planned", startDate: daysFromNow(16), endDate: daysFromNow(17), employeeId: "emp-008", employeeName: "David Okafor", isManual: true },
];

// ── Legacy Streams (kept for overview) ───────────────────
export const timelineStreams: TimelineStream[] = [
  { id: "s-1", name: "Platform Core", teamId: "t-1", teamName: "Platform Core", events: timelineEvents.filter((e) => e.teamId === "team-001" || e.employeeId === "emp-001" || e.employeeId === "emp-004") },
  { id: "s-2", name: "Frontend", teamId: "t-2", teamName: "Frontend", events: timelineEvents.filter((e) => e.teamId === "team-003" || e.employeeId === "emp-003" || e.employeeId === "emp-007" || e.employeeId === "emp-011") },
  { id: "s-3", name: "Backend Services", teamId: "t-3", teamName: "Backend Services", events: timelineEvents.filter((e) => e.teamId === "team-002" || e.employeeId === "emp-002" || e.employeeId === "emp-005") },
];

// ── Availability ─────────────────────────────────────────
export const availabilityWindows: AvailabilityWindow[] = [
  // Sarah Chen — available then sick leave
  { employeeId: "emp-001", employeeName: "Sarah Chen", teamName: "Platform Core", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(8) },
  { employeeId: "emp-001", employeeName: "Sarah Chen", teamName: "Platform Core", status: "unavailable", startDate: daysFromNow(9), endDate: daysFromNow(11), reason: "Sick leave" },
  { employeeId: "emp-001", employeeName: "Sarah Chen", teamName: "Platform Core", status: "available", startDate: daysFromNow(12), endDate: daysFromNow(28) },

  // Marcus Rivera — available then PTO
  { employeeId: "emp-002", employeeName: "Marcus Rivera", teamName: "Backend Services", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(5) },
  { employeeId: "emp-002", employeeName: "Marcus Rivera", teamName: "Backend Services", status: "unavailable", startDate: daysFromNow(6), endDate: daysFromNow(10), reason: "PTO" },
  { employeeId: "emp-002", employeeName: "Marcus Rivera", teamName: "Backend Services", status: "available", startDate: daysFromNow(11), endDate: daysFromNow(28) },

  // Aisha Patel — available then vacation
  { employeeId: "emp-003", employeeName: "Aisha Patel", teamName: "Frontend", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(17) },
  { employeeId: "emp-003", employeeName: "Aisha Patel", teamName: "Frontend", status: "unavailable", startDate: daysFromNow(18), endDate: daysFromNow(22), reason: "Vacation" },
  { employeeId: "emp-003", employeeName: "Aisha Patel", teamName: "Frontend", status: "available", startDate: daysFromNow(23), endDate: daysFromNow(28) },

  // Jonas Eriksson — vacation then available then sick
  { employeeId: "emp-004", employeeName: "Jonas Eriksson", teamName: "Platform Core", status: "unavailable", startDate: daysFromNow(-1), endDate: daysFromNow(3), reason: "Vacation" },
  { employeeId: "emp-004", employeeName: "Jonas Eriksson", teamName: "Platform Core", status: "available", startDate: daysFromNow(4), endDate: daysFromNow(20) },
  { employeeId: "emp-004", employeeName: "Jonas Eriksson", teamName: "Platform Core", status: "unavailable", startDate: daysFromNow(21), endDate: daysFromNow(23), reason: "Sick leave" },
  { employeeId: "emp-004", employeeName: "Jonas Eriksson", teamName: "Platform Core", status: "available", startDate: daysFromNow(24), endDate: daysFromNow(28) },

  // Mei Tanaka — available full range
  { employeeId: "emp-005", employeeName: "Mei Tanaka", teamName: "Backend Services", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(28) },

  // Alex Novak — available then PTO
  { employeeId: "emp-006", employeeName: "Alex Novak", teamName: "Data & Observability", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(11) },
  { employeeId: "emp-006", employeeName: "Alex Novak", teamName: "Data & Observability", status: "unavailable", startDate: daysFromNow(12), endDate: daysFromNow(14), reason: "PTO" },
  { employeeId: "emp-006", employeeName: "Alex Novak", teamName: "Data & Observability", status: "available", startDate: daysFromNow(15), endDate: daysFromNow(28) },

  // Priya Sharma — partial allocation mid-range
  { employeeId: "emp-007", employeeName: "Priya Sharma", teamName: "Frontend", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(6) },
  { employeeId: "emp-007", employeeName: "Priya Sharma", teamName: "Frontend", status: "partial", startDate: daysFromNow(7), endDate: daysFromNow(14), reason: "Cross-team project allocation" },
  { employeeId: "emp-007", employeeName: "Priya Sharma", teamName: "Frontend", status: "available", startDate: daysFromNow(15), endDate: daysFromNow(28) },

  // David Okafor — available then company event overlap
  { employeeId: "emp-008", employeeName: "David Okafor", teamName: "Engineering Leadership", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(28) },

  // Lin Zhou — available then sick leave
  { employeeId: "emp-009", employeeName: "Lin Zhou", teamName: "Engineering Leadership", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(13) },
  { employeeId: "emp-009", employeeName: "Lin Zhou", teamName: "Engineering Leadership", status: "unavailable", startDate: daysFromNow(14), endDate: daysFromNow(16), reason: "Sick leave" },
  { employeeId: "emp-009", employeeName: "Lin Zhou", teamName: "Engineering Leadership", status: "available", startDate: daysFromNow(17), endDate: daysFromNow(28) },

  // Carlos Mendez — PTO then partial then available
  { employeeId: "emp-010", employeeName: "Carlos Mendez", teamName: "Data & Observability", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(2) },
  { employeeId: "emp-010", employeeName: "Carlos Mendez", teamName: "Data & Observability", status: "unavailable", startDate: daysFromNow(3), endDate: daysFromNow(7), reason: "Vacation" },
  { employeeId: "emp-010", employeeName: "Carlos Mendez", teamName: "Data & Observability", status: "partial", startDate: daysFromNow(8), endDate: daysFromNow(12), reason: "Ramp-up after PTO" },
  { employeeId: "emp-010", employeeName: "Carlos Mendez", teamName: "Data & Observability", status: "available", startDate: daysFromNow(13), endDate: daysFromNow(28) },

  // Emma Wilson — onboarding partial
  { employeeId: "emp-011", employeeName: "Emma Wilson", teamName: "Frontend", status: "partial", startDate: daysFromNow(0), endDate: daysFromNow(14), reason: "Onboarding" },
  { employeeId: "emp-011", employeeName: "Emma Wilson", teamName: "Frontend", status: "available", startDate: daysFromNow(15), endDate: daysFromNow(28) },

  // Tomasz Kowalski — available then vacation
  { employeeId: "emp-012", employeeName: "Tomasz Kowalski", teamName: "Data & Observability", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(18) },
  { employeeId: "emp-012", employeeName: "Tomasz Kowalski", teamName: "Data & Observability", status: "unavailable", startDate: daysFromNow(19), endDate: daysFromNow(24), reason: "Vacation" },
  { employeeId: "emp-012", employeeName: "Tomasz Kowalski", teamName: "Data & Observability", status: "available", startDate: daysFromNow(25), endDate: daysFromNow(28) },
];

// ── Allocations ─────────────────────────────────────────
export const allocations: Allocation[] = [
  { id: "alloc-01", employeeId: "emp-001", employeeName: "Sarah Chen", project: "Auth Refactor", percentage: 60, startDate: daysFromNow(-5), endDate: daysFromNow(9), teamId: "team-001", teamName: "Platform Core", source: "jira" },
  { id: "alloc-02", employeeId: "emp-001", employeeName: "Sarah Chen", project: "API Gateway", percentage: 30, startDate: daysFromNow(10), endDate: daysFromNow(20), teamId: "team-001", teamName: "Platform Core", source: "jira" },
  { id: "alloc-03", employeeId: "emp-002", employeeName: "Marcus Rivera", project: "Payment Service", percentage: 80, startDate: daysFromNow(0), endDate: daysFromNow(14), teamId: "team-002", teamName: "Backend Services", source: "linear" },
  { id: "alloc-04", employeeId: "emp-003", employeeName: "Aisha Patel", project: "Design System", percentage: 50, startDate: daysFromNow(0), endDate: daysFromNow(17), teamId: "team-003", teamName: "Frontend", source: "manual" },
  { id: "alloc-05", employeeId: "emp-003", employeeName: "Aisha Patel", project: "Dashboard v2", percentage: 40, startDate: daysFromNow(0), endDate: daysFromNow(12), teamId: "team-003", teamName: "Frontend", source: "jira" },
  { id: "alloc-06", employeeId: "emp-004", employeeName: "Jonas Eriksson", project: "API Gateway", percentage: 70, startDate: daysFromNow(4), endDate: daysFromNow(18), teamId: "team-001", teamName: "Platform Core", source: "jira" },
  { id: "alloc-07", employeeId: "emp-005", employeeName: "Mei Tanaka", project: "Checkout Platform", percentage: 100, startDate: daysFromNow(0), endDate: daysFromNow(28), teamId: "team-002", teamName: "Backend Services", source: "linear" },
  { id: "alloc-08", employeeId: "emp-006", employeeName: "Alex Novak", project: "Pipeline Perf", percentage: 50, startDate: daysFromNow(0), endDate: daysFromNow(11), teamId: "team-004", teamName: "Data & Observability", source: "jira" },
  { id: "alloc-09", employeeId: "emp-006", employeeName: "Alex Novak", project: "Monitoring v2", percentage: 40, startDate: daysFromNow(15), endDate: daysFromNow(28), teamId: "team-004", teamName: "Data & Observability", source: "manual" },
  { id: "alloc-10", employeeId: "emp-007", employeeName: "Priya Sharma", project: "Dashboard v2", percentage: 80, startDate: daysFromNow(-5), endDate: daysFromNow(9), teamId: "team-003", teamName: "Frontend", source: "jira" },
  { id: "alloc-11", employeeId: "emp-008", employeeName: "David Okafor", project: "Eng Strategy", percentage: 40, startDate: daysFromNow(0), endDate: daysFromNow(28), teamId: "team-005", teamName: "Engineering Leadership", source: "manual" },
  { id: "alloc-12", employeeId: "emp-010", employeeName: "Carlos Mendez", project: "Pipeline Perf", percentage: 70, startDate: daysFromNow(0), endDate: daysFromNow(11), teamId: "team-004", teamName: "Data & Observability", source: "jira" },
  { id: "alloc-13", employeeId: "emp-012", employeeName: "Tomasz Kowalski", project: "Data Lake Migration", percentage: 90, startDate: daysFromNow(0), endDate: daysFromNow(18), teamId: "team-004", teamName: "Data & Observability", source: "linear" },
];

// ── Share Links ──────────────────────────────────────────
export const shareLinks: ShareLink[] = [
  { id: "sh-1", label: "Company Timeline — Q1", scope: "company", token: "abc123def", createdAt: "2026-02-01", expiresAt: "2026-06-01", isActive: true },
  { id: "sh-2", label: "Platform Core — Sprint View", scope: "team", scopeId: "t-1", scopeName: "Platform Core", token: "xyz789ghi", createdAt: "2026-03-01", expiresAt: null, isActive: true },
];

// ── Stats ────────────────────────────────────────────────
export function getHorizonStats(): HorizonStats {
  const active = timelineEvents.filter((e) => e.status === "active").length;
  const upcoming = timelineEvents.filter((e) => e.status === "planned").length;
  const ptos = timelineEvents.filter(
    (e) => (e.type === "pto" || e.type === "vacation") && (e.status === "active" || e.status === "planned") &&
      new Date(e.startDate) <= new Date(daysFromNow(7))
  ).length;
  const milestones = timelineEvents.filter(
    (e) => e.type === "milestone" && new Date(e.startDate) <= new Date(daysFromNow(30))
  ).length;
  const avail = availabilityWindows.filter((a) => a.status === "available").length;

  return {
    activeStreams: timelineStreams.length,
    upcomingEvents: upcoming,
    ptoThisWeek: ptos,
    milestonesThisMonth: milestones,
    availabilityRate: Math.round((avail / availabilityWindows.length) * 100),
  };
}
