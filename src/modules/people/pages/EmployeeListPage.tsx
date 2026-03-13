import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Download } from "lucide-react";
import { ModulePageHeader } from "../components/ModulePageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { AvatarInitials } from "../components/AvatarInitials";
import { MOCK_EMPLOYEES } from "../data";
import type { EmployeeStatus } from "../types";

const STATUS_OPTIONS: { value: EmployeeStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "offboarding", label: "Offboarding" },
  { value: "inactive", label: "Inactive" },
];

const DEPT_OPTIONS = ["All Departments", ...new Set(MOCK_EMPLOYEES.map((e) => e.department))];

export default function EmployeeListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "all">("all");
  const [deptFilter, setDeptFilter] = useState("All Departments");

  const filtered = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      const matchesSearch =
        search === "" ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      const matchesDept = deptFilter === "All Departments" || emp.department === deptFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [search, statusFilter, deptFilter]);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Employees"
        description={`${MOCK_EMPLOYEES.length} employees across the organization.`}
        breadcrumbs={[
          { label: "People", href: "/app/people" },
          { label: "Employees" },
        ]}
        actions={
          <button className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent tessira-transition">
            <Download size={13} />
            Export
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search by name, email, or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border/50 bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | "all")}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary tessira-transition"
        >
          {DEPT_OPTIONS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        {(search || statusFilter !== "all" || deptFilter !== "All Departments") && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); setDeptFilter("All Departments"); }}
            className="text-xs text-muted-foreground hover:text-foreground tessira-transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Employee
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Department
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Country
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Manager
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-accent/20 tessira-transition">
                  <td className="px-4 py-3">
                    <Link
                      to={`/app/people/employees/${emp.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <AvatarInitials firstName={emp.firstName} lastName={emp.lastName} size="sm" />
                      <div className="min-w-0">
                        <div className="font-medium text-foreground group-hover:text-primary tessira-transition truncate">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{emp.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.department}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-xs">{emp.countryCode}</span>
                      {emp.country}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {emp.managerName ? (
                      <Link
                        to={`/app/people/employees/${emp.managerId}`}
                        className="text-muted-foreground hover:text-primary tessira-transition"
                      >
                        {emp.managerName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={emp.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Filter size={24} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">No employees match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="border-t border-border/50 px-4 py-2.5 text-xs text-muted-foreground">
            Showing {filtered.length} of {MOCK_EMPLOYEES.length} employees
          </div>
        )}
      </div>
    </div>
  );
}
