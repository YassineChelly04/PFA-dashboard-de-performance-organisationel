import type { IncidentRow } from "./model";
import { normalizeKey, normalizeText } from "./text";

type RawRow = Record<string, unknown>;

function readString(raw: RawRow, keys: string[]): string | null {
  for (const key of keys) {
    if (key in raw) return normalizeText(raw[key]);
  }
  return null;
}

function excelSerialToDate(value: number): Date | null {
  if (!Number.isFinite(value)) return null;
  // Excel serial date in JS: UTC epoch based on 1899-12-30
  const ms = Math.round((value - 25569) * 86400 * 1000);
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    // Heuristic: Excel sometimes gives serials as numbers
    // HPSM timestamps in this file are full datetimes → large serials (~45000+)
    if (value > 20000) return excelSerialToDate(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function toDurationHours(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  // xlsx may return a number (fraction of day) for durations
  if (typeof value === "number" && Number.isFinite(value)) {
    return value * 24;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // "H:MM:SS" style
    const hm = trimmed.match(/^(\d+)\s*:\s*(\d+)\s*:\s*(\d+(?:\.\d+)?)$/);
    if (hm) {
      const h = Number(hm[1]);
      const m = Number(hm[2]);
      const s = Number(hm[3]);
      if ([h, m, s].every((n) => Number.isFinite(n))) return h + m / 60 + s / 3600;
    }

    // ISO-ish duration: "1 00:44:34" (day + time) seen in sample
    const dm = trimmed.match(/^(\d+)\s+(\d{1,2}):(\d{2}):(\d{2}(?:\.\d+)?)$/);
    if (dm) {
      const days = Number(dm[1]);
      const hh = Number(dm[2]);
      const mm = Number(dm[3]);
      const ss = Number(dm[4]);
      if ([days, hh, mm, ss].every((n) => Number.isFinite(n))) {
        return days * 24 + hh + mm / 60 + ss / 3600;
      }
    }
  }

  return null;
}

export function normalizeIncidentRow(raw: RawRow): IncidentRow | null {
  const openAt =
    toDate(raw["open_time (HPSM)"]) ??
    toDate(raw["open_time"]) ??
    toDate(raw["open_time(HPSM)"]);

  if (!openAt) return null;

  const status = normalizeText(raw["problem_status"]) ?? "Inconnu";

  return {
    dLigne: readString(raw, ["dLigne", "d_ligne", "DL", "dl"]),
    openAt,
    closeAt: toDate(raw["close_time"]),
    status,

    region: readString(raw, ["Region", "region"]),
    offer: readString(raw, ["Offre", "offre"]),

    resolutionCode: readString(raw, ["resolution_code", "Resolution", "resolution"]),
    productType: readString(raw, ["product_type", "Product_type", "productType"]),
    briefDescription: readString(raw, ["brief_description", "Brief_description", "description"]),

    durationHours: toDurationHours(raw["TT_resolution_duration"]),
  };
}

export function isClosed(status: string): boolean {
  const key = normalizeKey(status);
  if (!key) return false;
  return key.includes("clotur") || key.includes("clôtur") || key.includes("clos");
}
