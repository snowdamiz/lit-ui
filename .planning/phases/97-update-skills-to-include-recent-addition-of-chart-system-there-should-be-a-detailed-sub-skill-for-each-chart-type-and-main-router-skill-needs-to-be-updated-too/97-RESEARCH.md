# Phase 97: Update Skills for Chart System - Research

**Researched:** 2026-03-01
**Domain:** Skill file authoring — `skill/SKILL.md` router + 9 new chart sub-skills
**Confidence:** HIGH

## Summary

Phase 97 is a documentation/skill authoring task with no code changes. The chart system (Phases 88–96) is fully built and deployed: 8 chart types, subpath exports, CLI templates, and docs pages all exist. What is missing is the agent skill layer — AI assistants have zero skill coverage for `@lit-ui/charts` because the `skill/SKILL.md` router doesn't mention charts and there are no `skill/skills/chart-*` files.

The work follows an established pattern: quick task 3 (2026-02-27) already created 18 per-component skill files from docs page sources. The chart skills should match that pattern exactly — one SKILL.md per chart type plus a shared `skills/charts/SKILL.md` overview that the main router delegates to. The `skill/SKILL.md` router's `## Component Overview` and `## Available Sub-Skills` sections need chart entries added.

All API data needed to write the skills already exists in the codebase: component source files (`packages/charts/src/*/`), option builder types (`packages/charts/src/shared/`), and docs pages (`apps/docs/src/pages/charts/`). No external research required.

**Primary recommendation:** Write one `skill/skills/<chart-name>/SKILL.md` per chart type (9 total: charts overview + 8 chart-specific), and update `skill/SKILL.md` to route to the chart sub-skills.

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| `skill/*.md` | — | Agent skill files (markdown) | Established project pattern for all existing 23 skills |
| `@lit-ui/charts` | v9.0 | The chart package being documented | The actual implementation |

No new libraries, packages, or build tooling needed. This phase is pure markdown authoring.

## Architecture Patterns

### Skill File Locations

```
skill/
├── SKILL.md                    # Main router — ADD chart entries here
└── skills/
    ├── charts/                 # NEW: charts overview + routing
    │   └── SKILL.md
    ├── line-chart/             # NEW: lui-line-chart
    │   └── SKILL.md
    ├── area-chart/             # NEW: lui-area-chart
    │   └── SKILL.md
    ├── bar-chart/              # NEW: lui-bar-chart
    │   └── SKILL.md
    ├── pie-chart/              # NEW: lui-pie-chart
    │   └── SKILL.md
    ├── scatter-chart/          # NEW: lui-scatter-chart
    │   └── SKILL.md
    ├── heatmap-chart/          # NEW: lui-heatmap-chart
    │   └── SKILL.md
    ├── candlestick-chart/      # NEW: lui-candlestick-chart
    │   └── SKILL.md
    └── treemap-chart/          # NEW: lui-treemap-chart
        └── SKILL.md
```

### Pattern 1: Sub-Skill SKILL.md Structure (from existing component skills)

Each component SKILL.md follows this exact format:

```markdown
---
name: lit-ui-<chart-name>
description: >-
  How to use <lui-chart-name> — props, events, CSS tokens, examples.
---

# <Chart Name>

<One-sentence description of the chart type and key capabilities.>

## Usage

```js
import '@lit-ui/charts/<chart-name>';

const chart = document.querySelector('lui-<chart-name>');
chart.data = [...];
```

```js
// React example with ref + useEffect (REQUIRED for all .data assignments)
import { useRef, useEffect } from 'react';
function MyChart({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.data = data;
  }, [data]);
  return <lui-<chart-name> ref={ref} />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
...

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `pushData(point)` | `(point: T) => void` | ... |
| `getChart()` | `() => EChartsType \| undefined` | ... |

## Events

| Event | Detail Type | Description |
|-------|-------------|-------------|
| `ui-webgl-unavailable` | `{ reason: string }` | ... |

## CSS Custom Properties

(shared across all charts + any chart-specific)

## Behavior Notes

(critical gotchas and integration rules)
```

### Pattern 2: Main Router SKILL.md Update

The `skill/SKILL.md` router requires:
1. Add charts section to `## Component Overview` list (item 6, currently `5. Data: <lui-data-table>`)
2. Add chart sub-skills to `## Available Sub-Skills` — either as entries 24-32 or as a single charts entry routing to `skills/charts`
3. Add routing rules for chart-related questions

