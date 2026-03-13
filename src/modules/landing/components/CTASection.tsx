import { ArrowRight, Mail, Calendar } from "lucide-react";

export function CTASection() {
  return (
    <section id="waitlist" className="border-t border-border/50">
      <div className="landing-section py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to see your engineering org clearly?
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Tessira is in early access. Request a demo, join the waitlist, or
            reach out to discuss how it fits your organization.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
          {/* Demo */}
          <div id="demo" className="rounded-lg border border-border/50 bg-card p-6 flex flex-col">
            <Calendar size={20} strokeWidth={1.8} className="text-primary mb-4" />
            <h3 className="text-sm font-semibold mb-1">Request a Demo</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-5">
              See Tessira in action with a guided walkthrough tailored to your
              team's scale and challenges.
            </p>
            <a
              href="mailto:demo@tessira.dev"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 tessira-transition w-full"
            >
              Book Demo
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Waitlist */}
          <div className="rounded-lg border border-primary/20 bg-card p-6 flex flex-col ring-1 ring-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={20} strokeWidth={1.8} className="text-primary" />
              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">
                Recommended
              </span>
            </div>
            <h3 className="text-sm font-semibold mb-1">Join the Waitlist</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-5">
              Get early access, product updates, and priority onboarding when
              we launch your cohort.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 tessira-transition w-full">
                Join Waitlist
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-lg border border-border/50 bg-card p-6 flex flex-col">
            <Mail size={20} strokeWidth={1.8} className="text-primary mb-4" />
            <h3 className="text-sm font-semibold mb-1">Contact Us</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-5">
              Have questions about enterprise deployment, security, or
              self-hosted options? Let's talk.
            </p>
            <a
              href="mailto:hello@tessira.dev"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border/50 bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent tessira-transition w-full"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
