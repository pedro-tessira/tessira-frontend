import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { CreateShareRequest, CreateShareResponse, ShareSummary } from "@/lib/types";

export const useCreateShare = () => {
  return useMutation({
    mutationFn: (payload: CreateShareRequest) =>
      apiFetch<CreateShareResponse>("/api/shares", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
};

export const sharesQueryKey = (teamId: string) => ["shares", teamId];

export const useShares = (teamId: string) => {
  return useQuery<ShareSummary[]>({
    queryKey: sharesQueryKey(teamId),
    queryFn: () => apiFetch<ShareSummary[]>(`/api/shares?teamId=${teamId}`),
    enabled: !!teamId,
  });
};

export const useRevokeShare = () => {
  return useMutation({
    mutationFn: (shareId: string) =>
      apiFetch(`/api/shares/${shareId}/revoke`, {
        method: "POST",
      }),
  });
};
