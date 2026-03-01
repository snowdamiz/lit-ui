# Phase 93: Heatmap Chart - Research

**Researched:** 2026-02-28
**Domain:** ECharts 5.6.0 HeatmapChart (Cartesian) + VisualMapContinuousComponent — concrete Lit web component extending BaseChartElement with streaming cell-value updates
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HEAT-01 | Developer can render a Cartesian heatmap with configurable x/y categories and VisualMap color scale | ECharts `HeatmapChart` module with `type: 'heatmap'`; `coordinateSystem: 'cartesian2d'`; xAxis/yAxis with `type: 'category'` and `data: string[]`; `VisualMapContinuousComponent` (or `VisualMapComponent`) required for color scale; `color-range` prop maps to `visualMap.inRange.color: [minColor, maxColor]`; `data` property maps to series `data` as `[xIdx, yIdx, value][]` triples |
| HEAT-02 | Developer can stream cell value updates into a heatmap via `pushData()` | Base class `pushData()` is public and OVERRIDABLE; heatmap overrides `pushData()` to maintain a sparse cell-update map (`Map<string, number>` keyed by `"xIdx,yIdx"`); override applies pending updates into the maintained full data matrix; RAF coalescing done in the override using its own `requestAnimationFrame`; `setOption({ series: [{ data: fullMatrix }] }, { lazyUpdate: true })` flushes the full updated matrix — not a rolling buffer |
</phase_requirements>

---

## Summary

Phase 93 builds `LuiHeatmapChart` (`lui-heatmap-chart`) extending `BaseChartElement`. The chart type is `type: 'heatmap'` on a Cartesian 2D coordinate system, with both axes using `type: 'category'` and a continuous VisualMap component providing the color legend. The data format is `[xCategoryIndex, yCategoryIndex, value][]` tuples — integer indices into the x/y category arrays.

The most significant Phase 93-specific complexity is **streaming cell-value updates**. Unlike line/area (which append to a time axis) or bar/scatter (which replace a rolling buffer), a heatmap has a fixed cell matrix. Calling `pushData([xIdx, yIdx, newValue])` must UPDATE a specific cell, not add a new row. The base class `_flushPendingData()` is `private` and cannot be overridden. The correct approach is to override `pushData()` itself in `LuiHeatmapChart`, maintain a component-level sparse update map, and apply the full updated data matrix on each RAF flush. Do NOT rely on the base `_circularBuffer` path for heatmap streaming.

The VisualMap `inRange.color` array accepts two or more color stops for a gradient (`['#313695', '#ffffbf', '#d73027']` style). The `color-range` prop on the component maps to `inRange: { color: [minColor, maxColor] }` at minimum. `min`/`max` on the VisualMap must match the value domain of the data; reasonable defaults (`min: 0, max: 100`) with developer override via component prop is correct.

