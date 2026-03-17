import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminUser, AdminUserRole } from "../types";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (user: AdminUser) => void;
}

export function CreateUserDialog({ open, onOpenChange, onCreate }: CreateUserDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUserRole>("member");

  const handleCreate = () => {
    if (!displayName.trim() || !email.trim()) return;
    onCreate({
      id: `u-${Date.now()}`,
      email: email.trim(),
      displayName: displayName.trim(),
      role,
      status: "invited",
      authProvider: "email",
      linkedEmployeeId: null,
      linkedEmployeeName: null,
      lastLogin: null,
      lastActivity: null,
      createdAt: new Date().toISOString().split("T")[0],
    });
    setDisplayName("");
    setEmail("");
    setRole("member");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Create User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Full Name</Label>
            <Input placeholder="John Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input placeholder="john@tessira.io" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminUserRole)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleCreate} disabled={!displayName.trim() || !email.trim()}>Create User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
