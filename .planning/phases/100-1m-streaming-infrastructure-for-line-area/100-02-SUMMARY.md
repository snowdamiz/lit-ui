---
phase: 100-1m-streaming-infrastructure-for-line-area
plan: 02
subsystem: ui
tags: [echarts, streaming, typescript, web-components, lit, float32array, requestAnimationFrame]

# Dependency graph
requires:
  - phase: 100-01
    provides: _initChart() made protected, buildLineOption() LTTB+large flags

provides:
  - LuiLineChart.pushData(point, seriesIndex=0) with per-series ring buffer and RAF coalescing
  - LuiAreaChart.pushData(point, seriesIndex=0) with identical streaming pattern
  - Float32Array conversion at flush time satisfying STRM-01 TypedArray requirement
  - maxPoints-triggered dispose+reinit truncation path via _triggerReset() (STRM-02)
  - seriesIndex routing for multi-series streaming (STRM-03)
  - disconnectedCallback() RAF cancel guard on both components

affects:
  - phase 101 (WebGPU canvas layer — line/area streaming is now RAF-coalesced, WebGPU layer can sync on same RAF cycle)
  - phase 102 (docs — pushData(point, seriesIndex?) API is now public surface)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Per-series ring buffer streaming with RAF coalescing (identical to LuiCandlestickChart proven pattern)
    - Float32Array conversion at setOption flush time for STRM-01 TypedArray compliance
    - dispose+reinit (not chart.clear()) for full reset — avoids ECharts 5.6 clear() residue
    - seriesIndex growth-on-demand: _lineBuffers grows via while(length <= seriesIndex) push([])

key-files:
  created: []
  modified:
    - packages/charts/src/line/line-chart.ts
    - packages/charts/src/area/area-chart.ts

key-decisions:
  - "maxPoints = 500_000 override on both LuiLineChart and LuiAreaChart — base default of 1000 is for circular-buffer charts; 500k allows ~8 min at 1000 pts/sec before reset"
  - "new Float32Array(buf as number[]) for scalar numeric points — line/area xAxis is category (position-indexed), so pushData receives numeric y-values only, not [x,y] tuples"
  - "slice(0, seriesCount) guard in _flushLineUpdates() prevents setOption errors when pushData(point, 1) arrives before _applyData() registers a second ECharts series"
  - "Area chart uses same _lineBuffers/_lineRafId field names as line chart — same pattern, different component, no shared base class needed"

patterns-established:
  - "Line/Area RAF streaming pattern: pushData() -> _lineBuffers[seriesIndex].push() -> _lineRafId RAF -> _flushLineUpdates() -> setOption(lazyUpdate:true)"
  - "Float32Array wrap at flush boundary: each buffer converted via new Float32Array(buf as number[]) immediately before setOption"
  - "_triggerReset() sequence: cancelAnimationFrame(_lineRafId) -> clear buffers -> _chart.dispose() -> _chart = null -> RAF(() => _initChart())"

requirements-completed: [STRM-01, STRM-02, STRM-03]

# Metrics
duration: 8min
completed: 2026-03-01
---

# Phase 100 Plan 02: LuiLineChart and LuiAreaChart Streaming Override Summary

**Per-series ring buffer streaming with RAF coalescing and Float32Array flush for LuiLineChart and LuiAreaChart, replacing the appendData path to prevent tab crashes on 1M+ point sessions**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-01T17:55:00Z
- **Completed:** 2026-03-01T18:03:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Removed `this._streamingMode = 'appendData'` constructor from LuiLineChart — appendData path fully bypassed
- Added `pushData(point, seriesIndex=0)` override on both LuiLineChart and LuiAreaChart with per-series buffer routing
- `_flushLineUpdates()` converts each buffer to `Float32Array` via `setOption({ series }, { lazyUpdate: true })` once per RAF frame
- `_triggerReset()` dispose+reinit path fires when `_totalPoints >= maxPoints` (500,000), preventing tab OOM
- `disconnectedCallback()` cancels `_lineRafId` before `super.disconnectedCallback()` to prevent post-disposal setOption errors
- TypeScript compilation exits 0 with no errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add streaming fields and override pushData() with seriesIndex routing** - `3357c97` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `packages/charts/src/line/line-chart.ts` - Full streaming override: _lineBuffers, _lineRafId, _totalPoints, pushData override, _flushLineUpdates with Float32Array, _triggerReset, disconnectedCallback; constructor with appendData mode removed
- `packages/charts/src/area/area-chart.ts` - Identical streaming pattern applied to LuiAreaChart (was already implemented alongside line chart)

## Decisions Made
- `maxPoints = 500_000` on both line and area charts — base class default of 1000 is for circular-buffer charts; line/area need much higher limit before dispose+reinit
- `new Float32Array(buf as number[])` used for scalar numeric points — line/area xAxis is category (position-indexed), so `pushData()` receives numeric y-values only (not [x,y] tuples); no `.flat()` needed
- `slice(0, seriesCount)` guard in `_flushLineUpdates()` ensures only registered series indices receive updates; prevents ECharts errors when multi-series pushData arrives before `_applyData()` registers series
- Area chart received the same streaming override pattern — it shares the same appendData limitation and is addressed in the same plan

## Deviations from Plan

None - plan executed exactly as written. The area-chart.ts streaming implementation was included in the same task commit since both components share the identical streaming pattern and the area-chart was modified in the same session context.

## Issues Encountered
None - TypeScript compilation passed cleanly on first attempt.

## Next Phase Readiness
- STRM-01, STRM-02, STRM-03 requirements fully satisfied for both LuiLineChart and LuiAreaChart
- Phase 100 is now complete — line and area streaming infrastructure is in place
- Phase 101 (WebGPU canvas layer) can proceed — the streaming RAF loop is a natural sync point for WebGPU data layer integration

---
*Phase: 100-1m-streaming-infrastructure-for-line-area*
*Completed: 2026-03-01*
