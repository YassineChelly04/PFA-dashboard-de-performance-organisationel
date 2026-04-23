# Dashboard Principale (Next.js + `all-data.xlsx`) Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 5-screen Tunisie Telecom performance dashboard in `PFA/dashboard principale` using Next.js App Router, styled to match the Figma exports, powered by analytics computed from `PFA/database/all-data.xlsx`.

**Architecture:** A server-side data access layer reads the workbook once (cached), normalizes rows (dates + durations), applies URL-driven filters, and exposes typed “view models” for each route. UI is composed from shared layout primitives (sidebar/topbar/cards) plus page-specific sections using `recharts` for chart parity.

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + `xlsx` + `recharts` + `lucide-react` + `zod` (light validation) + `vitest` (unit tests for pure analytics helpers)

---

### Task 1: Scaffold Next.js app in `dashboard principale/`

**Files:**
- Create: `dashboard principale/package.json`
- Create: `dashboard principale/next.config.ts`
- Create: `dashboard principale/tsconfig.json`
- Create: `dashboard principale/postcss.config.mjs`
- Create: `dashboard principale/tailwind.config.ts`
- Create: `dashboard principale/src/app/globals.css`
- Create: `dashboard principale/src/app/layout.tsx`
- Create: `dashboard principale/src/app/page.tsx` (temporary stub; replaced in Task 5)
- Create: `dashboard principale/.gitignore`

- [ ] **Step 1: Initialize package metadata + scripts**

```json
{
  "name": "dashboard-principale",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3010",
    "build": "next build",
    "start": "next start -p 3010",
    "lint": "next lint",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run (from `PFA/dashboard principale`):

```bash
npm install next react react-dom zod xlsx recharts lucide-react
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer eslint eslint-config-next vitest
```

Expected: `package-lock.json` created under `dashboard principale/`.

- [ ] **Step 3: Verify Next boots**

Run:

```bash
npm run dev
```

Expected: server starts on port **3010** (chosen to avoid colliding with other apps in this repo).

---

### Task 2: Excel ingestion + normalized row model (server-only)

**Files:**
- Create: `dashboard principale/src/lib/excel/path.ts`
- Create: `dashboard principale/src/lib/excel/loadWorkbook.ts`
- Create: `dashboard principale/src/lib/model.ts`
- Create: `dashboard principale/src/lib/normalize.ts`

- [ ] **Step 1: Resolve workbook path safely**

Implement `resolveAllDataXlsxPath()` → absolute path to `PFA/database/all-data.xlsx` using:

- `path.join(process.cwd(), '..', 'database', 'all-data.xlsx')`

- [ ] **Step 2: Load sheet into objects**

Use `xlsx` (`readFile`) and `sheet_to_json` with `defval: null`.

- [ ] **Step 3: Normalize each row**

Map raw keys to:

- `openAt: Date | null` from `open_time (HPSM)`
- `closeAt: Date | null` from `close_time`
- `status: string` from `problem_status`
- `region: string | null`, `offer: string | null`
- `resolutionCode: string | null`, `productType: string | null`, `briefDescription: string | null`
- `durationHours: number | null` from `TT_resolution_duration` (Excel duration → fraction of day → hours)

- [ ] **Step 4: Add in-memory cache**

Module-level promise cache so repeat requests in dev are fast.

---

### Task 3: Filtering + pure analytics helpers (with unit tests)

**Files:**
- Create: `dashboard principale/src/lib/filters.ts`
- Create: `dashboard principale/src/lib/metrics.ts`
- Create: `dashboard principale/src/lib/metrics.test.ts`
- Create: `dashboard principale/vitest.config.ts`

- [ ] **Step 1: Write failing tests for duration parsing + pareto cumulative**

```ts
import { describe, expect, it } from "vitest";
import { paretoFromCounts } from "./metrics";

