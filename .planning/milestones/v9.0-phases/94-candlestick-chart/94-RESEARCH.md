# Phase 94: Candlestick Chart - Research

**Researched:** 2026-02-28
**Domain:** ECharts 5.6.0 CandlestickChart + BarChart (volume panel) + LineChart (MA overlays) — concrete Lit web component extending BaseChartElement with new-bar streaming
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CNDL-01 | Developer can render a candlestick chart from OHLC `[open, close, low, high]` data with configurable bull/bear colors | ECharts `CandlestickChart` module; data format is `[open, close, low, high]` per bar; bull (up) color via `itemStyle.color`; bear (down) color via `itemStyle.color0`; `borderColor` / `borderColor0` for wick borders |
| CNDL-02 | Developer can display a volume panel on a secondary axis below the candlestick chart | Multi-grid layout: `grid[0]` for main candle chart (70% height), `grid[1]` for volume bar (25% height); two `xAxis` entries sharing the same category data; two `yAxis` entries; volume `bar` series sets `xAxisIndex: 1` and `yAxisIndex: 1`; `BarChart` module must be registered alongside `CandlestickChart` |
| CNDL-03 | Developer can display SMA/EMA moving average overlays via a `moving-averages` prop | MA overlays are `line` series added to the main panel (`xAxisIndex: 0`, `yAxisIndex: 0`); MA values computed in `candlestick-option-builder.ts` from the OHLC close prices; `LineChart` module must be registered; `_computeMA(closes, period)` returns `(number | null)[]` with nulls for the warm-up period |
| CNDL-04 | Developer can stream new OHLC bars into a candlestick chart via `pushData()` | Base class `pushData()` (circular buffer path) is CORRECT for candlestick — new bars append to the series; `_streamingMode` stays at base default `'buffer'`; on flush, the circular buffer feeds the candlestick series data AND volume bar data AND MA recomputed from the buffer; volume and MA must be recomputed on each flush |
</phase_requirements>

---

## Summary

Phase 94 builds `LuiCandlestickChart` (`lui-candlestick-chart`) extending `BaseChartElement`. The chart uses ECharts `CandlestickChart` for the OHLC body/wick rendering with standard `[open, close, low, high]` four-value data format. Bull (rising) bars use `itemStyle.color`; bear (falling) bars use `itemStyle.color0` — this is the ECharts-specific naming convention (NOT `bullColor`/`bearColor` in the ECharts option, only in the component prop interface).

The two most complex sub-features are the **volume panel** (CNDL-02) and **moving average overlays** (CNDL-03). The volume panel requires a two-grid, two-axis layout: `grid[0]`/`xAxis[0]`/`yAxis[0]` for the candlestick chart and `grid[1]`/`xAxis[1]`/`yAxis[1]` for the volume bar chart. Both X axes share the same time/category labels. The volume series is a standard `bar` series bound to `xAxisIndex: 1, yAxisIndex: 1`. This requires registering `BarChart` in the registry alongside `CandlestickChart`.

Moving average overlays (CNDL-03) are `line` series added directly to the main panel (`xAxisIndex: 0, yAxisIndex: 0`). The MA computation (SMA or EMA) must be performed in `candlestick-option-builder.ts` from the OHLC close prices — ECharts does not compute MA natively. `LineChart` must be registered. For streaming (CNDL-04), the base class circular buffer path is correct because candlestick streaming appends new bars (not updating existing bars like heatmap). However, when flushing, the option builder must recompute both volume bars and MA lines from the full circular buffer — the volume bars and MA series are data-derived, not independently streamed.

**Primary recommendation:** Follow the established three-file pattern: `candlestick-registry.ts`, `candlestick-option-builder.ts`, `candlestick-chart.ts`. Override `pushData()` in `LuiCandlestickChart` (like heatmap) to maintain the OHLC bar buffer and recompute volume/MA on each flush — the base circular buffer only tracks one data series and cannot drive volume/MA recomputation automatically.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts | ^5.6.0 (already installed) | Chart engine — `CandlestickChart`, `BarChart`, `LineChart` modules | Confirmed in `echarts/types/dist/charts.d.ts`: `install$14 as CandlestickChart, CandlestickSeriesOption` |
| lit | ^3.3.2 (peer) | Web component base | Project baseline; `BaseChartElement` extends it |
| @lit-ui/core | workspace:* (peer) | TailwindElement, CSS tokens | Inherited via BaseChartElement |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| echarts/charts — CandlestickChart | subpath of echarts@5.6.0 | Registers OHLC candlestick series | Core chart module; always required |
| echarts/charts — BarChart | subpath of echarts@5.6.0 | Registers bar series for volume panel | Required when `show-volume` is enabled; register unconditionally (like ScatterGL pattern) since volume is a common use case |
| echarts/charts — LineChart | subpath of echarts@5.6.0 | Registers line series for MA overlay lines | Required when `moving-averages` prop has entries; register unconditionally for tree-shaking consistency |
| registerCanvasCore | internal (canvas-core.ts) | Registers CanvasRenderer, Grid, Tooltip, Legend, DataZoom, etc. | Always called first in registry; `DataZoomComponent` already in canvas-core — handles zoom/pan on candlestick axis |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `BarChart` for volume (separate grid) | `BarChart` on same grid with secondary yAxis only | Two-grid approach is cleaner for financial charts; y-axes don't compete; standard ECharts financial pattern |
| Computing MA in option builder | Streaming MA computation via `pushData` side effect | Computing in option builder keeps all derived data in one place; simpler and correct for both initial data and streaming recomputes |
| Base class `pushData()` (circular buffer) | Override `pushData()` fully | For candlestick, the BASE pushData is used for the OHLC buffer, but we need to recompute volume/MA on each flush — requires overriding `pushData()` to maintain a local `_ohlcBuffer` and flush all three series atomically |

