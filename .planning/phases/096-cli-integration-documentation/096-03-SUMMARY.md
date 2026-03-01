---
phase: 096-cli-integration-documentation
plan: 03
subsystem: ui
tags: [react, charts, echarts, docs, tree-shaking, subpath-exports, lit, web-components]

# Dependency graph
requires:
  - phase: 096-cli-integration-documentation
    plan: 01
    provides: Multi-entry Vite build + 8 subpath exports for @lit-ui/charts

provides:
  - LineChartPage.tsx with live demo, PropsTable, CSS token table, tree-shaking callout
  - AreaChartPage.tsx with stacked demo, PropsTable, CSS token table, tree-shaking callout
  - BarChartPage.tsx with grouped/labeled demo, PropsTable, CSS token table, tree-shaking callout
  - PieChartPage.tsx with donut demo, PropsTable, CSS token table, tree-shaking callout
  - "@lit-ui/charts workspace:* in apps/docs/package.json"

affects: [docs-routing, plan-04-remaining-charts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useRef + useEffect pattern for setting .data on Lit custom elements from React — required because ECharts data cannot be serialized to HTML attributes"
    - "Side-effect subpath imports (@lit-ui/charts/line-chart) register custom elements without importing the full bundle"
    - "CSSVarDef inline table pattern (not PropsTable) for CSS custom properties — different shape than PropDef"

key-files:
  created:
    - apps/docs/src/pages/charts/LineChartPage.tsx
    - apps/docs/src/pages/charts/AreaChartPage.tsx
    - apps/docs/src/pages/charts/BarChartPage.tsx
    - apps/docs/src/pages/charts/PieChartPage.tsx
  modified:
    - apps/docs/package.json

key-decisions:
  - "useRef + useEffect for .data binding — ECharts data is a complex object array that cannot be serialized as HTML attribute strings; property assignment required"
  - "Subpath imports in page files (@lit-ui/charts/line-chart not @lit-ui/charts) — demonstrates tree-shaking to docs readers and keeps bundle size consistent with recommendation"
  - "CSS token table rendered as inline <table> JSX, not PropsTable — CSSVarDef has different shape (no 'type' field) from PropDef"

patterns-established:
  - "Chart demo pattern: XxxChartDemo component + useRef<HTMLElement>(null) + useEffect .data assignment + lui-xxx-chart with style={{height:'300px',display:'block'}}"
  - "Tree-shaking callout: blue bg-blue-50 box after header, before examples, per-page subpath name substituted"

requirements-completed: [DOCS-01, DOCS-02]

# Metrics
duration: 3min
completed: 2026-02-28
---

# Phase 96 Plan 03: Chart Docs Pages (Line, Area, Bar, Pie) Summary

**4 React docs pages for Line/Area/Bar/Pie charts with live useRef+useEffect demos, PropsTable API reference, CSS token tables, and per-chart tree-shaking callouts using subpath imports**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T04:45:34Z
- **Completed:** 2026-03-01T04:48:56Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added `@lit-ui/charts: workspace:*` to `apps/docs/package.json` alphabetically between @lit-ui/calendar and @lit-ui/checkbox
- Created `apps/docs/src/pages/charts/` directory with 4 fully-typed TSX page files
- Each page uses the `useRef + useEffect` pattern to assign `.data` after React mount — the critical pattern since ECharts data cannot be serialized to HTML attributes
- Each page includes a blue tree-shaking callout explaining subpath imports (~135KB vs 350KB+), fulfilling DOCS-02

## Task Commits

Each task was committed atomically:

1. **Task 1: Add @lit-ui/charts dependency to docs app package.json** - `ba4fe91` (chore)
2. **Task 2: Create LineChartPage.tsx, AreaChartPage.tsx, BarChartPage.tsx, PieChartPage.tsx** - `98a3c2d` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/docs/package.json` - Added `@lit-ui/charts: workspace:*` between @lit-ui/calendar and @lit-ui/checkbox
- `apps/docs/src/pages/charts/LineChartPage.tsx` - Line chart page: Sales+Revenue demo, 8 props, 17 CSS tokens, tree-shaking callout
- `apps/docs/src/pages/charts/AreaChartPage.tsx` - Area chart page: PageViews+UniqueVisitors stacked demo, 8 props, 17 CSS tokens, tree-shaking callout
- `apps/docs/src/pages/charts/BarChartPage.tsx` - Bar chart page: ProductA+ProductB quarterly demo with labels, 9 props, 17 CSS tokens, tree-shaking callout
- `apps/docs/src/pages/charts/PieChartPage.tsx` - Pie/donut chart page: 5-slice Electronics demo with inner-radius+center-label, 8 props, 17 CSS tokens, tree-shaking callout

## Decisions Made
- Used `useRef + useEffect` for `.data` binding in all 4 demo components — ECharts data is a complex object array that cannot be serialized as HTML attribute strings; JS property assignment is required
- Subpath imports in page files (`@lit-ui/charts/line-chart` not `@lit-ui/charts`) — demonstrates tree-shaking to docs readers and keeps bundle size consistent with the recommendation in the callout
- CSS token table rendered as inline `<table>` JSX rather than PropsTable — CSSVarDef has a different shape (no `type` field) than PropDef, same pattern used in ButtonPage.tsx

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 4 chart doc pages are fully authored and TypeScript-clean (0 errors from `pnpm --filter lit-ui-docs tsc --noEmit`)
- Pages are NOT yet wired into routing/navigation — that happens in Plan 04 along with the remaining 4 chart types
- Ready for Plan 04: remaining 4 charts (Scatter, Heatmap, Candlestick, Treemap) + App.tsx routing

## Self-Check: PASSED
- FOUND: apps/docs/src/pages/charts/LineChartPage.tsx
- FOUND: apps/docs/src/pages/charts/AreaChartPage.tsx
- FOUND: apps/docs/src/pages/charts/BarChartPage.tsx
- FOUND: apps/docs/src/pages/charts/PieChartPage.tsx
- FOUND: .planning/phases/096-cli-integration-documentation/096-03-SUMMARY.md
- FOUND: commit ba4fe91 (chore: add @lit-ui/charts to docs package.json)
- FOUND: commit 98a3c2d (feat: 4 chart pages)

---
*Phase: 096-cli-integration-documentation*
*Completed: 2026-02-28*
