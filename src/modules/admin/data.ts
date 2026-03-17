import type {
  AuthProvider,
  AdminUser,
  EmployeeLink,
  AuditEntry,
  GovernanceSettings,
  AdminStats,
  CustomRole,
  Permission,
  TenantSubscription,
  ActiveSession,
  ServiceAccount,
  LoginAlert,
  PolicyRule,
  ComplianceMode,
  AdminInsight,
} from "./types";

// ─── Auth Providers ─────────────────────────────
export const authProviders: AuthProvider[] = [
  { id: "ap-1", type: "email", label: "Email & Password", status: "active", usersCount: 24, lastSync: null },
  { id: "ap-2", type: "google", label: "Google Workspace", status: "active", usersCount: 18, lastSync: "2026-03-12T14:30:00Z" },
  { id: "ap-3", type: "microsoft", label: "Microsoft Entra ID", status: "inactive", usersCount: 0, lastSync: null },
  { id: "ap-4", type: "saml", label: "SAML SSO (Okta)", status: "configuring", usersCount: 0, lastSync: null },
  { id: "ap-5", type: "github", label: "GitHub", status: "active", usersCount: 12, lastSync: "2026-03-13T08:15:00Z" },
];

// ─── Users ──────────────────────────────────────
export const adminUsers: AdminUser[] = [
  { id: "u-1", email: "admin@tessira.io", displayName: "Alex Morgan", role: "owner", status: "active", authProvider: "email", linkedEmployeeId: "emp-1", linkedEmployeeName: "Alex Morgan", lastLogin: "2026-03-13T09:00:00Z", lastActivity: "2026-03-14T11:30:00Z", createdAt: "2025-06-01", customRoles: ["tenant-admin"] },
  { id: "u-2", email: "sarah.chen@tessira.io", displayName: "Sarah Chen", role: "admin", status: "active", authProvider: "google", linkedEmployeeId: "emp-2", linkedEmployeeName: "Sarah Chen", lastLogin: "2026-03-13T08:45:00Z", lastActivity: "2026-03-14T10:15:00Z", createdAt: "2025-06-15", customRoles: ["tenant-admin"] },
  { id: "u-3", email: "marcus.johnson@tessira.io", displayName: "Marcus Johnson", role: "member", status: "active", authProvider: "google", linkedEmployeeId: "emp-3", linkedEmployeeName: "Marcus Johnson", lastLogin: "2026-03-12T17:30:00Z", lastActivity: "2026-03-13T16:00:00Z", createdAt: "2025-07-01", customRoles: ["engineer"] },
  { id: "u-4", email: "priya.patel@tessira.io", displayName: "Priya Patel", role: "member", status: "active", authProvider: "email", linkedEmployeeId: "emp-4", linkedEmployeeName: "Priya Patel", lastLogin: "2026-03-13T07:15:00Z", lastActivity: "2026-03-14T09:00:00Z", createdAt: "2025-07-20", customRoles: ["engineer"] },
  { id: "u-5", email: "tom.weber@tessira.io", displayName: "Tom Weber", role: "member", status: "active", authProvider: "github", linkedEmployeeId: "emp-5", linkedEmployeeName: "Tom Weber", lastLogin: "2026-03-11T12:00:00Z", lastActivity: "2026-03-12T15:30:00Z", createdAt: "2025-08-10", customRoles: ["engineer"] },
  { id: "u-6", email: "aisha.kumar@tessira.io", displayName: "Aisha Kumar", role: "member", status: "invited", authProvider: "email", linkedEmployeeId: null, linkedEmployeeName: null, lastLogin: null, lastActivity: null, createdAt: "2026-03-10" },
  { id: "u-7", email: "james.liu@tessira.io", displayName: "James Liu", role: "viewer", status: "active", authProvider: "google", linkedEmployeeId: "emp-7", linkedEmployeeName: "James Liu", lastLogin: "2026-03-09T16:00:00Z", lastActivity: "2026-03-10T11:00:00Z", createdAt: "2025-09-01", customRoles: ["viewer"] },
  { id: "u-8", email: "elena.vasquez@tessira.io", displayName: "Elena Vasquez", role: "member", status: "suspended", authProvider: "email", linkedEmployeeId: "emp-8", linkedEmployeeName: "Elena Vasquez", lastLogin: "2026-02-28T10:00:00Z", lastActivity: "2026-02-28T10:00:00Z", createdAt: "2025-09-15", customRoles: ["engineer"] },
  { id: "u-9", email: "dev-contractor@external.io", displayName: "Dev Contractor", role: "viewer", status: "active", authProvider: "github", linkedEmployeeId: null, linkedEmployeeName: null, lastLogin: "2026-03-12T14:00:00Z", lastActivity: "2026-03-13T09:30:00Z", createdAt: "2026-01-15", customRoles: ["external-viewer"] },
  { id: "u-10", email: "legacy-user@tessira.io", displayName: "Legacy User", role: "member", status: "deactivated", authProvider: "email", linkedEmployeeId: null, linkedEmployeeName: null, lastLogin: "2025-12-01T09:00:00Z", lastActivity: "2025-12-01T09:00:00Z", createdAt: "2025-06-01" },
];

