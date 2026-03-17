import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { freeCapacityRisk, riskBgSubtle, riskText, riskBorder } from "@/shared/lib/risk-colors";
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
  Rocket,
  Calendar,
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
  allocations,
} from "../data";
import type { AvailabilityWindow } from "../types";
import { initiatives, workAllocations, getRequiredFTE, getRequiredFTEByRole, getAllocatedFTE, getAllocatedFTEByRole, getStaffingStatus, getAllocationsForInitiative } from "@/modules/work/data";
import { Link } from "react-router-dom";
import type { StaffingStatus } from "@/modules/work/types";

// ── Constants ────────────────────────────────────────────
const DAY_WIDTH = 36;
const CAPACITY_THRESHOLD = 70;

type AvailSource = "available" | "partial" | "vacation" | "sick_leave" | "company_event" | "unavailable";

const sourceConfig: Record<AvailSource, { label: string; color: string; dotColor: string }> = {
  available:      { label: "Available",          color: "bg-emerald-500/20", dotColor: "bg-emerald-500" },
  partial:        { label: "Partial Allocation", color: "bg-amber-500/25",   dotColor: "bg-amber-500" },
  vacation:       { label: "Vacation",           color: "bg-sky-500/25",     dotColor: "bg-sky-500" },
  sick_leave:     { label: "Sick Leave",         color: "bg-red-500/25",     dotColor: "bg-red-500" },
  company_event:  { label: "Company Event",      color: "bg-purple-500/25",  dotColor: "bg-purple-500" },
  unavailable:    { label: "Unavailable",        color: "bg-muted/50",       dotColor: "bg-muted-foreground/40" },
};

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

const INIT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(210 70% 55%)",
  "hsl(280 60% 55%)",
  "hsl(35 80% 55%)",
  "hsl(170 60% 45%)",
];

function getInitColor(idx: number) {
  return INIT_COLORS[idx % INIT_COLORS.length];
}

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
  if (w.status === "partial") return "partial";
  const reason = (w.reason || "").toLowerCase();
  if (reason.includes("vacation") || reason.includes("pto")) return "vacation";
  if (reason.includes("sick")) return "sick_leave";
  return "unavailable";
}

function hasCompanyEvent(dayISO: string): boolean {
  return timelineEvents.some(
    (e) => e.isGlobal && e.type === "all_hands" && e.startDate <= dayISO && e.endDate >= dayISO
  );
}

