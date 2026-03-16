import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Rocket, Users, Calendar, Layers, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { getInitiative, getAllocationsForInitiative, getStreamsForInitiative, getAllocationLoad } from "../data";

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getDurationDays(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

export default function InitiativeDetailPage() {
  const { initiativeId } = useParams<{ initiativeId: string }>();
  const init = getInitiative(initiativeId ?? "");

  if (!init) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-muted-foreground">Initiative not found.</p>
        <Link to="/app/work/initiatives">
          <Button variant="outline" size="sm">Back to Initiatives</Button>
        </Link>
      </div>
    );
  }

  const allocs = getAllocationsForInitiative(init.id);
  const initStreams = getStreamsForInitiative(init.id);
  const totalLoad = getAllocationLoad(init.id);
  const duration = getDurationDays(init.startDate, init.endDate);

  // Timeline progress
  const today = new Date();
  const start = new Date(init.startDate);
  const end = new Date(init.endDate);
  const elapsed = Math.max(0, Math.min(1, (today.getTime() - start.getTime()) / (end.getTime() - start.getTime())));
  const progressPct = Math.round(elapsed * 100);

  return (
    <div className="space-y-6">
      <Link to="/app/work/initiatives" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={13} /> Back to Initiatives
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Rocket size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{init.name}</h1>
            <Badge variant="secondary" className={cn("text-[11px]", statusColors[init.status])}>
              {init.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{init.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 tabular-nums">
              <Calendar size={12} />
              {formatDate(init.startDate)} → {formatDate(init.endDate)}
            </span>
            <span>{duration} days</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Timeline bar */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">Timeline</h2>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>{formatDate(init.startDate)}</span>
                <span>{progressPct}% elapsed</span>
                <span>{formatDate(init.endDate)}</span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Allocations */}
          <div className="rounded-lg border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Allocations ({allocs.length})</h2>
            </div>
            {allocs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No allocations for this initiative.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {allocs.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{a.employeeName}</p>
                      <p className="text-[11px] text-muted-foreground">{a.teamName}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-bold tabular-nums",
                        a.percentage >= 80 ? "text-destructive" : a.percentage >= 50 ? "text-warning" : "text-success"
                      )}>
                        {a.percentage}%
                      </p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        {new Date(a.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} → {new Date(a.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Total load */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Allocation Load</h2>
            </div>
            <div className="text-3xl font-bold tabular-nums">{totalLoad}%</div>
            <p className="text-xs text-muted-foreground">
              Across {allocs.length} engineer{allocs.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Stream context */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Streams</h2>
            </div>
            <div className="space-y-2">
              {initStreams.map((s) => (
                <Link
                  key={s.id}
                  to={`/app/work/streams/${s.id}`}
                  className="block rounded-md border border-border/30 bg-muted/30 p-3 hover:border-primary/30 transition-colors"
                >
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.owningTeamName}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
