import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { usePeopleStore } from "../contexts/PeopleStoreContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEPARTMENTS = ["Platform", "Backend", "Frontend", "Infrastructure", "Data", "Engineering"];
const STATUSES = [
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
] as const;

export default function AddEmployeeDialog({ open, onOpenChange }: Props) {
  const { addEmployee, employees } = usePeopleStore();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", title: "",
    department: "Engineering", status: "active" as const,
    country: "", countryCode: "", timezone: "",
    startDate: new Date().toISOString().slice(0, 10),
    managerId: "" as string,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) return;
    addEmployee({
      ...form,
      managerId: form.managerId || null,
    });
    const name = `${form.firstName} ${form.lastName}`;
    setForm({
      firstName: "", lastName: "", email: "", title: "",
      department: "Engineering", status: "active",
      country: "", countryCode: "", timezone: "",
      startDate: new Date().toISOString().slice(0, 10),
      managerId: "",
    });
    onOpenChange(false);
    setTimeout(() => toast({ title: "Employee added", description: `${name} has been added.` }), 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">First Name *</Label>
              <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name *</Label>
              <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm((p) => ({ ...p, department: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country Code</Label>
              <Input value={form.countryCode} onChange={(e) => setForm((p) => ({ ...p, countryCode: e.target.value.toUpperCase() }))} maxLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Timezone</Label>
              <Input value={form.timezone} onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))} placeholder="e.g. Europe/London" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Manager</Label>
              <Select value={form.managerId} onValueChange={(v) => setForm((p) => ({ ...p, managerId: v }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!form.firstName || !form.lastName || !form.email}>Add Employee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
