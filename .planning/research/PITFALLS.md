# Pitfalls Research: v10.0 WebGPU Charts

**Domain:** Adding WebGPU rendering path, 1M+ streaming, and moving average overlay to an existing ECharts 5.6 + Lit 3 web component system
**Researched:** 2026-03-01
**Confidence:** HIGH (verified against MDN WebGPU specs, toji.dev WebGPU best practices, gpuweb/gpuweb Implementation Status wiki, Apache ECharts GitHub issues, and MDN typed array docs)

---

## Critical Pitfalls

Mistakes that cause broken rendering, production crashes, or architectural rewrites.

---

### CRITICAL-01: WebGPU SSR Crash — `navigator.gpu` Referenced Without `isServer` Guard

**What goes wrong:**
Any module that references `navigator.gpu`, `GPUDevice`, or calls `navigator.gpu.requestAdapter()` at import time or in a non-guarded code path will throw `TypeError: Cannot read properties of undefined (reading 'requestAdapter')` during SSR. Node.js has no `navigator.gpu`. The @lit-labs/ssr environment provides no WebGPU shim. The crash happens at module load, before any component lifecycle fires, killing the entire Next.js or Astro SSR render pipeline.

**Why it happens:**
Developers familiar with the existing `isServer` guard for ECharts (CRITICAL-04 from v9.0) may write the WebGPU detection in a shared utility module or in a class field initializer rather than inside a guarded lifecycle method. Class field initializers run at construction time, and Lit constructs element classes on the server during SSR for declarative shadow DOM registration — before `firstUpdated` is ever reached.

**How to avoid:**
Follow the exact same three-layer defense established for ECharts in v9.0, applied to WebGPU:

1. Never reference `navigator.gpu` outside of a function body guarded by `isServer` or `typeof navigator !== 'undefined'`.
2. Put all WebGPU initialization inside `firstUpdated()`, which never fires during SSR.
3. Add a belt-and-suspenders `isServer` return at the top of the WebGPU init path:

```typescript
import { isServer } from 'lit';

private async _initWebGPU(): Promise<void> {
  if (isServer) return; // SSR guard — navigator.gpu does not exist in Node.js
  if (!navigator.gpu) {
    this._webgpuUnavailable = true;
    return;
  }
  const adapter = await navigator.gpu.requestAdapter();
  // ...
}
```

4. In `_registerModules()` or any base-class method that may run in a mixed SSR+hydration context, wrap the WebGPU probe in a `typeof navigator !== 'undefined'` check as a secondary guard.

**Warning signs:**
- Next.js App Router build fails with `TypeError: Cannot read properties of undefined (reading 'gpu')`
- Astro static build crashes on chart import
- Error stack trace points to a class field or module-level expression, not a lifecycle method

**Phase to address:** Phase 1 of the WebGPU milestone (WebGPU renderer integration) — the SSR guard must be the foundation before any WebGPU code path is written.

---

### CRITICAL-02: Reusing a Consumed GPUAdapter After Device Loss

**What goes wrong:**
A `GPUAdapter` becomes "consumed" after `requestDevice()` is called once on it. A WebGPU device loss event fires (`device.lost` resolves). The recovery code calls `consumedAdapter.requestDevice()` again on the same adapter instance. The browser returns a `GPUDevice` that is already lost — it resolves immediately as a lost device. The chart appears to recover but all WebGPU calls silently fail. The fallback to ECharts canvas is never triggered because the device is technically "created."

**Why it happens:**
The spec language around adapter consumption is not prominent in most WebGPU tutorials. Developers cache the adapter reference (e.g., `this._gpuAdapter = adapter`) and reuse it across reconnect/recovery cycles. Chrome's implementation returns an already-lost device from a consumed adapter with no thrown exception, creating a silent failure mode that is difficult to detect in testing.

**How to avoid:**
Never store the `GPUAdapter` reference past the initial `requestDevice()` call. On device loss recovery, always start from `navigator.gpu.requestAdapter()`:

```typescript
// WRONG — reuses consumed adapter
const device = await this._gpuAdapter.requestDevice(); // returns lost device

// CORRECT — fresh adapter on every recovery
const freshAdapter = await navigator.gpu.requestAdapter();
if (!freshAdapter) {
  this._fallbackToECharts();
  return;
}
const device = await freshAdapter.requestDevice();
```

Additionally, `requestAdapter()` can return `null` after repeated GPU process crashes (Chrome enforces a two-crashes-in-two-minutes limit before blocking further adapter requests). Handle `null` explicitly — do not assume it returns an adapter.

**Warning signs:**
- Chart appears to reinitialize after device loss but renders nothing
- `device.lost` resolves immediately after "recovery"
- No console error on recovery path but chart is blank
- Reproduces in Chrome DevTools WebGPU device simulation

**Phase to address:** Phase 1 (WebGPU renderer) — device loss handling must be designed at the same time as initial device acquisition, not added later.

---

### CRITICAL-03: Two Canvas Elements Sharing a Container — ECharts Canvas Blocks WebGPU Pointer Events

**What goes wrong:**
The WebGPU layer is a separate `<canvas>` element positioned behind the ECharts canvas. ECharts creates its own canvas and appends it to the chart container div. The ECharts canvas sits on top of the WebGPU canvas in the stacking order. `pointer-events` on the ECharts canvas intercepts all mouse/touch events, so the WebGPU layer never receives them. More critically: ECharts internally calls `canvas.getContext('2d')` on its canvas. If the same `<canvas>` element is used for both WebGPU and ECharts, `getContext` for one will fail — a canvas element can only hold one context type at a time. Calling `getContext('webgpu')` and then `getContext('2d')` on the same canvas element returns `null` for the second call.

