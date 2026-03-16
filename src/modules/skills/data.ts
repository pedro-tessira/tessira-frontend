import type {
  SkillDomain, Skill, SkillAssignment, SkillCoverage, SPOFRisk, SkillsStats,
  SkillSystem, OwnerConcentration, SkillMomentum, TeamExposure,
} from "./types";

// ── Skill Domains (mapped to engineering domains) ──
export const MOCK_DOMAINS: SkillDomain[] = [
  { id: "dom-01", name: "Auth & Identity", category: "system" },
  { id: "dom-02", name: "Payment Processing", category: "system" },
  { id: "dom-03", name: "Data Pipeline", category: "platform" },
  { id: "dom-04", name: "Frontend Platform", category: "platform" },
  { id: "dom-05", name: "Observability", category: "tooling" },
  { id: "dom-06", name: "CI/CD", category: "tooling" },
  { id: "dom-07", name: "Incident Response", category: "practice" },
  { id: "dom-08", name: "API Gateway", category: "system" },
];

// ── Systems ──
export const MOCK_SYSTEMS: SkillSystem[] = [
  { id: "sys-01", name: "API Gateway", description: "Edge routing, rate limiting, and service mesh", skillIds: ["sk-01", "sk-14", "sk-15"] },
  { id: "sys-02", name: "Payments Platform", description: "Payment processing, compliance, and settlement", skillIds: ["sk-03", "sk-04"] },
  { id: "sys-03", name: "Observability Stack", description: "Monitoring, tracing, and incident response", skillIds: ["sk-09", "sk-10", "sk-13"] },
  { id: "sys-04", name: "Data Platform", description: "Kafka, ETL pipelines, and data infrastructure", skillIds: ["sk-05", "sk-06"] },
  { id: "sys-05", name: "Identity Service", description: "Authentication and session management", skillIds: ["sk-01", "sk-02"] },
  { id: "sys-06", name: "Deployment Infrastructure", description: "CI/CD and infrastructure as code", skillIds: ["sk-11", "sk-12"] },
];

