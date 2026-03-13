const STATS = [
  { value: "3.2×", label: "faster incident response with SPOF visibility" },
  { value: "67%", label: "fewer planning blindspots reported by EMs" },
  { value: "41%", label: "reduction in last-minute staffing conflicts" },
  { value: "<5min", label: "to generate a capacity & risk briefing" },
];

export function SocialProofSection() {
  return (
    <section className="border-t border-border/50 bg-card">
      <div className="landing-section py-16 sm:py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold tabular-nums text-primary">
                {stat.value}
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-border/50 bg-background p-8 sm:p-10">
          <blockquote className="max-w-2xl">
            <p className="text-lg text-foreground/90 leading-relaxed italic">
              "We went from 'I think we're fine' to 'I can see exactly where we're
              exposed.' Tessira didn't change how we work — it made our existing
              decisions visible and defensible."
            </p>
            <footer className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30" />
              <div>
                <div className="text-sm font-medium">Engineering Director</div>
                <div className="text-xs text-muted-foreground">Series B SaaS Company, 120 engineers</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
