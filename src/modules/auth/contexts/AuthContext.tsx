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

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  tenants: AuthTenant[];
  isAuthenticated: boolean;
  isPlatformAdmin: boolean;
  bootstrapError: ApiError | null;
  login: (payload: PasswordLoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadSession() {
  const [user, tenants] = await Promise.all([authApi.me(), authApi.listTenants()]);
  return { user, tenants };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("bootstrapping");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenants, setTenants] = useState<AuthTenant[]>([]);
  const [bootstrapError, setBootstrapError] = useState<ApiError | null>(null);

  const refreshSession = async () => {
    try {
      const session = await loadSession();
      setUser(session.user);
      setTenants(session.tenants);
      setBootstrapError(null);
      setStatus("authenticated");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        setTenants([]);
        setBootstrapError(null);
        setStatus("anonymous");
        return;
      }

      setUser(null);
      setTenants([]);
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
    setBootstrapError(null);
    setStatus("authenticated");
    return loggedInUser;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setTenants([]);
    setBootstrapError(null);
    setStatus("anonymous");
  };

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    tenants,
    isAuthenticated: status === "authenticated" && user !== null,
    isPlatformAdmin: user?.role === "ADMIN",
    bootstrapError,
    login,
    logout,
    refreshSession,
  }), [status, user, tenants, bootstrapError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
