import { useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Rocket, Users, Calendar, Boxes, Globe, AlertTriangle, CheckCircle, Scale, BarChart3, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { getInitiative, getAllocationsForInitiative, getDomainsForInitiative, getValueStreamsForInitiative, getRequiredFTE, getRequiredFTEByRole, getAllocatedFTE, getStaffingStatus, domains, valueStreams } from "../data";
import type { Initiative, StaffingStatus, ConfidenceLevel } from "../types";
import EditInitiativeDialog from "../components/EditInitiativeDialog";

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

const staffingConfig: Record<StaffingStatus, { label: string; color: string; icon: typeof AlertTriangle }> = {
  understaffed: { label: "Understaffed", color: "text-destructive", icon: AlertTriangle },
  balanced: { label: "Balanced", color: "text-success", icon: CheckCircle },
  overstaffed: { label: "Overstaffed", color: "text-warning", icon: Scale },
};

const confidenceColors: Record<ConfidenceLevel, string> = {
  low: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  high: "bg-success/10 text-success",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getDurationDays(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

export default function InitiativeDetailPage() {
  const { initiativeId } = useParams<{ initiativeId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get("from") || "/app/work/initiatives";
  const baseInit = getInitiative(initiativeId ?? "");
  const [localInit, setLocalInit] = useState<Initiative | null>(baseInit);
  const [editOpen, setEditOpen] = useState(false);
  const init = localInit;

  if (!init) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-muted-foreground">Initiative not found.</p>
        <Link to={backTo}>
          <Button variant="outline" size="sm">Back</Button>
        </Link>
      </div>
    );
  }

  const allocs = getAllocationsForInitiative(init.id);
  const initDomains = getDomainsForInitiative(init.id);
  const initVS = getValueStreamsForInitiative(init.id);
  const required = getRequiredFTE(init);
  const allocated = getAllocatedFTE(init.id);
  const staffing = getStaffingStatus(init);
  const sc = staffingConfig[staffing];
  const StaffIcon = sc.icon;
  const duration = getDurationDays(init.startDate, init.endDate);
  const fillPct = required > 0 ? Math.min(100, Math.round((allocated / required) * 100)) : 0;

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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold">{init.name}</h1>
            <Badge variant="secondary" className={cn("text-[11px]", statusColors[init.status])}>
              {init.status}
            </Badge>
            <Badge variant="secondary" className={cn("text-[11px] gap-1", staffing === "understaffed" ? "bg-destructive/10 text-destructive" : staffing === "balanced" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
              <StaffIcon size={10} />
              {sc.label}
            </Badge>
            <Button variant="outline" size="sm" className="ml-auto h-7 text-xs gap-1.5" onClick={() => setEditOpen(true)}>
              <Pencil size={12} /> Edit
            </Button>
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
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>

          {/* Effort Estimate (HLE) */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Effort Estimate</h2>
              <Badge variant="secondary" className={cn("text-[10px] ml-auto", confidenceColors[init.estimate.confidence])}>
                {init.estimate.confidence} confidence
              </Badge>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground">Total Effort</p>
                <p className="text-lg font-bold tabular-nums">{init.estimate.totalEffortDays}d</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground">Required FTE</p>
                <p className="text-lg font-bold tabular-nums">{required}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground">Allocated FTE</p>
                <p className={cn("text-lg font-bold tabular-nums", sc.color)}>{allocated}</p>
              </div>
            </div>

            {/* Overall capacity fill */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Capacity fill</span>
                <span>{fillPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", staffing === "understaffed" ? "bg-destructive" : staffing === "balanced" ? "bg-success" : "bg-warning")}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>

            {/* Role-level breakdown with Required FTE per role */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Required FTE by Role</p>
              <div className="rounded-md border border-border/30 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3 py-1.5 bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Role</span>
                  <span className="text-right">Effort</span>
                  <span className="text-right">Req. FTE</span>
                  <span className="text-right">Share</span>
                </div>
                {getRequiredFTEByRole(init).map((rb) => {
                  const sharePct = init.estimate.totalEffortDays > 0
                    ? Math.round((rb.days / init.estimate.totalEffortDays) * 100)
                    : 0;
                  return (
                    <div key={rb.role} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-3 py-2 border-t border-border/20">
                      <span className="text-xs font-medium">{rb.role}</span>
                      <span className="text-xs tabular-nums text-right">{rb.days}d</span>
                      <span className="text-xs font-bold tabular-nums text-right">{rb.fte}</span>
                      <div className="flex items-center gap-1.5 justify-end min-w-[60px]">
                        <div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary/60" style={{ width: `${sharePct}%` }} />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground">{sharePct}%</span>
                      </div>
                    </div>
                  );
                })}
                {/* Total row */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-3 py-2 border-t border-border/50 bg-muted/20">
                  <span className="text-xs font-semibold">Total</span>
                  <span className="text-xs font-semibold tabular-nums text-right">{init.estimate.totalEffortDays}d</span>
                  <span className="text-xs font-bold tabular-nums text-right">{required}</span>
                  <span className="text-[10px] tabular-nums text-muted-foreground text-right">100%</span>
                </div>
              </div>
            </div>

            {/* Drivers */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Key Drivers</p>
              <p className="text-xs text-muted-foreground">{init.estimate.drivers}</p>
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
          {/* Domains */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Boxes size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Domains</h2>
            </div>
            <div className="space-y-2">
              {initDomains.map((d) => (
                <Link key={d.id} to={`/app/work/domains/${d.id}`} className="block rounded-md border border-border/30 bg-muted/30 p-3 hover:border-primary/30 transition-colors">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">{d.owningTeamName}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Value Streams */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Value Streams</h2>
            </div>
            <div className="space-y-2">
              {initVS.map((vs) => (
                <Link key={vs.id} to={`/app/work/value-streams/${vs.id}`} className="block rounded-md border border-border/30 bg-muted/30 p-3 hover:border-primary/30 transition-colors">
                  <p className="text-sm font-medium">{vs.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditInitiativeDialog
        initiative={init}
        domains={domains}
        valueStreams={valueStreams}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(updated) => setLocalInit(updated)}
      />
    </div>
  );
}
