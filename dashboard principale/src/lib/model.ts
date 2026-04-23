export type IncidentRow = {
  openAt: Date;
  closeAt: Date | null;
  status: string;

  region: string | null;
  offer: string | null;

  resolutionCode: string | null;
  productType: string | null;
  briefDescription: string | null;

  durationHours: number | null;
};

export type DashboardFilters = {
  period: "30d" | "90d" | "365d" | "all";
  region: string | null;
  offer: string | null;
  month: string | null; // "YYYY-MM" optional month lock (used on deep-dive pages)
};
