import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { TeamEmployeeDto, TeamMembershipDto } from "@/lib/types";

const buildEmployeesUrl = (teamId: string, search: string) => {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  const query = params.toString();
  return `/api/teams/${teamId}/members${query ? `?${query}` : ""}`;
};

export const employeesQueryKey = (teamId: string, search: string) => ["employees", teamId, search];

const mapMembershipToEmployee = (teamId: string) => (member: TeamMembershipDto): TeamEmployeeDto => ({
  id: member.employeeId,
  displayName: member.employeeFullName,
  email: member.employeeEmail,
  teamId,
  membershipId: member.id,
  roleInTeam: member.roleInTeam,
  isOwner: member.roleInTeam === "OWNER",
});

export const employeesQueryOptions = (teamId: string, search: string): UseQueryOptions<TeamEmployeeDto[]> => ({
  queryKey: employeesQueryKey(teamId, search),
  queryFn: async () => {
    const members = await apiFetch<TeamMembershipDto[]>(buildEmployeesUrl(teamId, search));
    return members.map(mapMembershipToEmployee(teamId));
  },
  enabled: !!teamId,
});

export const useEmployees = (teamId: string, search: string) => {
  return useQuery<TeamEmployeeDto[]>({
    ...employeesQueryOptions(teamId, search),
  });
};
