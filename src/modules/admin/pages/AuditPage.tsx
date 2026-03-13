import { useState } from "react";
import { auditLog } from "../data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditEntry } from "../types";

const severityStyle: Record<AuditEntry["severity"], string> = {
  info: "bg-muted text-muted-foreground",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  critical: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<AuditEntry["severity"] | "all">("all");

  const filtered = auditLog.filter((e) => {
    const matchSearch =
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.resource.toLowerCase().includes(search.toLowerCase()) ||
      e.detail.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severity === "all" || e.severity === severity;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search audit log…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "info", "warning", "critical"] as const).map((s) => (
            <Button
              key={s}
              variant={severity === s ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs capitalize"
              onClick={() => setSeverity(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-[160px]">Timestamp</TableHead>
              <TableHead className="text-xs">Actor</TableHead>
              <TableHead className="text-xs">Action</TableHead>
              <TableHead className="text-xs">Resource</TableHead>
              <TableHead className="text-xs">Detail</TableHead>
              <TableHead className="text-xs w-[80px]">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs text-muted-foreground tabular-nums">
                  {new Date(entry.timestamp).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-sm">{entry.actor}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{entry.action}</code>
                </TableCell>
                <TableCell className="text-sm">{entry.resource}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">{entry.detail}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-[11px]", severityStyle[entry.severity])}>
                    {entry.severity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  No audit events match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
