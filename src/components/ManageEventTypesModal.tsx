import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, User, Users, Building2, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TeamDto, TeamEmployeeDto, TimelineEvent, EventTypeConfig, EventTypeTimelineScope, EventTypeVisibilityScope } from '@/lib/types';
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
  { value: '#22c55e', label: 'Green' },
  { value: '#ef4444', label: 'Red' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#a855f7', label: 'Purple' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#6366f1', label: 'Indigo' },
];

const timelineScopeLabels: Record<EventTypeTimelineScope, { label: string; icon: React.ReactNode; description: string }> = {
  INDIVIDUAL: { label: 'Individual', icon: <User className="w-3 h-3" />, description: 'Visible on user timelines' },
  GLOBAL: { label: 'Global', icon: <Globe className="w-3 h-3" />, description: 'Visible on the global lane' },
};

const visibilityScopeLabels: Record<EventTypeVisibilityScope, { label: string; icon: React.ReactNode; description: string }> = {
  GLOBAL: { label: 'Global', icon: <Building2 className="w-3 h-3" />, description: 'Available to all teams (admin only)' },
  TEAM: { label: 'Team', icon: <Users className="w-3 h-3" />, description: 'Available to selected teams' },
};

const deriveEventTypeCode = (label: string) => {
  return label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const isHexColor = (value: string) => /^#([0-9a-fA-F]{6})$/.test(value);

interface ManageEventTypesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEventTypeId?: string | null;
  teams: TeamDto[];
  employees: TeamEmployeeDto[];
  events: TimelineEvent[];
  eventTypeConfigs: EventTypeConfig[];
  currentUserId?: string; // To determine owned teams
  onAddEventType: (eventType: Omit<EventTypeConfig, 'id'>) => void;
  onUpdateEventType: (eventTypeId: string, updates: Partial<EventTypeConfig>) => void;
  onRemoveEventType: (eventTypeId: string) => void;
}

