import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EmployeeDto } from "@/lib/types";

const buildEmployeesUrl = (teamId: string, search: string) => {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  const query = params.toString();
  return `/api/teams/${teamId}/employees${query ? `?${query}` : ""}`;
};

export const employeesQueryKey = (teamId: string, search: string) => ["employees", teamId, search];

export const employeesQueryOptions = (teamId: string, search: string): UseQueryOptions<EmployeeDto[]> => ({
  queryKey: employeesQueryKey(teamId, search),
  queryFn: () => apiFetch<EmployeeDto[]>(buildEmployeesUrl(teamId, search)),
  enabled: !!teamId,
});

export const useEmployees = (teamId: string, search: string) => {
  return useQuery<EmployeeDto[]>({
    ...employeesQueryOptions(teamId, search),
  });
};
