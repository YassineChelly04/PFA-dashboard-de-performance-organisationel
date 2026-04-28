import { describe, expect, it } from "vitest";

import { buildParetoSystemPrompt, buildParetoUserPrompt } from "./paretoPrompt";
import type { ParetoReportPayload } from "./paretoReport";

const samplePayload: ParetoReportPayload = {
  scope: "mensuel",
  generatedAt: "2026-04-29T00:00:00.000Z",
  filtersApplied: {
    period: "all",
    region: "TUNIS",
    offer: null,
    month: "2026-04",
    q: null,
  },
  totals: {
    totalReclamations: 120,
    traitees: 92,
    urgentes: 17,
    tauxTraitementPct: 76.6,
    delaiMoyenHeures: 58.2,
    delaiMoyenJours: 2.425,
    variationVolumePct: -8.2,
    variationDelaiPct: 4.1,
  },
  topResolutionCodes: [
    { code: "IPMSAN", volume: 35, frequencePct: 29.2, cumulPct: 29.2, delaiMoyenHeures: 45 },
  ],
  topRegions: [{ region: "TUNIS", volume: 52 }],
  topOffers: [{ offer: "ADSL", volume: 66 }],
};

describe("paretoPrompt", () => {
  it("contains Tunisie Telecom guidance in system prompt", () => {
    const prompt = buildParetoSystemPrompt();
    expect(prompt).toContain("Tunisie Telecom");
    expect(prompt).toContain("Structure obligatoire");
  });

  it("injects scope and JSON payload in user prompt", () => {
    const prompt = buildParetoUserPrompt(samplePayload);
    expect(prompt).toContain("Portée du rapport: MENSUEL");
    expect(prompt).toContain('"totalReclamations": 120');
  });
});

