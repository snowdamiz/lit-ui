---
phase: 101-webgpu-two-layer-canvas-for-line-area
plan: 02
subsystem: ui
tags: [webgpu, chartgpu, line-chart, streaming, two-layer-canvas, echarts]

# Dependency graph
requires:
  - phase: 101-01
    provides: chartgpu@0.3.2 installed, webgpu-device.ts with refcounted lifecycle and getGpuAdapter() export
  - phase: 100-02
    provides: LuiLineChart streaming infrastructure (_lineBuffers, _flushLineUpdates, _triggerReset)
  - phase: 98-02
    provides: BaseChartElement._detectRenderer() and acquireGpuDevice() singleton
provides:
  - LuiLineChart with ChartGPU two-layer canvas when renderer === 'webgpu'
  - _gpuChart field (ChartGPU instance, null when WebGPU unavailable)
  - _initWebGpuLayer() — creates gpuHost div (z-index:0, pointer-events:none), ChartGPU.create() with shared device/adapter, wires dataZoom+rendered coordinate sync
  - _syncCoordinates() — ECharts DataZoom percent-space → ChartGPU.setZoomRange()
  - _flushLineUpdates() — incremental appendData(seriesIndex, pairs) to ChartGPU alongside ECharts setOption
  - disconnectedCallback() — full reverse-init cleanup: RAF cancel → gpuResizeObserver → gpuChart.dispose() → releaseGpuDevice() → super
