import { Switch } from "@/components/ui/switch";

const prefs = [
  { label: "Security alerts", desc: "Login from new device, password changes", enabled: true },
  { label: "SPOF warnings", desc: "When a skill becomes a single point of failure", enabled: true },
  { label: "Team capacity alerts", desc: "When team allocation exceeds threshold", enabled: false },
  { label: "Weekly digest", desc: "Summary of signals and risk changes", enabled: true },
  { label: "Product updates", desc: "New features and platform announcements", enabled: false },
];

export default function AccountNotificationsTab() {
  return (
    <div className="max-w-lg space-y-2">
      {prefs.map((p) => (
        <div key={p.label} className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-5 py-4">
          <div>
            <div className="text-sm font-medium">{p.label}</div>
            <div className="text-xs text-muted-foreground">{p.desc}</div>
          </div>
          <Switch checked={p.enabled} />
        </div>
      ))}
    </div>
  );
}
