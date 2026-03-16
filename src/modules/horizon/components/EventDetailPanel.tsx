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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import {
  Calendar,
  Pencil,
  Trash2,
  User,
  Users,
  CalendarRange,
  Megaphone,
  Palmtree,
  Flag,
  AlertTriangle,
  UserPlus,
  UserMinus,
  CalendarDays,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import type { TimelineEvent, EventType, EventStatus } from "../types";

interface EventDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: TimelineEvent | null;
}

const eventTypeConfig: Record<EventType, { icon: typeof CalendarRange; label: string; color: string }> = {
  all_hands: { icon: Megaphone, label: "All Hands", color: "text-primary" },
  team_sync: { icon: Users, label: "Team Sync", color: "text-blue-600 dark:text-blue-400" },
  vacation: { icon: Palmtree, label: "Vacation", color: "text-amber-600 dark:text-amber-400" },
  pto: { icon: Palmtree, label: "PTO", color: "text-amber-600 dark:text-amber-400" },
  milestone: { icon: Flag, label: "Milestone", color: "text-blue-600 dark:text-blue-400" },
  incident: { icon: AlertTriangle, label: "Incident", color: "text-destructive" },
  onboarding: { icon: UserPlus, label: "Onboarding", color: "text-emerald-600 dark:text-emerald-400" },
  offboarding: { icon: UserMinus, label: "Offboarding", color: "text-amber-600 dark:text-amber-400" },
  sprint: { icon: CalendarRange, label: "Sprint", color: "text-primary" },
  release: { icon: Rocket, label: "Release", color: "text-emerald-600 dark:text-emerald-400" },
  custom: { icon: CalendarDays, label: "Custom", color: "text-muted-foreground" },
};

const statusConfig: Record<EventStatus, { label: string; style: string }> = {
  planned: { label: "Planned", style: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  active: { label: "Active", style: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  completed: { label: "Completed", style: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", style: "bg-destructive/15 text-destructive" },
};

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

export default function EventDetailPanel({
  open,
  onOpenChange,
  event,
}: EventDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<EventStatus>("planned");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  if (!event) return null;

  const config = eventTypeConfig[event.type];
  const Icon = config.icon;
  const status = statusConfig[event.status];
  const duration = getDurationDays(event.startDate, event.endDate);

  const handleStartEdit = () => {
    setEditing(true);
    setEditTitle(event.title);
    setEditDescription(event.description ?? "");
    setEditStatus(event.status);
    setEditStart(event.startDate);
    setEditEnd(event.endDate);
  };

  const handleSaveEdit = () => {
    toast.success(`Event updated: ${editTitle}`);
    setEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) setEditing(false); onOpenChange(v); }}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2">
            <Icon size={18} className={config.color} />
            {event.title}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-5">
          {!editing ? (
            <>
              {/* Status & Type */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn("text-[11px]", status.style)}>
                  {status.label}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  {config.label}
                </Badge>
                {event.isManual && (
                  <Badge variant="outline" className="text-[10px]">Manual</Badge>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                {event.employeeName && (
                  <DetailRow icon={User} label="Person" value={event.employeeName} />
                )}
                {event.teamName && (
                  <DetailRow icon={Users} label="Team" value={event.teamName} />
                )}
                <DetailRow icon={Calendar} label="Start" value={formatDate(event.startDate)} />
                <DetailRow icon={Calendar} label="End" value={formatDate(event.endDate)} />
                <DetailRow
                  icon={Calendar}
                  label="Duration"
                  value={`${duration} day${duration !== 1 ? "s" : ""}`}
                />
              </div>

              {/* Description */}
              {event.description && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </span>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              )}

              {/* Scope */}
              {event.isGlobal && (
                <div className="rounded-md border border-border/30 bg-muted/30 px-3 py-2">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    This is a global event visible to all engineers.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={handleStartEdit}>
                  <Pencil size={13} /> Edit Event
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    toast.success(`Event removed: ${event.title}`);
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
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-sm min-h-[80px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as EventStatus)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned" className="text-sm">Planned</SelectItem>
                      <SelectItem value="active" className="text-sm">Active</SelectItem>
                      <SelectItem value="completed" className="text-sm">Completed</SelectItem>
                      <SelectItem value="cancelled" className="text-sm">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="flex-1" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
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
  icon: typeof User;
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