**Installation:** No new packages needed. `CandlestickChart`, `BarChart`, and `LineChart` are already available in installed `echarts@5.6.0`.

---

## Architecture Patterns

### Recommended Project Structure
```
packages/charts/src/
├── base/
│   └── base-chart-element.ts        # (Phase 88, complete) — shared lifecycle
├── registry/
│   └── canvas-core.ts               # (Phase 88, complete) — Grid, Tooltip, DataZoom, etc.
├── shared/
│   └── candlestick-option-builder.ts  # NEW Phase 94 — OhlcBar type, MAConfig, buildCandlestickOption(), _computeMA()
├── candlestick/
│   ├── candlestick-chart.ts           # NEW Phase 94 — LuiCandlestickChart class
│   └── candlestick-registry.ts        # NEW Phase 94 — registerCandlestickModules()
└── index.ts                           # Updated to export LuiCandlestickChart + types
```

### Pattern 1: OHLC Data Format and Bull/Bear Colors

**What:** ECharts candlestick data is `[open, close, low, high]` per bar (4-value array). Bull (close >= open) styling uses `itemStyle.color` and `itemStyle.borderColor`. Bear (close < open) styling uses `itemStyle.color0` and `itemStyle.borderColor0`. These are the ECharts-native property names — do NOT confuse with `upColor` or `downColor`.

**Verified source:** `packages/charts/node_modules/echarts/types/dist/shared.d.ts` lines 10428-10455 — `CandlestickItemStyleOption { color0?: ZRColor; borderColor0?: ColorString; borderColorDoji?: ZRColor }` and `CandlestickSeriesOption { type?: 'candlestick'; data?: CandlestickDataValue[] }` where `CandlestickDataValue = OptionDataValue[]` (i.e., `[open, close, low, high]`).

```typescript
// Source: echarts/types/dist/shared.d.ts lines 10428-10460
// CandlestickDataValue = OptionDataValue[] — four-value array: [open, close, low, high]
// itemStyle.color  = bull (rising) candle fill (close >= open)
// itemStyle.color0 = bear (falling) candle fill (close < open)
// itemStyle.borderColor  = bull wick/border color
// itemStyle.borderColor0 = bear wick/border color

export type OhlcBar = [number, number, number, number]; // [open, close, low, high]

const candlestickSeries = {
  type: 'candlestick' as const,
  data: ohlcData, // OhlcBar[]
  itemStyle: {
    color: bullColor,          // bull fill (e.g., '#26a69a')
    color0: bearColor,         // bear fill (e.g., '#ef5350')
    borderColor: bullColor,    // bull wick
    borderColor0: bearColor,   // bear wick
  },
};
```

### Pattern 2: Volume Panel with Multi-Grid Layout

**What:** Two separate ECharts `grid` configurations create visually separated panels. The main candlestick panel uses `grid[0]` (top 65% of height); the volume panel uses `grid[1]` (bottom 25%). Each grid has its own X and Y axis. The volume `bar` series is bound to `xAxisIndex: 1, yAxisIndex: 1`.

**Critical detail:** Both X axes must receive the same category data (timestamps/labels) so zoom/pan via `DataZoomComponent` (already in canvas-core) synchronizes across both panels. `DataZoomComponent` already registered in `canvas-core.ts` — no extra registration needed.

