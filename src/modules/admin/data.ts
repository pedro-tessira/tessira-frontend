import type {
  AuthProvider,
  AdminUser,
  EmployeeLink,
  AuditEntry,
  GovernanceSettings,
  AdminStats,
} from "./types";

export const authProviders: AuthProvider[] = [
  { id: "ap-1", type: "email", label: "Email & Password", status: "active", usersCount: 24, lastSync: null },
  { id: "ap-2", type: "google", label: "Google Workspace", status: "active", usersCount: 18, lastSync: "2026-03-12T14:30:00Z" },
  { id: "ap-3", type: "microsoft", label: "Microsoft Entra ID", status: "inactive", usersCount: 0, lastSync: null },
  { id: "ap-4", type: "saml", label: "SAML SSO (Okta)", status: "configuring", usersCount: 0, lastSync: null },
  { id: "ap-5", type: "github", label: "GitHub", status: "active", usersCount: 12, lastSync: "2026-03-13T08:15:00Z" },
];

export const adminUsers: AdminUser[] = [
  { id: "u-1", email: "admin@tessira.io", displayName: "Alex Morgan", role: "owner", status: "active", authProvider: "email", linkedEmployeeId: "emp-1", linkedEmployeeName: "Alex Morgan", lastLogin: "2026-03-13T09:00:00Z", createdAt: "2025-06-01" },
  { id: "u-2", email: "sarah.chen@tessira.io", displayName: "Sarah Chen", role: "admin", status: "active", authProvider: "google", linkedEmployeeId: "emp-2", linkedEmployeeName: "Sarah Chen", lastLogin: "2026-03-13T08:45:00Z", createdAt: "2025-06-15" },
  { id: "u-3", email: "marcus.johnson@tessira.io", displayName: "Marcus Johnson", role: "member", status: "active", authProvider: "google", linkedEmployeeId: "emp-3", linkedEmployeeName: "Marcus Johnson", lastLogin: "2026-03-12T17:30:00Z", createdAt: "2025-07-01" },
  { id: "u-4", email: "priya.patel@tessira.io", displayName: "Priya Patel", role: "member", status: "active", authProvider: "email", linkedEmployeeId: "emp-4", linkedEmployeeName: "Priya Patel", lastLogin: "2026-03-13T07:15:00Z", createdAt: "2025-07-20" },
  { id: "u-5", email: "tom.weber@tessira.io", displayName: "Tom Weber", role: "member", status: "active", authProvider: "github", linkedEmployeeId: "emp-5", linkedEmployeeName: "Tom Weber", lastLogin: "2026-03-11T12:00:00Z", createdAt: "2025-08-10" },
  { id: "u-6", email: "aisha.kumar@tessira.io", displayName: "Aisha Kumar", role: "member", status: "invited", authProvider: "email", linkedEmployeeId: null, linkedEmployeeName: null, lastLogin: null, createdAt: "2026-03-10" },
  { id: "u-7", email: "james.liu@tessira.io", displayName: "James Liu", role: "viewer", status: "active", authProvider: "google", linkedEmployeeId: "emp-7", linkedEmployeeName: "James Liu", lastLogin: "2026-03-09T16:00:00Z", createdAt: "2025-09-01" },
  { id: "u-8", email: "elena.vasquez@tessira.io", displayName: "Elena Vasquez", role: "member", status: "suspended", authProvider: "email", linkedEmployeeId: "emp-8", linkedEmployeeName: "Elena Vasquez", lastLogin: "2026-02-28T10:00:00Z", createdAt: "2025-09-15" },
  { id: "u-9", email: "dev-contractor@external.io", displayName: "Dev Contractor", role: "viewer", status: "active", authProvider: "github", linkedEmployeeId: null, linkedEmployeeName: null, lastLogin: "2026-03-12T14:00:00Z", createdAt: "2026-01-15" },
  { id: "u-10", email: "legacy-user@tessira.io", displayName: "Legacy User", role: "member", status: "deactivated", authProvider: "email", linkedEmployeeId: null, linkedEmployeeName: null, lastLogin: "2025-12-01T09:00:00Z", createdAt: "2025-06-01" },
];

