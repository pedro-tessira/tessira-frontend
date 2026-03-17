import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield, AlertTriangle, Users2, UserX, Calendar,
} from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { SignalBadge } from "../components/SignalIndicators";
import { MOCK_RESILIENCE, getStreamRisks, getOwnershipLoad, getRiskForecasts, MOCK_TEAM_SIGNALS } from "../data";
import type { SignalStatus } from "../types";
import { cn } from "@/shared/lib/utils";
import {
  coverageRisk, spofRisk,
  riskText, riskBg,
} from "@/shared/lib/risk-colors";

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

  const streamRisks = getStreamRisks();
  const ownershipLoad = getOwnershipLoad();
  const riskForecasts = getRiskForecasts();

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Resilience"
        description="SPOF exposure, bus factor, skill coverage, and ownership concentration across critical areas."
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

      {/* Stream Risk Map */}
      <div className="rounded-lg border border-border/50 bg-card">
        <div className="border-b border-border/50 px-5 py-3">
          <h3 className="text-sm font-semibold">Stream Risk Map</h3>
          <p className="text-[11px] text-muted-foreground">Risk distribution across value streams</p>
        </div>
        <div className="p-5 space-y-3">
          {streamRisks.map((sr) => {
            const covRisk = coverageRisk(sr.coveragePct);
            return (
              <div key={sr.stream} className="flex items-center gap-4">
                <div className="w-36 shrink-0">
                  <Link to={`/app/work/value-streams/${sr.streamId}?from=${encodeURIComponent("/app/signals/resilience")}`} className="text-sm font-medium hover:text-primary tessira-transition">{sr.stream}</Link>
                  <div className="text-[11px] text-muted-foreground">
                    {sr.spofCount > 0 && <span className={cn("font-medium", riskText(spofRisk(sr.spofCount)))}>{sr.spofCount} SPOF{sr.spofCount > 1 ? "s" : ""}</span>}
                    {sr.spofCount === 0 && "No SPOFs"}
                    <span className="ml-2">{sr.initiativeCount} init.</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full tessira-transition", riskBg(covRisk))}
                      style={{ width: `${sr.coveragePct}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                  {sr.coveragePct}%
                </div>
                <div className="w-20 shrink-0">
                  <SignalBadge status={sr.riskLevel} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ownership Concentration */}
        {ownershipLoad.length > 0 && (
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="border-b border-border/50 px-5 py-3">
              <h3 className="text-sm font-semibold">Ownership Load</h3>
              <p className="text-[11px] text-muted-foreground">Engineers with excessive critical ownership</p>
            </div>
            <div className="divide-y divide-border/50">
              {ownershipLoad.map((o) => (
                <div key={o.employeeId} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-sm font-medium">{o.employeeName}</span>
                      <span className="text-xs text-muted-foreground ml-2">{o.teamName}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-bold tabular-nums px-2 py-0.5 rounded-full",
                      o.criticalOwnerships >= 4 ? "bg-destructive/10 text-destructive" :
                      o.criticalOwnerships >= 3 ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {o.criticalOwnerships} critical
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {o.skills.map((skill) => (
                      <span key={skill} className="inline-block text-[10px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bus Factor */}
        <div className="rounded-lg border border-border/50 bg-card">
          <div className="border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Bus Factor by Team</h3>
            <p className="text-[11px] text-muted-foreground">People that can be unavailable before a domain becomes inoperable</p>
          </div>
          <div className="divide-y divide-border/50">
            {MOCK_TEAM_SIGNALS.map((t) => {
              const bf = t.busFactor ?? 0;
              return (
                <div key={t.teamId} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <Link to={`/app/people/teams/${t.teamId}`} className="text-sm font-medium hover:text-primary tessira-transition">
                      {t.teamName}
                    </Link>
                    <div className="text-xs text-muted-foreground">{t.memberCount} members</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(bf, 5) }).map((_, i) => (
                        <div key={i} className={cn(
                          "h-4 w-2 rounded-sm",
                          bf < 2 ? "bg-destructive" : bf < 3 ? "bg-orange" : "bg-success"
                        )} />
                      ))}
                      {Array.from({ length: Math.max(0, 5 - bf) }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-4 w-2 rounded-sm bg-muted" />
                      ))}
                    </div>
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      bf < 2 ? "text-destructive" : bf < 3 ? "text-orange" : "text-success"
                    )}>
                      {bf}
                    </span>
                    {bf < 3 && (
                      <AlertTriangle size={12} className={bf < 2 ? "text-destructive" : "text-warning"} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Forecasting */}
      {riskForecasts.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5">
          <div className="border-b border-warning/20 px-5 py-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-warning" />
              <h3 className="text-sm font-semibold">Projected Risk — Next 2 Weeks</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">Based on upcoming PTO and staffing changes</p>
          </div>
          <div className="divide-y divide-warning/10">
            {riskForecasts.map((forecast, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <UserX size={14} className="text-warning" />
                    <span className="text-sm font-medium">{forecast.employeeName}</span>
                    <span className="text-xs text-muted-foreground">{forecast.teamName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{forecast.dateRange}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {forecast.reason} — projected coverage drops to{" "}
                  <span className={cn(
                    "font-bold",
                    forecast.projectedCoverage < 50 ? "text-destructive" : "text-warning"
                  )}>
                    {forecast.projectedCoverage}%
                  </span>
                </p>
                {forecast.impactedAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {forecast.impactedAreas.map((area) => (
                      <span key={area} className="inline-block text-[10px] bg-warning/10 text-warning rounded px-1.5 py-0.5">
                        {area}
                      </span>
                    ))}
                  </div>
                )}
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
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Classification</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Owners</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Backups</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">Coverage</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((r) => {
              const covRisk = coverageRisk(r.coverageScore);
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
                        <div className={cn("h-full rounded-full", riskBg(covRisk))} style={{ width: `${r.coverageScore}%` }} />
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
