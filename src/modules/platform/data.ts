import type { Tenant } from "@/shared/contexts/TenantContext";

export interface PlatformUser {
  id: string;
  email: string;
  displayName: string;
  tenants: string[];
  isPlatformAdmin: boolean;
  lastLogin: string;
  createdAt: string;
  status: "active" | "suspended" | "invited";
}

export interface Subscription {
  tenantId: string;
  tenantName: string;
  plan: "starter" | "team" | "enterprise";
  mrr: number;
  seats: number;
  usedSeats: number;
  renewalDate: string;
  status: "active" | "past_due" | "canceled";
}

export interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
  scope: "global" | "tenant" | "user";
  tenants?: string[];
}

export interface PlatformAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  tenantId: string | null;
  tenantName: string | null;
  severity: "info" | "warning" | "critical";
}

export const platformTenants: Tenant[] = [
  { id: "t1", name: "Planet Engineering", slug: "planet-eng", plan: "enterprise", region: "eu-west-1", status: "active", userCount: 142, createdAt: "2024-01-15" },
  { id: "t2", name: "BNP Paribas", slug: "bnp", plan: "enterprise", region: "eu-central-1", status: "active", userCount: 89, createdAt: "2024-03-22" },
  { id: "t3", name: "Startup X", slug: "startup-x", plan: "team", region: "us-east-1", status: "trial", userCount: 12, createdAt: "2025-11-01" },
  { id: "t4", name: "FinServ Labs", slug: "finserv", plan: "starter", region: "us-west-2", status: "active", userCount: 8, createdAt: "2025-06-10" },
  { id: "t5", name: "Acme Corp", slug: "acme", plan: "team", region: "eu-west-1", status: "suspended", userCount: 34, createdAt: "2024-08-02" },
];

export const platformUsers: PlatformUser[] = [
  { id: "pu1", email: "admin@tessira.dev", displayName: "Tessira Admin", tenants: ["t1", "t2", "t3"], isPlatformAdmin: true, lastLogin: "2026-03-14", createdAt: "2023-12-01", status: "active" },
  { id: "pu2", email: "lead@planet-eng.com", displayName: "Engineering Lead", tenants: ["t1"], isPlatformAdmin: false, lastLogin: "2026-03-13", createdAt: "2024-01-16", status: "active" },
  { id: "pu3", email: "manager@bnp.com", displayName: "BNP Manager", tenants: ["t2"], isPlatformAdmin: false, lastLogin: "2026-03-12", createdAt: "2024-03-25", status: "active" },
  { id: "pu4", email: "cto@startupx.io", displayName: "Startup CTO", tenants: ["t3"], isPlatformAdmin: false, lastLogin: "2026-03-10", createdAt: "2025-11-02", status: "active" },
  { id: "pu5", email: "invited@finserv.com", displayName: "Pending User", tenants: ["t4"], isPlatformAdmin: false, lastLogin: "", createdAt: "2026-03-01", status: "invited" },
];

export const subscriptions: Subscription[] = [
  { tenantId: "t1", tenantName: "Planet Engineering", plan: "enterprise", mrr: 4200, seats: 200, usedSeats: 142, renewalDate: "2027-01-15", status: "active" },
  { tenantId: "t2", tenantName: "BNP Paribas", plan: "enterprise", mrr: 3800, seats: 150, usedSeats: 89, renewalDate: "2027-03-22", status: "active" },
  { tenantId: "t3", tenantName: "Startup X", plan: "team", mrr: 290, seats: 20, usedSeats: 12, renewalDate: "2026-05-01", status: "active" },
  { tenantId: "t4", tenantName: "FinServ Labs", plan: "starter", mrr: 49, seats: 10, usedSeats: 8, renewalDate: "2026-07-10", status: "active" },
  { tenantId: "t5", tenantName: "Acme Corp", plan: "team", mrr: 0, seats: 50, usedSeats: 34, renewalDate: "2026-02-02", status: "canceled" },
];

export const featureFlags: FeatureFlag[] = [
  { id: "ff1", key: "horizon_forecasting", label: "Horizon Forecasting", enabled: true, scope: "global" },
  { id: "ff2", key: "ai_skill_suggestions", label: "AI Skill Suggestions", enabled: false, scope: "global" },
  { id: "ff3", key: "advanced_signals", label: "Advanced Signals", enabled: true, scope: "tenant", tenants: ["t1", "t2"] },
  { id: "ff4", key: "beta_coverage_map", label: "Beta Coverage Map", enabled: true, scope: "tenant", tenants: ["t1"] },
  { id: "ff5", key: "export_pdf", label: "PDF Export", enabled: false, scope: "global" },
];

export const platformAuditLog: PlatformAuditEntry[] = [
  { id: "pa1", timestamp: "2026-03-14T09:12:00Z", actor: "admin@tessira.dev", action: "tenant.suspend", resource: "Acme Corp", tenantId: "t5", tenantName: "Acme Corp", severity: "critical" },
  { id: "pa2", timestamp: "2026-03-13T15:30:00Z", actor: "admin@tessira.dev", action: "feature_flag.toggle", resource: "advanced_signals", tenantId: null, tenantName: null, severity: "info" },
  { id: "pa3", timestamp: "2026-03-12T11:00:00Z", actor: "admin@tessira.dev", action: "user.invite", resource: "invited@finserv.com", tenantId: "t4", tenantName: "FinServ Labs", severity: "info" },
  { id: "pa4", timestamp: "2026-03-11T08:45:00Z", actor: "admin@tessira.dev", action: "plan.change", resource: "Startup X → team", tenantId: "t3", tenantName: "Startup X", severity: "warning" },
  { id: "pa5", timestamp: "2026-03-10T16:20:00Z", actor: "admin@tessira.dev", action: "tenant.create", resource: "FinServ Labs", tenantId: "t4", tenantName: "FinServ Labs", severity: "info" },
];
