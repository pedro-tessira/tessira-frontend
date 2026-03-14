import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountProfileTab() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/30" />
        <div>
          <Button variant="outline" size="sm">Change Avatar</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">First Name</Label>
            <Input defaultValue="Engineering" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Last Name</Label>
            <Input defaultValue="Lead" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Email</Label>
          <Input defaultValue="lead@tessira.dev" disabled />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Timezone</Label>
          <Input defaultValue="UTC+0" />
        </div>
        <Button size="sm">Save Changes</Button>
      </div>
    </div>
  );
}
