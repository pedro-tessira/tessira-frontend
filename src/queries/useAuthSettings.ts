import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface AuthSettingsDto {
  requireSso: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAuthSettingsRequest {
  requireSso: boolean;
}

export const useAuthSettings = () => {
  return useQuery({
    queryKey: ["authSettings"],
    queryFn: () => apiFetch<AuthSettingsDto>("/api/admin/auth-settings"),
  });
};

export const useUpdateAuthSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAuthSettingsRequest) =>
      apiFetch<AuthSettingsDto>("/api/admin/auth-settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authSettings"] });
    },
  });
};
