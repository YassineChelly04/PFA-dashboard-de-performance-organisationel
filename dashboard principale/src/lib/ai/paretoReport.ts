import { z } from "zod";

import { compareToPreviousPeriod } from "../compare";
import { applyFilters, parseDashboardFilters } from "../filters";
import { groupMeanHours, mean, paretoFromCounts, statusSplit, topNCounts } from "../metrics";
import type { DashboardFilters, IncidentRow } from "../model";

export const paretoReportScopeSchema = z.enum(["mensuel", "annuel", "global"]);
export type ParetoReportScope = z.infer<typeof paretoReportScopeSchema>;

const optionalText = z.string().trim().min(1).optional().nullable();

export const paretoReportRequestSchema = z.object({
  scope: paretoReportScopeSchema,
  filters: z
    .object({
      period: z.enum(["30d", "90d", "365d", "all"]).optional(),
      region: optionalText,
      offer: optionalText,
      month: z.string().regex(/^\d{4}-\d{2}$/).optional().nullable(),
      q: optionalText,
    })
    .optional(),
});

type ParetoReportRequest = z.infer<typeof paretoReportRequestSchema>;

export type ParetoReportPayload = {
  scope: ParetoReportScope;
  generatedAt: string;
  filtersApplied: DashboardFilters;
  totals: {
    totalReclamations: number;
    traitees: number;
    urgentes: number;
    tauxTraitementPct: number;
    delaiMoyenHeures: number;
    delaiMoyenJours: number;
    variationVolumePct: number | null;
    variationDelaiPct: number | null;
  };
  topResolutionCodes: Array<{
    code: string;
    volume: number;
    frequencePct: number;
    cumulPct: number;
    delaiMoyenHeures: number;
  }>;
  topRegions: Array<{ region: string; volume: number }>;
  topOffers: Array<{ offer: string; volume: number }>;
};

function toSearchParamsRecord(
  filters: ParetoReportRequest["filters"] | undefined,
): Record<string, string | undefined> {
  return {
    period: filters?.period,
    region: filters?.region ?? undefined,
    offer: filters?.offer ?? undefined,
    month: filters?.month ?? undefined,
    q: filters?.q ?? undefined,
  };
}

export function normalizeRequestedFilters(filters: ParetoReportRequest["filters"]): DashboardFilters {
  return parseDashboardFilters(toSearchParamsRecord(filters));
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function filtersForScope(
  base: DashboardFilters,
  scope: ParetoReportScope,
  now = new Date(),
): DashboardFilters {
  if (scope === "global") {
    return { ...base, period: "all", month: null };
  }

  if (scope === "annuel") {
    return { ...base, period: "365d", month: null };
  }

  return {
    ...base,
    period: "all",
    month: monthKey(now),
  };
}

export function buildParetoReportPayload(
  incidents: IncidentRow[],
  scope: ParetoReportScope,
  filtersApplied: DashboardFilters,
): ParetoReportPayload {
  const filtered = applyFilters(incidents, filtersApplied);
  const split = statusSplit(filtered);
  const total = filtered.length;
  const avgHours =
    mean(filtered.map((row) => row.durationHours).filter((value): value is number => value !== null)) ?? 0;

  const previousComparison = compareToPreviousPeriod(incidents, filtersApplied);
  const previousRows = previousComparison?.previous ?? [];
  const previousCount = previousRows.length;
  const previousAvgHours =
    mean(previousRows.map((row) => row.durationHours).filter((value): value is number => value !== null)) ?? null;

  const variationVolumePct =
    previousCount > 0 ? ((total - previousCount) / previousCount) * 100 : null;
  const variationDelaiPct =
    previousAvgHours && previousAvgHours > 0
      ? ((avgHours - previousAvgHours) / previousAvgHours) * 100
      : null;

  const resolutionCounts = topNCounts(filtered, (row) => row.resolutionCode, 8);
  const pareto = paretoFromCounts(resolutionCounts);
  const meanByCode = new Map(
    groupMeanHours(filtered, (row) => row.resolutionCode).map((entry) => [entry.key, entry.meanHours]),
  );

  return {
    scope,
    generatedAt: new Date().toISOString(),
    filtersApplied,
    totals: {
      totalReclamations: total,
      traitees: split.treated,
      urgentes: split.urgent,
      tauxTraitementPct: total > 0 ? (split.treated / total) * 100 : 0,
      delaiMoyenHeures: avgHours,
      delaiMoyenJours: avgHours / 24,
      variationVolumePct,
      variationDelaiPct,
    },
    topResolutionCodes: pareto.map((entry) => ({
      code: entry.key,
      volume: entry.count,
      frequencePct: total > 0 ? (entry.count / total) * 100 : 0,
      cumulPct: entry.cumPct,
      delaiMoyenHeures: meanByCode.get(entry.key) ?? avgHours,
    })),
    topRegions: topNCounts(filtered, (row) => row.region, 6).map((row) => ({
      region: row.key,
      volume: row.count,
    })),
    topOffers: topNCounts(filtered, (row) => row.offer, 6).map((row) => ({
      offer: row.key,
      volume: row.count,
    })),
  };
}

