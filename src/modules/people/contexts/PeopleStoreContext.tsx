import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Employee, Team, TeamMembership, EmployeeStatus } from "../types";
import { MOCK_EMPLOYEES, MOCK_TEAMS, MOCK_MEMBERSHIPS } from "../data";

// ── Input types ─────────────────────────────────────────────
export interface EmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  department: string;
  status: EmployeeStatus;
  country: string;
  countryCode: string;
  timezone: string;
  startDate: string;
  managerId: string | null;
  excludeFromCapacity?: boolean;
}

export interface TeamInput {
  name: string;
  description: string;
  leadId: string;
  tags: string[];
}

// ── Context type ────────────────────────────────────────────
interface PeopleStore {
  employees: Employee[];
  teams: Team[];
  memberships: TeamMembership[];

  // Employee CRUD
  addEmployee: (input: EmployeeInput) => Employee;
  updateEmployee: (id: string, input: Partial<EmployeeInput>) => void;
  deleteEmployee: (id: string) => void;
  changeEmployeeStatus: (id: string, status: EmployeeStatus) => void;

  // Team CRUD
  addTeam: (input: TeamInput) => Team;
  updateTeam: (id: string, input: Partial<TeamInput>) => void;
  deleteTeam: (id: string) => void;

  // Membership management
  addMembership: (employeeId: string, teamId: string, role: TeamMembership["role"]) => void;
  removeMembership: (membershipId: string) => void;
  updateMembershipRole: (membershipId: string, role: TeamMembership["role"]) => void;

  // Derived helpers
  getEmployee: (id: string) => Employee | null;
  getTeam: (id: string) => Team | null;
  getTeamMembers: (teamId: string) => (TeamMembership & { employee: Employee })[];
  getEmployeeMemberships: (employeeId: string) => (TeamMembership & { team: Team })[];
}

const PeopleStoreContext = createContext<PeopleStore | null>(null);

export function PeopleStoreProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([...MOCK_EMPLOYEES]);
  const [teams, setTeams] = useState<Team[]>([...MOCK_TEAMS]);
  const [memberships, setMemberships] = useState<TeamMembership[]>([...MOCK_MEMBERSHIPS]);

  // ── Employee CRUD ───────────────────────────────────────
  const addEmployee = useCallback((input: EmployeeInput): Employee => {
    const manager = input.managerId ? MOCK_EMPLOYEES.find((e) => e.id === input.managerId) : null;
    const emp: Employee = {
      id: `emp-${Date.now()}`,
      ...input,
      managerName: manager ? `${manager.firstName} ${manager.lastName}` : null,
      avatarUrl: null,
      teamIds: [],
    };
    setEmployees((prev) => [...prev, emp]);
    return emp;
  }, []);

  const updateEmployee = useCallback((id: string, input: Partial<EmployeeInput>) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, ...input };
        if (input.managerId !== undefined) {
          const mgr = input.managerId ? prev.find((emp) => emp.id === input.managerId) ?? null : null;
          updated.managerName = mgr ? `${mgr.firstName} ${mgr.lastName}` : null;
        }
        return updated;
      })
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setMemberships((prev) => prev.filter((m) => m.employeeId !== id));
  }, []);

  const changeEmployeeStatus = useCallback((id: string, status: EmployeeStatus) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  // ── Team CRUD ───────────────────────────────────────────
  const addTeam = useCallback((input: TeamInput): Team => {
    const lead = employees.find((e) => e.id === input.leadId);
    const team: Team = {
      id: `team-${Date.now()}`,
      name: input.name,
      slug: input.name.toLowerCase().replace(/\s+/g, "-"),
      description: input.description,
      leadId: input.leadId,
      leadName: lead ? `${lead.firstName} ${lead.lastName}` : "",
      parentTeamId: null,
      memberCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      tags: input.tags,
    };
    setTeams((prev) => [...prev, team]);
    return team;
  }, [employees]);

  const updateTeam = useCallback((id: string, input: Partial<TeamInput>) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...input };
        if (input.leadId) {
          const lead = employees.find((e) => e.id === input.leadId);
          updated.leadName = lead ? `${lead.firstName} ${lead.lastName}` : t.leadName;
        }
        if (input.name) {
          updated.slug = input.name.toLowerCase().replace(/\s+/g, "-");
        }
        return updated;
      })
    );
  }, [employees]);

  const deleteTeam = useCallback((id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setMemberships((prev) => prev.filter((m) => m.teamId !== id));
  }, []);

  // ── Membership management ──────────────────────────────
  const addMembership = useCallback((employeeId: string, teamId: string, role: TeamMembership["role"]) => {
    const exists = memberships.some((m) => m.employeeId === employeeId && m.teamId === teamId);
    if (exists) return;
    const membership: TeamMembership = {
      id: `m-${Date.now()}`,
      employeeId,
      teamId,
      role,
      since: new Date().toISOString().slice(0, 10),
    };
    setMemberships((prev) => [...prev, membership]);
  }, [memberships]);

  const removeMembership = useCallback((membershipId: string) => {
    setMemberships((prev) => prev.filter((m) => m.id !== membershipId));
  }, []);

  const updateMembershipRole = useCallback((membershipId: string, role: TeamMembership["role"]) => {
    setMemberships((prev) => prev.map((m) => (m.id === membershipId ? { ...m, role } : m)));
  }, []);

  // ── Derived helpers ────────────────────────────────────
  const getEmployee = useCallback((id: string) => employees.find((e) => e.id === id) ?? null, [employees]);
  const getTeam = useCallback((id: string) => teams.find((t) => t.id === id) ?? null, [teams]);

  const getTeamMembers = useCallback(
    (teamId: string) =>
      memberships
        .filter((m) => m.teamId === teamId)
        .map((m) => ({ ...m, employee: employees.find((e) => e.id === m.employeeId)! }))
        .filter((m) => m.employee),
    [memberships, employees]
  );

  const getEmployeeMemberships = useCallback(
    (employeeId: string) =>
      memberships
        .filter((m) => m.employeeId === employeeId)
        .map((m) => ({ ...m, team: teams.find((t) => t.id === m.teamId)! }))
        .filter((m) => m.team),
    [memberships, teams]
  );

  return (
    <PeopleStoreContext.Provider
      value={{
        employees, teams, memberships,
        addEmployee, updateEmployee, deleteEmployee, changeEmployeeStatus,
        addTeam, updateTeam, deleteTeam,
        addMembership, removeMembership, updateMembershipRole,
        getEmployee, getTeam, getTeamMembers, getEmployeeMemberships,
      }}
    >
      {children}
    </PeopleStoreContext.Provider>
  );
}

export function usePeopleStore() {
  const ctx = useContext(PeopleStoreContext);
  if (!ctx) throw new Error("usePeopleStore must be used within PeopleStoreProvider");
  return ctx;
}
