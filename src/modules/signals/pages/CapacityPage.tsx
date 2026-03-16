import { Link } from "react-router-dom";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { CapacityBar, SignalBadge, TrendIndicator } from "../components/SignalIndicators";
import { MOCK_CAPACITY } from "../data";
import { Gauge, AlertTriangle, Users2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { freeCapacityRisk, riskText } from "@/shared/lib/risk-colors";

export default function CapacityPage() {
  const totalCapacity = Math.round(MOCK_CAPACITY.reduce((s, c) => s + c.totalCapacity, 0) * 10) / 10;
  const totalAllocated = Math.round(MOCK_CAPACITY.reduce((s, c) => s + c.allocated, 0) * 10) / 10;
  const totalAvailable = Math.round(MOCK_CAPACITY.reduce((s, c) => s + c.available, 0) * 10) / 10;
  const totalOnLeave = MOCK_CAPACITY.reduce((s, c) => s + c.onLeave, 0);
  const overloadedTeams = MOCK_CAPACITY.filter((c) => c.riskLevel !== "healthy").length;
  const orgFreeCapacity = Math.round((totalAvailable / totalCapacity) * 100);
  const orgFreeRisk = freeCapacityRisk(orgFreeCapacity);

  const sorted = [...MOCK_CAPACITY].sort((a, b) => (a.available / a.totalCapacity) - (b.available / b.totalCapacity));

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Capacity & Load"
        description="Team allocation, free capacity, and load distribution across the engineering org."
        breadcrumbs={[
          { label: "Signals", href: "/app/signals" },
          { label: "Capacity" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Capacity" value={`${totalCapacity} FTE`} icon={Users2} detail={`${totalAllocated} allocated`} />
        <StatCard label="Free Capacity" value={`${totalAvailable} FTE`} icon={Gauge} detail={<span className={riskText(orgFreeRisk)}>{orgFreeCapacity}% org-wide</span>} />
        <StatCard label="On Leave" value={totalOnLeave} icon={Users2} detail="Currently unavailable" />
        <StatCard label="Teams At Risk" value={overloadedTeams} icon={AlertTriangle} detail={`of ${MOCK_CAPACITY.length} teams`} className={overloadedTeams > 0 ? "border-warning/30" : ""} />
      </div>

      {/* Org-wide bar */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Organization-Wide Allocation</div>
        <CapacityBar allocated={totalAllocated} total={totalCapacity} />
      </div>

      {/* Per-team breakdown */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="border-b border-border/50 px-5 py-3">
          <h3 className="text-sm font-semibold">Team Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[200px]">Allocation</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Free</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">On Leave</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Overloaded</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Trend</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sorted.map((c) => {
                const freePct = Math.round((c.available / c.totalCapacity) * 100);
                const freeRisk = freeCapacityRisk(freePct);
                return (
                  <tr key={c.teamId} className="hover:bg-accent/10 tessira-transition">
                    <td className="px-4 py-3">
                      <Link to={`/app/people/teams/${c.teamId}`} className="font-medium hover:text-primary tessira-transition">
                        {c.teamName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <CapacityBar allocated={c.allocated} total={c.totalCapacity} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("tabular-nums font-medium", riskText(freeRisk))}>{c.available}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.onLeave > 0
                        ? <span className="tabular-nums text-warning font-medium">{c.onLeave}</span>
                        : <span className="text-muted-foreground/40">0</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.overloaded > 0
                        ? <span className="tabular-nums text-destructive font-medium">{c.overloaded}</span>
                        : <span className="text-muted-foreground/40">0</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <TrendIndicator direction={c.trend} />
                    </td>
                    <td className="px-4 py-3">
                      <SignalBadge status={c.riskLevel} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Callout */}
      {overloadedTeams > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-warning" />
            <h3 className="text-sm font-semibold">Capacity Risk Insight</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {overloadedTeams} team{overloadedTeams > 1 ? "s have" : " has"} free capacity below 20%.
            At this level, teams lack buffer to absorb unplanned work, PTO, or context-switching.
            Consider rebalancing allocation or deferring lower-priority streams.
          </p>
        </div>
      )}
    </div>
  );
}
