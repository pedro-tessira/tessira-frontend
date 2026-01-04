import { useState } from "react";
import { Plus, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const mockEmployees = [
  { id: "emp-1", name: "John Smith", email: "john.smith@company.com", source: "Manual", status: "Active" },
  { id: "emp-2", name: "Jane Doe", email: "jane.doe@company.com", source: "HRIS", status: "Active" },
  { id: "emp-3", name: "Carlos Alves", email: "carlos.alves@company.com", source: "Manual", status: "Inactive" },
];

export default function AdminEmployeesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredEmployees = mockEmployees.filter((employee) => {
    const query = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query)
    );
  });

  const handleCreateEmployee = () => {
    setIsCreateOpen(false);
    toast({
      title: "Employee created",
      description: "Manual employee record created successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">
            Add manual employees and link them with HRIS records later.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employee Records</CardTitle>
          <CardDescription>Manual records can be linked to HRIS imports later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground py-8">
              <UserPlus className="w-6 h-6" />
              No employees found
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <div className="font-medium text-foreground">{employee.name}</div>
                  <div className="text-sm text-muted-foreground">{employee.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{employee.source}</Badge>
                  <Badge
                    variant="secondary"
                    className={employee.status === "Active" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}
                  >
                    {employee.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
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
              <Input id="employee-name" placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-email">Email</Label>
              <Input id="employee-email" type="email" placeholder="jane.doe@company.com" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEmployee}>Create Employee</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
