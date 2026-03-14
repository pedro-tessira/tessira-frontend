import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SYSTEMS, ENGINEERS, RESILIENCE_DATA,
  resilienceBg, resilienceLabel, resilienceText,
} from "../data";

export default function SystemResilienceMap() {
  const navigate = useNavigate();

  return (
    <Card
      className="border-border/50 cursor-pointer transition-colors hover:border-primary/30"
      onClick={() => navigate("/app/skills/risk")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">System Resilience</CardTitle>
        <p className="text-xs text-muted-foreground">Knowledge ownership across critical systems</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr>
                <th className="text-left py-1.5 pr-2 text-muted-foreground font-medium" />
                {SYSTEMS.map((s) => (
                  <th
                    key={s}
                    className="text-center px-1 py-1.5 text-muted-foreground font-medium truncate max-w-[64px]"
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ENGINEERS.map((eng) => (
                <tr key={eng}>
                  <td className="pr-2 py-1 text-xs font-medium text-foreground whitespace-nowrap">
                    {eng}
                  </td>
                  {SYSTEMS.map((sys) => {
                    const cell = RESILIENCE_DATA.find(
                      (d) => d.system === sys && d.engineer === eng
                    )!;
                    return (
                      <td key={sys} className="px-1 py-1">
                        <div
                          className={`rounded px-1 py-1 text-center font-mono tabular-nums ${resilienceBg(cell.level)} ${resilienceText(cell.level)}`}
                          title={resilienceLabel(cell.level)}
                        >
                          {resilienceLabel(cell.level)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
