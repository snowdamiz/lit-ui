# Architecture Research: v10.0 WebGPU Charts

**Domain:** WebGPU rendering layer + 1M+ streaming + moving average overlay for @lit-ui/charts
**Researched:** 2026-03-01
**Confidence:** HIGH (ECharts internals, BaseChartElement integration, MA computation) / MEDIUM (WebGPU layering pattern, browser support)

---

## Scope

This document is a **delta from v9.0**. It answers only what changes for the three v10.0 features:

1. **WebGPU data layer** — layered canvas architecture, auto-detection, fallback chain
2. **1M+ streaming** — bottleneck analysis, architectural changes for Line/Area
3. **Moving average real-time update** — computation model, streaming integration

It does not re-document v9.0 architecture (BaseChartElement lifecycle, SSR, ThemeBridge, registry pattern). See `.planning/research/ARCHITECTURE.md` history for that context. The existing code in `packages/charts/src/` is the authoritative v9.0 baseline.

---

## System Overview: v10.0 Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Consumer Application                            │
│  <lui-line-chart enable-webgpu .data=${stream} />                   │
│  <lui-candlestick-chart moving-averages='[{"period":20}]' />        │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                       @lit-ui/charts Package                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  BaseChartElement (existing — v9.0)                           │   │
│  │                                                               │   │
│  │  #chart div (position: relative, fills :host)                 │   │
│  │  ┌─────────────────────────────────────────────────────┐     │   │
│  │  │  WebGPU canvas [z-index: 1, position: absolute]     │     │   │
│  │  │  (renders data series at GPU speed)                 │     │   │
│  │  │                           ↕ coordinated resize      │     │   │
│  │  │  ECharts canvas [z-index: 2, position: absolute]    │     │   │
│  │  │  (renders axes, labels, legend, tooltip, DataZoom)  │     │   │
│  │  │  (series data area set transparent/empty)           │     │   │
│  │  └─────────────────────────────────────────────────────┘     │   │
│  │                                                               │   │
│  │  NEW: _webgpuLayer?: WebGPUDataLayer                         │   │
│  │  NEW: _renderer: 'webgpu' | 'webgl' | 'canvas'              │   │
│  │  MOD: _initChart() — conditional layer creation              │   │
│  │  MOD: _flushPendingData() — routes to WebGPU or ECharts      │   │
│  │  MOD: disconnectedCallback() — destroy WebGPU device         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  NEW FILES:                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐    │
│  │ webgpu/               │  │ base/webgpu-detector.ts          │    │
│  │   webgpu-data-layer.ts│  │ (navigator.gpu probe, sync)     │    │
│  │   line-wgsl.ts        │  └──────────────────────────────────┘    │
│  │   (WGSL shaders for   │                                          │
│  │    line/area drawing) │                                          │
│  └──────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Feature 1: WebGPU Renderer — Layer Architecture

### The Core Problem

ECharts does not and will not support WebGPU natively. ECharts 5.x uses Canvas 2D internally; moving to WebGPU would require rewriting the entire renderer. The proposed architecture instead uses **rendering separation**:

- **WebGPU canvas**: owns data series pixels (polylines, area fills, scatter points)
- **ECharts canvas**: owns everything else (axes, grid lines, labels, legend, tooltip, DataZoom)

This is the same pattern used by gpu-curtains and the WebGL-overlay-with-2D-canvas community pattern. It is a well-established, composable approach with documented implementation.

### Layer Composition

```
:host shadow root
  └── #chart div (position: relative, width: 100%, height: 100%)
        ├── <canvas id="webgpu-canvas">   (position: absolute, inset: 0, z-index: 1)
        │   WebGPU GPUDevice renders data series here
        │   pointer-events: none (events pass through to ECharts layer)
        │
        └── <canvas id="echarts-canvas">  (position: absolute, inset: 0, z-index: 2)
            ECharts renders: xAxis, yAxis, grid, legend, tooltip, DataZoom, markLine
            Series color = 'transparent' for series ECharts "owns" but WebGPU renders
            pointer-events: auto (ECharts handles mouse/touch for tooltip, zoom)
```

