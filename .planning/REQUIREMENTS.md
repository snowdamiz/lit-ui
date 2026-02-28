# Requirements: LitUI Charts System

**Defined:** 2026-02-28
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v9.0 Requirements

Requirements for the v9.0 Charts System milestone. Each maps to a roadmap phase.

### Package Infrastructure

- [x] **INFRA-01**: Developer can install `@lit-ui/charts` as an opt-in package separate from other LitUI packages
- [x] **INFRA-02**: Developer can use chart components in SSR frameworks (Next.js, Astro) without `window`/`document` crash
- [x] **INFRA-03**: Developer can enable WebGL rendering via `enable-gl` attribute with automatic Canvas fallback when WebGL is unavailable
- [x] **INFRA-04**: Developer can apply dark mode to charts via the `.dark` class (same pattern as all other LitUI components)
- [x] **INFRA-05**: Developer can customize chart appearance via `--ui-chart-*` CSS custom properties (series palette, grid, axis, tooltip, legend)

### Shared Chart Behaviors

- [x] **CHART-01**: Developer can pass chart data via a `data` property on every chart component
- [x] **CHART-02**: Developer can pass a raw ECharts `option` object to override or extend any chart behavior
- [x] **CHART-03**: Developer can access the underlying ECharts instance via a `getChart()` method for event binding and advanced customization
- [x] **CHART-04**: Developer can toggle a loading skeleton state on any chart via a `loading` property
- [x] **CHART-05**: Charts automatically resize when their container dimensions change (ResizeObserver, not `window.resize`)

### Streaming Infrastructure

- [x] **STRM-01**: Developer can stream data into any chart via a `pushData(point)` method
- [x] **STRM-02**: Developer can configure the circular buffer size via a `maxPoints` property (default 1000)
- [x] **STRM-03**: Multiple `pushData()` calls within a single animation frame are batched into one render via `requestAnimationFrame`
- [x] **STRM-04**: Line and Area charts use ECharts native `appendData` path for streaming; all other chart types use circular buffer + `setOption({ lazyUpdate: true })`

### Line Chart

- [x] **LINE-01**: Developer can render a line chart with one or more named data series
- [x] **LINE-02**: Developer can enable smooth curve interpolation, zoom/pan controls, and mark lines
- [x] **LINE-03**: Developer can stream real-time data points into a line chart via `pushData()`

### Area Chart

- [x] **AREA-01**: Developer can render a filled area chart with `stacked` and `smooth` options
- [x] **AREA-02**: Developer can stream real-time data points into an area chart via `pushData()`

### Bar Chart

- [x] **BAR-01**: Developer can render grouped, stacked, and horizontal bar charts
- [x] **BAR-02**: Developer can display value labels on bars and enable per-bar color mode
- [x] **BAR-03**: Developer can stream data updates into a bar chart via `pushData()` with circular buffer

### Pie / Donut Chart

- [x] **PIE-01**: Developer can render a pie chart with automatic small-slice merging below a configurable threshold
- [x] **PIE-02**: Developer can render a donut chart with configurable inner radius and center label text
- [x] **PIE-03**: Developer can stream data updates into pie/donut charts via `pushData()`

### Scatter / Bubble Chart

- [x] **SCAT-01**: Developer can render a scatter chart with optional bubble size dimension (`bubble` mode)
- [x] **SCAT-02**: Developer can enable WebGL rendering for 500K+ point datasets via `enable-gl` attribute (ScatterGL via echarts-gl)
- [x] **SCAT-03**: Developer can stream data points into a scatter chart via `pushData()` with circular buffer

### Heatmap Chart

- [ ] **HEAT-01**: Developer can render a Cartesian heatmap with configurable x/y categories and VisualMap color scale
- [ ] **HEAT-02**: Developer can stream cell value updates into a heatmap via `pushData()`

### Candlestick Chart

- [ ] **CNDL-01**: Developer can render a candlestick chart from OHLC `[open, close, low, high]` data with configurable bull/bear colors
- [ ] **CNDL-02**: Developer can display a volume panel on a secondary axis below the candlestick chart
- [ ] **CNDL-03**: Developer can display SMA/EMA moving average overlays via a `moving-averages` prop
- [ ] **CNDL-04**: Developer can stream new OHLC bars into a candlestick chart via `pushData()`

### Treemap Chart

- [ ] **TREE-01**: Developer can render a treemap from hierarchical `{ name, value, children[] }` data
- [ ] **TREE-02**: Developer can configure breadcrumb navigation, rounded cells, and per-level colors

