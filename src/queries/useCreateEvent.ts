import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EventScope } from "@/lib/types";

export interface CreateEventPayload {
  scope: EventScope;
  eventTypeId: string;
  employeeId?: string | null;
  teamId?: string | null;
  startDate: string;
  endDate: string;
  title?: string | null;
}

export interface BulkCreateEventPayload {
  scope: EventScope;
  eventTypeId: string;
  employeeIds: string[];
  teamId: string;
  startDate: string;
  endDate: string;
  title?: string | null;
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      apiFetch("/api/events", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["employee-events"] });
    },
  });
};

export const useCreateBulkEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkCreateEventPayload) =>
      apiFetch("/api/events/bulk", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["employee-events"] });
    },
  });
};
