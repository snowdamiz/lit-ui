---
phase: 99-incremental-moving-average-state-machine
plan: 03
subsystem: ui
tags: [echarts, candlestick, moving-average, state-machine, typescript, webcomponents]

# Dependency graph
requires:
  - phase: 99-01
    provides: MAStateMachine class with O(1) push(), O(n) reset(), and SMA/EMA state
  - phase: 99-02
    provides: MAConfig.color optional, maValueArrays/resolvedMAColors in CandlestickOptionProps, readChartToken() accessor

provides:
  - LuiCandlestickChart._maStateMachines[] field — one MAStateMachine per MAConfig entry
  - LuiCandlestickChart._resolveMAColors() — CSS token default color assignment (MA-02)
  - LuiCandlestickChart._applyData() using sm.reset(closes) for O(n) full replay
  - LuiCandlestickChart._flushBarUpdates() using sm.push(lastClose) for O(1) streaming
  - MAStateMachine.trim(maxLen) method — aligns _values with trimmed _ohlcBuffer
  - All four MA requirements (MA-01..MA-04) now observable end-to-end

affects:
  - phase 100 (streaming infra)
  - phase 101 (WebGPU canvas layer)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual-path MA computation: O(n) reset() in _applyData(), O(1) push() in _flushBarUpdates()"
    - "Atomic _maStateMachines rebuild in _applyData() prevents MA count drift on config changes"
    - "Parallel trim() on state machines mirrors _ohlcBuffer slice to keep indices aligned"
    - "CSS token cycling via readChartToken() for default MA colors (color-2 through color-5)"

key-files:
  created: []
  modified:
    - packages/charts/src/candlestick/candlestick-chart.ts
    - packages/charts/src/shared/ma-state-machine.ts

key-decisions:
  - "trim() added to MAStateMachine (Rule 2 auto-fix) — missing from plan 01 but required by plan 03 contract"
  - "Default color tokens start at color-2 (not color-1) — color-1 is reserved for ECharts primary theme data"
  - "_maStateMachines always fully rebuilt in _applyData() — handles dynamic MA config count changes atomically"

patterns-established:
  - "Rule: sm.push() ONLY in _flushBarUpdates(), sm.reset() ONLY in _applyData() — mixing makes streaming O(n)"
  - "Rule: trim state machines immediately after _ohlcBuffer slice — before RAF flush — to maintain index alignment"

requirements-completed: [MA-01, MA-02, MA-03, MA-04]

# Metrics
duration: 6min
completed: 2026-03-01
---

# Phase 99 Plan 03: MAStateMachine Integration Summary

**O(1) incremental MA streaming wired into LuiCandlestickChart with CSS token default colors, parallel trim(), and dual-path reset/push separation**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-01T17:47:21Z
- **Completed:** 2026-03-01T17:53:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- LuiCandlestickChart now maintains `_maStateMachines: MAStateMachine[]` — one state machine per MAConfig entry — rebuilt atomically on every `_applyData()` call
- `_flushBarUpdates()` calls `sm.push(lastClose)` O(1) per machine per bar instead of rebuilding MA arrays from the full close history on every RAF tick
- `_resolveMAColors()` reads CSS token sequence (`--ui-chart-color-2` through `--ui-chart-color-5`) via `readChartToken()` for MAs without explicit colors — MA-02 complete
- `pushData()` calls `sm.trim(maxPoints)` in parallel with `_ohlcBuffer.slice(-maxPoints)` to keep MA value array indices aligned with the OHLC buffer
- All four MA requirements (MA-01 through MA-04) are now observable end-to-end

## Task Commits

Each task was committed atomically:

1. **Task 1: Add _maStateMachines field and _resolveMAColors()** - `bbeccc5` (feat)
2. **Task 2: Wire incremental MA state machines into _applyData(), _flushBarUpdates(), pushData()** - `98c1b4e` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `packages/charts/src/candlestick/candlestick-chart.ts` - Added MAStateMachine import, _maStateMachines field, _MA_DEFAULT_COLOR_TOKENS static array, _resolveMAColors() method; rewired _applyData() to use sm.reset(), _flushBarUpdates() to use sm.push(), pushData() to call sm.trim()
- `packages/charts/src/shared/ma-state-machine.ts` - Added trim(maxLen) method (was missing from plan 01 implementation)

## Decisions Made

- Default MA color tokens start at `--ui-chart-color-2` (not color-1) because `--ui-chart-color-1` (`#3b82f6`) is reserved for the ECharts primary theme data series
- `_maStateMachines` is always fully rebuilt in `_applyData()` (not diffed) — this atomically handles changes in MA config count without state drift
- `trim()` was added to `MAStateMachine` as a Rule 2 auto-fix (missing critical functionality required by the plan 03 contract)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added trim() method to MAStateMachine**
- **Found during:** Task 2 (wire state machines into pushData())
- **Issue:** The plan 03 task specification required `sm.trim(maxLen)` call in `pushData()`, but `MAStateMachine` in `ma-state-machine.ts` had no `trim()` method (plan 01 did not implement it)
- **Fix:** Added `trim(maxLen: number): void` to `MAStateMachine` class — slices `_values` to `-maxLen` if oversized
- **Files modified:** `packages/charts/src/shared/ma-state-machine.ts`
- **Verification:** Build passes, method is invoked by `pushData()` via `this._maStateMachines.forEach((sm) => sm.trim(this.maxPoints))`
- **Committed in:** `98c1b4e` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical functionality)
**Impact on plan:** Auto-fix required for index alignment between `_ohlcBuffer` and MA value arrays during long streaming sessions. No scope creep.

## Issues Encountered

None — plan executed cleanly. The missing `trim()` method was anticipated by the plan itself ("NOTE: If MAStateMachine does not have a trim() method from plan 01, add it") and handled per deviation Rule 2.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All four MA requirements (MA-01..MA-04) are now addressable in the candlestick chart
- Phase 100 (streaming infra) can build on the O(1) incremental flush pattern established here
- Phase 101 (WebGPU canvas layer) can access MA value arrays via `_maStateMachines[i].values` for GPU-side rendering if needed
- No blockers — build exits 0 with zero TypeScript errors

## Self-Check: PASSED

---
*Phase: 99-incremental-moving-average-state-machine*
*Completed: 2026-03-01*
