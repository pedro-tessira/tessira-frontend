import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EventAuditDto, EventScope } from "@/lib/types";

export type AuditEventsParams = {
  from: string;
  to: string;
  teamId?: string;
  employeeId?: string;
  scope?: EventScope;
  eventTypeIds?: string[];
};

const buildAuditEventsUrl = (params: AuditEventsParams) => {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
  });

  if (params.teamId) {
    query.set("teamId", params.teamId);
  }
  if (params.employeeId) {
    query.set("employeeId", params.employeeId);
  }
  if (params.scope) {
    query.set("scope", params.scope);
  }
  if (params.eventTypeIds && params.eventTypeIds.length > 0) {
    query.set("eventTypeIds", params.eventTypeIds.join(","));
  }

  return `/api/audits/events?${query.toString()}`;
};

export const useAuditEvents = (params: AuditEventsParams) => {
  return useQuery({
    queryKey: ["audit-events", params],
    queryFn: () => apiFetch<EventAuditDto[]>(buildAuditEventsUrl(params)),
    enabled: !!params.from && !!params.to,
  });
};
