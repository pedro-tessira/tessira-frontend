import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface AdminUserDto {
  id: string;
  email: string;
  displayName: string;
  role: string;
  employeeId?: string | null;
  employee?: {
    id: string;
    displayName: string;
    email: string;
  } | null;
  active?: boolean;
  lastLoginAt?: string | null;
  lastLoginMethod?: string | null;
}

export interface UpdateUserRequest {
  email?: string;
  displayName?: string;
  role?: "ADMIN" | "MANAGER" | "USER";
  active?: boolean;
  employeeId?: string | null;
}

export const useAdminUsers = (search: string) => {
  return useQuery({
    queryKey: ["adminUsers", search],
    queryFn: () =>
      apiFetch<AdminUserDto[]>(`/api/admin/users?search=${encodeURIComponent(search)}`),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserRequest }) =>
      apiFetch<AdminUserDto>(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<void>(`/api/admin/users/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
};

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      apiFetch<void>(`/api/admin/users/${userId}/credentials/password`, {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
};
