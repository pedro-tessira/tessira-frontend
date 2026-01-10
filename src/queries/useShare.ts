import { useQuery } from "@tanstack/react-query";
import { ShareTimelineResponse } from "@/lib/types";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type ShareError = {
  status: number;
  message: string;
};

export type ShareParams = {
  token: string;
  from: string;
  to: string;
};

const buildUrl = (path: string): string => {
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not set");
  }
  return `${baseUrl}${path}`;
};

const publicFetch = async <T,>(path: string): Promise<T> => {
  const response = await fetch(buildUrl(path));
  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data?.message ?? data?.error ?? message;
    } catch {
      // Ignore JSON parse errors.
    }
    const error: ShareError = { status: response.status, message };
    throw error;
  }
  return response.json() as Promise<T>;
};

const buildShareUrl = (params: ShareParams) => {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
  });
  return `/api/shares/public/${params.token}?${query.toString()}`;
};

export const shareQueryKey = (params: ShareParams) => [
  "share",
  params.token,
  params.from,
  params.to,
];

export const useShare = (params: ShareParams) => {
  return useQuery<ShareTimelineResponse, ShareError>({
    queryKey: shareQueryKey(params),
    queryFn: () => publicFetch<ShareTimelineResponse>(buildShareUrl(params)),
    enabled: !!params.token && !!params.from && !!params.to,
    retry: false,
  });
};
