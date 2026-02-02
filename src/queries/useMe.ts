import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { MeDto } from "@/lib/types";

export const meQueryKey = ["me"];

export const useMe = (options?: UseQueryOptions<MeDto | null>) => {
  return useQuery<MeDto | null>({
    queryKey: meQueryKey,
    queryFn: async () => {
      try {
        return await apiFetch<MeDto>("/api/auth/me", { skipAuthRedirect: true });
      } catch (error) {
        const status = typeof error === "object" && error && "status" in error ? Number(error.status) : null;
        if (status === 401 || status === 403) {
          return null;
        }
        throw error;
      }
    },
    ...options,
  });
};

export const useUpdateMyPassword = () => {
  return useMutation({
    mutationFn: ({ password }: { password: string }) =>
      apiFetch<void>("/api/auth/me/password", {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
  });
};
