# Feature Research: v9.0 Charts System

**Domain:** ECharts-powered Lit web component chart suite
**Project:** LitUI v9.0
**Researched:** 2026-02-28
**Confidence:** HIGH (verified against ECharts official docs, echarts-gl GitHub, community wrappers, and benchmark research)

## Executive Summary

Eight chart types built as Lit web components backed by Apache ECharts 5.x + ECharts GL. Each chart is a standalone `@lit-ui/charts` web component with the same CLI-install UX, CSS token theming, and Shadow DOM architecture as the 18 existing components.

The core design tension is: **how much of ECharts' `option` object to expose vs. abstract.** The right answer is a **hybrid model**: abstract lifecycle concerns (init, resize, dispose, dark mode handoff) and provide typed high-level props for common config (data, colors, title, legend), while always exposing an `option` escape hatch as a JS property for full ECharts API access. This matches what vue-echarts does and what every serious production user requires.

The second major tension is **WebGL vs. Canvas per chart type.** The decision rule is simple: use `echarts-gl` scatterGL/linesGL for scatter/bubble and real-time line when dataset exceeds ~50K points; use standard ECharts Canvas for everything else. Canvas starts faster (~15ms init vs ~40ms for WebGL), is simpler, handles all chart types, and covers 95% of real-world use cases. WebGL only pays off at scale.

Real-time streaming for a web component API means: expose a `pushData(point)` method and a `maxPoints` property, not raw `appendData`. The web component owns the circular buffer; it calls ECharts `setOption` or `appendData` internally. Users should not need to manage ECharts instance lifecycle.

---

## Feature Landscape: Global (All Chart Types)

### Table Stakes (Users Expect These — Global)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Responsive resize via ResizeObserver | Charts stretch/shrink with container | LOW | `firstUpdated()` attaches observer; calls `chart.resize()` on change. Do NOT use `window.resize`. |
| Dark mode via `:host-context(.dark)` | All 18 existing components support dark mode | LOW | Read CSS custom properties in `willUpdate()` and inject as ECharts colors. Same pattern as existing components. |
| CSS token theming (`--ui-chart-*`) | Library-wide design system consistency | MEDIUM | Tokens for: series colors (palette), grid line color, axis label color, tooltip bg/border, legend text color |
| `option` property escape hatch | Power users need full ECharts API access | LOW | JS property (not attribute) accepting raw `ECOption`. Merged with component-managed options via `notMerge: false`. |
| Loading state (`loading` attribute) | Data fetches take time | LOW | Map to ECharts `showLoading()` / `hideLoading()`. Use existing design token colors. |
| Empty state (no data) | Must communicate absence of data | LOW | Show placeholder slot content when `data` property is empty array. |
| Tooltip on hover | Users need precise values | LOW | ECharts built-in. Style via CSS tokens (bg, border, text). |
| Legend (optional, on/off) | Multi-series charts need series identification | LOW | ECharts built-in. Toggling series by clicking legend. |
| Proper `disconnectedCallback` dispose | Prevent memory leaks in SPAs | LOW | `chart.dispose()` + `resizeObserver.disconnect()` required. ECharts leaves dangling instances if not explicitly disposed. |
| Tree-shakeable per-chart import | Bundle only what you use | MEDIUM | Each chart file does its own `echarts.use([...])` with only the modules it needs. |

### Differentiators (Global)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `pushData(point)` / `pushDataset(points[])` imperative streaming API | Streaming without users managing ECharts internals | MEDIUM | Component owns circular buffer; `maxPoints` prop controls window. Calls `setOption` internally. |
| CSS custom property color palette injection | Charts auto-adopt LitUI theme colors | MEDIUM | On `connectedCallback`, read `--ui-chart-color-1` through `--ui-chart-color-8` from computed styles; pass as ECharts `color` array. Re-reads on `:host-context(.dark)` change. |
| `getChart()` method exposing raw ECharts instance | Advanced use cases (ECharts events, custom plugins) | LOW | Escape hatch for power users who know ECharts API. Document prominently. |
| SSR-safe guard pattern | Library supports Next.js App Router | LOW | Wrap `echarts.init()` in `isServer` guard (same pattern as existing components). Chart renders blank slot on server. |
| Animation `prefers-reduced-motion` respect | Accessibility | LOW | Read `window.matchMedia('(prefers-reduced-motion)')`, disable ECharts `animation` if true. |

