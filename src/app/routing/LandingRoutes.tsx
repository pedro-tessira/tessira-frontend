import { Route } from "react-router-dom";
import LandingPage from "@/modules/landing/pages/LandingPage";
import { routePaths } from "./routePaths";

export const landingRoutes = (
  <Route path={routePaths.landing} element={<LandingPage />} />
);
