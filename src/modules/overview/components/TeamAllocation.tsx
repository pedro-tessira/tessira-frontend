import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TEAM_ALLOCATION, allocationColor } from "../data";
import { freeCapacityRisk, riskText } from "@/shared/lib/risk-colors";

interface Props {
  teamFilter?: string;
}

export default function TeamAllocation({ teamFilter }: Props) {
  const navigate = useNavigate();
  const data = teamFilter && teamFilter !== "all"
    ? TEAM_ALLOCATION.filter((t) => t.team === teamFilter)
    : TEAM_ALLOCATION;

  return (
    <Card
      className="border-border/50 cursor-pointer transition-colors hover:border-primary/30"
      onClick={() => navigate("/app/people")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Team Allocation</CardTitle>
        <p className="text-xs text-muted-foreground">Current allocation by team — neutral color (risk shown via free capacity)</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 110]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="team"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v}%`, "Allocation"]}
              />
              <Bar dataKey="allocation" radius={[0, 4, 4, 0]} barSize={18}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={allocationColor(entry.allocation)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