```typescript
// Source: echarts/types/dist/shared.d.ts lines 3018-3035 — GridOption + CartesianAxisOption
// grid[0] = main candlestick chart; grid[1] = volume panel below

const option = {
  grid: [
    { top: '5%',  height: '60%', containLabel: true },  // grid[0]: candlestick
    { top: '73%', height: '22%', containLabel: true },  // grid[1]: volume
  ],
  xAxis: [
    { type: 'category', data: labels, gridIndex: 0, boundaryGap: false, axisLine: { onZero: false } },  // main
    { type: 'category', data: labels, gridIndex: 1, boundaryGap: false, axisLine: { onZero: false } },  // volume
  ],
  yAxis: [
    { scale: true, gridIndex: 0 },    // price scale (main)
    { scale: true, gridIndex: 1 },    // volume scale
  ],
  series: [
    { type: 'candlestick', xAxisIndex: 0, yAxisIndex: 0, data: ohlcData, itemStyle: { ... } },
    { type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: volumeData, barWidth: '60%' },
  ],
  dataZoom: [
    { type: 'inside', xAxisIndex: [0, 1] },  // synchronize zoom on both x axes
    { type: 'slider', xAxisIndex: [0, 1], bottom: 2 },
  ],
};
```

### Pattern 3: Moving Average Overlays as Line Series

**What:** MA lines are `line` series added to the main panel (`xAxisIndex: 0, yAxisIndex: 0`). MA values are computed from close prices in `candlestick-option-builder.ts`. ECharts has no native MA computation — it must be done in code. SMA (simple moving average) is sufficient; EMA is a stretch goal.

**When to use:** When `movingAverages` prop has one or more `{ period: number; color: string; type?: 'sma' | 'ema' }` entries.

```typescript
// Source: echarts/types/dist/charts.d.ts line 1 — LineChart confirmed export
// MA line series: xAxisIndex: 0, yAxisIndex: 0 binds to main candlestick panel

export type MAConfig = {
  period: number;
  color: string;
  type?: 'sma' | 'ema'; // default 'sma'
};

function _computeSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;  // warm-up period
    const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    return sum / period;
  });
}

// MA line series (one per MAConfig entry):
const maSeries = maConfigs.map((ma) => ({
  name: `MA${ma.period}`,
  type: 'line' as const,
  xAxisIndex: 0,
  yAxisIndex: 0,
  data: _computeSMA(closes, ma.period),
  smooth: true,
  lineStyle: { color: ma.color, width: 1.5 },
  symbol: 'none',
  tooltip: { show: true },
}));
```

### Pattern 4: LuiCandlestickChart with Override pushData()

**What:** Unlike scatter/bar/pie which use the base circular buffer directly, `LuiCandlestickChart` must override `pushData()` to maintain its own `_ohlcBuffer: OhlcBar[]` with the labels, volume, and OHLC together. The base circular buffer cannot track multi-dimensional bar data (OHLC + label + volume) as a unit.

**Why override:** When `pushData()` is called with a new bar, the volume bars and MA lines must be recomputed from the full updated OHLC dataset. The base `_flushPendingData()` flushes `{ series: [{ data: circularBuffer }] }` for only the first series — this cannot atomically update 3+ series (candlestick + volume + multiple MA lines) in a single `setOption`.

**Critical:** Do NOT call `super.pushData()`. Maintain `_ohlcBuffer`, `_labelBuffer`, `_volumeBuffer` arrays. Use the component's own RAF handle (`_barRafId`) following the same pattern as `LuiHeatmapChart._cellRafId`.

```typescript
// Pattern mirrors LuiHeatmapChart pushData() override:
// - own RAF handle (_barRafId) cancelled in disconnectedCallback() before super.disconnectedCallback()
// - NEVER calls super.pushData()
// - flushes all series atomically in _flushBarUpdates()

export type CandlestickBarPoint = {
  label: string;       // x-axis category label (timestamp string)
  ohlc: OhlcBar;       // [open, close, low, high]
  volume?: number;     // optional volume value
};

private _ohlcBuffer: CandlestickBarPoint[] = [];
private _barRafId?: number;

override pushData(point: unknown): void {
  // Append new OHLC bar to local buffer (respects maxPoints)
  const bar = point as CandlestickBarPoint;
  this._ohlcBuffer.push(bar);
  if (this._ohlcBuffer.length > this.maxPoints) {
    this._ohlcBuffer = this._ohlcBuffer.slice(-this.maxPoints);
  }
  if (this._barRafId === undefined) {
    this._barRafId = requestAnimationFrame(() => {
      this._flushBarUpdates();
      this._barRafId = undefined;
    });
  }
}

private _flushBarUpdates(): void {
  if (!this._chart || this._ohlcBuffer.length === 0) return;
  const option = buildCandlestickOption(this._ohlcBuffer, {
    bullColor: this.bullColor,
    bearColor: this.bearColor,
    showVolume: this.showVolume,
    movingAverages: _parseMovingAverages(this.movingAverages),
  });
  this._chart.setOption(option, { lazyUpdate: true } as object);
}
```

