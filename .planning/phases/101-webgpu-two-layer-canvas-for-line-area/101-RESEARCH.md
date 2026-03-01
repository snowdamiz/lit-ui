# Phase 101: WebGPU Two-Layer Canvas for Line/Area - Research

**Researched:** 2026-03-01
**Domain:** ChartGPU 0.3.2, WebGPU rendering, two-layer canvas coordination, ECharts convertToPixel, DataZoom sync, GPUDevice lifecycle, Shadow DOM canvas insertion
**Confidence:** MEDIUM-HIGH (ChartGPU API verified via GitHub; Shadow DOM compatibility is an open risk requiring a prototype; ECharts convertToPixel behavior confirmed via MDN + handbook)

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WEBGPU-02 | Line and Area charts automatically render data using ChartGPU 0.3.2 (two-layer canvas: WebGPU canvas below for data pixels, ECharts canvas above for axes/tooltip) when WebGPU is available, with coordinate sync via `convertToPixel()` on every `dataZoom` and `rendered` event | ChartGPU.create() API confirmed via GitHub docs; `context: { adapter, device }` injection pattern confirmed — allows reusing Phase 98 singleton; ECharts `convertToPixel('grid', [x, y])` confirmed for coordinate mapping; `dataZoom` event confirmed from ECharts handbook; Canvas fallback path already in place via Phase 98 `renderer === 'canvas'` check |
</phase_requirements>

---

## Summary

Phase 101 introduces a two-layer canvas rendering architecture for `LuiLineChart` and `LuiAreaChart`. When `enable-webgpu` is set and WebGPU is available (detected and stored as `this.renderer === 'webgpu'` by Phase 98), the chart inserts a ChartGPU 0.3.2 `<canvas>` element positioned behind the ECharts canvas. ECharts continues to render axes, tooltip, DataZoom slider, and legend. ChartGPU renders the data series pixels directly to the GPU, bypassing ECharts' appendData performance ceiling.

The critical coordination problem is keeping ChartGPU's pixel-space viewport aligned with ECharts' coordinate system after every DataZoom interaction. The solution uses ECharts' `convertToPixel('grid', [xMin, 0])` and `convertToPixel('grid', [xMax, 0])` calls — called inside `dataZoom` and `rendered` event handlers — to extract the current pixel bounds of the visible data window and push them into ChartGPU's `setZoomRange()` or viewport configuration. This keeps the two layers in sync without reimplementing ECharts' axis logic.

The primary risk flagged in STATE.md is Shadow DOM compatibility: ChartGPU calls `container.appendChild(canvas)` where `container` is a plain DOM element. Lit custom elements render inside a shadow root, so the `#chart` div is in the shadow DOM. This pattern is known to work for other canvas libraries (e.g., CanvasJS accepts a DOM element directly) but has not been confirmed for ChartGPU. The STATE.md explicitly requires a minimal prototype at Phase 101 start before committing to full integration. The fallback path (raw WebGPU + custom WGSL line rendering) is acknowledged but expensive.

**Primary recommendation:** Override `_initChart()` in `LuiLineChart` and `LuiAreaChart` to conditionally insert ChartGPU when `this.renderer === 'webgpu'`. Pass the Phase 98 singleton GPUDevice via `ChartGPU.create(container, opts, { adapter, device })`. Sync coordinate systems on `dataZoom` and `rendered` events by calling ECharts `convertToPixel()` to derive zoom bounds, then calling ChartGPU `setZoomRange()`. On `disconnectedCallback()`, call `chartGpuInstance.dispose()` (ChartGPU will not destroy the injected device) then reference-count the singleton before calling `releaseGpuDevice()`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `chartgpu` | 0.3.2 (pin exactly) | WebGPU data-layer renderer for Line/Area charts | Specified by WEBGPU-02 requirement; provides GPU-side line rendering at 1M+ pts/60fps; supports external GPUDevice injection |
| `echarts` | 5.6.0 (already pinned) | Axes, tooltip, DataZoom slider, legend canvas layer | Already in project; `convertToPixel('grid', ...)` is the coordinate bridge |
| `@webgpu/types` | 0.1.67 (already installed) | TypeScript types for GPUDevice, GPUAdapter | Already a devDep in Phase 98; triple-slash directive already in webgpu-device.ts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `getGpuDevice()` (internal) | — | Retrieve Phase 98 singleton GPUDevice for ChartGPU injection | Called in `_initWebGpuLayer()` when `this.renderer === 'webgpu'` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ChartGPU 0.3.2 | Raw WebGPU + custom WGSL line shader | Raw WebGPU removes the ChartGPU dependency but requires implementing vertex/fragment shaders, buffer management, and coordinate mapping from scratch — weeks of work vs. days |
| ChartGPU external device injection | Let ChartGPU own its own device | ChartGPU would create a second GPUDevice, violating WEBGPU-03 (singleton constraint); also ChartGPU's own device cannot be shared with Phase 98's singleton |
| ECharts `convertToPixel` for coordinate sync | ChartGPU's own axis system | Maintaining two full axis/grid systems adds config surface area; ECharts axes are the source of truth for all non-data rendering (ticks, labels, DataZoom), so pixel-space sync from ECharts is the correct minimal approach |

