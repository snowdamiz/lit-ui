# Phase 90: Bar Chart - Research

**Researched:** 2026-02-28
**Domain:** ECharts 5.6.0 BarChart — concrete Lit web component implementation extending BaseChartElement
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BAR-01 | Developer can render grouped, stacked, and horizontal bar charts | ECharts `BarChart` module with `type: 'bar'` series; `stack: 'total'` (string) for stacking; horizontal via swapping `xAxis.type: 'value'` and `yAxis.type: 'category'`; grouped is the default (no stack) |
| BAR-02 | Developer can display value labels on bars and enable per-bar color mode | `label: { show: true, position: 'top' }` on each series for value labels; `colorBy: 'data'` on series for per-bar distinct palette colors (from `SeriesOption.colorBy: 'series' | 'data'`) |
| BAR-03 | Developer can stream data updates into a bar chart via `pushData()` with circular buffer | Base class `_streamingMode = 'buffer'` (the default) provides circular buffer + `setOption({ series: [{ data }] }, { lazyUpdate: true })` — bar charts inherit this without any override; no `_streamingMode` change needed |
</phase_requirements>

---

## Summary

Phase 90 builds one concrete chart component — `LuiBarChart` (`lui-bar-chart`) — extending `BaseChartElement` from Phase 88. The pattern is identical to Phase 89: register the ECharts `BarChart` module in `_registerModules()`, build the ECharts option from props via a dedicated `buildBarOption()` helper, and call `this._chart.setOption(option)` in `updated()` when relevant props change.

The most significant Phase-90-specific insight is that bar charts use the **circular buffer streaming path** (base class default `_streamingMode = 'buffer'`), not the `appendData` path used by line/area charts. REQUIREMENTS.md STRM-04 explicitly states: "all other chart types use circular buffer + `setOption({ lazyUpdate: true })`". This means `LuiBarChart` does NOT override `_streamingMode` and does NOT call `appendData`. The base class handles all streaming automatically — `pushData()` accumulates points into `_circularBuffer` and calls `setOption({ series: [{ data: _circularBuffer }] }, { lazyUpdate: true })` on every RAF flush. The circular buffer also caps at `maxPoints` (default 1000) automatically.

The horizontal bar chart is implemented purely by swapping axis types in the ECharts option: `xAxis.type: 'value'` and `yAxis.type: 'category'` (versus the vertical default of `xAxis.type: 'category'` / `yAxis.type: 'value'`). No separate ECharts chart type is needed — it is the same `BarChart` module with different axis configuration. Stacking uses the same `stack: 'total'` string pattern as Phase 89's area chart.

**Primary recommendation:** Implement `LuiBarChart` following the exact Phase 89 concrete-chart pattern. Create `bar-registry.ts`, `bar-option-builder.ts`, and `bar-chart.ts`. Do NOT override `_streamingMode` — bar charts use the base buffer path. The `horizontal` prop simply swaps axis types; the `stacked` prop maps to `stack: 'total'` on all series; `show-labels` maps to `label: { show: true, position: 'top' }` on each series; `color-by-data` maps to `colorBy: 'data'` on each series.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts | ^5.6.0 (already installed) | Chart engine — `BarChart` module | Already in `packages/charts/` dependencies from Phase 88; `BarChart` export confirmed in `echarts/charts` type declarations |
| lit | ^3.3.2 (peer) | Web component base | Project baseline; `BaseChartElement` already extends it |
| @lit-ui/core | workspace:* (peer) | TailwindElement, CSS tokens | Inherited via BaseChartElement |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| echarts/charts — BarChart | subpath of echarts@5.6.0 | Registers ECharts bar series renderer | Imported dynamically in `_registerModules()`; single module covers vertical, horizontal, grouped, and stacked bar |
| registerCanvasCore | internal (canvas-core.ts) | Registers shared ECharts components | Already registers DataZoom, MarkLine, MarkArea, etc.; call first in `_registerModules()` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Swapping axes for horizontal | Separate horizontal bar type | ECharts has no separate horizontal bar type — horizontal IS vertical with swapped axis types. Always swap axes. |
| `colorBy: 'data'` for per-bar colors | Manual `itemStyle.color` per data item | `colorBy: 'data'` uses the palette automatically; manual per-item colors require knowing the palette in advance |
| Circular buffer streaming (base default) | `appendData` path | Bar charts use `setOption`, so `appendData` is not available. STRM-04 mandates circular buffer for bar. |

