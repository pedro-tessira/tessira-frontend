import { cn } from "@/shared/lib/utils";
import type { CoverageStatus, RiskSeverity, SkillLevel } from "../types";

const SEVERITY_CONFIG: Record<RiskSeverity, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive" },
  high: { label: "High", className: "bg-warning/10 text-warning" },
  medium: { label: "Medium", className: "bg-accent text-accent-foreground" },
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
};

export function SeverityBadge({ severity }: { severity: RiskSeverity }) {
  const c = SEVERITY_CONFIG[severity];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0", c.className)}>
      {c.label}
    </span>
  );
}

const COVERAGE_CONFIG: Record<CoverageStatus, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "bg-success/10 text-success" },
  at_risk: { label: "At Risk", className: "bg-warning/10 text-warning" },
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive" },
};

export function CoverageBadge({ status }: { status: CoverageStatus }) {
  const c = COVERAGE_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0", c.className)}>
      {c.label}
    </span>
  );
}

const LEVEL_CONFIG: Record<SkillLevel, { label: string; className: string; short: string }> = {
  expert: { label: "Expert", short: "E", className: "bg-primary/15 text-primary border-primary/20" },
  proficient: { label: "Proficient", short: "P", className: "bg-success/10 text-success border-success/20" },
  learning: { label: "Learning", short: "L", className: "bg-warning/10 text-warning border-warning/20" },
  none: { label: "—", short: "—", className: "bg-transparent text-muted-foreground/20 border-transparent" },
};

export function LevelCell({ level, role }: { level: SkillLevel; role?: string }) {
  const c = LEVEL_CONFIG[level];
  return (
    <div
      className={cn(
        "flex items-center justify-center h-8 w-full rounded border text-[11px] font-medium",
        c.className,
        role === "owner" && "ring-1 ring-primary/30"
      )}
      title={`${c.label}${role ? ` (${role})` : ""}`}
    >
      {c.short}
      {role === "owner" && <span className="ml-0.5 text-[8px]">★</span>}
    </div>
  );
}
