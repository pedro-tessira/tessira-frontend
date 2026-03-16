import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarRange,
  Users2,
  Zap,
  Activity,
  BarChart3,
  Settings,
  Search,
  HelpCircle,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useRef, useCallback } from "react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TenantSwitcher } from "@/shared/components/TenantSwitcher";
import { UserMenu } from "@/shared/components/UserMenu";

const NAV_ITEMS = [
  { label: "Overview", href: "/app/overview", icon: LayoutDashboard },
  { label: "Work", href: "/app/work", icon: Briefcase },
  { label: "Horizon", href: "/app/horizon", icon: CalendarRange },
  { label: "People", href: "/app/people", icon: Users2 },
  { label: "Skills", href: "/app/skills", icon: Zap },
  { label: "Signals", href: "/app/signals", icon: Activity },
  { label: "Insights", href: "/app/insights", icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { label: "Org Settings", href: "/app/admin", icon: Settings },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Swipe gesture support
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current || !isMobile) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Must be a horizontal swipe (not diagonal/vertical)
      if (absDx > 50 && absDx > absDy * 1.5) {
        if (dx > 0 && touchStart.current.x < 40 && !mobileOpen) {
          // Swipe right from left edge → open
          setMobileOpen(true);
        } else if (dx < 0 && mobileOpen) {
          // Swipe left while open → close
          setMobileOpen(false);
        }
      }
      touchStart.current = null;
    },
    [isMobile, mobileOpen]
  );

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-12 items-center justify-between border-b border-border/50 px-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            T
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight">Tessira</span>
              <span className="rounded bg-cobalt-muted px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                OS
              </span>
            </div>
          )}
        </div>
        {isMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent tessira-transition"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent tessira-transition"
          >
            {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          </button>
        )}
      </div>

      {/* Search */}
      {(!collapsed || isMobile) && (
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
        {(!collapsed || isMobile) && (
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
                !isMobile && collapsed && "justify-center px-0",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )
            }
            title={!isMobile && collapsed ? item.label : undefined}
          >
            <item.icon size={18} strokeWidth={1.8} className="shrink-0" />
            {(isMobile || !collapsed) && <span>{item.label}</span>}
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
                !isMobile && collapsed && "justify-center px-0",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )
            }
            title={!isMobile && collapsed ? item.label : undefined}
          >
            <item.icon size={18} strokeWidth={1.8} className="shrink-0" />
            {(isMobile || !collapsed) && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* User Menu */}
        <UserMenu collapsed={!isMobile && collapsed} />
      </div>
    </>
  );

  return (
    <div
      className="flex h-svh w-full overflow-hidden bg-background text-foreground"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      {isMobile ? (
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar border-r border-border/50 tessira-transition transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      ) : (
        <aside
          className={cn(
            "flex flex-col border-r border-border/50 bg-sidebar tessira-transition",
            collapsed ? "w-14" : "w-60"
          )}
        >
          {sidebarContent}
        </aside>
      )}

      {/* Main Content */}
      <main className="relative flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4 md:px-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent tessira-transition"
              >
                <Menu size={18} />
              </button>
            )}
            <Breadcrumb />
          </div>
          <TenantSwitcher />
        </header>

        <div className="flex-1 p-4 md:p-6 max-w-[1440px] w-full mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
