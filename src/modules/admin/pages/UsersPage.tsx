import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminUsers as initialUsers } from "../data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, UserPlus, MoreHorizontal, Ban, KeyRound, Mail, ArrowRightLeft, Trash2, Plus,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { CreateUserDialog } from "../components/CreateUserDialog";
import type { AdminUser, AdminUserStatus, AdminUserRole } from "../types";

const statusStyle: Record<AdminUserStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  invited: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  suspended: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  deactivated: "bg-muted text-muted-foreground",
};

const roleStyle: Record<AdminUserRole, string> = {
  owner: "bg-primary/15 text-primary",
  admin: "bg-primary/10 text-primary/80",
  member: "bg-muted text-muted-foreground",
  viewer: "bg-muted text-muted-foreground",
};

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminUserStatus | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreateUser, setShowCreateUser] = useState(false);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((u) => u.id)));
  };

  const handleCreateUser = (user: AdminUser) => {
    setUsers((prev) => [...prev, user]);
    toast.success(`User "${user.displayName}" created`);
  };

  const handleBulkAction = (action: string) => {
    const count = selected.size;
    setSelected(new Set());
    toast.success(`${action} applied to ${count} user(s)`);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "invited", "suspended", "deactivated"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs capitalize"
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowCreateUser(true)}>
            <Plus size={13} /> Create User
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowCreateUser(true)}>
            <UserPlus size={13} />
            Invite User
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-1.5 ml-auto">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => handleBulkAction("Resend invite")}>
              <Mail size={12} /> Resend Invite
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => handleBulkAction("Suspend")}>
              <Ban size={12} /> Suspend
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => handleBulkAction("Password reset")}>
              <KeyRound size={12} /> Force Password Reset
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive" onClick={() => handleBulkAction("Deactivate")}>
              <Trash2 size={12} /> Deactivate
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Auth</TableHead>
              <TableHead className="text-xs">Linked Employee</TableHead>
              <TableHead className="text-xs">Last Activity</TableHead>
              <TableHead className="text-xs w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow
                key={user.id}
                className="cursor-pointer"
                onClick={(e) => {
                  // Don't navigate if clicking checkbox or dropdown
                  if ((e.target as HTMLElement).closest('[role="checkbox"], [role="menuitem"], button')) return;
                  navigate(`/app/admin/users/${user.id}`);
                }}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(user.id)}
                    onCheckedChange={() => toggleSelect(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-[11px]", roleStyle[user.role])}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-[11px]", statusStyle[user.status])}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground capitalize">{user.authProvider}</TableCell>
                <TableCell className="text-sm">
                  {user.linkedEmployeeName || (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {user.lastActivity
                    ? new Date(user.lastActivity).toLocaleDateString()
                    : "Never"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => navigate(`/app/admin/users/${user.id}`)}>View Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => toast.success("Invite resent")}><Mail size={12} /> Resend Invite</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => toast.success("Password reset sent")}><KeyRound size={12} /> Force Password Reset</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => toast.success("User suspended")}><Ban size={12} /> Suspend</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => toast.info("Ownership transfer initiated")}><ArrowRightLeft size={12} /> Transfer Ownership</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => toast.success("User deactivated")}><Trash2 size={12} /> Deactivate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                  No users match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateUserDialog open={showCreateUser} onOpenChange={setShowCreateUser} onCreate={handleCreateUser} />
    </div>
  );
}
