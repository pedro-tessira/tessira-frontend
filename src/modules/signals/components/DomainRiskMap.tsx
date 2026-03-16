import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getDomainRisks } from "../data";
import {
  coverageRisk, spofRisk,
  riskText, riskBg, riskBgSubtle, riskBorder, riskLabel,
} from "@/shared/lib/risk-colors";

export function DomainRiskMap() {
  const domainRisks = useMemo(() => getDomainRisks(), []);

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold">Domain Risk Map</h3>
          <p className="text-[11px] text-muted-foreground">Knowledge distribution and SPOF exposure by domain</p>
        </div>
        <Link to="/app/signals/resilience" className="text-xs text-primary hover:underline">
          View resilience
        </Link>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {domainRisks.map((dr) => {
          const covRisk = coverageRisk(dr.coveragePct);
          const spRisk = dr.spofCount > 0 ? spofRisk(dr.spofCount) : "healthy";

          return (
            <div
              key={dr.domain}
              className={cn(
                "rounded-lg border p-4 space-y-3 tessira-transition",
                riskBorder(covRisk),
                riskBgSubtle(covRisk),
              )}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold truncate">{dr.domain}</h4>
                <span className={cn("h-2 w-2 rounded-full shrink-0", riskBg(covRisk))} />
              </div>

              <div className="space-y-2">
                {/* Coverage bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className={cn("font-medium tabular-nums", riskText(covRisk))}>
                      {dr.coveragePct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full tessira-transition", riskBg(covRisk))}
                      style={{ width: `${dr.coveragePct}%` }}
                    />
                  </div>
                </div>

                {/* SPOFs */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle size={10} /> SPOFs
                  </span>
                  <span className={cn("font-medium tabular-nums", dr.spofCount > 0 ? riskText(spRisk) : "text-muted-foreground")}>
                    {dr.spofCount}
                  </span>
                </div>

                {/* Skills count */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Skills tracked</span>
                  <span className="tabular-nums text-foreground">{dr.skills.length}</span>
                </div>
              </div>

              {/* Risk label */}
              <div className={cn("text-[10px] font-medium uppercase tracking-wider", riskText(covRisk))}>
                {riskLabel(covRisk)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
