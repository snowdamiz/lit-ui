# Phase 95: Treemap Chart - Research

**Researched:** 2026-02-28
**Domain:** ECharts treemap series, hierarchical data visualization, Lit web components
**Confidence:** HIGH

## Summary

Phase 95 implements `LuiTreemapChart` (`lui-treemap-chart`), following the exact same two-plan structure every preceding chart phase has used: Plan 01 builds the option builder and registry, Plan 02 builds the Lit component and adds index.ts exports. The pattern is fully established across Phases 89-94 and requires zero architectural decisions — only treemap-specific ECharts API knowledge is needed.

ECharts 5 includes `TreemapChart` as a named tree-shakeable export from `'echarts/charts'`. Breadcrumb navigation is a built-in feature of the `TreemapChart` module — there is no separate `BreadcrumbComponent` to import. The treemap `levels` array provides per-depth visual configuration including `color[]`, `colorSaturation`, and `itemStyle.borderRadius` for rounded cells. The data format is `{ name, value, children[] }` exactly as required by TREE-01.

The most important ECharts treemap decisions for planning: (1) `nodeClick: 'zoomToNode'` is the default and provides breadcrumb-visible drill-down automatically, (2) per-level colors are passed as an array of strings to `levels[n].color` — NOT as a flat `levelColors` prop shortcut, (3) `borderRadius` lives inside `itemStyle` at the series or per-level scope, not a top-level prop. No streaming is required for treemap (TREE-01/TREE-02 have no streaming requirement), so no `pushData()` override is needed.

**Primary recommendation:** Follow the established Phase 94 pattern exactly. Two plans: `treemap-option-builder.ts` + `treemap-registry.ts` (Plan 01), then `treemap-chart.ts` + `index.ts` exports (Plan 02).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TREE-01 | Developer can render a treemap from hierarchical `{ name, value, children[] }` data | ECharts treemap series accepts this exact data format natively. `buildTreemapOption()` maps the data array directly to `series[0].data`. No pre-processing needed — ECharts handles recursive children internally. |
| TREE-02 | Developer can configure breadcrumb navigation, rounded cells, and per-level colors | Breadcrumb: `series.breadcrumb.show` (boolean, default true). Rounded cells: `series.levels[n].itemStyle.borderRadius` or top-level `series.itemStyle.borderRadius`. Per-level colors: `series.levels` array where each entry has `color: string[]`. These map to component props: `breadcrumb` (boolean), `rounded` (boolean), `level-colors` (JSON string array of arrays). |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts/charts (TreemapChart) | 5.6.0 (pinned) | Treemap chart module for tree-shaking | Project pins ECharts 5.6.0 for echarts-gl compat; TreemapChart is a named export |
| echarts/core | 5.6.0 | ECharts core: `use()`, `init()` | Same dynamic import pattern across all chart phases |
| lit | (project version) | Lit LitElement base via BaseChartElement | All charts extend BaseChartElement |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| canvas-core.ts (project) | internal | Shared ECharts components: TooltipComponent, GridComponent, LabelLayout, etc. | Called via `registerCanvasCore()` in every chart registry |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ECharts treemap `levels[]` for per-level colors | Sunburst chart | Treemap is space-filling (required); sunburst is radial — wrong chart type |
| `nodeClick: 'zoomToNode'` for breadcrumb navigation | Custom click event handler | ECharts built-in breadcrumb + zoomToNode handles all navigation state; custom handler adds complexity for no gain |

**Installation:** No new packages. ECharts 5.6.0 is already installed. `TreemapChart` is already available in the installed `echarts` package.

## Architecture Patterns

### Recommended Project Structure

```
packages/charts/src/
├── shared/
│   └── treemap-option-builder.ts   # TreemapNode, TreemapOptionProps, buildTreemapOption()
├── treemap/
│   ├── treemap-registry.ts         # registerTreemapModules() with TreemapChart
│   └── treemap-chart.ts            # LuiTreemapChart extends BaseChartElement
└── index.ts                        # Phase 95 exports added here
```

This mirrors Phase 94 exactly:
- `candlestick-option-builder.ts` → `treemap-option-builder.ts`
- `candlestick-registry.ts` → `treemap-registry.ts`
- `candlestick-chart.ts` → `treemap-chart.ts`

