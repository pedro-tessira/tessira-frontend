import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, User } from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { SeverityBadge } from "../components/Badges";
import { getSPOFRisks, MOCK_DOMAINS } from "../data";
import type { RiskSeverity } from "../types";

export default function RiskPage() {
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | "all">("all");
  const allRisks = getSPOFRisks();

  const filtered = useMemo(() => {
    if (severityFilter === "all") return allRisks;
    return allRisks.filter((r) => r.severity === severityFilter);
  }, [allRisks, severityFilter]);

  const critical = allRisks.filter((r) => r.severity === "critical").length;
  const high = allRisks.filter((r) => r.severity === "high").length;

  // Concentration: employees who are sole owner on multiple skills
  const ownerConcentration = (() => {
    const map = new Map<string, { name: string; team: string; count: number }>();
    allRisks.forEach((r) => {
      const existing = map.get(r.ownerEmployeeId);
      if (existing) {
        existing.count++;
      } else {
        map.set(r.ownerEmployeeId, { name: r.ownerName, team: r.ownerTeam, count: 1 });
      }
    });
    return [...map.entries()]
      .map(([id, data]) => ({ employeeId: id, ...data }))
      .filter((e) => e.count > 1)
      .sort((a, b) => b.count - a.count);
  })();

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="SPOF & Risk"
        description="Single-owner dependencies, concentration risks, and resilience gaps."
        breadcrumbs={[
          { label: "Skills", href: "/app/skills" },
          { label: "Risk" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total SPOF Risks" value={allRisks.length} icon={Shield} detail="Single-owner skills" />
        <StatCard label="Critical" value={critical} icon={AlertTriangle} detail="Immediate attention needed" className={critical > 0 ? "border-destructive/30" : ""} />
        <StatCard label="High" value={high} icon={AlertTriangle} detail="Should be addressed soon" className={high > 0 ? "border-warning/30" : ""} />
      </div>

      {/* Concentration alert */}
      {ownerConcentration.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-warning" />
            <h3 className="text-sm font-semibold">Ownership Concentration</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            These individuals are the sole owner on multiple skills with no backup — creating compounding organizational risk.
          </p>
          <div className="space-y-2">
            {ownerConcentration.map((e) => (
              <div key={e.employeeId} className="flex items-center justify-between">
                <Link
                  to={`/app/people/employees/${e.employeeId}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {e.name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {e.team} · <span className="font-medium text-warning">{e.count} sole-owner skills</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as RiskSeverity | "all")}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">
          {filtered.length} risk{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Risk table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Sole Owner</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Backups</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-accent/10 tessira-transition">
                <td className="px-4 py-3"><SeverityBadge severity={r.severity} /></td>
                <td className="px-4 py-3 font-medium">{r.skillName}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.domainName}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/app/people/employees/${r.ownerEmployeeId}`}
                    className="text-primary hover:underline"
                  >
                    {r.ownerName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.ownerTeam}</td>
                <td className="px-4 py-3 text-center">
                  <span className="tabular-nums text-destructive font-medium">{r.backupCount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No risks match your current filters.
          </div>
        )}
      </div>
    </div>
  );
}
