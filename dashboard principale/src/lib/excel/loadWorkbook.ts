import fs from "node:fs";
import * as XLSX from "xlsx";

import { resolveAllDataXlsxPath } from "./path";
import type { IncidentRow } from "../model";
import { normalizeIncidentRow } from "../normalize";

const SHEET_NAME = "hexabyte-02022026";

let cache: Promise<IncidentRow[]> | null = null;

export class DashboardDataUnavailableError extends Error {
  constructor(message: string) {
    super(`DASHBOARD_DATA_UNAVAILABLE: ${message}`);
    this.name = "DashboardDataUnavailableError";
  }
}

export async function loadIncidents(): Promise<IncidentRow[]> {
  if (!cache) {
    cache = Promise.resolve().then(() => loadIncidentsUncached());
  }
  return cache;
}

function loadIncidentsUncached(): IncidentRow[] {
  const filePath = resolveAllDataXlsxPath();
  if (!fs.existsSync(filePath)) {
    throw new DashboardDataUnavailableError(
      "Le fichier de donnees n'est pas disponible sur ce runtime. Configurez une source de donnees de production pour le dashboard.",
    );
  }

  const workbook = XLSX.readFile(filePath, { cellDates: true, dense: true });

  const sheet = workbook.Sheets[SHEET_NAME] ?? workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) {
    throw new DashboardDataUnavailableError(`Feuille Excel introuvable: "${SHEET_NAME}"`);
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
