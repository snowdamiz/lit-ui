# Phase 91: Pie + Donut Chart - Research

**Researched:** 2026-02-28
**Domain:** ECharts 5.6.0 PieChart — concrete Lit web component extending BaseChartElement with small-slice merging, donut inner radius, and streaming
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PIE-01 | Developer can render a pie chart with automatic small-slice merging below a configurable threshold | ECharts `PieChart` module with `type: 'pie'` series; small-slice merging is NOT an ECharts feature — must be implemented in `buildPieOption()` by computing total, finding slices where `value/total*100 < minPercent`, summing them into an `{ name: 'Other', value: sum }` entry before passing to ECharts |
| PIE-02 | Developer can render a donut chart with configurable inner radius and center label text | `radius: [innerRadius, '70%']` — array form where first element is inner radius (e.g., `'40%'`); center label via `title: { text: centerLabel, left: 'center', top: 'center' }` — `TitleComponent` already registered in `canvas-core.ts`, no new component registration needed |
| PIE-03 | Developer can stream data updates into pie/donut charts via `pushData()` | Base class `_streamingMode = 'buffer'` (the default) provides circular buffer + `setOption({ series: [{ data }] }, { lazyUpdate: true })`; pie data shape is `{ name: string, value: number }[]` — callers push `{ name, value }` objects to `pushData()`; ECharts merges by `name` on setOption diff |
</phase_requirements>

---

## Summary

Phase 91 builds one concrete chart component — `LuiPieChart` (`lui-pie-chart`) — extending `BaseChartElement` from Phase 88. The pattern is identical to Phase 90 (bar chart): register the ECharts `PieChart` module in `_registerModules()`, build the ECharts option from props via a dedicated `buildPieOption()` helper, and call `this._chart.setOption(option)` in `updated()` when relevant props change.

The most significant PIE-specific complexity is the **small-slice merging** required by PIE-01. ECharts has no built-in "merge small slices" feature — the `minAngle` property only forces a minimum visual arc size, it does NOT merge slices. The merging must be implemented in `buildPieOption()`: compute the total value, identify slices where `(value / total) * 100 < minPercent`, sum them together, and inject a synthesized `{ name: 'Other', value: sum }` entry into the data before passing it to ECharts. This is pure TypeScript data processing — no ECharts API surface is involved.

The donut mode (PIE-02) is purely a `radius` array configuration: setting `radius: [innerRadius, '70%']` on the pie series, where the first element is the inner hole size (e.g., `'40%'`). A center label is added via the `title` component which is already registered in `canvas-core.ts` (`TitleComponent`) — no new component registration is needed. Setting `title: { text: centerLabel, left: 'center', top: 'center' }` in the ECharts option places text in the donut hole. When no `centerLabel` prop is set, the `title` key is omitted from the option.

Streaming (PIE-03) uses the same circular buffer path as bar charts. The base class `_flushPendingData()` calls `setOption({ series: [{ data: _circularBuffer }] }, { lazyUpdate: true })`, which replaces `series[0].data` with accumulated buffer contents. For pie charts, callers push `{ name: string, value: number }` objects. ECharts performs a name-based diff on `setOption` — slices with the same `name` are updated in-place with smooth transitions.

