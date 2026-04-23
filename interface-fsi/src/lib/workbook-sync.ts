import { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "node:url";
import { prisma } from "@/lib/prisma";

type WorkbookRow = Record<string, unknown>;

function findWorkbookPathFrom(baseDir: string) {
  let current = path.resolve(baseDir);
  while (true) {
    const candidate = path.join(current, "database", "all-data.xlsx");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function resolveWorkbookPath() {
  const envPath = process.env.WORKBOOK_PATH?.trim();
  if (envPath) {
    const resolved = path.resolve(envPath);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }

  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const roots = [process.cwd(), moduleDir];
  for (const root of roots) {
    const found = findWorkbookPathFrom(root);
    if (found) {
      return found;
    }
  }

  return path.join(process.cwd(), "..", "database", "all-data.xlsx");
}

export const WORKBOOK_PATH = resolveWorkbookPath();
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
} as const;

export interface WorkbookSyncSummary {
  created: number;
  updated: number;
  skipped: number;
  total: number;
}

function normalize(value: unknown) {
  return String(value ?? "").trim();
}

function excelValueToDate(value: unknown) {
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

function inferTypeClient(offre: string) {
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

function buildClientName(dLigne: string) {
  return `Client ${dLigne}`;
}

function ensureWorkbookExists() {
  if (!fs.existsSync(WORKBOOK_PATH)) {
    throw new Error(`Workbook not found at ${WORKBOOK_PATH}`);
  }
}

function readWorkbook() {
  ensureWorkbookExists();
  return XLSX.read(fs.readFileSync(WORKBOOK_PATH), {
    type: "buffer",
    cellDates: true,
  });
}

function getRows(workbook: XLSX.WorkBook) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return {
    sheetName,
    rows: XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: true,
    }) as WorkbookRow[],
  };
}

function findBestRow(
  rows: WorkbookRow[],
  predicate: (row: WorkbookRow) => boolean,
): WorkbookRow | null {
  const matches = rows.filter(predicate);
  return matches[0] ?? null;
}

function findRowIndex(
  rows: WorkbookRow[],
  predicate: (row: WorkbookRow) => boolean,
) {
  return rows.findIndex(predicate);
}

export function mapWorkbookRowToClientInput(
  row: WorkbookRow,
): Prisma.ClientUncheckedCreateInput | null {
  const dLigne = normalize(row[COLUMN.dLigne]);
  if (!dLigne) {
    return null;
  }

  const offre = normalize(row[COLUMN.offre]);

  return {
    dLigne,
    referenceExtranet: normalize(row[COLUMN.referenceExtranet]) || null,
    refHPSM: normalize(row[COLUMN.refHPSM]) || null,
    nom: buildClientName(dLigne),
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

export function findWorkbookRowByDLigne(dLigne: string) {
  const normalizedDLigne = normalize(dLigne).toUpperCase();
  if (!normalizedDLigne) {
    return null;
  }

  const { rows } = getRows(readWorkbook());
  return findBestRow(
    rows,
    (row) => normalize(row[COLUMN.dLigne]).toUpperCase() === normalizedDLigne,
  );
}

export function updateWorkbookActionFSI(dLigne: string, actionFSI: string) {
  const workbook = readWorkbook();
  const { sheetName, rows } = getRows(workbook);
  const normalizedDLigne = normalize(dLigne).toUpperCase();
  const normalizedAction = normalize(actionFSI);

  const rowIndex = findRowIndex(
    rows,
    (row) => normalize(row[COLUMN.dLigne]).toUpperCase() === normalizedDLigne,
  );

  if (rowIndex === -1) {
    return false;
  }

  rows[rowIndex][COLUMN.actionFSI] = normalizedAction;
  workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows);
  const output = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  fs.writeFileSync(WORKBOOK_PATH, output);
  return true;
}

export async function syncAllClientsFromWorkbook(): Promise<WorkbookSyncSummary> {
  const { rows } = getRows(readWorkbook());
  const existingClients = await prisma.client.findMany({
    select: { dLigne: true },
  });
  const existingDLignes = new Set(existingClients.map((client) => client.dLigne));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const clientInput = mapWorkbookRowToClientInput(row);
    if (!clientInput) {
      skipped += 1;
      continue;
    }

    const alreadyExists = existingDLignes.has(clientInput.dLigne);
    await prisma.client.upsert({
      where: { dLigne: clientInput.dLigne },
      update: clientInput,
      create: clientInput,
    });

    if (alreadyExists) {
      updated += 1;
    } else {
      created += 1;
      existingDLignes.add(clientInput.dLigne);
    }
  }

  return {
    created,
    updated,
    skipped,
    total: rows.length,
  };
}
