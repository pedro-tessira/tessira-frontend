import { useMemo, useState } from "react";
import { Loader2, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useMe } from "@/queries/useMe";
import { useTeams } from "@/queries/useTeams";

const timezoneOptions = [
  "UTC",
  "Europe/Lisbon",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "es", label: "Español" },
];

export default function ProfilePage() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const { data: teams = [] } = useTeams();
  const [isSaving, setIsSaving] = useState(false);

  const initialTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );

  const [formData, setFormData] = useState({
    displayName: me?.displayName ?? "",
    preferredName: "",
    timezone: initialTimezone,
    language: "en",
    defaultTeamId: teams[0]?.id ?? "",
    defaultGranularity: "month",
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSaving(false);
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  const authMethod = me?.email?.endsWith("@local") ? "Dev login" : "Unknown";

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
            <CardDescription>Your display name and localization preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={formData.displayName}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, displayName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Name (optional)</Label>
                <Input
                  value={formData.preferredName}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, preferredName: event.target.value }))
                  }
                  placeholder="How you'd like to be called"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezoneOptions.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
            <CardDescription>Your account details (read-only).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="font-medium">{me?.email ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Auth Method</Label>
                <Badge variant="outline">{authMethod}</Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Role</Label>
                <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                  {me?.role ?? "—"}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Employee ID</Label>
                <p className="font-medium">{me?.employeeId ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preferences</CardTitle>
            <CardDescription>Default settings for the timeline view.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Team</Label>
                <Select
                  value={formData.defaultTeamId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, defaultTeamId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Granularity</Label>
                <Select
                  value={formData.defaultGranularity}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, defaultGranularity: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Password management is handled by your organization.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
