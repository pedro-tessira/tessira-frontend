import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { MeDto } from "@/lib/types";

export const meQueryKey = ["me"];

export const useMe = (options?: UseQueryOptions<MeDto>) => {
  return useQuery<MeDto>({
    queryKey: meQueryKey,
    queryFn: () => apiFetch<MeDto>("/api/me"),
    ...options,
  });
};
