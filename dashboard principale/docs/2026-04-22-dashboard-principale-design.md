# Dashboard Principale — Design (Approved)

## Goal

Rebuild the Tunisie Telecom organizational performance dashboard (5 Figma screens) as a **Next.js** application located entirely in `PFA/dashboard principale`, with KPIs and charts computed from the global dataset `PFA/database/all-data.xlsx`.

## Source of truth

- Workbook: `PFA/database/all-data.xlsx`
- Sheet: `hexabyte-02022026`
- Rows: ~22,851
- Key columns used for analytics:
  - `open_time (HPSM)` (primary time axis for filtering)
  - `close_time`
  - `problem_status` (mostly `Clôturé`, small `Ouvert` tail)
  - `TT_resolution_duration` (parsed to hours; ~96.9% non-null)
  - `Region`, `Offre`, `resolution_code`, `product_type`, `brief_description`

## Pages / routes

- `/` — Vue globale (Figma `Group 6`)
- `/performance` — Efficacité du Réseau & Service (Figma `Group 1`)
- `/interventions` — Interventions (Figma `Group 4`)
- `/reclamations` — Détail des Réclamations (Figma `Group 5`)
- `/pareto` — Pareto (Figma `Second Vue`)

Shared chrome: left navigation + top bar + consistent card system.

## Global filters (UI parity + data correctness)

- Period presets driven by `open_time (HPSM)` (default: last 30 days)
- Optional filters when shown in the mock:
  - `Region`
  - `Offre`

Filters are represented as URL search params so pages stay shareable and server-renderable.

## Metric definitions (derived from the dataset)

### Volume

- **Total records** in the filtered frame = number of rows after applying filters.

### Duration

- Parse `TT_resolution_duration` to `durationHours`.
- Display units match the screen:
  - “j” pages: `durationDays = durationHours / 24`
  - “h” pages: `durationHours`

Aggregation defaults:

- **Mean** for headline KPIs where the mock implies an average (e.g. “4.2j”, “4.2h”).
- **Median** available internally for robustness, but UI follows mean unless a screen clearly implies otherwise.

### Status split (donut / backlog feel)

- **Traitées**: `problem_status` normalized equals `Clôturé`
- **En cours**: everything else
- **Urgentes**: rows with `durationHours` in the top **5%** of the filtered closed subset (or all rows if needed), capped to an integer count; also used to align “alert” style KPIs with long-tail durations

### Pareto

- Categories: `resolution_code` (drop empty)
- Bars: counts
- Line: cumulative percentage of total

### Top problems

- Categories: `brief_description` (trimmed), top 10 by count

### Regional / offer breakdowns

- By `Region`: mean `durationDays` (for horizontal bar charts)
- By `Offre`: counts for ranking lists; optional mean duration where the chart implies time

## Non-goals

- No edits outside `PFA/dashboard principale` (the workbook remains read-only input at `../database/all-data.xlsx`).
- No backend database: Excel is the datastore for this prototype.

## Risks / notes

- Excel parsing is heavier than JSON; mitigate with **server-side caching** and stable filtering.
- Some labels in mocks are illustrative; numbers will reflect the workbook, while layout/components match Figma.
