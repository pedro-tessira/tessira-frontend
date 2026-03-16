import { cn } from "@/shared/lib/utils";
import type { EventType, EventStatus, TimelineEvent, AvailabilityWindow } from "../types";
import {
  CalendarRange,
  Rocket,
  Palmtree,
  Flag,
  AlertTriangle,
  UserPlus,
  UserMinus,
  CalendarDays,
  Users,
  Megaphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ── Event type config ────────────────────────────────────
const eventConfig: Record<EventType, { icon: typeof CalendarRange; color: string; bg: string }> = {
  all_hands: { icon: Megaphone, color: "text-primary", bg: "bg-primary/10" },
  team_sync: { icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  vacation: { icon: Palmtree, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  sprint: { icon: CalendarRange, color: "text-primary", bg: "bg-primary/10" },
  release: { icon: Rocket, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  pto: { icon: Palmtree, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  milestone: { icon: Flag, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  incident: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  onboarding: { icon: UserPlus, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  offboarding: { icon: UserMinus, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  custom: { icon: CalendarDays, color: "text-muted-foreground", bg: "bg-muted" },
};

const statusDot: Record<EventStatus, string> = {
  active: "bg-emerald-500",
  planned: "bg-blue-500",
  completed: "bg-muted-foreground/40",
  cancelled: "bg-destructive/40",
};

// ── EventCard ────────────────────────────────────────────
export function EventCard({ event }: { event: TimelineEvent }) {
  const cfg = eventConfig[event.type];
  const Icon = cfg.icon;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-3.5 space-y-2 hover:bg-accent/30 tessira-transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", cfg.bg)}>
            <Icon size={14} className={cfg.color} />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{event.title}</p>
            {event.teamName && (
              <p className="text-xs text-muted-foreground">{event.teamName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[event.status])} />
          <span className="text-[11px] text-muted-foreground capitalize">{event.status}</span>
        </div>
      </div>
      {event.description && (
        <p className="text-xs text-muted-foreground">{event.description}</p>
      )}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
        <span>{formatDate(event.startDate)}</span>
        {event.startDate !== event.endDate && (
          <>
            <span>→</span>
            <span>{formatDate(event.endDate)}</span>
          </>
        )}
        {event.isManual && (
          <Badge variant="secondary" className="text-[10px] ml-auto">Manual</Badge>
        )}
      </div>
    </div>
  );
}

// ── Timeline Bar (Gantt-like row) ────────────────────────
interface TimelineBarProps {
  event: TimelineEvent;
  rangeStart: Date;
  rangeEnd: Date;
}

export function TimelineBar({ event, rangeStart, rangeEnd }: TimelineBarProps) {
  const totalDays = Math.max(1, (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);

  const leftPct = Math.max(0, ((eventStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100);
  const widthPct = Math.max(2, Math.min(100 - leftPct, ((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24) + 1) / totalDays * 100));

  const cfg = eventConfig[event.type];

  return (
    <div
      className={cn("absolute top-1 h-6 rounded-md flex items-center px-2 text-[11px] font-medium truncate border", cfg.bg, cfg.color)}
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      title={`${event.title} (${formatDate(event.startDate)} – ${formatDate(event.endDate)})`}
    >
      {widthPct > 8 && <span className="truncate">{event.title}</span>}
    </div>
  );
}

// ── Availability Badge ───────────────────────────────────
const availStyle: Record<AvailabilityWindow["status"], string> = {
  available: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  unavailable: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function AvailabilityBadge({ status }: { status: AvailabilityWindow["status"] }) {
  return (
    <Badge variant="secondary" className={cn("text-[11px] capitalize", availStyle[status])}>
      {status}
    </Badge>
  );
}

// ── Date Grid Header ─────────────────────────────────────
export function DateGridHeader({ rangeStart, days }: { rangeStart: Date; days: number }) {
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex border-b border-border/50">
      <div className="w-44 shrink-0" />
      <div className="flex-1 flex">
        {dates.map((d, i) => {
          const iso = d.toISOString().slice(0, 10);
          const isToday = iso === today;
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 text-center py-1.5 text-[10px] border-r border-border/30 last:border-0",
                isToday && "font-semibold text-primary border-x border-primary/30",
                isWeekend && !isToday && "bg-muted/30 text-muted-foreground/50"
              )}
            >
              <div>{d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}</div>
              <div className="tabular-nums">{d.getDate()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
