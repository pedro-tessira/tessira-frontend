import { Link } from "react-router-dom";
import { Users2, ArrowRight } from "lucide-react";
import { ModulePageHeader } from "../components/ModulePageHeader";
import { AvatarInitials } from "../components/AvatarInitials";
import { MOCK_TEAMS, MOCK_EMPLOYEES } from "../data";

export default function TeamsListPage() {
  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Teams"
        description={`${MOCK_TEAMS.length} teams across the engineering organization.`}
        breadcrumbs={[
          { label: "People", href: "/app/people" },
          { label: "Teams" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_TEAMS.map((team) => {
          const lead = MOCK_EMPLOYEES.find((e) => e.id === team.leadId);
          return (
            <Link
              key={team.id}
              to={`/app/people/teams/${team.id}`}
              className="group rounded-lg border border-border/50 bg-card p-5 hover:border-primary/20 tessira-transition flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Users2 size={18} strokeWidth={1.8} />
                </div>
                <ArrowRight
                  size={14}
                  className="text-muted-foreground/30 group-hover:text-primary tessira-transition mt-1"
                />
              </div>

              <h3 className="text-sm font-semibold mb-1">{team.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-2">
                {team.description}
              </p>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {lead && (
                    <AvatarInitials firstName={lead.firstName} lastName={lead.lastName} size="sm" />
                  )}
                  <div className="text-xs">
                    <div className="font-medium">{team.leadName}</div>
                    <div className="text-muted-foreground">Lead</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {team.memberCount} members
                </span>
              </div>

              {team.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {team.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
