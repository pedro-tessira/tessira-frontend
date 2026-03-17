import { useState, useEffect } from "react";
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
import type { Team } from "../types";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
}

export default function EditTeamDialog({ open, onOpenChange, team }: Props) {
  const { updateTeam, employees } = usePeopleStore();
  const [form, setForm] = useState({
    name: "", description: "", leadId: "", tags: "",
  });

  useEffect(() => {
    if (team) {
      setForm({
        name: team.name, description: team.description,
        leadId: team.leadId, tags: team.tags.join(", "),
      });
    }
  }, [team]);

  if (!team) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeam(team.id, {
      name: form.name,
      description: form.description,
      leadId: form.leadId,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    const name = form.name;
    onOpenChange(false);
    setTimeout(() => toast({ title: "Team updated", description: `${name} has been updated.` }), 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Team Name</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Team Lead</Label>
            <Select value={form.leadId} onValueChange={(v) => setForm((p) => ({ ...p, leadId: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tags (comma-separated)</Label>
            <Input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