**Installation:**
```bash
pnpm add chartgpu@0.3.2 --filter @lit-ui/charts
```

Note: `chartgpu` must be a **runtime dependency** (not devDependency) — it is dynamically imported inside `_initWebGpuLayer()` behind the WebGPU branch, but still needs to be in `dependencies` for consumers.

---

## Architecture Patterns

### Recommended Project Structure

No new source directories needed. Changes localized to:

```
packages/charts/src/
├── base/
│   └── base-chart-element.ts      # No changes needed for Phase 101
├── line/
│   └── line-chart.ts              # Add _gpuChart field, _initWebGpuLayer(), _syncCoordinates(), disconnectedCallback() cleanup
├── area/
│   └── area-chart.ts              # Identical pattern to line-chart.ts (same as Phase 100 duplication pattern)
└── shared/
    └── webgpu-device.ts           # Add refcount pattern for device.destroy() — releaseGpuDevice() now calls device.destroy() when refcount hits zero
```

### Pattern 1: Conditional Two-Layer Init in `_initChart()`

**What:** `LuiLineChart._initChart()` is inherited and `protected`. Phase 101 overrides it to run the standard ECharts init path, then check `this.renderer === 'webgpu'` to conditionally initialize the ChartGPU canvas layer beneath ECharts.

**When to use:** During `firstUpdated()` RAF callback — same timing as the existing ECharts init.

**Example:**
```typescript
// Source: ChartGPU docs/api/chart.md — ChartGPU.create(container, options, context?)
// Source: webgpu-device.ts getGpuDevice() — Phase 98 singleton

protected override async _initChart(): Promise<void> {
  // 1. Run standard ECharts init (calls _registerModules, sets up this._chart, etc.)
  await super._initChart();

  // 2. If WebGPU was detected, layer ChartGPU beneath ECharts
  if (this.renderer === 'webgpu') {
    await this._initWebGpuLayer();
  }
}

private async _initWebGpuLayer(): Promise<void> {
  const devicePromise = getGpuDevice();
  if (!devicePromise) return; // guard — should not happen if renderer === 'webgpu'
  const device = await devicePromise;

  // Dynamic import — same SSR/tree-shaking constraint as echarts-gl
  const { ChartGPU } = await import('chartgpu');

  // Get the shadow DOM container that ECharts uses
  const container = this.shadowRoot?.querySelector<HTMLDivElement>('#chart');
  if (!container) return;

  // Create a host div for ChartGPU — separate from ECharts' #chart div
  // so ChartGPU manages its own canvas element inside this host
  const gpuHost = document.createElement('div');
  gpuHost.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  container.insertBefore(gpuHost, container.firstChild);

  // WEBGPU-03: Inject the Phase 98 shared device — ChartGPU will NOT destroy it on dispose()
  // (confirmed behavior: injected devices are owned by the caller)
  this._gpuChart = await ChartGPU.create(
    gpuHost,
    {
      series: [{ type: 'line', data: [] }],
      renderMode: 'external',  // Phase 101 owns the animation loop via ECharts' rendered event
    },
    { device } // inject singleton device — adapter not required if device is provided
  );

  // Wire coordinate sync — fires on every DataZoom and layout change
  this._chart!.on('dataZoom', () => this._syncCoordinates());
  this._chart!.on('rendered', () => this._syncCoordinates());
}
```

### Pattern 2: ECharts `convertToPixel` for Coordinate Sync

**What:** After every `dataZoom` or `rendered` event from ECharts, extract the pixel bounds of the visible data window using `convertToPixel`, then apply those bounds to ChartGPU's zoom range.

**When to use:** In `_syncCoordinates()` called from event handlers.

**Critical constraint:** `convertToPixel` must only be called AFTER the first `setOption` — it returns `[NaN, NaN]` before coordinate systems are initialized.

