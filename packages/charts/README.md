# @lit-ui/charts

High-performance chart components built on [Lit](https://lit.dev/) and [Apache ECharts](https://echarts.apache.org/). Works in any framework — React, Vue, Svelte, Angular — or plain HTML.

[![npm](https://img.shields.io/npm/v/@lit-ui/charts)](https://www.npmjs.com/package/@lit-ui/charts)
[![license](https://img.shields.io/npm/l/@lit-ui/charts)](./LICENSE)

## Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Chart Types](#chart-types)
  - [Line Chart](#line-chart)
  - [Area Chart](#area-chart)
  - [Bar Chart](#bar-chart)
  - [Pie Chart](#pie-chart)
  - [Scatter Chart](#scatter-chart)
  - [Heatmap Chart](#heatmap-chart)
  - [Candlestick Chart](#candlestick-chart)
  - [Treemap Chart](#treemap-chart)
- [Streaming / Real-Time Data](#streaming--real-time-data)
- [Theming](#theming)
- [Advanced: WebGPU & WebGL](#advanced-webgpu--webgl)
- [TypeScript](#typescript)
- [Browser Support](#browser-support)

---

## Installation

```bash
npm install @lit-ui/charts
# or
pnpm add @lit-ui/charts
# or
yarn add @lit-ui/charts
```

**Peer dependencies** — install these alongside the package:

```bash
npm install lit @lit-ui/core
```

---

## Quick Start

### HTML / Vanilla JS

```html
<script type="module">
  import '@lit-ui/charts/line-chart';
</script>

<lui-line-chart id="chart" smooth zoom style="height: 300px; display: block"></lui-line-chart>

<script>
  document.querySelector('#chart').data = [
    { name: 'Revenue', data: [120, 200, 150, 80, 210, 180, 240] },
    { name: 'Expenses', data: [80, 120, 100, 60, 140, 110, 160] },
  ];
</script>
```

### React

```tsx
import { useEffect, useRef } from 'react';
import '@lit-ui/charts/line-chart';

export function RevenueChart() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      (ref.current as any).data = [
        { name: 'Revenue', data: [120, 200, 150, 80, 210, 180, 240] },
      ];
    }
  }, []);

  return (
    <lui-line-chart
      ref={ref}
      smooth
      zoom
      style={{ height: '300px', display: 'block' }}
    />
  );
}
```

### Vue

```html
<template>
  <lui-line-chart ref="chart" smooth zoom style="height: 300px; display: block" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import '@lit-ui/charts/line-chart';

const chart = ref<HTMLElement | null>(null);

onMounted(() => {
  (chart.value as any).data = [
    { name: 'Revenue', data: [120, 200, 150, 80, 210, 180, 240] },
  ];
});
</script>
```

### Svelte

```svelte
<script lang="ts">
  import '@lit-ui/charts/line-chart';
  import { onMount } from 'svelte';

  let chartEl: HTMLElement;

  onMount(() => {
    (chartEl as any).data = [
      { name: 'Revenue', data: [120, 200, 150, 80, 210, 180, 240] },
    ];
  });
</script>

<lui-line-chart bind:this={chartEl} smooth zoom style="height: 300px; display: block" />
```

> **Important:** Always set `.data` as a **JavaScript property**, not an HTML attribute. JSON attributes lose numeric precision on large datasets and are not supported for data input.

---

## Chart Types

Each chart type is available as a standalone import for tree-shaking:

```ts
import '@lit-ui/charts/line-chart';        // <lui-line-chart>
import '@lit-ui/charts/area-chart';        // <lui-area-chart>
import '@lit-ui/charts/bar-chart';         // <lui-bar-chart>
import '@lit-ui/charts/pie-chart';         // <lui-pie-chart>
import '@lit-ui/charts/scatter-chart';     // <lui-scatter-chart>
import '@lit-ui/charts/heatmap-chart';     // <lui-heatmap-chart>
import '@lit-ui/charts/candlestick-chart'; // <lui-candlestick-chart>
import '@lit-ui/charts/treemap-chart';     // <lui-treemap-chart>
```

Or import everything at once (larger bundle):

```ts
import '@lit-ui/charts';
```

---

### Line Chart

`<lui-line-chart>`

Renders one or more time-series lines. Supports up to 500,000 streamed data points per series via `pushData()`.

#### Data shape

```ts
type LineChartSeries = {
  name: string;
  data: number[];
  categories?: string[]; // optional x-axis labels
};

element.data = series; // LineChartSeries[]
```

#### Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `data` | — | `LineChartSeries[]` | `undefined` | Chart data (JS property only) |
| `smooth` | `smooth` | `boolean` | `false` | Catmull-Rom curve interpolation |
| `zoom` | `zoom` | `boolean` | `false` | Enable DataZoom slider and scroll-to-zoom |
| `loading` | `loading` | `boolean` | `false` | Show loading skeleton |
| `mark-lines` | — | `MarkLineSpec[]` | `[]` | Threshold/reference lines |
| `max-points` | `max-points` | `number` | `500000` | Streaming buffer cap per series |
| `enable-webgpu` | `enable-webgpu` | `boolean` | `false` | Use WebGPU renderer (falls back to canvas) |
| `option` | — | `EChartsOption` | `undefined` | Raw ECharts option passthrough |

#### Example

```html
<lui-line-chart smooth zoom></lui-line-chart>
```

```ts
chart.data = [
  { name: 'Temperature', data: [22, 24, 19, 28, 31, 27, 25], categories: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
];

// Mark a threshold line
chart['mark-lines'] = [{ value: 25, name: 'Threshold', color: '#ef4444' }];
```

---

### Area Chart

`<lui-area-chart>`

Same API as Line Chart, with filled areas beneath each series. Supports stacking and up to 500,000 streamed points per series.

#### Additional Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `stacked` | `stacked` | `boolean` | `false` | Stack series on top of each other |
| `label-position` | `label-position` | `'top' \| 'bottom'` | `''` | Show value labels at data points |

#### Example

```html
<lui-area-chart stacked smooth></lui-area-chart>
```

```ts
chart.data = [
  { name: 'Direct', data: [300, 280, 320, 350, 290] },
  { name: 'Organic', data: [180, 200, 170, 210, 195] },
];
```

---

### Bar Chart

`<lui-bar-chart>`

Grouped or stacked bar chart. Supports horizontal orientation, value labels, and per-bar coloring.

#### Data shape

```ts
type BarChartSeries = {
  name: string;
  data: number[];
  categories?: string[];
};

element.data = series; // BarChartSeries[]
```

#### Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `data` | — | `BarChartSeries[]` | `undefined` | Chart data |
| `stacked` | `stacked` | `boolean` | `false` | Stack bars |
| `horizontal` | `horizontal` | `boolean` | `false` | Horizontal bar chart |
| `show-labels` | `show-labels` | `boolean` | `false` | Show value labels on bars |
| `label-position` | `label-position` | `'top' \| 'bottom'` | `'top'` | Label placement relative to bar |
| `color-by-data` | `color-by-data` | `boolean` | `false` | Assign a distinct color to each bar |
| `loading` | `loading` | `boolean` | `false` | Show loading skeleton |
| `option` | — | `EChartsOption` | `undefined` | Raw ECharts option passthrough |

#### Example

```html
<lui-bar-chart horizontal show-labels></lui-bar-chart>
```

```ts
chart.data = [
  { name: 'Q1', data: [120, 80, 200], categories: ['Product A', 'Product B', 'Product C'] },
  { name: 'Q2', data: [150, 95, 220] },
];
```

---

### Pie Chart

`<lui-pie-chart>`

Pie or donut chart. Small slices below a threshold can be merged into an "Other" slice.

#### Data shape

```ts
type PieSlice = { name: string; value: number };

element.data = slices; // PieSlice[]
```

#### Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `data` | — | `PieSlice[]` | `undefined` | Chart data |
| `inner-radius` | `inner-radius` | `string \| number` | `0` | Donut hole size — e.g. `'40%'` or `0.4` |
| `center-label` | `center-label` | `string` | `''` | Text shown in the donut center |
| `min-percent` | `min-percent` | `number` | `0` | Merge slices below this % into "Other" |
| `label-position` | `label-position` | `'top' \| 'bottom'` | `'top'` | Slice label placement |
| `loading` | `loading` | `boolean` | `false` | Show loading skeleton |
| `option` | — | `EChartsOption` | `undefined` | Raw ECharts option passthrough |

#### Example — Donut with center label

```html
<lui-pie-chart inner-radius="40%" center-label="Total" min-percent="3"></lui-pie-chart>
```

```ts
chart.data = [
  { name: 'Chrome', value: 65 },
  { name: 'Safari', value: 19 },
  { name: 'Firefox', value: 4 },
  { name: 'Edge', value: 4 },
  { name: 'Other', value: 8 },
];
```

---

### Scatter Chart

`<lui-scatter-chart>`

2D scatter plot. Enable `bubble` for a third dimension (point size). Optional WebGL acceleration via `echarts-gl`.

#### Data shape

```ts
// Standard: [x, y]
// Bubble:   [x, y, size]
type ScatterPoint = [number, number] | [number, number, number];

element.data = points; // ScatterPoint[]
```

#### Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `data` | — | `ScatterPoint[]` | `undefined` | Chart data |
| `bubble` | `bubble` | `boolean` | `false` | Use 3rd value as point radius |
| `enable-gl` | `enable-gl` | `boolean` | `false` | Use WebGL (echarts-gl) for large datasets |
| `loading` | `loading` | `boolean` | `false` | Show loading skeleton |
| `option` | — | `EChartsOption` | `undefined` | Raw ECharts option passthrough |

#### Example

```html
<lui-scatter-chart bubble></lui-scatter-chart>
```

```ts
chart.data = [
  [10.0, 8.04, 5],
  [8.0, 6.95, 8],
  [13.0, 7.58, 12],
  [9.0, 8.81, 6],
];
```

---

### Heatmap Chart

`<lui-heatmap-chart>`

Grid-based heatmap with custom color gradients. Ideal for correlation matrices, calendar views, and activity grids.

#### Data shape

```ts
type HeatmapCell = [xIndex: number, yIndex: number, value: number];

element.data = cells; // HeatmapCell[]
element.xCategories = ['Mon', 'Tue', 'Wed']; // string[]
element.yCategories = ['Morning', 'Afternoon', 'Evening']; // string[]
```

#### Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `data` | — | `HeatmapCell[]` | `undefined` | Cell values as [x, y, value] tuples |
| `xCategories` | — | `string[]` | `[]` | X-axis category labels (JS property) |
| `yCategories` | — | `string[]` | `[]` | Y-axis category labels (JS property) |
| `color-range` | `color-range` | `string` | `'#313695,#d73027'` | Gradient endpoints, comma-separated CSS colors |
| `loading` | `loading` | `boolean` | `false` | Show loading skeleton |
| `option` | — | `EChartsOption` | `undefined` | Raw ECharts option passthrough |

#### Example

```html
<lui-heatmap-chart color-range="#f0f9e8,#084081"></lui-heatmap-chart>
```

```ts
chart.xCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
chart.yCategories = ['Morning', 'Afternoon', 'Evening'];
chart.data = [
  [0, 0, 5], [1, 0, 3], [2, 0, 8],
  [0, 1, 2], [1, 1, 7], [2, 1, 4],
  [0, 2, 9], [1, 2, 1], [2, 2, 6],
];
```

---

### Candlestick Chart

`<lui-candlestick-chart>`

OHLC candlestick chart with optional volume panel, moving averages (SMA/EMA), and WebGPU support.

#### Data shape

```ts
type OhlcBar = {
  label: string;
  ohlc: [open: number, close: number, low: number, high: number]; // NOTE: [O, C, L, H] order
  volume?: number;
};

element.data = bars; // OhlcBar[]
```

> **Note:** The `ohlc` tuple order is `[open, close, low, high]`, not the common OHLC acronym order.

#### Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `data` | — | `OhlcBar[]` | `undefined` | Chart data |
| `bull-color` | `bull-color` | `string` | `'#26a69a'` | Rising candle color |
| `bear-color` | `bear-color` | `string` | `'#ef5350'` | Falling candle color |
| `show-volume` | `show-volume` | `boolean` | `false` | Show volume panel below candles |
| `moving-averages` | `moving-averages` | `string` (JSON) | `'[]'` | Moving average configuration (see below) |
| `enable-webgpu` | `enable-webgpu` | `boolean` | `false` | Use WebGPU renderer |
| `loading` | `loading` | `boolean` | `false` | Show loading skeleton |
| `option` | — | `EChartsOption` | `undefined` | Raw ECharts option passthrough |

#### Moving averages

Pass a JSON string array of `MAConfig` objects:

```ts
type MAConfig = {
  period: number;           // Number of bars to average
  type?: 'SMA' | 'EMA';    // Default: 'SMA'
  color?: string;           // Line color (default: CSS token color)
};
```

```html
<lui-candlestick-chart
  show-volume
  moving-averages='[{"period":20},{"period":50,"type":"EMA"}]'
></lui-candlestick-chart>
```

```ts
chart.data = [
  { label: '2024-01-01', ohlc: [100, 105, 98, 107], volume: 12500 },
  { label: '2024-01-02', ohlc: [105, 102, 101, 106], volume: 9800 },
];
```

---

### Treemap Chart

`<lui-treemap-chart>`

Hierarchical treemap with drill-down navigation, breadcrumb trail, and per-level color palettes.

#### Data shape

```ts
type TreemapNode = {
  name: string;
  value: number;
  children?: TreemapNode[];
};

element.data = nodes; // TreemapNode[]
```

#### Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `data` | — | `TreemapNode[]` | `undefined` | Hierarchical node data |
| `breadcrumb` | `breadcrumb` | `boolean` | `true` | Show drill-down breadcrumb bar |
| `rounded` | `rounded` | `boolean` | `false` | Apply border-radius to cells |
| `level-colors` | `level-colors` | `string` (JSON) | `''` | Per-depth color palettes (see below) |
| `loading` | `loading` | `boolean` | `false` | Show loading skeleton |
| `option` | — | `EChartsOption` | `undefined` | Raw ECharts option passthrough |

#### Level colors

Pass a JSON string of `string[][]` — one color array per depth level:

```html
<lui-treemap-chart
  rounded
  level-colors='[["#3b82f6","#8b5cf6"],["#10b981","#f59e0b","#ef4444"]]'
></lui-treemap-chart>
```

```ts
chart.data = [
  {
    name: 'Technology',
    value: 500,
    children: [
      { name: 'Software', value: 300 },
      { name: 'Hardware', value: 200 },
    ],
  },
  { name: 'Finance', value: 350 },
];
```

> **Note:** `pushData()` is not supported on Treemap. Reassign `.data` to update.

---

## Streaming / Real-Time Data

All charts (except Treemap) support real-time data via `pushData()`. Updates are coalesced per animation frame — call `pushData()` as fast as your data source produces without worrying about render thrashing.

```ts
const chart = document.querySelector('lui-line-chart');

// Set initial data
chart.data = [{ name: 'Sensor A', data: [0] }];

// Stream new points
setInterval(() => {
  chart.pushData(Math.random() * 100);
}, 50); // 20 Hz — safely batched to 60 fps
```

### Streaming limits

| Chart type | Default buffer | Max (`max-points`) |
|---|---|---|
| Line, Area | 500,000 pts/series | Configurable |
| Bar, Pie, Scatter | 1,000 pts | Configurable |
| Heatmap | Unbounded (cell-update map) | — |
| Candlestick | Appends bars indefinitely | — |

When the buffer cap is reached on Line/Area, the chart auto-resets.

### Multi-series streaming

```ts
// Target a specific series by index
chart.pushData(42, 0); // series 0
chart.pushData(19, 1); // series 1
```

### Renderer-selected event

When using WebGPU or WebGL, wait for the `renderer-selected` event before reading the active renderer:

```ts
chart.addEventListener('renderer-selected', (e) => {
  console.log('Active renderer:', e.detail.renderer); // 'webgpu' | 'webgl' | 'canvas'
});
```

---

## Theming

All charts read from CSS custom properties. Override them globally or scope to a container:

```css
:root {
  /* Color palette (8 series colors) */
  --ui-chart-color-1: #3b82f6;
  --ui-chart-color-2: #8b5cf6;
  --ui-chart-color-3: #10b981;
  --ui-chart-color-4: #f59e0b;
  --ui-chart-color-5: #ef4444;
  --ui-chart-color-6: #06b6d4;
  --ui-chart-color-7: #f97316;
  --ui-chart-color-8: #84cc16;

  /* Layout */
  --ui-chart-height: 300px;
  --ui-chart-font-family: system-ui, sans-serif;

  /* Grid & axes */
  --ui-chart-grid-line: #e5e7eb;
  --ui-chart-axis-label: #6b7280;
  --ui-chart-axis-line: #d1d5db;

  /* Tooltip */
  --ui-chart-tooltip-bg: #ffffff;
  --ui-chart-tooltip-border: #e5e7eb;
  --ui-chart-tooltip-text: #111827;

  /* Legend */
  --ui-chart-legend-text: #374151;
}
```

### Dark mode

Charts respond automatically to a `.dark` class on `<html>`. Override token values under `.dark`:

```css
.dark {
  --ui-chart-grid-line: #374151;
  --ui-chart-axis-label: #9ca3af;
  --ui-chart-axis-line: #4b5563;
  --ui-chart-tooltip-bg: #1f2937;
  --ui-chart-tooltip-border: #374151;
  --ui-chart-tooltip-text: #f9fafb;
  --ui-chart-legend-text: #d1d5db;
}
```

### Height

Control chart height via CSS or the `--ui-chart-height` token:

```html
<lui-line-chart style="--ui-chart-height: 500px"></lui-line-chart>
```

---

## Advanced: WebGPU & WebGL

### WebGPU

Enable GPU-accelerated rendering for Line, Area, and Candlestick charts with `enable-webgpu`. Falls back silently to canvas if WebGPU is unavailable.

```html
<lui-line-chart enable-webgpu smooth zoom></lui-line-chart>
```

The GPU device is shared across all charts on the page (refcounted singleton). No configuration required.

### WebGL (Scatter)

Enable `echarts-gl` for hardware-accelerated scatter rendering — useful for millions of points:

```html
<lui-scatter-chart enable-gl bubble></lui-scatter-chart>
```

If WebGL is not available, a `webgl-unavailable` event fires and the chart falls back to canvas:

```ts
chart.addEventListener('webgl-unavailable', (e) => {
  console.warn('WebGL unavailable:', e.detail.reason);
});
```

---

## ECharts Escape Hatch

Access the underlying ECharts instance directly for advanced use cases (custom events, manual zoom reset, etc.):

```ts
const echarts = chart.getChart();
if (echarts) {
  echarts.on('click', (params) => console.log(params));
  echarts.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
}
```

You can also pass a full ECharts option object via the `option` property to override anything not exposed as a prop:

```ts
chart.option = {
  legend: { orient: 'vertical', right: 10 },
  grid: { left: '15%' },
};
```

---

## TypeScript

All types are exported from the main entry point:

```ts
import type {
  LineChartSeries,
  MarkLineSpec,
  BarChartSeries,
  BarOptionProps,
  PieSlice,
  PieOptionProps,
  ScatterPoint,
  ScatterOptionProps,
  HeatmapCell,
  HeatmapOptionProps,
  OhlcBar,
  MAConfig,
  CandlestickBarPoint,
  CandlestickOptionProps,
  TreemapNode,
  TreemapOptionProps,
  EChartsOption,
  RendererTier,
} from '@lit-ui/charts';
```

---

## Browser Support

| Feature | Requirement |
|---|---|
| Web Components | All modern browsers (Chrome, Firefox, Safari, Edge) |
| Canvas rendering | All modern browsers |
| WebGL (Scatter) | Chrome, Firefox, Edge, Safari 15+ |
| WebGPU (Line, Area, Candlestick) | Chrome 113+, Edge 113+ (experimental in Firefox/Safari) |

---

## License

MIT © lit-ui contributors
