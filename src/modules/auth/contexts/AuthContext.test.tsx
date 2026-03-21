import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "@/modules/auth/contexts/AuthContext";
import { ApiError, authApi } from "@/modules/auth/api/authApi";
import { PlatformRoute, ProtectedRoute, TenantAdminRoute } from "@/modules/auth/components/ProtectedRoute";

vi.mock("@/modules/auth/api/authApi", () => ({
  authApi: {
    me: vi.fn(),
    listTenants: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    switchTenant: vi.fn(),
    listSsoProviders: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    code: string;
    details: string[];

    constructor(payload: { message: string; code: string; details?: string[]; status: number }) {
      super(payload.message);
      this.status = payload.status;
      this.code = payload.code;
      this.details = payload.details ?? [];
    }
  },
}));

function AuthStatusProbe() {
  const { status, user } = useAuth();
  return <div>{status}:{user?.email ?? "none"}</div>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.localStorage.clear();
  });

  it("bootstraps an authenticated session", async () => {
    vi.mocked(authApi.me).mockResolvedValue({
      id: "u-1",
      email: "admin@local",
      displayName: "Admin",
      role: "ADMIN",
      active: true,
      employeeId: null,
      employee: null,
      lastLoginAt: null,
      lastLoginMethod: "PASSWORD",
    });
    vi.mocked(authApi.listTenants).mockResolvedValue([
      { tenantId: "t-1", displayName: "Tenant A", role: "ADMIN" },
    ]);

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthStatusProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("authenticated:admin@local")).toBeInTheDocument();
    });
  });

  it("falls back to anonymous for unauthorized sessions", async () => {
    vi.mocked(authApi.me).mockRejectedValue(new ApiError({
      message: "Authentication required",
      code: "UNAUTHORIZED",
      status: 401,
    }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthStatusProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("anonymous:none")).toBeInTheDocument();
    });
  });

  it("switches the active tenant and refreshes the session", async () => {
    vi.mocked(authApi.me)
      .mockResolvedValueOnce({
        id: "u-1",
        email: "admin@local",
        displayName: "Admin",
        role: "ADMIN",
        active: true,
        employeeId: null,
        employee: null,
        lastLoginAt: null,
        lastLoginMethod: "PASSWORD",
      })
      .mockResolvedValueOnce({
        id: "u-1",
        email: "admin@local",
        displayName: "Admin",
        role: "USER",
        active: true,
        employeeId: null,
        employee: null,
        lastLoginAt: null,
        lastLoginMethod: "PASSWORD",
      });
    vi.mocked(authApi.listTenants)
      .mockResolvedValueOnce([
        { tenantId: "tenant-a", displayName: "Tenant A", role: "ADMIN" },
        { tenantId: "tenant-b", displayName: "Tenant B", role: "USER" },
      ])
      .mockResolvedValueOnce([
        { tenantId: "tenant-a", displayName: "Tenant A", role: "ADMIN" },
        { tenantId: "tenant-b", displayName: "Tenant B", role: "USER" },
      ]);
    vi.mocked(authApi.switchTenant).mockResolvedValue(undefined);

    function TenantProbe() {
      const { activeTenantId, activeTenantRole, switchTenant } = useAuth();
      return (
        <div>
          <span>{activeTenantId}:{activeTenantRole}</span>
          <button onClick={() => void switchTenant("tenant-b")}>switch</button>
        </div>
      );
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <TenantProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("tenant-a:ADMIN")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "switch" }));

    await waitFor(() => {
      expect(screen.getByText("tenant-b:USER")).toBeInTheDocument();
    });
  });
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("redirects anonymous users to login", async () => {
    vi.mocked(authApi.me).mockRejectedValue(new ApiError({
      message: "Authentication required",
      code: "UNAUTHORIZED",
      status: 401,
    }));

    render(
      <MemoryRouter initialEntries={["/app/overview"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>login page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/app/overview" element={<div>overview</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("login page")).toBeInTheDocument();
    });
  });

  it("blocks tenant admin routes for non-admin tenant roles", async () => {
    vi.mocked(authApi.me).mockResolvedValue({
      id: "u-1",
      email: "user@local",
      displayName: "User",
      role: "USER",
      active: true,
      employeeId: null,
      employee: null,
      lastLoginAt: null,
      lastLoginMethod: "PASSWORD",
    });
    vi.mocked(authApi.listTenants).mockResolvedValue([
      { tenantId: "tenant-b", displayName: "Tenant B", role: "USER" },
    ]);

    render(
      <MemoryRouter initialEntries={["/app/admin"]}>
        <AuthProvider>
          <Routes>
            <Route element={<TenantAdminRoute />}>
              <Route path="/app/admin" element={<div>admin area</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Admin access required")).toBeInTheDocument();
    });
  });

  it("blocks platform routes for tenant admins without platform role", async () => {
    vi.mocked(authApi.me).mockResolvedValue({
      id: "u-1",
      email: "tenant-admin@local",
      displayName: "Tenant Admin",
      role: "USER",
      active: true,
      employeeId: null,
      employee: null,
      lastLoginAt: null,
      lastLoginMethod: "PASSWORD",
    });
    vi.mocked(authApi.listTenants).mockResolvedValue([
      { tenantId: "tenant-a", displayName: "Tenant A", role: "ADMIN" },
    ]);

    render(
      <MemoryRouter initialEntries={["/platform"]}>
        <AuthProvider>
          <Routes>
            <Route element={<PlatformRoute />}>
              <Route path="/platform" element={<div>platform area</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Access restricted")).toBeInTheDocument();
    });
  });
});
