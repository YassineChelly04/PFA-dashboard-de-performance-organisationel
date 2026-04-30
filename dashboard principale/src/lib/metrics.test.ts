import { describe, expect, it } from "vitest";

import type { IncidentRow } from "./model";
import { URGENT_TICKET_THRESHOLD_HOURS, paretoFromCounts, statusSplit } from "./metrics";

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
