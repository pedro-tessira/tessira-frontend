import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { teamsQueryKey } from "@/queries/useTeams";

type CreateTeamRequest = {
  name: string;
  code?: string;
};

type UpdateTeamRequest = {
  name?: string;
  code?: string;
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeamRequest) =>
      apiFetch("/api/teams", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamsQueryKey });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamRequest }) =>
      apiFetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamsQueryKey });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) =>
      apiFetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamsQueryKey });
    },
  });
};