### Pattern 5: candlestick-option-builder.ts Structure

**What:** `buildCandlestickOption()` produces the complete ECharts option object including:
1. Single or dual-grid layout (with/without volume panel)
2. Candlestick series with bull/bear colors
3. Volume bar series (if `showVolume: true`)
4. MA line series (one per `movingAverages` entry)

The builder is a pure function — it has no state. All MA computation happens here.

```typescript
export type OhlcBar = [number, number, number, number]; // [open, close, low, high]

export type MAConfig = {
  period: number;
  color: string;
  type?: 'sma' | 'ema'; // default 'sma'
};

export type CandlestickBarPoint = {
  label: string;
  ohlc: OhlcBar;
  volume?: number;
};

export type CandlestickOptionProps = {
  bullColor?: string;      // default '#26a69a' (green)
  bearColor?: string;      // default '#ef5350' (red)
  showVolume?: boolean;    // default false
  movingAverages?: MAConfig[];  // default []
};

export function buildCandlestickOption(
  bars: CandlestickBarPoint[],
  props: CandlestickOptionProps
): Record<string, unknown>;
```

### Pattern 6: Syncing _ohlcBuffer with this.data

**What:** When the `data` property changes, `_applyData()` must sync `_ohlcBuffer` from the new data and call `buildCandlestickOption()` with the full option. This is the same pattern used by `LuiHeatmapChart._applyData()` which syncs `_cellData`.

```typescript
private _applyData(): void {
  if (!this._chart) return;
  // Sync _ohlcBuffer from this.data so pushData() appends to the correct state
  this._ohlcBuffer = this.data ? [...(this.data as CandlestickBarPoint[])] : [];
  const option = buildCandlestickOption(this._ohlcBuffer, {
    bullColor: this.bullColor ?? undefined,
    bearColor: this.bearColor ?? undefined,
    showVolume: this.showVolume,
    movingAverages: _parseMovingAverages(this.movingAverages),
  });
  this._chart.setOption(option, { notMerge: false });
}
```

### Anti-Patterns to Avoid

- **Calling `super.pushData()` from `LuiCandlestickChart.pushData()`:** The base circular buffer only drives one series (`series[0]`). With multi-panel layout, this would update only the candlestick series and leave volume/MA with stale data, causing visual desync.
- **Registering only `CandlestickChart` without `BarChart`:** Volume panel requires `BarChart` module. Without it, the volume `bar` series silently renders nothing. No error from ECharts.
- **Registering only `CandlestickChart` without `LineChart`:** MA overlay requires `LineChart` module. Without it, `type: 'line'` series silently render nothing.
- **Using a single grid with two yAxis:** The standard ECharts multi-panel pattern uses separate grids (`grid[0]` and `grid[1]`) not a single grid with two yAxis. Single-grid approach makes the volume bars and candlesticks share the same price scale — incorrect behavior.
- **Not binding DataZoom to both xAxis indices:** `DataZoomComponent` is already registered in canvas-core, but the `dataZoom` option must explicitly set `xAxisIndex: [0, 1]` to synchronize zoom/pan across both panels. Without this, scrolling the price chart will not scroll the volume panel.
- **Computing MA from `this.data` only on `_applyData()`:** MA must also be recomputed from `_ohlcBuffer` on each `_flushBarUpdates()` call. Streaming new bars changes the MA values for the last several bars — only recomputing on initial data set would leave MA trailing.
- **`notMerge: true` in `setOption` calls:** Using `notMerge: true` would reset the DataZoom state (zoom position, selection) on every data update. Use `{ notMerge: false }` (the default) or `{ lazyUpdate: true }` for streaming flushes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Candlestick rendering | Custom SVG/Canvas OHLC bar drawing | `CandlestickChart` from echarts/charts | Handles wick sizing, animation, tooltip, large mode (>5000 bars) via `SeriesLargeOptionMixin` |
| Volume bar chart | Custom bar drawing alongside candlesticks | `BarChart` with `xAxisIndex: 1, yAxisIndex: 1` | Multi-grid layout with synchronized DataZoom is built into ECharts — no manual coordinate mapping |
| Moving average computation | Complex EMA recursion formula | `_computeSMA()` helper for SMA; single-pass formula for EMA | The computation itself is not complex, but the integration with streaming (recompute on each flush from `_ohlcBuffer`) must be correct |
| Zoom/pan synchronization | Manual zoom state tracking | ECharts `DataZoomComponent` with `xAxisIndex: [0, 1]` | Already registered in canvas-core; just configure in the option |

**Key insight:** Phase 94 follows the three-file pattern from previous phases. The unique complexity is the multi-panel layout (two grids, two xAxis, two yAxis) and the requirement to recompute volume/MA from the full OHLC buffer on every streaming flush. The `pushData()` override is the correct mechanism for this — it ensures all three series (candlestick, volume, MA) are updated atomically.

