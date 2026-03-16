import { NavLink, Outlet } from "react-router-dom";
import { Globe, Boxes, Rocket } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const WORK_NAV = [
  { label: "Value Streams", href: "/app/work", icon: Globe, end: true },
  { label: "Domains", href: "/app/work/domains", icon: Boxes },
  { label: "Initiatives", href: "/app/work/initiatives", icon: Rocket },
];

export default function WorkLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Work</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Value streams, engineering domains, initiatives, and capacity allocations.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-border/50 pb-px">
        {WORK_NAV.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px tessira-transition",
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