**Installation:** No new packages needed. `BarChart` is already available in the installed `echarts@5.6.0` in `packages/charts/`.

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
│   ├── line-chart.ts              # (Phase 89, complete)
│   └── line-registry.ts           # (Phase 89, complete)
├── area/
│   └── area-chart.ts              # (Phase 89, complete)
├── shared/
│   ├── line-option-builder.ts     # (Phase 89, complete)
│   └── bar-option-builder.ts      # NEW Phase 90
├── bar/
│   ├── bar-chart.ts               # NEW Phase 90 — LuiBarChart class
│   └── bar-registry.ts            # NEW Phase 90 — registerBarModules()
└── index.ts                       # updated to export LuiBarChart + bar types
```

### Pattern 1: Concrete Chart Class Skeleton (Bar Variant)
**What:** `LuiBarChart` follows the same pattern as `LuiLineChart`/`LuiAreaChart`. The key difference: NO `_streamingMode` override — bar charts use the base `'buffer'` default which provides circular-buffer streaming automatically.
**When to use:** This is the standard pattern for all Phases 90-95 chart types that do NOT use appendData.

```typescript
// Source: BaseChartElement Phase 88 pattern — verified against actual codebase
// packages/charts/src/bar/bar-chart.ts
import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerBarModules } from './bar-registry.js';
import { buildBarOption, type BarChartSeries } from '../shared/bar-option-builder.js';

export class LuiBarChart extends BaseChartElement {
  // NO constructor override — base _streamingMode = 'buffer' is correct for bar charts
  // STRM-04: "all other chart types use circular buffer + setOption({ lazyUpdate: true })"

  // BAR-01: Stacking — all series share 'total' group (string, not boolean)
  @property({ type: Boolean }) stacked = false;

  // BAR-01: Horizontal orientation — swaps axis types in option
  @property({ type: Boolean }) horizontal = false;

  // BAR-02: Show value labels on each bar
  @property({ type: Boolean, attribute: 'show-labels' }) showLabels = false;

  // BAR-02: Each bar gets a distinct palette color (colorBy: 'data' vs default 'series')
  @property({ type: Boolean, attribute: 'color-by-data' }) colorByData = false;

  protected override async _registerModules(): Promise<void> {
    await registerBarModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // base handles this.option and this.loading
    if (!this._chart) return;
    const barProps = ['data', 'stacked', 'horizontal', 'showLabels', 'colorByData'] as const;
    if (barProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart || !this.data) return;
    const option = buildBarOption(this.data as BarChartSeries[], {
      stacked: this.stacked,
      horizontal: this.horizontal,
      showLabels: this.showLabels,
      colorByData: this.colorByData,
    });
    this._chart.setOption(option, { notMerge: false });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('lui-bar-chart')) {
  customElements.define('lui-bar-chart', LuiBarChart);
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-bar-chart': LuiBarChart;
  }
}
```

### Pattern 2: Bar Registry
**What:** `bar-registry.ts` calls `registerCanvasCore()` then registers `BarChart`. Same guard pattern as `line-registry.ts`.

```typescript
// Source: line-registry.ts pattern from Phase 89 — verified against actual codebase
// packages/charts/src/bar/bar-registry.ts
let _barRegistered = false;

export async function registerBarModules(): Promise<void> {
  if (_barRegistered) return;
  _barRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ BarChart }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/core'),
  ]);

  use([BarChart]);
}
```

### Pattern 3: Bar Option Builder
**What:** Pure function `buildBarOption()` that converts the `data` prop shape into a complete ECharts option. The horizontal flip, stacking, labels, and color-by-data are all achieved through ECharts option properties.

```typescript
// Source: ECharts 5.6.0 BarSeriesOption verified from installed types
// packages/charts/src/shared/bar-option-builder.ts

export type BarChartSeries = {
  name: string;
  data: (number | null)[];
};

export type BarOptionProps = {
  stacked?: boolean;
  horizontal?: boolean;
  showLabels?: boolean;
  colorByData?: boolean;
};

