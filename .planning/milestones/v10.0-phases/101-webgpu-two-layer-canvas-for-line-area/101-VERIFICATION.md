---
phase: 101-webgpu-two-layer-canvas-for-line-area
verified: 2026-03-01T20:00:00Z
status: human_needed
score: 13/13 must-haves verified
re_verification: false
human_verification:
  - test: "Open a WebGPU-capable browser, render LuiLineChart with 500K+ streamed points and a DataZoom slider, then drag the slider to pan/zoom. Visually confirm ChartGPU data pixels track the ECharts axes without offset."
    expected: "ChartGPU GPU canvas and ECharts axes canvas stay in pixel-perfect alignment across the full zoom range. No visible shift between data points and axis ticks."
    why_human: "Coordinate sync uses percent-space getOption().dataZoom[0].start/end passed to setZoomRange(). REQUIREMENTS.md mentions convertToPixel() but the actual implementation uses percent-space. Cannot confirm pixel alignment is maintained programmatically — requires visual inspection."
  - test: "Render LuiAreaChart on a WebGPU browser with streaming data and DataZoom active. Confirm ChartGPU canvas stays beneath the ECharts axes canvas (not on top)."
    expected: "Axes, tooltip, and legend are always on top; ChartGPU fills data pixels beneath them. Mouse interaction (hover tooltip, DataZoom drag) is fully functional."
    why_human: "z-index:0 positioning and pointer-events:none correctness requires visual and interaction verification — not testable via grep."
  - test: "Render LuiLineChart (or LuiAreaChart) on a non-WebGPU browser (e.g. Firefox without WebGPU flag). Confirm no JavaScript errors appear and the chart renders normally using ECharts only."
    expected: "No errors in console; chart displays data identically to Phase 100 behavior. No ChartGPU import attempted."
    why_human: "Non-WebGPU fallback path depends on this.renderer !== 'webgpu' gating — cannot simulate a real non-WebGPU environment without a browser."
  - test: "Create and destroy LuiLineChart 10 times on a WebGPU browser. After each destroy, confirm GPUDevice is released when it was the last instance (refcount hits zero)."
    expected: "No GPU memory leak; DevTools GPU memory stays stable across 10 create/destroy cycles."
    why_human: "releaseGpuDevice() refcount teardown path is structurally correct but only a real WebGPU session can confirm device.destroy() actually frees GPU memory."
---

# Phase 101: WebGPU Two-Layer Canvas for Line/Area Verification Report

**Phase Goal:** Line and Area charts on WebGPU-capable browsers render their data series via a ChartGPU 0.3.2 canvas layer beneath the ECharts axes canvas, with coordinate systems kept in sync across DataZoom interactions
**Verified:** 2026-03-01T20:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

All truths from the three plan must_haves sections were verified against the actual codebase.

#### Plan 01 Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1 | `chartgpu@0.3.2` is a runtime dependency in `packages/charts/package.json` | VERIFIED | `packages/charts/package.json` line 58: `"chartgpu": "0.3.2"` under `"dependencies"` (not devDependencies) |
| 2 | `releaseGpuDevice()` decrements a refcount and only calls `device.destroy()` when count reaches zero | VERIFIED | `webgpu-device.ts` lines 101-110: `_refCount--; if (_refCount === 0 && _devicePromise !== null) { device.destroy(); ... }` |
| 3 | `acquireGpuDevice()` increments the refcount on every call (not just first) | VERIFIED | `webgpu-device.ts` lines 54-66: first-call sets `_refCount = 1`; subsequent calls `_refCount++` |
| 4 | `getGpuAdapter()` returns the stored GPUAdapter so `ChartGPU.create()` can receive `{ adapter, device }` | VERIFIED | `webgpu-device.ts` lines 83-85: `export function getGpuAdapter(): GPUAdapter \| null { return _adapter; }` |

#### Plan 02 Truths (LuiLineChart)

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 5 | `LuiLineChart` initializes a ChartGPU canvas layer beneath ECharts when `this.renderer === 'webgpu'` | VERIFIED | `line-chart.ts` lines 86-94: `_initChart()` override calls `super._initChart()` then conditionally `await this._initWebGpuLayer()` if `this.renderer === 'webgpu'` |
| 6 | ChartGPU canvas is positioned absolutely with `z-index:0` and `pointer-events:none` so ECharts receives all mouse events | VERIFIED | `line-chart.ts` line 122: `gpuHost.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;'` |
| 7 | DataZoom interactions sync the ChartGPU zoom range via `setZoomRange(start, end)` | VERIFIED | `line-chart.ts` lines 153-154 wire `dataZoom` and `rendered` events to `_syncCoordinates()`; lines 164-178 read `dataZoom[0].start/end` and call `this._gpuChart.setZoomRange(start, end)` |
| 8 | Streamed data is pushed to ChartGPU in `_flushLineUpdates()` alongside the ECharts `setOption` call | VERIFIED | `line-chart.ts` lines 241-255: `if (this._gpuChart)` block calls `this._gpuChart!.appendData(idx, pairs)` with incremental `[x, y]` pairs per series |
| 9 | `disconnectedCallback()` disposes ChartGPU, disconnects its ResizeObserver, and calls `releaseGpuDevice()` before `super.disconnectedCallback()` | VERIFIED | `line-chart.ts` lines 296-321: reverse-init order — cancel RAF → disconnect `_gpuResizeObserver` → `_gpuChart.dispose()` → `void releaseGpuDevice()` if `_wasWebGpu` → `super.disconnectedCallback()` |
| 10 | On non-WebGPU browsers the chart renders identically to Phase 100 with no errors | VERIFIED (automated; needs human for runtime confirmation) | All WebGPU branches gated by `if (this._gpuChart)` or `if (this.renderer === 'webgpu')`; no static `chartgpu` import at module top level |

