import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

type CreateTeamMemberRequest = {
  employeeId: string;
  roleInTeam?: "OWNER" | "MEMBER";
  startDate?: string;
};

type UpdateTeamMemberRequest = {
  roleInTeam?: "OWNER" | "MEMBER";
  endDate?: string;
};

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: CreateTeamMemberRequest }) =>
      apiFetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees", variables.teamId] });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, membershipId, payload }: { teamId: string; membershipId: string; payload: UpdateTeamMemberRequest }) =>
      apiFetch(`/api/teams/${teamId}/members/${membershipId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees", variables.teamId] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, membershipId }: { teamId: string; membershipId: string }) =>
      apiFetch(`/api/teams/${teamId}/members/${membershipId}`, {
        method: "DELETE",
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees", variables.teamId] });
    },
  });
};
