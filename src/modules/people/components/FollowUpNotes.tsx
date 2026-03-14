import { useState, useMemo } from "react";
import { Plus, StickyNote, Eye, Lock, CalendarClock, TrendingUp, AlertTriangle, BarChart3, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { FollowUpNote, NoteCategory, EvaluationType, NoteVisibility, NoteImpact, NotePolarity } from "../types";
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

const polarityStyle: Record<NotePolarity, string> = {
  positive: "bg-chart-2/15 text-chart-2",
  neutral: "bg-muted text-muted-foreground",
  negative: "bg-destructive/15 text-destructive",
};

const impactStyle: Record<NoteImpact, string> = {
  low: "bg-chart-2/15 text-chart-2",
  medium: "bg-chart-4/15 text-chart-4",
  high: "bg-orange-500/15 text-orange-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Signals Placeholder ──────────────────────────────────────────

function LeadershipSignalsPlaceholder({ notes }: { notes: FollowUpNote[] }) {
  const positiveCount = notes.filter((n) => n.polarity === "positive").length;
  const negativeCount = notes.filter((n) => n.polarity === "negative").length;

  // Gather top dimensions from positive notes
  const dimCounts: Record<string, number> = {};
  notes.forEach((n) => {
    if (n.polarity === "positive") {
      n.evaluationTypes.forEach((d) => { dimCounts[d] = (dimCounts[d] || 0) + 1; });
    }
  });
  const strengths = Object.entries(dimCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d);

  const watchDims: Record<string, number> = {};
  notes.forEach((n) => {
    if (n.polarity === "negative") {
      n.evaluationTypes.forEach((d) => { watchDims[d] = (watchDims[d] || 0) + 1; });
    }
  });
  const watches = Object.entries(watchDims).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d);

  const confidence = notes.length >= 5 ? "High" : notes.length >= 3 ? "Medium" : "Low";

  return (
    <div className="rounded-lg border border-border/50 bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={14} className="text-primary" />
        <h3 className="text-sm font-semibold">Leadership Signals</h3>
        <span className="ml-auto text-[10px] text-muted-foreground rounded-full bg-muted px-2 py-0.5">Signals Preview</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Strength Areas</div>
          <div className="flex flex-wrap gap-1">
            {strengths.length > 0 ? strengths.map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
            )) : <span className="text-xs text-muted-foreground/60">—</span>}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Watch Areas</div>
          <div className="flex flex-wrap gap-1">
            {watches.length > 0 ? watches.map((w) => (
              <Badge key={w} variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/30 text-destructive">{w}</Badge>
            )) : <span className="text-xs text-muted-foreground/60">—</span>}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Evidence Count</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-chart-2">{positiveCount}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-sm font-semibold text-destructive">{negativeCount}</span>
            <span className="text-[10px] text-muted-foreground">pos / neg</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Confidence</div>
          <div className="text-sm font-medium">{confidence}</div>
          <div className="text-[10px] text-muted-foreground">{notes.length} notes total</div>
        </div>
      </div>
    </div>
  );
}

// ── Filters ──────────────────────────────────────────────────────

const ALL = "__all__";

const CATEGORIES: NoteCategory[] = ["1:1", "Feedback", "Career Discussion", "Recognition", "Concern", "Follow-up", "Performance"];
const DIMENSIONS: EvaluationType[] = [
  "Decision Making", "Leadership Mindset", "Technical Excellence", "Ownership",
  "Collaboration", "Communication", "Execution", "Mentorship",
  "Delivery Impact", "Reliability", "Negative Behaviour",
];
const POLARITIES: NotePolarity[] = ["positive", "neutral", "negative"];
const IMPACTS: NoteImpact[] = ["low", "medium", "high"];

