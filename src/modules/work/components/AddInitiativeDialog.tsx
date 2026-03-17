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
import { Plus, Rocket, X } from "lucide-react";
import { toast } from "sonner";
import type { Domain, ValueStream, InitiativeStatus, ConfidenceLevel, RoleEffort, Initiative } from "../types";
import MultiSelectDropdown from "./MultiSelectDropdown";

interface Props {
  domains: Domain[];
  valueStreams: ValueStream[];
  onAdd: (init: Omit<Initiative, "id">) => void;
}

const ROLE_OPTIONS = ["Backend", "Frontend", "Data", "DevOps", "Mobile", "QA", "Design"];

export default function AddInitiativeDialog({ domains, valueStreams, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<InitiativeStatus>("planned");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedVS, setSelectedVS] = useState<string[]>([]);
  // HLE fields
  const [totalEffort, setTotalEffort] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceLevel>("medium");
  const [drivers, setDrivers] = useState("");
  const [roleBreakdown, setRoleBreakdown] = useState<RoleEffort[]>([{ role: "Backend", days: 0 }]);

  const addRole = () => setRoleBreakdown((prev) => [...prev, { role: "Frontend", days: 0 }]);
  const removeRole = (i: number) => setRoleBreakdown((prev) => prev.filter((_, idx) => idx !== i));
  const updateRole = (i: number, field: "role" | "days", value: string | number) =>
    setRoleBreakdown((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || selectedDomains.length === 0 || !totalEffort) return;
    onAdd({
      name: name.trim(),
      description: description.trim(),
      status,
      startDate,
      endDate,
      domainIds: selectedDomains,
      valueStreamIds: selectedVS,
      estimate: {
        totalEffortDays: Number(totalEffort),
        roleBreakdown: roleBreakdown.filter((r) => r.days > 0),
        confidence,
        drivers: drivers.trim(),
      },
    });
    toast.success(`Initiative "${name.trim()}" created`);
    setName(""); setDescription(""); setStatus("planned"); setStartDate(""); setEndDate("");
    setSelectedDomains([]); setSelectedVS([]); setTotalEffort(""); setConfidence("medium"); setDrivers("");
    setRoleBreakdown([{ role: "Backend", days: 0 }]);
    setOpen(false);
  };

  const isValid = name.trim() && startDate && endDate && selectedDomains.length > 0 && Number(totalEffort) > 0;
  const domainOptions = domains.map((d) => ({ value: d.id, label: d.name }));
  const vsOptions = valueStreams.map((vs) => ({ value: vs.id, label: vs.name }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><Plus size={14} /> Add Initiative</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket size={18} className="text-primary" /> New Initiative
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="init-name">Name</Label>
            <Input id="init-name" placeholder="e.g. Auth Refactor" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="init-desc">Description</Label>
            <Textarea id="init-desc" placeholder="What is this initiative about?" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
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

          {/* HLE Section */}
          <div className="border-t border-border/50 pt-4 space-y-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">High-Level Estimate</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Effort (days) <span className="text-destructive">*</span></Label>
                <Input type="number" min="1" value={totalEffort} onChange={(e) => setTotalEffort(e.target.value)} placeholder="e.g. 30" />
              </div>
              <div className="space-y-2">
                <Label>Confidence</Label>
                <Select value={confidence} onValueChange={(v) => setConfidence(v as ConfidenceLevel)}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Role Breakdown</Label>
                <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px]" onClick={addRole}>+ Add Role</Button>
              </div>
              {roleBreakdown.map((rb, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select value={rb.role} onValueChange={(v) => updateRole(i, "role", v)}>
                    <SelectTrigger className="text-xs h-8 flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" min="0" value={rb.days || ""} onChange={(e) => updateRole(i, "days", Number(e.target.value))} placeholder="days" className="w-20 h-8 text-xs" />
                  {roleBreakdown.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeRole(i)}>
                      <X size={12} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Key Drivers</Label>
              <Textarea value={drivers} onChange={(e) => setDrivers(e.target.value)} rows={2} placeholder="What drives this estimate?" />
            </div>
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
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!isValid}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
