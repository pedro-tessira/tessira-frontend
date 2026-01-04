import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface SsoProviderSummaryDto {
  id: string;
  provider: string;
  protocol: string;
  displayName: string;
}

export const usePublicSsoProviders = () => {
  return useQuery({
    queryKey: ["publicSsoProviders"],
    queryFn: () => apiFetch<SsoProviderSummaryDto[]>("/api/auth/sso-providers"),
  });
};
