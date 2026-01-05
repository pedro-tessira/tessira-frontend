import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { MeDto } from "@/lib/types";

export const meQueryKey = ["me"];

export const useMe = (options?: UseQueryOptions<MeDto>) => {
  return useQuery<MeDto>({
    queryKey: meQueryKey,
    queryFn: async () => {
      try {
        return await apiFetch<MeDto>("/api/auth/me", { skipAuthRedirect: true });
      } catch (error) {
        const status = typeof error === "object" && error && "status" in error ? Number(error.status) : null;
        if (status === 404) {
          return apiFetch<MeDto>("/api/me", { skipAuthRedirect: true });
        }
        if (status === 401 || status === 403) {
          clearToken();
          window.location.assign("/");
        }
        throw error;
      }
    },
    ...options,
  });
};
