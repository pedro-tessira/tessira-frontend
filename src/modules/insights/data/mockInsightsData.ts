// Mock data for Engineering Insights module

export const orgKPIs = [
  { label: "Org Health Score", value: "7.3", delta: "+0.5", trend: "up" as const },
  { label: "Delivery Stability", value: "88%", delta: "+3%", trend: "up" as const },
  { label: "Capacity Pressure", value: "74%", delta: "-2%", trend: "down" as const },
  { label: "Knowledge Resilience", value: "6.1", delta: "-0.4", trend: "down" as const },
];

export const deliveryTrend = [
  { sprint: "S1", commits: 142, prs: 38 },
  { sprint: "S2", commits: 158, prs: 42 },
  { sprint: "S3", commits: 135, prs: 35 },
  { sprint: "S4", commits: 170, prs: 48 },
  { sprint: "S5", commits: 163, prs: 45 },
  { sprint: "S6", commits: 190, prs: 52 },
  { sprint: "S7", commits: 178, prs: 49 },
  { sprint: "S8", commits: 205, prs: 58 },
];

export const capacityUtilization = [
  { team: "Backend", utilization: 82, capacity: 100 },
  { team: "Frontend", utilization: 68, capacity: 100 },
  { team: "Platform", utilization: 91, capacity: 100 },
  { team: "Data", utilization: 76, capacity: 100 },
  { team: "Mobile", utilization: 55, capacity: 100 },
  { team: "DevOps", utilization: 88, capacity: 100 },
];

export const skillDistribution = [
  { name: "Technology", value: 38, fill: "hsl(260 40% 55%)" },
  { name: "Domain", value: 26, fill: "hsl(200 60% 50%)" },
  { name: "System", value: 20, fill: "hsl(142 50% 45%)" },
  { name: "Operational", value: 16, fill: "hsl(38 80% 55%)" },
];

export const escalationsTrend = [
  { sprint: "S1", escalations: 5, resolved: 4 },
  { sprint: "S2", escalations: 3, resolved: 3 },
  { sprint: "S3", escalations: 7, resolved: 5 },
  { sprint: "S4", escalations: 4, resolved: 4 },
  { sprint: "S5", escalations: 6, resolved: 4 },
  { sprint: "S6", escalations: 8, resolved: 6 },
  { sprint: "S7", escalations: 5, resolved: 5 },
  { sprint: "S8", escalations: 3, resolved: 3 },
];

export const teamsAtRisk = [
  { team: "Platform Core", risk: "critical" as const, reason: "3 SPOFs, 91% utilization", spofs: 3 },
  { team: "Data & Observability", risk: "warning" as const, reason: "85% allocation, declining velocity", spofs: 1 },
  { team: "Backend Services", risk: "warning" as const, reason: "2 SPOFs, key engineer on leave", spofs: 2 },
];

export const recentEscalations = [
  { id: 1, title: "OAuth service degradation", team: "Platform Core", severity: "high" as const, date: "2 hours ago" },
  { id: 2, title: "Data pipeline latency spike", team: "Data & Observability", severity: "medium" as const, date: "6 hours ago" },
  { id: 3, title: "Mobile build failures", team: "Mobile", severity: "low" as const, date: "1 day ago" },
];

// Team-level insights data
export interface TeamInsightData {
  id: string;
  name: string;
  size: number;
  activeProjects: number;
  velocityTrend: { sprint: string; points: number }[];
  prThroughput: { sprint: string; opened: number; merged: number }[];
  allocation: { category: string; percentage: number }[];
  skills: { skill: string; owners: number; backups: number }[];
  spofs: string[];
  escalations: { title: string; severity: "high" | "medium" | "low"; date: string }[];
}

