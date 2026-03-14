import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Key } from "lucide-react";

const tokens = [
  { id: "tk1", name: "CI Pipeline", prefix: "tsr_...a3f2", createdAt: "2025-10-15", lastUsed: "2026-03-14", scopes: ["read", "write"] },
  { id: "tk2", name: "Monitoring", prefix: "tsr_...b8c1", createdAt: "2026-01-20", lastUsed: "2026-03-12", scopes: ["read"] },
];

export default function AccountTokensTab() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex justify-end">
        <Button size="sm">
          <Plus size={14} className="mr-1" />
          Create Token
        </Button>
      </div>

      <div className="space-y-2">
        {tokens.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <Key size={14} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{t.prefix} · Last used {t.lastUsed}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {t.scopes.map((s) => (
                <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
              ))}
              <Button variant="ghost" size="sm" className="text-destructive text-xs">Revoke</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
