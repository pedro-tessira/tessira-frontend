import { useState, useMemo, useCallback } from "react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { NineBoxCard, type MovementRecord } from "../components/NineBoxCard";
import EmployeeDetailPanel from "../components/EmployeeDetailPanel";
import { ManageReviewRoundsDialog, type ReviewRoundEntry } from "../components/ManageReviewRoundsDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { usePeopleStore } from "../contexts/PeopleStoreContext";
import { Users2, AlertTriangle, Star, TrendingUp, Settings2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ── 9-box domain types ──────────────────────────────────────
type PerformanceLevel = "low" | "moderate" | "high";
type PotentialLevel = "low" | "moderate" | "high";

interface NineBoxPlacement {
  employeeId: string;
  performance: PerformanceLevel;
  potential: PotentialLevel;
  note?: string;
}

// ── Review rounds ───────────────────────────────────────────
interface ReviewRound {
  id: string;
  label: string;
  placements: NineBoxPlacement[];
}

const REVIEW_ROUNDS: ReviewRound[] = [
  {
    id: "q1-2026",
    label: "Q1 2026",
    placements: [
      { employeeId: "emp-001", performance: "high", potential: "high", note: "Key technical leader" },
      { employeeId: "emp-002", performance: "high", potential: "moderate" },
      { employeeId: "emp-003", performance: "high", potential: "high", note: "Strong people leader" },
      { employeeId: "emp-004", performance: "moderate", potential: "moderate" },
      { employeeId: "emp-005", performance: "moderate", potential: "high", note: "Fast growth trajectory" },
      { employeeId: "emp-006", performance: "high", potential: "moderate" },
      { employeeId: "emp-007", performance: "moderate", potential: "moderate" },
      { employeeId: "emp-008", performance: "high", potential: "high" },
      { employeeId: "emp-009", performance: "high", potential: "high" },
      { employeeId: "emp-010", performance: "moderate", potential: "high", note: "Emerging leader" },
      { employeeId: "emp-011", performance: "low", potential: "high", note: "New hire, ramping" },
      { employeeId: "emp-012", performance: "low", potential: "low", note: "Offboarding" },
    ],
  },
  {
    id: "q3-2025",
    label: "Q3 2025",
    placements: [
      { employeeId: "emp-001", performance: "high", potential: "moderate", note: "Growing into leadership" },
      { employeeId: "emp-002", performance: "moderate", potential: "moderate" },
      { employeeId: "emp-003", performance: "high", potential: "high", note: "Strong people leader" },
      { employeeId: "emp-004", performance: "moderate", potential: "low" },
      { employeeId: "emp-005", performance: "low", potential: "high", note: "Recently joined" },
      { employeeId: "emp-006", performance: "moderate", potential: "moderate" },
      { employeeId: "emp-007", performance: "low", potential: "moderate" },
      { employeeId: "emp-008", performance: "high", potential: "high" },
      { employeeId: "emp-009", performance: "high", potential: "moderate" },
      { employeeId: "emp-010", performance: "moderate", potential: "moderate" },
      { employeeId: "emp-012", performance: "low", potential: "moderate", note: "Performance plan" },
    ],
  },
  {
    id: "q1-2025",
    label: "Q1 2025",
    placements: [
      { employeeId: "emp-001", performance: "moderate", potential: "high" },
      { employeeId: "emp-002", performance: "moderate", potential: "moderate" },
      { employeeId: "emp-003", performance: "high", potential: "moderate" },
      { employeeId: "emp-004", performance: "moderate", potential: "moderate" },
      { employeeId: "emp-006", performance: "moderate", potential: "moderate" },
      { employeeId: "emp-008", performance: "high", potential: "high" },
      { employeeId: "emp-009", performance: "high", potential: "moderate" },
      { employeeId: "emp-010", performance: "low", potential: "moderate" },
      { employeeId: "emp-012", performance: "moderate", potential: "moderate" },
    ],
  },
];

// ── Grid config ─────────────────────────────────────────────
const PERF_LEVELS: PerformanceLevel[] = ["low", "moderate", "high"];
const POT_LEVELS: PotentialLevel[] = ["high", "moderate", "low"];

const BOX_LABELS: Record<string, { label: string; color: string }> = {
  "high-high": { label: "Star", color: "bg-emerald-500/10 border-emerald-500/30" },
  "high-moderate": { label: "High Performer", color: "bg-emerald-500/5 border-emerald-500/20" },
  "high-low": { label: "Solid Performer", color: "bg-blue-500/5 border-blue-500/20" },
  "moderate-high": { label: "High Potential", color: "bg-blue-500/10 border-blue-500/30" },
  "moderate-moderate": { label: "Core Contributor", color: "bg-muted/50 border-border/50" },
  "moderate-low": { label: "Effective", color: "bg-muted/30 border-border/40" },
  "low-high": { label: "Developing", color: "bg-amber-500/10 border-amber-500/30" },
  "low-moderate": { label: "Under-performing", color: "bg-amber-500/5 border-amber-500/20" },
  "low-low": { label: "Action Needed", color: "bg-red-500/8 border-red-500/20" },
};

const PERF_LABEL: Record<PerformanceLevel, string> = { low: "Low", moderate: "Moderate", high: "High" };

function getBoxLabel(perf: PerformanceLevel, pot: PotentialLevel) {
  return BOX_LABELS[`${perf}-${pot}`]?.label ?? "";
}

export default function NineBoxPage() {
  const { teams, memberships } = usePeopleStore();
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [rounds, setRounds] = useState<ReviewRound[]>([...REVIEW_ROUNDS]);
  const [selectedRound, setSelectedRound] = useState<string>("q1-2026");
  const [placementsMap, setPlacementsMap] = useState<Record<string, NineBoxPlacement[]>>(() => {
    const map: Record<string, NineBoxPlacement[]> = {};
    REVIEW_ROUNDS.forEach((r) => { map[r.id] = [...r.placements]; });
    return map;
  });
  const [movements, setMovements] = useState<MovementRecord[]>([]);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [roundsDialogOpen, setRoundsDialogOpen] = useState(false);

  const currentPlacements = placementsMap[selectedRound] ?? [];
  const currentRound = rounds.find((r) => r.id === selectedRound);

  // Round management handlers
  const handleAddRound = useCallback((id: string, label: string) => {
    setRounds((prev) => [{ id, label, placements: [] }, ...prev]);
    setPlacementsMap((prev) => ({ ...prev, [id]: [] }));
    setSelectedRound(id);
  }, []);

  const handleRenameRound = useCallback((id: string, label: string) => {
    setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, label } : r)));
  }, []);

  const handleDeleteRound = useCallback((id: string) => {
    setRounds((prev) => prev.filter((r) => r.id !== id));
    setPlacementsMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (selectedRound === id) {
      setRounds((prev) => {
        if (prev.length > 0) setSelectedRound(prev[0].id);
        return prev;
      });
    }
  }, [selectedRound]);

  const filteredPlacements = useMemo(() => {
    if (teamFilter === "all") return currentPlacements;
    const memberIds = memberships
      .filter((m) => m.teamId === teamFilter)
      .map((m) => m.employeeId);
    return currentPlacements.filter((p) => memberIds.includes(p.employeeId));
  }, [teamFilter, currentPlacements, memberships]);

  // Stats
  const stars = filteredPlacements.filter((p) => p.performance === "high" && p.potential === "high").length;
  const risks = filteredPlacements.filter((p) => p.performance === "low").length;
  const highPotential = filteredPlacements.filter((p) => p.potential === "high").length;

  // DnD handlers
  const handleDrop = useCallback((targetPerf: PerformanceLevel, targetPot: PotentialLevel, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverKey(null);
    setDraggingId(null);
    const empId = e.dataTransfer.getData("text/plain");
    if (!empId) return;

    setPlacementsMap((prev) => {
      const roundPlacements = [...(prev[selectedRound] ?? [])];
      const idx = roundPlacements.findIndex((p) => p.employeeId === empId);
      if (idx === -1) return prev;

      const existing = roundPlacements[idx];
      if (existing.performance === targetPerf && existing.potential === targetPot) return prev;

      const prevLabel = getBoxLabel(existing.performance, existing.potential);
      const newLabel = getBoxLabel(targetPerf, targetPot);

      roundPlacements[idx] = { ...existing, performance: targetPerf, potential: targetPot };

      // Track movement
      const movement: MovementRecord = {
        employeeId: empId,
        previousLabel: prevLabel,
        newLabel: newLabel,
        timestamp: new Date().toISOString(),
        reviewRound: currentRound?.label ?? selectedRound,
      };
      setMovements((prev) => [movement, ...prev.filter((m) => m.employeeId !== empId)]);

      toast({
        title: "Placement updated",
        description: `Moved to ${newLabel}`,
      });

      return { ...prev, [selectedRound]: roundPlacements };
    });
  }, [selectedRound, currentRound]);

  const handleDragOver = useCallback((key: string, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverKey(key);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverKey(null);
  }, []);

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title="9-Box"
        description="Performance–potential positioning for leadership visibility and succession planning."
        breadcrumbs={[
          { label: "People", href: "/app/people" },
          { label: "9-Box" },
        ]}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="People Placed" value={filteredPlacements.length} icon={Users2} detail="In current view" />
        <StatCard label="Stars" value={stars} icon={Star} detail="High perf + high potential" />
        <StatCard label="High Potential" value={highPotential} icon={TrendingUp} detail="Growth candidates" />
        <StatCard label="Action Needed" value={risks} icon={AlertTriangle} detail="Low performance" />
      </div>

      {/* Filters & Review Round */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Team:</span>
          <div className="flex gap-1">
            <Button
              variant={teamFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTeamFilter("all")}
            >
              All
            </Button>
            {teams.map((t) => (
              <Button
                key={t.id}
                variant={teamFilter === t.id ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setTeamFilter(t.id)}
              >
                {t.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Review Round:</span>
          <Select value={selectedRound} onValueChange={setSelectedRound}>
            <SelectTrigger className="h-7 w-auto min-w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rounds.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRoundsDialogOpen(true)}>
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 9-Box Grid */}
      <div className="space-y-1">
        {/* Y-axis label */}
        <div className="flex">
          <div className="w-20 shrink-0 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-muted-foreground -rotate-90 whitespace-nowrap tracking-wider uppercase">
              Potential
            </span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-2">
            {POT_LEVELS.map((pot) =>
              PERF_LEVELS.map((perf) => {
                const key = `${perf}-${pot}`;
                const box = BOX_LABELS[key];
                const people = filteredPlacements.filter(
                  (p) => p.performance === perf && p.potential === pot
                );
                const isDragOver = dragOverKey === key;

                return (
                  <div
                    key={key}
                    onDragOver={(e) => handleDragOver(key, e)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(perf, pot, e)}
                    className={cn(
                      "rounded-lg border p-3 min-h-[120px] flex flex-col transition-all duration-150",
                      box.color,
                      isDragOver && "ring-2 ring-primary/40 border-primary/40 bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-muted-foreground">{box.label}</span>
                      {people.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{people.length}</Badge>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {people.map((p) => (
                        <NineBoxCard
                          key={p.employeeId}
                          employeeId={p.employeeId}
                          note={p.note}
                          movement={movements.find((m) => m.employeeId === p.employeeId)}
                          boxLabels={BOX_LABELS}
                          onDragStart={setDraggingId}
                          onSelect={setSelectedEmployeeId}
                        />
                      ))}
                      {people.length === 0 && (
                        <p className="text-[11px] text-muted-foreground/40 pt-2">No placements</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* X-axis label */}
        <div className="flex">
          <div className="w-20 shrink-0" />
          <div className="flex-1 grid grid-cols-3 gap-2">
            {PERF_LEVELS.map((p) => (
              <div key={p} className="text-center text-[11px] font-medium text-muted-foreground capitalize pt-1">
                {PERF_LABEL[p]}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase ml-20">
            Performance
          </span>
        </div>
      </div>

      <EmployeeDetailPanel
        open={!!selectedEmployeeId}
        onOpenChange={(open) => { if (!open) setSelectedEmployeeId(null); }}
        employeeId={selectedEmployeeId}
        boxLabel={
          selectedEmployeeId
            ? BOX_LABELS[
                `${currentPlacements.find((p) => p.employeeId === selectedEmployeeId)?.performance}-${currentPlacements.find((p) => p.employeeId === selectedEmployeeId)?.potential}`
              ]?.label
            : undefined
        }
      />

      <ManageReviewRoundsDialog
        open={roundsDialogOpen}
        onOpenChange={setRoundsDialogOpen}
        rounds={rounds.map((r) => ({ id: r.id, label: r.label }))}
        activeRoundId={selectedRound}
        onAdd={handleAddRound}
        onRename={handleRenameRound}
        onDelete={handleDeleteRound}
      />
    </div>
  );
}
