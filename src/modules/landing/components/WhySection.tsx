import {
  Eye,
  Shield,
  TrendingUp,
  Clock,
  Network,
  Target,
} from "lucide-react";

const VALUES = [
  {
    icon: Eye,
    title: "Delivery Visibility",
    desc: "See every active stream, timeline, and commitment in one view. Know what's on track, what's at risk, and what needs your attention.",
  },
  {
    icon: Shield,
    title: "Operational Resilience",
    desc: "Identify single points of failure, bus-factor risks, and knowledge gaps before they become production incidents or attrition crises.",
  },
  {
    icon: TrendingUp,
    title: "Capacity Awareness",
    desc: "Understand true team capacity — not just headcount. Factor in PTO, context-switching costs, and allocation quality.",
  },
  {
    icon: Clock,
    title: "Planning Clarity",
    desc: "Make staffing and scoping decisions with real data. See downstream impacts before committing to new work.",
  },
  {
    icon: Network,
    title: "Skill Coverage",
    desc: "Map critical skills to people. Track coverage depth across services and domains. Build resilience into your organization structure.",
  },
  {
    icon: Target,
    title: "Decision Confidence",
    desc: "Replace spreadsheet-driven planning with a structured intelligence layer. Provide leadership with answers, not artifacts.",
  },
];

export function WhySection() {
  return (
    <section id="why" className="border-t border-border/50 bg-card">
      <div className="landing-section py-20 sm:py-24">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            Why Tessira
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for engineering leaders
            <br />
            who need to see clearly.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            You don't need another dashboard. You need an operating surface that
            makes the implicit explicit — turning organizational knowledge into
            actionable structure.
          </p>
        </div>

        <div className="grid gap-px rounded-lg border border-border/50 bg-border/50 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          {VALUES.map((val) => (
            <div key={val.title} className="bg-card p-6 sm:p-8">
              <val.icon
                size={20}
                strokeWidth={1.8}
                className="text-primary mb-4"
              />
              <h3 className="text-sm font-semibold mb-2">{val.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
