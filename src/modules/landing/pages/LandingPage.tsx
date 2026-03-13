import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, CalendarRange, Users2, Zap, Activity } from "lucide-react";

const MODULES = [
  { icon: LayoutDashboard, label: "Overview", desc: "Engineering health at a glance" },
  { icon: CalendarRange, label: "Horizon", desc: "Delivery timelines & availability" },
  { icon: Users2, label: "People", desc: "Capacity & team directory" },
  { icon: Zap, label: "Skills", desc: "Coverage & resilience mapping" },
  { icon: Activity, label: "Signals", desc: "Operational health indicators" },
];

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              T
            </div>
            <span className="text-sm font-semibold tracking-tight">Tessira</span>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 tessira-transition"
          >
            Open App
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center rounded-full border border-border/50 bg-accent px-3 py-1 text-xs font-medium text-muted-foreground">
            Engineering Operating System
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Engineering capacity,
            <br />
            <span className="text-primary">visualized.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-xl">
            Tessira gives engineering leaders operational visibility into delivery, capacity,
            skill coverage, and team health — all in one structured workspace.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 tessira-transition"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
            <span className="text-sm text-muted-foreground">No setup required</span>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Modules
          </h2>
          <div className="grid gap-px rounded-lg border border-border/50 bg-border/50 sm:grid-cols-2 lg:grid-cols-5 overflow-hidden">
            {MODULES.map((mod) => (
              <div
                key={mod.label}
                className="flex flex-col gap-3 bg-background p-5"
              >
                <mod.icon size={20} strokeWidth={1.8} className="text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">{mod.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { value: "14", label: "Active streams" },
              { value: "82%", label: "Allocation" },
              { value: "3", label: "Resilience gaps" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold tabular-nums">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">© 2026 Tessira</span>
          <span className="text-xs text-muted-foreground">Engineering Operating System</span>
        </div>
      </footer>
    </div>
  );
}