### Anti-Features (Global)

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Exposing raw ECharts instance as public property | "I want direct access" | Encourages bypassing the component API, making future library upgrades breaking. Hidden mutations cause desync. | Provide `getChart()` method and document it as an escape hatch with a stability warning. |
| Auto-binding to `<script type="application/json">` in DOM | Declarative data without JS | Violates Shadow DOM encapsulation; JSON parsing in innerHTML is a security surface. Awkward for dynamic data. | Use JS properties (`.data = [...]`). Components are used from JS frameworks. |
| Built-in WebSocket management inside the component | "Zero-config real-time" | The component cannot know authentication, reconnect policy, message format, or topic routing. | Expose `pushData()` method. User manages the WebSocket; pushes data in. |
| Attribute-serialized `data` property (`data="[...]"`) | Framework-agnostic HTML usage | JSON.parse on large datasets is slow and lossy (no TypedArray). Attributes are strings, properties are objects. | JS property assignment only for `.data`. Use `@property({ attribute: false })` pattern. |
| Bundling full `echarts` import in each chart component | Simplest import | ~1MB+ bundle; defeats the purpose of per-chart packages. | Per-component tree-shaking with `echarts/core` + specific modules. |

---

## Feature Landscape: Per Chart Type

### Line Chart (`lui-line-chart`)

**Use case:** Time series, trends, continuous data over categories.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multiple series | Compare 2+ metrics on same axes | LOW | `data` prop accepts `{ name, data[] }[]` array. |
| Category or time axis | Date labels on X | LOW | Auto-detect from data shape: if data points are Date objects, use `type: 'time'`. |
| `smooth` option | Curved lines look more polished | LOW | Boolean prop, maps directly to ECharts `smooth`. |
| dataZoom (brush/slider) | Pan/zoom long time series | LOW | Enable via `zoom` boolean prop. ECharts built-in `dataZoom` component. |
| Configurable Y-axis range | Prevent misleading truncated axis | LOW | `yMin`, `yMax` props. |
| Grid padding CSS tokens | Chart doesn't clip axis labels | LOW | `--ui-chart-grid-*` tokens injected as ECharts `grid` config. |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `pushData(seriesIndex, point)` real-time streaming | IoT sensor / monitoring dashboards | MEDIUM | Component maintains circular buffer per series. `maxPoints` default: 500. No animation on stream push (disable for performance). |
| WebGL mode via `renderer="webgl"` attribute | 50K+ points remain 60fps | MEDIUM | Swaps ECharts `LineChart` for ECharts GL `linesGL`. zlevel separation required. Fallback to canvas if WebGL unavailable. |
| Mark lines (thresholds, averages) | Contextual reference | LOW | `markLines` prop: `[{ value: 100, label: 'Threshold' }]`. Maps to ECharts `markLine`. |
| Confidence band (area between min/max) | Statistical visualizations | MEDIUM | Two area series + `stack` configuration. Requires `areaStyle` on both. |

#### Anti-Features

| Anti-Feature | Why Avoid | Alternative |
|--------------|-----------|-------------|
| Interpolating missing values automatically | Silently hides data quality issues | Expose `connect` prop (ECharts `connectNulls`); default `false` so gaps are visible |
| Per-point color via data item styling | Requested for anomaly highlighting | Use ECharts `markPoint` for specific callouts instead |

#### Rendering Recommendation

**Canvas (default).** Use `renderer="webgl"` (ECharts GL `linesGL`) only when dataset exceeds 50K points or update frequency exceeds 10Hz. Canvas init is 3x faster than WebGL and sufficient for most dashboards.

---

### Bar / Column Chart (`lui-bar-chart`)

