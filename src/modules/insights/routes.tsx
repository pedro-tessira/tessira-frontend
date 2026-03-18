import { Route } from "react-router-dom";
import EngineeringOverviewPage from "@/modules/insights/pages/EngineeringOverviewPage";
import TeamInsightsPage from "@/modules/insights/pages/TeamInsightsPage";

export const insightsRoutes = (
  <>
    <Route path="insights" element={<EngineeringOverviewPage />} />
    <Route path="insights/team/:teamId" element={<TeamInsightsPage />} />
  </>
);