export const employeeLinks: EmployeeLink[] = [
  { userId: "u-1", userEmail: "admin@tessira.io", userDisplayName: "Alex Morgan", employeeId: "emp-1", employeeName: "Alex Morgan", linkStatus: "linked" },
  { userId: "u-2", userEmail: "sarah.chen@tessira.io", userDisplayName: "Sarah Chen", employeeId: "emp-2", employeeName: "Sarah Chen", linkStatus: "linked" },
  { userId: "u-3", userEmail: "marcus.johnson@tessira.io", userDisplayName: "Marcus Johnson", employeeId: "emp-3", employeeName: "Marcus Johnson", linkStatus: "linked" },
  { userId: "u-4", userEmail: "priya.patel@tessira.io", userDisplayName: "Priya Patel", employeeId: "emp-4", employeeName: "Priya Patel", linkStatus: "linked" },
  { userId: "u-5", userEmail: "tom.weber@tessira.io", userDisplayName: "Tom Weber", employeeId: "emp-5", employeeName: "Tom Weber", linkStatus: "linked" },
  { userId: "u-6", userEmail: "aisha.kumar@tessira.io", userDisplayName: "Aisha Kumar", employeeId: null, employeeName: "Aisha Kumar (suggested)", linkStatus: "suggested", confidence: 0.92 },
  { userId: "u-7", userEmail: "james.liu@tessira.io", userDisplayName: "James Liu", employeeId: "emp-7", employeeName: "James Liu", linkStatus: "linked" },
  { userId: "u-8", userEmail: "elena.vasquez@tessira.io", userDisplayName: "Elena Vasquez", employeeId: "emp-8", employeeName: "Elena Vasquez", linkStatus: "linked" },
  { userId: "u-9", userEmail: "dev-contractor@external.io", userDisplayName: "Dev Contractor", employeeId: null, employeeName: null, linkStatus: "unlinked" },
  { userId: "u-10", userEmail: "legacy-user@tessira.io", userDisplayName: "Legacy User", employeeId: null, employeeName: null, linkStatus: "unlinked" },
];

export const auditLog: AuditEntry[] = [
  { id: "al-1", timestamp: "2026-03-13T09:12:00Z", actor: "Alex Morgan", action: "user.invite", resource: "Aisha Kumar", detail: "Invited as member", severity: "info" },
  { id: "al-2", timestamp: "2026-03-13T08:50:00Z", actor: "Sarah Chen", action: "auth.login", resource: "Session", detail: "Login via Google", severity: "info" },
  { id: "al-3", timestamp: "2026-03-12T17:00:00Z", actor: "Alex Morgan", action: "user.suspend", resource: "Elena Vasquez", detail: "Account suspended — policy violation review", severity: "warning" },
  { id: "al-4", timestamp: "2026-03-12T15:30:00Z", actor: "System", action: "auth.provider.sync", resource: "GitHub", detail: "Sync completed — 12 users matched", severity: "info" },
  { id: "al-5", timestamp: "2026-03-12T14:00:00Z", actor: "Alex Morgan", action: "governance.mfa", resource: "Tenant", detail: "MFA enforcement enabled", severity: "critical" },
  { id: "al-6", timestamp: "2026-03-12T11:20:00Z", actor: "System", action: "auth.provider.sync", resource: "Google Workspace", detail: "Sync completed — 18 users matched", severity: "info" },
  { id: "al-7", timestamp: "2026-03-11T16:45:00Z", actor: "Alex Morgan", action: "user.role.change", resource: "Sarah Chen", detail: "Role changed to admin", severity: "warning" },
  { id: "al-8", timestamp: "2026-03-11T09:00:00Z", actor: "Sarah Chen", action: "governance.retention", resource: "Tenant", detail: "Retention policy updated to 365 days", severity: "info" },
  { id: "al-9", timestamp: "2026-03-10T13:00:00Z", actor: "Alex Morgan", action: "auth.provider.add", resource: "SAML SSO (Okta)", detail: "Provider added — configuring", severity: "warning" },
  { id: "al-10", timestamp: "2026-03-09T10:30:00Z", actor: "System", action: "user.deactivate", resource: "Legacy User", detail: "Auto-deactivated — 90 day inactivity", severity: "info" },
];

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
