import { useState } from "react";
import { employeeLinks } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Link2, Unlink, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const linkStyles: Record<string, string> = {
  linked: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  unlinked: "bg-muted text-muted-foreground",
  suggested: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

const linkIcons: Record<string, typeof Link2> = {
  linked: Link2,
  unlinked: Unlink,
  suggested: Sparkles,
};

export default function LinkingPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "linked" | "unlinked" | "suggested">("all");

  const filtered = employeeLinks.filter((l) => {
    const matchSearch =
      l.userDisplayName.toLowerCase().includes(search.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || l.linkStatus === filter;
    return matchSearch && matchFilter;
  });

  const linked = employeeLinks.filter((l) => l.linkStatus === "linked").length;
  const unlinked = employeeLinks.filter((l) => l.linkStatus === "unlinked").length;
  const suggested = employeeLinks.filter((l) => l.linkStatus === "suggested").length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Linked", count: linked, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Unlinked", count: unlinked, color: "text-muted-foreground" },
          { label: "Suggested", count: suggested, color: "text-blue-600 dark:text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border/50 bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={cn("text-2xl font-bold tabular-nums mt-1", s.color)}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "linked", "unlinked", "suggested"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs capitalize"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Platform User</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Linked Employee</TableHead>
              <TableHead className="text-xs">Confidence</TableHead>
              <TableHead className="text-xs w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((link) => {
              const Icon = linkIcons[link.linkStatus];
              return (
                <TableRow key={link.userId}>
                  <TableCell>
                    <p className="text-sm font-medium">{link.userDisplayName}</p>
                    <p className="text-xs text-muted-foreground">{link.userEmail}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-[11px] gap-1", linkStyles[link.linkStatus])}>
                      <Icon size={11} />
                      {link.linkStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {link.employeeName || <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {link.confidence ? `${Math.round(link.confidence * 100)}%` : "—"}
                  </TableCell>
                  <TableCell>
                    {link.linkStatus === "suggested" && (
                      <Button variant="outline" size="sm" className="h-7 text-xs">Approve</Button>
                    )}
                    {link.linkStatus === "unlinked" && (
                      <Button variant="outline" size="sm" className="h-7 text-xs">Link</Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
