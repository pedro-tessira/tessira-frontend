import { useState, useMemo, useRef, useEffect } from 'react';
import { subMonths, addMonths, differenceInDays, format } from 'date-fns';
import { useQueries } from '@tanstack/react-query';
import {
  COMPANY_ROW_ID,
  EventScope,
  EventTypeConfig,
  EventTypeDto,
  EventDto,
  TimelineEvent,
  TeamEmployeeDto,
  EventTypeVisibilityScope,
} from '@/lib/types';
import { generateDayColumns } from '@/lib/dateUtils';
import { MainLayout } from './layout/MainLayout';
import { LegendChips } from './LegendChips';
import { Timeline } from './Timeline';
import { EmployeeRow } from './EmployeeRow';
import { CompanyRow } from './CompanyRow';
import { AddEventModal } from './AddEventModal';
import { ManageEventTypesModal } from './ManageEventTypesModal';
import { useRowHeights } from '@/hooks/useRowHeights';
import { useToast } from '@/hooks/use-toast';
import { getEventColorClass } from '@/lib/eventColors';
import { clearToken } from '@/lib/auth';
import { useTeams } from '@/queries/useTeams';
import { employeesQueryOptions, useEmployees } from '@/queries/useEmployees';
import { useEventTypes } from '@/queries/useEventTypes';
import { useTimeline } from '@/queries/useTimeline';
import { employeeEventsQueryOptions } from '@/queries/useEmployeeEvents';
import { useCreateEvent } from '@/queries/useCreateEvent';
import { useCreateTeam, useDeleteTeam, useUpdateTeam } from '@/queries/useTeamMutations';
import { useCreateEventType, useDeleteEventType, useUpdateEventType } from '@/queries/useEventTypeMutations';
import { useCreateTeamMember, useDeleteTeamMember, useUpdateTeamMember } from '@/queries/useTeamMemberMutations';
import { useEmployeeSearch } from '@/queries/useEmployeeSearch';
import { useMe } from '@/queries/useMe';

const COL_WIDTH = 80;
const TODAY = new Date();
const INITIAL_MONTHS_BEFORE = 2;
const INITIAL_MONTHS_AFTER = 4;
const LOAD_MORE_MONTHS = 3;
const SCROLL_THRESHOLD = 500; // pixels from edge to trigger load

const defaultEventTypeSource = 'MANUAL';

const getEventTypeLabel = (eventType: EventTypeDto) => {
  return eventType.name ?? eventType.code ?? 'Event type';
};

