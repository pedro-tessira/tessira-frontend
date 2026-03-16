import { useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Calendar, Globe, Boxes, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { initiatives as initialInits, domains, valueStreams, getAllocationLoad } from "../data";
import type { Initiative } from "../types";
import AddInitiativeDialog from "../components/AddInitiativeDialog";
import EditInitiativeDialog from "../components/EditInitiativeDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";

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
  const [editingInit, setEditingInit] = useState<Initiative | null>(null);
  const [deletingInit, setDeletingInit] = useState<Initiative | null>(null);

  const handleAdd = (init: {
    name: string;
    description: string;
    status: "planned" | "active" | "completed";
    startDate: string;
    endDate: string;
    domainIds: string[];
    valueStreamIds: string[];
  }) => {
    setLocalInits((prev) => [...prev, { id: `init-${Date.now()}`, ...init }]);
  };

  const handleSave = (updated: Initiative) => {
    setLocalInits((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleDelete = (id: string) => {
    setLocalInits((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddInitiativeDialog domains={domains} valueStreams={valueStreams} onAdd={handleAdd} />
      </div>
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_100px_100px_60px_70px_60px] gap-3 px-5 py-3 border-b border-border/50 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Name</span>
          <span>Domains</span>
          <span>Value Streams</span>
          <span>Start</span>
          <span>End</span>
          <span className="text-right">Load</span>
          <span className="text-center">Status</span>
          <span></span>
        </div>
        {localInits.map((init) => {
          const initDomains = init.domainIds.map((id) => domains.find((d) => d.id === id)!).filter(Boolean);
          const initVS = init.valueStreamIds.map((id) => valueStreams.find((vs) => vs.id === id)!).filter(Boolean);
          const load = getAllocationLoad(init.id);
          return (
            <div
              key={init.id}
              className="grid grid-cols-[1fr_1fr_1fr_100px_100px_60px_70px_60px] gap-3 px-5 py-3 border-b border-border/30 last:border-0 items-center hover:bg-accent/30 transition-colors group"
            >
              <Link to={`/app/work/initiatives/${init.id}`} className="flex items-center gap-2.5">
                <Rocket size={14} className="text-primary/60 shrink-0" />
                <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">{init.name}</span>
              </Link>
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
              <div className="flex justify-center">
                <Badge variant="secondary" className={cn("text-[10px]", statusColors[init.status])}>
                  {init.status}
                </Badge>
              </div>
              <div className="flex gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setEditingInit(init)}
                >
                  <Pencil size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeletingInit(init)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {editingInit && (
        <EditInitiativeDialog
          initiative={editingInit}
          domains={domains}
          valueStreams={valueStreams}
          open={!!editingInit}
          onOpenChange={(open) => !open && setEditingInit(null)}
          onSave={handleSave}
        />
      )}

      {deletingInit && (
        <DeleteConfirmDialog
          open={!!deletingInit}
          onOpenChange={(open) => !open && setDeletingInit(null)}
          entityType="Initiative"
          entityName={deletingInit.name}
          onConfirm={() => { handleDelete(deletingInit.id); setDeletingInit(null); }}
        />
      )}
    </div>
  );
}
