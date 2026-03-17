import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Boxes, Rocket, Users, BarChart3, AlertTriangle, CheckCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { getDomain, getInitiativesForDomain, getEngineersForDomain, getAllocationsForDomain, getFTEByInitiative } from "../data";
import type { StaffingStatus } from "../types";

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

const staffingConfig: Record<StaffingStatus, { label: string; color: string; bgColor: string }> = {
  understaffed: { label: "Understaffed", color: "text-destructive", bgColor: "bg-destructive" },
  balanced: { label: "Balanced", color: "text-success", bgColor: "bg-success" },
  overstaffed: { label: "Overstaffed", color: "text-warning", bgColor: "bg-warning" },
};

export default function DomainDetailPage() {
  const { domainId } = useParams<{ domainId: string }>();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get("from") || "/app/work/domains";
  const domain = getDomain(domainId ?? "");

  if (!domain) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-muted-foreground">Domain not found.</p>
        <Link to="/app/work/domains"><Button variant="outline" size="sm">Back to Domains</Button></Link>
      </div>
    );
  }

  const inits = getInitiativesForDomain(domain.id);
  const engineers = getEngineersForDomain(domain.id);
  const allocs = getAllocationsForDomain(domain.id);
  const initFTE = getFTEByInitiative(inits.map((i) => i.id));
  const totalAllocatedFTE = initFTE.reduce((s, f) => s + f.allocatedFTE, 0);
  const totalRequiredFTE = initFTE.reduce((s, f) => s + f.requiredFTE, 0);

  return (
    <div className="space-y-6">
      <Link to="/app/work/domains" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={13} /> Back to Domains
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Boxes size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">{domain.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{domain.description}</p>
          <p className="text-xs text-muted-foreground mt-1">Owned by {domain.owningTeamName}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Initiative Allocation Breakdown */}
          <div className="rounded-lg border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Rocket size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Initiative Allocation ({inits.length})</h2>
            </div>
            {initFTE.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No initiatives linked to this domain.</p>
            ) : (
              <div className="space-y-3">
                {initFTE.map((f) => {
                  const sc = staffingConfig[f.status];
                  const fillPct = f.requiredFTE > 0 ? Math.min(100, Math.round((f.allocatedFTE / f.requiredFTE) * 100)) : 0;
                  return (
                    <Link
                      key={f.initiativeId}
                      to={`/app/work/initiatives/${f.initiativeId}`}
                      className="block rounded-md border border-border/30 p-3 hover:border-primary/30 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{f.initiativeName}</p>
                        </div>
                        <Badge variant="secondary" className={cn("text-[10px]", f.status === "understaffed" ? "bg-destructive/10 text-destructive" : f.status === "balanced" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                          {sc.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="font-semibold tabular-nums">{f.allocatedFTE} / {f.requiredFTE} FTE</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full", sc.bgColor)} style={{ width: `${fillPct}%` }} />
                        </div>
                        <span className="tabular-nums">{fillPct}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Engineers with initiative split */}
          <div className="rounded-lg border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Engineers ({engineers.length})</h2>
            </div>
            <div className="divide-y divide-border/50">
              {engineers.map((eng) => {
                const engAllocs = allocs.filter((a) => a.employeeId === eng.id);
                const totalPct = engAllocs.reduce((s, a) => s + a.percentage, 0);
                return (
                  <div key={eng.id} className="py-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{eng.name}</p>
                        <p className="text-[11px] text-muted-foreground">{eng.teamName}</p>
                      </div>
                      <span className="text-xs font-semibold tabular-nums">{totalPct}%</span>
                    </div>
                    {/* Initiative split bar */}
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      {engAllocs.map((a, i) => (
                        <div
                          key={a.id}
                          className="h-full first:rounded-l-full last:rounded-r-full"
                          style={{
                            width: `${a.percentage}%`,
                            backgroundColor: `hsl(var(--primary) / ${0.4 + (i * 0.2)})`,
                          }}
                          title={`${a.initiativeName}: ${a.percentage}%`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                      {engAllocs.map((a) => (
                        <span key={a.id}>{a.initiativeName} {a.percentage}%</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Capacity Summary</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Required FTE</span>
                <span className="font-bold tabular-nums">{Math.round(totalRequiredFTE * 10) / 10}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Allocated FTE</span>
                <span className="font-bold tabular-nums">{Math.round(totalAllocatedFTE * 10) / 10}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Gap</span>
                <span className={cn("font-bold tabular-nums", totalAllocatedFTE < totalRequiredFTE ? "text-destructive" : "text-success")}>
                  {totalAllocatedFTE >= totalRequiredFTE ? "+" : ""}{Math.round((totalAllocatedFTE - totalRequiredFTE) * 10) / 10} FTE
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Engineers</span>
                <span className="font-bold tabular-nums">{engineers.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Initiatives</span>
                <span className="font-bold tabular-nums">{inits.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