export function buildBarOption(
  series: BarChartSeries[],
  props: BarOptionProps
): Record<string, unknown> {
  const echartsSeriesArray = series.map((s) => ({
    name: s.name,
    type: 'bar' as const,
    data: s.data,
    // BAR-01: Stacking — stack MUST be string 'total', not boolean (same as area chart)
    stack: props.stacked ? 'total' : undefined,
    // BAR-02: Value labels on each bar
    label: props.showLabels
      ? {
          show: true,
          // 'top' for vertical bars, 'right' for horizontal bars
          position: props.horizontal ? 'right' : 'top',
        }
      : undefined,
    // BAR-02: Per-bar palette color (colorBy: 'data' = each bar gets a palette entry)
    // Verified: colorBy is on SeriesOption base interface (shared.d.ts line 7278)
    colorBy: props.colorByData ? ('data' as const) : ('series' as const),
  }));

  // BAR-01: Horizontal flip — swap which axis is 'category' vs 'value'
  const categoryAxis = { type: 'category' as const };
  const valueAxis = { type: 'value' as const };

  return {
    legend: { show: series.length > 1 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    // Horizontal: yAxis is categories, xAxis is values. Vertical: opposite.
    xAxis: props.horizontal ? valueAxis : categoryAxis,
    yAxis: props.horizontal ? categoryAxis : valueAxis,
    series: echartsSeriesArray,
  };
}
```

### Pattern 4: Circular Buffer Streaming (Inherited — No Override Needed)
**What:** The base class `_flushPendingData()` already handles circular buffer streaming with `setOption({ series: [{ data }] }, { lazyUpdate: true })`. Bar charts use this path by default — no override required.

**Critical understanding of base buffer behavior:**
```typescript
// From base-chart-element.ts lines 339-346 (verified)
// This runs automatically when _streamingMode === 'buffer' (the default):
this._circularBuffer.push(...points);
if (this._circularBuffer.length > this.maxPoints) {
  this._circularBuffer = this._circularBuffer.slice(-this.maxPoints);
}
this._chart.setOption(
  { series: [{ data: this._circularBuffer }] },
  { lazyUpdate: true } as object
);
```

**Bar chart streaming limitation:** The base buffer path updates `series[0].data` only. For grouped bar charts with multiple named series, `pushData()` only updates the first series's data. For Phase 90, this matches BAR-03 success criteria: "Developer can call `pushData(point)` on a bar chart and see the chart update via the circular buffer without full re-initialization."

### Pattern 5: Data Shape for Bar Charts
**What:** The `data` prop for a bar chart must provide series names and arrays of values. The category axis labels are derived from the x-axis configuration (usually categories are passed separately or inferred from data position).

For the simplest and most consistent approach across the codebase: data is an array of named series, each with a `data` array of numbers. Categories are either passed separately or left to ECharts defaults (numeric indices).

```typescript
// Consumer usage pattern (vertical bar chart)
barChart.data = [
  { name: 'Series A', data: [120, 200, 150, 80, 70, 110, 130] },
  { name: 'Series B', data: [60, 100, 80, 40, 35, 60, 70] },
];

// Consumer usage pattern (horizontal bar chart)
barChart.horizontal = true;
barChart.data = [
  { name: 'Category A', data: [120] },
  { name: 'Category B', data: [200] },
  { name: 'Category C', data: [150] },
];

// Stacked
barChart.stacked = true;
```

**Note on categories:** ECharts `xAxis.type: 'category'` without explicit `data` uses the data array indices as categories. If the consumer wants named categories, they should pass them via the `option` prop override (the base class `this.option` passthrough). Alternatively, `BarChartSeries` can be extended to include a `categories` array — but for simplicity and consistency with Phase 89's approach, keep data as named series and document that categories can be added via `option` override.

### Anti-Patterns to Avoid
- **Overriding `_streamingMode` to 'appendData' for bar charts:** Bar charts MUST use `_streamingMode = 'buffer'`. STRM-04 is explicit: "all other chart types use circular buffer + `setOption({ lazyUpdate: true })`". `appendData` does not work for bar charts.
- **`stack: true` (boolean) for stacked bars:** ECharts stacking requires a string group name. Use `stack: 'total'` — never `stack: true` or `stack: 1`. This is the same pitfall as Phase 89's area chart.
- **Full `import * as echarts from 'echarts'`:** Always use `import('echarts/charts')` subpath for `BarChart` to maintain the ~135KB gzip bundle goal.
- **Setting `colorBy: 'data'` on all chart types without consideration:** `colorBy: 'data'` assigns one palette color per data point. With multiple series (grouped bar), all bars in series 0 cycle through colors 0-N, then series 1 does the same starting from color N+1. This can produce unexpected results for multi-series grouped bars. Document that `color-by-data` is most useful with single-series bar charts.
- **Not passing `axisPointer: { type: 'shadow' }` on tooltip:** Vertical bar charts conventionally show a shadow band over the hovered category column. Without `axisPointer: { type: 'shadow' }`, the tooltip works but the UX is degraded.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Horizontal bar layout | Custom SVG/canvas rotation | `xAxis.type: 'value'` + `yAxis.type: 'category'` swap | ECharts handles axis label rotation, bar direction, and tooltip positioning natively when axes are swapped |
| Stacked bar calculations | Manual cumulative sum per category | `stack: 'total'` string on all series | ECharts handles stacking arithmetic, baseline offsets, and hover-to-unstack animations |
| Value labels | Custom HTML overlay per bar | `label: { show: true, position: 'top' }` on series | ECharts renders labels in the correct canvas coordinate space; handles overflow clipping and rotation |
| Per-bar palette colors | `itemStyle.color` function with manual palette lookup | `colorBy: 'data'` on series | ECharts cycles through the registered color palette automatically; ThemeBridge injects the project's `--ui-chart-*` palette |
| Circular buffer streaming | Manual rolling array with re-render | Base class `_circularBuffer` + `pushData()` (inherited) | Already implemented in BaseChartElement (Phase 88); bar charts get this for free with default `_streamingMode = 'buffer'` |
| Grouped bar spacing | Manual bar width calculation | `barGap` and `barCategoryGap` on series | ECharts auto-calculates proportional bar widths for grouped series |

**Key insight:** A bar chart in ECharts is one `BarChart` module instance. Vertical, horizontal, grouped, stacked, labeled, and per-bar-colored are all configuration properties on the same `BarSeriesOption`. Everything in Phase 90 is option-building, not custom rendering code.

---

## Common Pitfalls

### Pitfall 1: Horizontal Bar Requires Full Axis Type Swap
**What goes wrong:** Setting `horizontal: true` but only modifying one axis produces garbled output — bars render but in wrong orientation, or categories appear on wrong axis.
**Why it happens:** ECharts determines bar orientation entirely from which axis is `category` and which is `value`. BOTH axes must be swapped simultaneously.
**How to avoid:** In `buildBarOption()`, swap BOTH axes atomically: when `horizontal`, set `xAxis.type: 'value'` AND `yAxis.type: 'category'`. When vertical, set `xAxis.type: 'category'` AND `yAxis.type: 'value'`.
**Warning signs:** Bars appear as a single point or along the wrong axis; tooltip shows wrong axis as the hovered dimension.

### Pitfall 2: stack Must Be String, Not Boolean
**What goes wrong:** Stacked bar chart renders as grouped (overlapping) bars instead of stacked.
**Why it happens:** Same as Phase 89 area chart — ECharts `stack` property is a group name string. Setting `stack: true` (boolean coerced to string 'true') technically works, but `stack: false` or `stack: undefined` must be used to disable. The safe pattern is `stack: props.stacked ? 'total' : undefined`.
**How to avoid:** Use `stack: 'total'` (string) when stacking is enabled; omit the `stack` property entirely (not `stack: false`) when not stacking.
**Warning signs:** All series render on top of each other at the same height instead of building up from the baseline.

### Pitfall 3: colorBy: 'data' Behavior Differs Per Series Count
**What goes wrong:** In a multi-series grouped bar chart with `color-by-data`, bars receive unexpected colors that don't match an intuitive "each series has a color" expectation.
**Why it happens:** `colorBy: 'data'` assigns palette colors per data point within a series, not per series. With 2 series of 5 data points each, series 0 uses palette colors 0-4, series 1 uses palette colors 5-9 (if available) or wraps. This is correct behavior but can look random.
**How to avoid:** Document `color-by-data` as a single-series feature (each bar gets a distinct color from the palette). For multi-series charts, the default `colorBy: 'series'` (each series gets one palette color) is usually the intended behavior.
**Warning signs:** Multi-series grouped bar chart with `color-by-data` shows no clear color grouping per series.

### Pitfall 4: Label Position for Horizontal vs Vertical Bars
**What goes wrong:** Value labels appear to the right of vertical bars (cut off at top of chart) or above horizontal bars (outside the bar width, clipped).
**Why it happens:** The label `position: 'top'` is correct for vertical bars but for horizontal bars the "top" direction is along the bar direction. Use `position: 'right'` for horizontal bars to place labels at the end of each bar.
**How to avoid:** In `buildBarOption()`, compute `position: props.horizontal ? 'right' : 'top'` when `showLabels` is true.
**Warning signs:** Value labels are clipped or overlap with bar borders after enabling `horizontal`.

### Pitfall 5: Circular Buffer Updates series[0] Only
**What goes wrong:** In a grouped multi-series bar chart, `pushData()` streaming only updates the first series's data; other series remain unchanged.
**Why it happens:** Base class `_flushPendingData()` in buffer mode calls `setOption({ series: [{ data: this._circularBuffer }] })` — this targets `series[0]` via array index. ECharts interprets `series: [{ data: ... }]` as "update the data for the first series only."
**How to avoid:** Document that `pushData()` streaming targets series 0 only. For BAR-03, the success criteria is "chart update via the circular buffer without full re-initialization" — single-series streaming satisfies this. If multi-series streaming is needed in future, override `_flushPendingData()` in `LuiBarChart`.
**Warning signs:** `pushData()` appears to work but only one series animates; other grouped bars freeze.

### Pitfall 6: `setOption` with `notMerge: false` Resets Streaming Buffer
**What goes wrong:** Calling `_applyData()` (which calls `setOption`) after `pushData()` has accumulated data in `_circularBuffer` resets the chart data.
**Why it happens:** `setOption({ series: [{ data: [...full dataset...] }] })` overwrites whatever was previously in the series data, including data accumulated by `pushData()` streaming.
**How to avoid:** For bar charts on the circular buffer path, this is less severe than CRITICAL-03 for `appendData` — the buffer is NOT wiped (the `_circularBuffer` array in the base class persists). The chart will show the `data` prop data momentarily, then the next `pushData()` flush will update `series[0]` again. The behavior is acceptable. Document that `data` prop changes and active `pushData()` streaming are independent: `data` sets the static dataset, `pushData()` updates `series[0]` live.
**Warning signs:** After changing the `data` prop, the chart flashes the new static data before reverting to streamed data on the next frame.

---

## Code Examples

Verified patterns from the installed ECharts 5.6.0 type declarations and Phase 88/89 codebase:

### Bar Registry
```typescript
// Source: line-registry.ts pattern (Phase 89) + BarChart confirmed in echarts/charts types
// packages/charts/src/bar/bar-registry.ts
let _barRegistered = false;

export async function registerBarModules(): Promise<void> {
  if (_barRegistered) return;
  _barRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ BarChart }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/core'),
  ]);

  use([BarChart]);
}
```

### Bar Option Builder (Complete)
```typescript
// Source: ECharts 5.6.0 BarSeriesOption types verified in packages/charts/node_modules/echarts/types/dist/shared.d.ts
// packages/charts/src/shared/bar-option-builder.ts

