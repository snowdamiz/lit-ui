---
phase: 89-line-chart-area-chart
plan: 02
subsystem: ui
tags: [echarts, lit, web-components, charts, area-chart, streaming]

# Dependency graph
requires:
  - phase: 89-01
    provides: buildLineOption() shared helper, registerLineModules() registry, LineChartSeries/MarkLineSpec/LineOptionProps types
  - phase: 88-package-foundation-basechartelement
    provides: BaseChartElement abstract base class with streaming, lifecycle, WebGL guard, and disposal chain
provides:
  - LuiAreaChart Lit custom element as lui-area-chart with smooth, stacked, zoom props
  - Updated @lit-ui/charts public API — LuiLineChart, LuiAreaChart, LineChartSeries, MarkLineSpec, LineOptionProps all exported
affects:
  - 90+ (pattern for area chart variant that reuses line chart registry and option builder)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Area chart as thin wrapper over LuiLineChart — no new ECharts modules, reuses registerLineModules()"
    - "mode:'area' param to buildLineOption() enables areaStyle injection without code duplication"
    - "index.ts phase-grouped exports with comments marking Phase 88 vs Phase 89 additions"

key-files:
  created:
    - packages/charts/src/area/area-chart.ts
  modified:
    - packages/charts/src/index.ts

key-decisions:
  - "LuiAreaChart reuses registerLineModules() — ECharts has no separate AreaChart module; areaStyle is a line series property"
  - "stacked prop uses string 'total' internally (via buildLineOption) not boolean — ECharts stacking requires string group name"

patterns-established:
  - "area-chart.ts: minimal variant pattern — only adds stacked prop and mode:'area' vs LuiLineChart"
  - "index.ts: phase-annotated export grouping pattern for @lit-ui/charts public API"

requirements-completed: [AREA-01, AREA-02]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 89 Plan 02: Area Chart + API Exports Summary

**LuiAreaChart Lit element with smooth/stacked/zoom props and full @lit-ui/charts public API exporting LuiLineChart, LuiAreaChart, LineChartSeries, MarkLineSpec, LineOptionProps**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T20:43:27Z
- **Completed:** 2026-02-28T20:44:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `LuiAreaChart` — thin variant of `LuiLineChart` that passes `mode:'area'` to `buildLineOption()` for areaStyle injection and adds `stacked` prop
- Updated `packages/charts/src/index.ts` to export all Phase 89 components and types: `LuiLineChart`, `LuiAreaChart`, `LineChartSeries`, `MarkLineSpec`, `LineOptionProps`
- Full build (`pnpm build`) succeeds; `dist/index.d.ts` confirms all 5 new exports present

## Task Commits

Each task was committed atomically:

1. **Task 1: Create LuiAreaChart (area-chart.ts)** - `9f4959e` (feat)
2. **Task 2: Update index.ts exports and verify full build** - `4888699` (feat)

**Plan metadata:** (docs commit added after summary)

## Files Created/Modified
- `packages/charts/src/area/area-chart.ts` - LuiAreaChart class with smooth/stacked/zoom props, _streamingMode='appendData', lui-area-chart custom element
- `packages/charts/src/index.ts` - Phase 89 exports added: LuiLineChart, LuiAreaChart, LineChartSeries, MarkLineSpec, LineOptionProps

## Decisions Made
- `LuiAreaChart` reuses `registerLineModules()` directly — ECharts area charts are line charts with `areaStyle`; no separate module exists
- `stacked` prop is Boolean on the component but translates to string `'total'` in `buildLineOption()` — consistent with Plan 01 decision

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 89 complete: both LINE-01/02/03 (Plan 01) and AREA-01/02 (Plan 02) requirements satisfied
- All Phase 89 components are publicly exported from `@lit-ui/charts`
- Phase 90+ can follow the same per-chart registry + option-builder pattern established in Phases 89-01 and 89-02

---
*Phase: 89-line-chart-area-chart*
*Completed: 2026-02-28*

## Self-Check: PASSED

- FOUND: packages/charts/src/area/area-chart.ts
- FOUND: packages/charts/src/index.ts
- FOUND: .planning/phases/89-line-chart-area-chart/89-02-SUMMARY.md
- FOUND commit: 9f4959e (feat: LuiAreaChart area-chart.ts)
- FOUND commit: 4888699 (feat: index.ts Phase 89 exports)
