import { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Rocket, Users, Boxes, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { valueStreams as initialVS, getInitiativesForValueStream, getDomainsForValueStream, getEngineersForValueStream } from "../data";
import type { ValueStream } from "../types";
import AddValueStreamDialog from "../components/AddValueStreamDialog";
import EditValueStreamDialog from "../components/EditValueStreamDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";

export default function ValueStreamsPage() {
  const [localVS, setLocalVS] = useState<ValueStream[]>(initialVS);
  const [editingVS, setEditingVS] = useState<ValueStream | null>(null);
  const [deletingVS, setDeletingVS] = useState<ValueStream | null>(null);

  const handleAdd = (vs: { name: string; description: string }) => {
    setLocalVS((prev) => [...prev, { id: `vs-${Date.now()}`, ...vs }]);
  };

  const handleSave = (updated: ValueStream) => {
    setLocalVS((prev) => prev.map((vs) => (vs.id === updated.id ? updated : vs)));
  };

  const handleDelete = (id: string) => {
    setLocalVS((prev) => prev.filter((vs) => vs.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddValueStreamDialog onAdd={handleAdd} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {localVS.map((vs) => {
          const inits = getInitiativesForValueStream(vs.id);
          const activeInits = inits.filter((i) => i.status === "active");
          const vsdomains = getDomainsForValueStream(vs.id);
          const engineers = getEngineersForValueStream(vs.id);

          return (
            <div
              key={vs.id}
              className="rounded-lg border border-border/50 bg-card p-5 space-y-4 hover:border-primary/30 transition-colors group relative"
            >
              {/* Edit / Delete actions */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.preventDefault(); setEditingVS(vs); }}
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => { e.preventDefault(); setDeletingVS(vs); }}
                >
                  <Trash2 size={13} />
                </Button>
              </div>

              <Link to={`/app/work/value-streams/${vs.id}`} className="block space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Globe size={16} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {vs.name}
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{vs.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Rocket size={12} />
                    {activeInits.length} active
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
            </div>
          );
        })}
      </div>

      {editingVS && (
        <EditValueStreamDialog
          valueStream={editingVS}
          open={!!editingVS}
          onOpenChange={(open) => !open && setEditingVS(null)}
          onSave={handleSave}
        />
      )}

      {deletingVS && (
        <DeleteConfirmDialog
          open={!!deletingVS}
          onOpenChange={(open) => !open && setDeletingVS(null)}
          entityType="Value Stream"
          entityName={deletingVS.name}
          onConfirm={() => { handleDelete(deletingVS.id); setDeletingVS(null); }}
        />
      )}
    </div>
  );
}
