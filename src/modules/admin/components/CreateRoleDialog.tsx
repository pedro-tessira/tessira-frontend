import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PERMISSIONS } from "../data";
import type { CustomRole } from "../types";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (role: CustomRole) => void;
}

export function CreateRoleDialog({ open, onOpenChange, onCreate }: CreateRoleDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const domains = Array.from(new Set(PERMISSIONS.map((p) => p.domain)));

  const togglePerm = (key: string) => {
    setPermissions((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({
      id: `r-${Date.now()}`,
      name: name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: description.trim(),
      permissions,
      userCount: 0,
      isSystem: false,
    });
    setName("");
    setDescription("");
    setPermissions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Create Custom Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Role Name</Label>
            <Input placeholder="e.g. team-lead" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm font-mono" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Textarea placeholder="What can this role do?" value={description} onChange={(e) => setDescription(e.target.value)} className="text-sm min-h-[50px]" />
          </div>
          <div className="space-y-3">
            <Label className="text-xs">Permissions</Label>
            {domains.map((domain) => {
              const domainPerms = PERMISSIONS.filter((p) => p.domain === domain);
              return (
                <div key={domain}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{domain}</span>
                  <div className="space-y-1 mt-1">
                    {domainPerms.map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-accent/30">
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{perm.key}</code>
                          <span className="text-xs">{perm.label}</span>
                        </div>
                        <Switch checked={permissions.includes(perm.key)} onCheckedChange={() => togglePerm(perm.key)} className="scale-75" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>Create Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