**Why it happens:**
The natural instinct is to use the existing ECharts `#chart` container div and let both ECharts and WebGPU share a canvas. ECharts owns its canvas — it creates and manages it internally. There is no ECharts API to inject an existing canvas as the WebGPU render target for the chart internals.

**How to avoid:**
Use two separate `<canvas>` elements in the shadow root with explicit z-index layering:

```css
/* WebGPU canvas below ECharts canvas */
#webgpu-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none; /* events pass through to ECharts layer above */
}
#echarts-container {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: transparent; /* ECharts canvas must be transparent for WebGPU to show through */
}
```

The ECharts canvas must have `background: transparent` (not the default white). Pass `{ backgroundColor: 'transparent' }` to `echarts.init()` theme or `setOption`.

The WebGPU canvas must receive `pointer-events: none` — all interactive events are handled by ECharts' layer since ECharts controls the axis/tooltip coordinate system.

**Warning signs:**
- Blank WebGPU canvas despite successful device creation
- ECharts tooltips work but WebGPU layer never renders visible content
- Console error: `Failed to execute 'getContext' on 'HTMLCanvasElement': canvas already has context`
- Stacking of canvases looks correct in DevTools Elements panel but render is wrong

**Phase to address:** Phase 1 (WebGPU renderer integration) — the two-canvas architecture must be the initial design, not a retrofit.

---

### CRITICAL-04: Coordinate System Mismatch Between WebGPU Layer and ECharts Canvas Layer

**What goes wrong:**
Data points rendered by WebGPU (e.g., a 1M-point line rendered in a GPU shader) visually misalign with ECharts-rendered elements (axes, tooltip crosshair, zoom window). The WebGPU layer renders at pixel coordinate (400, 200) while ECharts would place the same data point at (402, 198). At small datasets the error is imperceptible, but at 1M points the accumulated floating-point rounding diverges visibly. Pan/zoom operations via ECharts DataZoom update the ECharts axis range but the WebGPU shader still renders the old viewport — the two layers diverge completely during interaction.

**Why it happens:**
ECharts maintains its own internal coordinate transform chain: data domain → axis scale → grid pixel space → canvas pixel space. This transform includes grid padding, axis tick offsets, boundary gaps, and device pixel ratio scaling. The WebGPU shader knows none of this — it receives raw data values and must apply the same transform independently. Any discrepancy (floating-point accumulation, different DPR handling, different boundary gap assumptions) produces visible misalignment.

**How to avoid:**
The WebGPU layer must not compute its own data-to-pixel transform independently. Instead, it must read the transform from ECharts at render time via `chart.convertToPixel()`:

```typescript
// Extract the current axis transform from ECharts BEFORE rendering the WebGPU frame
const pixelOrigin = this._chart.convertToPixel({ seriesIndex: 0 }, [dataMinX, dataMinY]);
const pixelEnd = this._chart.convertToPixel({ seriesIndex: 0 }, [dataMaxX, dataMaxY]);
// Pass pixelOrigin, pixelEnd, and canvas dimensions to WebGPU shader as uniforms
```

The WebGPU shader then applies a linear transform: `screenX = (dataX - dataMinX) / (dataMaxX - dataMinX) * (pixelEnd[0] - pixelOrigin[0]) + pixelOrigin[0]`.

This transform must be recomputed on every ECharts DataZoom event and on every chart resize. Register for ECharts events:

```typescript
this._chart.on('dataZoom', () => this._syncWebGPUTransform());
this._chart.on('rendered', () => this._syncWebGPUTransform());
```

Also handle device pixel ratio: WebGPU canvas width/height must be set to `container.clientWidth * devicePixelRatio`, and the CSS size must be `clientWidth`. ECharts handles DPR internally — verify both layers use the same DPR scale.

**Warning signs:**
- Data points render in correct relative order but at slightly wrong pixel positions
- Misalignment gets worse after zoom/pan operations
- Alignment is correct at zoom level 100% but wrong when zoomed in
- Visual ghosting where WebGPU points appear slightly offset from ECharts reference lines

**Phase to address:** Phase 1 (WebGPU renderer) — the coordinate synchronization mechanism must be implemented at the same time as the first data render, not after visual testing reveals misalignment.

---

### CRITICAL-05: `appendData` Heap Growth Has No Native ECharts Truncation — Must Be Managed Externally

**What goes wrong:**
At 1M+ points, `appendData` accumulates data in ECharts' internal data store indefinitely. ECharts has no `removeData()` API and no maximum-points option for the `appendData` path. After 30 minutes of streaming at 1000 points/second, ECharts holds 1.8M internal data objects. The browser tab's heap exceeds 2GB. Chrome kills the tab with "Aw, Snap." The streaming chart that was designed to run continuously cannot survive a single work session.

**Why it happens:**
`appendData` is documented for large initial data loads, not continuous unbounded streaming. The ECharts internal data model stores each appended point as a JS object in its `dataStore` — not as a typed array. At 1M points, this is ~800MB of heap (1M × ~800 bytes per ECharts data item). The existing `maxPoints` property on `BaseChartElement` uses a circular buffer for `'buffer'` mode — but it does NOT apply to `'appendData'` mode. The `pushData()` → `appendData()` path in `_flushPendingData()` has no truncation logic.

**How to avoid:**
The `appendData` path in `BaseChartElement._flushPendingData()` must be extended with a periodic truncation strategy. The clean solution: maintain a separate TypeScript-side data array (a pre-allocated ring buffer), and when it exceeds `maxPoints`, call `chart.clear()` + `setOption` with the windowed data to reset ECharts' internal store, then resume `appendData`. This is a planned full-reset cycle rather than a continuous append:

