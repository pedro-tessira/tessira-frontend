import { useParams, Navigate } from 'react-router-dom';
import { useMemo, useState, useRef, useEffect } from 'react';
import { subMonths, addMonths, differenceInDays, format } from 'date-fns';
import { Eye, Calendar, Building2, Users, User } from 'lucide-react';
import { COMPANY_ROW_ID, EventScope, TimelineEvent } from '@/lib/types';
import { generateDayColumns } from '@/lib/dateUtils';
import { getShareById } from '@/lib/shareUtils';
import { Timeline } from '@/components/Timeline';
import { EmployeeRow } from '@/components/EmployeeRow';
import { CompanyRow } from '@/components/CompanyRow';
import { useRowHeights } from '@/hooks/useRowHeights';
import { useTeams } from '@/queries/useTeams';
import { useEmployees } from '@/queries/useEmployees';
import { useEventTypes } from '@/queries/useEventTypes';
import { useTimeline } from '@/queries/useTimeline';
import { employeeEventsQueryOptions } from '@/queries/useEmployeeEvents';
import { useQueries } from '@tanstack/react-query';
import { getEventColorClass } from '@/lib/eventColors';

const COL_WIDTH = 80;
const TODAY = new Date();
const INITIAL_MONTHS_BEFORE = 2;
const INITIAL_MONTHS_AFTER = 4;
const LOAD_MORE_MONTHS = 3;
const SCROLL_THRESHOLD = 500;

const getScopeIcon = (scope: EventScope) => {
  if (scope === 'COMPANY') return Building2;
  if (scope === 'TEAM') return Users;
  return User;
};

export default function SharedView() {
  const { shareId } = useParams<{ shareId: string }>();
  const shareData = shareId ? getShareById(shareId) : null;

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [rangeStart, setRangeStart] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth() - INITIAL_MONTHS_BEFORE, 1));
  const [rangeEnd, setRangeEnd] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth() + INITIAL_MONTHS_AFTER + 1, 0));

  const sidebarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);

  if (!shareData) {
    return <Navigate to="/" replace />;
  }

  const { data: teams = [] } = useTeams();
  const selectedTeam = teams.find(team => team.id === shareData.teamId);
  const { data: employees = [] } = useEmployees(shareData.teamId, '');
  const { data: eventTypes = [] } = useEventTypes(shareData.teamId);

  const from = format(rangeStart, 'yyyy-MM-dd');
  const to = format(rangeEnd, 'yyyy-MM-dd');
  const eventTypeIds = useMemo(() => eventTypes.map(eventType => eventType.id), [eventTypes]);

  const { data: timeline } = useTimeline(
    {
      teamId: shareData.teamId,
      from,
      to,
      eventTypeIds,
    },
    {
      enabled: !!shareData.teamId && eventTypes.length > 0,
    }
  );

  const expandedEmployeeIds = useMemo(
    () => Array.from(expandedRows).filter(id => id !== COMPANY_ROW_ID),
    [expandedRows]
  );

  const expandedEmployeeQueries = useQueries({
    queries: expandedEmployeeIds.map(employeeId => ({
      ...employeeEventsQueryOptions({
        teamId: shareData.teamId,
        employeeId,
        from,
        to,
        eventTypeIds,
      }),
      enabled: !!shareData.teamId && eventTypes.length > 0,
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
    const companyEvents = timeline.companyLane.events.map(event => ({
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
    map.set(COMPANY_ROW_ID, timeline.companyLane.aggregation);
    timeline.rows.forEach(row => {
      map.set(row.employee.id, row.aggregation);
    });
    return map;
  }, [timeline]);

  const teamEmployees = useMemo(() => employees, [employees]);

  const columns = useMemo(() => generateDayColumns(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  const allRowIds = useMemo(
    () => [COMPANY_ROW_ID, ...teamEmployees.map(e => e.id)],
    [teamEmployees]
  );

  const rowLayouts = useRowHeights(allRowIds, timelineEvents, rangeStart, rangeEnd, COL_WIDTH, expandedRows, aggregationByRow);

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
  }, [hasScrolledToToday, columns.length, rangeStart]);

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
      const scrollRight = timelineEl.scrollWidth - timelineEl.scrollLeft - timelineEl.clientWidth;
      if (scrollRight < SCROLL_THRESHOLD) loadMoreFuture();
      if (timelineEl.scrollLeft < SCROLL_THRESHOLD) loadMorePast();
    };

    timelineEl.addEventListener('scroll', handleScroll);
    return () => timelineEl.removeEventListener('scroll', handleScroll);
  }, [rangeStart]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TH</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">Horizon</h1>
        </div>

        <div className="flex items-center gap-2 ml-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Team: {selectedTeam?.name ?? 'Unknown'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium">
          <Eye className="w-4 h-4" />
          Read-only view
        </div>
      </header>

      <div className="h-12 bg-card border-b border-border flex items-center px-6 gap-3 shrink-0">
        <span className="text-sm text-muted-foreground mr-2">Event types:</span>
        {eventTypes.map(eventType => {
          const Icon = getScopeIcon(eventType.scope);
          return (
            <div
              key={eventType.id}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getEventColorClass(eventType, eventType.id)}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {eventType.name}
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[280px] shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
          <div className="p-4 border-b border-sidebar-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search employee..."
                  value=""
                  readOnly
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none"
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
        </div>
      </div>
    </div>
  );
}
