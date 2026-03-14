import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Users2, Folder, AlertTriangle, ArrowLeft } from "lucide-react";
import { teamInsightsData } from "../data/mockInsightsData";

const chartCard = "rounded-lg border border-border/50 bg-card p-5 space-y-4";
const chartTitle = "text-xs font-medium text-muted-foreground uppercase tracking-wider";
const tooltipStyle = {
  backgroundColor: "hsl(256 18% 10%)",
  border: "1px solid hsl(250 10% 18%)",
  borderRadius: 8,
  fontSize: 12,
};
const axisProps = { tick: { fontSize: 11, fill: "hsl(240 8% 55%)" }, axisLine: false, tickLine: false } as const;
const gridStroke = "hsl(250 10% 18%)";

export default function TeamInsightsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const team = teamId ? teamInsightsData[teamId] : undefined;

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
        <p className="text-sm">Team not found.</p>
        <button onClick={() => navigate("/app/insights")} className="text-primary text-sm hover:underline">
          ← Back to Insights
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate("/app/insights")}
          className="mt-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground tessira-transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">{team.name}</h1>
          <div className="mt-1.5 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Users2 size={13} /> {team.size} engineers</span>
            <span className="flex items-center gap-1.5"><Folder size={13} /> {team.activeProjects} active projects</span>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={chartCard}>
          <span className={chartTitle}>Velocity Trend</span>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={team.velocityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="sprint" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="points" stroke="hsl(260 40% 55%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartCard}>
          <span className={chartTitle}>PR Throughput</span>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={team.prThroughput}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="sprint" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="opened" stroke="hsl(200 60% 50%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="merged" stroke="hsl(142 50% 45%)" strokeWidth={2} dot={{ r: 3 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "hsl(240 8% 55%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Capacity */}
      <div className={chartCard}>
        <span className={chartTitle}>Team Allocation</span>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={team.allocation} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} {...axisProps} />
              <YAxis dataKey="category" type="category" width={100} {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Allocation"]} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} fill="hsl(260 40% 55%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills & Risks */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Skills concentration */}
        <div className={chartCard}>
          <span className={chartTitle}>Skill Concentration</span>
          <div className="space-y-2.5">
            {team.skills.map((s) => {
              const isSPOF = s.owners <= 1 && s.backups === 0;
              return (
                <div key={s.skill} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {isSPOF && <AlertTriangle size={12} className="text-destructive" />}
                    <span className={isSPOF ? "text-destructive" : ""}>{s.skill}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                    <span>{s.owners} owner{s.owners !== 1 ? "s" : ""}</span>
                    <span>{s.backups} backup{s.backups !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risks & Escalations */}
        <div className={chartCard}>
          <span className={chartTitle}>Risks & Escalations</span>
          <div className="space-y-4">
            {team.spofs.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">SPOFs ({team.spofs.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {team.spofs.map((s) => (
                    <span key={s} className="inline-flex rounded-full bg-destructive/15 px-2.5 py-0.5 text-[11px] font-medium text-destructive">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Recent Escalations</p>
              <div className="space-y-2">
                {team.escalations.map((e, i) => {
                  const sevClass =
                    e.severity === "high"
                      ? "bg-destructive/15 text-destructive"
                      : e.severity === "medium"
                        ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]"
                        : "bg-muted text-muted-foreground";
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="truncate">{e.title}</span>
                      <span className={`shrink-0 ml-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${sevClass}`}>
                        {e.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