### Pattern 1: Option Builder (treemap-option-builder.ts)

**What:** Pure function `buildTreemapOption()` that takes `TreemapNode[]` and `TreemapOptionProps` and returns a `Record<string, unknown>` ECharts option object.
**When to use:** Called by `_applyData()` in the component whenever reactive props change.
**Example:**

```typescript
// Source: established pattern from Phase 94 candlestick-option-builder.ts

export type TreemapNode = {
  name: string;
  value: number;
  children?: TreemapNode[];
};

export type LevelColorConfig = {
  color: string[];
  colorSaturation?: [number, number];
  borderRadius?: number;
};

export type TreemapOptionProps = {
  /** Show ECharts built-in breadcrumb navigation. Default: true */
  breadcrumb?: boolean;
  /** Apply borderRadius to cells at all levels. Default: 0 */
  borderRadius?: number;
  /** Per-level color arrays. levels[0] applies to depth-0 nodes. */
  levelColors?: string[][];
};

export function buildTreemapOption(
  data: TreemapNode[],
  props: TreemapOptionProps
): Record<string, unknown> {
  const showBreadcrumb = props.breadcrumb ?? true;
  const borderRadius = props.borderRadius ?? 0;
  const levelColors = props.levelColors ?? [];

  // Build levels array — each entry applies to one depth of the hierarchy
  const levels = levelColors.map((colors, i) => ({
    color: colors,
    itemStyle: {
      borderRadius: borderRadius > 0 ? Math.max(0, borderRadius - i) : 0,
      gapWidth: i === 0 ? 4 : 2,
      borderWidth: i === 0 ? 3 : 1,
    },
  }));

  // When no levelColors provided but borderRadius is set, apply globally
  const seriesItemStyle = levelColors.length === 0 && borderRadius > 0
    ? { borderRadius }
    : {};

  return {
    tooltip: { trigger: 'item' },
    breadcrumb: {
      show: showBreadcrumb,
      height: 22,
      left: 'center',
      bottom: 0,
    },
    series: [
      {
        type: 'treemap',
        width: '100%',
        height: showBreadcrumb ? 'calc(100% - 30px)' : '100%',
        nodeClick: 'zoomToNode',  // enables breadcrumb navigation
        roam: false,
        animationDurationUpdate: 900,
        breadcrumb: { show: showBreadcrumb },
        levels: levels.length > 0 ? levels : undefined,
        itemStyle: seriesItemStyle,
        data,
      },
    ],
  };
}
```

### Pattern 2: Registry (treemap-registry.ts)

**What:** Async function that registers `TreemapChart` with ECharts `use()`. Guards against double-registration with a module-level boolean.
**When to use:** Called by `LuiTreemapChart._registerModules()`.
**Example:**

```typescript
// Source: Phase 94 candlestick-registry.ts pattern

let _treemapRegistered = false;

export async function registerTreemapModules(): Promise<void> {
  if (_treemapRegistered) return;
  _treemapRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ TreemapChart }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/core'),
  ]);

  use([TreemapChart]);
}
```

**Key fact (HIGH confidence):** `TreemapChart` requires NO additional components beyond canvas-core. The breadcrumb is part of `TreemapChart` itself — there is no separate `BreadcrumbComponent` in `'echarts/components'`.

### Pattern 3: Lit Component (treemap-chart.ts)

**What:** `LuiTreemapChart` extends `BaseChartElement`. Declares reactive props, calls `_applyData()` from `updated()`, and registers the custom element.
**When to use:** This IS the component.

