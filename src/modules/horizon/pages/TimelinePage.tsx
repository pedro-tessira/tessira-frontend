import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Share2,
  Search,
  Globe,
  User,
  Layers,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  timelineEvents,
  horizonEmployees,
  horizonTeams,
  availabilityWindows,
  allocations,
} from "../data";
import type { EventType, TimelineEvent, AvailabilityWindow, Allocation } from "../types";
import AllocationDetailPanel from "../components/AllocationDetailPanel";
import AddAllocationDialog from "../components/AddAllocationDialog";
import EventDetailPanel from "../components/EventDetailPanel";

// ── Constants ────────────────────────────────────────────
const MAX_VISIBLE_EVENTS = 2;
const ROW_EVENT_HEIGHT = 22;
const ALLOC_HEIGHT = 20;
const ROW_GAP = 2;
const ROW_PADDING = 3;
const DAY_WIDTH = 40;

const EVENT_TYPE_FILTERS: { type: EventType | "all"; label: string }[] = [
  { type: "all", label: "All" },
  { type: "all_hands", label: "All Hands" },
  { type: "team_sync", label: "Team Sync" },
  { type: "vacation", label: "Vacation" },
  { type: "pto", label: "PTO" },
  { type: "milestone", label: "Milestone" },
  { type: "incident", label: "Incident" },
  { type: "onboarding", label: "Onboarding" },
  { type: "sprint", label: "Sprint" },
  { type: "release", label: "Release" },
  { type: "custom", label: "Custom" },
];

const eventColors: Record<EventType, string> = {
  all_hands: "bg-primary/20 border-primary/40 text-primary",
  team_sync: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  vacation: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  pto: "bg-orange-500/15 border-orange-500/30 text-orange-400",
  milestone: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
  incident: "bg-destructive/15 border-destructive/30 text-red-400",
  onboarding: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
  offboarding: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  sprint: "bg-primary/15 border-primary/30 text-primary",
  release: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
  custom: "bg-muted border-border text-muted-foreground",
};

const eventTypeLabels: Record<EventType, string> = {
  all_hands: "All Hands",
  team_sync: "Team Sync",
  vacation: "Vacation",
  pto: "PTO",
  milestone: "Milestone",
  incident: "Incident",
  onboarding: "Onboarding",
  offboarding: "Offboarding",
  sprint: "Sprint",
  release: "Release",
  custom: "Custom",
};

const availStatusColors: Record<AvailabilityWindow["status"], string> = {
  available: "bg-emerald-500/10",
  partial: "bg-amber-500/10",
  unavailable: "bg-red-500/10",
};

