import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TEAMS, SKILL_CATEGORIES, HEATMAP_DATA, heatmapBg, heatmapText,
} from "../data";

interface Props {
  teamFilter?: string;
}

export default function SkillCoverageHeatmap({ teamFilter }: Props) {
  const navigate = useNavigate();
  const teams = teamFilter && teamFilter !== "all"
    ? TEAMS.filter((t) => t === teamFilter)
    : TEAMS;

  return (
    <Card
      className="border-border/50 cursor-pointer transition-colors hover:border-primary/30"
      onClick={() => navigate("/app/skills/coverage")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Skill Coverage</CardTitle>
        <p className="text-xs text-muted-foreground">Proficiency coverage by team × skill category</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr>
                <th className="text-left py-1.5 pr-2 text-muted-foreground font-medium" />
                {SKILL_CATEGORIES.map((s) => (
                  <th
                    key={s}
                    className="text-center px-1 py-1.5 text-muted-foreground font-medium truncate max-w-[72px]"
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team}>
                  <td className="pr-2 py-1 text-xs font-medium text-foreground whitespace-nowrap">
                    {team}
                  </td>
                  {SKILL_CATEGORIES.map((skill) => {
                    const cell = HEATMAP_DATA.find(
                      (d) => d.team === team && d.skill === skill
                    )!;
                    return (
                      <td key={skill} className="px-1 py-1">
                        <div
                          className={`rounded px-1.5 py-1 text-center font-mono font-medium tabular-nums ${heatmapBg(cell.coverage)} ${heatmapText(cell.coverage)}`}
                        >
                          {cell.coverage}%
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