export const teamInsightsData: Record<string, TeamInsightData> = {
  "backend-services": {
    id: "backend-services",
    name: "Backend Services",
    size: 8,
    activeProjects: 4,
    velocityTrend: [
      { sprint: "S1", points: 34 },
      { sprint: "S2", points: 38 },
      { sprint: "S3", points: 31 },
      { sprint: "S4", points: 42 },
      { sprint: "S5", points: 39 },
      { sprint: "S6", points: 45 },
      { sprint: "S7", points: 40 },
      { sprint: "S8", points: 44 },
    ],
    prThroughput: [
      { sprint: "S1", opened: 12, merged: 10 },
      { sprint: "S2", opened: 15, merged: 13 },
      { sprint: "S3", opened: 11, merged: 9 },
      { sprint: "S4", opened: 18, merged: 16 },
      { sprint: "S5", opened: 14, merged: 12 },
      { sprint: "S6", opened: 20, merged: 18 },
      { sprint: "S7", opened: 16, merged: 15 },
      { sprint: "S8", opened: 22, merged: 20 },
    ],
    allocation: [
      { category: "Feature Work", percentage: 45 },
      { category: "Tech Debt", percentage: 20 },
      { category: "Maintenance", percentage: 15 },
      { category: "Support", percentage: 10 },
      { category: "Learning", percentage: 10 },
    ],
    skills: [
      { skill: "Stripe Integration", owners: 1, backups: 1 },
      { skill: "Settlement Logic", owners: 1, backups: 0 },
      { skill: "API Design", owners: 3, backups: 2 },
      { skill: "Database Optimization", owners: 2, backups: 1 },
      { skill: "Rate Limiting", owners: 1, backups: 0 },
    ],
    spofs: ["Settlement Logic", "Rate Limiting"],
    escalations: [
      { title: "Settlement batch failure", severity: "high", date: "3 hours ago" },
      { title: "Rate limiter misconfiguration", severity: "medium", date: "2 days ago" },
    ],
  },
  "platform-core": {
    id: "platform-core",
    name: "Platform Core",
    size: 6,
    activeProjects: 3,
    velocityTrend: [
      { sprint: "S1", points: 28 },
      { sprint: "S2", points: 32 },
      { sprint: "S3", points: 26 },
      { sprint: "S4", points: 35 },
      { sprint: "S5", points: 30 },
      { sprint: "S6", points: 33 },
      { sprint: "S7", points: 29 },
      { sprint: "S8", points: 36 },
    ],
    prThroughput: [
      { sprint: "S1", opened: 8, merged: 7 },
      { sprint: "S2", opened: 10, merged: 9 },
      { sprint: "S3", opened: 7, merged: 6 },
      { sprint: "S4", opened: 12, merged: 10 },
      { sprint: "S5", opened: 9, merged: 8 },
      { sprint: "S6", opened: 14, merged: 12 },
      { sprint: "S7", opened: 11, merged: 10 },
      { sprint: "S8", opened: 15, merged: 14 },
    ],
    allocation: [
      { category: "Feature Work", percentage: 35 },
      { category: "Infrastructure", percentage: 30 },
      { category: "Tech Debt", percentage: 15 },
      { category: "Support", percentage: 15 },
      { category: "Learning", percentage: 5 },
    ],
    skills: [
      { skill: "OAuth / OIDC", owners: 1, backups: 0 },
      { skill: "Service Mesh", owners: 1, backups: 0 },
      { skill: "Kubernetes", owners: 2, backups: 1 },
      { skill: "CI/CD Pipelines", owners: 2, backups: 2 },
      { skill: "Monitoring", owners: 1, backups: 1 },
    ],
    spofs: ["OAuth / OIDC", "Service Mesh", "Monitoring"],
    escalations: [
      { title: "OAuth service degradation", severity: "high", date: "2 hours ago" },
      { title: "Service mesh timeout issues", severity: "high", date: "1 day ago" },
      { title: "Monitoring gap in staging", severity: "low", date: "4 days ago" },
    ],
  },
  "frontend": {
    id: "frontend",
    name: "Frontend",
    size: 7,
    activeProjects: 5,
    velocityTrend: [
      { sprint: "S1", points: 30 },
      { sprint: "S2", points: 35 },
      { sprint: "S3", points: 33 },
      { sprint: "S4", points: 40 },
      { sprint: "S5", points: 38 },
      { sprint: "S6", points: 42 },
      { sprint: "S7", points: 41 },
      { sprint: "S8", points: 46 },
    ],
    prThroughput: [
      { sprint: "S1", opened: 14, merged: 12 },
      { sprint: "S2", opened: 16, merged: 14 },
      { sprint: "S3", opened: 13, merged: 12 },
      { sprint: "S4", opened: 19, merged: 17 },
      { sprint: "S5", opened: 17, merged: 15 },
      { sprint: "S6", opened: 22, merged: 20 },
      { sprint: "S7", opened: 18, merged: 17 },
      { sprint: "S8", opened: 24, merged: 22 },
    ],
    allocation: [
      { category: "Feature Work", percentage: 55 },
      { category: "Tech Debt", percentage: 15 },
      { category: "Design System", percentage: 15 },
      { category: "Testing", percentage: 10 },
      { category: "Learning", percentage: 5 },
    ],
    skills: [
      { skill: "React", owners: 4, backups: 3 },
      { skill: "Design System", owners: 2, backups: 2 },
      { skill: "Performance", owners: 1, backups: 1 },
      { skill: "Accessibility", owners: 1, backups: 0 },
      { skill: "State Management", owners: 3, backups: 2 },
    ],
    spofs: ["Accessibility"],
    escalations: [
      { title: "Core Web Vitals regression", severity: "medium", date: "5 hours ago" },
    ],
  },
};

export const allTeamIds = Object.keys(teamInsightsData);
