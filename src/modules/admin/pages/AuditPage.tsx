import { useState, useMemo } from "react";
import { auditLog } from "../data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, Download, Calendar, Filter } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { AuditEntry } from "../types";

const severityStyle: Record<AuditEntry["severity"], string> = {
  info: "bg-muted text-muted-foreground",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  critical: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<AuditEntry["severity"] | "all">("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");

  // Unique actors and actions
  const actors = useMemo(() => Array.from(new Set(auditLog.map((e) => e.actor))), []);
  const actions = useMemo(() => Array.from(new Set(auditLog.map((e) => e.action))), []);

  const filtered = auditLog.filter((e) => {
    const matchSearch =
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.resource.toLowerCase().includes(search.toLowerCase()) ||
      e.detail.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severity === "all" || e.severity === severity;
    const matchActor = actorFilter === "all" || e.actor === actorFilter;
    const matchAction = actionFilter === "all" || e.action === actionFilter;
    return matchSearch && matchSeverity && matchActor && matchAction;
  });

  // Group by date for timeline view
  const grouped = useMemo(() => {
    const groups: Record<string, AuditEntry[]> = {};
    filtered.forEach((e) => {
      const date = new Date(e.timestamp).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    });
    return groups;
  }, [filtered]);

  const handleExport = (format: "csv" | "json") => {
    const data = format === "json"
      ? JSON.stringify(filtered, null, 2)
      : [
          "timestamp,actor,action,resource,detail,severity",
          ...filtered.map((e) => `${e.timestamp},${e.actor},${e.action},${e.resource},"${e.detail}",${e.severity}`),
        ].join("\n");
    const blob = new Blob([data], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search audit log…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex gap-1">
          {(["all", "info", "warning", "critical"] as const).map((s) => (
            <Button key={s} variant={severity === s ? "secondary" : "ghost"} size="sm" className="h-8 text-xs capitalize" onClick={() => setSeverity(s)}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Advanced filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filters:</span>
        </div>
        <Select value={actorFilter} onValueChange={setActorFilter}>
          <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="By Actor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Actors</SelectItem>
            {actors.map((a) => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue placeholder="By Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Actions</SelectItem>
            {actions.map((a) => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-1.5">
          <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" className="h-8 text-xs" onClick={() => setViewMode("table")}>Table</Button>
          <Button variant={viewMode === "timeline" ? "secondary" : "ghost"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => setViewMode("timeline")}>
            <Calendar size={12} /> Timeline
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleExport("csv")}>
            <Download size={12} /> CSV
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleExport("json")}>
            <Download size={12} /> JSON
          </Button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
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
                    {new Date(entry.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                  <TableCell className="text-sm">{entry.actor}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{entry.action}</code>
                  </TableCell>
                  <TableCell className="text-sm">{entry.resource}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">{entry.detail}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-[11px]", severityStyle[entry.severity])}>{entry.severity}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No audit events match your filters.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={13} className="text-muted-foreground" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{date}</h3>
                <Badge variant="secondary" className="text-[10px]">{entries.length}</Badge>
              </div>
              <div className="relative ml-2 border-l-2 border-border/50 space-y-0">
                {entries.map((entry) => (
                  <div key={entry.id} className="relative pl-6 pb-4">
                    <div className={cn(
                      "absolute left-[-5px] top-1.5 h-2 w-2 rounded-full",
                      entry.severity === "critical" ? "bg-destructive" : entry.severity === "warning" ? "bg-amber-500" : "bg-muted-foreground/40"
                    )} />
                    <div className="rounded-lg border border-border/50 bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono">{entry.action}</code>
                          <Badge variant="secondary" className={cn("text-[10px]", severityStyle[entry.severity])}>{entry.severity}</Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">
                        <span className="font-medium">{entry.actor}</span>
                        <span className="text-muted-foreground"> → {entry.resource}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
