import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AvatarInitials } from "./AvatarInitials";
import { usePeopleStore } from "../contexts/PeopleStoreContext";
import type { Team, TeamMembership } from "../types";
import { UserPlus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
}

export default function ManageTeamMembersDialog({ open, onOpenChange, team }: Props) {
  const { employees, getTeamMembers, addMembership, removeMembership, updateMembershipRole } = usePeopleStore();
  const [addEmployeeId, setAddEmployeeId] = useState("");
  const [addRole, setAddRole] = useState<TeamMembership["role"]>("member");

  if (!team) return null;

  const members = getTeamMembers(team.id);
  const nonMembers = employees.filter(
    (e) => !members.some((m) => m.employeeId === e.id)
  );

  const handleAdd = () => {
    if (!addEmployeeId) return;
    addMembership(addEmployeeId, team.id, addRole);
    const emp = employees.find((e) => e.id === addEmployeeId);
    toast({ title: "Member added", description: `${emp?.firstName} ${emp?.lastName} added to ${team.name}.` });
    setAddEmployeeId("");
    setAddRole("member");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Members — {team.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add member */}
          <div className="flex gap-2">
            <Select value={addEmployeeId} onValueChange={setAddEmployeeId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Add a member…" />
              </SelectTrigger>
              <SelectContent>
                {nonMembers.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={addRole} onValueChange={(v) => setAddRole(v as TeamMembership["role"])}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
              </SelectContent>
            </Select>
            <Button size="icon" variant="outline" onClick={handleAdd} disabled={!addEmployeeId}>
              <UserPlus size={14} />
            </Button>
          </div>

          {/* Current members */}
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {members.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">No members yet.</p>
            )}
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50 transition-colors">
                <AvatarInitials firstName={m.employee.firstName} lastName={m.employee.lastName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.employee.firstName} {m.employee.lastName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{m.employee.title}</p>
                </div>
                <Select
                  value={m.role}
                  onValueChange={(v) => updateMembershipRole(m.id, v as TeamMembership["role"])}
                >
                  <SelectTrigger className="h-7 w-[100px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    removeMembership(m.id);
                    toast({ title: "Member removed", description: `${m.employee.firstName} ${m.employee.lastName} removed from ${team.name}.` });
                  }}
                >
                  <X size={13} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
