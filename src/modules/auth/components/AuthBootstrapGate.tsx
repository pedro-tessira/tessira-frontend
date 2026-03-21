import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/modules/auth/contexts/AuthContext";

export function AuthBootstrapGate({ children }: { children: ReactNode }) {
  const { status, bootstrapError, refreshSession } = useAuth();

  if (status !== "bootstrapping") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-lg font-semibold">T</span>
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Loading your workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tessira is validating your session and loading the available organization context.
        </p>
        {bootstrapError ? (
          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left">
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{bootstrapError.message}</p>
                {bootstrapError.traceId ? (
                  <p className="mt-1 text-xs text-muted-foreground">Trace ID: {bootstrapError.traceId}</p>
                ) : null}
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void refreshSession()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            Checking session
          </div>
        )}
      </div>
    </div>
  );
}
