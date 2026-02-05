import { useParams, Navigate } from 'react-router-dom';
import { useMemo, useState, useRef, useEffect } from 'react';
import { subMonths, addMonths, subYears, addYears, addDays, differenceInDays, format, startOfMonth, endOfMonth } from 'date-fns';
import { Eye, Calendar, Calendar as CalendarIcon, Building2, User } from 'lucide-react';
import { COMPANY_ROW_ID, EventTypeTimelineScope, TimelineEvent } from '@/lib/types';
import { generateDayColumns } from '@/lib/dateUtils';
import { getShareById } from '@/lib/shareUtils';
import { Timeline } from '@/components/Timeline';
import { EmployeeRow } from '@/components/EmployeeRow';
import { CompanyRow } from '@/components/CompanyRow';
import { useRowHeights } from '@/hooks/useRowHeights';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
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

const getScopeIcon = (scope: EventTypeTimelineScope) => {
  if (scope === 'GLOBAL') return Building2;
  return User;
};

export default function SharedView() {
  const { shareId } = useParams<{ shareId: string }>();
  const shareData = shareId ? getShareById(shareId) : null;

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [anchorMonth, setAnchorMonth] = useState(() => startOfMonth(TODAY));
  const [pendingJumpMonth, setPendingJumpMonth] = useState<Date | null>(null);
  const [isTodayVisible, setIsTodayVisible] = useState(false);

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
    if (!timeline) return { timelineEvents: [], eventsByRow: map };
    const companyEvents = timeline.globalLane.events.map(event => ({
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
      const rowEvents = sourceEvents.map(event => ({
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

  const columns = useMemo(() => generateDayColumns(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  const allRowIds = useMemo(
    () => [COMPANY_ROW_ID, ...teamEmployees.map(e => e.id)],
    [teamEmployees]
  );

  const rowLayouts = useRowHeights(allRowIds, eventsByRow, rangeStart, rangeEnd, COL_WIDTH, expandedRows, aggregationByRow);

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

  const jumpToMonth = (date: Date) => {
    const targetMonth = startOfMonth(date);
    setAnchorMonth(targetMonth);
    if (targetMonth < rangeStart) {
      setRangeStart(targetMonth);
    }
    if (targetMonth > rangeEnd) {
      setRangeEnd(endOfMonth(targetMonth));
    }
    setPendingJumpMonth(targetMonth);
  };

  useEffect(() => {
    if (!pendingJumpMonth || !timelineRef.current || columns.length === 0) return;
    const daysFromStart = differenceInDays(pendingJumpMonth, rangeStart);
    if (daysFromStart < 0) return;
    const scrollPosition = daysFromStart * COL_WIDTH;
    timelineRef.current.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth',
    });
    setPendingJumpMonth(null);
  }, [pendingJumpMonth, rangeStart, columns.length]);

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
      const daysFromStart = differenceInDays(TODAY, rangeStart);
      const todayLeft = daysFromStart * COL_WIDTH;
      const todayRight = todayLeft + COL_WIDTH;
      const scrollLeft = timelineEl.scrollLeft;
      const viewportRight = scrollLeft + timelineEl.clientWidth;
      const visible = todayRight > scrollLeft && todayLeft < viewportRight;
      setIsTodayVisible(visible);

      const centerIndex = Math.round((timelineEl.scrollLeft + timelineEl.clientWidth / 2 - COL_WIDTH / 2) / COL_WIDTH);
      const clampedIndex = Math.min(Math.max(centerIndex, 0), Math.max(columns.length - 1, 0));
      const centerDate = addDays(rangeStart, clampedIndex);
      const centerMonth = startOfMonth(centerDate);
      setAnchorMonth(prev => (prev.getTime() === centerMonth.getTime() ? prev : centerMonth));

      const scrollRight = timelineEl.scrollWidth - timelineEl.scrollLeft - timelineEl.clientWidth;
      if (scrollRight < SCROLL_THRESHOLD) loadMoreFuture();
      if (timelineEl.scrollLeft < SCROLL_THRESHOLD) loadMorePast();
    };

    timelineEl.addEventListener('scroll', handleScroll);
    handleScroll();
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
          const Icon = getScopeIcon(eventType.timelineScope);
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
        <div className="ml-auto flex items-center gap-2">
          <span className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => jumpToMonth(subMonths(anchorMonth, 1))}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-sm font-semibold text-foreground">
              {format(anchorMonth, 'MMMM yyyy')}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
                  aria-label="Pick month"
                >
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-3">
                <div className="flex items-center justify-between gap-2 px-1 pb-2">
                  <button
                    type="button"
                    onClick={() => setAnchorMonth(prev => subYears(prev, 1))}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
                    aria-label="Previous year"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="text-sm font-semibold text-foreground">
                    {format(anchorMonth, 'yyyy')}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnchorMonth(prev => addYears(prev, 1))}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
                    aria-label="Next year"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 p-1">
                  {Array.from({ length: 12 }).map((_, index) => {
                    const monthDate = new Date(anchorMonth.getFullYear(), index, 1);
                    const isActive = monthDate.getFullYear() === anchorMonth.getFullYear() && monthDate.getMonth() === anchorMonth.getMonth();
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => jumpToMonth(monthDate)}
                        className={`h-8 px-2 rounded-md border text-xs font-medium transition-colors ${
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                      >
                        {format(monthDate, 'MMM')}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
            <button
              type="button"
              onClick={() => jumpToMonth(addMonths(anchorMonth, 1))}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
              aria-label="Next month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
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
    </div>
  );
}
