import { useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Calendar, Globe, Boxes, Pencil, Trash2, Users, AlertTriangle, CheckCircle, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { initiatives as initialInits, domains, valueStreams, getRequiredFTE, getAllocatedFTE, getStaffingStatus, getAllocationsForInitiative } from "../data";
import type { Initiative, StaffingStatus, ConfidenceLevel } from "../types";
import AddInitiativeDialog from "../components/AddInitiativeDialog";
import EditInitiativeDialog from "../components/EditInitiativeDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

const staffingColors: Record<StaffingStatus, string> = {
  understaffed: "text-destructive",
  balanced: "text-success",
  overstaffed: "text-warning",
};

const staffingIcons: Record<StaffingStatus, typeof AlertTriangle> = {
  understaffed: AlertTriangle,
  balanced: CheckCircle,
  overstaffed: Scale,
};

const staffingLabels: Record<StaffingStatus, string> = {
  understaffed: "Understaffed",
  balanced: "Balanced",
  overstaffed: "Overstaffed",
};

const confidenceColors: Record<ConfidenceLevel, string> = {
  low: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  high: "bg-success/10 text-success",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function InitiativesPage() {
  const [localInits, setLocalInits] = useState<Initiative[]>(initialInits);
  const [editingInit, setEditingInit] = useState<Initiative | null>(null);
  const [deletingInit, setDeletingInit] = useState<Initiative | null>(null);

  const handleAdd = (init: Omit<Initiative, "id">) => {
    setLocalInits((prev) => [...prev, { id: `init-${Date.now()}`, ...init }]);
  };

  const handleSave = (updated: Initiative) => {
    setLocalInits((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleDelete = (id: string) => {
    setLocalInits((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <AddInitiativeDialog domains={domains} valueStreams={valueStreams} onAdd={handleAdd} />
        </div>
        <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_100px_80px_80px_90px_70px_60px] gap-3 px-5 py-3 border-b border-border/50 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>Initiative</span>
            <span>Start</span>
            <span>End</span>
            <span className="text-right">Required</span>
            <span className="text-right">Allocated</span>
            <span className="text-center">Staffing</span>
            <span className="text-center">Status</span>
            <span></span>
          </div>
          {localInits.map((init) => {
            const required = getRequiredFTE(init);
            const allocated = getAllocatedFTE(init.id);
            const staffing = getStaffingStatus(init);
            const StaffIcon = staffingIcons[staffing];
            const allocs = getAllocationsForInitiative(init.id);
            const fillPct = required > 0 ? Math.min(100, Math.round((allocated / required) * 100)) : 0;

            return (
              <div
                key={init.id}
                className="grid grid-cols-[1fr_100px_100px_80px_80px_90px_70px_60px] gap-3 px-5 py-3 border-b border-border/30 last:border-0 items-center hover:bg-accent/30 transition-colors group"
              >
                <Link to={`/app/work/initiatives/${init.id}`} className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Rocket size={14} className="text-primary/60 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors truncate block">{init.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className={cn("text-[9px] h-4", confidenceColors[init.estimate.confidence])}>
                          {init.estimate.confidence}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{init.estimate.totalEffortDays}d effort</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1.5">
                  <Calendar size={11} />
                  {formatDate(init.startDate)}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1.5">
                  <Calendar size={11} />
                  {formatDate(init.endDate)}
                </span>
                <span className="text-xs font-semibold tabular-nums text-right">{required} FTE</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-right space-y-1">
                      <span className="text-xs font-semibold tabular-nums block">{allocated} FTE</span>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", staffing === "understaffed" ? "bg-destructive" : staffing === "balanced" ? "bg-success" : "bg-warning")}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>{allocs.length} engineer{allocs.length !== 1 ? "s" : ""} assigned</p>
                    <p>{fillPct}% of required capacity</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex justify-center">
                  <Badge variant="secondary" className={cn("text-[10px] gap-1", staffing === "understaffed" ? "bg-destructive/10 text-destructive" : staffing === "balanced" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                    <StaffIcon size={10} />
                    {staffingLabels[staffing]}
                  </Badge>
                </div>
                <div className="flex justify-center">
                  <Badge variant="secondary" className={cn("text-[10px]", statusColors[init.status])}>
                    {init.status}
                  </Badge>
                </div>
                <div className="flex gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingInit(init)}>
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeletingInit(init)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {editingInit && (
          <EditInitiativeDialog
            initiative={editingInit}
            domains={domains}
            valueStreams={valueStreams}
            open={!!editingInit}
            onOpenChange={(open) => !open && setEditingInit(null)}
            onSave={handleSave}
          />
        )}

        {deletingInit && (
          <DeleteConfirmDialog
            open={!!deletingInit}
            onOpenChange={(open) => !open && setDeletingInit(null)}
            entityType="Initiative"
            entityName={deletingInit.name}
            onConfirm={() => { handleDelete(deletingInit.id); setDeletingInit(null); }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