describe("paretoFromCounts", () => {
  it("computes cumulative percents", () => {
    expect(
      paretoFromCounts([
        { key: "A", count: 50 },
        { key: "B", count: 30 },
        { key: "C", count: 20 },
      ])
    ).toEqual([
      { key: "A", count: 50, cumPct: 50 },
      { key: "B", count: 30, cumPct: 80 },
      { key: "C", count: 20, cumPct: 100 },
    ]);
  });
});
```

Run:

```bash
npm run test
```

Expected: FAIL (function not implemented)

- [ ] **Step 2: Implement `metrics.ts`**

Include:

- `paretoFromCounts`
- `topNCounts`
- `mean`, `quantile` helpers for urgent threshold
- `monthBuckets` for time series

- [ ] **Step 3: Re-run tests**

Run:

```bash
npm run test
```

Expected: PASS

---

### Task 4: Shared UI chrome (Sidebar + Topbar + AppShell)

**Files:**
- Create: `dashboard principale/src/components/AppShell.tsx`
- Create: `dashboard principale/src/components/Sidebar.tsx`
- Create: `dashboard principale/src/components/Topbar.tsx`
- Create: `dashboard principale/src/components/ui/Card.tsx`
- Create: `dashboard principale/src/components/ui/Badge.tsx`
- Create: `dashboard principale/src/components/ui/Button.tsx`

- [ ] **Step 1: Implement navigation map**

Routes:

- `/` Vue globale
- `/interventions`
- `/performance`
- `/reclamations`
- `/pareto`

Active route styling should mirror the Figma highlights.

- [ ] **Step 2: Implement top bar**

Search input is visual (can be non-functional for v1), icons + profile block like mock.

---

### Task 5: Implement pages (server components + small client chart wrappers)

**Files:**
- Create: `dashboard principale/src/app/(dashboard)/layout.tsx`
- Create: `dashboard principale/src/app/(dashboard)/page.tsx` (Vue globale)
- Create: `dashboard principale/src/app/(dashboard)/performance/page.tsx`
- Create: `dashboard principale/src/app/(dashboard)/interventions/page.tsx`
- Create: `dashboard principale/src/app/(dashboard)/reclamations/page.tsx`
- Create: `dashboard principale/src/app/(dashboard)/pareto/page.tsx`
- Create: `dashboard principale/src/components/charts/*` (thin `recharts` wrappers as `"use client"`)

- [ ] **Step 1: URL filter schema**

Use `zod` to parse:

- `period=30d|90d|365d|all`
- `region=...`
- `offer=...`

- [ ] **Step 2: Wire each page to metrics**

Each page exports a server component that:

1) loads workbook
2) filters rows
3) computes KPIs + chart series
4) renders layout

---

### Task 6: Verification

**Files:**
- Modify: `dashboard principale/README.md` (update run instructions for Next.js)

- [ ] **Step 1: Lint**

Run:

```bash
npm run lint
```

Expected: no errors

- [ ] **Step 2: Build**

Run:

```bash
npm run build
```

Expected: successful production build

- [ ] **Step 3: Manual visual check**

Run:

```bash
npm run dev
```

Open:

- `http://127.0.0.1:3010/`
- `http://127.0.0.1:3010/interventions`
- `http://127.0.0.1:3010/performance`
- `http://127.0.0.1:3010/reclamations`
- `http://127.0.0.1:3010/pareto`

---

## Spec coverage check

- Excel-backed KPIs/charts for all 5 routes: Tasks 2–5
- Figma-like layout/components: Tasks 4–5
- Stay within `dashboard principale/`: Tasks 1–6 (workbook read-only at `../database/`)

## Plan complete

Plan saved to `dashboard principale/docs/2026-04-22-dashboard-principale-plan.md`.

**Execution choice:**

1) **Subagent-Driven** — dispatch a fresh subagent per task  
2) **Inline Execution** — implement task-by-task in this session

If you don’t choose, default is **Inline Execution** for speed.
