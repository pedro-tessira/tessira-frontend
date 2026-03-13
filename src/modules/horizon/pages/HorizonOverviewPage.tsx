import { Link } from "react-router-dom";
import {
  CalendarRange,
  GanttChart,
  Palmtree,
  Flag,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/shared/components/StatCard";
import { EventCard } from "../components/TimelineComponents";
import { getHorizonStats, timelineEvents, availabilityWindows } from "../data";

export default function HorizonOverviewPage() {
  const stats = getHorizonStats();
  const activeEvents = timelineEvents.filter((e) => e.status === "active");
  const upcomingEvents = timelineEvents
    .filter((e) => e.status === "planned")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);
  const unavailable = availabilityWindows.filter(
    (a) => a.status === "unavailable" || a.status === "partial"
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Streams" value={stats.activeStreams} icon={GanttChart} detail="Across all teams" />
        <StatCard label="Upcoming Events" value={stats.upcomingEvents} icon={CalendarRange} detail="Planned" />
        <StatCard label="PTO This Week" value={stats.ptoThisWeek} icon={Palmtree} detail="People away" />
        <StatCard label="Availability" value={`${stats.availabilityRate}%`} icon={Flag} detail="Team coverage" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active now */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Active Now</h2>
            <Link to="/app/horizon/timeline" className="text-xs text-primary hover:underline flex items-center gap-1">
              Full timeline <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {activeEvents.length > 0 ? (
              activeEvents.map((e) => <EventCard key={e.id} event={e} />)
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No active events right now.</p>
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Coming Up</h2>
          <div className="space-y-2">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      </div>

      {/* Availability alerts */}
      {unavailable.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3">Availability Alerts</h2>
          <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
            {unavailable.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    size={14}
                    className={a.status === "unavailable" ? "text-destructive" : "text-warning"}
                  />
                  <div>
                    <p className="text-sm font-medium">{a.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{a.teamName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{a.reason || a.status}</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {new Date(a.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    {" → "}
                    {new Date(a.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
