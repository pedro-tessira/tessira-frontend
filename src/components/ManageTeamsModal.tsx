import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Pencil, Check, Crown, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TeamDto, TeamEmployeeDto, TimelineEvent } from '@/lib/types';
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

interface ManageTeamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: TeamDto[];
  employees: TeamEmployeeDto[];
  events: TimelineEvent[];
  selectedTeamId: string;
  onAddEmployee: (name: string, teamId: string) => void;
  onRemoveEmployee: (employeeId: string) => void;
  onUpdateEmployee: (employeeId: string, name: string, isOwner?: boolean) => void;
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

  const managingTeam = teams.find(t => t.id === managingTeamId);
  const teamEmployees = employees.filter(e => e.teamId === managingTeamId);
  const teamEvents = events.filter(e => {
    const employee = employees.find(emp => emp.id === e.employeeId);
    return employee?.teamId === managingTeamId;
  });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setManagingTeamId(selectedTeamId);
      setIsAddingNewTeam(false);
      setNewTeamName('');
      setIsEditingTeamName(false);
    }
  }, [open, selectedTeamId]);

  // Update editing team name when team changes
  useEffect(() => {
    if (managingTeam) {
      setEditingTeamName(managingTeam.name);
    }
  }, [managingTeam]);

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      onAddTeam(newTeamName.trim());
      setNewTeamName('');
      setIsAddingNewTeam(false);
    }
  };

  const handleSaveTeamName = () => {
    if (managingTeamId && editingTeamName.trim()) {
      onUpdateTeam(managingTeamId, editingTeamName.trim());
      setIsEditingTeamName(false);
    }
  };

  const handleDeleteTeam = () => {
    if (managingTeamId && teams.length > 1) {
      onRemoveTeam(managingTeamId);
      const remainingTeam = teams.find(t => t.id !== managingTeamId);
      if (remainingTeam) {
        setManagingTeamId(remainingTeam.id);
      }
      setDeleteConfirmOpen(false);
    }
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      onAddEmployee(newMemberName.trim(), managingTeamId);
      setNewMemberName('');
    }
  };

  const handleStartMemberEdit = (employee: TeamEmployeeDto) => {
    setEditingMemberId(employee.id);
    setEditingMemberName(employee.displayName);
  };

  const handleSaveMemberEdit = () => {
    if (editingMemberId && editingMemberName.trim()) {
      const employee = employees.find(e => e.id === editingMemberId);
      onUpdateEmployee(editingMemberId, editingMemberName.trim(), employee?.isOwner);
      setEditingMemberId(null);
      setEditingMemberName('');
    }
  };

  const handleToggleOwner = (employee: TeamEmployeeDto) => {
    onUpdateEmployee(employee.id, employee.displayName, !employee.isOwner);
  };

  const getTeamEventCount = () => {
    return teamEvents.length;
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
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setIsEditingTeamName(true)}
                      >
                        <span className="text-foreground">{managingTeam.name}</span>
                        <Pencil className="w-4 h-4 text-muted-foreground" />
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
                              {owner.displayName}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Team */}
                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={teams.length === 1}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Team
                    </Button>
                    {teams.length === 1 && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Cannot delete the last team.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="mt-4 space-y-4">
                {/* Add new member */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new member..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddMember} size="sm" disabled={!newMemberName.trim()}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

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
                          {employee.initials}
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
                              <span className="text-sm text-foreground">{employee.displayName}</span>
                              {employee.isOwner && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">
                                  <Crown className="w-3 h-3" />
                                  Owner
                                </span>
                              )}
                            </div>
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
                                      onClick={() => onRemoveEmployee(employee.id)}
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