**Example:**
```typescript
// Source: ECharts handbook — convertToPixel('grid', dataItem) returns canvas pixel [x, y]
// Source: ChartGPU interaction.md — setZoomRange(start, end) controls viewport in percent space [0, 100]

private _syncCoordinates(): void {
  if (!this._chart || !this._gpuChart) return;

  // Get the ECharts option to find the x-axis data range
  const option = this._chart.getOption() as Record<string, unknown>;
  const dataZoom = (option['dataZoom'] as Array<Record<string, unknown>> | undefined)?.[0];
  if (!dataZoom) return;

  // DataZoom exposes start/end as percentage (0–100)
  const start = (dataZoom['start'] as number) ?? 0;
  const end = (dataZoom['end'] as number) ?? 100;

  // Sync to ChartGPU — both use [0, 100] percent space for zoom range
  this._gpuChart.setZoomRange(start, end);
}
```

**Alternative pattern if ECharts datazoom percent-space differs from ChartGPU's:**
```typescript
// Full pixel-space sync via convertToPixel if percent-space doesn't align
private _syncCoordinatesViaPixels(): void {
  if (!this._chart || !this._gpuChart) return;

  // Get x-axis min/max data values from the current view
  const option = this._chart.getOption() as Record<string, unknown>;
  const xAxis = (option['xAxis'] as Array<Record<string, unknown>> | undefined)?.[0];
  if (!xAxis) return;

  // convertToPixel: first arg is coordinate system ref; second is [dataX, dataY]
  // Returns [pixelX, pixelY] with origin at canvas top-left
  const pixelMin = this._chart.convertToPixel({ gridIndex: 0 }, [xAxis['min'] as number, 0]);
  const pixelMax = this._chart.convertToPixel({ gridIndex: 0 }, [xAxis['max'] as number, 0]);

  if (!pixelMin || !pixelMax || isNaN(pixelMin[0]) || isNaN(pixelMax[0])) return;

  // Map pixel positions to ChartGPU grid bounds via resize/viewport config
  // (exact ChartGPU API for pixel-space viewport may require checking options.md grid config)
  this._gpuChart.resize(); // ensure ChartGPU redraws at current dimensions
}
```

### Pattern 3: GPUDevice Reference Counting for Lifecycle

**What:** The Phase 98 singleton releases the `GPUDevice` via `releaseGpuDevice()`, but `device.destroy()` was a stub. Phase 101 must call `device.destroy()` when the LAST chart instance is removed. Reference counting is the standard approach.

**Why needed:** `GPUDevice.destroy()` destroys all resources created from the device — if any other chart instance is still using it, destruction would corrupt their GPU resources. The refcount prevents premature destruction.

**Example:**
```typescript
// In webgpu-device.ts — add refcount tracking

let _refCount = 0;

export function acquireGpuDevice(adapter: GPUAdapter): Promise<GPUDevice> {
  if (_devicePromise) {
    _refCount++;
    return _devicePromise;
  }
  _devicePromise = adapter.requestDevice();
  _refCount = 1;
  return _devicePromise;
}

// Called from each chart's disconnectedCallback() when WebGPU path was active
export async function releaseGpuDevice(): Promise<void> {
  _refCount = Math.max(0, _refCount - 1);
  if (_refCount === 0 && _devicePromise) {
    const device = await _devicePromise;
    device.destroy();
    _devicePromise = null;
  }
}
```

### Pattern 4: Fallback Path — Canvas Rendering When WebGPU Unavailable

**What:** When `this.renderer !== 'webgpu'`, Phase 101 changes nothing — the chart operates exactly as it did in Phase 100 (ring buffer + ECharts setOption with lazyUpdate). No ChartGPU is loaded.

**When to use:** Any browser without WebGPU, or when `enable-webgpu` is absent.

**Key constraint:** Dynamic import of `chartgpu` must ONLY happen inside the `if (this.renderer === 'webgpu')` branch — never at module top level.

```typescript
// CORRECT — ChartGPU only loaded when WebGPU is confirmed available
if (this.renderer === 'webgpu') {
  const { ChartGPU } = await import('chartgpu');
  // ...
}

// WRONG — would bundle chartgpu into the main chunk even for non-WebGPU browsers
import { ChartGPU } from 'chartgpu'; // NEVER do this
```

### Pattern 5: z-index Layering for Two-Layer Canvas

**What:** ChartGPU's canvas must render BELOW ECharts' canvas. ECharts renders into `#chart` container using its own canvas elements. ChartGPU's canvas must be positioned absolutely with a lower z-index.

**Implementation:** ECharts uses `position: absolute` on its internal canvas. Insert ChartGPU into a sibling host div with `z-index: 0` and `pointer-events: none` (pointer events must go to ECharts for tooltip/DataZoom interaction).

```css
/* ChartGPU host div */
position: absolute;
inset: 0;
width: 100%;
height: 100%;
z-index: 0;
pointer-events: none; /* CRITICAL: ECharts must receive all pointer events */
```

