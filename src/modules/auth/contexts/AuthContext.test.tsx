import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "@/modules/auth/contexts/AuthContext";
import { ApiError, authApi } from "@/modules/auth/api/authApi";
import { ProtectedRoute } from "@/modules/auth/components/ProtectedRoute";

vi.mock("@/modules/auth/api/authApi", () => ({
  authApi: {
    me: vi.fn(),
    listTenants: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
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
});
