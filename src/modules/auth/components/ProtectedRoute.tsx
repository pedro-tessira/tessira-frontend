import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { routePaths } from "@/app/routing/routePaths";
import { useAuth } from "@/modules/auth/contexts/AuthContext";

export function ProtectedRoute() {
  const location = useLocation();
  const { status, isAuthenticated } = useAuth();

  if (status === "bootstrapping") {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={routePaths.auth.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function PlatformRoute() {
  const { status, isAuthenticated, isPlatformAdmin } = useAuth();

  if (status === "bootstrapping") {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={routePaths.auth.login} replace />;
  }

  if (!isPlatformAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-6 text-center">
          <h1 className="text-lg font-semibold tracking-tight">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your current role does not allow access to platform administration.
          </p>
          <Button className="mt-4" asChild>
            <Link to={routePaths.app.overview}>Return to workspace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