```typescript
// Source: Phase 94 candlestick-chart.ts pattern

import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerTreemapModules } from './treemap-registry.js';
import {
  buildTreemapOption,
  type TreemapNode,
  type TreemapOptionProps,
} from '../shared/treemap-option-builder.js';

export class LuiTreemapChart extends BaseChartElement {
  // TREE-02: Breadcrumb navigation toggle
  @property({ type: Boolean }) breadcrumb = true;

  // TREE-02: Rounded cells toggle — maps to itemStyle.borderRadius
  @property({ type: Boolean }) rounded = false;

  // TREE-02: Per-level colors — arrives as JSON string from HTML attribute
  // e.g., level-colors='[["#e74c3c","#3498db"],["#e67e22","#9b59b6"]]'
  @property({ attribute: 'level-colors' }) levelColors: string | null = null;

  protected override async _registerModules(): Promise<void> {
    await registerTreemapModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!this._chart) return;
    const treemapProps = ['data', 'breadcrumb', 'rounded', 'levelColors'] as const;
    if (treemapProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart) return;
    const data = this.data ? (this.data as TreemapNode[]) : [];
    const levelColors = this._parseLevelColors(this.levelColors);
    const option = buildTreemapOption(data, {
      breadcrumb: this.breadcrumb,
      borderRadius: this.rounded ? 6 : 0,
      levelColors,
    });
    this._chart.setOption(option, { notMerge: false });
  }

  private _parseLevelColors(raw: string | null): string[][] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('lui-treemap-chart')) {
  customElements.define('lui-treemap-chart', LuiTreemapChart);
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-treemap-chart': LuiTreemapChart;
  }
}
```

### Pattern 4: index.ts Exports

```typescript
// Phase 95: Treemap Chart
export { LuiTreemapChart } from './treemap/treemap-chart.js';
export type { TreemapNode, TreemapOptionProps } from './shared/treemap-option-builder.js';
```

### Anti-Patterns to Avoid

- **Importing BreadcrumbComponent separately:** There is no such export in `'echarts/components'`. The breadcrumb is part of `TreemapChart` — importing a non-existent module causes a runtime error.
- **Using `roam: true` by default:** Roam enables pan/zoom via mouse wheel inside the treemap. For most dashboard uses this is annoying. Default `roam: false` with breadcrumb + zoomToNode is the right UX.
- **Flat `level-colors` attribute as a comma-separated string:** Per-level colors are arrays of arrays. JSON stringify/parse is the correct approach (consistent with `moving-averages` attribute pattern from Phase 94).
- **Calling super.pushData() in a pushData() override:** Treemap has no streaming requirement. Do NOT add `pushData()` at all — use base class default which does circular-buffer streaming if ever called, which is fine for treemap.
- **Setting `height` on series as a percentage string with `calc()`:** ECharts does not support CSS `calc()` in option values. Use pixel values or fixed percentages. If breadcrumb is shown, use `height: '90%'` for the series and let ECharts position the breadcrumb at the bottom.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Breadcrumb navigation | Custom click listeners + state machine | ECharts `nodeClick: 'zoomToNode'` + `breadcrumb: { show: true }` | ECharts maintains drill-down state, history, and renders the breadcrumb bar automatically |
| Space-filling layout algorithm | Squarified treemap algorithm | ECharts `type: 'treemap'` series | Squarified treemap is a complex layout algorithm; ECharts implements it with golden ratio defaults |
| Per-level color inheritance | Recursive tree walker | ECharts `levels[]` array with `color[]` per level | ECharts handles color inheritance from parent to child levels automatically |
| Node visibility thresholds | Area calculation + filter | ECharts `visibleMin: 10` | ECharts hides nodes below 10px² area automatically |

**Key insight:** The treemap is ECharts' most self-contained chart type — breadcrumb, drill-down, color inheritance, and layout are all handled by the `TreemapChart` module with zero custom code.

## Common Pitfalls

### Pitfall 1: `height: 'calc(100% - 30px)'` in ECharts option
**What goes wrong:** ECharts does not resolve CSS `calc()` expressions. The series renders at 0px or full height unexpectedly.
**Why it happens:** ECharts option values are processed by its own layout engine, not the browser CSS engine.
**How to avoid:** Use `height: '90%'` (percentage of the chart container) to leave room for the breadcrumb. Or use a fixed pixel value derived from the known container height.
**Warning signs:** Treemap renders at wrong height or breadcrumb overlaps the treemap content.

### Pitfall 2: Missing `TreemapChart` in `use()` call
**What goes wrong:** Chart renders blank with no error. ECharts silently skips unregistered chart types.
**Why it happens:** ECharts tree-shaking requires explicit `use([TreemapChart])` registration.
**How to avoid:** Ensure `registerTreemapModules()` calls `use([TreemapChart])`. This is the established pattern — follow the registry file template exactly.
**Warning signs:** Empty chart area, no console error.

