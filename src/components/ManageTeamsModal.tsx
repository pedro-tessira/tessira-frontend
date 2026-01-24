import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Plus, Trash2, Pencil, Check, Crown, Users, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { EmployeeSearchDto, TeamDto, TeamEmployeeDto, TimelineEvent } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEmployeeSearch } from '@/queries/useEmployeeSearch';

interface ManageTeamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: TeamDto[];
  employees: TeamEmployeeDto[];
  events: TimelineEvent[];
  selectedTeamId: string;
  currentUserId?: string | null;
  currentUserEmployeeId?: string | null;
  currentUserRole?: string;
  onAddEmployee: (name: string, teamId: string) => void;
  onRemoveEmployee: (teamId: string, membershipId: string) => void;
  onUpdateEmployee: (teamId: string, membershipId: string, name: string, isOwner?: boolean) => void;
  onAddTeam: (name: string) => void;
  onUpdateTeam: (teamId: string, name: string) => void;
  onRemoveTeam: (teamId: string) => void;
}

export function ManageTeamsModal({
  open,
  onOpenChange,
  teams,
  employees,
  events,
  selectedTeamId,
  currentUserId,
  currentUserEmployeeId,
  currentUserRole,
  onAddEmployee,
  onRemoveEmployee,
  onUpdateEmployee,
  onAddTeam,
  onUpdateTeam,
  onRemoveTeam,
}: ManageTeamsModalProps) {
  const [managingTeamId, setManagingTeamId] = useState<string>(selectedTeamId);
  const [isAddingNewTeam, setIsAddingNewTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [editingTeamName, setEditingTeamName] = useState('');
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberSearchResults, setMemberSearchResults] = useState<EmployeeSearchDto[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);
  const [highlightedMemberIndex, setHighlightedMemberIndex] = useState(-1);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchRequestIdRef = useRef(0);
  const searchEmployees = useEmployeeSearch();

  const managingTeam = teams.find(t => t.id === managingTeamId);
  const teamEmployees = employees.filter(e => e.teamId === managingTeamId);
  const teamEvents = events.filter(e => {
    const employee = employees.find(emp => emp.id === e.employeeId);
    return employee?.teamId === managingTeamId;
  });
  const getEmployeeName = (employee?: { displayName?: string; fullName?: string } | null) =>
    employee?.displayName ?? employee?.fullName ?? "Unknown";

  const getInitials = (name?: string | null) => {
    if (!name?.trim()) return "--";
    return name
      .trim()
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setManagingTeamId(selectedTeamId);
      setIsAddingNewTeam(false);
      setNewTeamName('');
      setIsEditingTeamName(false);
      setMemberSearchResults([]);
      setShowMemberSuggestions(false);
    }
  }, [open, selectedTeamId]);

  // Update editing team name when team changes
  useEffect(() => {
    if (managingTeam) {
      setEditingTeamName(managingTeam.name);
    }
  }, [managingTeam]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setHighlightedMemberIndex(memberSearchResults.length > 0 ? 0 : -1);
  }, [memberSearchResults]);

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      onAddTeam(newTeamName.trim());
      setNewTeamName('');
      setIsAddingNewTeam(false);
    }
  };

  const canEditSelectedTeam = useMemo(() => {
    if (!managingTeam) return false;
    if (currentUserRole === "ADMIN") return true;
    if (currentUserRole === "MANAGER" && currentUserId) {
      return managingTeam.createdByUserId === currentUserId;
    }
    if (currentUserEmployeeId) {
      return teamEmployees.some(employee => employee.id === currentUserEmployeeId && employee.isOwner);
    }
    return false;
  }, [currentUserEmployeeId, currentUserId, currentUserRole, managingTeam, teamEmployees]);

  const handleSaveTeamName = () => {
    if (!canEditSelectedTeam) return;
    if (managingTeamId && editingTeamName.trim()) {
      onUpdateTeam(managingTeamId, editingTeamName.trim());
      setIsEditingTeamName(false);
    }
  };

  const canDeleteSelectedTeam = useMemo(() => {
    if (!managingTeam) return false;
    if (currentUserRole === "ADMIN") return true;
    if (currentUserRole === "MANAGER" && currentUserId) {
      return managingTeam.createdByUserId === currentUserId;
    }
    return false;
  }, [currentUserId, currentUserRole, managingTeam]);

  const handleDeleteTeam = () => {
    if (!managingTeamId || !canDeleteSelectedTeam) return;
    onRemoveTeam(managingTeamId);
    const remainingTeam = teams.find(t => t.id !== managingTeamId);
    setManagingTeamId(remainingTeam?.id ?? '');
    setDeleteConfirmOpen(false);
  };

  const handleAddMember = () => {
    if (!canEditSelectedTeam) return;
    if (newMemberName.trim()) {
      onAddEmployee(newMemberName.trim(), managingTeamId);
      setNewMemberName('');
      setMemberSearchResults([]);
      setShowMemberSuggestions(false);
    }
  };

  const handleStartMemberEdit = (employee: TeamEmployeeDto) => {
    if (!canEditSelectedTeam) return;
    setEditingMemberId(employee.id);
    setEditingMemberName(getEmployeeName(employee));
  };

  const handleSaveMemberEdit = () => {
    if (!canEditSelectedTeam) return;
    if (editingMemberId && editingMemberName.trim()) {
      const employee = employees.find(e => e.id === editingMemberId);
      if (employee?.membershipId) {
        onUpdateEmployee(managingTeamId, employee.membershipId, editingMemberName.trim(), employee?.isOwner);
      }
      setEditingMemberId(null);
      setEditingMemberName('');
    }
  };

  const handleToggleOwner = (employee: TeamEmployeeDto) => {
    if (!canEditSelectedTeam) return;
    if (!employee.membershipId) return;
    onUpdateEmployee(managingTeamId, employee.membershipId, getEmployeeName(employee), !employee.isOwner);
  };

  const getTeamEventCount = () => {
    return teamEvents.length;
  };

  const handleMemberSearch = (value: string) => {
    setNewMemberName(value);
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    const query = value.trim();
    if (query.length < 2) {
      setMemberSearchResults([]);
      setHighlightedMemberIndex(-1);
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;
    setIsSearchingMembers(true);
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const results = await searchEmployees(query);
        if (searchRequestIdRef.current !== requestId) return;
        const filtered = results.filter(
          result => !teamEmployees.some(member => member.id === result.id)
        );
        setMemberSearchResults(filtered);
      } catch {
        if (searchRequestIdRef.current !== requestId) return;
        setMemberSearchResults([]);
      } finally {
        if (searchRequestIdRef.current === requestId) {
          setIsSearchingMembers(false);
        }
      }
    }, 250);
  };

  const handleSelectMember = (employee: EmployeeSearchDto) => {
    const identifier = employee.email || getEmployeeName(employee);
    onAddEmployee(identifier, managingTeamId);
    setNewMemberName('');
    setMemberSearchResults([]);
    setShowMemberSuggestions(false);
    setHighlightedMemberIndex(-1);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] bg-card border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Manage Teams</DialogTitle>
          </DialogHeader>

          {/* Team Selector */}
          <div className="flex items-center gap-2 pb-2">
            <Select value={managingTeamId} onValueChange={setManagingTeamId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{team.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ({employees.filter(e => e.teamId === team.id).length})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNewTeam(true)}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Team
            </Button>
          </div>

          {/* New Team Input */}
          {isAddingNewTeam && (
            <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Input
                placeholder="Enter team name..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTeam();
                  if (e.key === 'Escape') {
                    setIsAddingNewTeam(false);
                    setNewTeamName('');
                  }
                }}
                autoFocus
                className="flex-1"
              />
              <Button size="sm" onClick={handleCreateTeam} disabled={!newTeamName.trim()}>
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingNewTeam(false);
                  setNewTeamName('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Separator />

          {managingTeam && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="members">Members ({teamEmployees.length})</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="space-y-4">
                  {/* Team Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Team Name</label>
                    {isEditingTeamName ? (
                      <div className="flex gap-2">
                        <Input
                          value={editingTeamName}
                          onChange={(e) => setEditingTeamName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTeamName();
                            if (e.key === 'Escape') {
                              setIsEditingTeamName(false);
                              setEditingTeamName(managingTeam.name);
                            }
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveTeamName}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsEditingTeamName(false);
                            setEditingTeamName(managingTeam.name);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg bg-muted/50 transition-colors ${
                          canEditSelectedTeam ? "cursor-pointer hover:bg-muted" : ""
                        }`}
                        onClick={() => {
                          if (!canEditSelectedTeam) return;
                          setIsEditingTeamName(true);
                        }}
                      >
                        <span className="text-foreground">{managingTeam.name}</span>
                        {canEditSelectedTeam && <Pencil className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    )}
                  </div>

                  {/* Team Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-semibold text-foreground">{teamEmployees.length}</div>
                      <div className="text-sm text-muted-foreground">Members</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-semibold text-foreground">{getTeamEventCount()}</div>
                      <div className="text-sm text-muted-foreground">Events</div>
                    </div>
                  </div>

                  {/* Team Owners */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Team Owners</label>
                    <div className="p-3 rounded-lg bg-muted/50">
                      {teamEmployees.filter(e => e.isOwner).length === 0 ? (
                        <span className="text-sm text-muted-foreground">No owners assigned. Go to Members tab to assign owners.</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {teamEmployees.filter(e => e.isOwner).map(owner => (
                            <div
                              key={owner.id}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                            >
                              <Crown className="w-3 h-3" />
                              {getEmployeeName(owner)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Created By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Team Created By</label>
                    <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                      {managingTeam.createdByName
                        ? `${managingTeam.createdByName}${managingTeam.createdByEmail ? ` (${managingTeam.createdByEmail})` : ""}`
                        : managingTeam.createdByEmail ?? managingTeam.createdByUserId ?? "—"}
                    </div>
                  </div>

                  {/* Delete Team */}
                  {canDeleteSelectedTeam && (
                    <div className="pt-4 border-t border-border">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Team
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="mt-4 space-y-4">
                {/* Add new member */}
                {canEditSelectedTeam && (
                  <div className="flex">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Add new member..."
                        value={newMemberName}
                        onChange={(e) => handleMemberSearch(e.target.value)}
                        onFocus={() => setShowMemberSuggestions(true)}
                        onBlur={() => {
                          window.setTimeout(() => setShowMemberSuggestions(false), 100);
                        }}
                        onKeyDown={(event) => {
                          if (!showMemberSuggestions) return;
                          if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            setHighlightedMemberIndex((prev) => {
                              if (memberSearchResults.length === 0) return -1;
                              return prev >= memberSearchResults.length - 1 ? 0 : prev + 1;
                            });
                          }
                          if (event.key === 'ArrowUp') {
                            event.preventDefault();
                            setHighlightedMemberIndex((prev) => {
                              if (memberSearchResults.length === 0) return -1;
                              return prev <= 0 ? memberSearchResults.length - 1 : prev - 1;
                            });
                          }
                          if (event.key === 'Enter') {
                            if (highlightedMemberIndex < 0) return;
                            const selected = memberSearchResults[highlightedMemberIndex];
                            if (!selected) return;
                            event.preventDefault();
                            handleSelectMember(selected);
                          }
                          if (event.key === 'Escape') {
                            setShowMemberSuggestions(false);
                          }
                        }}
                        className="flex-1"
                      />
                      {showMemberSuggestions && (
                        <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                          <div className="max-h-56 overflow-y-auto py-1">
                            {newMemberName.trim().length < 2 && (
                              <div className="px-3 py-2 text-xs text-muted-foreground">
                                Type at least 2 characters to search.
                              </div>
                            )}
                            {isSearchingMembers && (
                              <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Searching...
                              </div>
                            )}
                            {!isSearchingMembers && newMemberName.trim().length >= 2 && memberSearchResults.length === 0 && (
                              <div className="px-3 py-2 text-xs text-muted-foreground">
                                No matches found
                              </div>
                            )}
                            {!isSearchingMembers && memberSearchResults.map((employee, index) => (
                              <button
                                key={employee.id}
                                type="button"
                                onMouseDown={() => handleSelectMember(employee)}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                  index === highlightedMemberIndex ? 'bg-muted' : 'hover:bg-muted'
                                }`}
                              >
                                <div className="font-medium text-foreground">{getEmployeeName(employee)}</div>
                                <div className="text-xs text-muted-foreground">{employee.email}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Member list */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {teamEmployees.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No members in this team yet.
                    </div>
                  ) : (
                    teamEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                          {getInitials(getEmployeeName(employee))}
                        </div>

                        {editingMemberId === employee.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <Input
                              value={editingMemberName}
                              onChange={(e) => setEditingMemberName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveMemberEdit();
                                if (e.key === 'Escape') {
                                  setEditingMemberId(null);
                                  setEditingMemberName('');
                                }
                              }}
                              className="h-8"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={handleSaveMemberEdit} className="h-8 w-8 p-0">
                              <Check className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingMemberId(null);
                                setEditingMemberName('');
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-sm text-foreground">{getEmployeeName(employee)}</span>
                              {employee.isOwner && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">
                                  <Crown className="w-3 h-3" />
                                  Owner
                                </span>
                              )}
                            </div>
                            {canEditSelectedTeam && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleOwner(employee)}
                                        className={`h-8 w-8 p-0 ${employee.isOwner ? 'text-primary' : ''}`}
                                      >
                                        <Crown className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{employee.isOwner ? 'Remove owner' : 'Make owner'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleStartMemberEdit(employee)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit member</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          if (!employee.membershipId) return;
                                          onRemoveEmployee(managingTeamId, employee.membershipId);
                                        }}
                                        className="h-8 w-8 p-0 hover:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Remove member</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Team Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{managingTeam?.name}"? This will also remove all {teamEmployees.length} members and their events. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
