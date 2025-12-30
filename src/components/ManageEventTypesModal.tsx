import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Pencil, Check, Lock, User, Users, Building2, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TeamDto, TeamEmployeeDto, TimelineEvent, EventTypeConfig, EventLevel } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';


const colorOptions = [
  { value: 'bg-emerald-500', label: 'Green' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-amber-500', label: 'Orange' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-cyan-500', label: 'Cyan' },
  { value: 'bg-indigo-500', label: 'Indigo' },
];

const levelLabels: Record<EventLevel, { label: string; icon: React.ReactNode; description: string }> = {
  individual: { label: 'Individual', icon: <User className="w-3 h-3" />, description: 'User adds event for themselves' },
  team: { label: 'Team', icon: <Users className="w-3 h-3" />, description: 'Shown on Company row for the team' },
  company: { label: 'Company', icon: <Building2 className="w-3 h-3" />, description: 'Shared across multiple teams' },
};

const deriveEventTypeCode = (label: string) => {
  return label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

interface ManageEventTypesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: TeamDto[];
  employees: TeamEmployeeDto[];
  events: TimelineEvent[];
  eventTypeConfigs: EventTypeConfig[];
  currentUserId?: string; // To determine owned teams
  isAdmin?: boolean; // To show global option
  onAddEventType: (eventType: Omit<EventTypeConfig, 'id'>) => void;
  onUpdateEventType: (eventTypeId: string, updates: Partial<EventTypeConfig>) => void;
  onRemoveEventType: (eventTypeId: string) => void;
}