// ── Skills (with skillType: technical/functional/operational) ──
export const MOCK_SKILLS: Skill[] = [
  // Technical skills
  { id: "sk-01", name: "OAuth / OIDC Implementation", domainId: "dom-01", description: "Implementing and maintaining OAuth2 and OpenID Connect flows.", criticality: "critical", skillType: "technical", systemIds: ["sys-01", "sys-05"], businessImpact: "Authentication breaks across all services if knowledge is lost." },
  { id: "sk-03", name: "Stripe Integration", domainId: "dom-02", description: "Payment intent flows, webhook handling, and subscription lifecycle.", criticality: "critical", skillType: "technical", systemIds: ["sys-02"], businessImpact: "Payment processing stops if knowledge is lost." },
  { id: "sk-05", name: "Kafka Operations", domainId: "dom-03", description: "Managing Kafka clusters, topic configuration, and consumer groups.", criticality: "high", skillType: "technical", systemIds: ["sys-04"], businessImpact: "Data pipeline failures causing delayed or lost event processing." },
  { id: "sk-07", name: "React Architecture", domainId: "dom-04", description: "Large-scale React application patterns, state management, and performance.", criticality: "standard", skillType: "technical", businessImpact: "Frontend development velocity slows without architectural guidance." },
  { id: "sk-09", name: "Datadog / APM", domainId: "dom-05", description: "Application performance monitoring, dashboards, and alerting.", criticality: "high", skillType: "technical", systemIds: ["sys-03"], businessImpact: "Observability gaps make incident detection and diagnosis slower." },
  { id: "sk-10", name: "Distributed Tracing", domainId: "dom-05", description: "Implementing and interpreting distributed traces across services.", criticality: "high", skillType: "technical", systemIds: ["sys-03"], businessImpact: "Cross-service debugging becomes significantly harder." },
  { id: "sk-14", name: "Rate Limiting & Throttling", domainId: "dom-08", description: "API gateway rate limiting, abuse prevention, and traffic shaping.", criticality: "high", skillType: "technical", systemIds: ["sys-01"], businessImpact: "API abuse and traffic spikes go unmitigated." },
  { id: "sk-15", name: "Service Mesh Config", domainId: "dom-08", description: "Configuring service-to-service routing, mTLS, and retries.", criticality: "critical", skillType: "technical", systemIds: ["sys-01"], businessImpact: "Service-to-service communication becomes unreliable and insecure." },

  // Functional skills
  { id: "sk-02", name: "Session Management", domainId: "dom-01", description: "User session lifecycle, token refresh, and revocation.", criticality: "high", skillType: "functional", systemIds: ["sys-05"], businessImpact: "User sessions may fail or become insecure without expertise." },
  { id: "sk-04", name: "PCI Compliance", domainId: "dom-02", description: "Maintaining PCI DSS compliance in payment infrastructure.", criticality: "critical", skillType: "functional", systemIds: ["sys-02"], businessImpact: "Non-compliance risk leading to fines and inability to process payments." },
  { id: "sk-06", name: "ETL Pipeline Design", domainId: "dom-03", description: "Designing and maintaining data transformation pipelines.", criticality: "high", skillType: "functional", systemIds: ["sys-04"], businessImpact: "Data quality degrades and downstream analytics become unreliable." },
  { id: "sk-08", name: "Design System Maintenance", domainId: "dom-04", description: "Maintaining and evolving the shared component library.", criticality: "standard", skillType: "functional", businessImpact: "UI consistency degrades and frontend teams duplicate effort." },
  { id: "sk-16", name: "Settlement Logic", domainId: "dom-02", description: "Reconciliation and settlement rules for payment batches.", criticality: "critical", skillType: "functional", systemIds: ["sys-02"], businessImpact: "Financial reconciliation fails, causing payment discrepancies." },
  { id: "sk-17", name: "Fraud Rules", domainId: "dom-02", description: "Fraud detection heuristics and rules engine.", criticality: "high", skillType: "functional", systemIds: ["sys-02"], businessImpact: "Fraud detection weakens, increasing financial losses." },

  // Operational skills
  { id: "sk-11", name: "GitHub Actions", domainId: "dom-06", description: "CI/CD pipeline authoring, optimization, and maintenance.", criticality: "standard", skillType: "operational", systemIds: ["sys-06"], businessImpact: "Deployment velocity decreases and pipeline issues go unresolved." },
  { id: "sk-12", name: "Infrastructure as Code", domainId: "dom-06", description: "Terraform / Pulumi for cloud infrastructure provisioning.", criticality: "high", skillType: "operational", systemIds: ["sys-06"], businessImpact: "Infrastructure changes become risky manual operations." },
  { id: "sk-13", name: "On-Call Coordination", domainId: "dom-07", description: "Incident triage, escalation, and post-mortem facilitation.", criticality: "high", skillType: "operational", systemIds: ["sys-03"], businessImpact: "Incident response time increases, affecting customer trust." },
  { id: "sk-18", name: "Production Debugging", domainId: "dom-07", description: "Debugging production incidents across distributed systems.", criticality: "high", skillType: "operational", systemIds: ["sys-03"], businessImpact: "Production issues take longer to resolve, increasing downtime." },
  { id: "sk-19", name: "Release Management", domainId: "dom-06", description: "Coordinating releases, feature flags, and rollback procedures.", criticality: "standard", skillType: "operational", systemIds: ["sys-06"], businessImpact: "Releases become riskier and rollbacks are harder to coordinate." },
];

