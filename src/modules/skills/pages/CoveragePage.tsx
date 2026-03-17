import { useState, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, AlertTriangle, Plus, UserPlus, ArrowDownRight, Briefcase } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CoverageBadge, CoverageScoreBadge, SkillTypeBadge, CriticalityBadge, MomentumBadge } from "../components/Badges";
import SkillDetailPanel from "../components/SkillDetailPanel";
import { getSkillCoverage, MOCK_DOMAINS, MOCK_SYSTEMS, getSkillAssignments, MOCK_SKILLS, getCoverageInsights } from "../data";
import { initiatives as workInitiatives, domains as workDomains } from "@/modules/work/data";
import type { CoverageStatus, SkillType, SkillCoverage } from "../types";

type GroupBy = "none" | "domain" | "system" | "initiative_impact";

// ── Helpers ──

function getSkillInitiativeLinks(skillId: string) {
  const skill = MOCK_SKILLS.find((s) => s.id === skillId);
  if (!skill) return [];
  const skillDomain = MOCK_DOMAINS.find((d) => d.id === skill.domainId);
  if (!skillDomain) return [];

  const domainNameLower = skillDomain.name.split(" ")[0].toLowerCase();
  const matchedWorkDomains = workDomains.filter((wd) =>
    wd.name.toLowerCase().includes(domainNameLower)
  );
  const matchedDomainIds = new Set(matchedWorkDomains.map((d) => d.id));

  return workInitiatives
    .filter((init) => init.domainIds.some((did) => matchedDomainIds.has(did)))
    .map((init) => ({ id: init.id, name: init.name, status: init.status }));
}

function groupByInitiativeImpact(items: SkillCoverage[]): { label: string; items: SkillCoverage[] }[] {
  const active: SkillCoverage[] = [];
  const unused: SkillCoverage[] = [];

  items.forEach((c) => {
    const links = getSkillInitiativeLinks(c.skillId);
    const hasActive = links.some((l) => l.status === "active");
    if (hasActive) active.push(c);
    else unused.push(c);
  });

  const groups: { label: string; items: SkillCoverage[] }[] = [];
  if (active.length > 0) groups.push({ label: `Impacting Active Initiatives (${active.length})`, items: active });
  if (unused.length > 0) groups.push({ label: `Not Linked to Active Work (${unused.length})`, items: unused });
  return groups;
}

// ── Insight Badge ──

