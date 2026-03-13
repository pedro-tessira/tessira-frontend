import type { EmployeeStatus } from "../types";
import { cn } from "@/shared/lib/utils";

const STATUS_CONFIG: Record<EmployeeStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/10 text-success" },
  on_leave: { label: "On Leave", className: "bg-warning/10 text-warning" },
  offboarding: { label: "Offboarding", className: "bg-destructive/10 text-destructive" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status }: { status: EmployeeStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", config.className)}>
      {config.label}
    </span>
  );
}
