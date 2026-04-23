export function formatIntFr(n: number): string {
  return Math.round(n).toLocaleString("fr-FR");
}

export function formatPct1(n: number): string {
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
}

export function formatDays1FromHours(hours: number): string {
  const days = hours / 24;
  return days.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

export function formatHours1(hours: number): string {
  return hours.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

export function formatSignedPct1(deltaPctPoints: number): string {
  const sign = deltaPctPoints > 0 ? "+" : "";
  return `${sign}${deltaPctPoints.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
}
