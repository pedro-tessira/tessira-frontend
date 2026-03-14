import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { featureFlags } from "../data";

export default function PlatformFlagsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Feature Flags</h1>
        <p className="mt-1 text-sm text-muted-foreground">Control feature rollout across the platform.</p>
      </div>

      <div className="space-y-2">
        {featureFlags.map((flag) => (
          <div
            key={flag.id}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-5 py-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{flag.label}</span>
                <Badge variant="outline" className="text-[10px]">{flag.scope}</Badge>
              </div>
              <div className="text-xs text-muted-foreground font-mono">{flag.key}</div>
              {flag.tenants && flag.tenants.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Enabled for: {flag.tenants.join(", ")}
                </div>
              )}
            </div>
            <Switch checked={flag.enabled} />
          </div>
        ))}
      </div>
    </div>
  );
}