function getEmployeeCapacity(empId: string, dates: Date[]): { availability: number; allocation: number; free: number } {
  let availDays = 0;
  const workdays = dates.filter((d) => d.getDay() !== 0 && d.getDay() !== 6);
  for (const d of workdays) {
    const iso = toISO(d);
    const src = resolveAvailSource(empId, iso);
    if (src === "available") availDays++;
    else if (src === "partial") availDays += 0.5;
  }
  const totalWorkdays = workdays.length;
  const availPct = totalWorkdays > 0 ? Math.round((availDays / totalWorkdays) * 100) : 100;

  const empAllocs = allocations.filter((a) => a.employeeId === empId);
  let totalAllocPct = 0;
  for (const d of workdays) {
    const iso = toISO(d);
    let dayAlloc = 0;
    for (const a of empAllocs) {
      if (a.startDate <= iso && a.endDate >= iso) dayAlloc += a.percentage;
    }
    totalAllocPct += Math.min(100, dayAlloc);
  }
  const allocPct = totalWorkdays > 0 ? Math.round(totalAllocPct / totalWorkdays) : 0;
  const freePct = Math.max(0, availPct - allocPct);

  return { availability: availPct, allocation: allocPct, free: freePct };
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

  // Build initiative color map
  const initColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const activeInits = initiatives.filter((i) => i.status !== "completed");
    activeInits.forEach((init, idx) => map.set(init.name, getInitColor(idx)));
    return map;
  }, []);

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
    const rangeStartISO = toISO(rangeStart);
    const rangeEndISO = toISO(rangeEnd);
    return filteredEmployees.map((emp) => {
      // Only include allocations that overlap with the visible date range
      const empAllocs = allocations.filter(
        (a) => a.employeeId === emp.id && a.startDate <= rangeEndISO && a.endDate >= rangeStartISO
      );
      return {
        ...emp,
        capacity: getEmployeeCapacity(emp.id, dates),
        enrichment: employeeEnrichment[emp.id],
        allocations: empAllocs,
      };
    });
  }, [filteredEmployees, dates, rangeStart, rangeEnd]);

  // Initiative staffing summary
  const initiativeStaffing = useMemo(() => {
    const activeInits = initiatives.filter((i) => i.status !== "completed");
    return activeInits.map((init) => {
      const allocs = getAllocationsForInitiative(init.id);
      const allocByRole = getAllocatedFTEByRole(init.id);
      return {
        id: init.id,
        name: init.name,
        status: init.status,
        startDate: init.startDate,
        endDate: init.endDate,
        required: getRequiredFTE(init),
        allocated: getAllocatedFTE(init.id),
        staffing: getStaffingStatus(init),
        confidence: init.estimate.confidence,
        totalEffortDays: init.estimate.totalEffortDays,
        roleBreakdown: getRequiredFTEByRole(init).map((rb) => ({
          ...rb,
          allocated: allocByRole[rb.role] || 0,
        })),
        allocations: allocs.map((a) => ({
          name: a.employeeName,
          role: a.role,
          percentage: a.percentage,
        })),
      };
    }).sort((a, b) => {
      const order: Record<StaffingStatus, number> = { understaffed: 0, overstaffed: 1, balanced: 2 };
      return order[a.staffing] - order[b.staffing];
    });
  }, []);

  const totalCapacity = capacityData.length > 0
    ? Math.round(capacityData.reduce((s, e) => s + e.capacity.free, 0) / capacityData.length)
    : 0;
  const totalAvailability = capacityData.length > 0
    ? Math.round(capacityData.reduce((s, e) => s + e.capacity.availability, 0) / capacityData.length)
    : 0;
  const totalAllocation = capacityData.length > 0
    ? Math.round(capacityData.reduce((s, e) => s + e.capacity.allocation, 0) / capacityData.length)
    : 0;
  const understaffedCount = initiativeStaffing.filter((i) => i.staffing === "understaffed").length;
  const availableCount = capacityData.filter((e) => e.capacity.free >= 90).length;
  const unavailableCount = capacityData.filter((e) => e.capacity.free < 50).length;

  const alerts = capacityData
    .filter((e) => e.capacity.free < CAPACITY_THRESHOLD)
    .sort((a, b) => a.capacity.free - b.capacity.free);

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
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
          <KPICard icon={Activity} label="Free Capacity" value={`${totalCapacity}%`} detail={`${capacityData.length} engineers`} accent={totalCapacity >= 40 ? "emerald" : totalCapacity >= 20 ? "amber" : "red"} />
          <KPICard icon={Rocket} label="Active Initiatives" value={initiativeStaffing.length} detail={`${understaffedCount} understaffed`} accent={understaffedCount > 0 ? "red" : "emerald"} />
          <KPICard icon={UserCheck} label="Available" value={availableCount} detail="≥ 90% free" accent="emerald" />
          <KPICard icon={UserMinus} label="Constrained" value={unavailableCount} detail="< 50% free" accent="red" />
          <KPICard icon={TrendingDown} label="Avg Allocation" value={`${totalAllocation}%`} detail={`Availability: ${totalAvailability}%`} accent="neutral" />
          <KPICard icon={AlertTriangle} label="Alerts" value={alerts.length} detail={`Below ${CAPACITY_THRESHOLD}%`} accent={alerts.length > 0 ? "red" : "emerald"} />
        </div>

        {/* ── Initiative Staffing ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Rocket size={14} className="text-primary" />
            <h3 className="text-sm font-semibold">Initiative Staffing</h3>
            <span className="text-[11px] text-muted-foreground">— Required vs allocated FTE per initiative</span>
          </div>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {initiativeStaffing.map((init) => {
              const fillPct = init.required > 0 ? Math.min(100, Math.round((init.allocated / init.required) * 100)) : 0;
              const barColor = init.staffing === "understaffed" ? "bg-destructive" : init.staffing === "balanced" ? "bg-success" : "bg-warning";
              const textColor = init.staffing === "understaffed" ? "text-destructive" : init.staffing === "balanced" ? "text-success" : "text-warning";
              const statusColors: Record<string, string> = {
                planned: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              };
              const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              return (
                <Link
                  key={init.id}
                  to={`/app/work/initiatives/${init.id}?from=${encodeURIComponent("/app/horizon/capacity")}`}
                  className="rounded-lg border border-border/50 bg-card p-4 space-y-3 hover:border-primary/30 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{init.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="secondary" className={cn("text-[9px] h-4", statusColors[init.status] || "bg-muted text-muted-foreground")}>
                          {init.status}
                        </Badge>
                        <Badge variant="secondary" className={cn("text-[9px] h-4", init.confidence === "high" ? "bg-success/10 text-success" : init.confidence === "medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive")}>
                          {init.confidence} conf.
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="secondary" className={cn("text-[10px] shrink-0", init.staffing === "understaffed" ? "bg-destructive/10 text-destructive" : init.staffing === "balanced" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                      {init.staffing === "understaffed" ? "Understaffed" : init.staffing === "balanced" ? "Balanced" : "Overstaffed"}
                    </Badge>
                  </div>

                  {/* Dates & Effort */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Calendar size={10} />
                      {formatDate(init.startDate)} → {formatDate(init.endDate)}
                    </span>
                    <span className="tabular-nums">{init.totalEffortDays}d effort</span>
                  </div>

                  {/* FTE bar */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className={cn("font-bold tabular-nums", textColor)}>{init.allocated}</span>
                    <span>/</span>
                    <span className="font-semibold tabular-nums">{init.required} FTE</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${fillPct}%` }} />
                    </div>
                    <span className="tabular-nums">{fillPct}%</span>
                  </div>

                  {/* Role breakdown */}
                  <div className="space-y-1">
                    {init.roleBreakdown.map((rb) => {
                      const gap = Math.round((rb.allocated - rb.fte) * 10) / 10;
                      return (
                        <div key={rb.role} className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{rb.role}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn("tabular-nums font-medium", rb.allocated < rb.fte * 0.85 ? "text-destructive" : "text-foreground")}>
                              {rb.allocated}/{rb.fte}
                            </span>
                            {gap !== 0 && (
                              <span className={cn("tabular-nums", gap < 0 ? "text-destructive" : "text-warning")}>
                                ({gap > 0 ? `+${gap}` : gap})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Allocations */}
                  {init.allocations.length > 0 && (
                    <div className="border-t border-border/30 pt-2 space-y-1">
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Assigned</p>
                      <div className="flex flex-wrap gap-1">
                        {init.allocations.map((a, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-muted/50 rounded px-1.5 py-0.5">
                            {a.name} <span className="text-muted-foreground">{a.role} {a.percentage}%</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
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
              {alerts.map((a) => {
                const risk = freeCapacityRisk(a.capacity.free);
                return (
                  <Badge key={a.id} variant="secondary" className={cn("text-[11px]", riskBgSubtle(risk), riskText(risk), riskBorder(risk))}>
                    {a.name} — {a.capacity.free}% free
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

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
                        style={{
                          width: DAY_WIDTH,
                          ...(isToday ? { boxShadow: "inset 2px 0 0 hsl(var(--primary) / 0.35), inset -2px 0 0 hsl(var(--primary) / 0.35)" } : {}),
                        }}
                        className={cn(
                          "text-center py-1.5 text-[9px]",
                          isMonday && !isToday && "border-l-2 border-border/40",
                          !isMonday && !isToday && "border-r border-border/10",
                          isToday && "font-semibold text-primary bg-primary/10",
                          isWeekend && !isToday && "bg-muted/20 text-muted-foreground/40"
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

              {/* Employee rows */}
              {capacityData.map((emp) => (
                <CapacityRow
                  key={emp.id}
                  emp={emp}
                  dates={dates}
                  todayISO={todayISO}
                  gridWidth={gridWidth}
                  rangeStart={rangeStart}
                  initColorMap={initColorMap}
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

        {/* ── Engineer Detail Panel ── */}
        <EngineerDetailPanel
          open={!!selectedEngineer}
          onOpenChange={(open) => !open && setSelectedEngineer(null)}
          engineer={selectedEngineer}
        />
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
  accent: "emerald" | "amber" | "orange" | "red" | "neutral";
}) {
  const accentColors: Record<string, string> = {
    emerald: "border-success/20 bg-success/5",
    amber: "border-warning/20 bg-warning/5",
    orange: "border-orange/20 bg-orange/5",
    red: "border-destructive/20 bg-destructive/5",
    neutral: "border-border/50 bg-card",
  };
  const iconColors: Record<string, string> = {
    emerald: "text-success",
    amber: "text-warning",
    orange: "text-orange",
    red: "text-destructive",
    neutral: "text-muted-foreground",
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
  initColorMap,
  onClick,
}: {
  emp: {
    id: string;
    name: string;
    teamName: string;
    capacity: { availability: number; allocation: number; free: number };
    enrichment?: { role: string; skill: string; location: string };
    allocations: typeof allocations;
  };
  dates: Date[];
  todayISO: string;
  gridWidth: number;
  rangeStart: Date;
  initColorMap: Map<string, string>;
  onClick?: () => void;
}) {
  const free = emp.capacity.free;
  const capacityColor = free >= 40 ? "text-success" : free >= 20 ? "text-warning" : free >= 10 ? "text-orange" : "text-destructive";

  return (
    <div className="flex border-b border-border/20 last:border-0 hover:bg-accent/10 transition-colors cursor-pointer" onClick={onClick}>
      {/* Sticky label with initiative allocation bar */}
      <div className="w-[220px] shrink-0 border-r border-border/50 px-3 py-2 sticky left-0 z-10 bg-card">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Users size={12} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{emp.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{emp.enrichment?.role} · {emp.teamName}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-[11px] font-bold tabular-nums cursor-help shrink-0", capacityColor)}>{free}%</span>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs space-y-0.5 z-[100]">
              <p>Availability: {emp.capacity.availability}%</p>
              <p className="text-muted-foreground">Allocation: {emp.capacity.allocation}%</p>
              <p className="font-semibold">Free capacity: {free}%</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Initiative allocation split bar */}
        {emp.allocations.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-2 mt-1.5 rounded-full overflow-hidden bg-muted cursor-help" onClick={(e) => e.stopPropagation()}>
                {emp.allocations.map((a, i) => (
                  <div
                    key={a.id}
                    className="h-full"
                    style={{
                      width: `${a.percentage}%`,
                      backgroundColor: initColorMap.get(a.initiative) || `hsl(var(--primary) / ${0.4 + (i * 0.15)})`,
                    }}
                  />
                ))}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs space-y-1 z-[100]" sideOffset={4}>
              <p className="font-semibold text-foreground mb-0.5">Allocations</p>
              {emp.allocations.map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: initColorMap.get(a.initiative) || "hsl(var(--primary))" }} />
                  <span>{a.initiative}: <span className="font-medium">{a.percentage}%</span></span>
                </div>
              ))}
              <div className="border-t border-border/30 pt-1 mt-1 font-medium">
                Total: {emp.allocations.reduce((s, a) => s + a.percentage, 0)}%
              </div>
            </TooltipContent>
          </Tooltip>
        )}
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
                  style={{
                    width: DAY_WIDTH,
                    ...(isToday ? {
                      backgroundImage: "linear-gradient(hsl(var(--primary) / 0.14), hsl(var(--primary) / 0.14))",
                      boxShadow: "inset 2px 0 0 hsl(var(--primary) / 0.35), inset -2px 0 0 hsl(var(--primary) / 0.35)",
                    } : {}),
                  }}
                  className={cn(
                    "h-8",
                    isMonday && !isToday && "border-l-2 border-border/40",
                    !isMonday && !isToday && "border-r border-border/10",
                    isWeekend ? "bg-muted/15" : cfg.color,
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

        {(() => {
          const leftPx = ((new Date(todayISO).getTime() - rangeStart.getTime()) / 86400000) * DAY_WIDTH;
          if (leftPx < 0 || leftPx > gridWidth) return null;
          return <div className="absolute top-0 bottom-0 w-px bg-primary/50 pointer-events-none" style={{ left: leftPx, zIndex: 1 }} />;
        })()}
      </div>
    </div>
  );
}
