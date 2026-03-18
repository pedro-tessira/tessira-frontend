import { Route } from "react-router-dom";
import HorizonLayout from "@/modules/horizon/layouts/HorizonLayout";
import HorizonOverviewPage from "@/modules/horizon/pages/HorizonOverviewPage";
import TimelinePage from "@/modules/horizon/pages/TimelinePage";
import CapacityIntelligencePage from "@/modules/horizon/pages/CapacityIntelligencePage";
import SharePage from "@/modules/horizon/pages/SharePage";

export const horizonRoutes = (
  <Route path="horizon" element={<HorizonLayout />}>
    <Route index element={<HorizonOverviewPage />} />
    <Route path="timeline" element={<TimelinePage />} />
    <Route path="capacity" element={<CapacityIntelligencePage />} />
    <Route path="share" element={<SharePage />} />
  </Route>
);
