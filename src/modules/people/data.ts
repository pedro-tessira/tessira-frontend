import type { Employee, Team, TeamMembership, PeopleStats, FollowUpNote, NoteCategory, EvaluationType, NoteVisibility, NoteImpact, NotePolarity } from "./types";

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "emp-001", firstName: "Sarah", lastName: "Chen", email: "sarah.chen@tessira.dev",
    title: "Staff Engineer", department: "Platform", status: "active",
    country: "United States", countryCode: "US", timezone: "America/Los_Angeles",
    startDate: "2021-03-15", managerId: "emp-008", managerName: "David Okafor",
    avatarUrl: null, teamIds: ["team-001", "team-005"],
  },
  {
    id: "emp-002", firstName: "Marcus", lastName: "Rivera", email: "marcus.rivera@tessira.dev",
    title: "Senior Engineer", department: "Backend", status: "active",
    country: "Germany", countryCode: "DE", timezone: "Europe/Berlin",
    startDate: "2022-01-10", managerId: "emp-008", managerName: "David Okafor",
    avatarUrl: null, teamIds: ["team-002"],
  },
  {
    id: "emp-003", firstName: "Aisha", lastName: "Patel", email: "aisha.patel@tessira.dev",
    title: "Engineering Manager", department: "Frontend", status: "active",
    country: "United Kingdom", countryCode: "GB", timezone: "Europe/London",
    startDate: "2020-09-01", managerId: "emp-009", managerName: "Lin Zhou",
    avatarUrl: null, teamIds: ["team-003"], excludeFromCapacity: true,
  },
  {
    id: "emp-004", firstName: "Jonas", lastName: "Eriksson", email: "jonas.eriksson@tessira.dev",
    title: "Senior Engineer", department: "Platform", status: "on_leave",
    country: "Sweden", countryCode: "SE", timezone: "Europe/Stockholm",
    startDate: "2021-06-20", managerId: "emp-003", managerName: "Aisha Patel",
    avatarUrl: null, teamIds: ["team-001"],
  },
  {
    id: "emp-005", firstName: "Mei", lastName: "Tanaka", email: "mei.tanaka@tessira.dev",
    title: "Engineer II", department: "Backend", status: "active",
    country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo",
    startDate: "2023-02-14", managerId: "emp-002", managerName: "Marcus Rivera",
    avatarUrl: null, teamIds: ["team-002"],
  },
  {
    id: "emp-006", firstName: "Alex", lastName: "Novak", email: "alex.novak@tessira.dev",
    title: "Senior Engineer", department: "Infrastructure", status: "active",
    country: "Canada", countryCode: "CA", timezone: "America/Toronto",
    startDate: "2022-08-01", managerId: "emp-008", managerName: "David Okafor",
    avatarUrl: null, teamIds: ["team-004", "team-005"],
  },
  {
    id: "emp-007", firstName: "Priya", lastName: "Sharma", email: "priya.sharma@tessira.dev",
    title: "Engineer II", department: "Frontend", status: "active",
    country: "India", countryCode: "IN", timezone: "Asia/Kolkata",
    startDate: "2023-05-22", managerId: "emp-003", managerName: "Aisha Patel",
    avatarUrl: null, teamIds: ["team-003"],
  },
  {
    id: "emp-008", firstName: "David", lastName: "Okafor", email: "david.okafor@tessira.dev",
    title: "VP of Engineering", department: "Engineering", status: "active",
    country: "United States", countryCode: "US", timezone: "America/New_York",
    startDate: "2019-11-04", managerId: null, managerName: null,
    avatarUrl: null, teamIds: ["team-005"],
  },
  {
    id: "emp-009", firstName: "Lin", lastName: "Zhou", email: "lin.zhou@tessira.dev",
    title: "Director of Engineering", department: "Engineering", status: "active",
    country: "Singapore", countryCode: "SG", timezone: "Asia/Singapore",
    startDate: "2020-04-12", managerId: "emp-008", managerName: "David Okafor",
    avatarUrl: null, teamIds: ["team-005"],
  },
  {
    id: "emp-010", firstName: "Carlos", lastName: "Mendez", email: "carlos.mendez@tessira.dev",
    title: "Senior Engineer", department: "Data", status: "active",
    country: "Spain", countryCode: "ES", timezone: "Europe/Madrid",
    startDate: "2022-03-28", managerId: "emp-009", managerName: "Lin Zhou",
    avatarUrl: null, teamIds: ["team-004"],
  },
  {
    id: "emp-011", firstName: "Emma", lastName: "Wilson", email: "emma.wilson@tessira.dev",
    title: "Engineer I", department: "Frontend", status: "active",
    country: "Australia", countryCode: "AU", timezone: "Australia/Sydney",
    startDate: "2024-01-08", managerId: "emp-003", managerName: "Aisha Patel",
    avatarUrl: null, teamIds: ["team-003"],
  },
  {
    id: "emp-012", firstName: "Tomasz", lastName: "Kowalski", email: "tomasz.kowalski@tessira.dev",
    title: "Staff Engineer", department: "Infrastructure", status: "offboarding",
    country: "Poland", countryCode: "PL", timezone: "Europe/Warsaw",
    startDate: "2020-07-15", managerId: "emp-008", managerName: "David Okafor",
    avatarUrl: null, teamIds: ["team-004"],
  },
];

