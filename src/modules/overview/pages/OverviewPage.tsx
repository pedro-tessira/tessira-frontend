import { useState } from "react";
import KPICards from "../components/KPICards";
import CapacityForecast from "../components/CapacityForecast";
import InitiativeAllocationChart from "../components/DeliveryStreamsLoad";
import SkillCoverageHeatmap from "../components/SkillCoverageHeatmap";
import SystemResilienceMap from "../components/SystemResilienceMap";
import TeamAllocation from "../components/TeamAllocation";
import DeliveryRisk from "../components/DeliveryRisk";
import SignalsPanel from "../components/SignalsPanel";
import RecentActivity from "../components/RecentActivity";
import DashboardFilters, { type DashboardFilterValues } from "../components/DashboardFilters";

export default function OverviewPage() {
  const [filters, setFilters] = useState<DashboardFilterValues>({
    dateRange: "4w",
    team: "all",
    domain: "all",
  });

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Engineering capacity, initiative staffing, and delivery risk at a glance.
          </p>
        </div>
        <DashboardFilters filters={filters} onChange={setFilters} />
      </div>

      <KPICards />

      {/* Row 1: Capacity Forecast | Initiative Allocation */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CapacityForecast />
        <InitiativeAllocationChart domainFilter={filters.domain} />
      </div>

      {/* Row 2: Skill Coverage | System Resilience */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SkillCoverageHeatmap teamFilter={filters.team} />
        <SystemResilienceMap />
      </div>

      {/* Row 3: Team Allocation | Delivery Risk */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TeamAllocation teamFilter={filters.team} />
        <DeliveryRisk domainFilter={filters.domain} />
      </div>

      {/* Row 4: Signals | Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SignalsPanel />
        <RecentActivity />
      </div>
    </div>
  );
}
