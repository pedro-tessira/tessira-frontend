import { useState, useMemo, useRef, useEffect } from 'react';
import { subMonths, addMonths, differenceInDays, format } from 'date-fns';
import { useQueries } from '@tanstack/react-query';
import {
  COMPANY_ROW_ID,
  EventLevel,
  EventScope,
  EventTypeConfig,
  EventTypeDto,
  TimelineEvent,
  TeamEmployeeDto,
} from '@/lib/types';
import { generateDayColumns } from '@/lib/dateUtils';
import { HeaderBar } from './HeaderBar';
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

const COL_WIDTH = 80;
const TODAY = new Date();
const INITIAL_MONTHS_BEFORE = 2;
const INITIAL_MONTHS_AFTER = 4;
const LOAD_MORE_MONTHS = 3;
const SCROLL_THRESHOLD = 500; // pixels from edge to trigger load

const mapScopeToLevel = (scope: EventScope): EventLevel => {
  if (scope === 'TEAM') return 'team';
  if (scope === 'GLOBAL') return 'company';
  return 'individual';
};

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
  const { data: teams = [] } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showManageEventTypes, setShowManageEventTypes] = useState(false);
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);
  const [isTodayVisible, setIsTodayVisible] = useState(true);

  const [rangeStart, setRangeStart] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth() - INITIAL_MONTHS_BEFORE, 1));
  const [rangeEnd, setRangeEnd] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth() + INITIAL_MONTHS_AFTER + 1, 0));

  const sidebarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const lastTeamIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (teams.length === 0) return;
    if (!selectedTeamId || !teams.find(team => team.id === selectedTeamId)) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    setExpandedRows(new Set());
    setSelectedEmployeeId(null);
  }, [selectedTeamId]);

  const { data: employees = [] } = useEmployees(selectedTeamId, searchQuery);
  const { data: eventTypes = [] } = useEventTypes(selectedTeamId);

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
      const employeeName = query.data?.employee.displayName;
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

  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    if (!timeline) return [];
    const companyEvents = timeline.globalLane.events.map(event => ({
      ...event,
      eventTypeId: event.eventTypeId ?? event.eventType?.id ?? null,
      employeeId: null,
    }));
    const rowEvents = timeline.rows.flatMap(row => {
      const expandedEvents = expandedEventsByEmployee.get(row.employee.id);
      const sourceEvents = expandedEvents ?? row.events;
      return sourceEvents.map(event => ({
        ...event,
        eventTypeId: event.eventTypeId ?? event.eventType?.id ?? null,
        employeeId: row.employee.id,
        employeeName: row.employee.displayName,
      }));
    });
    return [...companyEvents, ...rowEvents];
  }, [expandedEventsByEmployee, timeline]);

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
    timelineEvents,
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
      const daysFromStart = differenceInDays(TODAY, rangeStart);
      const scrollPosition = daysFromStart * COL_WIDTH - timelineRef.current.clientWidth / 2 + COL_WIDTH / 2;
      timelineRef.current.scrollLeft = Math.max(0, scrollPosition);
      setHasScrolledToToday(true);
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
    title: string;
    startDate: string;
    endDate: string;
    eventTypeId: string;
    scope: EventScope;
    employeeId?: string | null;
  }) => {
    createEventMutation.mutate(
      {
        title: payload.title,
        startDate: payload.startDate,
        endDate: payload.endDate,
        eventTypeId: payload.eventTypeId,
        scope: payload.scope,
        employeeId: payload.employeeId ?? null,
        teamId: payload.scope === 'TEAM' ? selectedTeamId : null,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Event added',
            description: `"${payload.title}" has been added successfully.`,
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
          description: `${employee.displayName} is already in this team.`,
        });
        return;
      }
      createTeamMemberMutation.mutate(
        { teamId, payload: { employeeId: employee.id, roleInTeam: 'MEMBER' } },
        {
          onSuccess: () => {
            toast({
              title: 'Member added',
              description: `${employee.displayName} was added to the team.`,
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

  const resolveEventTypeScope = (level: EventLevel): EventScope => {
    if (level === 'team') return 'TEAM';
    if (level === 'company') return 'GLOBAL';
    return 'INDIVIDUAL';
  };

  const resolveEventTypeTeamId = (level: EventLevel, teamIds?: string[]) => {
    if (level === 'team') {
      return teamIds?.[0] ?? selectedTeamId ?? null;
    }
    return null;
  };

  const resolveEventTypeTeamIds = (level: EventLevel, teamIds?: string[], isGlobal?: boolean) => {
    if (level !== 'company') return null;
    if (isGlobal) return [];
    return teamIds ?? [];
  };

  const handleAddEventType = (eventType: Omit<EventTypeConfig, 'id'>) => {
    createEventTypeMutation.mutate(
      {
        name: eventType.label,
        code: eventType.code || deriveEventTypeCode(eventType.label),
        scope: resolveEventTypeScope(eventType.level),
        teamId: resolveEventTypeTeamId(eventType.level, eventType.teamIds),
        teamIds: resolveEventTypeTeamIds(eventType.level, eventType.teamIds, eventType.isGlobal),
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
          scope: resolveEventTypeScope(merged.level),
          teamId: resolveEventTypeTeamId(merged.level, merged.teamIds),
          teamIds: resolveEventTypeTeamIds(merged.level, merged.teamIds, merged.isGlobal),
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
      color: getEventColorClass(eventType, eventType.id),
      source: eventType.source ?? 'MANUAL',
      level: mapScopeToLevel(eventType.scope),
      teamIds: eventType.teamIds ?? (eventType.teamId ? [eventType.teamId] : undefined),
      isGlobal: eventType.scope === 'GLOBAL' && !(eventType.teamIds?.length || eventType.teamId),
    }));
  }, [eventTypes]);

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
    const handleScroll = () => {
      const daysFromStart = differenceInDays(TODAY, rangeStart);
      const todayLeft = daysFromStart * COL_WIDTH;
      const todayRight = todayLeft + COL_WIDTH;
      const scrollLeft = timelineEl.scrollLeft;
      const viewportRight = scrollLeft + timelineEl.clientWidth;
      const isVisible = todayRight > scrollLeft && todayLeft < viewportRight;
      setIsTodayVisible(isVisible);

      const scrollRight = timelineEl.scrollWidth - scrollLeft - timelineEl.clientWidth;
      if (scrollRight < SCROLL_THRESHOLD) {
        loadMoreFuture();
      }

      if (scrollLeft < SCROLL_THRESHOLD) {
        loadMorePast();
      }
    };
    timelineEl.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => timelineEl.removeEventListener('scroll', handleScroll);
  }, [rangeStart]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <HeaderBar
        teams={teams}
        employees={allEmployees}
        events={timelineEvents}
        selectedTeamId={selectedTeamId}
        onTeamChange={setSelectedTeamId}
        onAddEmployee={handleAddEmployee}
        onRemoveEmployee={handleRemoveEmployee}
        onUpdateEmployee={handleUpdateEmployee}
        onAddTeam={handleAddTeam}
        onUpdateTeam={handleUpdateTeam}
        onRemoveTeam={handleRemoveTeam}
        onLogout={handleLogout}
      />

      <LegendChips
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
        onToggleAll={toggleAllFilters}
        eventTypes={eventTypes}
        onAddEventClick={() => setShowAddEventForm(true)}
        onManageEventTypesClick={() => setShowManageEventTypes(true)}
      />

      <AddEventModal
        open={showAddEventForm}
        onOpenChange={setShowAddEventForm}
        employees={teamEmployees}
        eventTypes={eventTypes}
        onSubmit={handleAddEvent}
      />

      <ManageEventTypesModal
        open={showManageEventTypes}
        onOpenChange={setShowManageEventTypes}
        teams={teams}
        employees={allEmployees}
        events={timelineEvents}
        eventTypeConfigs={eventTypeConfigs}
        onAddEventType={handleAddEventType}
        onUpdateEventType={handleUpdateEventType}
        onRemoveEventType={handleRemoveEventType}
      />

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
                  height={layoutInfo?.height ?? 56}
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
                  height={layoutInfo?.height ?? 56}
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
              events={timelineEvents}
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
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg hover:bg-primary/90 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Go to today
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