const INSIGHT_CONFIG: Record<string, { icon: typeof Plus; className: string }> = {
  "Add backup": { icon: Plus, className: "bg-warning/10 text-warning border-warning/20" },
  "Assign learner": { icon: UserPlus, className: "bg-primary/10 text-primary border-primary/20" },
  "Reduce dependency": { icon: ArrowDownRight, className: "bg-destructive/10 text-destructive border-destructive/20" },
  "Assign owner": { icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

function InsightBadge({ insight }: { insight: string }) {
  const cfg = INSIGHT_CONFIG[insight] ?? { icon: Plus, className: "bg-muted text-muted-foreground border-border/50" };
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", cfg.className)}>
      <Icon size={10} />
      {insight}
    </span>
  );
}

// ── Main Page ──

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
    if (groupBy === "none") return [{ label: null as string | null, items: filtered }];

    if (groupBy === "initiative_impact") return groupByInitiativeImpact(filtered);

    if (groupBy === "domain") {
      const map = new Map<string, SkillCoverage[]>();
      filtered.forEach((c) => {
        const domain = MOCK_DOMAINS.find((d) => d.id === c.domainId);
        const key = domain?.name ?? "Unknown";
        const existing = map.get(key) ?? [];
        existing.push(c);
        map.set(key, existing);
      });
      return [...map.entries()].map(([label, items]) => ({ label, items }));
    }

    if (groupBy === "system") {
      const map = new Map<string, SkillCoverage[]>();
      filtered.forEach((c) => {
        const systems = MOCK_SYSTEMS.filter((sys) => sys.skillIds.includes(c.skillId));
        if (systems.length > 0) {
          systems.forEach((sys) => {
            const existing = map.get(sys.name) ?? [];
            existing.push(c);
            map.set(sys.name, existing);
          });
        } else {
          const existing = map.get("Ungrouped") ?? [];
          existing.push(c);
          map.set("Ungrouped", existing);
        }
      });
      return [...map.entries()].map(([label, items]) => ({ label, items }));
    }

    return [{ label: null as string | null, items: filtered }];
  }, [filtered, groupBy]);

  // Precompute insights
  const insightsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    filtered.forEach((c) => map.set(c.skillId, getCoverageInsights(c.skillId)));
    return map;
  }, [filtered]);

  // Precompute initiative links
  const initLinksMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getSkillInitiativeLinks>>();
    filtered.forEach((c) => map.set(c.skillId, getSkillInitiativeLinks(c.skillId)));
    return map;
  }, [filtered]);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Coverage Map"
        description="Where the organization is exposed — with actionable insights for every gap."
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
          <option value="technical">Technical</option>
          <option value="functional">Functional</option>
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
          <option value="initiative_impact">Group by Initiative Impact</option>
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
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {group.items.map((c) => {
                  const isExpanded = expandedSkill === c.skillId;
                  const assignments = isExpanded ? getSkillAssignments(c.skillId) : [];
                  const domain = MOCK_DOMAINS.find((d) => d.id === c.domainId);
                  const insights = insightsMap.get(c.skillId) ?? [];
                  const initLinks = initLinksMap.get(c.skillId) ?? [];

                  return (
                    <Fragment key={c.skillId}>
                      <tr
                        className={cn(
                          "hover:bg-accent/10 tessira-transition cursor-pointer",
                          insights.includes("Assign owner") && "bg-destructive/[0.03]"
                        )}
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{domain?.name}</span>
                            {initLinks.length > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-0.5 text-[10px] text-primary/70">
                                    <Briefcase size={9} />
                                    {initLinks.length}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="text-xs max-w-[200px]">
                                  <div className="font-medium mb-1">Linked Initiatives:</div>
                                  {initLinks.map((l) => (
                                    <div key={l.id} className="flex items-center gap-1">
                                      <span className={cn(
                                        "h-1.5 w-1.5 rounded-full shrink-0",
                                        l.status === "active" ? "bg-success" : "bg-muted-foreground/40"
                                      )} />
                                      {l.name}
                                    </div>
                                  ))}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
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
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {insights.map((insight) => (
                              <InsightBadge key={insight} insight={insight} />
                            ))}
                            {insights.length === 0 && (
                              <span className="text-[10px] text-muted-foreground/40">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="bg-muted/20 px-8 py-3">
                            <div className="grid gap-3 lg:grid-cols-2">
                              {/* People */}
                              <div className="space-y-1.5">
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">People</div>
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
                                {assignments.length === 0 && (
                                  <div className="text-xs text-muted-foreground/60">No people assigned</div>
                                )}
                              </div>
                              {/* Initiative Links */}
                              <div className="space-y-1.5">
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Linked Initiatives</div>
                                {initLinks.length > 0 ? initLinks.map((l) => (
                                  <div key={l.id} className="flex items-center gap-2 text-xs">
                                    <span className={cn(
                                      "h-2 w-2 rounded-full shrink-0",
                                      l.status === "active" ? "bg-success" : l.status === "planned" ? "bg-warning" : "bg-muted-foreground/40"
                                    )} />
                                    <Link
                                      to={`/app/work/initiatives/${l.id}`}
                                      className="font-medium text-primary hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {l.name}
                                    </Link>
                                    <span className="text-muted-foreground capitalize">{l.status}</span>
                                  </div>
                                )) : (
                                  <div className="text-xs text-muted-foreground/60">Not linked to any initiatives</div>
                                )}
                              </div>
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
