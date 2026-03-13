export type AuthProviderType = "email" | "google" | "microsoft" | "saml" | "github";
export type AuthProviderStatus = "active" | "inactive" | "configuring";

export interface AuthProvider {
  id: string;
  type: AuthProviderType;
  label: string;
  status: AuthProviderStatus;
  usersCount: number;
  lastSync: string | null;
}

export type AdminUserStatus = "active" | "suspended" | "invited" | "deactivated";
export type AdminUserRole = "owner" | "admin" | "member" | "viewer";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  authProvider: AuthProviderType;
  linkedEmployeeId: string | null;
  linkedEmployeeName: string | null;
  lastLogin: string | null;
  createdAt: string;
}

export interface EmployeeLink {
  userId: string;
  userEmail: string;
  userDisplayName: string;
  employeeId: string | null;
  employeeName: string | null;
  linkStatus: "linked" | "unlinked" | "suggested";
  confidence?: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  detail: string;
  severity: "info" | "warning" | "critical";
}

export interface GovernanceSettings {
  tenantName: string;
  tenantId: string;
  plan: "starter" | "team" | "enterprise";
  dataRegion: string;
  mfaEnforced: boolean;
  sessionTimeout: number;
  ipAllowList: string[];
  retentionDays: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  linkedUsers: number;
  pendingInvites: number;
  authProviders: number;
  auditEventsToday: number;
}
