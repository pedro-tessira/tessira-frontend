import { Route } from "react-router-dom";
import LoginPage from "@/modules/auth/pages/LoginPage";
import SignupPage from "@/modules/auth/pages/SignupPage";
import { routePaths } from "./routePaths";

export const authRoutes = (
  <>
    <Route path={routePaths.auth.login} element={<LoginPage />} />
    <Route path={routePaths.auth.signup} element={<SignupPage />} />
  </>
);