**Primary recommendation:** Follow the Phase 90/91/92 three-file pattern: `heatmap-registry.ts`, `heatmap-option-builder.ts`, and `heatmap-chart.ts`. The `VisualMapContinuousComponent` (or `VisualMapComponent` which includes both) must be registered in `heatmap-registry.ts` because it is NOT in `canvas-core.ts`. Override `pushData()` in `LuiHeatmapChart` for cell-update semantics.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts | ^5.6.0 (already installed) | Chart engine — `HeatmapChart` module | Confirmed in `echarts/types/dist/charts.d.ts`: `install$17 as HeatmapChart, HeatmapSeriesOption` |
| lit | ^3.3.2 (peer) | Web component base | Project baseline; `BaseChartElement` already extends it |
| @lit-ui/core | workspace:* (peer) | TailwindElement, CSS tokens | Inherited via BaseChartElement |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| echarts/charts — HeatmapChart | subpath of echarts@5.6.0 | Registers ECharts Cartesian heatmap series | Imported dynamically in `_registerModules()` |
| echarts/components — VisualMapContinuousComponent | subpath of echarts@5.6.0 | Registers the continuous VisualMap (color scale legend) | MUST register in heatmap-registry.ts — NOT in canvas-core.ts |
| echarts/components — VisualMapComponent | subpath of echarts@5.6.0 | Meta-installer: registers both Continuous AND Piecewise VisualMap | Alternative to registering just `VisualMapContinuousComponent`; use `VisualMapContinuousComponent` alone for smaller bundle |
| registerCanvasCore | internal (canvas-core.ts) | Registers shared ECharts components (Grid, Tooltip, Legend, etc.) | Already called first in all chart registries; GridComponent is required for Cartesian heatmap |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `VisualMapContinuousComponent` (single import) | `VisualMapComponent` (both types) | `VisualMapComponent` is a meta-installer for both continuous and piecewise VisualMap; use `VisualMapContinuousComponent` for minimal bundle; heatmap always uses continuous style |
| Overriding `pushData()` in component | Relying on base `_circularBuffer` | Base buffer accumulates `[x,y,v]` tuples as a growing list — correct for line/scatter but wrong for heatmap (cells can be duplicated; caller expects in-place cell update semantics). Must override. |
| `[xIdx, yIdx, value]` integer index format | String category values as keys | ECharts heatmap `coordinateSystem: 'cartesian2d'` requires integer axis indices, not string lookups. String-based approach would need custom encoder/decoder. Integer index format is the ECharts native contract. |

**Installation:** No new packages needed. `HeatmapChart` and `VisualMapContinuousComponent` are already available in installed `echarts@5.6.0`.

---

## Architecture Patterns

### Recommended Project Structure
```
packages/charts/src/
├── base/
│   └── base-chart-element.ts        # (Phase 88, complete) — shared lifecycle
├── registry/
│   └── canvas-core.ts               # (Phase 88, complete) — Grid, Tooltip, etc.
├── shared/
│   └── heatmap-option-builder.ts    # NEW Phase 93 — buildHeatmapOption() + types
├── heatmap/
│   ├── heatmap-chart.ts             # NEW Phase 93 — LuiHeatmapChart class
│   └── heatmap-registry.ts          # NEW Phase 93 — registerHeatmapModules()
└── index.ts                         # Updated to export LuiHeatmapChart + heatmap types
```

### Pattern 1: Heatmap Option Builder
**What:** `buildHeatmapOption()` builds the complete ECharts option for a Cartesian heatmap. Key decisions: category axes, VisualMap continuous component, `containLabel: true` on grid.
**When to use:** Called from `_applyData()` when `data`, `xCategories`, `yCategories`, or `colorRange` changes.

```typescript
// Source: HeatmapSeriesOption from echarts/types/dist/shared.d.ts line 10605-10613
// Source: ContinousVisualMapOption from echarts/types/dist/shared.d.ts line 9537-9572
// Source: CategoryAxisBaseOption from echarts/types/dist/shared.d.ts line 2453-2468

export type HeatmapCell = [number, number, number]; // [xIdx, yIdx, value]

export type HeatmapOptionProps = {
  xCategories: string[];
  yCategories: string[];
  // HEAT-01: Two-color gradient endpoints: [minColor, maxColor]
  // Defaults: ['#313695', '#d73027'] (blue-to-red)
  colorRange?: [string, string];
  // VisualMap min/max domain. Defaults: computed from data or [0, 100]
  min?: number;
  max?: number;
};

export function buildHeatmapOption(
  data: HeatmapCell[],
  props: HeatmapOptionProps
): Record<string, unknown> {
  const [minColor, maxColor] = props.colorRange ?? ['#313695', '#d73027'];
  const minVal = props.min ?? 0;
  const maxVal = props.max ?? 100;

  return {
    grid: { containLabel: true },
    xAxis: { type: 'category', data: props.xCategories, splitArea: { show: true } },
    yAxis: { type: 'category', data: props.yCategories, splitArea: { show: true } },
    visualMap: {
      type: 'continuous',
      min: minVal,
      max: maxVal,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: { color: [minColor, maxColor] },
    },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'cartesian2d',
      data,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  };
}
```

