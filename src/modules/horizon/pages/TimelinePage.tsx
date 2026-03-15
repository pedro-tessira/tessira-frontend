import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  timelineEvents,
  horizonEmployees,
  horizonTeams,
  availabilityWindows,
} from "../data";
import type { EventType, TimelineEvent, AvailabilityWindow, HorizonEmployee } from "../types";

// ── Event type display config ────────────────────────────
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

function getMonthLabel(start: Date, end: Date): string {
  const sm = start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const em = end.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return sm === em ? sm : `${start.toLocaleDateString(undefined, { month: "short" })} – ${end.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
}

// ── Component ────────────────────────────────────────────
export default function TimelinePage() {
  const [range, setRange] = useState<"2w" | "4w" | "8w">("4w");
  const [view, setView] = useState<"timeline" | "availability">("timeline");
  const [teamFilter, setTeamFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0); // week offset for navigation

  const rangeDays = range === "2w" ? 14 : range === "4w" ? 28 : 56;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangeStart = addDays(today, offset * 7 - 3);
  const rangeEnd = addDays(rangeStart, rangeDays);
  const todayISO = toISO(today);

  // Generate date columns
  const dates = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < rangeDays; i++) {
      arr.push(addDays(rangeStart, i));
    }
    return arr;
  }, [rangeDays, offset]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let emps = horizonEmployees;
    if (teamFilter !== "all") {
      emps = emps.filter((e) => e.teamId === teamFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      emps = emps.filter((e) => e.name.toLowerCase().includes(q));
    }
    return emps;
  }, [teamFilter, searchQuery]);

  // Get events for a lane
  const getEventsForEmployee = (empId: string): TimelineEvent[] => {
    return timelineEvents.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      const emp = horizonEmployees.find((h) => h.id === empId);
      // Direct assignment
      if (e.employeeId === empId) return true;
      // Team-level event (appears on all team members)
      if (!e.employeeId && !e.isGlobal && e.teamId && emp && e.teamId === emp.teamId) return true;
      return false;
    });
  };

  const globalEvents = useMemo(() => {
    return timelineEvents.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      return e.isGlobal;
    });
  }, [typeFilter]);

  // Get availability for an employee within range
  const getAvailForDay = (empId: string, dayISO: string): AvailabilityWindow["status"] | null => {
    const window = availabilityWindows.find(
      (a) => a.employeeId === empId && a.startDate <= dayISO && a.endDate >= dayISO
    );
    return window?.status ?? null;
  };

  return (
    <div className="space-y-4">
      {/* ── Top Controls ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Team selector */}
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            {horizonTeams.map((t) => (
              <SelectItem key={t.id} value={t.id} className="text-xs">
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Share2 size={13} />
          Share View
        </Button>
        <Button size="sm" className="h-8 text-xs gap-1.5">
          <Plus size={13} />
          Add Event
        </Button>

        {/* Navigation */}
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
          <Button variant="ghost" size="sm" className="h-7 text-xs ml-1" onClick={() => setOffset(0)}>
            Today
          </Button>
        </div>

        {/* Range selector */}
        <div className="flex gap-0.5 rounded-md border border-border/50 p-0.5">
          {(["2w", "4w", "8w"] as const).map((r) => (
            <Button
              key={r}
              variant={range === r ? "secondary" : "ghost"}
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-0.5 rounded-md border border-border/50 p-0.5">
          {(["timeline", "availability"] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? "secondary" : "ghost"}
              size="sm"
              className="h-6 text-[11px] px-2 capitalize"
              onClick={() => setView(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Event Type Filters ── */}
      <div className="flex flex-wrap gap-1.5">
        {EVENT_TYPE_FILTERS.map((f) => (
          <Button
            key={f.type}
            variant={typeFilter === f.type ? "secondary" : "ghost"}
            size="sm"
            className="h-6 text-[11px] px-2"
            onClick={() => setTypeFilter(f.type)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* ── Calendar Grid ── */}
      <div className="rounded-lg border border-border/50 bg-card overflow-x-auto">
        {/* Header row */}
        <div className="flex border-b border-border/50 sticky top-0 z-10 bg-card">
          {/* Left sidebar header */}
          <div className="w-48 shrink-0 border-r border-border/50 p-2">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people..."
                className="h-7 text-xs pl-7 bg-transparent border-border/50"
              />
            </div>
          </div>
          {/* Date columns */}
          <div className="flex flex-1">
            {dates.map((d, i) => {
              const iso = toISO(d);
              const isToday = iso === todayISO;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const isMonday = d.getDay() === 1;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 min-w-[32px] text-center py-1.5 text-[10px] border-r border-border/20 last:border-0",
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
        <div className="flex border-b border-border/50 bg-muted/5">
          <div className="w-48 shrink-0 border-r border-border/50 px-3 py-2 flex items-center gap-2">
            <Globe size={13} className="text-primary" />
            <span className="text-xs font-semibold">Global</span>
          </div>
          <div className="flex-1 relative" style={{ minHeight: 36 }}>
            {view === "timeline" &&
              globalEvents.map((event) => (
                <EventBlock key={event.id} event={event} rangeStart={rangeStart} rangeDays={rangeDays} dates={dates} todayISO={todayISO} />
              ))}
          </div>
        </div>

        {/* Employee lanes */}
        {filteredEmployees.map((emp) => {
          const events = getEventsForEmployee(emp.id);
          return (
            <div key={emp.id} className="flex border-b border-border/30 last:border-0 hover:bg-accent/5 tessira-transition">
              {/* Label */}
              <div className="w-48 shrink-0 border-r border-border/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={11} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{emp.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{emp.teamName}</p>
                  </div>
                </div>
              </div>
              {/* Grid cells */}
              <div className="flex-1 relative" style={{ minHeight: 36 }}>
                {view === "timeline" ? (
                  events.map((event) => (
                    <EventBlock key={event.id} event={event} rangeStart={rangeStart} rangeDays={rangeDays} dates={dates} todayISO={todayISO} />
                  ))
                ) : (
                  /* Availability view: colored day cells */
                  <div className="flex h-full">
                    {dates.map((d, i) => {
                      const iso = toISO(d);
                      const status = getAvailForDay(emp.id, iso);
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      const isToday = iso === todayISO;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 min-w-[32px] border-r border-border/10",
                            status ? availStatusColors[status] : "",
                            isWeekend && "bg-muted/15",
                            isToday && "ring-1 ring-inset ring-primary/30"
                          )}
                          title={status ? `${emp.name}: ${status}` : undefined}
                        />
                      );
                    })}
                  </div>
                )}
                {/* Today line */}
                {view === "timeline" && <TodayLine rangeStart={rangeStart} rangeDays={rangeDays} todayISO={todayISO} />}
              </div>
            </div>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No employees match the current filters.
          </div>
        )}
      </div>

      {/* Legend */}
      {view === "availability" && (
        <div className="flex gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500/30" /> Partial</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500/30" /> Unavailable</span>
        </div>
      )}
    </div>
  );
}

// ── Event Block Component ────────────────────────────────
function EventBlock({
  event,
  rangeStart,
  rangeDays,
  dates,
  todayISO,
}: {
  event: TimelineEvent;
  rangeStart: Date;
  rangeDays: number;
  dates: Date[];
  todayISO: string;
}) {
  const totalMs = rangeDays * 86400000;
  const evStart = new Date(event.startDate);
  const evEnd = new Date(event.endDate);
  evStart.setHours(0, 0, 0, 0);
  evEnd.setHours(0, 0, 0, 0);

  const leftPct = Math.max(0, ((evStart.getTime() - rangeStart.getTime()) / totalMs) * 100);
  const widthPct = Math.max(1.5, Math.min(100 - leftPct, (((evEnd.getTime() - evStart.getTime()) / 86400000 + 1) / rangeDays) * 100));

  // Don't render if entirely outside range
  if (evEnd < rangeStart || evStart > addDays(rangeStart, rangeDays)) return null;

  const colors = eventColors[event.type] || eventColors.custom;

  return (
    <div
      className={cn(
        "absolute top-1 h-[26px] rounded border flex items-center px-1.5 text-[10px] font-medium truncate cursor-default",
        colors
      )}
      style={{ left: `${leftPct}%`, width: `${widthPct}%`, zIndex: 2 }}
      title={`${event.title}${event.employeeName ? ` — ${event.employeeName}` : ""} (${event.startDate} → ${event.endDate})`}
    >
      {widthPct > 6 && <span className="truncate">{event.title}</span>}
    </div>
  );
}

// ── Today Line ───────────────────────────────────────────
function TodayLine({
  rangeStart,
  rangeDays,
  todayISO,
}: {
  rangeStart: Date;
  rangeDays: number;
  todayISO: string;
}) {
  const today = new Date(todayISO);
  const leftPct = ((today.getTime() - rangeStart.getTime()) / (rangeDays * 86400000)) * 100;
  if (leftPct < 0 || leftPct > 100) return null;
  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-primary/40 pointer-events-none"
      style={{ left: `${leftPct}%`, zIndex: 1 }}
    />
  );
}