**Critical**: ECharts must have `series[].data = []` (or sparse placeholder) for chart types where WebGPU renders the data. ECharts is still responsible for:
- Computing axis scales (min/max derived from data extent — passed explicitly)
- Tooltip hit detection (ECharts can receive axisPointer events via `trigger: 'axis'`)
- DataZoom state and pan/zoom interaction
- Legend rendering and toggling

The WebGPU layer reads the ECharts instance's axis scale to map data coordinates to canvas pixels. This is done by querying `echartsInstance.convertToPixel({ seriesIndex: 0 }, [x, y])` after ECharts has laid out its axes. When the axis scale changes (zoom/pan), the WebGPU layer re-renders with the new coordinate mapping.

### Where It Lives in BaseChartElement

New protected field:

```typescript
// New in BaseChartElement for v10.0
protected _webgpuLayer: WebGPUDataLayer | null = null;
protected _activeRenderer: 'webgpu' | 'webgl' | 'canvas' = 'canvas';
```

Changes to `_initChart()`:

```typescript
private async _initChart(): Promise<void> {
  await this._registerModules();

  // --- NEW: Probe for WebGPU before ECharts init ---
  if (this.enableWebgpu) {
    const detector = await WebGPUDetector.probe();
    this._activeRenderer = detector.renderer; // 'webgpu' | 'webgl' | 'canvas'
    dispatchCustomEvent(this, 'renderer-selected', { renderer: this._activeRenderer });
  }

  // ECharts init (unchanged)
  const { init, getInstanceByDom } = await import('echarts/core');
  const container = this.shadowRoot?.querySelector<HTMLDivElement>('#chart');
  if (!container) return;
  const existing = getInstanceByDom(container);
  if (existing) existing.dispose();
  const theme = this._themeBridge.buildThemeObject();
  this._chart = init(container, theme, { renderer: 'canvas' });

  // --- NEW: Create WebGPU layer on top of ECharts canvas ---
  if (this._activeRenderer === 'webgpu') {
    this._webgpuLayer = await WebGPUDataLayer.create(container, this._chart);
    // WebGPUDataLayer injects its own <canvas> inside container above ECharts canvas
  }

  // ResizeObserver syncs both layers
  this._resizeObserver = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    this._chart?.resize();
    this._webgpuLayer?.resize(width, height);
  });
  this._resizeObserver.observe(container);

  // ... rest of existing init
}
```

Changes to `disconnectedCallback()`:

```typescript
override disconnectedCallback(): void {
  // ... existing RAF cancel, observer disconnect ...
  this._webgpuLayer?.destroy(); // destroy GPUDevice, release GPU memory
  this._webgpuLayer = null;
  // ... existing ECharts loseContext + dispose ...
}
```

### How Each Chart Type Hooks In

The `_webgpuLayer` is owned by `BaseChartElement`. Concrete chart classes don't need to know about it directly, but they do need to change what they put in their ECharts option when WebGPU is active:

```typescript
// In LuiLineChart._applyData():
protected override _applyData(): void {
  if (!this._chart || !this.data) return;

  if (this._activeRenderer === 'webgpu' && this._webgpuLayer) {
    // Give ECharts only structure (axes, legend) — no series data
    const scaffoldOption = buildLineScaffold(
      this.data as LineChartSeries[],
      { smooth: this.smooth, zoom: this.zoom, markLines: this.markLines }
    );
    this._chart.setOption(scaffoldOption);
    // Feed actual data to WebGPU layer
    this._webgpuLayer.setSeries(this.data as LineChartSeries[]);
  } else {
    // Existing path: ECharts renders everything
    const option = buildLineOption(this.data as LineChartSeries[], ...);
    this._chart.setOption(option, { notMerge: false });
  }
}
```