// ─── Employee Linking ───────────────────────────
export const employeeLinks: EmployeeLink[] = [
  { userId: "u-1", userEmail: "admin@tessira.io", userDisplayName: "Alex Morgan", employeeId: "emp-1", employeeName: "Alex Morgan", linkStatus: "linked", matchType: "email", linkedAt: "2025-06-01", linkedBy: "System" },
  { userId: "u-2", userEmail: "sarah.chen@tessira.io", userDisplayName: "Sarah Chen", employeeId: "emp-2", employeeName: "Sarah Chen", linkStatus: "linked", matchType: "email", linkedAt: "2025-06-15", linkedBy: "System" },
  { userId: "u-3", userEmail: "marcus.johnson@tessira.io", userDisplayName: "Marcus Johnson", employeeId: "emp-3", employeeName: "Marcus Johnson", linkStatus: "linked", matchType: "email", linkedAt: "2025-07-01", linkedBy: "Admin" },
  { userId: "u-4", userEmail: "priya.patel@tessira.io", userDisplayName: "Priya Patel", employeeId: "emp-4", employeeName: "Priya Patel", linkStatus: "linked", matchType: "email", linkedAt: "2025-07-20", linkedBy: "System" },
  { userId: "u-5", userEmail: "tom.weber@tessira.io", userDisplayName: "Tom Weber", employeeId: "emp-5", employeeName: "Tom Weber", linkStatus: "linked", matchType: "manual", linkedAt: "2025-08-10", linkedBy: "Alex Morgan" },
  { userId: "u-6", userEmail: "aisha.kumar@tessira.io", userDisplayName: "Aisha Kumar", employeeId: null, employeeName: "Aisha Kumar (suggested)", linkStatus: "suggested", confidence: 0.92, matchType: "email" },
  { userId: "u-7", userEmail: "james.liu@tessira.io", userDisplayName: "James Liu", employeeId: "emp-7", employeeName: "James Liu", linkStatus: "linked", matchType: "domain", linkedAt: "2025-09-01", linkedBy: "System" },
  { userId: "u-8", userEmail: "elena.vasquez@tessira.io", userDisplayName: "Elena Vasquez", employeeId: "emp-8", employeeName: "Elena Vasquez", linkStatus: "linked", matchType: "email", linkedAt: "2025-09-15", linkedBy: "System" },
  { userId: "u-9", userEmail: "dev-contractor@external.io", userDisplayName: "Dev Contractor", employeeId: null, employeeName: null, linkStatus: "unlinked" },
  { userId: "u-10", userEmail: "legacy-user@tessira.io", userDisplayName: "Legacy User", employeeId: null, employeeName: null, linkStatus: "suggested", confidence: 0.67, matchType: "domain" },
];

