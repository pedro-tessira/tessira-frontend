import { useEffect, useMemo, useState } from "react";
import { Save, TestTube, AlertTriangle, Check, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  SsoProviderDto,
  SsoProviderType,
  SsoProviderTypeDto,
  useCreateSsoProvider,
  useDeleteSsoProvider,
  useSsoProviders,
  useSsoProviderTypes,
  useTestSsoProvider,
  useUpdateSsoProvider,
} from "@/queries/useSsoProviders";

const providerLabels: Record<SsoProviderType, string> = {
  ENTRA: "Azure Entra ID (OIDC)",
  OKTA: "Okta (OIDC)",
  GOOGLE: "Google Workspace (OIDC)",
  ADFS: "ADFS (OIDC)",
  SAML_GENERIC: "Custom SAML 2.0",
  OIDC_GENERIC: "Custom OIDC",
};

const providerReferences: Record<SsoProviderType, string> = {
  ENTRA: "https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc",
  OKTA: "https://developer.okta.com/docs/guides/implement-oauth-for-okta/main/",
  GOOGLE: "https://developers.google.com/identity/openid-connect/openid-connect",
  ADFS: "https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/overview/ad-fs-overview",
  SAML_GENERIC: "https://en.wikipedia.org/wiki/SAML_2.0",
  OIDC_GENERIC: "https://openid.net/developers/specs/",
};

const emptyFormState = {
  provider: "ENTRA" as SsoProviderType,
  protocol: "OIDC",
  displayName: "",
  allowedDomains: [] as string[],
  requireSso: false,
  autoProvision: true,
  enabled: true,
  settings: {} as Record<string, string>,
};