---

## Common Pitfalls

### Pitfall 1: BarChart / LineChart Not Registered
**What goes wrong:** Volume bars or MA lines silently fail to render. No ECharts error is thrown; the series simply does not appear.
**Why it happens:** ECharts tree-shaking requires every chart type used via `type: 'bar'` or `type: 'line'` to be explicitly registered via `use([BarChart, LineChart])`. `CandlestickChart` alone does not pull them in.
**How to avoid:** Register `CandlestickChart`, `BarChart`, AND `LineChart` in `candlestick-registry.ts`.
**Warning signs:** Volume panel is empty after setting `show-volume` prop; MA line areas are blank after setting `moving-averages` prop.

### Pitfall 2: Volume Series on Wrong Grid/Axis Index
**What goes wrong:** Volume bars appear inside the main candlestick chart area instead of the separate panel, or they appear at the wrong scale.
**Why it happens:** If the volume `bar` series does not specify `xAxisIndex: 1` and `yAxisIndex: 1`, it defaults to index 0 — the candlestick grid. The bar heights are driven by the price scale (e.g., $40,000) vs volume scale (e.g., 1000 units) — wildly mismatched.
**How to avoid:** Volume bar series MUST set `xAxisIndex: 1, yAxisIndex: 1` explicitly.
**Warning signs:** Volume bars appear on the price chart at the wrong scale; volume panel grid is visible but empty.

### Pitfall 3: DataZoom Not Synchronized Across Both Panels
**What goes wrong:** Scrolling or zooming the price chart does not scroll the volume panel (or vice versa). The two panels show different time ranges.
**Why it happens:** Default `dataZoom` without explicit `xAxisIndex` only binds to `xAxis[0]`. The volume `xAxis[1]` remains unbound and does not respond to zoom events.
**How to avoid:** Set `dataZoom: [{ type: 'inside', xAxisIndex: [0, 1] }, { type: 'slider', xAxisIndex: [0, 1] }]` in the option so both axes are controlled together.
**Warning signs:** After zooming, price and volume panels show different bar counts.

### Pitfall 4: MA Computed Only Once (Not on Each Streaming Flush)
**What goes wrong:** After calling `pushData()` to append new bars, the MA lines do not update (they still show only the initial data). Or the MA lines are correct for the initial data but freeze after streaming starts.
**Why it happens:** `_applyData()` computes MA from `this.data` during initial render but `_flushBarUpdates()` does not recompute MA from `_ohlcBuffer`. The option builder is called with stale MA data.
**How to avoid:** `_flushBarUpdates()` must call `buildCandlestickOption(this._ohlcBuffer, ...)` — the option builder always recomputes MA from the bars passed to it. Since `_ohlcBuffer` is the up-to-date buffer, MA will be correct after each flush.
**Warning signs:** MA lines visually stop updating after `pushData()` is called; new bars have no MA coverage.

### Pitfall 5: _barRafId Leak on Disconnect
**What goes wrong:** After `disconnectedCallback()`, a pending RAF fires and calls `this._chart.setOption(...)` on a disposed chart — either a no-op or a console error.
**Why it happens:** Same as `LuiHeatmapChart._cellRafId` — the base class cancels its own `_rafId` but has no knowledge of `_barRafId` on the subclass.
**How to avoid:** Override `disconnectedCallback()`, cancel `_barRafId`, then call `super.disconnectedCallback()`.
**Warning signs:** Console errors about methods called on a disposed ECharts instance after component removal.

### Pitfall 6: bull-color / bear-color Attribute Parsing
**What goes wrong:** `bull-color` and `bear-color` HTML attributes arrive as strings. If used directly as `itemStyle.color`, the ECharts types expect `ZRColor` (string | LinearGradientObject | ...). Raw strings are valid `ZRColor` — no parsing needed. The pitfall is treating them as requiring parsing when they don't.
**Why it happens:** Confusion from Phase 93 where `color-range` needed comma-splitting. `bull-color` and `bear-color` are single color values — no parsing required.
**How to avoid:** Declare `@property({ attribute: 'bull-color' }) bullColor: string | null = null` and use `bullColor ?? '#26a69a'` as the fallback in `_applyData()`. No `_parseColorRange()`-style parsing needed.
**Warning signs:** None — this is a common misconception pitfall, not a runtime error. Just don't add unnecessary parsing.

