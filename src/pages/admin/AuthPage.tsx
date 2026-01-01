import { useState } from "react";
import { Save, TestTube, AlertTriangle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AdminAuthPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const [formData, setFormData] = useState({
    provider: "azure",
    tenantId: "",
    issuerUrl: "",
    clientId: "",
    allowedDomains: ["company.com", "subsidiary.com"],
    requireSso: false,
    autoProvision: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings saved",
      description: "Authentication configuration has been updated.",
    });
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTesting(false);
    setTestResult("success");
  };

  const removeDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter((value) => value !== domain),
    }));
  };

  const addDomain = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    const input = event.currentTarget;
    const value = input.value.trim();
    if (!value || formData.allowedDomains.includes(value)) return;
    setFormData((prev) => ({
      ...prev,
      allowedDomains: [...prev.allowedDomains, value],
    }));
    input.value = "";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Authentication & SSO</h1>
          <p className="text-muted-foreground mt-1">
            Configure single sign-on and authentication settings for your organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTest} disabled={isTesting} className="gap-2">
            {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
            Test Configuration
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          SSO changes affect all user logins. Test your configuration before enabling "Require SSO".
        </AlertDescription>
      </Alert>

      {testResult && (
        <Alert
          className={
            testResult === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          {testResult === "success" ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={testResult === "success" ? "text-green-800" : "text-red-800"}>
            {testResult === "success"
              ? "Configuration test passed. SSO is correctly configured."
              : "Configuration test failed. Please check your settings."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identity Provider</CardTitle>
          <CardDescription>
            Select and configure your organization's identity provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, provider: value }))}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="azure">Azure Entra ID (Azure AD)</SelectItem>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="google">Google Workspace</SelectItem>
                <SelectItem value="saml">Custom SAML 2.0</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connection Settings</CardTitle>
          <CardDescription>
            Enter the credentials and endpoints for your identity provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input
                id="tenantId"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={formData.tenantId}
                onChange={(event) => setFormData((prev) => ({ ...prev, tenantId: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID (Application ID)</Label>
              <Input
                id="clientId"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={formData.clientId}
                onChange={(event) => setFormData((prev) => ({ ...prev, clientId: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issuerUrl">Issuer URL</Label>
            <Input
              id="issuerUrl"
              placeholder="https://login.microsoftonline.com/{tenant-id}/v2.0"
              value={formData.issuerUrl}
              onChange={(event) => setFormData((prev) => ({ ...prev, issuerUrl: event.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Allowed Email Domains</CardTitle>
          <CardDescription>
            Only users with email addresses from these domains can sign in via SSO.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.allowedDomains.map((domain) => (
              <Badge key={domain} variant="secondary" className="gap-1 px-3 py-1 text-sm">
                {domain}
                <button onClick={() => removeDomain(domain)} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <Input placeholder="Add domain and press Enter..." onKeyDown={addDomain} className="max-w-xs" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Authentication Behavior</CardTitle>
          <CardDescription>Control how users authenticate and are provisioned.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require SSO</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, users must authenticate via SSO. Manual logins will be disabled.
              </p>
            </div>
            <Switch
              checked={formData.requireSso}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, requireSso: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-provision users on first login</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create user accounts when someone signs in via SSO for the first time.
              </p>
            </div>
            <Switch
              checked={formData.autoProvision}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, autoProvision: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
