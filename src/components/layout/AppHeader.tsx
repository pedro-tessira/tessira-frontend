import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User, Calendar, Shield, HelpCircle, Users, Share2, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMe } from "@/queries/useMe";
import { EventTypeDto, TeamDto, TeamEmployeeDto, TimelineEvent } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ManageTeamsModal } from "@/components/ManageTeamsModal";
import { ShareViewModal } from "@/components/ShareViewModal";
import { useTheme } from "next-themes";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const navItems = [
  { label: "Timeline", href: "/", icon: Calendar },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true },
  { label: "Help", href: "/help", icon: HelpCircle },
];

interface AppHeaderProps {
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

export function AppHeader({
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
}: AppHeaderProps) {
  const location = useLocation();
  const { data: me } = useMe();
  const { theme = "system", setTheme } = useTheme();
  const userName = me?.displayName ?? me?.email ?? "User";
  const isAdmin = me?.role === "ADMIN";
  const canManageTeams = me?.role !== "USER";
  const [showManageModal, setShowManageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const isTimeline = location.pathname === "/";
  const showTeamControls = isTimeline && teams && selectedTeamId && onTeamChange;

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Horizon" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-semibold text-lg text-foreground">Horizon</span>
          </Link>

          <nav className="flex items-center gap-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {showTeamControls && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <div className="relative">
                <select
                  value={selectedTeamId}
                  onChange={(e) => onTeamChange(e.target.value)}
                  className="appearance-none bg-card border border-border rounded-lg px-4 py-1.5 pr-10 text-sm font-medium text-foreground cursor-pointer hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      Team: {team.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              {canManageTeams && (
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
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showTeamControls && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
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
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {userName}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <span className="flex items-center gap-2">
                        <Moon className="w-3.5 h-3.5" />
                        Dark
                      </span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive cursor-pointer"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {showTeamControls &&
        teams &&
        employees &&
        events &&
        eventTypes &&
        onAddEmployee &&
        onRemoveEmployee &&
        onUpdateEmployee &&
        onAddTeam &&
        onUpdateTeam &&
        onRemoveTeam && (
          <>
            {canManageTeams && (
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
            )}
            <ShareViewModal
              open={showShareModal}
              onOpenChange={setShowShareModal}
              teamId={selectedTeamId}
              employees={employees.filter((employee) => employee.teamId === selectedTeamId)}
              eventTypes={eventTypes}
            />
          </>
        )}
    </>
  );
}
