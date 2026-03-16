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
import { Rocket } from "lucide-react";
import { toast } from "sonner";
import type { Domain, ValueStream, Initiative, InitiativeStatus } from "../types";
import MultiSelectDropdown from "./MultiSelectDropdown";

interface Props {
  initiative: Initiative;
  domains: Domain[];
  valueStreams: ValueStream[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Initiative) => void;
}

export default function EditInitiativeDialog({ initiative, domains, valueStreams, open, onOpenChange, onSave }: Props) {
  const [name, setName] = useState(initiative.name);
  const [description, setDescription] = useState(initiative.description);
  const [status, setStatus] = useState<InitiativeStatus>(initiative.status);
  const [startDate, setStartDate] = useState(initiative.startDate);
  const [endDate, setEndDate] = useState(initiative.endDate);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(initiative.domainIds);
  const [selectedVS, setSelectedVS] = useState<string[]>(initiative.valueStreamIds);

  const domainOptions = domains.map((d) => ({ value: d.id, label: d.name }));
  const vsOptions = valueStreams.map((vs) => ({ value: vs.id, label: vs.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || selectedDomains.length === 0) return;
    onSave({
      ...initiative,
      name: name.trim(),
      description: description.trim(),
      status,
      startDate,
      endDate,
      domainIds: selectedDomains,
      valueStreamIds: selectedVS,
    });
    toast.success(`Initiative "${name.trim()}" updated`);
    onOpenChange(false);
  };

  const isValid = name.trim() && startDate && endDate && selectedDomains.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket size={18} className="text-primary" />
            Edit Initiative
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-init-name">Name</Label>
            <Input id="edit-init-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-init-desc">Description</Label>
            <Textarea id="edit-init-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as InitiativeStatus)}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Domains <span className="text-destructive">*</span></Label>
            <MultiSelectDropdown options={domainOptions} selected={selectedDomains} onChange={setSelectedDomains} placeholder="Select domains..." />
          </div>
          <div className="space-y-2">
            <Label>Value Streams</Label>
            <MultiSelectDropdown options={vsOptions} selected={selectedVS} onChange={setSelectedVS} placeholder="Select value streams..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!isValid}>Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
