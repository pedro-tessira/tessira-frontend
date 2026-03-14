import KPICards from "../components/KPICards";
import CapacityForecast from "../components/CapacityForecast";
import DeliveryStreamsLoad from "../components/DeliveryStreamsLoad";
import SkillCoverageHeatmap from "../components/SkillCoverageHeatmap";
import SystemResilienceMap from "../components/SystemResilienceMap";
import TeamAllocation from "../components/TeamAllocation";
import DeliveryRisk from "../components/DeliveryRisk";
import SignalsPanel from "../components/SignalsPanel";
import RecentActivity from "../components/RecentActivity";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Engineering capacity, skills coverage, and delivery risk at a glance.
        </p>
      </div>

      <KPICards />

      {/* Row 1: Capacity Forecast | Delivery Streams Load */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CapacityForecast />
        <DeliveryStreamsLoad />
      </div>

      {/* Row 2: Skill Coverage | System Resilience */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SkillCoverageHeatmap />
        <SystemResilienceMap />
      </div>

      {/* Row 3: Team Allocation | Delivery Risk */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TeamAllocation />
        <DeliveryRisk />
      </div>

      {/* Row 4: Signals | Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SignalsPanel />
        <RecentActivity />
      </div>
    </div>
  );
}