### Pitfall 7: CandlestickDataValue Order — [open, close, low, high] NOT [open, high, low, close]
**What goes wrong:** Candlestick bars render with incorrect wick positions — the high wick might appear at the close price instead of the actual high.
**Why it happens:** ECharts candlestick data order is `[open, close, low, high]` — NOT `[open, high, low, close]` (OHLC acronym order). This is counterintuitive.
**How to avoid:** `OhlcBar = [open, close, low, high]` — document this explicitly in the type definition. Verify with `CandlestickDataValue = OptionDataValue[]` from the ECharts type source.
**Warning signs:** Bars render with visually incorrect wick placement; candles show negative bodies when the data is correct.

---

## Code Examples

Verified patterns from ECharts type declarations in the installed package:

### CandlestickChart Module Registration (verified from echarts/types/dist/charts.d.ts line 1)
```typescript
// Source: echarts/types/dist/charts.d.ts line 1
// install$14 as CandlestickChart, CandlestickSeriesOption confirmed

let _candlestickRegistered = false;

export async function registerCandlestickModules(): Promise<void> {
  if (_candlestickRegistered) return;
  _candlestickRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ CandlestickChart, BarChart, LineChart }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/core'),
  ]);

  use([CandlestickChart, BarChart, LineChart]);
}
```

### CandlestickSeriesOption — Bull/Bear Colors (verified from shared.d.ts lines 10428-10460)
```typescript
// Source: echarts/types/dist/shared.d.ts lines 10428-10460
// CandlestickItemStyleOption { color0?: ZRColor; borderColor0?: ColorString; borderColorDoji?: ZRColor }
// CandlestickSeriesOption { type: 'candlestick'; data: CandlestickDataValue[] }
// CandlestickDataValue = OptionDataValue[] — four values: [open, close, low, high]

const candlestickSeries = {
  type: 'candlestick' as const,
  xAxisIndex: 0,
  yAxisIndex: 0,
  data: bars.map((b) => b.ohlc), // [open, close, low, high][]
  itemStyle: {
    color: bullColor,           // rising candle body fill
    color0: bearColor,          // falling candle body fill
    borderColor: bullColor,     // rising wick/border
    borderColor0: bearColor,    // falling wick/border
  },
};
```

### Multi-Grid Layout for Volume Panel (verified from shared.d.ts lines 3018-3035)
```typescript
// Source: echarts/types/dist/shared.d.ts lines 3018-3035
// GridOption: { top?, height?, containLabel? }
// CartesianAxisOption: { gridIndex?, xAxisIndex?, yAxisIndex? }
// SeriesOnCartesianOptionMixin: { xAxisIndex?: number; yAxisIndex?: number }

const labels = bars.map((b) => b.label);

const option = {
  grid: [
    { top: '5%',  height: '60%', containLabel: true },   // grid[0]: candlestick
    { top: '73%', height: '22%', containLabel: true },   // grid[1]: volume
  ],
  xAxis: [
    { type: 'category', data: labels, gridIndex: 0, boundaryGap: false },  // xAxis[0]
    { type: 'category', data: labels, gridIndex: 1, boundaryGap: false },  // xAxis[1]
  ],
  yAxis: [
    { scale: true, gridIndex: 0 },   // yAxis[0]: price scale
    { scale: true, gridIndex: 1 },   // yAxis[1]: volume scale
  ],
  dataZoom: [
    { type: 'inside', xAxisIndex: [0, 1] },   // sync zoom on both x axes
    { type: 'slider', xAxisIndex: [0, 1], bottom: 2 },
  ],
};
```

### Moving Average Computation (SMA)
```typescript
// _computeSMA: pure function — no dependencies
// Returns null for the warm-up period (first period-1 bars)
function _computeSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    const slice = closes.slice(i - period + 1, i + 1);
    return slice.reduce((sum, v) => sum + v, 0) / period;
  });
}

// MA line series — added alongside candlestick series:
const maSeries = (maConfigs ?? []).map((ma) => {
  const closes = bars.map((b) => b.ohlc[1]); // ohlc[1] = close price
  return {
    name: `MA${ma.period}`,
    type: 'line' as const,
    xAxisIndex: 0,
    yAxisIndex: 0,
    data: _computeSMA(closes, ma.period),
    smooth: true,
    lineStyle: { color: ma.color, width: 1.5, opacity: 0.85 },
    symbol: 'none',
    tooltip: { show: true },
  };
});
```

### moving-averages Attribute Parsing
```typescript
// moving-averages prop arrives as JSON string from HTML or object array from JS
// e.g., HTML: moving-averages='[{"period":20,"color":"#ff9800"},{"period":50,"color":"#2196f3"}]'
// Property: movingAverages: string | null = null  (no type converter)

function _parseMovingAverages(raw: string | null): MAConfig[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
```

