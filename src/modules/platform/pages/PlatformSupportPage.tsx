import { Wrench } from "lucide-react";

export default function PlatformSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Support Tools</h1>
        <p className="mt-1 text-sm text-muted-foreground">Debugging and support utilities.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { title: "Impersonate User", desc: "Access tenant as a specific user for debugging." },
          { title: "Clear Cache", desc: "Invalidate platform or tenant-level caches." },
          { title: "Run Diagnostics", desc: "Health check across all services." },
          { title: "Export Tenant Data", desc: "Generate a full data export for a tenant." },
        ].map((tool) => (
          <button
            key={tool.title}
            className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-5 text-left hover:bg-accent/50 tessira-transition"
          >
            <Wrench size={16} className="mt-0.5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{tool.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{tool.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
