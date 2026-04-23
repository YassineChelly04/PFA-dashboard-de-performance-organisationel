import type { IncidentRow } from "@/lib/model";
import { normalizeIncidentRow } from "@/lib/normalize";
import { prisma } from "@/lib/db/prisma";

export function hasDashboardDatabaseConfigured() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const prismaDatabaseUrl = process.env.PRISMA_DATABASE_URL?.trim();
  return Boolean(databaseUrl || prismaDatabaseUrl);
}

export async function loadIncidentsFromDatabase(): Promise<IncidentRow[]> {
  const result = await prisma.incident.findMany({
    select: {
      closeTime: true,
      openTimeHPSM: true,
      downtimeStart: true,
      problemStatus: true,
      region: true,
      offre: true,
      resolutionCode: true,
      productType: true,
      briefDescription: true,
      resolutionDuration: true,
    },
  });
  const incidents: IncidentRow[] = [];

  for (const row of result) {
    const raw: Record<string, unknown> = {
      "open_time (HPSM)": row.openTimeHPSM ?? row.downtimeStart,
      close_time: row.closeTime,
      problem_status: row.problemStatus,
      Region: row.region,
      Offre: row.offre,
      resolution_code: row.resolutionCode,
      product_type: row.productType,
      brief_description: row.briefDescription,
      TT_resolution_duration: row.resolutionDuration,
    };

    const normalized = normalizeIncidentRow(raw);
    if (normalized) {
      incidents.push(normalized);
    }
  }

  return incidents;
}
