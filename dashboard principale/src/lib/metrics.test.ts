import { describe, expect, it } from "vitest";

import { paretoFromCounts } from "./metrics";

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
