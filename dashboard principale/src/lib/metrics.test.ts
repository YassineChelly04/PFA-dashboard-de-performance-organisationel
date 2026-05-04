import { describe, expect, it } from "vitest";

import type { IncidentRow } from "./model";
import {
  SLA_TARGET_HOURS,
  URGENT_TICKET_THRESHOLD_HOURS,
  monthlyInterventionTrend,
  paretoFromCounts,
  slaComplianceRate,
  statusSplit,
} from "./metrics";

function row(overrides: Partial<IncidentRow>): IncidentRow {
  return {
    dLigne: null,
    openAt: new Date("2026-01-01T00:00:00.000Z"),
    closeAt: null,
    status: "Ouvert",
    region: null,
    offer: null,
    resolutionCode: null,
    productType: null,
    briefDescription: null,
    durationHours: null,
    ...overrides,
  };
}

describe("paretoFromCounts", () => {
  it("computes cumulative percents", () => {
    expect(
      paretoFromCounts([
        { key: "A", count: 50 },
        { key: "B", count: 30 },
        { key: "C", count: 20 },
      ]),
    ).toEqual([
      { key: "A", count: 50, cumPct: 50 },
      { key: "B", count: 30, cumPct: 80 },
      { key: "C", count: 20, cumPct: 100 },
    ]);
  });
});

describe("statusSplit", () => {
  it("uses a fixed urgent threshold and keeps treated/in-progress categories", () => {
    const split = statusSplit([
      row({ status: "Clôturé", durationHours: 2 }),
      row({ status: "Ouvert", durationHours: URGENT_TICKET_THRESHOLD_HOURS - 1 }),
      row({ status: "Ouvert", durationHours: URGENT_TICKET_THRESHOLD_HOURS }),
      row({ status: "Ouvert", durationHours: URGENT_TICKET_THRESHOLD_HOURS + 10 }),
    ]);

    expect(split).toEqual({
      treated: 1,
      inProgress: 3,
      urgent: 2,
    });
  });
});

describe("monthlyInterventionTrend", () => {
  it("splits monthly interventions into reseau/locale/logique-client", () => {
    const trend = monthlyInterventionTrend([
      row({ openAt: new Date("2026-01-10T00:00:00.000Z"), productType: "Panne DSLAM" }),
      row({ openAt: new Date("2026-01-12T00:00:00.000Z"), productType: "Raccordement manchon" }),
      row({ openAt: new Date("2026-01-15T00:00:00.000Z"), productType: "Client absent" }),
    ]);

    expect(trend).toEqual([
      {
        monthKey: "2026-01",
        label: "JAN",
        reseau: 1,
        locale: 1,
        logiqueClient: 1,
      },
    ]);
  });
});

describe("slaComplianceRate", () => {
  it("computes compliance over measured incidents only", () => {
    const rate = slaComplianceRate([
      row({ durationHours: SLA_TARGET_HOURS - 1 }),
      row({ durationHours: SLA_TARGET_HOURS }),
      row({ durationHours: SLA_TARGET_HOURS + 2 }),
      row({ durationHours: null }),
    ]);

    expect(rate).toBeCloseTo((2 / 3) * 100, 5);
  });
});
