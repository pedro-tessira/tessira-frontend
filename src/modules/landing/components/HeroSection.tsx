import { ArrowRight } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0 pointer-events-none" />
      <div className="landing-section py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/50 bg-accent px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">
              Engineering Operating System — Now in Early Access
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
            Your engineering org,{" "}
            <span className="gradient-text">structurally visible.</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Tessira gives engineering leaders a unified operating surface for delivery
            timelines, team capacity, skill coverage, and operational health. Stop
            guessing. Start deciding with clarity.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 tessira-transition"
            >
              Request Early Access
              <ArrowRight size={14} />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent tessira-transition"
            >
              Request a Demo
            </a>
          </div>

          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              SOC 2 compliant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              Self-hosted available
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard preview */}
      <div className="landing-section pb-16">
        <div className="relative rounded-lg border border-border/50 overflow-hidden shadow-2xl shadow-primary/5">
          <div className="flex items-center gap-2 border-b border-border/50 bg-card px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <div className="ml-3 flex-1 flex justify-center">
              <div className="rounded-md bg-muted px-4 py-1 text-[10px] text-muted-foreground font-mono">
                app.tessira.dev
              </div>
            </div>
          </div>
          <img
            src={heroDashboard}
            alt="Tessira engineering dashboard showing delivery timelines, capacity metrics, and skill coverage"
            className="w-full"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
