import { useState } from "react";
import { employeeLinks, auditLog } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Link2, Unlink, Sparkles, History, AlertTriangle, CheckCircle, Mail, Globe } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const matchTypeIcons: Record<string, typeof Mail> = {
  email: Mail,
  domain: Globe,
  manual: Link2,
};

export default function LinkingPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "linked" | "unlinked" | "suggested">("all");
  const [tab, setTab] = useState("links");

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

  // Link audit history
  const linkAudit = auditLog.filter((e) =>
    e.action.startsWith("user.") || e.action.startsWith("linking.") || e.category === "users"
  );

  // Conflict detection: suggested links where confidence < 0.8
  const conflicts = employeeLinks.filter((l) => l.linkStatus === "suggested" && l.confidence && l.confidence < 0.8);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Linked", count: linked, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Unlinked", count: unlinked, color: "text-muted-foreground" },
          { label: "Suggested", count: suggested, color: "text-blue-600 dark:text-blue-400" },
          { label: "Conflicts", count: conflicts.length, color: conflicts.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border/50 bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={cn("text-2xl font-bold tabular-nums mt-1", s.color)}>{s.count}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="links" className="text-xs">User–Employee Links</TabsTrigger>
          <TabsTrigger value="conflicts" className="text-xs">
            Conflicts {conflicts.length > 0 && <span className="ml-1 text-amber-600">({conflicts.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Link History</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-4 mt-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <div className="flex gap-1">
              {(["all", "linked", "unlinked", "suggested"] as const).map((f) => (
                <Button key={f} variant={filter === f ? "secondary" : "ghost"} size="sm" className="h-8 text-xs capitalize" onClick={() => setFilter(f)}>{f}</Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs ml-auto gap-1.5">
              <Sparkles size={13} /> Auto-Link All
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/50 bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Platform User</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Match Type</TableHead>
                  <TableHead className="text-xs">Linked Employee</TableHead>
                  <TableHead className="text-xs">Confidence</TableHead>
                  <TableHead className="text-xs">Linked By</TableHead>
                  <TableHead className="text-xs w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((link) => {
                  const Icon = linkIcons[link.linkStatus];
                  const MatchIcon = link.matchType ? matchTypeIcons[link.matchType] : null;
                  return (
                    <TableRow key={link.userId}>
                      <TableCell>
                        <p className="text-sm font-medium">{link.userDisplayName}</p>
                        <p className="text-xs text-muted-foreground">{link.userEmail}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[11px] gap-1", linkStyles[link.linkStatus])}>
                          <Icon size={11} />{link.linkStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {link.matchType ? (
                          <div className="flex items-center gap-1">
                            {MatchIcon && <MatchIcon size={11} />}
                            <span className="capitalize">{link.matchType}</span>
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {link.employeeName || <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {link.confidence ? (
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", link.confidence >= 0.8 ? "bg-emerald-500" : link.confidence >= 0.5 ? "bg-amber-500" : "bg-red-500")}
                                style={{ width: `${link.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{Math.round(link.confidence * 100)}%</span>
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {link.linkedBy || "—"}
                      </TableCell>
                      <TableCell>
                        {link.linkStatus === "suggested" && (
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-7 text-xs">Approve</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">Reject</Button>
                          </div>
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
        </TabsContent>

        {/* Conflicts */}
        <TabsContent value="conflicts" className="space-y-4 mt-4">
          {conflicts.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
              <CheckCircle size={24} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-muted-foreground">No conflicts detected. All suggestions have high confidence.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((c) => (
                <div key={c.userId} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.userDisplayName}</p>
                      <p className="text-xs text-muted-foreground">
                        Suggested match: {c.employeeName} — Confidence: {Math.round((c.confidence || 0) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Low confidence suggests possible mismatch. Please verify manually.</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 text-xs">Approve</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Dismiss</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
            {linkAudit.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <History size={13} className="text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-sm">{entry.action}</span>
                    <span className="text-muted-foreground text-sm"> — {entry.resource}</span>
                    <p className="text-xs text-muted-foreground">{entry.detail}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {new Date(entry.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
