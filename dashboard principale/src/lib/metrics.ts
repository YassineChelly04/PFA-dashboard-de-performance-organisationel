import type { IncidentRow } from "./model";
import { isClosed } from "./normalize";

export type CountRow = { key: string; count: number };
export type ParetoRow = CountRow & { cumPct: number };

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

export function quantile(values: number[], q: number): number | null {
  if (!values.length) return null;
  if (q <= 0) return values[0];
  if (q >= 1) return values[values.length - 1];

  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] === undefined) return sorted[base];
  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}

export function topNCounts(
  rows: IncidentRow[],
  pickKey: (row: IncidentRow) => string | null,
  n: number,
): CountRow[] {
  const map = new Map<string, number>();

  for (const row of rows) {
    const key = pickKey(row);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export function paretoFromCounts(counts: CountRow[]): ParetoRow[] {
  const total = counts.reduce((sum, c) => sum + c.count, 0);
  if (!total) return [];

  let cum = 0;
  return counts.map((c) => {
    cum += c.count;
    return { ...c, cumPct: (cum / total) * 100 };
  });
}

export function groupMeanHours(
  rows: IncidentRow[],
  pickKey: (row: IncidentRow) => string | null,
): { key: string; meanHours: number }[] {
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();

  for (const row of rows) {
    const key = pickKey(row);
    if (!key) continue;
    if (row.durationHours === null) continue;

    sums.set(key, (sums.get(key) ?? 0) + row.durationHours);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...sums.entries()]
    .map(([key, sum]) => {
      const n = counts.get(key) ?? 0;
      return { key, meanHours: n ? sum / n : 0 };
    })
    .sort((a, b) => b.meanHours - a.meanHours);
}

export function monthlyInterventionTrend(rows: IncidentRow[]): {
  monthKey: string;
  label: string;
  technique: number;
  commercial: number;
}[] {
  // Heuristic mapping based on product_type language in the dataset
  const buckets = new Map<
    string,
    { label: string; technique: number; commercial: number }
  >();

  for (const row of rows) {
    const d = row.openAt;
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = formatMonthLabel(d);

    const pt = (row.productType ?? "").toLowerCase();
    const isCommercial =
      pt.includes("client") ||
      pt.includes("absent") ||
      pt.includes("configuration modem") ||
      pt.includes("education") ||
      pt.includes("compte");

    const entry = buckets.get(monthKey) ?? { label, technique: 0, commercial: 0 };
    if (isCommercial) entry.commercial += 1;
    else entry.technique += 1;
    buckets.set(monthKey, entry);
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, v]) => ({
      monthKey,
      label: v.label,
      technique: v.technique,
      commercial: v.commercial,
    }));
}

function formatMonthLabel(d: Date): string {
  const months = [
    "JAN",
    "FÉV",
    "MAR",
    "AVR",
    "MAI",
    "JUIN",
    "JUIL",
    "AOÛT",
    "SEP",
    "OCT",
    "NOV",
    "DÉC",
  ];
  return months[d.getMonth()] ?? "MOIS";
}

export function statusSplit(rows: IncidentRow[]): {
  treated: number;
  inProgress: number;
  urgent: number;
} {
  const treated = rows.filter((r) => isClosed(r.status)).length;
  const inProgress = rows.length - treated;

  const durations = rows
    .map((r) => r.durationHours)
    .filter((v): v is number => v !== null && Number.isFinite(v));

  const threshold = quantile(durations, 0.95);
  const urgent =
    threshold === null
      ? 0
      : rows.filter((r) => r.durationHours !== null && r.durationHours >= threshold).length;

  return { treated, inProgress, urgent };
}

export function resolutionRate(rows: IncidentRow[]): number | null {
  if (!rows.length) return null;
  return (rows.filter((r) => isClosed(r.status)).length / rows.length) * 100;
}