### Pattern 2: Heatmap Registry (VisualMapContinuousComponent required)
**What:** `heatmap-registry.ts` registers `HeatmapChart` plus `VisualMapContinuousComponent`. The VisualMap component is NOT in `canvas-core.ts` — it must be registered here. This is the critical addition versus all previous chart registries.
**When to use:** Called from `LuiHeatmapChart._registerModules()`.

```typescript
// Source: components.d.ts line 1 — VisualMapContinuousComponent confirmed export
// Source: charts.d.ts line 1 — HeatmapChart confirmed export
// Source: pie-registry.ts Phase 91 — guard pattern to mirror exactly

let _heatmapRegistered = false;

export async function registerHeatmapModules(): Promise<void> {
  if (_heatmapRegistered) return;
  _heatmapRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ HeatmapChart }, { VisualMapContinuousComponent }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/components'),
    import('echarts/core'),
  ]);

  use([HeatmapChart, VisualMapContinuousComponent]);
}
```

### Pattern 3: LuiHeatmapChart — pushData Override for Cell-Update Semantics
**What:** `LuiHeatmapChart` extends `BaseChartElement`. Reactive props: `xCategories`, `yCategories`, `colorRange`. Streaming uses a component-level `Map<string, number>` keyed by `"xIdx,yIdx"` for sparse cell updates. The `pushData()` method is OVERRIDDEN — it does NOT call `super.pushData()` to avoid the base class circular buffer path.

**Why override pushData:** The base `_flushPendingData()` is `private` and cannot be overridden. The base buffer semantics (accumulate + replace `series.data`) are wrong for heatmap: if a developer calls `pushData([0, 0, 50])` and then `pushData([0, 0, 75])`, the base buffer would set `series.data` to `[[0,0,50], [0,0,75]]` — two data points for the same cell. ECharts heatmap would render both (last one wins in render, but duplicates are wasteful). The correct behavior is: the second call should overwrite the first, and the full current cell matrix should be sent on flush.

```typescript
// Source: base-chart-element.ts lines 164-172 — pushData() is public, overridable
// Source: STRM-04 compliance: heatmap uses 'buffer' semantics but with cell-update logic

export class LuiHeatmapChart extends BaseChartElement {
  // NO _streamingMode override — base 'buffer' default is fine;
  // but we override pushData() entirely to get cell-update semantics.

  @property({ attribute: false }) xCategories: string[] = [];
  @property({ attribute: false }) yCategories: string[] = [];
  @property({ attribute: 'color-range' }) colorRange: string | null = null;

  // Component-level cell state — the full current data matrix for the heatmap.
  // Initialized from this.data; updated cell-by-cell via pushData().
  private _cellData: HeatmapCell[] = [];
  // Pending cell updates: key = "xIdx,yIdx", value = new numeric value
  private _pendingCells = new Map<string, number>();
  private _cellRafId?: number;

  override pushData(point: unknown): void {
    // Override base implementation — heatmap uses cell-update semantics, not rolling buffer.
    // point must be [xIdx, yIdx, value] triple.
    const [xi, yi, val] = point as HeatmapCell;
    this._pendingCells.set(`${xi},${yi}`, val);
    if (this._cellRafId === undefined) {
      this._cellRafId = requestAnimationFrame(() => {
        this._flushCellUpdates();
        this._cellRafId = undefined;
      });
    }
  }

  private _flushCellUpdates(): void {
    if (!this._chart || this._pendingCells.size === 0) return;
    // Apply pending updates into the current cell data array
    for (const [key, val] of this._pendingCells) {
      const [xi, yi] = key.split(',').map(Number);
      const idx = this._cellData.findIndex((c) => c[0] === xi && c[1] === yi);
      if (idx >= 0) {
        this._cellData[idx] = [xi, yi, val]; // update existing cell
      } else {
        this._cellData.push([xi, yi, val]); // add new cell
      }
    }
    this._pendingCells.clear();
    this._chart.setOption(
      { series: [{ data: this._cellData }] },
      { lazyUpdate: true } as object
    );
  }

  // ... _applyData(), _registerModules(), updated(), etc.
}
```

