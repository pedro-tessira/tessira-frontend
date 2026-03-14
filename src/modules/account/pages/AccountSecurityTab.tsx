import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default function AccountSecurityTab() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">Password</h2>
        <p className="text-xs text-muted-foreground">Last changed 45 days ago.</p>
        <Button variant="outline" size="sm">Change Password</Button>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Two-Factor Authentication</h2>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">Enabled</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck size={14} />
          <span>Authenticator app configured.</span>
        </div>
        <Button variant="outline" size="sm">Manage 2FA</Button>
      </div>
    </div>
  );
}