export const MOCK_TEAMS: Team[] = [
  {
    id: "team-001", name: "Platform Core", slug: "platform-core",
    description: "Core platform services, auth, and API gateway. Owns the foundational infrastructure that other teams build upon.",
    leadId: "emp-001", leadName: "Sarah Chen", parentTeamId: null, memberCount: 4,
    createdAt: "2021-01-10", tags: ["platform", "critical-path"],
  },
  {
    id: "team-002", name: "Backend Services", slug: "backend-services",
    description: "Business logic services, data processing pipelines, and service-to-service communication layer.",
    leadId: "emp-002", leadName: "Marcus Rivera", parentTeamId: null, memberCount: 5,
    createdAt: "2021-03-01", tags: ["backend", "services"],
  },
  {
    id: "team-003", name: "Product Frontend", slug: "product-frontend",
    description: "Customer-facing product UI, design system, and frontend infrastructure. Includes web and mobile web surfaces.",
    leadId: "emp-003", leadName: "Aisha Patel", parentTeamId: null, memberCount: 4,
    createdAt: "2020-09-15", tags: ["frontend", "product"],
  },
  {
    id: "team-004", name: "Data & Observability", slug: "data-observability",
    description: "Data pipelines, analytics infrastructure, monitoring, and observability tooling across the engineering org.",
    leadId: "emp-010", leadName: "Carlos Mendez", parentTeamId: null, memberCount: 3,
    createdAt: "2022-06-01", tags: ["data", "observability", "infrastructure"],
  },
  {
    id: "team-005", name: "Engineering Leadership", slug: "engineering-leadership",
    description: "Cross-cutting engineering leadership. Drives org-wide standards, planning, and strategic technical decisions.",
    leadId: "emp-008", leadName: "David Okafor", parentTeamId: null, memberCount: 4,
    createdAt: "2019-11-01", tags: ["leadership", "cross-cutting"],
  },
];

export const MOCK_MEMBERSHIPS: TeamMembership[] = [
  { id: "m-01", employeeId: "emp-001", teamId: "team-001", role: "lead", since: "2021-03-15" },
  { id: "m-02", employeeId: "emp-001", teamId: "team-005", role: "contributor", since: "2023-01-01" },
  { id: "m-03", employeeId: "emp-002", teamId: "team-002", role: "lead", since: "2022-01-10" },
  { id: "m-04", employeeId: "emp-003", teamId: "team-003", role: "lead", since: "2020-09-01" },
  { id: "m-05", employeeId: "emp-004", teamId: "team-001", role: "member", since: "2021-06-20" },
  { id: "m-06", employeeId: "emp-005", teamId: "team-002", role: "member", since: "2023-02-14" },
  { id: "m-07", employeeId: "emp-006", teamId: "team-004", role: "member", since: "2022-08-01" },
  { id: "m-08", employeeId: "emp-006", teamId: "team-005", role: "contributor", since: "2023-06-01" },
  { id: "m-09", employeeId: "emp-007", teamId: "team-003", role: "member", since: "2023-05-22" },
  { id: "m-10", employeeId: "emp-008", teamId: "team-005", role: "lead", since: "2019-11-04" },
  { id: "m-11", employeeId: "emp-009", teamId: "team-005", role: "member", since: "2020-04-12" },
  { id: "m-12", employeeId: "emp-010", teamId: "team-004", role: "lead", since: "2022-06-01" },
  { id: "m-13", employeeId: "emp-011", teamId: "team-003", role: "member", since: "2024-01-08" },
  { id: "m-14", employeeId: "emp-012", teamId: "team-004", role: "member", since: "2020-07-15" },
];

