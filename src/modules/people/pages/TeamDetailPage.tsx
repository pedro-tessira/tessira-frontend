import { useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Users2, Calendar, Zap, Activity, CalendarRange, Pencil, UserPlus, Trash2 } from "lucide-react";
import { ModulePageHeader } from "@/shared/components/ModulePageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { AvatarInitials } from "../components/AvatarInitials";
import { Button } from "@/components/ui/button";
import { usePeopleStore } from "../contexts/PeopleStoreContext";
import EditTeamDialog from "../components/EditTeamDialog";
import ManageTeamMembersDialog from "../components/ManageTeamMembersDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get("from");
  const { getTeam, getTeamMembers, deleteTeam, removeMembership } = usePeopleStore();
  const team = getTeam(teamId ?? "");
  const members = teamId ? getTeamMembers(teamId) : [];
  const [editOpen, setEditOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeMemberTarget, setRemoveMemberTarget] = useState<{ id: string; name: string } | null>(null);

  if (!team) {
    return (
      <div className="space-y-6">
        <ModulePageHeader
          title="Team Not Found"
          breadcrumbs={[
            { label: "People", href: "/app/people" },
            { label: "Teams", href: "/app/people/teams" },
            { label: "Not Found" },
          ]}
        />
        <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">This team could not be found.</p>
          <Link to="/app/people/teams" className="mt-3 inline-block text-sm text-primary hover:underline">
            Back to teams
          </Link>
        </div>
      </div>
    );
  }

  const leads = members.filter((m) => m.role === "lead");
  const regularMembers = members.filter((m) => m.role !== "lead");

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title={team.name}
        description={team.description}
        breadcrumbs={fromParam ? [
          { label: "Back", href: fromParam },
          { label: team.name },
        ] : [
          { label: "People", href: "/app/people" },
          { label: "Teams", href: "/app/people/teams" },
          { label: team.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setMembersOpen(true)}>
              <UserPlus size={13} /> Members
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setEditOpen(true)}>
              <Pencil size={13} /> Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={13} /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Team Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Members</div>
              <div className="text-2xl font-bold tabular-nums">{members.length}</div>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active</div>
              <div className="text-2xl font-bold tabular-nums">
                {members.filter((m) => m.employee.status === "active").length}
              </div>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Created</div>
              <div className="text-sm font-medium mt-1">{team.createdAt}</div>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
            <div className="border-b border-border/50 px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Team Members</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setMembersOpen(true)}>
                <UserPlus size={12} /> Manage
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Since</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[...leads, ...regularMembers].map((m) => (
                    <tr key={m.id} className="hover:bg-accent/20 tessira-transition">
                      <td className="px-4 py-3">
                        <Link to={`/app/people/employees/${m.employeeId}`} className="flex items-center gap-3 group">
                          <AvatarInitials firstName={m.employee.firstName} lastName={m.employee.lastName} size="sm" />
                          <span className="font-medium group-hover:text-primary tessira-transition">
                            {m.employee.firstName} {m.employee.lastName}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.employee.title}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground capitalize">
                          {m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{m.since}</td>
                      <td className="px-4 py-3"><StatusBadge status={m.employee.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setRemoveMemberTarget({ id: m.id, name: `${m.employee.firstName} ${m.employee.lastName}` })}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {members.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No members yet.</p>
                <Button variant="link" size="sm" className="mt-1" onClick={() => setMembersOpen(true)}>
                  Add members
                </Button>
              </div>
            )}
          </div>

          {/* Future integration placeholders */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Zap, label: "Skills Coverage", desc: "Team skill matrix and coverage gaps will appear here." },
              { icon: Activity, label: "Team Signals", desc: "Health indicators and velocity trends for this team." },
              { icon: CalendarRange, label: "Horizon", desc: "Linked delivery timelines and availability windows." },
            ].map((placeholder) => (
              <div key={placeholder.label} className="rounded-lg border border-dashed border-border/50 bg-card/50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <placeholder.icon size={14} className="text-muted-foreground/40" />
                  <span className="text-xs font-medium text-muted-foreground">{placeholder.label}</span>
                </div>
                <p className="text-xs text-muted-foreground/60">{placeholder.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Team Leadership</h3>
            {leads.map((l) => (
              <Link
                key={l.id}
                to={`/app/people/employees/${l.employeeId}`}
                className="flex items-center gap-3 rounded-md p-2 -mx-2 hover:bg-accent/30 tessira-transition"
              >
                <AvatarInitials firstName={l.employee.firstName} lastName={l.employee.lastName} size="sm" />
                <div>
                  <div className="text-sm font-medium">{l.employee.firstName} {l.employee.lastName}</div>
                  <div className="text-xs text-muted-foreground">{l.employee.title}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Metadata</h3>
            <div>
              <div className="text-xs text-muted-foreground">Team ID</div>
              <div className="text-sm font-mono text-muted-foreground">{team.id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Slug</div>
              <div className="text-sm font-mono text-muted-foreground">{team.slug}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-sm">{team.createdAt}</div>
            </div>
            {team.tags.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {team.tags.map((tag) => (
                    <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditTeamDialog open={editOpen} onOpenChange={setEditOpen} team={team} />
      <ManageTeamMembersDialog open={membersOpen} onOpenChange={setMembersOpen} team={team} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Team"
        description={`Are you sure you want to delete ${team.name}? All memberships will be removed.`}
        onConfirm={() => {
          const name = team.name;
          deleteTeam(team.id);
          navigate("/app/people/teams");
          setTimeout(() => toast({ title: "Team deleted", description: `${name} has been removed.` }), 150);
        }}
      />
      <DeleteConfirmDialog
        open={!!removeMemberTarget}
        onOpenChange={(o) => { if (!o) setRemoveMemberTarget(null); }}
        title="Remove Member"
        description={`Remove ${removeMemberTarget?.name} from ${team.name}?`}
        onConfirm={() => {
          if (removeMemberTarget) {
            removeMembership(removeMemberTarget.id);
            setRemoveMemberTarget(null);
            setTimeout(() => toast({ title: "Member removed" }), 150);
          }
        }}
      />
    </div>
  );
}
