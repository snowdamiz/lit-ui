---
phase: 100-1m-streaming-infrastructure-for-line-area
plan: 01
subsystem: charts
tags: [echarts, lttb, sampling, line-chart, area-chart, streaming, webgpu]

# Dependency graph
requires:
  - phase: 98-webgpu-detector-renderer-infrastructure
    provides: BaseChartElement with protected _detectRenderer() pattern
  - phase: 99-incremental-moving-average-state-machine
    provides: MAStateMachine O(1) streaming infrastructure
provides:
  - protected _initChart() in BaseChartElement — subclasses can call this._initChart() for dispose+reinit
  - LTTB decimation on all line/area series — sampling:'lttb', large:true, largeThreshold:2000 in buildLineOption()
affects:
  - 100-02 (LuiLineChart _triggerReset): depends on protected _initChart() access
  - 100-03 (LuiAreaChart _triggerReset): depends on protected _initChart() access
  - line-option-builder consumers: LuiLineChart, LuiAreaChart — now get LTTB and large flags automatically

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ECharts LTTB sampling: 'lttb' as const required for type safety — string widening breaks ECharts series type"
    - "large:true + largeThreshold:2000 pair — no overhead below threshold, WebGL-accelerated pixel painting above"
    - "protected _initChart() pattern — parallel to _detectRenderer() for subclass reinit path"

key-files:
  created: []
  modified:
    - packages/charts/src/base/base-chart-element.ts
    - packages/charts/src/shared/line-option-builder.ts

key-decisions:
  - "v10.0 (100-01): _initChart() made protected (not private) — consistent with _detectRenderer() pattern; enables _triggerReset() in Plans 02/03"
  - "v10.0 (100-01): sampling:'lttb' as const required — ECharts type demands literal, TypeScript would widen to string without as const"
  - "v10.0 (100-01): largeThreshold:2000 — below 2000 points large mode is skipped; zero overhead on small datasets"

patterns-established:
  - "LTTB pattern: all line/area series unconditionally get sampling/large/largeThreshold — no conditional branching needed"

requirements-completed: [STRM-04]

# Metrics
duration: 1min
completed: 2026-03-01
---

# Phase 100 Plan 01: Streaming Infrastructure Foundations Summary

**Protected _initChart() in BaseChartElement and ECharts LTTB decimation + large dataset flags on all line/area series via buildLineOption()**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-01T18:31:46Z
- **Completed:** 2026-03-01T18:32:29Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Changed `_initChart()` from `private` to `protected` — unblocks `_triggerReset()` calls in LuiLineChart (Plan 02) and LuiAreaChart (Plan 03) without a TypeScript compile error
- Added `sampling: 'lttb' as const` to every series in `buildLineOption()` — activates native ECharts LTTB decimation for smooth 1M+ point zoom-out rendering (STRM-04)
- Added `large: true` and `largeThreshold: 2000` — activates ECharts internal large-series rendering path above 2000 points, zero overhead below threshold

## Task Commits

Each task was committed atomically:

1. **Task 1: Make _initChart() protected in BaseChartElement** - `7bb23f6` (feat)
2. **Task 2: Add LTTB sampling and large dataset flags to buildLineOption()** - `92c6d12` (feat)

## Files Created/Modified
- `packages/charts/src/base/base-chart-element.ts` - Changed `private async _initChart()` to `protected async _initChart()`
- `packages/charts/src/shared/line-option-builder.ts` - Added `sampling: 'lttb' as const`, `large: true`, `largeThreshold: 2000` to series map

## Decisions Made
- `_initChart()` promoted to `protected` (not `public`) — consistent with `_detectRenderer()` pattern; subclasses need access, external consumers do not
- `sampling: 'lttb' as const` — `as const` required because ECharts line series type demands a literal `'lttb'` not `string`; TypeScript would widen without it
- `largeThreshold: 2000` — keeps small dataset rendering unchanged; large mode only activates above 2000 points where the optimization is worth the overhead

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — both TypeScript changes compiled cleanly without errors on first attempt.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 02 (LuiLineChart streaming reset): `_initChart()` is now accessible via `this._initChart()` in subclass
- Plan 03 (LuiAreaChart streaming reset): same access unblocked
- All line/area charts now automatically use LTTB decimation and large dataset optimization — no further option-builder work needed

---
*Phase: 100-1m-streaming-infrastructure-for-line-area*
*Completed: 2026-03-01*
