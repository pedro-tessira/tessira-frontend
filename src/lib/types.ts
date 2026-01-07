export type EventScope = "INDIVIDUAL" | "TEAM" | "GLOBAL";
export type EventSource = "WORKDAY" | "MANUAL";
export type EventLevel = "individual" | "team" | "company";

export interface EventTypeDto {
  id: string;
  code?: string;
  name: string;
  scope: EventScope;
  teamId?: string | null;
  teamIds?: string[] | null;
  source?: EventSource;
  color?: string | null;
  userCreatable?: boolean;
}

export interface EmployeeDto {
  id: string;
  displayName: string;
  fullName?: string;
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
  employeeFullName: string;
  employeeEmail: string;
  roleInTeam: TeamRole;
  startDate?: string;
  endDate?: string;
}

export interface EmployeeSearchDto {
  id: string;
  displayName?: string;
  fullName?: string;
  email: string;
  source?: "INTERNAL_WORKDAY" | "EXTERNAL_MANUAL";
  active?: boolean;
  user?: UserSummary | null;
}

export interface UserSummary {
  id: string;
  email: string;
  displayName: string;
  role: string;
  active?: boolean;
}

export interface EventTypeConfig {
  id: string;
  code: string;
  label: string;
  color: string;
  source: EventSource;
  level: EventLevel;
  teamIds?: string[]; // For company level: specific teams this applies to (empty = global)
  isGlobal?: boolean; // For company level: available to all teams (admin only)
}

export interface CreateShareRequest {
  teamId: string;
  title?: string | null;
  employeeIds?: string[] | null;
  eventTypeIds?: string[] | null;
  includeGlobalLane: boolean;
  expiresAt?: string | null;
}

export interface CreateShareResponse {
  token: string;
  urlPath: string;
  id?: string;
}

export interface ShareSummary {
  id: string;
  token: string;
  urlPath: string;
  title?: string | null;
  teamId: string;
  createdAt: string;
  expiresAt?: string | null;
  createdByUserId: string;
  createdByName?: string | null;
  includeGlobalLane: boolean;
  employeeIds?: string[] | null;
  employeeNames?: string[] | null;
  eventTypeIds?: string[] | null;
  eventTypeNames?: string[] | null;
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

export interface EventAuditDto {
  id: string;
  scope: EventScope;
  teamId?: string | null;
  employeeId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  title?: string | null;
  source?: string | null;
  deletedAt?: string | null;
  eventType?: {
    id: string;
    code?: string | null;
    name?: string | null;
    scope: EventScope;
  } | null;
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

export interface ShareTimelineResponse {
  title?: string | null;
  team: TeamDto;
  generatedAt: string;
  timeline: {
    globalLane?: {
      events: EventDto[];
      aggregation?: { hasMore: boolean; hiddenCount: number };
    };
    rows: {
      employee: EmployeeDto;
      events: EventDto[];
      aggregation?: { hasMore: boolean; hiddenCount: number };
    }[];
  };
}

export interface TimelineEvent extends EventDto {
  employeeId: string | null;
  employeeName?: string;
}

// Special ID for company events row
export const COMPANY_ROW_ID = 'company-events';

export type Granularity = 'Day' | 'Month' | 'Quarter' | 'Year';