export default function AdminAuthPage() {
  const { toast } = useToast();
  const { data: providers = [], isLoading } = useSsoProviders();
  const { data: providerTypes = [], isLoading: isTypesLoading } = useSsoProviderTypes();
  const createProvider = useCreateSsoProvider();
  const updateProvider = useUpdateSsoProvider();
  const deleteProvider = useDeleteSsoProvider();
  const testProvider = useTestSsoProvider();
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyFormState);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isNewProvider = selectedProviderId === null;
  const activeProvider = useMemo<SsoProviderDto | null>(() => {
    if (!providers.length || isNewProvider) return null;
    return providers.find((provider) => provider.id === selectedProviderId) ?? null;
  }, [providers, selectedProviderId, isNewProvider]);

  const activeProviderType = useMemo<SsoProviderTypeDto | null>(() => {
    if (isNewProvider) {
      return providerTypes.find((type) => type.provider === formData.provider) ?? null;
    }
    if (!activeProvider) return null;
    return providerTypes.find((type) => type.provider === activeProvider.provider) ?? null;
  }, [activeProvider, formData.provider, isNewProvider, providerTypes]);

  const availableProtocols = useMemo(() => {
    const protocols = new Set(providerTypes.map((type) => type.protocol).filter(Boolean));
    if (protocols.size === 0) {
      return ["OIDC", "SAML2"];
    }
    return Array.from(protocols);
  }, [providerTypes]);

  const providerOptions = useMemo(() => {
    if (!providerTypes.length) {
      return Object.keys(providerLabels) as SsoProviderType[];
    }
    return providerTypes
      .filter((type) => !isNewProvider || type.protocol === formData.protocol)
      .map((type) => type.provider);
  }, [formData.protocol, isNewProvider, providerTypes]);

  useEffect(() => {
    if (!providers.length) {
      setSelectedProviderId(null);
      setFormData(emptyFormState);
      return;
    }
    if (isNewProvider) {
      return;
    }
    const provider = activeProvider ?? providers[0];
    setSelectedProviderId(provider.id);
    setFormData({
      provider: provider.provider,
      protocol: provider.protocol ?? providerTypes.find((type) => type.provider === provider.provider)?.protocol ?? "OIDC",
      displayName: provider.displayName,
      allowedDomains: provider.allowedEmailDomains ?? [],
      requireSso: provider.requiredSso,
      autoProvision: provider.autoProvision,
      enabled: provider.enabled,
      settings: provider.settings ?? {},
    });
  }, [activeProvider, providerTypes, providers, isNewProvider]);

  const [settingsEntries, setSettingsEntries] = useState<
    { id: string; key: string; value: string }[]
  >([]);

  const activeProtocol = activeProviderType?.protocol ?? activeProvider?.protocol ?? formData.protocol;

  useEffect(() => {
    const entries = Object.entries(formData.settings ?? {}).map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value,
    }));
    setSettingsEntries(entries.length ? entries : [{ id: crypto.randomUUID(), key: "", value: "" }]);
  }, [formData.settings]);

  const handleSave = async () => {
    const settingsPayload = settingsEntries.reduce<Record<string, string>>((acc, entry) => {
      const trimmedKey = entry.key.trim();
      if (!trimmedKey) return acc;
      acc[trimmedKey] = entry.value.trim();
      return acc;
    }, {});

    const payload = {
      displayName: formData.displayName.trim() || "SSO Provider",
      enabled: formData.enabled,
      requiredSso: formData.requireSso,
      autoProvision: formData.autoProvision,
      allowedEmailDomains: formData.allowedDomains,
      settings: settingsPayload,
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

  const updateSetting = (id: string, key: string, value: string) => {
    setSettingsEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, key, value } : entry))
    );
  };

  const addSettingRow = () => {
    setSettingsEntries((prev) => [...prev, { id: crypto.randomUUID(), key: "", value: "" }]);
  };

  const removeSettingRow = (id: string) => {
    setSettingsEntries((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      return next.length ? next : [{ id: crypto.randomUUID(), key: "", value: "" }];
    });
  };

  const isSaving = createProvider.isPending || updateProvider.isPending;
  const isTesting = testProvider.isPending;
  const canTest = Boolean(activeProvider?.id);
  const requiredKeys = activeProviderType?.requiredSettings ?? [];
  const missingRequiredKeys = requiredKeys.filter((requiredKey) => {
    if (requiredKey.includes("|")) {
      const options = requiredKey.split("|").map((key) => key.trim());
      return !settingsEntries.some((entry) => options.includes(entry.key.trim()));
    }
    const primaryKey = requiredKey.split(" ")[0] ?? requiredKey;
    return !settingsEntries.some((entry) => entry.key.trim() === primaryKey);
  });
  const providerReference = providerReferences[formData.provider];

  if (isLoading || isTypesLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-muted-foreground">
        Loading SSO providers...
      </div>
    );
  }

  const renderForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={handleTest} disabled={!canTest || isTesting} className="gap-2">
          {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
          Test
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
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
                onValueChange={(value) => {
                  const provider = value as SsoProviderType;
                  const typeMatch = providerTypes.find((type) => type.provider === provider);
                  setFormData((prev) => ({
                    ...prev,
                    provider,
                    protocol: typeMatch?.protocol ?? prev.protocol,
                  }));
                }}
                disabled={!isNewProvider}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providerOptions.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {providerLabels[provider] ?? provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="SSO Provider Display Name"
                value={formData.displayName}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, displayName: event.target.value }))
                }
              />
            </div>
            {isNewProvider ? (
              <div className="space-y-2">
                <Label>Protocol</Label>
                <Select
                  value={formData.protocol}
                  onValueChange={(value) => {
                    const nextProtocol = value;
                    const matchingProvider = providerTypes.find(
                      (type) => type.protocol === nextProtocol
                    );
                    setFormData((prev) => ({
                      ...prev,
                      protocol: nextProtocol,
                      provider: matchingProvider?.provider ?? prev.provider,
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProtocols.map((protocol) => (
                      <SelectItem key={protocol} value={protocol}>
                        {protocol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Protocol</Label>
                <Input value={activeProtocol} readOnly />
              </div>
            )}
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
            Add provider-specific configuration keys and values.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">Protocol:</span>
              <Badge variant="outline">{activeProtocol}</Badge>
            </div>
            {requiredKeys.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">Required keys:</span>
                {requiredKeys.map((key) => (
                  <Badge key={key} variant="secondary">
                    {key}
                  </Badge>
                ))}
              </div>
            )}
            {missingRequiredKeys.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-amber-700">
                <span className="font-medium text-foreground">Missing required keys:</span>
                {missingRequiredKeys.map((key) => (
                  <Badge key={key} variant="secondary" className="bg-amber-50 text-amber-700">
                    {key}
                  </Badge>
                ))}
              </div>
            )}
            <div>
              <span className="font-medium text-foreground">Provider reference:</span>{" "}
              <a
                href={providerReference}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {providerReference}
              </a>
            </div>
            <div>Additional keys are allowed in settings for provider-specific needs.</div>
          </div>
          <div className="grid gap-3">
            {settingsEntries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                <Input
                  placeholder="key"
                  value={entry.key}
                  onChange={(event) => updateSetting(entry.id, event.target.value, entry.value)}
                />
                <Input
                  placeholder="value"
                  value={entry.value}
                  onChange={(event) => updateSetting(entry.id, entry.key, event.target.value)}
                />
                <Button variant="outline" size="sm" onClick={() => removeSettingRow(entry.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addSettingRow}>
            Add setting
          </Button>
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
                    Deleting this configuration may lead to issues accessing Horizon.
                  </p>
                </div>
                <Button
                  variant="destructive"
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

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Authentication & SSO</h1>
          <p className="text-muted-foreground mt-1">
            Configure single sign-on and authentication settings for your organization.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-lg">SSO Configurations</CardTitle>
            <CardDescription>Select a provider to edit or create a new one.</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedProviderId(null);
              setFormData(emptyFormState);
              setIsCreateOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New provider
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {providers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No providers configured yet.</div>
          ) : (
            providers.map((provider) => (
              <div key={provider.id} className="rounded-lg border border-border">
                <button
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    provider.id === selectedProviderId
                      ? "bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    setSelectedProviderId(provider.id);
                    setIsCreateOpen(false);
                    setIsEditOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-foreground">
                        {provider.displayName || providerLabels[provider.provider] || provider.provider}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {providerLabels[provider.provider] ?? provider.provider} • {provider.protocol}
                      </div>
                    </div>
                    <Badge variant="secondary" className={provider.enabled ? "bg-green-50 text-green-700" : ""}>
                      {provider.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setFormData(emptyFormState);
            setSelectedProviderId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create SSO provider</DialogTitle>
            <DialogDescription>
              Add a new SSO configuration and save it to enable authentication.
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedProviderId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SSO provider</DialogTitle>
            <DialogDescription>
              Update the selected SSO configuration.
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
