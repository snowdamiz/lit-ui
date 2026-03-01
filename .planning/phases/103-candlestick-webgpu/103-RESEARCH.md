# Phase 103: Candlestick WebGPU — Research

**Researched:** 2026-03-01
**Domain:** WebGPU two-layer canvas for LuiCandlestickChart using ChartGPU 0.3.2
**Confidence:** HIGH

## Summary

Phase 103 extends the WebGPU two-layer canvas pattern from Phase 101 (line/area charts) to `LuiCandlestickChart`. The implementation is architecturally straightforward because ChartGPU 0.3.2 already ships a first-class `'candlestick'` series type with its own `CandlestickSeriesConfig`, `OHLCDataPoint` data format, and `appendData()` support for streaming OHLC bars.

The key mechanical differences from line/area are: (1) ChartGPU candlestick data uses `[timestamp, open, close, low, high]` tuples where the x-value is a numeric index, while ECharts uses category string labels — a bridge mapping is required when syncing bars; (2) MA overlay series stay in ECharts (they are line series, not OHLC), so ChartGPU only receives the candlestick series; (3) the volume panel (when enabled) also stays in ECharts — ChartGPU does not receive volume bars.

**CRITICAL CONFLICT WITH REQUIREMENTS.md:** The existing `REQUIREMENTS.md` Out of Scope table explicitly lists "WebGPU render path for Candlestick" with reason "Bounded point counts; WebGPU overhead exceeds benefit; Canvas is optimal for these types." However, the user has explicitly added Phase 103 to the roadmap overriding this decision. The planner should treat the user's explicit roadmap addition as the authoritative decision and implement WebGPU support. The REQUIREMENTS.md Out of Scope entry is superseded by Phase 103's existence.

**Primary recommendation:** Follow the Phase 101 line-chart pattern exactly — `_initChart()` override, `_initWebGpuLayer()` private method, `_GpuChartInstance` local interface, `_syncCoordinates()` via `dataZoom`/`rendered` events, reverse-init `disconnectedCallback()`. Use `{ type: 'candlestick', data: [] }` as the initial series. Map bars to `[index, open, close, low, high]` tuples for ChartGPU. MA series and volume panel remain in ECharts only.

---

## Conflict Note: Requirements.md vs. Roadmap

The REQUIREMENTS.md Out of Scope table (line 49) lists:

> WebGPU render path for Bar/Pie/Heatmap/Candlestick/Treemap — Bounded point counts; WebGPU overhead exceeds benefit; Canvas is optimal for these types

This was written before Phase 103 was added. The STATE.md (line 93) explicitly records:

> Phase 103 added: Candlestick chart WebGPU support — implement WebGPU rendering, update docs, update skill; docs page uses WebGPU by default if available

**Conclusion:** The user's explicit roadmap addition overrides the original out-of-scope classification. Implement WebGPU support as requested. The original reasoning (bounded point count, overhead) is still architecturally valid — the planner should note in documentation that WebGPU benefit for candlestick is lower than for line/area (typical candlestick sessions have thousands of bars, not millions of points), but the feature is being added for parity and testability.

---

## Standard Stack

### Core (all already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| chartgpu | 0.3.2 | WebGPU canvas layer | Already in dependencies from Phase 101; has native candlestick series type |
| @webgpu/types | 0.1.67 | TypeScript GPU types | Already installed from Phase 98 |
| echarts | 5.6.0 | Axes, tooltip, MA overlay, DataZoom | Pinned; must not upgrade (echarts-gl compat) |

### No New Installations Required

All dependencies are already present. Phase 103 is a pure implementation phase using existing infrastructure.

```bash
# No new installs — chartgpu@0.3.2 already in packages/charts/package.json
```

---

## Architecture Patterns

### Pattern 1: Two-Layer Canvas (replicate from Phase 101)

**What:** ChartGPU canvas at z-index:0 (data pixels), ECharts canvas at z-index:1 (axes/tooltip/DataZoom). ChartGPU renders OHLC candles; ECharts renders axes, legend, tooltip, MA lines, volume bars, and DataZoom slider.

**When to use:** When `this.renderer === 'webgpu'` after `_detectRenderer()` in `firstUpdated()`.

**Implementation:** Override `_initChart()` in `LuiCandlestickChart`, call `super._initChart()` first, then conditionally call `_initWebGpuLayer()`.

