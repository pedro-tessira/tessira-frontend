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
}

export interface TeamSignal {
  teamId: string;
  teamName: string;
  memberCount: number;
  allocation: number; // 0-100
  deliveryLoad: SignalStatus;
  sprintVelocityTrend: TrendDirection;
  healthScore: number; // 0-10
  openEscalations: number;
  spofCount: number;
  coverageScore: number; // 0-100
  alerts: string[];
}

export interface CapacityEntry {
  teamId: string;
  teamName: string;
  totalCapacity: number;
  allocated: number;
  available: number;
  onLeave: number;
  overloaded: number; // people above 100% allocation
  trend: TrendDirection;
  riskLevel: SignalStatus;
}

export interface ResilienceEntry {
  area: string;
  domain: string;
  ownerCount: number;
  backupCount: number;
  coverageScore: number; // 0-100
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
}
