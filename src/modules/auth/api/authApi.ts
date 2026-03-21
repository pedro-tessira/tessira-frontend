import { routePaths } from "@/app/routing/routePaths";

export interface ApiErrorPayload {
  message: string;
  code: string;
  details: string[];
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: string[];
  traceId?: string;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
    this.traceId = payload.traceId;
  }
}

export interface AuthEmployeeSummary {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  source: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  active: boolean;
  employeeId: string | null;
  employee: AuthEmployeeSummary | null;
  lastLoginAt: string | null;
  lastLoginMethod: string | null;
}

export interface AuthTenant {
  tenantId: string;
  displayName: string;
  role: string;
}

export interface SsoProviderSummary {
  id: string;
  provider: string;
  protocol: string;
  displayName: string;
}

export interface PasswordLoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(new URL(path, API_BASE_URL), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 401) {
    throw new ApiError({
      message: "Authentication required",
      code: "UNAUTHORIZED",
      details: [],
      status: 401,
    });
  }

  if (!response.ok) {
    let payload: Partial<ApiErrorPayload> | undefined;
    try {
      payload = (await response.json()) as Partial<ApiErrorPayload>;
    } catch {
      payload = undefined;
    }

    throw new ApiError({
      message: payload?.message ?? "Request failed",
      code: payload?.code ?? "HTTP_ERROR",
      details: payload?.details ?? [],
      type: payload?.type,
      title: payload?.title,
      status: payload?.status ?? response.status,
      detail: payload?.detail,
      instance: payload?.instance,
      traceId: payload?.traceId,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login(payload: PasswordLoginRequest) {
    return request<AuthUser>("/api/auth/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout() {
    return request<void>("/api/auth/logout", {
      method: "POST",
    });
  },

  me() {
    return request<AuthUser>("/api/auth/me");
  },

  listTenants() {
    return request<AuthTenant[]>("/api/auth/tenants");
  },

  listSsoProviders() {
    return request<SsoProviderSummary[]>("/api/auth/sso-providers");
  },
};

export function isProtectedPath(pathname: string) {
  return pathname.startsWith(routePaths.app.root) || pathname.startsWith(routePaths.platform.root);
}
