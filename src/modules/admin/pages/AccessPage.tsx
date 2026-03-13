import { authProviders } from "../data";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  configuring: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export default function AccessPage() {
  return (
    <div className="space-y-6">
      {/* Auth settings summary */}
      <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <ShieldCheck size={15} strokeWidth={1.8} className="text-primary" />
          Authentication Settings
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">MFA</span>
            <p className="font-medium text-emerald-600 dark:text-emerald-400">Enforced</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Session Timeout</span>
            <p className="font-medium">8 hours</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Password Policy</span>
            <p className="font-medium">Strong (12+ chars)</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Self-Registration</span>
            <p className="font-medium text-muted-foreground">Disabled</p>
          </div>
        </div>
      </div>

      {/* Providers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Identity Providers</h2>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Add Provider
          </Button>
        </div>
        <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
          {authProviders.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-xs font-bold uppercase text-muted-foreground">
                  {p.type.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.usersCount} users
                    {p.lastSync && ` · Synced ${new Date(p.lastSync).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={cn("text-[11px] font-medium", statusColor[p.status])}>
                  {p.status}
                </Badge>
                {p.status === "active" && (
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <RefreshCw size={13} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
