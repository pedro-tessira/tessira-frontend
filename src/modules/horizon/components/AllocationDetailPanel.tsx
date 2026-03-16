import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { Briefcase, Calendar, Users, Database } from "lucide-react";
import type { Allocation } from "../types";

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
            <DetailRow
              icon={Users}
              label="Engineer"
              value={allocation.employeeName}
            />
            <DetailRow
              icon={Users}
              label="Team"
              value={allocation.teamName}
            />
            <DetailRow
              icon={Calendar}
              label="Start"
              value={formatDate(allocation.startDate)}
            />
            <DetailRow
              icon={Calendar}
              label="End"
              value={formatDate(allocation.endDate)}
            />
            <DetailRow
              icon={Calendar}
              label="Duration"
              value={`${duration} day${duration !== 1 ? "s" : ""}`}
            />
            {allocation.source && (
              <div className="flex items-center gap-3">
                <Database size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-20">Source</span>
                <Badge
                  variant="secondary"
                  className={cn("text-[11px]", sourceColors[allocation.source])}
                >
                  {sourceLabels[allocation.source]}
                </Badge>
              </div>
            )}
          </div>

          {/* Description */}
          {allocation.description && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Notes
              </span>
              <p className="text-sm text-muted-foreground">{allocation.description}</p>
            </div>
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
