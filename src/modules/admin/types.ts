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
  lastActivity: string | null;
  createdAt: string;
  customRoles?: string[];
}

export interface EmployeeLink {
  userId: string;
  userEmail: string;
  userDisplayName: string;
  employeeId: string | null;
  employeeName: string | null;
  linkStatus: "linked" | "unlinked" | "suggested";
  confidence?: number;
  matchType?: "email" | "domain" | "manual";
  linkedAt?: string | null;
  linkedBy?: string | null;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  detail: string;
  severity: "info" | "warning" | "critical";
  category?: string;
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

// RBAC
export interface Permission {
  key: string;
  label: string;
  domain: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

// Tenant subscription
export interface TenantSubscription {
  status: "active" | "suspended" | "trial" | "expired";
  plan: "free" | "pro" | "enterprise";
  seats: number;
  usedSeats: number;
  billingOwner: string;
  billingEmail: string;
  renewalDate: string;
  region: string;
  mrr: number;
}

// Security
export interface ActiveSession {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  createdAt: string;
}

export interface ServiceAccount {
  id: string;
  name: string;
  description: string;
  lastUsed: string | null;
  createdAt: string;
  createdBy: string;
  status: "active" | "revoked";
  scopes: string[];
}

export interface LoginAlert {
  id: string;
  userId: string;
  userDisplayName: string;
  type: "suspicious_location" | "brute_force" | "new_device" | "after_hours";
  detail: string;
  timestamp: string;
  resolved: boolean;
}

// Policy engine
export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: "security" | "access" | "compliance";
  severity: "info" | "warning" | "critical";
}

export interface ComplianceMode {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  requirements: string[];
}

// Insights
export interface AdminInsight {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  category: "security" | "users" | "compliance" | "auth";
  action?: string;
  actionLink?: string;
}