```typescript
// Source: packages/charts/src/line/line-chart.ts (Phase 101 pattern)
protected override async _initChart(): Promise<void> {
  await super._initChart();
  if (this.renderer === 'webgpu') {
    await this._initWebGpuLayer();
  }
}
```

### Pattern 2: ChartGPU Candlestick Series Initialization

**What:** Create ChartGPU instance with `{ type: 'candlestick', data: [] }` as initial series config.

**ChartGPU types (from dist/config/types.d.ts):**

```typescript
// Source: node_modules/.pnpm/chartgpu@0.3.2/.../config/types.d.ts
interface CandlestickSeriesConfig {
  readonly type: 'candlestick';
  readonly data: ReadonlyArray<OHLCDataPoint>;
  readonly style?: 'classic' | 'hollow';
  readonly itemStyle?: {
    readonly upColor?: string;
    readonly downColor?: string;
    readonly upBorderColor?: string;
    readonly downBorderColor?: string;
    readonly borderWidth?: number;
  };
  readonly barWidth?: number | string;
  readonly barMinWidth?: number;
  readonly barMaxWidth?: number;
  readonly sampling?: 'none' | 'ohlc';
}

// OHLCDataPoint format (NOT ECharts [open,close,low,high] — different order!)
// ChartGPU: [timestamp, open, close, low, high]
type OHLCDataPointTuple = readonly [
  timestamp: number,  // x-axis position (use bar index 0,1,2,...)
  open: number,
  close: number,
  low: number,
  high: number
];
```

**CRITICAL DATA FORMAT NOTE:** ChartGPU OHLC is `[timestamp, open, close, low, high]` (5-element tuple with index first). ECharts internal storage is `[open, close, low, high]` (4-element, no index). The conversion from `CandlestickBarPoint` (which stores ECharts-format ohlc) to ChartGPU format requires prepending the bar index.

```typescript
// Conversion: ECharts CandlestickBarPoint → ChartGPU OHLCDataPoint
// _ohlcBuffer[i] has ohlc: [open, close, low, high]
// ChartGPU expects: [index, open, close, low, high]
const gpuPoint: [number, number, number, number, number] = [
  i,                    // x = bar index
  bar.ohlc[0],         // open
  bar.ohlc[1],         // close
  bar.ohlc[2],         // low
  bar.ohlc[3],         // high
];
```

### Pattern 3: appendData for Streaming Bars

**What:** On each `_flushBarUpdates()` call (when WebGPU active), also push the new bar to ChartGPU via `appendData(0, [gpuPoint])`.

**ChartGPU appendData signature (from dist/ChartGPU.d.ts):**

```typescript
appendData(seriesIndex: number, newPoints: CartesianSeriesData | OHLCDataPoint[]): void;
```

For candlestick: `appendData(0, [[index, open, close, low, high]])`.

**Incremental tracking:** Same pattern as line chart — `_gpuFlushedLength` (single number for single candlestick series, not array) tracks how many bars have been pushed to ChartGPU. On each flush: `appendData(0, newBarsAsOHLC)` where newBars = `_ohlcBuffer.slice(_gpuFlushedLength)`.

### Pattern 4: Coordinate Sync

**What:** ECharts DataZoom `start`/`end` (percent-space 0-100) maps directly to `ChartGPU.setZoomRange(start, end)`. Same pattern as line chart — no coordinate conversion needed.

**Important:** Candlestick already has `dataZoom` configured in `buildCandlestickOption()` (both `inside` and `slider`). The sync wires on `'dataZoom'` and `'rendered'` ECharts events.

```typescript
// Source: pattern from packages/charts/src/line/line-chart.ts
private _syncCoordinates(): void {
  if (!this._chart || !this._gpuChart) return;
  const option = this._chart.getOption() as Record<string, unknown>;
  const dataZoom = (option['dataZoom'] as Array<Record<string, unknown>> | undefined)?.[0];
  if (!dataZoom) return;
  const start = (dataZoom['start'] as number) ?? 0;
  const end = (dataZoom['end'] as number) ?? 100;
  if (isNaN(start) || isNaN(end)) return;
  this._gpuChart.setZoomRange(start, end);
}
```

### Pattern 5: Reverse-Init Cleanup (disconnectedCallback)