#### Plan 03 Truths (LuiAreaChart)

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 11 | `LuiAreaChart` initializes a ChartGPU canvas layer beneath ECharts when `this.renderer === 'webgpu'` | VERIFIED | `area-chart.ts` lines 89-97: identical override to line-chart.ts |
| 12 | ChartGPU canvas positioned with `z-index:0` and `pointer-events:none` | VERIFIED | `area-chart.ts` line 125: identical CSS text to line-chart.ts |
| 13 | Full reverse-init cleanup in `disconnectedCallback()` including `releaseGpuDevice()` | VERIFIED | `area-chart.ts` lines 277-302: identical cleanup order to LuiLineChart |

**Score:** 13/13 truths verified (automated); 4 items require human runtime verification

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/charts/package.json` | `chartgpu@0.3.2` in dependencies | VERIFIED | Line 58 under `"dependencies"` — runtime dep, not devDependencies |
| `packages/charts/src/shared/webgpu-device.ts` | Refcounted GPUDevice singleton with adapter storage | VERIFIED | 112 lines; exports `acquireGpuDevice`, `getGpuDevice`, `getGpuAdapter`, `releaseGpuDevice`, `RendererTier`; `_refCount` + `_adapter` module-level state; `device.destroy()` in teardown path |
| `packages/charts/src/line/line-chart.ts` | LuiLineChart with ChartGPU two-layer canvas | VERIFIED | 359 lines (min_lines: 220 satisfied); contains `_gpuChart`, `_initWebGpuLayer`, `_syncCoordinates`, `_gpuResizeObserver`, `_wasWebGpu`, `_gpuFlushedLengths` |
| `packages/charts/src/area/area-chart.ts` | LuiAreaChart with ChartGPU two-layer canvas | VERIFIED | 345 lines (min_lines: 220 satisfied); all six identifiers present; point-for-point parity with line-chart.ts |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `line-chart.ts` | `chartgpu` (dynamic import) | `await import('chartgpu')` inside `_initWebGpuLayer()` | WIRED | Line 112; no static import at module top level confirmed |
| `line-chart.ts` | `webgpu-device.ts` | `getGpuDevice()`, `getGpuAdapter()`, `releaseGpuDevice()` | WIRED | All three imported at lines 23-26; called at lines 104, 108, 315 |
| `_flushLineUpdates()` (line) | `_gpuChart.appendData()` | WebGPU branch inside `_flushLineUpdates()` | WIRED | Lines 241-255: `if (this._gpuChart)` → `appendData(idx, pairs)`. Note: real ChartGPU 0.3.2 API is `appendData(seriesIndex, newPoints)` — two-arg, not single-arg as plan spec stated. Implementation correctly uses two-arg form. |
| `area-chart.ts` | `chartgpu` (dynamic import) | `await import('chartgpu')` inside `_initWebGpuLayer()` | WIRED | Line 115; no static import at module top level confirmed |
| `area-chart.ts` | `webgpu-device.ts` | `getGpuDevice()`, `getGpuAdapter()`, `releaseGpuDevice()` | WIRED | All three imported at lines 24-27; called at lines 107, 111, 296 |
| `_flushLineUpdates()` (area) | `_gpuChart.appendData()` | WebGPU branch inside `_flushLineUpdates()` | WIRED | Lines 232-246: identical incremental push pattern to line-chart.ts |
| `webgpu-device.ts` | `GPUDevice.destroy()` | `releaseGpuDevice()` refcount reaching zero | WIRED | Lines 105-110: `if (_refCount === 0 && _devicePromise !== null) { device.destroy(); ... }` |
| `line-chart.ts` (webgpu-device.ts) | base-chart-element.ts | `acquireGpuDevice()` call site backward-compatible | WIRED | base-chart-element.ts calls `await acquireGpuDevice(adapter)` — async signature is backward-compatible with upgraded async implementation |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| WEBGPU-02 | 101-01, 101-02, 101-03 | Line and Area charts render data via ChartGPU 0.3.2 two-layer canvas (WebGPU canvas below for data pixels, ECharts canvas above for axes/tooltip) when WebGPU available, with coordinate sync on every `dataZoom` and `rendered` event | SATISFIED | All three plans completed; line-chart.ts and area-chart.ts have full WebGPU two-layer integration; chartgpu@0.3.2 installed; REQUIREMENTS.md marks WEBGPU-02 as complete at Phase 101 |

**Note on REQUIREMENTS.md description vs implementation:** REQUIREMENTS.md specifies coordinate sync "via `convertToPixel()`". The implementation uses `getOption().dataZoom[0].start/end` (percent-space) passed directly to `setZoomRange()`. The SUMMARY explains this is architecturally correct — ChartGPU's `setZoomRange()` operates in percent-space, making `convertToPixel()` an unnecessary intermediate step. This is flagged for human visual confirmation (SC2 in original plan).

### Anti-Patterns Found

No anti-patterns detected in modified files.

| File | Pattern | Severity | Verdict |
|------|---------|----------|---------|
| `webgpu-device.ts` | — | — | Clean |
| `line-chart.ts` | — | — | Clean |
| `area-chart.ts` | — | — | Clean |

Static import of `chartgpu` at module top level: **NOT PRESENT** in either chart file. Dynamic import only, inside `_initWebGpuLayer()`. SSR + tree-shaking safety preserved.

### Human Verification Required

#### 1. DataZoom Coordinate Alignment (LuiLineChart)

**Test:** Open a WebGPU-capable browser, render `<lui-line-chart>` with 500K+ streamed points and a DataZoom slider enabled (`zoom` attribute). Drag the slider to pan and zoom to different ranges.

**Expected:** ChartGPU GPU canvas data pixels and ECharts axis tick marks stay in pixel-perfect alignment at all zoom levels. No horizontal offset between the rendered GPU line and the ECharts x-axis labels.

**Why human:** The implementation uses percent-space sync (`dataZoom[0].start/end → setZoomRange()`) rather than pixel-space (`convertToPixel()`). While architecturally justified, pixel-level alignment can only be confirmed visually. A subtle percent→pixel mapping error would be invisible in code but visible in the rendered output.

#### 2. z-index Layering and Pointer Events (LuiAreaChart)

**Test:** Render `<lui-area-chart>` on a WebGPU browser. Hover over the chart for tooltip. Drag the DataZoom slider. Confirm the ECharts overlay remains fully interactive.

**Expected:** ECharts axes, tooltip, and legend are always on top of the ChartGPU canvas. All mouse events (hover, click, drag) are captured by ECharts, not blocked by the ChartGPU `gpuHost` div.

**Why human:** `pointer-events:none` and `z-index:0` are set in the CSS string; correct layering requires a real Shadow DOM rendering context to verify.

#### 3. Non-WebGPU Fallback (Both Charts)

**Test:** Open Firefox or any browser without WebGPU enabled. Load a page with `<lui-line-chart>` and `<lui-area-chart>`. Inspect the browser console.

**Expected:** No JavaScript errors. Both charts render using ECharts only (no ChartGPU import attempted). Behavior is identical to Phase 100.

**Why human:** Cannot simulate a real non-WebGPU environment programmatically.

#### 4. Memory Leak — 10 Create/Destroy Cycles

**Test:** Script 10 repeated mount/unmount cycles of `<lui-line-chart>` in a WebGPU browser. Monitor GPU memory in DevTools (chrome://gpu or `performance.memory` proxy).

**Expected:** GPU memory usage does not grow across cycles. `releaseGpuDevice()` → `device.destroy()` is confirmed to fire when the last chart unmounts (refcount hits zero).

**Why human:** `device.destroy()` call is structurally present in `webgpu-device.ts` line 107 and the refcount logic is correct, but actual GPU memory reclamation can only be confirmed in a real WebGPU session.

### Structural Notes

- **appendData API deviation:** Plan 02 spec defined `appendData(points: [number, number][])` (single-arg). ChartGPU 0.3.2 actual API is `appendData(seriesIndex: number, newPoints: CartesianSeriesData)` (two-arg). Both chart files use the correct two-arg form. The `_GpuChartInstance` local interface in both files matches the real API.

- **ChartGPUCreateContext.adapter:** Plan assumed `adapter` was optional. ChartGPU 0.3.2 requires `adapter` in the context object. Both chart files handle this with a null guard: when `getGpuAdapter()` returns null, falls back to standalone `ChartGPU.create()` without context. This is correct defensive behavior.

- **TypeScript:** `pnpm --filter @lit-ui/charts exec tsc --noEmit` exits 0 with no errors.

- **Commits:** All four implementation commits verified in git log: `d24ef77` (Plan 01), `e137a30` (Plan 02 Task 1), `e939672` (Plan 02 Task 2), `ddbe48e` (Plan 03).

---

_Verified: 2026-03-01T20:00:00Z_
_Verifier: Claude (gsd-verifier)_
