import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EventTypeDto } from "@/lib/types";

export const eventTypesQueryKey = (teamId?: string) => ["event-types", teamId ?? "all"];

export const useEventTypes = (teamId?: string) => {
  const queryParam = teamId ? `?teamId=${teamId}` : "";
  return useQuery<EventTypeDto[]>({
    queryKey: eventTypesQueryKey(teamId),
    queryFn: () => apiFetch<EventTypeDto[]>(`/api/event-types${queryParam}`),
  });
};
