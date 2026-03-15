import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
import {
  timelineEvents,
  horizonEmployees,
  horizonTeams,
  availabilityWindows,
} from "../data";
import type { EventType, TimelineEvent, AvailabilityWindow } from "../types";

// ── Constants ────────────────────────────────────────────
const MAX_VISIBLE_EVENTS = 2;
const ROW_EVENT_HEIGHT = 26;
const ROW_GAP = 2;
const ROW_PADDING = 4;
const DAY_WIDTH = 40; // px per day column

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

/** Assigns vertical slot indices to overlapping events */
function assignEventSlots(events: TimelineEvent[]): { event: TimelineEvent; slot: number }[] {
  const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate));
  const result: { event: TimelineEvent; slot: number }[] = [];
  const slotEnds: string[] = []; // track end date per slot

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

// ── Component ────────────────────────────────────────────
export default function TimelinePage() {
  const [range, setRange] = useState<"2w" | "4w" | "8w">("4w");
  const [view, setView] = useState<"timeline" | "availability">("timeline");
  const [teamFilter, setTeamFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [todayVisible, setTodayVisible] = useState(true);

  const rangeDays = range === "2w" ? 14 : range === "4w" ? 28 : 56;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangeStart = addDays(today, offset * 7 - 3);
  const rangeEnd = addDays(rangeStart, rangeDays);
  const todayISO = toISO(today);
  const gridWidth = rangeDays * DAY_WIDTH;

  // Track whether today column is visible in the scroll container
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const todayPx = ((today.getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH + 192;
      const scrollLeft = el.scrollLeft;
      const viewWidth = el.clientWidth;
      setTodayVisible(todayPx >= scrollLeft && todayPx <= scrollLeft + viewWidth);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, [rangeStart, rangeDays, offset]);

  const scrollToToday = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const todayPx = ((today.getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH + 192;
    el.scrollTo({ left: todayPx - el.clientWidth / 2, behavior: "smooth" });
  }, [rangeStart]);

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

  const getAvailForDay = (empId: string, dayISO: string): AvailabilityWindow["status"] | null => {
    const w = availabilityWindows.find(
      (a) => a.employeeId === empId && a.startDate <= dayISO && a.endDate >= dayISO
    );
    return w?.status ?? null;
  };

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

          <div className="flex gap-0.5 rounded-md border border-border/50 p-0.5">
            {(["timeline", "availability"] as const).map((v) => (
              <Button key={v} variant={view === v ? "secondary" : "ghost"} size="sm" className="h-6 text-[11px] px-2 capitalize" onClick={() => setView(v)}>{v}</Button>
            ))}
          </div>
        </div>

        {/* ── Event Type Filters ── */}
        <div className="flex flex-wrap gap-1.5">
          {EVENT_TYPE_FILTERS.map((f) => (
            <Button key={f.type} variant={typeFilter === f.type ? "secondary" : "ghost"} size="sm" className="h-6 text-[11px] px-2" onClick={() => setTypeFilter(f.type)}>
              {f.label}
            </Button>
          ))}
        </div>

        {/* ── Calendar Grid ── */}
        <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
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
                          isToday && "bg-primary/10 font-semibold text-primary",
                          isWeekend && !isToday && "bg-muted/20 text-muted-foreground/40",
                          isMonday && "border-l border-border/40"
                        )}
                      >
                        <div>{d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}</div>
                        <div className="tabular-nums">{d.getDate()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Global lane */}
              <TimelineLane
                id="global"
                label={<><Globe size={13} className="text-primary" /><span className="text-xs font-semibold">Global</span></>}
                events={getEventsForLane(null)}
                rangeStart={rangeStart}
                rangeDays={rangeDays}
                dates={dates}
                todayISO={todayISO}
                view={view}
                expanded={expandedRows.has("global")}
                onToggle={() => toggleRow("global")}
                className="bg-muted/5"
              />

              {/* Employee lanes */}
              {filteredEmployees.map((emp) => (
                <TimelineLane
                  key={emp.id}
                  id={emp.id}
                  label={
                    <>
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User size={11} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{emp.teamName}</p>
                      </div>
                    </>
                  }
                  events={getEventsForLane(emp.id)}
                  rangeStart={rangeStart}
                  rangeDays={rangeDays}
                  dates={dates}
                  todayISO={todayISO}
                  view={view}
                  expanded={expandedRows.has(emp.id)}
                  onToggle={() => toggleRow(emp.id)}
                  availFn={view === "availability" ? (dayISO: string) => getAvailForDay(emp.id, dayISO) : undefined}
                />
              ))}

              {filteredEmployees.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No employees match the current filters.</div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        {view === "availability" && (
          <div className="flex gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500/30" /> Partial</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-destructive/30" /> Unavailable</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// ── TimelineLane ─────────────────────────────────────────
interface TimelineLaneProps {
  id: string;
  label: React.ReactNode;
  events: TimelineEvent[];
  rangeStart: Date;
  rangeDays: number;
  dates: Date[];
  todayISO: string;
  view: "timeline" | "availability";
  expanded: boolean;
  onToggle: () => void;
  className?: string;
  availFn?: (dayISO: string) => AvailabilityWindow["status"] | null;
}

function TimelineLane({ id, label, events, rangeStart, rangeDays, dates, todayISO, view, expanded, onToggle, className, availFn }: TimelineLaneProps) {
  const slottedEvents = useMemo(() => assignEventSlots(events), [events]);
  const maxSlot = slottedEvents.length > 0 ? Math.max(...slottedEvents.map((s) => s.slot)) : 0;
  const totalSlots = maxSlot + 1;
  const visibleSlots = expanded ? totalSlots : Math.min(totalSlots, MAX_VISIBLE_EVENTS);
  const hiddenCount = expanded ? 0 : Math.max(0, totalSlots - MAX_VISIBLE_EVENTS);
  const rowHeight = visibleSlots * (ROW_EVENT_HEIGHT + ROW_GAP) + ROW_PADDING * 2 + (hiddenCount > 0 ? 18 : 0);
  const gridWidth = rangeDays * DAY_WIDTH;

  return (
    <div className={cn("flex border-b border-border/30 last:border-0 hover:bg-accent/5 transition-colors cursor-pointer", className)} onClick={onToggle}>
      {/* Sticky label */}
      <div className="w-48 shrink-0 border-r border-border/50 px-3 py-2 flex items-center gap-2 sticky left-0 z-10 bg-card" style={{ minHeight: Math.max(36, rowHeight) }}>
        {label}
      </div>

      {/* Grid area */}
      <div className="relative" style={{ width: gridWidth, minHeight: Math.max(36, rowHeight) }}>
        {view === "timeline" ? (
          <>
            {/* Event blocks */}
            {slottedEvents.map(({ event, slot }) => {
              if (!expanded && slot >= MAX_VISIBLE_EVENTS) return null;
              return (
                <EventBlock
                  key={event.id}
                  event={event}
                  slot={slot}
                  rangeStart={rangeStart}
                  rangeDays={rangeDays}
                />
              );
            })}

            {/* +N indicator */}
            {hiddenCount > 0 && (
              <div
                className="absolute left-2 text-[10px] font-medium text-primary cursor-pointer hover:underline"
                style={{ top: MAX_VISIBLE_EVENTS * (ROW_EVENT_HEIGHT + ROW_GAP) + ROW_PADDING }}
              >
                +{hiddenCount} more
              </div>
            )}

            {/* Today line */}
            <TodayLine rangeStart={rangeStart} rangeDays={rangeDays} todayISO={todayISO} />
          </>
        ) : (
          /* Availability cells */
          <div className="flex h-full">
            {dates.map((d, i) => {
              const iso = toISO(d);
              const status = availFn?.(iso) ?? null;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const isToday = iso === todayISO;
              return (
                <div
                  key={i}
                  style={{ width: DAY_WIDTH }}
                  className={cn(
                    "border-r border-border/10 h-full",
                    status ? availStatusColors[status] : "",
                    isWeekend && "bg-muted/15",
                    isToday && "ring-1 ring-inset ring-primary/30"
                  )}
                  title={status ? `${status}` : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── EventBlock ───────────────────────────────────────────
function EventBlock({
  event,
  slot,
  rangeStart,
  rangeDays,
}: {
  event: TimelineEvent;
  slot: number;
  rangeStart: Date;
  rangeDays: number;
}) {
  const totalPx = rangeDays * DAY_WIDTH;
  const evStart = new Date(event.startDate);
  const evEnd = new Date(event.endDate);
  evStart.setHours(0, 0, 0, 0);
  evEnd.setHours(0, 0, 0, 0);

  const leftPx = Math.max(0, ((evStart.getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH);
  const widthPx = Math.max(DAY_WIDTH * 0.8, Math.min(totalPx - leftPx, ((evEnd.getTime() - evStart.getTime()) / 86400000 + 1) * DAY_WIDTH));
  const topPx = ROW_PADDING + slot * (ROW_EVENT_HEIGHT + ROW_GAP);

  const colors = eventColors[event.type] || eventColors.custom;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "absolute rounded border flex items-center px-1.5 text-[10px] font-medium truncate cursor-default",
            colors
          )}
          style={{
            left: leftPx,
            width: widthPx,
            top: topPx,
            height: ROW_EVENT_HEIGHT,
            zIndex: 2,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="truncate">{event.title}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs space-y-0.5">
        <p className="font-semibold">{event.title}</p>
        <p className="text-muted-foreground">{eventTypeLabels[event.type]}</p>
        <p className="tabular-nums">{formatDate(event.startDate)} → {formatDate(event.endDate)}</p>
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
