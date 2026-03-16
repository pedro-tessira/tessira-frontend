import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getStreamRisks } from "../data";
import {
  coverageRisk, spofRisk,
  riskText, riskBg, riskBgSubtle, riskBorder, riskLabel,
} from "@/shared/lib/risk-colors";

export function StreamRiskMap() {
  const streamRisks = useMemo(() => getStreamRisks(), []);

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold">Stream Risk Map</h3>
          <p className="text-[11px] text-muted-foreground">Knowledge distribution and SPOF exposure by value stream</p>
        </div>
        <Link to="/app/signals/resilience" className="text-xs text-primary hover:underline">
          View resilience
        </Link>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {streamRisks.map((sr) => {
          const covRisk = coverageRisk(sr.coveragePct);
          const spRisk = sr.spofCount > 0 ? spofRisk(sr.spofCount) : "healthy";

          return (
            <Link
              key={sr.stream}
              to={`/app/work/value-streams/${sr.streamId}`}
              className={cn(
                "rounded-lg border p-4 space-y-3 tessira-transition hover:shadow-md hover:scale-[1.01]",
                riskBorder(covRisk),
                riskBgSubtle(covRisk),
              )}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold truncate">{sr.stream}</h4>
                <span className={cn("h-2 w-2 rounded-full shrink-0", riskBg(covRisk))} />
              </div>

              <div className="space-y-2">
                {/* Coverage bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className={cn("font-medium tabular-nums", riskText(covRisk))}>
                      {sr.coveragePct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full tessira-transition", riskBg(covRisk))}
                      style={{ width: `${sr.coveragePct}%` }}
                    />
                  </div>
                </div>

                {/* SPOFs */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle size={10} /> SPOFs
                  </span>
                  <span className={cn("font-medium tabular-nums", sr.spofCount > 0 ? riskText(spRisk) : "text-muted-foreground")}>
                    {sr.spofCount}
                  </span>
                </div>

                {/* Skills count */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Skills tracked</span>
                  <span className="tabular-nums text-foreground">{sr.skills.length}</span>
                </div>

                {/* Initiatives */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Initiatives</span>
                  <span className="tabular-nums text-foreground">{sr.initiativeCount}</span>
                </div>
              </div>

              {/* Risk label */}
              <div className={cn("text-[10px] font-medium uppercase tracking-wider", riskText(covRisk))}>
                {riskLabel(covRisk)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
