import { useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Users, Rocket } from "lucide-react";
import { domains as initialDomains, getInitiativesForDomain, getEngineersForDomain, getDomainFTE } from "../data";
import type { Domain } from "../types";
import AddDomainDialog from "../components/AddDomainDialog";

export default function DomainsPage() {
  const [localDomains, setLocalDomains] = useState<Domain[]>(initialDomains);

  const handleAdd = (domain: { name: string; description: string; owningTeamId: string; owningTeamName: string }) => {
    const newDomain: Domain = {
      id: `dom-${Date.now()}`,
      ...domain,
    };
    setLocalDomains((prev) => [...prev, newDomain]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddDomainDialog onAdd={handleAdd} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {localDomains.map((domain) => {
          const activeInits = getInitiativesForDomain(domain.id).filter((i) => i.status === "active");
          const engineers = getEngineersForDomain(domain.id);
          const fte = getDomainFTE(domain.id);

          return (
            <Link
              key={domain.id}
              to={`/app/work/domains/${domain.id}`}
              className="rounded-lg border border-border/50 bg-card p-5 space-y-4 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Boxes size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {domain.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{domain.owningTeamName}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{domain.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Rocket size={12} />
                  {activeInits.length} active initiative{activeInits.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={12} />
                  {engineers.length} engineer{engineers.length !== 1 ? "s" : ""}
                </span>
                {fte > 0 && (
                  <span className="ml-auto font-semibold tabular-nums text-foreground">
                    {fte} FTE
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
