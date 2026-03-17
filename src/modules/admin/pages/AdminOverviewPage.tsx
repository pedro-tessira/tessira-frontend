import { Link } from "react-router-dom";
import { Users, ShieldCheck, Link2, Building2, ScrollText, AlertTriangle, Zap, CreditCard, Clock, UserCheck } from "lucide-react";
import { StatCard } from "@/shared/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminStats, getAdminInsights, auditLog, tenantSubscription } from "../data";
import { cn } from "@/shared/lib/utils";
import type { AdminInsight } from "../types";

const stats = getAdminStats();
const insights = getAdminInsights();

const quickLinks = [
  { label: "Access & Auth", desc: "SSO providers, sessions, security", href: "/app/admin/access", icon: ShieldCheck },
  { label: "Users", desc: "Manage platform users & roles", href: "/app/admin/users", icon: Users },
  { label: "Roles", desc: "Custom roles & permissions", href: "/app/admin/roles", icon: UserCheck },
  { label: "Linking", desc: "User–employee associations", href: "/app/admin/linking", icon: Link2 },
  { label: "Governance", desc: "Policies, compliance, retention", href: "/app/admin/governance", icon: Building2 },
  { label: "Audit", desc: "Activity log and events", href: "/app/admin/audit", icon: ScrollText },
];

const insightSeverityStyle: Record<AdminInsight["severity"], string> = {
  critical: "border-destructive/30 bg-destructive/5",
  warning: "border-warning/30 bg-warning/5",
  info: "border-border/50 bg-muted/30",
};
const insightIconStyle: Record<AdminInsight["severity"], string> = {
  critical: "text-destructive",
  warning: "text-warning",
  info: "text-muted-foreground",
};

export default function AdminOverviewPage() {
  const recentAudit = auditLog.slice(0, 4);
  const sub = tenantSubscription;

  return (
    <div className="space-y-6">
      {/* Tenant subscription bar */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <Building2 size={16} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Tessira Engineering</h2>
                <Badge variant="secondary" className={cn("text-[11px] uppercase",
                  sub.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : sub.status === "trial" ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                )}>{sub.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Tenant ID: tnt-eng-001</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Plan</span>
              <p className="font-medium capitalize">{sub.plan}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Seats</span>
              <p className="font-medium tabular-nums">{sub.usedSeats} / {sub.seats}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Billing</span>
              <p className="font-medium">{sub.billingOwner}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Renewal</span>
              <p className="font-medium">{new Date(sub.renewalDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} detail={`${stats.activeUsers} active`} />
        <StatCard label="Linked Users" value={stats.linkedUsers} icon={Link2} detail={`${stats.totalUsers - stats.linkedUsers} unlinked`} />
        <StatCard label="Auth Providers" value={stats.authProviders} icon={ShieldCheck} detail="Active providers" />
        <StatCard label="Audit Events Today" value={stats.auditEventsToday} icon={ScrollText} detail="Logged today" />
      </div>

      {/* Insights / Signals */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-warning" />
            <h2 className="text-sm font-semibold">Insights</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((insight) => (
              <div key={insight.id} className={cn("rounded-lg border p-4 space-y-2", insightSeverityStyle[insight.severity])}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className={cn("mt-0.5 shrink-0", insightIconStyle[insight.severity])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                  </div>
                </div>
                {insight.action && insight.actionLink && (
                  <Link to={insight.actionLink}>
                    <Button variant="outline" size="sm" className="h-7 text-xs mt-1">{insight.action}</Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
