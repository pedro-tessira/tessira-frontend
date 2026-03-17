import { AvatarInitials } from "./AvatarInitials";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { MOCK_EMPLOYEES } from "../data";
import { getNotesForEmployee } from "../data";
import type { Employee } from "../types";
import { ArrowUp, X } from "lucide-react";

export interface MovementRecord {
  employeeId: string;
  previousLabel: string;
  newLabel: string;
  timestamp: string;
  reviewRound: string;
}

interface NineBoxCardProps {
  employeeId: string;
  note?: string;
  movement?: MovementRecord;
  boxLabels: Record<string, { label: string }>;
  onDragStart: (employeeId: string) => void;
  onSelect: (employeeId: string) => void;
  onRemove: (employeeId: string) => void;
}

function getTenureMonths(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

function getSignalsForEmployee(emp: Employee) {
  const notes = getNotesForEmployee(emp.id);
  const dimCounts: Record<string, number> = {};
  notes.forEach((n) => {
    if (n.polarity === "positive") {
      n.evaluationTypes.forEach((d) => { dimCounts[d] = (dimCounts[d] || 0) + 1; });
    }
  });
  return Object.entries(dimCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => d);
}

function getEvidenceSummary(employeeId: string) {
  const notes = getNotesForEmployee(employeeId);
  const positive = notes.filter((n) => n.polarity === "positive").length;
  const concerns = notes.filter((n) => n.polarity === "negative").length;
  const dimCounts: Record<string, number> = {};
  notes.forEach((n) => {
    n.evaluationTypes.forEach((d) => { dimCounts[d] = (dimCounts[d] || 0) + 1; });
  });
  const topDims = Object.entries(dimCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => d);
  return { positive, concerns, topDims, total: notes.length };
}

export function NineBoxCard({ employeeId, note, movement, onDragStart, onSelect, onRemove }: NineBoxCardProps) {
  const emp = MOCK_EMPLOYEES.find((e) => e.id === employeeId);
  if (!emp) return null;

  const tenureMonths = getTenureMonths(emp.startDate);
  const isNewHire = tenureMonths < 6;
  const signals = getSignalsForEmployee(emp);
  const evidence = getEvidenceSummary(employeeId);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", employeeId);
                  e.dataTransfer.effectAllowed = "move";
                  onDragStart(employeeId);
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-background/60 tessira-transition group w-full text-left"
                  onClick={(e) => {
                    if (e.defaultPrevented) return;
                    onSelect(employeeId);
                  }}
                >
                  <AvatarInitials firstName={emp.firstName} lastName={emp.lastName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate group-hover:text-primary tessira-transition">
                      {emp.firstName} {emp.lastName}
                    </p>
                    {isNewHire ? (
                      <p className="text-[10px] text-chart-5 truncate">New hire · ramping</p>
                    ) : note ? (
                      <p className="text-[10px] text-muted-foreground truncate">{note}</p>
                    ) : null}
                    {movement && (
                      <p className="text-[10px] text-chart-2 flex items-center gap-0.5 truncate">
                        <ArrowUp size={8} /> moved from {movement.previousLabel}
                      </p>
                    )}
                    {signals.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {signals.map((s) => (
                          <span key={s} className="text-[9px] bg-primary/10 text-primary rounded px-1 py-0 leading-tight">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </TooltipTrigger>
            {evidence.total > 0 && (
              <TooltipContent side="right" className="max-w-[220px] p-3 space-y-2">
                <p className="text-xs font-semibold">Evidence Summary</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Positive observations</span>
                    <span className="font-medium">{evidence.positive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Concerns</span>
                    <span className="font-medium">{evidence.concerns}</span>
                  </div>
                </div>
                {evidence.topDims.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Top dimensions</p>
                    <div className="flex flex-wrap gap-1">
                      {evidence.topDims.map((d) => (
                        <Badge key={d} variant="secondary" className="text-[9px] px-1 py-0">{d}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          className="text-destructive focus:text-destructive text-xs gap-2"
          onClick={() => onRemove(employeeId)}
        >
          <UserMinus className="h-3.5 w-3.5" />
          Remove from round
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
