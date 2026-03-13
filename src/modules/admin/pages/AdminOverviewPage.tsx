import { Link } from "react-router-dom";
import { Users, ShieldCheck, Link2, Building2, ScrollText, AlertTriangle } from "lucide-react";
import { StatCard } from "@/shared/components/StatCard";
import { getAdminStats, auditLog } from "../data";

const stats = getAdminStats();

const quickLinks = [
  { label: "Access & Auth", desc: "SSO providers, auth settings", href: "/app/admin/access", icon: ShieldCheck },
  { label: "Users", desc: "Manage platform users", href: "/app/admin/users", icon: Users },
  { label: "Linking", desc: "User–employee associations", href: "/app/admin/linking", icon: Link2 },
  { label: "Governance", desc: "Tenant, policies, compliance", href: "/app/admin/governance", icon: Building2 },
  { label: "Audit", desc: "Activity log and events", href: "/app/admin/audit", icon: ScrollText },
];

export default function AdminOverviewPage() {
  const recentAudit = auditLog.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} detail={`${stats.activeUsers} active`} />
        <StatCard label="Linked Users" value={stats.linkedUsers} icon={Link2} detail={`${stats.totalUsers - stats.linkedUsers} unlinked`} />
        <StatCard label="Auth Providers" value={stats.authProviders} icon={ShieldCheck} detail="Active providers" />
        <StatCard label="Audit Events Today" value={stats.auditEventsToday} icon={ScrollText} detail="Logged today" />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Admin Sections</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="rounded-lg border border-border/50 bg-card p-4 hover:bg-accent/30 tessira-transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon size={16} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold group-hover:text-foreground">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent audit */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <Link to="/app/admin/audit" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
          {recentAudit.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {entry.severity === "critical" ? (
                  <AlertTriangle size={14} className="text-destructive" />
                ) : entry.severity === "warning" ? (
                  <AlertTriangle size={14} className="text-warning" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                )}
                <div>
                  <span className="text-sm">{entry.action}</span>
                  <span className="text-muted-foreground text-sm"> — {entry.resource}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{entry.actor}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
