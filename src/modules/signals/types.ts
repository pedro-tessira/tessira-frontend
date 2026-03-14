export type SignalStatus = "healthy" | "warning" | "critical";
export type TrendDirection = "up" | "down" | "stable";

export interface OrgSignal {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: SignalStatus;
  trend: TrendDirection;
  trendValue: string;
  description: string;
  history?: number[]; // last 6-8 sprint values
  delta?: string; // e.g. "+0.5"
}

export interface TeamSignal {
  teamId: string;
  teamName: string;
  memberCount: number;
  allocation: number;
  deliveryLoad: SignalStatus;
  sprintVelocityTrend: TrendDirection;
  healthScore: number;
  openEscalations: number;
  spofCount: number;
  coverageScore: number;
  alerts: string[];
  busFactor?: number;
}

export interface CapacityEntry {
  teamId: string;
  teamName: string;
  totalCapacity: number;
  allocated: number;
  available: number;
  onLeave: number;
  overloaded: number;
  trend: TrendDirection;
  riskLevel: SignalStatus;
}

export interface ResilienceEntry {
  area: string;
  domain: string;
  ownerCount: number;
  backupCount: number;
  coverageScore: number;
  status: SignalStatus;
  riskDetail: string;
  linkedTeam: string;
}

export interface AlertItem {
  id: string;
  severity: "critical" | "warning" | "info";
  message: string;
  source: string;
  timestamp: string;
  rootCauses?: string[];
  recommendedActions?: string[];
}

export interface DomainRisk {
  domain: string;
  spofCount: number;
  coveragePct: number;
  riskLevel: SignalStatus;
  skills: string[];
}

export interface OwnershipLoad {
  employeeId: string;
  employeeName: string;
  teamName: string;
  criticalOwnerships: number;
  skills: string[];
}

export interface RiskForecast {
  employeeName: string;
  teamName: string;
  reason: string;
  dateRange: string;
  impactedAreas: string[];
  projectedCoverage: number;
}
