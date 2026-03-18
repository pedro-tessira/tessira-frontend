import { Route } from "react-router-dom";
import PlatformLayout from "@/modules/platform/layouts/PlatformLayout";
import PlatformTenantsPage from "@/modules/platform/pages/PlatformTenantsPage";
import PlatformUsersPage from "@/modules/platform/pages/PlatformUsersPage";
import PlatformSubscriptionsPage from "@/modules/platform/pages/PlatformSubscriptionsPage";
import PlatformUsagePage from "@/modules/platform/pages/PlatformUsagePage";
import PlatformFlagsPage from "@/modules/platform/pages/PlatformFlagsPage";
import PlatformAuditPage from "@/modules/platform/pages/PlatformAuditPage";
import PlatformSupportPage from "@/modules/platform/pages/PlatformSupportPage";
import { routePaths } from "./routePaths";

export const platformRoutes = (
  <Route path={routePaths.platform.root} element={<PlatformLayout />}>
    <Route index element={<PlatformTenantsPage />} />
    <Route path="users" element={<PlatformUsersPage />} />
    <Route path="subscriptions" element={<PlatformSubscriptionsPage />} />
    <Route path="usage" element={<PlatformUsagePage />} />
    <Route path="flags" element={<PlatformFlagsPage />} />
    <Route path="audit" element={<PlatformAuditPage />} />
    <Route path="support" element={<PlatformSupportPage />} />
  </Route>
);
