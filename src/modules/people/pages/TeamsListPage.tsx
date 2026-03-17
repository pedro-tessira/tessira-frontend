import { useState } from "react";
import { Link } from "react-router-dom";
import { Users2, ArrowRight, Plus, Pencil, Trash2 } from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { AvatarInitials } from "../components/AvatarInitials";
import { Button } from "@/components/ui/button";
import { usePeopleStore } from "../contexts/PeopleStoreContext";
import AddTeamDialog from "../components/AddTeamDialog";
import EditTeamDialog from "../components/EditTeamDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import type { Team } from "../types";
import { toast } from "@/hooks/use-toast";

export default function TeamsListPage() {
  const { teams, employees, deleteTeam } = usePeopleStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        title="Teams"
        description={`${teams.length} teams across the engineering organization.`}
        breadcrumbs={[
          { label: "People", href: "/app/people" },
          { label: "Teams" },
        ]}
        actions={
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setAddOpen(true)}>
            <Plus size={13} /> Create Team
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const lead = employees.find((e) => e.id === team.leadId);
          return (
            <div
              key={team.id}
              className="group rounded-lg border border-border/50 bg-card p-5 flex flex-col relative"
            >
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={(e) => { e.preventDefault(); setEditTeam(team); }}
                >
                  <Pencil size={12} />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.preventDefault(); setDeleteTarget(team); }}
                >
                  <Trash2 size={12} />
                </Button>
              </div>

              <Link
                to={`/app/people/teams/${team.id}`}
                className="flex flex-col flex-1 hover:border-primary/20 tessira-transition"
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
                      <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      <AddTeamDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditTeamDialog open={!!editTeam} onOpenChange={(o) => { if (!o) setEditTeam(null); }} team={editTeam} />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Delete Team"
        description={`Are you sure you want to delete ${deleteTarget?.name}? This will remove all memberships.`}
        onConfirm={() => {
          if (deleteTarget) {
            const name = deleteTarget.name;
            deleteTeam(deleteTarget.id);
            setDeleteTarget(null);
            setTimeout(() => toast({ title: "Team deleted", description: `${name} has been removed.` }), 150);
          }
        }}
      />
    </div>
  );
}
