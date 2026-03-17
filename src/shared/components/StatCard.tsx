import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  detail?: ReactNode;
  className?: string;
  href?: string;
}

export function StatCard({ label, value, icon: Icon, detail, className, href }: StatCardProps) {
  const navigate = useNavigate();
  const Comp = href ? "button" : "div";

  return (
    <Comp
      className={cn(
        "rounded-lg border border-border/50 bg-card p-4 space-y-2 text-left w-full",
        href && "cursor-pointer transition-colors hover:border-primary/30 hover:bg-accent/30",
        className
      )}
      onClick={href ? () => navigate(href) : undefined}
    >
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
    </Comp>
  );
}