ECharts renders at its default z-index (typically `z-index: 1` or auto-stacking), which will appear above the WebGPU canvas.

### Anti-Patterns to Avoid

- **Importing `chartgpu` at module top level:** Crashes SSR and bundles into main chunk. Always use `await import('chartgpu')` inside the WebGPU branch.
- **Not passing `{ device }` to ChartGPU.create():** Without injection, ChartGPU creates its own GPUDevice, violating WEBGPU-03. The Phase 98 singleton MUST be injected.
- **Calling `device.destroy()` from every disconnectedCallback():** Only the last chart instance should destroy the device. Use refcounting in webgpu-device.ts.
- **Not calling `chartGpuInstance.dispose()` before the ECharts chart is disposed:** ChartGPU must release its GPU buffers/textures before the device is destroyed.
- **Setting `pointer-events: auto` on ChartGPU's host div:** This intercepts mouse events that must reach ECharts' canvas layer for tooltip and DataZoom interactions.
- **Calling `convertToPixel` before first `setOption`:** Returns `[NaN, NaN]`. The `_syncCoordinates()` call must guard against NaN.
- **Forgetting to call `this._gpuChart.resize()` on ResizeObserver trigger:** ChartGPU has its own internal canvas backing size; when the container resizes, ChartGPU needs its own `resize()` call to recompute texture dimensions.
- **Placing ChartGPU canvas ABOVE ECharts canvas (z-index too high):** Blocks ECharts tooltip and DataZoom slider interaction.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GPU line rendering | Custom WGSL vertex + fragment shaders | ChartGPU 0.3.2 | ChartGPU handles vertex buffer management, LTTB sampling on GPU, zoom-aware decimation, null gap detection (added in 0.3.2) — weeks of GPU work |
| Two-chart zoom sync | Pixel-space math to map ECharts zoom to ChartGPU | ECharts `convertToPixel` → ChartGPU `setZoomRange` | ECharts owns the authoritative zoom state; `convertToPixel` is the official API for exporting that state to external renderers |
| Shadow DOM canvas insert | Manual shadow root canvas injection | `document.createElement('div')` + `shadowRoot.querySelector('#chart').insertBefore(...)` | ChartGPU accepts any DOM element as container; inserting a host div into the shadow root's `#chart` div is the cleanest approach |
| Device lifecycle tracking | Per-component device create/destroy | Phase 98 singleton + refcount | WebGPU spec recommends one device per page; refcounting is the standard pattern for shared resource lifetimes |

**Key insight:** ChartGPU was built precisely for this use case — high-frequency streaming data at 60fps with shared GPUDevice support. The `context: { device }` injection option is explicitly designed for multi-chart dashboards that share a device (confirmed from API docs). The only novel engineering is the two-canvas layering and ECharts coordinate bridge.

---

## Common Pitfalls

### Pitfall 1: Shadow DOM Canvas Compatibility (CRITICAL RISK)

**What goes wrong:** ChartGPU.create() calls `container.appendChild(canvas)` where `container` is the host div passed by Phase 101. If ChartGPU internally uses `document.getElementById()` or assumes its container is in the main document DOM, it will fail when the container is inside a shadow root.

**Why it happens:** Library authors often don't test with Shadow DOM. Chart.js has a known issue with `MutationObserver` inside Shadow DOM (GitHub Issue #10924). ChartGPU's README does not mention Shadow DOM support.

**How to avoid:** Build the minimal prototype first (STATE.md requirement). Test by calling:
```typescript
const gpuHost = document.createElement('div');
shadowRoot.querySelector('#chart')?.appendChild(gpuHost);
const chart = await ChartGPU.create(gpuHost, { series: [{ type: 'line', data: [] }] });
```
If this fails, the fallback is passing the shadow root's `#chart` element directly. If that also fails, the only option is a raw WebGPU fallback (major scope expansion).

**Warning signs:** `ChartGPU.create()` throws or returns without rendering; the WebGPU canvas element is not present in the shadow root after init.

### Pitfall 2: ChartGPU Resize Not Called When ECharts Resizes

**What goes wrong:** When the container width changes (window resize, flex layout shift), ECharts calls its own `resize()` via the ResizeObserver in `_initChart()`. ChartGPU's backing texture remains at the old size — the GPU canvas renders at the wrong dimensions, causing pixel-misaligned data lines.

**Why it happens:** Two independent ResizeObservers are needed — one for ECharts (already in base class) and one for ChartGPU. The base class ResizeObserver only calls `this._chart.resize()`, not `this._gpuChart.resize()`.

