import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  Layers,
  Lightbulb,
  Play,
  Rocket,
  Shield,
  ShieldAlert,
  Target,
  TrendingDown,
  UserCheck,
  UserMinus,
  Users,
  Zap,
  Activity } from
"lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import {
  computeDecisionSummary,
  type DeliveryRiskLevel,
  type InitiativeRisk,
  type RecommendedAction } from
"@/modules/horizon/lib/decision-engine";
import { MOCK_RESILIENCE } from "@/modules/signals/data";
import CapacityForecast from "../components/CapacityForecast";
import SkillCoverageHeatmap from "../components/SkillCoverageHeatmap";
import RecentActivity from "../components/RecentActivity";

/* ── Risk styling ─────────────────────────────────────── */
const riskColor: Record<DeliveryRiskLevel, string> = {
  critical: "text-destructive",
  high: "text-orange",
  medium: "text-warning",
  low: "text-success"
};
const riskBg: Record<DeliveryRiskLevel, string> = {
  critical: "bg-destructive/10 border-destructive/25",
  high: "bg-orange/10 border-orange/25",
  medium: "bg-warning/10 border-warning/25",
  low: "bg-success/10 border-success/25"
};
const riskBadge: Record<DeliveryRiskLevel, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/20",
  high: "bg-orange/15 text-orange border-orange/20",
  medium: "bg-warning/15 text-warning border-warning/20",
  low: "bg-success/15 text-success border-success/20"
};
const riskLabel: Record<DeliveryRiskLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

const actionIcon: Record<string, string> = {
  add_role: "➕",
  reassign: "🔄",
  delay: "⏳",
  reduce_scope: "✂️",
  split_allocation: "📊"
};

/* ── Actionable signals (same approach as Horizon) ────── */
interface ActionableSignal {
  id: string;
  severity: "critical" | "high" | "medium";
  problem: string;
  impact: string;
  action: string;
  link: string;
  linkLabel: string;
  category: "capacity" | "skill" | "resilience" | "delivery";
}

function deriveSignals(data: ReturnType<typeof computeDecisionSummary>): ActionableSignal[] {
  const signals: ActionableSignal[] = [];
  let idx = 0;

  for (const risk of data.criticalRisks.slice(0, 3)) {
    const rootCause = risk.roleGaps.length > 0 ?
    `Missing ${risk.roleGaps.map((g) => `${g.gapFTE} ${g.role}`).join(", ")} capacity` :
    risk.riskReasons[0] || "Multiple risk factors";
    signals.push({
      id: `sig-d-${idx++}`,
      severity: risk.deliveryRisk === "critical" ? "critical" : "high",
      problem: `${risk.name} at ${risk.deliveryRisk} risk`,
      impact: risk.estimatedDelayDays > 0 ?
      `+${risk.estimatedDelayDays}d delay. ${rootCause}` :
      rootCause,
      action: risk.recommendations[0]?.label || "Review staffing plan",
      link: `/app/work/initiatives/${risk.id}`,
      linkLabel: "View initiative",
      category: "delivery"
    });
  }

  if (data.stats.constrainedEngineers > 0) {
    const constrained = data.engineerCapacities.filter((e) => e.freeCapacity < 20 && e.isAvailable);
    signals.push({
      id: `sig-c-${idx++}`,
      severity: data.stats.constrainedEngineers > 3 ? "critical" : "high",
      problem: `${data.stats.constrainedEngineers} engineer${data.stats.constrainedEngineers > 1 ? "s" : ""} at ≤20% free capacity`,
      impact: `Risk of burnout. Teams: ${[...new Set(constrained.map((e) => e.teamName))].join(", ")}`,
      action: "Rebalance allocation or defer lower-priority work",
      link: "/app/horizon/capacity",
      linkLabel: "View capacity",
      category: "capacity"
    });
  }

  if (data.stats.totalFTEGap > 1) {
    const worstGaps = data.allInitiativeRisks.
    filter((r) => r.roleGaps.length > 0).
    flatMap((r) => r.roleGaps.map((g) => g.role));
    const topRoles = [...new Set(worstGaps)].slice(0, 3);
    signals.push({
      id: `sig-f-${idx++}`,
      severity: data.stats.totalFTEGap > 3 ? "critical" : "high",
      problem: `${data.stats.totalFTEGap} FTE gap across ${data.stats.atRiskCount} initiatives`,
      impact: `Understaffed roles: ${topRoles.join(", ")}. Delivery timelines at risk.`,
      action: "Hire or reallocate to close critical gaps",
      link: "/app/horizon/capacity",
      linkLabel: "View staffing",
      category: "capacity"
    });
  }

  const criticalSPOFs = MOCK_RESILIENCE.filter((r) => r.status === "critical");
  if (criticalSPOFs.length > 0) {
    signals.push({
      id: `sig-s-${idx++}`,
      severity: criticalSPOFs.length > 2 ? "critical" : "high",
      problem: `${criticalSPOFs.length} critical SPOF${criticalSPOFs.length > 1 ? "s" : ""} detected`,
      impact: `Areas: ${criticalSPOFs.slice(0, 3).map((s) => s.area).join(", ")}. Single owner, no backup.`,
      action: "Start cross-training or assign backup owners",
      link: "/app/signals/resilience",
      linkLabel: "View resilience",
      category: "resilience"
    });
  }

  const warningSPOFs = MOCK_RESILIENCE.filter((r) => r.status === "warning");
  if (warningSPOFs.length > 0) {
    signals.push({
      id: `sig-sk-${idx++}`,
      severity: "medium",
      problem: `${warningSPOFs.length} skill areas with insufficient coverage`,
      impact: `${warningSPOFs.slice(0, 3).map((s) => s.area).join(", ")} have limited backup.`,
      action: "Prioritize knowledge transfer sessions",
      link: "/app/skills/risk",
      linkLabel: "View skill gaps",
      category: "skill"
    });
  }

  const severityOrder = { critical: 0, high: 1, medium: 2 };
  signals.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  return signals;
}

