export type SkillLevel = "expert" | "proficient" | "learning" | "none";
export type CoverageStatus = "healthy" | "at_risk" | "critical";
export type RiskSeverity = "critical" | "high" | "medium" | "low";

export interface SkillDomain {
  id: string;
  name: string;
  category: "system" | "platform" | "practice" | "tooling";
}

export interface Skill {
  id: string;
  name: string;
  domainId: string;
  description: string;
  criticality: "critical" | "high" | "standard";
}

export interface SkillAssignment {
  skillId: string;
  employeeId: string;
  employeeName: string;
  level: SkillLevel;
  role: "owner" | "backup" | "contributor";
  teamId: string;
  teamName: string;
}

export interface SkillCoverage {
  skillId: string;
  skillName: string;
  domainId: string;
  criticality: Skill["criticality"];
  ownerCount: number;
  backupCount: number;
  totalKnowers: number;
  coverageStatus: CoverageStatus;
}

export interface SPOFRisk {
  id: string;
  skillId: string;
  skillName: string;
  domainName: string;
  severity: RiskSeverity;
  ownerEmployeeId: string;
  ownerName: string;
  ownerTeam: string;
  backupCount: number;
  description: string;
}

export interface SkillsStats {
  totalSkills: number;
  healthyCoverage: number;
  atRiskCoverage: number;
  criticalCoverage: number;
  spofCount: number;
  domainsTracked: number;
}