### Pattern 4: Syncing _cellData with this.data
**What:** When the `data` property changes, `_applyData()` must sync `_cellData` from the new data array and call `setOption` with the full option (not just series.data). When `pushData()` is called subsequently, it updates `_cellData` in-place.

```typescript
private _applyData(): void {
  if (!this._chart) return;
  // Sync _cellData from this.data so pushData() cell lookups are correct
  this._cellData = this.data ? [...(this.data as HeatmapCell[])] : [];
  const parsed = _parseColorRange(this.colorRange);
  const option = buildHeatmapOption(this._cellData, {
    xCategories: this.xCategories,
    yCategories: this.yCategories,
    colorRange: parsed,
  });
  this._chart.setOption(option, { notMerge: false });
}
```

### Pattern 5: colorRange Attribute Parsing
**What:** The `color-range` attribute arrives as a string from HTML (e.g., `"#313695,#d73027"` or `"blue,red"`). A small parser extracts the two color tokens. The TypeScript property on the component is `colorRange: string | null` (no type converter — same convention as `innerRadius` in pie chart).

```typescript
function _parseColorRange(raw: string | null): [string, string] | undefined {
  if (!raw) return undefined;
  const parts = raw.split(',').map((s) => s.trim());
  if (parts.length >= 2) return [parts[0], parts[1]];
  return undefined;
}
```

### Anti-Patterns to Avoid
- **Calling `super.pushData()` from LuiHeatmapChart.pushData():** This would add the point to the base `_pendingData` and `_circularBuffer`, causing the base RAF to call `setOption({ series: [{ data: circularBuffer }] })` — overwriting the full cell matrix with only the recent streaming points. Never call `super.pushData()`.
- **Registering only `VisualMapComponent` (meta-installer) instead of `VisualMapContinuousComponent`:** `VisualMapComponent` registers BOTH continuous and piecewise, inflating the bundle. Since heatmap always uses continuous VisualMap, use `VisualMapContinuousComponent` specifically.
- **Not registering VisualMapContinuousComponent at all:** If only `HeatmapChart` is registered and `VisualMapContinuousComponent` is omitted from the `use()` call, the color scale legend will not render. No error is thrown by ECharts — the VisualMap is silently ignored.
- **Using `xAxis: { type: 'value' }` for category axes:** Heatmap data indices are integer positions (0, 1, 2...) mapped to category strings. Using `type: 'value'` would show numeric axis labels instead of category names. Always use `type: 'category'` with `data: string[]`.
- **Setting `notMerge: true` in setOption calls:** This would wipe the VisualMap component from the chart on each data update. Use `{ notMerge: false }` (the default) to preserve the VisualMap between data refreshes.
- **Canceling `_cellRafId` in `disconnectedCallback()`:** Must cancel the component's own RAF in `disconnectedCallback()` to avoid post-disposal setOption calls. The base class already cancels its own `_rafId`; the component must also cancel `_cellRafId`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color scale legend | Custom HTML gradient bar with labels | `VisualMapContinuousComponent` from echarts/components | Built-in ECharts component; handles interactive range selection, formatter, dark mode automatically |
| Heatmap color interpolation | Manual HSL lerp between two colors | VisualMap `inRange: { color: [...] }` | ECharts handles color mapping from data values to gradient — multi-stop gradients supported |
| Category axis setup | Custom string-to-pixel mapping | ECharts `xAxis/yAxis: { type: 'category', data: string[] }` | ECharts handles label placement, rotation, grid lines natively |
| Cell update deduplication | Custom dedup logic before setOption | `Map<string, number>` keyed by "xIdx,yIdx" | O(1) lookup; last update in same RAF frame wins; trivial to implement inline |

**Key insight:** Phase 93 adds three new files (`heatmap-option-builder.ts`, `heatmap-registry.ts`, `heatmap-chart.ts`). The only non-trivial logic is: (1) `buildHeatmapOption()` which must include the VisualMap configuration, and (2) the `pushData()` override with cell-update semantics. All other concerns (SSR safety, theming, resize, dark mode) are inherited from BaseChartElement.

