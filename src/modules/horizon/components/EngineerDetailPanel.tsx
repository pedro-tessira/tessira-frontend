import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  MapPin,
  Briefcase,
  Cpu,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { availabilityWindows, timelineEvents } from "../data";
import type { AvailabilityWindow } from "../types";

type AvailSource = "available" | "partial" | "vacation" | "sick_leave" | "company_event" | "unavailable";

const sourceConfig: Record<AvailSource, { label: string; dotColor: string; badgeClass: string }> = {
  available:     { label: "Available",          dotColor: "bg-emerald-500",              badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  partial:       { label: "Partial Allocation", dotColor: "bg-amber-500",                badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  vacation:      { label: "Vacation",           dotColor: "bg-sky-500",                  badgeClass: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20" },
  sick_leave:    { label: "Sick Leave",         dotColor: "bg-red-500",                  badgeClass: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20" },
  company_event: { label: "Company Event",      dotColor: "bg-purple-500",               badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20" },
  unavailable:   { label: "Unavailable",        dotColor: "bg-muted-foreground/40",      badgeClass: "bg-muted text-muted-foreground border-border" },
};

function resolveSource(w: AvailabilityWindow): AvailSource {
  if (w.status === "available") return "available";
  if (w.status === "partial") return "partial";
  const reason = (w.reason || "").toLowerCase();
  if (reason.includes("vacation") || reason.includes("pto")) return "vacation";
  if (reason.includes("sick")) return "sick_leave";
  return "unavailable";
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function daysBetween(start: string, end: string): number {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

interface EngineerDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engineer: {
    id: string;
    name: string;
    teamName: string;
    capacity: number;
    enrichment?: { role: string; skill: string; location: string };
  } | null;
}

export default function EngineerDetailPanel({ open, onOpenChange, engineer }: EngineerDetailPanelProps) {
  const engineerId = engineer?.id ?? "";

  const windows = useMemo(() =>
    availabilityWindows
      .filter((w) => w.employeeId === engineerId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [engineerId]
  );

  const events = useMemo(() =>
    timelineEvents
      .filter((e) => e.employeeId === engineerId || e.isGlobal)
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [engineerId]
  );

  // Availability breakdown stats
  const breakdown = useMemo(() => {
    const counts: Record<AvailSource, number> = {
      available: 0, partial: 0, vacation: 0, sick_leave: 0, company_event: 0, unavailable: 0,
    };
    windows.forEach((w) => {
      const src = resolveSource(w);
      counts[src] += daysBetween(w.startDate, w.endDate);
    });
    return counts;
  }, [windows]);

  const totalDays = Object.values(breakdown).reduce((s, v) => s + v, 0) || 1;

  if (!engineer) return null;

  const capacityColor = engineer.capacity >= 90
    ? "text-emerald-600 dark:text-emerald-400"
    : engineer.capacity >= 60
    ? "text-amber-600 dark:text-amber-400"
    : "text-destructive";

  const barColor = engineer.capacity >= 90
    ? "bg-emerald-500"
    : engineer.capacity >= 60
    ? "bg-amber-500"
    : "bg-destructive";
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">{engineer.name}</SheetTitle>
              <p className="text-xs text-muted-foreground">{engineer.enrichment?.role} · {engineer.teamName}</p>
            </div>
          </div>
        </SheetHeader>

        {/* Meta badges */}
        {engineer.enrichment && (
          <div className="flex flex-wrap gap-2 mb-5">
            <Badge variant="outline" className="text-[11px] gap-1">
              <Briefcase size={10} /> {engineer.enrichment.role}
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1">
              <Cpu size={10} /> {engineer.enrichment.skill}
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1">
              <MapPin size={10} /> {engineer.enrichment.location}
            </Badge>
          </div>
        )}

        {/* Capacity overview */}
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={12} /> Current Capacity
            </span>
            <span className={cn("text-lg font-bold tabular-nums", capacityColor)}>{engineer.capacity}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${engineer.capacity}%` }} />
          </div>
        </div>

        {/* Availability breakdown */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={12} /> Availability Breakdown
          </h3>
          <div className="space-y-2">
            {(Object.entries(breakdown) as [AvailSource, number][])
              .filter(([, days]) => days > 0)
              .map(([source, days]) => {
                const cfg = sourceConfig[source];
                const pct = Math.round((days / totalDays) * 100);
                return (
                  <div key={source} className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-sm shrink-0", cfg.dotColor)} />
                    <span className="text-xs flex-1">{cfg.label}</span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">{days}d</span>
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", cfg.dotColor)} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] tabular-nums text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
          </div>
        </div>

        <Separator className="mb-5" />

        {/* Schedule timeline */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schedule & Availability Windows</h3>
          <div className="space-y-2">
            {windows.map((w, i) => {
              const src = resolveSource(w);
              const cfg = sourceConfig[src];
              const days = daysBetween(w.startDate, w.endDate);
              return (
                <div key={i} className={cn("rounded-md border p-3 space-y-1", cfg.badgeClass)}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", cfg.dotColor)} />
                      {cfg.label}
                    </span>
                    <span className="text-[11px] tabular-nums">{days} day{days !== 1 ? "s" : ""}</span>
                  </div>
                  <p className="text-[11px] opacity-80">
                    {formatDate(w.startDate)} — {formatDate(w.endDate)}
                    {w.reason && ` · ${w.reason}`}
                  </p>
                </div>
              );
            })}
            {windows.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">No availability windows recorded.</p>
            )}
          </div>
        </div>

        <Separator className="mb-5" />

        {/* Related events */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Events</h3>
          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="rounded-md border border-border/50 bg-card p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{ev.title}</span>
                  <Badge variant="outline" className="text-[10px] h-5">
                    {ev.isGlobal ? "Global" : "Personal"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(ev.startDate)}
                  {ev.startDate !== ev.endDate && ` — ${formatDate(ev.endDate)}`}
                  {ev.description && ` · ${ev.description}`}
                </p>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">No related events.</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
