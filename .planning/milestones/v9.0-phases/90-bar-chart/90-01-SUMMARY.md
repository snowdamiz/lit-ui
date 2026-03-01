---
phase: 90-bar-chart
plan: 01
subsystem: ui
tags: [echarts, charts, bar-chart, typescript, option-builder]

# Dependency graph
requires:
  - phase: 89-line-chart-area-chart
    provides: line-option-builder.ts and line-registry.ts patterns replicated for bar charts
  - phase: 88-charts-base
    provides: BaseChartElement, registerCanvasCore(), canvas-core.ts shared registry
provides:
  - buildBarOption() pure function with stacked/horizontal/showLabels/colorByData/categories support
  - BarChartSeries and BarOptionProps types
  - registerBarModules() with _barRegistered guard for ECharts BarChart module
  - packages/charts/src/bar/ directory established for LuiBarChart (Plan 02)
affects: [90-02-bar-chart-component, index-ts-exports]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "bar-option-builder: pure function buildBarOption() separate from Lit component, same pattern as buildLineOption()"
    - "bar-registry: module-level _barRegistered guard, calls registerCanvasCore() then use([BarChart])"
    - "stack: 'total' string not boolean — consistent with line-option-builder stacked pattern"
    - "axis swap for horizontal: both xAxis and yAxis swap atomically to avoid garbled output"

key-files:
  created:
    - packages/charts/src/shared/bar-option-builder.ts
    - packages/charts/src/bar/bar-registry.ts
  modified: []

key-decisions:
  - "stack uses string 'total' not boolean — ECharts requires string group name for stacking (consistent with Phase 89)"
  - "label position adapts to orientation: 'top' for vertical bars, 'right' for horizontal bars to avoid clipping"
  - "colorBy: 'data' uses ThemeBridge palette automatically; no manual color lookup needed"
  - "categories field is optional — omit to use ECharts integer index defaults, pass for named axis labels"
  - "bar/ directory structure mirrors line/ and area/ — establishes consistent per-chart-type directory pattern"

patterns-established:
  - "Option-builder-first: build types + pure function before Lit component (same as Phase 89)"
  - "Registry guard: module-level boolean flag prevents double-registration across multiple chart instances"

requirements-completed: [BAR-01, BAR-02, BAR-03]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 90 Plan 01: Bar Option Builder + Registry Summary

**Pure buildBarOption() helper with stacked/horizontal/showLabels/colorByData support and registerBarModules() registry with _barRegistered guard for tree-shaken ECharts BarChart module**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T21:09:57Z
- **Completed:** 2026-02-28T21:11:01Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `bar-option-builder.ts` with full BAR-01/BAR-02 feature set: stacked bars via `stack: 'total'`, horizontal orientation with atomic axis swap, value labels with position adapting to orientation, and per-bar color via `colorBy: 'data'`
- Created `packages/charts/src/bar/` directory with `bar-registry.ts` implementing the `_barRegistered` guard pattern from Phase 89 line-registry.ts
- Zero TypeScript errors across full charts package after both files added

## Task Commits

Each task was committed atomically:

1. **Task 1: Create bar-option-builder.ts** - `4b36436` (feat)
2. **Task 2: Create bar-registry.ts** - `88a778b` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `packages/charts/src/shared/bar-option-builder.ts` - BarChartSeries type, BarOptionProps type, buildBarOption() pure function covering BAR-01 and BAR-02 features
- `packages/charts/src/bar/bar-registry.ts` - registerBarModules() with _barRegistered guard, calls registerCanvasCore() then use([BarChart]) via tree-shaken subpath imports

## Decisions Made
- `stack` property uses string `'total'` not boolean — ECharts requires a string group name to activate stacking (consistent with Phase 89 line-option-builder decision)
- Label position adapts to orientation: `'top'` for vertical bars, `'right'` for horizontal bars — avoids label clipping at bar boundaries
- Both axes swap atomically in horizontal mode — swapping only one produces garbled bar output
- `categories` field is optional — omit to use ECharts integer index defaults, pass named strings for explicit axis labels
- `colorBy: 'data'` automatically uses ThemeBridge-injected `--ui-chart-*` palette; no manual color lookup needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `bar-option-builder.ts` and `bar-registry.ts` are the two dependencies Plan 02 (LuiBarChart component) requires
- LuiBarChart (Plan 02) can now import `buildBarOption`, `BarChartSeries`, `BarOptionProps` from the shared builder
- LuiBarChart._registerModules() will call `registerBarModules()` from bar-registry.ts
- index.ts exports for bar chart types will be added in Plan 02

---
*Phase: 90-bar-chart*
*Completed: 2026-02-28*
