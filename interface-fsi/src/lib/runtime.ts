export function isVercelDeployment() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

export function canUseWorkbookRuntimeFallback() {
  if (process.env.ALLOW_WORKBOOK_RUNTIME === "1") {
    return true;
  }

  return !isVercelDeployment();
}

const DATABASE_UNAVAILABLE_MARKERS = [
  "prismaclientinitializationerror",
  "unable to open the database file",
  "error code 14",
  "can't reach database server",
];

export const PRODUCTION_DATABASE_ERROR_MESSAGE =
  "La base de donnees n'est pas configuree pour la production. Configurez DATABASE_URL sur Vercel (PostgreSQL recommande).";

export function isDatabaseUnavailableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const normalizedError = `${error.name} ${error.message}`.toLowerCase();
  return DATABASE_UNAVAILABLE_MARKERS.some((marker) =>
    normalizedError.includes(marker),
  );
}
