import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  Lightbulb,
  Rocket,
  Shield,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  computeDecisionSummary,
  type DeliveryRiskLevel,
  type InitiativeRisk,
  type RecommendedAction,
  type ValueStreamSummary,
} from "../lib/decision-engine";

/* ── Risk color helpers ──────────────────────────────── */
const riskColor: Record<DeliveryRiskLevel, string> = {
  critical: "text-destructive",
  high: "text-orange",
  medium: "text-warning",
  low: "text-success",
};
const riskBg: Record<DeliveryRiskLevel, string> = {
  critical: "bg-destructive/10 border-destructive/25",
  high: "bg-orange/10 border-orange/25",
  medium: "bg-warning/10 border-warning/25",
  low: "bg-success/10 border-success/25",
};
const riskBadge: Record<DeliveryRiskLevel, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/20",
  high: "bg-orange/15 text-orange border-orange/20",
  medium: "bg-warning/15 text-warning border-warning/20",
  low: "bg-success/15 text-success border-success/20",
};
const riskLabel: Record<DeliveryRiskLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const actionIcon: Record<string, string> = {
  add_role: "➕",
  reassign: "🔄",
  delay: "⏳",
  reduce_scope: "✂️",
  split_allocation: "📊",
};

/* ── Component ───────────────────────────────────────── */
export default function HorizonOverviewPage() {
  const navigate = useNavigate();
  const [vsFilter, setVsFilter] = useState<string | null>(null);
  const [showAllRecs, setShowAllRecs] = useState(false);

  const data = useMemo(() => computeDecisionSummary(), []);

  const filteredInitiatives = vsFilter
    ? data.allInitiativeRisks.filter((r) => r.valueStreamIds.includes(vsFilter))
    : data.allInitiativeRisks;

  const visibleRecs = showAllRecs ? data.recommendations : data.recommendations.slice(0, 5);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        {/* ═══════════════════════════════════════════════
            SECTION 1: DECISION LAYER — Critical alerts
           ═══════════════════════════════════════════════ */}
        {data.criticalRisks.length > 0 && (
          <div className="rounded-xl border border-destructive/20 bg-gradient-to-br from-destructive/5 via-card to-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-destructive" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">
                    {data.criticalRisks.length} critical delivery risk{data.criticalRisks.length !== 1 ? "s" : ""} detected
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Initiatives requiring immediate attention based on staffing, confidence, and availability analysis
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-xs gap-1.5 border-destructive/20 text-destructive hover:bg-destructive/5"
                onClick={() => {
                  const el = document.getElementById("recommendations-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Lightbulb size={12} /> View recommendations
              </Button>
            </div>

            <div className="space-y-2">
              {data.criticalRisks.map((risk) => (
                <Link
                  key={risk.id}
                  to={`/app/work/initiatives/${risk.id}?from=${encodeURIComponent("/app/horizon")}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all hover:shadow-sm",
                    riskBg[risk.deliveryRisk]
                  )}
                >
                  <div className={cn("shrink-0 font-bold text-sm tabular-nums", riskColor[risk.deliveryRisk])}>
                    {risk.riskScore}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{risk.name}</span>
                      <Badge variant="outline" className={cn("text-[9px] h-4 border", riskBadge[risk.deliveryRisk])}>
                        {riskLabel[risk.deliveryRisk]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {risk.riskReasons.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {risk.estimatedDelayDays > 0 && (
                      <p className="text-xs font-medium text-muted-foreground">
                        <Clock size={10} className="inline mr-1" />+{risk.estimatedDelayDays}d delay
                      </p>
                    )}
                    <div className="flex gap-1 mt-1">
                      {risk.roleGaps.slice(0, 2).map((g) => (
                        <Badge key={g.role} variant="secondary" className="text-[9px] h-4 bg-destructive/10 text-destructive">
                          -{g.gapFTE} {g.role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/40 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            SECTION 2: ACTIONABLE KPI CARDS
           ═══════════════════════════════════════════════ */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <KPICard
            icon={AlertTriangle}
            label="At Risk"
            value={data.stats.atRiskCount}
            detail={`of ${data.stats.totalInitiatives} initiatives`}
            accent={data.stats.atRiskCount > 2 ? "red" : data.stats.atRiskCount > 0 ? "amber" : "green"}
            onClick={() => navigate("/app/horizon/capacity")}
            tooltip="Initiatives with medium+ delivery risk"
          />
          <KPICard
            icon={TrendingDown}
            label="FTE Gap"
            value={data.stats.totalFTEGap}
            detail="Total missing capacity"
            accent={data.stats.totalFTEGap > 2 ? "red" : data.stats.totalFTEGap > 0 ? "amber" : "green"}
            onClick={() => navigate("/app/horizon/capacity")}
            tooltip="Sum of understaffed FTE across all initiatives"
          />
          <KPICard
            icon={UserMinus}
            label="Constrained"
            value={data.stats.constrainedEngineers}
            detail="Engineers < 20% free"
            accent={data.stats.constrainedEngineers > 3 ? "red" : data.stats.constrainedEngineers > 0 ? "amber" : "green"}
            onClick={() => navigate("/app/horizon/capacity")}
            tooltip="Engineers with less than 20% free capacity"
          />
          <KPICard
            icon={Lightbulb}
            label="Actions"
            value={data.stats.totalRecommendations}
            detail="Recommended actions"
            accent="blue"
            onClick={() => {
              const el = document.getElementById("recommendations-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            tooltip="AI-generated recommendations to resolve delivery risks"
          />
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 3: VALUE STREAM IMPACT
           ═══════════════════════════════════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              <h3 className="text-sm font-semibold">Value Stream Impact</h3>
            </div>
            <div className="flex gap-1">
              <Button
                variant={vsFilter === null ? "secondary" : "ghost"}
                size="sm"
                className="h-6 text-[11px] px-2"
                onClick={() => setVsFilter(null)}
              >
                All
              </Button>
              {data.valueStreamSummaries.map((vs) => (
                <Button
                  key={vs.id}
                  variant={vsFilter === vs.id ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-6 text-[11px] px-2 gap-1",
                    vsFilter === vs.id && vs.atRiskCount > 0 && "bg-destructive/10 text-destructive hover:bg-destructive/15"
                  )}
                  onClick={() => setVsFilter(vsFilter === vs.id ? null : vs.id)}
                >
                  {vs.name}
                  {vs.atRiskCount > 0 && (
                    <span className="h-4 w-4 rounded-full bg-destructive/20 text-destructive text-[9px] flex items-center justify-center font-bold">
                      {vs.atRiskCount}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {data.valueStreamSummaries.map((vs) => (
              <button
                key={vs.id}
                onClick={() => setVsFilter(vsFilter === vs.id ? null : vs.id)}
                className={cn(
                  "rounded-lg border p-3.5 text-left transition-all hover:shadow-sm",
                  vsFilter === vs.id
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 bg-card hover:border-primary/20"
                )}
              >
                <p className="text-xs font-semibold truncate">{vs.name}</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-lg font-bold tabular-nums">{vs.initiativeCount}</span>
                  <span className="text-[10px] text-muted-foreground">initiatives</span>
                </div>
                <div className="flex gap-2 mt-2 text-[10px]">
                  {vs.atRiskCount > 0 && (
                    <span className="text-destructive font-medium">{vs.atRiskCount} at risk</span>
                  )}
                  {vs.understaffedCount > 0 && (
                    <span className="text-warning font-medium">{vs.understaffedCount} understaffed</span>
                  )}
                  {vs.atRiskCount === 0 && vs.understaffedCount === 0 && (
                    <span className="text-success font-medium">On track</span>
                  )}
                </div>
                {vs.totalFTEGap > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                    {vs.totalFTEGap} FTE gap
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 4: INITIATIVE RISK TABLE
           ═══════════════════════════════════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Rocket size={14} className="text-primary" />
            <h3 className="text-sm font-semibold">
              Initiative Risk Assessment
              {vsFilter && (
                <span className="font-normal text-muted-foreground ml-1">
                  — {data.valueStreamSummaries.find((v) => v.id === vsFilter)?.name}
                </span>
              )}
            </h3>
            <span className="text-[11px] text-muted-foreground ml-auto">
              {filteredInitiatives.length} initiative{filteredInitiatives.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_100px_80px_80px_80px_32px] gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <span>Initiative</span>
              <span className="text-center">Risk</span>
              <span className="text-center">Staffing</span>
              <span className="text-center">FTE Gap</span>
              <span className="text-center">Delay</span>
              <span className="text-center">Conf.</span>
              <span />
            </div>

            {/* Rows */}
            {filteredInitiatives.map((init) => {
              const fteGap = init.roleGaps.reduce((s, g) => s + Math.max(0, g.gapFTE), 0);
              return (
                <Link
                  key={init.id}
                  to={`/app/work/initiatives/${init.id}?from=${encodeURIComponent("/app/horizon")}`}
                  className="grid grid-cols-[1fr_80px_100px_80px_80px_80px_32px] gap-2 px-4 py-3 border-b border-border/20 last:border-0 hover:bg-accent/30 transition-colors items-center"
                >
                  {/* Name + status */}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{init.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {init.riskReasons[0] || "On track"}
                    </p>
                  </div>

                  {/* Risk */}
                  <div className="text-center">
                    <Badge variant="outline" className={cn("text-[10px] h-5 border", riskBadge[init.deliveryRisk])}>
                      {riskLabel[init.deliveryRisk]}
                    </Badge>
                  </div>

                  {/* Staffing bar */}
                  <div className="flex items-center gap-1.5 justify-center">
                    <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          init.staffingStatus === "understaffed"
                            ? "bg-destructive"
                            : init.staffingStatus === "balanced"
                            ? "bg-success"
                            : "bg-warning"
                        )}
                        style={{ width: `${Math.min(100, init.requiredFTE > 0 ? (init.allocatedFTE / init.requiredFTE) * 100 : 0)}%` }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {init.allocatedFTE}/{init.requiredFTE}
                    </span>
                  </div>

                  {/* FTE Gap */}
                  <div className="text-center">
                    {fteGap > 0 ? (
                      <span className="text-xs font-semibold tabular-nums text-destructive">-{Math.round(fteGap * 10) / 10}</span>
                    ) : (
                      <span className="text-xs text-success">—</span>
                    )}
                  </div>

                  {/* Delay */}
                  <div className="text-center">
                    {init.estimatedDelayDays > 0 ? (
                      <span className="text-xs font-medium tabular-nums text-warning">+{init.estimatedDelayDays}d</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Confidence */}
                  <div className="text-center">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[9px] h-4",
                        init.confidence === "high"
                          ? "bg-success/10 text-success"
                          : init.confidence === "medium"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {init.confidence}
                    </Badge>
                  </div>

                  <ChevronRight size={12} className="text-muted-foreground/30" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 5: RECOMMENDED ACTIONS
           ═══════════════════════════════════════════════ */}
        <div id="recommendations-section" className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-warning" />
            <h3 className="text-sm font-semibold">Recommended Actions</h3>
            <span className="text-[11px] text-muted-foreground">
              — {data.recommendations.length} suggestion{data.recommendations.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-2">
            {visibleRecs.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>

          {data.recommendations.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={() => setShowAllRecs(!showAllRecs)}
            >
              {showAllRecs ? "Show less" : `Show all ${data.recommendations.length} recommendations`}
              <ArrowRight size={12} className="ml-1" />
            </Button>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 6: TEAM CAPACITY + ENGINEERS
           ═══════════════════════════════════════════════ */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Team load */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-primary" />
              <h3 className="text-sm font-semibold">Team Capacity</h3>
            </div>
            {(() => {
              // Group by team
              const teams = new Map<string, { name: string; engineers: typeof data.engineerCapacities }>();
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
                    className="block group hover:bg-accent/30 -mx-2 px-2 py-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {team.name}
                        <span className="text-[10px] text-muted-foreground font-normal ml-1.5">
                          {team.engineers.length} engineers
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        {constrained > 0 && (
                          <Badge variant="secondary" className="text-[9px] h-4 bg-destructive/10 text-destructive">
                            {constrained} constrained
                          </Badge>
                        )}
                        <span
                          className={cn(
                            "text-xs font-semibold tabular-nums",
                            avgAlloc > 80 ? "text-destructive" : avgAlloc >= 60 ? "text-warning" : "text-success"
                          )}
                        >
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
                        style={{ width: `${Math.min(avgAlloc, 100)}%` }}
                      />
                    </div>
                  </Link>
                );
              });
            })()}
          </div>

          {/* Available engineers */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={14} className="text-success" />
                <h3 className="text-sm font-semibold">Available Capacity</h3>
              </div>
              <Link to="/app/horizon/capacity" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight size={10} />
              </Link>
            </div>
            <div className="divide-y divide-border/30">
              {data.engineerCapacities
                .filter((e) => e.isAvailable && e.freeCapacity >= 30)
                .sort((a, b) => b.freeCapacity - a.freeCapacity)
                .slice(0, 6)
                .map((eng) => (
                  <Link
                    key={eng.id}
                    to="/app/horizon/capacity"
                    className="flex items-center justify-between py-2.5 group hover:bg-accent/20 -mx-2 px-2 rounded transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium group-hover:text-primary transition-colors">
                        {eng.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {eng.role} · {eng.teamName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-xs font-bold tabular-nums",
                        eng.freeCapacity >= 60 ? "text-success" : "text-warning"
                      )}>
                        {eng.freeCapacity}% free
                      </p>
                      {eng.activeInitiatives.length > 0 && (
                        <p className="text-[10px] text-muted-foreground tabular-nums">
                          {eng.activeInitiatives.length} active
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              {data.engineerCapacities.filter((e) => e.isAvailable && e.freeCapacity >= 30).length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No engineers with ≥ 30% free capacity
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 7: QUICK LINKS
           ═══════════════════════════════════════════════ */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <Link
            to="/app/horizon/timeline"
            className="rounded-lg border border-border/50 bg-card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors group"
          >
            <BarChart3 size={18} className="text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">Full Timeline</p>
              <p className="text-[10px] text-muted-foreground">View all allocations, events & availability</p>
            </div>
            <ArrowUpRight size={14} className="text-muted-foreground/40 shrink-0" />
          </Link>
          <Link
            to="/app/horizon/capacity"
            className="rounded-lg border border-border/50 bg-card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors group"
          >
            <Zap size={18} className="text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">Capacity Intelligence</p>
              <p className="text-[10px] text-muted-foreground">Detailed staffing & engineer timeline</p>
            </div>
            <ArrowUpRight size={14} className="text-muted-foreground/40 shrink-0" />
          </Link>
          <Link
            to="/app/signals"
            className="rounded-lg border border-border/50 bg-card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors group"
          >
            <Shield size={18} className="text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">Delivery Signals</p>
              <p className="text-[10px] text-muted-foreground">Risk analysis, SPOF & resilience</p>
            </div>
            <ArrowUpRight size={14} className="text-muted-foreground/40 shrink-0" />
          </Link>
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ── KPI Card ────────────────────────────────────────── */
function KPICard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
  onClick,
  tooltip,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  detail: string;
  accent: "red" | "amber" | "green" | "blue";
  onClick?: () => void;
  tooltip?: string;
}) {
  const accents: Record<string, { border: string; bg: string; icon: string; value: string }> = {
    red: { border: "border-destructive/20", bg: "bg-destructive/5", icon: "text-destructive", value: "text-destructive" },
    amber: { border: "border-warning/20", bg: "bg-warning/5", icon: "text-warning", value: "text-warning" },
    green: { border: "border-success/20", bg: "bg-success/5", icon: "text-success", value: "text-success" },
    blue: { border: "border-primary/20", bg: "bg-primary/5", icon: "text-primary", value: "text-primary" },
  };
  const a = accents[accent];

  const card = (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border p-3.5 text-left transition-all hover:shadow-sm w-full",
        a.border, a.bg,
        onClick && "cursor-pointer hover:ring-1 hover:ring-primary/20"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon size={14} strokeWidth={1.8} className={a.icon} />
      </div>
      <div className={cn("text-2xl font-bold tabular-nums mt-1", a.value)}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{detail}</div>
    </button>
  );

  if (!tooltip) return card;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

/* ── Recommendation Card ─────────────────────────────── */
function RecommendationCard({ rec }: { rec: RecommendedAction }) {
  const priorityStyles: Record<string, string> = {
    high: "border-destructive/20 bg-destructive/5",
    medium: "border-warning/20 bg-warning/5",
    low: "border-border/50 bg-card",
  };
  const priorityBadge: Record<string, string> = {
    high: "bg-destructive/15 text-destructive",
    medium: "bg-warning/15 text-warning",
    low: "bg-muted text-muted-foreground",
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
          {(rec.initiativeId || rec.engineerId) && (
            <div className="flex gap-2 mt-2">
              {rec.initiativeId && (
                <Link
                  to={`/app/work/initiatives/${rec.initiativeId}?from=${encodeURIComponent("/app/horizon")}`}
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                >
                  View initiative <ArrowUpRight size={9} />
                </Link>
              )}
              {rec.engineerId && (
                <Link
                  to="/app/horizon/capacity"
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                >
                  View engineer <ArrowUpRight size={9} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