### Pattern 3: Charts Overview Skill (`skills/charts/SKILL.md`)

Serves as a secondary router for "which chart type should I use" questions. Lists all 8 chart types, their use cases, import patterns, shared API (BaseChartElement props), and routes to individual chart skills.

### Anti-Patterns to Avoid

- **Do not include internal implementation details** (e.g., `registerLineModules()`, `buildLineOption()`) — these are implementation details, not the public API. Skills document the `@property` surface and public methods only.
- **Do not document `_streamingMode`** — it's a protected field, not public API.
- **Do not describe the `TailwindElement` inheritance chain** in chart skills — the authoring skill covers that; chart skills only cover the chart-specific API.
- **Do not list `LuiLineChart` class name** as the primary identifier — use the custom element tag `lui-line-chart` as the primary identifier (matching existing skill style).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API data | Re-read source from memory | Read from actual source files | Source is authoritative — never from memory |
| CSS token table | Guess at token names | Copy from `ThemeBridge._tokenDefaults` | ThemeBridge is the authoritative list of all 17 CSS tokens |
| Prop tables | Guess at defaults | Read from `@property` decorators in chart source files | Decorators are the ground truth |

## Common Pitfalls

### Pitfall 1: Wrong Skill Location
**What goes wrong:** Skills placed at `skill/skills/charts-line/SKILL.md` or `skill/skills/chart-line/SKILL.md` instead of `skill/skills/line-chart/SKILL.md`
**Why it happens:** Naming convention ambiguity
**How to avoid:** Follow the exact pattern from the CLI: chart names are `line-chart`, `area-chart`, `bar-chart`, `pie-chart`, `scatter-chart`, `heatmap-chart`, `candlestick-chart`, `treemap-chart` — all kebab-case matching their CLI names and HTML tag suffixes
**Warning signs:** Skill not loaded when user asks "how do I use lui-line-chart"

### Pitfall 2: Missing the JS Property Rule
**What goes wrong:** Skill shows `data="[...]"` HTML attribute assignment
**Why it happens:** Forgetting that `data` and `option` are `attribute: false` properties
**How to avoid:** Always document `.data` assignment as a JS property. Lead all examples with `element.data = [...]` and note "JS property only — cannot be set via HTML attribute"
**Warning signs:** User reports their chart shows no data after copying the skill example

### Pitfall 3: Wrong OHLC Order
**What goes wrong:** Candlestick skill documents `[open, high, low, close]` (OHLC acronym order)
**Why it happens:** The acronym suggests a different order than what ECharts expects
**How to avoid:** ECharts expects `[open, close, low, high]` (OhlcBar type). This is documented in the source with a WARNING comment. The docs page renders this as an amber callout box. The skill must make this equally prominent.
**Warning signs:** Developer reports candlesticks rendering upside-down or with incorrect wicks

### Pitfall 4: Treemap pushData Warning
**What goes wrong:** Skill lists `pushData()` as a method on treemap chart
**Why it happens:** `pushData()` exists on the base class but treemap overrides it with a `console.warn` no-op
**How to avoid:** Document that `LuiTreemapChart.pushData()` is not supported — update the `.data` property instead
**Warning signs:** Developer calls `pushData()` on treemap and wonders why nothing updates

### Pitfall 5: Heatmap Array Props
**What goes wrong:** Skill shows `x-categories="['Mon','Tue']"` HTML attribute for heatmap
**Why it happens:** xCategories/yCategories are `attribute: false` — they must be set as JS properties
**How to avoid:** Document clearly that `xCategories` and `yCategories` are JS properties only, same as `data`
**Warning signs:** Heatmap renders with no axis labels

### Pitfall 6: Bubble Mode GL Warning
**What goes wrong:** Skill describes bubble size as working with `enable-gl`
**Why it happens:** Bubble mode + GL is a documented limitation (scatterGL GPU rendering cannot support per-point size callbacks)
**How to avoid:** Explicitly note that `bubble` mode uses a fixed symbol size when `enable-gl` is also set

## Code Examples

All examples below are sourced from the actual component source files and docs pages.

### Line Chart — Basic Usage