// ─── Audit Log ──────────────────────────────────
export const auditLog: AuditEntry[] = [
  { id: "al-1", timestamp: "2026-03-13T09:12:00Z", actor: "Alex Morgan", action: "user.invite", resource: "Aisha Kumar", detail: "Invited as member", severity: "info", category: "users" },
  { id: "al-2", timestamp: "2026-03-13T08:50:00Z", actor: "Sarah Chen", action: "auth.login", resource: "Session", detail: "Login via Google", severity: "info", category: "auth" },
  { id: "al-3", timestamp: "2026-03-12T17:00:00Z", actor: "Alex Morgan", action: "user.suspend", resource: "Elena Vasquez", detail: "Account suspended — policy violation review", severity: "warning", category: "users" },
  { id: "al-4", timestamp: "2026-03-12T15:30:00Z", actor: "System", action: "auth.provider.sync", resource: "GitHub", detail: "Sync completed — 12 users matched", severity: "info", category: "auth" },
  { id: "al-5", timestamp: "2026-03-12T14:00:00Z", actor: "Alex Morgan", action: "governance.mfa", resource: "Tenant", detail: "MFA enforcement enabled", severity: "critical", category: "governance" },
  { id: "al-6", timestamp: "2026-03-12T11:20:00Z", actor: "System", action: "auth.provider.sync", resource: "Google Workspace", detail: "Sync completed — 18 users matched", severity: "info", category: "auth" },
  { id: "al-7", timestamp: "2026-03-11T16:45:00Z", actor: "Alex Morgan", action: "user.role.change", resource: "Sarah Chen", detail: "Role changed to admin", severity: "warning", category: "users" },
  { id: "al-8", timestamp: "2026-03-11T09:00:00Z", actor: "Sarah Chen", action: "governance.retention", resource: "Tenant", detail: "Retention policy updated to 365 days", severity: "info", category: "governance" },
  { id: "al-9", timestamp: "2026-03-10T13:00:00Z", actor: "Alex Morgan", action: "auth.provider.add", resource: "SAML SSO (Okta)", detail: "Provider added — configuring", severity: "warning", category: "auth" },
  { id: "al-10", timestamp: "2026-03-09T10:30:00Z", actor: "System", action: "user.deactivate", resource: "Legacy User", detail: "Auto-deactivated — 90 day inactivity", severity: "info", category: "users" },
  { id: "al-11", timestamp: "2026-03-08T14:20:00Z", actor: "Alex Morgan", action: "role.create", resource: "external-viewer", detail: "Custom role created", severity: "info", category: "roles" },
  { id: "al-12", timestamp: "2026-03-07T11:00:00Z", actor: "System", action: "session.revoke", resource: "Elena Vasquez", detail: "All sessions revoked on suspension", severity: "warning", category: "security" },
];

// ─── Governance ─────────────────────────────────
export const governanceSettings: GovernanceSettings = {
  tenantName: "Tessira Engineering",
  tenantId: "tnt-eng-001",
  plan: "enterprise",
  dataRegion: "EU West (Frankfurt)",
  mfaEnforced: true,
  sessionTimeout: 480,
  ipAllowList: ["10.0.0.0/8", "192.168.1.0/24"],
  retentionDays: 365,
};

// ─── Tenant Subscription ────────────────────────
export const tenantSubscription: TenantSubscription = {
  status: "active",
  plan: "enterprise",
  seats: 25,
  usedSeats: 10,
  billingOwner: "Alex Morgan",
  billingEmail: "billing@tessira.io",
  renewalDate: "2027-01-15",
  region: "EU West (Frankfurt)",
  mrr: 4200,
};

// ─── RBAC Permissions ───────────────────────────
export const PERMISSIONS: Permission[] = [
  { key: "user.invite", label: "Invite users", domain: "Users" },
  { key: "user.suspend", label: "Suspend users", domain: "Users" },
  { key: "user.deactivate", label: "Deactivate users", domain: "Users" },
  { key: "user.role.assign", label: "Assign roles", domain: "Users" },
  { key: "user.view", label: "View users", domain: "Users" },
  { key: "auth.manage", label: "Manage auth providers", domain: "Auth" },
  { key: "auth.mfa.configure", label: "Configure MFA", domain: "Auth" },
  { key: "auth.sessions.revoke", label: "Revoke sessions", domain: "Auth" },
  { key: "governance.edit", label: "Edit governance settings", domain: "Governance" },
  { key: "governance.policy.manage", label: "Manage policies", domain: "Governance" },
  { key: "audit.view", label: "View audit log", domain: "Audit" },
  { key: "audit.export", label: "Export audit log", domain: "Audit" },
  { key: "linking.manage", label: "Manage user–employee links", domain: "Linking" },
  { key: "linking.approve", label: "Approve link suggestions", domain: "Linking" },
  { key: "roles.manage", label: "Manage custom roles", domain: "Roles" },
  { key: "api.tokens.manage", label: "Manage API tokens", domain: "API" },
  { key: "billing.view", label: "View billing info", domain: "Billing" },
  { key: "billing.manage", label: "Manage billing", domain: "Billing" },
];

