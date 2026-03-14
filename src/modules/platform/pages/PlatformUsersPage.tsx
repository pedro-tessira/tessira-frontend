import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { platformUsers } from "../data";

const statusColor: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  invited: "bg-warning/10 text-warning border-warning/20",
};

export default function PlatformUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Platform Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">All users across every tenant.</p>
      </div>
      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tenants</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platformUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.displayName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                <TableCell className="text-xs">{u.tenants.length}</TableCell>
                <TableCell>
                  {u.isPlatformAdmin ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">User</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.lastLogin || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColor[u.status] ?? ""}>{u.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