**Primary recommendation:** Implement `LuiPieChart` following the exact Phase 90 concrete-chart pattern. Create `pie-registry.ts`, `pie-option-builder.ts`, and `pie-chart.ts`. The `min-percent` prop drives small-slice merging logic in `buildPieOption()`. The `inner-radius` prop sets `radius[0]`. The `center-label` prop sets `title.text`. All three are pure option transforms — no ECharts extension needed.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts | ^5.6.0 (already installed) | Chart engine — `PieChart` module | Already in `packages/charts/` dependencies from Phase 88; `PieChart` export confirmed in `echarts/charts` type declarations |
| lit | ^3.3.2 (peer) | Web component base | Project baseline; `BaseChartElement` already extends it |
| @lit-ui/core | workspace:* (peer) | TailwindElement, CSS tokens | Inherited via BaseChartElement |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| echarts/charts — PieChart | subpath of echarts@5.6.0 | Registers ECharts pie series renderer | Imported dynamically in `_registerModules()`; single module covers both pie and donut (donut = pie with inner radius) |
| registerCanvasCore | internal (canvas-core.ts) | Registers shared ECharts components including `TitleComponent` | Already registers `TitleComponent` which handles center label — call first in `_registerModules()` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `title` component for center label | `graphic` component with text element | `graphic` requires registering `GraphicComponent` (not in canvas-core.ts). `title` is already registered — zero extra bundle cost. `title` is simpler and sufficient for a string label. Use `graphic` only if rich-text styling is required (out of Phase 91 scope). |
| Manual small-slice merging in option builder | ECharts `minAngle` property | `minAngle` makes small slices visually wider but does NOT merge them or create an "Other" entry. Always use the manual pre-processing approach in `buildPieOption()`. |
| Separate `LuiDonutChart` component | `inner-radius` prop on `LuiPieChart` | ECharts has no separate donut type — a donut is a pie with non-zero inner radius. One component with `inner-radius` prop is the correct architecture. |

**Installation:** No new packages needed. `PieChart` is already available in the installed `echarts@5.6.0` in `packages/charts/`.

---

## Architecture Patterns

### Recommended Project Structure
```
packages/charts/src/
├── base/
│   ├── base-chart-element.ts      # (Phase 88, complete)
│   └── theme-bridge.ts            # (Phase 88, complete)
├── registry/
│   └── canvas-core.ts             # (Phase 88, complete) — TitleComponent already registered
├── line/
│   ├── line-chart.ts              # (Phase 89, complete)
│   └── line-registry.ts           # (Phase 89, complete)
├── area/
│   └── area-chart.ts              # (Phase 89, complete)
├── bar/
│   ├── bar-chart.ts               # (Phase 90, complete)
│   └── bar-registry.ts            # (Phase 90, complete)
├── shared/
│   ├── line-option-builder.ts     # (Phase 89, complete)
│   ├── bar-option-builder.ts      # (Phase 90, complete)
│   └── pie-option-builder.ts      # NEW Phase 91 — buildPieOption() + types
├── pie/
│   ├── pie-chart.ts               # NEW Phase 91 — LuiPieChart class
│   └── pie-registry.ts            # NEW Phase 91 — registerPieModules()
└── index.ts                       # updated to export LuiPieChart + pie types
```

### Pattern 1: Small-Slice Merging in Option Builder
**What:** `buildPieOption()` pre-processes data before passing to ECharts. Slices below the `minPercent` threshold are summed into an "Other" entry. This is pure TypeScript — no ECharts API is involved.
**When to use:** When `minPercent > 0` (default 0 means no merging — all slices shown).

