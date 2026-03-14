import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { NoteCategory, EvaluationType, NoteVisibility, NoteImpact, NotePolarity } from "../types";

const NOTE_CATEGORIES: NoteCategory[] = [
  "1:1", "Feedback", "Career Discussion", "Recognition", "Concern", "Follow-up", "Performance",
];

const EVALUATION_TYPES: EvaluationType[] = [
  "Decision Making", "Leadership Mindset", "Technical Excellence", "Ownership",
  "Collaboration", "Communication", "Execution", "Mentorship",
  "Delivery Impact", "Reliability", "Negative Behaviour",
];

const POLARITY_OPTIONS: { value: NotePolarity; label: string }[] = [
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

const IMPACT_OPTIONS: { value: NoteImpact; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    category: NoteCategory;
    evaluationTypes: EvaluationType[];
    visibility: NoteVisibility;
    polarity: NotePolarity;
    impact: NoteImpact;
    text: string;
    followUpRequired: boolean;
    followUpDate: string | null;
  }) => void;
}

export function AddNoteDialog({ open, onOpenChange, onSave }: Props) {
  const [category, setCategory] = useState<NoteCategory | "">("");
  const [visibility, setVisibility] = useState<NoteVisibility>("visible");
  const [polarity, setPolarity] = useState<NotePolarity>("neutral");
  const [impact, setImpact] = useState<NoteImpact>("medium");
  const [selectedEvals, setSelectedEvals] = useState<EvaluationType[]>([]);
  const [text, setText] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  const toggleEval = (et: EvaluationType) => {
    setSelectedEvals((prev) =>
      prev.includes(et) ? prev.filter((e) => e !== et) : [...prev, et]
    );
  };

  const reset = () => {
    setCategory("");
    setVisibility("visible");
    setPolarity("neutral");
    setImpact("medium");
    setSelectedEvals([]);
    setText("");
    setFollowUpRequired(false);
    setFollowUpDate("");
  };

  const handleSave = () => {
    if (!category || !text.trim() || selectedEvals.length === 0) return;
    onSave({
      category: category as NoteCategory,
      evaluationTypes: selectedEvals,
      visibility,
      polarity,
      impact,
      text: text.trim(),
      followUpRequired,
      followUpDate: followUpRequired && followUpDate ? followUpDate : null,
    });
    reset();
    onOpenChange(false);
  };

  const isValid = category && text.trim() && selectedEvals.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Follow-up Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Row: Category + Visibility */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as NoteCategory)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as NoteVisibility)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row: Polarity + Impact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Polarity</Label>
              <Select value={polarity} onValueChange={(v) => setPolarity(v as NotePolarity)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POLARITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Impact</Label>
              <Select value={impact} onValueChange={(v) => setImpact(v as NoteImpact)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPACT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Evaluation Dimensions */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Evaluation Dimensions</Label>
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

          {/* Follow-up */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={followUpRequired}
                onCheckedChange={setFollowUpRequired}
                id="follow-up-toggle"
              />
              <Label htmlFor="follow-up-toggle" className="text-xs font-medium cursor-pointer">
                Follow-up required
              </Label>
            </div>
            {followUpRequired && (
              <div className="space-y-1.5 pl-10">
                <Label className="text-xs font-medium">Follow-up Date</Label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="h-9 w-48"
                />
              </div>
            )}
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