**Use case:** Categorical comparisons, rankings, distributions.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Grouped bars (multiple series side-by-side) | Compare categories across groups | LOW | Multiple series with same category axis. ECharts default for multiple bar series. |
| Stacked bars | Part-to-whole comparison | LOW | `stacked` boolean prop. Maps to `stack: 'total'` on each series. |
| Horizontal layout | Long category labels don't truncate | LOW | `horizontal` boolean prop. Swaps `xAxis`/`yAxis` `type` values. |
| Value labels on bars | Quick reading without tooltip | LOW | `showLabels` prop. ECharts `label.show = true`. |
| Color per category (not per series) | Single series charts look better with varied colors | LOW | `colorByData` prop. Maps to ECharts `colorBy: 'data'`. |
| dataZoom | Scroll long category lists | LOW | Same `zoom` prop as line chart. |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 100% stacked (normalized) | Proportional comparison across groups | LOW | Add `stack: 'total'` + `encode.y` as percentage via transform. ECharts dataset transform. |
| Waterfall chart mode | Business finance visuals (budget variance) | HIGH | Not a native ECharts type; implemented via manual positive/negative stacking with invisible base series. Significant custom logic. |
| Background bars (gauge effect) | Visual KPI-style bars | LOW | ECharts `showBackground: true` on bar series. |
| Rounded bar ends | Modern polished aesthetic | LOW | ECharts `itemStyle.borderRadius`. |

#### Anti-Features

| Anti-Feature | Why Avoid | Alternative |
|--------------|-----------|-------------|
| Animated sort (racing bar chart) | Viral visual, rarely analytically useful | Provide manual setOption timer pattern in docs as "advanced example" rather than first-class prop |
| Gradient fills | Adds visual noise without data meaning | Use solid colors from CSS token palette |

#### Rendering Recommendation

**Canvas only.** `appendData` does NOT support bar charts (ECharts limitation — only `scatter` and `line` support incremental rendering). Real-time bar updates use full `setOption` with `notMerge: false`, which is fine because bar charts rarely have high-frequency update needs.

---

### Scatter / Bubble Chart (`lui-scatter-chart`)

**Use case:** Correlation analysis, outlier detection, distribution, large datasets.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| X/Y data point rendering | Core function | LOW | `data` prop accepts `[x, y][]` or `[x, y, size, label][]` tuples. |
| Bubble mode (3rd dimension as size) | Encode 3 variables | LOW | If data has 3rd value, map to `symbolSize` function. `bubble` boolean prop enables this. |
| Color by value or category | Encode 4th dimension | MEDIUM | `colorDimension` prop index; maps to ECharts `visualMap`. |
| dataZoom with brush select | Select subsets for analysis | LOW | `zoom` + `brush` props. ECharts built-in. |
| Axis labels and units | Context for values | LOW | `xLabel`, `yLabel`, `xUnit`, `yUnit` props. |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| WebGL mode (scatterGL) for 1M+ points | IoT telemetry, genomics, log analysis | MEDIUM | ECharts GL `scatterGL` type. Same `data` API; swap series type internally. zlevel cannot overlap Canvas layers. `renderer="webgl"` attribute. |
| Density blending mode | Visualize point concentration | LOW | ECharts GL `blendMode: 'lighter'` — regions with many overlapping points glow brighter. Only available in WebGL mode. |
| Jitter / point size control | Avoid overplotting | LOW | `symbolSize` prop (fixed or function string). `opacity` prop. |
| Progressive loading for large datasets | Render incrementally while loading | LOW | ECharts `progressive` and `progressiveThreshold` config. Exposed as `progressive` boolean. |

#### Anti-Features

| Anti-Feature | Why Avoid | Alternative |
|--------------|-----------|-------------|
| Animated transition between all points on data update | Beautiful on demos, terrible at 100K points | Default `animation: false` when dataset > 10K; let users opt in |
| Automatic clustering | Useful but adds algorithmic complexity + ML dependency | Documented as "use ECharts dataset transform or server-side pre-aggregate" |

#### Rendering Recommendation

**Canvas for datasets under 50K points (default). WebGL (`renderer="webgl"`) for 50K+.** ECharts GL `scatterGL` renders 1M points at 60fps using GPU instanced draw calls. The 40ms WebGL init penalty is worth it at this scale. For small datasets, Canvas is simpler and avoids the `echarts-gl` import cost (~200KB additional).

---

### Area Chart (`lui-area-chart`)

