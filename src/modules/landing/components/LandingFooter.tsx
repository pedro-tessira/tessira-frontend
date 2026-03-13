import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  Product: [
    { label: "Overview", href: "#modules" },
    { label: "Horizon", href: "#modules" },
    { label: "People", href: "#modules" },
    { label: "Skills", href: "#modules" },
    { label: "Signals", href: "#modules" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "mailto:hello@tessira.dev" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Status", href: "#" },
    { label: "Security", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "DPA", href: "#" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-card">
      <div className="landing-section py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                T
              </div>
              <span className="text-sm font-semibold tracking-tight">Tessira</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              The engineering operating system for leaders who need
              delivery visibility, capacity awareness, and organizational
              confidence.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground tessira-transition"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            © 2026 Tessira. All rights reserved.
          </span>
          <span className="text-xs text-muted-foreground">
            Engineering Operating System
          </span>
        </div>
      </div>
    </footer>
  );
}
