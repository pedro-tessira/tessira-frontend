import { useState } from "react";
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
import { horizonEmployees } from "../data";
import { toast } from "sonner";

interface AddAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddAllocationDialog({
  open,
  onOpenChange,
}: AddAllocationDialogProps) {
  const [project, setProject] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [percentage, setPercentage] = useState([50]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [source, setSource] = useState("manual");

  const handleSubmit = () => {
    if (!project || !employeeId || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    const emp = horizonEmployees.find((e) => e.id === employeeId);
    toast.success(`Allocation created: ${emp?.name} → ${project} at ${percentage[0]}%`);
    onOpenChange(false);
    // Reset
    setProject("");
    setEmployeeId("");
    setPercentage([50]);
    setStartDate("");
    setEndDate("");
    setSource("manual");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Allocation</DialogTitle>
          <DialogDescription>
            Assign an engineer to a project or initiative.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Project / Initiative *</Label>
            <Input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. API Gateway, Checkout Platform"
              className="h-9 text-sm"
            />
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

          <div className="space-y-1.5">
            <Label className="text-xs">Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual" className="text-sm">Manual</SelectItem>
                <SelectItem value="jira" className="text-sm">Jira</SelectItem>
                <SelectItem value="linear" className="text-sm">Linear</SelectItem>
              </SelectContent>
            </Select>
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
