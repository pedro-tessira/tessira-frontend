import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ModulePageHeader } from "../components/ModulePageHeader";
import { AvatarInitials } from "../components/AvatarInitials";
import { StatCard } from "../components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { MOCK_EMPLOYEES, MOCK_TEAMS, MOCK_MEMBERSHIPS } from "../data";
import { Users2, AlertTriangle, Star, TrendingUp } from "lucide-react";

// ── 9-box domain types & mock data ──────────────────────
type PerformanceLevel = "low" | "moderate" | "high";
type PotentialLevel = "low" | "moderate" | "high";

interface NineBoxPlacement {
  employeeId: string;
  performance: PerformanceLevel;
  potential: PotentialLevel;
  note?: string;
}

const PLACEMENTS: NineBoxPlacement[] = [
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
];

// Grid config
const PERF_LEVELS: PerformanceLevel[] = ["low", "moderate", "high"];
const POT_LEVELS: PotentialLevel[] = ["high", "moderate", "low"]; // top-to-bottom

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

export default function NineBoxPage() {
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const filteredPlacements = useMemo(() => {
    if (teamFilter === "all") return PLACEMENTS;
    const memberIds = MOCK_MEMBERSHIPS
      .filter((m) => m.teamId === teamFilter)
      .map((m) => m.employeeId);
    return PLACEMENTS.filter((p) => memberIds.includes(p.employeeId));
  }, [teamFilter]);

  // Stats
  const stars = filteredPlacements.filter((p) => p.performance === "high" && p.potential === "high").length;
  const risks = filteredPlacements.filter((p) => p.performance === "low").length;
  const highPotential = filteredPlacements.filter((p) => p.potential === "high").length;

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

      {/* Filters */}
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
          {MOCK_TEAMS.map((t) => (
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

                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-lg border p-3 min-h-[120px] flex flex-col",
                      box.color
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-muted-foreground">{box.label}</span>
                      {people.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{people.length}</Badge>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {people.map((p) => {
                        const emp = MOCK_EMPLOYEES.find((e) => e.id === p.employeeId);
                        if (!emp) return null;
                        return (
                          <Link
                            key={p.employeeId}
                            to={`/app/people/employees/${emp.id}`}
                            className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-background/60 tessira-transition group"
                          >
                            <AvatarInitials firstName={emp.firstName} lastName={emp.lastName} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate group-hover:text-primary tessira-transition">
                                {emp.firstName} {emp.lastName}
                              </p>
                              {p.note && (
                                <p className="text-[10px] text-muted-foreground truncate">{p.note}</p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
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
    </div>
  );
}
