import { cn } from "@/shared/lib/utils";
import type { CoverageStatus, RiskSeverity, SkillLevel, SkillType, SkillCriticality } from "../types";

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

const LEVEL_CONFIG: Record<SkillLevel, { label: string; short: string; className: string }> = {
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

const SKILL_TYPE_CONFIG: Record<SkillType, { label: string; className: string }> = {
  technology: { label: "Technology", className: "bg-primary/10 text-primary" },
  system: { label: "System", className: "bg-secondary text-secondary-foreground" },
  domain: { label: "Domain", className: "bg-warning/10 text-warning" },
  operational: { label: "Operational", className: "bg-success/10 text-success" },
};

export function SkillTypeBadge({ type }: { type: SkillType }) {
  const c = SKILL_TYPE_CONFIG[type];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0", c.className)}>
      {c.label}
    </span>
  );
}

export function CriticalityBadge({ criticality }: { criticality: SkillCriticality }) {
  const className = criticality === "critical"
    ? "bg-destructive/10 text-destructive"
    : criticality === "high"
    ? "bg-warning/10 text-warning"
    : criticality === "low"
    ? "bg-muted/50 text-muted-foreground/60"
    : "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize shrink-0", className)}>
      {criticality}
    </span>
  );
}

export function CoverageScoreBadge({ score, status }: { score: number; status: CoverageStatus }) {
  const className = status === "critical"
    ? "text-destructive"
    : status === "at_risk"
    ? "text-warning"
    : "text-success";
  return (
    <span className={cn("tabular-nums font-semibold text-xs", className)}>
      {score.toFixed(1)}
    </span>
  );
}
