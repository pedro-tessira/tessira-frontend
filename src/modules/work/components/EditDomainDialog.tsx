import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Boxes } from "lucide-react";
import { toast } from "sonner";
import type { Domain } from "../types";
import { horizonTeams } from "@/modules/horizon/data";

interface Props {
  domain: Domain;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Domain) => void;
}

export default function EditDomainDialog({ domain, open, onOpenChange, onSave }: Props) {
  const [name, setName] = useState(domain.name);
  const [description, setDescription] = useState(domain.description);
  const [teamId, setTeamId] = useState(domain.owningTeamId);

  const teams = horizonTeams.filter((t) => t.id !== "all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teamId) return;
    const team = teams.find((t) => t.id === teamId)!;
    onSave({ ...domain, name: name.trim(), description: description.trim(), owningTeamId: teamId, owningTeamName: team.name });
    toast.success(`Domain "${name.trim()}" updated`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Boxes size={18} className="text-primary" />
            Edit Domain
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-dom-name">Name</Label>
            <Input id="edit-dom-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dom-desc">Description</Label>
            <Textarea id="edit-dom-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Owning Team</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!name.trim() || !teamId}>Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
