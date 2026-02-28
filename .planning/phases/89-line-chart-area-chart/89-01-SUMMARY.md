---
phase: 89-line-chart-area-chart
plan: 01
subsystem: ui
tags: [echarts, lit, web-components, charts, line-chart, streaming]

# Dependency graph
requires:
  - phase: 88-package-foundation-basechartelement
    provides: BaseChartElement abstract base class with streaming, lifecycle, WebGL guard, and disposal chain
provides:
  - buildLineOption() pure helper for line and area chart ECharts option construction
  - LineChartSeries, MarkLineSpec, LineOptionProps types shared by line and area charts
  - registerLineModules() with _lineRegistered guard for deduplication
  - LuiLineChart Lit custom element as lui-line-chart with smooth, zoom, markLines props
affects:
  - 89-02 (area-chart.ts reuses line-option-builder and line-registry)
  - 90+ (pattern for per-chart registry files with guards)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-chart registry file (line-registry.ts) with module-level guard for safe multi-instance deduplication"
    - "Pure option builder function (buildLineOption) shared by line and area charts — single source of truth"
    - "stack string 'total' not boolean for ECharts stacking — boolean does not activate stacking"
    - "markLine on index-0 series only — prevents duplicate threshold lines with multi-series data"
    - "_streamingMode = 'appendData' set in constructor, not _registerModules, so pushData works before modules load"
    - "attribute: false on complex props (markLines) to avoid lossy JSON.parse via HTML attribute"

key-files:
  created:
    - packages/charts/src/shared/line-option-builder.ts
    - packages/charts/src/line/line-registry.ts
    - packages/charts/src/line/line-chart.ts
  modified: []

key-decisions:
  - "buildLineOption mode param ('line'|'area') controls areaStyle and stack — single function for both chart types"
  - "markLine only on series index 0 — prevents N duplicate threshold lines when N series present"
  - "stack uses string 'total' not boolean true — ECharts requires string group name to activate stacking"

patterns-established:
  - "line-option-builder.ts: shared option builder pattern for charts sharing the same ECharts series type"
  - "line-registry.ts: per-chart registry pattern with module-level _registered guard"
  - "LuiLineChart: constructor _streamingMode override pattern for appendData charts"

requirements-completed: [LINE-01, LINE-02, LINE-03]

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 89 Plan 01: Line Chart Summary

**buildLineOption() shared option builder + registerLineModules() registry + LuiLineChart Lit element with smooth/zoom/markLines props and appendData streaming**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T20:39:58Z
- **Completed:** 2026-02-28T20:41:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `line-option-builder.ts` with pure `buildLineOption()` helper shared by both line and area charts
- Created `line-registry.ts` with `registerLineModules()` and `_lineRegistered` guard preventing double-registration
- Created `LuiLineChart` Lit component with `smooth`, `zoom`, `markLines` props, `_streamingMode = 'appendData'` in constructor, and `lui-line-chart` custom element registration

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared line-option-builder.ts** - `496e26b` (feat)
2. **Task 2: Create line-registry.ts and LuiLineChart component** - `b0d631a` (feat)

**Plan metadata:** (docs commit added after summary)

## Files Created/Modified
- `packages/charts/src/shared/line-option-builder.ts` - Pure buildLineOption() helper + LineChartSeries, MarkLineSpec, LineOptionProps types
- `packages/charts/src/line/line-registry.ts` - registerLineModules() with _lineRegistered guard, dynamically imports LineChart from echarts/charts
- `packages/charts/src/line/line-chart.ts` - LuiLineChart class with smooth/zoom/markLines props, extends BaseChartElement, registers lui-line-chart

## Decisions Made
- `buildLineOption` accepts a `mode` param (`'line' | 'area'`) so the same function handles both chart types — area gets `areaStyle` and optional `stack`
- `markLine` applied to first series only (index 0) — prevents N duplicate threshold lines when N series are present
- `stack` must be string `'total'` not boolean — ECharts requires a string group name to activate series stacking

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three LINE requirements (LINE-01, LINE-02, LINE-03) satisfied
- `line-option-builder.ts` and `line-registry.ts` ready for Plan 02 area chart to import and reuse
- LuiLineChart not yet exported from `packages/charts/src/index.ts` — that happens in Plan 02 alongside LuiAreaChart

## Self-Check: PASSED

- FOUND: packages/charts/src/shared/line-option-builder.ts
- FOUND: packages/charts/src/line/line-registry.ts
- FOUND: packages/charts/src/line/line-chart.ts
- FOUND: .planning/phases/89-line-chart-area-chart/89-01-SUMMARY.md
- FOUND commit: 496e26b (feat: line-option-builder.ts)
- FOUND commit: b0d631a (feat: line-registry.ts + LuiLineChart)

---
*Phase: 89-line-chart-area-chart*
*Completed: 2026-02-28*
