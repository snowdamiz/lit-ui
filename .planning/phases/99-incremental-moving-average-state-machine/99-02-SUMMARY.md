---
phase: 99-incremental-moving-average-state-machine
plan: 02
subsystem: ui
tags: [echarts, candlestick, moving-average, typescript, webgpu, css-tokens]

# Dependency graph
requires:
  - phase: 99-incremental-moving-average-state-machine
    provides: "99-01 TDD tests for MAStateMachine (RED phase complete)"
  - phase: 98-webgpu-detector-renderer-infrastructure
    provides: "BaseChartElement with ThemeBridge and _themeBridge private field"
provides:
  - "MAConfig.color is optional — no compile error when color is omitted"
  - "MAConfig.showType boolean — controls '(EMA)'/'(SMA)' legend suffix"
  - "CandlestickOptionProps.maValueArrays — pre-computed arrays skip O(n) SMA/EMA"
  - "CandlestickOptionProps.resolvedMAColors — pre-resolved token colors bypass builder token logic"
  - "_maLegendName() private function — consistent series/legend naming with showType support"
  - "BaseChartElement.readChartToken() protected method — delegates to _themeBridge.readToken()"
affects:
  - "99-03 (MAStateMachine implementation)"
  - "candlestick-chart.ts (LuiCandlestickChart uses readChartToken + new prop types)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Protected accessor pattern: keep private fields private, expose only narrowly-scoped accessors to subclasses"
    - "Pre-computed array passing: consumers can skip O(n) computation by supplying already-computed values"
    - "Fallback chain: resolvedMAColors[i] ?? ma.color ?? '#888888' for graceful color degradation"

key-files:
  created: []
  modified:
    - packages/charts/src/shared/candlestick-option-builder.ts
    - packages/charts/src/base/base-chart-element.ts

key-decisions:
  - "v10.0 (99-02): MAConfig.color made optional — component assigns CSS token defaults in Plan 03 candlestick chart update"
  - "v10.0 (99-02): readChartToken() uses Option B (protected accessor) — ThemeBridge stays private, only read access exposed to subclasses"
  - "v10.0 (99-02): maValueArrays/resolvedMAColors added to CandlestickOptionProps — streaming state machine passes pre-computed values, skipping O(n) rebuilds on each tick"
  - "v10.0 (99-02): _maLegendName() is module-level private function — keeps legend name logic testable and co-located with builder"

patterns-established:
  - "Protected accessor over protected field: ThemeBridge.readToken() exposed via readChartToken() without exposing the ThemeBridge instance"
  - "Pre-computed passthrough: option builder accepts pre-computed arrays to avoid redundant O(n) work in streaming contexts"

requirements-completed: [MA-02, MA-04]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 99 Plan 02: Update MAConfig, CandlestickOptionProps, and BaseChartElement for Streaming MA Support Summary

**Optional MAConfig.color, pre-computed maValueArrays/resolvedMAColors in CandlestickOptionProps, showType legend labels, and protected readChartToken() accessor on BaseChartElement**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T17:41:50Z
- **Completed:** 2026-03-01T17:43:46Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- MAConfig type updated: `color` is now optional, `showType` boolean added for "(EMA)"/"(SMA)" legend suffix
- CandlestickOptionProps expanded: `maValueArrays` and `resolvedMAColors` allow streaming state machine to pass pre-computed values without triggering O(n) SMA/EMA recomputation
- `_maLegendName()` private function added for consistent series/legend naming with showType support
- `maSeries` block updated to use pre-computed arrays and resolved colors when provided, with fallback chain to `ma.color` then `'#888888'`
- `BaseChartElement.readChartToken(name)` protected method added — delegates to private `_themeBridge.readToken()` without exposing the ThemeBridge instance

## Task Commits

Each task was committed atomically:

1. **Task 1: Update MAConfig type and option builder for optional color, showType, and pre-computed arrays** - `eb9346c` (feat)
2. **Task 2: Add protected readChartToken() to BaseChartElement** - `e250639` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `packages/charts/src/shared/candlestick-option-builder.ts` - MAConfig optional color + showType, CandlestickOptionProps maValueArrays + resolvedMAColors, _maLegendName() function, updated maSeries and legendData
- `packages/charts/src/base/base-chart-element.ts` - protected readChartToken() method delegates to _themeBridge.readToken()

## Decisions Made
- Protected accessor (Option B) over making `_themeBridge` protected — ThemeBridge instance stays private, only token read access is exposed to subclasses
- `#888888` as the ultimate fallback color when neither `resolvedMAColors[i]` nor `ma.color` is provided — visible grey is better than a transparent or errored series
- `_maLegendName()` as a module-level private function rather than inline lambda — keeps the logic unit-testable and avoids repetition between maSeries and legendData

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript error `TS2307: Cannot find module './ma-state-machine.js'` in `ma-state-machine.test.ts` — this is the intentional RED TDD state from Plan 01. The implementation file will be created in Plan 03. Vite build succeeds because test files are not referenced by entry points. Logged as out-of-scope.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Plan 03 (MAStateMachine GREEN implementation) can now import `MAConfig` without needing a `color` field
- `LuiCandlestickChart` can call `this.readChartToken('--ui-chart-color-2')` to resolve default MA colors
- `buildCandlestickOption` is ready to accept pre-computed `maValueArrays` and `resolvedMAColors` from the streaming state machine

---
*Phase: 99-incremental-moving-average-state-machine*
*Completed: 2026-03-01*
