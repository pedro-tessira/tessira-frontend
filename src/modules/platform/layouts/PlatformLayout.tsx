import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Flag,
  ScrollText,
  Wrench,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { routePaths } from "@/app/routing/routePaths";

const PLATFORM_NAV = [
  { label: "Tenants", href: routePaths.platform.root, icon: Building2, end: true },
  { label: "Users", href: routePaths.platform.users, icon: Users },
  { label: "Subscriptions", href: routePaths.platform.subscriptions, icon: CreditCard },
  { label: "Usage", href: routePaths.platform.usage, icon: BarChart3 },
  { label: "Feature Flags", href: routePaths.platform.flags, icon: Flag },
  { label: "Audit", href: routePaths.platform.audit, icon: ScrollText },
  { label: "Support", href: routePaths.platform.support, icon: Wrench },
];

export default function PlatformLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
      <aside className="flex w-56 flex-col border-r border-border/50 bg-sidebar">
        <div className="flex h-12 items-center gap-2 border-b border-border/50 px-4">
          <Shield size={16} className="text-primary" />
          <span className="text-sm font-semibold tracking-tight">Platform Admin</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {PLATFORM_NAV.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium tessira-transition",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )
              }
            >
              <item.icon size={16} strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border/50 p-3">
          <button
            onClick={() => navigate(routePaths.app.overview)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground tessira-transition"
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
            Back to App
          </button>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-12 items-center border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
          <span className="text-sm font-medium text-muted-foreground">Tessira Control Plane</span>
        </header>
        <div className="flex-1 p-6 max-w-[1440px] w-full mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
