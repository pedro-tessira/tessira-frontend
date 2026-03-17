import { useState } from "react";
import { authProviders as initialProviders, activeSessions as initialSessions, serviceAccounts as initialAccounts, loginAlerts as initialAlerts } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, RefreshCw, Monitor, Key, AlertTriangle, MapPin, Clock, XCircle, CheckCircle, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AddProviderDialog, EditProviderDialog, DeleteProviderDialog } from "../components/ProviderDialogs";
import { CreateServiceAccountDialog } from "../components/ServiceAccountDialog";
import type { AuthProvider, ActiveSession, ServiceAccount, LoginAlert } from "../types";

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
  const [providers, setProviders] = useState<AuthProvider[]>(initialProviders);
  const [sessions, setSessions] = useState<ActiveSession[]>(initialSessions);
  const [accounts, setAccounts] = useState<ServiceAccount[]>(initialAccounts);
  const [alerts, setAlerts] = useState<LoginAlert[]>(initialAlerts);

  // Provider dialogs
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [editProvider, setEditProvider] = useState<AuthProvider | null>(null);
  const [deleteProvider, setDeleteProvider] = useState<AuthProvider | null>(null);

  // Service account dialog
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;

  // Handlers
  const handleAddProvider = (p: AuthProvider) => { setProviders((prev) => [...prev, p]); toast.success(`Provider "${p.label}" added`); };
  const handleEditProvider = (p: AuthProvider) => { setProviders((prev) => prev.map((x) => x.id === p.id ? p : x)); toast.success(`Provider "${p.label}" updated`); };
  const handleDeleteProvider = (id: string) => { setProviders((prev) => prev.filter((x) => x.id !== id)); toast.success("Provider removed"); };

  const handleRevokeSession = (id: string) => { setSessions((prev) => prev.filter((s) => s.id !== id)); toast.success("Session revoked"); };
  const handleRevokeAllSessions = () => { setSessions([]); toast.success("All sessions revoked"); };

  const handleCreateAccount = (sa: ServiceAccount) => { setAccounts((prev) => [...prev, sa]); toast.success(`Service account "${sa.name}" created`); };
  const handleRevokeAccount = (id: string) => { setAccounts((prev) => prev.map((sa) => sa.id === id ? { ...sa, status: "revoked" as const } : sa)); toast.success("Token revoked"); };
  const handleDeleteAccount = (id: string) => { setAccounts((prev) => prev.filter((sa) => sa.id !== id)); toast.success("Service account removed"); };

  const handleResolveAlert = (id: string) => { setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true } : a)); toast.success("Alert resolved"); };
  const handleResolveAllAlerts = () => { setAlerts((prev) => prev.map((a) => ({ ...a, resolved: true }))); toast.success("All alerts resolved"); };

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
          <TabsTrigger value="sessions" className="text-xs">Active Sessions ({sessions.length})</TabsTrigger>
          <TabsTrigger value="tokens" className="text-xs">Service Accounts ({accounts.filter((s) => s.status === "active").length})</TabsTrigger>
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
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowAddProvider(true)}>
              <Plus size={13} /> Add Provider
            </Button>
          </div>
          <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
            {providers.map((p) => (
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn("text-[11px] font-medium", statusColor[p.status])}>
                    {p.status}
                  </Badge>
                  {p.status === "active" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success(`${p.label} synced`)}>
                      <RefreshCw size={13} />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal size={13} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => setEditProvider(p)}><Pencil size={12} /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => setDeleteProvider(p)}><Trash2 size={12} /> Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {providers.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No identity providers configured.</div>
            )}
          </div>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Active Sessions</h3>
            <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5" onClick={handleRevokeAllSessions} disabled={sessions.length === 0}>
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
                {sessions.map((s) => (
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
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleRevokeSession(s.id)}>Revoke</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No active sessions.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Service Accounts */}
        <TabsContent value="tokens" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Service Accounts & API Tokens</h3>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowCreateAccount(true)}>
              <Key size={13} /> Create Token
            </Button>
          </div>
          <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
            {accounts.map((sa) => (
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal size={13} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      {sa.status === "active" && (
                        <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => handleRevokeAccount(sa.id)}>
                          <XCircle size={12} /> Revoke
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => handleDeleteAccount(sa.id)}>
                        <Trash2 size={12} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {accounts.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No service accounts.</div>
            )}
          </div>
        </TabsContent>

        {/* Login Alerts */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Login Alerts & Suspicious Activity</h3>
            {unresolvedAlerts > 0 && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleResolveAllAlerts}>
                <CheckCircle size={13} /> Resolve All
              </Button>
            )}
          </div>
          <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
            {alerts.map((alert) => (
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
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleResolveAlert(alert.id)}>Resolve</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddProviderDialog open={showAddProvider} onOpenChange={setShowAddProvider} onAdd={handleAddProvider} />
      <EditProviderDialog open={!!editProvider} onOpenChange={(o) => { if (!o) setEditProvider(null); }} provider={editProvider} onSave={handleEditProvider} />
      <DeleteProviderDialog open={!!deleteProvider} onOpenChange={(o) => { if (!o) setDeleteProvider(null); }} provider={deleteProvider} onDelete={handleDeleteProvider} />
      <CreateServiceAccountDialog open={showCreateAccount} onOpenChange={setShowCreateAccount} onCreate={handleCreateAccount} />
    </div>
  );
}