export function getPeopleStats(): PeopleStats {
  const active = MOCK_EMPLOYEES.filter((e) => e.status === "active").length;
  const onLeave = MOCK_EMPLOYEES.filter((e) => e.status === "on_leave").length;
  const countries = new Set(MOCK_EMPLOYEES.map((e) => e.countryCode)).size;
  return {
    totalEmployees: MOCK_EMPLOYEES.length,
    activeEmployees: active,
    totalTeams: MOCK_TEAMS.length,
    avgTeamSize: Math.round((MOCK_EMPLOYEES.length / MOCK_TEAMS.length) * 10) / 10,
    onLeave,
    countriesRepresented: countries,
  };
}

export function getEmployee(id: string) {
  return MOCK_EMPLOYEES.find((e) => e.id === id) ?? null;
}

export function getTeam(id: string) {
  return MOCK_TEAMS.find((t) => t.id === id) ?? null;
}

export function getTeamMembers(teamId: string) {
  const memberIds = MOCK_MEMBERSHIPS.filter((m) => m.teamId === teamId);
  return memberIds.map((m) => ({
    ...m,
    employee: MOCK_EMPLOYEES.find((e) => e.id === m.employeeId)!,
  }));
}

export function getEmployeeMemberships(employeeId: string) {
  const memberships = MOCK_MEMBERSHIPS.filter((m) => m.employeeId === employeeId);
  return memberships.map((m) => ({
    ...m,
    team: MOCK_TEAMS.find((t) => t.id === m.teamId)!,
  }));
}

// ── Follow-up Notes ──────────────────────────────────────────────

const MOCK_NOTES: FollowUpNote[] = [
  {
    id: "note-001", employeeId: "emp-001", date: "2026-03-14",
    author: "Aisha Patel", visibility: "visible", polarity: "positive", impact: "high",
    category: "Feedback", evaluationTypes: ["Decision Making", "Leadership Mindset"],
    text: "Sarah made a strong decision during the API Gateway redesign and aligned teams quickly.",
    followUpRequired: false, followUpDate: null,
  },
  {
    id: "note-002", employeeId: "emp-001", date: "2026-03-07",
    author: "David Okafor", visibility: "personal", polarity: "positive", impact: "medium",
    category: "1:1", evaluationTypes: ["Ownership", "Execution"],
    text: "Discussed her ownership of the migration timeline. She proactively identified two blockers and resolved them before escalation.",
    followUpRequired: true, followUpDate: "2026-03-21",
  },
  {
    id: "note-003", employeeId: "emp-001", date: "2026-02-20",
    author: "Aisha Patel", visibility: "visible", polarity: "positive", impact: "low",
    category: "Recognition", evaluationTypes: ["Collaboration", "Mentorship"],
    text: "Sarah paired with two junior engineers on the caching layer refactor. Both shipped their first PRs ahead of schedule.",
    followUpRequired: false, followUpDate: null,
  },
  {
    id: "note-004", employeeId: "emp-002", date: "2026-03-10",
    author: "David Okafor", visibility: "visible", polarity: "neutral", impact: "medium",
    category: "Career Discussion", evaluationTypes: ["Technical Excellence", "Leadership Mindset"],
    text: "Marcus is interested in moving toward a staff track. We discussed what technical leadership looks like in the Backend Services domain.",
    followUpRequired: true, followUpDate: "2026-04-10",
  },
  {
    id: "note-005", employeeId: "emp-003", date: "2026-03-12",
    author: "Lin Zhou", visibility: "visible", polarity: "positive", impact: "high",
    category: "Performance", evaluationTypes: ["Delivery Impact", "Communication"],
    text: "Aisha's team shipped the new design system on schedule. Her stakeholder communication throughout was exemplary.",
    followUpRequired: false, followUpDate: null,
  },
];

let notesStore = [...MOCK_NOTES];

export function getNotesForEmployee(employeeId: string): FollowUpNote[] {
  return notesStore
    .filter((n) => n.employeeId === employeeId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function addNote(input: {
  employeeId: string;
  author: string;
  visibility: NoteVisibility;
  polarity: NotePolarity;
  impact: NoteImpact;
  category: NoteCategory;
  evaluationTypes: EvaluationType[];
  text: string;
  followUpRequired: boolean;
  followUpDate: string | null;
}): FollowUpNote {
  const note: FollowUpNote = {
    id: `note-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    ...input,
  };
  notesStore = [note, ...notesStore];
  return note;
}
