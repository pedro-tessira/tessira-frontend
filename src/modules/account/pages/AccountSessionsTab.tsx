import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

const sessions = [
  { id: "s1", device: "Chrome on macOS", ip: "192.168.1.42", lastActive: "Now", current: true, icon: Monitor },
  { id: "s2", device: "Safari on iPhone", ip: "10.0.0.15", lastActive: "2 hours ago", current: false, icon: Smartphone },
  { id: "s3", device: "Firefox on Windows", ip: "172.16.0.8", lastActive: "3 days ago", current: false, icon: Monitor },
];

export default function AccountSessionsTab() {
  return (
    <div className="max-w-lg space-y-4">
      {sessions.map((s) => (
        <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <s.icon size={18} className="text-muted-foreground" />
            <div>
              <div className="text-sm font-medium flex items-center gap-2">
                {s.device}
                {s.current && <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Current</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">{s.ip} · {s.lastActive}</div>
            </div>
          </div>
          {!s.current && <Button variant="ghost" size="sm" className="text-destructive text-xs">Revoke</Button>}
        </div>
      ))}
    </div>
  );
}
