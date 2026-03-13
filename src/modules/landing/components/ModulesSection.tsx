import {
  CalendarRange,
  Users2,
  Zap,
  Activity,
  Settings,
  ArrowRight,
} from "lucide-react";

const MODULES = [
  {
    icon: CalendarRange,
    label: "Horizon",
    tagline: "Timeline & Availability",
    desc: "Visualize delivery timelines, team availability windows, and sprint commitments. Know who's doing what and when — without digging through calendars.",
    metrics: ["12 active timelines", "94% on-track", "3 conflicts flagged"],
  },
  {
    icon: Users2,
    label: "People",
    tagline: "Teams & Capacity",
    desc: "See allocation across squads, track capacity in real-time, and understand who's overloaded before it becomes a retention problem.",
    metrics: ["47 engineers", "82% allocated", "6 under-utilized"],
  },
  {
    icon: Zap,
    label: "Skills",
    tagline: "Coverage & Resilience",
    desc: "Map critical skills to people. Identify single points of failure, bus-factor risks, and knowledge gaps before they impact delivery.",
    metrics: ["23 skills tracked", "3 SPOFs", "91% coverage"],
  },
  {
    icon: Activity,
    label: "Signals",
    tagline: "Operational Health",
    desc: "Track engineering health indicators — delivery velocity, team sentiment, escalation frequency, and patterns that predict problems.",
    metrics: ["Health score: 7.4", "2 alerts active", "Trend: stable"],
  },
  {
    icon: Settings,
    label: "Admin",
    tagline: "Governance & Integrations",
    desc: "Manage access, connect your tools, import team data, and configure how Tessira fits into your engineering workflow.",
    metrics: ["4 integrations", "3 roles defined", "SSO enabled"],
  },
];

export function ModulesSection() {
  return (
    <section id="modules" className="border-t border-border/50">
      <div className="landing-section py-20 sm:py-24">
        <div className="mb-12">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            Product Modules
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Five modules.
            <br />
            One operating surface.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Each module gives you focused visibility into one dimension of your
            engineering organization. Together, they create a complete operational picture.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => (
            <div
              key={mod.label}
              className="group rounded-lg border border-border/50 bg-card p-6 hover:border-primary/20 tessira-transition flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <mod.icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{mod.label}</h3>
                  <span className="text-xs text-muted-foreground">{mod.tagline}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {mod.desc}
              </p>

              <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap gap-x-4 gap-y-1">
                {mod.metrics.map((m) => (
                  <span key={m} className="text-xs text-muted-foreground/80 tabular-nums">
                    {m}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 tessira-transition">
                Learn more <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
