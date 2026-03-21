import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, ApiError, type AuthTenant, type AuthUser, type PasswordLoginRequest } from "@/modules/auth/api/authApi";

type AuthStatus = "bootstrapping" | "authenticated" | "anonymous";
const ACTIVE_TENANT_STORAGE_KEY = "tessira-active-tenant";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  tenants: AuthTenant[];
  activeTenantId: string | null;
  activeTenantRole: string | null;
  isAuthenticated: boolean;
  isTenantAdmin: boolean;
  isPlatformAdmin: boolean;
  isSwitchingTenant: boolean;
  bootstrapError: ApiError | null;
  login: (payload: PasswordLoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadSession() {
  const [user, tenants] = await Promise.all([authApi.me(), authApi.listTenants()]);
  return { user, tenants };
}

function readStoredTenantId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY);
}

function writeStoredTenantId(tenantId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (tenantId) {
    window.localStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, tenantId);
    return;
  }

  window.localStorage.removeItem(ACTIVE_TENANT_STORAGE_KEY);
}

function resolveActiveTenantId(user: AuthUser, tenants: AuthTenant[], currentTenantId: string | null) {
  if (currentTenantId && tenants.some((tenant) => tenant.tenantId === currentTenantId)) {
    return currentTenantId;
  }

  const storedTenantId = readStoredTenantId();
  if (storedTenantId && tenants.some((tenant) => tenant.tenantId === storedTenantId)) {
    return storedTenantId;
  }

  const matchingRoleTenant = tenants.find((tenant) => tenant.role === user.role);
  return matchingRoleTenant?.tenantId ?? tenants[0]?.tenantId ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("bootstrapping");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenants, setTenants] = useState<AuthTenant[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [isSwitchingTenant, setIsSwitchingTenant] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<ApiError | null>(null);

  const refreshSession = async (preferredTenantId?: string) => {
    try {
      const session = await loadSession();
      setUser(session.user);
      setTenants(session.tenants);
      setActiveTenantId((currentTenantId) => {
        const nextTenantId = resolveActiveTenantId(
          session.user,
          session.tenants,
          preferredTenantId ?? currentTenantId,
        );
        writeStoredTenantId(nextTenantId);
        return nextTenantId;
      });
      setBootstrapError(null);
      setStatus("authenticated");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        setTenants([]);
        setActiveTenantId(null);
        writeStoredTenantId(null);
        setBootstrapError(null);
        setStatus("anonymous");
        return;
      }

      setUser(null);
      setTenants([]);
      setActiveTenantId(null);
      setBootstrapError(error instanceof ApiError ? error : new ApiError({
        message: "Unable to bootstrap session",
        code: "BOOTSTRAP_FAILED",
        details: [],
        status: 500,
      }));
      setStatus("anonymous");
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  const login = async (payload: PasswordLoginRequest) => {
    const loggedInUser = await authApi.login(payload);
    setUser(loggedInUser);
    const availableTenants = await authApi.listTenants();
    setTenants(availableTenants);
    const nextTenantId = resolveActiveTenantId(loggedInUser, availableTenants, payload.tenantId ?? null);
    setActiveTenantId(nextTenantId);
    writeStoredTenantId(nextTenantId);
    setBootstrapError(null);
    setStatus("authenticated");
    return loggedInUser;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setTenants([]);
    setActiveTenantId(null);
    writeStoredTenantId(null);
    setBootstrapError(null);
    setStatus("anonymous");
  };

  const switchTenant = async (tenantId: string) => {
    setIsSwitchingTenant(true);
    try {
      await authApi.switchTenant(tenantId);
      await refreshSession(tenantId);
    } finally {
      setIsSwitchingTenant(false);
    }
  };

  const activeTenantRole = tenants.find((tenant) => tenant.tenantId === activeTenantId)?.role ?? null;
  const isPlatformAdmin = user?.role === "ADMIN";

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    tenants,
    activeTenantId,
    activeTenantRole,
    isAuthenticated: status === "authenticated" && user !== null,
    isTenantAdmin: activeTenantRole === "ADMIN",
    isPlatformAdmin,
    isSwitchingTenant,
    bootstrapError,
    login,
    logout,
    refreshSession,
    switchTenant,
  }), [status, user, tenants, activeTenantId, activeTenantRole, isPlatformAdmin, isSwitchingTenant, bootstrapError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