**What:** Exact same order as line chart — must cancel `_barRafId` FIRST (existing candlestick RAF), then disconnect GPU resize observer, dispose GPU chart, release GPU device, then `super.disconnectedCallback()`.

**Order (CRITICAL — must be this exact sequence):**
1. Cancel `_barRafId` (existing streaming RAF)
2. `_gpuResizeObserver?.disconnect()`
3. `_gpuChart?.dispose()`
4. `void releaseGpuDevice()` (if `_wasWebGpu`)
5. `super.disconnectedCallback()`

### Pattern 6: Docs Page — enable-webgpu by Default

**User requirement:** "Ensure docs page uses webgpu by default if available so I can test its functionality."

**Implementation:** Add `enable-webgpu` to the `<lui-candlestick-chart>` element in `CandlestickChartDemo()`. Since `enable-webgpu` is boolean, just add the attribute. The chart will auto-detect and fall back to Canvas on unsupported browsers.

```tsx
// CandlestickChartPage.tsx — updated demo component
<lui-candlestick-chart
  ref={ref as any}
  enable-webgpu
  style={{ height: '300px', display: 'block' }}
/>
```

### Pattern 7: _initWebGpuLayer with Bull/Bear Colors

**What:** ChartGPU `CandlestickItemStyleConfig` uses `upColor`/`downColor` (NOT `color`/`color0` like ECharts). Pass resolved bull/bear colors to ChartGPU at init time.

```typescript
// ChartGPU candlestick item style (from types.d.ts)
const gpuSeries = {
  type: 'candlestick' as const,
  data: [] as OHLCDataPointTuple[],
  itemStyle: {
    upColor: this.bullColor ?? '#26a69a',
    downColor: this.bearColor ?? '#ef5350',
    upBorderColor: this.bullColor ?? '#26a69a',
    downBorderColor: this.bearColor ?? '#ef5350',
  },
};
```

### Pattern 8: ECharts in Transparent/Hidden Mode (WebGPU path)

**What:** When WebGPU is active, ECharts candlestick series should be transparent/hidden because ChartGPU renders the candles. ECharts still renders axes, legend, MA lines, volume bars, DataZoom — these are NOT replaced by ChartGPU.

**Decision:** Two approaches for hiding ECharts candlestick series in WebGPU mode:
- Option A: Set `itemStyle.color = 'transparent'` and `itemStyle.color0 = 'transparent'` in `buildCandlestickOption` output when WebGPU is active
- Option B: Continue rendering ECharts candlestick series at reduced opacity; visually the GPU layer dominates

**Recommended:** Option A — hide the ECharts candlestick series when `_wasWebGpu` is true. This prevents visual double-rendering. MA lines, volume bars, axes, tooltip remain in ECharts at full opacity. Apply in `_applyData()` and `_flushBarUpdates()` when `_wasWebGpu`.

### Recommended File Structure

```
packages/charts/src/candlestick/
├── candlestick-chart.ts    # LuiCandlestickChart — add WebGPU layer (this phase)
├── candlestick-registry.ts # unchanged
shared/
├── candlestick-option-builder.ts  # unchanged (ECharts only)
├── webgpu-device.ts        # unchanged (shared singleton)
apps/docs/src/pages/charts/
└── CandlestickChartPage.tsx  # add enable-webgpu + WebGPU props docs
skill/skills/candlestick-chart/
└── SKILL.md                  # add enable-webgpu, renderer, renderer-selected
skill/skills/charts/
└── SKILL.md                  # update note: candlestick now also activates ChartGPU
```

### Anti-Patterns to Avoid

