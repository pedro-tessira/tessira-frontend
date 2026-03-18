import { Route } from "react-router-dom";
import AdminLayout from "@/modules/admin/layouts/AdminLayout";
import AdminOverviewPage from "@/modules/admin/pages/AdminOverviewPage";
import AccessPage from "@/modules/admin/pages/AccessPage";
import UsersPage from "@/modules/admin/pages/UsersPage";
import RolesPage from "@/modules/admin/pages/RolesPage";
import LinkingPage from "@/modules/admin/pages/LinkingPage";
import GovernancePage from "@/modules/admin/pages/GovernancePage";
import AuditPage from "@/modules/admin/pages/AuditPage";
import AdminUserDetailPage from "@/modules/admin/pages/AdminUserDetailPage";

export const adminRoutes = (
  <>
    <Route path="admin" element={<AdminLayout />}>
      <Route index element={<AdminOverviewPage />} />
      <Route path="access" element={<AccessPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="roles" element={<RolesPage />} />
      <Route path="linking" element={<LinkingPage />} />
      <Route path="governance" element={<GovernancePage />} />
      <Route path="audit" element={<AuditPage />} />
    </Route>
    <Route path="admin/users/:userId" element={<AdminUserDetailPage />} />
  </>
);
