import React from "react";
import { CalendarDays } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TEAMS } from "../data";

const DOMAINS = ["Auth Platform", "Payments Platform", "Frontend Platform", "Data Platform", "Observability"];

const DATE_RANGES = [
  { value: "4w", label: "Next 4 weeks" },
  { value: "8w", label: "Next 8 weeks" },
  { value: "12w", label: "12 weeks" },
  { value: "quarter", label: "This quarter" },
] as const;

export type DateRange = (typeof DATE_RANGES)[number]["value"];

export interface DashboardFilterValues {
  dateRange: DateRange;
  team: string;
  domain: string;
}

interface DashboardFiltersProps {
  filters: DashboardFilterValues;
  onChange: (filters: DashboardFilterValues) => void;
}

export default function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const update = (patch: Partial<DashboardFilterValues>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date range */}
      <Select value={filters.dateRange} onValueChange={(v) => update({ dateRange: v as DateRange })}>
        <SelectTrigger className="h-8 w-[160px] text-xs bg-card border-border/50">
          <CalendarDays size={14} className="mr-1.5 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_RANGES.map((r) => (
            <SelectItem key={r.value} value={r.value} className="text-xs">
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Team filter */}
      <Select value={filters.team} onValueChange={(v) => update({ team: v })}>
        <SelectTrigger className="h-8 w-[150px] text-xs bg-card border-border/50">
          <SelectValue placeholder="All teams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All teams</SelectItem>
          {TEAMS.map((t) => (
            <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Domain filter */}
      <Select value={filters.domain} onValueChange={(v) => update({ domain: v })}>
        <SelectTrigger className="h-8 w-[170px] text-xs bg-card border-border/50">
          <SelectValue placeholder="All domains" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All domains</SelectItem>
          {DOMAINS.map((d) => (
            <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
