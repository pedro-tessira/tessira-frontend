import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "./AvatarInitials";
import { StatusBadge } from "./StatusBadge";
import { Link } from "react-router-dom";
import {
  Mail, MapPin, Clock, Calendar, Users2, Shield, ExternalLink, Grid3X3, ShieldOff,
} from "lucide-react";
import { getEmployee, getEmployeeMemberships, getNotesForEmployee } from "../data";

interface EmployeeDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
  boxLabel?: string;
}

function getTenure(startDate: string) {
  const start = new Date(startDate);
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  if (totalMonths >= 12) return `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`;
  return `${totalMonths}m`;
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={14} className="text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function EmployeeDetailPanel({ open, onOpenChange, employeeId, boxLabel }: EmployeeDetailPanelProps) {
  if (!employeeId) return null;

  const employee = getEmployee(employeeId);
  if (!employee) return null;

  const memberships = getEmployeeMemberships(employeeId);
  const notes = getNotesForEmployee(employeeId);
  const tenure = getTenure(employee.startDate);
  const positiveNotes = notes.filter((n) => n.polarity === "positive").length;
  const negativeNotes = notes.filter((n) => n.polarity === "negative").length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-3">
            <AvatarInitials firstName={employee.firstName} lastName={employee.lastName} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span>{employee.firstName} {employee.lastName}</span>
                <StatusBadge status={employee.status} />
              </div>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">{employee.title}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-5">
          {/* Contact & Location */}
          <div className="space-y-3">
            <DetailRow icon={Mail} label="Email" value={employee.email} />
            <DetailRow icon={MapPin} label="Location" value={`${employee.country} (${employee.countryCode})`} />
            <DetailRow icon={Clock} label="Timezone" value={employee.timezone} />
            <DetailRow icon={Calendar} label="Joined" value={`${employee.startDate} · ${tenure}`} />
            <DetailRow icon={Users2} label="Department" value={employee.department} />
          </div>

          {/* 9-Box Placement */}
          {boxLabel && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                9-Box Placement
              </span>
              <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                <Grid3X3 size={14} className="text-primary shrink-0" />
                <span className="text-sm font-semibold text-primary">{boxLabel}</span>
              </div>
            </div>
          )}

          {/* Reporting */}
          {employee.managerName && employee.managerId && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Reports to
              </span>
              <div className="flex items-center gap-2 rounded-md border border-border/30 bg-muted/30 px-3 py-2">
                <Shield size={14} className="text-primary shrink-0" />
                <span className="text-sm font-medium">{employee.managerName}</span>
              </div>
            </div>
          )}

          {/* Teams */}
          {memberships.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Teams ({memberships.length})
              </span>
              <div className="space-y-1.5">
                {memberships.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-md border border-border/30 bg-muted/30 px-3 py-2"
                  >
                    <span className="text-xs font-medium">{m.team.name}</span>
                    <Badge variant="secondary" className="text-[10px] capitalize">{m.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence summary */}
          {notes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Notes & Evidence
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border border-border/30 bg-muted/30 px-3 py-2 text-center">
                  <div className="text-lg font-bold">{notes.length}</div>
                  <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
                <div className="rounded-md border border-border/30 bg-muted/30 px-3 py-2 text-center">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{positiveNotes}</div>
                  <div className="text-[10px] text-muted-foreground">Positive</div>
                </div>
                <div className="rounded-md border border-border/30 bg-muted/30 px-3 py-2 text-center">
                  <div className="text-lg font-bold text-destructive">{negativeNotes}</div>
                  <div className="text-[10px] text-muted-foreground">Concerns</div>
                </div>
              </div>
            </div>
          )}

          {/* Full profile link */}
          <Link
            to={`/app/people/employees/${employee.id}`}
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <ExternalLink size={13} />
            View Full Profile
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
