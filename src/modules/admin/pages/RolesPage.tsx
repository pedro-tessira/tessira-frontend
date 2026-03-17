import { useState } from "react";
import { customRoles as initialRoles, PERMISSIONS, adminUsers } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserCheck, Plus, Users, Lock, Shield } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CreateRoleDialog } from "../components/CreateRoleDialog";
import { toast } from "sonner";
import type { CustomRole } from "../types";

export default function RolesPage() {
  const [roles, setRoles] = useState<CustomRole[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);

  const domains = Array.from(new Set(PERMISSIONS.map((p) => p.domain)));

  // Get users for the selected role
  const roleUsers = selectedRole
    ? adminUsers.filter((u) => u.customRoles?.includes(selectedRole.name))
    : [];

  const handleCreateRole = (role: CustomRole) => {
    setRoles((prev) => [...prev, role]);
    toast.success(`Role "${role.name}" created`);
  };

  const handleTogglePermission = (permKey: string) => {
    if (!selectedRole || selectedRole.isSystem) return;
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole.id) return r;
        const perms = r.permissions.includes(permKey)
          ? r.permissions.filter((k) => k !== permKey)
          : [...r.permissions, permKey];
        const updated = { ...r, permissions: perms };
        setSelectedRole(updated);
        return updated;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <UserCheck size={15} strokeWidth={1.8} className="text-primary" />
            Custom Roles & Permissions
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Define granular access control per tenant. Assign roles to users for least-privilege access.</p>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowCreateRole(true)}>
          <Plus size={13} /> Create Role
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Roles list */}
        <div className="space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={cn(
                "w-full text-left rounded-lg border p-3.5 tessira-transition",
                selectedRole?.id === role.id
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-card hover:bg-accent/30"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {role.isSystem ? <Lock size={12} className="text-muted-foreground" /> : <Shield size={12} className="text-primary" />}
                  <span className="text-sm font-medium font-mono">{role.name}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  <Users size={10} className="mr-1" />{role.userCount}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
              {role.isSystem && (
                <Badge variant="secondary" className="text-[10px] mt-2 bg-muted text-muted-foreground">System</Badge>
              )}
            </button>
          ))}
        </div>

        {/* Permission editor */}
        {selectedRole ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-border/50 bg-card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold font-mono">{selectedRole.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedRole.description}</p>
                </div>
                {!selectedRole.isSystem && (
                  <Button variant="outline" size="sm" className="h-8 text-xs">Edit Role</Button>
                )}
              </div>

              <div className="space-y-4">
                {domains.map((domain) => {
                  const domainPermissions = PERMISSIONS.filter((p) => p.domain === domain);
                  const allEnabled = domainPermissions.every((p) => selectedRole.permissions.includes(p.key));
                  return (
                    <div key={domain}>
                      <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border/30">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{domain}</span>
                        {allEnabled && (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">All</Badge>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {domainPermissions.map((perm) => {
                          const enabled = selectedRole.permissions.includes(perm.key);
                          return (
                            <div key={perm.key} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-accent/30">
                              <div className="flex items-center gap-2">
                                <code className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{perm.key}</code>
                                <span className="text-xs">{perm.label}</span>
                              </div>
                              <Switch
                                checked={enabled}
                                disabled={selectedRole.isSystem}
                                onCheckedChange={() => handleTogglePermission(perm.key)}
                                className="scale-75"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedRole.isSystem && (
                <p className="text-xs text-muted-foreground border-t border-border/30 pt-3">
                  System roles cannot be modified. Create a custom role to adjust permissions.
                </p>
              )}
            </div>

            {/* Users in this role */}
            <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Users size={14} className="text-muted-foreground" />
                Users with this role ({roleUsers.length})
              </h3>
              {roleUsers.length > 0 ? (
                <div className="space-y-2">
                  {roleUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {u.displayName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.displayName}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{u.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No users are currently assigned to this role.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 bg-card flex items-center justify-center p-12">
            <div className="text-center">
              <Shield size={32} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Select a role to view and edit permissions</p>
            </div>
          </div>
        )}
      </div>

      <CreateRoleDialog open={showCreateRole} onOpenChange={setShowCreateRole} onCreate={handleCreateRole} />
    </div>
  );
}
