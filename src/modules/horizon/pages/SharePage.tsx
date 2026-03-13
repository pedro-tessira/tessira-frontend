import { useState } from "react";
import { shareLinks } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, Plus, Link2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function SharePage() {
  const [links] = useState(shareLinks);

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Share link copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center gap-3 mb-2">
          <Link2 size={18} className="text-primary" />
          <h2 className="text-sm font-semibold">Public Share Links</h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-xl">
          Create read-only views of your timelines that can be shared with stakeholders outside of Tessira.
          Share links are scoped to company, team, or individual timelines and can be set to expire.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Active Links</h2>
        <Button size="sm" className="h-8 text-xs gap-1.5">
          <Plus size={13} />
          Create Link
        </Button>
      </div>

      {/* Links list */}
      <div className="space-y-3">
        {links.map((link) => (
          <div
            key={link.id}
            className="rounded-lg border border-border/50 bg-card p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{link.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[11px] capitalize">
                    {link.scope}
                  </Badge>
                  {link.scopeName && (
                    <span className="text-xs text-muted-foreground">{link.scopeName}</span>
                  )}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[11px]",
                      link.isActive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {link.isActive ? "Active" : "Disabled"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyLink(link.token)}
                >
                  <Copy size={13} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => window.open(`/share/${link.token}`, "_blank")}
                >
                  <ExternalLink size={13} />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Input
                  readOnly
                  value={`${window.location.origin}/share/${link.token}`}
                  className="h-7 text-xs font-mono bg-muted/50 max-w-xs"
                />
              </div>
              <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
              {link.expiresAt && (
                <span>Expires {new Date(link.expiresAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="rounded-lg border border-border/50 bg-card py-8 text-center text-sm text-muted-foreground">
            No share links created yet.
          </div>
        )}
      </div>
    </div>
  );
}
