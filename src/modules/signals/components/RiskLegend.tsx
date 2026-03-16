import { riskBg, riskLabel, type RiskLevel } from "@/shared/lib/risk-colors";
import { cn } from "@/shared/lib/utils";

const ALLOCATION_LEVELS: { level: RiskLevel; meaning: string }[] = [
  { level: "critical", meaning: "< 60% (underutilized) or > 95% (overloaded)" },
  { level: "healthy", meaning: "60–85% allocation" },
  { level: "warning", meaning: "85–95% allocation" },
];

const COVERAGE_LEVELS: { level: RiskLevel; meaning: string }[] = [
  { level: "healthy", meaning: "≥ 75% coverage" },
  { level: "warning", meaning: "60–75% coverage" },
  { level: "critical", meaning: "< 60% coverage" },
];

const SPOF_LEVELS: { level: RiskLevel; meaning: string }[] = [
  { level: "healthy", meaning: "0 SPOFs" },
  { level: "warning", meaning: "1–2 SPOFs" },
  { level: "critical", meaning: "≥ 3 SPOFs" },
];

export function RiskLegend({ variant = "all" }: { variant?: "all" | "allocation" | "coverage" | "spof" }) {
  const sections = {
    allocation: { label: "Allocation", levels: ALLOCATION_LEVELS },
    coverage: { label: "Coverage", levels: COVERAGE_LEVELS },
    spof: { label: "SPOF", levels: SPOF_LEVELS },
  };

  const items = variant === "all"
    ? Object.values(sections)
    : [sections[variant]];

  return (
    <div className="space-y-2">
      {items.map(({ label, levels }) => (
        <div key={label} className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">{label}</span>
          {levels.map(({ level, meaning }) => (
            <span key={`${label}-${level}`} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full shrink-0", riskBg(level))} />
              <span className="font-medium">{riskLabel(level)}</span>
              <span className="text-muted-foreground/60">{meaning}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
