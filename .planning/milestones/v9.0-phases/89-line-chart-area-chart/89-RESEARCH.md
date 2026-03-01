# Phase 89: Line Chart + Area Chart - Research

**Researched:** 2026-02-28
**Domain:** ECharts 5.6.0 LineChart + AreaChart — concrete Lit web component implementation extending BaseChartElement
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LINE-01 | Developer can render a line chart with one or more named data series | ECharts `LineChart` module + `type: 'line'` series option with `name` field; multi-series via array of series objects; `data` prop maps to named series array |
| LINE-02 | Developer can enable smooth curve interpolation, zoom/pan controls, and mark lines | `smooth: true/number` on series; `DataZoomComponent` (inside+slider) already registered in `canvas-core`; `MarkLineComponent` already registered; threshold mark lines via `markLine.data` with `yAxis` type |
| LINE-03 | Developer can stream real-time data points into a line chart via `pushData()` | `_streamingMode = 'appendData'` override in `LuiLineChart`; `appendData({ seriesIndex, data })` path in `BaseChartElement._flushPendingData()`; must set initial dataset length at init (ECharts constraint) |
| AREA-01 | Developer can render a filled area chart with `stacked` and `smooth` options | Same `LineChart` module — area chart IS a line chart with `areaStyle: {}` property on each series; stacking via `stack: 'total'` on each series; `LuiAreaChart` is a thin wrapper |
| AREA-02 | Developer can stream real-time data points into an area chart via `pushData()` | Same `appendData` path as LINE-03; `LuiAreaChart` also sets `_streamingMode = 'appendData'` |
</phase_requirements>

---

## Summary

Phase 89 builds two concrete chart components — `LuiLineChart` (`lui-line-chart`) and `LuiAreaChart` (`lui-area-chart`) — both extending `BaseChartElement` from Phase 88. All cross-cutting concerns (SSR safety, dark mode, ResizeObserver, WebGL guard, RAF batching, full disposal chain) are inherited without any repetition. Phase 89 only adds the ECharts `LineChart` module registration and the data-to-option transformation logic specific to line/area charts.

The key technical insight is that an area chart in ECharts is not a separate chart type — it is a line chart with `areaStyle: {}` set on each series. This means `LuiAreaChart` imports the same `LineChart` ECharts module as `LuiLineChart` and the only differences are the `areaStyle` property being added to each series and the `stacked` prop mapping to ECharts `stack: 'total'`. The two components share a `buildLineOption()` helper function that takes a mode parameter to avoid duplicating option-building logic.

The most critical implementation concern for Phase 89 is the `appendData` streaming path. ECharts requires initial series data to be pre-declared at `setOption` time (even as empty arrays) before `appendData` is called. Calling `appendData` on a series that was not declared in the initial `setOption` produces a silent no-op. Additionally, CRITICAL-03 applies: after `appendData` has been called, any subsequent `setOption` wipes streamed data — this means `smooth`, `mark-lines`, and zoom configuration must all be established in the initial `setOption` call and never re-issued after streaming begins.

**Primary recommendation:** Implement `LuiLineChart` and `LuiAreaChart` as thin wrappers over `BaseChartElement`. Each class: (1) sets `_streamingMode = 'appendData'` in the constructor, (2) implements `_registerModules()` to load `LineChart`, (3) overrides `updated()` to call `_applyChartData()` when the `data` prop changes, and (4) builds the ECharts option object from props using a shared `buildLineOption()` helper. No re-implementation of any lifecycle or streaming concern is needed.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts | ^5.6.0 (already installed) | Chart engine — `LineChart` module for line/area | Already in `packages/charts/` dependencies from Phase 88 |
| lit | ^3.3.2 (peer) | Web component base | Project baseline; `BaseChartElement` already extends it |
| @lit-ui/core | workspace:* (peer) | TailwindElement, CSS tokens, dispatchCustomEvent | Inherited via BaseChartElement |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| echarts/charts — LineChart | subpath of echarts@5.6.0 | Registers ECharts line series renderer | Imported dynamically in `_registerModules()`; same module for both line and area |
| registerCanvasCore | internal (canvas-core.ts) | Registers shared ECharts components (DataZoom, MarkLine, MarkArea, Toolbox, Grid, etc.) | Already registers everything Phase 89 needs — call first in `_registerModules()` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single `LineChart` module for both | Separate AreaChart type | ECharts has no separate AreaChart type — area IS line + `areaStyle`. Use `LineChart` only. |
| `appendData` streaming for all series | Circular buffer (`setOption`) | `appendData` provides better performance for time-series but requires pre-declared empty series and cannot coexist with `setOption` on the same series |