const deriveEventTypeCode = (label: string) => {
  return label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export function AppShell() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const { data: teams = [] } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showManageEventTypes, setShowManageEventTypes] = useState(false);
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);
  const [isTodayVisible, setIsTodayVisible] = useState(false);

  const [rangeStart, setRangeStart] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth() - INITIAL_MONTHS_BEFORE, 1));
  const [rangeEnd, setRangeEnd] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth() + INITIAL_MONTHS_AFTER + 1, 0));

  const sidebarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const lastTeamIdRef = useRef<string | null>(null);

  useEffect(() => {
    setExpandedRows(new Set());
    setSelectedEmployeeId(null);
  }, [selectedTeamId]);

  const { data: employees = [] } = useEmployees(selectedTeamId, searchQuery);
  const { data: eventTypes = [] } = useEventTypes(selectedTeamId);
  const canManageEventTypes = useMemo(() => {
    if (me?.role === "ADMIN") return true;
    if (me?.role !== "MANAGER") return false;
    if (!me?.id || !selectedTeamId) return false;
    return teams.some(team => team.id === selectedTeamId && team.createdByUserId === me.id);
  }, [me?.id, me?.role, selectedTeamId, teams]);

  useEffect(() => {
    if (!selectedTeamId || eventTypes.length === 0) return;
    if (lastTeamIdRef.current !== selectedTeamId) {
      setActiveFilters(new Set(eventTypes.map(eventType => eventType.id)));
      lastTeamIdRef.current = selectedTeamId;
    }
  }, [eventTypes, selectedTeamId]);

  const selectedEventTypeIds = useMemo(() => Array.from(activeFilters), [activeFilters]);
  const from = format(rangeStart, 'yyyy-MM-dd');
  const to = format(rangeEnd, 'yyyy-MM-dd');

  const { data: timeline } = useTimeline(
    {
      teamId: selectedTeamId,
      from,
      to,
      eventTypeIds: selectedEventTypeIds,
    },
    {
      enabled: !!selectedTeamId && eventTypes.length > 0,
    }
  );

  const expandedEmployeeIds = useMemo(
    () => Array.from(expandedRows).filter(id => id !== COMPANY_ROW_ID),
    [expandedRows]
  );

  const expandedEmployeeQueries = useQueries({
    queries: expandedEmployeeIds.map(employeeId => ({
      ...employeeEventsQueryOptions({
        teamId: selectedTeamId,
        employeeId,
        from,
        to,
        eventTypeIds: selectedEventTypeIds,
      }),
      enabled: !!selectedTeamId && eventTypes.length > 0,
    })),
  });

  const expandedEventsByEmployee = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    expandedEmployeeQueries.forEach((query, index) => {
      const employeeId = expandedEmployeeIds[index];
      if (!employeeId) return;
      const events = query.data?.events ?? [];
      const employeeName = query.data?.employee.fullName ?? query.data?.employee.displayName;
      map.set(
        employeeId,
        events.map(event => ({
          ...event,
          eventTypeId: event.eventTypeId ?? event.eventType?.id ?? null,
          employeeId,
          employeeName,
        }))
      );
    });
    return map;
  }, [expandedEmployeeIds, expandedEmployeeQueries]);

  const { timelineEvents, eventsByRow } = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    if (!timeline || activeFilters.size === 0) {
      return { timelineEvents: [], eventsByRow: map };
    }
    const isEventVisible = (event: EventDto) => {
      const eventTypeId = event.eventTypeId ?? event.eventType?.id ?? null;
      if (!eventTypeId) return false;
      return activeFilters.has(eventTypeId);
    };
    const companyEvents = timeline.globalLane.events.filter(isEventVisible).map(event => ({
      ...event,
      eventTypeId: event.eventTypeId ?? event.eventType?.id ?? null,
      employeeId: null,
      title: event.title?.trim() ? event.title : event.eventType?.name ?? event.eventType?.code ?? "Event",
    }));
    map.set(COMPANY_ROW_ID, companyEvents);

    const allEvents: TimelineEvent[] = [...companyEvents];
    timeline.rows.forEach(row => {
      const expandedEvents = expandedEventsByEmployee.get(row.employee.id);
      const sourceEvents = expandedEvents ?? row.events;
      const visibleEvents = sourceEvents.filter(isEventVisible);
      const rowEvents = visibleEvents.map(event => ({
        ...event,
        eventTypeId: event.eventTypeId ?? event.eventType?.id ?? null,
        employeeId: row.employee.id,
        employeeName: row.employee.fullName ?? row.employee.displayName,
        title: event.title?.trim() ? event.title : event.eventType?.name ?? event.eventType?.code ?? "Event",
      }));
      map.set(row.employee.id, rowEvents);
      allEvents.push(...rowEvents);
    });
    return { timelineEvents: allEvents, eventsByRow: map };
  }, [activeFilters, expandedEventsByEmployee, timeline]);

  const aggregationByRow = useMemo(() => {
    const map = new Map<string, { hasMore: boolean; hiddenCount: number }>();
    if (!timeline) return map;
    map.set(COMPANY_ROW_ID, timeline.globalLane.aggregation);
    timeline.rows.forEach(row => {
      map.set(row.employee.id, row.aggregation);
    });
    return map;
  }, [timeline]);

  const teamEmployees = useMemo(() => employees, [employees]);

  const allRowIds = useMemo(() => [COMPANY_ROW_ID, ...teamEmployees.map(e => e.id)], [teamEmployees]);

  const rowLayouts = useRowHeights(
    allRowIds,
    eventsByRow,
    rangeStart,
    rangeEnd,
    COL_WIDTH,
    expandedRows,
    aggregationByRow
  );

  const toggleFilter = (eventTypeId: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(eventTypeId)) {
        next.delete(eventTypeId);
      } else {
        next.add(eventTypeId);
      }
      return next;
    });
  };

  const toggleAllFilters = () => {
    setActiveFilters(prev => {
      if (eventTypes.length > 0 && prev.size === eventTypes.length) {
        return new Set();
      }
      return new Set(eventTypes.map(eventType => eventType.id));
    });
  };

  const loadMoreFuture = () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setRangeEnd(prev => addMonths(prev, LOAD_MORE_MONTHS));

    setTimeout(() => {
      isLoadingRef.current = false;
    }, 100);
  };

  const loadMorePast = () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    const timelineEl = timelineRef.current;
    const previousScrollWidth = timelineEl?.scrollWidth ?? 0;
    setRangeStart(prev => subMonths(prev, LOAD_MORE_MONTHS));

    requestAnimationFrame(() => {
      if (timelineEl) {
        const newScrollWidth = timelineEl.scrollWidth;
        const addedWidth = newScrollWidth - previousScrollWidth;
        timelineEl.scrollLeft += addedWidth;
      }
      isLoadingRef.current = false;
    });
  };

  const columns = useMemo(() => generateDayColumns(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  const scrollToToday = () => {
    if (timelineRef.current) {
      const daysFromStart = differenceInDays(TODAY, rangeStart);
      const scrollPosition = daysFromStart * COL_WIDTH - timelineRef.current.clientWidth / 2 + COL_WIDTH / 2;
      timelineRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (!hasScrolledToToday && timelineRef.current && columns.length > 0) {
      const timelineEl = timelineRef.current;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!timelineEl) return;
          const daysFromStart = differenceInDays(TODAY, rangeStart);
          const scrollPosition = daysFromStart * COL_WIDTH - timelineEl.clientWidth / 2 + COL_WIDTH / 2;
          timelineEl.scrollLeft = Math.max(0, scrollPosition);
          setHasScrolledToToday(true);
          const todayLeft = daysFromStart * COL_WIDTH;
          const todayRight = todayLeft + COL_WIDTH;
          const viewportRight = timelineEl.scrollLeft + timelineEl.clientWidth;
          const isVisible = todayRight > timelineEl.scrollLeft && todayLeft < viewportRight;
          setIsTodayVisible(isVisible);
        });
      });
    }
  }, [hasScrolledToToday, rangeStart, columns.length]);

  const createEventMutation = useCreateEvent();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();
  const createTeamMemberMutation = useCreateTeamMember();
  const updateTeamMemberMutation = useUpdateTeamMember();
  const deleteTeamMemberMutation = useDeleteTeamMember();
  const searchEmployees = useEmployeeSearch();
  const createEventTypeMutation = useCreateEventType(selectedTeamId);
  const updateEventTypeMutation = useUpdateEventType(selectedTeamId);
  const deleteEventTypeMutation = useDeleteEventType(selectedTeamId);

  const handleAddEvent = (payload: {
    title?: string | null;
    startDate: string;
    endDate: string;
    eventTypeId: string;
    scope: EventScope;
    employeeId?: string | null;
  }) => {
    createEventMutation.mutate(
      {
        title: payload.title ?? null,
        startDate: payload.startDate,
        endDate: payload.endDate,
        eventTypeId: payload.eventTypeId,
        scope: payload.scope,
        employeeId: payload.employeeId ?? null,
        teamId: payload.scope === 'GLOBAL' ? selectedTeamId : null,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Event added',
            description: payload.title?.trim()
              ? `"${payload.title}" has been added successfully.`
              : "Event has been added successfully.",
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: 'Event failed',
            description: error?.message ?? 'Unable to create event.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const notifyNotImplemented = (action: string, detail?: string) => {
    toast({
      title: 'Not implemented yet',
      description: detail ?? `${action} will be available in a future update.`,
    });
  };

  const handleLogout = () => {
    clearToken();
    window.location.assign('/');
  };

  const handleAddEmployee = async (name: string, teamId: string) => {
    const query = name.trim();
    if (!query) return;
    try {
      const matches = await searchEmployees(query);
      if (matches.length === 0) {
        toast({
          title: 'Employee not found',
          description: 'Use a more specific name or email.',
          variant: 'destructive',
        });
        return;
      }
      if (matches.length > 1) {
        toast({
          title: 'Multiple matches',
          description: 'Use the employee email or ID to be specific.',
          variant: 'destructive',
        });
        return;
      }
      const [employee] = matches;
      if (!employee) return;
      if (teamEmployees.some(member => member.id === employee.id)) {
        toast({
          title: 'Already a member',
          description: `${employee.displayName ?? employee.fullName ?? "Employee"} is already in this team.`,
        });
        return;
      }
      createTeamMemberMutation.mutate(
        { teamId, payload: { employeeId: employee.id, roleInTeam: 'MEMBER' } },
        {
          onSuccess: () => {
            toast({
              title: 'Member added',
              description: `${employee.displayName ?? employee.fullName ?? "Employee"} was added to the team.`,
            });
          },
          onError: (error: { message?: string }) => {
            toast({
              title: 'Add member failed',
              description: error?.message ?? 'Unable to add team member.',
              variant: 'destructive',
            });
          },
        }
      );
    } catch (error: unknown) {
      const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Unable to search employees.';
      toast({
        title: 'Employee search failed',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveEmployee = (teamId: string, membershipId: string) => {
    deleteTeamMemberMutation.mutate(
      { teamId, membershipId },
      {
      onSuccess: () => {
        toast({
          title: 'Member removed',
          description: 'Team member removed successfully.',
        });
      },
      onError: (error: { message?: string }) => {
        toast({
          title: 'Remove member failed',
          description: error?.message ?? 'Unable to remove team member.',
          variant: 'destructive',
        });
      },
      }
    );
  };

  const handleUpdateEmployee = (teamId: string, membershipId: string, _name: string, isOwner?: boolean) => {
    if (typeof isOwner !== 'boolean') {
      notifyNotImplemented('Renaming team members', 'Renaming team members is not available.');
      return;
    }
    updateTeamMemberMutation.mutate(
      { teamId, membershipId, payload: { roleInTeam: isOwner ? 'OWNER' : 'MEMBER' } },
      {
        onSuccess: () => {
          toast({
            title: 'Member updated',
            description: 'Team member updated successfully.',
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: 'Member update failed',
            description: error?.message ?? 'Unable to update team member.',
            variant: 'destructive',
          });
        },
      }
    );
  };
  const handleAddTeam = (name: string) => {
    createTeamMutation.mutate(
      { name },
      {
        onSuccess: () => {
          toast({
            title: 'Team created',
            description: `"${name}" has been created.`,
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: 'Team creation failed',
            description: error?.message ?? 'Unable to create team.',
            variant: 'destructive',
          });
        },
      }
    );
  };
  const handleUpdateTeam = (teamId: string, name: string) => {
    updateTeamMutation.mutate(
      { teamId, payload: { name } },
      {
        onSuccess: () => {
          toast({
            title: 'Team updated',
            description: 'Team name updated successfully.',
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: 'Team update failed',
            description: error?.message ?? 'Unable to update team.',
            variant: 'destructive',
          });
        },
      }
    );
  };
  const handleRemoveTeam = (teamId: string) => {
    deleteTeamMutation.mutate(teamId, {
      onSuccess: () => {
        toast({
          title: 'Team deleted',
          description: 'Team deleted successfully.',
        });
      },
      onError: (error: { message?: string }) => {
        toast({
          title: 'Team deletion failed',
          description: error?.message ?? 'Unable to delete team.',
          variant: 'destructive',
        });
      },
    });
  };

  const normalizeTeamIds = (visibilityScope: EventTypeVisibilityScope, teamIds?: string[]) => {
    if (visibilityScope !== 'TEAM') return undefined;
    return teamIds ?? [];
  };

  const handleAddEventType = (eventType: Omit<EventTypeConfig, 'id'>) => {
    createEventTypeMutation.mutate(
      {
        name: eventType.label,
        code: eventType.code || deriveEventTypeCode(eventType.label),
        visibilityScope: eventType.visibilityScope,
        timelineScope: eventType.timelineScope,
        teamIds: normalizeTeamIds(eventType.visibilityScope, eventType.teamIds),
        color: eventType.color,
        userCreatable: true,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Event type added',
            description: `"${eventType.label}" has been added.`,
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: 'Event type failed',
            description: error?.message ?? 'Unable to create event type.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleUpdateEventType = (eventTypeId: string, updates: Partial<EventTypeConfig>) => {
    const existing = eventTypeConfigs.find(eventType => eventType.id === eventTypeId);
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
          userCreatable: true,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Event type updated',
            description: 'Event type updated successfully.',
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: 'Event type update failed',
            description: error?.message ?? 'Unable to update event type.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleRemoveEventType = (eventTypeId: string) => {
    deleteEventTypeMutation.mutate(eventTypeId, {
      onSuccess: () => {
        toast({
          title: 'Event type deleted',
          description: 'Event type deleted successfully.',
        });
      },
      onError: (error: { message?: string }) => {
        toast({
          title: 'Event type deletion failed',
          description: error?.message ?? 'Unable to delete event type.',
          variant: 'destructive',
        });
      },
    });
  };

  const eventTypeConfigs = useMemo<EventTypeConfig[]>(() => {
    return eventTypes.map(eventType => ({
      id: eventType.id,
      code: eventType.code ?? deriveEventTypeCode(eventType.name ?? ''),
      label: getEventTypeLabel(eventType),
      color: eventType.color ?? getEventColorClass(eventType, eventType.id),
      source: eventType.source ?? defaultEventTypeSource,
      visibilityScope: eventType.visibilityScope,
      timelineScope: eventType.timelineScope,
      teamIds: eventType.visibilityScope === 'TEAM' ? eventType.teamIds ?? [] : undefined,
      userCreatable: eventType.userCreatable ?? true,
    }));
  }, [eventTypes]);
  const canManageEventType = useMemo(() => {
    if (me?.role === "ADMIN") return () => true;
    if (me?.role !== "MANAGER") return () => false;
    if (!me?.id) return () => false;
    const managerTeamIds = new Set(teams.filter(team => team.createdByUserId === me.id).map(team => team.id));
    return (eventType: EventTypeConfig) => {
      if (eventType.visibilityScope !== "TEAM") return false;
      const teamIds = eventType.teamIds ?? [];
      if (teamIds.length === 0) return false;
      return teamIds.every(teamId => managerTeamIds.has(teamId));
    };
  }, [me?.id, me?.role, teams]);

  const manageEmployeesQueries = useQueries({
    queries: teams.map(team => ({
      ...employeesQueryOptions(team.id, ''),
      enabled: !!team.id,
    })),
  });

  const allEmployees = useMemo<TeamEmployeeDto[]>(() => {
    return manageEmployeesQueries.flatMap((query, index) => {
      const teamId = teams[index]?.id;
      if (!teamId) return [];
      return (query.data ?? []).map(employee => ({
        ...employee,
        teamId: employee.teamId ?? teamId,
      }));
    });
  }, [manageEmployeesQueries, teams]);

  const visibleTeams = useMemo(() => {
    if (me?.role === "ADMIN") {
      return teams;
    }
    if (me?.role === "MANAGER") {
      const createdTeams = me?.id
        ? teams.filter(team => team.createdByUserId === me.id)
        : [];
      if (!me?.employeeId) {
        return createdTeams;
      }
      const memberTeamIds = new Set(
        allEmployees.filter(employee => employee.id === me.employeeId).map(employee => employee.teamId)
      );
      const combined = [
        ...teams.filter(team => memberTeamIds.has(team.id)),
        ...createdTeams,
      ];
      const deduped = new Map(combined.map(team => [team.id, team]));
      return Array.from(deduped.values());
    }
    if (!me?.employeeId) {
      return [];
    }
    const memberTeamIds = new Set(
      allEmployees.filter(employee => employee.id === me.employeeId).map(employee => employee.teamId)
    );
    return teams.filter(team => memberTeamIds.has(team.id));
  }, [teams, allEmployees, me?.employeeId, me?.role]);

  useEffect(() => {
    if (visibleTeams.length === 0) return;
    if (!selectedTeamId || !visibleTeams.find(team => team.id === selectedTeamId)) {
      setSelectedTeamId(visibleTeams[0].id);
    }
  }, [visibleTeams, selectedTeamId]);

  const toggleExpand = (employeeId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  };

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const timelineEl = timelineRef.current;
    if (!sidebar || !timelineEl) return;
    let isSyncing = false;
    const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
      if (isSyncing) return;
      isSyncing = true;
      target.scrollTop = source.scrollTop;
      requestAnimationFrame(() => {
        isSyncing = false;
      });
    };
    const handleSidebarScroll = () => syncScroll(sidebar, timelineEl);
    const handleTimelineScroll = () => syncScroll(timelineEl, sidebar);
    sidebar.addEventListener('scroll', handleSidebarScroll);
    timelineEl.addEventListener('scroll', handleTimelineScroll);
    return () => {
      sidebar.removeEventListener('scroll', handleSidebarScroll);
      timelineEl.removeEventListener('scroll', handleTimelineScroll);
    };
  }, []);

  useEffect(() => {
    const timelineEl = timelineRef.current;
    if (!timelineEl) return;
    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const daysFromStart = differenceInDays(TODAY, rangeStart);
        const todayLeft = daysFromStart * COL_WIDTH;
        const todayRight = todayLeft + COL_WIDTH;
        const scrollLeft = timelineEl.scrollLeft;
        const viewportRight = scrollLeft + timelineEl.clientWidth;
        const isVisible = todayRight > scrollLeft && todayLeft < viewportRight;
        setIsTodayVisible(isVisible);

        if (!hasScrolledToToday) {
          return;
        }

        const scrollRight = timelineEl.scrollWidth - scrollLeft - timelineEl.clientWidth;
        if (scrollRight < SCROLL_THRESHOLD) {
          loadMoreFuture();
        }

        if (scrollLeft < SCROLL_THRESHOLD) {
          loadMorePast();
        }
      });
    };
    timelineEl.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      timelineEl.removeEventListener('scroll', handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [hasScrolledToToday, rangeStart, columns.length]);

  return (
    <MainLayout
      fullWidth
      teams={visibleTeams}
      employees={allEmployees}
      events={timelineEvents}
      eventTypes={eventTypes}
      selectedTeamId={selectedTeamId}
      onTeamChange={setSelectedTeamId}
      onAddEmployee={handleAddEmployee}
      onRemoveEmployee={handleRemoveEmployee}
      onUpdateEmployee={handleUpdateEmployee}
      onAddTeam={handleAddTeam}
      onUpdateTeam={handleUpdateTeam}
      onRemoveTeam={handleRemoveTeam}
      onLogout={handleLogout}
    >
      <LegendChips
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
        onToggleAll={toggleAllFilters}
        eventTypes={eventTypes}
        onAddEventClick={() => setShowAddEventForm(true)}
        onManageEventTypesClick={() => setShowManageEventTypes(true)}
        canManageEventTypes={canManageEventTypes}
      />

      <AddEventModal
        open={showAddEventForm}
        onOpenChange={setShowAddEventForm}
        employees={teamEmployees}
        eventTypes={eventTypes}
        currentUserRole={me?.role}
        currentUserEmployeeId={me?.employeeId ?? null}
        onSubmit={handleAddEvent}
      />

      {canManageEventTypes && (
        <ManageEventTypesModal
          open={showManageEventTypes}
          onOpenChange={setShowManageEventTypes}
          teams={visibleTeams}
          employees={allEmployees}
          events={timelineEvents}
          eventTypeConfigs={eventTypeConfigs}
          restrictVisibilityScopeToTeam={me?.role === "MANAGER"}
          canManageEventType={canManageEventType}
          onAddEventType={handleAddEventType}
          onUpdateEventType={handleUpdateEventType}
          onRemoveEventType={handleRemoveEventType}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[280px] shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col min-h-0">
          <div className="p-4 border-b border-sidebar-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <div ref={sidebarRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
            {(() => {
              const layoutInfo = rowLayouts.get(COMPANY_ROW_ID);
              return (
                <CompanyRow
                  isSelected={selectedEmployeeId === COMPANY_ROW_ID}
                  onClick={() => {
                    if (layoutInfo?.hasOverflow) {
                      toggleExpand(COMPANY_ROW_ID);
                    }
                    setSelectedEmployeeId(COMPANY_ROW_ID);
                  }}
                  height={layoutInfo?.height ?? 45}
                  hasOverflow={layoutInfo?.hasOverflow ?? false}
                  isExpanded={expandedRows.has(COMPANY_ROW_ID)}
                />
              );
            })()}

            {teamEmployees.map(employee => {
              const layoutInfo = rowLayouts.get(employee.id);
              return (
                <EmployeeRow
                  key={employee.id}
                  employee={employee}
                  isSelected={employee.id === selectedEmployeeId}
                  onClick={() => {
                    if (layoutInfo?.hasOverflow) {
                      toggleExpand(employee.id);
                    }
                    setSelectedEmployeeId(employee.id);
                  }}
                  height={layoutInfo?.height ?? 45}
                  hasOverflow={layoutInfo?.hasOverflow ?? false}
                  isExpanded={expandedRows.has(employee.id)}
                />
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div ref={timelineRef} className="flex-1 overflow-auto scrollbar-thin">
            <Timeline
              rowIds={allRowIds}
              eventsByRow={eventsByRow}
              eventTypes={eventTypes}
              columns={columns}
              colWidth={COL_WIDTH}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              expandedRows={expandedRows}
              onToggleExpand={toggleExpand}
              rowLayouts={rowLayouts}
              onJumpToToday={scrollToToday}
            />
          </div>

          {!isTodayVisible && (
            <button
              onClick={scrollToToday}
              className="fixed bottom-4 right-4 z-30 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg hover:bg-primary/90 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 sm:bottom-6 sm:right-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Go to today
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
