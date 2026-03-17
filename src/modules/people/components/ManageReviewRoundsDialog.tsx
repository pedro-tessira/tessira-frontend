import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Check, X, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface ReviewRoundEntry {
  id: string;
  label: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rounds: ReviewRoundEntry[];
  activeRoundId: string;
  onAdd: (id: string, label: string) => void;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onClone: (sourceId: string, newId: string, newLabel: string) => void;
}

export function ManageReviewRoundsDialog({
  open, onOpenChange, rounds, activeRoundId, onAdd, onRename, onDelete, onClone,
}: Props) {
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ReviewRoundEntry | null>(null);

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    if (rounds.some((r) => r.label.toLowerCase() === label.toLowerCase())) {
      toast({ title: "Duplicate name", description: "A round with that name already exists.", variant: "destructive" });
      return;
    }
    const id = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onAdd(id, label);
    setNewLabel("");
    toast({ title: "Round created", description: `"${label}" has been added.` });
  };

  const handleRename = (id: string) => {
    const label = editLabel.trim();
    if (!label) return;
    if (rounds.some((r) => r.id !== id && r.label.toLowerCase() === label.toLowerCase())) {
      toast({ title: "Duplicate name", description: "A round with that name already exists.", variant: "destructive" });
      return;
    }
    onRename(id, label);
    setEditingId(null);
    toast({ title: "Round renamed", description: `Renamed to "${label}".` });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    onDelete(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: "Round deleted", description: `"${deleteTarget.label}" has been removed.` });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Review Rounds</DialogTitle>
            <DialogDescription>Create, rename, or remove review rounds for the 9-box matrix.</DialogDescription>
          </DialogHeader>

          {/* Add new */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="new-round" className="text-xs">New round</Label>
              <Input
                id="new-round"
                placeholder="e.g. Q2 2026"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="h-8 text-sm"
              />
            </div>
            <Button size="sm" className="h-8" onClick={handleAdd} disabled={!newLabel.trim()}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>

          {/* List */}
          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            {rounds.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 group"
              >
                {editingId === r.id ? (
                  <>
                    <Input
                      autoFocus
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(r.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-7 text-sm flex-1"
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRename(r.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm flex-1 truncate">{r.label}</span>
                    {r.id === activeRoundId && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Active</span>
                    )}
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { setEditingId(r.id); setEditLabel(r.label); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      disabled={rounds.length <= 1}
                      onClick={() => setDeleteTarget(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              All placements in this round will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
