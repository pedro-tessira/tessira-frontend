import { useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Users, Rocket, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { domains as initialDomains, getInitiativesForDomain, getEngineersForDomain, getDomainFTE } from "../data";
import type { Domain } from "../types";
import AddDomainDialog from "../components/AddDomainDialog";
import EditDomainDialog from "../components/EditDomainDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";

export default function DomainsPage() {
  const [localDomains, setLocalDomains] = useState<Domain[]>(initialDomains);
  const [editingDom, setEditingDom] = useState<Domain | null>(null);
  const [deletingDom, setDeletingDom] = useState<Domain | null>(null);

  const handleAdd = (domain: { name: string; description: string; owningTeamId: string; owningTeamName: string }) => {
    setLocalDomains((prev) => [...prev, { id: `dom-${Date.now()}`, ...domain }]);
  };

  const handleSave = (updated: Domain) => {
    setLocalDomains((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleDelete = (id: string) => {
    setLocalDomains((prev) => prev.filter((d) => d.id !== id));
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
            <div
              key={domain.id}
              className="rounded-lg border border-border/50 bg-card p-5 space-y-4 hover:border-primary/30 transition-colors group relative"
            >
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.preventDefault(); setEditingDom(domain); }}
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => { e.preventDefault(); setDeletingDom(domain); }}
                >
                  <Trash2 size={13} />
                </Button>
              </div>

              <Link to={`/app/work/domains/${domain.id}`} className="block space-y-4">
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
            </div>
          );
        })}
      </div>

      {editingDom && (
        <EditDomainDialog
          domain={editingDom}
          open={!!editingDom}
          onOpenChange={(open) => !open && setEditingDom(null)}
          onSave={handleSave}
        />
      )}

      {deletingDom && (
        <DeleteConfirmDialog
          open={!!deletingDom}
          onOpenChange={(open) => !open && setDeletingDom(null)}
          entityType="Domain"
          entityName={deletingDom.name}
          onConfirm={() => { handleDelete(deletingDom.id); setDeletingDom(null); }}
        />
      )}
    </div>
  );
}