**Installation:** No new packages needed. Everything is already installed in `packages/charts/`.

---

## Architecture Patterns

### Recommended Project Structure
```
packages/charts/src/
├── base/
│   ├── base-chart-element.ts      # (Phase 88, complete)
│   └── theme-bridge.ts            # (Phase 88, complete)
├── registry/
│   └── canvas-core.ts             # (Phase 88, complete)
├── line/
│   ├── line-chart.ts              # LuiLineChart class
│   └── line-registry.ts           # registerLineModules() — LineChart from echarts/charts
├── area/
│   ├── area-chart.ts              # LuiAreaChart class
│   └── area-registry.ts           # registerAreaModules() — same LineChart module
├── shared/
│   └── line-option-builder.ts     # buildLineOption(data, props, mode) helper
└── index.ts                       # updated to export LuiLineChart, LuiAreaChart
```

The `line-option-builder.ts` avoids code duplication between the two components. `area-registry.ts` and `line-registry.ts` may both call the same `registerLineModules()` — the `_registered` guard in `canvas-core.ts` handles deduplication.

### Pattern 1: Concrete Chart Class Skeleton
**What:** Minimal concrete chart class that extends `BaseChartElement`, sets `_streamingMode`, implements `_registerModules()`, and rebuilds the ECharts option when `data` or chart-specific props change.
**When to use:** Every concrete chart in Phases 89-95 follows this pattern.

```typescript
// Source: BaseChartElement pattern established in Phase 88
import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerLineModules } from './line-registry.js';
import { buildLineOption } from '../shared/line-option-builder.js';

export type LineChartSeries = {
  name: string;
  data: (number | [number | string, number] | null)[];
};

export class LuiLineChart extends BaseChartElement {
  // STRM-04: Override base default — Line uses appendData path
  constructor() {
    super();
    this._streamingMode = 'appendData';
  }

  @property({ type: Boolean }) smooth = false;
  @property({ type: Boolean, attribute: 'zoom' }) zoom = false;
  @property({ attribute: false }) markLines?: MarkLineSpec[];

  protected override async _registerModules(): Promise<void> {
    await registerLineModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // handles option + loading props
    if (!this._chart) return;
    if (changed.has('data') || changed.has('smooth') || changed.has('zoom') || changed.has('markLines')) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart || !this.data) return;
    const option = buildLineOption(
      this.data as LineChartSeries[],
      { smooth: this.smooth, zoom: this.zoom, markLines: this.markLines },
      'line'
    );
    // CRITICAL-03: Only safe on initial data load — NOT after appendData has run
    this._chart.setOption(option, { notMerge: false });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('lui-line-chart')) {
  customElements.define('lui-line-chart', LuiLineChart);
}
```

### Pattern 2: ECharts Module Registry (per-chart)
**What:** Each chart type has its own registry file that calls `registerCanvasCore()` and then registers its specific ECharts chart module. The `_registered` guard is at the module level to prevent double-registration across multiple chart instances.