---

## Common Pitfalls

### Pitfall 1: VisualMapContinuousComponent Not Registered
**What goes wrong:** The heatmap renders with colored cells but NO VisualMap legend appears. Alternatively, all cells render gray/default color with no value-based color mapping.
**Why it happens:** `VisualMapContinuousComponent` is not included in `canvas-core.ts`. If `heatmap-registry.ts` only registers `HeatmapChart` (forgetting VisualMap), the `visualMap` key in the ECharts option is silently ignored.
**How to avoid:** `heatmap-registry.ts` must call `use([HeatmapChart, VisualMapContinuousComponent])`. Verify by checking that the color scale legend appears in the rendered chart.
**Warning signs:** No color gradient legend visible; cells are all the same color regardless of value differences.

### Pitfall 2: pushData() Using Base Circular Buffer Instead of Cell-Update Map
**What goes wrong:** After calling `pushData([0, 0, 75])`, only cell `[0,0,75]` is visible. All other cells that were in the initial `data` disappear.
**Why it happens:** If `super.pushData()` is called (or the override is not implemented), the base `_flushPendingData()` calls `setOption({ series: [{ data: this._circularBuffer }] })` where `_circularBuffer` only contains the streaming points — not the full cell matrix.
**How to avoid:** Override `pushData()` in `LuiHeatmapChart`. Never call `super.pushData()`. Maintain `_cellData` as the authoritative source of truth for all cell values. Always flush the full `_cellData` array.
**Warning signs:** After `pushData()`, most cells in the heatmap disappear or go blank.

### Pitfall 3: _cellRafId Leak on Disconnect
**What goes wrong:** After the element is removed from the DOM (disconnectedCallback), a pending RAF fires and calls `this._chart.setOption(...)` on a disposed chart instance — either a no-op or an error.
**Why it happens:** The base class cancels its own `_rafId` but has no knowledge of `_cellRafId` on the subclass.
**How to avoid:** Override `disconnectedCallback()` in `LuiHeatmapChart`, cancel `_cellRafId` with `cancelAnimationFrame()`, then call `super.disconnectedCallback()`.
**Warning signs:** Console errors about calling methods on a disposed ECharts instance after the component is removed from the DOM.

### Pitfall 4: xCategories/yCategories as Reactive Properties with `attribute: false`
**What goes wrong:** Developer tries to set `x-categories='["Mon","Tue"]'` as an HTML attribute — it doesn't work because the property uses `attribute: false`.
**Why it happens:** Arrays cannot be safely serialized as HTML attributes (JSON.parse on large arrays is lossy and slow — established project convention per REQUIREMENTS.md Out of Scope). Properties must be set via JavaScript.
**How to avoid:** Declare `@property({ attribute: false }) xCategories: string[] = []` and document that these must be set via JavaScript property assignment, not HTML attributes. This is the same pattern as `data` in `BaseChartElement`.
**Warning signs:** Category labels show as `undefined` or axis is empty when attributes are set in HTML instead of via JS.

### Pitfall 5: colorRange Attribute vs. colorRange Property Mismatch
**What goes wrong:** `colorRange` arrives as a comma-separated string from HTML but the option builder expects `[string, string]` tuple.
**Why it happens:** Lit property converters do not auto-parse strings into arrays; without a `type` converter, the attribute value arrives as a raw string.
**How to avoid:** Declare `@property({ attribute: 'color-range' }) colorRange: string | null = null` (no `type` converter — receives raw string or null). Parse in `_applyData()` with `_parseColorRange()`. This mirrors the `innerRadius` attribute pattern from `LuiPieChart` (Phase 91).
**Warning signs:** TypeScript error if trying to pass `[string, string]` directly as the property from HTML; OR color range prop silently ignored if parsing is skipped.

