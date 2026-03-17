import { cn } from "@/shared/lib/utils";
import { AlertTriangle, ArrowRight, Shield, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DecisionSummary, InitiativeRisk } from "../lib/decision-engine";

interface Props {
  summary: DecisionSummary;
  onInitiativeClick?: (id: string) => void;
  onViewRecommendations?: () => void;
}

const riskColor: Record<string, string> = {
  critical: "text-destructive",
  high: "text-amber-600 dark:text-amber-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-emerald-600 dark:text-emerald-400",
};

const riskBadge: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/20",
  high: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  medium: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

export default function TimelineDecisionBanner({ summary, onInitiativeClick, onViewRecommendations }: Props) {
  const { criticalRisks, stats } = summary;

  if (criticalRisks.length === 0) return null;

  const topRisks = criticalRisks.slice(0, 3);

  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-destructive/15 flex items-center justify-center">
            <AlertTriangle size={16} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {stats.criticalCount} delivery risk{stats.criticalCount !== 1 ? "s" : ""} detected
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.totalFTEGap} FTE gap · {stats.constrainedEngineers} constrained engineer{stats.constrainedEngineers !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {onViewRecommendations && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 border-destructive/20 hover:bg-destructive/10" onClick={onViewRecommendations}>
            View recommendations <ArrowRight size={12} />
          </Button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {topRisks.map((risk) => (
          <button
            key={risk.id}
            onClick={() => onInitiativeClick?.(risk.id)}
            className="flex items-start gap-2.5 rounded-md border border-border/50 bg-card/50 p-2.5 text-left hover:border-primary/30 transition-colors"
          >
            <div className={cn("mt-0.5", riskColor[risk.deliveryRisk])}>
              {risk.deliveryRisk === "critical" ? <AlertTriangle size={13} /> : <Shield size={13} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{risk.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {risk.riskReasons[0]}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className={cn("text-[10px] h-4 px-1", riskBadge[risk.deliveryRisk])}>
                  {risk.deliveryRisk}
                </Badge>
                {risk.estimatedDelayDays > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock size={9} /> +{risk.estimatedDelayDays}d
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