```js
// Source: apps/docs/src/pages/charts/LineChartPage.tsx
import '@lit-ui/charts/line-chart';

const chart = document.querySelector('lui-line-chart');
chart.data = [
  { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
  { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
];
```

### Scatter Chart — WebGL Mode

```js
// Source: packages/charts/src/scatter/scatter-chart.ts
<lui-scatter-chart enable-gl></lui-scatter-chart>
// Note: echarts-gl is lazy-loaded (+~200KB gzipped) only when enable-gl is set
// If WebGL is unavailable, falls back to Canvas and fires 'ui-webgl-unavailable'
```

### Heatmap — Array Props Must Be JS Properties

```js
// Source: apps/docs/src/pages/charts/HeatmapChartPage.tsx
const chart = document.querySelector('lui-heatmap-chart');
chart.xCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
chart.yCategories = ['Morning', 'Afternoon', 'Evening'];
chart.data = [[0, 0, 85], [1, 0, 72], [2, 1, 40]]; // [xIdx, yIdx, value]
```

### Candlestick — Correct OHLC Order

```js
// Source: packages/charts/src/shared/candlestick-option-builder.ts
// WARNING: ECharts order is [open, close, low, high] — NOT [open, high, low, close]
chart.data = [
  { label: '2024-01-01', ohlc: [100, 110, 95, 115], volume: 50000 },
  { label: '2024-01-02', ohlc: [110, 105, 102, 112], volume: 45000 },
];
```

### Treemap — No pushData()

```js
// Source: packages/charts/src/treemap/treemap-chart.ts
const treemap = document.querySelector('lui-treemap-chart');
// To update treemap data, reassign the .data property — pushData() is not supported
treemap.data = [
  { name: 'Category A', value: 40, children: [
    { name: 'Sub A1', value: 25 },
    { name: 'Sub A2', value: 15 },
  ]},
];
```

### Streaming with pushData()

```js
// Source: packages/charts/src/base/base-chart-element.ts
// Works on: line, area, bar, pie, scatter, heatmap, candlestick
// Does NOT work on: treemap (no-op + console.warn)
const chart = document.querySelector('lui-line-chart');
chart.data = [{ name: 'Live', data: [] }];

setInterval(() => {
  chart.pushData(Math.random() * 100);
  // Multiple pushData() calls in the same animation frame are batched
}, 100);
```

### React Integration (useRef + useEffect Required)

```tsx
// Source: apps/docs/src/pages/charts/LineChartPage.tsx
// REQUIRED for all .data, .xCategories, .yCategories assignments on chart elements
import { useRef, useEffect } from 'react';

function LineChartDemo({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.data = data;
  }, [data]);
  return <lui-line-chart ref={ref} smooth zoom />;
}
```

## Full API Reference (by chart type)

This section documents each chart's complete public API, sourced from component source files.

### Shared (BaseChartElement) Props — All 8 Charts

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `data` | — (JS only) | depends on chart | `undefined` | Chart data. Must be set as JS property — `attribute: false`. |
| `option` | — (JS only) | `EChartsOption` | `undefined` | Raw ECharts option passthrough for advanced customization. |
| `loading` | `loading` | `boolean` | `false` | Show ECharts loading skeleton. |
| `enableGl` | `enable-gl` | `boolean` | `false` | Opt-in WebGL via echarts-gl (scatter only is meaningful). |
| `maxPoints` | `max-points` | `number` | `1000` | Circular buffer capacity for streaming. |

### Shared Methods — All 8 Charts

| Method | Signature | Description |
|--------|-----------|-------------|
| `pushData(point)` | `(point: unknown) => void` | Stream one data point. RAF-coalesced. Not supported on treemap. |
| `getChart()` | `() => EChartsType \| undefined` | Direct ECharts instance access for advanced use. |

### Shared Events — All 8 Charts

| Event | Detail | Description |
|-------|--------|-------------|
| `ui-webgl-unavailable` | `{ reason: string }` | Fired when `enable-gl` is set but WebGL is unavailable. Chart falls back to Canvas. |