**Chart types that benefit from WebGPU**: Line, Area (continuous data series). Bar, Pie, Heatmap, Treemap — the data density rarely exceeds what Canvas can handle and WebGPU adds complexity without benefit. Candlestick at 1M candles is an edge case not in scope for v10.0. Scatter already has the WebGL (echarts-gl) path.

**Recommendation**: Enable WebGPU layer only for `LuiLineChart` and `LuiAreaChart` in v10.0. All other chart types continue using the existing ECharts Canvas path even with `enable-webgpu` set.

### Auto-Detection: WebGPUDetector

```typescript
// packages/charts/src/base/webgpu-detector.ts

export type RendererCapability = {
  renderer: 'webgpu' | 'webgl' | 'canvas';
  device?: GPUDevice;        // set when renderer === 'webgpu'
  adapter?: GPUAdapter;
};

export class WebGPUDetector {
  static async probe(): Promise<RendererCapability> {
    // 1. Check navigator.gpu (WebGPU API presence)
    if (!('gpu' in navigator)) return { renderer: 'webgl' };

    // 2. Request adapter — returns null if no suitable GPU
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) return { renderer: 'webgl' };

    // 3. Request device — may throw on driver issues
    try {
      const device = await adapter.requestDevice();
      return { renderer: 'webgpu', device, adapter };
    } catch {
      return { renderer: 'webgl' };
    }
  }
}
```

Fallback chain: **WebGPU → WebGL (existing echarts-gl) → Canvas (ECharts default)**

The `enable-webgpu` attribute on the element triggers the probe. Without it, the existing behavior is fully preserved.

### Browser Support Reality (as of 2026-03-01)

WebGPU ships by default in Chrome, Edge, and Safari (as of Safari 26 / iOS 26). Firefox 141 on Windows and Firefox 145 on Apple Silicon macOS. Linux is still rolling out (Chrome 144+ on Intel Gen12+). Firefox Android is behind a flag.

**Confidence: MEDIUM.** Coverage is approximately 85-90% of desktop browsers. Mobile remains fragmented. The fallback chain must be robust — failing gracefully to WebGL or Canvas is not optional.

---

## Feature 2: 1M+ Streaming — Bottleneck Analysis and Architecture

### Where Is the Bottleneck?

Based on evidence from the ECharts source architecture, community benchmarks, and the GitHub issue #21075 (June 2025):

| Component | Bottleneck? | Evidence |
|-----------|-------------|----------|
| ECharts `appendData` internal scheduling | **YES — primary** | Bug report: 80K samples at 10fps vs 100fps expected. ECharts `streamBufferSize` default 1000, `maxTasksPerFrame` 10. |
| ECharts Canvas 2D rendering | **YES — secondary** | Canvas 2D is fundamentally CPU-bound. Polyline with 1M segments is expensive. |
| JS circular buffer (BaseChartElement) | **NO** | Array.push + slice is O(N) but negligible vs canvas repaint. TypedArray would improve GC. |
| DOM/layout | **NO** | ECharts renders to a single `<canvas>` — no DOM nodes per data point. |
| GPU (WebGPU path) | **NO** | WebGPU renders 1M instanced quads at 60fps (ChartGPU benchmark). |

**Bottom line**: At 1M+ points, ECharts Canvas path is the bottleneck. It cannot hit 60fps. The WebGPU data layer is the architectural fix.

### Architectural Changes for 1M+ Without Data Wipeout

**Problem 1: appendData wipes on setOption**

Documented in ECharts issue #12327 (fixed as closed but issue persists in practice). Any `setOption` call after `appendData` clears appended data. The current v9.0 implementation already guards against this (CRITICAL-03 in `base-chart-element.ts`). The WebGPU path sidesteps this entirely — ECharts never holds the data, so `setOption` is safe to call at any time.

**Problem 2: JS heap at 1M float pairs**

1M `[number, number]` pairs = 2M numbers × 8 bytes each = 16MB in a JS Array. This causes GC pressure.

Fix: Use `Float32Array` for the streaming buffer. At 4 bytes per float, 1M points = 8MB, with zero GC overhead (TypedArrays are not garbage-collected per-element).

