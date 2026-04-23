import fs from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

const DEFAULT_SHEET_NAME = "hexabyte-02022026";
const CHUNK_SIZE = 500;

function resolveWorkbookPath() {
  const envPath = process.env.WORKBOOK_PATH?.trim();
  if (envPath) {
    return path.resolve(envPath);
  }

  return path.resolve(process.cwd(), "..", "database", "all-data.xlsx");
}

function normalizeText(value) {
  if (value === null || value === undefined) return null;
  const asString = String(value).trim();
  return asString.length > 0 ? asString : null;
}

function excelSerialToDate(value) {
  if (!Number.isFinite(value)) return null;
  const ms = Math.round((value - 25569) * 86400 * 1000);
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDate(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    if (value > 20000) return excelSerialToDate(value);
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function mapRow(raw) {
  return {
    dLigne: normalizeText(raw["DLigne"]),
    referenceExtranet: normalizeText(raw["reference_no Extranet"]),
    downtimeStart: toDate(raw["downtime_start (Extranet)"]),
    openTimeHPSM: toDate(raw["open_time (HPSM)"]),
    refHPSM: normalizeText(raw["Ref HPSM"]),
    problemStatus: normalizeText(raw["problem_status"]),
    closeTime: toDate(raw["close_time"]),
    resolutionCode: normalizeText(raw["resolution_code"]),
    region: normalizeText(raw["Region"]),
    offre: normalizeText(raw["Offre"]),
    briefDescription: normalizeText(raw["brief_description"]),
    debitADSL: normalizeText(raw["DebitADSL"]),
    fsiadsl: normalizeText(raw["FSIADSL"]),
    productType: normalizeText(raw["product_type"]),
    resolutionObservation: normalizeText(raw["resolution observation TT"]),
    resolutionDuration: normalizeText(raw["TT_resolution_duration"]),
    actionFSI: normalizeText(
      raw["action faite par FSI meme avant d'entrer de saisir un eréclamation sur extranet"],
    ),
  };
}

async function main() {
  const workbookPath = resolveWorkbookPath();
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Workbook not found at ${workbookPath}`);
  }

  const workbook = XLSX.readFile(workbookPath, { cellDates: true, dense: true });
  const sheetName =
    workbook.Sheets[DEFAULT_SHEET_NAME] ? DEFAULT_SHEET_NAME : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`No sheet found in workbook at ${workbookPath}`);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });
  const incidents = rows.map(mapRow);

  const prisma = new PrismaClient();
  try {
    await prisma.incident.deleteMany();
    for (let i = 0; i < incidents.length; i += CHUNK_SIZE) {
      const chunk = incidents.slice(i, i + CHUNK_SIZE);
      await prisma.incident.createMany({ data: chunk });
      process.stdout.write(
        `Imported ${Math.min(i + CHUNK_SIZE, incidents.length)} / ${incidents.length}\r`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }

  process.stdout.write("\n");
  console.log(`Imported ${incidents.length} incidents from ${sheetName}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