// ── Assignments (employee × skill) ──
export const MOCK_ASSIGNMENTS: SkillAssignment[] = [
  // Auth — Sarah is sole owner (SPOF!)
  { skillId: "sk-01", employeeId: "emp-001", employeeName: "Sarah Chen", level: "expert", role: "owner", teamId: "team-001", teamName: "Platform Core" },
  { skillId: "sk-02", employeeId: "emp-001", employeeName: "Sarah Chen", level: "expert", role: "owner", teamId: "team-001", teamName: "Platform Core" },
  { skillId: "sk-02", employeeId: "emp-004", employeeName: "Jonas Eriksson", level: "proficient", role: "backup", teamId: "team-001", teamName: "Platform Core" },
  // Payment — Marcus only
  { skillId: "sk-03", employeeId: "emp-002", employeeName: "Marcus Rivera", level: "expert", role: "owner", teamId: "team-002", teamName: "Backend Services" },
  { skillId: "sk-04", employeeId: "emp-002", employeeName: "Marcus Rivera", level: "proficient", role: "owner", teamId: "team-002", teamName: "Backend Services" },
  // Data Pipeline
  { skillId: "sk-05", employeeId: "emp-010", employeeName: "Carlos Mendez", level: "expert", role: "owner", teamId: "team-004", teamName: "Data & Observability" },
  { skillId: "sk-05", employeeId: "emp-006", employeeName: "Alex Novak", level: "proficient", role: "backup", teamId: "team-004", teamName: "Data & Observability" },
  { skillId: "sk-06", employeeId: "emp-010", employeeName: "Carlos Mendez", level: "expert", role: "owner", teamId: "team-004", teamName: "Data & Observability" },
  { skillId: "sk-06", employeeId: "emp-012", employeeName: "Tomasz Kowalski", level: "proficient", role: "backup", teamId: "team-004", teamName: "Data & Observability" },
  // Frontend
  { skillId: "sk-07", employeeId: "emp-003", employeeName: "Aisha Patel", level: "expert", role: "owner", teamId: "team-003", teamName: "Product Frontend" },
  { skillId: "sk-07", employeeId: "emp-007", employeeName: "Priya Sharma", level: "proficient", role: "backup", teamId: "team-003", teamName: "Product Frontend" },
  { skillId: "sk-07", employeeId: "emp-011", employeeName: "Emma Wilson", level: "learning", role: "learner", teamId: "team-003", teamName: "Product Frontend" },
  { skillId: "sk-08", employeeId: "emp-007", employeeName: "Priya Sharma", level: "proficient", role: "owner", teamId: "team-003", teamName: "Product Frontend" },
  { skillId: "sk-08", employeeId: "emp-011", employeeName: "Emma Wilson", level: "learning", role: "learner", teamId: "team-003", teamName: "Product Frontend" },
  // Observability
  { skillId: "sk-09", employeeId: "emp-006", employeeName: "Alex Novak", level: "expert", role: "owner", teamId: "team-004", teamName: "Data & Observability" },
  { skillId: "sk-10", employeeId: "emp-006", employeeName: "Alex Novak", level: "expert", role: "owner", teamId: "team-004", teamName: "Data & Observability" },
  // CI/CD
  { skillId: "sk-11", employeeId: "emp-006", employeeName: "Alex Novak", level: "proficient", role: "owner", teamId: "team-004", teamName: "Data & Observability" },
  { skillId: "sk-11", employeeId: "emp-001", employeeName: "Sarah Chen", level: "proficient", role: "backup", teamId: "team-001", teamName: "Platform Core" },
  { skillId: "sk-12", employeeId: "emp-012", employeeName: "Tomasz Kowalski", level: "expert", role: "owner", teamId: "team-004", teamName: "Data & Observability" },
  // Incident Response
  { skillId: "sk-13", employeeId: "emp-008", employeeName: "David Okafor", level: "expert", role: "owner", teamId: "team-005", teamName: "Engineering Leadership" },
  { skillId: "sk-13", employeeId: "emp-009", employeeName: "Lin Zhou", level: "proficient", role: "backup", teamId: "team-005", teamName: "Engineering Leadership" },
  { skillId: "sk-13", employeeId: "emp-001", employeeName: "Sarah Chen", level: "proficient", role: "learner", teamId: "team-001", teamName: "Platform Core" },
  // API Gateway — single owner
  { skillId: "sk-14", employeeId: "emp-002", employeeName: "Marcus Rivera", level: "proficient", role: "owner", teamId: "team-002", teamName: "Backend Services" },
  { skillId: "sk-14", employeeId: "emp-005", employeeName: "Mei Tanaka", level: "learning", role: "learner", teamId: "team-002", teamName: "Backend Services" },
  { skillId: "sk-15", employeeId: "emp-001", employeeName: "Sarah Chen", level: "expert", role: "owner", teamId: "team-001", teamName: "Platform Core" },
  // Functional skills
  { skillId: "sk-16", employeeId: "emp-002", employeeName: "Marcus Rivera", level: "expert", role: "owner", teamId: "team-002", teamName: "Backend Services" },
  { skillId: "sk-17", employeeId: "emp-002", employeeName: "Marcus Rivera", level: "proficient", role: "owner", teamId: "team-002", teamName: "Backend Services" },
  { skillId: "sk-17", employeeId: "emp-005", employeeName: "Mei Tanaka", level: "learning", role: "learner", teamId: "team-002", teamName: "Backend Services" },
  { skillId: "sk-18", employeeId: "emp-008", employeeName: "David Okafor", level: "expert", role: "owner", teamId: "team-005", teamName: "Engineering Leadership" },
  { skillId: "sk-18", employeeId: "emp-006", employeeName: "Alex Novak", level: "proficient", role: "backup", teamId: "team-004", teamName: "Data & Observability" },
  { skillId: "sk-19", employeeId: "emp-008", employeeName: "David Okafor", level: "proficient", role: "owner", teamId: "team-005", teamName: "Engineering Leadership" },
  { skillId: "sk-19", employeeId: "emp-009", employeeName: "Lin Zhou", level: "proficient", role: "backup", teamId: "team-005", teamName: "Engineering Leadership" },
];