```typescript
// Source: ECharts PieSeriesOption verified from installed types + manual pre-processing pattern
// packages/charts/src/shared/pie-option-builder.ts

export type PieSlice = {
  name: string;
  value: number;
};

export type PieOptionProps = {
  // PIE-01: Merge slices below this percentage into "Other". 0 = no merging (default).
  minPercent?: number;
  // PIE-02: Inner radius for donut mode. Empty string = pie (no hole). Examples: '40%', '0%', 60.
  innerRadius?: string | number;
  // PIE-02: Text to display in donut center hole. Only shown when innerRadius is set.
  centerLabel?: string;
  // Optional: label showing percentage or name on slices. Default: show outside.
  showLabels?: boolean;
};

export function buildPieOption(
  slices: PieSlice[],
  props: PieOptionProps
): Record<string, unknown> {
  // PIE-01: Small-slice merging — pre-process before handing to ECharts
  // ECharts minAngle does NOT merge slices; manual pre-processing is required.
  const mergedSlices = _mergeSmallSlices(slices, props.minPercent ?? 0);

  const innerRadius = props.innerRadius ?? 0;
  const isDonut = innerRadius !== 0 && innerRadius !== '0%' && innerRadius !== '';

  const series: Record<string, unknown> = {
    type: 'pie' as const,
    data: mergedSlices,
    // PIE-02: radius as array enables donut. radius[0] = inner, radius[1] = outer.
    // For pie (no hole): radius: '70%' or radius: [0, '70%']
    // For donut: radius: ['40%', '70%']
    radius: isDonut ? [innerRadius, '70%'] : '70%',
    // avoidLabelOverlap: default true is correct for standard pie charts.
    // Only set false when using position: 'center' label (not our case).
    tooltip: { trigger: 'item' as const },
  };

  const option: Record<string, unknown> = {
    legend: { show: true, type: 'scroll' as const },
    tooltip: { trigger: 'item' as const },
    series: [series],
  };

  // PIE-02: Center label — use TitleComponent (already registered in canvas-core.ts).
  // Only inject title when a center label is provided AND we're in donut mode.
  // Setting title on a pie chart (no hole) places text on top of filled slices.
  if (isDonut && props.centerLabel) {
    option['title'] = {
      text: props.centerLabel,
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    };
  }

  return option;
}

function _mergeSmallSlices(slices: PieSlice[], minPercent: number): PieSlice[] {
  if (minPercent <= 0 || slices.length === 0) return slices;

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return slices;

  const kept: PieSlice[] = [];
  let otherValue = 0;

  for (const slice of slices) {
    const pct = (slice.value / total) * 100;
    if (pct < minPercent) {
      otherValue += slice.value;
    } else {
      kept.push(slice);
    }
  }

  if (otherValue > 0) {
    kept.push({ name: 'Other', value: otherValue });
  }

  return kept;
}
```

### Pattern 2: Pie Registry
**What:** `pie-registry.ts` calls `registerCanvasCore()` then registers `PieChart`. Same guard pattern as `bar-registry.ts` and `line-registry.ts`.

```typescript
// Source: bar-registry.ts pattern (Phase 90) + PieChart confirmed in echarts/charts types
// packages/charts/src/pie/pie-registry.ts
let _pieRegistered = false;

export async function registerPieModules(): Promise<void> {
  if (_pieRegistered) return;
  _pieRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ PieChart }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/core'),
  ]);

  use([PieChart]);
}
```

### Pattern 3: LuiPieChart Component
**What:** Extends `BaseChartElement`. Reactive props: `min-percent` (number), `inner-radius` (string/number), `center-label` (string). No `_streamingMode` override — inherits base `'buffer'` default.

```typescript
// Source: BaseChartElement Phase 88 pattern + Phase 90 LuiBarChart pattern
// packages/charts/src/pie/pie-chart.ts

import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerPieModules } from './pie-registry.js';
import { buildPieOption, type PieSlice } from '../shared/pie-option-builder.js';

export class LuiPieChart extends BaseChartElement {
  // NO _streamingMode override — base 'buffer' is correct for pie charts
  // STRM-04: "all other chart types use circular buffer + setOption({ lazyUpdate: true })"

  // PIE-01: Merge slices below this percentage into "Other". 0 = no merging (default).
  @property({ type: Number, attribute: 'min-percent' }) minPercent = 0;

  // PIE-02: Inner radius for donut mode. '' or 0 = standard pie (no hole).
  @property({ attribute: 'inner-radius' }) innerRadius: string | number = 0;

  // PIE-02: Text to display in the donut center hole.
  @property({ attribute: 'center-label' }) centerLabel = '';

  protected override async _registerModules(): Promise<void> {
    await registerPieModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // base handles this.option and this.loading
    if (!this._chart) return;
    const pieProps = ['data', 'minPercent', 'innerRadius', 'centerLabel'] as const;
    if (pieProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart || !this.data) return;
    const option = buildPieOption(this.data as PieSlice[], {
      minPercent: this.minPercent,
      innerRadius: this.innerRadius,
      centerLabel: this.centerLabel || undefined,
    });
    this._chart.setOption(option, { notMerge: false });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('lui-pie-chart')) {
  customElements.define('lui-pie-chart', LuiPieChart);
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-pie-chart': LuiPieChart;
  }
}
```

