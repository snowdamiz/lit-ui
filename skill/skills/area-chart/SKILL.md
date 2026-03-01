---
name: lit-ui-area-chart
description: >-
  How to use <lui-area-chart> — props, data types, stacked areas, streaming, React integration.
---

# Area Chart

Filled area chart built on ECharts. Extends the line chart with area fill (areaStyle). Supports stacking, smooth curves, zoom, and real-time streaming via appendData.

## Usage

**Important:** `data` and `option` are JS properties — not HTML attributes.

```js
import '@lit-ui/charts/area-chart';

const chart = document.querySelector('lui-area-chart');
chart.data = [
  { name: 'Downloads', data: [120, 200, 150, 80, 70, 110, 130] },
  { name: 'Installs', data: [60, 100, 80, 40, 50, 75, 90] },
];
```

```html
<lui-area-chart smooth stacked zoom></lui-area-chart>
```

```tsx
// React
import { useRef, useEffect } from 'react';
function AreaChartDemo({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.data = data;
  }, [data]);
  return <lui-area-chart ref={ref} smooth stacked />;
}
```

## Data Type

Same as line chart:
```ts
type LineChartSeries = {
  name: string;
  data: (number | [number | string, number] | null)[];
};
```
Area chart reuses the same ECharts module as line — area is a line series with `areaStyle` applied.

## Props

For shared props (data, option, loading, enableGl, maxPoints) see `skills/charts`.

| Prop | Attribute | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `smooth` | `smooth` | `boolean` | `false` | Catmull-Rom spline interpolation. |
| `stacked` | `stacked` | `boolean` | `false` | Stack all series (passes `stack: 'total'` to ECharts). |
| `zoom` | `zoom` | `boolean` | `false` | DataZoom slider + mouse wheel pan. |
| `labelPosition` | `label-position` | `'top' \| 'bottom' \| ''` | `''` | Data point labels. `''` = no labels. |

## Methods

See `skills/charts` for shared `pushData()` and `getChart()`.

## CSS Custom Properties

See `skills/charts` for all 17 shared `--ui-chart-*` tokens.

## Behavior Notes

- **JS property required**: `data` and `option` must be set as JS properties.
- **Streaming uses appendData**: Same as line chart — do NOT reassign `chart.data` after streaming has started.
- **stacked translates to string**: `stacked` boolean prop passes `stack: 'total'` string internally — ECharts requires a string group name to activate stacking, not a boolean.
- **labelPosition empty string**: `labelPosition: ''` means no labels. `'top'` renders labels above fill area.
