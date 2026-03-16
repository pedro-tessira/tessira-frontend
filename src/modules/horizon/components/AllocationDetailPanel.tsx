import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { Briefcase, Calendar, Users, Database, Pencil, Trash2, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Allocation } from "../types";
import { initiatives, streams } from "@/modules/work/data";

interface AllocationDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation: Allocation | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDurationDays(start: string, end: string): number {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

const sourceLabels: Record<string, string> = {
  manual: "Manual",
  jira: "Jira",
  linear: "Linear",
};

const sourceColors: Record<string, string> = {
  manual: "bg-muted text-muted-foreground",
  jira: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  linear: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

export default function AllocationDetailPanel({
  open,
  onOpenChange,
  allocation,
}: AllocationDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [editPct, setEditPct] = useState([50]);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  if (!allocation) return null;

  const duration = getDurationDays(allocation.startDate, allocation.endDate);
  const percentColor =
    allocation.percentage >= 80
      ? "text-destructive"
      : allocation.percentage >= 50
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

  const barColor =
    allocation.percentage >= 80
      ? "bg-destructive"
      : allocation.percentage >= 50
      ? "bg-amber-500"
      : "bg-emerald-500";

  // Try to find matching initiative
  const matchedInit = initiatives.find((i) =>
    i.name.toLowerCase().includes(allocation.project.toLowerCase().split(" ")[0]) ||
    allocation.project.toLowerCase().includes(i.name.toLowerCase().split(" ")[0])
  );

  // Find streams for matched initiative
  const matchedStreams = matchedInit
    ? matchedInit.streamIds.map((id) => streams.find((s) => s.id === id)!).filter(Boolean)
    : [];

  const handleStartEdit = () => {
    setEditing(true);
    setEditPct([allocation.percentage]);
    setEditStart(allocation.startDate);
    setEditEnd(allocation.endDate);
  };

  const handleSaveEdit = () => {
    toast.success(`Allocation updated: ${allocation.employeeName} → ${allocation.project} at ${editPct[0]}%`);
    setEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2">
            <Briefcase size={18} className="text-primary" />
            {allocation.project}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-5">
          {!editing ? (
            <>
              {/* Allocation % */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Allocation
                  </span>
                  <span className={cn("text-lg font-bold tabular-nums", percentColor)}>
                    {allocation.percentage}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", barColor)}
                    style={{ width: `${allocation.percentage}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <DetailRow icon={Users} label="Engineer" value={allocation.employeeName} />
                <DetailRow icon={Users} label="Team" value={allocation.teamName} />
                <DetailRow icon={Calendar} label="Start" value={formatDate(allocation.startDate)} />
                <DetailRow icon={Calendar} label="End" value={formatDate(allocation.endDate)} />
                <DetailRow icon={Calendar} label="Duration" value={`${duration} day${duration !== 1 ? "s" : ""}`} />
                {allocation.source && (
                  <div className="flex items-center gap-3">
                    <Database size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground w-20">Source</span>
                    <Badge variant="secondary" className={cn("text-[11px]", sourceColors[allocation.source])}>
                      {sourceLabels[allocation.source]}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Initiative & Stream context */}
              {matchedStreams.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Layers size={13} className="text-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Streams</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedStreams.map((s) => (
                      <Link
                        key={s.id}
                        to={`/app/work/streams/${s.id}`}
                        className="block rounded-md border border-border/30 bg-muted/30 px-3 py-2 text-xs font-medium hover:border-primary/30 transition-colors"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matchedInit && (
                <Link
                  to={`/app/work/initiatives/${matchedInit.id}`}
                  className="block rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  View Initiative: {matchedInit.name} →
                </Link>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={handleStartEdit}>
                  <Pencil size={13} /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    toast.success(`Allocation removed: ${allocation.employeeName} → ${allocation.project}`);
                    onOpenChange(false);
                  }}
                >
                  <Trash2 size={13} /> Remove
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Edit form */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Allocation — {editPct[0]}%</Label>
                  <Slider value={editPct} onValueChange={setEditPct} min={10} max={100} step={10} className="py-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Start Date</Label>
                    <Input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">End Date</Label>
                    <Input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="sm" className="flex-1" onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={14} className="text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
