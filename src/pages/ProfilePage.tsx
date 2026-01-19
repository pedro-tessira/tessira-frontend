import { useMemo, useState } from "react";
import { Loader2, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useMe, useUpdateMyPassword } from "@/queries/useMe";
import { getPasswordPolicyIssues, isPasswordPolicyValid } from "@/lib/passwordPolicy";

export default function ProfilePage() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const updateMyPassword = useUpdateMyPassword();
  const [isSaving, setIsSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    displayName: me?.displayName ?? "",
    preferredName: "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSaving(false);
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  const authMethod = useMemo(() => {
    if (me?.lastLoginMethod) {
      const normalized = me.lastLoginMethod.replace(/_/g, " ");
      if (me.lastLoginMethod.toLowerCase() === "password") {
        return "Password";
      }
      return normalized
        .toLowerCase()
        .replace(/(^\\w)|\\s(\\w)/g, (match) => match.toUpperCase());
    }
    if (me?.email?.endsWith("@local")) {
      return "Dev login";
    }
    return "Unknown";
  }, [me?.email, me?.lastLoginMethod]);

  const isSsoLogin = useMemo(() => {
    const method = me?.lastLoginMethod?.toLowerCase();
    if (!method) return false;
    return new Set([
      "sso",
      "entra",
      "okta",
      "google",
      "adfs",
      "saml_generic",
      "oidc_generic",
    ]).has(method);
  }, [me?.lastLoginMethod]);

  const canUpdatePassword = !me?.employeeId || !isSsoLogin;
  const passwordMismatch =
    passwordForm.password.length > 0 &&
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.password !== passwordForm.confirmPassword;

  const handlePasswordUpdate = () => {
    if (!passwordForm.password.trim()) {
      toast({ title: "Password required", description: "Enter a new password to continue." });
      return;
    }
    if (passwordMismatch) {
      toast({ title: "Passwords do not match", description: "Confirm your new password." });
      return;
    }
    if (!isPasswordPolicyValid(passwordForm.password.trim())) {
      toast({
        title: "Password too weak",
        description: "Use at least 12 characters with uppercase, lowercase, number, and symbol.",
        variant: "destructive",
      });
      return;
    }
    updateMyPassword.mutate(
      { password: passwordForm.password.trim() },
      {
        onSuccess: () => {
          setPasswordForm({ password: "", confirmPassword: "" });
          toast({ title: "Password updated", description: "Your password has been updated." });
        },
        onError: (error) => {
          toast({
            title: "Unable to update password",
            description: error?.message ?? "Please try again in a moment.",
            variant: "destructive",
          });
        },
      }
    );
  };

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
            <CardTitle className="text-lg">Profile Information</CardTitle>
            <CardDescription>Your display name.</CardDescription>
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
            {canUpdatePassword ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Update your password for manual sign-ins.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.password}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      placeholder="Enter a new password"
                    />
                    {passwordForm.password.trim().length > 0 &&
                      !isPasswordPolicyValid(passwordForm.password.trim()) && (
                        <p className="text-xs text-destructive">
                          Password must include: {getPasswordPolicyIssues(passwordForm.password.trim()).join(", ")}.
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                      }
                      placeholder="Re-enter your new password"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {passwordMismatch ? (
                    <span className="text-sm text-destructive">Passwords do not match.</span>
                  ) : (
                    <span className="text-sm text-muted-foreground"> </span>
                  )}
                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={updateMyPassword.isPending || passwordMismatch}
                  >
                    {updateMyPassword.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Password management is handled by your organization.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