// ── Momentum mock data ──
const MOCK_MOMENTUM: Record<string, SkillMomentum> = {
  "sk-01": "declining",
  "sk-02": "stable",
  "sk-03": "declining",
  "sk-04": "declining",
  "sk-05": "stable",
  "sk-06": "improving",
  "sk-07": "improving",
  "sk-08": "improving",
  "sk-09": "declining",
  "sk-10": "declining",
  "sk-11": "stable",
  "sk-12": "stable",
  "sk-13": "improving",
  "sk-14": "stable",
  "sk-15": "declining",
  "sk-16": "declining",
  "sk-17": "stable",
  "sk-18": "improving",
  "sk-19": "stable",
};

// ── Coverage Score Calculation ──
function computeCoverageScore(owners: number, backups: number, learners: number): number {
  return owners * 1.0 + backups * 0.6 + learners * 0.3;
}

// ── Derived data ──

export function getSkillCoverage(): SkillCoverage[] {
  return MOCK_SKILLS.map((skill) => {
    const assignments = MOCK_ASSIGNMENTS.filter((a) => a.skillId === skill.id);
    const owners = assignments.filter((a) => a.role === "owner");
    const backups = assignments.filter((a) => a.role === "backup");
    const learners = assignments.filter((a) => a.role === "learner");
    const total = assignments.filter((a) => a.level !== "none").length;

    const score = computeCoverageScore(owners.length, backups.length, learners.length);

    let coverageStatus: SkillCoverage["coverageStatus"] = "healthy";
    if (score < 1.2) {
      coverageStatus = "critical";
    } else if (score < 2) {
      coverageStatus = "at_risk";
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      domainId: skill.domainId,
      criticality: skill.criticality,
      skillType: skill.skillType,
      ownerCount: owners.length,
      backupCount: backups.length,
      learnerCount: learners.length,
      totalKnowers: total,
      coverageScore: Math.round(score * 10) / 10,
      coverageStatus,
      momentum: MOCK_MOMENTUM[skill.id] ?? "stable",
    };
  });
}

export function getSPOFRisks(): SPOFRisk[] {
  const coverage = getSkillCoverage();
  const risks: SPOFRisk[] = [];

  coverage.forEach((c) => {
    if (c.ownerCount <= 1 && c.backupCount === 0) {
      const assignments = MOCK_ASSIGNMENTS.filter((a) => a.skillId === c.skillId && a.role === "owner");
      const owner = assignments[0];
      const skill = MOCK_SKILLS.find((s) => s.id === c.skillId)!;
      const domain = MOCK_DOMAINS.find((d) => d.id === skill.domainId)!;

      let severity: SPOFRisk["severity"] = "medium";
      if (c.criticality === "critical") severity = "critical";
      else if (c.criticality === "high") severity = "high";

      if (owner) {
        risks.push({
          id: `spof-${c.skillId}`,
          skillId: c.skillId,
          skillName: c.skillName,
          domainName: domain.name,
          severity,
          ownerEmployeeId: owner.employeeId,
          ownerName: owner.employeeName,
          ownerTeam: owner.teamName,
          backupCount: c.backupCount,
          description: `${c.skillName} has a single owner (${owner.employeeName}) with no designated backup.`,
          skillType: skill.skillType,
          criticality: skill.criticality,
        });
      }
    }
  });

  return risks.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}

