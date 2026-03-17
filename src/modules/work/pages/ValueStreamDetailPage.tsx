import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Globe, Rocket, Users, Boxes, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { getValueStream, getInitiativesForValueStream, getDomainsForValueStream, getEngineersForValueStream, getFTEByInitiative } from "../data";
import type { StaffingStatus } from "../types";

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

const staffingConfig: Record<StaffingStatus, { label: string; bgColor: string }> = {
  understaffed: { label: "Understaffed", bgColor: "bg-destructive" },
  balanced: { label: "Balanced", bgColor: "bg-success" },
  overstaffed: { label: "Overstaffed", bgColor: "bg-warning" },
};

export default function ValueStreamDetailPage() {
  const { valueStreamId } = useParams<{ valueStreamId: string }>();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get("from") || "/app/work/value-streams";
  const vs = getValueStream(valueStreamId ?? "");

  if (!vs) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-muted-foreground">Value Stream not found.</p>
        <Link to={backTo}><Button variant="outline" size="sm">Back</Button></Link>
      </div>
    );
  }

  const inits = getInitiativesForValueStream(vs.id);
  const vsdomains = getDomainsForValueStream(vs.id);
  const engineers = getEngineersForValueStream(vs.id);
  const initFTE = getFTEByInitiative(inits.map((i) => i.id));
  const totalAllocatedFTE = initFTE.reduce((s, f) => s + f.allocatedFTE, 0);
  const totalRequiredFTE = initFTE.reduce((s, f) => s + f.requiredFTE, 0);

  return (
    <div className="space-y-6">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={13} /> Back
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Globe size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">{vs.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{vs.description}</p>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
            <span className="font-semibold">{Math.round(totalAllocatedFTE * 10) / 10} / {Math.round(totalRequiredFTE * 10) / 10} FTE</span>
            <span>{inits.length} initiatives</span>
            <span>{engineers.length} engineers</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Initiative FTE Breakdown */}
          <div className="rounded-lg border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Rocket size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Initiative Allocation ({inits.length})</h2>
            </div>
            {initFTE.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No initiatives linked to this value stream.</p>
            ) : (
              <div className="space-y-3">
                {initFTE.map((f) => {
                  const sc = staffingConfig[f.status];
                  const fillPct = f.requiredFTE > 0 ? Math.min(100, Math.round((f.allocatedFTE / f.requiredFTE) * 100)) : 0;
                  return (
                    <Link
                      key={f.initiativeId}
                      to={`/app/work/initiatives/${f.initiativeId}?from=${encodeURIComponent(`/app/work/value-streams/${vs.id}`)}`}
                      className="block rounded-md border border-border/30 p-3 hover:border-primary/30 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{f.initiativeName}</p>
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

          {/* Engineers */}
          <div className="rounded-lg border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Engineers ({engineers.length})</h2>
            </div>
            <div className="divide-y divide-border/50">
              {engineers.map((eng) => (
                <div key={eng.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{eng.name}</p>
                    <p className="text-[11px] text-muted-foreground">{eng.teamName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Domains */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Boxes size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Domains ({vsdomains.length})</h2>
            </div>
            <div className="space-y-2">
              {vsdomains.map((d) => (
                <Link key={d.id} to={`/app/work/domains/${d.id}?from=${encodeURIComponent(`/app/work/value-streams/${vs.id}`)}`} className="block rounded-md border border-border/30 bg-muted/30 p-3 hover:border-primary/30 transition-colors">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">{d.owningTeamName}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