### Pitfall 6: VisualMap min/max Not Set (Auto-Range vs. Streaming Updates)
**What goes wrong:** VisualMap `min`/`max` is omitted or set to `null`. Initially ECharts auto-computes min/max from data. After `pushData()` updates cells, the VisualMap range may shift, causing the color encoding to change for existing cells. The color scale appears to drift during streaming.
**Why it happens:** ECharts recomputes VisualMap range on each `setOption` call when min/max are not explicitly set. As streaming adds new cell values, the min/max may change, and the entire color mapping shifts.
**How to avoid:** Always set explicit `min` and `max` on the VisualMap. Default to `[0, 100]` or expose `min-value`/`max-value` props on the component so the developer can pin the domain. For Phase 93 scope, expose `color-range` (colors) and default `min/max` to `[0, 100]` with a note that these can be overridden via the `option` prop passthrough.
**Warning signs:** During streaming, the entire heatmap color palette shifts dramatically when new extreme values arrive.

---

## Code Examples

Verified patterns from official sources:

### HeatmapSeriesOption (verified from echarts/types/dist/shared.d.ts lines 10605-10613)
```typescript
// Source: echarts/types/dist/shared.d.ts lines 10592-10613
// HeatmapDataValue = OptionDataValue[]  (i.e., [xIdx, yIdx, value])
// HeatmapSeriesOption.type = 'heatmap'
// HeatmapSeriesOption.coordinateSystem = 'cartesian2d' | 'geo' | 'calendar'
// HeatmapSeriesOption.data = (HeatmapDataItemOption | HeatmapDataValue)[]
//
// Cartesian heatmap series:
const series = {
  type: 'heatmap',
  coordinateSystem: 'cartesian2d',
  data: [
    [0, 0, 5],   // x-category index 0, y-category index 0, value 5
    [0, 1, 2],   // x-category index 0, y-category index 1, value 2
    [1, 0, 8],
  ],
  label: { show: false },
  emphasis: {
    itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' },
  },
};
```

### ContinousVisualMapOption (verified from echarts/types/dist/shared.d.ts lines 9537-9572)
```typescript
// Source: echarts/types/dist/shared.d.ts line 9537-9572
// VisualMapOption.min / .max — required for continuous visual map
// VisualMapOption.inRange — visual properties for in-range data; color: ColorString (per VisualOptionUnit)
// BUT in practice, continuous visualMap inRange.color accepts string[] for gradient stops.
// ContinousVisualMapOption.calculable — enables interactive drag handles on the scale bar
const visualMap = {
  type: 'continuous',
  min: 0,
  max: 100,
  calculable: true,
  orient: 'horizontal',
  left: 'center',
  bottom: '5%',
  inRange: {
    color: ['#313695', '#ffffbf', '#d73027'],  // gradient: blue -> yellow -> red
  },
};
// Two-color range (minColor to maxColor):
const visualMapTwoColor = {
  type: 'continuous',
  min: 0,
  max: 100,
  inRange: { color: ['#313695', '#d73027'] },
};
```

### VisualMapContinuousComponent Registration
```typescript
// Source: echarts/types/dist/components.d.ts line 1
// install$47 as VisualMapContinuousComponent — confirmed named export
// Source: pie-registry.ts Phase 91 — guard pattern

let _heatmapRegistered = false;

export async function registerHeatmapModules(): Promise<void> {
  if (_heatmapRegistered) return;
  _heatmapRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ HeatmapChart }, { VisualMapContinuousComponent }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/components'),
    import('echarts/core'),
  ]);

  use([HeatmapChart, VisualMapContinuousComponent]);
}
```

### Category Axis Setup (verified from echarts/types/dist/shared.d.ts lines 2453-2468)
```typescript
// Source: CategoryAxisBaseOption — type: 'category' + data: OrdinalRawValue[]
// splitArea: { show: true } creates the grid cell borders in the heatmap
const xAxis = { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], splitArea: { show: true } };
const yAxis = { type: 'category', data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], splitArea: { show: true } };
```