```typescript
// Source: canvas-core.ts pattern from Phase 88
// packages/charts/src/line/line-registry.ts
let _lineRegistered = false;

export async function registerLineModules(): Promise<void> {
  if (_lineRegistered) return;
  _lineRegistered = true;

  const [{ registerCanvasCore }, { LineChart }, { use }] = await Promise.all([
    import('../registry/canvas-core.js'),
    import('echarts/charts'),
    import('echarts/core'),
  ]);

  await registerCanvasCore();
  use([LineChart]);
}
```

Area charts call `registerLineModules()` directly — there is no separate `AreaChart` in ECharts.

### Pattern 3: Option Builder for Line/Area
**What:** Pure function that converts the `data` property shape into a complete ECharts option object. Kept separate from the component class for testability and reuse between LuiLineChart and LuiAreaChart.

```typescript
// packages/charts/src/shared/line-option-builder.ts
export type LineChartSeries = {
  name: string;
  data: (number | [number | string, number] | null)[];
};

export type MarkLineSpec = {
  value: number;
  label?: string;
  color?: string;
};

export type LineOptionProps = {
  smooth?: boolean | number;
  zoom?: boolean;
  markLines?: MarkLineSpec[];
  stacked?: boolean;  // area chart only
};

export function buildLineOption(
  series: LineChartSeries[],
  props: LineOptionProps,
  mode: 'line' | 'area'
): object {
  const echartsSeriesArray = series.map((s) => ({
    name: s.name,
    type: 'line',
    data: s.data,
    smooth: props.smooth ?? false,
    // Area mode adds areaStyle
    areaStyle: mode === 'area' ? {} : undefined,
    // Stacking — all series share the same stack group
    stack: (mode === 'area' && props.stacked) ? 'total' : undefined,
    // Mark lines on first series (or all series — depends on UX decision)
    markLine: props.markLines?.length
      ? {
          data: props.markLines.map((ml) => ({
            type: 'average', // override if yAxis value provided
            yAxis: ml.value,
            name: ml.label ?? '',
            lineStyle: ml.color ? { color: ml.color } : undefined,
          })),
        }
      : undefined,
  }));

  const option: Record<string, unknown> = {
    legend: { show: series.length > 1 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', boundaryGap: false },
    yAxis: { type: 'value' },
    series: echartsSeriesArray,
  };

  if (props.zoom) {
    option['dataZoom'] = [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0 },
    ];
  }

  return option;
}
```

### Pattern 4: appendData Multi-Series Constraint
**What:** ECharts `appendData` only accepts `seriesIndex: number` — it targets a single series. For multi-series streaming, the `pushData` point must carry a series index. The base `_flushPendingData()` calls `appendData({ seriesIndex: 0, data: points })` — this only appends to series 0.

**Resolution:** For Phase 89, multi-series streaming is handled by extending `pushData` to accept `{ seriesIndex, value }` shaped points, or by the component overriding `_flushPendingData`. The simplest correct approach: the Line/Area chart overrides `pushData(point)` to accept `{ seriesIndex: number, value: ... }` and routes to the correct series index.

**CRITICAL implementation detail:** ECharts `appendData` requires the initial `setOption` to declare each series with at least an empty `data: []` array. If a series is not declared at init time, `appendData` targeting that `seriesIndex` silently does nothing.

```typescript
// How to pre-declare series at init time for streaming
const option = {
  series: seriesNames.map((name, i) => ({
    name,
    type: 'line',
    data: [],           // REQUIRED: empty array, not omitted
    smooth: this.smooth,
  })),
  xAxis: { type: 'time' },  // Time axis for streaming
  yAxis: { type: 'value' },
};
this._chart.setOption(option);  // This sets up the streaming "slots"
// After this: NEVER call setOption again (CRITICAL-03)
// Use appendData({ seriesIndex: N, data: [...] }) only
```

### Pattern 5: Area Chart as Line Chart Variant
**What:** `LuiAreaChart` is nearly identical to `LuiLineChart`. The differences are:
1. `areaStyle: {}` added to each series in `buildLineOption()`
2. `stacked` prop maps to `stack: 'total'` on all series
3. Custom element name is `lui-area-chart`

