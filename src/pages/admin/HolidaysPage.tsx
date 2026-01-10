import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useHolidayCountries,
  useCreateCountry,
  useUpdateCountry,
  useHolidayRules,
  useCreateHolidayRule,
  useUpdateHolidayRule,
  useDeleteHolidayRule,
  useHolidayInstances,
  useHolidayCalculations,
} from "@/queries/useHolidays";
import {
  HolidayRuleDto,
  HolidayRuleType,
  HolidayCalculationType,
  CountryDto,
} from "@/lib/types";

const ruleTypes: HolidayRuleType[] = ["FIXED", "CALCULATED", "AD_HOC"];

const defaultRuleState = (countryId: string) => ({
  countryId,
  name: "",
  type: "FIXED" as HolidayRuleType,
  fixedMonth: "",
  fixedDay: "",
  calculationType: "",
  calculationOffsetDays: "",
  calculationMonth: "",
  calculationDay: "",
  calculationWeekday: "",
  calculationWeekdayOrdinal: "",
  adHocDate: "",
});

const toNumber = (value: string) => (value.trim() === "" ? null : Number(value));

export default function AdminHolidaysPage() {
  const { toast } = useToast();
  const { data: countries = [] } = useHolidayCountries(true);
  const { data: calculations = [] } = useHolidayCalculations();
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: rules = [] } = useHolidayRules(selectedCountryId);
  const { data: instances = [], isLoading: instancesLoading } = useHolidayInstances(
    selectedCountryId,
    year
  );

  const createCountry = useCreateCountry(true);
  const updateCountry = useUpdateCountry(true);
  const createRule = useCreateHolidayRule(selectedCountryId);
  const updateRule = useUpdateHolidayRule(selectedCountryId);
  const deleteRule = useDeleteHolidayRule(selectedCountryId);

  const [newCountryCode, setNewCountryCode] = useState("");
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryActive, setNewCountryActive] = useState(true);
  const [editingCountryId, setEditingCountryId] = useState<string | null>(null);
  const [editingCountryName, setEditingCountryName] = useState("");

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState(() => defaultRuleState(selectedCountryId));

  useEffect(() => {
    if (!selectedCountryId && countries.length > 0) {
      setSelectedCountryId(countries[0].id);
    }
  }, [countries, selectedCountryId]);

  useEffect(() => {
    setRuleForm(defaultRuleState(selectedCountryId));
    setEditingRuleId(null);
  }, [selectedCountryId]);

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries]
  );

  const calculationOptions = useMemo(
    () =>
      calculations.length > 0
        ? calculations
        : [
            { code: "EASTER" as HolidayCalculationType, description: "Easter", supportsOffsetDays: true },
          ],
    [calculations]
  );

  const handleCreateCountry = () => {
    if (!newCountryCode.trim() || !newCountryName.trim()) return;
    createCountry.mutate(
      {
        code: newCountryCode.trim().toUpperCase(),
        name: newCountryName.trim(),
        isActive: newCountryActive,
      },
      {
        onSuccess: () => {
          toast({ title: "Country created", description: "Country added successfully." });
          setNewCountryCode("");
          setNewCountryName("");
          setNewCountryActive(true);
        },
        onError: (error: { message?: string }) => {
          toast({
            title: "Country creation failed",
            description: error?.message ?? "Unable to create country.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleToggleCountry = (country: CountryDto) => {
    updateCountry.mutate({
      countryId: country.id,
      payload: { isActive: !country.isActive },
    });
  };

  const handleSaveCountryName = (countryId: string) => {
    if (!editingCountryName.trim()) return;
    updateCountry.mutate(
      { countryId, payload: { name: editingCountryName.trim() } },
      {
        onSuccess: () => {
          setEditingCountryId(null);
          setEditingCountryName("");
        },
      }
    );
  };

  const handleEditRule = (rule: HolidayRuleDto) => {
    setEditingRuleId(rule.id);
    setRuleForm({
      countryId: rule.countryId,
      name: rule.name,
      type: rule.type,
      fixedMonth: rule.fixedMonth?.toString() ?? "",
      fixedDay: rule.fixedDay?.toString() ?? "",
      calculationType: rule.calculationType ?? "",
      calculationOffsetDays: rule.calculationOffsetDays?.toString() ?? "",
      calculationMonth: rule.calculationMonth?.toString() ?? "",
      calculationDay: rule.calculationDay?.toString() ?? "",
      calculationWeekday: rule.calculationWeekday?.toString() ?? "",
      calculationWeekdayOrdinal: rule.calculationWeekdayOrdinal?.toString() ?? "",
      adHocDate: rule.adHocDate ?? "",
    });
  };

  const resetRuleForm = () => {
    setEditingRuleId(null);
    setRuleForm(defaultRuleState(selectedCountryId));
  };

  const handleSaveRule = () => {
    if (!ruleForm.name.trim() || !ruleForm.type || !selectedCountryId) return;
    const payload = {
      countryId: selectedCountryId,
      name: ruleForm.name.trim(),
      type: ruleForm.type,
      fixedMonth: toNumber(ruleForm.fixedMonth),
      fixedDay: toNumber(ruleForm.fixedDay),
      calculationType: ruleForm.calculationType || null,
      calculationOffsetDays: toNumber(ruleForm.calculationOffsetDays),
      calculationMonth: toNumber(ruleForm.calculationMonth),
      calculationDay: toNumber(ruleForm.calculationDay),
      calculationWeekday: toNumber(ruleForm.calculationWeekday),
      calculationWeekdayOrdinal: toNumber(ruleForm.calculationWeekdayOrdinal),
      adHocDate: ruleForm.adHocDate || null,
    };

    const onSuccess = () => {
      toast({
        title: editingRuleId ? "Rule updated" : "Rule created",
        description: editingRuleId ? "Holiday rule updated." : "Holiday rule created.",
      });
      resetRuleForm();
    };
    const onError = (error: { message?: string }) => {
      toast({
        title: "Rule save failed",
        description: error?.message ?? "Unable to save holiday rule.",
        variant: "destructive",
      });
    };

    if (editingRuleId) {
      updateRule.mutate({ ruleId: editingRuleId, payload }, { onSuccess, onError });
    } else {
      createRule.mutate(payload, { onSuccess, onError });
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    deleteRule.mutate(ruleId, {
      onSuccess: () => {
        toast({ title: "Rule deleted", description: "Holiday rule removed." });
      },
      onError: (error: { message?: string }) => {
        toast({
          title: "Rule deletion failed",
          description: error?.message ?? "Unable to delete holiday rule.",
          variant: "destructive",
        });
      },
    });
  };

  const renderRuleFields = () => {
    if (ruleForm.type === "FIXED") {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            type="number"
            min={1}
            max={12}
            placeholder="Month (1-12)"
            value={ruleForm.fixedMonth}
            onChange={(event) => setRuleForm((prev) => ({ ...prev, fixedMonth: event.target.value }))}
          />
          <Input
            type="number"
            min={1}
            max={31}
            placeholder="Day (1-31)"
            value={ruleForm.fixedDay}
            onChange={(event) => setRuleForm((prev) => ({ ...prev, fixedDay: event.target.value }))}
          />
        </div>
      );
    }

    if (ruleForm.type === "AD_HOC") {
      return (
        <Input
          type="date"
          value={ruleForm.adHocDate}
          onChange={(event) => setRuleForm((prev) => ({ ...prev, adHocDate: event.target.value }))}
        />
      );
    }

    return (
      <div className="space-y-3">
        <Select
          value={ruleForm.calculationType}
          onValueChange={(value) => setRuleForm((prev) => ({ ...prev, calculationType: value }))}
        >
          <SelectTrigger>
            <span>{ruleForm.calculationType || "Select calculation"}</span>
          </SelectTrigger>
          <SelectContent>
            {calculationOptions.map((calc) => (
              <SelectItem key={calc.code} value={calc.code}>
                {calc.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            type="number"
            placeholder="Offset days"
            value={ruleForm.calculationOffsetDays}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, calculationOffsetDays: event.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Month (1-12)"
            value={ruleForm.calculationMonth}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, calculationMonth: event.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Day (1-31)"
            value={ruleForm.calculationDay}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, calculationDay: event.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Weekday (1-7)"
            value={ruleForm.calculationWeekday}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, calculationWeekday: event.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Weekday ordinal"
            value={ruleForm.calculationWeekdayOrdinal}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, calculationWeekdayOrdinal: event.target.value }))
            }
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Holidays</h1>
          <p className="text-muted-foreground mt-1">
            Manage countries, holiday rules, and generated holiday instances.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => resetRuleForm()}>
          <RefreshCw className="w-4 h-4" />
          Reset form
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Country</span>
            <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
              <SelectTrigger className="w-[220px]">
                <span>
                  {sortedCountries.find((country) => country.id === selectedCountryId)?.name ??
                    "Select country"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {sortedCountries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Year</span>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="w-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="countries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="rules">Holiday Rules</TabsTrigger>
          <TabsTrigger value="instances">Holiday Instances</TabsTrigger>
        </TabsList>

        <TabsContent value="countries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Countries</CardTitle>
              <CardDescription>Manage available holiday countries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Code (PT)"
                  value={newCountryCode}
                  onChange={(event) => setNewCountryCode(event.target.value)}
                />
                <Input
                  placeholder="Country name"
                  value={newCountryName}
                  onChange={(event) => setNewCountryName(event.target.value)}
                />
                <div className="flex items-center gap-3">
                  <Switch checked={newCountryActive} onCheckedChange={setNewCountryActive} />
                  <Button onClick={handleCreateCountry} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {sortedCountries.map((country) => (
                  <div
                    key={country.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2"
                  >
                    {editingCountryId === country.id ? (
                      <>
                        <Input
                          value={editingCountryName}
                          onChange={(event) => setEditingCountryName(event.target.value)}
                          className="max-w-[240px]"
                        />
                        <Button size="sm" onClick={() => handleSaveCountryName(country.id)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCountryId(null);
                            setEditingCountryName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="min-w-[200px]">
                          <div className="text-sm font-medium text-foreground">{country.name}</div>
                          <div className="text-xs text-muted-foreground">{country.code}</div>
                        </div>
                        <Badge variant={country.isActive ? "default" : "secondary"}>
                          {country.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={country.isActive ?? false}
                          onCheckedChange={() => handleToggleCountry(country)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCountryId(country.id);
                            setEditingCountryName(country.name);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Holiday Rules</CardTitle>
              <CardDescription>Define fixed, calculated, and ad-hoc rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Rule name"
                    value={ruleForm.name}
                    onChange={(event) => setRuleForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <Select
                    value={ruleForm.type}
                    onValueChange={(value) =>
                      setRuleForm((prev) => ({ ...prev, type: value as HolidayRuleType }))
                    }
                  >
                    <SelectTrigger>
                      <span>{ruleForm.type}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {ruleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {renderRuleFields()}

                <div className="flex items-center justify-end gap-2">
                  {editingRuleId && (
                    <Button variant="ghost" onClick={resetRuleForm}>
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleSaveRule} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    {editingRuleId ? "Update rule" : "Add rule"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-sm font-medium text-foreground">{rule.name}</div>
                      <div className="text-xs text-muted-foreground">{rule.type}</div>
                    </div>
                    <Badge variant="outline">{rule.type}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => handleEditRule(rule)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Holiday Instances</CardTitle>
              <CardDescription>Generated holidays for the selected country/year.</CardDescription>
            </CardHeader>
            <CardContent>
              {instancesLoading ? (
                <div className="text-sm text-muted-foreground">Loading holidays...</div>
              ) : instances.length === 0 ? (
                <div className="text-sm text-muted-foreground">No holidays found.</div>
              ) : (
                <div className="space-y-2">
                  {instances.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
                    >
                      <div className="text-sm font-medium text-foreground">{holiday.name}</div>
                      <div className="text-xs text-muted-foreground">{holiday.date}</div>
                      <Badge variant="outline">{holiday.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
