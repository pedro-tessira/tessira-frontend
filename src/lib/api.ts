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

const isSafeMethod = (method?: string): boolean => {
  if (!method) return true;
  return ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
};

const getCookieValue = (name: string): string | null => {
  try {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies) {
      const [key, ...rest] = cookie.split("=");
      if (key === name) {
        return decodeURIComponent(rest.join("="));
      }
    }
  } catch {
    return null;
  }
  return null;
};

const getCsrfToken = (): string | null => getCookieValue("XSRF-TOKEN");

export const refreshSession = async (): Promise<boolean> => {
  const csrfToken = getCsrfToken();
  if (!csrfToken) {
    return false;
  }
  const headers = new Headers();
  headers.set("X-XSRF-TOKEN", csrfToken);
  const response = await fetch(buildUrl("/api/auth/refresh"), {
    method: "POST",
    credentials: "include",
    headers,
  });
  return response.ok;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { skipAuthRedirect?: boolean } = {}
): Promise<T> {
  const { skipAuthRedirect, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  if (!headers.has("Content-Type") && requestOptions.body) {
    headers.set("Content-Type", "application/json");
  }
  if (!isSafeMethod(requestOptions.method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set("X-XSRF-TOKEN", csrfToken);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers,
    credentials: "include",
  });

  if (!skipAuthRedirect && response.status === 401 && !path.startsWith("/api/auth/")) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const retryResponse = await fetch(buildUrl(path), {
        ...requestOptions,
        headers,
        credentials: "include",
      });
      if (retryResponse.ok) {
        if (retryResponse.status === 204) {
          return undefined as T;
        }
        return retryResponse.json() as Promise<T>;
      }
      if (retryResponse.status !== 401) {
        let message = retryResponse.statusText;
        try {
          const data = await retryResponse.json();
          message = data?.message ?? data?.error ?? message;
        } catch {
          // Ignore JSON parse errors.
        }
        throw { status: retryResponse.status, message };
      }
    }
    try {
      localStorage.setItem(
        "lastAuthError",
        JSON.stringify({
          path,
          status: response.status,
          time: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore storage errors.
    }
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