### pushData() Override Pattern
```typescript
// Source: base-chart-element.ts lines 164-172 — pushData() is public, overridable
// LuiHeatmapChart override — cell-update semantics

private _cellData: HeatmapCell[] = [];
private _pendingCells = new Map<string, number>();
private _cellRafId?: number;

override pushData(point: unknown): void {
  const [xi, yi, val] = point as HeatmapCell;
  // Last write in same RAF frame wins — no duplicates in the flush
  this._pendingCells.set(`${xi},${yi}`, val);
  if (this._cellRafId === undefined) {
    this._cellRafId = requestAnimationFrame(() => {
      this._flushCellUpdates();
      this._cellRafId = undefined;
    });
  }
}

private _flushCellUpdates(): void {
  if (!this._chart || this._pendingCells.size === 0) return;
  for (const [key, val] of this._pendingCells) {
    const [xi, yi] = key.split(',').map(Number);
    const idx = this._cellData.findIndex((c) => c[0] === xi && c[1] === yi);
    if (idx >= 0) {
      this._cellData[idx] = [xi, yi, val];
    } else {
      this._cellData.push([xi, yi, val]);
    }
  }
  this._pendingCells.clear();
  this._chart.setOption(
    { series: [{ data: this._cellData }] },
    { lazyUpdate: true } as object
  );
}

// Must cancel in disconnectedCallback
override disconnectedCallback(): void {
  if (this._cellRafId !== undefined) {
    cancelAnimationFrame(this._cellRafId);
    this._cellRafId = undefined;
  }
  super.disconnectedCallback();
}
```

### index.ts Additions (Phase 93)
```typescript
// packages/charts/src/index.ts — append after Phase 92 exports:

// Phase 93: Heatmap Chart
export { LuiHeatmapChart } from './heatmap/heatmap-chart.js';
export type { HeatmapCell, HeatmapOptionProps } from './shared/heatmap-option-builder.js';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import * as echarts from 'echarts'` (full bundle) | Tree-shaken subpath `import('echarts/charts')` + explicit `use([HeatmapChart, VisualMapContinuousComponent])` | ECharts 5.0 (2021) | Only heatmap + visualMap included; ~160KB gzip vs ~400KB |
| Geographic heatmap via geo coordinate system | Cartesian heatmap via `coordinateSystem: 'cartesian2d'` | ECharts design (both supported) | Cartesian is the standard for category-matrix heatmaps; geo requires GeoJSON (out of scope per REQUIREMENTS.md) |
| Full `VisualMapComponent` (both types) | `VisualMapContinuousComponent` (continuous only) | ECharts 5.x tree-shaking | Smaller bundle; heatmap always uses continuous visual map |
| Replacing series.data on every pushData | Cell-update Map with RAF coalescing | Phase 93 new pattern | Correct semantics: updating [x,y]=value without overwriting other cells |

**Deprecated/outdated:**
- Using `VisualMapComponent` (both continuous and piecewise) when only continuous is needed: wastes bundle space. Use `VisualMapContinuousComponent` for heatmap.
- Omitting `splitArea: { show: true }` on axes: cells render without visible borders. Always include for standard heatmap grid appearance.

---

## Open Questions

1. **`_flushCellUpdates` performance for large matrices**
   - What we know: `findIndex()` is O(n) per updated cell per flush. For a 10×10 matrix (100 cells) updated 10 cells per frame, this is 1000 operations — negligible. For a 100×100 matrix (10,000 cells) with 100 updates/frame, it is 100,000 comparisons per frame — still fast but worth noting.
   - What's unclear: Whether the project will need to support large heatmaps (>50×50 cells) in Phase 93 scope. HEAT-02 requirement does not specify matrix size.
   - Recommendation: For Phase 93, use `findIndex()` — simple and correct. If performance becomes an issue for large matrices, a `Map<string, number>` index into `_cellData` could be added in a follow-up.

2. **VisualMap min/max auto-computation vs. explicit props**
   - What we know: ECharts auto-computes VisualMap range from data when min/max are omitted. This causes color drift during streaming as new extreme values arrive (Pitfall 6).
   - What's unclear: Whether to expose `min-value`/`max-value` props on the component, or just rely on the `option` prop passthrough for custom range.
   - Recommendation: Default min/max to 0/100 in `buildHeatmapOption()`. The `option` passthrough (CHART-02 from Phase 88) allows developers to set `visualMap.min`/`max` manually when needed. No additional component props needed for Phase 93 scope.

