import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminUsers, customRoles as initialRoles, auditLog } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Mail, KeyRound, Ban, Trash2, ArrowRightLeft, Shield, Link2,
  Clock, Monitor, Plus, X, Pencil, Check, CircleAlert, CheckCircle2,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { AdminUserStatus, AdminUserRole, AdminUser } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

const ALL_STATUSES: AdminUserStatus[] = ["active", "invited", "suspended", "deactivated"];
const ALL_ROLES: AdminUserRole[] = ["owner", "admin", "member", "viewer"];

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const originalUser = adminUsers.find((u) => u.id === userId);

  // Editable user state
  const [userData, setUserData] = useState<AdminUser | null>(originalUser ? { ...originalUser } : null);
  const [assignedRoles, setAssignedRoles] = useState<string[]>(originalUser?.customRoles ?? []);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [pendingSelections, setPendingSelections] = useState<string[]>([]);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", email: "" });

  // Confirm dialogs
  const [confirmAction, setConfirmAction] = useState<AdminUserStatus | null>(null);

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

  // Edit user
  const startEditing = () => {
    if (!userData) return;
    setEditForm({ displayName: userData.displayName, email: userData.email });
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const saveEditing = () => {
    if (!userData) return;
    setUserData({ ...userData, displayName: editForm.displayName, email: editForm.email });
    setIsEditing(false);
    toast.success("User profile updated");
  };

  // Inline status change
  const handleStatusChange = (newStatus: AdminUserStatus) => {
    if (!userData) return;
    if (newStatus === "suspended" || newStatus === "deactivated") {
      setConfirmAction(newStatus);
      return;
    }
    applyStatusChange(newStatus);
  };

  const applyStatusChange = (newStatus: AdminUserStatus) => {
    if (!userData) return;
    const prev = userData.status;
    setUserData({ ...userData, status: newStatus });
    toast.success(`Status changed from "${prev}" to "${newStatus}"`);
    setConfirmAction(null);
  };

  // Inline role change
  const handleBaseRoleChange = (newRole: AdminUserRole) => {
    if (!userData) return;
    setUserData({ ...userData, role: newRole });
    toast.success(`Base role changed to "${newRole}"`);
  };

  // Quick actions
  const handleResendInvite = () => toast.success("Invite email resent");
  const handleResetPassword = () => toast.success("Password reset email sent");

  if (!userData) {
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
              {userData.displayName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editForm.displayName}
                    onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                    className="h-8 text-sm font-semibold w-56"
                    placeholder="Display name"
                  />
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="h-8 text-sm w-56"
                    placeholder="Email"
                  />
                  <div className="flex gap-1.5 pt-1">
                    <Button size="sm" className="h-7 text-xs gap-1" onClick={saveEditing}>
                      <Check size={12} /> Save
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={cancelEditing}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{userData.displayName}</h2>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={startEditing}>
                      <Pencil size={12} />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </>
              )}
              {!isEditing && (
                <div className="flex items-center gap-2 mt-2">
                  {/* Inline base role select */}
                  <Select value={userData.role} onValueChange={(v) => handleBaseRoleChange(v as AdminUserRole)}>
                    <SelectTrigger className={cn("h-6 w-auto gap-1 border-0 px-2 text-[11px] font-medium rounded-full", roleStyle[userData.role])}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs capitalize">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Inline status select */}
                  <Select value={userData.status} onValueChange={(v) => handleStatusChange(v as AdminUserStatus)}>
                    <SelectTrigger className={cn("h-6 w-auto gap-1 border-0 px-2 text-[11px] font-medium rounded-full", statusStyle[userData.status])}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleResendInvite}><Mail size={12} /> Resend Invite</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleResetPassword}><KeyRound size={12} /> Reset Password</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleStatusChange("suspended")}><Ban size={12} /> Suspend</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><ArrowRightLeft size={12} /> Transfer Ownership</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive" onClick={() => handleStatusChange("deactivated")}><Trash2 size={12} /> Deactivate</Button>
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
              <span className="capitalize">{userData.authProvider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={12} /> Created</span>
              <span>{new Date(userData.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Monitor size={12} /> Last Login</span>
              <span>{userData.lastLogin ? new Date(userData.lastLogin).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={12} /> Last Activity</span>
              <span>{userData.lastActivity ? new Date(userData.lastActivity).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}</span>
            </div>
          </div>
        </div>

        {/* Linked Employee */}
        <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Employee Link</h3>
          {userData.linkedEmployeeName ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Link2 size={12} /> Linked To</span>
                <span className="font-medium">{userData.linkedEmployeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee ID</span>
                <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{userData.linkedEmployeeId}</code>
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

        {/* Activity Log */}
        <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            Activity Log
          </h3>
          {(() => {
            const userActivities = auditLog
              .filter((e) => e.actor === userData.displayName || e.resource === userData.displayName)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            if (userActivities.length === 0) {
              return (
                <div className="text-center py-6">
                  <Clock size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No recorded activity for this user.</p>
                </div>
              );
            }

            const severityStyle: Record<string, string> = {
              info: "bg-muted text-muted-foreground",
              warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
              critical: "bg-destructive/15 text-destructive",
            };

            return (
              <div className="space-y-1">
                {userActivities.map((entry) => {
                  const isActor = entry.actor === userData.displayName;
                  return (
                    <div key={entry.id} className="flex items-start gap-3 py-2.5 px-3 rounded-md hover:bg-accent/30 transition-colors">
                      <div className="mt-0.5 shrink-0">
                        <div className={cn(
                          "h-2 w-2 rounded-full mt-1",
                          entry.severity === "critical" ? "bg-destructive" :
                          entry.severity === "warning" ? "bg-amber-500" : "bg-muted-foreground/40"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{entry.action}</code>
                          <Badge variant="secondary" className={cn("text-[10px]", severityStyle[entry.severity])}>{entry.severity}</Badge>
                          {!isActor && (
                            <span className="text-[10px] text-muted-foreground italic">by {entry.actor}</span>
                          )}
                        </div>
                        <p className="text-xs mt-1">
                          <span className="text-muted-foreground">{entry.resource}</span>
                          <span className="mx-1.5 text-muted-foreground/50">—</span>
                          <span>{entry.detail}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Assign Role Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Assign Roles to {userData.displayName}</DialogTitle>
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

      {/* Confirm Suspend / Deactivate Dialog */}
      <Dialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              {confirmAction === "deactivated" ? (
                <CircleAlert size={16} className="text-destructive" />
              ) : (
                <Ban size={16} className="text-primary" />
              )}
              {confirmAction === "deactivated" ? "Deactivate User" : "Suspend User"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {confirmAction === "deactivated"
                ? `This will permanently deactivate ${userData.displayName}'s account. They will lose all access.`
                : `This will suspend ${userData.displayName}'s account. They will be unable to log in until reactivated.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction === "deactivated" ? "destructive" : "default"}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => applyStatusChange(confirmAction!)}
            >
              <CheckCircle2 size={12} />
              {confirmAction === "deactivated" ? "Deactivate" : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
