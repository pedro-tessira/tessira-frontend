import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import EngineerDetailPanel from "../components/EngineerDetailPanel";
import {
  Users,
  UserCheck,
  UserMinus,
  Clock,
  AlertTriangle,
  Search,
  TrendingDown,
  Activity,
  Filter,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  horizonEmployees,
  horizonTeams,
  availabilityWindows,
  timelineEvents,
} from "../data";
import type { AvailabilityWindow } from "../types";

// ── Constants ────────────────────────────────────────────
const DAY_WIDTH = 36;
const CAPACITY_THRESHOLD = 70; // alert below this %

type AvailSource = "available" | "partial" | "vacation" | "sick_leave" | "company_event" | "unavailable";

const sourceConfig: Record<AvailSource, { label: string; color: string; dotColor: string }> = {
  available:      { label: "Available",          color: "bg-emerald-500/20", dotColor: "bg-emerald-500" },
  partial:        { label: "Partial Allocation", color: "bg-amber-500/25",   dotColor: "bg-amber-500" },
  vacation:       { label: "Vacation",           color: "bg-sky-500/25",     dotColor: "bg-sky-500" },
  sick_leave:     { label: "Sick Leave",         color: "bg-red-500/25",     dotColor: "bg-red-500" },
  company_event:  { label: "Company Event",      color: "bg-purple-500/25",  dotColor: "bg-purple-500" },
  unavailable:    { label: "Unavailable",        color: "bg-muted/50",       dotColor: "bg-muted-foreground/40" },
};

// Mock enrichment data
const employeeEnrichment: Record<string, { role: string; skill: string; location: string }> = {
  "emp-001": { role: "Staff Engineer",    skill: "Platform",    location: "San Francisco" },
  "emp-002": { role: "Senior Engineer",   skill: "Backend",     location: "Austin" },
  "emp-003": { role: "Senior Engineer",   skill: "Frontend",    location: "London" },
  "emp-004": { role: "Engineer",          skill: "Platform",    location: "Stockholm" },
  "emp-005": { role: "Senior Engineer",   skill: "Backend",     location: "Tokyo" },
  "emp-006": { role: "Engineer",          skill: "Data",        location: "Berlin" },
  "emp-007": { role: "Senior Engineer",   skill: "Frontend",    location: "Mumbai" },
  "emp-008": { role: "Engineering Manager", skill: "Leadership", location: "New York" },
  "emp-009": { role: "VP Engineering",    skill: "Leadership",  location: "San Francisco" },
  "emp-010": { role: "Engineer",          skill: "Data",        location: "São Paulo" },
  "emp-011": { role: "Junior Engineer",   skill: "Frontend",    location: "London" },
  "emp-012": { role: "Engineer",          skill: "Data",        location: "Warsaw" },
};

const roles = ["All Roles", "Staff Engineer", "Senior Engineer", "Engineer", "Junior Engineer", "Engineering Manager", "VP Engineering"];
const skills = ["All Skills", "Platform", "Backend", "Frontend", "Data", "Leadership"];
const locations = ["All Locations", "San Francisco", "Austin", "London", "Stockholm", "Tokyo", "Berlin", "Mumbai", "New York", "São Paulo", "Warsaw"];

// ── Helpers ──────────────────────────────────────────────
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function resolveAvailSource(empId: string, dayISO: string): AvailSource {
  const w = availabilityWindows.find(
    (a) => a.employeeId === empId && a.startDate <= dayISO && a.endDate >= dayISO
  );
  if (!w) return "available";

  if (w.status === "available") return "available";
  if (w.status === "partial") {
    if (w.reason?.toLowerCase().includes("onboarding")) return "partial";
    return "partial";
  }
  // Unavailable — check reason
  const reason = (w.reason || "").toLowerCase();
  if (reason.includes("vacation")) return "vacation";
  if (reason.includes("pto")) return "vacation";
  if (reason.includes("sick")) return "sick_leave";
  return "unavailable";
}

