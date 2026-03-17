import { useState, useMemo } from "react";
import { AlertTriangle, Zap, Shield, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MOCK_SKILLS, MOCK_DOMAINS, getMatrixEmployees, getEmployeeSkillLevel, getSkillRiskFlags, getPersonSkillContext } from "../data";
import { LevelCell } from "../components/Badges";
import SkillDetailPanel from "../components/SkillDetailPanel";
import type { SkillType } from "../types";

export default function SkillMatrixPage() {
  const [domainFilter, setDomainFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<SkillType | "all">("all");
  const [showOverloadOnly, setShowOverloadOnly] = useState(false);
  const [detailSkillId, setDetailSkillId] = useState<string | null>(null);
  const employees = getMatrixEmployees();

  const filteredSkills = useMemo(() => {
    return MOCK_SKILLS.filter((s) => {
      if (domainFilter !== "all" && s.domainId !== domainFilter) return false;
      if (typeFilter !== "all" && s.skillType !== typeFilter) return false;
      return true;
    });
  }, [domainFilter, typeFilter]);

  // Precompute per-skill risk flags
  const skillRiskMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getSkillRiskFlags>>();
    filteredSkills.forEach((s) => map.set(s.id, getSkillRiskFlags(s.id)));
    return map;
  }, [filteredSkills]);

  // Precompute person context
  const personContextMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getPersonSkillContext>>();
    employees.forEach((emp) => map.set(emp.id, getPersonSkillContext(emp.id)));
    return map;
  }, [employees]);

  const displayedEmployees = useMemo(() => {
    if (!showOverloadOnly) return employees;
    return employees.filter((emp) => personContextMap.get(emp.id)?.isOverallocated);
  }, [employees, showOverloadOnly, personContextMap]);

  const overloadedCount = useMemo(() => {
    return employees.filter((emp) => personContextMap.get(emp.id)?.isOverallocated).length;
  }, [employees, personContextMap]);

  // Count risk flags for header summary
  const riskSummary = useMemo(() => {
    let noOwner = 0, singleExpert = 0, noLearners = 0;
    filteredSkills.forEach((s) => {
      const flags = skillRiskMap.get(s.id);
      if (flags?.noOwner) noOwner++;
      if (flags?.singleExpert) singleExpert++;
      if (flags?.noLearners) noLearners++;
    });
    return { noOwner, singleExpert, noLearners };
  }, [filteredSkills, skillRiskMap]);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Skill Matrix"
        description="Who knows what — with risk overlays for delivery resilience."
        breadcrumbs={[
          { label: "Skills", href: "/app/skills" },
          { label: "Matrix" },
        ]}
      />

      {/* Risk Summary Banner */}
      {(riskSummary.noOwner > 0 || riskSummary.singleExpert > 0 || riskSummary.noLearners > 0) && (
        <div className="flex flex-wrap gap-3">
          {riskSummary.noOwner > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive">
              <AlertTriangle size={12} />
              {riskSummary.noOwner} skill{riskSummary.noOwner !== 1 ? "s" : ""} with no owner
            </div>
          )}
          {riskSummary.singleExpert > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/5 px-3 py-1.5 text-xs font-medium text-warning">
              <Shield size={12} />
              {riskSummary.singleExpert} skill{riskSummary.singleExpert !== 1 ? "s" : ""} with only 1 expert
            </div>
          )}
          {riskSummary.noLearners > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border border-muted-foreground/20 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <BookOpen size={12} />
              {riskSummary.noLearners} skill{riskSummary.noLearners !== 1 ? "s" : ""} with no learners
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          <option value="all">All Domains</option>
          {MOCK_DOMAINS.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as SkillType | "all")}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          <option value="all">All Types</option>
          <option value="technical">Technical</option>
          <option value="functional">Functional</option>
          <option value="operational">Operational</option>
        </select>
        {overloadedCount > 0 && (
          <button
            onClick={() => setShowOverloadOnly((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium tessira-transition",
              showOverloadOnly
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border/50 bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap size={12} />
            {showOverloadOnly ? `Showing ${overloadedCount} overallocated` : `${overloadedCount} overallocated`}
          </button>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-primary/15 border border-primary/20" /> Expert</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-success/10 border border-success/20" /> Proficient</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-warning/10 border border-warning/20" /> Learning</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-destructive/40" /> Risk</span>
        </div>
      </div>

      {/* Matrix table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="sticky left-0 z-10 bg-muted/30 text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[220px] border-r border-border/50">
                  Employee
                </th>
                {filteredSkills.map((skill) => {
                  const domain = MOCK_DOMAINS.find((d) => d.id === skill.domainId);
                  const flags = skillRiskMap.get(skill.id);
                  const hasRisk = flags?.noOwner || flags?.singleExpert || flags?.noLearners;
                  return (
                    <th
                      key={skill.id}
                      className={cn(
                        "px-2 py-2.5 text-center min-w-[72px] cursor-pointer hover:bg-accent/10 tessira-transition relative",
                        hasRisk && "bg-destructive/[0.03]"
                      )}
                      onClick={() => setDetailSkillId(skill.id)}
                    >
                      {/* Risk indicators */}
                      {hasRisk && (
                        <div className="absolute top-1 right-1 flex gap-0.5">
                          {flags?.noOwner && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">No owner assigned</TooltipContent>
                            </Tooltip>
                          )}
                          {flags?.singleExpert && !flags?.noOwner && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">Only 1 expert</TooltipContent>
                            </Tooltip>
                          )}
                          {flags?.noLearners && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">No learners — no succession pipeline</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                      <div className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider truncate">
                        {domain?.name}
                      </div>
                      <div className="text-[11px] font-medium text-foreground truncate mt-0.5" title={skill.name}>
                        {skill.name.length > 16 ? skill.name.slice(0, 14) + "…" : skill.name}
                      </div>
                      <div className={`text-[9px] mt-0.5 ${
                        skill.skillType === "technical" ? "text-primary" :
                        skill.skillType === "functional" ? "text-warning" :
                        "text-success"
                      }`}>
                        {skill.skillType}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {displayedEmployees.map((emp) => {
                const ctx = personContextMap.get(emp.id)!;
                return (
                  <tr
                    key={emp.id}
                    className={cn(
                      "hover:bg-accent/10 tessira-transition",
                      ctx.isOverallocated && "bg-destructive/[0.03]"
                    )}
                  >
                    <td className={cn(
                      "sticky left-0 z-10 px-4 py-2 border-r border-border/50",
                      ctx.isOverallocated ? "bg-destructive/[0.03]" : "bg-card"
                    )}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{emp.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{emp.team}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-[10px] tabular-nums font-medium text-primary bg-primary/10 rounded px-1 py-0.5">
                                {ctx.expertCount}E
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">{ctx.expertCount} expert-level skills</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-[10px] tabular-nums font-medium text-muted-foreground bg-muted rounded px-1 py-0.5">
                                {ctx.ownedSystemCount}S
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">{ctx.ownedSystemCount} owned systems</TooltipContent>
                          </Tooltip>
                          {ctx.spofOwnedCount > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-[10px] tabular-nums font-medium text-destructive bg-destructive/10 rounded px-1 py-0.5">
                                  {ctx.spofOwnedCount}!
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">{ctx.spofOwnedCount} SPOF-owned skills (no backup)</TooltipContent>
                            </Tooltip>
                          )}
                          {ctx.isOverallocated && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-[10px] tabular-nums font-medium text-destructive">
                                  <Zap size={11} />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">Overallocated: {ctx.totalAllocation}% capacity used</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </td>
                    {filteredSkills.map((skill) => {
                      const assignment = getEmployeeSkillLevel(emp.id, skill.id);
                      return (
                        <td key={skill.id} className="px-1.5 py-1.5">
                          {assignment ? (
                            <LevelCell level={assignment.level} role={assignment.role} />
                          ) : (
                            <LevelCell level="none" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
