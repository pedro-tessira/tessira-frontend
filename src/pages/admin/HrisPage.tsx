import { Link } from "react-router-dom";
import { Building2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const integrations = [
  {
    id: "workday",
    name: "Workday",
    status: "connected",
    lastSync: "2 hours ago",
    description: "Sync employees and absences from Workday.",
  },
  {
    id: "bamboo",
    name: "BambooHR",
    status: "available",
    lastSync: null,
    description: "Connect BambooHR to import employee data.",
  },
  {
    id: "namely",
    name: "Namely",
    status: "coming-soon",
    lastSync: null,
    description: "Integrate Namely with Horizon.",
  },
];

export default function AdminHrisPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">HRIS Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect your HRIS tools to keep employee data in sync.
        </p>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {integration.name}
                </CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </div>
              {integration.status === "connected" && (
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  Connected
                </Badge>
              )}
              {integration.status === "available" && (
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Available
                </Badge>
              )}
              {integration.status === "coming-soon" && <Badge variant="secondary">Coming soon</Badge>}
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {integration.status === "connected" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                {integration.lastSync ? `Last synced ${integration.lastSync}` : "Not configured yet"}
              </div>
              <div className="flex items-center gap-2">
                {integration.status === "connected" ? (
                  <>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                    <Button size="sm">Sync now</Button>
                  </>
                ) : integration.status === "available" ? (
                  <Button size="sm">Connect</Button>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/help">Learn more</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