### Pattern 4: Streaming Data Shape for Pie
**What:** The base buffer path calls `setOption({ series: [{ data: _circularBuffer }] })`. For pie charts, the buffer elements must be `{ name: string, value: number }` objects. ECharts performs a name-based diff when merging series data on `setOption`.

```typescript
// Consumer: stream new proportions into a pie chart
// Each push replaces or adds a named slice via ECharts name-diff
pieChart.pushData({ name: 'CPU', value: 42 });
pieChart.pushData({ name: 'Memory', value: 31 });
// After RAF flush: setOption({ series: [{ data: [{ name: 'CPU', value: 42 }, { name: 'Memory', value: 31 }] }] })
// ECharts animates proportions from previous state to new state by name
```

**Limitation:** The base buffer accumulates ALL pushed points. For pie charts, "streaming" typically means updating values by name, not appending unbounded new slices. The `maxPoints` cap (default 1000) prevents memory issues, but semantically the last-written value for each named slice prevails in ECharts' name-diff logic.

### Anti-Patterns to Avoid
- **Using ECharts `minAngle` as "small slice merging":** `minAngle` only inflates the visual arc of tiny slices; it does NOT create an "Other" segment. Always pre-process in `buildPieOption()`.
- **`radius: '40%'` as a string (pie mode) then relying on center label:** The center label via `title` is only meaningful when `innerRadius` creates a visible hole. On a filled pie, the title text overlaps with slices.
- **Not omitting `title` key when `centerLabel` is empty:** Setting `title: { text: '' }` renders an empty title element that can interfere with layout. Only inject `title` when `centerLabel` is a non-empty string AND `isDonut` is true.
- **Calling `appendData` path for pie charts:** `appendData` is strictly a line/area time-series path. Pie charts MUST use `_streamingMode = 'buffer'` (the base default).
- **`notMerge: true` on `setOption` for live-updated charts:** `notMerge: true` wipes all previously applied `option` overrides. Use `notMerge: false` (the default) so the base class's `option` prop passthrough still applies.
- **Separate `LuiDonutChart` component:** ECharts has no separate donut chart type. One component handles both modes via `inner-radius` prop.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Small-slice merging | ECharts plugin or custom renderer | `_mergeSmallSlices()` in option builder | Pure TypeScript function — sums values below threshold into "Other" entry before data reaches ECharts |
| Donut center text | CSS absolute positioning over canvas | `title: { left: 'center', top: 'center' }` in ECharts option | `TitleComponent` already registered in canvas-core.ts; text is rendered in canvas coordinate space, no z-index issues |
| Pie proportions calculation | Manual percentage math in series data | Let ECharts compute proportions from raw values | ECharts auto-calculates each slice's angle from raw `value` — pass raw numbers, not pre-computed percentages |
| Streaming pie updates | Custom diff/merge of named slice arrays | Base class `_circularBuffer` + `setOption` name-diff | ECharts performs name-based diffing on `setOption`; slices with matching `name` are animated in-place |
| Legend with many slices | Custom legend HTML | `legend: { type: 'scroll' }` in option | ECharts scrollable legend handles overflow automatically |

**Key insight:** A donut chart in ECharts is a pie chart with `radius[0] > 0`. The "Other" segment is a pre-processing concern, not an ECharts feature. Everything in Phase 91 is option-building and data pre-processing — no custom rendering code.

---

## Common Pitfalls

### Pitfall 1: minAngle Is NOT Small-Slice Merging
**What goes wrong:** Setting `minAngle: 5` on the series makes small slices wider, but the slice count does not decrease and no "Other" entry appears.
**Why it happens:** `minAngle` is a visual floor for arc size — it stretches small slices to remain visible. It does not aggregate slices.
**How to avoid:** Implement `_mergeSmallSlices()` in `buildPieOption()`. Only pass merged data to ECharts. `minAngle` can optionally be set alongside, but is not required.
**Warning signs:** After setting `min-percent`, chart still shows many thin slices with no "Other" entry.

