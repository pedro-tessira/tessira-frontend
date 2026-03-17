import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminUsers, customRoles as initialRoles } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail, KeyRound, Ban, Trash2, ArrowRightLeft, Shield, Link2, Clock, Monitor, Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import type { AdminUserStatus, AdminUserRole } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const statusStyle: Record<AdminUserStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  invited: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  suspended: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  deactivated: "bg-muted text-muted-foreground",
};

const roleStyle: Record<AdminUserRole, string> = {
  owner: "bg-primary/15 text-primary",
  admin: "bg-primary/10 text-primary/80",
  member: "bg-muted text-muted-foreground",
  viewer: "bg-muted text-muted-foreground",
};

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = adminUsers.find((u) => u.id === userId);

  const [assignedRoles, setAssignedRoles] = useState<string[]>(user?.customRoles ?? []);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [pendingSelections, setPendingSelections] = useState<string[]>([]);

  const availableRoles = initialRoles;
  const unassignedRoles = availableRoles.filter((r) => !assignedRoles.includes(r.name));

  const openAssignDialog = () => {
    setPendingSelections([]);
    setShowAssignDialog(true);
  };

  const handleAssign = () => {
    setAssignedRoles((prev) => [...prev, ...pendingSelections]);
    toast.success(`${pendingSelections.length} role(s) assigned`);
    setShowAssignDialog(false);
  };

  const handleUnassign = (roleName: string) => {
    setAssignedRoles((prev) => prev.filter((r) => r !== roleName));
    toast.success(`Role "${roleName}" unassigned`);
  };

  const togglePending = (roleName: string) => {
    setPendingSelections((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    );
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => navigate("/app/admin/users")}>
          <ArrowLeft size={14} /> Back to Users
        </Button>
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">User not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => navigate("/app/admin/users")}>
        <ArrowLeft size={14} /> Back to Users
      </Button>

      {/* Header */}
      <div className="rounded-lg border border-border/50 bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {user.displayName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user.displayName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className={cn("text-[11px]", roleStyle[user.role])}>{user.role}</Badge>
                <Badge variant="secondary" className={cn("text-[11px]", statusStyle[user.status])}>{user.status}</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Mail size={12} /> Resend Invite</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><KeyRound size={12} /> Reset Password</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Ban size={12} /> Suspend</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><ArrowRightLeft size={12} /> Transfer Ownership</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive"><Trash2 size={12} /> Deactivate</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Details */}
        <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Account Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Shield size={12} /> Auth Provider</span>
              <span className="capitalize">{user.authProvider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={12} /> Created</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Monitor size={12} /> Last Login</span>
              <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={12} /> Last Activity</span>
              <span>{user.lastActivity ? new Date(user.lastActivity).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}</span>
            </div>
          </div>
        </div>

        {/* Linked Employee */}
        <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Employee Link</h3>
          {user.linkedEmployeeName ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Link2 size={12} /> Linked To</span>
                <span className="font-medium">{user.linkedEmployeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee ID</span>
                <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{user.linkedEmployeeId}</code>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Link2 size={24} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No linked employee record</p>
              <Button variant="outline" size="sm" className="h-7 text-xs mt-2" onClick={() => navigate("/app/admin/linking")}>Link Employee</Button>
            </div>
          )}
        </div>

        {/* Assigned Roles */}
        <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              Assigned Roles ({assignedRoles.length})
            </h3>
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={openAssignDialog}
              disabled={unassignedRoles.length === 0}
            >
              <Plus size={12} /> Assign Role
            </Button>
          </div>

          {assignedRoles.length > 0 ? (
            <div className="space-y-2">
              {assignedRoles.map((roleName) => {
                const role = availableRoles.find((r) => r.name === roleName);
                return (
                  <div key={roleName} className="flex items-center justify-between py-2.5 px-3 rounded-md bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-3">
                      <Shield size={14} className="text-primary/70" />
                      <div>
                        <p className="text-sm font-medium font-mono">{roleName}</p>
                        {role && <p className="text-[11px] text-muted-foreground">{role.description}</p>}
                      </div>
                      {role?.isSystem && (
                        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">System</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleUnassign(roleName)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Shield size={28} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No roles assigned to this user.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assign Role Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Assign Roles to {user.displayName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto py-2">
            {unassignedRoles.length > 0 ? (
              unassignedRoles.map((role) => (
                <label
                  key={role.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                    pendingSelections.includes(role.name)
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:bg-accent/30"
                  )}
                >
                  <Checkbox
                    checked={pendingSelections.includes(role.name)}
                    onCheckedChange={() => togglePending(role.name)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-mono">{role.name}</p>
                    <p className="text-[11px] text-muted-foreground">{role.description}</p>
                  </div>
                  {role.isSystem && (
                    <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground shrink-0">System</Badge>
                  )}
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">All roles are already assigned.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button size="sm" className="h-8 text-xs" disabled={pendingSelections.length === 0} onClick={handleAssign}>
              Assign {pendingSelections.length > 0 ? `(${pendingSelections.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