export type BarChartSeries = {
  name: string;
  data: (number | null)[];
};

export type BarOptionProps = {
  stacked?: boolean;
  horizontal?: boolean;
  showLabels?: boolean;
  colorByData?: boolean;
};

export function buildBarOption(
  series: BarChartSeries[],
  props: BarOptionProps
): Record<string, unknown> {
  const echartsSeriesArray = series.map((s) => ({
    name: s.name,
    type: 'bar' as const,
    data: s.data,
    // BAR-01: stack MUST be string 'total', not boolean
    stack: props.stacked ? 'total' : undefined,
    // BAR-02: Value labels — position adapts to orientation
    label: props.showLabels
      ? {
          show: true,
          position: props.horizontal ? ('right' as const) : ('top' as const),
        }
      : undefined,
    // BAR-02: colorBy: 'data' = each bar gets a distinct palette color
    // colorBy is on SeriesOption base (shared.d.ts:7278) — valid on BarSeriesOption
    colorBy: props.colorByData ? ('data' as const) : ('series' as const),
  }));

  // BAR-01: Horizontal = swap which axis is 'category' vs 'value'
  const categoryAxis = { type: 'category' as const };
  const valueAxis = { type: 'value' as const };

  return {
    legend: { show: series.length > 1 },
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
    },
    xAxis: props.horizontal ? valueAxis : categoryAxis,
    yAxis: props.horizontal ? categoryAxis : valueAxis,
    series: echartsSeriesArray,
  };
}
```

### LuiBarChart Complete Implementation
```typescript
// Source: Phase 88/89 BaseChartElement pattern + ECharts 5.6.0 BarSeriesOption
// packages/charts/src/bar/bar-chart.ts

