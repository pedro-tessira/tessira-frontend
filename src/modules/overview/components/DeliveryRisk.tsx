import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DELIVERY_RISK, riskColor } from "../data";

interface Props {
  streamFilter?: string;
}

export default function DeliveryRisk({ streamFilter }: Props) {
  const navigate = useNavigate();
  const data = streamFilter && streamFilter !== "all"
    ? DELIVERY_RISK.filter((d) => d.stream === streamFilter)
    : DELIVERY_RISK;

  return (
    <Card
      className="border-border/50 cursor-pointer transition-colors hover:border-primary/30"
      onClick={() => navigate("/app/signals/resilience")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Delivery Risk</CardTitle>
        <p className="text-xs text-muted-foreground">Risk score by delivery stream</p>
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
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="stream"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(v: number) => [v, "Risk Score"]}
              />
              <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={18}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={riskColor(entry.risk)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
