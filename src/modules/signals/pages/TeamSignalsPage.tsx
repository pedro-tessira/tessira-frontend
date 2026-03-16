import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { SignalBadge, TrendIndicator, CapacityBar, ScoreGauge } from "../components/SignalIndicators";
import { computeTeamSignals } from "../data";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle, Shield, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  allocationRisk, coverageRisk, spofRisk,
  riskText, riskBg, riskBgSubtle, riskBorder,
} from "@/shared/lib/risk-colors";
import { useHealthWeights } from "../contexts/HealthWeightsContext";
import { HealthWeightsDialog } from "../components/HealthWeightsDialog";

export default function TeamSignalsPage() {
  const { normalized } = useHealthWeights();
  const teamSignals = useMemo(() => computeTeamSignals(normalized), [normalized]);
  const sorted = [...teamSignals].sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Team Signals"
        description="Compare delivery pressure, health, and operational status across teams."
        breadcrumbs={[
          { label: "Signals", href: "/app/signals" },
          { label: "Teams" },
        ]}
        actions={<HealthWeightsDialog />}
      />

      <div className="space-y-4">
        {sorted.map((team) => {
          const freeCapacity = 100 - team.allocation;
          const freeRisk = freeCapacityRisk(freeCapacity);
          const covRisk = coverageRisk(team.coverageScore);
          const spRisk = spofRisk(team.spofCount);

          return (
            <div key={team.teamId} className="rounded-lg border border-border/50 bg-card">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/app/people/teams/${team.teamId}`}
                    className="text-sm font-semibold hover:text-primary tessira-transition"
                  >
                    {team.teamName}
                  </Link>
                  <span className="text-xs text-muted-foreground">{team.memberCount} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <SignalBadge status={team.deliveryLoad} />
                  {team.busFactor != null && team.busFactor < 3 && (
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      team.busFactor < 2 ? "bg-destructive/10 text-destructive" : "bg-orange/10 text-orange"
                    )}>
                      <Shield size={10} />
                      Bus Factor: {team.busFactor}
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="p-5">
                <div className="grid gap-6 sm:grid-cols-4">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <ScoreGauge score={team.healthScore} label="Health Score" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[240px] text-xs leading-relaxed">
                        <p className="font-semibold mb-1">Health Score (0–10)</p>
                        <p>Weighted composite of:</p>
                        <ul className="list-disc pl-3.5 mt-0.5 space-y-0.5 text-muted-foreground">
                          <li>Allocation pressure (30%)</li>
                          <li>Coverage score (30%)</li>
                          <li>SPOF count (20%)</li>
                          <li>Bus factor (20%)</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Allocation + Free Capacity */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Free Capacity</div>
                    <div className={cn("text-xl font-bold tabular-nums", riskText(freeRisk))}>
                      {freeCapacity}%
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      Allocation: {team.allocation}%
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex">
                      <div
                        className="h-full bg-primary/40"
                        style={{ width: `${team.allocation}%` }}
                      />
                      <div
                        className={cn("h-full", riskBg(freeRisk))}
                        style={{ width: `${freeCapacity}%` }}
                      />
                    </div>
                  </div>

                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2 cursor-help">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wider">
                            Capacity Trend
                            <Info size={10} className="text-muted-foreground/50" />
                          </div>
                          <TrendIndicator direction={team.capacityTrend} value={
                            team.capacityTrend === "up" ? "Increasing load" :
                            team.capacityTrend === "down" ? "Decreasing load" : "Stable"
                          } />
                          <div className="text-xs text-muted-foreground">
                            {freeCapacity < 10 ? "Critical — no buffer" : freeCapacity < 20 ? "Low buffer" : freeCapacity < 40 ? "Moderate buffer" : "Healthy buffer"}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[240px] text-xs leading-relaxed">
                        <p className="font-semibold mb-1">Capacity Trend</p>
                        <p className="text-muted-foreground">Direction of allocation pressure over recent periods. Derived from team FTE allocation vs total capacity.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2 cursor-help">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wider">
                            Coverage
                            <Info size={10} className="text-muted-foreground/50" />
                          </div>
                          <div className={cn("text-xl font-bold tabular-nums", riskText(covRisk))}>
                            {team.coverageScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.spofCount > 0
                              ? <span className={cn("font-medium", riskText(spRisk))}>{team.spofCount} SPOF{team.spofCount > 1 ? "s" : ""}</span>
                              : <span className="text-success">No SPOFs</span>
                            }
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[240px] text-xs leading-relaxed">
                        <p className="font-semibold mb-1">Coverage Score (0–100%)</p>
                        <p className="text-muted-foreground">Per-skill score weighted by role:</p>
                        <ul className="list-disc pl-3.5 mt-0.5 space-y-0.5 text-muted-foreground">
                          <li>Owner = 1.0</li>
                          <li>Backup = 0.6</li>
                          <li>Learner = 0.3</li>
                        </ul>
                        <p className="mt-1 text-muted-foreground">Averaged across all team skills, normalized to 100%.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Alerts */}
                {team.alerts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-1.5">
                    {team.alerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <AlertTriangle size={12} className="text-warning mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{alert}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
