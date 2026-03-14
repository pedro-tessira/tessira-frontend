import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CAPACITY_FORECAST } from "../data";

export default function CapacityForecast() {
  const navigate = useNavigate();

  return (
    <Card
      className="border-border/50 cursor-pointer transition-colors hover:border-primary/30"
      onClick={() => navigate("/app/signals/capacity")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Capacity Forecast</CardTitle>
        <p className="text-xs text-muted-foreground">Projected team allocation — next 4 weeks</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CAPACITY_FORECAST} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 110]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(v: number, name: string) => [
                  `${v}%`,
                  name === "current" ? "Current" : "Projected",
                ]}
              />
              <ReferenceLine y={90} stroke="hsl(var(--warning))" strokeDasharray="4 4" label="" />
              <Line
                type="monotone"
                dataKey="current"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 3, fill: "hsl(var(--primary))", strokeDasharray: "0" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