import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerBarModules } from './bar-registry.js';
import { buildBarOption, type BarChartSeries } from '../shared/bar-option-builder.js';

export class LuiBarChart extends BaseChartElement {
  // BAR-01: Stacked bars — all series share stack group 'total'
  @property({ type: Boolean }) stacked = false;

  // BAR-01: Horizontal orientation — swaps axis types in ECharts option
  @property({ type: Boolean }) horizontal = false;

  // BAR-02: Show value labels on each bar
  @property({ type: Boolean, attribute: 'show-labels' }) showLabels = false;

  // BAR-02: Per-bar distinct palette color (colorBy: 'data' vs default 'series')
  @property({ type: Boolean, attribute: 'color-by-data' }) colorByData = false;

  protected override async _registerModules(): Promise<void> {
    await registerBarModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // base handles this.option and this.loading
    if (!this._chart) return;
    const barProps = ['data', 'stacked', 'horizontal', 'showLabels', 'colorByData'] as const;
    if (barProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart || !this.data) return;
    const option = buildBarOption(this.data as BarChartSeries[], {
      stacked: this.stacked,
      horizontal: this.horizontal,
      showLabels: this.showLabels,
      colorByData: this.colorByData,
    });
    this._chart.setOption(option, { notMerge: false });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('lui-bar-chart')) {
  customElements.define('lui-bar-chart', LuiBarChart);
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-bar-chart': LuiBarChart;
  }
}
```

### Updated index.ts (Phase 90 additions)
```typescript
// packages/charts/src/index.ts additions for Phase 90
// Append after Phase 89 exports:

