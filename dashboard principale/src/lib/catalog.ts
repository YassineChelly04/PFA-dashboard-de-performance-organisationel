import type { IncidentRow } from "./model";

export function distinctRegions(rows: IncidentRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.region) set.add(r.region);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function distinctOffers(rows: IncidentRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.offer) set.add(r.offer);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

const FR_MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

export function distinctMonths(rows: IncidentRow[]): { key: string; label: string }[] {
  const set = new Set<string>();
  for (const r of rows) {
    const key = `${r.openAt.getFullYear()}-${String(r.openAt.getMonth() + 1).padStart(2, "0")}`;
    set.add(key);
  }

  return [...set]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const [y, m] = key.split("-");
      const monthIdx = Number(m) - 1;
      const labelMonth = FR_MONTHS[monthIdx] ?? m;
      return { key, label: `${labelMonth} ${y}` };
    });
}
