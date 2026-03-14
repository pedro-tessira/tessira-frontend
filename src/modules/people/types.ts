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
  | "Negative Behaviour";

export interface FollowUpNote {
  id: string;
  employeeId: string;
  date: string;
  author: string;
  category: NoteCategory;
  evaluationTypes: EvaluationType[];
  text: string;
}
