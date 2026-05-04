import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

import { prisma } from "@/lib/prisma";

const DEBIT_COLUMN = "DebitADSL";

function normalize(value: unknown) {
  return String(value ?? "").trim();
}

function resolveWorkbookPath() {
  const envPath = process.env.WORKBOOK_PATH?.trim();
  const candidates = [
    envPath ? path.resolve(envPath) : null,
    path.resolve(process.cwd(), "data", "all-data.xlsx"),
    path.resolve(process.cwd(), "..", "database", "all-data.xlsx"),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function sortValues(values: string[]) {
  return values.sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
}

function readDebitOptionsFromWorkbook() {
  const workbookPath = resolveWorkbookPath();
  if (!workbookPath) {
    return [];
  }

  const workbook = XLSX.read(fs.readFileSync(workbookPath), {
    type: "buffer",
    cellDates: true,
  });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: true,
  });

  const values = new Set<string>();
  for (const row of rows) {
    const debit = normalize(row[DEBIT_COLUMN]);
    if (debit) {
      values.add(debit);
    }
  }

  return sortValues([...values]);
}

async function readDebitOptionsFromDatabase() {
  const rows = await prisma.client.findMany({
    select: { debitADSL: true },
    distinct: ["debitADSL"],
  });

  return sortValues(
    rows.map((row) => normalize(row.debitADSL)).filter((value) => Boolean(value)),
  );
}

export async function loadDebitAdslOptions() {
  const workbookOptions = readDebitOptionsFromWorkbook();
  if (workbookOptions.length > 0) {
    return { options: workbookOptions, source: "workbook" as const };
  }

  const databaseOptions = await readDebitOptionsFromDatabase();
  if (databaseOptions.length > 0) {
    return { options: databaseOptions, source: "database" as const };
  }

  return { options: [], source: "none" as const };
}
