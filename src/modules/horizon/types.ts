export type EventType =
  | "all_hands"
  | "team_sync"
  | "vacation"
  | "pto"
  | "milestone"
  | "incident"
  | "onboarding"
  | "offboarding"
  | "sprint"
  | "release"
  | "custom";

export type EventStatus = "planned" | "active" | "completed" | "cancelled";

export interface TimelineEvent {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  /** If set, event appears in this employee's lane */
  employeeId?: string;
  employeeName?: string;
  /** If set without employeeId, event appears in global lane */
  teamId?: string;
  teamName?: string;
  description?: string;
  isManual?: boolean;
  /** true → shows in global lane regardless */
  isGlobal?: boolean;
}

export interface TimelineStream {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  events: TimelineEvent[];
}

export interface AvailabilityWindow {
  employeeId: string;
  employeeName: string;
  teamName: string;
  status: "available" | "partial" | "unavailable";
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface HorizonStats {
  activeInitiatives: number;
  upcomingEvents: number;
  ptoThisWeek: number;
  milestonesThisMonth: number;
  availabilityRate: number;
}

export interface ShareLink {
  id: string;
  label: string;
  scope: "company" | "team" | "individual";
  scopeId?: string;
  scopeName?: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface Allocation {
  id: string;
  employeeId: string;
  employeeName: string;
  initiative: string;
  percentage: number;
  startDate: string;
  endDate: string;
  teamId: string;
  teamName: string;
  source?: "manual" | "jira" | "linear";
  description?: string;
}

export interface HorizonEmployee {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
}
