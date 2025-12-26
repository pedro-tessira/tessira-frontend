import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { TeamDto } from "@/lib/types";

export const teamsQueryKey = ["teams"];

export const useTeams = () => {
  return useQuery<TeamDto[]>({
    queryKey: teamsQueryKey,
    queryFn: () => apiFetch<TeamDto[]>("/api/teams"),
  });
};
