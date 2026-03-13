import { Zap, Plus } from "lucide-react";

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Skills</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Skill coverage mapping, resilience analysis, and knowledge gaps.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 tessira-transition">
          <Plus size={14} />
          Add Skill
        </button>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
        <Zap size={32} strokeWidth={1.5} className="mx-auto text-muted-foreground/40" />
        <h3 className="mt-4 text-sm font-semibold">Skill Matrix</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Map skills across your organization to identify single points of failure and coverage gaps.
        </p>
        <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-border/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent tessira-transition">
          <Plus size={14} />
          Define Skills
        </button>
      </div>
    </div>
  );
}