- **Putting MA series in ChartGPU:** MA series are ECharts line series — ChartGPU has no concept of MA overlays. All MA rendering stays in ECharts.
- **Putting volume bars in ChartGPU:** Same — volume is an ECharts bar series. ChartGPU renders candles only.
- **Using ECharts `appendData()` for the candlestick series:** The base class `_streamingMode` is `'buffer'` for candlestick (it overrides `pushData()` entirely); ECharts appendData is NOT used. ChartGPU `appendData()` is separate and co-exists with ECharts `setOption(lazyUpdate:true)`.
- **Reading `this.renderer` synchronously in constructor:** `renderer` is set asynchronously in `firstUpdated()` after GPU probe. Always check inside `_initChart()`.
- **Calling `requestDevice()` on a new adapter:** The singleton in `webgpu-device.ts` caches the first adapter's device. Never create a new device.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GPU device lifecycle | Custom GPUDevice management | `webgpu-device.ts` singleton (acquireGpuDevice/releaseGpuDevice) | Refcounted, already handles multiple chart instances on same page |
| WebGPU detection | Custom navigator.gpu probe | `BaseChartElement._detectRenderer()` + `enableWebGpu` attribute | SSR-safe, event-dispatching, already in base class |
| OHLC GPU rendering | Custom WGSL shaders | ChartGPU 0.3.2 `CandlestickSeriesConfig` | Hardware-accelerated, tested, has appendData streaming support |
| Zoom percent math | Manual pixel→percent coordinate conversion | `getOption().dataZoom[0].start/end` → `setZoomRange()` | ChartGPU operates in percent-space; no conversion needed |

**Key insight:** All infrastructure from Phase 98 and Phase 101 is reusable. The candlestick implementation is approximately 120-150 lines added to `candlestick-chart.ts` — analogous to what Phase 101 added to `line-chart.ts`.

---

## Common Pitfalls

### Pitfall 1: ChartGPU OHLC Data Order vs ECharts OHLC Data Order

**What goes wrong:** ChartGPU uses `[timestamp/index, open, close, low, high]` (5 elements, index-first). ECharts `OhlcBar` is `[open, close, low, high]` (4 elements, no index). Direct pass-through produces wrong candles.

**Why it happens:** Both name their data "OHLC" but use different tuple layouts. Neither throws an error — candles simply render with wrong values.

**How to avoid:** Always convert `CandlestickBarPoint.ohlc` (ECharts format `[o, c, l, h]`) to ChartGPU format `[barIndex, o, c, l, h]` by prepending the index. Centralize this in a private `_toGpuPoint(bar: CandlestickBarPoint, index: number)` helper.

**Warning signs:** Candles appear inverted (bulls shown as bears) or wicks positioned incorrectly.

### Pitfall 2: Double Candle Rendering

**What goes wrong:** Both ECharts candlestick series and ChartGPU candlestick layer render at the same time — visible double candles with slight positioning offset.

**Why it happens:** ECharts `_applyData()` and `_flushBarUpdates()` set the full candlestick option (including the candlestick series), while ChartGPU also renders candles.

**How to avoid:** When `_wasWebGpu` is `true`, override the `bullColor`/`bearColor` passed to `buildCandlestickOption()` to `'transparent'` (or use opacity 0) for the ECharts candlestick series. MA lines and volume bars should remain at normal opacity.

**Warning signs:** Candles appear doubled or show shadow outline.

### Pitfall 3: showVolume Two-Grid DataZoom Sync

**What goes wrong:** The `showVolume` layout uses `dataZoom: [{ xAxisIndex: [0, 1] }]` to sync both panels. When reading `getOption().dataZoom[0].start/end` for ChartGPU sync, this still works correctly — percent-space is shared across both x-axes.

**Why it happens:** Not actually a problem — just a note to verify the sync still works with two-panel layout.

**How to avoid:** Test with `show-volume` enabled to confirm ChartGPU zoom sync works in two-grid mode.

### Pitfall 4: _barRafId vs _gpuFlushedLength Reset in _triggerReset

**What goes wrong:** `LuiCandlestickChart` does not have a `_triggerReset()` (unlike line chart) — it trims `_ohlcBuffer` to `maxPoints` in-place. If `_gpuFlushedLength` is not reset to 0 after a trim, the next `appendData` sends bars from the wrong index.

**Why it happens:** After trim, `_ohlcBuffer` is shorter. But `_gpuFlushedLength` still points to the old count. Next flush: `_ohlcBuffer.slice(_gpuFlushedLength)` returns empty (no new bars appear in ChartGPU).

**How to avoid:** When `_ohlcBuffer` is trimmed in `pushData()`, also reset `_gpuFlushedLength = 0` and call a full `_rebuildGpuData()` that calls `setOption` with the full new buffer OR reset and let the next `_flushBarUpdates` send the full trimmed buffer. The simplest safe approach: on trim, set `_gpuFlushedLength = 0`, then in `_flushBarUpdates` detect `_gpuFlushedLength === 0` and use `gpuChart.setOption({ series: [{ data: fullBuffer }] })` instead of `appendData`.