```typescript
// Pseudo-pattern for bounded appendData streaming
if (this._totalAppended > this.maxPoints) {
  // Reset cycle: clear ECharts internal store, reinit with current window
  this._chart.clear();
  this._chart.setOption(this._buildInitOption()); // structural option only, no data
  this._chart.appendData({ seriesIndex: 0, data: this._ringBuffer.snapshot() });
  this._totalAppended = this._ringBuffer.length;
} else {
  this._chart.appendData({ seriesIndex: 0, data: points });
  this._totalAppended += points.length;
}
```

The TypeScript-side ring buffer itself should be a pre-allocated `Float32Array` (or `Float64Array` for timestamp precision), not a plain JS array, to avoid the GC pressure that makes the main thread pause during streaming.

**Warning signs:**
- Chrome Task Manager shows the chart tab's memory growing continuously over time
- Flame chart shows GC pauses increasing in duration as session extends
- Tab crashes after extended streaming with "Out of Memory" or "Aw, Snap"
- `performance.memory.usedJSHeapSize` trending upward with no plateau

**Phase to address:** Phase 1 (1M+ streaming) — the memory management strategy must be the foundation of the streaming architecture, not an afterthought when a memory alert fires.

---

## High-Severity Pitfalls

Mistakes that cause significant bugs, DX problems, or performance failures.

---

### HIGH-01: WebGPU Browser Coverage Is ~65% — Fallback Chain Must Be First-Class

**What goes wrong:**
The WebGPU renderer is developed and tested in Chrome 113+ on macOS. It is shipped as the default renderer for all chart types. Users on Firefox 140 (WebGPU not yet stable on that version), Safari iOS 25, or any Linux Chrome without a discrete GPU get blank charts with no error. The `webgpu-unavailable` event fires, but the host application has no handler because the developer assumed WebGPU was universally available.

**Why it happens:**
As of March 2026, WebGPU is available in Chrome/Edge 113+ (desktop), Firefox 141+ (Windows only), Firefox 145+ (macOS Apple Silicon only), and Safari 26 (requires macOS Tahoe / iOS 26 — new OS versions not yet widely deployed). Real-world coverage is approximately 65% of browsers. Safari on iOS 25 and earlier has no WebGPU support. Firefox on Linux and Android is behind a flag. Any deployment that assumes WebGPU as a baseline will fail for 35% of users.

**How to avoid:**
The fallback chain must be: WebGPU → WebGL (echarts-gl) → Canvas (ECharts default). The auto-detection and graceful degradation must be unconditional — not opt-in. The `enable-webgpu` attribute should be advisory, not a gate. The component must probe availability and fall through automatically:

```typescript
private async _detectRenderer(): Promise<'webgpu' | 'webgl' | 'canvas'> {
  if (isServer) return 'canvas';
  if (navigator.gpu) {
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter) return 'webgpu';
  }
  if (this._isWebGLSupported()) return 'webgl';
  return 'canvas';
}
```

Document in the skill file and API table that WebGPU is used automatically when available and that `canvas` is always the final fallback.

**Warning signs:**
- Blank charts reported from Linux or older Safari users
- `webgpu-unavailable` event fires but no fallback rendering appears
- CI tests pass (Chrome-based headless) but production reports failures on Firefox/Safari

**Phase to address:** Phase 1 (WebGPU renderer) — the fallback detection must be the first thing written, before any WebGPU rendering code.

---

### HIGH-02: GPUDevice Loss During Rendering — Lost Event Must Be `.then()` Not `await`

**What goes wrong:**
The WebGPU device loss handler is written as `await device.lost`. This line blocks the initialization function indefinitely in the normal case where the device never fails. If `_initWebGPU()` is `async` and the developer writes `await device.lost` after initialization, the function hangs forever in the "awaiting device loss" state, consuming a microtask queue entry for the lifetime of the page.