### LuiCandlestickChart — Class Sketch
```typescript
// mirrors LuiHeatmapChart pattern with:
// - own _ohlcBuffer and _barRafId
// - pushData() override (no super.pushData())
// - disconnectedCallback() cancels _barRafId before super.disconnectedCallback()
// - _applyData() syncs _ohlcBuffer from this.data

export class LuiCandlestickChart extends BaseChartElement {
  @property({ attribute: 'bull-color' }) bullColor: string | null = null;
  @property({ attribute: 'bear-color' }) bearColor: string | null = null;
  @property({ type: Boolean, attribute: 'show-volume' }) showVolume = false;
  // moving-averages arrives as JSON string; attribute: 'moving-averages'
  // No type converter — JSON.parse in _parseMovingAverages()
  @property({ attribute: 'moving-averages' }) movingAverages: string | null = null;

  private _ohlcBuffer: CandlestickBarPoint[] = [];
  private _barRafId?: number;

  protected override async _registerModules(): Promise<void> {
    await registerCandlestickModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!this._chart) return;
    const watchProps = ['data', 'bullColor', 'bearColor', 'showVolume', 'movingAverages'] as const;
    if (watchProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart) return;
    this._ohlcBuffer = this.data ? [...(this.data as CandlestickBarPoint[])] : [];
    const option = buildCandlestickOption(this._ohlcBuffer, {
      bullColor: this.bullColor ?? undefined,
      bearColor: this.bearColor ?? undefined,
      showVolume: this.showVolume,
      movingAverages: _parseMovingAverages(this.movingAverages),
    });
    this._chart.setOption(option, { notMerge: false });
  }

  override pushData(point: unknown): void {
    const bar = point as CandlestickBarPoint;
    this._ohlcBuffer.push(bar);
    if (this._ohlcBuffer.length > this.maxPoints) {
      this._ohlcBuffer = this._ohlcBuffer.slice(-this.maxPoints);
    }
    if (this._barRafId === undefined) {
      this._barRafId = requestAnimationFrame(() => {
        this._flushBarUpdates();
        this._barRafId = undefined;
      });
    }
  }

  private _flushBarUpdates(): void {
    if (!this._chart || this._ohlcBuffer.length === 0) return;
    const option = buildCandlestickOption(this._ohlcBuffer, {
      bullColor: this.bullColor ?? undefined,
      bearColor: this.bearColor ?? undefined,
      showVolume: this.showVolume,
      movingAverages: _parseMovingAverages(this.movingAverages),
    });
    this._chart.setOption(option, { lazyUpdate: true } as object);
  }

  override disconnectedCallback(): void {
    if (this._barRafId !== undefined) {
      cancelAnimationFrame(this._barRafId);
      this._barRafId = undefined;
    }
    super.disconnectedCallback();
  }
}
```

### index.ts Additions (Phase 94)
```typescript
// packages/charts/src/index.ts — append after Phase 93 exports:

// Phase 94: Candlestick Chart
export { LuiCandlestickChart } from './candlestick/candlestick-chart.js';
export type { OhlcBar, MAConfig, CandlestickBarPoint, CandlestickOptionProps } from './shared/candlestick-option-builder.js';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import * as echarts from 'echarts'` (full bundle) | Tree-shaken subpath imports + `use([CandlestickChart, BarChart, LineChart])` | ECharts 5.0 (2021) | Only candlestick + bar + line included; ~160-180KB gzip vs ~400KB |
| Manual SMA computation with external library | `_computeSMA()` pure function in option builder | Project convention | No extra dependency; SMA is 5 lines; keep in builder, not in component |
| Separate chart instances for price and volume | Single ECharts instance with multi-grid layout | ECharts design (multi-grid is built-in) | Single instance = single DataZoom controller synchronizes both panels automatically |
| `bullColor`/`bearColor` as ECharts property names | `color` / `color0` as ECharts property names, `bull-color`/`bear-color` as component attributes | ECharts design | Component API uses intuitive names; option builder translates to ECharts native names |

**Deprecated/outdated:**
- Using `itemStyle.upColor`/`itemStyle.downColor` — these are NOT valid ECharts candlestick properties. The correct names are `color` (bull) and `color0` (bear) on `CandlestickItemStyleOption`.
- Using a single yAxis with two scales — always use separate grids for price and volume panels to avoid scale interference.

---

## Open Questions

1. **Volume bar coloring (bull/bear matched or neutral)**
   - What we know: Volume bars can be uniformly colored or can match the candle direction (bull bars green, bear bars red). ECharts supports per-item styling via `itemStyle` callback.
   - What's unclear: Which approach the project expects. The requirement says "volume panel" without specifying color behavior.
   - Recommendation: Default to a single neutral color (e.g., `'rgba(150,150,150,0.5)'`) for the volume bars. The `option` prop passthrough (CHART-02) allows developers to customize per-bar colors if needed. This avoids complexity in Phase 94 scope.

