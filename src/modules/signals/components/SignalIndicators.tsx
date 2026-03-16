import { cn } from "@/shared/lib/utils";
import type { SignalStatus, TrendDirection } from "../types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  freeCapacityRisk, healthScoreRisk, capacityTrendColor,
  riskText, riskBg, riskBgSubtle,
} from "@/shared/lib/risk-colors";

const STATUS_MAP: Record<SignalStatus, { dot: string; bg: string; text: string }> = {
  healthy: { dot: "bg-success", bg: "bg-success/10", text: "text-success" },
  warning: { dot: "bg-warning", bg: "bg-warning/10", text: "text-warning" },
  critical: { dot: "bg-destructive", bg: "bg-destructive/10", text: "text-destructive" },
};

export function SignalDot({ status, size = "sm" }: { status: SignalStatus; size?: "sm" | "md" }) {
  const s = STATUS_MAP[status];
  return (
    <span className={cn("inline-block rounded-full shrink-0", s.dot, size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5")} />
  );
}

export function SignalBadge({ status }: { status: SignalStatus }) {
  const s = STATUS_MAP[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0", s.bg, s.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {label}
    </span>
  );
}

export function TrendIndicator({ direction, value }: { direction: TrendDirection; value?: string }) {
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const color = capacityTrendColor(direction);
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", color)}>
      <Icon size={12} />
      {value && <span>{value}</span>}
    </span>
  );
}

/**
 * CapacityBar — shows allocation as neutral bar, with free capacity risk coloring.
 * Allocation bar = primary (neutral), Free capacity indicator = risk-colored.
 */
export function CapacityBar({ allocated, total, className }: { allocated: number; total: number; className?: string }) {
  const pct = Math.min(Math.round((allocated / total) * 100), 100);
  const freePct = 100 - pct;
  const risk = freeCapacityRisk(freePct);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground tabular-nums">{allocated} / {total} FTE</span>
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground tabular-nums">{pct}%</span>
          <span className={cn("font-medium tabular-nums", riskText(risk))}>{freePct}% free</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
        <div className="h-full rounded-l-full bg-primary/60 tessira-transition" style={{ width: `${pct}%` }} />
        <div className={cn("h-full rounded-r-full tessira-transition", riskBg(risk))} style={{ width: `${freePct}%` }} />
      </div>
    </div>
  );
}

/**
 * ScoreGauge — Health Score is primary indicator, colored by risk level.
 */
export function ScoreGauge({ score, max = 10, label }: { score: number; max?: number; label?: string }) {
  const risk = healthScoreRisk(score, max);
  return (
    <div className="text-center">
      <div className={cn("text-2xl font-bold tabular-nums", riskText(risk))}>
        {score}
        <span className="text-sm font-normal text-muted-foreground">/{max}</span>
      </div>
      {label && <div className="text-xs text-muted-foreground mt-0.5">{label}</div>}
    </div>
  );
}
