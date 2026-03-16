import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity, Gauge, Shield, ArrowRight, AlertTriangle, AlertCircle, Info,
  ChevronDown, ChevronUp, Target, Layers,
} from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { SignalDot, TrendIndicator } from "../components/SignalIndicators";
import { Sparkline } from "../components/Sparkline";
import { MOCK_ORG_SIGNALS, MOCK_ALERTS, computeTeamSignals, getSignalsStats, getPriorityRisks } from "../data";
import { useHealthWeights } from "../contexts/HealthWeightsContext";
import { HealthWeightsDialog } from "../components/HealthWeightsDialog";
import { cn } from "@/shared/lib/utils";
import {
  allocationRisk, coverageRisk, spofRisk,
  riskText, riskBg, riskBgSubtle, riskBorder,
} from "@/shared/lib/risk-colors";
import { StreamRiskMap } from "../components/StreamRiskMap";

const ALERT_ICON = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};
const ALERT_COLOR = {
  critical: "text-destructive",
  warning: "text-warning",
  info: "text-muted-foreground",
};

function sparklineColor(status: string): "success" | "warning" | "destructive" | "default" {
  if (status === "healthy") return "success";
  if (status === "warning") return "warning";
  if (status === "critical") return "destructive";
  return "default";
}

export default function SignalsOverviewPage() {
  const { normalized } = useHealthWeights();
  const teamSignals = useMemo(() => computeTeamSignals(normalized), [normalized]);
  const stats = getSignalsStats();
  const priorityRisks = useMemo(() => getPriorityRisks(), []);
  const dynamicAvgHealth = useMemo(
    () => +(teamSignals.reduce((s, t) => s + t.healthScore, 0) / teamSignals.length).toFixed(1),
    [teamSignals],
  );
  const dynamicOrgSignals = useMemo(() => {
    return MOCK_ORG_SIGNALS.map((sig) =>
      sig.id === "sig-01"
        ? {
            ...sig,
            value: dynamicAvgHealth,
            status: (dynamicAvgHealth >= 7 ? "healthy" : dynamicAvgHealth >= 5.5 ? "warning" : "critical") as "healthy" | "warning" | "critical",
            history: [...(sig.history?.slice(0, -1) ?? []), dynamicAvgHealth],
          }
        : sig,
    );
  }, [dynamicAvgHealth]);
  const topAlerts = MOCK_ALERTS.slice(0, 5);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Delivery pressure stats
  const teamsUnderPressure = teamSignals.filter((t) => t.allocation > 85);
  const allocationDistribution = {
    under60: teamSignals.filter((t) => t.allocation < 60).length,
    healthy: teamSignals.filter((t) => t.allocation >= 60 && t.allocation <= 85).length,
    high: teamSignals.filter((t) => t.allocation > 85 && t.allocation <= 95).length,
    overloaded: teamSignals.filter((t) => t.allocation > 95).length,
  };

  // Resilience stats
  const totalSpofs = teamSignals.reduce((s, t) => s + t.spofCount, 0);
  const avgBusFactor = +(teamSignals.reduce((s, t) => s + (t.busFactor ?? 0), 0) / teamSignals.length).toFixed(1);
  const avgCoverage = Math.round(teamSignals.reduce((s, t) => s + t.coverageScore, 0) / teamSignals.length);

  return (
    <div className="space-y-8">
      <ModulePageHeader
        title="Signals"
        description="Decision engine: where is the risk, why is it happening, what initiative is causing it, who is impacted."
        actions={<HealthWeightsDialog />}
      />

      {/* ═══════════════ A) PRIORITY ZONE ═══════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-destructive" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Priority Zone</h2>
          <span className="text-[11px] text-muted-foreground">— Where should I act now?</span>
        </div>

        {/* Key indicators */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Delivery Health" value={dynamicAvgHealth} icon={Activity} detail="Weighted composite score" />
          <StatCard label="Critical Alerts" value={stats.criticalAlerts} icon={AlertTriangle} detail="Requiring immediate action" className={stats.criticalAlerts > 0 ? "border-destructive/30" : ""} />
          <StatCard label="SPOF Exposure" value={totalSpofs} icon={Shield} detail={`${totalSpofs} skills at risk`} className={totalSpofs > 2 ? "border-destructive/30" : ""} />
          <StatCard label="Teams Under Pressure" value={teamsUnderPressure.length} icon={Gauge} detail={`of ${teamSignals.length} teams`} className={teamsUnderPressure.length > 0 ? "border-warning/30" : ""} />
        </div>

        {/* Priority risk items */}
        {priorityRisks.length > 0 && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5">
            <div className="border-b border-destructive/10 px-5 py-3">
              <h3 className="text-sm font-semibold">Top Risks by Impact</h3>
              <p className="text-[11px] text-muted-foreground">Stream → Initiative → Root Cause → Who's impacted</p>
            </div>
            <div className="divide-y divide-destructive/10">
              {priorityRisks.slice(0, 5).map((risk) => (
                <div key={risk.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      risk.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                    )}>
                      {risk.riskType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <Link to={`/app/work/value-streams/${risk.streamId}`} className="text-primary hover:underline">{risk.streamName}</Link>
                      {" → "}
                      <Link to={`/app/work/initiatives/${risk.initiativeId}`} className="text-primary hover:underline">{risk.initiativeName}</Link>
                    </span>
                  </div>
                  <p className="text-xs text-foreground">{risk.description}</p>
                  {risk.impactedPersons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {risk.impactedPersons.map((name) => (
                        <span key={name} className="inline-block text-[10px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts with initiative context */}
        <div className="rounded-lg border border-border/50 bg-card">
          <div className="border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Active Alerts</h3>
            <p className="text-[11px] text-muted-foreground">Each alert traced to an initiative</p>
          </div>
          <div className="divide-y divide-border/50">
            {topAlerts.map((alert) => {
              const Icon = ALERT_ICON[alert.severity];
              const isExpanded = expandedAlert === alert.id;
              const hasDetails = alert.rootCauses || alert.recommendedActions;

              return (
                <div key={alert.id} className="px-5 py-3">
                  <button
                    onClick={() => hasDetails && setExpandedAlert(isExpanded ? null : alert.id)}
                    className={cn(
                      "flex items-start gap-2.5 w-full text-left",
                      hasDetails && "cursor-pointer hover:bg-accent/20 -mx-2 px-2 -my-1 py-1 rounded-md tessira-transition"
                    )}
                  >
                    <Icon size={14} className={cn("mt-0.5 shrink-0", ALERT_COLOR[alert.severity])} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs leading-relaxed">{alert.message}</div>
                      <div className="text-[11px] text-muted-foreground/60 mt-0.5 flex items-center gap-1.5">
                        <span>{alert.source}</span>
                        {alert.initiativeName && (
                          <>
                            <span>·</span>
                            <Link
                              to={`/app/work/initiatives/${alert.initiativeId}`}
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {alert.initiativeName}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                    {hasDetails && (
                      isExpanded
                        ? <ChevronUp size={12} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                        : <ChevronDown size={12} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 ml-5 space-y-2.5 text-xs">
                      {alert.rootCauses && (
                        <div>
                          <div className="font-medium text-muted-foreground uppercase tracking-wider text-[10px] mb-1">Root Causes</div>
                          <ul className="space-y-0.5">
                            {alert.rootCauses.map((cause, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                                <span className="text-destructive mt-0.5">•</span> {cause}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {alert.recommendedActions && (
                        <div>
                          <div className="font-medium text-muted-foreground uppercase tracking-wider text-[10px] mb-1">Recommended Actions</div>
                          <ul className="space-y-0.5">
                            {alert.recommendedActions.map((action, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-primary/80">
                                <span className="mt-0.5">→</span> {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ B) DELIVERY PRESSURE ═══════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-warning" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Delivery Pressure</h2>
          </div>
          <Link to="/app/signals/capacity" className="text-xs text-primary hover:underline flex items-center gap-1">
            Full breakdown <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Allocation distribution */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Allocation Distribution</h3>
              <p className="text-[11px] text-muted-foreground">How allocation is spread across teams</p>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Underutilized (<60%)", count: allocationDistribution.under60, risk: "critical" as const },
                { label: "Healthy (60–85%)", count: allocationDistribution.healthy, risk: "healthy" as const },
                { label: "High (85–95%)", count: allocationDistribution.high, risk: "warning" as const },
                { label: "Overloaded (>95%)", count: allocationDistribution.overloaded, risk: "critical" as const },
              ].map((band) => (
                <div key={band.label} className="flex items-center gap-3">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", riskBg(band.risk))} />
                  <span className="text-xs flex-1">{band.label}</span>
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full tessira-transition", riskBg(band.risk))}
                      style={{ width: `${teamSignals.length > 0 ? (band.count / teamSignals.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className={cn("text-xs font-bold tabular-nums w-6 text-right", band.count > 0 ? riskText(band.risk) : "text-muted-foreground")}>
                    {band.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Teams under pressure */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="border-b border-border/50 px-5 py-3">
              <h3 className="text-sm font-semibold">Teams Under Pressure</h3>
              <p className="text-[11px] text-muted-foreground">Allocation &gt; 85% — limited capacity buffer</p>
            </div>
            <div className="divide-y divide-border/50">
              {teamsUnderPressure.length === 0 ? (
                <div className="px-5 py-4 text-xs text-muted-foreground">All teams within healthy allocation range.</div>
              ) : (
                teamsUnderPressure.sort((a, b) => b.allocation - a.allocation).map((t) => {
                  const aRisk = allocationRisk(t.allocation);
                  const freeCapacity = 100 - t.allocation;
                  return (
                    <div key={t.teamId} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <Link to={`/app/people/teams/${t.teamId}`} className="text-sm font-medium hover:text-primary tessira-transition">
                          {t.teamName}
                        </Link>
                        <div className="text-xs text-muted-foreground">{t.memberCount} members</div>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-sm font-bold tabular-nums", riskText(aRisk))}>{t.allocation}%</div>
                        <div className="text-[10px] text-muted-foreground">{freeCapacity}% free</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Free capacity trend */}
        <div className="rounded-lg border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Free Capacity Trend</h3>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {teamSignals.map((t) => {
              const freeCapacity = 100 - t.allocation;
              const aRisk = allocationRisk(t.allocation);
              return (
                <div key={t.teamId} className={cn("rounded-lg border p-3 text-center", riskBorder(aRisk), riskBgSubtle(aRisk))}>
                  <div className="text-xs font-medium truncate mb-1">{t.teamName}</div>
                  <div className={cn("text-lg font-bold tabular-nums", riskText(aRisk))}>{freeCapacity}%</div>
                  <TrendIndicator direction={t.capacityTrend} value={
                    t.capacityTrend === "up" ? "↑ load" : t.capacityTrend === "down" ? "↓ load" : "stable"
                  } />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ C) RESILIENCE ═══════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Resilience</h2>
          </div>
          <Link to="/app/signals/resilience" className="text-xs text-primary hover:underline flex items-center gap-1">
            Full breakdown <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* SPOF Exposure */}
          <div className={cn("rounded-lg border p-5 space-y-2", totalSpofs >= 3 ? "border-destructive/30 bg-destructive/5" : "border-border/50 bg-card")}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">SPOF Exposure</div>
            <div className={cn("text-2xl font-bold tabular-nums", riskText(spofRisk(totalSpofs)))}>{totalSpofs}</div>
            <p className="text-[11px] text-muted-foreground">Skills with single owner, no backup</p>
          </div>

          {/* Bus Factor */}
          <div className={cn("rounded-lg border p-5 space-y-2", avgBusFactor < 2 ? "border-destructive/30 bg-destructive/5" : "border-border/50 bg-card")}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Bus Factor</div>
            <div className={cn("text-2xl font-bold tabular-nums", avgBusFactor < 2 ? "text-destructive" : avgBusFactor < 3 ? "text-warning" : "text-success")}>
              {avgBusFactor}
            </div>
            <p className="text-[11px] text-muted-foreground">People before a domain becomes inoperable</p>
          </div>

          {/* Coverage */}
          <div className={cn("rounded-lg border p-5 space-y-2", avgCoverage < 60 ? "border-destructive/30 bg-destructive/5" : "border-border/50 bg-card")}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Skill Coverage</div>
            <div className={cn("text-2xl font-bold tabular-nums", riskText(coverageRisk(avgCoverage)))}>
              {avgCoverage}%
            </div>
            <p className="text-[11px] text-muted-foreground">Average across all teams</p>
          </div>
        </div>

        {/* Key indicator sparklines */}
        <div className="rounded-lg border border-border/50 bg-card">
          <div className="border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Key Indicators</h3>
            <p className="text-[11px] text-muted-foreground">Last 7 periods — with score breakdown</p>
          </div>
          <div className="divide-y divide-border/50">
            {dynamicOrgSignals.map((sig) => (
              <div key={sig.id} className="flex items-center gap-4 px-5 py-3">
                <SignalDot status={sig.status} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{sig.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{sig.description}</div>
                </div>
                {sig.history && (
                  <Sparkline data={sig.history} color={sparklineColor(sig.status)} />
                )}
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold tabular-nums">
                    {sig.value}<span className="text-xs font-normal text-muted-foreground">{sig.unit}</span>
                  </div>
                  <TrendIndicator direction={sig.trend} value={sig.trendValue} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ D) STRUCTURE ═══════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-foreground/70" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Structure</h2>
          <span className="text-[11px] text-muted-foreground">— Stream Risk Map</span>
        </div>

        <StreamRiskMap />

        {/* Color legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">Color key</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0 bg-success" />
            <span className="font-medium">Healthy</span>
            <span className="text-muted-foreground/60">Coverage ≥75%, 0 SPOFs</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0 bg-warning" />
            <span className="font-medium">Warning</span>
            <span className="text-muted-foreground/60">Coverage 60–75% or 1–2 SPOFs</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0 bg-destructive" />
            <span className="font-medium">Critical</span>
            <span className="text-muted-foreground/60">Coverage &lt;60% or ≥3 SPOFs</span>
          </span>
        </div>
      </section>



    </div>
  );
}
