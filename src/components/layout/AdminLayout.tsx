import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { KeyRound, Users, Building2, Tags, Activity, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { clearToken } from "@/lib/auth";

const adminNavItems = [
  {
    label: "Authentication & SSO",
    href: "/admin/auth",
    icon: KeyRound,
    description: "Configure SSO and login settings",
  },
  {
    label: "HRIS Integrations",
    href: "/admin/hris",
    icon: Building2,
    description: "Connect to Workday, BambooHR, and more",
  },
  {
    label: "Users & Access",
    href: "/admin/users",
    icon: Users,
    description: "Manage users and permissions",
  },
  {
    label: "Event Types & Sync",
    href: "/admin/event-types",
    icon: Tags,
    description: "Configure event types and sync settings",
  },
  {
    label: "Audit & Health",
    href: "/admin/audit",
    icon: Activity,
    description: "System health and audit logs",
  },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (href: string) => location.pathname === href;
  const currentPage = adminNavItems.find((item) => isActive(item.href));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader
        onLogout={() => {
          clearToken();
          navigate("/");
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border bg-card shrink-0 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Administration
            </h2>
            <nav className="space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
                      isActive(item.href) && "opacity-100"
                    )}
                  />
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card px-6 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                Admin
              </Link>
              {currentPage && (
                <>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{currentPage.label}</span>
                </>
              )}
            </nav>
          </div>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
