import { useEffect, useState } from "react";
import { KeyRound, Link2, Pencil, Plus, Power, Search, User as UserIcon, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useSsoProviders } from "@/queries/useSsoProviders";
import {
  useAdminEmployees,
  useCreateEmployee,
  useDeactivateEmployee,
  useUpdateEmployee,
} from "@/queries/useAdminEmployees";
import { useAdminUsers, useResetUserPassword, useUpdateUser } from "@/queries/useAdminUsers";

const getInitials = (name?: string | null) => {
  if (!name?.trim()) return "--";
  return name
    .trim()
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function AdminUsersPage() {
const getEmployeeName = (employee?: { displayName?: string; fullName?: string } | null) =>
  employee?.displayName ?? employee?.fullName ?? "Unknown";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  TEAM_OWNER: "Team owner",
  USER: "User",
};

const roleBadgeClass: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-700",
  MANAGER: "bg-blue-50 text-blue-700",
  TEAM_OWNER: "bg-indigo-50 text-indigo-700",
  USER: "bg-slate-50 text-slate-700",
};
  const { toast } = useToast();
  const { data: ssoProviders = [] } = useSsoProviders();
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [authFilter, setAuthFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("USER");
  const [editUserActive, setEditUserActive] = useState(true);
  const [editAuthMethods, setEditAuthMethods] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeTeam, setEmployeeTeam] = useState("all");
  const [employeeSource, setEmployeeSource] = useState("all");
  const [employeeStatus, setEmployeeStatus] = useState("all");
  const [isEmployeeCreateOpen, setIsEmployeeCreateOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [isEmployeeEditOpen, setIsEmployeeEditOpen] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null);
  const [editEmployeeName, setEditEmployeeName] = useState("");
  const [editEmployeeEmail, setEditEmployeeEmail] = useState("");
  const [linkEmployeeId, setLinkEmployeeId] = useState("unlinked");
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  const { data: adminUsers = [] } = useAdminUsers(searchQuery);
  const updateUser = useUpdateUser();
  const resetUserPassword = useResetUserPassword();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deactivateEmployee = useDeactivateEmployee();
  const { data: adminEmployees = [] } = useAdminEmployees(employeeSearch);

  const filteredUsers = adminUsers.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesAuth = authFilter === "all";
    const isActive = user.active ?? true;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Active" && isActive) ||
      (statusFilter === "Disabled" && !isActive);
    return matchesRole && matchesAuth && matchesStatus;
  });

  const filteredEmployees = adminEmployees.filter((employee) => {
    const matchesSource =
      employeeSource === "all" ||
      (employeeSource === "HRIS" && employee.source === "INTERNAL_WORKDAY") ||
      (employeeSource === "Manual" && employee.source === "EXTERNAL_MANUAL");
    const matchesStatus = employeeStatus === "all" || employeeStatus === "Active";
    const matchesTeam = employeeTeam === "all";
    return matchesSource && matchesStatus && matchesTeam;
  });

  const handleCreateUser = () => {
    setIsCreateOpen(false);
    toast({
      title: "User created",
      description: "The new user has been created successfully.",
    });
  };

  const handleCreateEmployee = () => {
    if (!employeeName.trim() || !employeeEmail.trim()) {
      toast({
        title: "Missing details",
        description: "Provide both name and email.",
        variant: "destructive",
      });
      return;
    }
    createEmployee.mutate(
      {
        fullName: employeeName.trim(),
        email: employeeEmail.trim(),
        active: true,
      },
      {
        onSuccess: () => {
          setIsEmployeeCreateOpen(false);
          setEmployeeName("");
          setEmployeeEmail("");
          toast({
            title: "Employee created",
            description: "Manual employee record created successfully.",
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: "Create failed",
            description: error?.message ?? "Unable to create employee.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleOpenEmployeeEdit = (employeeId: string, name: string, email: string) => {
    setEditEmployeeId(employeeId);
    setEditEmployeeName(name);
    setEditEmployeeEmail(email);
    setIsEmployeeEditOpen(true);
  };

  const handleSaveEmployeeEdit = () => {
    if (!editEmployeeId) return;
    updateEmployee.mutate(
      {
        employeeId: editEmployeeId,
        payload: {
          fullName: editEmployeeName.trim(),
          email: editEmployeeEmail.trim(),
        },
      },
      {
        onSuccess: () => {
          setIsEmployeeEditOpen(false);
          toast({
            title: "Employee updated",
            description: "Employee details have been saved.",
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: "Update failed",
            description: error?.message ?? "Unable to update employee.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleOpenEdit = (userId: string) => {
    const user = adminUsers.find((entry) => entry.id === userId);
    if (!user) return;
    setEditUserId(user.id);
    setEditUserName(user.displayName ?? "");
    setEditUserEmail(user.email ?? "");
    setEditUserRole(user.role ?? "USER");
    setEditUserActive(user.active ?? true);
    setEditAuthMethods([]);
    const matchedEmployee = adminEmployees.find((employee) => employee.id === user.employeeId);
    setLinkEmployeeId(matchedEmployee?.id ?? "unlinked");
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editUserId) return;
    updateUser.mutate(
      {
        userId: editUserId,
        payload: {
          displayName: editUserName.trim(),
          email: editUserEmail.trim(),
          role: editUserRole as "ADMIN" | "MANAGER" | "TEAM_OWNER" | "USER",
          active: editUserActive,
          employeeId: linkEmployeeId === "unlinked" ? null : linkEmployeeId,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          toast({
            title: "User updated",
            description: "User details have been saved.",
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: "Update failed",
            description: error?.message ?? "Unable to update user.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleOpenResetPassword = (userId: string) => {
    setResetUserId(userId);
    setResetPassword("");
    setIsResetPasswordOpen(true);
  };

  const handleForceRelink = (userId: string) => {
    handleOpenEdit(userId);
    setLinkEmployeeId("unlinked");
  };

  const handleResetPassword = () => {
    if (!resetUserId || !resetPassword.trim()) {
      toast({
        title: "Password required",
        description: "Enter a temporary password to continue.",
        variant: "destructive",
      });
      return;
    }
    resetUserPassword.mutate(
      { userId: resetUserId, password: resetPassword.trim() },
      {
        onSuccess: () => {
          setIsResetPasswordOpen(false);
          toast({
            title: "Password reset",
            description: "The temporary password has been updated.",
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: "Reset failed",
            description: error?.message ?? "Unable to reset the password.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users & Access</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, employees, roles, and access.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="users" className="gap-2">
            <UsersIcon className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2">
            <UserIcon className="h-4 w-4" />
            Employees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-end">
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
                    <SelectItem value="MANAGER">Manager</SelectItem>
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
                                {getInitials(user.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.displayName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.lastLoginMethod ?? "—"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={roleBadgeClass[user.role] ?? "bg-slate-50 text-slate-700"}
                          >
                            {roleLabels[user.role] ?? user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={(user.active ?? true) ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
                          >
                            {user.active ?? true ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.employee ? (
                            <span className="text-sm">{getEmployeeName(user.employee)}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Not linked</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateUser.mutate({
                                      userId: user.id,
                                      payload: { active: !(user.active ?? true) },
                                    })
                                  }
                                >
                                  <Power className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {(user.active ?? true) ? "Deactivate" : "Activate"}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenEdit(user.id)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenResetPassword(user.id)}
                                >
                                  <KeyRound className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reset Password</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleForceRelink(user.id)}
                                >
                                  <Link2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Force Relink Employee</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <div className="flex items-center justify-end">
            <Button onClick={() => setIsEmployeeCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Employee
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={employeeSearch}
                    onChange={(event) => setEmployeeSearch(event.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={employeeTeam} onValueChange={setEmployeeTeam}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={employeeSource} onValueChange={setEmployeeSource}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="HRIS">HRIS</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={employeeStatus} onValueChange={setEmployeeStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
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
                    <TableHead>Employee</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Linked User</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <UserIcon className="w-8 h-8" />
                          <p>No employees found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getEmployeeName(employee)}</p>
                            <p className="text-sm text-muted-foreground">{employee.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {employee.source === "INTERNAL_WORKDAY" ? "HRIS" : "Manual"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={(employee.active ?? true) ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}
                          >
                            {(employee.active ?? true) ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {employee.user ? (
                            <span className="text-sm">{employee.user.displayName ?? "Unknown"}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Not linked</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (employee.active ?? true) {
                                  deactivateEmployee.mutate(employee.id);
                                } else {
                                  updateEmployee.mutate({
                                    employeeId: employee.id,
                                    payload: { active: true },
                                  });
                                }
                              }}
                            >
                              {(employee.active ?? true) ? "Deactivate" : "Activate"}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenEmployeeEdit(
                                      employee.id,
                                      getEmployeeName(employee),
                                      employee.email
                                    )
                                  }
                                >
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  <SelectItem value="MANAGER">Manager</SelectItem>
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
        open={isEmployeeCreateOpen}
        onOpenChange={(open) => {
          setIsEmployeeCreateOpen(open);
          if (!open) {
            setEmployeeName("");
            setEmployeeEmail("");
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Employee</DialogTitle>
            <DialogDescription>
              Add a manual employee record. HRIS sync can link this record later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee-name">Full Name</Label>
              <Input
                id="employee-name"
                placeholder="Jane Doe"
                value={employeeName}
                onChange={(event) => setEmployeeName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-email">Email</Label>
              <Input
                id="employee-email"
                type="email"
                placeholder="jane.doe@company.com"
                value={employeeEmail}
                onChange={(event) => setEmployeeEmail(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEmployeeCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEmployee}>Create Employee</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEmployeeEditOpen}
        onOpenChange={(open) => {
          setIsEmployeeEditOpen(open);
          if (!open) {
            setEditEmployeeId(null);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-employee-name">Full Name</Label>
              <Input
                id="edit-employee-name"
                value={editEmployeeName}
                onChange={(event) => setEditEmployeeName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-employee-email">Email</Label>
              <Input
                id="edit-employee-email"
                type="email"
                value={editEmployeeEmail}
                onChange={(event) => setEditEmployeeEmail(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEmployeeEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEmployeeEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditUserId(null);
            setEditUserName("");
            setEditUserEmail("");
            setEditUserRole("USER");
            setEditUserActive(true);
            setEditAuthMethods([]);
            setLinkEmployeeId("unlinked");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and permissions.</DialogDescription>
          </DialogHeader>
          {editUserId && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editUserName}
                    onChange={(event) => setEditUserName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUserEmail}
                    onChange={(event) => setEditUserEmail(event.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={editUserRole} onValueChange={setEditUserRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="TEAM_OWNER">Team Owner</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editUserActive ? "Active" : "Disabled"}
                    onValueChange={(value) => setEditUserActive(value === "Active")}
                  >
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
                  <Select value={linkEmployeeId} onValueChange={setLinkEmployeeId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlinked">Unlinked</SelectItem>
                      {adminEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {getEmployeeName(employee)} ({employee.email})
                        </SelectItem>
                      ))}
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

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Set a new temporary password for this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">Temporary Password</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword} disabled={resetUserPassword.isPending}>
                {resetUserPassword.isPending ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