**Use case:** Volume, cumulative data, part-of-whole across time. Implemented as a line chart with `areaStyle`.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Filled area below line | Core visual distinction from line chart | LOW | `areaStyle: {}` on the line series. No separate series type in ECharts. |
| Stacked area | Part-to-whole over time | LOW | `stacked` prop. Series `stack: 'total'`. |
| Semi-transparent fill | Overlapping series remain readable | LOW | CSS token `--ui-chart-area-opacity` → `areaStyle.opacity`. Default 0.4. |
| Gradient fill | Polished look for single-series | LOW | ECharts `areaStyle.color` as LinearGradient. Optional via `gradient` prop. |
| Smooth curves | Matches line chart visual feel | LOW | `smooth` prop. |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `pushData()` streaming same as line chart | Real-time area charts (network traffic, memory usage) | MEDIUM | Exact same circular buffer pattern as line chart. `areaStyle` just added on top. |
| Band chart (filled area between two lines) | Confidence intervals, range visualization | MEDIUM | Two line series with one `stack`, `areaStyle` on both, `lineStyle.width: 0` on base line. |

#### Anti-Features

| Anti-Feature | Why Avoid | Alternative |
|--------------|-----------|-------------|
| Separate `lui-area-chart` component | Duplication — area is just a line with fill | Implemented as a variant in `lui-line-chart` via `type="area"` prop, OR as a thin wrapper. Either way, shared implementation. |

#### Rendering Recommendation

**Canvas only.** Same as line chart. WebGL available via `renderer="webgl"` for high-frequency streaming use cases.

---

### Heatmap (`lui-heatmap-chart`)

**Use case:** 2D matrix data, calendar activity heatmaps, correlation matrices.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 2D grid rendering (row × column) | Core function | LOW | `data` as `[x, y, value][]` tuples, `xCategories[]`, `yCategories[]`. |
| Color scale (low→high) | Visual encoding of magnitude | LOW | ECharts `visualMap` component. Expose `colorRange: [low, high]` prop; let ECharts interpolate. |
| Custom color scale | Domain-specific meaning (green=good, red=bad) | LOW | `colorScale: [string, string]` prop; `--ui-chart-heatmap-low` / `--ui-chart-heatmap-high` CSS tokens. |
| Tooltip with exact value | Precise reading | LOW | ECharts built-in. |
| Cell label (value inside each cell) | Small grids need direct reading | LOW | `showLabels` prop. ECharts `label.show`. |
| Calendar heatmap mode | GitHub-style activity display | MEDIUM | Switch axis to ECharts `calendar` component. `mode="calendar"` prop with `year` parameter. |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Null/missing cell styling | Real datasets have gaps | LOW | `nullColor` CSS token. ECharts `visualMap` out-of-range color. |
| Aspect ratio lock | Square cells for matrix readability | LOW | `squareCells` boolean prop. Compute cell size based on grid dimensions. |

#### Anti-Features

| Anti-Feature | Why Avoid | Alternative |
|--------------|-----------|-------------|
| WebGL heatmap (heatmapGL) | Heatmaps are rarely 1M+ cell grids; canvas is fine | Canvas is sufficient; document that `scatterGL` with `blendMode: 'lighter'` achieves density-map effect |
| Animated cell transitions on data change | Distracting for matrix data | Default `animation: false` for heatmaps; ECharts cell transitions are jarring |

#### Rendering Recommendation

**Canvas only.** Heatmap grids rarely exceed 1000×1000 cells in practice. Canvas handles this easily. If truly massive (genomic data at chromosome scale), the right solution is server-side pre-aggregation, not WebGL.

---

### Candlestick / OHLC (`lui-candlestick-chart`)

