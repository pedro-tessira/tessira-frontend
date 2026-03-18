import { Route } from "react-router-dom";
import AccountPage from "@/modules/account/pages/AccountPage";
import AccountProfileTab from "@/modules/account/pages/AccountProfileTab";
import AccountSecurityTab from "@/modules/account/pages/AccountSecurityTab";
import AccountSessionsTab from "@/modules/account/pages/AccountSessionsTab";
import AccountNotificationsTab from "@/modules/account/pages/AccountNotificationsTab";
import AccountTokensTab from "@/modules/account/pages/AccountTokensTab";

export const accountRoutes = (
  <Route path="account" element={<AccountPage />}>
    <Route index element={<AccountProfileTab />} />
    <Route path="security" element={<AccountSecurityTab />} />
    <Route path="sessions" element={<AccountSessionsTab />} />
    <Route path="notifications" element={<AccountNotificationsTab />} />
    <Route path="tokens" element={<AccountTokensTab />} />
  </Route>
);
