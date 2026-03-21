import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth } from "@/modules/auth/contexts/AuthContext";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "team" | "enterprise";
  region: string;
  status: "active" | "suspended" | "trial";
  userCount: number;
  createdAt: string;
}

interface TenantContextValue {
  currentTenant: Tenant;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  isPlatformAdmin: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenants: authTenants, isPlatformAdmin } = useAuth();

  const tenants = useMemo<Tenant[]>(
    () =>
      authTenants.map((tenant) => ({
        id: tenant.tenantId,
        name: tenant.displayName,
        slug: tenant.displayName.toLowerCase().replace(/\s+/g, "-"),
        plan: "enterprise",
        region: "unknown",
        status: "active",
        userCount: 0,
        createdAt: "",
      })),
    [authTenants],
  );

  const currentTenant = tenants[0] ?? {
    id: "unknown",
    name: "No tenant",
    slug: "no-tenant",
    plan: "starter",
    region: "unknown",
    status: "trial",
    userCount: 0,
    createdAt: "",
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        tenants,
        switchTenant: () => {
          throw new Error("Tenant switching is not part of the current bootstrap slice");
        },
        isPlatformAdmin,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