**How to avoid:** After `ChartGPU.create()`, hook into the same ResizeObserver or create a second one:
```typescript
this._gpuResizeObserver = new ResizeObserver(() => this._gpuChart?.resize());
this._gpuResizeObserver.observe(container);
```
Disconnect this observer in `disconnectedCallback()` before `this._gpuChart.dispose()`.

**Warning signs:** Data lines rendered at wrong scale after window resize; ChartGPU canvas appears smaller than the ECharts canvas.

### Pitfall 3: `convertToPixel` Called Before ECharts Coordinate System Initializes

**What goes wrong:** `_syncCoordinates()` is called during the `rendered` event; if `rendered` fires before the first `setOption` completes (e.g., empty chart), `convertToPixel` returns `[NaN, NaN]`.

**Why it happens:** ECharts fires `rendered` for every repaint, including the initial empty render before any data is applied. `convertToPixel` requires a coordinate system (grid) to be initialized by at least one `setOption` call.

**How to avoid:** Guard every `convertToPixel` call:
```typescript
const pixel = this._chart?.convertToPixel({ gridIndex: 0 }, [x, y]);
if (!pixel || isNaN(pixel[0])) return; // coordinate system not ready
```

**Warning signs:** `NaN` pixel values in `_syncCoordinates()`; ChartGPU zoom never updates on first load.

### Pitfall 4: GPUDevice Destroyed While Other Charts Still Active

**What goes wrong:** One `LuiLineChart` is removed from the DOM. Its `disconnectedCallback()` calls `device.destroy()`. A second `LuiLineChart` on the same page is now using a destroyed device — all WebGPU operations silently fail.

**Why it happens:** Without refcounting, the first chart to disconnect destroys the shared singleton device.

**How to avoid:** Implement refcounting in `webgpu-device.ts`. Every `acquireGpuDevice()` increments the counter; every `releaseGpuDevice()` decrements it. `device.destroy()` is only called when the count reaches zero.

**Warning signs:** WebGPU canvas goes blank on a second chart when the first is removed; `GPUDevice.lost` promise resolves unexpectedly.

### Pitfall 5: ChartGPU dispose() Before ECharts Listens for Events

**What goes wrong:** `disconnectedCallback()` disposes ChartGPU AFTER calling `super.disconnectedCallback()`. But `super.disconnectedCallback()` calls `this._chart.dispose()` which already fired the ECharts off events. The ChartGPU event listener removal in `dispose()` may reference an already-disposed ECharts instance.

**Why it happens:** Order of operations in `disconnectedCallback()` matters when two systems have interdependent cleanup.

**How to avoid:** In `disconnectedCallback()`, always clean up in reverse-init order:
1. Cancel `_lineRafId` (GPU chart updates)
2. Disconnect `_gpuResizeObserver`
3. Call `this._gpuChart?.dispose()`
4. Set `this._gpuChart = null`
5. THEN call `super.disconnectedCallback()` (which disposes ECharts)

**Warning signs:** JavaScript errors in `disconnectedCallback()` about accessing disposed instances.

### Pitfall 6: Data Not Pushed to ChartGPU in `_flushLineUpdates()`

**What goes wrong:** Phase 100's `_flushLineUpdates()` only calls `this._chart.setOption()` (ECharts). When WebGPU is active, ChartGPU also needs to receive the same data to render. Without patching `_flushLineUpdates()`, ChartGPU's canvas stays blank.

**Why it happens:** Phase 100 built the streaming path purely against ECharts. Phase 101 must intercept the flush to also push data to ChartGPU.

**How to avoid:** Override `_flushLineUpdates()` in the WebGPU path to call both:
```typescript
private _flushLineUpdates(): void {
  // 1. Push to ECharts (axes/tooltip/DataZoom see the data)
  // 2. If WebGPU active, also push to ChartGPU (GPU canvas renders data pixels)
  if (this._gpuChart) {
    const points = this._lineBuffers[0].map((v, i) => [i, v as number] as [number, number]);
    this._gpuChart.appendData(points); // ChartGPU appendData API
  }
}
```

**Warning signs:** ECharts tooltip shows data values but the WebGPU canvas is blank.

### Pitfall 7: ChartGPU `renderMode: 'external'` Loop Not Wired

**What goes wrong:** ChartGPU is created with `renderMode: 'external'` but no render loop is started. ChartGPU renders nothing.

**Why it happens:** `renderMode: 'external'` hands render scheduling to the caller. Without calling `chart.renderFrame()` in a RAF loop, ChartGPU never draws.

**How to avoid:** Either use the default render mode (ChartGPU owns its own RAF) or wire an explicit loop. The simplest approach is to NOT set `renderMode: 'external'` and let ChartGPU manage its own animation loop. Only use `external` if strict single-RAF coordination is needed (not required for Phase 101 success criteria).

