import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  TimelineBar,
  DateGridHeader,
  AvailabilityBadge,
} from "../components/TimelineComponents";
import { timelineStreams, availabilityWindows, timelineEvents } from "../data";
import type { EventType } from "../types";

const EVENT_TYPES: EventType[] = ["sprint", "release", "pto", "milestone", "incident", "onboarding", "custom"];

function daysFromNow(offset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TimelinePage() {
  const [range, setRange] = useState<"2w" | "4w" | "8w">("4w");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [view, setView] = useState<"gantt" | "availability">("gantt");

  const rangeDays = range === "2w" ? 14 : range === "4w" ? 28 : 56;
  const rangeStart = daysFromNow(-3);
  const rangeEnd = daysFromNow(rangeDays - 3);

  const filteredStreams = useMemo(() => {
    return timelineStreams.map((stream) => ({
      ...stream,
      events: stream.events.filter((e) =>
        (typeFilter === "all" || e.type === typeFilter) &&
        new Date(e.endDate) >= rangeStart &&
        new Date(e.startDate) <= rangeEnd
      ),
    }));
  }, [typeFilter, range]);

  // Group availability by employee
  const availByPerson = useMemo(() => {
    const map = new Map<string, typeof availabilityWindows>();
    availabilityWindows.forEach((a) => {
      const list = map.get(a.employeeId) || [];
      list.push(a);
      map.set(a.employeeId, list);
    });
    return Array.from(map.entries()).map(([id, windows]) => ({
      employeeId: id,
      employeeName: windows[0].employeeName,
      teamName: windows[0].teamName,
      windows,
      currentStatus: windows.find(
        (w) => new Date(w.startDate) <= new Date() && new Date(w.endDate) >= new Date()
      )?.status || "available",
    }));
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="flex gap-1 rounded-md border border-border/50 p-0.5">
          {(["gantt", "availability"] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs capitalize"
              onClick={() => setView(v)}
            >
              {v === "gantt" ? "Timeline" : "Availability"}
            </Button>
          ))}
        </div>

        {/* Range */}
        <div className="flex gap-1">
          {(["2w", "4w", "8w"] as const).map((r) => (
            <Button
              key={r}
              variant={range === r ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>

        {/* Type filter (gantt only) */}
        {view === "gantt" && (
          <div className="flex gap-1 ml-auto">
            <Button
              variant={typeFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTypeFilter("all")}
            >
              All
            </Button>
            {EVENT_TYPES.map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs capitalize"
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Gantt View */}
      {view === "gantt" && (
        <div className="rounded-lg border border-border/50 bg-card overflow-x-auto">
          <DateGridHeader rangeStart={rangeStart} days={rangeDays} />
          {filteredStreams.map((stream) => (
            <div key={stream.id} className="flex border-b border-border/50 last:border-0">
              {/* Label */}
              <div className="w-44 shrink-0 px-4 py-3 border-r border-border/50">
                <p className="text-sm font-medium truncate">{stream.teamName}</p>
                <p className="text-[11px] text-muted-foreground">{stream.events.length} events</p>
              </div>
              {/* Bars */}
              <div className="flex-1 relative h-10">
                {stream.events.map((event) => (
                  <TimelineBar
                    key={event.id}
                    event={event}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                  />
                ))}
              </div>
            </div>
          ))}
          {filteredStreams.every((s) => s.events.length === 0) && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No events match the current filters.
            </div>
          )}
        </div>
      )}

      {/* Availability View */}
      {view === "availability" && (
        <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
          <div className="grid grid-cols-[1fr_100px_100px_1fr] gap-4 px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Person</span>
            <span>Team</span>
            <span>Status</span>
            <span>Details</span>
          </div>
          {availByPerson.map((person) => (
            <div
              key={person.employeeId}
              className="grid grid-cols-[1fr_100px_100px_1fr] gap-4 px-4 py-3 items-center"
            >
              <span className="text-sm font-medium">{person.employeeName}</span>
              <span className="text-xs text-muted-foreground">{person.teamName}</span>
              <AvailabilityBadge status={person.currentStatus as any} />
              <div className="space-y-1">
                {person.windows.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      w.status === "available" ? "bg-emerald-500" : w.status === "partial" ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <span className="tabular-nums">
                      {new Date(w.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      {" – "}
                      {new Date(w.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    {w.reason && <span className="text-muted-foreground/60">({w.reason})</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
