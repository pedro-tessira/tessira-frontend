export type InitiativeStatus = "planned" | "active" | "completed";
export type ConfidenceLevel = "low" | "medium" | "high";
export type StaffingStatus = "understaffed" | "balanced" | "overstaffed";

export interface RoleEffort {
  role: string; // e.g. "Backend", "Frontend", "Data", "DevOps"
  days: number;
}

export interface HighLevelEstimate {
  totalEffortDays: number;
  roleBreakdown: RoleEffort[];
  confidence: ConfidenceLevel;
  drivers: string;
}

export interface ValueStream {
  id: string;
  name: string;
  description: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  owningTeamId: string;
  owningTeamName: string;
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  status: InitiativeStatus;
  startDate: string;
  endDate: string;
  domainIds: string[];
  valueStreamIds: string[];
  estimate: HighLevelEstimate;
}

export interface WorkAllocation {
  id: string;
  employeeId: string;
  employeeName: string;
  initiativeId: string;
  initiativeName: string;
  percentage: number;
  startDate: string;
  endDate: string;
  teamId: string;
  teamName: string;
}