```typescript
// Replace in BaseChartElement for appendData-mode charts:
// OLD: private _pendingData: unknown[] = [];
// NEW:
private _pendingDataBuffer = new Float32Array(4096); // x, y pairs (2048 points)
private _pendingCount = 0;

// For _circularBuffer on streaming path:
private _streamBuffer: Float32Array | null = null; // allocated at first pushData
```

**Problem 3: ECharts appendData ceiling (~500K visible points)**

ECharts progressive rendering handles incremental data but re-processes the full dataset on zoom/pan. Beyond ~500K points, interactions become sluggish even with `progressive` and `progressiveChunk` tuning.

Fix: **Data decimation before ECharts**. LTTB (Largest Triangle Three Buckets) downsamples 1M points to ~2000 visually representative points for the ECharts layer. The WebGPU layer renders the full 1M. This gives:

- ECharts: smooth axes, tooltip, zoom (2K points, always fast)
- WebGPU: pixel-accurate rendering of all 1M points

```typescript
// New utility: packages/charts/src/shared/lttb.ts
export function downsampleLTTB(
  data: Float32Array, // interleaved [x0, y0, x1, y1, ...]
  targetPoints: number
): Float32Array { ... }
```

**Problem 4: Theme update setOption conflicts with appendData**

The existing `_applyThemeUpdate()` in BaseChartElement calls `setOption` with color updates on dark mode toggle. In appendData mode, this wipes data. v9.0 docs warn this is "safe" because it passes only `{ color: [...] }` without series keys. However, the ECharts issue discussion suggests this is fragile.

Fix with WebGPU path: irrelevant — ECharts has no series data to wipe. Fix for Canvas path: test explicitly that `{ color: [...] }` setOption does not trigger appendData wipe in ECharts 5.6.0.

### New Streaming Flow (WebGPU Path)

```
pushData([x, y]) called by consumer
    │
    ▼
BaseChartElement._pendingData.push(point)    (existing RAF coalescing)
    │
    ▼  RAF fires (_flushPendingData)
    │
    ├── _activeRenderer === 'webgpu'?
    │       │
    │       ▼
    │   _webgpuLayer.appendPoints(pendingPoints)     [GPU buffer update]
    │   _circularBuffer.push(pendingPoints)           [JS buffer for decimation]
    │   IF _circularBuffer.length > DECIMATION_THRESHOLD:
    │       decimated = downsampleLTTB(_circularBuffer, 2000)
    │       _chart.setOption({ series: [{ data: decimated }] })  [safe: not appendData]
    │
    └── _activeRenderer === 'canvas'?
            │
            ▼
        (existing appendData or circular-buffer path)
```

---

## Feature 3: Moving Average Real-Time Update

### Current State (v9.0)

Moving averages are **fully implemented** in `candlestick-option-builder.ts`. `_computeSMA` and `_computeEMA` process the full `_ohlcBuffer` on every `_flushBarUpdates()` call. This works correctly for static data and for moderate streaming rates.

**The v10.0 problem**: At high streaming rates, recomputing MA over the full buffer on every flush is O(N) per flush. For SMA(20) over 50K bars, that is 50K multiplications every animation frame.

### What Needs to Change

**For SMA**: Sliding window sum. Maintain a running sum of the last `period` closes. On each new bar, add new close, subtract the oldest close from the window. O(1) per tick.

**For EMA**: Already O(1) per tick by nature. `ema[i] = close[i] * k + ema[i-1] * (1 - k)`. Only the previous EMA value and new close are needed. No full-buffer recomputation required.

The fix is an **incremental MA state object** maintained by `LuiCandlestickChart`:

