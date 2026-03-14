import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NoteCategory, EvaluationType, NoteVisibility } from "../types";

const NOTE_CATEGORIES: NoteCategory[] = [
  "1:1",
  "Feedback",
  "Career Discussion",
  "Recognition",
  "Concern",
  "Follow-up",
  "Performance",
];

const EVALUATION_TYPES: EvaluationType[] = [
  "Decision Making",
  "Leadership Mindset",
  "Technical Excellence",
  "Ownership",
  "Collaboration",
  "Communication",
  "Execution",
  "Mentorship",
  "Delivery Impact",
  "Negative Behaviour",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    category: NoteCategory;
    evaluationTypes: EvaluationType[];
    visibility: NoteVisibility;
    text: string;
  }) => void;
}

export function AddNoteDialog({ open, onOpenChange, onSave }: Props) {
  const [category, setCategory] = useState<NoteCategory | "">("");
  const [selectedEvals, setSelectedEvals] = useState<EvaluationType[]>([]);
  const [text, setText] = useState("");

  const toggleEval = (et: EvaluationType) => {
    setSelectedEvals((prev) =>
      prev.includes(et) ? prev.filter((e) => e !== et) : [...prev, et]
    );
  };

  const reset = () => {
    setCategory("");
    setSelectedEvals([]);
    setText("");
  };

  const handleSave = () => {
    if (!category || !text.trim() || selectedEvals.length === 0) return;
    onSave({ category: category as NoteCategory, evaluationTypes: selectedEvals, text: text.trim() });
    reset();
    onOpenChange(false);
  };

  const isValid = category && text.trim() && selectedEvals.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Follow-up Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as NoteCategory)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {NOTE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Evaluation Types (multi-select via toggle chips) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Evaluation Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {EVALUATION_TYPES.map((et) => {
                const active = selectedEvals.includes(et);
                return (
                  <button
                    key={et}
                    type="button"
                    onClick={() => toggleEval(et)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {et}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note text */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Note</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Record your observation..."
              className="min-h-[100px] resize-none"
              maxLength={2000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => { reset(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid} onClick={handleSave}>
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
