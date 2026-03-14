export type SkillLevel = "expert" | "proficient" | "learning" | "none";
export type CoverageStatus = "healthy" | "at_risk" | "critical";
export type RiskSeverity = "critical" | "high" | "medium" | "low";
export type SkillType = "technology" | "system" | "domain" | "operational";
export type SkillCriticality = "critical" | "high" | "standard" | "low";
export type OwnershipRole = "owner" | "backup" | "learner";
export type SkillMomentum = "improving" | "stable" | "declining";

export interface SkillDomain {
  id: string;
  name: string;
  category: "system" | "platform" | "practice" | "tooling";
}

export interface SkillSystem {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
}

export interface Skill {
  id: string;
  name: string;
  domainId: string;
  description: string;
  criticality: SkillCriticality;
  skillType: SkillType;
  systemIds?: string[];
}

export interface SkillAssignment {
  skillId: string;
  employeeId: string;
  employeeName: string;
  level: SkillLevel;
  role: OwnershipRole;
  teamId: string;
  teamName: string;
}

export interface SkillCoverage {
  skillId: string;
  skillName: string;
  domainId: string;
  criticality: SkillCriticality;
  skillType: SkillType;
  ownerCount: number;
  backupCount: number;
  learnerCount: number;
  totalKnowers: number;
  coverageScore: number;
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
  skillType: SkillType;
  criticality: SkillCriticality;
}

export interface OwnerConcentration {
  employeeId: string;
  employeeName: string;
  teamName: string;
  criticalSkillCount: number;
  totalOwnedSkills: number;
  skills: { id: string; name: string; criticality: SkillCriticality }[];
}

export interface SkillsStats {
  totalSkills: number;
  healthyCoverage: number;
  atRiskCoverage: number;
  criticalCoverage: number;
  spofCount: number;
  domainsTracked: number;
  systemsTracked: number;
  avgCoverageScore: number;
}
