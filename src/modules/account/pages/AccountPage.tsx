import { NavLink, Outlet } from "react-router-dom";
import { User, ShieldCheck, Monitor, Bell, Key } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { routePaths } from "@/app/routing/routePaths";

const ACCOUNT_NAV = [
  { label: "Profile", href: routePaths.app.account.root, icon: User, end: true },
  { label: "Security", href: routePaths.app.account.security, icon: ShieldCheck },
  { label: "Sessions", href: routePaths.app.account.sessions, icon: Monitor },
  { label: "Notifications", href: routePaths.app.account.notifications, icon: Bell },
  { label: "API Tokens", href: routePaths.app.account.tokens, icon: Key },
];

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personal settings and security.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-border/50 overflow-x-auto">
        {ACCOUNT_NAV.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 tessira-transition whitespace-nowrap",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )
            }
          >
            <item.icon size={15} strokeWidth={1.8} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