// Phase 90: Bar Chart
export { LuiBarChart } from './bar/bar-chart.js';
export type { BarChartSeries, BarOptionProps } from './shared/bar-option-builder.js';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate `HorizontalBarChart` type | Swap `xAxis`/`yAxis` types on same `BarChart` | ECharts 5.x design | No separate module; orientation is configuration |
| Full ECharts import for BarChart | Tree-shaken `BarChart` from `echarts/charts` | ECharts 5.0 (2021) | ~400KB → ~160KB gzip |
| `itemStyle.color` function for per-bar colors | `colorBy: 'data'` on series option | ECharts 5.x | Declarative palette assignment; no manual color lookup |
| `appendData` for bar streaming | Circular buffer `setOption({ lazyUpdate: true })` | Phase 88 STRM-04 decision | Bar charts cannot use `appendData` (it is a line-series-only path) |

**Deprecated/outdated:**
- `echarts.registerTheme('myTheme', {...})` for bar theming: Phase 88's `ThemeBridge` injects CSS token values at init time; no explicit theme registration needed.
- `xAxis.axisLabel.rotate` for horizontal bars: Correct approach is to swap axis types entirely, not rotate labels.

---

## Open Questions

1. **Category labels for bar chart data**
   - What we know: `xAxis.type: 'category'` without explicit `data` uses integer indices (0, 1, 2...) as labels. Consumer data shape is `{ name, data: number[] }` — the series name is NOT the category label.
   - What's unclear: Should `BarChartSeries` include a `categories` array to populate `xAxis.data`? Or should consumers pass categories via the `option` passthrough prop?
   - Recommendation: For Phase 90, add a top-level `categories?: string[]` field to the data shape (or as a separate prop `categories`). This is the most ergonomic approach. Alternatively, extend `BarChartSeries` to be `{ name, data, categories? }` where `categories` on the first series is used as `xAxis.data`. The simplest approach: add `categories?: string[]` to `BarOptionProps` and pass it as `xAxis.data` when horizontal is false (or `yAxis.data` when horizontal is true).

