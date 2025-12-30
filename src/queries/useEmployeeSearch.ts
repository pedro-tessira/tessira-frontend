import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EmployeeSearchDto } from "@/lib/types";

export const searchEmployees = (query: string) =>
  apiFetch<EmployeeSearchDto[]>(`/api/employees?search=${encodeURIComponent(query)}`);

export const useEmployeeSearch = () => {
  const queryClient = useQueryClient();
  return (query: string) =>
    queryClient.fetchQuery({
      queryKey: ["employees-search", query],
      queryFn: () => searchEmployees(query),
    });
};
