import { useState, useMemo } from "react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { MOCK_SKILLS, MOCK_DOMAINS, getMatrixEmployees, getEmployeeSkillLevel } from "../data";
import { LevelCell } from "../components/Badges";
import SkillDetailPanel from "../components/SkillDetailPanel";
import type { SkillType } from "../types";

export default function SkillMatrixPage() {
  const [domainFilter, setDomainFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<SkillType | "all">("all");
  const [detailSkillId, setDetailSkillId] = useState<string | null>(null);
  const employees = getMatrixEmployees();

  const filteredSkills = useMemo(() => {
    return MOCK_SKILLS.filter((s) => {
      if (domainFilter !== "all" && s.domainId !== domainFilter) return false;
      if (typeFilter !== "all" && s.skillType !== typeFilter) return false;
      return true;
    });
  }, [domainFilter, typeFilter]);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Skill Matrix"
        description="Employee proficiency across tracked skills. ★ = owner role."
        breadcrumbs={[
          { label: "Skills", href: "/app/skills" },
          { label: "Matrix" },
        ]}
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
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
          <option value="technology">Technology</option>
          <option value="system">System</option>
          <option value="domain">Domain</option>
          <option value="operational">Operational</option>
        </select>
        <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-primary/15 border border-primary/20" /> Expert ★ Owner</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-primary/15 border border-primary/20" /> Expert</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-success/10 border border-success/20" /> Proficient</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-warning/10 border border-warning/20" /> Learning</span>
        </div>
      </div>

      {/* Matrix table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="sticky left-0 z-10 bg-muted/30 text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[160px] border-r border-border/50">
                  Employee
                </th>
                {filteredSkills.map((skill) => {
                  const domain = MOCK_DOMAINS.find((d) => d.id === skill.domainId);
                  return (
                    <th
                      key={skill.id}
                      className="px-2 py-2.5 text-center min-w-[72px] cursor-pointer hover:bg-accent/10 tessira-transition"
                      onClick={() => setDetailSkillId(skill.id)}
                    >
                      <div className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider truncate">
                        {domain?.name}
                      </div>
                      <div className="text-[11px] font-medium text-foreground truncate mt-0.5" title={skill.name}>
                        {skill.name.length > 16 ? skill.name.slice(0, 14) + "…" : skill.name}
                      </div>
                      <div className={`text-[9px] mt-0.5 ${
                        skill.skillType === "technology" ? "text-primary" :
                        skill.skillType === "system" ? "text-secondary-foreground" :
                        skill.skillType === "domain" ? "text-warning" :
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
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-accent/10 tessira-transition">
                  <td className="sticky left-0 z-10 bg-card px-4 py-2 border-r border-border/50">
                    <div className="text-sm font-medium truncate">{emp.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{emp.team}</div>
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
              ))}
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
