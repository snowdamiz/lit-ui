---
phase: 096-cli-integration-documentation
plan: 04
subsystem: ui
tags: [react, charts, echarts, docs, tree-shaking, subpath-exports, lit, web-components, bundle-size, webgl]

# Dependency graph
requires:
  - phase: 096-cli-integration-documentation
    plan: 01
    provides: Multi-entry Vite build + 8 subpath exports for @lit-ui/charts
  - phase: 096-cli-integration-documentation
    plan: 03
    provides: LineChartPage/AreaChartPage/BarChartPage/PieChartPage in apps/docs/src/pages/charts/

provides:
  - ScatterChartPage.tsx with WebGL callout and bundle size section (DOCS-02 completed)
  - HeatmapChartPage.tsx with xCategories/yCategories/data property demo
  - CandlestickChartPage.tsx with OHLC order warning and bull/bear color props
  - TreemapChartPage.tsx with hierarchical demo and breadcrumb/rounded/level-colors props
  - All 8 chart routes registered in App.tsx
  - Charts NavSection in nav.ts with 8 items (between Components and Tools)

affects: [docs-routing, navigation, bundle-size-guidance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useRef + useEffect pattern for all 4 new chart demos — same pattern as Plan 03"
    - "xCategories/yCategories set as separate property assignments in HeatmapChartDemo useEffect"
    - "Bundle size section rendered as styled inline table in ScatterChartPage (DOCS-02)"
    - "amber warning box for CandlestickChartPage OHLC order warning — beyond blue callout"

key-files:
  created:
    - apps/docs/src/pages/charts/ScatterChartPage.tsx
    - apps/docs/src/pages/charts/HeatmapChartPage.tsx
    - apps/docs/src/pages/charts/CandlestickChartPage.tsx
    - apps/docs/src/pages/charts/TreemapChartPage.tsx
  modified:
    - apps/docs/src/App.tsx
    - apps/docs/src/nav.ts

key-decisions:
  - "xCategories/yCategories assigned as separate properties in HeatmapChartDemo — cannot be serialized as HTML attributes (array values)"
  - "OHLC order warning rendered as amber callout box (not just PropsTable description) — critical enough to warrant high-visibility treatment"
  - "Bundle size table placed in ScatterChartPage (enable-gl WebGL impact) with recommendation paragraph — DOCS-02"
  - "tsc --noEmit (plan verification) passes 0 errors; tsc -b fails with pre-existing lui-* JSX.IntrinsicElements errors from Plan 03 pages — out of scope"

patterns-established:
  - "Chart page pattern is complete: subpath import + demo component + ExampleBlock + PropsTable + CSS token table + tree-shaking callout"

requirements-completed: [DOCS-01, DOCS-02]

# Metrics
duration: 5min
completed: 2026-03-01
---

# Phase 96 Plan 04: Chart Docs Pages (Scatter, Heatmap, Candlestick, Treemap) Summary

**4 React docs pages completing the 8-chart documentation suite, with all routes wired into App.tsx, Charts nav section added to nav.ts, and bundle size guidance in ScatterChartPage**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-01T04:56:51Z
- **Completed:** 2026-03-01T05:01:27Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created 4 chart page TSX files in `apps/docs/src/pages/charts/` completing the full 8-chart suite
- ScatterChartPage includes the full bundle size comparison table (DOCS-02 final delivery)
- CandlestickChartPage has both a PropsTable warning and a prominent amber callout box for the [open, close, low, high] array order
- HeatmapChartPage demo sets xCategories, yCategories, and data as three separate property assignments in useEffect
- App.tsx now has all 8 chart routes registered under `charts/[name]` paths
- nav.ts has a new "Charts" NavSection with 8 items between Components and Tools
- `pnpm --filter lit-ui-docs tsc --noEmit` passes with 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ScatterChartPage.tsx, HeatmapChartPage.tsx, CandlestickChartPage.tsx, TreemapChartPage.tsx** - `24a69e6` (feat)
2. **Task 2: Wire all 8 chart routes into App.tsx and add Charts section to nav.ts** - `b749660` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/docs/src/pages/charts/ScatterChartPage.tsx` - Scatter/bubble chart page: 10-point demo, 6 props (bubble + enable-gl with WebGL description), bundle size section
- `apps/docs/src/pages/charts/HeatmapChartPage.tsx` - Heatmap chart page: 5x3 weekly grid demo with three property assignments, 8 props (x-categories/y-categories/color-range), CSS token table
- `apps/docs/src/pages/charts/CandlestickChartPage.tsx` - Candlestick chart page: 5-bar OHLC demo, amber [open,close,low,high] warning box, 9 props (bull-color/bear-color/show-volume/moving-averages)
- `apps/docs/src/pages/charts/TreemapChartPage.tsx` - Treemap chart page: 2-root hierarchical demo, 8 props (breadcrumb/rounded/level-colors), CSS token table
- `apps/docs/src/App.tsx` - Added 8 chart imports + 8 Route elements under Charts comment block
- `apps/docs/src/nav.ts` - Added Charts NavSection with 8 items between Components and Tools

## Decisions Made
- Used three separate property assignments (`el.xCategories`, `el.yCategories`, `el.data`) in HeatmapChartDemo — array values cannot be serialized to HTML attributes; separate assignments are clearer than a single object
- Added amber warning box in CandlestickChartPage in addition to the PropsTable description — the [open, close, low, high] order trap is critical enough for high-visibility treatment
- Bundle size table placed in ScatterChartPage rather than a standalone page — scatter is the only chart with WebGL cost, making it the natural home for bundle size guidance (DOCS-02)
- Pre-existing `tsc -b` failures (lui-* JSX.IntrinsicElements undefined) are out of scope — they exist in all Plan 03 pages and were not introduced by this plan

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
Pre-existing `tsc -b` build failure (used in `pnpm build` script) — `lui-*` custom element names are not declared in `JSX.IntrinsicElements`. This affects ALL chart pages including Plan 03's. The plan's verification command (`tsc --noEmit`) passes with 0 errors. Deferred to `.planning/phases/096-cli-integration-documentation/deferred-items.md`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 chart documentation pages are complete and navigable
- Phase 96 is now complete — all 4 plans delivered (multi-entry build, CLI integration, 4 chart pages, remaining 4 chart pages + routing)
- v9.0 milestone is delivered

## Self-Check: PASSED
- FOUND: apps/docs/src/pages/charts/ScatterChartPage.tsx
- FOUND: apps/docs/src/pages/charts/HeatmapChartPage.tsx
- FOUND: apps/docs/src/pages/charts/CandlestickChartPage.tsx
- FOUND: apps/docs/src/pages/charts/TreemapChartPage.tsx
- FOUND: commit 24a69e6 (feat: 4 new chart pages)
- FOUND: commit b749660 (feat: App.tsx routes + nav.ts Charts section)

---
*Phase: 096-cli-integration-documentation*
*Completed: 2026-03-01*
