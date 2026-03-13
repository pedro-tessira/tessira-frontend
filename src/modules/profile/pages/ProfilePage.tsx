export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account settings and preferences.
        </p>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-6 max-w-lg space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/30" />
          <div>
            <div className="text-sm font-semibold">Engineering Lead</div>
            <div className="text-xs text-muted-foreground">lead@tessira.dev</div>
          </div>
        </div>
        <div className="border-t border-border/50 pt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
            <p className="text-sm">Engineering Manager</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timezone</label>
            <p className="text-sm">UTC+0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
