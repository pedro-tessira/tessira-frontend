import { useMemo, useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { differenceInDays, addMonths, subMonths, format } from "date-fns";
import { Calendar, Eye } from "lucide-react";
import { COMPANY_ROW_ID, TimelineEvent } from "@/lib/types";
import { generateDayColumns } from "@/lib/dateUtils";
import { Timeline } from "@/components/Timeline";
import { EmployeeRow } from "@/components/EmployeeRow";
import { CompanyRow } from "@/components/CompanyRow";
import { useRowHeights } from "@/hooks/useRowHeights";
import { getEventColorClass } from "@/lib/eventColors";
import { Skeleton } from "@/components/ui/skeleton";
import { useShare } from "@/queries/useShare";

const COL_WIDTH = 80;
const TODAY = new Date();
const INITIAL_MONTHS_BEFORE = 2;
const INITIAL_MONTHS_AFTER = 4;
const LOAD_MORE_MONTHS = 3;
const SCROLL_THRESHOLD = 500;

const isHexColor = (value?: string | null) => {
  if (!value) return false;
  return /^#([0-9a-fA-F]{6})$/.test(value);
};

export default function SharePage() {
  const { token } = useParams<{ token: string }>();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState(
    () => new Date(TODAY.getFullYear(), TODAY.getMonth() - INITIAL_MONTHS_BEFORE, 1)
  );
  const [rangeEnd, setRangeEnd] = useState(
    () => new Date(TODAY.getFullYear(), TODAY.getMonth() + INITIAL_MONTHS_AFTER + 1, 0)
  );
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);
  const [isTodayVisible, setIsTodayVisible] = useState(true);

  const from = format(rangeStart, "yyyy-MM-dd");
  const to = format(rangeEnd, "yyyy-MM-dd");
  const { data, isLoading, error } = useShare({ token: token ?? "", from, to });

  useEffect(() => {
    setHasScrolledToToday(false);
  }, [token]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const timeline = data?.timeline;
  const shareTitle = data?.title?.trim();

  const companyLane = timeline?.globalLane ?? timeline?.companyLane;
  const rows = timeline?.rows ?? [];
  const teamEmployees = useMemo(() => rows.map(row => row.employee), [rows]);

  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    if (!timeline) return [];
    const companyEvents = (companyLane?.events ?? []).map(event => ({
      ...event,
      eventTypeId: event.eventTypeId ?? event.eventType?.id ?? null,
      employeeId: null,
      canEdit: false,
      canDelete: false,
    }));
    const rowEvents = rows.flatMap(row =>
      row.events.map(event => ({
        ...event,
        eventTypeId: event.eventTypeId ?? event.eventType?.id ?? null,
        employeeId: row.employee.id,
        employeeName: row.employee.displayName,
        canEdit: false,
        canDelete: false,
      }))
    );
    return [...companyEvents, ...rowEvents];
  }, [companyLane?.events, rows, timeline]);

  const aggregationByRow = useMemo(() => {
    const map = new Map<string, { hasMore: boolean; hiddenCount: number }>();
    if (!timeline) return map;
    if (companyLane?.aggregation) {
      map.set(COMPANY_ROW_ID, companyLane.aggregation);
    }
    rows.forEach(row => {
      if (row.aggregation) {
        map.set(row.employee.id, row.aggregation);
      }
    });
    return map;
  }, [companyLane?.aggregation, rows, timeline]);

  const columns = useMemo(() => generateDayColumns(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  const allRowIds = useMemo(
    () => [COMPANY_ROW_ID, ...teamEmployees.map(employee => employee.id)],
    [teamEmployees]
  );

  const rowLayouts = useRowHeights(
    allRowIds,
    timelineEvents,
    rangeStart,
    rangeEnd,
    COL_WIDTH,
    new Set(),
    aggregationByRow
  );

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
        behavior: "smooth",
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

    sidebar.addEventListener("scroll", handleSidebarScroll);
    timelineEl.addEventListener("scroll", handleTimelineScroll);

    return () => {
      sidebar.removeEventListener("scroll", handleSidebarScroll);
      timelineEl.removeEventListener("scroll", handleTimelineScroll);
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
      if (scrollRight < SCROLL_THRESHOLD) loadMoreFuture();
      if (scrollLeft < SCROLL_THRESHOLD) loadMorePast();
    };

    timelineEl.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => timelineEl.removeEventListener("scroll", handleScroll);
  }, [rangeStart]);

  const eventTypeChips = useMemo(() => {
    const map = new Map<string, { id: string; name: string; colorClass?: string; colorHex?: string }>();
    timelineEvents.forEach(event => {
      const id = event.eventTypeId ?? event.eventType?.id;
      if (!id) return;
      if (map.has(id)) return;
      const name = event.eventType?.name ?? event.eventType?.code ?? "Event type";
      const colorHex = isHexColor(event.eventType?.color) ? event.eventType?.color : undefined;
      map.set(id, {
        id,
        name,
        colorClass: colorHex ? undefined : getEventColorClass(event.eventType, id),
        colorHex,
      });
    });
    return Array.from(map.values());
  }, [timelineEvents]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-6">
          <Skeleton className="h-[600px] w-[280px]" />
          <Skeleton className="h-[600px] flex-1" />
        </div>
      </div>
    );
  }

  if (!data) {
    const isInvalid = error?.status === 404 || error?.status === 410;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-3">
          <h1 className="text-xl font-semibold text-foreground">
            {isInvalid ? "Link invalid or expired" : "Unable to load share"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isInvalid
              ? "This share link is no longer available. Ask the owner for a new link."
              : "Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-6 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-foreground">
            {shareTitle ? `${shareTitle}` : "Shared timeline"}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{data.team.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium">
          <Eye className="w-4 h-4" />
          Read-only view
        </div>
      </header>

      <div className="h-12 bg-card border-b border-border flex items-center px-6 gap-3 shrink-0">
        <span className="text-sm text-muted-foreground mr-2">Event types:</span>
        {eventTypeChips.length === 0 ? (
          <span className="text-sm text-muted-foreground">No events</span>
        ) : (
          eventTypeChips.map(eventType => (
            <div
              key={eventType.id}
              className={`px-3 py-1 rounded-full text-xs font-medium ${eventType.colorClass ?? ""}`}
              style={eventType.colorHex ? { backgroundColor: eventType.colorHex, color: "white" } : undefined}
            >
              {eventType.name}
            </div>
          ))
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[280px] shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
          <div className="p-4 border-b border-sidebar-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
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
            {companyLane && (
              <CompanyRow
                isSelected={selectedEmployeeId === COMPANY_ROW_ID}
                onClick={() => setSelectedEmployeeId(COMPANY_ROW_ID)}
                height={rowLayouts.get(COMPANY_ROW_ID)?.height ?? 56}
                hasOverflow={rowLayouts.get(COMPANY_ROW_ID)?.hasOverflow ?? false}
                isExpanded={false}
              />
            )}

            {teamEmployees.map(employee => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                isSelected={employee.id === selectedEmployeeId}
                onClick={() => setSelectedEmployeeId(employee.id)}
                height={rowLayouts.get(employee.id)?.height ?? 56}
                hasOverflow={rowLayouts.get(employee.id)?.hasOverflow ?? false}
                isExpanded={false}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div ref={timelineRef} className="flex-1 overflow-auto scrollbar-thin">
            <Timeline
              rowIds={companyLane ? allRowIds : allRowIds.filter(id => id !== COMPANY_ROW_ID)}
              events={timelineEvents}
              columns={columns}
              colWidth={COL_WIDTH}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              expandedRows={new Set()}
              onToggleExpand={() => {}}
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
