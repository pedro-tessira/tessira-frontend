import { Navigate, Route } from "react-router-dom";
import { AppShell } from "@/shared/layouts/AppShell";
import OverviewPage from "@/modules/overview/pages/OverviewPage";
import HelpPage from "@/modules/help/pages/HelpPage";
import { workRoutes } from "@/modules/work/routes";
import { horizonRoutes } from "@/modules/horizon/routes";
import { peopleRoutes } from "@/modules/people/routes";
import { skillsRoutes } from "@/modules/skills/routes";
import { signalsRoutes } from "@/modules/signals/routes";
import { insightsRoutes } from "@/modules/insights/routes";
import { adminRoutes } from "@/modules/admin/routes";
import { accountRoutes } from "@/modules/account/routes";
import { TenantAdminRoute } from "@/modules/auth/components/ProtectedRoute";
import { routePaths } from "./routePaths";

export const tenantAppRoutes = (
  <Route path={routePaths.app.root} element={<AppShell />}>
    <Route index element={<Navigate to={routePaths.app.overview} replace />} />
    <Route path="overview" element={<OverviewPage />} />
    {workRoutes}
    {horizonRoutes}
    {peopleRoutes}
    {skillsRoutes}
    {signalsRoutes}
    {insightsRoutes}
    <Route element={<TenantAdminRoute />}>{adminRoutes}</Route>
    {accountRoutes}
    <Route path="help" element={<HelpPage />} />
  </Route>
);