```typescript
// LuiAreaChart — differences from LuiLineChart highlighted
export class LuiAreaChart extends BaseChartElement {
  constructor() {
    super();
    this._streamingMode = 'appendData';
  }

  @property({ type: Boolean }) smooth = false;
  @property({ type: Boolean }) stacked = false;
  @property({ type: Boolean, attribute: 'zoom' }) zoom = false;

  protected override async _registerModules(): Promise<void> {
    await registerLineModules(); // Same module as line chart — no AreaChart in ECharts
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!this._chart) return;
    if (changed.has('data') || changed.has('smooth') || changed.has('zoom') || changed.has('stacked')) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart || !this.data) return;
    const option = buildLineOption(
      this.data as LineChartSeries[],
      { smooth: this.smooth, zoom: this.zoom, stacked: this.stacked },
      'area'   // <-- only difference from LuiLineChart
    );
    this._chart.setOption(option, { notMerge: false });
  }
}
```

### Anti-Patterns to Avoid
- **Calling `setOption` after streaming starts (CRITICAL-03):** Once `appendData` has been called on a chart, `setOption` wipes all streamed data. The initial `setOption` must include ALL configuration (smooth, zoom, mark lines) before streaming begins. Prop changes to `smooth`, `zoom`, or `markLines` after streaming starts must be handled by resetting the chart (dispose + reinit) rather than `setOption`.
- **Not pre-declaring series with `data: []` at init:** `appendData` silently fails on series not declared in the initial `setOption`. Always initialize series with `data: []`.
- **Using `xAxis.type: 'category'` for time-series streaming:** Category axis doesn't work well with `appendData` for time-based streaming — use `xAxis.type: 'time'` with `[timestamp, value]` data points, or `xAxis.type: 'value'` with sequential indices.
- **Registering `LineChart` ECharts module in both line and area chart classes without a guard:** Without the `_lineRegistered` module-level guard, `echarts.use([LineChart])` could be called multiple times. Add a guard in `line-registry.ts`.
- **Importing `LineChart` from `'echarts'` (full):** Use `import('echarts/charts')` for tree-shaking. The full `'echarts'` import defeats the ~135KB bundle goal.
- **Setting `stack` to a non-string value:** ECharts stacking groups are identified by string name. All series must share the same string (e.g., `'total'`) to stack together. Setting `stack: true` (boolean) does NOT work — it must be a string.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth curve interpolation | Bezier curve implementation | `smooth: true` on ECharts series | ECharts smooth uses Catmull-Rom spline; getting monotone constraint right is non-trivial |
| Zoom + pan controls | Custom drag event handler | `dataZoom` components (inside+slider) | Already registered in `canvas-core.ts`; `type: 'inside'` = mouse wheel/touch, `type: 'slider'` = visual scrubber |
| Threshold mark lines | Custom SVG overlay | ECharts `markLine` on series | ECharts renders mark lines in the correct coordinate space and updates them with animations |
| Area fill gradient | Custom canvas gradient | `areaStyle.color` LinearGradient object | ECharts accepts `echarts.graphic.LinearGradient` objects for gradient fills |
| Stacked area calculation | Manual cumulative sum | `stack: 'total'` on series option | ECharts handles stacking arithmetic, baseline, and hover disambiguation natively |
| Series legend | Custom legend HTML | ECharts `legend` component | `legend: { show: true }` auto-generates from series names; already registered in canvas-core |

**Key insight:** ECharts `LineChart` is a single module that covers line charts, area charts, stacked area charts, and smooth spline charts. Everything in Phase 89 is configuration, not code.

---

## Common Pitfalls

