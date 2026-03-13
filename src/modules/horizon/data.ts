import type {
  TimelineEvent,
  TimelineStream,
  AvailabilityWindow,
  HorizonStats,
  ShareLink,
} from "./types";

// ── Helpers ──────────────────────────────────────────────
function daysFromNow(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// ── Timeline Events ──────────────────────────────────────
export const timelineEvents: TimelineEvent[] = [
  // Sprints
  { id: "ev-1", title: "Sprint 24", type: "sprint", status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(9), teamId: "t-1", teamName: "Platform Core", description: "Auth refactor + observability" },
  { id: "ev-2", title: "Sprint 24", type: "sprint", status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(9), teamId: "t-2", teamName: "Frontend", description: "Dashboard v2 + design system" },
  { id: "ev-3", title: "Sprint 24", type: "sprint", status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(9), teamId: "t-3", teamName: "Data Engineering", description: "Pipeline performance" },
  { id: "ev-4", title: "Sprint 25", type: "sprint", status: "planned", startDate: daysFromNow(10), endDate: daysFromNow(23), teamId: "t-1", teamName: "Platform Core" },
  { id: "ev-5", title: "Sprint 25", type: "sprint", status: "planned", startDate: daysFromNow(10), endDate: daysFromNow(23), teamId: "t-2", teamName: "Frontend" },

  // Releases
  { id: "ev-6", title: "v2.4.0 Release", type: "release", status: "planned", startDate: daysFromNow(8), endDate: daysFromNow(9), teamId: "t-1", teamName: "Platform Core", description: "Auth service + API gateway" },
  { id: "ev-7", title: "Dashboard v2 Launch", type: "release", status: "planned", startDate: daysFromNow(14), endDate: daysFromNow(14), teamId: "t-2", teamName: "Frontend" },

  // Milestones
  { id: "ev-8", title: "Q2 Planning Complete", type: "milestone", status: "completed", startDate: daysFromNow(-10), endDate: daysFromNow(-10) },
  { id: "ev-9", title: "SOC 2 Audit Start", type: "milestone", status: "planned", startDate: daysFromNow(20), endDate: daysFromNow(20), description: "External audit begins" },

  // PTO / Availability
  { id: "ev-10", title: "Sarah Chen — PTO", type: "pto", status: "active", startDate: daysFromNow(-1), endDate: daysFromNow(3), ownerId: "emp-2", ownerName: "Sarah Chen", teamName: "Platform Core" },
  { id: "ev-11", title: "Marcus Johnson — PTO", type: "pto", status: "planned", startDate: daysFromNow(6), endDate: daysFromNow(10), ownerId: "emp-3", ownerName: "Marcus Johnson", teamName: "Frontend" },
  { id: "ev-12", title: "Priya Patel — PTO", type: "pto", status: "planned", startDate: daysFromNow(12), endDate: daysFromNow(14), ownerId: "emp-4", ownerName: "Priya Patel", teamName: "Data Engineering" },

  // Onboarding
  { id: "ev-13", title: "New Hire: Aisha Kumar", type: "onboarding", status: "planned", startDate: daysFromNow(15), endDate: daysFromNow(29), teamName: "Frontend", description: "Frontend engineer onboarding" },

  // Incidents
  { id: "ev-14", title: "Auth Degradation", type: "incident", status: "completed", startDate: daysFromNow(-3), endDate: daysFromNow(-2), teamName: "Platform Core" },

  // Custom / Manual
  { id: "ev-15", title: "Company All-Hands", type: "custom", status: "planned", startDate: daysFromNow(7), endDate: daysFromNow(7), isManual: true, description: "Quarterly all-hands meeting" },
  { id: "ev-16", title: "Hackathon Week", type: "custom", status: "planned", startDate: daysFromNow(24), endDate: daysFromNow(28), isManual: true },
];

// ── Streams ──────────────────────────────────────────────
export const timelineStreams: TimelineStream[] = [
  {
    id: "s-1",
    name: "Platform Core",
    teamId: "t-1",
    teamName: "Platform Core",
    events: timelineEvents.filter((e) => e.teamId === "t-1" || (!e.teamId && !e.ownerId)),
  },
  {
    id: "s-2",
    name: "Frontend",
    teamId: "t-2",
    teamName: "Frontend",
    events: timelineEvents.filter((e) => e.teamId === "t-2"),
  },
  {
    id: "s-3",
    name: "Data Engineering",
    teamId: "t-3",
    teamName: "Data Engineering",
    events: timelineEvents.filter((e) => e.teamId === "t-3"),
  },
];

// ── Availability ─────────────────────────────────────────
export const availabilityWindows: AvailabilityWindow[] = [
  { employeeId: "emp-1", employeeName: "Alex Morgan", teamName: "Platform Core", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(14) },
  { employeeId: "emp-2", employeeName: "Sarah Chen", teamName: "Platform Core", status: "unavailable", startDate: daysFromNow(-1), endDate: daysFromNow(3), reason: "PTO" },
  { employeeId: "emp-3", employeeName: "Marcus Johnson", teamName: "Frontend", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(5) },
  { employeeId: "emp-3", employeeName: "Marcus Johnson", teamName: "Frontend", status: "unavailable", startDate: daysFromNow(6), endDate: daysFromNow(10), reason: "PTO" },
  { employeeId: "emp-4", employeeName: "Priya Patel", teamName: "Data Engineering", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(11) },
  { employeeId: "emp-4", employeeName: "Priya Patel", teamName: "Data Engineering", status: "unavailable", startDate: daysFromNow(12), endDate: daysFromNow(14), reason: "PTO" },
  { employeeId: "emp-5", employeeName: "Tom Weber", teamName: "Platform Core", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(14) },
  { employeeId: "emp-6", employeeName: "Lena Müller", teamName: "Frontend", status: "partial", startDate: daysFromNow(0), endDate: daysFromNow(14), reason: "50% — onboarding buddy" },
  { employeeId: "emp-7", employeeName: "James Liu", teamName: "Data Engineering", status: "available", startDate: daysFromNow(0), endDate: daysFromNow(14) },
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
    (e) => e.type === "pto" && (e.status === "active" || e.status === "planned") &&
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
