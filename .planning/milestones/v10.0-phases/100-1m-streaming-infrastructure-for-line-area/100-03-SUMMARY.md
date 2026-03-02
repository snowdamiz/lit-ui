---
phase: 100-1m-streaming-infrastructure-for-line-area
plan: 03
subsystem: ui
tags: [echarts, streaming, ring-buffer, float32array, raf, area-chart, typescript]

# Dependency graph
requires:
  - phase: 100-01
    provides: _initChart() made protected, enabling _triggerReset() to call this._initChart()
provides:
  - LuiAreaChart streaming override with per-series buffers, RAF coalescing, Float32Array flush, and maxPoints-triggered dispose+reinit
affects: [phase-101-webgpu-canvas-layer, phase-102-streaming-docs]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Area chart streaming uses identical _lineBuffers/_lineRafId/_totalPoints pattern as LuiLineChart"
    - "Float32Array conversion at flush time (not accumulation time) minimizes memory pressure"
    - "seriesIndex=0 default in pushData() allows single-series callers to omit the argument"

key-files:
  created: []
  modified:
    - packages/charts/src/area/area-chart.ts

key-decisions:
  - "Area chart streaming is identical to line chart — same field names, method names, override signatures; only file differs"
  - "maxPoints=500_000 override on LuiAreaChart — allows ~8 minutes of streaming at 1000 pts/sec before transparent reset"
  - "constructor with _streamingMode='appendData' removed — pushData() override fully replaces the appendData path"

patterns-established:
  - "RAF coalesce pattern: _lineRafId guards a single pending requestAnimationFrame; multiple pushData() calls in one frame produce one setOption() call"
  - "_triggerReset() dispose+RAF+_initChart() pattern: chart cleared and reinitialized in next frame; buffers and counter zeroed before dispose"
  - "disconnectedCallback() always cancels own RAF before super.disconnectedCallback() — prevents setOption on disposed chart"

requirements-completed: [STRM-01, STRM-02, STRM-03]

# Metrics
duration: 5min
completed: 2026-03-01
---

# Phase 100 Plan 03: LuiAreaChart 1M+ Streaming Infrastructure Summary

**LuiAreaChart pushData() override with per-series Float32Array ring buffers, RAF coalescing, and maxPoints-triggered dispose+reinit for 1M+ streaming support**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-01T18:34:38Z
- **Completed:** 2026-03-01T18:39:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Removed appendData constructor from LuiAreaChart (_streamingMode = 'appendData' gone)
- Added _lineBuffers, _totalPoints, _lineRafId streaming fields with override maxPoints = 500_000
- Override pushData(point, seriesIndex=0) routes to per-series buffer, grows buffers on demand (STRM-03)
- _flushLineUpdates() converts each buffer to Float32Array before setOption(lazyUpdate:true) — STRM-01 TypedArray requirement satisfied
- _triggerReset() calls dispose() + requestAnimationFrame(_initChart) at maxPoints for transparent reset (STRM-02)
- disconnectedCallback() cancels _lineRafId before super — prevents setOption on disposed chart instance

## Task Commits

Each task was committed atomically:

1. **Task 1: Add streaming fields and override pushData() in LuiAreaChart** - `3357c97` (feat — committed together with 100-02 line-chart implementation)

## Files Created/Modified

- `packages/charts/src/area/area-chart.ts` - Full streaming override: per-series buffers, RAF flush with Float32Array conversion, maxPoints-triggered dispose+reinit, disconnectedCallback RAF cancel

## Decisions Made

- The Plan 02 and Plan 03 implementations were committed together in `3357c97` — both line-chart.ts and area-chart.ts received the identical streaming pattern atomically
- `_streamingMode = 'appendData'` constructor removed — pushData() override completely replaces the appendData path; the field is unused in LuiAreaChart
- `new Float32Array(buf as number[])` used (not `Float32Array.from(...flat())`) — area chart series data is numeric scalars, not [x,y] tuples per buildLineOption() inspection

## Deviations from Plan

None - plan executed exactly as written. The streaming override applied to area-chart.ts matches the plan specification exactly, including all field names, method signatures, Float32Array conversion, and disconnectedCallback ordering.

## Issues Encountered

None — TypeScript compilation passes with zero errors. All verification grep checks confirm:
- _lineBuffers, _lineRafId, _totalPoints, _flushLineUpdates, _triggerReset, Float32Array, seriesIndex all present
- _streamingMode absent (constructor removed)
- maxPoints = 500_000 override in place

## Next Phase Readiness

- LuiAreaChart and LuiLineChart both have 1M+ streaming infrastructure (STRM-01/02/03 satisfied for both)
- Phase 101 (WebGPU canvas layer) can proceed — streaming infrastructure provides the data path that WebGPU will accelerate
- No blockers

---
*Phase: 100-1m-streaming-infrastructure-for-line-area*
*Completed: 2026-03-01*
