import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  CountryDto,
  HolidayCalculationDto,
  HolidayRuleDto,
  HolidayRuleType,
  HolidayCalculationType,
  HolidayInstanceDto,
} from "@/lib/types";

export const holidayCountriesQueryKey = (includeInactive: boolean) => ["holiday-countries", includeInactive];
export const holidayRulesQueryKey = (countryId: string) => ["holiday-rules", countryId];
export const holidayInstancesQueryKey = (countryId: string, year: number) => [
  "holiday-instances",
  countryId,
  year,
];
export const holidayCalculationsQueryKey = ["holiday-calculations"];

export interface CreateCountryRequest {
  code: string;
  name: string;
  isActive?: boolean;
}

export interface UpdateCountryRequest {
  name?: string;
  isActive?: boolean;
}

export interface CreateHolidayRuleRequest {
  countryId: string;
  name: string;
  type: HolidayRuleType;
  fixedMonth?: number | null;
  fixedDay?: number | null;
  calculationType?: HolidayCalculationType | null;
  calculationOffsetDays?: number | null;
  calculationMonth?: number | null;
  calculationDay?: number | null;
  calculationWeekday?: number | null;
  calculationWeekdayOrdinal?: number | null;
  adHocDate?: string | null;
}

export interface UpdateHolidayRuleRequest {
  name?: string;
  type?: HolidayRuleType;
  fixedMonth?: number | null;
  fixedDay?: number | null;
  calculationType?: HolidayCalculationType | null;
  calculationOffsetDays?: number | null;
  calculationMonth?: number | null;
  calculationDay?: number | null;
  calculationWeekday?: number | null;
  calculationWeekdayOrdinal?: number | null;
  adHocDate?: string | null;
}

export const useHolidayCountries = (includeInactive = false) => {
  return useQuery<CountryDto[]>({
    queryKey: holidayCountriesQueryKey(includeInactive),
    queryFn: () =>
      apiFetch<CountryDto[]>(`/api/holidays/countries?includeInactive=${includeInactive}`),
  });
};

export const useCreateCountry = (includeInactive = false) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCountryRequest) =>
      apiFetch<CountryDto>("/api/holidays/countries", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayCountriesQueryKey(includeInactive) });
    },
  });
};

export const useUpdateCountry = (includeInactive = false) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ countryId, payload }: { countryId: string; payload: UpdateCountryRequest }) =>
      apiFetch<CountryDto>(`/api/holidays/countries/${countryId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayCountriesQueryKey(includeInactive) });
    },
  });
};

export const useHolidayRules = (countryId: string) => {
  return useQuery<HolidayRuleDto[]>({
    queryKey: holidayRulesQueryKey(countryId),
    queryFn: () => apiFetch<HolidayRuleDto[]>(`/api/holidays/rules?countryId=${countryId}`),
    enabled: !!countryId,
  });
};

export const useCreateHolidayRule = (countryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHolidayRuleRequest) =>
      apiFetch<HolidayRuleDto>("/api/holidays/rules", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayRulesQueryKey(countryId) });
      queryClient.invalidateQueries({ queryKey: holidayInstancesQueryKey(countryId, new Date().getFullYear()) });
    },
  });
};

export const useUpdateHolidayRule = (countryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, payload }: { ruleId: string; payload: UpdateHolidayRuleRequest }) =>
      apiFetch<HolidayRuleDto>(`/api/holidays/rules/${ruleId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayRulesQueryKey(countryId) });
      queryClient.invalidateQueries({ queryKey: holidayInstancesQueryKey(countryId, new Date().getFullYear()) });
    },
  });
};

export const useDeleteHolidayRule = (countryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) =>
      apiFetch<void>(`/api/holidays/rules/${ruleId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayRulesQueryKey(countryId) });
      queryClient.invalidateQueries({ queryKey: holidayInstancesQueryKey(countryId, new Date().getFullYear()) });
    },
  });
};

export const useHolidayInstances = (countryId: string, year: number) => {
  return useQuery<HolidayInstanceDto[]>({
    queryKey: holidayInstancesQueryKey(countryId, year),
    queryFn: () =>
      apiFetch<HolidayInstanceDto[]>(
        `/api/holidays?countryId=${countryId}&year=${year}`
      ),
    enabled: !!countryId && Number.isFinite(year),
  });
};

export const useHolidayCalculations = () => {
  return useQuery<HolidayCalculationDto[]>({
    queryKey: holidayCalculationsQueryKey,
    queryFn: () => apiFetch<HolidayCalculationDto[]>("/api/holidays/calculations"),
  });
};
