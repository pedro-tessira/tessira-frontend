import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AuthProvider, AuthProviderType, AuthProviderStatus } from "../types";

interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (provider: AuthProvider) => void;
}

export function AddProviderDialog({ open, onOpenChange, onAdd }: AddProviderDialogProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<AuthProviderType>("email");

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd({
      id: `ap-${Date.now()}`,
      type,
      label: label.trim(),
      status: "configuring",
      usersCount: 0,
      lastSync: null,
    });
    setLabel("");
    setType("email");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Add Identity Provider</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Provider Name</Label>
            <Input placeholder="e.g. Okta SAML" value={label} onChange={(e) => setLabel(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AuthProviderType)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email & Password</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="microsoft">Microsoft</SelectItem>
                <SelectItem value="saml">SAML</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleAdd} disabled={!label.trim()}>Add Provider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: AuthProvider | null;
  onSave: (provider: AuthProvider) => void;
}

export function EditProviderDialog({ open, onOpenChange, provider, onSave }: EditProviderDialogProps) {
  const [label, setLabel] = useState(provider?.label ?? "");
  const [status, setStatus] = useState<AuthProviderStatus>(provider?.status ?? "active");

  // Sync state when provider changes
  const currentLabel = provider ? label || provider.label : "";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setLabel(""); setStatus("active"); } onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Provider</DialogTitle>
        </DialogHeader>
        {provider && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Provider Name</Label>
              <Input value={currentLabel} onChange={(e) => setLabel(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AuthProviderStatus)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="configuring">Configuring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={() => { if (provider) onSave({ ...provider, label: currentLabel, status }); onOpenChange(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: AuthProvider | null;
  onDelete: (id: string) => void;
}

export function DeleteProviderDialog({ open, onOpenChange, provider, onDelete }: DeleteProviderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Remove Provider</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to remove <strong>{provider?.label}</strong>? {provider && provider.usersCount > 0 && `${provider.usersCount} users are currently using this provider.`}
        </p>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={() => { if (provider) onDelete(provider.id); onOpenChange(false); }}>Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