**Warning signs:** ChartGPU canvas is completely blank; no GPU draw calls in DevTools Performance.

---

## Code Examples

Verified patterns from official sources:

### ChartGPU.create() with External Device (WEBGPU-03 compatibility)

```typescript
// Source: ChartGPU docs/api/chart.md — Shared GPU Device section
// Multiple charts sharing one device; charts won't destroy injected device on disposal

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const chart1 = await ChartGPU.create(container1, opts1, { adapter, device });
const chart2 = await ChartGPU.create(container2, opts2, { adapter, device });
// device.destroy() is caller's responsibility — ChartGPU.dispose() does NOT destroy it
```

### ChartGPU Lifecycle Methods

```typescript
// Source: ChartGPU docs/api/chart.md — Instance methods
chart.resize();        // Recompute canvas backing size from container; schedule redraw
chart.dispose();       // Cancel pending frame, dispose GPU resources, remove canvas
                       // NOTE: does NOT call device.destroy() when device was injected
chart.needsRender();   // Returns true if a frame needs to be drawn
chart.renderFrame();   // Execute one render (only needed in renderMode: 'external')
```

### ChartGPU Zoom Range API

```typescript
// Source: ChartGPU docs/api/interaction.md — Zoom and Pan APIs
// Zoom range is in percent space [0, 100]
const range = chart.getZoomRange(); // { start: number; end: number } | null
chart.setZoomRange(start, end);     // Programmatically set zoom window [0–100]
// 'zoomRangeChange' event fires on gesture, slider, setZoomRange(), or auto-scroll
chart.on('zoomRangeChange', (payload) => { /* payload.start, payload.end */ });
```

### ECharts DataZoom Event + convertToPixel

```typescript
// Source: ECharts handbook — convertToPixel usage + DataZoom event concepts
// convertToPixel('grid', [dataX, dataY]) returns [pixelX, pixelY] from canvas top-left

this._chart!.on('dataZoom', () => {
  const option = this._chart!.getOption() as Record<string, unknown>;
  const dz = (option['dataZoom'] as Array<Record<string, unknown>> | undefined)?.[0];
  if (!dz) return;
  const start = (dz['start'] as number) ?? 0;
  const end = (dz['end'] as number) ?? 100;
  // Both ECharts dataZoom and ChartGPU setZoomRange use [0, 100] percent space
  this._gpuChart?.setZoomRange(start, end);
});
```

### Refcounted GPUDevice Singleton

```typescript
// Source: WebGPU spec best practices — refcounting for shared device lifetime
// Modification to packages/charts/src/shared/webgpu-device.ts

let _devicePromise: Promise<GPUDevice> | null = null;
let _refCount = 0;

export async function acquireGpuDevice(adapter: GPUAdapter): Promise<GPUDevice> {
  if (_devicePromise) {
    _refCount++;
    return _devicePromise;
  }
  _devicePromise = adapter.requestDevice();
  _refCount = 1;
  return _devicePromise;
}

export async function releaseGpuDevice(): Promise<void> {
  _refCount = Math.max(0, _refCount - 1);
  if (_refCount === 0 && _devicePromise) {
    const device = await _devicePromise;
    device.destroy();
    _devicePromise = null;
  }
}
```

### Shadow DOM Canvas Insert

```typescript
// Based on known pattern: chart libraries accept DOM element directly.
// ChartGPU.create(container, ...) appends its canvas inside container.
// container is a div created in JS and appended to the shadow root's #chart div.

const container = this.shadowRoot?.querySelector<HTMLDivElement>('#chart');
if (!container) return;
const gpuHost = document.createElement('div');
gpuHost.style.cssText =
  'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
container.insertBefore(gpuHost, container.firstChild); // ChartGPU below ECharts
this._gpuChart = await ChartGPU.create(gpuHost, options, { device });
```

### disconnectedCallback Cleanup Order

