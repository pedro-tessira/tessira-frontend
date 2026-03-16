import { Link } from "react-router-dom";
import { Globe, Rocket, Users, Boxes } from "lucide-react";
import { valueStreams, getInitiativesForValueStream, getDomainsForValueStream, getEngineersForValueStream } from "../data";

export default function ValueStreamsPage() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {valueStreams.map((vs) => {
          const inits = getInitiativesForValueStream(vs.id);
          const activeInits = inits.filter((i) => i.status === "active");
          const vsdomains = getDomainsForValueStream(vs.id);
          const engineers = getEngineersForValueStream(vs.id);

          return (
            <Link
              key={vs.id}
              to={`/app/work/value-streams/${vs.id}`}
              className="rounded-lg border border-border/50 bg-card p-5 space-y-4 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Globe size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {vs.name}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{vs.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Rocket size={12} />
                  {activeInits.length} active initiative{activeInits.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Boxes size={12} />
                  {vsdomains.length} domain{vsdomains.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={12} />
                  {engineers.length} engineer{engineers.length !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
