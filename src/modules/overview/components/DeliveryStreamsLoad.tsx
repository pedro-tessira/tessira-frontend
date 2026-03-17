import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { initiatives, getRequiredFTE, getAllocatedFTE, getStaffingStatus } from "@/modules/work/data";
import type { StaffingStatus } from "@/modules/work/types";
import { Rocket } from "lucide-react";

const staffingConfig: Record<StaffingStatus, { label: string; barColor: string; badgeClass: string }> = {
  understaffed: { label: "Understaffed", barColor: "bg-destructive", badgeClass: "bg-destructive/10 text-destructive" },
  balanced: { label: "Balanced", barColor: "bg-success", badgeClass: "bg-success/10 text-success" },
  overstaffed: { label: "Overstaffed", barColor: "bg-warning", badgeClass: "bg-warning/10 text-warning" },
};

interface Props {
  domainFilter?: string;
}

export default function InitiativeAllocationChart({ domainFilter }: Props) {
  const navigate = useNavigate();

  const activeInits = initiatives.filter((i) => i.status !== "completed");
  const data = (domainFilter && domainFilter !== "all")
    ? activeInits.filter((i) => i.domainIds.some((d) => d === domainFilter))
    : activeInits;

  const items = data.map((init) => ({
    id: init.id,
    name: init.name,
    required: getRequiredFTE(init),
    allocated: getAllocatedFTE(init.id),
    status: getStaffingStatus(init),
  }));

  return (
    <Card
      className="border-border/50 cursor-pointer transition-colors hover:border-primary/30"
      onClick={() => navigate("/app/horizon/capacity")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Rocket size={14} className="text-primary" />
          Initiative Allocation
        </CardTitle>
        <p className="text-xs text-muted-foreground">Required vs allocated FTE per active initiative</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-2.5">
        {items.map((item) => {
          const sc = staffingConfig[item.status];
          const fillPct = item.required > 0 ? Math.min(100, Math.round((item.allocated / item.required) * 100)) : 0;
          return (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium truncate mr-2">{item.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground tabular-nums">{item.allocated}/{item.required} FTE</span>
                  <Badge variant="secondary" className={cn("text-[9px] h-4", sc.badgeClass)}>{sc.label}</Badge>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", sc.barColor)} style={{ width: `${fillPct}%` }} />
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No active initiatives</p>
        )}
      </CardContent>
    </Card>
  );
}