### Pitfall 3: Expecting `LevelColorConfig` to accept a flat string array
**What goes wrong:** Developer passes `level-colors='["#e74c3c","#3498db"]'` (array of strings) expecting two levels to get those colors. Instead, ECharts interprets the first level's `color` as a single-element array per color string.
**Why it happens:** The `levels[n].color` field must be an array of color strings for that level — an array of arrays is the correct structure for multiple levels.
**How to avoid:** Document and enforce that `level-colors` is a JSON array of arrays: `[["#color1","#color2"], ["#color3","#color4"]]`. Validate with `Array.isArray(parsed[0])` and fallback to `[]` on malformed input.
**Warning signs:** All nodes at all levels show the same color.

### Pitfall 4: Streaming without no-op guard
**What goes wrong:** If someone calls `pushData()` on a treemap, the base class circular-buffer path fires and calls `setOption({ series: [{ data: circularBuffer }] })` which overwrites the hierarchical tree data with a flat array.
**Why it happens:** The base `pushData()` assumes flat `series[0].data` semantics.
**How to avoid:** Override `pushData()` with a no-op (or a console.warn) since treemap has no streaming requirement. Alternatively, accept this as expected behavior and document that `pushData()` is not supported on treemap.
**Warning signs:** Treemap collapses to flat rendering after `pushData()` is called.

### Pitfall 5: `notMerge: true` in `_applyData()`
**What goes wrong:** Each `_applyData()` call wipes ECharts state including the current zoom/drill-down level. The user navigates into a child node, a prop changes, and the treemap resets to the root.
**Why it happens:** `notMerge: true` tells ECharts to discard all previous state.
**How to avoid:** Always use `notMerge: false` (the default) in `_applyData()`. This is the project-standard pattern — established in Phase 93 (heatmap) with the same reasoning.
**Warning signs:** Treemap resets to root view when any prop changes while user is in a drilled-down state.

## Code Examples

Verified patterns from official sources and project codebase:

### Minimal Treemap ECharts Option

```typescript
// Source: ECharts documentation + verified via TreemapSeries.ts source code
const option = {
  tooltip: { trigger: 'item' },
  series: [{
    type: 'treemap',
    data: [
      {
        name: 'Category A',
        value: 100,
        children: [
          { name: 'Item A1', value: 40 },
          { name: 'Item A2', value: 60 },
        ]
      },
      { name: 'Category B', value: 80 }
    ],
    nodeClick: 'zoomToNode',  // default — enables breadcrumb navigation
    roam: false,
    breadcrumb: {
      show: true,
      height: 22,
      left: 'center',
      bottom: 0,
    },
  }]
};
```

### Per-Level Colors with Rounded Cells

```typescript
// Source: ECharts documentation levels[] API
const option = {
  series: [{
    type: 'treemap',
    levels: [
      {
        // depth-0 (root children): assign color palette
        color: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'],
        itemStyle: {
          borderRadius: 6,
          gapWidth: 4,
          borderWidth: 3,
          borderColor: '#fff',
        },
      },
      {
        // depth-1: inherit parent color, vary saturation
        colorSaturation: [0.3, 0.6],
        itemStyle: {
          borderRadius: 4,
          gapWidth: 2,
          borderColorSaturation: 0.7,
        },
      },
    ],
    data: [ /* hierarchical data */ ],
  }]
};
```

### TreemapChart Module Registration

```typescript
// Source: verified against echarts/charts named exports and Phase 94 registry pattern
import { TreemapChart } from 'echarts/charts'; // named export, confirmed
import { use } from 'echarts/core';
use([TreemapChart]); // NO separate BreadcrumbComponent needed
```

### Prop Parsing Pattern (level-colors attribute)

