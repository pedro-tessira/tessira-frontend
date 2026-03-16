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
import { Badge } from "@/components/ui/badge";
import { Plus, Rocket, X } from "lucide-react";
import { toast } from "sonner";
import type { Domain, ValueStream, InitiativeStatus } from "../types";

interface Props {
  domains: Domain[];
  valueStreams: ValueStream[];
  onAdd: (init: {
    name: string;
    description: string;
    status: InitiativeStatus;
    startDate: string;
    endDate: string;
    domainIds: string[];
    valueStreamIds: string[];
  }) => void;
}

export default function AddInitiativeDialog({ domains, valueStreams, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<InitiativeStatus>("planned");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedVS, setSelectedVS] = useState<string[]>([]);

  const toggleDomain = (id: string) => {
    setSelectedDomains((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleVS = (id: string) => {
    setSelectedVS((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || selectedDomains.length === 0) return;
    onAdd({
      name: name.trim(),
      description: description.trim(),
      status,
      startDate,
      endDate,
      domainIds: selectedDomains,
      valueStreamIds: selectedVS,
    });
    toast.success(`Initiative "${name.trim()}" created`);
    setName("");
    setDescription("");
    setStatus("planned");
    setStartDate("");
    setEndDate("");
    setSelectedDomains([]);
    setSelectedVS([]);
    setOpen(false);
  };

  const isValid = name.trim() && startDate && endDate && selectedDomains.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus size={14} /> Add Initiative
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket size={18} className="text-primary" />
            New Initiative
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="init-name">Name</Label>
            <Input
              id="init-name"
              placeholder="e.g. Auth Refactor, Stripe Migration"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="init-desc">Description</Label>
            <Textarea
              id="init-desc"
              placeholder="What is this initiative about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="init-start">Start Date</Label>
              <Input
                id="init-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="init-end">End Date</Label>
              <Input
                id="init-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as InitiativeStatus)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Domains <span className="text-destructive">*</span></Label>
            <div className="flex flex-wrap gap-1.5">
              {domains.map((d) => (
                <Badge
                  key={d.id}
                  variant={selectedDomains.includes(d.id) ? "default" : "outline"}
                  className="cursor-pointer text-xs gap-1"
                  onClick={() => toggleDomain(d.id)}
                >
                  {d.name}
                  {selectedDomains.includes(d.id) && <X size={10} />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Value Streams</Label>
            <div className="flex flex-wrap gap-1.5">
              {valueStreams.map((vs) => (
                <Badge
                  key={vs.id}
                  variant={selectedVS.includes(vs.id) ? "default" : "outline"}
                  className="cursor-pointer text-xs gap-1"
                  onClick={() => toggleVS(vs.id)}
                >
                  {vs.name}
                  {selectedVS.includes(vs.id) && <X size={10} />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!isValid}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