export function ManageEventTypesModal({
  open,
  onOpenChange,
  initialEventTypeId,
  teams,
  employees,
  events,
  eventTypeConfigs,
  currentUserId,
  onAddEventType,
  onUpdateEventType,
  onRemoveEventType,
}: ManageEventTypesModalProps) {
  // Event type editing state
  const [editingEventTypeId, setEditingEventTypeId] = useState<string | null>(null);
  const [editingEventTypeLabel, setEditingEventTypeLabel] = useState('');
  const [editingEventTypeCode, setEditingEventTypeCode] = useState('');
  const [editingEventTypeColor, setEditingEventTypeColor] = useState('');
  const [editingEventTypeTimelineScope, setEditingEventTypeTimelineScope] = useState<EventTypeTimelineScope>('INDIVIDUAL');
  const [editingEventTypeVisibilityScope, setEditingEventTypeVisibilityScope] = useState<EventTypeVisibilityScope>('GLOBAL');
  const [editingEventTypeTeamIds, setEditingEventTypeTeamIds] = useState<string[]>([]);
  const [editingEventTypeUserCreatable, setEditingEventTypeUserCreatable] = useState(true);
  const [editingCodeTouched, setEditingCodeTouched] = useState(false);
  
  const [isAddingEventType, setIsAddingEventType] = useState(false);
  const [newEventTypeLabel, setNewEventTypeLabel] = useState('');
  const [newEventTypeCode, setNewEventTypeCode] = useState('');
  const [newEventTypeColor, setNewEventTypeColor] = useState('#3b82f6');
  const [newEventTypeTimelineScope, setNewEventTypeTimelineScope] = useState<EventTypeTimelineScope>('INDIVIDUAL');
  const [newEventTypeVisibilityScope, setNewEventTypeVisibilityScope] = useState<EventTypeVisibilityScope>('GLOBAL');
  const [newEventTypeTeamIds, setNewEventTypeTeamIds] = useState<string[]>([]);
  const [newEventTypeUserCreatable, setNewEventTypeUserCreatable] = useState(true);
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
      setNewEventTypeColor('#3b82f6');
      setNewEventTypeTimelineScope('INDIVIDUAL');
      setNewEventTypeVisibilityScope('GLOBAL');
      setNewEventTypeTeamIds([]);
      setNewEventTypeUserCreatable(true);
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
    const resolvedColor = isHexColor(eventType.color)
      ? eventType.color
      : colorOptions[0]?.value ?? '#3b82f6';
    setEditingEventTypeId(eventType.id);
    setEditingEventTypeLabel(eventType.label);
    setEditingEventTypeCode(eventType.code);
    setEditingEventTypeColor(resolvedColor);
    setEditingEventTypeTimelineScope(eventType.timelineScope);
    setEditingEventTypeVisibilityScope(eventType.visibilityScope);
    setEditingEventTypeTeamIds(eventType.teamIds || []);
    setEditingEventTypeUserCreatable(eventType.userCreatable ?? true);
    setEditingCodeTouched(false);
  };

  useEffect(() => {
    if (!open) return;
    if (!initialEventTypeId) return;
    const target = eventTypeConfigs.find(eventType => eventType.id === initialEventTypeId);
    if (target) {
      handleStartEventTypeEdit(target);
    }
  }, [eventTypeConfigs, initialEventTypeId, open]);

  const handleSaveEventTypeEdit = () => {
    if (editingEventTypeId && editingEventTypeLabel.trim()) {
      onUpdateEventType(editingEventTypeId, {
        label: editingEventTypeLabel.trim(),
        code: editingEventTypeCode.trim() || deriveEventTypeCode(editingEventTypeLabel),
        color: editingEventTypeColor,
        timelineScope: editingEventTypeTimelineScope,
        visibilityScope: editingEventTypeVisibilityScope,
        teamIds: editingEventTypeVisibilityScope === 'TEAM' ? editingEventTypeTeamIds : undefined,
        userCreatable: editingEventTypeUserCreatable,
      });
      setEditingEventTypeId(null);
    }
  };

  const handleCancelEventTypeEdit = () => {
    setEditingEventTypeId(null);
    setEditingEventTypeLabel('');
    setEditingEventTypeCode('');
    setEditingEventTypeColor('');
    setEditingEventTypeTimelineScope('INDIVIDUAL');
    setEditingEventTypeVisibilityScope('GLOBAL');
    setEditingEventTypeTeamIds([]);
    setEditingEventTypeUserCreatable(true);
    setEditingCodeTouched(false);
  };

  const handleAddEventType = () => {
    if (newEventTypeLabel.trim()) {
      onAddEventType({
        code: newEventTypeCode.trim() || deriveEventTypeCode(newEventTypeLabel),
        label: newEventTypeLabel.trim(),
        color: newEventTypeColor,
        source: 'MANUAL',
        timelineScope: newEventTypeTimelineScope,
        visibilityScope: newEventTypeVisibilityScope,
        teamIds: newEventTypeVisibilityScope === 'TEAM' ? newEventTypeTeamIds : undefined,
        userCreatable: newEventTypeUserCreatable,
      });
      setNewEventTypeLabel('');
      setNewEventTypeCode('');
      setNewEventTypeColor('#3b82f6');
      setNewEventTypeTimelineScope('INDIVIDUAL');
      setNewEventTypeVisibilityScope('GLOBAL');
      setNewEventTypeTeamIds([]);
      setNewEventTypeUserCreatable(true);
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
    onToggleTeam: (teamId: string) => void
  ) => (
    <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border">
      <div className="text-sm font-medium text-foreground">Team Availability</div>
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
              Configure event types, visibility, and availability.
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
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: newEventTypeColor }} />
                          <span>{colorOptions.find(c => c.value === newEventTypeColor)?.label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newEventTypeTimelineScope} onValueChange={(v) => setNewEventTypeTimelineScope(v as EventTypeTimelineScope)}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center gap-2">
                          {timelineScopeLabels[newEventTypeTimelineScope].icon}
                          <span>{timelineScopeLabels[newEventTypeTimelineScope].label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(timelineScopeLabels).map(([key, val]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {val.icon}
                              <span>{val.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newEventTypeVisibilityScope} onValueChange={(v) => setNewEventTypeVisibilityScope(v as EventTypeVisibilityScope)}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center gap-2">
                          {visibilityScopeLabels[newEventTypeVisibilityScope].icon}
                          <span>{visibilityScopeLabels[newEventTypeVisibilityScope].label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(visibilityScopeLabels).map(([key, val]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {val.icon}
                              <span>{val.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="new-user-creatable"
                        checked={newEventTypeUserCreatable}
                        onCheckedChange={(checked) => setNewEventTypeUserCreatable(checked === true)}
                      />
                      <Label htmlFor="new-user-creatable" className="text-sm cursor-pointer">
                        Allow users to create
                      </Label>
                    </div>
                  </div>

                  {newEventTypeVisibilityScope === 'TEAM' && renderTeamSelector(
                    newEventTypeTeamIds,
                    (teamId) => toggleTeamSelection(teamId, false)
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
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: editingEventTypeColor }} />
                            <span>{colorOptions.find(c => c.value === editingEventTypeColor)?.label}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }} />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                        <Select value={editingEventTypeTimelineScope} onValueChange={(v) => setEditingEventTypeTimelineScope(v as EventTypeTimelineScope)}>
                          <SelectTrigger className="w-[150px]">
                            <div className="flex items-center gap-2">
                              {timelineScopeLabels[editingEventTypeTimelineScope].icon}
                              <span>{timelineScopeLabels[editingEventTypeTimelineScope].label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(timelineScopeLabels).map(([key, val]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  {val.icon}
                                  <span>{val.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={editingEventTypeVisibilityScope} onValueChange={(v) => setEditingEventTypeVisibilityScope(v as EventTypeVisibilityScope)}>
                          <SelectTrigger className="w-[150px]">
                            <div className="flex items-center gap-2">
                              {visibilityScopeLabels[editingEventTypeVisibilityScope].icon}
                              <span>{visibilityScopeLabels[editingEventTypeVisibilityScope].label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(visibilityScopeLabels).map(([key, val]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  {val.icon}
                                  <span>{val.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="edit-user-creatable"
                            checked={editingEventTypeUserCreatable}
                            onCheckedChange={(checked) => setEditingEventTypeUserCreatable(checked === true)}
                          />
                          <Label htmlFor="edit-user-creatable" className="text-sm cursor-pointer">
                            Allow users to create
                          </Label>
                        </div>
                      </div>

                      {editingEventTypeVisibilityScope === 'TEAM' && renderTeamSelector(
                        editingEventTypeTeamIds,
                        (teamId) => toggleTeamSelection(teamId, true)
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
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: isHexColor(eventType.color) ? eventType.color : colorOptions[0]?.value }}
                    />
                    <div className="flex-1">
                      <span className="text-sm text-foreground">{eventType.label}</span>
                      {eventType.visibilityScope === 'TEAM' && eventType.teamIds && eventType.teamIds.length > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({eventType.teamIds.length} team{eventType.teamIds.length !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            {timelineScopeLabels[eventType.timelineScope].icon}
                            {timelineScopeLabels[eventType.timelineScope].label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{timelineScopeLabels[eventType.timelineScope].description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                            {visibilityScopeLabels[eventType.visibilityScope].icon}
                            {visibilityScopeLabels[eventType.visibilityScope].label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{visibilityScopeLabels[eventType.visibilityScope].description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-xs text-muted-foreground">{count} events</span>
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
                  </div>
                );
              })}
            </div>
          

        </DialogContent>
      </Dialog>

      {/* Delete Event Type Confirmation Dialog */}
      <AlertDialog open={deleteEventTypeConfirmOpen} onOpenChange={setDeleteEventTypeConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this event type? All events of this type will be deleted as well. This action cannot be undone.
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
