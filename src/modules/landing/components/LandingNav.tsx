import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

const NAV_LINKS = [
  { label: "Product", href: "#modules" },
  { label: "Why Tessira", href: "#why" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#waitlist" },
];

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="landing-section flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              T
            </div>
            <span className="text-sm font-semibold tracking-tight">Tessira</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground tessira-transition"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/app"
            className="text-sm font-medium text-muted-foreground hover:text-foreground tessira-transition"
          >
            Sign In
          </Link>
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 tessira-transition"
          >
            Request Access
            <ArrowRight size={14} />
          </a>
        </div>

        <button
          className="md:hidden flex h-8 w-8 items-center justify-center rounded text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
            <Link to="/app" className="text-sm font-medium text-foreground">
              Sign In
            </Link>
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Request Access
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