**Use case:** Financial price charts (stocks, crypto, forex). Open/High/Low/Close data.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| OHLC candle rendering | Core function | LOW | `data` as `[timestamp, open, close, low, high][]` (ECharts native format). |
| Bull/bear colors | Green up candles, red down candles | LOW | `bullColor`, `bearColor` props. CSS tokens `--ui-chart-candle-bull`, `--ui-chart-candle-bear`. |
| Volume bars (secondary axis) | Almost always shown with candles | MEDIUM | Secondary `bar` series with `yAxisIndex: 1`. `showVolume` boolean prop. |
| dataZoom with time range | Navigate to specific period | LOW | `zoom` prop. ECharts built-in. Required — financial charts without zoom are unusable. |
| Crosshair tooltip | Standard financial chart interaction | LOW | ECharts `tooltip.trigger: 'axis'` + `axisPointer.type: 'cross'`. |
| Logarithmic Y axis | Long price history | LOW | `logScale` boolean prop. ECharts `yAxis.type: 'log'`. |
| Time axis auto-formatting | "Jan 2024" → "Mon 15 Jan" → "14:30" based on zoom | LOW | ECharts time axis handles this natively. |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Moving average overlays | SMA/EMA are baseline for technical traders | MEDIUM | `movingAverages: [{ period: 20, color: '...' }]` prop. Compute MA series from OHLC data in `willUpdate()`. |
| Persistent OHLC header banner | TradingView-style values at top (not just tooltip) | MEDIUM | Overlay `<div>` in light DOM above canvas. Update on `mousemove` via ECharts event `'updateAxisPointer'`. Known gap in base ECharts (GitHub Issue #18519). |
| `pushCandle(ohlcv)` streaming | Live tick data, crypto trading | MEDIUM | Push new candle; update last incomplete candle if same timestamp bucket. More complex than line streaming — last candle mutates. |

#### Anti-Features

| Anti-Feature | Why Avoid | Alternative |
|--------------|-----------|-------------|
| Full TradingView feature parity (drawing tools, indicators panel, symbol search) | TradingView is a product, not a component | Provide the canvas + basic overlays; advanced trading features belong in application code |
| OHLC bar style (separate from candlestick) | ECharts candlestick can render both; adding separate component is duplication | `style="ohlc"` prop variant on the same component |
| WebGL rendering | Financial charts rarely exceed 10K candles; Canvas handles it perfectly | Canvas only. If user has years of tick data at 1-second resolution, they should pre-aggregate to OHLCV before rendering. |

#### Rendering Recommendation

**Canvas only.** A 5-year daily chart is 1825 candles. Even a 10-year hourly chart is ~87,600 candles — standard Canvas with ECharts handles this comfortably. WebGL overhead is not justified. Pre-aggregate on server for extreme resolutions.

---

### Pie / Donut Chart (`lui-pie-chart`)

**Use case:** Part-to-whole proportions. Best for ≤7 categories.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Pie rendering | Core function | LOW | `data` as `[{ name, value }][]`. ECharts native format. |
| Donut mode | Modern alternative to full pie | LOW | `donut` boolean prop. Sets `radius: ['40%', '70%']` vs `radius: '70%'`. |
| Center label (donut) | Show total or selected value in hole | LOW | ECharts `graphic` text element or `label` with `position: 'center'`. `centerLabel` prop. |
| Click-to-highlight | Slice selection interaction | LOW | ECharts built-in emphasis. |
| Legend with percentages | Show "A: 35%" in legend | LOW | ECharts `legend.formatter` function. |
| `padAngle` between slices | Polished modern look | LOW | ECharts 5.5 `series.padAngle`. Expose as `gap` prop. |
| Semi-circle mode | Dashboard gauge-style display | LOW | ECharts `startAngle`/`endAngle`. `shape="semi"` prop. |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Rose chart mode (Nightingale) | Encode magnitude via radius, not angle | LOW | ECharts `roseType: 'radius'`. `rose` boolean prop. |
| Animated slice enter (on data update) | ECharts 5 group drill-down animation | MEDIUM | ECharts `groupId`/`childGroupId` drilldown (v5.5). Expose `drilldown` data structure. |
| Slice threshold (hide tiny slices into "Other") | Real data often has many micro-categories | LOW | Pre-process in `willUpdate()`: merge slices below `minPercent` threshold into "Other" category. |

#### Anti-Features

| Anti-Feature | Why Avoid | Alternative |
|--------------|-----------|-------------|
| Exploded/3D pie | Visually misleading — distorts proportions via perspective | Flat 2D only. Document this in accessibility notes. |
| More than 12 slices by default | Color discrimination fails; legend becomes unreadable | Enforce `minPercent` threshold. Document "use bar chart for many categories". |
| Animation on every data update | Spinning pie on every prop change is nauseating | `animationDuration: 300` for first render only; subsequent updates use short transition. |

#### Rendering Recommendation

**Canvas only.** Pie charts are never performance-constrained. The number of data points is bounded by the number of categories (reasonable max: 20). SVG would also work but Canvas is the default.

---

### Treemap (`lui-treemap-chart`)

**Use case:** Hierarchical data with quantitative size encoding. File systems, portfolio allocation, market cap.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hierarchical data rendering | Core function | LOW | `data` as ECharts `TreemapSeriesOption` `data[]` with nested `children[]`. |
| Drill-down navigation | Explore hierarchy levels | LOW | ECharts built-in breadcrumb + click-to-zoom. |
| Color by value (visualMap) | Encode a 2nd dimension | LOW | `colorDimension` prop. ECharts `colorMappingBy: 'value'` with `colorRange`. |
| Size by value | Proportional layout | LOW | ECharts uses `value` for sizing natively. |
| Tooltip with path | Show "Root > Category > Item" | LOW | ECharts `tooltip.formatter` with breadcrumb path. |
| Breadcrumb navigation | Show current drill depth | LOW | ECharts `breadcrumb` config. Expose `breadcrumb` boolean. |
| Round corners | Modern aesthetic | LOW | ECharts 5 `itemStyle.borderRadius`. Expose `rounded` boolean. |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Level-based color themes | Each hierarchy level gets distinct color treatment | MEDIUM | ECharts `levels[]` config. `levelColors` prop accepting array of color arrays per level. |
| Label overflow strategy | Deep hierarchies have tiny cells | LOW | ECharts `label.overflow: 'truncate'`. Auto-hide labels below `minCellSize` threshold. |

#### Anti-Features

| Anti-Feature | Why Avoid | Alternative |
|--------------|-----------|-------------|
| Animated layout transitions between data updates | Treemap re-layout on data change is computationally expensive and visually confusing | `animation: false` by default for treemap; only animate initial render |
| WebGL rendering | Treemap is a rect-packing problem; GPU offers no advantage | Canvas only |
| Flat-to-hierarchical data transformation as a built-in feature | The component cannot know the hierarchy semantics of user data | Document the ECharts `treeHelper` or standard `{ name, value, children }` format; transformation is user responsibility |

#### Rendering Recommendation

**Canvas only.** Treemaps render rectangles, not individual data points. Even with 10K leaf nodes, Canvas handles treemap layout comfortably. WebGL offers no meaningful advantage for rect-packing.

---

## WebGL vs Canvas Decision Summary

| Chart Type | Default Renderer | WebGL Available? | WebGL Trigger |
|------------|-----------------|-----------------|---------------|
| Line | Canvas | Yes (linesGL) | `renderer="webgl"` or auto-switch at 50K+ points |
| Bar | Canvas | No | appendData unsupported; Canvas sufficient |
| Scatter/Bubble | Canvas | Yes (scatterGL) | `renderer="webgl"` or auto-switch at 50K+ points |
| Area | Canvas | Yes (via line) | `renderer="webgl"` |
| Heatmap | Canvas | No | Not justified; canvas handles grid sizes |
| Candlestick | Canvas | No | Pre-aggregate data instead |
| Pie/Donut | Canvas | No | Category count is bounded; not needed |
| Treemap | Canvas | No | Rect-packing gives GPU no advantage |

**Rule of thumb:** Only Line, Scatter, and Area charts can meaningfully use ECharts GL. All others stay Canvas.

---

## Real-Time Streaming API Design

### The Wrong Way

Do not expose ECharts' `appendData()` directly. It has critical limitations:
- Only supported by `scatter` and `line` series types (not bar, area, heatmap, candlestick, pie, treemap)
- Not compatible with `dataset` API
- Does not support circular buffer trimming — data grows unbounded

### The Right Way: Component-Owned Streaming

Each streaming-capable chart (Line, Area, Scatter) exposes:

```typescript
// Imperative method — push one point
chart.pushData(seriesIndex: number, point: [number, number] | DataPoint): void

// Push batch of points
chart.pushDataset(seriesIndex: number, points: DataPoint[]): void

// Configuration
chart.maxPoints = 500       // circular buffer size per series
chart.streamAnimation = false // default false for performance
```

**Internally**, the component:
1. Maintains an in-memory circular buffer (plain array slice, not a custom data structure)
2. On each push, calls `setOption({ series: [{ data: buffer }] }, { notMerge: false, lazyUpdate: true })`
3. `lazyUpdate: true` batches multiple pushes in the same animation frame
4. Disables ECharts animation by default for streaming (0ms transition looks better than 300ms lag)

**For scatter at 1M+ points** with WebGL: use `appendData` internally instead. The component abstracts the difference.

### Streaming Web Component API Example

```html
<!-- HTML usage -->
<lui-line-chart id="sensor" max-points="300"></lui-line-chart>

<script>
const chart = document.querySelector('#sensor');
chart.data = [{ name: 'Temperature', data: [] }];

// WebSocket pushes
socket.onmessage = (e) => {
  chart.pushData(0, [Date.now(), JSON.parse(e.data).temp]);
};
</script>
```

No ECharts knowledge required. No `appendData` or `setOption` called by users.

---

## ECharts Option Exposure Strategy

### Recommended: Hybrid Model

**Level 1 — Typed props (80% of use cases):**
```html
<lui-line-chart
  title="CPU Usage"
  .data="${seriesArray}"
  smooth
  zoom
  loading="${fetching}"
></lui-line-chart>
```

**Level 2 — `option` property for full config (power users):**
```javascript
// Merges with component-managed config (notMerge: false)
chart.option = {
  series: [{ markLine: { data: [{ yAxis: 80 }] } }]
};
```

**Level 3 — Raw instance access (escape hatch):**
```javascript
const echartsInstance = chart.getChart();
echartsInstance.on('click', handleClick);
```

**What the component always owns (never overrideable via `option`):**
- Container DOM and resize observer
- Dark mode color injection
- Dispose lifecycle
- SSR guard

**What is merged (can be overridden):**
- Series config (user `option.series` extends component-generated series)
- Tooltip config
- Grid padding
- Legend position

This is the same model vue-echarts uses: manage lifecycle, surface a clean prop API, and forward the raw option for power users.

---

## Feature Dependencies

```
@lit-ui/core (TailwindElement base class)
    └──required──> All chart components (extends TailwindElement)

echarts (npm package, peer dep)
    └──required──> All chart components (ECharts canvas renderer)

echarts-gl (npm package, peer dep)
    └──required──> lui-line-chart (webgl mode)
    └──required──> lui-scatter-chart (webgl mode)
    └──required──> lui-area-chart (webgl mode)
    └──optional──> Others (not used)

lui-line-chart
    ├──shares pattern──> lui-area-chart (area = line + areaStyle)
    └──streaming API──> lui-scatter-chart (same pushData pattern)

CSS token system (--ui-chart-*)
    └──required──> All chart components (color palette, grid, tooltip, legend tokens)

lui-tooltip (existing)
    └──NOT a dependency — ECharts has built-in tooltip that must match design system
       via CSS token injection, not by using lui-tooltip component

ECharts theme object (computed from CSS tokens)
    └──shared──> All chart components (computed once per shadow root)
```

### Dependency Notes

- **echarts-gl is optional per chart**: Import only in charts that declare `renderer="webgl"` support (line, scatter, area). Treemap/bar/pie/heatmap/candlestick never import echarts-gl — keeps their bundles smaller.
- **No dependency on existing LitUI overlay components**: ECharts tooltip, legend, and dataZoom are self-contained. Attempting to use `lui-tooltip` inside ECharts canvas is architecturally impossible (canvas is not DOM).
- **CSS tokens bridge the Shadow DOM isolation**: ECharts runs inside a `<div>` inside the shadow root. It has no access to CSS custom properties directly. The component must read `getComputedStyle(this)` and pass token values as ECharts option colors on each update.

---

## MVP Definition

### Launch With (v9.0 core — all 8 chart types)

These are the minimum features to ship all 8 chart types:

- [ ] `@lit-ui/charts` package with tree-shakeable per-chart modules
- [ ] All 8 chart components with `data`, `loading`, `option` escape hatch props
- [ ] ResizeObserver + dispose lifecycle (no memory leaks)
- [ ] Dark mode via CSS token injection on `:host-context(.dark)` detection
- [ ] CSS token system (`--ui-chart-color-1..8`, `--ui-chart-grid-*`, `--ui-chart-tooltip-*`)
- [ ] ECharts tree-shaking per component (no full `import * from 'echarts'`)
- [ ] `getChart()` raw instance escape hatch
- [ ] SSR safety guard (no chart init on server)
- [ ] CLI: `npx lit-ui add line-chart` (and all 7 others)
- [ ] `zoom` prop (dataZoom) on Line, Bar, Area, Scatter, Candlestick

### Add After v9.0 Ships (v9.1)

- [ ] `pushData()` streaming API on Line, Area, Scatter — when users request real-time use cases
- [ ] WebGL mode (`renderer="webgl"`) on Line, Scatter, Area — when benchmark shows users hitting Canvas limits
- [ ] Moving average overlays on Candlestick — when trading use cases confirmed
- [ ] Calendar heatmap mode — when activity visualization use case confirmed

### Future Consideration (v10+)

- [ ] ECharts 6 design token system integration (if ECharts 6 stabilizes)
- [ ] Geographic map chart (`lui-map-chart`) — requires geo JSON bundling strategy
- [ ] Gauge chart (`lui-gauge-chart`) — if dashboard KPI use case emerges
- [ ] Parallel coordinates (`lui-parallel-chart`) — specialized analytics use case
- [ ] SSR SVG rendering + lightweight client hydration (ECharts 5.5 pattern)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| All 8 chart types (basic) | HIGH | MEDIUM | P1 |
| CSS token theming | HIGH | MEDIUM | P1 |
| Dark mode | HIGH | LOW | P1 |
| ResizeObserver + dispose | HIGH | LOW | P1 |
| dataZoom (`zoom` prop) | HIGH | LOW | P1 |
| `option` escape hatch | HIGH | LOW | P1 |
| CLI integration | HIGH | LOW | P1 |
| Tree-shaking per chart | MEDIUM | MEDIUM | P1 |
| `pushData()` streaming API | MEDIUM | MEDIUM | P2 |
| WebGL mode (scatter/line) | MEDIUM | HIGH | P2 |
| Moving average overlays (candlestick) | MEDIUM | MEDIUM | P2 |
| Calendar heatmap mode | MEDIUM | MEDIUM | P2 |
| Waterfall chart mode (bar) | LOW | HIGH | P3 |
| Drilldown animation (pie) | LOW | MEDIUM | P3 |
| ECharts 6 token system | LOW | HIGH | P3 |

---

## Sources

### High Confidence (Official Documentation)

- [Apache ECharts Features](https://echarts.apache.org/en/feature.html) — chart type inventory, Canvas/SVG/WebGL summary
- [ECharts GL GitHub](https://github.com/ecomfe/echarts-gl) — WebGL extension, scatterGL, zlevel requirements
- [ECharts Handbook: Import (Tree Shaking)](https://apache.github.io/echarts-handbook/en/basics/import/) — modular import pattern
- [ECharts Handbook: Dynamic Data](https://apache.github.io/echarts-handbook/en/how-to/data/dynamic-data/) — setOption, appendData
- [ECharts Handbook: Area Chart](https://echarts.apache.org/handbook/en/how-to/chart-types/line/area-line/) — area = line + areaStyle
- [ECharts ARIA Best Practices](https://echarts.apache.org/handbook/en/best-practices/aria/) — accessibility
- [ECharts 5.5 Release Notes](https://echarts.apache.org/handbook/en/basics/release-note/5-5-0/) — padAngle, drilldown groupId
- [ECharts Design Token Discussion](https://github.com/apache/echarts/issues/20202) — upcoming token system in ECharts 6

### Medium Confidence (Community & Integration Patterns)

- [lit-echarts (cherie-xf)](https://github.com/cherie-xf/lit-echarts) — existing Lit+ECharts web component implementation
- [Using Apache ECharts with Lit and TypeScript](https://dev.to/manufac/using-apache-echarts-with-lit-and-typescript-1597) — lifecycle patterns (firstUpdated, disconnectedCallback)
- [ECharts Streaming/Scheduling DeepWiki](https://deepwiki.com/apache/echarts/2.4-streaming-and-scheduling) — internal streaming architecture
- [OHLC Fixed Banner GitHub Issue #18519](https://github.com/apache/echarts/issues/18519) — known candlestick gap

### Low Confidence (General Benchmarks — Directional Only)

- [Canvas vs WebGL Performance: SVG Genie](https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025) — 10x-20x WebGL advantage at 100K+ points
- [Real-Time Dashboard WebGL vs Canvas: Dev3lop](https://dev3lop.com/real-time-dashboard-performance-webgl-vs-canvas-rendering-benchmarks/) — init latency comparison

---
*Feature research for: ECharts-powered Lit web component chart suite (LitUI v9.0)*
*Researched: 2026-02-28*