2. **Streaming buffer updates and grouped bar chart state**
   - What we know: Base `_circularBuffer` pushes points to `series[0].data` via `setOption`. A grouped bar chart with 3 series will only have series 0 updated by `pushData()`.
   - What's unclear: For BAR-03, the success criteria says "see the chart update" — it does not specify multi-series. Single-series streaming is sufficient.
   - Recommendation: Implement as single-series streaming (base class default). Document the limitation. Do not override `_flushPendingData` for Phase 90.

3. **Whether `BarChart` ECharts module needs to be registered separately from Line's canvas-core**
   - What we know: `BarChart` is a separate export from `echarts/charts` (confirmed from type declarations). `canvas-core.ts` does NOT register `BarChart` — it only registers renderers and components. `LineChart` is registered in `line-registry.ts`. `BarChart` must be registered separately.
   - What's unclear: Nothing — this is verified. `registerBarModules()` must call `use([BarChart])`.
   - Recommendation: Implement `bar-registry.ts` with its own `_barRegistered` guard that calls `registerCanvasCore()` then `use([BarChart])`. This is the exact same pattern as `line-registry.ts`.

---

## Sources

### Primary (HIGH confidence)
- `packages/charts/node_modules/echarts/types/dist/charts.d.ts` — `BarChart` and `BarSeriesOption` exports confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` — `BarSeriesOption`, `SeriesStackOptionMixin`, `BarSeriesLabelOption`, `colorBy: 'series' | 'data'` on `SeriesOption` all verified from type declarations
- `packages/charts/src/base/base-chart-element.ts` — `_streamingMode = 'buffer'` default confirmed; `_flushPendingData()` circular buffer + `setOption({ lazyUpdate: true })` pattern confirmed at lines 328-347
- `packages/charts/src/registry/canvas-core.ts` — Confirmed `BarChart` is NOT pre-registered here; Phase 90 must register it in `bar-registry.ts`
- `packages/charts/src/line/line-chart.ts` — Concrete chart class pattern verified (exact same structure for `LuiBarChart`)
- `packages/charts/src/line/line-registry.ts` — Registry pattern verified for replication in `bar-registry.ts`
- `.planning/REQUIREMENTS.md` — STRM-04 confirmed: "all other chart types use circular buffer + `setOption({ lazyUpdate: true })`" — bar uses buffer, not appendData

### Secondary (MEDIUM confidence)
- Phase 89 RESEARCH.md — Architecture patterns and Phase 88/89 decisions; consistent with what was verified in codebase
- Phase 88/89 STATE.md decisions — `_streamingMode defaults to 'buffer' in base` confirmed

### Tertiary (LOW confidence)
- None — all critical findings verified against actual installed ECharts 5.6.0 type declarations and codebase.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `BarChart` export confirmed from installed `echarts@5.6.0` type declarations; no new packages needed
- Architecture: HIGH — `BaseChartElement` and Phase 89 concrete chart patterns verified from actual codebase; `LuiBarChart` is a straightforward application of the same pattern
- ECharts API (stack, horizontal, label, colorBy): HIGH — all four features verified against `BarSeriesOption` interface in `shared.d.ts`; axis swap for horizontal verified from `CartesianAxisOption` types
- Streaming (circular buffer): HIGH — `_flushPendingData()` buffer mode verified from `base-chart-element.ts` lines 328-347; STRM-04 requirement confirmed
- colorBy per-bar behavior: HIGH — `colorBy: ColorBy` confirmed on `SeriesOption` base (line 7278 in shared.d.ts); `ColorBy = 'series' | 'data'` confirmed

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (ECharts 5.6.0 pinned; architecture stable)