function NoteFilters({
  filters,
  setFilter,
  authors,
}: {
  filters: { category: string; dimension: string; polarity: string; impact: string; author: string };
  setFilter: (key: string, value: string) => void;
  authors: string[];
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap px-5 py-3 border-b border-border/50">
      <Filter size={12} className="text-muted-foreground/60" />
      <Select value={filters.category} onValueChange={(v) => setFilter("category", v)}>
        <SelectTrigger className="h-7 w-auto min-w-[100px] text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Categories</SelectItem>
          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.dimension} onValueChange={(v) => setFilter("dimension", v)}>
        <SelectTrigger className="h-7 w-auto min-w-[100px] text-xs"><SelectValue placeholder="Dimension" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Dimensions</SelectItem>
          {DIMENSIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.polarity} onValueChange={(v) => setFilter("polarity", v)}>
        <SelectTrigger className="h-7 w-auto min-w-[90px] text-xs"><SelectValue placeholder="Polarity" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Polarity</SelectItem>
          {POLARITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.impact} onValueChange={(v) => setFilter("impact", v)}>
        <SelectTrigger className="h-7 w-auto min-w-[80px] text-xs"><SelectValue placeholder="Impact" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Impact</SelectItem>
          {IMPACTS.map((i) => <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.author} onValueChange={(v) => setFilter("author", v)}>
        <SelectTrigger className="h-7 w-auto min-w-[90px] text-xs"><SelectValue placeholder="Author" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Authors</SelectItem>
          {authors.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export function FollowUpNotes({ employeeId }: { employeeId: string }) {
  const [notes, setNotes] = useState<FollowUpNote[]>(() => getNotesForEmployee(employeeId));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: ALL, dimension: ALL, polarity: ALL, impact: ALL, author: ALL,
  });

  const setFilter = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const authors = useMemo(() => [...new Set(notes.map((n) => n.author))], [notes]);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      if (filters.category !== ALL && n.category !== filters.category) return false;
      if (filters.dimension !== ALL && !n.evaluationTypes.includes(filters.dimension as EvaluationType)) return false;
      if (filters.polarity !== ALL && n.polarity !== filters.polarity) return false;
      if (filters.impact !== ALL && n.impact !== filters.impact) return false;
      if (filters.author !== ALL && n.author !== filters.author) return false;
      return true;
    });
  }, [notes, filters]);

  const handleAdd = (data: {
    category: NoteCategory;
    evaluationTypes: EvaluationType[];
    visibility: NoteVisibility;
    polarity: NotePolarity;
    impact: NoteImpact;
    text: string;
    followUpRequired: boolean;
    followUpDate: string | null;
  }) => {
    const created = addNote({ employeeId, author: "You", ...data });
    setNotes((prev) => [created, ...prev]);
  };

  return (
    <>
      {/* Leadership Signals Placeholder */}
      <LeadershipSignalsPlaceholder notes={notes} />

      {/* Notes list */}
      <div className="rounded-lg border border-border/50 bg-card">
        <div className="border-b border-border/50 px-5 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Follow-up Notes</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{filtered.length} of {notes.length}</span>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setDialogOpen(true)}>
              <Plus size={12} /> Add Note
            </Button>
          </div>
        </div>

        {/* Filters */}
        <NoteFilters filters={filters} setFilter={setFilter} authors={authors} />

        {filtered.length > 0 ? (
          <div className="divide-y divide-border/50">
            {filtered.map((note) => (
              <div key={note.id} className="px-5 py-4 space-y-2">
                {/* Row 1: date · author · visibility */}
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
                </div>

                {/* Row 2: category · polarity · impact */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${categoryColor[note.category] ?? "bg-accent text-accent-foreground"}`}>
                    {note.category}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${polarityStyle[note.polarity]}`}>
                    {note.polarity}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${impactStyle[note.impact]}`}>
                    {note.impact}
                  </span>
                </div>

                {/* Row 3: evaluation dimension tags */}
                <div className="flex flex-wrap gap-1.5">
                  {note.evaluationTypes.map((et) => (
                    <Badge key={et} variant="secondary" className="text-[10px] font-medium px-1.5 py-0">
                      {et}
                    </Badge>
                  ))}
                </div>

                {/* Row 4: note text */}
                <p className="text-sm text-foreground/90 leading-relaxed">{note.text}</p>

                {/* Row 5: follow-up */}
                {note.followUpRequired && (
                  <div className="flex items-center gap-1.5 text-xs text-chart-5">
                    <CalendarClock size={12} />
                    <span>Follow-up{note.followUpDate ? ` by ${formatDate(note.followUpDate)}` : " required"}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <StickyNote size={20} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {notes.length > 0 ? "No notes match the current filters." : "No follow-up notes yet. Add one to start tracking observations."}
            </p>
          </div>
        )}
      </div>

      <AddNoteDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleAdd} />
    </>
  );
}