### Pitfall 2: Center Label on Non-Donut Pie
**What goes wrong:** Setting `center-label` with `inner-radius = 0` places title text directly over filled pie slices, making it illegible.
**Why it happens:** `title: { left: 'center', top: 'center' }` places text at the chart container center — overlapping with the filled pie area.
**How to avoid:** Only inject the `title` key when `isDonut` is true (i.e., `innerRadius` is a non-zero value). Guard in `buildPieOption()`: `if (isDonut && props.centerLabel)`.
**Warning signs:** Title text is hidden behind or blended with pie slices.

### Pitfall 3: Streaming Buffer Accumulates All Pushed Slices
**What goes wrong:** After 50 `pushData()` calls with different names, the pie chart grows to 50 slices even though only 5 unique names were intended.
**Why it happens:** The base `_circularBuffer` pushes all items into the buffer array. `setOption({ series: [{ data: _circularBuffer }] })` sends all 50 entries to ECharts.
**Why it's acceptable for PIE-03:** PIE-03 says "see proportions update" — for typical streaming updates, callers push `{ name, value }` with the same names, replacing old values via ECharts' name-diff. However if many unique names are pushed, the buffer grows. The `maxPoints` cap (default 1000) prevents unbounded growth.
**How to avoid:** Document that `pushData()` for pie charts is intended for updating values of existing slices by name. For PIE-03 ("proportions update without re-initialization"), streaming with consistent slice names is the expected use case.
**Warning signs:** Pie grows to many slices over time instead of updating proportions of the same slices.

### Pitfall 4: innerRadius Type Handling
**What goes wrong:** Setting `inner-radius="40%"` (string attribute) works; setting `inner-radius="0"` should produce a filled pie but the `isDonut` guard incorrectly treats it as truthy.
**Why it happens:** `'0'` is a truthy string in JavaScript, so `if (innerRadius)` would be true for string `'0'`.
**How to avoid:** In `buildPieOption()`, check: `const isDonut = innerRadius !== 0 && innerRadius !== '0%' && innerRadius !== '' && innerRadius !== '0'`. Or convert to number first and check `> 0`.
**Warning signs:** `inner-radius="0"` renders as a donut with zero inner radius (visually a pie with a center dot artifact).

### Pitfall 5: `avoidLabelOverlap` Default Behavior
**What goes wrong:** On a pie chart with many small slices, labels overlap and ECharts auto-repositions them, causing label lines to cross.
**Why it happens:** ECharts `avoidLabelOverlap: true` (default) aggressively moves labels, which can produce unexpected layout on crowded charts.
**How to avoid:** For the standard case, accept ECharts default. If a developer has set `min-percent` to merge small slices, label crowding is reduced automatically. This is not a Phase 91 blocker.
**Warning signs:** Labels are correctly positioned for a few slices but cross each other with many slices.

### Pitfall 6: `title` Component Conflicts with `option` Prop Passthrough
**What goes wrong:** Consumer sets `option = { title: { text: 'My Chart Title', top: 10 } }` via the base class `option` prop, but `buildPieOption()` also injects a `title` for the center label — one overwrites the other.
**Why it happens:** `setOption` with `notMerge: false` merges, but `title` is a top-level object — the last `setOption` call wins for top-level keys.
**How to avoid:** This is an edge case. Document that `center-label` and a consumer-provided `title` via `option` prop are mutually exclusive. If both are set, the `option` prop (applied first in `_initChart`) will be overwritten by `_applyData()`. This is acceptable for Phase 91 scope.
**Warning signs:** Custom title disappears when `center-label` is set.

---

## Code Examples

Verified patterns from installed ECharts 5.6.0 type declarations and Phase 88-90 codebase:

### PieChart Registration (pie-registry.ts)
```typescript
// Source: bar-registry.ts Phase 90 pattern + PieChart confirmed in echarts/charts type declarations
let _pieRegistered = false;

export async function registerPieModules(): Promise<void> {
  if (_pieRegistered) return;
  _pieRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ PieChart }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/core'),
  ]);

  use([PieChart]);
}
```

