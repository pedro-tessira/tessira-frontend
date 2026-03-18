import { Route } from "react-router-dom";
import SignalsOverviewPage from "@/modules/signals/pages/SignalsOverviewPage";
import TeamSignalsPage from "@/modules/signals/pages/TeamSignalsPage";
import CapacityPage from "@/modules/signals/pages/CapacityPage";
import ResiliencePage from "@/modules/signals/pages/ResiliencePage";

export const signalsRoutes = (
  <>
    <Route path="signals" element={<SignalsOverviewPage />} />
    <Route path="signals/teams" element={<TeamSignalsPage />} />
    <Route path="signals/capacity" element={<CapacityPage />} />
    <Route path="signals/resilience" element={<ResiliencePage />} />
  </>
);