3. **`inRange.color` TypeScript type mismatch**
   - What we know: `VisualOptionUnit.color` is typed as `ColorString` (single string) in the ECharts type definitions. But in practice, continuous VisualMap's `inRange.color` accepts `string[]` for gradient stops. The TS types use `VisualOptionBase = { [key in BuiltinVisualProperty]?: any }` (all `any`), so this is not a compile-time error.
   - What's unclear: Whether `Record<string, unknown>` return type from `buildHeatmapOption()` will cause any friction with the `inRange: { color: string[] }` value. It should be fine since the return type is `Record<string, unknown>`.
   - Recommendation: Keep the return type as `Record<string, unknown>` (consistent with all other option builders). No special type handling needed.

---

## Validation Architecture

> Skipped — `workflow.nyquist_validation` is not present in `.planning/config.json` (validation mode not enabled for this project).

---

## Sources

### Primary (HIGH confidence)
- `packages/charts/node_modules/echarts/types/dist/charts.d.ts` — `HeatmapChart`, `HeatmapSeriesOption` named exports confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` lines 10592-10613 — `HeatmapDataValue = OptionDataValue[]`, `HeatmapSeriesOption { type: 'heatmap', coordinateSystem: 'cartesian2d' | ..., data: ... }` confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` lines 5081-5159 — `VisualMapOption { min, max, inRange, outOfRange, ... }` confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` lines 9537-9572 — `ContinousVisualMapOption { calculable, range, hoverLink, ... }` confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` lines 2453-2468 — `CategoryAxisBaseOption { type: 'category', data: OrdinalRawValue[], boundaryGap, ... }` confirmed
- `packages/charts/node_modules/echarts/types/dist/components.d.ts` line 1 — `VisualMapContinuousComponent`, `VisualMapComponent`, `VisualMapPiecewiseComponent` named exports confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` lines 6807-6818 — `VisualOptionUnit { color?: ColorString; ... }` — inRange base type confirmed; accepts `any` via `VisualOptionBase`
- `packages/charts/src/base/base-chart-element.ts` — `pushData()` is public non-abstract; `_flushPendingData()` is private; `_circularBuffer`/`_pendingData`/`_rafId` are all private; base `_streamingMode = 'buffer'` default confirmed
- `packages/charts/src/pie/pie-registry.ts` + `packages/charts/src/pie/pie-chart.ts` — Phase 91 three-file pattern confirmed for replication
- `packages/charts/src/scatter/scatter-chart.ts` — Phase 92 `updated()` watchlist pattern confirmed

### Secondary (MEDIUM confidence)
- Phase 92 RESEARCH.md — `VisualMapComponent` not in `canvas-core.ts` inferred from inspection of canvas-core.ts (confirmed: no VisualMap in canvas-core.ts imports)
- Project STATE.md accumulated decisions — buffer streaming path for non-line charts, attribute: false for array properties, kebab-case attribute naming

### Tertiary (LOW confidence)
- ECharts heatmap `splitArea: { show: true }` for grid borders — standard community pattern for heatmaps; not formally verified from echarts official docs in this research session

---

## Metadata

**Confidence breakdown:**
- Standard stack (HeatmapChart + VisualMapContinuousComponent): HIGH — both confirmed in installed echarts@5.6.0 type declarations; no new packages needed
- Architecture (three-file pattern): HIGH — mirrors Phase 91/92 exactly; only additions are VisualMap registration and pushData override
- Streaming (pushData override with cell-update Map): HIGH — base class code confirmed; pushData() is public and overridable; private fields prevent any other approach; logic is straightforward
- VisualMap configuration (inRange.color gradient): HIGH — type confirmed; standard ECharts usage pattern
- Pitfalls: HIGH — derived directly from code inspection (base class private fields, canvas-core.ts contents)

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (echarts@5.6.0 pinned; architecture stable)