/* ── Component ────────────────────────────────────────── */
export default function OverviewPage() {
  const navigate = useNavigate();
  const [expandedDecision, setExpandedDecision] = useState(true);
  const [showAllRecs, setShowAllRecs] = useState(false);

  const data = useMemo(() => computeDecisionSummary(), []);
  const signals = useMemo(() => deriveSignals(data), [data]);

  const criticalSignals = signals.filter((s) => s.severity === "critical");
  const highSignals = signals.filter((s) => s.severity === "high");
  const mediumSignals = signals.filter((s) => s.severity === "medium");

  const visibleRecs = showAllRecs ? data.recommendations : data.recommendations.slice(0, 4);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Engineering risk, capacity, and delivery at a glance — action first.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════
             PRIORITY 1: DECISION SUMMARY
            ═══════════════════════════════════════════════════════ */}
        <div className={cn(
          "rounded-xl border-2 overflow-hidden transition-all",
          data.criticalRisks.length > 0 ?
          "border-destructive/30 bg-gradient-to-br from-destructive/5 via-card to-card" :
          "border-warning/20 bg-gradient-to-br from-warning/5 via-card to-card"
        )}>
          <button
            onClick={() => setExpandedDecision(!expandedDecision)}
            className="w-full flex items-start justify-between gap-4 p-5 text-left">
            
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                data.criticalRisks.length > 0 ? "bg-destructive/10" : "bg-warning/10"
              )}>
                <ShieldAlert size={20} className={data.criticalRisks.length > 0 ? "text-destructive" : "text-warning"} />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight">
                  {data.stats.atRiskCount > 0 ?
                  `⚠️ ${data.stats.atRiskCount} delivery risk${data.stats.atRiskCount > 1 ? "s" : ""} detected` :
                  "All initiatives on track"}
                </h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {data.stats.criticalCount > 0 &&
                  <span className="text-xs text-destructive font-semibold">{data.stats.criticalCount} critical</span>
                  }
                  {data.stats.totalFTEGap > 0 &&
                  <span className="text-xs text-muted-foreground">{data.stats.totalFTEGap} FTE gap</span>
                  }
                  {data.stats.constrainedEngineers > 0 &&
                  <span className="text-xs text-muted-foreground">{data.stats.constrainedEngineers} constrained engineers</span>
                  }
                  {MOCK_RESILIENCE.filter((r) => r.status === "critical").length > 0 &&
                  <span className="text-xs text-muted-foreground">{MOCK_RESILIENCE.filter((r) => r.status === "critical").length} SPOFs</span>
                  }
                </div>
              </div>
            </div>
            <ChevronDown size={16} className={cn(
              "text-muted-foreground transition-transform mt-2",
              !expandedDecision && "-rotate-90"
            )} />
          </button>

          {expandedDecision &&
          <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
              {data.criticalRisks.slice(0, 4).map((risk) =>
            <div key={risk.id} className={cn("rounded-lg border px-4 py-3 transition-all", riskBg[risk.deliveryRisk])}>
                  <div className="flex items-start gap-3">
                    <div className={cn("shrink-0 font-bold text-sm tabular-nums mt-0.5", riskColor[risk.deliveryRisk])}>
                      {risk.riskScore}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                      to={`/app/work/initiatives/${risk.id}`}
                      className="text-sm font-semibold hover:underline">
                      
                          {risk.name}
                        </Link>
                        <Badge variant="outline" className={cn("text-[9px] h-4 border", riskBadge[risk.deliveryRisk])}>
                          {riskLabel[risk.deliveryRisk]}
                        </Badge>
                        {risk.estimatedDelayDays > 0 &&
                    <span className="text-[10px] text-warning font-medium">
                            <Clock size={9} className="inline mr-0.5" />+{risk.estimatedDelayDays}d delay
                          </span>
                    }
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {risk.riskReasons.slice(0, 3).map((reason, i) =>
                    <Badge key={i} variant="secondary" className="text-[9px] h-4 bg-muted/80 text-muted-foreground font-normal">
                            {reason}
                          </Badge>
                    )}
                        {risk.roleGaps.slice(0, 2).map((g) =>
                    <Badge key={g.role} variant="secondary" className="text-[9px] h-4 bg-destructive/10 text-destructive">
                            -{g.gapFTE} {g.role}
                          </Badge>
                    )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {risk.recommendations.slice(0, 2).map((rec) =>
                    <Button
                      key={rec.id}
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2 gap-1 border-primary/20 text-primary hover:bg-primary/5"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (rec.engineerId) navigate("/app/horizon/capacity");else
                        if (rec.initiativeId) navigate(`/app/work/initiatives/${rec.initiativeId}`);
                      }}>
                      
                            <Play size={8} /> {rec.label.length > 30 ? rec.label.slice(0, 30) + "…" : rec.label}
                          </Button>
                    )}
                        <Link
                      to={`/app/work/initiatives/${risk.id}`}
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5 ml-auto">
                      
                          <Eye size={9} /> View details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
            )}
            </div>
          }
        </div>

        {/* ═══════════════════════════════════════════════════════
             PRIORITY 1b: KPI STRIP
            ═══════════════════════════════════════════════════════ */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <KPICard
            icon={AlertTriangle}
            label="At Risk"
            value={data.stats.atRiskCount}
            detail={`of ${data.stats.totalInitiatives} initiatives`}
            accent={data.stats.atRiskCount > 2 ? "red" : data.stats.atRiskCount > 0 ? "amber" : "green"}
            onClick={() => navigate("/app/horizon")}
            tooltip="Initiatives with medium+ delivery risk" />
          
          <KPICard
            icon={TrendingDown}
            label="FTE Gap"
            value={data.stats.totalFTEGap}
            detail="Missing capacity"
            accent={data.stats.totalFTEGap > 2 ? "red" : data.stats.totalFTEGap > 0 ? "amber" : "green"}
            onClick={() => navigate("/app/horizon/capacity")}
            tooltip="Sum of understaffed FTE across all initiatives" />
          
          <KPICard
            icon={UserMinus}
            label="Constrained"
            value={data.stats.constrainedEngineers}
            detail="Engineers < 20% free"
            accent={data.stats.constrainedEngineers > 3 ? "red" : data.stats.constrainedEngineers > 0 ? "amber" : "green"}
            onClick={() => navigate("/app/horizon/capacity")}
            tooltip="Engineers with less than 20% free capacity" />
          
          <KPICard
            icon={ShieldAlert}
            label="SPOFs"
            value={MOCK_RESILIENCE.filter((r) => r.status === "critical").length}
            detail="Critical single-owner areas"
            accent={MOCK_RESILIENCE.filter((r) => r.status === "critical").length > 2 ? "red" : "amber"}
            onClick={() => navigate("/app/signals/resilience")}
            tooltip="Areas with a single owner and no backup" />
          
        </div>

        {/* ═══════════════════════════════════════════════════════
             PRIORITY 1c: VALUE STREAM IMPACT
            ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-primary" />
            <h3 className="text-sm font-semibold">Value Stream Impact</h3>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {data.valueStreamSummaries.map((vs) => {
              const worstRisk: DeliveryRiskLevel =
              vs.atRiskCount > 0 ?
              vs.initiatives.reduce<DeliveryRiskLevel>((worst, i) => {
                const order: DeliveryRiskLevel[] = ["low", "medium", "high", "critical"];
                return order.indexOf(i.deliveryRisk) > order.indexOf(worst) ? i.deliveryRisk : worst;
              }, "low") :
              "low";
              return (
                <Link
                  key={vs.id}
                  to={`/app/work/value-streams/${vs.id}`}
                  className={cn(
                    "rounded-lg border p-3.5 text-left transition-all hover:shadow-sm group",
                    vs.atRiskCount > 0 ?
                    riskBg[worstRisk] :
                    "border-border/50 bg-card hover:border-primary/20"
                  )}>
                  
                  <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{vs.name}</p>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-lg font-bold tabular-nums">{vs.initiativeCount}</span>
                    <span className="text-[10px] text-muted-foreground">initiatives</span>
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-2 text-[10px]">
                    {vs.atRiskCount > 0 &&
                    <span className="text-destructive font-medium">{vs.atRiskCount} at risk</span>
                    }
                    {vs.understaffedCount > 0 &&
                    <span className="text-warning font-medium">{vs.understaffedCount} understaffed</span>
                    }
                    {vs.totalFTEGap > 0 &&
                    <span className="text-muted-foreground tabular-nums">{vs.totalFTEGap} FTE gap</span>
                    }
                    {vs.atRiskCount === 0 && vs.understaffedCount === 0 &&
                    <span className="text-success font-medium">On track</span>
                    }
                  </div>
                </Link>);

            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
             PRIORITY 2: ACTIONABLE SIGNALS
            ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-warning" />
            <h3 className="text-sm font-semibold">Actionable Signals</h3>
            <div className="flex gap-1.5 ml-2">
              {criticalSignals.length > 0 &&
              <Badge variant="secondary" className="text-[9px] h-4 bg-destructive/10 text-destructive">{criticalSignals.length} critical</Badge>
              }
              {highSignals.length > 0 &&
              <Badge variant="secondary" className="text-[9px] h-4 bg-orange/10 text-orange">{highSignals.length} high</Badge>
              }
              {mediumSignals.length > 0 &&
              <Badge variant="secondary" className="text-[9px] h-4 bg-warning/10 text-warning">{mediumSignals.length} medium</Badge>
              }
            </div>
          </div>
          <div className="space-y-2">
            {signals.map((signal) =>
            <SignalCard key={signal.id} signal={signal} />
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
             PRIORITY 2b: WHAT TO DO NEXT
            ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-primary" />
            <h3 className="text-sm font-semibold">What to Do Next</h3>
            <span className="text-[11px] text-muted-foreground">
              — {data.recommendations.length} action{data.recommendations.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {visibleRecs.map((rec) =>
            <RecommendationCard key={rec.id} rec={rec} />
            )}
          </div>
          {data.recommendations.length > 4 &&
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setShowAllRecs(!showAllRecs)}>
              {showAllRecs ? "Show less" : `Show all ${data.recommendations.length} recommendations`}
              <ArrowRight size={12} className="ml-1" />
            </Button>
          }
        </div>

        {/* ═══════════════════════════════════════════════════════
             PRIORITY 3: INITIATIVE RISK TABLE + TEAM CAPACITY
            ═══════════════════════════════════════════════════════ */}
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Initiative risk table — wider */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2">
              <Rocket size={14} className="text-primary" />
              <h3 className="text-sm font-semibold">Initiative Risk Assessment</h3>
              <span className="text-[11px] text-muted-foreground ml-auto">
                {data.allInitiativeRisks.length} initiatives
              </span>
            </div>
            <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
              <div className="grid grid-cols-[1fr_70px_90px_60px_32px] gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <span>Initiative</span>
                <span className="text-center">Risk</span>
                <span className="text-center">Staffing</span>
                <span className="text-center">Delay</span>
                <span />
              </div>
              {data.allInitiativeRisks.map((init) =>
              <Link
                key={init.id}
                to={`/app/work/initiatives/${init.id}`}
                className="grid grid-cols-[1fr_70px_90px_60px_32px] gap-2 px-4 py-3 border-b border-border/20 last:border-0 hover:bg-accent/30 transition-colors items-center">
                
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{init.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {init.riskReasons[0] || "On track"}
                    </p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className={cn("text-[10px] h-5 border", riskBadge[init.deliveryRisk])}>
                      {riskLabel[init.deliveryRisk]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                      className={cn(
                        "h-full rounded-full",
                        init.staffingStatus === "understaffed" ? "bg-destructive" :
                        init.staffingStatus === "balanced" ? "bg-success" :
                        "bg-warning"
                      )}
                      style={{ width: `${Math.min(100, init.requiredFTE > 0 ? init.allocatedFTE / init.requiredFTE * 100 : 0)}%` }} />
                    
                    </div>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {init.allocatedFTE}/{init.requiredFTE}
                    </span>
                  </div>
                  <div className="text-center">
                    {init.estimatedDelayDays > 0 ?
                  <span className="text-xs font-medium tabular-nums text-warning">+{init.estimatedDelayDays}d</span> :

                  <span className="text-xs text-muted-foreground">—</span>
                  }
                  </div>
                  <ChevronRight size={12} className="text-muted-foreground/30" />
                </Link>
              )}
            </div>
          </div>

          {/* Team capacity sidebar */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-primary" />
              <h3 className="text-sm font-semibold">Team Capacity</h3>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
              {(() => {
                const teams = new Map<string, {name: string;engineers: typeof data.engineerCapacities;}>();
                for (const eng of data.engineerCapacities) {
                  if (!teams.has(eng.teamId)) teams.set(eng.teamId, { name: eng.teamName, engineers: [] });
                  teams.get(eng.teamId)!.engineers.push(eng);
                }
                return [...teams.entries()].map(([teamId, team]) => {
                  const avgAlloc = Math.round(team.engineers.reduce((s, e) => s + e.currentAllocation, 0) / team.engineers.length);
                  const constrained = team.engineers.filter((e) => e.freeCapacity < 20).length;
                  return (
                    <Link
                      key={teamId}
                      to={`/app/horizon/timeline?team=${teamId}`}
                      className="block group hover:bg-accent/30 -mx-2 px-2 py-2 rounded-lg transition-colors">
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {team.name}
                          <span className="text-[10px] text-muted-foreground font-normal ml-1.5">
                            {team.engineers.length}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          {constrained > 0 &&
                          <Badge variant="secondary" className="text-[9px] h-4 bg-destructive/10 text-destructive">
                              {constrained} hot
                            </Badge>
                          }
                          <span className={cn(
                            "text-xs font-semibold tabular-nums",
                            avgAlloc > 80 ? "text-destructive" : avgAlloc >= 60 ? "text-warning" : "text-success"
                          )}>
                            {avgAlloc}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1.5">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            avgAlloc > 80 ? "bg-destructive" : avgAlloc >= 60 ? "bg-warning" : "bg-success"
                          )}
                          style={{ width: `${Math.min(avgAlloc, 100)}%` }} />
                        
                      </div>
                    </Link>);

                });
              })()}
            </div>

            {/* Available capacity */}
            <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-success" />
                  <h3 className="text-xs font-semibold">Available Engineers</h3>
                </div>
                <Link to="/app/horizon/capacity" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight size={10} />
                </Link>
              </div>
              <div className="divide-y divide-border/30">
                {data.engineerCapacities.
                filter((e) => e.isAvailable && e.freeCapacity >= 30).
                sort((a, b) => b.freeCapacity - a.freeCapacity).
                slice(0, 5).
                map((eng) =>
                <Link
                  key={eng.id}
                  to="/app/horizon/capacity"
                  className="flex items-center justify-between py-2 group hover:bg-accent/20 -mx-2 px-2 rounded transition-colors">
                  
                      <div>
                        <p className="text-xs font-medium group-hover:text-primary transition-colors">{eng.name}</p>
                        <p className="text-[10px] text-muted-foreground">{eng.role} · {eng.teamName}</p>
                      </div>
                      <span className={cn(
                    "text-xs font-bold tabular-nums",
                    eng.freeCapacity >= 60 ? "text-success" : "text-warning"
                  )}>
                        {eng.freeCapacity}%
                      </span>
                    </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
             PRIORITY 4: OPERATIONAL — Capacity Forecast + Skill Coverage
            ═══════════════════════════════════════════════════════ */}
        <div className="grid gap-4 lg:grid-cols-2">
          <CapacityForecast />
          <SkillCoverageHeatmap teamFilter="all" />
        </div>

        {/* ═══════════════════════════════════════════════════════
             PRIORITY 5: RECENT ACTIVITY + QUICK NAVIGATION
            ═══════════════════════════════════════════════════════ */}
        


























        
      </div>
    </TooltipProvider>);

}

/* ── Sub-components ───────────────────────────────────── */

function KPICard({
  icon: Icon, label, value, detail, accent, onClick, tooltip








}: {icon: typeof Users;label: string;value: string | number;detail: string;accent: "red" | "amber" | "green";onClick?: () => void;tooltip?: string;}) {
  const accents: Record<string, {border: string;bg: string;icon: string;value: string;}> = {
    red: { border: "border-destructive/20", bg: "bg-destructive/5", icon: "text-destructive", value: "text-destructive" },
    amber: { border: "border-warning/20", bg: "bg-warning/5", icon: "text-warning", value: "text-warning" },
    green: { border: "border-success/20", bg: "bg-success/5", icon: "text-success", value: "text-success" }
  };
  const a = accents[accent];

  const card =
  <button
    onClick={onClick}
    className={cn(
      "rounded-lg border p-3.5 text-left transition-all hover:shadow-sm w-full",
      a.border, a.bg,
      onClick && "cursor-pointer hover:ring-1 hover:ring-primary/20"
    )}>
    
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon size={14} strokeWidth={1.8} className={a.icon} />
      </div>
      <div className={cn("text-2xl font-bold tabular-nums mt-1", a.value)}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{detail}</div>
    </button>;


  if (!tooltip) return card;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>);

}

