import { Link } from "react-router-dom";
import { Zap, Shield, AlertTriangle, CheckCircle2, ArrowRight, Grid3X3, Layers, Target } from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { getSkillsStats, getSPOFRisks, getSkillCoverage, getOwnerConcentration } from "../data";
import { SeverityBadge, CoverageBadge, CoverageScoreBadge, SkillTypeBadge } from "../components/Badges";

export default function SkillsOverviewPage() {
  const stats = getSkillsStats();
  const risks = getSPOFRisks().slice(0, 4);
  const criticalCoverage = getSkillCoverage().filter((c) => c.coverageStatus !== "healthy").slice(0, 5);
  const concentration = getOwnerConcentration().slice(0, 3);

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title="Skills"
        description="Skill coverage, ownership concentration, and organizational resilience."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Skills" value={stats.totalSkills} icon={Zap} detail={`${stats.domainsTracked} domains · ${stats.systemsTracked} systems`} />
        <StatCard label="Healthy Coverage" value={stats.healthyCoverage} icon={CheckCircle2} detail={`of ${stats.totalSkills} skills`} />
        <StatCard label="At Risk" value={stats.atRiskCoverage} icon={AlertTriangle} detail="Insufficient backup" />
        <StatCard label="SPOF Risks" value={stats.spofCount} icon={Shield} detail="Single-owner dependencies" className={stats.spofCount > 0 ? "border-destructive/30" : ""} />
        <StatCard label="Avg Coverage" value={stats.avgCoverageScore} icon={Target} detail="Weighted score" />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: "/app/skills/matrix", icon: Grid3X3, label: "Skill Matrix", desc: "Employee × skill proficiency grid" },
          { to: "/app/skills/coverage", icon: CheckCircle2, label: "Coverage Map", desc: "Ownership, backups, and gaps" },
          { to: "/app/skills/risk", icon: Shield, label: "SPOF & Risk", desc: `${stats.spofCount} risks identified` },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-lg border border-border/50 bg-card p-5 hover:border-primary/20 tessira-transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <link.icon size={18} strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{link.label}</h3>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-primary tessira-transition" />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top risks */}
        <div className="rounded-lg border border-border/50 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Top SPOF Risks</h3>
            <Link to="/app/skills/risk" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border/50">
            {risks.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-start gap-3">
                <SeverityBadge severity={r.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{r.skillName}</span>
                    <SkillTypeBadge type={r.skillType} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Sole owner: {r.ownerName} · {r.ownerTeam}
                  </div>
                </div>
              </div>
            ))}
            {risks.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No SPOF risks detected.</div>
            )}
          </div>
        </div>

        {/* Coverage gaps */}
        <div className="rounded-lg border border-border/50 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Coverage Gaps</h3>
            <Link to="/app/skills/coverage" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border/50">
            {criticalCoverage.map((c) => (
              <div key={c.skillId} className="px-5 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{c.skillName}</span>
                    <SkillTypeBadge type={c.skillType} />
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {c.ownerCount} owner{c.ownerCount !== 1 ? "s" : ""} · {c.backupCount} backup{c.backupCount !== 1 ? "s" : ""} · Score: {c.coverageScore.toFixed(1)}
                  </div>
                </div>
                <CoverageBadge status={c.coverageStatus} />
              </div>
            ))}
            {criticalCoverage.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">All skills have healthy coverage.</div>
            )}
          </div>
        </div>
      </div>

      {/* Ownership Concentration */}
      {concentration.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Ownership Concentration</h3>
            <Link to="/app/skills/risk" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border/50">
            {concentration.map((e) => (
              <div key={e.employeeId} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <Link
                    to={`/app/people/employees/${e.employeeId}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {e.employeeName}
                  </Link>
                  <div className="text-xs text-muted-foreground">{e.teamName}</div>
                </div>
                <span className="text-xs font-medium text-warning">
                  Owner of {e.criticalSkillCount} critical/high skills
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
