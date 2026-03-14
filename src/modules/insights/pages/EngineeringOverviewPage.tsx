import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Gauge,
  Brain,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  orgKPIs,
  deliveryTrend,
  capacityUtilization,
  skillDistribution,
  escalationsTrend,
  teamsAtRisk,
  recentEscalations,
} from "../data/mockInsightsData";
import { useNavigate } from "react-router-dom";

const kpiIcons = [Activity, Gauge, TrendingUp, Brain];

function KPIRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {orgKPIs.map((kpi, i) => {
        const Icon = kpiIcons[i];
        const isUp = kpi.trend === "up";
        return (
          <div
            key={kpi.label}
            className="rounded-lg border border-border/50 bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {kpi.label}
              </span>
              <Icon size={15} className="text-muted-foreground/50" />
            </div>
            <div className="text-2xl font-bold tabular-nums">{kpi.value}</div>
            <div className="flex items-center gap-1.5 text-xs">
              {isUp ? (
                <TrendingUp size={12} className="text-[hsl(var(--success))]" />
              ) : (
                <TrendingDown size={12} className="text-[hsl(var(--warning))]" />
              )}
              <span className={isUp ? "text-[hsl(var(--success))]" : "text-[hsl(var(--warning))]"}>
                {kpi.delta}
              </span>
              <span className="text-muted-foreground">vs last sprint</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const chartCardClass =
  "rounded-lg border border-border/50 bg-card p-5 space-y-4";
const chartTitleClass =
  "text-xs font-medium text-muted-foreground uppercase tracking-wider";

function DeliveryTrendChart() {
  return (
    <div className={chartCardClass}>
      <span className={chartTitleClass}>Delivery Trend</span>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={deliveryTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250 10% 18%)" />
            <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: "hsl(240 8% 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(240 8% 55%)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(256 18% 10%)", border: "1px solid hsl(250 10% 18%)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(210 20% 93%)" }}
            />
            <Line type="monotone" dataKey="commits" stroke="hsl(260 40% 55%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="prs" stroke="hsl(200 60% 50%)" strokeWidth={2} dot={{ r: 3 }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "hsl(240 8% 55%)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CapacityChart() {
  return (
    <div className={chartCardClass}>
      <span className={chartTitleClass}>Capacity Utilization</span>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={capacityUtilization} layout="vertical" barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250 10% 18%)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(240 8% 55%)" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="team" type="category" width={70} tick={{ fontSize: 11, fill: "hsl(240 8% 55%)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(256 18% 10%)", border: "1px solid hsl(250 10% 18%)", borderRadius: 8, fontSize: 12 }}
              formatter={(value: number) => [`${value}%`, "Utilization"]}
            />
            <Bar dataKey="utilization" radius={[0, 4, 4, 0]} fill="hsl(260 40% 55%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SkillCoverageDonut() {
  return (
    <div className={chartCardClass}>
      <span className={chartTitleClass}>Skill Coverage Distribution</span>
      <div className="h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={skillDistribution}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {skillDistribution.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(256 18% 10%)", border: "1px solid hsl(250 10% 18%)", borderRadius: 8, fontSize: 12 }}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "hsl(240 8% 55%)" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EscalationsChart() {
  return (
    <div className={chartCardClass}>
      <span className={chartTitleClass}>Escalations Trend</span>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={escalationsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250 10% 18%)" />
            <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: "hsl(240 8% 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(240 8% 55%)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(256 18% 10%)", border: "1px solid hsl(250 10% 18%)", borderRadius: 8, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="escalations" stroke="hsl(0 62% 40%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="resolved" stroke="hsl(142 50% 45%)" strokeWidth={2} dot={{ r: 3 }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "hsl(240 8% 55%)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const riskColors = { critical: "text-destructive", warning: "text-[hsl(var(--warning))]", healthy: "text-[hsl(var(--success))]" };
const severityColors = { high: "bg-destructive/15 text-destructive", medium: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]", low: "bg-muted text-muted-foreground" };

function RiskRow() {
  const navigate = useNavigate();
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Teams at Risk */}
      <div className={chartCardClass}>
        <span className={chartTitleClass}>Teams at Risk</span>
        <div className="space-y-3">
          {teamsAtRisk.map((t) => (
            <button
              key={t.team}
              onClick={() => navigate(`/app/insights/team/${t.team.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`)}
              className="flex w-full items-start gap-3 rounded-md p-2 text-left hover:bg-accent/40 tessira-transition"
            >
              <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${riskColors[t.risk]}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.team}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.reason}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SPOF Exposure */}
      <div className={chartCardClass}>
        <span className={chartTitleClass}>SPOF Exposure</span>
        <div className="space-y-3">
          {teamsAtRisk.map((t) => (
            <div key={t.team} className="flex items-center justify-between">
              <span className="text-sm">{t.team}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 rounded-full bg-muted" style={{ width: 80 }}>
                  <div
                    className="h-2 rounded-full bg-destructive"
                    style={{ width: `${(t.spofs / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground w-4 text-right">{t.spofs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Escalations */}
      <div className={chartCardClass}>
        <span className={chartTitleClass}>Recent Escalations</span>
        <div className="space-y-3">
          {recentEscalations.map((e) => (
            <div key={e.id} className="flex items-start gap-3">
              <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{e.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[e.severity]}`}>
                    {e.severity}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{e.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EngineeringOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Engineering Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global engineering health, delivery trends, and risk indicators.
        </p>
      </div>

      <KPIRow />

      <div className="grid gap-4 lg:grid-cols-2">
        <DeliveryTrendChart />
        <CapacityChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SkillCoverageDonut />
        <EscalationsChart />
      </div>

      <RiskRow />
    </div>
  );
}
