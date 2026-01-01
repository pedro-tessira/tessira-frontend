import { useState } from "react";
import { Search, Filter, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockLogs = [
  { id: "1", action: "SSO settings updated", actor: "John Doe", time: "2024-12-31 14:22", type: "security" },
  { id: "2", action: "Workday sync completed", actor: "System", time: "2024-12-31 13:45", type: "sync" },
  { id: "3", action: "User Jane Smith granted ADMIN role", actor: "John Doe", time: "2024-12-31 12:30", type: "access" },
  { id: "4", action: "Event type 'Vacation' updated", actor: "John Doe", time: "2024-12-31 11:05", type: "config" },
  { id: "5", action: "Manual user created", actor: "Jane Smith", time: "2024-12-30 16:10", type: "access" },
];

const typeStyles: Record<string, string> = {
  security: "bg-amber-50 text-amber-700",
  sync: "bg-blue-50 text-blue-700",
  access: "bg-purple-50 text-purple-700",
  config: "bg-green-50 text-green-700",
};

export default function AdminAuditPage() {
  const [query, setQuery] = useState("");

  const filteredLogs = mockLogs.filter((log) =>
    [log.action, log.actor, log.type].some((field) =>
      field.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audit & Health</h1>
          <p className="text-muted-foreground mt-1">
            Track system activity and monitor health events.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search audit logs..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-lg">{log.action}</CardTitle>
                <CardDescription>{log.actor}</CardDescription>
              </div>
              <Badge variant="secondary" className={typeStyles[log.type] ?? ""}>
                {log.type}
              </Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {log.time}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
