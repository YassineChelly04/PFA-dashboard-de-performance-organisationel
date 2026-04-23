export function normalizeText(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  const s = String(input).replace(/\u00a0/g, " ").trim();
  if (!s) return null;
  return s;
}

export function normalizeKey(input: unknown): string | null {
  const s = normalizeText(input);
  if (!s) return null;
  return s.toLowerCase();
}
