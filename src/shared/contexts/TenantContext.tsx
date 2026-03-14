import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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

const MOCK_TENANTS: Tenant[] = [
  { id: "t1", name: "Planet Engineering", slug: "planet-eng", plan: "enterprise", region: "eu-west-1", status: "active", userCount: 142, createdAt: "2024-01-15" },
  { id: "t2", name: "BNP Paribas", slug: "bnp", plan: "enterprise", region: "eu-central-1", status: "active", userCount: 89, createdAt: "2024-03-22" },
  { id: "t3", name: "Startup X", slug: "startup-x", plan: "team", region: "us-east-1", status: "trial", userCount: 12, createdAt: "2025-11-01" },
];

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenantId, setCurrentTenantId] = useState("t1");

  const switchTenant = useCallback((tenantId: string) => {
    setCurrentTenantId(tenantId);
    // In production: invalidate queries, reload tenant-scoped data
  }, []);

  const currentTenant = MOCK_TENANTS.find((t) => t.id === currentTenantId) ?? MOCK_TENANTS[0];

  return (
    <TenantContext.Provider value={{ currentTenant, tenants: MOCK_TENANTS, switchTenant, isPlatformAdmin: true }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
