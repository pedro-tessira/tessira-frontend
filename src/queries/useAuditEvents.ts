import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EventAuditDto } from "@/lib/types";

export const useAuditEvents = () => {
  return useQuery({
    queryKey: ["audit-events"],
    queryFn: () => apiFetch<EventAuditDto[]>("/api/audit/events"),
  });
};