const severityConfig = {
  critical: { bg: "border-destructive/20 bg-destructive/5", badge: "bg-destructive/15 text-destructive", icon: "text-destructive" },
  high: { bg: "border-orange/20 bg-orange/5", badge: "bg-orange/15 text-orange", icon: "text-orange" },
  medium: { bg: "border-warning/20 bg-warning/5", badge: "bg-warning/15 text-warning", icon: "text-warning" }
};

const categoryIcons: Record<string, typeof AlertTriangle> = {
  capacity: Users,
  skill: Target,
  resilience: Shield,
  delivery: Rocket
};

function SignalCard({ signal }: {signal: ActionableSignal;}) {
  const config = severityConfig[signal.severity];
  const CatIcon = categoryIcons[signal.category] || Zap;

  return (
    <div className={cn("rounded-lg border p-4 transition-all hover:shadow-sm", config.bg)}>
      <div className="flex items-start gap-3">
        <CatIcon size={14} className={cn("mt-0.5 shrink-0", config.icon)} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{signal.problem}</span>
            <Badge variant="secondary" className={cn("text-[9px] h-4", config.badge)}>
              {signal.severity}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{signal.impact}</p>
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Lightbulb size={10} />
              <span>{signal.action}</span>
            </div>
            <Link
              to={signal.link}
              className="text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0">
              
              {signal.linkLabel} <ArrowUpRight size={9} />
            </Link>
          </div>
        </div>
      </div>
    </div>);

}

