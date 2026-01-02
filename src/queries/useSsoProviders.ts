import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type SsoProviderType = "ENTRA_ID" | "OKTA" | "GOOGLE_WORKSPACE" | "SAML2";

export interface SsoProviderDto {
  id: string;
  provider: SsoProviderType;
  displayName: string;
  enabled: boolean;
  requiredSso: boolean;
  autoProvision: boolean;
  allowedEmailDomains: string[];
  settings: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSsoProviderRequest {
  provider: SsoProviderType;
  displayName: string;
  enabled: boolean;
  requiredSso: boolean;
  autoProvision: boolean;
  allowedEmailDomains: string[];
  settings: Record<string, string>;
}

export interface UpdateSsoProviderRequest {
  displayName?: string;
  enabled?: boolean;
  requiredSso?: boolean;
  autoProvision?: boolean;
  allowedEmailDomains?: string[];
  settings?: Record<string, string>;
}

export interface ConnectionTestResult {
  success: boolean;
  statusCode: number;
  message: string;
}

export const useSsoProviders = () => {
  return useQuery({
    queryKey: ["ssoProviders"],
    queryFn: () => apiFetch<SsoProviderDto[]>("/api/admin/sso-providers"),
  });
};

export const useCreateSsoProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSsoProviderRequest) =>
      apiFetch<SsoProviderDto>("/api/admin/sso-providers", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ssoProviders"] });
    },
  });
};

export const useUpdateSsoProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSsoProviderRequest }) =>
      apiFetch<SsoProviderDto>(`/api/admin/sso-providers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ssoProviders"] });
    },
  });
};

export const useDeleteSsoProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/admin/sso-providers/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ssoProviders"] });
    },
  });
};

export const useTestSsoProvider = () => {
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<ConnectionTestResult>(`/api/admin/sso-providers/${id}/test`, {
        method: "POST",
      }),
  });
};
