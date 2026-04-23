import * as XLSX from "xlsx";

import { resolveAllDataXlsxPath } from "./path";
import type { IncidentRow } from "../model";
import { normalizeIncidentRow } from "../normalize";

const SHEET_NAME = "hexabyte-02022026";

let cache: Promise<IncidentRow[]> | null = null;

export async function loadIncidents(): Promise<IncidentRow[]> {
  if (!cache) {
    cache = Promise.resolve().then(() => loadIncidentsUncached());
  }
  return cache;
}

function loadIncidentsUncached(): IncidentRow[] {
  const filePath = resolveAllDataXlsxPath();
  const workbook = XLSX.readFile(filePath, { cellDates: true, dense: true });

  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    throw new Error(`Feuille Excel introuvable: "${SHEET_NAME}"`);
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: true,
  });

  const incidents: IncidentRow[] = [];
  for (const raw of rows) {
    const normalized = normalizeIncidentRow(raw);
    if (normalized) incidents.push(normalized);
  }

  return incidents;
}