function RecommendationCard({ rec }: {rec: RecommendedAction;}) {
  const priorityStyles: Record<string, string> = {
    high: "border-destructive/20 bg-destructive/5",
    medium: "border-warning/20 bg-warning/5",
    low: "border-border/50 bg-card"
  };
  const priorityBadge: Record<string, string> = {
    high: "bg-destructive/15 text-destructive",
    medium: "bg-warning/15 text-warning",
    low: "bg-muted text-muted-foreground"
  };

  return (
    <div className={cn("rounded-lg border p-4 transition-all hover:shadow-sm", priorityStyles[rec.priority])}>
      <div className="flex items-start gap-3">
        <span className="text-base shrink-0 mt-0.5">{actionIcon[rec.type] || "💡"}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{rec.label}</span>
            <Badge variant="secondary" className={cn("text-[9px] h-4", priorityBadge[rec.priority])}>
              {rec.priority}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{rec.detail}</p>
          {(rec.initiativeId || rec.engineerId) &&
          <div className="flex gap-2 mt-2">
              {rec.initiativeId &&
            <Link to={`/app/work/initiatives/${rec.initiativeId}`} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                  View initiative <ArrowUpRight size={9} />
                </Link>
            }
              {rec.engineerId &&
            <Link to="/app/horizon/capacity" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                  View engineer <ArrowUpRight size={9} />
                </Link>
            }
            </div>
          }
        </div>
      </div>
    </div>);

}