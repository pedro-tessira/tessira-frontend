import { forwardRef } from "react";
import { cn } from "@/shared/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  detail?: ReactNode;
  className?: string;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  function StatCard({ label, value, icon: Icon, detail, className }, ref) {
    return (
      <div ref={ref} className={cn("rounded-lg border border-border/50 bg-card p-4 space-y-2", className)}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <Icon size={15} strokeWidth={1.8} className="text-muted-foreground/50" />
        </div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {detail && (
          <div className="text-xs text-muted-foreground">{detail}</div>
        )}
      </div>
    );
  }
);
