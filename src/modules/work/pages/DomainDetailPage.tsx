import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Boxes, Rocket, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { getDomain, getInitiativesForDomain, getEngineersForDomain, getAllocationsForDomain, getDomainLoadPercent } from "../data";

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

export default function DomainDetailPage() {
  const { domainId } = useParams<{ domainId: string }>();
  const domain = getDomain(domainId ?? "");

  if (!domain) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-muted-foreground">Domain not found.</p>
        <Link to="/app/work/domains">
          <Button variant="outline" size="sm">Back to Domains</Button>
        </Link>
      </div>
    );
  }

  const inits = getInitiativesForDomain(domain.id);
  const engineers = getEngineersForDomain(domain.id);
  const allocs = getAllocationsForDomain(domain.id);
  const totalLoad = getDomainLoadPercent(domain.id);

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
          {/* Active Initiatives */}
          <div className="rounded-lg border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Rocket size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Initiatives ({inits.length})</h2>
            </div>
            {inits.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No initiatives linked to this domain.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {inits.map((init) => (
                  <Link
                    key={init.id}
                    to={`/app/work/initiatives/${init.id}`}
                    className="flex items-center justify-between py-3 group hover:bg-accent/30 -mx-2 px-2 rounded transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{init.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(init.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} → {new Date(init.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <Badge variant="secondary" className={cn("text-[11px]", statusColors[init.status])}>
                      {init.status}
                    </Badge>
                  </Link>
                ))}
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
              {engineers.map((eng) => {
                const engAllocs = allocs.filter((a) => a.employeeId === eng.id);
                const totalPct = engAllocs.reduce((s, a) => s + a.percentage, 0);
                return (
                  <div key={eng.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{eng.name}</p>
                      <p className="text-[11px] text-muted-foreground">{eng.teamName}</p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">{totalPct}% allocated</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Domain Load */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Domain Load</h2>
            </div>
            <div className="text-3xl font-bold tabular-nums">{totalLoad}%</div>
            <p className="text-xs text-muted-foreground">
              Total allocation across {inits.length} initiative{inits.length !== 1 ? "s" : ""} and {engineers.length} engineer{engineers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
