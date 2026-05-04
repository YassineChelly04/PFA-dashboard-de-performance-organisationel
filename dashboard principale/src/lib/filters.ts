import { z } from "zod";

import type { DashboardFilters, IncidentRow } from "./model";
import { normalizeKey, normalizeText } from "./text";

const QuerySchema = z.object({
  period: z.enum(["30d", "90d", "365d", "all"]).default("30d"),
  region: z.string().optional(),
  offer: z.string().optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  q: z.string().optional(),
});

export function parseDashboardFilters(
  searchParams: Record<string, string | string[] | undefined>,
): DashboardFilters {
  const periodRaw = first(searchParams.period);
  const regionRaw = first(searchParams.region);
  const offerRaw = first(searchParams.offer);
  const monthRaw = first(searchParams.month);
  const queryRaw = first(searchParams.q);

  const parsed = QuerySchema.parse({
    period: periodRaw ?? undefined,
    region: regionRaw ?? undefined,
    offer: offerRaw ?? undefined,
    month: monthRaw ?? undefined,
    q: queryRaw ?? undefined,
  });

  return {
    period: parsed.period,
    region: normalizeText(parsed.region),
    offer: normalizeText(parsed.offer),
    month: normalizeText(parsed.month),
    q: normalizeText(parsed.q),
  };
}

export function applyFilters(rows: IncidentRow[], filters: DashboardFilters): IncidentRow[] {
  const query = normalizeKey(filters.q);
  const end = new Date();
  const start =
    filters.period === "all"
      ? null
      : new Date(end.getTime() - periodToMs(filters.period));

  return rows.filter((r) => {
    if (filters.month) {
      const key = `${r.openAt.getFullYear()}-${String(r.openAt.getMonth() + 1).padStart(2, "0")}`;
      if (key !== filters.month) return false;
    } else if (start && r.openAt < start) {
      return false;
    }
    if (filters.region) {
      const selected = normalizeText(filters.region);
      if (!selected) {
        // ignore
      } else if (selected.toLowerCase() === "grand-tunis") {
        const allowed = new Set(["TUNIS", "ARIANA", "BENAROUS", "MANNOUBA"]);
        if (!r.region || !allowed.has(r.region)) return false;
      } else if (selected !== r.region) {
        return false;
      }
    }
    if (filters.offer && normalizeText(filters.offer) !== r.offer) return false;
    if (query) {
      const haystacks = [
        r.dLigne,
        r.region,
        r.offer,
        r.status,
        r.resolutionCode,
        r.productType,
        r.briefDescription,
      ]
        .map((value) => normalizeKey(value))
        .filter((value): value is string => Boolean(value));

      if (!haystacks.some((value) => value.includes(query))) {
        return false;
      }
    }
    return true;
  });
}

export function periodToMs(period: DashboardFilters["period"]): number {
  switch (period) {
    case "30d":
      return 30 * 86400_000;
    case "90d":
      return 90 * 86400_000;
    case "365d":
      return 365 * 86400_000;
    case "all":
      return 0;
  }
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