export const customRoles: CustomRole[] = [
  { id: "r-1", name: "tenant-admin", description: "Full administrative access to tenant settings", permissions: PERMISSIONS.map((p) => p.key), userCount: 2, isSystem: true },
  { id: "r-2", name: "engineer", description: "Standard engineer with read access to org settings", permissions: ["user.view", "audit.view"], userCount: 4, isSystem: true },
  { id: "r-3", name: "viewer", description: "Read-only access across the platform", permissions: ["user.view", "audit.view"], userCount: 1, isSystem: true },
  { id: "r-4", name: "external-viewer", description: "Limited external contractor access", permissions: ["user.view"], userCount: 1, isSystem: false },
  { id: "r-5", name: "security-lead", description: "Security operations and session management", permissions: ["user.view", "user.suspend", "auth.manage", "auth.mfa.configure", "auth.sessions.revoke", "audit.view", "audit.export", "governance.edit"], userCount: 0, isSystem: false },
];

// ─── Security ───────────────────────────────────
export const activeSessions: ActiveSession[] = [
  { id: "s-1", userId: "u-1", userDisplayName: "Alex Morgan", userEmail: "admin@tessira.io", device: "Chrome / macOS", ip: "10.0.1.42", location: "Frankfurt, DE", lastActive: "2026-03-14T11:30:00Z", createdAt: "2026-03-14T08:00:00Z" },
  { id: "s-2", userId: "u-2", userDisplayName: "Sarah Chen", userEmail: "sarah.chen@tessira.io", device: "Firefox / Linux", ip: "10.0.1.55", location: "Berlin, DE", lastActive: "2026-03-14T10:15:00Z", createdAt: "2026-03-13T07:30:00Z" },
  { id: "s-3", userId: "u-3", userDisplayName: "Marcus Johnson", userEmail: "marcus.johnson@tessira.io", device: "Chrome / Windows", ip: "192.168.1.12", location: "London, UK", lastActive: "2026-03-13T16:00:00Z", createdAt: "2026-03-12T09:00:00Z" },
  { id: "s-4", userId: "u-4", userDisplayName: "Priya Patel", userEmail: "priya.patel@tessira.io", device: "Safari / macOS", ip: "10.0.2.18", location: "Mumbai, IN", lastActive: "2026-03-14T09:00:00Z", createdAt: "2026-03-13T06:00:00Z" },
  { id: "s-5", userId: "u-9", userDisplayName: "Dev Contractor", userEmail: "dev-contractor@external.io", device: "Chrome / macOS", ip: "85.214.132.7", location: "São Paulo, BR", lastActive: "2026-03-13T09:30:00Z", createdAt: "2026-03-12T14:00:00Z" },
];

export const serviceAccounts: ServiceAccount[] = [
  { id: "sa-1", name: "CI/CD Pipeline", description: "Automated deployment service", lastUsed: "2026-03-14T06:00:00Z", createdAt: "2025-08-01", createdBy: "Alex Morgan", status: "active", scopes: ["audit.view", "user.view"] },
  { id: "sa-2", name: "SCIM Provisioner", description: "Identity provider sync", lastUsed: "2026-03-13T08:15:00Z", createdAt: "2025-10-15", createdBy: "Sarah Chen", status: "active", scopes: ["user.invite", "user.deactivate", "linking.manage"] },
  { id: "sa-3", name: "Legacy Integration", description: "Deprecated HRIS connector", lastUsed: "2025-11-01T10:00:00Z", createdAt: "2025-06-01", createdBy: "Alex Morgan", status: "revoked", scopes: ["user.view"] },
];

export const loginAlerts: LoginAlert[] = [
  { id: "la-1", userId: "u-9", userDisplayName: "Dev Contractor", type: "suspicious_location", detail: "Login from São Paulo, BR — unusual location for this account", timestamp: "2026-03-12T14:00:00Z", resolved: false },
  { id: "la-2", userId: "u-8", userDisplayName: "Elena Vasquez", type: "brute_force", detail: "5 failed login attempts in 2 minutes before suspension", timestamp: "2026-02-28T09:55:00Z", resolved: true },
  { id: "la-3", userId: "u-3", userDisplayName: "Marcus Johnson", type: "new_device", detail: "First login from Windows device (previously only macOS)", timestamp: "2026-03-12T09:00:00Z", resolved: false },
  { id: "la-4", userId: "u-5", userDisplayName: "Tom Weber", type: "after_hours", detail: "Login at 02:15 AM local time — outside usual pattern", timestamp: "2026-03-11T01:15:00Z", resolved: true },
];

