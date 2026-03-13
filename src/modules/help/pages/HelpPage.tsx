import { HelpCircle, Book, MessageSquare, ExternalLink } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Help</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Documentation, support, and resources.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 max-w-3xl">
        {[
          { icon: Book, label: "Documentation", desc: "Guides, API reference, and tutorials" },
          { icon: MessageSquare, label: "Support", desc: "Contact the Tessira team" },
          { icon: ExternalLink, label: "Changelog", desc: "Latest updates and releases" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border/50 bg-card p-5 hover:bg-accent/30 tessira-transition cursor-pointer"
          >
            <item.icon size={20} strokeWidth={1.8} className="text-primary mb-3" />
            <h3 className="text-sm font-semibold">{item.label}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
