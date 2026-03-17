import { useMemo } from "react";
import { AvatarInitials } from "./AvatarInitials";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { MOCK_EMPLOYEES } from "../data";
import {
  ArrowRight, ArrowUpRight, ArrowDownRight, Plus, Minus, Equal,
} from "lucide-react";

// ── Types (mirrored from NineBoxPage) ───────────────────────
type PerformanceLevel = "low" | "moderate" | "high";
type PotentialLevel = "low" | "moderate" | "high";

interface NineBoxPlacement {
  employeeId: string;
  performance: PerformanceLevel;
  potential: PotentialLevel;
  note?: string;
}

interface RoundOption {
  id: string;
  label: string;
}

const BOX_LABELS: Record<string, string> = {
  "high-high": "Star",
  "high-moderate": "High Performer",
  "high-low": "Solid Performer",
  "moderate-high": "High Potential",
  "moderate-moderate": "Core Contributor",
  "moderate-low": "Effective",
  "low-high": "Developing",
  "low-moderate": "Under-performing",
  "low-low": "Action Needed",
};

const LEVEL_RANK: Record<string, number> = { low: 0, moderate: 1, high: 2 };

function boxLabel(perf: PerformanceLevel, pot: PotentialLevel) {
  return BOX_LABELS[`${perf}-${pot}`] ?? "Unknown";
}

function boxScore(perf: PerformanceLevel, pot: PotentialLevel) {
  return LEVEL_RANK[perf] + LEVEL_RANK[pot];
}

type ChangeType = "promoted" | "demoted" | "lateral" | "added" | "removed" | "unchanged";

interface DiffEntry {
  employeeId: string;
  firstName: string;
  lastName: string;
  title: string;
  changeType: ChangeType;
  fromBox?: string;
  toBox?: string;
  scoreDelta: number;
}

function getChangeColor(type: ChangeType) {
  switch (type) {
    case "promoted": return "text-emerald-600 dark:text-emerald-400";
    case "demoted": return "text-red-500 dark:text-red-400";
    case "lateral": return "text-amber-600 dark:text-amber-400";
    case "added": return "text-blue-600 dark:text-blue-400";
    case "removed": return "text-muted-foreground";
    case "unchanged": return "text-muted-foreground/60";
  }
}

function getChangeBg(type: ChangeType) {
  switch (type) {
    case "promoted": return "bg-emerald-500/8 border-emerald-500/20";
    case "demoted": return "bg-red-500/8 border-red-500/20";
    case "lateral": return "bg-amber-500/8 border-amber-500/20";
    case "added": return "bg-blue-500/8 border-blue-500/20";
    case "removed": return "bg-muted/40 border-border/40";
    case "unchanged": return "bg-background border-border/30";
  }
}

function getChangeIcon(type: ChangeType) {
  switch (type) {
    case "promoted": return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />;
    case "demoted": return <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />;
    case "lateral": return <ArrowRight className="h-3.5 w-3.5 text-amber-500" />;
    case "added": return <Plus className="h-3.5 w-3.5 text-blue-500" />;
    case "removed": return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
    case "unchanged": return <Equal className="h-3.5 w-3.5 text-muted-foreground/50" />;
  }
}

function getChangeLabel(type: ChangeType) {
  switch (type) {
    case "promoted": return "Promoted";
    case "demoted": return "Regressed";
    case "lateral": return "Lateral move";
    case "added": return "New placement";
    case "removed": return "Removed";
    case "unchanged": return "No change";
  }
}

interface RoundComparisonPanelProps {
  rounds: RoundOption[];
  placementsMap: Record<string, NineBoxPlacement[]>;
  baseRoundId: string;
  onBaseChange: (id: string) => void;
  compareRoundId: string;
  onCompareChange: (id: string) => void;
}