export function ManageEventTypesModal({
  open,
  onOpenChange,
  teams,
  employees,
  events,
  eventTypeConfigs,
  currentUserId,
  isAdmin = true, // Default to admin for now
  onAddEventType,
  onUpdateEventType,
  onRemoveEventType,
}: ManageEventTypesModalProps) {
  // Event type editing state
  const [editingEventTypeId, setEditingEventTypeId] = useState<string | null>(null);
  const [editingEventTypeLabel, setEditingEventTypeLabel] = useState('');
  const [editingEventTypeCode, setEditingEventTypeCode] = useState('');
  const [editingEventTypeColor, setEditingEventTypeColor] = useState('');
  const [editingEventTypeLevel, setEditingEventTypeLevel] = useState<EventLevel>('individual');
  const [editingEventTypeTeamIds, setEditingEventTypeTeamIds] = useState<string[]>([]);
  const [editingEventTypeIsGlobal, setEditingEventTypeIsGlobal] = useState(false);
  const [editingCodeTouched, setEditingCodeTouched] = useState(false);
  
  const [isAddingEventType, setIsAddingEventType] = useState(false);
  const [newEventTypeLabel, setNewEventTypeLabel] = useState('');
  const [newEventTypeCode, setNewEventTypeCode] = useState('');
  const [newEventTypeColor, setNewEventTypeColor] = useState('bg-blue-500');
  const [newEventTypeLevel, setNewEventTypeLevel] = useState<EventLevel>('individual');
  const [newEventTypeTeamIds, setNewEventTypeTeamIds] = useState<string[]>([]);
  const [newEventTypeIsGlobal, setNewEventTypeIsGlobal] = useState(false);
  const [newCodeTouched, setNewCodeTouched] = useState(false);
  
  const [deleteEventTypeConfirmOpen, setDeleteEventTypeConfirmOpen] = useState(false);
  const [eventTypeToDelete, setEventTypeToDelete] = useState<string | null>(null);

  // Get teams where current user is owner
  const ownedTeams = employees
    .filter(e => e.isOwner && (currentUserId ? e.id === currentUserId : true))
    .map(e => teams.find(t => t.id === e.teamId))
    .filter((t): t is TeamDto => t !== undefined);
  
  // For demo, show all teams as available for selection
  const availableTeams = teams;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setEditingEventTypeId(null);
      setIsAddingEventType(false);
      setNewEventTypeLabel('');
      setNewEventTypeCode('');
      setNewEventTypeColor('bg-blue-500');
      setNewEventTypeLevel('individual');
      setNewEventTypeTeamIds([]);
      setNewEventTypeIsGlobal(false);
      setNewCodeTouched(false);
    }
  }, [open]);

  useEffect(() => {
    if (!newCodeTouched) {
      setNewEventTypeCode(deriveEventTypeCode(newEventTypeLabel));
    }
  }, [newCodeTouched, newEventTypeLabel]);

  useEffect(() => {
    if (!editingCodeTouched) {
      setEditingEventTypeCode(deriveEventTypeCode(editingEventTypeLabel));
    }
  }, [editingCodeTouched, editingEventTypeLabel]);

  // Event type handlers
  const handleStartEventTypeEdit = (eventType: EventTypeConfig) => {
    setEditingEventTypeId(eventType.id);
    setEditingEventTypeLabel(eventType.label);
    setEditingEventTypeCode(eventType.code);
    setEditingEventTypeColor(eventType.color);
    setEditingEventTypeLevel(eventType.level);
    setEditingEventTypeTeamIds(eventType.teamIds || []);
    setEditingEventTypeIsGlobal(eventType.isGlobal || false);
    setEditingCodeTouched(false);
  };

  const handleSaveEventTypeEdit = () => {
    if (editingEventTypeId && editingEventTypeLabel.trim()) {
      onUpdateEventType(editingEventTypeId, {
        label: editingEventTypeLabel.trim(),
        code: editingEventTypeCode.trim() || deriveEventTypeCode(editingEventTypeLabel),
        color: editingEventTypeColor,
        level: editingEventTypeLevel,
        teamIds: editingEventTypeLevel === 'company' ? editingEventTypeTeamIds : undefined,
        isGlobal: editingEventTypeLevel === 'company' ? editingEventTypeIsGlobal : undefined,
      });
      setEditingEventTypeId(null);
    }
  };

  const handleCancelEventTypeEdit = () => {
    setEditingEventTypeId(null);
    setEditingEventTypeLabel('');
    setEditingEventTypeCode('');
    setEditingEventTypeColor('');
    setEditingEventTypeLevel('individual');
    setEditingEventTypeTeamIds([]);
    setEditingEventTypeIsGlobal(false);
    setEditingCodeTouched(false);
  };

  const handleAddEventType = () => {
    if (newEventTypeLabel.trim()) {
      onAddEventType({
        code: newEventTypeCode.trim() || deriveEventTypeCode(newEventTypeLabel),
        label: newEventTypeLabel.trim(),
        color: newEventTypeColor,
        source: 'MANUAL',
        level: newEventTypeLevel,
        teamIds: newEventTypeLevel === 'company' ? newEventTypeTeamIds : undefined,
        isGlobal: newEventTypeLevel === 'company' ? newEventTypeIsGlobal : undefined,
      });
      setNewEventTypeLabel('');
      setNewEventTypeCode('');
      setNewEventTypeColor('bg-blue-500');
      setNewEventTypeLevel('individual');
      setNewEventTypeTeamIds([]);
      setNewEventTypeIsGlobal(false);
      setNewCodeTouched(false);
      setIsAddingEventType(false);
    }
  };

  const handleConfirmDeleteEventType = () => {
    if (eventTypeToDelete) {
      onRemoveEventType(eventTypeToDelete);
      setEventTypeToDelete(null);
      setDeleteEventTypeConfirmOpen(false);
    }
  };

  const toggleTeamSelection = (teamId: string, isEditing: boolean) => {
    if (isEditing) {
      setEditingEventTypeTeamIds(prev => 
        prev.includes(teamId) 
          ? prev.filter(id => id !== teamId)
          : [...prev, teamId]
      );
    } else {
      setNewEventTypeTeamIds(prev => 
        prev.includes(teamId) 
          ? prev.filter(id => id !== teamId)
          : [...prev, teamId]
      );
    }
  };

  const renderTeamSelector = (
    selectedTeamIds: string[],
    isGlobal: boolean,
    onToggleTeam: (teamId: string) => void,
    onToggleGlobal: (checked: boolean) => void
  ) => (
    <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border">
      <div className="text-sm font-medium text-foreground">Team Availability</div>
      
      {isAdmin && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="global-checkbox"
            checked={isGlobal}
            onCheckedChange={(checked) => onToggleGlobal(checked === true)}
          />
          <Label htmlFor="global-checkbox" className="flex items-center gap-2 text-sm cursor-pointer">
            <Globe className="w-4 h-4 text-primary" />
            Global (available to all teams)
          </Label>
        </div>
      )}
      
      {!isGlobal && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Select specific teams:</div>
          <div className="h-[180px] overflow-y-auto pr-2">
            <div className="space-y-2">
              {availableTeams.map((team) => (
                <div key={team.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`team-${team.id}`}
                    checked={selectedTeamIds.includes(team.id)}
                    onCheckedChange={() => onToggleTeam(team.id)}
                  />
                  <Label htmlFor={`team-${team.id}`} className="text-sm cursor-pointer">
                    {team.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] bg-card border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-foreground">Manage Event Types</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between pb-2 shrink-0">
            <div className="text-sm text-muted-foreground">
              Configure event types and their visibility levels.
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingEventType(true)}
              disabled={isAddingEventType}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Type
            </Button>
          </div>

          <div className="space-y-3">
              {/* Add new event type */}
              {isAddingEventType && (
                <div className="p-3 rounded-lg bg-muted/50 border border-primary/50 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Event type name..."
                      value={newEventTypeLabel}
                      onChange={(e) => setNewEventTypeLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddEventType();
                        if (e.key === 'Escape') setIsAddingEventType(false);
                      }}
                      autoFocus
                      className="flex-1"
                    />
                    <Input
                      placeholder="CODE"
                      value={newEventTypeCode}
                      onChange={(e) => {
                        setNewEventTypeCode(e.target.value);
                        setNewCodeTouched(true);
                      }}
                      className="w-[180px]"
                    />
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <Select value={newEventTypeColor} onValueChange={setNewEventTypeColor}>
                      <SelectTrigger className="w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${newEventTypeColor}`} />
                          <span>{colorOptions.find(c => c.value === newEventTypeColor)?.label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${color.value}`} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newEventTypeLevel} onValueChange={(v) => setNewEventTypeLevel(v as EventLevel)}>
                      <SelectTrigger className="w-[140px]">
                        <div className="flex items-center gap-2">
                          {levelLabels[newEventTypeLevel].icon}
                          <span>{levelLabels[newEventTypeLevel].label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(levelLabels).map(([key, val]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {val.icon}
                              <span>{val.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newEventTypeLevel === 'company' && renderTeamSelector(
                    newEventTypeTeamIds,
                    newEventTypeIsGlobal,
                    (teamId) => toggleTeamSelection(teamId, false),
                    setNewEventTypeIsGlobal
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingEventType(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddEventType} disabled={!newEventTypeLabel.trim()}>
                      Add Event Type
                    </Button>
                  </div>
                </div>
              )}

              {/* Event type list */}
              {eventTypeConfigs.map((eventType) => {
                const count = events.filter(e => e.eventTypeId === eventType.id || e.eventType?.id === eventType.id).length;
                const isLocked = eventType.source === 'WORKDAY';
                const isEditing = editingEventTypeId === eventType.id;

                if (isEditing) {
                  return (
                    <div key={eventType.id} className="p-3 rounded-lg bg-muted/50 border border-primary/50 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={editingEventTypeLabel}
                          onChange={(e) => setEditingEventTypeLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEventTypeEdit();
                            if (e.key === 'Escape') handleCancelEventTypeEdit();
                          }}
                          autoFocus
                          className="flex-1"
                        />
                        <Input
                          value={editingEventTypeCode}
                          onChange={(e) => {
                            setEditingEventTypeCode(e.target.value);
                            setEditingCodeTouched(true);
                          }}
                          placeholder="CODE"
                          className="w-[180px]"
                        />
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <Select value={editingEventTypeColor} onValueChange={setEditingEventTypeColor}>
                          <SelectTrigger className="w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${editingEventTypeColor}`} />
                              <span>{colorOptions.find(c => c.value === editingEventTypeColor)?.label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${color.value}`} />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={editingEventTypeLevel} onValueChange={(v) => setEditingEventTypeLevel(v as EventLevel)}>
                          <SelectTrigger className="w-[140px]">
                            <div className="flex items-center gap-2">
                              {levelLabels[editingEventTypeLevel].icon}
                              <span>{levelLabels[editingEventTypeLevel].label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(levelLabels).map(([key, val]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  {val.icon}
                                  <span>{val.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {editingEventTypeLevel === 'company' && renderTeamSelector(
                        editingEventTypeTeamIds,
                        editingEventTypeIsGlobal,
                        (teamId) => toggleTeamSelection(teamId, true),
                        setEditingEventTypeIsGlobal
                      )}

                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={handleCancelEventTypeEdit}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEventTypeEdit}>
                          Save
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={eventType.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className={`w-4 h-4 rounded-full ${eventType.color}`} />
                    <div className="flex-1">
                      <span className="text-sm text-foreground">{eventType.label}</span>
                      {eventType.level === 'company' && eventType.isGlobal && (
                        <span className="ml-2 text-xs text-muted-foreground">(Global)</span>
                      )}
                      {eventType.level === 'company' && !eventType.isGlobal && eventType.teamIds && eventType.teamIds.length > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({eventType.teamIds.length} team{eventType.teamIds.length !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            {levelLabels[eventType.level].icon}
                            {levelLabels[eventType.level].label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{levelLabels[eventType.level].description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-xs text-muted-foreground">{count} events</span>
                    {isLocked ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Managed by Workday</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEventTypeEdit(eventType)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEventTypeToDelete(eventType.id);
                            setDeleteEventTypeConfirmOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          

          <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-2">
            Locked event types are managed by Workday and cannot be modified.
          </p>
        </DialogContent>
      </Dialog>

      {/* Delete Event Type Confirmation Dialog */}
      <AlertDialog open={deleteEventTypeConfirmOpen} onOpenChange={setDeleteEventTypeConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event type? Events of this type will no longer be categorized. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteEventType} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
