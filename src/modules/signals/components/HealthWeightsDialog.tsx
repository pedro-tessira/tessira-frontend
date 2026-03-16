import { useState } from "react";
import { Settings2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { useHealthWeights, DEFAULT_WEIGHTS, type HealthWeights } from "../contexts/HealthWeightsContext";

const FACTORS: { key: keyof HealthWeights; label: string; description: string; color: string }[] = [
  { key: "allocation", label: "Allocation Pressure", description: "How much free capacity buffers influence the score", color: "bg-primary" },
  { key: "coverage", label: "Skill Coverage", description: "How much knowledge breadth and depth matter", color: "bg-success" },
  { key: "spof", label: "SPOF Exposure", description: "Impact of single-point-of-failure risks", color: "bg-destructive" },
  { key: "busFactor", label: "Bus Factor", description: "Importance of knowledge distribution across people", color: "bg-warning" },
];

export function HealthWeightsDialog() {
  const { weights, setWeights, resetWeights } = useHealthWeights();
  const [draft, setDraft] = useState<HealthWeights>(weights);
  const [open, setOpen] = useState(false);

  const total = draft.allocation + draft.coverage + draft.spof + draft.busFactor;

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setDraft(weights);
    setOpen(isOpen);
  };

  const handleSave = () => {
    setWeights(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_WEIGHTS);
  };

  const isDefault = JSON.stringify(draft) === JSON.stringify(DEFAULT_WEIGHTS);
  const isChanged = JSON.stringify(draft) !== JSON.stringify(weights);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Settings2 size={14} />
                Weights
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Configure health score factor weights</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Health Score Weights</DialogTitle>
          <DialogDescription className="text-xs">
            Adjust how much each factor contributes to the team health score. Weights are automatically normalized.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {FACTORS.map(({ key, label, description, color }) => {
            const pct = total > 0 ? Math.round((draft[key] / total) * 100) : 25;
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{label}</span>
                    <p className="text-[11px] text-muted-foreground">{description}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums w-12 text-right">{pct}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full shrink-0", color)} />
                  <Slider
                    value={[draft[key]]}
                    onValueChange={([v]) => setDraft((d) => ({ ...d, [key]: v }))}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground tabular-nums w-6">{draft[key]}</span>
                </div>
              </div>
            );
          })}

          {/* Visual weight distribution */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Weight distribution</div>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              {FACTORS.map(({ key, color }) => {
                const pct = total > 0 ? (draft[key] / total) * 100 : 25;
                return (
                  <div
                    key={key}
                    className={cn("h-full transition-all duration-200", color)}
                    style={{ width: `${pct}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isDefault}
            className="gap-1.5 text-xs"
          >
            <RotateCcw size={12} />
            Reset defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!isChanged}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
