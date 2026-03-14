import { useState } from "react";
import { Plus, StickyNote, Eye, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FollowUpNote, NoteCategory, EvaluationType, NoteVisibility, NoteImpact } from "../types";
import { getNotesForEmployee, addNote } from "../data";
import { AddNoteDialog } from "./AddNoteDialog";

const categoryColor: Record<NoteCategory, string> = {
  "1:1": "bg-primary/10 text-primary",
  Feedback: "bg-chart-2/20 text-chart-2",
  "Career Discussion": "bg-chart-3/20 text-chart-3",
  Recognition: "bg-chart-4/20 text-chart-4",
  Concern: "bg-destructive/10 text-destructive",
  "Follow-up": "bg-chart-5/20 text-chart-5",
  Performance: "bg-accent text-accent-foreground",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FollowUpNotes({ employeeId }: { employeeId: string }) {
  const [notes, setNotes] = useState<FollowUpNote[]>(() =>
    getNotesForEmployee(employeeId)
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = (data: {
    category: NoteCategory;
    evaluationTypes: EvaluationType[];
    visibility: NoteVisibility;
    text: string;
  }) => {
    const created = addNote({
      employeeId,
      author: "You",
      ...data,
    });
    setNotes((prev) => [created, ...prev]);
  };

  return (
    <>
      <div className="rounded-lg border border-border/50 bg-card">
        <div className="border-b border-border/50 px-5 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Follow-up Notes</h3>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setDialogOpen(true)}
          >
            <Plus size={12} />
            Add Note
          </Button>
        </div>

        {notes.length > 0 ? (
          <div className="divide-y divide-border/50">
            {notes.map((note) => (
              <div key={note.id} className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(note.date)}</span>
                    <span>·</span>
                    <span>{note.author}</span>
                    <span>·</span>
                    {note.visibility === "personal" ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                        <Lock size={10} /> Personal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                        <Eye size={10} /> Visible
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      categoryColor[note.category] ?? "bg-accent text-accent-foreground"
                    }`}
                  >
                    {note.category}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {note.evaluationTypes.map((et) => (
                    <Badge
                      key={et}
                      variant="secondary"
                      className="text-[10px] font-medium px-1.5 py-0"
                    >
                      {et}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <StickyNote size={20} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No follow-up notes yet. Add one to start tracking observations.
            </p>
          </div>
        )}
      </div>

      <AddNoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAdd}
      />
    </>
  );
}
