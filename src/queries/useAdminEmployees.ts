import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EmployeeSearchDto } from "@/lib/types";

export interface CreateEmployeeRequest {
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  active?: boolean;
}

export interface UpdateEmployeeRequest {
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  active?: boolean;
}

export const useAdminEmployees = (search: string) => {
  return useQuery({
    queryKey: ["adminEmployees", search],
    queryFn: () =>
      apiFetch<EmployeeSearchDto[]>(`/api/employees?search=${encodeURIComponent(search)}`),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeeRequest) =>
      apiFetch<EmployeeSearchDto>("/api/employees", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEmployees"] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: UpdateEmployeeRequest }) =>
      apiFetch<EmployeeSearchDto>(`/api/employees/${employeeId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEmployees"] });
    },
  });
};

export const useDeactivateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) =>
      apiFetch<void>(`/api/employees/${employeeId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEmployees"] });
    },
  });
};

export const useUpdateUserEmployeeLink = () => {
  return useMutation({
    mutationFn: ({ userId, employeeId }: { userId: string; employeeId: string | null }) =>
      apiFetch(`/api/admin/users/${userId}/employee`, {
        method: "PATCH",
        body: JSON.stringify({ employeeId }),
      }),
  });
};
