import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { EventTypeDto, TeamDto, TeamEmployeeDto, TimelineEvent } from "@/lib/types";
import { clearToken } from "@/lib/auth";

interface MainLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  teams?: TeamDto[];
  employees?: TeamEmployeeDto[];
  events?: TimelineEvent[];
  eventTypes?: EventTypeDto[];
  selectedTeamId?: string;
  onTeamChange?: (teamId: string) => void;
  onAddEmployee?: (name: string, teamId: string) => void;
  onRemoveEmployee?: (teamId: string, membershipId: string) => void;
  onUpdateEmployee?: (teamId: string, membershipId: string, name: string, isOwner?: boolean) => void;
  onAddTeam?: (name: string) => void;
  onUpdateTeam?: (teamId: string, name: string) => void;
  onRemoveTeam?: (teamId: string) => void;
  onLogout?: () => void;
}

export function MainLayout({
  children,
  fullWidth = false,
  teams,
  employees,
  events,
  eventTypes,
  selectedTeamId,
  onTeamChange,
  onAddEmployee,
  onRemoveEmployee,
  onUpdateEmployee,
  onAddTeam,
  onUpdateTeam,
  onRemoveTeam,
  onLogout,
}: MainLayoutProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    clearToken();
    window.location.assign("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        teams={teams}
        employees={employees}
        events={events}
        eventTypes={eventTypes}
        selectedTeamId={selectedTeamId}
        onTeamChange={onTeamChange}
        onAddEmployee={onAddEmployee}
        onRemoveEmployee={onRemoveEmployee}
        onUpdateEmployee={onUpdateEmployee}
        onAddTeam={onAddTeam}
        onUpdateTeam={onUpdateTeam}
        onRemoveTeam={onRemoveTeam}
        onLogout={handleLogout}
      />
      <main className={fullWidth ? "flex-1 flex flex-col overflow-hidden" : "flex-1 container mx-auto p-6"}>
        {children}
      </main>
    </div>
  );
}