```typescript
// packages/charts/src/candlestick/incremental-ma.ts

export type MAState = {
  period: number;
  type: 'sma' | 'ema';
  k: number;           // EMA: 2/(period+1)
  window: number[];    // SMA: circular buffer of last `period` closes
  windowSum: number;   // SMA: running sum for O(1) update
  lastEMA: number | null; // EMA: previous value
  values: (number | null)[];  // full output array (parallel to _ohlcBuffer)
};

export function createMAState(config: MAConfig): MAState { ... }

// Called once per new bar (O(1)):
export function updateMAState(state: MAState, newClose: number): number | null { ... }
```

### Where It Lives: Property vs Computed Series

**Answer: computed ECharts series injected via `buildCandlestickOption`** — same as today.

Do NOT add a separate computed property on `LuiCandlestickChart`. The MA data is already expressed as ECharts `line` series in the option object. The only change is switching from full recomputation to incremental state update.

The `_ohlcBuffer` in `LuiCandlestickChart` remains the authoritative data store. The MA states are computed in parallel and reset when `_applyData()` is called (i.e., when `this.data` changes).

### Updated `LuiCandlestickChart` Design

```typescript
// New private field:
private _maStates: MAState[] = [];

// Initialize/reset when data changes:
protected override _applyData(): void {
  this._ohlcBuffer = this.data ? [...(this.data as CandlestickBarPoint[])] : [];
  const maConfigs = _parseMovingAverages(this.movingAverages);

  // Reset MA states and compute from scratch on full data set
  this._maStates = maConfigs.map(c => {
    const state = createMAState(c);
    for (const bar of this._ohlcBuffer) {
      updateMAState(state, bar.ohlc[1]); // ohlc[1] = close
    }
    return state;
  });

  this._renderWithMA();
}

// Incremental update during streaming:
override pushData(point: unknown): void {
  const bar = point as CandlestickBarPoint;
  this._ohlcBuffer.push(bar);
  if (this._ohlcBuffer.length > this.maxPoints) {
    this._ohlcBuffer = this._ohlcBuffer.slice(-this.maxPoints);
    // Full recompute required after trim (window state is invalid after trim)
    this._resetMAStates();
  } else {
    // Incremental: O(1) per new bar
    for (const state of this._maStates) {
      updateMAState(state, bar.ohlc[1]);
    }
  }
  // Schedule flush (existing RAF coalescing)
  if (this._barRafId === undefined) {
    this._barRafId = requestAnimationFrame(() => {
      this._renderWithMA();
      this._barRafId = undefined;
    });
  }
}

private _renderWithMA(): void {
  if (!this._chart) return;
  const maSeriesData = this._maStates.map(s => s.values);
  // buildCandlestickOption accepts pre-computed MA data (avoids internal recomputation)
  const option = buildCandlestickOptionWithPrecomputedMA(this._ohlcBuffer, {
    bullColor: this.bullColor ?? undefined,
    bearColor: this.bearColor ?? undefined,
    showVolume: this.showVolume,
    maSeriesData,
    maConfigs: _parseMovingAverages(this.movingAverages),
  });
  this._chart.setOption(option, { lazyUpdate: true } as object);
}
```

**Trim handling**: When the buffer is trimmed to `maxPoints`, the sliding window state is corrupted (the oldest values in the window no longer exist). Full recompute from the trimmed buffer is required. This is an O(maxPoints) operation, but it only happens once every `maxPoints` bars — amortized cost is acceptable.

---

## New Components and Classes

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| `WebGPUDetector` | New class | `base/webgpu-detector.ts` | Probe navigator.gpu, request adapter/device, return capability |
| `WebGPUDataLayer` | New class | `webgpu/webgpu-data-layer.ts` | Own WebGPU canvas, GPUDevice, render pipeline for line/area data |
| `downsampleLTTB` | New function | `shared/lttb.ts` | LTTB decimation for ECharts axis scaffold at 1M+ points |
| `MAState`, `createMAState`, `updateMAState` | New types/fns | `candlestick/incremental-ma.ts` | O(1) incremental SMA/EMA update per streaming bar |
| WGSL shaders | New files | `webgpu/shaders/` | Vertex/fragment shaders for line and area rendering |

---

## Existing Classes That Change

