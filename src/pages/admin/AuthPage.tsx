import { useEffect, useMemo, useState } from "react";
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
import {
  SsoProviderDto,
  SsoProviderType,
  useCreateSsoProvider,
  useDeleteSsoProvider,
  useSsoProviders,
  useTestSsoProvider,
  useUpdateSsoProvider,
} from "@/queries/useSsoProviders";

const providerOptions: { value: SsoProviderType; label: string }[] = [
  { value: "ENTRA_ID", label: "Azure Entra ID (Azure AD)" },
  { value: "OKTA", label: "Okta" },
  { value: "GOOGLE_WORKSPACE", label: "Google Workspace" },
  { value: "SAML2", label: "Custom SAML 2.0" },
];

const emptyFormState = {
  provider: "ENTRA_ID" as SsoProviderType,
  displayName: "Azure Entra ID",
  tenantId: "",
  issuerUrl: "",
  clientId: "",
  allowedDomains: [] as string[],
  requireSso: false,
  autoProvision: true,
  enabled: true,
};

export default function AdminAuthPage() {
  const { toast } = useToast();
  const { data: providers = [], isLoading } = useSsoProviders();
  const createProvider = useCreateSsoProvider();
  const updateProvider = useUpdateSsoProvider();
  const deleteProvider = useDeleteSsoProvider();
  const testProvider = useTestSsoProvider();
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyFormState);

  const activeProvider = useMemo<SsoProviderDto | null>(() => {
    if (!providers.length) return null;
    return providers.find((provider) => provider.id === selectedProviderId) ?? providers[0];
  }, [providers, selectedProviderId]);

  useEffect(() => {
    if (!providers.length) {
      setSelectedProviderId(null);
      setFormData(emptyFormState);
      return;
    }
    const provider = activeProvider ?? providers[0];
    setSelectedProviderId(provider.id);
    setFormData({
      provider: provider.provider,
      displayName: provider.displayName,
      tenantId: provider.settings?.tenantId ?? "",
      issuerUrl: provider.settings?.issuerUrl ?? "",
      clientId: provider.settings?.clientId ?? "",
      allowedDomains: provider.allowedEmailDomains ?? [],
      requireSso: provider.requiredSso,
      autoProvision: provider.autoProvision,
      enabled: provider.enabled,
    });
  }, [activeProvider, providers]);

  const handleSave = async () => {
    const payload = {
      displayName: formData.displayName.trim() || "SSO Provider",
      enabled: formData.enabled,
      requiredSso: formData.requireSso,
      autoProvision: formData.autoProvision,
      allowedEmailDomains: formData.allowedDomains,
      settings: {
        tenantId: formData.tenantId.trim(),
        issuerUrl: formData.issuerUrl.trim(),
        clientId: formData.clientId.trim(),
      },
    };

    try {
      if (activeProvider) {
        await updateProvider.mutateAsync({ id: activeProvider.id, payload });
      } else {
        await createProvider.mutateAsync({
          provider: formData.provider,
          ...payload,
        });
      }
      toast({
        title: "Settings saved",
        description: "Authentication configuration has been updated.",
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "message" in error ? String(error.message) : "Save failed.";
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleTest = async () => {
    if (!activeProvider) return;
    setTestResult(null);
    try {
      const result = await testProvider.mutateAsync(activeProvider.id);
      setTestResult(result.success ? "success" : "error");
    } catch {
      setTestResult("error");
    }
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

  const isSaving = createProvider.isPending || updateProvider.isPending;
  const isTesting = testProvider.isPending;
  const canTest = Boolean(activeProvider?.id);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-muted-foreground">
        Loading SSO providers...
      </div>
    );
  }

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
          <Button variant="outline" onClick={handleTest} disabled={!canTest || isTesting} className="gap-2">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, provider: value as SsoProviderType }))
                }
                disabled={Boolean(activeProvider)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Active Providers</Label>
              <Select
                value={selectedProviderId ?? "new"}
                onValueChange={(value) => setSelectedProviderId(value === "new" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New provider</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.displayName || provider.provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="SSO Provider"
                value={formData.displayName}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, displayName: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Enabled</Label>
              <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-2">
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enabled: checked }))}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.enabled ? "Provider active" : "Provider disabled"}
                </span>
              </div>
            </div>
            {activeProvider && (
              <div className="space-y-2">
                <Label>Provider Status</Label>
                <Badge variant="secondary" className={formData.enabled ? "bg-green-50 text-green-700" : ""}>
                  {formData.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            )}
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
          {activeProvider && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Remove provider</Label>
                <p className="text-sm text-muted-foreground">
                  Deletes this provider configuration.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  deleteProvider.mutate(activeProvider.id, {
                    onSuccess: () => {
                      toast({
                        title: "Provider removed",
                        description: "SSO provider configuration deleted.",
                      });
                    },
                    onError: (error: { message?: string }) => {
                      toast({
                        title: "Delete failed",
                        description: error?.message ?? "Unable to delete provider.",
                        variant: "destructive",
                      });
                    },
                  })
                }
              >
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
