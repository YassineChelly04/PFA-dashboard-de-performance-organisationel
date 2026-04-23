import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACTION_FSI_COLUMN =
  "action faite par FSI meme avant d'entrer de saisir un eréclamation sur extranet";

const COLUMN = {
  dLigne: "DLigne",
  referenceExtranet: "reference_no Extranet",
  downtimeStart: "downtime_start (Extranet)",
  openTimeHPSM: "open_time (HPSM)",
  refHPSM: "Ref HPSM",
  problemStatus: "problem_status",
  closeTime: "close_time",
  resolutionCode: "resolution_code",
  region: "Region",
  offre: "Offre",
  briefDescription: "brief_description",
  debitADSL: "DebitADSL",
  fsiadsl: "FSIADSL",
  productType: "product_type",
  resolutionObservation: "resolution observation TT",
  resolutionDuration: "TT_resolution_duration",
  actionFSI: ACTION_FSI_COLUMN,
};

function normalize(value) {
  return String(value ?? "").trim();
}

function excelValueToDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      return null;
    }

    return new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, parsed.S);
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function inferTypeClient(offre) {
  const normalizedOffre = offre.toLowerCase();
  if (
    normalizedOffre.includes("pro") ||
    normalizedOffre.includes("business") ||
    normalizedOffre.includes("vdsl")
  ) {
    return "Professionnel";
  }

  return "Résidentiel";
}

function mapWorkbookRowToClientInput(row) {
  const dLigne = normalize(row[COLUMN.dLigne]);
  if (!dLigne) {
    return null;
  }

  const offre = normalize(row[COLUMN.offre]);

  return {
    dLigne,
    referenceExtranet: normalize(row[COLUMN.referenceExtranet]) || null,
    refHPSM: normalize(row[COLUMN.refHPSM]) || null,
    nom: `Client ${dLigne}`,
    region: normalize(row[COLUMN.region]) || "Non spécifiée",
    offre: offre || "Offre non spécifiée",
    debitADSL: normalize(row[COLUMN.debitADSL]) || "Non spécifié",
    fsiadsl: normalize(row[COLUMN.fsiadsl]) || "Non spécifié",
    typeClient: inferTypeClient(offre),
    downtimeStart: excelValueToDate(row[COLUMN.downtimeStart]),
    openTimeHPSM: excelValueToDate(row[COLUMN.openTimeHPSM]),
    problemStatus: normalize(row[COLUMN.problemStatus]) || "Ouvert",
    closeTime: excelValueToDate(row[COLUMN.closeTime]),
    briefDescription: normalize(row[COLUMN.briefDescription]) || null,
    actionFSI: normalize(row[COLUMN.actionFSI]) || null,
    resolutionCode: normalize(row[COLUMN.resolutionCode]) || null,
    productType: normalize(row[COLUMN.productType]) || null,
    resolutionObservation: normalize(row[COLUMN.resolutionObservation]) || null,
    resolutionDuration: normalize(row[COLUMN.resolutionDuration]) || null,
    attenuationLigne: null,
  };
}

function resolveWorkbookPath() {
  const envPath = process.env.WORKBOOK_PATH?.trim();
  if (envPath) {
    const resolved = path.resolve(envPath);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }

  return path.resolve(process.cwd(), "..", "database", "all-data.xlsx");
}

async function main() {
  const workbookPath = resolveWorkbookPath();
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Workbook not found at ${workbookPath}`);
  }

  const workbook = XLSX.read(fs.readFileSync(workbookPath), {
    type: "buffer",
    cellDates: true,
  });
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(firstSheet, {
    defval: "",
    raw: true,
  });

  const clientsToUpsert = [];
  let skipped = 0;

  for (const row of rows) {
    const clientInput = mapWorkbookRowToClientInput(row);
    if (!clientInput) {
      skipped += 1;
      continue;
    }
    clientsToUpsert.push(clientInput);
  }

  let created = 0;
  const BATCH_SIZE = 1000;

  for (let index = 0; index < clientsToUpsert.length; index += BATCH_SIZE) {
    const chunk = clientsToUpsert.slice(index, index + BATCH_SIZE);

    const result = await prisma.client.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    created += result.count;

    console.log(`Seed progress: ${index + chunk.length}/${clientsToUpsert.length} lignes`);
  }

  const alreadyPresent = clientsToUpsert.length - created;

  console.log(
    JSON.stringify(
      {
        workbookPath,
        totalRows: rows.length,
        created,
        alreadyPresent,
        skipped,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
