import type {
  SkillDomain, Skill, SkillAssignment, SkillCoverage, SPOFRisk, SkillsStats,
} from "./types";

// ── Domains ──
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

// ── Skills ──
export const MOCK_SKILLS: Skill[] = [
  { id: "sk-01", name: "OAuth / OIDC Implementation", domainId: "dom-01", description: "Implementing and maintaining OAuth2 and OpenID Connect flows.", criticality: "critical" },
  { id: "sk-02", name: "Session Management", domainId: "dom-01", description: "User session lifecycle, token refresh, and revocation.", criticality: "high" },
  { id: "sk-03", name: "Stripe Integration", domainId: "dom-02", description: "Payment intent flows, webhook handling, and subscription lifecycle.", criticality: "critical" },
  { id: "sk-04", name: "PCI Compliance", domainId: "dom-02", description: "Maintaining PCI DSS compliance in payment infrastructure.", criticality: "critical" },
  { id: "sk-05", name: "Kafka Operations", domainId: "dom-03", description: "Managing Kafka clusters, topic configuration, and consumer groups.", criticality: "high" },
  { id: "sk-06", name: "ETL Pipeline Design", domainId: "dom-03", description: "Designing and maintaining data transformation pipelines.", criticality: "high" },
  { id: "sk-07", name: "React Architecture", domainId: "dom-04", description: "Large-scale React application patterns, state management, and performance.", criticality: "standard" },
  { id: "sk-08", name: "Design System Maintenance", domainId: "dom-04", description: "Maintaining and evolving the shared component library.", criticality: "standard" },
  { id: "sk-09", name: "Datadog / APM", domainId: "dom-05", description: "Application performance monitoring, dashboards, and alerting.", criticality: "high" },
  { id: "sk-10", name: "Distributed Tracing", domainId: "dom-05", description: "Implementing and interpreting distributed traces across services.", criticality: "high" },
  { id: "sk-11", name: "GitHub Actions", domainId: "dom-06", description: "CI/CD pipeline authoring, optimization, and maintenance.", criticality: "standard" },
  { id: "sk-12", name: "Infrastructure as Code", domainId: "dom-06", description: "Terraform / Pulumi for cloud infrastructure provisioning.", criticality: "high" },
  { id: "sk-13", name: "On-Call Coordination", domainId: "dom-07", description: "Incident triage, escalation, and post-mortem facilitation.", criticality: "high" },
  { id: "sk-14", name: "Rate Limiting & Throttling", domainId: "dom-08", description: "API gateway rate limiting, abuse prevention, and traffic shaping.", criticality: "high" },
  { id: "sk-15", name: "Service Mesh Config", domainId: "dom-08", description: "Configuring service-to-service routing, mTLS, and retries.", criticality: "critical" },
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
  { skillId: "sk-07", employeeId: "emp-011", employeeName: "Emma Wilson", level: "learning", role: "contributor", teamId: "team-003", teamName: "Product Frontend" },
  { skillId: "sk-08", employeeId: "emp-007", employeeName: "Priya Sharma", level: "proficient", role: "owner", teamId: "team-003", teamName: "Product Frontend" },
  { skillId: "sk-08", employeeId: "emp-011", employeeName: "Emma Wilson", level: "learning", role: "contributor", teamId: "team-003", teamName: "Product Frontend" },
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
  { skillId: "sk-13", employeeId: "emp-001", employeeName: "Sarah Chen", level: "proficient", role: "contributor", teamId: "team-001", teamName: "Platform Core" },
  // API Gateway — single owner
  { skillId: "sk-14", employeeId: "emp-002", employeeName: "Marcus Rivera", level: "proficient", role: "owner", teamId: "team-002", teamName: "Backend Services" },
  { skillId: "sk-14", employeeId: "emp-005", employeeName: "Mei Tanaka", level: "learning", role: "contributor", teamId: "team-002", teamName: "Backend Services" },
  { skillId: "sk-15", employeeId: "emp-001", employeeName: "Sarah Chen", level: "expert", role: "owner", teamId: "team-001", teamName: "Platform Core" },
];

// ── Derived data ──

export function getSkillCoverage(): SkillCoverage[] {
  return MOCK_SKILLS.map((skill) => {
    const assignments = MOCK_ASSIGNMENTS.filter((a) => a.skillId === skill.id);
    const owners = assignments.filter((a) => a.role === "owner");
    const backups = assignments.filter((a) => a.role === "backup");
    const total = assignments.filter((a) => a.level !== "none").length;

    let coverageStatus: SkillCoverage["coverageStatus"] = "healthy";
    if (owners.length <= 1 && backups.length === 0 && skill.criticality !== "standard") {
      coverageStatus = "critical";
    } else if (owners.length <= 1 && backups.length === 0) {
      coverageStatus = "at_risk";
    } else if (total <= 2 && skill.criticality === "critical") {
      coverageStatus = "at_risk";
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      domainId: skill.domainId,
      criticality: skill.criticality,
      ownerCount: owners.length,
      backupCount: backups.length,
      totalKnowers: total,
      coverageStatus,
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
        });
      }
    }
  });

  return risks.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}

export function getSkillsStats(): SkillsStats {
  const coverage = getSkillCoverage();
  return {
    totalSkills: MOCK_SKILLS.length,
    healthyCoverage: coverage.filter((c) => c.coverageStatus === "healthy").length,
    atRiskCoverage: coverage.filter((c) => c.coverageStatus === "at_risk").length,
    criticalCoverage: coverage.filter((c) => c.coverageStatus === "critical").length,
    spofCount: getSPOFRisks().length,
    domainsTracked: MOCK_DOMAINS.length,
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

// For the matrix: employees who have any skill assignments
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