### ECharts PieSeriesOption Properties (verified from shared.d.ts line 9815)
```typescript
// Verified: PieSeriesOption key properties
// interface PieSeriesOption {
//   type?: 'pie';
//   center?: string | number | (string | number)[];  // position of pie center
//   radius?: (number | string)[] | number | string;  // [inner, outer] or just outer
//   roseType?: 'radius' | 'area';                    // nightingale rose chart
//   clockwise?: boolean;
//   startAngle?: number;
//   minAngle?: number;         // minimum visual arc (NOT merging)
//   avoidLabelOverlap?: boolean;
//   data?: PieDataItemOption[];
// }

// PieDataItemOption shape (verified from shared.d.ts line 9812):
// interface PieDataItemOption extends OptionDataItemObject<OptionDataValueNumeric> {
//   name?: string;
//   value?: number;
//   selected?: boolean;
//   itemStyle?: PieItemStyleOption;
//   label?: PieLabelOption;
// }
```

### Donut Chart Option (verified from official ECharts handbook + types)
```typescript
// Source: https://apache.github.io/echarts-handbook/en/how-to/chart-types/pie/doughnut/ + shared.d.ts
// radius[0] = inner radius, radius[1] = outer radius
const donutOption = {
  title: {
    text: 'Total: 1234',    // center label
    left: 'center',
    top: 'center',
  },
  legend: { show: true, type: 'scroll' },
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],   // donut: inner 40%, outer 70%
    data: [
      { name: 'A', value: 335 },
      { name: 'B', value: 234 },
      { name: 'Other', value: 50 },   // merged small slices
    ],
  }],
};
```

### Small-Slice Merging Function
```typescript
// Pure TypeScript — no ECharts API involved
// Source: Manual implementation — ECharts minAngle does NOT merge slices
function _mergeSmallSlices(slices: PieSlice[], minPercent: number): PieSlice[] {
  if (minPercent <= 0 || slices.length === 0) return slices;

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return slices;

  const kept: PieSlice[] = [];
  let otherValue = 0;

  for (const slice of slices) {
    const pct = (slice.value / total) * 100;
    if (pct < minPercent) {
      otherValue += slice.value;
    } else {
      kept.push(slice);
    }
  }

  if (otherValue > 0) {
    kept.push({ name: 'Other', value: otherValue });
  }

  return kept;
}
```

