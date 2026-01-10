import { useMemo, useState } from "react";
import { Search, Filter, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuditEvents } from "@/queries/useAuditEvents";

export default function AdminAuditPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultFrom = useMemo(() => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 30);
    return fromDate.toISOString().slice(0, 10);
  }, []);
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(today);
  const { data: auditEvents = [], isLoading } = useAuditEvents({
    from: fromDate,
    to: toDate,
  });

  const filteredLogs = useMemo(() => {
    const normalized = query.toLowerCase();
    return auditEvents.filter((event) => {
      const name = event.eventType?.name ?? event.eventType?.code ?? "Event";
      return [
        name,
        event.scope ?? "",
        event.teamId ?? "",
        event.employeeId ?? "",
        event.title ?? "",
      ].some((field) => field.toLowerCase().includes(normalized));
    });
  }, [auditEvents, query]);

  const getScopeStyle = (scope: string) => {
    switch (scope) {
      case "GLOBAL":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-green-50 text-green-700";
    }
  };

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
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "7d", days: 7 },
                  { label: "30d", days: 30 },
                  { label: "90d", days: 90 },
                ].map((preset) => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - preset.days);
                  const presetFrom = start.toISOString().slice(0, 10);
                  const presetTo = end.toISOString().slice(0, 10);
                  const isActive = fromDate === presetFrom && toDate === presetTo;
                  return (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setToDate(presetTo);
                      setFromDate(presetFrom);
                    }}
                  >
                    {preset.label}
                  </Button>
                  );
                })}
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={fromDate}
                  max={toDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="h-32 flex items-center justify-center text-sm text-muted-foreground">
              Loading audit events...
            </CardContent>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="h-32 flex items-center justify-center text-sm text-muted-foreground">
              No audit events found.
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((event) => {
            const name = event.eventType?.name ?? event.eventType?.code ?? "Event";
            const scopeLabel = event.scope ?? "INDIVIDUAL";
            const timeLabel = event.deletedAt
              ? `Deleted at ${new Date(event.deletedAt).toLocaleString()}`
              : event.startDate
              ? `Start: ${event.startDate}`
              : "—";
            return (
              <Card key={event.id}>
                <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <CardDescription>
                      Scope: {scopeLabel} · Team: {event.teamId ?? "—"} · Employee:{" "}
                      {event.employeeId ?? "—"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className={getScopeStyle(scopeLabel)}>
                    {scopeLabel.toLowerCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {timeLabel}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
