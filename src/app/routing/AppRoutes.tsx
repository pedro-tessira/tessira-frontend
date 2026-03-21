import { Routes, Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";
import { platformRoutes } from "./PlatformRoutes";
import { tenantAppRoutes } from "./TenantAppRoutes";
import { PlatformRoute, ProtectedRoute } from "@/modules/auth/components/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      {landingRoutes}
      {authRoutes}
      <Route element={<PlatformRoute />}>{platformRoutes}</Route>
      <Route element={<ProtectedRoute />}>{tenantAppRoutes}</Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
