import { Link } from "react-router-dom";
import { Users2, UserCheck, Globe, Clock, ArrowRight, UserX, ShieldOff } from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { AvatarInitials } from "../components/AvatarInitials";
import { usePeopleStore } from "../contexts/PeopleStoreContext";

export default function PeopleOverviewPage() {
  const { employees, teams } = usePeopleStore();

  const active = employees.filter((e) => e.status === "active").length;
  const capacityEligible = employees.filter((e) => !e.excludeFromCapacity && e.status !== "inactive").length;
  const nonCapacity = employees.filter((e) => e.excludeFromCapacity).length;
  const onLeave = employees.filter((e) => e.status === "on_leave");
  const offboarding = employees.filter((e) => e.status === "offboarding");
  const countries = new Set(employees.map((e) => e.countryCode)).size;
  const recentEmployees = employees.slice(0, 5);

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title="People"
        description="Team directory, capacity context, and organizational visibility."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Employees" value={employees.length} icon={Users2} detail={`${active} active`} />
        <StatCard label="Capacity Eligible" value={capacityEligible} icon={UserCheck} detail="Available for initiatives" />
        <StatCard label="Non-Capacity" value={nonCapacity} icon={ShieldOff} detail="Management / excluded" />
        <StatCard label="Countries" value={countries} icon={Globe} detail="Distributed workforce" />
        <StatCard label="On Leave" value={onLeave.length} icon={Clock} detail="Currently unavailable" />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          to="/app/people/employees"
          className="group rounded-lg border border-border/50 bg-card p-5 hover:border-primary/20 tessira-transition flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm font-semibold">Employee Directory</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Browse, search, and filter all {employees.length} employees across the organization.
            </p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary tessira-transition shrink-0 ml-4" />
        </Link>
        <Link
          to="/app/people/teams"
          className="group rounded-lg border border-border/50 bg-card p-5 hover:border-primary/20 tessira-transition flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm font-semibold">Team Structure</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              View {teams.length} teams, their leads, membership, and organizational context.
            </p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary tessira-transition shrink-0 ml-4" />
        </Link>
        <Link
          to="/app/people/9-box"
          className="group rounded-lg border border-border/50 bg-card p-5 hover:border-primary/20 tessira-transition flex items-center justify-between lg:col-span-2"
        >
          <div>
            <h3 className="text-sm font-semibold">9-Box</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Performance–potential positioning for succession planning and leadership visibility.
            </p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary tessira-transition shrink-0 ml-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent employees */}
        <div className="lg:col-span-2 rounded-lg border border-border/50 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Recent Employees</h3>
            <Link to="/app/people/employees" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentEmployees.map((emp) => (
              <Link
                key={emp.id}
                to={`/app/people/employees/${emp.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 tessira-transition"
              >
                <AvatarInitials firstName={emp.firstName} lastName={emp.lastName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{emp.firstName} {emp.lastName}</div>
                  <div className="text-xs text-muted-foreground truncate">{emp.title}</div>
                </div>
                <StatusBadge status={emp.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Attention needed */}
        <div className="rounded-lg border border-border/50 bg-card">
          <div className="border-b border-border/50 px-5 py-3">
            <h3 className="text-sm font-semibold">Attention Needed</h3>
          </div>
          <div className="p-5 space-y-4">
            {onLeave.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={13} className="text-warning" />
                  <span className="text-xs font-medium">On Leave ({onLeave.length})</span>
                </div>
                {onLeave.map((emp) => (
                  <Link key={emp.id} to={`/app/people/employees/${emp.id}`} className="block text-xs text-muted-foreground hover:text-foreground py-1">
                    {emp.firstName} {emp.lastName} · {emp.title}
                  </Link>
                ))}
              </div>
            )}
            {offboarding.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserX size={13} className="text-destructive" />
                  <span className="text-xs font-medium">Offboarding ({offboarding.length})</span>
                </div>
                {offboarding.map((emp) => (
                  <Link key={emp.id} to={`/app/people/employees/${emp.id}`} className="block text-xs text-muted-foreground hover:text-foreground py-1">
                    {emp.firstName} {emp.lastName} · {emp.title}
                  </Link>
                ))}
              </div>
            )}
            {onLeave.length === 0 && offboarding.length === 0 && (
              <p className="text-xs text-muted-foreground">No items requiring attention.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
