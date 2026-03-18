import { Route } from "react-router-dom";
import SkillsOverviewPage from "@/modules/skills/pages/SkillsOverviewPage";
import SkillMatrixPage from "@/modules/skills/pages/SkillMatrixPage";
import CoveragePage from "@/modules/skills/pages/CoveragePage";
import RiskPage from "@/modules/skills/pages/RiskPage";

export const skillsRoutes = (
  <>
    <Route path="skills" element={<SkillsOverviewPage />} />
    <Route path="skills/matrix" element={<SkillMatrixPage />} />
    <Route path="skills/coverage" element={<CoveragePage />} />
    <Route path="skills/risk" element={<RiskPage />} />
  </>
);
