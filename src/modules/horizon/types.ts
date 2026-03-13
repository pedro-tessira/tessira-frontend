export type EventType = "sprint" | "release" | "pto" | "milestone" | "incident" | "onboarding" | "offboarding" | "custom";
export type EventStatus = "planned" | "active" | "completed" | "cancelled";

export interface TimelineEvent {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  ownerId?: string;
  ownerName?: string;
  teamId?: string;
  teamName?: string;
  description?: string;
  isManual?: boolean;
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
  activeStreams: number;
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
