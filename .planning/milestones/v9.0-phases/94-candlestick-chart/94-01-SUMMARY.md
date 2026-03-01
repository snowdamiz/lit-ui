---
phase: 94-candlestick-chart
plan: 01
subsystem: ui
tags: [echarts, candlestick, charts, typescript, option-builder]

# Dependency graph
requires:
  - phase: 93-heatmap-chart
    provides: heatmap-option-builder.ts and heatmap-registry.ts patterns mirrored exactly
provides:
  - candlestick-option-builder.ts with OhlcBar, MAConfig, CandlestickBarPoint, CandlestickOptionProps types and buildCandlestickOption() pure function
  - _computeSMA() and _computeEMA() private MA helpers
  - candlestick-registry.ts with registerCandlestickModules() registering CandlestickChart + BarChart + LineChart
affects:
  - 94-02 (LuiCandlestickChart component depends on both files)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - candlestick-option-builder pure function pattern mirroring heatmap-option-builder
    - two-grid ECharts layout with synchronized DataZoom (xAxisIndex: [0, 1])
    - SMA/EMA computation with null warm-up period for MA overlays
    - registry guard pattern with _candlestickRegistered boolean

key-files:
  created:
    - packages/charts/src/shared/candlestick-option-builder.ts
    - packages/charts/src/candlestick/candlestick-registry.ts
  modified: []

key-decisions:
  - "OhlcBar order is [open, close, low, high] — NOT OHLC acronym order; JSDoc warning added"
  - "Bull/bear colors use ECharts-native itemStyle.color / itemStyle.color0 (NOT upColor/downColor)"
  - "DataZoom xAxisIndex: [0, 1] in showVolume=true path to synchronize both grids (Pitfall 3)"
  - "BarChart + LineChart registered alongside CandlestickChart — silent rendering failures without them (Pitfall 1)"
  - "EMA seeds from SMA of first period closes, then recursive k = 2/(period+1) formula"

patterns-established:
  - "Option builder returns Record<string, unknown> with conditional branching on showVolume flag"
  - "MA overlays always use xAxisIndex: 0, yAxisIndex: 0 to bind to the main price panel"
  - "Volume bar series always uses xAxisIndex: 1, yAxisIndex: 1 to bind to grid[1]"

requirements-completed: [CNDL-01, CNDL-02, CNDL-03]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 94 Plan 01: Candlestick Option Builder + Registry Summary

**buildCandlestickOption() pure function with single/dual-grid ECharts layouts, SMA/EMA MA overlays, and registerCandlestickModules() registering CandlestickChart + BarChart + LineChart**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T00:18:12Z
- **Completed:** 2026-03-01T00:19:36Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `candlestick-option-builder.ts` exporting all 4 types and `buildCandlestickOption()` with single-grid (showVolume=false) and two-grid (showVolume=true) layouts
- Implemented `_computeSMA()` and `_computeEMA()` private helpers with null warm-up period for MA overlay computation
- Created `candlestick-registry.ts` registering CandlestickChart + BarChart + LineChart — all three required for correct volume panel and MA rendering
- TypeScript: zero errors across both files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create candlestick-option-builder.ts** - `9beab66` (feat)
2. **Task 2: Create candlestick-registry.ts** - `07fd63f` (feat)

## Files Created/Modified
- `packages/charts/src/shared/candlestick-option-builder.ts` - OhlcBar, MAConfig, CandlestickBarPoint, CandlestickOptionProps types + buildCandlestickOption() pure function + _computeSMA() + _computeEMA()
- `packages/charts/src/candlestick/candlestick-registry.ts` - registerCandlestickModules() with guard, mirrors heatmap-registry.ts pattern

## Decisions Made
- OhlcBar order is `[open, close, low, high]` — NOT the OHLC acronym order `[open, high, low, close]`. Added JSDoc warning comment to prevent silent rendering errors.
- Bull/bear colors use ECharts-native `itemStyle.color` / `itemStyle.color0` (NOT `upColor`/`downColor` which do not exist in ECharts CandlestickItemStyleOption).
- DataZoom in showVolume=true branch uses `xAxisIndex: [0, 1]` to synchronize pan/zoom across both the candlestick and volume panels (Pitfall 3 from RESEARCH.md).
- Registered BarChart and LineChart alongside CandlestickChart — omitting either causes silent rendering failure (volume bars or MA lines simply don't appear, no error thrown).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both foundation files are complete; Plan 02 (LuiCandlestickChart component) can import from both
- `candlestick-option-builder.ts` exports all types and functions Plan 02 needs
- `candlestick-registry.ts` exports `registerCandlestickModules()` for component initialization

---
*Phase: 94-candlestick-chart*
*Completed: 2026-03-01*
