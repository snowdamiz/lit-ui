---
phase: 101-webgpu-two-layer-canvas-for-line-area
plan: 03
subsystem: ui
tags: [webgpu, chartgpu, area-chart, streaming, two-layer-canvas, echarts]

# Dependency graph
requires:
  - phase: 101-01
    provides: chartgpu@0.3.2 installed, webgpu-device.ts with refcounted lifecycle and getGpuAdapter() export
  - phase: 101-02
    provides: LuiLineChart WebGPU two-layer canvas pattern (exact implementation to mirror)
  - phase: 100-03
    provides: LuiAreaChart streaming infrastructure (_lineBuffers, _flushLineUpdates, _triggerReset)
  - phase: 98-02
    provides: BaseChartElement._detectRenderer() and acquireGpuDevice() singleton
provides:
  - LuiAreaChart with ChartGPU two-layer canvas when renderer === 'webgpu'
  - _gpuChart field (ChartGPU instance, null when WebGPU unavailable)
  - _initWebGpuLayer() — creates gpuHost div (z-index:0, pointer-events:none), ChartGPU.create() with shared device/adapter, wires dataZoom+rendered coordinate sync
  - _syncCoordinates() — ECharts DataZoom percent-space to ChartGPU.setZoomRange()
  - _flushLineUpdates() — incremental appendData(seriesIndex, pairs) to ChartGPU alongside ECharts setOption
  - disconnectedCallback() — full reverse-init cleanup: RAF cancel → gpuResizeObserver → gpuChart.dispose() → releaseGpuDevice() → super
affects: [102-docs, WEBGPU-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Area chart WebGPU integration is point-for-point identical to line chart (same field names, same method signatures, same cleanup order)"
    - "Dynamic import('chartgpu') inside _initWebGpuLayer() — never at module top level (SSR + tree-shaking safety)"
    - "Incremental ChartGPU push: _gpuFlushedLengths[] tracks last-flushed buffer index per series; each flush sends only new [index, value] pairs"
    - "Reverse-init teardown order: RAF cancel → gpuResizeObserver.disconnect → gpuChart.dispose → releaseGpuDevice() → super.disconnectedCallback()"
    - "Two-layer canvas: gpuHost div at z-index:0 with pointer-events:none; ECharts owns all mouse events"

key-files:
  created: []
  modified:
    - packages/charts/src/area/area-chart.ts

key-decisions:
  - "No new decisions — all implementation patterns inherited from 101-02 (LuiLineChart). Identical _GpuChartInstance interface, identical appendData(seriesIndex, pairs) call, identical disconnectedCallback() reverse-init order."

patterns-established:
  - "Phase 100/101 duplication pattern confirmed: line chart integrated first, area chart mirrors identically in separate plan — ensures explicit per-chart commit traceability"

requirements-completed: [WEBGPU-02]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 101 Plan 03: ChartGPU Two-Layer Canvas for LuiAreaChart Summary

**LuiAreaChart WebGPU two-layer canvas integration mirroring LuiLineChart — ChartGPU beneath ECharts with incremental appendData streaming, DataZoom sync, and full reverse-init teardown**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T19:22:50Z
- **Completed:** 2026-03-01T19:24:47Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- `_initChart()` override layers ChartGPU beneath ECharts only when `this.renderer === 'webgpu'` — non-WebGPU path is entirely unchanged
- `_initWebGpuLayer()` creates a `gpuHost` div (`z-index:0`, `pointer-events:none`) and initializes ChartGPU with the shared `{ device, adapter }` singleton from `webgpu-device.ts`
- `_syncCoordinates()` reads ECharts DataZoom `start`/`end` percent-space values and calls `_gpuChart.setZoomRange()` — fires on every `dataZoom` and `rendered` event
- `_flushLineUpdates()` pushes incremental `[index, value]` pairs to `_gpuChart.appendData(seriesIndex, pairs)` after each ECharts `setOption`, tracked by `_gpuFlushedLengths[]` per series
- `disconnectedCallback()` follows reverse-init order: cancel RAF → disconnect `_gpuResizeObserver` → `_gpuChart.dispose()` → `void releaseGpuDevice()` if `_wasWebGpu` → `super.disconnectedCallback()`
- `area-chart.ts` is 346 lines (min_lines requirement: 220 satisfied)

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply identical ChartGPU two-layer canvas pattern to LuiAreaChart** - `ddbe48e` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `/Users/sn0w/Documents/dev/lit-components/packages/charts/src/area/area-chart.ts` — LuiAreaChart with WebGPU two-layer canvas: _gpuChart, _gpuResizeObserver, _wasWebGpu, _gpuFlushedLengths fields; _initChart() override; _initWebGpuLayer(); _syncCoordinates(); patched _flushLineUpdates(); patched _triggerReset(); patched disconnectedCallback()

## Decisions Made

None — all implementation patterns inherited from Plan 02 (LuiLineChart). The `_GpuChartInstance` local interface, the `appendData(seriesIndex, pairs)` signature, the adapter null guard with standalone fallback, the `as unknown as _GpuChartInstance` double-cast, and the reverse-init teardown order were all established in 101-02 and applied unchanged.

## Deviations from Plan

None — plan executed exactly as written. The implementation decisions discovered in Plan 02 (corrected `appendData` signature, required `adapter` field, double-cast) were already incorporated into the Plan 03 spec via the STATE.md key decisions, so no live corrections were needed during execution.

## Issues Encountered

None — `tsc --noEmit` exited 0 on first attempt. All API signatures were already correct based on Plan 02 learnings.

## User Setup Required

None — no external service configuration required. WebGPU path is opt-in via `enable-webgpu` attribute, and gracefully falls back to ECharts-only rendering on non-WebGPU browsers.

## Next Phase Readiness

- Both LuiLineChart and LuiAreaChart now have identical WebGPU two-layer canvas integration
- WEBGPU-02 requirements fully satisfied across both chart types
- Phase 101 implementation complete — Phase 102 (docs) can proceed
- Blocker from STATE.md still applies: ChartGPU Shadow DOM compatibility not verified in production — visual verification is Phase 102 responsibility

## Self-Check: PASSED

- area-chart.ts: FOUND
- 101-03-SUMMARY.md: FOUND
- Commit ddbe48e: FOUND

---
*Phase: 101-webgpu-two-layer-canvas-for-line-area*
*Completed: 2026-03-01*