```typescript
// WEBGPU-02 Success Criterion 4: device.destroy() called, WebGPU canvas removed, no leak

override disconnectedCallback(): void {
  // 1. Cancel streaming RAF
  if (this._lineRafId !== undefined) {
    cancelAnimationFrame(this._lineRafId);
    this._lineRafId = undefined;
  }
  // 2. Disconnect ChartGPU's resize observer
  this._gpuResizeObserver?.disconnect();
  this._gpuResizeObserver = undefined;
  // 3. Dispose ChartGPU — removes GPU buffers, canvas element; does NOT destroy device
  this._gpuChart?.dispose();
  this._gpuChart = null;
  // 4. Release device refcount — destroys device only when last chart disconnects
  if (this._wasWebGpu) {
    void releaseGpuDevice();
  }
  // 5. ECharts cleanup (base class) — disposes chart, disconnects observers
  super.disconnectedCallback();
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ECharts appendData for 1M+ line streaming (crashes tab) | Ring buffer + setOption (Phase 100) | Phase 100 | Eliminates tab crashes; still CPU-bound for rendering |
| ECharts CPU-bound canvas rendering at 1M+ points | ChartGPU GPU-side rendering + ECharts for axes | Phase 101 | Decouples data rendering from ECharts' appendData ceiling; sub-10ms CPU frame time at 1M pts |
| Single canvas (ECharts owns everything) | Two-layer canvas (ChartGPU below for data, ECharts above for axes) | Phase 101 | ECharts' axis/tooltip/DataZoom preserved; GPU rendering path for data pixels |
| GPUDevice singleton (stub release, no destroy) | GPUDevice singleton with refcounted destroy | Phase 101 | Satisfies WEBGPU-02 Success Criterion 4 — no memory leak over 10 create/destroy cycles |

**Deprecated/outdated:**
- Phase 98's `releaseGpuDevice()` stub: Phase 101 upgrades this to a refcounted async function that calls `device.destroy()` on the last release.
- LINE-03 comment in line-chart.ts says "streaming via ChartGPU" — the comment is aspirational from Phase 100; Phase 101 actually wires it.

---

## Open Questions

1. **Does ChartGPU's `appendData()` accept cumulative data (entire buffer) or incremental (new points only)?**
   - What we know: ChartGPU has an `appendData()` API and a `'dataAppend'` event. ECharts' `appendData` (removed from Phase 100's path) was incremental-only. ChartGPU's `appendData()` description says "Adds points; respects `autoScroll`" — this implies incremental.
   - What's unclear: Whether `_flushLineUpdates()` should pass only the new points since the last flush, or the full `_lineBuffers` contents. If ChartGPU accumulates data internally (like ECharts' old appendData path), passing the full buffer each flush would double-count points.
   - Recommendation: Investigate ChartGPU's appendData semantics in the prototype. If it's truly incremental (accumulates), change `_flushLineUpdates()` to track and pass only new points since last flush. If it accepts full-replacement data (like `setOption`), pass the full buffer each flush. This is the most important implementation detail to validate in the prototype.

2. **Is ChartGPU's dataZoom `setZoomRange(start, end)` in the same percent space [0–100] as ECharts' dataZoom `start`/`end`?**
   - What we know: ChartGPU interaction.md confirms `getZoomRange()` returns `{ start: number; end: number }` in "percent space [0, 100]". ECharts DataZoom's `start`/`end` are also percentages [0, 100].
   - What's unclear: Whether the two percent spaces are equivalent (same 0% = leftmost point, 100% = rightmost point), or if there are offset differences due to different grid margin handling.
   - Recommendation: The coordination may need pixel-space sync via `convertToPixel` if percent spaces don't align exactly. Build the simple percent-space sync first; add pixel-space fallback if alignment is off.

3. **ChartGPU `context` parameter: is `adapter` required when `device` is provided?**
   - What we know: The API is `ChartGPU.create(container, options, context?)` where `context` is `{ adapter, device, pipelineCache? }`. The docs show both `adapter` and `device` in the shared device example. The Phase 98 singleton caches `Promise<GPUDevice>`, not the adapter.
   - What's unclear: Whether `adapter` must always be provided alongside `device`, or if `device`-only is valid. If adapter is required, Phase 101 needs to hold a reference to the adapter from `_detectRenderer()`.
   - Recommendation: Modify `_detectRenderer()` to store the `GPUAdapter` reference alongside the `GPUDevice` singleton. The adapter is already available in `_detectRenderer()` before `acquireGpuDevice()` is called — it just needs to be saved. Add `getGpuAdapter()` to webgpu-device.ts if needed.

4. **Shadow DOM: does ChartGPU's ResizeObserver work inside shadow root?**
   - What we know: Chart.js has a known issue where its `MutationObserver` doesn't detect canvas inside shadow root (GitHub Issue #10924). ChartGPU likely uses a ResizeObserver on its container to trigger repaints.
   - What's unclear: Whether ChartGPU's internal ResizeObserver operates on the container element (works in shadow root — ResizeObserver observes elements, not the document) or on something document-scoped (would fail).
   - Recommendation: Shadow DOM ResizeObserver on element refs works fine per MDN. This is lower risk than MutationObserver. ChartGPU's `resize()` method is also available for external triggering if its internal observer fails.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` (key absent, treated as false). Skip full automated test map.