affects: [101-03-area-chart, 102-docs, WEBGPU-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Local _GpuChartInstance interface mirrors real ChartGPU 0.3.2 API — avoids hard dependency at module scope (appendData takes seriesIndex as first arg)"
    - "ChartGPUCreateContext requires both adapter AND device — adapter-null edge case falls back to standalone ChartGPU.create()"
    - "Incremental ChartGPU push: _gpuFlushedLengths[] tracks last-flushed buffer index per series; each flush sends only new [index, value] pairs"
    - "Reverse-init teardown order: RAF cancel → gpuResizeObserver.disconnect → gpuChart.dispose → releaseGpuDevice() → super.disconnectedCallback()"
    - "Two-layer canvas: gpuHost div at z-index:0 with pointer-events:none; ECharts owns all mouse events"

key-files:
  created: []
  modified:
    - packages/charts/src/line/line-chart.ts

key-decisions:
  - "_GpuChartInstance local interface uses real ChartGPU 0.3.2 API signature: appendData(seriesIndex: number, newPoints) — plan spec had single-arg version that doesn't match library"
  - "ChartGPUCreateContext.adapter is required (not optional) per 0.3.2 types — added null guard with standalone fallback when adapter unavailable"
  - "as unknown as _GpuChartInstance double-cast for ChartGPU.create() result — avoids structural type mismatch with full ChartGPUInstance (which has many more methods)"
  - "Incremental appendData(seriesIndex, pairs) confirmed as the correct ChartGPU streaming API — accumulates internally, does not replace full dataset"

patterns-established:
  - "Dynamic import('chartgpu') inside _initWebGpuLayer() — never at module top level (SSR + tree-shaking safety)"
  - "_gpuFlushedLengths[] reset to [] in _triggerReset() to keep x-index alignment after dispose+reinit"

requirements-completed: [WEBGPU-02]

# Metrics
duration: 3min
completed: 2026-03-01
---

# Phase 101 Plan 02: ChartGPU Two-Layer Canvas for LuiLineChart Summary

**ChartGPU GPU data layer wired beneath ECharts on WebGPU-capable browsers — incremental appendData streaming with DataZoom percent-space coordinate sync and full reverse-init teardown**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T19:16:43Z
- **Completed:** 2026-03-01T19:19:49Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- `_initChart()` override layers ChartGPU beneath ECharts only when `this.renderer === 'webgpu'` — non-WebGPU path is entirely unchanged
- `_initWebGpuLayer()` creates a `gpuHost` div (`z-index:0`, `pointer-events:none`) and initializes ChartGPU with the shared `{ device, adapter }` singleton from `webgpu-device.ts`
- `_syncCoordinates()` reads ECharts DataZoom `start`/`end` percent-space values and calls `_gpuChart.setZoomRange()` — fires on every `dataZoom` and `rendered` event
- `_flushLineUpdates()` pushes incremental `[index, value]` pairs to `_gpuChart.appendData(seriesIndex, pairs)` after each ECharts `setOption`, tracked by `_gpuFlushedLengths[]` per series
- `disconnectedCallback()` follows reverse-init order: cancel RAF → disconnect `_gpuResizeObserver` → `_gpuChart.dispose()` → `void releaseGpuDevice()` if `_wasWebGpu` → `super.disconnectedCallback()`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ChartGPU fields, _initWebGpuLayer(), and _initChart() override** - `e137a30` (feat)
2. **Task 2: Patch _flushLineUpdates() and full disconnectedCallback cleanup** - `e939672` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `/Users/sn0w/Documents/dev/lit-components/packages/charts/src/line/line-chart.ts` — LuiLineChart with WebGPU two-layer canvas: _gpuChart, _gpuResizeObserver, _wasWebGpu, _gpuFlushedLengths fields; _initChart() override; _initWebGpuLayer(); _syncCoordinates(); patched _flushLineUpdates(); patched disconnectedCallback()

## Decisions Made

- **`_GpuChartInstance` interface uses real ChartGPU 0.3.2 API** — Plan spec had `appendData(points: [number, number][])` (single-arg). Actual API is `appendData(seriesIndex: number, newPoints: CartesianSeriesData | OHLCDataPoint[])`. Fixed the local interface to match, passing `seriesIndex` as first arg.
- **`ChartGPUCreateContext.adapter` is required** — Plan assumed `adapter` was optional in the context object. The 0.3.2 type `ChartGPUCreateContext` requires `adapter: GPUAdapter`. Added null guard: when `getGpuAdapter()` returns null (defensive edge case), falls back to standalone `ChartGPU.create()` without the shared context overload.
- **Double-cast `as unknown as _GpuChartInstance`** — `ChartGPU.create()` returns `Promise<ChartGPUInstance>` which has many more methods than our minimal local interface. Direct `as _GpuChartInstance` fails TypeScript overlap check. `as unknown as` correctly narrows without altering runtime type.
- **Incremental streaming confirmed** — `appendData(seriesIndex, pairs)` accumulates data internally in ChartGPU; each flush sends only new `[x, y]` pairs since the last flush. x-values are position indices computed from `lastFlushed + i`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `_GpuChartInstance.appendData` signature to match ChartGPU 0.3.2 real API**
- **Found during:** Task 1 (TypeScript compilation of _flushLineUpdates)
- **Issue:** Plan spec defined `appendData(points: [number, number][])` — single-argument. ChartGPU 0.3.2 actual API: `appendData(seriesIndex: number, newPoints: CartesianSeriesData | OHLCDataPoint[])`. TypeScript error TS2352 on cast.
- **Fix:** Updated local `_GpuChartInstance` interface to match real signature. Updated `_flushLineUpdates()` to call `appendData(idx, pairs)` with series index as first arg.
- **Files modified:** `packages/charts/src/line/line-chart.ts`
- **Verification:** `tsc --noEmit` exits 0
- **Committed in:** e939672 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed `ChartGPUCreateContext` to handle required `adapter` field**
- **Found during:** Task 1 (TypeScript compilation of _initWebGpuLayer)
- **Issue:** Plan used `context as { device: GPUDevice }` cast. `ChartGPUCreateContext` type in 0.3.2 requires both `device` AND `adapter` — adapter is not optional. TypeScript error TS2345.
- **Fix:** Pass `{ device, adapter }` directly to the shared-context overload. Added null guard: when `adapter` is null (defensive), use standalone `ChartGPU.create()` without context arg.
- **Files modified:** `packages/charts/src/line/line-chart.ts`
- **Verification:** `tsc --noEmit` exits 0
- **Committed in:** e137a30 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — real ChartGPU 0.3.2 API corrections)
**Impact on plan:** Both fixes required to satisfy the actual ChartGPU 0.3.2 type contracts. No scope creep — all changes are confined to the one file specified in the plan.

## Issues Encountered

TypeScript revealed two ChartGPU API mismatches between the plan's research docs and the actual 0.3.2 package types. Both were resolved inline without architectural changes.

## User Setup Required

None — no external service configuration required. WebGPU path is opt-in via `enable-webgpu` attribute, and gracefully falls back to ECharts-only rendering on non-WebGPU browsers.

## Next Phase Readiness

- Plan 02 complete: LuiLineChart has the full WEBGPU-02 two-layer canvas integration
- Plan 03 applies identical pattern to `LuiAreaChart` (`area-chart.ts`)
- Blocker from STATE.md: ChartGPU Shadow DOM compatibility not yet verified in production — visual verification is the Plan 03/02 checkpoint responsibility

---
*Phase: 101-webgpu-two-layer-canvas-for-line-area*
*Completed: 2026-03-01*
