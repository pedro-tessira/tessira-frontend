import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle } from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { SignalBadge } from "../components/SignalIndicators";
import { MOCK_RESILIENCE } from "../data";
import type { SignalStatus } from "../types";
import { cn } from "@/shared/lib/utils";

export default function ResiliencePage() {
  const [statusFilter, setStatusFilter] = useState<SignalStatus | "all">("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return MOCK_RESILIENCE;
    return MOCK_RESILIENCE.filter((r) => r.status === statusFilter);
  }, [statusFilter]);

  const critical = MOCK_RESILIENCE.filter((r) => r.status === "critical").length;
  const warning = MOCK_RESILIENCE.filter((r) => r.status === "warning").length;
  const healthy = MOCK_RESILIENCE.filter((r) => r.status === "healthy").length;
  const avgCoverage = Math.round(MOCK_RESILIENCE.reduce((s, r) => s + r.coverageScore, 0) / MOCK_RESILIENCE.length);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Resilience Indicators"
        description="Ownership concentration, backup coverage, and organizational durability across critical areas."
        breadcrumbs={[
          { label: "Signals", href: "/app/signals" },
          { label: "Resilience" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Critical" value={critical} icon={Shield} detail="Immediate risk" className={critical > 0 ? "border-destructive/30" : ""} />
        <StatCard label="Warning" value={warning} icon={AlertTriangle} detail="Needs attention" className={warning > 0 ? "border-warning/30" : ""} />
        <StatCard label="Healthy" value={healthy} icon={Shield} detail="Adequate coverage" />
        <StatCard label="Avg Coverage" value={`${avgCoverage}%`} icon={Shield} detail="Across all tracked areas" />
      </div>

      {/* Critical callout */}
      {critical > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-destructive" />
            <h3 className="text-sm font-semibold">Critical Resilience Gaps</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {critical} area{critical > 1 ? "s have" : " has"} a single owner with no backup.
            If the owner is unavailable, these areas have zero operational coverage.
          </p>
          <div className="space-y-1.5">
            {MOCK_RESILIENCE.filter((r) => r.status === "critical").map((r) => (
              <div key={r.area} className="flex items-center justify-between text-xs">
                <span className="font-medium">{r.area}</span>
                <span className="text-muted-foreground">{r.linkedTeam}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SignalStatus | "all")}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          <option value="all">All Statuses</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="healthy">Healthy</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">
          {filtered.length} of {MOCK_RESILIENCE.length} areas
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Area</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Owners</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Backups</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">Coverage</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((r) => {
              const barColor = r.coverageScore >= 75 ? "bg-success" : r.coverageScore >= 50 ? "bg-warning" : "bg-destructive";
              return (
                <tr key={r.area} className="hover:bg-accent/10 tessira-transition group">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.area}</div>
                    <div className="text-xs text-muted-foreground/60 hidden group-hover:block mt-0.5 leading-relaxed max-w-xs">
                      {r.riskDetail}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.domain}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{r.ownerCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("tabular-nums font-medium", r.backupCount === 0 ? "text-destructive" : "text-foreground")}>
                      {r.backupCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full", barColor)} style={{ width: `${r.coverageScore}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{r.coverageScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><SignalBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{r.linkedTeam}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No areas match your filter.
          </div>
        )}
      </div>
    </div>
  );
}
