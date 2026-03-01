---
name: lit-ui-line-chart
description: >-
  How to use <lui-line-chart> — props, data types, streaming, React integration, CSS tokens.
---

# Line Chart

Multi-series time series and trend line chart built on ECharts. Supports smooth interpolation, zoom/pan controls, mark lines, and real-time streaming via pushData() using ECharts appendData path.

## Usage

**Important:** `data`, `option`, and `markLines` are JS properties — not HTML attributes.

```js
import '@lit-ui/charts/line-chart';

const chart = document.querySelector('lui-line-chart');
chart.data = [
  { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
  { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
];
```

```html
<lui-line-chart smooth zoom></lui-line-chart>
```

```tsx
// React — useRef + useEffect required for all .data assignments
import { useRef, useEffect } from 'react';

function LineChartDemo({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.data = data;
  }, [data]);
  return <lui-line-chart ref={ref} smooth zoom />;
}
```

```js
// Real-time streaming
chart.data = [{ name: 'Live', data: [] }];
setInterval(() => chart.pushData(Math.random() * 100), 100);
// Multiple pushData() calls in the same frame are batched via requestAnimationFrame
```

```js
// Mark lines (threshold/reference lines)
chart.markLines = [
  { value: 80, label: 'Target', color: '#ef4444' },
];
// markLines is JS property only — cannot be set as HTML attribute
```

## Data Type

```ts
type LineChartSeries = {
  name: string;
  data: (number | [number | string, number] | null)[];
};

// chart.data is LineChartSeries[]
chart.data = [
  { name: 'Series A', data: [10, 20, 15, 30] },
  { name: 'Series B', data: [5, 15, 25, 20] },
];
```

## Props

For shared props (data, option, loading, enableGl, maxPoints) see `skills/charts`.

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `smooth` | `smooth` | `boolean` | `false` | Catmull-Rom spline interpolation between data points. |
| `zoom` | `zoom` | `boolean` | `false` | DataZoom slider at bottom + mouse wheel pan. |
| `markLines` | — (JS only) | `MarkLineSpec[]` | `undefined` | Threshold/reference horizontal lines. |

## Methods

See `skills/charts` for shared `pushData()` and `getChart()`.

## Events

See `skills/charts` for shared `ui-webgl-unavailable` event.

## CSS Custom Properties

See `skills/charts` for all 17 shared `--ui-chart-*` tokens.

## Behavior Notes

- **JS property required**: `data`, `option`, and `markLines` must be set as JS properties. Use `element.data = [...]` after element is connected. In React, use a ref + useEffect.
- **Streaming uses appendData**: Line chart uses ECharts native `appendData` path for streaming — do NOT call `chart.option = ...` or reassign `chart.data` after `pushData()` has started. Doing so wipes the streamed data.
- **markLines on index-0 series only**: Mark lines are rendered on the first series only to avoid N duplicate threshold lines for N series.
- **pushData() point type**: For a single-series line chart, pass a number. For a multi-series line chart with x values, pass `[xValue, yValue]`.
