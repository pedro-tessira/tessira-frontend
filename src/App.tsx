import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TenantProvider } from "@/shared/contexts/TenantContext";

import { AppShell } from "@/shared/layouts/AppShell";
import LandingPage from "@/modules/landing/pages/LandingPage";
import OverviewPage from "@/modules/overview/pages/OverviewPage";
import HorizonLayout from "@/modules/horizon/layouts/HorizonLayout";
import HorizonOverviewPage from "@/modules/horizon/pages/HorizonOverviewPage";
import TimelinePage from "@/modules/horizon/pages/TimelinePage";
import CapacityIntelligencePage from "@/modules/horizon/pages/CapacityIntelligencePage";
import SharePage from "@/modules/horizon/pages/SharePage";
import PeopleOverviewPage from "@/modules/people/pages/PeopleOverviewPage";
import NineBoxPage from "@/modules/people/pages/NineBoxPage";
import EmployeeListPage from "@/modules/people/pages/EmployeeListPage";
import EmployeeDetailPage from "@/modules/people/pages/EmployeeDetailPage";
import TeamsListPage from "@/modules/people/pages/TeamsListPage";
import TeamDetailPage from "@/modules/people/pages/TeamDetailPage";
import SkillsOverviewPage from "@/modules/skills/pages/SkillsOverviewPage";
import SkillMatrixPage from "@/modules/skills/pages/SkillMatrixPage";
import CoveragePage from "@/modules/skills/pages/CoveragePage";
import RiskPage from "@/modules/skills/pages/RiskPage";
import SignalsOverviewPage from "@/modules/signals/pages/SignalsOverviewPage";
import TeamSignalsPage from "@/modules/signals/pages/TeamSignalsPage";
import CapacityPage from "@/modules/signals/pages/CapacityPage";
import ResiliencePage from "@/modules/signals/pages/ResiliencePage";
import EngineeringOverviewPage from "@/modules/insights/pages/EngineeringOverviewPage";
import TeamInsightsPage from "@/modules/insights/pages/TeamInsightsPage";
import AdminLayout from "@/modules/admin/layouts/AdminLayout";
import AdminOverviewPage from "@/modules/admin/pages/AdminOverviewPage";
import AccessPage from "@/modules/admin/pages/AccessPage";
import UsersPage from "@/modules/admin/pages/UsersPage";
import LinkingPage from "@/modules/admin/pages/LinkingPage";
import GovernancePage from "@/modules/admin/pages/GovernancePage";
import AuditPage from "@/modules/admin/pages/AuditPage";
import HelpPage from "@/modules/help/pages/HelpPage";
import NotFound from "./pages/NotFound";

// Work
import WorkLayout from "@/modules/work/layouts/WorkLayout";
import StreamsPage from "@/modules/work/pages/StreamsPage";
import StreamDetailPage from "@/modules/work/pages/StreamDetailPage";
import InitiativesPage from "@/modules/work/pages/InitiativesPage";
import InitiativeDetailPage from "@/modules/work/pages/InitiativeDetailPage";

// Account
import AccountPage from "@/modules/account/pages/AccountPage";
import AccountProfileTab from "@/modules/account/pages/AccountProfileTab";
import AccountSecurityTab from "@/modules/account/pages/AccountSecurityTab";
import AccountSessionsTab from "@/modules/account/pages/AccountSessionsTab";
import AccountNotificationsTab from "@/modules/account/pages/AccountNotificationsTab";
import AccountTokensTab from "@/modules/account/pages/AccountTokensTab";

// Platform Admin
import PlatformLayout from "@/modules/platform/layouts/PlatformLayout";
import PlatformTenantsPage from "@/modules/platform/pages/PlatformTenantsPage";
import PlatformUsersPage from "@/modules/platform/pages/PlatformUsersPage";
import PlatformSubscriptionsPage from "@/modules/platform/pages/PlatformSubscriptionsPage";
import PlatformUsagePage from "@/modules/platform/pages/PlatformUsagePage";
import PlatformFlagsPage from "@/modules/platform/pages/PlatformFlagsPage";
import PlatformAuditPage from "@/modules/platform/pages/PlatformAuditPage";
import PlatformSupportPage from "@/modules/platform/pages/PlatformSupportPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TenantProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Platform Admin — separate control plane */}
            <Route path="/platform" element={<PlatformLayout />}>
              <Route index element={<PlatformTenantsPage />} />
              <Route path="users" element={<PlatformUsersPage />} />
              <Route path="subscriptions" element={<PlatformSubscriptionsPage />} />
              <Route path="usage" element={<PlatformUsagePage />} />
              <Route path="flags" element={<PlatformFlagsPage />} />
              <Route path="audit" element={<PlatformAuditPage />} />
              <Route path="support" element={<PlatformSupportPage />} />
            </Route>

            {/* Tenant App */}
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Navigate to="/app/overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="work" element={<WorkLayout />}>
                <Route index element={<StreamsPage />} />
                <Route path="initiatives" element={<InitiativesPage />} />
              </Route>
              <Route path="work/streams/:streamId" element={<StreamDetailPage />} />
              <Route path="work/initiatives/:initiativeId" element={<InitiativeDetailPage />} />
              <Route path="horizon" element={<HorizonLayout />}>
                <Route index element={<HorizonOverviewPage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="capacity" element={<CapacityIntelligencePage />} />
                <Route path="share" element={<SharePage />} />
              </Route>
              <Route path="people" element={<PeopleOverviewPage />} />
              <Route path="people/9-box" element={<NineBoxPage />} />
              <Route path="people/employees" element={<EmployeeListPage />} />
              <Route path="people/employees/:employeeId" element={<EmployeeDetailPage />} />
              <Route path="people/teams" element={<TeamsListPage />} />
              <Route path="people/teams/:teamId" element={<TeamDetailPage />} />
              <Route path="skills" element={<SkillsOverviewPage />} />
              <Route path="skills/matrix" element={<SkillMatrixPage />} />
              <Route path="skills/coverage" element={<CoveragePage />} />
              <Route path="skills/risk" element={<RiskPage />} />
              <Route path="signals" element={<SignalsOverviewPage />} />
              <Route path="signals/teams" element={<TeamSignalsPage />} />
              <Route path="signals/capacity" element={<CapacityPage />} />
              <Route path="signals/resilience" element={<ResiliencePage />} />
              <Route path="insights" element={<EngineeringOverviewPage />} />
              <Route path="insights/team/:teamId" element={<TeamInsightsPage />} />

              {/* Org Settings (tenant admin) */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="access" element={<AccessPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="linking" element={<LinkingPage />} />
                <Route path="governance" element={<GovernancePage />} />
                <Route path="audit" element={<AuditPage />} />
              </Route>

              {/* Personal Account */}
              <Route path="account" element={<AccountPage />}>
                <Route index element={<AccountProfileTab />} />
                <Route path="security" element={<AccountSecurityTab />} />
                <Route path="sessions" element={<AccountSessionsTab />} />
                <Route path="notifications" element={<AccountNotificationsTab />} />
                <Route path="tokens" element={<AccountTokensTab />} />
              </Route>

              <Route path="help" element={<HelpPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TenantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
