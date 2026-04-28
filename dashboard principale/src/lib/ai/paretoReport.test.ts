import { describe, expect, it } from "vitest";

import { buildParetoReportPayload, filtersForScope, paretoReportRequestSchema } from "./paretoReport";
import type { DashboardFilters, IncidentRow } from "../model";

const baseFilters: DashboardFilters = {
  period: "30d",
  region: "TUNIS",
  offer: null,
  month: null,
  q: null,
};

const now = new Date("2026-04-29T00:00:00.000Z");

const sampleIncidents: IncidentRow[] = [
  {
    dLigne: "DL-1",
    openAt: new Date("2026-04-02T08:00:00.000Z"),
    closeAt: new Date("2026-04-03T10:00:00.000Z"),
    status: "Traité",
    region: "TUNIS",
    offer: "ADSL",
    resolutionCode: "IPMSAN",
    productType: "Carte",
    briefDescription: "Ligne instable",
    durationHours: 26,
  },
  {
    dLigne: "DL-2",
    openAt: new Date("2026-04-04T08:00:00.000Z"),
    closeAt: null,
    status: "Ouvert",
    region: "TUNIS",
    offer: "ADSL",
    resolutionCode: "CABLAGE",
    productType: "Jarretière",
    briefDescription: "Panne locale",
    durationHours: 12,
  },
];

describe("paretoReport", () => {
  it("validates allowed scope values", () => {
    const ok = paretoReportRequestSchema.safeParse({ scope: "mensuel", filters: {} });
    const bad = paretoReportRequestSchema.safeParse({ scope: "weekly", filters: {} });

    expect(ok.success).toBe(true);
    expect(bad.success).toBe(false);
  });

  it("applies scope strategy to filters", () => {
    expect(filtersForScope(baseFilters, "global", now).period).toBe("all");
    expect(filtersForScope(baseFilters, "annuel", now).period).toBe("365d");
    expect(filtersForScope(baseFilters, "mensuel", now).month).toBe("2026-04");
  });

  it("builds a stable report payload contract", () => {
    const payload = buildParetoReportPayload(sampleIncidents, "mensuel", {
      ...baseFilters,
      period: "all",
      month: "2026-04",
    });

    expect(payload.scope).toBe("mensuel");
    expect(payload.totals.totalReclamations).toBe(2);
    expect(payload.topResolutionCodes.length).toBeGreaterThan(0);
    expect(payload.topRegions[0]?.region).toBe("TUNIS");
  });
});

