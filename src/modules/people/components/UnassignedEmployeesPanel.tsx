import { useMemo, useState } from "react";
import { AvatarInitials } from "./AvatarInitials";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Employee } from "../types";

interface UnassignedEmployeesPanelProps {
  employees: Employee[];
  placedIds: Set<string>;
  onDragStart: (employeeId: string) => void;
}

export function UnassignedEmployeesPanel({
  employees,
  placedIds,
  onDragStart,
}: UnassignedEmployeesPanelProps) {
  const [search, setSearch] = useState("");

  const unassigned = useMemo(() => {
    const list = employees.filter(
      (e) => !placedIds.has(e.id) && e.status !== "inactive"
    );
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }, [employees, placedIds, search]);

  if (employees.filter((e) => !placedIds.has(e.id) && e.status === "active").length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Unassigned
          </span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            {employees.filter((e) => !placedIds.has(e.id) && e.status === "active").length}
          </Badge>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Drag employees into any box to place them in this review round.
      </p>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter employees…"
          className="h-7 text-xs pl-7"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
        {unassigned.map((emp) => (
          <div
            key={emp.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", emp.id);
              e.dataTransfer.setData("application/x-unassigned", "true");
              e.dataTransfer.effectAllowed = "move";
              onDragStart(emp.id);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1",
              "cursor-grab active:cursor-grabbing hover:border-primary/40 hover:bg-primary/5 transition-colors"
            )}
          >
            <AvatarInitials firstName={emp.firstName} lastName={emp.lastName} size="sm" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium truncate">
                {emp.firstName} {emp.lastName}
              </p>
              <p className="text-[9px] text-muted-foreground truncate">{emp.title}</p>
            </div>
          </div>
        ))}
        {unassigned.length === 0 && (
          <p className="text-[11px] text-muted-foreground/50 py-2">
            {search ? "No matches" : "All employees placed"}
          </p>
        )}
      </div>
    </div>
  );
}