| Class | Change | Scope |
|-------|--------|-------|
| `BaseChartElement` | Add `_webgpuLayer`, `_activeRenderer`, `enable-webgpu` prop; modify `_initChart()`, `_flushPendingData()`, `disconnectedCallback()` | Core infrastructure |
| `LuiLineChart` | Add WebGPU-path branch in `_applyData()` using scaffold option builder | Line-specific |
| `LuiAreaChart` | Same as `LuiLineChart` | Area-specific |
| `LuiCandlestickChart` | Add `_maStates`, replace full recompute with `updateMAState()`, add `_resetMAStates()` on buffer trim | Candlestick-specific |
| `buildCandlestickOption` (option builder) | Add `buildCandlestickOptionWithPrecomputedMA()` variant OR accept pre-computed `maSeriesData` param | Shared builder |

**Classes that do NOT change**: `LuiBarChart`, `LuiPieChart`, `LuiScatterChart`, `LuiHeatmapChart`, `LuiTreemapChart`, `ThemeBridge`, `registerCanvasCore`, all registry files.

---

## Recommended Build Order

Build order is constrained by three dependency chains:

1. **WebGPU detection must exist before any WebGPU layer code**
2. **WebGPUDataLayer requires GPUDevice from detector**
3. **Incremental MA update is self-contained and has no WebGPU dependency**

```
PHASE A: WebGPU Detector + Fallback Chain
  └── WebGPUDetector.probe() with navigator.gpu → adapter → device → fallback
  └── enable-webgpu property on BaseChartElement
  └── _activeRenderer state + renderer-selected event
  └── Unit test: detector returns correct renderer in Chrome/Firefox/Safari

PHASE B: Incremental MA (independent of A)
  └── MAState type + createMAState() + updateMAState()
  └── _maStates in LuiCandlestickChart
  └── pushData() incremental update + trim-triggered full recompute
  └── buildCandlestickOption change to accept pre-computed MA data
  └── Unit test: SMA(3) over [10,11,12,13,14] matches known values

PHASE C: LTTB Decimation (independent of A and B)
  └── downsampleLTTB() utility
  └── Unit test: 1M random points → 2000 output, preserves extremes

PHASE D: WebGPUDataLayer (requires A and C)
  └── WebGPU canvas injection into #chart container
  └── GPURenderPipeline for line chart (instanced quad per segment)
  └── appendPoints() for streaming data intake
  └── resize() sync with ECharts ResizeObserver
  └── coordinate mapping via echartsInstance.convertToPixel()
  └── destroy() — GPUDevice.destroy() + canvas removal

PHASE E: BaseChartElement + Line/Area Integration (requires A, C, D)
  └── Modify _initChart() to call WebGPUDataLayer.create() when webgpu active
  └── Modify _flushPendingData() to route to WebGPU layer
  └── buildLineScaffold() — option variant without series data (axes only)
  └── LuiLineChart._applyData() WebGPU branch
  └── LuiAreaChart._applyData() WebGPU branch
  └── ResizeObserver sync of both layers

PHASE F: Documentation + Skill File Updates
  └── Update charts skill file with enable-webgpu attribute
  └── Update line-chart and area-chart skill files
  └── Update candlestick-chart skill file with incremental MA note
  └── Bundle size guidance (WebGPU layer adds ~Xkb)
```

**Critical path**: A → D → E. Phase B and C can be built in parallel with A. Phase F follows everything.

---

## Data Flow

### WebGPU Streaming Flow (Line/Area)

```
consumer: chart.pushData([timestamp, value])
    │
    ▼
BaseChartElement._pendingData.push(point)
    │  (RAF coalescing — multiple calls per frame batched)
    ▼
_flushPendingData() [RAF callback]
    │
    ├── _activeRenderer === 'webgpu'
    │       │
    │       ├── _webgpuLayer.appendPoints(newPoints)
    │       │       GPUQueue.writeBuffer() → GPU memory
    │       │       requestAnimationFrame (WebGPU render pass)
    │       │
    │       └── _circularBuffer.push(newPoints)
    │               IF length > 10000:
    │                   decimated = downsampleLTTB(buffer, 2000)
    │                   _chart.setOption({ series: [{ data: decimated }] })
    │                   [ECharts only gets decimated data — safe setOption, no appendData]
    │
    └── _activeRenderer === 'canvas'
            │
            └── (existing appendData path — unchanged)
```