**Warning signs:** GPU chart stops updating after the first trim event.

### Pitfall 5: disconnectedCallback Order — _barRafId Must Come First

**What goes wrong:** If `super.disconnectedCallback()` is called before cancelling `_barRafId`, the RAF callback fires after the ECharts chart is disposed, causing `_flushBarUpdates()` to call `this._chart.setOption()` on a null chart.

**Why it happens:** `_barRafId` is the candlestick-specific RAF, separate from the base class `_rafId`. The base class `disconnectedCallback()` cancels `_rafId` but has no knowledge of `_barRafId`.

**How to avoid:** Cancel `_barRafId` first in the overridden `disconnectedCallback()`, before any other cleanup. This is already done in the existing `LuiCandlestickChart.disconnectedCallback()` — the WebGPU additions must be inserted BETWEEN the `_barRafId` cancel and the `super.disconnectedCallback()` call.

### Pitfall 6: ChartGPU Instance Interface

**What goes wrong:** ChartGPU 0.3.2's real `appendData` signature for candlestick is `appendData(seriesIndex, OHLCDataPoint[])`, not the same as line chart which uses `appendData(seriesIndex, [x,y][] pairs)`. The local `_GpuChartInstance` interface used in line-chart specifies `ReadonlyArray<readonly [number, number]>` which is wrong for candlestick.

**How to avoid:** Define a separate local `_GpuCandlestickInstance` interface in `candlestick-chart.ts` that matches the candlestick-specific signature:

```typescript
interface _GpuCandlestickInstance {
  resize(): void;
  dispose(): void;
  setZoomRange(start: number, end: number): void;
  appendData(seriesIndex: number, newPoints: ReadonlyArray<readonly [number, number, number, number, number]>): void;
}
```

---

## Code Examples

Verified patterns from project source (HIGH confidence):

### ChartGPU Initialization with Candlestick Series

```typescript
// Source: ChartGPU.d.ts + candlestick/types.d.ts — verified types
private async _initWebGpuLayer(): Promise<void> {
  const devicePromise = getGpuDevice();
  if (!devicePromise) return;

  const device = await devicePromise;
  const adapter = getGpuAdapter();

  const { ChartGPU } = await import('chartgpu');
  const container = this.shadowRoot?.querySelector<HTMLDivElement>('#chart');
  if (!container) return;

  const gpuHost = document.createElement('div');
  gpuHost.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  container.insertBefore(gpuHost, container.firstChild);

  const gpuOptions = {
    series: [{
      type: 'candlestick' as const,
      data: [] as Array<readonly [number, number, number, number, number]>,
      itemStyle: {
        upColor: this.bullColor ?? '#26a69a',
        downColor: this.bearColor ?? '#ef5350',
        upBorderColor: this.bullColor ?? '#26a69a',
        downBorderColor: this.bearColor ?? '#ef5350',
      },
    }],
  };

  if (!adapter) {
    this._gpuChart = (await ChartGPU.create(gpuHost, gpuOptions)) as unknown as _GpuCandlestickInstance;
  } else {
    this._gpuChart = (await ChartGPU.create(gpuHost, gpuOptions, { device, adapter })) as unknown as _GpuCandlestickInstance;
  }

  this._wasWebGpu = true;
  this._gpuResizeObserver = new ResizeObserver(() => this._gpuChart?.resize());
  this._gpuResizeObserver.observe(container);

  this._chart!.on('dataZoom', () => this._syncCoordinates());
  this._chart!.on('rendered', () => this._syncCoordinates());
}
```

### Converting CandlestickBarPoint to ChartGPU OHLCDataPoint

```typescript
// Source: analysis of types.d.ts OHLCDataPointTuple definition
// CandlestickBarPoint.ohlc = [open, close, low, high] (ECharts order)
// ChartGPU OHLCDataPointTuple = [timestamp/index, open, close, low, high]
private _toGpuPoint(
  bar: CandlestickBarPoint,
  index: number
): readonly [number, number, number, number, number] {
  return [index, bar.ohlc[0], bar.ohlc[1], bar.ohlc[2], bar.ohlc[3]];
}
```

### Incremental Flush to ChartGPU