export function getOwnerConcentration(): OwnerConcentration[] {
  const ownerMap = new Map<string, { name: string; team: string; skills: { id: string; name: string; criticality: Skill["criticality"] }[] }>();

  MOCK_ASSIGNMENTS.filter((a) => a.role === "owner").forEach((a) => {
    const skill = MOCK_SKILLS.find((s) => s.id === a.skillId)!;
    const existing = ownerMap.get(a.employeeId);
    if (existing) {
      existing.skills.push({ id: skill.id, name: skill.name, criticality: skill.criticality });
    } else {
      ownerMap.set(a.employeeId, {
        name: a.employeeName,
        team: a.teamName,
        skills: [{ id: skill.id, name: skill.name, criticality: skill.criticality }],
      });
    }
  });

  return [...ownerMap.entries()]
    .map(([id, data]) => ({
      employeeId: id,
      employeeName: data.name,
      teamName: data.team,
      criticalSkillCount: data.skills.filter((s) => s.criticality === "critical" || s.criticality === "high").length,
      totalOwnedSkills: data.skills.length,
      skills: data.skills,
    }))
    .filter((e) => e.criticalSkillCount >= 2)
    .sort((a, b) => b.criticalSkillCount - a.criticalSkillCount);
}

export function getSkillsStats(): SkillsStats {
  const coverage = getSkillCoverage();
  const avgScore = coverage.reduce((sum, c) => sum + c.coverageScore, 0) / coverage.length;
  return {
    totalSkills: MOCK_SKILLS.length,
    healthyCoverage: coverage.filter((c) => c.coverageStatus === "healthy").length,
    atRiskCoverage: coverage.filter((c) => c.coverageStatus === "at_risk").length,
    criticalCoverage: coverage.filter((c) => c.coverageStatus === "critical").length,
    spofCount: getSPOFRisks().length,
    domainsTracked: MOCK_DOMAINS.length,
    systemsTracked: MOCK_SYSTEMS.length,
    avgCoverageScore: Math.round(avgScore * 10) / 10,
  };
}

export function getSkillAssignments(skillId: string) {
  return MOCK_ASSIGNMENTS.filter((a) => a.skillId === skillId);
}

export function getSkill(skillId: string) {
  return MOCK_SKILLS.find((s) => s.id === skillId) ?? null;
}

export function getDomain(domainId: string) {
  return MOCK_DOMAINS.find((d) => d.id === domainId) ?? null;
}

export function getSystem(systemId: string) {
  return MOCK_SYSTEMS.find((s) => s.id === systemId) ?? null;
}

export function getSkillSystems(skillId: string) {
  return MOCK_SYSTEMS.filter((s) => s.skillIds.includes(skillId));
}

export function getMatrixEmployees() {
  const empIds = [...new Set(MOCK_ASSIGNMENTS.map((a) => a.employeeId))];
  return empIds.map((id) => {
    const first = MOCK_ASSIGNMENTS.find((a) => a.employeeId === id)!;
    return { id, name: first.employeeName, team: first.teamName };
  });
}

export function getEmployeeSkillLevel(employeeId: string, skillId: string) {
  const a = MOCK_ASSIGNMENTS.find((a) => a.employeeId === employeeId && a.skillId === skillId);
  return a ? { level: a.level, role: a.role } : null;
}

export function getTeamExposure(): TeamExposure[] {
  const exposures: TeamExposure[] = [];
  
  MOCK_DOMAINS.forEach((domain) => {
    const domainSkills = MOCK_SKILLS.filter((s) => s.domainId === domain.id);
    const domainOwnerAssignments = MOCK_ASSIGNMENTS.filter(
      (a) => a.role === "owner" && domainSkills.some((s) => s.id === a.skillId)
    );
    
    if (domainOwnerAssignments.length === 0) return;
    
    const teamMap = new Map<string, { teamId: string; teamName: string; skillIds: Set<string> }>();
    domainOwnerAssignments.forEach((a) => {
      const existing = teamMap.get(a.teamId);
      if (existing) {
        existing.skillIds.add(a.skillId);
      } else {
        teamMap.set(a.teamId, { teamId: a.teamId, teamName: a.teamName, skillIds: new Set([a.skillId]) });
      }
    });

    teamMap.forEach((teamData) => {
      const pct = Math.round((teamData.skillIds.size / domainSkills.length) * 100);
      if (pct >= 75) {
        exposures.push({
          teamId: teamData.teamId,
          teamName: teamData.teamName,
          domainName: domain.name,
          domainId: domain.id,
          skillCount: teamData.skillIds.size,
          skillNames: [...teamData.skillIds].map((sid) => MOCK_SKILLS.find((s) => s.id === sid)!.name),
          totalSkillsInDomain: domainSkills.length,
          concentrationPct: pct,
        });
      }
    });
  });

  return exposures.sort((a, b) => b.concentrationPct - a.concentrationPct);
}
