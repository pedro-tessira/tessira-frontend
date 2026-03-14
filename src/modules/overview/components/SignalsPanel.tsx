import { useNavigate } from "react-router-dom";
import { AlertTriangle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SIGNALS } from "../data";

const severityStyles = {
  critical: "text-destructive",
  high: "text-destructive",
  medium: "text-warning",
} as const;

export default function SignalsPanel() {
  const navigate = useNavigate();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-warning" />
          <CardTitle className="text-sm font-semibold">Signals</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {SIGNALS.map((s, i) => (
          <button
            key={i}
            onClick={() => navigate(s.module)}
            className="flex items-start gap-3 text-sm w-full text-left hover:bg-accent/40 rounded-md px-2 py-1.5 -mx-2 transition-colors"
          >
            <AlertTriangle
              size={14}
              className={`mt-0.5 shrink-0 ${severityStyles[s.severity]}`}
            />
            <span className="text-muted-foreground">{s.text}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
