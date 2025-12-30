import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { eventTypesQueryKey } from "@/queries/useEventTypes";

type CreateEventTypeRequest = {
  name: string;
  code?: string;
  scope: "INDIVIDUAL" | "TEAM" | "GLOBAL";
  teamId?: string | null;
  color?: string | null;
  userCreatable?: boolean;
};

type UpdateEventTypeRequest = {
  name?: string;
  code?: string;
  scope?: "INDIVIDUAL" | "TEAM" | "GLOBAL";
  teamId?: string | null;
  color?: string | null;
  userCreatable?: boolean;
};

export const useCreateEventType = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventTypeRequest) =>
      apiFetch("/api/event-types", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypesQueryKey(teamId) });
    },
  });
};

export const useUpdateEventType = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventTypeId, payload }: { eventTypeId: string; payload: UpdateEventTypeRequest }) =>
      apiFetch(`/api/event-types/${eventTypeId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypesQueryKey(teamId) });
    },
  });
};

export const useDeleteEventType = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventTypeId: string) =>
      apiFetch(`/api/event-types/${eventTypeId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypesQueryKey(teamId) });
    },
  });
};
