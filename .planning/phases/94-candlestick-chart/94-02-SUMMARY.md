---
phase: 94-candlestick-chart
plan: 02
subsystem: ui
tags: [lit, echarts, candlestick, charts, ohlc, streaming, moving-averages, volume]

# Dependency graph
requires:
  - phase: 94-01
    provides: candlestick-option-builder.ts (OhlcBar, MAConfig, CandlestickBarPoint, CandlestickOptionProps, buildCandlestickOption) + candlestick-registry.ts (registerCandlestickModules)
  - phase: 93-02
    provides: LuiHeatmapChart pattern for pushData override and RAF cancellation
provides:
  - LuiCandlestickChart (lui-candlestick-chart) Lit custom element
  - Phase 94 public API exports in @lit-ui/charts index.ts
affects: [95-radarchart, 96-treemapchart, future-chart-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - pushData() fully overrides base — NEVER calls super.pushData(); own RAF handle (_barRafId) for streaming coalescing
    - _applyData() syncs _ohlcBuffer from this.data, uses notMerge:false; _flushBarUpdates() uses lazyUpdate:true
    - disconnectedCallback() cancels own RAF before super.disconnectedCallback()
    - Module-level _parseMovingAverages() helper for JSON string attribute parsing (mirrors _parseColorRange pattern from Phase 93)

key-files:
  created:
    - packages/charts/src/candlestick/candlestick-chart.ts
  modified:
    - packages/charts/src/index.ts

key-decisions:
  - "pushData() never calls super.pushData() — base _circularBuffer path bypassed; _ohlcBuffer is sole authoritative bar store"
  - "_flushBarUpdates() uses lazyUpdate:true (not notMerge:false) — preserves DataZoom state while batching streaming updates"
  - "_applyData() uses notMerge:false — merges with option prop overrides from base class"
  - "bullColor/bearColor passed as undefined (not null) to buildCandlestickOption — null coalesced with ?? undefined"

patterns-established:
  - "Candlestick streaming: append to _ohlcBuffer, trim to maxPoints, schedule RAF via _barRafId guard"
  - "JSON attribute parsing: module-level helper returns [] on null/parse-error, never throws"

requirements-completed: [CNDL-01, CNDL-02, CNDL-03, CNDL-04]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 94 Plan 02: Candlestick Chart Summary

**LuiCandlestickChart (lui-candlestick-chart) Lit element with OHLC rendering, volume panel, MA overlays, and real-time bar streaming via pushData()**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T00:21:50Z
- **Completed:** 2026-03-01T00:23:29Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- LuiCandlestickChart extends BaseChartElement with lui-candlestick-chart custom element
- All four CNDL properties declared: bull-color, bear-color, show-volume, moving-averages
- pushData() override: appends to _ohlcBuffer, trims to maxPoints, never calls super.pushData()
- Phase 94 public API added to index.ts: LuiCandlestickChart + OhlcBar + MAConfig + CandlestickBarPoint + CandlestickOptionProps
- Full build passes with zero errors; all five Phase 94 declarations confirmed in dist/index.d.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create candlestick-chart.ts** - `56ae076` (feat)
2. **Task 2: Add Phase 94 exports to index.ts** - `b8e8def` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `packages/charts/src/candlestick/candlestick-chart.ts` - LuiCandlestickChart Lit element with all CNDL requirements
- `packages/charts/src/index.ts` - Phase 94 public API exports appended

## Decisions Made
- `pushData()` never calls `super.pushData()` — base `_circularBuffer` path bypassed entirely; `_ohlcBuffer` is sole authoritative bar store
- `_flushBarUpdates()` uses `lazyUpdate: true` (not `notMerge: false`) to preserve DataZoom state during streaming
- `_applyData()` uses `notMerge: false` to merge with option prop overrides from base class
- `bullColor`/`bearColor` coerced from `string | null` to `string | undefined` via `?? undefined` before passing to `buildCandlestickOption`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 94 complete: LuiCandlestickChart (lui-candlestick-chart) exported from @lit-ui/charts public API
- All CNDL-01/CNDL-02/CNDL-03/CNDL-04 requirements delivered
- Ready for Phase 95 (Radar Chart) or Phase 96 (Treemap Chart)

## Self-Check: PASSED

- FOUND: packages/charts/src/candlestick/candlestick-chart.ts
- FOUND: packages/charts/src/index.ts
- FOUND: .planning/phases/94-candlestick-chart/94-02-SUMMARY.md
- FOUND commit: 56ae076 (Task 1)
- FOUND commit: b8e8def (Task 2)

---
*Phase: 94-candlestick-chart*
*Completed: 2026-03-01*