In the actual device loss scenario: a GPU process crash occurs (e.g., Chrome's 10-second GPU watchdog fires, or another tab consumes all GPU memory). The `device.lost` promise resolves. If the recovery code tries to reinitialize by calling `_initWebGPU()` recursively, and that function also `await`s `device.lost` on the new device, a chain of nested `await`s accumulates — each level holding memory and preventing GC of the previous device.

**Why it happens:**
`device.lost` is a Promise, and the natural Async/Await reflex is to `await` it. The MDN documentation contains the correct pattern (`.then()` callback), but developers skim past the note that says "probably don't want to `await` on it."

**How to avoid:**
Always handle device loss with a non-blocking `.then()` callback attached immediately after device creation:

```typescript
const device = await adapter.requestDevice();

// CORRECT: non-blocking
device.lost.then((info) => {
  this._gpuDevice = null;
  if (info.reason !== 'destroyed') {
    // Transient loss — attempt recovery with a fresh adapter
    this._initWebGPU(); // does NOT await device.lost recursively
  } else {
    // Intentional destroy — fall back to ECharts canvas
    this._fallbackToECharts();
  }
});

// WRONG: blocks forever in normal operation
await device.lost; // DO NOT DO THIS
```

**Warning signs:**
- WebGPU initialization function never resolves in normal operation (hung promise)
- Memory profiler shows previous GPUDevice objects not being collected
- Recovery loop creates increasing numbers of "awaiting device loss" microtask entries

**Phase to address:** Phase 1 (WebGPU renderer) — establish the `.then()` pattern immediately when first writing device acquisition.

---

### HIGH-03: Plain JS Array as Streaming Ring Buffer — GC Pauses at 1M Points

**What goes wrong:**
The streaming ring buffer is implemented as a plain JavaScript `Array`: `this._ringBuffer: number[] = []`. At 1M entries, each `number` in a JS Array is a boxed V8 SMI or heap number object. The GC must scan and potentially move these ~8MB of boxed values on every major collection. At streaming rates of 1000 points/second, major GCs fire every 60–120 seconds and pause the main thread for 200–500ms — visible as a periodic chart freeze with no data update for half a second.

**Why it happens:**
Plain JS arrays are the idiomatic choice. The GC impact is invisible at 10K or 100K points but becomes the dominant source of main-thread jank at 1M+ points. The existing `_circularBuffer` in `BaseChartElement` is `unknown[]` — correct for the small datasets it was designed for, but wrong for 1M-point streaming.

**How to avoid:**
The 1M-point streaming ring buffer must be a pre-allocated `Float32Array` (for values) or `Float64Array` (for timestamps where millisecond precision is needed). Allocate once at initialization with the maximum size:

```typescript
// Pre-allocate at maxPoints capacity — no GC pressure from element boxing
private _xBuffer = new Float64Array(this.maxPoints); // timestamps
private _yBuffer = new Float32Array(this.maxPoints); // values
private _writeHead = 0;
private _totalWritten = 0;

// Write to ring: O(1), no allocation
private _writePoint(x: number, y: number): void {
  const idx = this._writeHead % this.maxPoints;
  this._xBuffer[idx] = x;
  this._yBuffer[idx] = y;
  this._writeHead++;
  this._totalWritten++;
}
```

For the ECharts `appendData` API, a temporary typed array can be constructed from the ring buffer snapshot for the flush — this one allocation per RAF frame is acceptable; it is the continuous per-point boxing that causes GC pauses.

**Warning signs:**
- Chrome DevTools Performance tab shows periodic GC events > 100ms during streaming
- `requestAnimationFrame` callback duration spikes at regular intervals (every 60–120s)
- Heap snapshot shows millions of `HeapNumber` objects
- Jank is reproducible only after streaming has run for several minutes

**Phase to address:** Phase 1 (1M+ streaming) — the typed array ring buffer must be the initial implementation, not a performance fix applied later.

---

### HIGH-04: Moving Average Off-By-One at Stream Start — Warm-Up Window Outputs Incorrect Values

**What goes wrong:**
The `_computeSMA` function in `candlestick-option-builder.ts` correctly returns `null` for indices `0..period-2`. However, when MA is computed on a streaming ring buffer that wraps around (after the buffer has exceeded `maxPoints` and been truncated), the "first" data point in the visible window is actually index `N - maxPoints` in the historical stream — it already has a valid warm-up history. The MA function receives a sliced array starting at the wrong index, treats the first `period-1` entries as warm-up, and outputs `null` for them even though valid MA values could be computed from the preceding data that was truncated.

The reverse error also occurs: on initial stream start with fewer than `period` points, the MA function must return `null` — but if the warm-up is not handled, dividing a partial sum by `period` returns a small wrong value rather than `null`.

**Why it happens:**
Both `_computeSMA` and `_computeEMA` in the existing implementation are correct for batch/static computation over a complete array. They are written as pure functions that receive the full closes array and return a result per index. When called on a ring buffer snapshot that starts mid-stream, the function has no context about which entries are "first" in historical time versus first in the current snapshot array.

**How to avoid:**
Two separate concerns must be handled:

1. **Initial warm-up:** The existing `null` return for `i < period - 1` is correct and must not be changed. ECharts line series handles `null` values as gaps — the MA line simply starts after the warm-up period.

2. **Ring buffer truncation continuity:** When the streaming buffer truncates old data, pre-seed the MA calculation with the last `period - 1` values from the discarded window before the truncation point. These seed values are not rendered but ensure the first visible MA value is correct. Store them in a `_maSeedBuffer: Map<period, number[]>` on the chart component.

For EMA specifically: the EMA seed (the SMA of the first `period` values) must be carried across truncation boundaries. The current `_computeEMA` recalculates from scratch on every call — correct for static data, wrong for streamed data with truncation.

**Warning signs:**
- MA line starts late or shows a flat segment at the beginning of each truncation cycle
- EMA values reset to wrong levels after the ring buffer wraps
- MA line has a visible discontinuity (gap then restart) at `maxPoints` boundary
- Unit test: compute MA on 2× `maxPoints` points in two halves — the second half MA values should be continuous with the first half

**Phase to address:** Phase 2 (moving average overlay) — the seed-carry mechanism must be part of the initial MA implementation for streaming charts, not added after a bug report.

---

### HIGH-05: ECharts `setOption` for Theme Updates Wipes `appendData` Stream Data in WebGPU Mode

**What goes wrong:**
This is CRITICAL-03 from v9.0 re-manifesting in a new context. The `_applyThemeUpdate()` method in `BaseChartElement` calls `this._chart.setOption(colorUpdate)` when the dark mode class changes. In v9.0, this was safe because the color update only touches the `color` array, not `series.data`. In v10.0, if the chart has active `appendData` streaming AND a WebGPU render layer, the theme update `setOption` call still clears the ECharts internal data store — even though ECharts is now only rendering axes, tooltip, and DataZoom UI (not the actual data points, which are rendered by WebGPU). The axes and tooltip disappear momentarily (ECharts data wipeout) while the WebGPU layer is unaffected.

**Why it happens:**
The existing `_applyThemeUpdate()` was designed when ECharts owned all the data. In v10.0, ECharts may own only the chrome (axes, tooltip) while WebGPU owns the data rendering. But ECharts still has an internal series with `appendData`-loaded data for tooltip hit-testing and coordinate transforms. A `setOption` call without explicit series data resets that internal series.

**How to avoid:**
The `_applyThemeUpdate()` path must be aware of streaming mode. When `_streamingMode === 'appendData'` and WebGPU is active, the theme update must NOT call `setOption` on the ECharts series. Instead, only the non-series options (color palette, axis line colors, label styles) should be updated via `setOption` with explicit `replaceMerge: []` to prevent series data merge behavior:

```typescript
private _applyThemeUpdate(): void {
  if (!this._chart) return;
  const update = this._themeBridge.buildColorUpdate();
  // CRITICAL-03 guard: if appendData is active, use replaceMerge to prevent
  // series data wipeout. 'series' is not in replaceMerge, so series data is preserved.
  const mergeOpts = this._streamingMode === 'appendData'
    ? { replaceMerge: ['color'] }
    : undefined;
  this._chart.setOption(update, mergeOpts as object);
}
```

**Warning signs:**
- Axes and tooltip disappear momentarily on dark mode toggle during streaming
- After dark/light toggle, chart requires a pushData call to restore axis visibility
- ECharts internal series shows zero data after theme update despite active streaming

**Phase to address:** Phase 1 (WebGPU renderer + streaming integration) — the theme update path must be reviewed as part of the streaming/WebGPU integration, not treated as unchanged from v9.0.

---

### HIGH-06: WebGPU Canvas Not Resized in Sync With ECharts Canvas on ResizeObserver

**What goes wrong:**
The existing `ResizeObserver` in `BaseChartElement` calls `this._chart.resize()` when the container changes size. This correctly resizes the ECharts canvas. The WebGPU canvas (a separate `<canvas>` element) is positioned `inset: 0` via CSS, so its CSS size updates automatically — but its `canvas.width` and `canvas.height` attributes (which control the actual render resolution) are not updated. WebGPU renders at the old resolution and scales up/down to fill the new CSS size, producing blurry or distorted points. After resize, the coordinate transform between ECharts and WebGPU diverges (see CRITICAL-04).

**Why it happens:**
CSS `position: absolute; inset: 0` automatically resizes the CSS layout box but does not update `canvas.width`/`canvas.height`. WebGPU renders to the resolution specified by these attributes — they must be manually set when the container size changes. This is a well-known canvas pitfall that applies to WebGL and WebGPU alike.

**How to avoid:**
Extend the `ResizeObserver` callback to also resize the WebGPU canvas:

```typescript
this._resizeObserver = new ResizeObserver(() => {
  this._chart?.resize(); // ECharts canvas
  this._resizeWebGPUCanvas(); // WebGPU canvas
  this._syncWebGPUTransform(); // Re-sync coordinate transform (CRITICAL-04)
});

private _resizeWebGPUCanvas(): void {
  if (!this._webgpuCanvas || !this._gpuContext) return;
  const dpr = window.devicePixelRatio ?? 1;
  const w = this._webgpuCanvas.clientWidth * dpr;
  const h = this._webgpuCanvas.clientHeight * dpr;
  this._webgpuCanvas.width = w;
  this._webgpuCanvas.height = h;
  this._gpuContext.configure({
    device: this._gpuDevice!,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: 'premultiplied',
  });
}
```

Note: `configure()` must be called again after resizing because the swap chain format may need to be re-established. This is a WebGPU-specific requirement that has no WebGL equivalent.

**Warning signs:**
- WebGPU layer appears blurry or blocky after browser window resize
- ECharts layer is sharp after resize, WebGPU layer is not
- High-DPR displays (Retina) show consistently lower-resolution WebGPU layer
- Coordinate sync works at initial render but breaks after resize

**Phase to address:** Phase 1 (WebGPU renderer) — WebGPU canvas resize must be built into the ResizeObserver callback alongside the existing ECharts resize.

---

## Medium-Severity Pitfalls

Mistakes that cause technical debt, DX problems, or non-obvious bugs.

---

### MEDIUM-01: EMA Seed Value Recomputed From Scratch on Every `_flushBarUpdates` Call

**What goes wrong:**
`_computeEMA` in `candlestick-option-builder.ts` is called on every `_flushBarUpdates()` invocation with the full `_ohlcBuffer` array. For a 1000-point buffer with a 20-period EMA, this is O(N) computation every RAF frame (~16ms budget). At flush rates near 60fps with rapid data ingestion, this EMA recomputation alone can consume 2–3ms per frame. With multiple EMA overlays (e.g., EMA9, EMA21, EMA50), the cost multiplies. At 500K points (the intended candlestick buffer size for streaming), this becomes visibly expensive.

**Why it happens:**
The current implementation is stateless and pure — correct for static rendering, but not optimal for streaming. Each full recomputation discards the previous EMA state and recalculates from the seed.

**How to avoid:**
Cache the last computed EMA value for each period and apply the incremental formula for new points only:

```typescript
// Incremental EMA: only compute for new bars since last flush
// ema[i] = close[i] * k + ema[i-1] * (1 - k)
// Store: this._emaState: Map<period, { lastEma: number, lastIndex: number }>
```

This reduces EMA update cost from O(N) to O(new_bars_since_last_flush) — typically 1–5 bars per RAF frame.

**Warning signs:**
- Candlestick chart FPS drops with multiple MA overlays enabled
- Chrome DevTools flame chart shows `_computeEMA` taking > 1ms per frame
- Adding each additional MA period linearly increases frame time

**Phase to address:** Phase 2 (moving average overlay) — build incremental EMA from the start; retrofitting requires interface changes to the option builder.

---

### MEDIUM-02: DataView vs Float32Array — Wrong Type for Interleaved Vertex Data

**What goes wrong:**
A `DataView` is used to write interleaved vertex data (x, y, timestamp, value) to a WebGPU buffer because `DataView` allows mixed types. At 1M points with a 4-float-per-vertex layout (16 bytes/vertex = 16MB), writing via `DataView.setFloat32()` is 5–10× slower than writing the same data as a `Float32Array` view over the same `ArrayBuffer`. The buffer upload takes 80–120ms instead of 8–12ms, causing a visible frame stall during stream initialization.

**Why it happens:**
`DataView` is the natural choice when dealing with heterogeneous data (mixed int/float), and many WebGPU tutorial examples use it for clarity. The performance difference is not obvious from reading the code.

**How to avoid:**
For homogeneous float vertex data (which covers 95% of chart data shapes), use a `Float32Array` directly:

```typescript
// Preferred: Float32Array for homogeneous float vertex data
const vertices = new Float32Array(pointCount * 2); // x, y pairs
for (let i = 0; i < pointCount; i++) {
  vertices[i * 2] = xValues[i];
  vertices[i * 2 + 1] = yValues[i];
}
device.queue.writeBuffer(vertexBuffer, 0, vertices);

// Use DataView only when mixing float32 and uint32 in the same struct
// (e.g., RGBA packed into uint32 alongside float positions)
```

For timestamp data specifically: timestamps in Unix milliseconds exceed the safe range of `Float32Array` (max ~16.7M, but timestamps are ~1.7T). Use `Float64Array` for timestamps or normalize to `Float32Array` offsets from a base epoch.

**Warning signs:**
- Buffer upload in DevTools shows unexpectedly high CPU time
- `DataView.setFloat32` visible in flame chart at vertex upload time
- Initial render takes 2–3 render frames instead of 1

**Phase to address:** Phase 1 (WebGPU renderer) — the vertex format decision drives the buffer upload architecture.

---

### MEDIUM-03: Safari WebGPU Device Loss on Specific Pipeline Configurations

**What goes wrong:**
A render pipeline that works correctly in Chrome and Firefox causes an immediate device loss (`destroyed` reason) on Safari 26. The error surfaces as `device.lost` resolving with no validation message — Safari's WebGPU backend triggers an internal assertion without reporting which pipeline configuration caused the failure. The chart falls back to ECharts canvas correctly (per HIGH-01), but the WebGPU path is effectively unusable on Safari for that configuration.

**Why it happens:**
As of Safari 26 beta (March 2026), there are known bugs in Safari's WebGPU backend where specific bind group layouts or render pass configurations trigger internal failures (see imgui WebGPU issue #9103). Safari's implementation is newer and less battle-tested than Chrome's Dawn-based implementation. Some features that are spec-compliant and Chrome-working are not yet stable in Safari's backend.

**How to avoid:**
Keep WebGPU pipeline configurations conservative for the initial implementation:
- Use only `f32` (not `f16`) in shaders — `shader-f16` is an optional feature that Safari may not support
- Avoid depth/stencil attachments unless explicitly needed (chart overlays don't need them)
- Request only `requiredFeatures: []` (baseline features) at `requestDevice()` time
- Test the `device.lost` recovery path explicitly against Safari 26 by simulating loss in Chrome DevTools, as Safari provides no debug message

Document Safari 26 as "beta-supported" (not stable) in the component API until Safari's implementation matures.

**Warning signs:**
- Chart works in Chrome but shows blank WebGPU canvas in Safari
- `device.lost` resolves with `reason: 'destroyed'` on Safari immediately after init
- No validation error in Safari console (Safari suppresses the message)
- Same shader/pipeline works in Chrome and Firefox but not Safari

**Phase to address:** Phase 1 (WebGPU renderer) — Safari compatibility testing should be part of the initial renderer implementation, not a post-launch discovery.

---

### MEDIUM-04: Moving Average NaN Propagation Silently Breaks Chart Legend

**What goes wrong:**
The MA series in `candlestick-option-builder.ts` returns `null` (not `NaN`) for warm-up indices — this is correct, as ECharts renders `null` as a gap in line series. However, if input data contains `NaN` values (e.g., a missing close price in a partial streaming bar), `_computeSMA` propagates `NaN` through the sliding window: `NaN + validValue = NaN`, so the entire window starting from the first `NaN` close produces `NaN` MA values. ECharts renders `NaN` differently from `null` — depending on ECharts version, `NaN` may render as a line connecting to zero, or as a gap, or cause the legend tooltip to display "NaN" instead of a number.

**Why it happens:**
`_computeSMA` uses `slice.reduce((sum, v) => sum + v, 0) / period`. If any value in the slice is `NaN`, the sum becomes `NaN` and propagates. Streaming data may contain `NaN` when a bar is partially formed (close price not yet available) or when upstream data has missing values.

**How to avoid:**
Filter `NaN` explicitly in the MA computation and treat it as a gap:

```typescript
function _computeSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    const slice = closes.slice(i - period + 1, i + 1);
    const valid = slice.filter(v => !isNaN(v) && isFinite(v));
    if (valid.length < period) return null; // insufficient valid values
    return valid.reduce((sum, v) => sum + v, 0) / period;
  });
}
```

For EMA: if the seed SMA computation encounters a `NaN` close, the entire EMA for that period should return `null` until a clean window is established.

**Warning signs:**
- MA legend tooltip shows "NaN" instead of a numeric value
- MA line drops to zero briefly then recovers after a bad data point
- Chart displays correctly with clean data but breaks when data has gaps or missing prices

**Phase to address:** Phase 2 (moving average overlay) — NaN handling must be part of the initial MA implementation; it is not obvious from static test data.

---

## Performance Traps

Patterns that work at small scale but fail as data grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Plain `number[]` ring buffer for 1M+ points | GC pauses 200–500ms every 60–120s | Pre-allocate `Float32Array`/`Float64Array` at `maxPoints` capacity | > 100K points in buffer |
| Calling `_computeSMA`/`_computeEMA` on full buffer per RAF | MA computation takes > 1ms per frame; multiplies with number of MA overlays | Incremental EMA with cached state; only compute new bars | > 10K bars in buffer with multiple MA periods |
| `appendData` with no truncation strategy | Heap grows to 1–2GB+ after 20–30 minutes of 1000pts/sec streaming | Periodic clear+reset cycle at `maxPoints` boundary (CRITICAL-05) | > 300K accumulated points via appendData |
| WebGPU buffer uploaded per `pushData` call | GPU stall on buffer write each point | Batch writes in RAF flush; write typed array once per frame | > 100 pushData calls/sec |
| ECharts and WebGPU coordinate sync only at init | Misalignment after DataZoom pan/zoom; permanent divergence after resize | Sync on every `rendered`, `dataZoom`, and `ResizeObserver` event | First pan/zoom interaction |
| `DataView` for homogeneous float vertex data | Buffer upload 5–10× slower than `Float32Array` | Use `Float32Array` directly for float-only vertex data | > 10K vertices uploaded per frame |
| Shader compilation blocking first render | Visible stall on chart first show | Compile pipelines eagerly in `_initWebGPU` before first data arrives | Every initial page load with WebGPU |

---

## Integration Gotchas

Common mistakes when adding these features to the existing system.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `navigator.gpu` in Lit SSR | Referencing `navigator.gpu` outside `isServer` guard | Wrap all WebGPU access in `isServer` guard, initialize only in `firstUpdated()` |
| GPUAdapter recovery | Reusing `this._gpuAdapter` after device loss | Always call `navigator.gpu.requestAdapter()` fresh; never store adapter past `requestDevice()` |
| ECharts + WebGPU dual-canvas | Using same `<canvas>` for both contexts | Two separate canvas elements; WebGPU below (`z-index: 0`), ECharts above (`z-index: 1`) |
| DataZoom coordinate sync | Computing WebGPU transform once at init | Re-read ECharts `convertToPixel()` on every `dataZoom` and `rendered` event |
| appendData + dark mode toggle | `_applyThemeUpdate()` `setOption` call wiping appendData stream data | Use `replaceMerge` to prevent series data merge on theme-only `setOption` calls |
| ResizeObserver + WebGPU canvas | CSS resize updates layout but not `canvas.width`/`canvas.height` | Manually update WebGPU canvas attributes in ResizeObserver; call `configure()` again after resize |
| Moving average on ring buffer | Recomputing full MA from buffer snapshot | Carry warm-up seed values across truncation boundaries; use incremental EMA state |
| ECharts appendData unbounded | Assuming appendData respects `maxPoints` | Manage truncation externally: periodic `chart.clear()` + `setOption` + re-append from ring buffer |

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip WebGPU canvas resize handling | Simpler initial implementation | Blurry WebGPU layer on resize; coordinate mismatch after resize | Never — resize is a day-1 user action |
| Plain JS array for streaming ring buffer | Less code; familiar pattern | GC pauses at 1M points; tab crash at 1M+ points | Never for 1M-point streaming target |
| Full `_computeEMA` recalculation per flush | Stateless, easy to test | O(N) CPU per frame; chart drops below 60fps with large buffers | Only for initial MA proof-of-concept, must be fixed before shipping |
| Skip `device.lost` handler | Simpler initial code | Silent chart freeze on GPU process crash; no recovery path | Never — device loss is a real user scenario |
| Ignore `requestAdapter()` returning `null` | No additional error handling | Unhandled rejection crash when GPU is unavailable | Never — null return is a documented, real outcome |
| Use `setOption` to pass coordinate hints to WebGPU | Avoids custom state management | Triggers CRITICAL-05 (appendData wipeout) if streaming is active | Never while streaming is active |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **WebGPU renderer:** Verify it falls back to ECharts canvas silently on Safari iOS 25, Firefox Linux, and Chrome with `--disable-gpu` flag.
- [ ] **WebGPU renderer:** Verify `device.lost` handler fires during recovery and a new adapter+device is requested (not reused), and the ECharts canvas fallback is activated if recovery fails.
- [ ] **1M+ streaming:** Verify the tab's heap size plateaus after 10 minutes of 1000 pts/sec streaming — it must not grow continuously.
- [ ] **1M+ streaming:** Verify the GC profile shows no individual GC pause > 50ms during streaming (indicates GC is scanning boxed JS objects, not typed arrays).
- [ ] **Moving average:** Verify MA line output is identical whether computed in one batch or in two halves (stream truncation continuity test).
- [ ] **Moving average:** Verify `NaN` in the close price does not produce `NaN` in the MA series (input validation test).
- [ ] **Coordinate sync:** Verify WebGPU points align with ECharts axis ticks after zoom-in, zoom-out, and pan (not just at initial zoom level).
- [ ] **Coordinate sync:** Verify alignment is correct on Retina/HiDPI displays (DPR != 1).
- [ ] **SSR guard:** Verify `npm run build` for the Next.js App Router example passes without `navigator is not defined` or `Cannot read properties of undefined (reading 'gpu')` after adding any v10.0 component.
- [ ] **Theme update:** Verify dark mode toggle during active streaming does not clear the ECharts axis/DataZoom state.
- [ ] **Canvas z-index:** Verify the ECharts tooltip fires correctly when the WebGPU canvas is in the stacking order below ECharts (pointer-events must not be blocked).

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CRITICAL-01: SSR crash from navigator.gpu | LOW | Add `isServer` guard before navigator.gpu reference; move to `firstUpdated()`. Redeploy. |
| CRITICAL-02: Consumed GPUAdapter on recovery | LOW | Remove `this._gpuAdapter` field; call `requestAdapter()` inline on each init/recovery. |
| CRITICAL-03: Dual-canvas context conflict | HIGH | Refactor shadow root template to two separate canvas elements; update all WebGPU+ECharts init code. Requires re-testing full coordinate sync. |
| CRITICAL-04: Coordinate mismatch | MEDIUM | Add `convertToPixel()` sync on `dataZoom` and `rendered` events; audit DPR handling in both layers. |
| CRITICAL-05: appendData heap growth | HIGH | Add external truncation cycle (clear + setOption + re-append at maxPoints); add typed array ring buffer. Requires redesign of streaming data path. |
| HIGH-02: `await device.lost` blocking | LOW | Replace `await device.lost` with `.then()` callback. Easy fix but requires verifying recovery path. |
| HIGH-03: Plain JS array GC pauses | MEDIUM | Refactor ring buffer from `number[]` to pre-allocated `Float32Array`/`Float64Array`. Requires updating all write and read paths. |
| HIGH-04: Moving average off-by-one on truncation | MEDIUM | Add seed-carry state to MA computation; add truncation continuity unit test. |
| HIGH-05: Theme update wipes stream data | LOW | Add `replaceMerge` option to `_applyThemeUpdate()` when `_streamingMode === 'appendData'`. |
| HIGH-06: WebGPU canvas not resized | LOW | Extend ResizeObserver callback with canvas attribute update and `configure()` call. |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CRITICAL-01: SSR crash navigator.gpu | Phase 1 (WebGPU renderer) | CI: Next.js App Router build must pass with v10.0 chart component imported |
| CRITICAL-02: Consumed GPUAdapter | Phase 1 (WebGPU renderer) | Manual test: DevTools WebGPU device loss simulation; verify clean recovery |
| CRITICAL-03: Dual-canvas context conflict | Phase 1 (WebGPU renderer) | Visual test: both layers render simultaneously with no `getContext` error |
| CRITICAL-04: Coordinate mismatch | Phase 1 (WebGPU renderer) | Visual test: data points align with axis ticks at 3 zoom levels + after pan |
| CRITICAL-05: appendData heap growth | Phase 1 (1M+ streaming) | Memory test: 10-minute stream at 1000 pts/sec, verify heap plateaus |
| HIGH-01: WebGPU fallback chain | Phase 1 (WebGPU renderer) | Test: disable WebGPU in Chrome flags, verify ECharts canvas renders |
| HIGH-02: device.lost await pattern | Phase 1 (WebGPU renderer) | Code review: search for `await device.lost` — must not appear anywhere |
| HIGH-03: Plain JS array GC pauses | Phase 1 (1M+ streaming) | GC profile: no pause > 50ms after 5 minutes of 1000 pts/sec streaming |
| HIGH-04: Moving average off-by-one | Phase 2 (MA overlay) | Unit test: MA(20) on 2000 pts in 2 batches of 1000 matches MA(20) on full 2000 pts |
| HIGH-05: Theme update wipes stream | Phase 1 (WebGPU renderer + streaming integration) | Manual: toggle dark mode during active streaming; verify axes remain |
| HIGH-06: WebGPU canvas resize | Phase 1 (WebGPU renderer) | Test: resize browser window during streaming; verify WebGPU layer remains sharp |
| MEDIUM-01: O(N) EMA per flush | Phase 2 (MA overlay) | Performance: measure `_computeEMA` call duration with 10K bar buffer + 3 MA overlays |
| MEDIUM-02: DataView vs Float32Array | Phase 1 (WebGPU renderer) | Code review: vertex buffer writes must use typed array views, not DataView |
| MEDIUM-03: Safari pipeline device loss | Phase 1 (WebGPU renderer) | Test on Safari 26 beta; verify graceful canvas fallback with no uncaught rejection |
| MEDIUM-04: NaN in MA computation | Phase 2 (MA overlay) | Unit test: `_computeSMA` with NaN input returns null, not NaN, for affected window |

---

## Sources

- [gpuweb/gpuweb Implementation Status Wiki](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) — WebGPU browser support matrix, March 2026
- [MDN — GPUDevice.lost](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/lost) — device loss promise API and GPUDeviceLostInfo
- [toji.dev — WebGPU Device Loss Best Practices](https://toji.dev/webgpu-best-practices/device-loss.html) — authoritative recovery patterns, adapter consumption behavior
- [gpuweb/gpuweb — Error Handling Design](https://github.com/gpuweb/gpuweb/blob/main/design/ErrorHandling.md) — spec-level error handling design
- [MDN — GPUCanvasContext](https://developer.mozilla.org/en-US/docs/Web/API/GPUCanvasContext) — one-context-per-canvas rule, configure() requirements
- [gpuweb/gpuweb — Coordinate Systems Issue #416](https://github.com/gpuweb/gpuweb/issues/416) — Y-axis orientation and NDC handedness
- [Apache ECharts GitHub Issue #12327](https://github.com/apache/echarts/issues/12327) — setOption clears appendData data
- [Apache ECharts GitHub Issue #20751](https://github.com/apache/echarts/issues/20751) — memory leak in ECharts 5.6 (filed Feb 2025)
- [MDN — TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) — ArrayBuffer memory model, GC characteristics
- [web.dev — WebGPU Supported in Major Browsers](https://web.dev/blog/webgpu-supported-major-browsers) — browser support announcement
- [ocornut/imgui Issue #9103](https://github.com/ocornut/imgui/issues/9103) — Safari 26 WebGPU device lost bug on specific render passes
- [Lit SSR Server Usage](https://lit.dev/docs/ssr/server-usage/) — isServer guard patterns
- [MDN — Optimizing Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) — multi-canvas layering with z-index
- [MQL5 — Ring Buffer for Sliding Window MA](https://www.mql5.com/en/articles/3047) — ring buffer implementation for streaming MA
- [esphome/issues #2119](https://github.com/esphome/issues/issues/2119) — NaN propagation in sliding window filters

---
*Pitfalls research for: WebGPU rendering path, 1M+ streaming, and moving average overlay added to existing @lit-ui/charts (v10.0 WebGPU Charts milestone)*
*Researched: 2026-03-01*
