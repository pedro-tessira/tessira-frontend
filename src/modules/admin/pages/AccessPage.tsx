import { useState } from "react";
import { authProviders, activeSessions, serviceAccounts, loginAlerts } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, RefreshCw, Monitor, Key, AlertTriangle, MapPin, Clock, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  configuring: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

const alertTypeLabels: Record<string, string> = {
  suspicious_location: "Suspicious Location",
  brute_force: "Brute Force",
  new_device: "New Device",
  after_hours: "After Hours",
};

const alertTypeStyle: Record<string, string> = {
  suspicious_location: "bg-red-500/15 text-red-700 dark:text-red-400",
  brute_force: "bg-red-500/15 text-red-700 dark:text-red-400",
  new_device: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  after_hours: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export default function AccessPage() {
  const [tab, setTab] = useState("providers");
  const unresolvedAlerts = loginAlerts.filter((a) => !a.resolved).length;

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
            <span className="text-xs text-muted-foreground uppercase tracking-wider">SCIM</span>
            <p className="font-medium text-muted-foreground">Configured</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="providers" className="text-xs">Identity Providers</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs">Active Sessions ({activeSessions.length})</TabsTrigger>
          <TabsTrigger value="tokens" className="text-xs">Service Accounts ({serviceAccounts.filter((s) => s.status === "active").length})</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs relative">
            Login Alerts
            {unresolvedAlerts > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{unresolvedAlerts}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Providers */}
        <TabsContent value="providers" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Identity Providers</h3>
            <Button variant="outline" size="sm" className="h-8 text-xs">Add Provider</Button>
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
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Active Sessions</h3>
            <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5">
              <XCircle size={13} /> Revoke All
            </Button>
          </div>
          <div className="rounded-lg border border-border/50 bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">IP</TableHead>
                  <TableHead className="text-xs">Last Active</TableHead>
                  <TableHead className="text-xs w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{s.userDisplayName}</p>
                      <p className="text-xs text-muted-foreground">{s.userEmail}</p>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <Monitor size={12} className="text-muted-foreground" />
                        {s.device}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-muted-foreground" />
                        {s.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{s.ip}</TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {new Date(s.lastActive).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">Revoke</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Service Accounts */}
        <TabsContent value="tokens" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Service Accounts & API Tokens</h3>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Key size={13} /> Create Token
            </Button>
          </div>
          <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
            {serviceAccounts.map((sa) => (
              <div key={sa.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <Key size={14} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{sa.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sa.description} · Created by {sa.createdBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {sa.lastUsed ? `Used ${new Date(sa.lastUsed).toLocaleDateString()}` : "Never used"}
                  </span>
                  <Badge variant="secondary" className={cn("text-[11px]",
                    sa.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                  )}>{sa.status}</Badge>
                  {sa.status === "active" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">Revoke</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Login Alerts */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Login Alerts & Suspicious Activity</h3>
          </div>
          <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
            {loginAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between px-4 py-3.5 gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={14} className={cn("mt-0.5 shrink-0", alert.resolved ? "text-muted-foreground" : "text-destructive")} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{alert.userDisplayName}</p>
                      <Badge variant="secondary" className={cn("text-[10px]", alertTypeStyle[alert.type])}>
                        {alertTypeLabels[alert.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.detail}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      <Clock size={10} className="inline mr-1" />
                      {new Date(alert.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  {alert.resolved ? (
                    <Badge variant="secondary" className="text-[11px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 gap-1">
                      <CheckCircle size={10} /> Resolved
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7 text-xs">Resolve</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
