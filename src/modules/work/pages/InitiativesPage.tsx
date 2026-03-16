import { useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Calendar, Globe, Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { initiatives as initialInits, domains, valueStreams, getAllocationLoad } from "../data";
import type { Initiative } from "../types";
import AddInitiativeDialog from "../components/AddInitiativeDialog";

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function InitiativesPage() {
  const [localInits, setLocalInits] = useState<Initiative[]>(initialInits);

  const handleAdd = (init: {
    name: string;
    description: string;
    status: "planned" | "active" | "completed";
    startDate: string;
    endDate: string;
    domainIds: string[];
    valueStreamIds: string[];
  }) => {
    const newInit: Initiative = {
      id: `init-${Date.now()}`,
      ...init,
    };
    setLocalInits((prev) => [...prev, newInit]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddInitiativeDialog domains={domains} valueStreams={valueStreams} onAdd={handleAdd} />
      </div>
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_120px_120px_80px_80px] gap-4 px-5 py-3 border-b border-border/50 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Name</span>
          <span>Domains</span>
          <span>Value Streams</span>
          <span>Start</span>
          <span>End</span>
          <span className="text-right">Load</span>
          <span className="text-right">Status</span>
        </div>
        {localInits.map((init) => {
          const initDomains = init.domainIds.map((id) => domains.find((d) => d.id === id)!).filter(Boolean);
          const initVS = init.valueStreamIds.map((id) => valueStreams.find((vs) => vs.id === id)!).filter(Boolean);
          const load = getAllocationLoad(init.id);
          return (
            <Link
              key={init.id}
              to={`/app/work/initiatives/${init.id}`}
              className="grid grid-cols-[1fr_1fr_1fr_120px_120px_80px_80px] gap-4 px-5 py-3 border-b border-border/30 last:border-0 items-center hover:bg-accent/30 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Rocket size={14} className="text-primary/60 shrink-0" />
                <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">{init.name}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {initDomains.map((d) => (
                  <Badge key={d.id} variant="secondary" className="text-[10px]">
                    <Boxes size={9} className="mr-1" />{d.name}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {initVS.map((vs) => (
                  <Badge key={vs.id} variant="outline" className="text-[10px]">
                    <Globe size={9} className="mr-1" />{vs.name}
                  </Badge>
                ))}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1.5">
                <Calendar size={11} />
                {formatDate(init.startDate)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1.5">
                <Calendar size={11} />
                {formatDate(init.endDate)}
              </span>
              <span className="text-xs font-semibold tabular-nums text-right">{load}%</span>
              <div className="flex justify-end">
                <Badge variant="secondary" className={cn("text-[10px]", statusColors[init.status])}>
                  {init.status}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
