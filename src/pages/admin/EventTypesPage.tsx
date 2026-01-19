import { useEffect, useMemo, useState } from "react";
import { Plus, Search, RefreshCw, Link2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTeams } from "@/queries/useTeams";
import { useEventTypes } from "@/queries/useEventTypes";
import { ManageEventTypesModal } from "@/components/ManageEventTypesModal";
import { EventTypeConfig } from "@/lib/types";
import { getEventColorClass } from "@/lib/eventColors";
import { useCreateEventType, useDeleteEventType, useUpdateEventType } from "@/queries/useEventTypeMutations";

export default function AdminEventTypesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: teams = [] } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const { data: eventTypes = [], isLoading } = useEventTypes(selectedTeamId);
  const [showManageModal, setShowManageModal] = useState(false);
  const [managedEventTypeId, setManagedEventTypeId] = useState<string | null>(null);
  const createEventTypeMutation = useCreateEventType(selectedTeamId);
  const updateEventTypeMutation = useUpdateEventType(selectedTeamId);
  const deleteEventTypeMutation = useDeleteEventType(selectedTeamId);

  const teamOptions = useMemo(
    () => teams.map((team) => ({ label: team.name, value: team.id })),
    [teams]
  );

  useEffect(() => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [selectedTeamId, teams]);

  const filteredEventTypes = eventTypes.filter((eventType) => {
    const query = searchQuery.toLowerCase();
    return (
      eventType.name?.toLowerCase().includes(query) ||
      eventType.code?.toLowerCase().includes(query)
    );
  });

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

  const handleSyncAll = () => {
    toast({
      title: "Sync started",
      description: "Event types sync has been triggered.",
    });
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
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Team</label>
              <select
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                disabled={teams.length === 0}
              >
                {teams.length === 0 ? (
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
        </CardContent>
      </Card>

      <div className="grid gap-4">
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
          filteredEventTypes.map((eventType) => (
          <Card key={eventType.id}>
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-lg">{eventType.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{eventType.code}</Badge>
                  <Badge variant="secondary">{eventType.timelineScope}</Badge>
                  <Badge variant="secondary">{eventType.visibilityScope}</Badge>
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={eventType.source === "WORKDAY" ? "bg-blue-50 text-blue-700" : ""}
              >
                {eventType.source === "WORKDAY" ? "HRIS: Workday" : "Local"}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {eventType.source === "WORKDAY" ? (
                  <Link2 className="w-4 h-4 text-primary" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                {eventType.source === "WORKDAY"
                  ? "Linked to HRIS event type"
                  : "Local event type"}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setManagedEventTypeId(eventType.id);
                    setShowManageModal(true);
                  }}
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
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
        teams={teams}
        employees={[]}
        events={[]}
        eventTypeConfigs={eventTypeConfigs}
        onAddEventType={handleAddEventType}
        onUpdateEventType={handleUpdateEventType}
        onRemoveEventType={handleRemoveEventType}
      />
    </div>
  );
}
