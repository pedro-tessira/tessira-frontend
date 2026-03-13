import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, GanttChart, Share2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const HORIZON_NAV = [
  { label: "Overview", href: "/app/horizon", icon: LayoutDashboard, end: true },
  { label: "Timeline", href: "/app/horizon/timeline", icon: GanttChart },
  { label: "Share", href: "/app/horizon/share", icon: Share2 },
];

export default function HorizonLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Horizon</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Delivery timelines, availability windows, and scheduling visibility.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-border/50 overflow-x-auto">
        {HORIZON_NAV.map((item) => (
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
