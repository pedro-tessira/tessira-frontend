import { useState } from 'react';
import { ChevronDown, LogOut, Share2, Users } from 'lucide-react';
import { TeamDto, TeamEmployeeDto, TimelineEvent } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ManageTeamsModal } from './ManageTeamsModal';
import { ShareViewModal } from './ShareViewModal';

interface HeaderBarProps {
  teams: TeamDto[];
  employees: TeamEmployeeDto[];
  events: TimelineEvent[];
  selectedTeamId: string;
  onTeamChange: (teamId: string) => void;
  onAddEmployee: (name: string, teamId: string) => void;
  onRemoveEmployee: (teamId: string, membershipId: string) => void;
  onUpdateEmployee: (teamId: string, membershipId: string, name: string, isOwner?: boolean) => void;
  onAddTeam: (name: string) => void;
  onUpdateTeam: (teamId: string, name: string) => void;
  onRemoveTeam: (teamId: string) => void;
  onLogout: () => void;
}

export function HeaderBar({
  teams,
  employees,
  events,
  selectedTeamId,
  onTeamChange,
  onAddEmployee,
  onRemoveEmployee,
  onUpdateEmployee,
  onAddTeam,
  onUpdateTeam,
  onRemoveTeam,
  onLogout,
}: HeaderBarProps) {
  const [showManageModal, setShowManageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-6 shrink-0">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TH</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">Horizon</h1>
        </div>

        {/* Team Selector */}
        <div className="flex items-center gap-2 ml-8">
          <div className="relative">
            <select
              value={selectedTeamId}
              onChange={(e) => onTeamChange(e.target.value)}
              className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-sm font-medium text-foreground cursor-pointer hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  Team: {team.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setShowManageModal(true)}
                  className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Users className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Teams</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share View
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this view with others</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onLogout}
                  className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <ManageTeamsModal
        open={showManageModal}
        onOpenChange={setShowManageModal}
        teams={teams}
        employees={employees}
        events={events}
        selectedTeamId={selectedTeamId}
        onAddEmployee={onAddEmployee}
        onRemoveEmployee={onRemoveEmployee}
        onUpdateEmployee={onUpdateEmployee}
        onAddTeam={onAddTeam}
        onUpdateTeam={onUpdateTeam}
        onRemoveTeam={onRemoveTeam}
      />

      <ShareViewModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        teamId={selectedTeamId}
      />
    </>
  );
}