```typescript
// Source: Phase 94 moving-averages attribute pattern (_parseMovingAverages)
function _parseLevelColors(raw: string | null): string[][] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
// Usage: level-colors='[["#e74c3c","#3498db"],["#e67e22","#9b59b6"]]'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ECharts 4 `center`/`size` treemap positioning | `left`/`top`/`right`/`bottom`/`width`/`height` | ECharts 3→5 | Use CSS-like positioning, not center+size tuple |
| Separate BreadcrumbComponent import | Built into TreemapChart | ECharts 5 | No separate import needed |
| `colorSaturation` as single number | Range tuple `[min, max]` supported | ECharts 5 | Use `[0.3, 0.6]` for variation within a level |

**Deprecated/outdated:**
- `center`/`size` treemap positioning: replaced by `left`/`top`/`right`/`bottom`. Do not use.
- ECharts 4 `breadcrumb` placement inside `itemStyle`: now a top-level series property.

## Open Questions

1. **`rounded` boolean → borderRadius pixel value**
   - What we know: `borderRadius` accepts `number | number[]` in ECharts. The component spec says `rounded` is a boolean prop.
   - What's unclear: What pixel value should `rounded: true` map to? (6px? 8px?)
   - Recommendation: Use `borderRadius: 6` when `rounded=true`, `borderRadius: 0` when `rounded=false`. This matches common UI conventions and is easy to override via the `option` passthrough.

2. **Series height when breadcrumb is visible**
   - What we know: Breadcrumb default height is 22px, positioned at bottom of chart container. If the series `height` is `100%`, the breadcrumb overlaps the treemap.
   - What's unclear: The exact percentage to use for correct non-overlapping layout.
   - Recommendation: Use `height: '90%'` for the series when `breadcrumb.show: true`. The breadcrumb occupies ~10% of the default 300px chart height. Test and adjust if needed.

3. **`LevelColorConfig` type shape vs flat `string[][]`**
   - What we know: The TREE-02 requirement says "per-level color configuration." The `levels[n].color` ECharts API takes `string[]` per level.
   - What's unclear: Should `levelColors` be typed as `string[][]` (array of color arrays per level) or a richer `LevelColorConfig[]` with saturation/borderRadius per level?
   - Recommendation: Start with `string[][]` for simplicity (matches the success criteria). The `option` passthrough allows advanced users to override with full `LevelColorConfig[]` via the base class `option` prop.

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` (only `research`, `plan_check`, `verifier` keys exist). Treating as false — skipping Validation Architecture section.

## Sources

### Primary (HIGH confidence)
- ECharts GitHub source: `src/chart/treemap/TreemapSeries.ts` — treemap defaults, `nodeClick` values, breadcrumb schema, `TreemapSeriesItemStyleOption` with `borderRadius`
- Project codebase: `packages/charts/src/candlestick/candlestick-chart.ts`, `candlestick-registry.ts`, `candlestick-option-builder.ts` — authoritative pattern for Phase 95 implementation
- Project codebase: `packages/charts/src/heatmap/heatmap-chart.ts` — JSON attribute parsing pattern (`_parseColorRange`)
- Project codebase: `packages/charts/src/registry/canvas-core.ts` — confirms what is already registered (no need to re-register TooltipComponent, GridComponent, etc.)
- Project codebase: `packages/charts/src/index.ts` — confirms export pattern for Phase 95

### Secondary (MEDIUM confidence)
- WebSearch: ECharts treemap `levels[]` with `colorSaturation`, `borderRadius`, `gapWidth` per-level configuration — verified against ECharts source code
- WebSearch: `TreemapChart` named export from `'echarts/charts'` — confirmed via multiple sources (echarts-for-react docs, ECharts handbook)
- WebSearch: Breadcrumb built into `TreemapChart` (no separate import) — confirmed via GitHub issue #15741 and ECharts handbook tree-shaking docs

### Tertiary (LOW confidence)
- WebSearch: `height: '90%'` recommendation for series height when breadcrumb is shown — derived from breadcrumb default height of 22px; not explicitly documented as a recommended value

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `TreemapChart` from `'echarts/charts'` confirmed by multiple sources; no new packages required
- Architecture: HIGH — identical to Phase 94 pattern, all project files verified
- Pitfalls: HIGH — pitfalls 2/3/5 derived directly from project codebase patterns and ECharts API; pitfall 1 (calc()) and 4 (streaming) are logic-derived from verified facts

**Research date:** 2026-02-28
**Valid until:** 2026-04-28 (ECharts 5.x API is stable; treemap API unchanged since ECharts 3→5 migration)
