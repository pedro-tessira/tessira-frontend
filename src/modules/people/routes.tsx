import { Route } from "react-router-dom";
import PeopleOverviewPage from "@/modules/people/pages/PeopleOverviewPage";
import NineBoxPage from "@/modules/people/pages/NineBoxPage";
import EmployeeListPage from "@/modules/people/pages/EmployeeListPage";
import EmployeeDetailPage from "@/modules/people/pages/EmployeeDetailPage";
import TeamsListPage from "@/modules/people/pages/TeamsListPage";
import TeamDetailPage from "@/modules/people/pages/TeamDetailPage";

export const peopleRoutes = (
  <>
    <Route path="people" element={<PeopleOverviewPage />} />
    <Route path="people/9-box" element={<NineBoxPage />} />
    <Route path="people/employees" element={<EmployeeListPage />} />
    <Route path="people/employees/:employeeId" element={<EmployeeDetailPage />} />
    <Route path="people/teams" element={<TeamsListPage />} />
    <Route path="people/teams/:teamId" element={<TeamDetailPage />} />
  </>
);
