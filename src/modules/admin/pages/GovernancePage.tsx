import { governanceSettings } from "../data";
import { Building2, Shield, Globe, Clock, Server, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const settings = governanceSettings;

function SettingRow({ icon: Icon, label, children }: { icon: typeof Building2; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-4 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <Icon size={15} strokeWidth={1.8} className="text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default function GovernancePage() {
  return (
    <div className="space-y-6">
      {/* Tenant info */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Building2 size={18} className="text-primary" />
          <div>
            <h2 className="text-sm font-semibold">{settings.tenantName}</h2>
            <p className="text-xs text-muted-foreground">Tenant ID: {settings.tenantId}</p>
          </div>
          <Badge variant="secondary" className="ml-auto text-[11px] bg-primary/15 text-primary uppercase">
            {settings.plan}
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Data Region</span>
            <p className="font-medium flex items-center gap-1.5"><Globe size={13} className="text-muted-foreground" /> {settings.dataRegion}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Created</span>
            <p className="font-medium">June 2025</p>
          </div>
        </div>
      </div>

      {/* Security policies */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Security & Policies</h2>
        <div className="rounded-lg border border-border/50 bg-card">
          <SettingRow icon={Shield} label="MFA Enforcement">
            <Switch checked={settings.mfaEnforced} />
          </SettingRow>
          <SettingRow icon={Clock} label="Session Timeout">
            <span className="text-muted-foreground">{settings.sessionTimeout} minutes</span>
          </SettingRow>
          <SettingRow icon={HardDrive} label="Data Retention">
            <span className="text-muted-foreground">{settings.retentionDays} days</span>
          </SettingRow>
          <SettingRow icon={Server} label="IP Allow List">
            <div className="flex gap-1.5">
              {settings.ipAllowList.map((ip) => (
                <Badge key={ip} variant="secondary" className="text-[11px] font-mono">{ip}</Badge>
              ))}
            </div>
          </SettingRow>
        </div>
      </div>
    </div>
  );
}
