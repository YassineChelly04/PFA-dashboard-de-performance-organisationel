import fs from "node:fs";
import path from "node:path";

function resolveWorkbookPathCandidates() {
  const envPath = process.env.WORKBOOK_PATH?.trim();
  const candidates = [];

  if (envPath) {
    candidates.push(path.resolve(envPath));
  }

  candidates.push(path.resolve(process.cwd(), "..", "database", "all-data.xlsx"));
  candidates.push(path.resolve(process.cwd(), "data", "data.xlsx"));

  return candidates;
}

export function resolveAllDataXlsxPath(): string {
  for (const candidate of resolveWorkbookPathCandidates()) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Return the primary path so the caller can throw a controlled error with context.
  return resolveWorkbookPathCandidates()[0];
}
