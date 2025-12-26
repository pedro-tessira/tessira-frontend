import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EventTypeDto } from "@/lib/types";

export const eventTypesQueryKey = (teamId: string) => ["event-types", teamId];

export const useEventTypes = (teamId: string) => {
  return useQuery<EventTypeDto[]>({
    queryKey: eventTypesQueryKey(teamId),
    queryFn: () => apiFetch<EventTypeDto[]>(`/api/event-types?teamId=${teamId}`),
    enabled: !!teamId,
  });
};
