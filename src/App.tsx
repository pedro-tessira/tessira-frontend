import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppShell } from "@/shared/layouts/AppShell";
import LandingPage from "@/modules/landing/pages/LandingPage";
import OverviewPage from "@/modules/overview/pages/OverviewPage";
import HorizonPage from "@/modules/horizon/pages/HorizonPage";
import PeopleOverviewPage from "@/modules/people/pages/PeopleOverviewPage";
import EmployeeListPage from "@/modules/people/pages/EmployeeListPage";
import EmployeeDetailPage from "@/modules/people/pages/EmployeeDetailPage";
import TeamsListPage from "@/modules/people/pages/TeamsListPage";
import TeamDetailPage from "@/modules/people/pages/TeamDetailPage";
import SkillsPage from "@/modules/skills/pages/SkillsPage";
import SignalsPage from "@/modules/signals/pages/SignalsPage";
import AdminPage from "@/modules/admin/pages/AdminPage";
import ProfilePage from "@/modules/profile/pages/ProfilePage";
import HelpPage from "@/modules/help/pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="horizon/*" element={<HorizonPage />} />
            <Route path="people" element={<PeopleOverviewPage />} />
            <Route path="people/employees" element={<EmployeeListPage />} />
            <Route path="people/employees/:employeeId" element={<EmployeeDetailPage />} />
            <Route path="people/teams" element={<TeamsListPage />} />
            <Route path="people/teams/:teamId" element={<TeamDetailPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="signals" element={<SignalsPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="help" element={<HelpPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
