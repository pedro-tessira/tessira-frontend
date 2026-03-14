import { useNavigate } from "react-router-dom";
import { CalendarRange, Users2, Zap, Activity, TrendingUp } from "lucide-react";
import { METRICS } from "../data";

export default function KPICards() {
  const navigate = useNavigate();
  const icons = [CalendarRange, Users2, Zap, Activity];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {METRICS.map((m, i) => {
        const Icon = icons[i];
        return (
          <button
            key={m.label}
            onClick={() => navigate(m.link)}
            className="rounded-lg border border-border/50 bg-card p-4 space-y-3 text-left transition-colors hover:border-primary/30 hover:bg-accent/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {m.label}
              </span>
              <Icon size={16} strokeWidth={1.8} className="text-muted-foreground/60" />
            </div>
            <div className="text-2xl font-bold tabular-nums">{m.value}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp size={12} />
              {m.trend}
            </div>
          </button>
        );
      })}
    </div>
  );
}