### Shared CSS Custom Properties — All 8 Charts

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-chart-height` | `300px` | Chart host element height. |
| `--ui-chart-color-1` | `#3b82f6` | Series 1 color. |
| `--ui-chart-color-2` | `#8b5cf6` | Series 2 color. |
| `--ui-chart-color-3` | `#10b981` | Series 3 color. |
| `--ui-chart-color-4` | `#f59e0b` | Series 4 color. |
| `--ui-chart-color-5` | `#ef4444` | Series 5 color. |
| `--ui-chart-color-6` | `#06b6d4` | Series 6 color. |
| `--ui-chart-color-7` | `#f97316` | Series 7 color. |
| `--ui-chart-color-8` | `#84cc16` | Series 8 color. |
| `--ui-chart-grid-line` | `#e5e7eb` | Grid line color. |
| `--ui-chart-axis-label` | `#6b7280` | Axis label text color. |
| `--ui-chart-axis-line` | `#d1d5db` | Axis line color. |
| `--ui-chart-tooltip-bg` | `#ffffff` | Tooltip background. |
| `--ui-chart-tooltip-border` | `#e5e7eb` | Tooltip border color. |
| `--ui-chart-tooltip-text` | `#111827` | Tooltip text color. |
| `--ui-chart-legend-text` | `#374151` | Legend text color. |
| `--ui-chart-font-family` | `system-ui, sans-serif` | Font family for labels and tooltips. |

### lui-line-chart — Chart-Specific Props

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `smooth` | `smooth` | `boolean` | `false` | Catmull-Rom spline interpolation. |
| `zoom` | `zoom` | `boolean` | `false` | DataZoom slider + mouse wheel pan. |
| `markLines` | — (JS only) | `MarkLineSpec[]` | `undefined` | Threshold/reference lines. `attribute: false`. |

Data type: `LineChartSeries[]` where `LineChartSeries = { name: string; data: (number | [number|string, number] | null)[] }`

Streaming mode: `appendData` — do NOT call `setOption` after `pushData()` has started.

### lui-area-chart — Chart-Specific Props

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `smooth` | `smooth` | `boolean` | `false` | Catmull-Rom spline interpolation. |
| `stacked` | `stacked` | `boolean` | `false` | Stack all series (passes `stack: 'total'` internally). |
| `zoom` | `zoom` | `boolean` | `false` | DataZoom slider + mouse wheel pan. |
| `labelPosition` | `label-position` | `'top' \| 'bottom' \| ''` | `''` | Data point labels. `''` = no labels. |

Data type: same as line chart (`LineChartSeries[]`). Area is a line with `areaStyle` — same ECharts module.

### lui-bar-chart — Chart-Specific Props

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `stacked` | `stacked` | `boolean` | `false` | Stack all series (passes `stack: 'total'` internally). |
| `horizontal` | `horizontal` | `boolean` | `false` | Flip to horizontal orientation. |
| `showLabels` | `show-labels` | `boolean` | `false` | Value labels on bars. |
| `labelPosition` | `label-position` | `'top' \| 'bottom'` | `'top'` | Label position. |
| `colorByData` | `color-by-data` | `boolean` | `false` | Each bar gets a distinct palette color. |

Data type: `BarChartSeries[]` where `BarChartSeries = { name: string; data: (number | null)[] }`

Note: `categories` (x-axis labels) is passed via the `option` prop or set by the option builder if categories are provided. For custom category labels use `chart.option = buildBarOption(data, { categories: [...] })`.

### lui-pie-chart — Chart-Specific Props

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `minPercent` | `min-percent` | `number` | `0` | Merge slices below this % into "Other". `0` = no merging. |
| `innerRadius` | `inner-radius` | `string \| number` | `0` | Donut hole radius. `0` or `'0'` = filled pie. Example: `'40%'`. |
| `centerLabel` | `center-label` | `string` | `''` | Text in donut center. Only shown when `innerRadius` is non-zero. |
| `labelPosition` | `label-position` | `'top' \| 'bottom'` | `'top'` | `'top'` = outside with connectors; `'bottom'` = inside slice. |

Data type: `PieSlice[]` where `PieSlice = { name: string; value: number }`

### lui-scatter-chart — Chart-Specific Props

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `bubble` | `bubble` | `boolean` | `false` | Third element `value[2]` drives symbol size (Canvas only). |

Data type: `ScatterPoint[]` where `ScatterPoint = [number, number] | [number, number, number]`

WebGL note: `enable-gl` (from base) selects `scatterGL` series type. `bubble` + `enable-gl` together use fixed symbol size (GPU limitation).

