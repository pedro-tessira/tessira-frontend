import { Link } from "react-router-dom";
import { X, Shield, Users, BookOpen, AlertTriangle, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getSkill, getDomain, getSkillAssignments, getSkillSystems, getSkillCoverage } from "../data";
import { SkillTypeBadge, CriticalityBadge, CoverageBadge, CoverageScoreBadge } from "./Badges";
import { MomentumBadge } from "./Badges";

interface SkillDetailPanelProps {
  skillId: string;
  onClose: () => void;
}

export default function SkillDetailPanel({ skillId, onClose }: SkillDetailPanelProps) {
  const skill = getSkill(skillId);
  if (!skill) return null;

  const domain = getDomain(skill.domainId);
  const assignments = getSkillAssignments(skillId);
  const systems = getSkillSystems(skillId);
  const coverage = getSkillCoverage().find((c) => c.skillId === skillId);

  const owners = assignments.filter((a) => a.role === "owner");
  const backups = assignments.filter((a) => a.role === "backup");
  const learners = assignments.filter((a) => a.role === "learner");

  const isSPOF = owners.length <= 1 && backups.length === 0 && skill.criticality !== "standard" && skill.criticality !== "low";

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border/50 shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border/50 px-6 py-4 flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{skill.name}</h2>
          <p className="text-xs text-muted-foreground">{domain?.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-accent tessira-transition"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Skill Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill Information</h3>
          <p className="text-sm text-muted-foreground">{skill.description}</p>
          <div className="flex flex-wrap gap-2">
            <SkillTypeBadge type={skill.skillType} />
            <CriticalityBadge criticality={skill.criticality} />
          </div>
        </div>

        {/* Business Impact */}
        {skill.businessImpact && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Business Impact</h3>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="flex items-start gap-2">
                <Zap size={13} className="text-warning mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{skill.businessImpact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Coverage */}
        {coverage && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Coverage</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/50 p-3 text-center">
                <div className="text-lg font-semibold tabular-nums">{owners.length}</div>
                <div className="text-[11px] text-muted-foreground">Owners</div>
              </div>
              <div className="rounded-lg border border-border/50 p-3 text-center">
                <div className="text-lg font-semibold tabular-nums">{backups.length}</div>
                <div className="text-[11px] text-muted-foreground">Backups</div>
              </div>
              <div className="rounded-lg border border-border/50 p-3 text-center">
                <div className="text-lg font-semibold tabular-nums">{learners.length}</div>
                <div className="text-[11px] text-muted-foreground">Learners</div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <span className="text-sm text-muted-foreground">Coverage Score</span>
              <CoverageScoreBadge score={coverage.coverageScore} status={coverage.coverageStatus} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <CoverageBadge status={coverage.coverageStatus} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <span className="text-sm text-muted-foreground">Momentum</span>
              <MomentumBadge momentum={coverage.momentum} />
            </div>
          </div>
        )}

        {/* Risk */}
        {isSPOF && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-destructive" />
              <span className="text-sm font-semibold text-destructive">SPOF Risk</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This {skill.criticality} skill has {owners.length === 0 ? "no owner" : "a single owner"} with no backup.
              Loss of the owner would create an organizational risk.
            </p>
          </div>
        )}

        {/* People */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">People</h3>
          {[
            { label: "Owners", icon: Shield, people: owners, color: "text-primary" },
            { label: "Backups", icon: Users, people: backups, color: "text-success" },
            { label: "Learners", icon: BookOpen, people: learners, color: "text-warning" },
          ].map(({ label, icon: Icon, people, color }) => (
            people.length > 0 && (
              <div key={label}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={12} className={color} />
                  <span className="text-xs font-medium">{label}</span>
                </div>
                <div className="space-y-1">
                  {people.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <Link
                        to={`/app/people/employees/${p.employeeId}`}
                        className="text-primary hover:underline"
                      >
                        {p.employeeName}
                      </Link>
                      <span className="text-xs text-muted-foreground">{p.teamName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Dependencies — Related Systems */}
        {systems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Used by Systems</h3>
            <div className="space-y-2">
              {systems.map((sys) => (
                <div key={sys.id} className="rounded-lg border border-border/50 p-3">
                  <div className="text-sm font-medium">{sys.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{sys.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
