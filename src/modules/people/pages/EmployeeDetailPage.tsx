import { useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail, MapPin, Clock, Calendar, Users2, Shield, Zap, Activity, Pencil, Trash2, ShieldOff,
} from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { AvatarInitials } from "../components/AvatarInitials";
import { FollowUpNotes } from "../components/FollowUpNotes";
import { Button } from "@/components/ui/button";
import { usePeopleStore } from "../contexts/PeopleStoreContext";
import EditEmployeeDialog from "../components/EditEmployeeDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";

export default function EmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get("from");
  const { getEmployee, getEmployeeMemberships, deleteEmployee } = usePeopleStore();
  const employee = getEmployee(employeeId ?? "");
  const memberships = employeeId ? getEmployeeMemberships(employeeId) : [];
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!employee) {
    return (
      <div className="space-y-6">
        <ModulePageHeader
          title="Employee Not Found"
          breadcrumbs={[
            { label: "People", href: "/app/people" },
            { label: "Employees", href: "/app/people/employees" },
            { label: "Not Found" },
          ]}
        />
        <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">This employee could not be found.</p>
          <Link to="/app/people/employees" className="mt-3 inline-block text-sm text-primary hover:underline">
            Back to employee list
          </Link>
        </div>
      </div>
    );
  }

  const tenure = (() => {
    const start = new Date(employee.startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;
    if (totalMonths >= 12) return `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`;
    return `${totalMonths}m`;
  })();

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        breadcrumbs={fromParam ? [
          { label: "Back", href: fromParam },
          { label: `${employee.firstName} ${employee.lastName}` },
        ] : [
          { label: "People", href: "/app/people" },
          { label: "Employees", href: "/app/people/employees" },
          { label: `${employee.firstName} ${employee.lastName}` },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setEditOpen(true)}>
              <Pencil size={13} /> Edit
            </Button>
            <Button
              variant="outline" size="sm"
              className="gap-1.5 h-8 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={13} /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="rounded-lg border border-border/50 bg-card p-6">
            <div className="flex items-start gap-4">
              <AvatarInitials firstName={employee.firstName} lastName={employee.lastName} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg font-semibold">{employee.firstName} {employee.lastName}</h2>
                  <StatusBadge status={employee.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{employee.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{employee.department}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-border/50 pt-5">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-muted-foreground/60 shrink-0" />
                <span className="text-muted-foreground truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-muted-foreground/60 shrink-0" />
                <span className="text-muted-foreground">{employee.country}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-muted-foreground/60 shrink-0" />
                <span className="text-muted-foreground">{employee.timezone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-muted-foreground/60 shrink-0" />
                <span className="text-muted-foreground">Joined {employee.startDate} · {tenure}</span>
              </div>
            </div>
          </div>

          {/* Team Memberships */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="border-b border-border/50 px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Team Memberships</h3>
              <span className="text-xs text-muted-foreground">{memberships.length} teams</span>
            </div>
            {memberships.length > 0 ? (
              <div className="divide-y divide-border/50">
                {memberships.map((m) => (
                  <Link
                    key={m.id}
                    to={`/app/people/teams/${m.teamId}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-accent/20 tessira-transition"
                  >
                    <div>
                      <div className="text-sm font-medium">{m.team.name}</div>
                      <div className="text-xs text-muted-foreground">Since {m.since}</div>
                    </div>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground capitalize">
                      {m.role}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">No team memberships found.</div>
            )}
          </div>

          {/* Follow-up Notes */}
          <FollowUpNotes employeeId={employeeId!} />

          {/* Future integrations placeholder */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-dashed border-border/50 bg-card/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-muted-foreground/40" />
                <span className="text-xs font-medium text-muted-foreground">Skills Coverage</span>
              </div>
              <p className="text-xs text-muted-foreground/60">
                Skill mapping and coverage data will appear here when the Skills module is connected.
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-border/50 bg-card/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-muted-foreground/40" />
                <span className="text-xs font-medium text-muted-foreground">Signals</span>
              </div>
              <p className="text-xs text-muted-foreground/60">
                Individual health signals and engagement indicators will appear here when available.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reporting Context</h3>
            {employee.managerName && employee.managerId ? (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Reports to</div>
                <Link
                  to={`/app/people/employees/${employee.managerId}`}
                  className="flex items-center gap-2 rounded-md p-2 -mx-2 hover:bg-accent/30 tessira-transition"
                >
                  <Shield size={14} className="text-primary shrink-0" />
                  <span className="text-sm font-medium text-primary">{employee.managerName}</span>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No reporting manager — top-level leadership.</p>
            )}
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Organization</h3>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground">Department</div>
                <div className="text-sm font-medium">{employee.department}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Country</div>
                <div className="text-sm font-medium">{employee.country} ({employee.countryCode})</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Timezone</div>
                <div className="text-sm font-medium">{employee.timezone}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Employee ID</div>
                <div className="text-sm font-mono text-muted-foreground">{employee.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditEmployeeDialog open={editOpen} onOpenChange={setEditOpen} employee={employee} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Employee"
        description={`Are you sure you want to remove ${employee.firstName} ${employee.lastName}? This will also remove all their team memberships.`}
        onConfirm={() => {
          const name = `${employee.firstName} ${employee.lastName}`;
          deleteEmployee(employee.id);
          navigate("/app/people/employees");
          setTimeout(() => toast({ title: "Employee deleted", description: `${name} has been removed.` }), 150);
        }}
      />
    </div>
  );
}
