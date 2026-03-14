import { platformTenants } from "../data";
import { Progress } from "@/components/ui/progress";

const usageData = [
  { label: "API Calls (24h)", total: 1_240_000, breakdown: [{ name: "Planet Engineering", value: 680_000 }, { name: "BNP Paribas", value: 420_000 }, { name: "Others", value: 140_000 }] },
  { label: "Storage (GB)", total: 84, breakdown: [{ name: "Planet Engineering", value: 42 }, { name: "BNP Paribas", value: 28 }, { name: "Others", value: 14 }] },
  { label: "Active Sessions", total: 312, breakdown: [{ name: "Planet Engineering", value: 168 }, { name: "BNP Paribas", value: 98 }, { name: "Others", value: 46 }] },
];

export default function PlatformUsagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Usage Metrics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform-wide resource consumption.</p>
      </div>

      <div className="grid gap-4">
        {usageData.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{metric.label}</span>
              <span className="text-lg font-semibold">{metric.total.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              {metric.breakdown.map((b) => (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-36 truncate">{b.name}</span>
                  <Progress value={(b.value / metric.total) * 100} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium w-20 text-right">{b.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Tenants by User Count</h2>
        <div className="space-y-2">
          {[...platformTenants].sort((a, b) => b.userCount - a.userCount).map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <span className="text-xs w-36 truncate">{t.name}</span>
              <Progress value={(t.userCount / 200) * 100} className="h-1.5 flex-1" />
              <span className="text-xs font-medium w-10 text-right">{t.userCount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