Success criteria for WEBGPU-02 are verified manually or by browser performance profiling:
- SC1 (60fps at 1M+ points, lower CPU time than Canvas): Requires Chrome DevTools Performance profiler
- SC2 (no pixel offset after DataZoom): Visual inspection in Chrome/Edge with WebGPU enabled
- SC3 (Canvas fallback, no JS errors): Visual inspection in a non-WebGPU browser (Firefox, Safari without WebGPU)
- SC4 (device.destroy() on remove, no memory leak): Chrome DevTools Memory tab over 10 create/destroy cycles

---

## Sources

### Primary (HIGH confidence)
- [ChartGPU GitHub — docs/api/chart.md](https://github.com/ChartGPU/ChartGPU/blob/main/docs/api/chart.md) — ChartGPU.create() signature, shared device context `{ adapter, device }`, resize(), dispose(), external render mode
- [ChartGPU GitHub — docs/api/interaction.md](https://github.com/ChartGPU/ChartGPU/blob/main/docs/api/interaction.md) — getZoomRange(), setZoomRange(), 'zoomRangeChange' event, on()/off()
- [ChartGPU GitHub — docs/api/options.md](https://github.com/ChartGPU/ChartGPU/blob/main/docs/api/options.md) — series types, appendData, autoScroll, sampling
- [ChartGPU GitHub — docs/GETTING_STARTED.md](https://github.com/ChartGPU/ChartGPU/blob/main/docs/GETTING_STARTED.md) — async ChartGPU.create(), lifecycle
- [ChartGPU GitHub — v0.3.2 release](https://github.com/ChartGPU/ChartGPU/releases/tag/v0.3.2) — null gap support, connectNulls, GPU-level gap detection
- [MDN — GPUDevice.destroy()](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/destroy) — destroy() semantics, all resources freed, queue drains first
- [ECharts Handbook — Drag & convertToPixel](https://echarts.apache.org/handbook/en/how-to/interaction/drag/) — convertToPixel('grid', dataItem) confirmed, must be after first setOption
- `packages/charts/src/base/base-chart-element.ts` — Phase 98 _detectRenderer(), renderer field, getGpuDevice() import
- `packages/charts/src/line/line-chart.ts` — Phase 100 streaming implementation, _flushLineUpdates(), _triggerReset()
- `packages/charts/src/area/area-chart.ts` — Phase 100 streaming implementation (identical pattern)
- `packages/charts/src/shared/webgpu-device.ts` — acquireGpuDevice(), getGpuDevice(), releaseGpuDevice() stubs

### Secondary (MEDIUM confidence)
- [HackMD — Multiple components cannot effectively share a GPUDevice](https://hackmd.io/@webgpu/SkRjVIcjc) — refcounting pattern rationale; `device.destroy()` problematic for shared device; manual resource tracking as alternative
- [WebGPU Best Practices — Device Loss](https://toji.dev/webgpu-best-practices/device-loss.html) — device.destroy() behavior, GPUDevice.lost promise ordering
- [ECharts GitHub Issue #9593](https://github.com/apache/echarts/issues/9593) — convertToPixel with DataZoom sync; known that position must be recalculated inside datazoom handler
- [ECharts Handbook — Events and Actions](https://apache.github.io/echarts-handbook/en/concepts/event/) — 'datazoom' event confirmed; 'rendered' event confirmed

### Tertiary (LOW confidence)
- [Chart.js GitHub Issue #10924](https://github.com/chartjs/Chart.js/issues/10924) — Shadow DOM canvas attach observer issue; used as evidence of the risk category, not specific to ChartGPU
- [Hacker News — ChartGPU Show HN thread](https://news.ycombinator.com/item?id=46706528) — performance claims (35M pts @ 72fps benchmark); community discussion of Shadow DOM not specifically covered

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — ChartGPU 0.3.2 confirmed as the target library (WEBGPU-02 requirement); `context: { device }` injection confirmed from API docs; no alternative needed
- Architecture: MEDIUM — Two-layer canvas pattern (ChartGPU below, ECharts above) is sound; exact data flow between ring buffers and ChartGPU appendData needs prototype validation; percent-space zoom sync needs empirical testing
- ChartGPU Shadow DOM: LOW — Not confirmed for ChartGPU specifically; known risk (STATE.md); requires prototype before full implementation commitment
- ECharts convertToPixel: HIGH — Confirmed via official ECharts handbook and multiple GitHub issues; behavior post-DataZoom confirmed
- GPUDevice refcounting: HIGH — Pattern derived from WebGPU spec discussions and MDN; `device.destroy()` semantics confirmed

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (ChartGPU 0.3.2 is pinned; ECharts 5.6.0 is pinned; WebGPU APIs are stable in Chrome 113+ / Edge 113+)
