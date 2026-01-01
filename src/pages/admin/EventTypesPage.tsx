import { useState } from "react";
import { Plus, Search, RefreshCw, Link2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const mockEventTypes = [
  { id: "1", name: "Vacation", code: "VACATION", scope: "Global", source: "Manual", sync: true },
  { id: "2", name: "Sick Leave", code: "SICK_LEAVE", scope: "Global", source: "Workday", sync: true },
  { id: "3", name: "Parental Leave", code: "PARENTAL", scope: "Global", source: "Workday", sync: false },
  { id: "4", name: "Training", code: "TRAINING", scope: "Team", source: "Manual", sync: false },
  { id: "5", name: "Conference", code: "CONFERENCE", scope: "Team", source: "Manual", sync: false },
];

export default function AdminEventTypesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEventTypes = mockEventTypes.filter((eventType) => {
    const query = searchQuery.toLowerCase();
    return (
      eventType.name.toLowerCase().includes(query) ||
      eventType.code.toLowerCase().includes(query)
    );
  });

  const handleSyncAll = () => {
    toast({
      title: "Sync started",
      description: "Event types sync has been triggered.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Event Types & Sync</h1>
          <p className="text-muted-foreground mt-1">
            Manage event types and configure HRIS sync settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSyncAll} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Event Type
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search event types..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredEventTypes.map((eventType) => (
          <Card key={eventType.id}>
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-lg">{eventType.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline">{eventType.code}</Badge>
                  <Badge variant="secondary">{eventType.scope}</Badge>
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={eventType.source === "Workday" ? "bg-blue-50 text-blue-700" : ""}
              >
                {eventType.source}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {eventType.source === "Workday" ? (
                  <Link2 className="w-4 h-4 text-primary" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                {eventType.source === "Workday"
                  ? "Linked to HRIS event type"
                  : "Manual event type"}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={eventType.sync} />
                  <span className="text-sm text-muted-foreground">Sync</span>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
