import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Link2,
  Building2,
  ScrollText,
  UserCheck,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { routePaths } from "@/app/routing/routePaths";

const ADMIN_NAV = [
  { label: "Overview", href: routePaths.app.admin.root, icon: LayoutDashboard, end: true },
  { label: "Access & Auth", href: routePaths.app.admin.access, icon: ShieldCheck },
  { label: "Users", href: routePaths.app.admin.users, icon: Users },
  { label: "Roles", href: routePaths.app.admin.roles, icon: UserCheck },
  { label: "Linking", href: routePaths.app.admin.linking, icon: Link2 },
  { label: "Governance", href: routePaths.app.admin.governance, icon: Building2 },
  { label: "Audit", href: routePaths.app.admin.audit, icon: ScrollText },
];

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Organization Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tenant administration, access control, governance, and audit.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-border/50 overflow-x-auto">
        {ADMIN_NAV.map((item) => (
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