```typescript
// In _flushBarUpdates(), after the ECharts setOption call:
if (this._gpuChart) {
  const lastFlushed = this._gpuFlushedLength;
  const newBars = this._ohlcBuffer.slice(lastFlushed);
  if (newBars.length > 0) {
    const gpuPoints = newBars.map((bar, i) =>
      this._toGpuPoint(bar, lastFlushed + i)
    );
    this._gpuChart.appendData(0, gpuPoints);
    this._gpuFlushedLength = this._ohlcBuffer.length;
  }
}
```

### Hiding ECharts Candlestick Series (WebGPU mode)

```typescript
// In _applyData() and _flushBarUpdates(), pass transparent colors when GPU is active:
const option = buildCandlestickOption(this._ohlcBuffer, {
  bullColor: this._wasWebGpu ? 'transparent' : (this.bullColor ?? undefined),
  bearColor: this._wasWebGpu ? 'transparent' : (this.bearColor ?? undefined),
  showVolume: this.showVolume,
  movingAverages: mas,
  maValueArrays,
  resolvedMAColors,
});
```

### disconnectedCallback Addition

```typescript
override disconnectedCallback(): void {
  // 1. Cancel streaming RAF (EXISTING — must remain first)
  if (this._barRafId !== undefined) {
    cancelAnimationFrame(this._barRafId);
    this._barRafId = undefined;
  }

  // 2. WEBGPU: Disconnect GPU resize observer
  this._gpuResizeObserver?.disconnect();
  this._gpuResizeObserver = undefined;

  // 3. WEBGPU: Dispose ChartGPU (does NOT destroy shared GPUDevice)
  this._gpuChart?.dispose();
  this._gpuChart = null;

  // 4. WEBGPU: Release refcount — device.destroy() when last chart disconnects
  if (this._wasWebGpu) {
    void releaseGpuDevice();
  }

  // 5. ECharts cleanup — MUST be last
  super.disconnectedCallback();
}
```

### CandlestickChartPage.tsx Demo with enable-webgpu

```tsx
// Updated demo component in CandlestickChartPage.tsx
function CandlestickChartDemo() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) {
      (ref.current as any).data = [
        { label: '2024-01-01', ohlc: [100, 110, 95, 115] },
        { label: '2024-01-02', ohlc: [110, 105, 102, 118] },
        { label: '2024-01-03', ohlc: [105, 120, 103, 125] },
        { label: '2024-01-04', ohlc: [120, 115, 112, 128] },
        { label: '2024-01-05', ohlc: [115, 130, 113, 135] },
      ];
    }
  }, []);
  return (
    <lui-candlestick-chart
      ref={ref as any}
      enable-webgpu
      style={{ height: '300px', display: 'block' }}
    />
  );
}
```

---

## Scope of Work (Phase 103)

Phase 103 has three distinct areas. Suggested plan breakdown:

| Plan | File(s) | Work |
|------|---------|------|
| 103-01 | `candlestick-chart.ts` | Add WebGPU two-layer canvas: `_initWebGpuLayer()`, `_GpuCandlestickInstance` interface, `_gpuChart`/`_gpuResizeObserver`/`_wasWebGpu`/`_gpuFlushedLength` fields, `_initChart()` override, `_syncCoordinates()`, flush integration in `_flushBarUpdates()`, trim handling, `disconnectedCallback()` additions |
| 103-02 | `CandlestickChartPage.tsx` | Add `enable-webgpu` to demo, add `enable-webgpu` and `renderer` PropDefs, add WebGPU browser support table, update tree-shaking callout to mention ChartGPU |
| 103-03 | `skill/skills/candlestick-chart/SKILL.md`, `skill/skills/charts/SKILL.md` | Update candlestick skill with WebGPU props; update shared charts skill note that candlestick now also activates ChartGPU |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Canvas-only candlestick rendering | WebGPU two-layer canvas option | Phase 103 (this phase) | GPU-accelerated candle rendering when `enable-webgpu` is set |
| REQUIREMENTS.md: candlestick WebGPU out of scope | User override via ROADMAP Phase 103 | 2026-03-01 | WebGPU support implemented despite original exclusion |
| ChartGPU for line/area only | ChartGPU for line/area/candlestick | Phase 103 | Third chart type on ChartGPU |

---

## Open Questions

