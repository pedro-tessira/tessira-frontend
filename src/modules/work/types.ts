export type InitiativeStatus = "planned" | "active" | "completed";

export interface Stream {
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
  streamIds: string[];
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
