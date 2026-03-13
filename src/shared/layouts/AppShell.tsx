import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarRange,
  Users2,
  Zap,
  Activity,
  Settings,
  Search,
  HelpCircle,
  User,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Overview", href: "/app/overview", icon: LayoutDashboard },
  { label: "Horizon", href: "/app/horizon", icon: CalendarRange },
  { label: "People", href: "/app/people", icon: Users2 },
  { label: "Skills", href: "/app/skills", icon: Zap },
  { label: "Signals", href: "/app/signals", icon: Activity },
];

const BOTTOM_ITEMS = [
  { label: "Admin", href: "/app/admin", icon: Settings },
  { label: "Profile", href: "/app/profile", icon: User },
  { label: "Help", href: "/app/help", icon: HelpCircle },
];

function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} className="text-muted-foreground/40" />}
          <span
            className={cn(
              "capitalize",
              i < segments.length - 1
                ? "text-muted-foreground"
                : "text-foreground font-medium"
            )}
          >
            {seg}
          </span>
        </span>
      ))}
    </div>
  );
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border/50 bg-sidebar tessira-transition",
          collapsed ? "w-14" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex h-12 items-center justify-between border-b border-border/50 px-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              T
            </div>
            {!collapsed && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold tracking-tight">Tessira</span>
                <span className="rounded bg-cobalt-muted px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                  OS
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent tessira-transition"
          >
            {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="p-3 pb-0">
            <button className="flex w-full items-center justify-between rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent tessira-transition">
              <span className="flex items-center gap-2">
                <Search size={13} />
                Search…
              </span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Main Nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {!collapsed && (
            <span className="mb-2 block px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
              Modules
            </span>
          )}
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium tessira-transition",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} strokeWidth={1.8} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="border-t border-border/50 p-3 space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium tessira-transition",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} strokeWidth={1.8} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {/* User */}
          <div className={cn("flex items-center gap-3 px-3 py-2 mt-1", collapsed && "justify-center px-0")}>
            <div className="h-6 w-6 shrink-0 rounded-full bg-primary/20 border border-primary/30" />
            {!collapsed && (
              <span className="text-xs font-medium text-muted-foreground truncate">
                Engineering Lead
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
          <Breadcrumb />
        </header>

        <div className="flex-1 p-6 max-w-[1440px] w-full mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
