import { Routes, Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";
import { platformRoutes } from "./PlatformRoutes";
import { tenantAppRoutes } from "./TenantAppRoutes";

export function AppRoutes() {
  return (
    <Routes>
      {landingRoutes}
      {authRoutes}
      {platformRoutes}
      {tenantAppRoutes}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
