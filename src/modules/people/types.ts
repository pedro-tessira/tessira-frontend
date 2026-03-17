export type EmployeeStatus = "active" | "on_leave" | "offboarding" | "inactive";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  department: string;
  status: EmployeeStatus;
  country: string;
  countryCode: string;
  timezone: string;
  startDate: string;
  managerId: string | null;
  managerName: string | null;
  avatarUrl: string | null;
  teamIds: string[];
  /** If true, this person is excluded from capacity planning, initiative allocation, and FTE metrics (e.g. management). */
  excludeFromCapacity?: boolean;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string;
  leadId: string;
  leadName: string;
  parentTeamId: string | null;
  memberCount: number;
  createdAt: string;
  tags: string[];
}

export interface TeamMembership {
  id: string;
  employeeId: string;
  teamId: string;
  role: "member" | "lead" | "contributor";
  since: string;
}

export interface PeopleStats {
  totalEmployees: number;
  activeEmployees: number;
  totalTeams: number;
  avgTeamSize: number;
  onLeave: number;
  countriesRepresented: number;
}

export type NoteCategory =
  | "1:1"
  | "Feedback"
  | "Career Discussion"
  | "Recognition"
  | "Concern"
  | "Follow-up"
  | "Performance";

export type EvaluationType =
  | "Decision Making"
  | "Leadership Mindset"
  | "Technical Excellence"
  | "Ownership"
  | "Collaboration"
  | "Communication"
  | "Execution"
  | "Mentorship"
  | "Delivery Impact"
  | "Reliability"
  | "Negative Behaviour";

export type NoteVisibility = "personal" | "visible";

export type NotePolarity = "positive" | "neutral" | "negative";

export type NoteImpact = "low" | "medium" | "high";

export interface FollowUpNote {
  id: string;
  employeeId: string;
  date: string;
  author: string;
  visibility: NoteVisibility;
  polarity: NotePolarity;
  impact: NoteImpact;
  category: NoteCategory;
  evaluationTypes: EvaluationType[];
  text: string;
  followUpRequired: boolean;
  followUpDate: string | null;
  pinned?: boolean;
}
