import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { CoverageBadge } from "../components/Badges";
import { getSkillCoverage, MOCK_DOMAINS, getSkillAssignments } from "../data";
import type { CoverageStatus } from "../types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export default function CoveragePage() {
  const [statusFilter, setStatusFilter] = useState<CoverageStatus | "all">("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const allCoverage = getSkillCoverage();

  const filtered = useMemo(() => {
    return allCoverage.filter((c) => {
      if (statusFilter !== "all" && c.coverageStatus !== statusFilter) return false;
      if (domainFilter !== "all" && c.domainId !== domainFilter) return false;
      return true;
    });
  }, [allCoverage, statusFilter, domainFilter]);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Coverage Map"
        description="Skill ownership, backup depth, and coverage health across the organization."
        breadcrumbs={[
          { label: "Skills", href: "/app/skills" },
          { label: "Coverage" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CoverageStatus | "all")}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          <option value="all">All Statuses</option>
          <option value="healthy">Healthy</option>
          <option value="at_risk">At Risk</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          <option value="all">All Domains</option>
          {MOCK_DOMAINS.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        {(statusFilter !== "all" || domainFilter !== "all") && (
          <button
            onClick={() => { setStatusFilter("all"); setDomainFilter("all"); }}
            className="text-xs text-muted-foreground hover:text-foreground tessira-transition"
          >
            Clear filters
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">
          {filtered.length} of {allCoverage.length} skills
        </span>
      </div>

      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="w-8 px-2" />
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Criticality</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Owners</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Backups</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((c) => {
              const isExpanded = expandedSkill === c.skillId;
              const assignments = isExpanded ? getSkillAssignments(c.skillId) : [];
              const domain = MOCK_DOMAINS.find((d) => d.id === c.domainId);

              return (
                <Fragment key={c.skillId}>
                  <tr
                    className="hover:bg-accent/10 tessira-transition cursor-pointer"
                    onClick={() => setExpandedSkill(isExpanded ? null : c.skillId)}
                  >
                    <td className="px-2 text-center">
                      {isExpanded
                        ? <ChevronDown size={14} className="text-muted-foreground" />
                        : <ChevronRight size={14} className="text-muted-foreground/40" />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.skillName}</div>
                      <div className="text-xs text-muted-foreground">{domain?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                        c.criticality === "critical" ? "bg-destructive/10 text-destructive" :
                        c.criticality === "high" ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {c.criticality}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">{c.ownerCount}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{c.backupCount}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{c.totalKnowers}</td>
                    <td className="px-4 py-3">
                      <CoverageBadge status={c.coverageStatus} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="bg-muted/20 px-8 py-3">
                        <div className="space-y-1.5">
                          {assignments.map((a, i) => (
                            <div key={i} className="flex items-center gap-4 text-xs">
                              <Link
                                to={`/app/people/employees/${a.employeeId}`}
                                className="font-medium text-primary hover:underline min-w-[140px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {a.employeeName}
                              </Link>
                              <span className="text-muted-foreground min-w-[100px]">{a.teamName}</span>
                              <span className={cn(
                                "rounded-full px-2 py-0.5 font-medium capitalize min-w-[70px] text-center",
                                a.role === "owner" ? "bg-primary/10 text-primary" :
                                a.role === "backup" ? "bg-success/10 text-success" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {a.role}
                              </span>
                              <span className="text-muted-foreground capitalize">{a.level}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No skills match your current filters.
          </div>
        )}
      </div>
    </div>
  );
}

// Need Fragment import
import { Fragment } from "react";