// ─── Policy Engine ──────────────────────────────
export const policyRules: PolicyRule[] = [
  { id: "pol-1", name: "MFA required for admins", description: "All users with admin or owner role must have MFA enabled", enabled: true, category: "security", severity: "critical" },
  { id: "pol-2", name: "External users restricted", description: "Users from non-organization domains have limited permissions", enabled: true, category: "access", severity: "warning" },
  { id: "pol-3", name: "Session timeout enforcement", description: "All sessions expire after the configured timeout period", enabled: true, category: "security", severity: "info" },
  { id: "pol-4", name: "Auto-deactivation on inactivity", description: "Users inactive for 90+ days are automatically deactivated", enabled: true, category: "access", severity: "warning" },
  { id: "pol-5", name: "Password complexity enforcement", description: "Minimum 12 characters, mixed case, numbers, and symbols required", enabled: true, category: "security", severity: "info" },
  { id: "pol-6", name: "Restrict self-registration", description: "New users can only join via admin invitation", enabled: true, category: "access", severity: "info" },
  { id: "pol-7", name: "Audit log retention", description: "Retain all audit events for the configured retention period", enabled: true, category: "compliance", severity: "info" },
  { id: "pol-8", name: "SCIM-only provisioning", description: "All user provisioning must go through SCIM identity provider", enabled: false, category: "access", severity: "warning" },
];

export const complianceModes: ComplianceMode[] = [
  { id: "cm-1", label: "GDPR Ready", description: "European data protection compliance", enabled: true, requirements: ["Data retention policies active", "Right to erasure enabled", "Data processing records maintained", "Consent management active"] },
  { id: "cm-2", label: "SOC 2 Ready", description: "Service organization security compliance", enabled: false, requirements: ["MFA enforced globally", "Audit logging at maximum detail", "Access reviews quarterly", "Incident response plan documented"] },
  { id: "cm-3", label: "ISO 27001", description: "Information security management", enabled: false, requirements: ["Risk assessment completed", "Security policies documented", "Employee security training", "Regular security audits"] },
];

// ─── Insights ───────────────────────────────────
export function getAdminInsights(): AdminInsight[] {
  const insights: AdminInsight[] = [];
  const unlinked = employeeLinks.filter((l) => l.linkStatus === "unlinked" || l.linkStatus === "suggested").length;
  if (unlinked > 0) {
    insights.push({ id: "ins-1", title: `${unlinked} users not linked to employees`, description: "Unlinked users reduce visibility into who is doing what. Link them to employee records for full context.", severity: "warning", category: "users", action: "Review Linking", actionLink: "/app/admin/linking" });
  }
  const noMfaAdmins = adminUsers.filter((u) => (u.role === "owner" || u.role === "admin") && u.status === "active");
  if (noMfaAdmins.length > 0) {
    insights.push({ id: "ins-2", title: "Verify MFA for all admins", description: "Ensure all admin-level users have MFA enabled. This is critical for enterprise security.", severity: "critical", category: "security", action: "Check Access", actionLink: "/app/admin/access" });
  }
  const inactiveProviders = authProviders.filter((p) => p.status === "inactive");
  if (inactiveProviders.length > 0) {
    insights.push({ id: "ins-3", title: `${inactiveProviders.length} inactive auth provider`, description: `${inactiveProviders.map((p) => p.label).join(", ")} — consider removing or activating.`, severity: "info", category: "auth", action: "Manage Providers", actionLink: "/app/admin/access" });
  }
  const unresolvedAlerts = loginAlerts.filter((a) => !a.resolved);
  if (unresolvedAlerts.length > 0) {
    insights.push({ id: "ins-4", title: `${unresolvedAlerts.length} unresolved login alerts`, description: "Suspicious login activity detected. Review and resolve to maintain security posture.", severity: "critical", category: "security", action: "View Alerts", actionLink: "/app/admin/access" });
  }
  const deactivated = adminUsers.filter((u) => u.status === "deactivated");
  if (deactivated.length > 0) {
    insights.push({ id: "ins-5", title: `${deactivated.length} deactivated user pending cleanup`, description: "Deactivated accounts may still hold linked data. Consider archiving or removing.", severity: "info", category: "users", action: "Manage Users", actionLink: "/app/admin/users" });
  }
  return insights;
}

export function getAdminStats(): AdminStats {
  const active = adminUsers.filter((u) => u.status === "active").length;
  const linked = adminUsers.filter((u) => u.linkedEmployeeId !== null).length;
  const invited = adminUsers.filter((u) => u.status === "invited").length;
  const providers = authProviders.filter((p) => p.status === "active").length;
  const today = auditLog.filter((e) => e.timestamp.startsWith("2026-03-13")).length;

  return {
    totalUsers: adminUsers.length,
    activeUsers: active,
    linkedUsers: linked,
    pendingInvites: invited,
    authProviders: providers,
    auditEventsToday: today,
  };
}
