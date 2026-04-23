import path from "node:path";

export function resolveAllDataXlsxPath(): string {
  // `dashboard principale` is the Next.js project root for this app.
  return path.resolve(process.cwd(), "..", "database", "all-data.xlsx");
}
