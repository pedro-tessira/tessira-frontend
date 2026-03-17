export interface SharedEmployee {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  /** If true, excluded from capacity planning & initiative allocation (e.g. management). */
  excludeFromCapacity?: boolean;
}

export const sharedEmployees: SharedEmployee[] = [
  { id: "emp-001", name: "Sarah Chen", teamId: "team-001", teamName: "Platform Core" },
  { id: "emp-002", name: "Marcus Rivera", teamId: "team-002", teamName: "Backend Services" },
  { id: "emp-003", name: "Aisha Patel", teamId: "team-003", teamName: "Frontend", excludeFromCapacity: true },
  { id: "emp-004", name: "Jonas Eriksson", teamId: "team-001", teamName: "Platform Core" },
  { id: "emp-005", name: "Mei Tanaka", teamId: "team-002", teamName: "Backend Services" },
  { id: "emp-006", name: "Alex Novak", teamId: "team-004", teamName: "Data & Observability" },
  { id: "emp-007", name: "Priya Sharma", teamId: "team-003", teamName: "Frontend" },
  { id: "emp-008", name: "David Okafor", teamId: "team-005", teamName: "Engineering Leadership", excludeFromCapacity: true },
  { id: "emp-009", name: "Lin Zhou", teamId: "team-005", teamName: "Engineering Leadership", excludeFromCapacity: true },
  { id: "emp-010", name: "Carlos Mendez", teamId: "team-004", teamName: "Data & Observability" },
  { id: "emp-011", name: "Emma Wilson", teamId: "team-003", teamName: "Frontend" },
  { id: "emp-012", name: "Tomasz Kowalski", teamId: "team-004", teamName: "Data & Observability" },
];