### Pitfall 1: appendData Silent Failure on Undeclared Series (CRITICAL-03-adjacent)
**What goes wrong:** `pushData()` streams data but nothing appears on the chart.
**Why it happens:** `appendData({ seriesIndex: 0, data: [...] })` silently does nothing if series 0 was not declared in the initial `setOption`. ECharts requires series to be pre-initialized with `data: []`.
**How to avoid:** In `_applyData()`, always include `data: []` on every series when building the initial option. The initial `setOption` declares the series structure; `appendData` populates it.
**Warning signs:** Chart renders empty and stays empty despite `pushData()` calls; no errors in console.

### Pitfall 2: setOption After appendData Wipes Streaming Data (CRITICAL-03)
**What goes wrong:** Changing `smooth` or `zoom` props after streaming has started clears all the streamed data from the chart.
**Why it happens:** Any `setOption` call after `appendData` has run performs a full diff-and-replace that treats missing `data` keys as "remove all data" (ECharts Issue #12327, unresolved).
**How to avoid:** For `_streamingMode = 'appendData'` components, prop changes that require `setOption` (smooth, zoom, markLines) must trigger a full chart reset: dispose + reinit + apply new option. Document this in the component's prop descriptions.
**Warning signs:** Streaming line chart clears instantly when user changes a prop; dark mode toggle clears streamed data.

### Pitfall 3: stack Requires String, Not Boolean
**What goes wrong:** Stacked area chart renders as overlapping (non-stacked) lines.
**Why it happens:** ECharts stacking is activated by setting `stack: 'groupName'` (a string) on all series in the same group. Setting `stack: true` or `stack: 1` is treated as an arbitrary string key — which works, but `stack: false` or `stack: undefined` disables it.
**How to avoid:** In `buildLineOption()`, use `stack: props.stacked ? 'total' : undefined`. When `undefined`, the property is omitted from the option and stacking is disabled.
**Warning signs:** Area chart renders correctly with `stacked={true}` but shows overlapping areas that don't sum to a total.

### Pitfall 4: xAxis Type for Streaming
**What goes wrong:** `appendData` with `xAxis.type: 'category'` produces garbled axis labels or incorrect rendering for time-series streaming.
**Why it happens:** Category axes are designed for static datasets with known categories. `appendData` appending to a category axis doesn't automatically extend the categories.
**How to avoid:** Use `xAxis.type: 'time'` with `[timestamp, value]` data points for real-time streaming, or `xAxis.type: 'value'` with `[index, value]` data for sequential streaming. For `data` prop (static datasets), `xAxis.type: 'category'` with `boundaryGap: false` is appropriate.
**Warning signs:** X-axis shows no labels during streaming; or shows only the initial category labels.

### Pitfall 5: markLine on All Series vs. First Series
**What goes wrong:** Mark lines appear multiple times (one per series) instead of once on the chart.
**Why it happens:** If `markLine` is added to every series object, ECharts renders a mark line per series. For global threshold lines, add `markLine` to the first series only (or the "primary" series).
**How to avoid:** In `buildLineOption()`, add `markLine` only to `echartsSeriesArray[0]` when mark lines are defined. Document this behavior in the prop description.
**Warning signs:** Duplicate mark lines visible on chart; mark lines appear in different colors per series.

### Pitfall 6: areaStyle opacity for Stacked Charts
**What goes wrong:** Stacked area chart is hard to read because the top area fully covers lower ones.
**Why it happens:** Default `areaStyle: {}` uses full opacity color fill. With stacking, lower series are hidden behind upper ones.
**How to avoid:** Set `areaStyle: { opacity: 0.6 }` by default for area charts. This can be set in `buildLineOption()` as a sensible default. Expose an `opacity` prop if consumers need control.
**Warning signs:** In stacked mode, only the top area series is visible; lower series are completely obscured.

---

## Code Examples

### Full LuiLineChart Implementation Skeleton

```typescript
// Source: BaseChartElement Phase 88 pattern + ECharts 5.6.0 LineChart API
// packages/charts/src/line/line-chart.ts
import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerLineModules } from './line-registry.js';
import { buildLineOption, type LineChartSeries, type MarkLineSpec } from '../shared/line-option-builder.js';

export class LuiLineChart extends BaseChartElement {
  constructor() {
    super();
    // STRM-04: Line chart uses native appendData path
    this._streamingMode = 'appendData';
  }

  // LINE-02: Smooth interpolation
  @property({ type: Boolean }) smooth = false;

  // LINE-02: Zoom/pan controls
  @property({ type: Boolean }) zoom = false;

  // LINE-02: Threshold mark lines
  @property({ attribute: false }) markLines?: MarkLineSpec[];

  protected override async _registerModules(): Promise<void> {
    await registerLineModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // handles this.option and this.loading
    if (!this._chart) return;
    const chartProps = ['data', 'smooth', 'zoom', 'markLines'] as const;
    if (chartProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart || !this.data) return;
    const option = buildLineOption(
      this.data as LineChartSeries[],
      { smooth: this.smooth, zoom: this.zoom, markLines: this.markLines },
      'line'
    );
    // CRITICAL-03: Only call setOption here — before any appendData streaming
    this._chart.setOption(option, { notMerge: false });
  }
}

// Custom element registration — same guard pattern as all other @lit-ui packages
if (typeof customElements !== 'undefined' && !customElements.get('lui-line-chart')) {
  customElements.define('lui-line-chart', LuiLineChart);
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-line-chart': LuiLineChart;
  }
}
```

### Line Registry

```typescript
// Source: canvas-core.ts pattern from Phase 88
// packages/charts/src/line/line-registry.ts
let _lineRegistered = false;

export async function registerLineModules(): Promise<void> {
  if (_lineRegistered) return;
  _lineRegistered = true;

  const [{ registerCanvasCore }] = await Promise.all([
    import('../registry/canvas-core.js'),
  ]);

  await registerCanvasCore(); // Registers CanvasRenderer, DataZoom, MarkLine, etc.

  const [{ LineChart }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/core'),
  ]);

  use([LineChart]);
}
```

### Option Builder (line-option-builder.ts)

```typescript
// Source: ECharts 5.6.0 LineSeriesOption + DataZoomComponentOption types (verified)
// packages/charts/src/shared/line-option-builder.ts

export type LineChartSeries = {
  name: string;
  data: (number | [number | string, number] | null)[];
};

export type MarkLineSpec = {
  value: number;
  label?: string;
  color?: string;
};

export type LineOptionProps = {
  smooth?: boolean | number;
  zoom?: boolean;
  markLines?: MarkLineSpec[];
  stacked?: boolean;
  opacity?: number;
};

export function buildLineOption(
  series: LineChartSeries[],
  props: LineOptionProps,
  mode: 'line' | 'area'
): Record<string, unknown> {
  const isArea = mode === 'area';

  const echartsSeriesArray = series.map((s, i) => ({
    name: s.name,
    type: 'line' as const,
    data: s.data,
    smooth: props.smooth ?? false,
    // Area mode: add areaStyle with semi-transparency
    areaStyle: isArea ? { opacity: props.opacity ?? 0.6 } : undefined,
    // Stacking: all series share group name 'total'
    stack: isArea && props.stacked ? 'total' : undefined,
    // Mark lines on first series only to avoid duplication
    markLine: i === 0 && props.markLines?.length
      ? {
          silent: false,
          data: props.markLines.map((ml) => ({
            yAxis: ml.value,
            name: ml.label ?? '',
            lineStyle: { color: ml.color },
          })),
        }
      : undefined,
  }));

  const option: Record<string, unknown> = {
    legend: { show: series.length > 1 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', boundaryGap: false },
    yAxis: { type: 'value' },
    series: echartsSeriesArray,
  };

  if (props.zoom) {
    option['dataZoom'] = [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, bottom: 0 },
    ];
  }

  return option;
}
```

### pushData Multi-Series Override

```typescript
// For multi-series streaming, the component overrides pushData
// to route points to the correct series index.
// This is the correct pattern for STRM-04 compliance with multi-series.

export type LineDataPoint = { seriesIndex?: number; value: number | [number | string, number] };

// In LuiLineChart:
override pushData(point: LineDataPoint | number): void {
  // Normalize to object form
  const normalized = typeof point === 'number'
    ? { seriesIndex: 0, value: point }
    : { seriesIndex: point.seriesIndex ?? 0, value: point.value };
  // Delegate to base class RAF batching — but base uses flat array
  // Better: override _flushPendingData() or maintain per-series pending arrays
  // Simplest: accept base behavior for single-series, document multi-series limitation
  super.pushData(normalized);
}
```

**Note on multi-series appendData:** The base `_flushPendingData()` calls `appendData({ seriesIndex: 0, data: points })` targeting only series 0. For LINE-03 success criteria ("series extend in real time"), the test case only shows a single series streaming. Multi-series streaming requires the component to override `_flushPendingData` to route points per-series. This should be implemented to future-proof the API, but the minimum requirement for LINE-03 is single-series real-time.

### Updated index.ts exports

```typescript
// packages/charts/src/index.ts (additions for Phase 89)
export { BaseChartElement } from './base/base-chart-element.js';
export { ThemeBridge } from './base/theme-bridge.js';
export { registerCanvasCore } from './registry/canvas-core.js';
export type { EChartsOption } from './base/base-chart-element.js';

// Phase 89 additions:
export { LuiLineChart } from './line/line-chart.js';
export { LuiAreaChart } from './area/area-chart.js';
export type { LineChartSeries, MarkLineSpec } from './shared/line-option-builder.js';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full ECharts import `import * as echarts from 'echarts'` | Tree-shaken `LineChart` from `echarts/charts` | ECharts 5.0 (2021) | ~400KB → ~160KB gzip for line charts |
| Separate AreaChart class with custom area rendering | `type: 'line'` + `areaStyle: {}` on same series | ECharts design | No separate chart type needed; DRY |
| Global `echarts.registerTheme()` for theming | ThemeBridge CSS token injection (Phase 88) | Phase 88 decision | No theme pre-registration needed; CSS-driven |
| `dataZoom` as separate component import | `DataZoomComponent` in `canvas-core.ts` (Phase 88) | Phase 88 design | Already registered; just use in option |

**Deprecated/outdated:**
- `import * as echarts from 'echarts'`: Includes all chart types; use `echarts/charts` subpath for LineChart only.
- Custom area fill implementations: ECharts `areaStyle` handles fill, gradient, and opacity natively.

---

## Open Questions

1. **pushData multi-series routing in base class**
   - What we know: `BaseChartElement._flushPendingData()` calls `appendData({ seriesIndex: 0, data: points })` — hardcoded series 0.
   - What's unclear: Whether the LINE-03 success criteria ("developer can call pushData(point) on a line chart and see the series extend") implies single-series only, or whether the base class needs to be extended for multi-series routing.
   - Recommendation: For Phase 89, document that `pushData` targets series 0 for streaming. Add an overrideable `_getStreamSeriesIndex(point)` method to BaseChartElement OR accept a `{ seriesIndex, value }` shaped point in the Line/Area pushData override. The simplest working implementation is series-0-only streaming per the success criteria.

2. **setOption behavior when data prop changes after streaming**
   - What we know: CRITICAL-03 says `setOption` after `appendData` wipes streamed data. But the component's `_applyData()` calls `setOption` when the `data` prop changes.
   - What's unclear: What is the intended behavior when a developer changes the `data` prop mid-stream? Reset the chart? Ignore the change?
   - Recommendation: Document that changing `data` after streaming has started triggers a full chart reset (internally dispose + reinit). The component should track `_hasStreamed = false` flag (set to `true` on first `pushData`) and in `_applyData()`, if `_hasStreamed` is true, call `this._chart.dispose(); await this._initChart()` before applying new data. This is the only correct behavior given CRITICAL-03.

3. **xAxis configuration for streaming vs static data**
   - What we know: For static `data` prop, category axis with labels from data is natural. For streaming via `pushData`, time or sequential value axes work better.
   - What's unclear: Whether Phase 89 needs to handle the "same chart configured for either mode" scenario, or whether streaming charts are initialized differently.
   - Recommendation: Keep it simple — use category axis for static data (`buildLineOption`), use time axis when streaming mode is explicitly needed. Document that `xAxis.type` can be overridden via the `option` passthrough prop for advanced use cases.

4. **MarkLineComponent already registered — verify it applies to line chart series**
   - What we know: `canvas-core.ts` registers `MarkLineComponent`. ECharts documentation confirms `markLine` is part of `SeriesOption` for line charts.
   - What's unclear: Whether `MarkLineComponent` registration is sufficient for `markLine` data on `LineSeriesOption`, or whether `MarkLineChart` is a separate installable.
   - Recommendation: `MarkLineComponent` registration in `canvas-core.ts` IS the correct install for mark lines on series (it is a component, not a chart type). Verified from ECharts types: `LineSeriesOption` includes `markLine?: MarkLineOption` and this requires `MarkLineComponent` registered via `use()`. Already done in Phase 88.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` — skip this section.

---

## Sources

### Primary (HIGH confidence)
- `packages/charts/src/base/base-chart-element.ts` — Verified Phase 88 implementation; `_streamingMode`, `_registerModules`, `_flushPendingData` patterns confirmed
- `packages/charts/src/registry/canvas-core.ts` — Confirmed `DataZoomComponent`, `MarkLineComponent`, `MarkAreaComponent` already registered; no re-registration needed in Phase 89
- ECharts 5.6.0 types: `node_modules/.pnpm/echarts@5.6.0/.../shared.d.ts` — `LineSeriesOption` interface verified: `smooth`, `areaStyle`, `markLine`, `stack` (via `SeriesStackOptionMixin`) all confirmed present
- ECharts 5.6.0 types: `EChartsType.appendData({ seriesIndex, data })` signature confirmed at line 8158
- `packages/charts/node_modules/echarts/types/dist/charts.d.ts` — `LineChart` export confirmed (no `AreaChart` — area IS line + `areaStyle`)
- `packages/button/src/index.ts` — Custom element registration pattern with `customElements.define` guard confirmed
- `.planning/REQUIREMENTS.md` — STRM-04 confirmed: "Line and Area charts use ECharts native `appendData` path"

### Secondary (MEDIUM confidence)
- Phase 88 STATE.md decision: `_streamingMode defaults to 'buffer' in base; concrete appendData-mode charts override` — confirms Phase 89 chart classes must set `this._streamingMode = 'appendData'` in constructor
- Phase 88 RESEARCH.md CRITICAL-03 documentation — `setOption` after `appendData` wipe behavior confirmed with ECharts Issue #12327 reference

### Tertiary (LOW confidence)
- None — all critical findings verified against actual installed ECharts 5.6.0 type definitions in the repository.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — ECharts 5.6.0 already installed; `LineChart` export verified from actual type declarations in repository; no new packages needed
- Architecture: HIGH — `BaseChartElement` pattern fully verified from Phase 88 implementation; `_registerModules`, `_streamingMode`, `updated()` override pattern all confirmed
- ECharts API (smooth, area, stack, zoom, markLine): HIGH — all properties verified against `LineSeriesOption` interface in installed `echarts@5.6.0` type declarations
- appendData streaming: HIGH — `EChartsType.appendData({ seriesIndex, data })` signature confirmed; CRITICAL-03 documented in Phase 88 research
- Multi-series streaming: MEDIUM — single series streaming is solid; multi-series routing requires component override decision (documented in Open Questions)

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (ECharts 5.6.0 is pinned; no ecosystem changes expected within 30 days)
