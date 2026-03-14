import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { subscriptions } from "../data";

const statusColor: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  past_due: "bg-warning/10 text-warning border-warning/20",
  canceled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function PlatformSubscriptionsPage() {
  const totalMrr = subscriptions.reduce((s, sub) => s + sub.mrr, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Billing and plan management.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total MRR</div>
          <div className="mt-1 text-2xl font-semibold">${totalMrr.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Subscriptions</div>
          <div className="mt-1 text-2xl font-semibold">{subscriptions.filter((s) => s.status === "active").length}</div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Seats Used</div>
          <div className="mt-1 text-2xl font-semibold">{subscriptions.reduce((s, sub) => s + sub.usedSeats, 0)}</div>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>MRR</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Renewal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.tenantId}>
                <TableCell className="font-medium">{sub.tenantName}</TableCell>
                <TableCell className="capitalize">{sub.plan}</TableCell>
                <TableCell>${sub.mrr}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={(sub.usedSeats / sub.seats) * 100} className="h-1.5 w-16" />
                    <span className="text-xs text-muted-foreground">{sub.usedSeats}/{sub.seats}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{sub.renewalDate}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColor[sub.status] ?? ""}>{sub.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
