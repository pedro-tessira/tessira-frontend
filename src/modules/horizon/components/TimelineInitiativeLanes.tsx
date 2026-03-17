import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, Clock, Layers } from "lucide-react";
import type { InitiativeRisk } from "../lib/decision-engine";

interface Props {
  initiatives: InitiativeRisk[];
  rangeStart: Date;
  rangeDays: number;
  dayWidth: number;
  todayISO: string;
  selectedInitiativeId?: string | null;
  onInitiativeClick?: (id: string) => void;
}

const riskBg: Record<string, string> = {
  critical: "bg-destructive/20 border-destructive/40 text-destructive",
  high: "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300",
  medium: "bg-yellow-500/15 border-yellow-500/30 text-yellow-700 dark:text-yellow-300",
  low: "bg-primary/15 border-primary/30 text-primary",
};

const riskDot: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-amber-500",
  medium: "bg-yellow-500",
  low: "bg-emerald-500",
};

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TimelineInitiativeLanes({ initiatives, rangeStart, rangeDays, dayWidth, todayISO, selectedInitiativeId, onInitiativeClick }: Props) {
  const gridWidth = rangeDays * dayWidth;

  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + rangeDays);
  const rangeEndISO = toISO(rangeEnd);
  const rangeStartISO = toISO(rangeStart);

  const visible = useMemo(() =>
    initiatives.filter((init) => init.startDate <= rangeEndISO && init.endDate >= rangeStartISO)
      .sort((a, b) => b.riskScore - a.riskScore),
    [initiatives, rangeStartISO, rangeEndISO]
  );

  if (visible.length === 0) return null;

  // Compute today column position once
  const todayDate = new Date(todayISO);
  todayDate.setHours(0, 0, 0, 0);
  const todayPx = ((todayDate.getTime() - rangeStart.getTime()) / 86400000) * dayWidth;
  const todayInRange = todayPx >= 0 && todayPx < gridWidth;

  return (
    <div className="border-b-2 border-primary/20 shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.1)]">
      {/* Section header */}
      <div className="flex border-b border-border/30 bg-muted/30">
        <div className="w-48 shrink-0 border-r border-border/50 px-3 py-1.5 sticky left-0 z-10 bg-muted/30 flex items-center gap-2">
          <Layers size={11} className="text-primary/60" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Initiatives</span>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 ml-auto">{visible.length}</Badge>
        </div>
        <div className="relative" style={{ width: gridWidth }}>
          {todayInRange && (
            <div
              className="absolute top-0 bottom-0 bg-primary/10 border-x border-primary/20 pointer-events-none"
              style={{ left: todayPx, width: dayWidth, zIndex: 1 }}
            />
          )}
        </div>
      </div>

      {/* Initiative rows */}
      {visible.map((init) => {
        const initStart = new Date(init.startDate);
        const initEnd = new Date(init.endDate);
        initStart.setHours(0, 0, 0, 0);
        initEnd.setHours(0, 0, 0, 0);

        const leftPx = Math.max(0, ((initStart.getTime() - rangeStart.getTime()) / 86400000) * dayWidth);
        const widthPx = Math.max(dayWidth, Math.min(gridWidth - leftPx, ((initEnd.getTime() - initStart.getTime()) / 86400000 + 1) * dayWidth));
        const isSelected = selectedInitiativeId === init.id;

        return (
          <div
            key={init.id}
            className={cn(
              "flex border-b border-border/20 last:border-0 transition-colors cursor-pointer",
              isSelected ? "bg-primary/5" : "hover:bg-accent/5"
            )}
            onClick={() => onInitiativeClick?.(init.id)}
          >
            {/* Label */}
            <div className="w-48 shrink-0 border-r border-border/50 px-3 py-1.5 flex items-center gap-2 sticky left-0 z-10 bg-card">
              <span className={cn("h-2 w-2 rounded-full shrink-0", riskDot[init.deliveryRisk])} />
              <div className="min-w-0">
                <p className="text-[11px] font-medium truncate">{init.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{init.allocatedFTE}/{init.requiredFTE} FTE</span>
                  {init.estimatedDelayDays > 0 && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <Clock size={8} />+{init.estimatedDelayDays}d
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bar area */}
            <div className="relative min-h-[32px]" style={{ width: gridWidth }}>
              {/* Today column overlay */}
              {todayInRange && (
                <div
                  className="absolute top-0 bottom-0 bg-primary/10 border-x border-primary/20 pointer-events-none"
                  style={{ left: todayPx, width: dayWidth, zIndex: 1 }}
                />
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "absolute top-1 h-6 rounded-md flex items-center px-2 text-[10px] font-semibold truncate border transition-all z-[2]",
                      riskBg[init.deliveryRisk],
                      isSelected && "ring-2 ring-primary/40 shadow-sm"
                    )}
                    style={{ left: leftPx, width: widthPx }}
                  >
                    {widthPx > 80 && (
                      <span className="truncate flex items-center gap-1.5">
                        {(init.deliveryRisk === "critical" || init.deliveryRisk === "high") && <AlertTriangle size={10} />}
                        {init.name}
                        {widthPx > 160 && (
                          <span className="opacity-60 ml-1">
                            · {init.allocations.length} engineer{init.allocations.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs space-y-1 max-w-xs">
                  <p className="font-semibold">{init.name}</p>
                  <p className="text-muted-foreground capitalize">Risk: {init.deliveryRisk} (score {init.riskScore})</p>
                  <p className="text-muted-foreground">Staffing: {init.allocatedFTE}/{init.requiredFTE} FTE</p>
                  {init.roleGaps.length > 0 && (
                    <p className="text-amber-600 dark:text-amber-400">
                      Gaps: {init.roleGaps.map((g) => `${g.role} (${g.gapFTE})`).join(", ")}
                    </p>
                  )}
                  {init.estimatedDelayDays > 0 && (
                    <p className="text-destructive">Est. delay: +{init.estimatedDelayDays} days</p>
                  )}
                  <p className="tabular-nums">{formatDate(init.startDate)} → {formatDate(init.endDate)}</p>
                  <p className="text-muted-foreground/70 text-[10px]">Click to highlight allocations</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
}