### Moving Average Streaming Flow (Candlestick)

```
consumer: chart.pushData({ label, ohlc: [o,c,l,h], volume })
    │
    ▼
LuiCandlestickChart.pushData() override
    │
    ├── _ohlcBuffer.push(bar)
    │
    ├── FOR EACH _maState:
    │       updateMAState(state, bar.ohlc[1])   // O(1)
    │       state.values.push(newMAValue)
    │
    ├── IF _ohlcBuffer.length > maxPoints:
    │       trim buffer
    │       _resetMAStates()  // full recompute from trimmed buffer — O(maxPoints)
    │
    └── scheduleFlush() [RAF]
            │
            ▼
        _renderWithMA()
            │
            └── buildCandlestickOptionWithPrecomputedMA()
                    _chart.setOption(option, { lazyUpdate: true })
```

---

## Integration Points

### External Integration

| Integration | Pattern | Notes |
|-------------|---------|-------|
| WebGPU API | `navigator.gpu.requestAdapter()` async probe | Must be inside `firstUpdated()` — never at module load (crashes SSR) |
| ECharts coordinate API | `echartsInstance.convertToPixel()` | Used by WebGPU layer to map data coords to canvas pixels after axis layout |
| ECharts DataZoom events | `echartsInstance.on('datazoom', handler)` | WebGPU layer re-renders on zoom/pan to match ECharts axis viewport |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `BaseChartElement` ↔ `WebGPUDataLayer` | Direct method calls (`appendPoints`, `resize`, `destroy`) | WebGPUDataLayer is owned by BaseChartElement, not a Lit element |
| `WebGPUDataLayer` ↔ ECharts | `convertToPixel` read-only | WebGPU reads axis mapping from ECharts; never writes to ECharts |
| `LuiCandlestickChart` ↔ `MAState` | Direct import, no events | Incremental MA is a pure computation helper, no side effects |
| `_flushPendingData` ↔ `WebGPUDataLayer` | `_webgpuLayer.appendPoints()` | Only called inside RAF callback — no concurrent access |

---

## Anti-Patterns

### Anti-Pattern 1: Running WebGPU Probe at Module Load

**What:** `const capability = await WebGPUDetector.probe()` at the top level of `base-chart-element.ts`
**Why bad:** Module execution happens during SSR import. `navigator.gpu` does not exist in Node.js, crashing the SSR environment.
**Instead:** Run probe inside `firstUpdated()`, guarded by `isServer`. This matches the existing pattern for `echarts.init()`.

### Anti-Pattern 2: Letting ECharts Hold 1M Points in appendData Mode

**What:** Keeping the existing `appendData` path for Line/Area after WebGPU is enabled, letting ECharts accumulate 1M points.
**Why bad:** ECharts' Canvas 2D renderer re-paints the entire polyline on every update. At 1M points, each RAF is a 30-100ms Canvas operation. Interaction (zoom/pan) becomes unusable.
**Instead:** Route data to WebGPU layer. ECharts gets only decimated scaffold data (2K points) for axis computation. ECharts remains fast; WebGPU renders the full dataset at GPU speed.

### Anti-Pattern 3: Full MA Recomputation on Every Streaming Flush

**What:** Calling the existing `_computeSMA` / `_computeEMA` over the full `_ohlcBuffer` array on every `_flushBarUpdates()` call.
**Why bad:** O(N * M) where N = buffer size, M = number of MA configs. At 50K bars with 3 MA lines, each RAF does 150K floating-point operations before even calling `setOption`.
**Instead:** Maintain `MAState` per config. Each new bar costs O(1) per MA. Full recompute only on buffer trim.

