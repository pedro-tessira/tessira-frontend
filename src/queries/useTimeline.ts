import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { TimelineResponseDto } from "@/lib/types";

export interface TimelineParams {
  teamId: string;
  from: string;
  to: string;
  employeeIds?: string[];
  eventTypeIds?: string[];
}

const buildTimelineUrl = (params: TimelineParams) => {
  const query = new URLSearchParams({
    teamId: params.teamId,
    from: params.from,
    to: params.to,
  });
  if (params.employeeIds) {
    query.set("employeeIds", params.employeeIds.join(","));
  }
  if (params.eventTypeIds) {
    query.set("eventTypeIds", params.eventTypeIds.join(","));
  }
  return `/api/timeline?${query.toString()}`;
};

export const timelineQueryKey = (params: TimelineParams) => [
  "timeline",
  params.teamId,
  params.from,
  params.to,
  params.employeeIds?.join(",") ?? "all",
  params.eventTypeIds?.join(",") ?? "all",
];

export const useTimeline = (
  params: TimelineParams,
  options?: UseQueryOptions<TimelineResponseDto>
) => {
  return useQuery<TimelineResponseDto>({
    queryKey: timelineQueryKey(params),
    queryFn: () => apiFetch<TimelineResponseDto>(buildTimelineUrl(params)),
    enabled: !!params.teamId,
    ...options,
  });
};
