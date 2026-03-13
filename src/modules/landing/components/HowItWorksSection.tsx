import {
  CalendarRange,
  Users2,
  Zap,
  Activity,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

const FLOW_STEPS = [
  {
    icon: CalendarRange,
    module: "Horizon",
    action: "surfaces a delivery conflict",
    detail: "Sprint 24 has two overlapping launches and a key engineer on PTO during the release window.",
  },
  {
    icon: Users2,
    module: "People",
    action: "reveals capacity context",
    detail: "The Backend squad is at 94% allocation. Moving anyone creates a downstream ripple.",
  },
  {
    icon: Zap,
    module: "Skills",
    action: "identifies the real risk",
    detail: "Only one engineer can operate the Auth service. If they're reassigned, there's zero backup coverage.",
  },
  {
    icon: Activity,
    module: "Signals",
    action: "confirms the pattern",
    detail: "Deployment frequency for Auth has dropped 40% this quarter. Escalation count is rising.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border/50">
      <div className="landing-section py-20 sm:py-24">
        <div className="mb-12">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From signal to decision
            <br />
            in one workspace.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Tessira's modules aren't isolated tools. They share context — so a
            delivery risk in Horizon connects to a capacity problem in People, a
            skill gap in Skills, and a health signal in Signals.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          {/* Flow */}
          <div className="space-y-0">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.module}>
                <div className="rounded-lg border border-border/50 bg-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <step.icon size={16} strokeWidth={1.8} />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-primary">{step.module}</span>
                      <span className="text-xs text-muted-foreground ml-2">{step.action}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                    {step.detail}
                  </p>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown size={16} className="text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Connector */}
          <div className="hidden lg:flex flex-col items-center justify-center px-8 py-12">
            <div className="h-full w-px bg-border/50 min-h-[200px]" />
            <ArrowRight size={20} className="text-primary my-4" />
            <div className="h-full w-px bg-border/50 min-h-[200px]" />
          </div>

          {/* Decision */}
          <div className="mt-6 lg:mt-0 lg:sticky lg:top-28">
            <div className="rounded-lg border border-primary/20 bg-card p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                Decision Output
              </span>
              <h3 className="text-lg font-semibold mb-3">
                You decide with confidence
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Instead of discovering the Auth SPOF during a production incident,
                you restructure the release sequence, prioritize a cross-training
                sprint, and notify leadership with a clear risk assessment.
              </p>

              <div className="space-y-3 rounded-md bg-muted/50 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions Taken
                </div>
                {[
                  "Release sequence adjusted — conflict resolved",
                  "Auth cross-training added to Sprint 25",
                  "Risk briefing shared with VP Eng",
                  "SPOF alert set for ongoing monitoring",
                ].map((action, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                    <span className="text-foreground/80">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
