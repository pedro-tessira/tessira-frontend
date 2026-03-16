import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Globe, Rocket, Users, Boxes, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { getValueStream, getInitiativesForValueStream, getDomainsForValueStream, getEngineersForValueStream } from "../data";

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

export default function ValueStreamDetailPage() {
  const { valueStreamId } = useParams<{ valueStreamId: string }>();
  const vs = getValueStream(valueStreamId ?? "");

  if (!vs) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-muted-foreground">Value Stream not found.</p>
        <Link to="/app/work">
          <Button variant="outline" size="sm">Back to Value Streams</Button>
        </Link>
      </div>
    );
  }

  const inits = getInitiativesForValueStream(vs.id);
  const vsdomains = getDomainsForValueStream(vs.id);
  const engineers = getEngineersForValueStream(vs.id);

  return (
    <div className="space-y-6">
      <Link to="/app/work" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={13} /> Back to Value Streams
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Globe size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">{vs.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{vs.description}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Initiatives */}
          <div className="rounded-lg border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Rocket size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Initiatives ({inits.length})</h2>
            </div>
            {inits.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No initiatives linked to this value stream.</p>
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
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Calendar size={10} />
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
                <Link
                  key={d.id}
                  to={`/app/work/domains/${d.id}`}
                  className="block rounded-md border border-border/30 bg-muted/30 p-3 hover:border-primary/30 transition-colors"
                >
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