### Anti-Pattern 4: Creating a New GPUDevice Per Chart Instance

**What:** `WebGPUDataLayer.create()` calls `navigator.gpu.requestAdapter()` + `adapter.requestDevice()` each time.
**Why bad:** Browsers limit concurrent WebGPU devices (similar to WebGL context limit of ~16). Each `requestDevice()` call also has async overhead (~50ms).
**Instead:** Share a single `GPUDevice` across all chart instances on the page via a module-level singleton. The pattern used by ChartGPU: `{ adapter, device }` shared across instances. Individual chart render pipelines are separate, but the device is reused.

### Anti-Pattern 5: Using WebGPU Without Axes Fallback for Non-Data Content

**What:** Replacing ECharts entirely with WebGPU for all rendering including axes, labels, and tooltips.
**Why bad:** Rendering text and UI controls in WebGPU requires significant custom code (text atlas, font rasterization, event hit detection). ECharts provides all of this battle-tested.
**Instead:** Keep the layered canvas architecture. ECharts renders UI; WebGPU renders data pixels.

---

## Scaling Considerations

| Concern | At 100K points | At 1M points | At 10M points |
|---------|----------------|--------------|---------------|
| ECharts Canvas path | Fine (~60fps) | Sluggish (<15fps) | Unusable (<1fps) |
| WebGPU data layer | Fine (trivial) | Fine (~60fps) | May need LTTB + level-of-detail |
| JS heap (typed array) | ~0.4MB | ~4MB | ~40MB — watch GC |
| MA computation (O(1)/tick) | Negligible | Negligible | Negligible |
| Decimation (LTTB) | Not needed | 1M→2K in <10ms | Consider wasm |

---

## Sources

- [ECharts appendData vs setOption conflict (GitHub #12327)](https://github.com/apache/echarts/issues/12327) — HIGH confidence, confirms data wipe on setOption after appendData
- [ECharts real-time performance bug (GitHub #21075)](https://github.com/apache/echarts/issues/21075) — MEDIUM confidence, 80K samples at 10fps ceiling
- [ECharts streaming and scheduling (DeepWiki)](https://deepwiki.com/apache/echarts/2.4-streaming-and-scheduling) — MEDIUM confidence, internal scheduler documented
- [ECharts features page — TypedArray, appendData](https://echarts.apache.org/en/feature.html) — HIGH confidence, official docs
- [WebGPU with Canvas 2D sync pattern (GitHub Gist, Greggman)](https://gist.github.com/greggman/6eddf8a75ca99ba4533f75ffa624c5ea) — HIGH confidence, canonical two-canvas pattern
- [WebGL text + Canvas 2D overlay (WebGL2Fundamentals)](https://webgl2fundamentals.org/webgl/lessons/webgl-text-canvas2d.html) — HIGH confidence, established layering pattern
- [WebGPU browser support — all major browsers (web.dev)](https://web.dev/blog/webgpu-supported-major-browsers) — HIGH confidence, official announcement
- [WebGPU browser support (caniuse)](https://caniuse.com/webgpu) — HIGH confidence, current compatibility table
- [MDN: navigator.gpu.requestAdapter()](https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter) — HIGH confidence, official API docs
- [ChartGPU — WebGPU charting library (HN)](https://news.ycombinator.com/item?id=46693978) — MEDIUM confidence, real-world 1M+ WebGPU chart implementation
- [ChartGPU GitHub](https://github.com/ChartGPU/ChartGPU) — MEDIUM confidence, architecture reference for WebGPU chart rendering
- [EMA incremental formula reference](https://medium.com/@elinneon/real-time-calculation-of-exponential-moving-averages-with-boost-accumulators-in-c-8b462c086476) — MEDIUM confidence, O(1) EMA pattern

---

*Architecture research for: @lit-ui/charts v10.0 — WebGPU rendering layer, 1M+ streaming, incremental MA*
*Researched: 2026-03-01*
