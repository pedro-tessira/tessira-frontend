import { Route } from "react-router-dom";
import WorkLayout from "@/modules/work/layouts/WorkLayout";
import ValueStreamsPage from "@/modules/work/pages/ValueStreamsPage";
import ValueStreamDetailPage from "@/modules/work/pages/ValueStreamDetailPage";
import DomainsPage from "@/modules/work/pages/DomainsPage";
import DomainDetailPage from "@/modules/work/pages/DomainDetailPage";
import InitiativesPage from "@/modules/work/pages/InitiativesPage";
import InitiativeDetailPage from "@/modules/work/pages/InitiativeDetailPage";

export const workRoutes = (
  <>
    <Route path="work" element={<WorkLayout />}>
      <Route index element={<ValueStreamsPage />} />
      <Route path="domains" element={<DomainsPage />} />
      <Route path="initiatives" element={<InitiativesPage />} />
    </Route>
    <Route path="work/value-streams/:valueStreamId" element={<ValueStreamDetailPage />} />
    <Route path="work/domains/:domainId" element={<DomainDetailPage />} />
    <Route path="work/initiatives/:initiativeId" element={<InitiativeDetailPage />} />
  </>
);
