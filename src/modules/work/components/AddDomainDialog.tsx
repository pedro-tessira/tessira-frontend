import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Boxes } from "lucide-react";
import { toast } from "sonner";
import { horizonTeams } from "@/modules/horizon/data";

interface Props {
  onAdd: (domain: { name: string; description: string; owningTeamId: string; owningTeamName: string }) => void;
}

export default function AddDomainDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");

  const teams = horizonTeams.filter((t) => t.id !== "all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teamId) return;
    const team = teams.find((t) => t.id === teamId)!;
    onAdd({
      name: name.trim(),
      description: description.trim(),
      owningTeamId: teamId,
      owningTeamName: team.name,
    });
    toast.success(`Domain "${name.trim()}" created`);
    setName("");
    setDescription("");
    setTeamId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus size={14} /> Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Boxes size={18} className="text-primary" />
            New Domain
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="dom-name">Name</Label>
            <Input
              id="dom-name"
              placeholder="e.g. Auth Platform, Payments Platform"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dom-desc">Description</Label>
            <Textarea
              id="dom-desc"
              placeholder="What engineering area does this domain represent?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Owning Team</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select owning team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!name.trim() || !teamId}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
