import type { IncidentRow } from "@/lib/model";
import { normalizeIncidentRow } from "@/lib/normalize";
import { prisma } from "@/lib/db/prisma";

export function hasDashboardDatabaseConfigured() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const prismaDatabaseUrl = process.env.PRISMA_DATABASE_URL?.trim();
  return Boolean(databaseUrl || prismaDatabaseUrl);
}

type IncidentLikeRecord = {
  dLigne: string | null;
  closeTime: Date | null;
  openTimeHPSM: Date | null;
  downtimeStart: Date | null;
  problemStatus: string | null;
  region: string | null;
  offre: string | null;
  resolutionCode: string | null;
  productType: string | null;
  briefDescription: string | null;
  resolutionDuration: string | null;
};

function mapIncidentRecordsToRows(records: IncidentLikeRecord[]): IncidentRow[] {
  const incidents: IncidentRow[] = [];

  for (const row of records) {
    const raw: Record<string, unknown> = {
      dLigne: row.dLigne,
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

function isMissingIncidentTableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const normalizedError = `${error.name} ${error.message}`.toLowerCase();
  const errorWithCode = error as Error & { code?: unknown };
  const prismaCode =
    typeof errorWithCode.code === "string" ? errorWithCode.code.toUpperCase() : "";

  if (prismaCode === "P2021" && normalizedError.includes("incident")) {
    return true;
  }

  return (
    (normalizedError.includes("relation") || normalizedError.includes("table")) &&
    normalizedError.includes("incident") &&
    normalizedError.includes("does not exist")
  );
}

async function loadFromClientTableFallback(): Promise<IncidentRow[]> {
  const records = await prisma.$queryRaw<IncidentLikeRecord[]>`
    SELECT
      "dLigne",
      "closeTime",
      "openTimeHPSM",
      "downtimeStart",
      "problemStatus",
      "region",
      "offre",
      "resolutionCode",
      "productType",
      "briefDescription",
      "resolutionDuration"
    FROM "Client"
  `;

  return mapIncidentRecordsToRows(records);
}

export async function loadIncidentsFromDatabase(): Promise<IncidentRow[]> {
  try {
    const records = await prisma.incident.findMany({
      select: {
        closeTime: true,
        dLigne: true,
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

    return mapIncidentRecordsToRows(records);
  } catch (error) {
    if (isMissingIncidentTableError(error)) {
      // Shared production DB may expose Client rows (agent-tt/interface-fsi schema) instead of Incident rows.
      return loadFromClientTableFallback();
    }

    throw error;
  }
}
