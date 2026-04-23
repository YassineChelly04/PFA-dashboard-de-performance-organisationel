import type { IncidentRow } from "@/lib/model";
import {
  hasDashboardDatabaseConfigured,
  loadIncidentsFromDatabase,
} from "@/lib/db/loadIncidentsFromDatabase";
import { DashboardDataUnavailableError, loadIncidents } from "@/lib/excel/loadWorkbook";

export type DashboardIncidentsResult =
  | { ok: true; data: IncidentRow[] }
  | { ok: false; reason: "unavailable" };

export async function loadDashboardIncidentsSafely(): Promise<DashboardIncidentsResult> {
  try {
    const fromDatabase = await loadIncidentsFromDatabase();
    if (fromDatabase.length > 0 || hasDashboardDatabaseConfigured()) {
      return { ok: true, data: fromDatabase };
    }
  } catch (error) {
    console.error("Dashboard database source failed, falling back to workbook source.", error);
  }

  try {
    return { ok: true, data: await loadIncidents() };
  } catch (error) {
    if (error instanceof DashboardDataUnavailableError) {
      return { ok: false, reason: "unavailable" };
    }

    throw error;
  }
}
