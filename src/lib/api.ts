import { clearToken, getToken } from "@/lib/auth";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type ApiError = {
  status: number;
  message: string;
};

const buildUrl = (path: string): string => {
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not set");
  }
  return `${baseUrl}${path}`;
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    clearToken();
    window.location.assign("/");
  }

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data?.message ?? data?.error ?? message;
    } catch {
      // Ignore JSON parse errors.
    }
    const error: ApiError = { status: response.status, message };
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
