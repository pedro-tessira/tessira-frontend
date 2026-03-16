import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  BarChart3,
  UserX,
  CalendarClock,
  ArrowRight,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Sparkline } from "@/modules/signals/components/Sparkline";
import { Progress } from "@/components/ui/progress";
import {
  horizonEmployees,
  horizonTeams,
  allocations,
  availabilityWindows,
  timelineEvents,
} from "../data";

/* ── helpers ──────────────────────────────────────────── */
const today = new Date().toISOString().slice(0, 10);
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

function loadColor(pct: number) {
  if (pct > 80) return "bg-destructive";
  if (pct >= 60) return "bg-warning";
  return "bg-success";
}

function loadTextColor(pct: number) {
  if (pct > 80) return "text-destructive";
  if (pct >= 60) return "text-warning";
  return "text-success";
}

/* ── component ────────────────────────────────────────── */
export default function HorizonOverviewPage() {
  /* ── Section 1: Capacity Snapshot ─────────────────── */
  const snapshot = useMemo(() => {
    const activeAllocations = allocations.filter(
      (a) => a.startDate <= today && a.endDate >= today
    );

    // per-engineer current total allocation
    const perEngineer: Record<string, number> = {};
    activeAllocations.forEach((a) => {
      perEngineer[a.employeeId] = (perEngineer[a.employeeId] || 0) + a.percentage;
    });

    const totalEngineers = horizonEmployees.length;
    const avgAllocation =
      Object.values(perEngineer).length > 0
        ? Math.round(
            Object.values(perEngineer).reduce((s, v) => s + v, 0) / totalEngineers
          )
        : 0;
    const freeCapacity = 100 - avgAllocation;

    const unavailableNow = availabilityWindows.filter(
      (a) =>
        a.status === "unavailable" &&
        a.startDate <= today &&
        a.endDate >= today
    );
    const unavailableIds = new Set(unavailableNow.map((a) => a.employeeId));

    const weekEnd = inDays(7);
    const upcomingAbsences = availabilityWindows.filter(
      (a) =>
        a.status === "unavailable" &&
        a.startDate > today &&
        a.startDate <= weekEnd
    );
    const upcomingAbsenceIds = new Set(upcomingAbsences.map((a) => a.employeeId));

    return {
      freeCapacity,
      avgAllocation,
      unavailableCount: unavailableIds.size,
      upcomingAbsences: upcomingAbsenceIds.size,
      totalEngineers,
    };
  }, []);

  /* ── Section 2: Team Load ─────────────────────────── */
  const teamLoad = useMemo(() => {
    const teams = horizonTeams.filter((t) => t.id !== "all");
    return teams.map((team) => {
      const members = horizonEmployees.filter((e) => e.teamId === team.id);
      if (members.length === 0) return { id: team.id, name: team.name, load: 0, members: 0 };

      const activeAllocations = allocations.filter(
        (a) =>
          a.teamId === team.id &&
          a.startDate <= today &&
          a.endDate >= today
      );
      const total = activeAllocations.reduce((s, a) => s + a.percentage, 0);
      const avgLoad = Math.round(total / members.length);
      return { id: team.id, name: team.name, load: avgLoad, members: members.length };
    }).sort((a, b) => b.load - a.load);
  }, []);

  /* ── Section 3: Allocation Distribution ───────────── */
  const projectDistribution = useMemo(() => {
    const activeAllocs = allocations.filter(
      (a) => a.startDate <= today && a.endDate >= today
    );
    const totalPct = activeAllocs.reduce((s, a) => s + a.percentage, 0);
    const byProject: Record<string, number> = {};
    activeAllocs.forEach((a) => {
      byProject[a.project] = (byProject[a.project] || 0) + a.percentage;
    });
    return Object.entries(byProject)
      .map(([project, pct]) => ({
        project,
        pct,
        share: totalPct > 0 ? Math.round((pct / totalPct) * 100) : 0,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, []);

  /* ── Section 4: Capacity Risks ────────────────────── */
  const capacityRisks = useMemo(() => {
    return horizonEmployees
      .map((emp) => {
        const empAllocs = allocations.filter(
          (a) =>
            a.employeeId === emp.id &&
            a.startDate <= today &&
            a.endDate >= today
        );
        const totalAlloc = empAllocs.reduce((s, a) => s + a.percentage, 0);
        const free = Math.max(0, 100 - totalAlloc);
        return { ...emp, totalAlloc, free };
      })
      .filter((e) => e.free < 30 && e.totalAlloc > 0)
      .sort((a, b) => a.free - b.free);
  }, []);

  /* ── Section 5: Timeline Preview ──────────────────── */
  const previewEvents = useMemo(() => {
    const end = inDays(21);
    const upcoming = timelineEvents
      .filter(
        (e) =>
          e.startDate <= end &&
          e.endDate >= today &&
          (e.type === "pto" ||
            e.type === "vacation" ||
            e.type === "milestone" ||
            e.type === "release" ||
            e.type === "all_hands")
      )
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 6);
    return upcoming;
  }, []);

  const previewAllocations = useMemo(() => {
    const end = inDays(21);
    return allocations
      .filter((a) => a.startDate <= end && a.endDate >= today)
      .slice(0, 5);
  }, []);

  /* ── KPI card helper ──────────────────────────────── */
  const kpiCards = [
    {
      label: "Free Capacity",
      value: `${snapshot.freeCapacity}%`,
      detail: `Across ${snapshot.totalEngineers} engineers`,
      icon: Zap,
      accent: snapshot.freeCapacity < 30 ? "text-destructive" : "text-success",
      sparkline: [38, 42, 35, 40, snapshot.freeCapacity] as number[],
      sparkColor: (snapshot.freeCapacity < 30 ? "destructive" : "success") as "destructive" | "success" | "warning" | "default",
    },
    {
      label: "Avg Allocation",
      value: `${snapshot.avgAllocation}%`,
      detail: "Based on active allocations",
      icon: BarChart3,
      accent: snapshot.avgAllocation > 80 ? "text-destructive" : snapshot.avgAllocation > 60 ? "text-warning" : "text-primary",
      sparkline: [52, 55, 60, 57, snapshot.avgAllocation] as number[],
      sparkColor: (snapshot.avgAllocation > 80 ? "destructive" : snapshot.avgAllocation > 60 ? "warning" : "default") as "destructive" | "success" | "warning" | "default",
    },
    {
      label: "Unavailable",
      value: snapshot.unavailableCount,
      detail: "Engineers currently out",
      icon: UserX,
      accent: snapshot.unavailableCount > 3 ? "text-destructive" : "text-muted-foreground",
      sparkline: [2, 4, 3, 5, snapshot.unavailableCount] as number[],
      sparkColor: (snapshot.unavailableCount > 3 ? "destructive" : "default") as "destructive" | "success" | "warning" | "default",
    },
    {
      label: "Upcoming Absences",
      value: snapshot.upcomingAbsences,
      detail: "This week",
      icon: CalendarClock,
      accent: "text-muted-foreground",
      sparkline: [1, 3, 2, 4, snapshot.upcomingAbsences] as number[],
      sparkColor: "default" as "destructive" | "success" | "warning" | "default",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Section 1: Capacity Snapshot ─────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border/50 bg-card p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {card.label}
              </span>
              <card.icon
                size={15}
                strokeWidth={1.8}
                className="text-muted-foreground/50"
              />
            </div>
            <div className={cn("text-2xl font-bold tabular-nums", card.accent)}>
              {card.value}
            </div>
            <div className="text-xs text-muted-foreground">{card.detail}</div>
          </div>
        ))}
      </div>

      {/* ── Section 2: Team Load ─────────────────────── */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Team Load</h2>
        <div className="space-y-3">
          {teamLoad.map((team) => (
            <Link
              key={team.id}
              to={`/app/horizon/timeline?team=${team.id}`}
              className="block space-y-1 group hover:bg-accent/30 -mx-2 px-2 py-1.5 rounded transition-colors"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium group-hover:text-primary transition-colors">
                  {team.name}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    loadTextColor(team.load)
                  )}
                >
                  {team.load}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    loadColor(team.load)
                  )}
                  style={{ width: `${Math.min(team.load, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {team.members} engineer{team.members !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Section 3 & 4: two-column ────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Section 3: Allocation Distribution */}
        <div className="rounded-lg border border-border/50 bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Allocation Distribution</h2>
          <div className="space-y-3">
            {projectDistribution.map((p) => (
              <div key={p.project} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <Briefcase size={13} className="text-primary/60" />
                    {p.project}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {p.share}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${p.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Capacity Risks */}
        <div className="rounded-lg border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-warning" />
            <h2 className="text-sm font-semibold">Capacity Risks</h2>
          </div>
          {capacityRisks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No engineers below 30% free capacity.
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {capacityRisks.map((eng) => (
                <Link
                  key={eng.id}
                  to="/app/horizon/timeline"
                  className="flex items-center justify-between py-3 group hover:bg-accent/30 -mx-2 px-2 rounded transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {eng.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {eng.teamName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        eng.free < 15
                          ? "text-destructive"
                          : "text-warning"
                      )}
                    >
                      {eng.free}% free
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {eng.totalAlloc}% allocated
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Section 5: Timeline Preview ──────────────── */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Next 3 Weeks</h2>
          <Link
            to="/app/horizon/timeline"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Open Full Timeline <ArrowRight size={11} />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Upcoming PTO / events */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Events & Absences
            </p>
            <div className="space-y-1.5">
              {previewEvents.map((ev) => {
                const isPTO =
                  ev.type === "pto" || ev.type === "vacation";
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-2 rounded-md border border-border/30 bg-muted/30 px-3 py-2"
                  >
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        isPTO
                          ? "bg-destructive/70"
                          : "bg-primary/70"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">
                        {ev.title}
                        {ev.employeeName && (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            — {ev.employeeName}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        {new Date(ev.startDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                        {ev.startDate !== ev.endDate &&
                          ` → ${new Date(ev.endDate).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active allocations */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Active Allocations
            </p>
            <div className="space-y-1.5">
              {previewAllocations.map((alloc) => (
                <div
                  key={alloc.id}
                  className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {alloc.project}
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        — {alloc.employeeName}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      {new Date(alloc.startDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      →{" "}
                      {new Date(alloc.endDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary tabular-nums shrink-0 ml-2">
                    {alloc.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