### lui-heatmap-chart — Chart-Specific Props

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `xCategories` | — (JS only) | `string[]` | `[]` | X-axis category labels. **Must be JS property.** |
| `yCategories` | — (JS only) | `string[]` | `[]` | Y-axis category labels. **Must be JS property.** |
| `colorRange` | `color-range` | `string \| null` | `null` | Two-color gradient as `'#minColor,#maxColor'`. Default: `'#313695,#d73027'` (blue-to-red). |

Data type: `HeatmapCell[]` where `HeatmapCell = [xIdx, yIdx, value]` — integer indices into category arrays.

`pushData()` override: accepts `HeatmapCell` and updates the specific cell in-place (not rolling buffer).

### lui-candlestick-chart — Chart-Specific Props

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `bullColor` | `bull-color` | `string \| null` | `null` → `'#26a69a'` | Rising candle color. Uses ECharts `itemStyle.color`. |
| `bearColor` | `bear-color` | `string \| null` | `null` → `'#ef5350'` | Falling candle color. Uses ECharts `itemStyle.color0`. |
| `showVolume` | `show-volume` | `boolean` | `false` | Show volume bar panel below candlestick grid. |
| `movingAverages` | `moving-averages` | `string \| null` | `null` | JSON string of `MAConfig[]`. Example: `'[{"period":20,"color":"#f59e0b"}]'`. |

Data type: `CandlestickBarPoint[]` where:
```ts
type CandlestickBarPoint = {
  label: string;        // x-axis label (timestamp string)
  ohlc: OhlcBar;        // [open, close, low, high] — NOT OHLC order!
  volume?: number;
}
type OhlcBar = [number, number, number, number]; // [open, close, low, high]
```

**CRITICAL:** ECharts candlestick data order is `[open, close, low, high]`, not the OHLC acronym order `[open, high, low, close]`.

`pushData()` override: accepts `CandlestickBarPoint` and appends to the bar buffer.

`MAConfig`: `{ period: number; color: string; type?: 'sma' | 'ema' }`

### lui-treemap-chart — Chart-Specific Props

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `breadcrumb` | `breadcrumb` | `boolean` | `true` | Show ECharts breadcrumb navigation. |
| `rounded` | `rounded` | `boolean` | `false` | Apply border-radius to cells (6px top level, decremented per depth). |
| `levelColors` | `level-colors` | `string \| null` | `null` | JSON string of `string[][]`. Example: `'[["#ef4444","#f97316"],["#3b82f6"]]'`. |

Data type: `TreemapNode[]` where:
```ts
type TreemapNode = {
  name: string;
  value: number;
  children?: TreemapNode[];
}
```

`pushData()`: **NOT SUPPORTED** — logs `console.warn`. Update the `.data` property directly.

`levelColors` format: array of arrays — each inner array is the palette for one depth level. A flat `string[]` is rejected silently.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No chart skills | 9 skill files (overview + 8 charts) | Phase 97 (now) | AI assistants can correctly answer chart usage questions |
| `skill/SKILL.md` has 23 sub-skills | Updated to 24+ with charts | Phase 97 (now) | Router routes chart questions to correct skills |

## Open Questions

None. All information needed to author the skills is available from the codebase. No external research required.

## Sources

### Primary (HIGH confidence)
- `packages/charts/src/*/` — component source files, all `@property` decorators read directly
- `packages/charts/src/shared/*-option-builder.ts` — all type definitions
- `packages/charts/src/base/theme-bridge.ts` — authoritative `_tokenDefaults` list (all 17 CSS tokens)
- `skill/SKILL.md` — existing router format to match
- `skill/skills/button/SKILL.md`, `skill/skills/data-table/SKILL.md` — reference sub-skill format
- `apps/docs/src/pages/charts/LineChartPage.tsx`, `ScatterChartPage.tsx` — docs page prop definitions

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — architecture decisions and pitfalls from Phases 88–96
- `.planning/quick/3-split-components-skill-into-18-individua/3-SUMMARY.md` — precedent for the skill-split pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; pure markdown authoring task
- Architecture: HIGH — follows verified existing patterns from 23 existing skill files
- Pitfalls: HIGH — sourced directly from component source code comments and STATE.md decisions

**Research date:** 2026-03-01
**Valid until:** Stable indefinitely — chart API is frozen at v9.0