export function RoundComparisonPanel({
  rounds,
  placementsMap,
  baseRoundId,
  onBaseChange,
  compareRoundId,
  onCompareChange,
}: RoundComparisonPanelProps) {
  const diff = useMemo(() => {
    const basePlacements = placementsMap[baseRoundId] ?? [];
    const comparePlacements = placementsMap[compareRoundId] ?? [];

    const baseMap = new Map(basePlacements.map((p) => [p.employeeId, p]));
    const compareMap = new Map(comparePlacements.map((p) => [p.employeeId, p]));

    const allIds = new Set([...baseMap.keys(), ...compareMap.keys()]);
    const entries: DiffEntry[] = [];

    allIds.forEach((id) => {
      const emp = MOCK_EMPLOYEES.find((e) => e.id === id);
      if (!emp) return;

      const base = baseMap.get(id);
      const compare = compareMap.get(id);

      let changeType: ChangeType;
      let fromBox: string | undefined;
      let toBox: string | undefined;
      let scoreDelta = 0;

      if (base && compare) {
        fromBox = boxLabel(base.performance, base.potential);
        toBox = boxLabel(compare.performance, compare.potential);
        const baseScore = boxScore(base.performance, base.potential);
        const compareScore = boxScore(compare.performance, compare.potential);
        scoreDelta = compareScore - baseScore;

        if (base.performance === compare.performance && base.potential === compare.potential) {
          changeType = "unchanged";
        } else if (scoreDelta > 0) {
          changeType = "promoted";
        } else if (scoreDelta < 0) {
          changeType = "demoted";
        } else {
          changeType = "lateral";
        }
      } else if (!base && compare) {
        changeType = "added";
        toBox = boxLabel(compare.performance, compare.potential);
      } else {
        changeType = "removed";
        fromBox = boxLabel(base!.performance, base!.potential);
      }

      entries.push({
        employeeId: id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        title: emp.title,
        changeType,
        fromBox,
        toBox,
        scoreDelta,
      });
    });

    // Sort: promoted first, then demoted, lateral, added, removed, unchanged
    const order: Record<ChangeType, number> = {
      promoted: 0, demoted: 1, lateral: 2, added: 3, removed: 4, unchanged: 5,
    };
    entries.sort((a, b) => order[a.changeType] - order[b.changeType]);
    return entries;
  }, [placementsMap, baseRoundId, compareRoundId]);

  const stats = useMemo(() => {
    const promoted = diff.filter((d) => d.changeType === "promoted").length;
    const demoted = diff.filter((d) => d.changeType === "demoted").length;
    const lateral = diff.filter((d) => d.changeType === "lateral").length;
    const added = diff.filter((d) => d.changeType === "added").length;
    const removed = diff.filter((d) => d.changeType === "removed").length;
    const unchanged = diff.filter((d) => d.changeType === "unchanged").length;
    return { promoted, demoted, lateral, added, removed, unchanged };
  }, [diff]);

  const baseLabel = rounds.find((r) => r.id === baseRoundId)?.label ?? baseRoundId;
  const compareLabel = rounds.find((r) => r.id === compareRoundId)?.label ?? compareRoundId;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Round selectors */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">From:</span>
          <Select value={baseRoundId} onValueChange={onBaseChange}>
            <SelectTrigger className="h-7 w-auto min-w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rounds.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">To:</span>
          <Select value={compareRoundId} onValueChange={onCompareChange}>
            <SelectTrigger className="h-7 w-auto min-w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rounds.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {stats.promoted > 0 && (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
            <ArrowUpRight className="h-3 w-3" /> {stats.promoted} promoted
          </Badge>
        )}
        {stats.demoted > 0 && (
          <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs gap-1">
            <ArrowDownRight className="h-3 w-3" /> {stats.demoted} regressed
          </Badge>
        )}
        {stats.lateral > 0 && (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs gap-1">
            <ArrowRight className="h-3 w-3" /> {stats.lateral} lateral
          </Badge>
        )}
        {stats.added > 0 && (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs gap-1">
            <Plus className="h-3 w-3" /> {stats.added} new
          </Badge>
        )}
        {stats.removed > 0 && (
          <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs gap-1">
            <Minus className="h-3 w-3" /> {stats.removed} removed
          </Badge>
        )}
        {stats.unchanged > 0 && (
          <Badge variant="secondary" className="text-xs text-muted-foreground/60">
            {stats.unchanged} unchanged
          </Badge>
        )}
      </div>

      {baseRoundId === compareRoundId ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Select two different rounds to see a comparison.
        </p>
      ) : (
        /* Diff list */
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {diff.map((entry) => (
            <div
              key={entry.employeeId}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2 transition-colors",
                getChangeBg(entry.changeType)
              )}
            >
              {/* Icon */}
              <div className="shrink-0">{getChangeIcon(entry.changeType)}</div>

              {/* Avatar + name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <AvatarInitials firstName={entry.firstName} lastName={entry.lastName} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">
                    {entry.firstName} {entry.lastName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{entry.title}</p>
                </div>
              </div>

              {/* Movement detail */}
              <div className="shrink-0 text-right min-w-0">
                <p className={cn("text-[11px] font-semibold", getChangeColor(entry.changeType))}>
                  {getChangeLabel(entry.changeType)}
                </p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                  {entry.changeType === "added" && `→ ${entry.toBox}`}
                  {entry.changeType === "removed" && `${entry.fromBox} →`}
                  {(entry.changeType === "promoted" || entry.changeType === "demoted" || entry.changeType === "lateral") &&
                    `${entry.fromBox} → ${entry.toBox}`}
                  {entry.changeType === "unchanged" && entry.fromBox}
                </p>
              </div>
            </div>
          ))}

          {diff.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No employees placed in either round.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
