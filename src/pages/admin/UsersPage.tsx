import { useState } from "react";
import { Plus, Search, MoreHorizontal, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSsoProviders } from "@/queries/useSsoProviders";

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    authMethod: "SSO",
    role: "ADMIN",
    status: "Active",
    linkedEmployee: "John Doe",
    lastLogin: "2024-12-31 09:15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    authMethod: "SSO",
    role: "TEAM_OWNER",
    status: "Active",
    linkedEmployee: "Jane Smith",
    lastLogin: "2024-12-31 08:45",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob.wilson@company.com",
    authMethod: "Manual",
    role: "USER",
    status: "Active",
    linkedEmployee: "Bob Wilson",
    lastLogin: "2024-12-30 16:20",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@company.com",
    authMethod: "SSO",
    role: "USER",
    status: "Active",
    linkedEmployee: "Alice Brown",
    lastLogin: "2024-12-30 14:00",
  },
  {
    id: "5",
    name: "Charlie Davis",
    email: "charlie.davis@company.com",
    authMethod: "Manual",
    role: "USER",
    status: "Disabled",
    linkedEmployee: null,
    lastLogin: "2024-12-15 10:30",
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { data: ssoProviders = [] } = useSsoProviders();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [authFilter, setAuthFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<typeof mockUsers[number] | null>(null);
  const [editAuthMethods, setEditAuthMethods] = useState<string[]>([]);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesAuth = authFilter === "all" || user.authMethod === authFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesAuth && matchesStatus;
  });

  const handleCreateUser = () => {
    setIsCreateOpen(false);
    toast({
      title: "User created",
      description: "The new user has been created successfully.",
    });
  };

  const handleOpenEdit = (user: typeof mockUsers[number]) => {
    setEditUser(user);
    setEditAuthMethods([user.authMethod]);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    setIsEditOpen(false);
    toast({
      title: "User updated",
      description: "User details have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users & Access</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and employee linkage.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Manual User
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TEAM_OWNER">Team Owner</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={authFilter} onValueChange={setAuthFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Auth Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="SSO">SSO</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Auth Method</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Linked Employee</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UserIcon className="w-8 h-8" />
                      <p>No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={user.authMethod === "SSO" ? "border-primary/30 text-primary" : ""}
                      >
                        {user.authMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          user.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700"
                            : user.role === "TEAM_OWNER"
                            ? "bg-blue-50 text-blue-700"
                            : ""
                        }
                      >
                        {user.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={user.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.linkedEmployee ? (
                        <span className="text-sm">{user.linkedEmployee}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Not linked</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>{user.status === "Active" ? "Disable" : "Enable"}</DropdownMenuItem>
                          {user.authMethod === "Manual" && <DropdownMenuItem>Reset Password</DropdownMenuItem>}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Force Relink Employee</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Create Manual User</SheetTitle>
            <SheetDescription>Create a new user account with manual authentication.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john.doe@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="USER">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="TEAM_OWNER">Team Owner</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
              <p className="text-xs text-muted-foreground">
                User will be prompted to change this on first login.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee">Link to Employee (optional)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emp-1">John Doe</SelectItem>
                  <SelectItem value="emp-2">Jane Smith</SelectItem>
                  <SelectItem value="emp-3">Bob Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateUser} className="flex-1">
                Create User
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditUser(null);
            setEditAuthMethods([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and permissions.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" defaultValue={editUser.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" defaultValue={editUser.email} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select defaultValue={editUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="TEAM_OWNER">Team Owner</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue={editUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Auth Methods</Label>
                  <div className="space-y-2 rounded-lg border border-border p-3">
                    {["SSO", "Manual"].map((method) => (
                      <label key={method} className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={editAuthMethods.includes(method)}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setEditAuthMethods((prev) =>
                              checked ? [...prev, method] : prev.filter((item) => item !== method)
                            );
                          }}
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                  {editAuthMethods.includes("SSO") && (
                    <div className="mt-3 space-y-2 rounded-lg border border-border p-3">
                      <Label>Allowed SSO Providers</Label>
                      <div className="space-y-2">
                        {ssoProviders.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No SSO providers configured.</p>
                        ) : (
                          ssoProviders.map((provider) => (
                            <label key={provider.id} className="flex items-center gap-2 text-sm text-foreground">
                              <input type="checkbox" className="h-4 w-4 rounded border-border" />
                              {provider.displayName || provider.provider}
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Linked Employee</Label>
                  <Select defaultValue={editUser.linkedEmployee ? "linked" : "unlinked"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linked">Keep linked</SelectItem>
                      <SelectItem value="unlinked">Unlinked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
