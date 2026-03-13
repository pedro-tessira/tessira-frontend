import { cn } from "@/shared/lib/utils";
import type { SignalStatus, TrendDirection } from "../types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  const color = direction === "up" ? "text-warning" : direction === "down" ? "text-destructive" : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", color)}>
      <Icon size={12} />
      {value && <span>{value}</span>}
    </span>
  );
}

export function CapacityBar({ allocated, total, className }: { allocated: number; total: number; className?: string }) {
  const pct = Math.min(Math.round((allocated / total) * 100), 100);
  const color = pct >= 90 ? "bg-destructive" : pct >= 80 ? "bg-warning" : "bg-success";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground tabular-nums">{allocated} / {total} FTE</span>
        <span className="font-medium tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full tessira-transition", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ScoreGauge({ score, max = 10, label }: { score: number; max?: number; label?: string }) {
  const pct = (score / max) * 100;
  const color = pct >= 75 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive";
  return (
    <div className="text-center">
      <div className={cn("text-2xl font-bold tabular-nums", color)}>
        {score}
        <span className="text-sm font-normal text-muted-foreground">/{max}</span>
      </div>
      {label && <div className="text-xs text-muted-foreground mt-0.5">{label}</div>}
    </div>
  );
}
