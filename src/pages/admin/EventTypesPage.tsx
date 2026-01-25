import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Plus, Search, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { useToast } from "@/hooks/use-toast";
import { useMe } from "@/queries/useMe";
import { useTeams } from "@/queries/useTeams";
import { eventTypesQueryKey, useEventTypes } from "@/queries/useEventTypes";
import { ManageEventTypesModal } from "@/components/ManageEventTypesModal";
import { EventTypeConfig } from "@/lib/types";
import { getEventColorClass } from "@/lib/eventColors";
import { apiFetch } from "@/lib/api";
import { useCreateEventType, useDeleteEventType, useUpdateEventType } from "@/queries/useEventTypeMutations";

export default function AdminEventTypesPage() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: teams = [] } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const { data: teamEventTypes = [], isLoading: isLoadingTeam } = useEventTypes(
    selectedTeamId !== "all" ? selectedTeamId : undefined,
    { enabled: selectedTeamId !== "all" && !!selectedTeamId }
  );
  const [showManageModal, setShowManageModal] = useState(false);
  const [managedEventTypeId, setManagedEventTypeId] = useState<string | null>(null);
  const [deleteEventTypeId, setDeleteEventTypeId] = useState<string | null>(null);
  const createEventTypeMutation = useCreateEventType(selectedTeamId);
  const updateEventTypeMutation = useUpdateEventType(selectedTeamId);
  const deleteEventTypeMutation = useDeleteEventType(selectedTeamId);

  const managerTeamIds = useMemo(() => {
    if (me?.role !== "MANAGER" || !me?.id) return [];
    return teams.filter(team => team.createdByUserId === me.id).map(team => team.id);
  }, [me?.id, me?.role, teams]);
  const isAdmin = me?.role === "ADMIN";
  const isManager = me?.role === "MANAGER";
  const canCreateEventType = isAdmin || (isManager && managerTeamIds.length > 0);
  const filterableTeams = useMemo(() => {
    if (!isManager) return teams;
    return teams.filter((team) => managerTeamIds.includes(team.id));
  }, [isManager, managerTeamIds, teams]);
  const teamOptions = useMemo(() => {
    const baseOptions = filterableTeams.map((team) => ({ label: team.name, value: team.id }));
    return [{ label: "All teams", value: "all" }, ...baseOptions];
  }, [filterableTeams]);

  const allTeamsQueries = useQueries({
    queries: filterableTeams.map((team) => ({
      queryKey: eventTypesQueryKey(team.id),
      queryFn: () => apiFetch(`/api/event-types?teamId=${team.id}`),
      enabled: selectedTeamId === "all",
    })),
  });

  const allTeamsEventTypes = useMemo(() => {
    const merged = new Map<string, EventTypeConfig>();
    allTeamsQueries.forEach((query, index) => {
      const teamId = filterableTeams[index]?.id;
      const data = (query.data ?? []) as EventTypeConfig[];
      data.forEach((eventType) => {
        const existing = merged.get(eventType.id);
        const nextTeamIds = new Set<string>([
          ...(existing?.teamIds ?? []),
          ...(eventType.teamIds ?? []),
        ]);
        if (eventType.visibilityScope === "TEAM" && teamId) {
          nextTeamIds.add(teamId);
        }
        merged.set(eventType.id, {
          ...(existing ?? eventType),
          ...eventType,
          teamIds: nextTeamIds.size > 0 ? Array.from(nextTeamIds) : eventType.teamIds,
        });
      });
    });
    return Array.from(merged.values());
  }, [allTeamsQueries, filterableTeams]);

  const isLoadingAll = allTeamsQueries.some((query) => query.isLoading);
  const eventTypes = selectedTeamId === "all" ? allTeamsEventTypes : teamEventTypes;
  const isLoading = selectedTeamId === "all" ? isLoadingAll : isLoadingTeam;

  useEffect(() => {
    if (!selectedTeamId && teamOptions.length > 0) {
      setSelectedTeamId("all");
    }
  }, [selectedTeamId, teamOptions.length]);

  const filteredEventTypes = eventTypes.filter((eventType) => {
    const query = searchQuery.toLowerCase();
    return (
      eventType.name?.toLowerCase().includes(query) ||
      eventType.code?.toLowerCase().includes(query)
    );
  });
  const hrisEventTypes = filteredEventTypes.filter((eventType) => eventType.source === "WORKDAY");
  const localEventTypes = filteredEventTypes.filter((eventType) => eventType.source !== "WORKDAY");

  const deriveEventTypeCode = (label: string) => {
    return label
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const normalizeTeamIds = (visibilityScope: EventTypeConfig["visibilityScope"], teamIds?: string[]) => {
    if (visibilityScope !== "TEAM") return undefined;
    return teamIds ?? [];
  };

  const handleAddEventType = (eventType: Omit<EventTypeConfig, "id">) => {
    if (!canCreateEventType) {
      toast({
        title: "Not allowed",
        description: "You do not have permission to create event types.",
        variant: "destructive",
      });
      return;
    }
    createEventTypeMutation.mutate(
      {
        name: eventType.label,
        code: eventType.code || deriveEventTypeCode(eventType.label),
        visibilityScope: eventType.visibilityScope,
        timelineScope: eventType.timelineScope,
        teamIds: normalizeTeamIds(eventType.visibilityScope, eventType.teamIds),
        color: eventType.color,
        userCreatable: eventType.userCreatable ?? true,
      },
      {
        onSuccess: () => {
          toast({
            title: "Event type added",
            description: `"${eventType.label}" has been added.`,
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: "Event type failed",
            description: error?.message ?? "Unable to create event type.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUpdateEventType = (eventTypeId: string, updates: Partial<EventTypeConfig>) => {
    const existing = eventTypeConfigs.find((eventType) => eventType.id === eventTypeId);
    if (!existing) return;
    if (isManager) {
      const teamIds = existing.teamIds ?? [];
      const isEditable = existing.visibilityScope === "TEAM" &&
        teamIds.length > 0 &&
        teamIds.every(teamId => managerTeamIds.includes(teamId));
      if (!isEditable) {
        toast({
          title: "Not allowed",
          description: "Managers can only edit event types for teams they created.",
          variant: "destructive",
        });
        return;
      }
    }
    const merged: EventTypeConfig = { ...existing, ...updates };
    updateEventTypeMutation.mutate(
      {
        eventTypeId,
        payload: {
          name: merged.label,
          code: merged.code || deriveEventTypeCode(merged.label),
          visibilityScope: merged.visibilityScope,
          timelineScope: merged.timelineScope,
          teamIds: normalizeTeamIds(merged.visibilityScope, merged.teamIds),
          color: merged.color,
          userCreatable: merged.userCreatable ?? true,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Event type updated",
            description: "Event type updated successfully.",
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: "Event type update failed",
            description: error?.message ?? "Unable to update event type.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemoveEventType = (eventTypeId: string) => {
    deleteEventTypeMutation.mutate(eventTypeId, {
      onSuccess: () => {
        toast({
          title: "Event type deleted",
          description: "Event type deleted successfully.",
        });
      },
      onError: (error: { message?: string }) => {
        toast({
          title: "Event type deletion failed",
          description: error?.message ?? "Unable to delete event type.",
          variant: "destructive",
        });
      },
    });
  };

  const eventTypeConfigs = useMemo<EventTypeConfig[]>(() => {
    return eventTypes.map((eventType) => ({
      id: eventType.id,
      code: eventType.code ?? deriveEventTypeCode(eventType.name ?? ""),
      label: eventType.name ?? eventType.code ?? "Event type",
      color: eventType.color ?? getEventColorClass(eventType, eventType.id),
      source: eventType.source ?? "MANUAL",
      visibilityScope: eventType.visibilityScope,
      timelineScope: eventType.timelineScope,
      teamIds: eventType.visibilityScope === "TEAM" ? eventType.teamIds ?? [] : undefined,
      userCreatable: eventType.userCreatable ?? true,
    }));
  }, [eventTypes]);

  const canManageEventType = (eventType: EventTypeConfig) => {
    if (isAdmin) return true;
    if (!isManager) return false;
    if (eventType.visibilityScope !== "TEAM") return false;
    const teamIds = eventType.teamIds ?? [];
    if (teamIds.length === 0) return false;
    return teamIds.every(teamId => managerTeamIds.includes(teamId));
  };

  const handleSyncAll = () => {
    toast({
      title: "Sync started",
      description: "Event types sync has been triggered.",
    });
  };

  const renderEventTypeRow = (eventType: EventTypeConfig) => {
    const canManage = canManageEventType(eventType);
    const teamLabels = (() => {
      if (eventType.visibilityScope === "GLOBAL") return ["All teams"];
      const teamNames = (eventType.teamIds ?? [])
        .map((teamId) => teams.find((team) => team.id === teamId)?.name)
        .filter(Boolean) as string[];
      if (teamNames.length > 0) return teamNames;
      if (selectedTeamId && selectedTeamId !== "all") {
        const selectedTeam = teams.find((team) => team.id === selectedTeamId);
        return selectedTeam ? [selectedTeam.name] : ["Selected team"];
      }
      return ["No teams"];
    })();
    return (
      <TableRow key={eventType.id}>
        <TableCell>
          <div>
            <p className="font-medium">{eventType.name}</p>
            <p className="text-sm text-muted-foreground">{eventType.code}</p>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary">{eventType.timelineScope}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant="secondary">{eventType.visibilityScope}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {teamLabels.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className={eventType.userCreatable ? "" : "bg-muted text-muted-foreground"}>
            {eventType.userCreatable ? "User Creatable" : "Admin Only"}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setManagedEventTypeId(eventType.id);
                    setShowManageModal(true);
                  }}
                  disabled={!canManage}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteEventTypeId(eventType.id)}
                  disabled={!canManage}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Event Types & Sync</h1>
          <p className="text-muted-foreground mt-1">
            Manage event types and configure HRIS sync settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSyncAll} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              setManagedEventTypeId(null);
              setShowManageModal(true);
            }}
            disabled={!canCreateEventType}
          >
            <Plus className="w-4 h-4" />
            New Event Type
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search event types..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="h-32 flex items-center justify-center text-sm text-muted-foreground">
              Loading event types...
            </CardContent>
          </Card>
        ) : filteredEventTypes.length === 0 ? (
          <Card>
            <CardContent className="h-32 flex items-center justify-center text-sm text-muted-foreground">
              No event types found.
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="hris" className="w-full">
            <div className="flex items-center justify-between gap-3">
              <TabsList className="justify-start">
                <TabsTrigger value="hris">HRIS ({hrisEventTypes.length})</TabsTrigger>
                <TabsTrigger value="local">Local ({localEventTypes.length})</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Team</label>
                <select
                  value={selectedTeamId}
                  onChange={(event) => setSelectedTeamId(event.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  disabled={teamOptions.length === 0}
                >
                  {teamOptions.length === 0 ? (
                    <option value="">No teams available</option>
                  ) : null}
                  {teamOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <TabsContent value="hris" className="mt-4">
              {hrisEventTypes.length === 0 ? (
                <Card>
                  <CardContent className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                    No HRIS event types found.
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Timeline</TableHead>
                          <TableHead>Visibility</TableHead>
                          <TableHead>Teams</TableHead>
                          <TableHead>User Access</TableHead>
                          <TableHead className="w-12 text-right"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hrisEventTypes.map(renderEventTypeRow)}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="local" className="mt-4">
              {localEventTypes.length === 0 ? (
                <Card>
                  <CardContent className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                    No local event types found.
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Timeline</TableHead>
                          <TableHead>Visibility</TableHead>
                          <TableHead>Teams</TableHead>
                          <TableHead>User Access</TableHead>
                          <TableHead className="w-12 text-right"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {localEventTypes.map(renderEventTypeRow)}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <ManageEventTypesModal
        open={showManageModal}
        onOpenChange={(nextOpen) => {
          setShowManageModal(nextOpen);
          if (!nextOpen) {
            setManagedEventTypeId(null);
          }
        }}
        initialEventTypeId={managedEventTypeId}
        teams={isManager ? teams.filter(team => managerTeamIds.includes(team.id)) : teams}
        employees={[]}
        events={[]}
        eventTypeConfigs={eventTypeConfigs}
        restrictVisibilityScopeToTeam={isManager}
        canManageEventType={canManageEventType}
        singleRecordMode
        onAddEventType={handleAddEventType}
        onUpdateEventType={handleUpdateEventType}
        onRemoveEventType={handleRemoveEventType}
      />

      <AlertDialog open={!!deleteEventTypeId} onOpenChange={(open) => {
        if (!open) {
          setDeleteEventTypeId(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event type? All events of this type will be deleted as well. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteEventTypeId) return;
                handleRemoveEventType(deleteEventTypeId);
                setDeleteEventTypeId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
