import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { usePeopleStore } from "../contexts/PeopleStoreContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTeamDialog({ open, onOpenChange }: Props) {
  const { addTeam, employees } = usePeopleStore();
  const [form, setForm] = useState({
    name: "", description: "", leadId: "", tags: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.leadId) return;
    addTeam({
      name: form.name,
      description: form.description,
      leadId: form.leadId,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    toast({ title: "Team created", description: `${form.name} has been created.` });
    setForm({ name: "", description: "", leadId: "", tags: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Team Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Team Lead *</Label>
            <Select value={form.leadId} onValueChange={(v) => setForm((p) => ({ ...p, leadId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select lead…" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tags (comma-separated)</Label>
            <Input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="e.g. backend, critical-path" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!form.name || !form.leadId}>Create Team</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