// ── Helpers ──────────────────────────────────────────────
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getMonthLabel(start: Date, end: Date): string {
  const sm = start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const em = end.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return sm === em ? sm : `${start.toLocaleDateString(undefined, { month: "short" })} – ${end.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
}

function assignEventSlots(events: TimelineEvent[]): { event: TimelineEvent; slot: number }[] {
  const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate));
  const result: { event: TimelineEvent; slot: number }[] = [];
  const slotEnds: string[] = [];

  for (const ev of sorted) {
    let placed = false;
    for (let s = 0; s < slotEnds.length; s++) {
      if (ev.startDate > slotEnds[s]) {
        slotEnds[s] = ev.endDate;
        result.push({ event: ev, slot: s });
        placed = true;
        break;
      }
    }
    if (!placed) {
      result.push({ event: ev, slot: slotEnds.length });
      slotEnds.push(ev.endDate);
    }
  }
  return result;
}

function assignAllocSlots(allocs: Allocation[]): { alloc: Allocation; slot: number }[] {
  const sorted = [...allocs].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const result: { alloc: Allocation; slot: number }[] = [];
  const slotEnds: string[] = [];

  for (const a of sorted) {
    let placed = false;
    for (let s = 0; s < slotEnds.length; s++) {
      if (a.startDate > slotEnds[s]) {
        slotEnds[s] = a.endDate;
        result.push({ alloc: a, slot: s });
        placed = true;
        break;
      }
    }
    if (!placed) {
      result.push({ alloc: a, slot: slotEnds.length });
      slotEnds.push(a.endDate);
    }
  }
  return result;
}

// ── Layer Types ──────────────────────────────────────────
type TimelineLayer = "availability" | "allocations" | "events";

// ── Component ────────────────────────────────────────────
export default function TimelinePage() {
  const [range, setRange] = useState<"2w" | "4w" | "8w">("4w");
  const [teamFilter, setTeamFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [todayVisible, setTodayVisible] = useState(true);
  const [layers, setLayers] = useState<Set<TimelineLayer>>(new Set(["availability", "allocations", "events"]));
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [addAllocOpen, setAddAllocOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [addAllocPrefill, setAddAllocPrefill] = useState<{ employeeId?: string; startDate?: string; endDate?: string }>({});

  // Drag-to-create state
  const [dragState, setDragState] = useState<{
    empId: string;
    startDayIndex: number;
    currentDayIndex: number;
  } | null>(null);
  const isDragging = useRef(false);

  // Drag-to-resize state (works for both allocations and events)
  const [resizeState, setResizeState] = useState<{
    itemId: string;
    itemType: "allocation" | "event";
    edge: "left" | "right";
    originalStart: string;
    originalEnd: string;
    currentDayIndex: number;
  } | null>(null);
  const isResizing = useRef(false);

  const toggleLayer = (layer: TimelineLayer) => {
    setLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const rangeDays = range === "2w" ? 14 : range === "4w" ? 28 : 56;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangeStart = addDays(today, offset * 7 - 3);
  const rangeEnd = addDays(rangeStart, rangeDays);
  const todayISO = toISO(today);
  const gridWidth = rangeDays * DAY_WIDTH;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const todayPx = ((today.getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH + 192;
    const check = () => {
      const scrollLeft = el.scrollLeft;
      const viewWidth = el.clientWidth;
      const inRange = todayPx >= 192 && todayPx <= 192 + gridWidth;
      const inView = inRange && todayPx >= scrollLeft && todayPx <= scrollLeft + viewWidth;
      setTodayVisible(inView);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, [rangeStart, rangeDays, offset, gridWidth]);

  const scrollToToday = useCallback(() => {
    setOffset(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el) return;
        const newRangeStart = addDays(today, -3);
        const todayPx = ((today.getTime() - newRangeStart.getTime()) / 86400000) * DAY_WIDTH + 192;
        el.scrollTo({ left: todayPx - el.clientWidth / 2, behavior: "smooth" });
      });
    });
  }, []);

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const dates = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < rangeDays; i++) arr.push(addDays(rangeStart, i));
    return arr;
  }, [rangeDays, offset]);

  const filteredEmployees = useMemo(() => {
    let emps = horizonEmployees;
    if (teamFilter !== "all") emps = emps.filter((e) => e.teamId === teamFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      emps = emps.filter((e) => e.name.toLowerCase().includes(q));
    }
    return emps;
  }, [teamFilter, searchQuery]);

  const getEventsForLane = useCallback((empId: string | null): TimelineEvent[] => {
    return timelineEvents.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      const evEnd = new Date(e.endDate);
      const evStart = new Date(e.startDate);
      if (evEnd < rangeStart || evStart > rangeEnd) return false;

      if (empId === null) return e.isGlobal;
      if (e.employeeId === empId) return true;
      const emp = horizonEmployees.find((h) => h.id === empId);
      if (!e.employeeId && !e.isGlobal && e.teamId && emp && e.teamId === emp.teamId) return true;
      return false;
    });
  }, [typeFilter, rangeStart, rangeEnd]);

  const getAllocsForLane = useCallback((empId: string): Allocation[] => {
    return allocations.filter((a) => {
      if (a.employeeId !== empId) return false;
      const aEnd = new Date(a.endDate);
      const aStart = new Date(a.startDate);
      return !(aEnd < rangeStart || aStart > rangeEnd);
    });
  }, [rangeStart, rangeEnd]);

  const getAvailForDay = (empId: string, dayISO: string): AvailabilityWindow["status"] | null => {
    const w = availabilityWindows.find(
      (a) => a.employeeId === empId && a.startDate <= dayISO && a.endDate >= dayISO
    );
    return w?.status ?? null;
  };

  // ── Allocation Conflict Detection ──
  const conflicts = useMemo(() => {
    const result: { empId: string; empName: string; peakPct: number; peakDate: string }[] = [];
    for (const emp of filteredEmployees) {
      const empAllocs = allocations.filter((a) => a.employeeId === emp.id);
      if (empAllocs.length < 2) continue;
      let peak = 0;
      let peakDate = "";
      for (const d of dates) {
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        const iso = toISO(d);
        let dayTotal = 0;
        for (const a of empAllocs) {
          if (a.startDate <= iso && a.endDate >= iso) dayTotal += a.percentage;
        }
        if (dayTotal > peak) { peak = dayTotal; peakDate = iso; }
      }
      if (peak > 100) result.push({ empId: emp.id, empName: emp.name, peakPct: peak, peakDate });
    }
    return result;
  }, [filteredEmployees, dates]);

  const conflictSet = useMemo(() => new Set(conflicts.map((c) => c.empId)), [conflicts]);

  // ── Drag-to-create handlers ──
  const handleDragStart = useCallback((empId: string, dayIndex: number) => {
    isDragging.current = true;
    setDragState({ empId, startDayIndex: dayIndex, currentDayIndex: dayIndex });
  }, []);

  const handleDragMove = useCallback((dayIndex: number) => {
    if (!isDragging.current) return;
    setDragState((prev) => prev ? { ...prev, currentDayIndex: dayIndex } : null);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current || !dragState) {
      isDragging.current = false;
      setDragState(null);
      return;
    }
    isDragging.current = false;
    const minDay = Math.min(dragState.startDayIndex, dragState.currentDayIndex);
    const maxDay = Math.max(dragState.startDayIndex, dragState.currentDayIndex);
    // Need at least 1 day span
    if (maxDay - minDay >= 0) {
      const startDate = toISO(addDays(rangeStart, minDay));
      const endDate = toISO(addDays(rangeStart, maxDay));
      setAddAllocPrefill({ employeeId: dragState.empId, startDate, endDate });
      setAddAllocOpen(true);
    }
    setDragState(null);
  }, [dragState, rangeStart]);

  // ── Drag-to-resize handlers ──
  const handleResizeStart = useCallback((itemId: string, itemType: "allocation" | "event", edge: "left" | "right", originalStart: string, originalEnd: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    const edgeDate = new Date(edge === "left" ? originalStart : originalEnd);
    edgeDate.setHours(0, 0, 0, 0);
    const dayIndex = Math.round((edgeDate.getTime() - rangeStart.getTime()) / 86400000);
    setResizeState({ itemId, itemType, edge, originalStart, originalEnd, currentDayIndex: dayIndex });
  }, [rangeStart]);

  const handleResizeMove = useCallback((dayIndex: number) => {
    if (!isResizing.current) return;
    setResizeState((prev) => prev ? { ...prev, currentDayIndex: dayIndex } : null);
  }, []);

  const handleResizeEnd = useCallback(() => {
    if (!isResizing.current || !resizeState) {
      isResizing.current = false;
      setResizeState(null);
      return;
    }
    isResizing.current = false;
    const newDate = toISO(addDays(rangeStart, resizeState.currentDayIndex));
    const newStart = resizeState.edge === "left" ? newDate : resizeState.originalStart;
    const newEnd = resizeState.edge === "right" ? newDate : resizeState.originalEnd;
    if (newStart <= newEnd) {
      if (resizeState.itemType === "allocation") {
        const alloc = allocations.find((a) => a.id === resizeState.itemId);
        if (alloc) toast.success(`Allocation resized: ${alloc.employeeName} → ${alloc.initiative} (${formatDate(newStart)} – ${formatDate(newEnd)})`);
      } else {
        const evt = timelineEvents.find((e) => e.id === resizeState.itemId);
        if (evt) toast.success(`Event resized: ${evt.title} (${formatDate(newStart)} – ${formatDate(newEnd)})`);
      }
    }
    setResizeState(null);
  }, [resizeState, rangeStart]);

  // Global mouseup listener for drag & resize
  useEffect(() => {
    const onMouseUp = () => {
      if (isDragging.current) handleDragEnd();
      if (isResizing.current) handleResizeEnd();
    };
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [handleDragEnd, handleResizeEnd]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* ── Top Controls ── */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              {horizonTeams.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Share2 size={13} /> Share View
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus size={13} /> Add Event
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setAddAllocOpen(true)}>
            <Briefcase size={13} /> Add Allocation
          </Button>

          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOffset((o) => o - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <span className="text-xs font-medium px-2 min-w-[140px] text-center">
              {getMonthLabel(rangeStart, rangeEnd)}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOffset((o) => o + 1)}>
              <ChevronRight size={14} />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs ml-1" onClick={() => setOffset(0)}>Today</Button>
          </div>

          <div className="flex gap-0.5 rounded-md border border-border/50 p-0.5">
            {(["2w", "4w", "8w"] as const).map((r) => (
              <Button key={r} variant={range === r ? "secondary" : "ghost"} size="sm" className="h-6 text-[11px] px-2" onClick={() => setRange(r)}>{r}</Button>
            ))}
          </div>
        </div>

        {/* ── Layer Toggles + Event Type Filters ── */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-3 py-1.5">
            <Layers size={13} className="text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Layers</span>
            {(["availability", "allocations", "events"] as TimelineLayer[]).map((layer) => (
              <label key={layer} className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  checked={layers.has(layer)}
                  onCheckedChange={() => toggleLayer(layer)}
                  className="h-3.5 w-3.5"
                />
                <span className="text-[11px] capitalize">{layer}</span>
              </label>
            ))}
          </div>

          {layers.has("events") && (
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPE_FILTERS.map((f) => (
                <Button key={f.type} variant={typeFilter === f.type ? "secondary" : "ghost"} size="sm" className="h-6 text-[11px] px-2" onClick={() => setTypeFilter(f.type)}>
                  {f.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* ── Allocation Conflicts Alert ── */}
        {conflicts.length > 0 && layers.has("allocations") && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Over-allocation — {conflicts.length} engineer{conflicts.length !== 1 ? "s" : ""} exceed{conflicts.length === 1 ? "s" : ""} 100%
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {conflicts.map((c) => (
                <Badge key={c.empId} variant="secondary" className="text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
                  {c.empName} — peak {c.peakPct}% on {formatDate(c.peakDate)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* ── Calendar Grid ── */}
        <div className="rounded-lg border border-border/50 bg-card overflow-hidden relative">
          {!todayVisible && (
            <Button
              size="sm"
              className="absolute bottom-3 right-3 z-40 h-7 text-[11px] gap-1.5 shadow-lg"
              onClick={scrollToToday}
            >
              Go to today
            </Button>
          )}
          <div className="overflow-x-auto relative" ref={scrollRef}>
            <div style={{ minWidth: 192 + gridWidth }}>
              {/* Header */}
              <div className="flex border-b border-border/50 sticky top-0 z-20 bg-card">
                <div className="w-48 shrink-0 border-r border-border/50 p-2 sticky left-0 z-30 bg-card">
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search people..." className="h-7 text-xs pl-7 bg-transparent border-border/50" />
                  </div>
                </div>
                <div className="flex">
                  {dates.map((d, i) => {
                    const iso = toISO(d);
                    const isToday = iso === todayISO;
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const isMonday = d.getDay() === 1;
                    return (
                      <div
                        key={i}
                        style={{ width: DAY_WIDTH }}
                        className={cn(
                          "text-center py-1.5 text-[10px] border-r border-border/20 last:border-0",
                          isToday && "font-semibold text-primary bg-primary/10 border-x border-primary/30",
                          isWeekend && !isToday && "bg-muted/20 text-muted-foreground/40",
                          isMonday && !isToday && "border-l border-border/40"
                        )}
                      >
                        <div>{d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}</div>
                        <div className="tabular-nums">{d.getDate()}</div>
                        {isToday && <span className="mx-auto mt-0.5 block h-1 w-1 rounded-full bg-primary animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Global lane */}
              {layers.has("events") && (
                <TimelineLane
                  id="global"
                  label={<><Globe size={13} className="text-primary" /><span className="text-xs font-semibold">Global</span></>}
                  events={getEventsForLane(null)}
                  allocations={[]}
                  rangeStart={rangeStart}
                  rangeDays={rangeDays}
                  dates={dates}
                  todayISO={todayISO}
                  layers={layers}
                  expanded={expandedRows.has("global")}
                  onToggle={() => toggleRow("global")}
                  onAllocationClick={setSelectedAllocation}
                  onEventClick={setSelectedEvent}
                  className="bg-muted/5"
                  onResizeStart={handleResizeStart}
                  resizeState={resizeState}
                />
              )}

              {/* Employee lanes */}
              {filteredEmployees.map((emp) => (
                <TimelineLane
                  key={emp.id}
                  id={emp.id}
                  label={
                    <>
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center",
                        conflictSet.has(emp.id) ? "bg-amber-500/20" : "bg-primary/10"
                      )}>
                        {conflictSet.has(emp.id)
                          ? <AlertTriangle size={11} className="text-amber-600 dark:text-amber-400" />
                          : <User size={11} className="text-primary" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-xs font-medium truncate", conflictSet.has(emp.id) && "text-amber-700 dark:text-amber-300")}>{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{emp.teamName}</p>
                      </div>
                    </>
                  }
                  events={layers.has("events") ? getEventsForLane(emp.id) : []}
                  allocations={layers.has("allocations") ? getAllocsForLane(emp.id) : []}
                  rangeStart={rangeStart}
                  rangeDays={rangeDays}
                  dates={dates}
                  todayISO={todayISO}
                  layers={layers}
                  expanded={expandedRows.has(emp.id)}
                  onToggle={() => toggleRow(emp.id)}
                  onAllocationClick={setSelectedAllocation}
                  onEventClick={setSelectedEvent}
                  availFn={layers.has("availability") ? (dayISO: string) => getAvailForDay(emp.id, dayISO) : undefined}
                  onDragStart={(dayIndex) => handleDragStart(emp.id, dayIndex)}
                  onDragMove={isResizing.current ? handleResizeMove : handleDragMove}
                  dragSelection={dragState?.empId === emp.id ? {
                    startIndex: Math.min(dragState.startDayIndex, dragState.currentDayIndex),
                    endIndex: Math.max(dragState.startDayIndex, dragState.currentDayIndex),
                  } : undefined}
                  onResizeStart={handleResizeStart}
                  resizeState={resizeState}
                />
              ))}

              {filteredEmployees.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No employees match the current filters.</div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-5 text-[11px] text-muted-foreground">
          {layers.has("availability") && (
            <div className="flex gap-3 items-center">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Availability</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500/30" /> Partial</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-destructive/30" /> Unavailable</span>
            </div>
          )}
          {layers.has("allocations") && (
            <div className="flex gap-3 items-center">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Allocations</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-500/70" /> Project bars</span>
            </div>
          )}
          {layers.has("events") && (
            <div className="flex gap-3 items-center">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Events</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary/30" /> Event markers</span>
            </div>
          )}
        </div>
      </div>

      {/* Panels */}
      <AllocationDetailPanel
        open={!!selectedAllocation}
        onOpenChange={(open) => !open && setSelectedAllocation(null)}
        allocation={selectedAllocation}
      />
      <AddAllocationDialog
        open={addAllocOpen}
        onOpenChange={setAddAllocOpen}
        prefillEmployeeId={addAllocPrefill.employeeId}
        prefillStartDate={addAllocPrefill.startDate}
        prefillEndDate={addAllocPrefill.endDate}
      />
      <EventDetailPanel
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        event={selectedEvent}
      />
    </TooltipProvider>
  );
}

// ── TimelineLane ─────────────────────────────────────────
interface TimelineLaneProps {
  id: string;
  label: React.ReactNode;
  events: TimelineEvent[];
  allocations: Allocation[];
  rangeStart: Date;
  rangeDays: number;
  dates: Date[];
  todayISO: string;
  layers: Set<TimelineLayer>;
  expanded: boolean;
  onToggle: () => void;
  onAllocationClick: (a: Allocation) => void;
  onEventClick?: (e: TimelineEvent) => void;
  className?: string;
  availFn?: (dayISO: string) => AvailabilityWindow["status"] | null;
  onDragStart?: (dayIndex: number) => void;
  onDragMove?: (dayIndex: number) => void;
  dragSelection?: { startIndex: number; endIndex: number };
  onResizeStart?: (itemId: string, itemType: "allocation" | "event", edge: "left" | "right", originalStart: string, originalEnd: string, e: React.MouseEvent) => void;
  resizeState?: { itemId: string; itemType: "allocation" | "event"; edge: "left" | "right"; originalStart: string; originalEnd: string; currentDayIndex: number } | null;
}

function TimelineLane({ id, label, events, allocations: allocs, rangeStart, rangeDays, dates, todayISO, layers, expanded, onToggle, onAllocationClick, onEventClick, className, availFn, onDragStart, onDragMove, dragSelection, onResizeStart, resizeState }: TimelineLaneProps) {
  const slottedEvents = useMemo(() => assignEventSlots(events), [events]);
  const slottedAllocs = useMemo(() => assignAllocSlots(allocs), [allocs]);

  const eventMaxSlot = slottedEvents.length > 0 ? Math.max(...slottedEvents.map((s) => s.slot)) + 1 : 0;
  const allocMaxSlot = slottedAllocs.length > 0 ? Math.max(...slottedAllocs.map((s) => s.slot)) + 1 : 0;

  const visibleEventSlots = expanded ? eventMaxSlot : Math.min(eventMaxSlot, MAX_VISIBLE_EVENTS);
  const hiddenCount = expanded ? 0 : Math.max(0, eventMaxSlot - MAX_VISIBLE_EVENTS);

  // Calculate total row height: availability bg + alloc bars + event bars
  const availHeight = availFn ? 0 : 0; // availability is rendered as cell backgrounds, no extra height
  const allocSectionHeight = allocMaxSlot > 0 ? allocMaxSlot * (ALLOC_HEIGHT + ROW_GAP) + ROW_GAP : 0;
  const eventSectionHeight = visibleEventSlots > 0 ? visibleEventSlots * (ROW_EVENT_HEIGHT + ROW_GAP) + ROW_GAP : 0;
  const overflowHeight = hiddenCount > 0 ? 16 : 0;

  const totalContentHeight = allocSectionHeight + eventSectionHeight + overflowHeight;
  const rowHeight = Math.max(32, ROW_PADDING * 2 + totalContentHeight);
  const gridWidth = rangeDays * DAY_WIDTH;

  // Offset for event layer (below alloc layer)
  const eventTopOffset = allocSectionHeight;

  return (
    <div
      className={cn("flex border-b border-border/30 last:border-0 hover:bg-accent/5 transition-colors cursor-default", className)}
      onClick={!onDragStart ? onToggle : undefined}
    >
      {/* Sticky label */}
      <div className="w-48 shrink-0 border-r border-border/50 px-3 py-2 flex items-center gap-2 sticky left-0 z-10 bg-card cursor-pointer" style={{ minHeight: Math.max(36, rowHeight) }} onClick={onToggle}>
        {label}
      </div>

      {/* Grid area */}
      <div
        className={cn("relative select-none", onDragStart ? "cursor-crosshair" : "")}
        style={{ width: gridWidth, minHeight: Math.max(36, rowHeight) }}
        onMouseDown={(e) => {
          if (!onDragStart || resizeState) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const dayIndex = Math.floor(x / DAY_WIDTH);
          if (dayIndex >= 0 && dayIndex < rangeDays) {
            e.preventDefault();
            onDragStart(dayIndex);
          }
        }}
        onMouseMove={(e) => {
          if (!onDragMove) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const dayIndex = Math.max(0, Math.min(rangeDays - 1, Math.floor(x / DAY_WIDTH)));
          onDragMove(dayIndex);
        }}
      >
        {/* Background cells (availability + today overlay) */}
        <div className="flex absolute inset-0">
          {dates.map((d, i) => {
            const iso = toISO(d);
            const status = availFn ? availFn(iso) : null;
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            const isToday = iso === todayISO;
            return (
              <div
                key={i}
                style={{
                  width: DAY_WIDTH,
                  ...(isToday
                    ? { backgroundImage: "linear-gradient(hsl(var(--primary) / 0.14), hsl(var(--primary) / 0.14))" }
                    : {}),
                }}
                className={cn(
                  "border-r border-border/10 h-full",
                  status ? availStatusColors[status] : "",
                  isWeekend && "bg-muted/15",
                  isToday && "border-x border-primary/30"
                )}
              />
            );
          })}
        </div>

        {/* Allocation bars */}
        {slottedAllocs.map(({ alloc, slot }) => {
          // Compute resize overrides
          const isBeingResized = resizeState?.itemId === alloc.id && resizeState?.itemType === "allocation";
          let displayStart = alloc.startDate;
          let displayEnd = alloc.endDate;
          if (isBeingResized && resizeState) {
            const newDate = toISO(addDays(rangeStart, resizeState.currentDayIndex));
            if (resizeState.edge === "left") {
              displayStart = newDate <= displayEnd ? newDate : displayEnd;
            } else {
              displayEnd = newDate >= displayStart ? newDate : displayStart;
            }
          }
          return (
            <AllocationBlock
              key={alloc.id}
              alloc={alloc}
              slot={slot}
              rangeStart={rangeStart}
              rangeDays={rangeDays}
              topOffset={ROW_PADDING}
              onClick={(e) => {
                e.stopPropagation();
                onAllocationClick(alloc);
              }}
              onResizeStart={onResizeStart}
              displayStart={displayStart}
              displayEnd={displayEnd}
              isResizing={isBeingResized}
            />
          );
        })}

        {/* Event blocks */}
        {slottedEvents.map(({ event, slot }) => {
          if (!expanded && slot >= MAX_VISIBLE_EVENTS) return null;
          const isBeingResized = resizeState?.itemId === event.id && resizeState?.itemType === "event";
          let evDisplayStart = event.startDate;
          let evDisplayEnd = event.endDate;
          if (isBeingResized && resizeState) {
            const newDate = toISO(addDays(rangeStart, resizeState.currentDayIndex));
            if (resizeState.edge === "left") {
              evDisplayStart = newDate <= evDisplayEnd ? newDate : evDisplayEnd;
            } else {
              evDisplayEnd = newDate >= evDisplayStart ? newDate : evDisplayStart;
            }
          }
          return (
            <EventBlock
              key={event.id}
              event={event}
              slot={slot}
              rangeStart={rangeStart}
              rangeDays={rangeDays}
              topOffset={ROW_PADDING + eventTopOffset}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(event);
              }}
              onResizeStart={onResizeStart}
              displayStart={evDisplayStart}
              displayEnd={evDisplayEnd}
              isResizing={isBeingResized}
            />
          );
        })}

        {/* +N indicator */}
        {hiddenCount > 0 && (
          <div
            className="absolute left-2 text-[10px] font-medium text-primary cursor-pointer hover:underline"
            style={{ top: ROW_PADDING + eventTopOffset + MAX_VISIBLE_EVENTS * (ROW_EVENT_HEIGHT + ROW_GAP) }}
          >
            +{hiddenCount} more
          </div>
        )}

        {/* Drag selection overlay */}
        {dragSelection && (
          <div
            className="absolute top-0 bottom-0 bg-primary/15 border border-primary/40 rounded-sm pointer-events-none z-[5]"
            style={{
              left: dragSelection.startIndex * DAY_WIDTH,
              width: (dragSelection.endIndex - dragSelection.startIndex + 1) * DAY_WIDTH,
            }}
          >
            <span className="absolute top-1 left-1.5 text-[10px] font-medium text-primary">
              {dragSelection.endIndex - dragSelection.startIndex + 1}d
            </span>
          </div>
        )}

        {/* Today line */}
        <TodayLine rangeStart={rangeStart} rangeDays={rangeDays} todayISO={todayISO} />
      </div>
    </div>
  );
}

// ── AllocationBlock ──────────────────────────────────────
function AllocationBlock({
  alloc,
  slot,
  rangeStart,
  rangeDays,
  topOffset,
  onClick,
  onResizeStart,
  displayStart,
  displayEnd,
  isResizing: resizing,
}: {
  alloc: Allocation;
  slot: number;
  rangeStart: Date;
  rangeDays: number;
  topOffset: number;
  onClick: (e: React.MouseEvent) => void;
  onResizeStart?: (itemId: string, itemType: "allocation" | "event", edge: "left" | "right", originalStart: string, originalEnd: string, e: React.MouseEvent) => void;
  displayStart?: string;
  displayEnd?: string;
  isResizing?: boolean;
}) {
  const totalPx = rangeDays * DAY_WIDTH;
  const startDate = displayStart || alloc.startDate;
  const endDate = displayEnd || alloc.endDate;
  const aStart = new Date(startDate);
  const aEnd = new Date(endDate);
  aStart.setHours(0, 0, 0, 0);
  aEnd.setHours(0, 0, 0, 0);

  const leftPx = Math.max(0, ((aStart.getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH);
  const widthPx = Math.max(DAY_WIDTH * 0.8, Math.min(totalPx - leftPx, ((aEnd.getTime() - aStart.getTime()) / 86400000 + 1) * DAY_WIDTH));
  const topPx = topOffset + slot * (ALLOC_HEIGHT + ROW_GAP);

  const label = alloc.percentage < 100
    ? `${alloc.initiative} – ${alloc.percentage}%`
    : alloc.initiative;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute rounded-md flex items-center px-1.5 text-[10px] font-semibold truncate cursor-pointer border border-indigo-500/40 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30 transition-colors group",
            resizing && "ring-2 ring-primary/50 shadow-md"
          )}
          style={{
            left: leftPx,
            width: widthPx,
            top: topPx,
            height: ALLOC_HEIGHT,
            zIndex: resizing ? 10 : 3,
          }}
          onClick={onClick}
        >
          {/* Left resize handle */}
          {onResizeStart && (
            <div
              className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-primary/30 rounded-l-md transition-opacity z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(alloc.id, "allocation", "left", alloc.startDate, alloc.endDate, e);
              }}
            />
          )}
          <Briefcase size={10} className="mr-1 shrink-0 opacity-70" />
          <span className="truncate">{label}</span>
          {/* Right resize handle */}
          {onResizeStart && (
            <div
              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-primary/30 rounded-r-md transition-opacity z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(alloc.id, "allocation", "right", alloc.startDate, alloc.endDate, e);
              }}
            />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs space-y-0.5">
        <p className="font-semibold">{alloc.initiative}</p>
        <p className="text-muted-foreground">Allocation: {alloc.percentage}%</p>
        <p className="text-muted-foreground">{alloc.employeeName} · {alloc.teamName}</p>
        <p className="tabular-nums">{formatDate(startDate)} → {formatDate(endDate)}</p>
        {alloc.source && <p className="text-muted-foreground capitalize">Source: {alloc.source}</p>}
        <p className="text-muted-foreground/70 text-[10px]">Drag edges to resize</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ── EventBlock ───────────────────────────────────────────
function EventBlock({
  event,
  slot,
  rangeStart,
  rangeDays,
  topOffset,
  onClick,
  onResizeStart,
  displayStart,
  displayEnd,
  isResizing: resizing,
}: {
  event: TimelineEvent;
  slot: number;
  rangeStart: Date;
  rangeDays: number;
  topOffset: number;
  onClick?: (e: React.MouseEvent) => void;
  onResizeStart?: (itemId: string, itemType: "allocation" | "event", edge: "left" | "right", originalStart: string, originalEnd: string, e: React.MouseEvent) => void;
  displayStart?: string;
  displayEnd?: string;
  isResizing?: boolean;
}) {
  const totalPx = rangeDays * DAY_WIDTH;
  const startDate = displayStart || event.startDate;
  const endDate = displayEnd || event.endDate;
  const evStart = new Date(startDate);
  const evEnd = new Date(endDate);
  evStart.setHours(0, 0, 0, 0);
  evEnd.setHours(0, 0, 0, 0);

  const leftPx = Math.max(0, ((evStart.getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH);
  const widthPx = Math.max(DAY_WIDTH * 0.8, Math.min(totalPx - leftPx, ((evEnd.getTime() - evStart.getTime()) / 86400000 + 1) * DAY_WIDTH));
  const topPx = topOffset + slot * (ROW_EVENT_HEIGHT + ROW_GAP);

  const colors = eventColors[event.type] || eventColors.custom;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "absolute rounded border flex items-center px-1.5 text-[10px] font-medium truncate cursor-pointer hover:brightness-110 hover:shadow-sm transition-all group",
            colors,
            resizing && "ring-2 ring-primary/50 shadow-md"
          )}
          style={{
            left: leftPx,
            width: widthPx,
            top: topPx,
            height: ROW_EVENT_HEIGHT,
            zIndex: resizing ? 10 : 4,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClick}
        >
          {/* Left resize handle */}
          {onResizeStart && (
            <div
              className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-foreground/10 rounded-l transition-opacity z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(event.id, "event", "left", event.startDate, event.endDate, e);
              }}
            />
          )}
          <span className="truncate">{event.title}</span>
          {/* Right resize handle */}
          {onResizeStart && (
            <div
              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-foreground/10 rounded-r transition-opacity z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(event.id, "event", "right", event.startDate, event.endDate, e);
              }}
            />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs space-y-0.5">
        <p className="font-semibold">{event.title}</p>
        <p className="text-muted-foreground">{eventTypeLabels[event.type]}</p>
        <p className="tabular-nums">{formatDate(startDate)} → {formatDate(endDate)}</p>
        <p className="text-muted-foreground/70 text-[10px]">Drag edges to resize</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ── TodayLine ────────────────────────────────────────────
function TodayLine({ rangeStart, rangeDays, todayISO }: { rangeStart: Date; rangeDays: number; todayISO: string }) {
  const today = new Date(todayISO);
  const leftPx = ((today.getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH;
  if (leftPx < 0 || leftPx > rangeDays * DAY_WIDTH) return null;
  return <div className="absolute top-0 bottom-0 w-px bg-primary/40 pointer-events-none" style={{ left: leftPx, zIndex: 1 }} />;
}
