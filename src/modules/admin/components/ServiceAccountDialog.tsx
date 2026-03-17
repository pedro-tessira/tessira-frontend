import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceAccount } from "../types";

interface CreateServiceAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (account: ServiceAccount) => void;
}

export function CreateServiceAccountDialog({ open, onOpenChange, onCreate }: CreateServiceAccountDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({
      id: `sa-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      lastUsed: null,
      createdAt: new Date().toISOString(),
      createdBy: "Current User",
      status: "active",
      scopes: ["user.view", "audit.view"],
    });
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Create Service Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Name</Label>
            <Input placeholder="e.g. CI/CD Pipeline" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Textarea placeholder="What is this account used for?" value={description} onChange={(e) => setDescription(e.target.value)} className="text-sm min-h-[60px]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