// Check if day has a global company event
function hasCompanyEvent(dayISO: string): boolean {
  return timelineEvents.some(
    (e) => e.isGlobal && e.type === "all_hands" && e.startDate <= dayISO && e.endDate >= dayISO
  );
}

function getEmployeeCapacity(empId: string, dates: Date[]): number {
  let availDays = 0;
  for (const d of dates) {
    const iso = toISO(d);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
    const src = resolveAvailSource(empId, iso);
    if (src === "available") availDays++;
    else if (src === "partial") availDays += 0.5;
  }
  const workdays = dates.filter((d) => d.getDay() !== 0 && d.getDay() !== 6).length;
  return workdays > 0 ? Math.round((availDays / workdays) * 100) : 100;
}

// ── Component ────────────────────────────────────────────
export default function CapacityIntelligencePage() {
  const [range, setRange] = useState<"2w" | "4w" | "8w">("4w");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [skillFilter, setSkillFilter] = useState("All Skills");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [todayVisible, setTodayVisible] = useState(true);
  const [selectedEngineer, setSelectedEngineer] = useState<typeof capacityData[number] | null>(null);

  const rangeDays = range === "2w" ? 14 : range === "4w" ? 28 : 56;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangeStart = addDays(today, -3);
  const rangeEnd = addDays(rangeStart, rangeDays);
  const todayISO = toISO(today);
  const gridWidth = rangeDays * DAY_WIDTH;

  const dates = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < rangeDays; i++) arr.push(addDays(rangeStart, i));
    return arr;
  }, [rangeDays]);

  const filteredEmployees = useMemo(() => {
    let emps = horizonEmployees;
    if (teamFilter !== "all") emps = emps.filter((e) => e.teamId === teamFilter);
    if (roleFilter !== "All Roles") emps = emps.filter((e) => employeeEnrichment[e.id]?.role === roleFilter);
    if (skillFilter !== "All Skills") emps = emps.filter((e) => employeeEnrichment[e.id]?.skill === skillFilter);
    if (locationFilter !== "All Locations") emps = emps.filter((e) => employeeEnrichment[e.id]?.location === locationFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      emps = emps.filter((e) => e.name.toLowerCase().includes(q));
    }
    return emps;
  }, [teamFilter, roleFilter, skillFilter, locationFilter, searchQuery]);

  const capacityData = useMemo(() => {
    return filteredEmployees.map((emp) => ({
      ...emp,
      capacity: getEmployeeCapacity(emp.id, dates),
      enrichment: employeeEnrichment[emp.id],
    }));
  }, [filteredEmployees, dates]);

  // Aggregates
  const totalCapacity = capacityData.length > 0
    ? Math.round(capacityData.reduce((s, e) => s + e.capacity, 0) / capacityData.length)
    : 0;
  const availableCount = capacityData.filter((e) => e.capacity >= 90).length;
  const partialCount = capacityData.filter((e) => e.capacity >= 50 && e.capacity < 90).length;
  const unavailableCount = capacityData.filter((e) => e.capacity < 50).length;

  // Capacity alerts
  const alerts = capacityData
    .filter((e) => e.capacity < CAPACITY_THRESHOLD)
    .sort((a, b) => a.capacity - b.capacity);

  // Team-level capacity
  const teamCapacity = useMemo(() => {
    const teams = new Map<string, { name: string; total: number; count: number }>();
    capacityData.forEach((e) => {
      const existing = teams.get(e.teamId) || { name: e.teamName, total: 0, count: 0 };
      existing.total += e.capacity;
      existing.count++;
      teams.set(e.teamId, existing);
    });
    return Array.from(teams.entries()).map(([id, v]) => ({
      id,
      name: v.name,
      capacity: Math.round(v.total / v.count),
    }));
  }, [capacityData]);

  // Today visibility
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const todayPx = ((today.getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH + 220;
    const check = () => {
      const sl = el.scrollLeft;
      const vw = el.clientWidth;
      const inRange = todayPx >= 220 && todayPx <= 220 + gridWidth;
      setTodayVisible(inRange && todayPx >= sl && todayPx <= sl + vw);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, [rangeStart, rangeDays, gridWidth]);

  const scrollToToday = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const todayPx = ((today.getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH + 220;
    el.scrollTo({ left: todayPx - el.clientWidth / 2, behavior: "smooth" });
  }, [rangeStart]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        {/* ── KPI Header ── */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <KPICard
            icon={Activity}
            label="Team Capacity"
            value={`${totalCapacity}%`}
            detail={`${capacityData.length} engineers`}
            accent={totalCapacity >= 80 ? "emerald" : totalCapacity >= 60 ? "amber" : "red"}
          />
          <KPICard icon={UserCheck} label="Available" value={availableCount} detail="≥ 90% capacity" accent="emerald" />
          <KPICard icon={Clock} label="Partial" value={partialCount} detail="50–89% capacity" accent="amber" />
          <KPICard icon={UserMinus} label="Unavailable" value={unavailableCount} detail="< 50% capacity" accent="red" />
          <KPICard
            icon={AlertTriangle}
            label="Alerts"
            value={alerts.length}
            detail={`Below ${CAPACITY_THRESHOLD}%`}
            accent={alerts.length > 0 ? "red" : "emerald"}
          />
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Team" /></SelectTrigger>
            <SelectContent>
              {horizonTeams.map((t) => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {roles.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {skills.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative ml-auto">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search engineers..." className="h-8 text-xs pl-7 w-[180px] bg-transparent border-border/50" />
          </div>
          <div className="flex gap-0.5 rounded-md border border-border/50 p-0.5">
            {(["2w", "4w", "8w"] as const).map((r) => (
              <Button key={r} variant={range === r ? "secondary" : "ghost"} size="sm" className="h-6 text-[11px] px-2" onClick={() => setRange(r)}>{r}</Button>
            ))}
          </div>
        </div>

        {/* ── Capacity Alerts ── */}
        {alerts.length > 0 && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-destructive" />
              <span className="text-xs font-semibold text-destructive">Capacity Alerts — {alerts.length} engineer{alerts.length !== 1 ? "s" : ""} below {CAPACITY_THRESHOLD}%</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {alerts.map((a) => (
                <Badge key={a.id} variant="secondary" className="text-[11px] bg-destructive/10 text-destructive border-destructive/20">
                  {a.name} — {a.capacity}%
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* ── Team Capacity Summary ── */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          {teamCapacity.map((t) => (
            <div key={t.id} className="rounded-lg border border-border/50 bg-card p-3 space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground truncate">{t.name}</p>
              <div className="flex items-center gap-2">
                <Progress value={t.capacity} className="h-1.5 flex-1" />
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  t.capacity >= 80 ? "text-emerald-600 dark:text-emerald-400" : t.capacity >= 60 ? "text-amber-600 dark:text-amber-400" : "text-destructive"
                )}>{t.capacity}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Capacity Timeline Grid ── */}
        <div className="rounded-lg border border-border/50 bg-card overflow-hidden relative">
          {!todayVisible && (
            <Button size="sm" className="absolute bottom-3 right-3 z-40 h-7 text-[11px] gap-1.5 shadow-lg" onClick={scrollToToday}>
              <CalendarDays size={12} /> Go to today
            </Button>
          )}

          <div className="overflow-x-auto" ref={scrollRef}>
            <div style={{ minWidth: 220 + gridWidth }}>
              {/* Date header */}
              <div className="flex border-b border-border/50 sticky top-0 z-20 bg-card">
                <div className="w-[220px] shrink-0 border-r border-border/50 px-3 py-2 sticky left-0 z-30 bg-card">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Engineer</span>
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
                          "text-center py-1.5 text-[9px]",
                          isMonday && "border-l-2 border-border/40",
                          !isMonday && "border-r border-border/10",
                          isToday && "bg-primary/10 font-semibold text-primary",
                          isWeekend && !isToday && "bg-muted/20 text-muted-foreground/40"
                        )}
                      >
                        <div>{d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}</div>
                        <div className="tabular-nums">{d.getDate()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Employee rows */}
              {capacityData.map((emp) => (
                <CapacityRow
                  key={emp.id}
                  emp={emp}
                  dates={dates}
                  todayISO={todayISO}
                  gridWidth={gridWidth}
                  rangeStart={rangeStart}
                  onClick={() => setSelectedEngineer(emp)}
                />
              ))}

              {capacityData.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">No engineers match the current filters.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
          {Object.entries(sourceConfig).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", cfg.dotColor)} />
              {cfg.label}
            </span>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── KPI Card ─────────────────────────────────────────────
function KPICard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  detail: string;
  accent: "emerald" | "amber" | "red";
}) {
  const accentColors = {
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    amber: "border-amber-500/20 bg-amber-500/5",
    red: "border-destructive/20 bg-destructive/5",
  };
  const iconColors = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-destructive",
  };

  return (
    <div className={cn("rounded-lg border p-3.5 space-y-1", accentColors[accent])}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon size={14} strokeWidth={1.8} className={iconColors[accent]} />
      </div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{detail}</div>
    </div>
  );
}

// ── Capacity Row ─────────────────────────────────────────
function CapacityRow({
  emp,
  dates,
  todayISO,
  gridWidth,
  rangeStart,
  onClick,
}: {
  emp: { id: string; name: string; teamName: string; capacity: number; enrichment?: { role: string; skill: string; location: string } };
  dates: Date[];
  todayISO: string;
  gridWidth: number;
  rangeStart: Date;
  onClick?: () => void;
}) {
  const capacityColor = emp.capacity >= 90
    ? "text-emerald-600 dark:text-emerald-400"
    : emp.capacity >= 60
    ? "text-amber-600 dark:text-amber-400"
    : "text-destructive";

  const barColor = emp.capacity >= 90
    ? "bg-emerald-500"
    : emp.capacity >= 60
    ? "bg-amber-500"
    : "bg-destructive";

  return (
    <div className="flex border-b border-border/20 last:border-0 hover:bg-accent/5 transition-colors">
      {/* Sticky label */}
      <div className="w-[220px] shrink-0 border-r border-border/50 px-3 py-2 flex items-center gap-2.5 sticky left-0 z-10 bg-card">
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Users size={12} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">{emp.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{emp.enrichment?.role} · {emp.teamName}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className={cn("text-[11px] font-bold tabular-nums", capacityColor)}>{emp.capacity}%</span>
          <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${emp.capacity}%` }} />
          </div>
        </div>
      </div>

      {/* Timeline cells */}
      <div className="flex relative" style={{ width: gridWidth }}>
        {dates.map((d, i) => {
          const iso = toISO(d);
          const isToday = iso === todayISO;
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const isMonday = d.getDay() === 1;
          const companyEvent = hasCompanyEvent(iso);
          const source = companyEvent ? "company_event" : resolveAvailSource(emp.id, iso);
          const cfg = sourceConfig[source];

          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  style={{ width: DAY_WIDTH }}
                  className={cn(
                    "h-8",
                    isMonday && "border-l-2 border-border/40",
                    !isMonday && "border-r border-border/10",
                    isWeekend ? "bg-muted/15" : cfg.color,
                    isToday && "ring-1 ring-inset ring-primary/40"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{emp.name}</p>
                <p className="text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p>
                <p className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn("h-2 w-2 rounded-full", cfg.dotColor)} />
                  {cfg.label}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Today line */}
        {(() => {
          const leftPx = ((new Date(todayISO).getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH;
          if (leftPx < 0 || leftPx > gridWidth) return null;
          return <div className="absolute top-0 bottom-0 w-px bg-primary/50 pointer-events-none" style={{ left: leftPx, zIndex: 1 }} />;
        })()}
      </div>
    </div>
  );
}
