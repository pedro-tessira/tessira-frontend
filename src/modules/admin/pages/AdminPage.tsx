import { Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          System settings, integrations, and workspace configuration.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "General", desc: "Workspace name, timezone, defaults" },
          { label: "Integrations", desc: "Connect external tools and data sources" },
          { label: "Team Settings", desc: "Roles, permissions, and access control" },
          { label: "Data Import", desc: "Bulk import teams, skills, and timelines" },
          { label: "Notifications", desc: "Alert preferences and delivery channels" },
          { label: "API Access", desc: "Manage API keys and webhooks" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border/50 bg-card p-4 hover:bg-accent/30 tessira-transition cursor-pointer"
          >
            <h3 className="text-sm font-semibold">{item.label}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