### CLI & Distribution

- [ ] **CLI-01**: Developer can install any chart component via `npx lit-ui add [chart-name]` using the same CLI UX as other LitUI components
- [ ] **CLI-02**: Developer can import individual chart types via subpath exports (`@lit-ui/charts/line-chart`) to tree-shake unused charts
- [ ] **CLI-03**: Developer can get a working copy-source starter template for each of the 8 chart types

### Documentation

- [ ] **DOCS-01**: Developer can reference a complete interactive demo, API property table, and CSS token table for each chart type on the docs site
- [ ] **DOCS-02**: Developer can understand bundle size impact (Canvas vs WebGL, per-chart tree-shaking) from inline size documentation

## Future Requirements

### v9.1

- **PERF-01**: Native `appendData` streaming path for Line/Area at 1M+ continuous points (advanced mode avoiding CRITICAL-03 `setOption` wipeout bug)
- **PERF-02**: Calendar heatmap mode (`mode="calendar"` on heatmap chart)
- **PERF-03**: Moving average computed column for streaming candlestick (real-time MA line update)

### v10.0+

- ECharts 6 + echarts-gl 3.x upgrade (blocked on echarts-gl 3.x release — no timeline announced)
- Geographic map chart (`lui-map-chart`) with GeoJSON support
- SSR SVG rendering with client rehydration (ECharts 5.5+ `ssr: true` mode)
- Waterfall chart mode on Bar component

## Out of Scope

| Feature | Reason |
|---------|--------|
| Built-in WebSocket / data fetching | Component cannot know auth, reconnect policy, or message format |
| `data="[...]"` attribute serialization | JSON.parse on large datasets is lossy and slow; property-only API |
| ECharts 6.x support | Blocked on echarts-gl 3.x (no release timeline as of 2026-02-28) |
| Geographic map chart | GeoJSON bundling strategy unresolved; deferred to v10+ |
| SSR chart rendering | ECharts canvas/WebGL cannot execute server-side |
| Waterfall chart | HIGH complexity, LOW demand; defer to v10+ |
| Exposing ECharts instance as reactive property | `getChart()` method with stability warning is the correct escape hatch |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 88 | Complete |
| INFRA-02 | Phase 88 | Complete |
| INFRA-03 | Phase 88 | Complete |
| INFRA-04 | Phase 88 | Complete |
| INFRA-05 | Phase 88 | Complete |
| CHART-01 | Phase 88 | Complete |
| CHART-02 | Phase 88 | Complete |
| CHART-03 | Phase 88 | Complete |
| CHART-04 | Phase 88 | Complete |
| CHART-05 | Phase 88 | Complete |
| STRM-01 | Phase 88 | Complete |
| STRM-02 | Phase 88 | Complete |
| STRM-03 | Phase 88 | Complete |
| STRM-04 | Phase 88 | Complete |
| LINE-01 | Phase 89 | Complete |
| LINE-02 | Phase 89 | Complete |
| LINE-03 | Phase 89 | Complete |
| AREA-01 | Phase 89 | Complete |
| AREA-02 | Phase 89 | Complete |
| BAR-01 | Phase 90 | Complete |
| BAR-02 | Phase 90 | Complete |
| BAR-03 | Phase 90 | Complete |
| PIE-01 | Phase 91 | Complete |
| PIE-02 | Phase 91 | Complete |
| PIE-03 | Phase 91 | Complete |
| SCAT-01 | Phase 92 | Complete |
| SCAT-02 | Phase 92 | Complete |
| SCAT-03 | Phase 92 | Complete |
| HEAT-01 | Phase 93 | Pending |
| HEAT-02 | Phase 93 | Pending |
| CNDL-01 | Phase 94 | Pending |
| CNDL-02 | Phase 94 | Pending |
| CNDL-03 | Phase 94 | Pending |
| CNDL-04 | Phase 94 | Pending |
| TREE-01 | Phase 95 | Pending |
| TREE-02 | Phase 95 | Pending |
| CLI-01 | Phase 96 | Pending |
| CLI-02 | Phase 96 | Pending |
| CLI-03 | Phase 96 | Pending |
| DOCS-01 | Phase 96 | Pending |
| DOCS-02 | Phase 96 | Pending |

**Coverage:**
- v9.0 requirements: 41 total
- Mapped to phases: 41 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-02-28 — Traceability populated by roadmapper (phases 88-96)*
