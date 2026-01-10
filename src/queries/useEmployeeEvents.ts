import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EmployeeEventsResponseDto } from "@/lib/types";

export interface EmployeeEventsParams {
  teamId: string;
  employeeId: string;
  from: string;
  to: string;
  eventTypeIds?: string[];
}

const buildEmployeeEventsUrl = (params: EmployeeEventsParams) => {
  const query = new URLSearchParams({
    teamId: params.teamId,
    employeeId: params.employeeId,
    from: params.from,
    to: params.to,
  });
  if (params.eventTypeIds && params.eventTypeIds.length > 0) {
    query.set("eventTypeIds", params.eventTypeIds.join(","));
  }
  return `/api/timelines/employee-events?${query.toString()}`;
};

export const employeeEventsQueryKey = (params: EmployeeEventsParams) => [
  "employee-events",
  params.teamId,
  params.employeeId,
  params.from,
  params.to,
  params.eventTypeIds?.join(",") ?? "all",
];

export const employeeEventsQueryOptions = (
  params: EmployeeEventsParams
): UseQueryOptions<EmployeeEventsResponseDto> => ({
  queryKey: employeeEventsQueryKey(params),
  queryFn: () => apiFetch<EmployeeEventsResponseDto>(buildEmployeeEventsUrl(params)),
  enabled: !!params.teamId && !!params.employeeId,
});

export const useEmployeeEvents = (
  params: EmployeeEventsParams,
  options?: UseQueryOptions<EmployeeEventsResponseDto>
) => {
  return useQuery<EmployeeEventsResponseDto>({
    ...employeeEventsQueryOptions(params),
    ...options,
  });
};
