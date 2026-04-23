import type { DashboardFilters, IncidentRow } from "./model";
import { applyFilters, periodToMs } from "./filters";

export type PeriodComparison = {
  current: IncidentRow[];
  previous: IncidentRow[];
};

export function compareToPreviousPeriod(
  rows: IncidentRow[],
  filters: DashboardFilters,
): PeriodComparison | null {
  if (filters.period === "all") return null;

  const end = new Date();
  const windowMs = periodToMs(filters.period);
  const currentStart = new Date(end.getTime() - windowMs);
  const previousEnd = currentStart;
  const previousStart = new Date(previousEnd.getTime() - windowMs);

  const baseFiltered = applyFiltersIgnoringPeriod(rows, filters);

  const current = baseFiltered.filter((r) => r.openAt >= currentStart && r.openAt <= end);
  const previous = baseFiltered.filter(
    (r) => r.openAt >= previousStart && r.openAt < previousEnd,
  );

  return { current, previous };
}

function applyFiltersIgnoringPeriod(rows: IncidentRow[], filters: DashboardFilters): IncidentRow[] {
  return applyFilters(rows, { ...filters, period: "all" });
}