2. **EMA vs SMA only**
   - What we know: EMA requires tracking previous EMA value recursively: `ema[i] = close[i] * k + ema[i-1] * (1 - k)` where `k = 2 / (period + 1)`. It is slightly more complex than SMA but still a simple single-pass algorithm.
   - What's unclear: Whether Phase 94 scope requires EMA. CNDL-03 says "SMA/EMA" but does not specify whether both are mandatory.
   - Recommendation: Implement both `_computeSMA()` and `_computeEMA()` in `candlestick-option-builder.ts`. The `MAConfig.type` field selects which to use. Both are simple enough to include.

3. **Single-panel layout when `show-volume` is false**
   - What we know: When `showVolume` is false, there is no second grid and only one pair of axes. The option builder must produce different grid/axis configurations depending on `showVolume`.
   - What's unclear: Whether to unify the grid layout or branch on `showVolume`.
   - Recommendation: Branch in `buildCandlestickOption()` — when `showVolume: false`, produce a single-grid option; when `showVolume: true`, produce a two-grid option. This is simpler than always using two grids with one empty.

---

## Validation Architecture

> Skipped — `workflow.nyquist_validation` is not present in `.planning/config.json` (validation mode not enabled for this project).

---

## Sources

### Primary (HIGH confidence)
- `packages/charts/node_modules/echarts/types/dist/charts.d.ts` line 1 — `CandlestickChart`, `BarChart`, `LineChart` named exports confirmed from `install$14`, `install$1`, `install` respectively
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` lines 10428-10460 — `CandlestickDataValue = OptionDataValue[]`, `CandlestickItemStyleOption { color0, borderColor0, borderColorDoji }`, `CandlestickSeriesOption { type: 'candlestick', coordinateSystem: 'cartesian2d', data }` fully confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` lines 7320-7325 — `SeriesOnCartesianOptionMixin { xAxisIndex?: number; yAxisIndex?: number }` confirmed — proves `xAxisIndex`/`yAxisIndex` on series for multi-panel binding
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` lines 3018-3035 — `GridOption { containLabel?, top?, height? }` confirmed; `ECBasicOption.grid?: GridOption | GridOption[]` confirmed at line 11049 — multi-grid is natively supported
- `packages/charts/src/base/base-chart-element.ts` — `pushData()` is public and overridable; `_flushPendingData()` is private; `maxPoints` is accessible; `disconnectedCallback()` cancels its own `_rafId` only
- `packages/charts/src/heatmap/heatmap-chart.ts` — Phase 93 `pushData()` override pattern (no `super.pushData()`, own RAF handle, cancelled in `disconnectedCallback()`) — direct model for Phase 94
- `packages/charts/src/registry/canvas-core.ts` — `DataZoomComponent` already registered in canvas-core; no additional registration needed for zoom

### Secondary (MEDIUM confidence)
- Project STATE.md accumulated decisions — attribute:false for array/object properties; JSON string attribute pattern; kebab-case attribute names; string | null for single-value color props; no `type` converter for non-boolean primitives
- Phase 93 RESEARCH.md — confirmed base class `_flushPendingData()` is private; confirmed `pushData()` override pattern; confirmed `disconnectedCallback()` RAF cancellation requirement

### Tertiary (LOW confidence)
- ECharts financial chart DataZoom `xAxisIndex: [0, 1]` sync pattern — standard community pattern for financial candlestick + volume charts; verified consistent with `DataZoomComponentOption { xAxisIndex?: number[] | 'all' }` in shared.d.ts line 6041

---

## Metadata

**Confidence breakdown:**
- Standard stack (CandlestickChart + BarChart + LineChart): HIGH — all three confirmed in installed echarts@5.6.0 type declarations; no new packages needed
- Architecture (three-file pattern): HIGH — mirrors Phase 91/92/93 exactly; only additions are multi-chart registration and multi-series option building
- OHLC data format [open, close, low, high]: HIGH — directly confirmed from `CandlestickDataValue = OptionDataValue[]` in shared.d.ts with context showing the four-element order
- Bull/bear color properties (color / color0): HIGH — directly confirmed from `CandlestickItemStyleOption { color0?: ZRColor; borderColor0?: ColorString }` in shared.d.ts
- Multi-grid volume panel: HIGH — `ECBasicOption.grid?: GridOption | GridOption[]` confirmed; `SeriesOnCartesianOptionMixin.xAxisIndex/yAxisIndex` confirmed
- MA computation (SMA/EMA in option builder): HIGH — pure function, no external dependencies; pattern established
- pushData() override for multi-series streaming: HIGH — base class code confirmed; same pattern as Phase 93 heatmap override

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (echarts@5.6.0 pinned; architecture stable)
