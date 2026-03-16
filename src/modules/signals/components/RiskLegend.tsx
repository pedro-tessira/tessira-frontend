import { riskBg, riskLabel, type RiskLevel } from "@/shared/lib/risk-colors";
import { cn } from "@/shared/lib/utils";

const LEVELS: { level: RiskLevel; meaning: string }[] = [
  { level: "healthy", meaning: "> 40% free capacity" },
  { level: "acceptable", meaning: "20–40% free capacity" },
  { level: "warning", meaning: "10–20% free capacity" },
  { level: "critical", meaning: "< 10% free capacity" },
];

export function RiskLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground/70">Risk levels</span>
      {LEVELS.map(({ level, meaning }) => (
        <span key={level} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full shrink-0", riskBg(level))} />
          <span className="font-medium">{riskLabel(level)}</span>
          <span className="text-muted-foreground/60">{meaning}</span>
        </span>
      ))}
    </div>
  );
}
