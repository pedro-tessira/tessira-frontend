import { useState, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { CoverageBadge, CoverageScoreBadge, SkillTypeBadge, CriticalityBadge } from "../components/Badges";
import SkillDetailPanel from "../components/SkillDetailPanel";
import { getSkillCoverage, MOCK_DOMAINS, MOCK_SYSTEMS, getSkillAssignments, MOCK_SKILLS } from "../data";
import type { CoverageStatus, SkillType } from "../types";

type GroupBy = "none" | "domain" | "system" | "team";

export default function CoveragePage() {
  const [statusFilter, setStatusFilter] = useState<CoverageStatus | "all">("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<SkillType | "all">("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [detailSkillId, setDetailSkillId] = useState<string | null>(null);

  const allCoverage = getSkillCoverage();

  const filtered = useMemo(() => {
    return allCoverage.filter((c) => {
      if (statusFilter !== "all" && c.coverageStatus !== statusFilter) return false;
      if (domainFilter !== "all" && c.domainId !== domainFilter) return false;
      if (typeFilter !== "all" && c.skillType !== typeFilter) return false;
      return true;
    });
  }, [allCoverage, statusFilter, domainFilter, typeFilter]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return [{ label: null, items: filtered }];

    const map = new Map<string, typeof filtered>();
    filtered.forEach((c) => {
      let key = "";
      if (groupBy === "domain") {
        const domain = MOCK_DOMAINS.find((d) => d.id === c.domainId);
        key = domain?.name ?? "Unknown";
      } else if (groupBy === "system") {
        const skill = MOCK_SKILLS.find((s) => s.id === c.skillId);
        const systems = MOCK_SYSTEMS.filter((sys) => sys.skillIds.includes(c.skillId));
        if (systems.length > 0) {
          systems.forEach((sys) => {
            const existing = map.get(sys.name) ?? [];
            existing.push(c);
            map.set(sys.name, existing);
          });
          return;
        }
        key = "Ungrouped";
      } else if (groupBy === "team") {
        const assignments = getSkillAssignments(c.skillId);
        const teams = [...new Set(assignments.map((a) => a.teamName))];
        if (teams.length > 0) {
          teams.forEach((t) => {
            const existing = map.get(t) ?? [];
            existing.push(c);
            map.set(t, existing);
          });
          return;
        }
        key = "Unassigned";
      }
      const existing = map.get(key) ?? [];
      existing.push(c);
      map.set(key, existing);
    });

    if (groupBy === "domain" || groupBy === "team") {
      filtered.forEach((c) => {
        let key = "";
        if (groupBy === "domain") {
          const domain = MOCK_DOMAINS.find((d) => d.id === c.domainId);
          key = domain?.name ?? "Unknown";
        } else {
          // already handled above for team
        }
        // Only add if not yet grouped (for domain)
      });
    }

    // For domain grouping, re-do cleanly
    if (groupBy === "domain") {
      map.clear();
      filtered.forEach((c) => {
        const domain = MOCK_DOMAINS.find((d) => d.id === c.domainId);
        const key = domain?.name ?? "Unknown";
        const existing = map.get(key) ?? [];
        existing.push(c);
        map.set(key, existing);
      });
    }

    return [...map.entries()].map(([label, items]) => ({ label, items }));
  }, [filtered, groupBy]);

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
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as SkillType | "all")}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          <option value="all">All Types</option>
          <option value="technology">Technology</option>
          <option value="system">System</option>
          <option value="domain">Domain</option>
          <option value="operational">Operational</option>
        </select>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          <option value="none">No Grouping</option>
          <option value="domain">Group by Domain</option>
          <option value="system">Group by System</option>
          <option value="team">Group by Team</option>
        </select>
        {(statusFilter !== "all" || domainFilter !== "all" || typeFilter !== "all") && (
          <button
            onClick={() => { setStatusFilter("all"); setDomainFilter("all"); setTypeFilter("all"); }}
            className="text-xs text-muted-foreground hover:text-foreground tessira-transition"
          >
            Clear filters
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">
          {filtered.length} of {allCoverage.length} skills
        </span>
      </div>

      {grouped.map((group, gi) => (
        <div key={gi} className="space-y-2">
          {group.label && (
            <h3 className="text-sm font-semibold text-foreground pt-2">{group.label}</h3>
          )}
          <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="w-8 px-2" />
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Criticality</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Owners</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Backups</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Learners</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {group.items.map((c) => {
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
                          <button
                            className="font-medium text-left hover:text-primary tessira-transition"
                            onClick={(e) => { e.stopPropagation(); setDetailSkillId(c.skillId); }}
                          >
                            {c.skillName}
                          </button>
                          <div className="text-xs text-muted-foreground">{domain?.name}</div>
                        </td>
                        <td className="px-4 py-3"><SkillTypeBadge type={c.skillType} /></td>
                        <td className="px-4 py-3"><CriticalityBadge criticality={c.criticality} /></td>
                        <td className="px-4 py-3 text-center tabular-nums">{c.ownerCount}</td>
                        <td className="px-4 py-3 text-center tabular-nums">{c.backupCount}</td>
                        <td className="px-4 py-3 text-center tabular-nums">{c.learnerCount}</td>
                        <td className="px-4 py-3 text-center">
                          <CoverageScoreBadge score={c.coverageScore} status={c.coverageStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <CoverageBadge status={c.coverageStatus} />
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="bg-muted/20 px-8 py-3">
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
                                    "bg-warning/10 text-warning"
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

            {group.items.length === 0 && (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No skills match your current filters.
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Skill Detail Panel */}
      {detailSkillId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setDetailSkillId(null)}
          />
          <SkillDetailPanel
            skillId={detailSkillId}
            onClose={() => setDetailSkillId(null)}
          />
        </>
      )}
    </div>
  );
}
