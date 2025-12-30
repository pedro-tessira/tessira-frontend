export type EventScope = "INDIVIDUAL" | "TEAM" | "GLOBAL";
export type EventSource = "WORKDAY" | "MANUAL";
export type EventLevel = "individual" | "team" | "company";

export interface EventTypeDto {
  id: string;
  code?: string;
  name: string;
  scope: EventScope;
  teamId?: string | null;
  source?: EventSource;
  color?: string | null;
  userCreatable?: boolean;
}

export interface EmployeeDto {
  id: string;
  displayName: string;
  email: string;
}

export interface MeDto extends EmployeeDto {
  role: string;
  employeeId: string;
}

export type TeamRole = "OWNER" | "MEMBER";

export interface TeamEmployeeDto extends EmployeeDto {
  teamId: string;
  isOwner?: boolean;
  membershipId?: string;
  roleInTeam?: TeamRole;
}

export interface TeamMembershipDto {
  id: string;
  teamId: string;
  employeeId: string;
  employeeDisplayName: string;
  employeeEmail: string;
  roleInTeam: TeamRole;
  startDate?: string;
  endDate?: string;
}

export interface EmployeeSearchDto {
  id: string;
  displayName: string;
  email: string;
  source?: "INTERNAL_WORKDAY" | "EXTERNAL_MANUAL";
}

export interface EventTypeConfig {
  id: string;
  type: string;
  label: string;
  color: string;
  source: EventSource;
  level: EventLevel;
  teamIds?: string[]; // For company level: specific teams this applies to (empty = global)
  isGlobal?: boolean; // For company level: available to all teams (admin only)
}

export interface TeamDto {
  id: string;
  name: string;
}

export interface EventDto {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  scope: EventScope;
  source?: EventSource;
  eventTypeId?: string | null;
  eventType?: EventTypeDto | null;
  isLocked: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isAggregated?: boolean;
}

export interface TimelineResponseDto {
  team: TeamDto;
  range: { from: string; to: string };
  globalLane: {
    events: EventDto[];
    aggregation: { hasMore: boolean; hiddenCount: number };
  };
  rows: {
    employee: EmployeeDto;
    events: EventDto[];
    aggregation: { hasMore: boolean; hiddenCount: number };
  }[];
}

export interface EmployeeEventsResponseDto {
  teamId: string;
  employee: EmployeeDto;
  range: { from: string; to: string };
  events: EventDto[];
}

export interface TimelineEvent extends EventDto {
  employeeId: string | null;
  employeeName?: string;
}

// Special ID for company events row
export const COMPANY_ROW_ID = 'company-events';

export type Granularity = 'Day' | 'Month' | 'Quarter' | 'Year';
