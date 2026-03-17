import { useState } from "react";
import { governanceSettings, tenantSubscription, policyRules, complianceModes } from "../data";
import { Building2, Shield, Globe, Clock, Server, HardDrive, CreditCard, Users, CalendarDays, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

const settings = governanceSettings;
const sub = tenantSubscription;

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

const policySeverityStyle = {
  critical: "bg-red-500/15 text-red-700 dark:text-red-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  info: "bg-muted text-muted-foreground",
};

export default function GovernancePage() {
  const [tab, setTab] = useState("tenant");

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="tenant" className="text-xs">Tenant & Subscription</TabsTrigger>
          <TabsTrigger value="policies" className="text-xs">Policies ({policyRules.length})</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security Settings</TabsTrigger>
        </TabsList>

        {/* Tenant info & subscription */}
        <TabsContent value="tenant" className="space-y-6 mt-4">
          <div className="rounded-lg border border-border/50 bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <Building2 size={18} className="text-primary" />
              <div>
                <h2 className="text-sm font-semibold">{settings.tenantName}</h2>
                <p className="text-xs text-muted-foreground">Tenant ID: {settings.tenantId}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="secondary" className={cn("text-[11px] uppercase",
                  sub.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : sub.status === "trial" ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                )}>{sub.status}</Badge>
                <Badge variant="secondary" className="text-[11px] bg-primary/15 text-primary uppercase">{sub.plan}</Badge>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Globe size={11} /> Region</span>
                <p className="font-medium">{settings.dataRegion}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Users size={11} /> Seats</span>
                <p className="font-medium tabular-nums">{sub.usedSeats} / {sub.seats}</p>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full", sub.usedSeats / sub.seats > 0.8 ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${(sub.usedSeats / sub.seats) * 100}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><CreditCard size={11} /> Billing</span>
                <p className="font-medium">{sub.billingOwner}</p>
                <p className="text-xs text-muted-foreground">{sub.billingEmail}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><CalendarDays size={11} /> Renewal</span>
                <p className="font-medium">{new Date(sub.renewalDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Policy Rules</h3>
              <p className="text-xs text-muted-foreground">Define and enforce organizational security and access policies.</p>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs">Add Policy</Button>
          </div>
          <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
            {policyRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Switch checked={rule.enabled} className="scale-75 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{rule.name}</p>
                      <Badge variant="secondary" className={cn("text-[10px]", policySeverityStyle[rule.severity])}>
                        {rule.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{rule.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] capitalize shrink-0 ml-3">{rule.category}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-semibold">Compliance Modes</h3>
            <p className="text-xs text-muted-foreground">Enable compliance frameworks to auto-enforce required policies.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {complianceModes.map((mode) => (
              <div key={mode.id} className={cn("rounded-lg border p-4 space-y-3",
                mode.enabled ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-card"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">{mode.label}</h4>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
                  </div>
                  <Switch checked={mode.enabled} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Requirements</p>
                  {mode.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {mode.enabled ? (
                        <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle size={12} className="text-muted-foreground shrink-0" />
                      )}
                      <span className={mode.enabled ? "" : "text-muted-foreground"}>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <h3 className="text-sm font-semibold">Security & Session Settings</h3>
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
              <div className="flex gap-1.5 flex-wrap justify-end">
                {settings.ipAllowList.map((ip) => (
                  <Badge key={ip} variant="secondary" className="text-[11px] font-mono">{ip}</Badge>
                ))}
              </div>
            </SettingRow>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