### Updated index.ts (Phase 91 additions)
```typescript
// packages/charts/src/index.ts additions for Phase 91
// Append after Phase 90 exports:

// Phase 91: Pie + Donut Chart
export { LuiPieChart } from './pie/pie-chart.js';
export type { PieSlice, PieOptionProps } from './shared/pie-option-builder.js';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate `DoughnutChart` component | `radius: [inner, outer]` on `PieChart` | ECharts design (always) | No separate module — donut is pie with inner radius set |
| `graphic` component for center text | `title` component (`left: 'center', top: 'center'`) | ECharts 5.x pattern | `TitleComponent` already registered in canvas-core.ts; zero extra bundle cost |
| Manual percentage in data | Raw `value` numbers | ECharts design | ECharts auto-computes proportions from raw values |
| Full ECharts import for PieChart | Tree-shaken `PieChart` from `echarts/charts` | ECharts 5.0 (2021) | ~400KB → ~160KB gzip |

**Deprecated/outdated:**
- `echarts.registerTheme()` for pie theming: Phase 88's `ThemeBridge` handles this at init time.
- `data: [value1, value2, ...]` (plain number array): Pie charts require `{ name, value }` objects for ECharts name-diff streaming to work correctly.

---

## Open Questions

1. **Streaming buffer behavior for pie: "update by name" vs "append new slices"**
   - What we know: Base `_circularBuffer` accumulates all pushed items. `setOption({ series: [{ data: _circularBuffer }] })` passes all buffered items to ECharts. ECharts performs name-based diff — items with the same `name` update in place; new names create new slices.
   - What's unclear: PIE-03 says "see proportions update without re-initialization." For typical use (streaming updated values for the same named slices), pushing `{ name: 'CPU', value: 42 }` multiple times will accumulate duplicate entries in `_circularBuffer` but ECharts only renders the last value for each name on each `setOption` call.
   - Recommendation: This is acceptable for PIE-03 scope. The `maxPoints` cap prevents unbounded growth. Document the expected usage: callers push `{ name, value }` for existing slice names to update proportions. Do NOT override `_flushPendingData` for Phase 91 — the base buffer behavior satisfies the requirement.

2. **`innerRadius` prop type — string vs number attribute handling**
   - What we know: `@property({ attribute: 'inner-radius' })` without a `type` converter treats the attribute value as a string. Setting `inner-radius="40%"` gives the string `'40%'`. Setting `inner-radius="40"` gives the string `'40'`, not the number `40`. ECharts `radius` accepts both string percentages and numbers (pixel values).
   - What's unclear: Should the property type be `string` only (always percentage strings) or `string | number` (allowing both)?
   - Recommendation: Declare as `@property({ attribute: 'inner-radius' }) innerRadius: string | number = 0;` — consumers use strings like `'40%'` from HTML attributes (which is the common case). If a consumer sets the JS property directly, numbers work too. The `isDonut` guard must handle `'0'` as falsy equivalent.

---

## Sources

### Primary (HIGH confidence)
- `packages/charts/node_modules/echarts/types/dist/charts.d.ts` — `PieChart` and `PieSeriesOption` exports confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` line 9815 — `PieSeriesOption` interface verified: `radius`, `center`, `minAngle`, `avoidLabelOverlap`, `data`
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` line 6660 — `CircleLayoutOptionMixin.radius: (number | string)[] | number | string` confirmed
- `packages/charts/node_modules/echarts/types/dist/components.d.ts` — `GraphicComponent` exported from `echarts/components` (NOT in canvas-core.ts)
- `packages/charts/src/registry/canvas-core.ts` — `TitleComponent` already registered; `GraphicComponent` NOT registered
- `packages/charts/src/base/base-chart-element.ts` — `_streamingMode = 'buffer'` default confirmed; `_flushPendingData()` circular buffer pattern at lines 328-347
- `packages/charts/src/bar/bar-chart.ts` and `bar-registry.ts` — Phase 90 concrete chart pattern verified for replication
- `.planning/REQUIREMENTS.md` — STRM-04 confirmed: "all other chart types use circular buffer + `setOption({ lazyUpdate: true })`"

### Secondary (MEDIUM confidence)
- [Apache ECharts Doughnut Handbook](https://apache.github.io/echarts-handbook/en/how-to/chart-types/pie/doughnut/) — `radius: ['40%', '70%']` format, `title` center label approach verified
- ECharts data transition docs (WebSearch verified) — name-based diff on `setOption` confirmed; pie proportions auto-calculated from raw values

### Tertiary (LOW confidence)
- None — all critical findings verified from installed ECharts 5.6.0 type declarations and codebase.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `PieChart` export confirmed from installed `echarts@5.6.0` type declarations; no new packages needed
- Architecture: HIGH — `BaseChartElement` and Phase 90 concrete chart patterns verified from actual codebase; `LuiPieChart` is a direct application of the same pattern
- ECharts API (radius array, minAngle, title center): HIGH — all verified from `PieSeriesOption` in `shared.d.ts` and `CircleLayoutOptionMixin`; `TitleComponent` registration confirmed in canvas-core.ts
- Small-slice merging: HIGH — manual pre-processing approach verified as the only correct method (ECharts `minAngle` does not merge)
- Streaming (circular buffer): HIGH — `_flushPendingData()` buffer mode verified from `base-chart-element.ts`; STRM-04 requirement confirmed
- Center label via `title` vs `graphic`: HIGH — `TitleComponent` already registered; `GraphicComponent` confirmed NOT in canvas-core.ts; `title` approach avoids extra registration

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (ECharts 5.6.0 pinned; architecture stable)
