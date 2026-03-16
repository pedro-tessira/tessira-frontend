import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { horizonEmployees, allocations } from "../data";
import { initiatives } from "@/modules/work/data";
import { toast } from "sonner";

interface AddAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillEmployeeId?: string;
  prefillStartDate?: string;
  prefillEndDate?: string;
}

export default function AddAllocationDialog({
  open,
  onOpenChange,
  prefillEmployeeId,
  prefillStartDate,
  prefillEndDate,
}: AddAllocationDialogProps) {
  const [initiativeId, setInitiativeId] = useState("");
  const [employeeId, setEmployeeId] = useState(prefillEmployeeId ?? "");
  const [percentage, setPercentage] = useState([50]);
  const [startDate, setStartDate] = useState(prefillStartDate ?? "");
  const [endDate, setEndDate] = useState(prefillEndDate ?? "");

  // Reset on open with prefills
  useEffect(() => {
    if (open) {
      setInitiativeId("");
      setPercentage([50]);
      setEmployeeId(prefillEmployeeId ?? "");
      setStartDate(prefillStartDate ?? "");
      setEndDate(prefillEndDate ?? "");
    }
  }, [open, prefillEmployeeId, prefillStartDate, prefillEndDate]);

  // Calculate current free capacity for selected engineer
  const freeCapacity = useMemo(() => {
    if (!employeeId) return null;
    const today = new Date().toISOString().slice(0, 10);
    const current = allocations
      .filter((a) => a.employeeId === employeeId && a.startDate <= today && a.endDate >= today)
      .reduce((s, a) => s + a.percentage, 0);
    return Math.max(0, 100 - current);
  }, [employeeId]);

  const activeInitiatives = initiatives.filter((i) => i.status === "active" || i.status === "planned");

  const handleSubmit = () => {
    if (!initiativeId || !employeeId || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    const emp = horizonEmployees.find((e) => e.id === employeeId);
    const init = initiatives.find((i) => i.id === initiativeId);
    toast.success(`Allocation created: ${emp?.name} → ${init?.name} at ${percentage[0]}%`);
    onOpenChange(false);
    setInitiativeId("");
    setEmployeeId("");
    setPercentage([50]);
    setStartDate("");
    setEndDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Allocation</DialogTitle>
          <DialogDescription>
            Assign an engineer to an initiative with a capacity percentage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Initiative *</Label>
            <Select value={initiativeId} onValueChange={(v) => {
              setInitiativeId(v);
              const init = initiatives.find((i) => i.id === v);
              if (init) {
                if (!startDate) setStartDate(init.startDate);
                if (!endDate) setEndDate(init.endDate);
              }
            }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select initiative" />
              </SelectTrigger>
              <SelectContent>
                {activeInitiatives.map((i) => (
                  <SelectItem key={i.id} value={i.id} className="text-sm">
                    {i.name}
                    <span className="text-muted-foreground ml-1">({i.status})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Engineer *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select engineer" />
              </SelectTrigger>
              <SelectContent>
                {horizonEmployees.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="text-sm">
                    {e.name} · {e.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Capacity suggestion */}
          {freeCapacity !== null && (
            <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2 space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">Available capacity</p>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-lg font-bold tabular-nums",
                  freeCapacity < 20 ? "text-destructive" : freeCapacity < 50 ? "text-warning" : "text-success"
                )}>
                  {freeCapacity}%
                </span>
                {freeCapacity > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px]"
                    onClick={() => setPercentage([Math.min(freeCapacity, Math.round(freeCapacity / 10) * 10 || 10)])}
                  >
                    Use suggested: {Math.min(freeCapacity, Math.round(freeCapacity / 10) * 10 || 10)}%
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">
              Allocation — {percentage[0]}%
            </Label>
            <Slider
              value={percentage}
              onValueChange={setPercentage}
              min={10}
              max={100}
              step={10}
              className="py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date *</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Create Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