1. **ECharts axis visibility in WebGPU mode**
   - What we know: ECharts renders axes, tooltip, legend on top layer (z-index:1). ChartGPU renders candles on bottom layer (z-index:0). This works for line/area charts which use numeric x-axes.
   - What's unclear: ECharts candlestick uses a category x-axis (string labels like "2024-01-01"). ChartGPU uses numeric x-axis. The axes from ECharts will show — but they label by string, while ChartGPU positions bars by numeric index. As long as the tick count matches bar count, visual alignment should be correct. For DataZoom sync, percent-space sync still works.
   - Recommendation: Accept that ECharts provides the category axis labels (dates) and ChartGPU renders candles at numeric indices. DataZoom percent-space sync should keep them aligned. Verify visually at implementation time.

2. **Bull/Bear color sync after bull-color/bear-color attribute change**
   - What we know: ChartGPU init uses `bullColor`/`bearColor` at `_initWebGpuLayer()` time. If the user changes `bull-color` attribute after init, ECharts updates (via `_applyData()`), but ChartGPU `itemStyle` does not auto-update.
   - What's unclear: Does ChartGPU support `setOption({ series: [{ itemStyle: {...} }] })` for updating candlestick colors at runtime?
   - Recommendation: For Phase 103, accept init-time color wiring only (same as ChartGPU ThemeBridge deferral in Phase 102). Document this limitation in skill file.

3. **Volume panel visibility when WebGPU is active**
   - What we know: When `show-volume` is true, ECharts renders two grids (grid[0]: candles, grid[1]: volume). ChartGPU only covers the full container (no grid sub-division). The ChartGPU canvas sits beneath the full ECharts canvas.
   - What's unclear: Will the ChartGPU candles visually overlap/cover the ECharts volume panel area?
   - Recommendation: Since ChartGPU fills the full container, its candles will render behind both grids. The ECharts volume bars (in grid[1]) render on top of ChartGPU with correct z-ordering. The candlestick series in ECharts is hidden (transparent) but the layout grid proportions remain. This should work correctly — ChartGPU handles its own zoom via `setZoomRange` and will not know about the volume panel sub-grid, but the visual output should still be acceptable. Test with `show-volume` at implementation time.

---

## Sources

### Primary (HIGH confidence)
- `packages/charts/src/line/line-chart.ts` — Phase 101 WebGPU two-layer canvas pattern (direct source code inspection)
- `packages/charts/src/candlestick/candlestick-chart.ts` — Existing candlestick implementation (direct source code inspection)
- `packages/charts/src/base/base-chart-element.ts` — BaseChartElement with `_detectRenderer()`, `enableWebGpu`, `renderer` (direct source code inspection)
- `packages/charts/src/shared/webgpu-device.ts` — GPU singleton API: `acquireGpuDevice`, `getGpuDevice`, `getGpuAdapter`, `releaseGpuDevice` (direct source code inspection)
- `node_modules/.pnpm/chartgpu@0.3.2/.../dist/ChartGPU.d.ts` — `ChartGPUInstance.appendData(seriesIndex, OHLCDataPoint[])` signature (direct type file inspection)
- `node_modules/.pnpm/chartgpu@0.3.2/.../dist/config/types.d.ts` — `CandlestickSeriesConfig`, `OHLCDataPointTuple`, `CandlestickItemStyleConfig` (direct type file inspection)
- `apps/docs/src/pages/charts/LineChartPage.tsx` — Docs page pattern for WebGPU props (direct source code inspection)
- `apps/docs/src/pages/charts/CandlestickChartPage.tsx` — Current candlestick docs page (direct source code inspection)
- `skill/skills/candlestick-chart/SKILL.md` — Current candlestick skill file (direct source code inspection)
- `skill/skills/charts/SKILL.md` — Shared charts skill file (direct source code inspection)
- `.planning/REQUIREMENTS.md` — Out of scope entry for candlestick WebGPU (direct source inspection)
- `.planning/STATE.md` — Phase 103 addition context (direct source inspection)

### Secondary (MEDIUM confidence)
- None — all findings are from direct source code inspection at HIGH confidence

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed, types verified in node_modules
- Architecture: HIGH — Phase 101 pattern exists in source, ChartGPU candlestick types verified
- Pitfalls: HIGH — derived from direct source inspection of Phase 101 implementation and ChartGPU type definitions
- Data format mapping: HIGH — OHLCDataPointTuple verified from dist/config/types.d.ts

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (chartgpu@0.3.2 is pinned; ECharts is pinned at 5.6.0; stable)
