# Roadmap: LitUI

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-01-24)
- ✅ **v2.0 NPM + SSR** - Phases 6-20 (shipped 2026-01-25)
- ✅ **v3.0 Theme Customization** - Phases 21-24 (shipped 2026-01-25)
- ✅ **v3.1 Docs Dark Mode** - Phases 25-27 (shipped 2026-01-25)
- ✅ **v4.0 Form Inputs** - Phases 28-30 (shipped 2026-01-26)
- ✅ **v4.1 Select Component** - Phases 31-37 (shipped 2026-01-27)
- ✅ **v4.2 Form Controls** - Phases 38-41 (shipped 2026-01-27)
- ✅ **v4.3 Date/Time Components** - Phases 42-50 (shipped 2026-02-02)
- ✅ **v5.0 Overlay & Feedback** - Phases 51-55 (shipped 2026-02-02)
- ✅ **v6.0 Layout Components** - Phases 56-60 (shipped 2026-02-02)
- ✅ **v7.0 Data Table** - Phases 61-68 (shipped 2026-02-05)
- ✅ **v8.0 Design System Polish** - Phases 69-87 (shipped 2026-02-28)
- 🚧 **v9.0 Charts System** - Phases 88-96 (in progress)

## Phases

<details>
<summary>✅ v1.0 through v8.0 (Phases 1-87) - SHIPPED 2026-02-28</summary>

Phases 1-87 are archived. See:
- `.planning/milestones/v8.0-ROADMAP.md`
- `.planning/milestones/v7.0-ROADMAP.md` (v7.0 and earlier)

</details>

### 🚧 v9.0 Charts System (In Progress)

**Milestone Goal:** Add a complete high-performance chart suite — all major chart types powered by ECharts + ECharts GL, with WebGL rendering for millions of data points, real-time streaming, and the same CLI install UX as all other LitUI components.

#### Phase Checklist

- [x] **Phase 88: Package Foundation + BaseChartElement** - @lit-ui/charts package scaffolding, BaseChartElement with lifecycle management, ThemeBridge, SSR guard, streaming infrastructure (completed 2026-02-28)
- [x] **Phase 89: Line Chart + Area Chart** - Line and Area chart components with smooth/zoom/streaming support via pushData() (completed 2026-02-28)
- [x] **Phase 90: Bar Chart** - Bar chart with grouped, stacked, horizontal variants, value labels, and streaming (completed 2026-02-28)
- [x] **Phase 91: Pie + Donut Chart** - Pie and Donut chart components with slice merging, center label, and streaming (completed 2026-02-28)
- [x] **Phase 92: Scatter + Bubble Chart with WebGL** - Scatter/Bubble with enable-gl WebGL path for 500K+ point datasets (completed 2026-02-28)
- [x] **Phase 93: Heatmap Chart** - Cartesian heatmap with VisualMap color scale and streaming (completed 2026-02-28)
- [x] **Phase 94: Candlestick Chart** - OHLC candlestick with volume panel, moving averages, and streaming (completed 2026-03-01)
- [x] **Phase 95: Treemap Chart** - Hierarchical treemap with breadcrumb navigation and per-level colors
- [ ] **Phase 96: CLI Integration + Documentation** - CLI registry for all 8 chart types, subpath exports, copy-source templates, docs with demos and API tables

## Phase Details

### Phase 88: Package Foundation + BaseChartElement
**Goal**: Developer can install @lit-ui/charts and have every cross-cutting concern resolved — SSR safety, dark mode, CSS token theming, WebGL lifecycle, ResizeObserver, and streaming infrastructure — before any concrete chart component is built
**Depends on**: Phase 87 (v8.0 complete)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, CHART-01, CHART-02, CHART-03, CHART-04, CHART-05, STRM-01, STRM-02, STRM-03, STRM-04
**Success Criteria** (what must be TRUE):
  1. Developer can `npm install @lit-ui/charts` and import BaseChartElement without a `window is not defined` crash in Next.js or Astro SSR
  2. A chart component in an SSR framework renders a placeholder server-side and initializes ECharts client-side after hydration
  3. Developer can set `enable-gl` attribute and the chart dynamically loads echarts-gl; when WebGL is unavailable the chart falls back to Canvas and fires a `webgl-unavailable` event
  4. Chart colors, grid, axis, tooltip, and legend all update when `.dark` class is toggled on `document.documentElement` — no page reload required
  5. Developer can read `--ui-chart-color-1` through `--ui-chart-color-8` plus grid/tooltip/legend CSS custom properties and override any of them to retheme all charts globally
**Plans**: 3 plans

Plans:
- [x] 88-01-PLAN.md — Package scaffold: package.json, tsconfig.json, vite.config.ts, install deps
- [x] 88-02-PLAN.md — ThemeBridge (CSS token resolution) + canvas-core registry (ECharts module registration)
- [x] 88-03-PLAN.md — BaseChartElement (full lifecycle + streaming) + index.ts public API exports

### Phase 89: Line Chart + Area Chart
**Goal**: Developer can render production-quality line and area charts with multiple named series, smooth interpolation, zoom/pan, mark lines, and real-time streaming via pushData()
**Depends on**: Phase 88
**Requirements**: LINE-01, LINE-02, LINE-03, AREA-01, AREA-02
**Success Criteria** (what must be TRUE):
  1. Developer can pass a `data` prop with multiple named series and see a correctly labeled multi-series line chart
  2. Developer can set `smooth`, `zoom`, and `mark-lines` props and see curve interpolation, drag-to-zoom controls, and threshold mark lines rendered
  3. Developer can call `pushData(point)` on a line chart and see the series extend in real time without a full re-render flash
  4. Developer can render an area chart with `stacked` and `smooth` props and see filled areas that stack correctly across multiple series
  5. Multiple rapid `pushData()` calls within the same animation frame are batched into one ECharts update — observable via no dropped frames at 60fps streaming
**Plans**: 2 plans

Plans:
- [x] 89-01-PLAN.md — Shared option builder + line-registry + LuiLineChart component
- [x] 89-02-PLAN.md — LuiAreaChart component + index.ts public API exports

### Phase 90: Bar Chart
**Goal**: Developer can render grouped, stacked, and horizontal bar charts with value labels and streaming data updates via pushData()
**Depends on**: Phase 89
**Requirements**: BAR-01, BAR-02, BAR-03
**Success Criteria** (what must be TRUE):
  1. Developer can set `stacked` prop and see series bars stacked on a shared axis; set `horizontal` prop and see the axis orientation flip
  2. Developer can set `show-labels` and see value labels rendered on each bar; set `color-by-data` and see each bar receive a distinct palette color
  3. Developer can call `pushData(point)` on a bar chart and see the chart update via the circular buffer without full re-initialization
**Plans**: 2 plans

Plans:
- [x] 90-01-PLAN.md — bar-option-builder.ts (buildBarOption + types) + bar-registry.ts (registerBarModules)
- [x] 90-02-PLAN.md — LuiBarChart component + index.ts public API exports

### Phase 91: Pie + Donut Chart
**Goal**: Developer can render pie and donut charts with automatic small-slice merging, configurable donut hole and center label, and streaming data updates
**Depends on**: Phase 90
**Requirements**: PIE-01, PIE-02, PIE-03
**Success Criteria** (what must be TRUE):
  1. Developer can render a pie chart and set a `min-percent` threshold below which small slices are automatically merged into an "Other" segment
  2. Developer can render a donut chart with a configurable `inner-radius` and a `center-label` string displayed in the hollow center
  3. Developer can call `pushData(point)` on pie or donut chart and see proportions update without re-initialization
**Plans**: 2 plans

Plans:
- [x] 91-01-PLAN.md — pie-option-builder.ts (buildPieOption + types + small-slice merging) + pie-registry.ts (registerPieModules)
- [x] 91-02-PLAN.md — LuiPieChart component + index.ts public API exports

### Phase 92: Scatter + Bubble Chart with WebGL
**Goal**: Developer can render scatter and bubble charts at Canvas performance for standard datasets and at WebGL performance for 500K+ point datasets, with the same pushData() API for both paths
**Depends on**: Phase 91
**Requirements**: SCAT-01, SCAT-02, SCAT-03
**Success Criteria** (what must be TRUE):
  1. Developer can render a scatter chart and set `bubble` mode to add a third dimension driving point size
  2. Developer can add `enable-gl` attribute to a scatter chart with 500K+ points and see WebGL rendering engage with no visible change in the component API
  3. When WebGL is unavailable, the chart renders in 2D Canvas and dispatches a `webgl-unavailable` custom event the developer can listen to
  4. Developer can call `pushData(point)` on a scatter chart and the correct internal path (appendData for GL, circular buffer for Canvas) is used transparently
**Plans**: 2 plans

Plans:
- [x] 92-01-PLAN.md — echarts-gl type shim + _webglUnavailable protected + scatter-option-builder.ts + scatter-registry.ts
- [x] 92-02-PLAN.md — LuiScatterChart component + index.ts public API exports

### Phase 93: Heatmap Chart
**Goal**: Developer can render a Cartesian heatmap with configurable category axes, VisualMap color scale, and streaming cell value updates
**Depends on**: Phase 92
**Requirements**: HEAT-01, HEAT-02
**Success Criteria** (what must be TRUE):
  1. Developer can pass `x-categories`, `y-categories`, and `data` to a heatmap chart and see a color-coded cell matrix with the VisualMap legend
  2. Developer can configure `color-range` to change the min/max color endpoints of the VisualMap scale
  3. Developer can call `pushData(point)` on a heatmap to update individual cell values and see the color encoding update in place
**Plans**: 2 plans

Plans:
- [x] 93-01-PLAN.md — heatmap-option-builder.ts (HeatmapCell, HeatmapOptionProps, buildHeatmapOption) + heatmap-registry.ts (registerHeatmapModules)
- [x] 93-02-PLAN.md — LuiHeatmapChart component with pushData cell-update override + index.ts public API exports

### Phase 94: Candlestick Chart
**Goal**: Developer can render a financial candlestick chart from OHLC data with configurable bull/bear colors, optional volume panel, moving average overlays, and streaming new bars
**Depends on**: Phase 93
**Requirements**: CNDL-01, CNDL-02, CNDL-03, CNDL-04
**Success Criteria** (what must be TRUE):
  1. Developer can pass OHLC `[open, close, low, high]` data and configure `bull-color` and `bear-color` to see correctly colored candlestick bars
  2. Developer can set `show-volume` prop and see a volume bar panel rendered on a secondary y-axis below the main candlestick chart
  3. Developer can set `moving-averages` prop with period and color configuration and see SMA/EMA overlay lines computed from the OHLC data
  4. Developer can call `pushData(point)` to append a new OHLC bar and see the chart extend in real time
**Plans**: 2 plans

Plans:
- [x] 94-01-PLAN.md — candlestick-option-builder.ts (OhlcBar, MAConfig, CandlestickBarPoint, CandlestickOptionProps, buildCandlestickOption, SMA/EMA helpers) + candlestick-registry.ts (registerCandlestickModules)
- [x] 94-02-PLAN.md — LuiCandlestickChart component with pushData override + index.ts public API exports

### Phase 95: Treemap Chart
**Goal**: Developer can render a treemap from hierarchical data with breadcrumb navigation, rounded cells, and per-level color configuration
**Depends on**: Phase 94
**Requirements**: TREE-01, TREE-02
**Success Criteria** (what must be TRUE):
  1. Developer can pass `{ name, value, children[] }` hierarchical data and see a correctly proportioned space-filling treemap
  2. Developer can click into a parent node and see breadcrumb navigation appear; developer can click breadcrumbs to navigate back up the hierarchy
  3. Developer can configure `rounded`, `breadcrumb`, and `level-colors` props and see the visual output update accordingly
**Plans**: 2 plans

Plans:
- [x] 095-01-PLAN.md — treemap-option-builder.ts (TreemapNode, TreemapOptionProps, buildTreemapOption) + treemap-registry.ts (registerTreemapModules)
- [x] 095-02-PLAN.md — LuiTreemapChart component + index.ts Phase 95 exports

### Phase 96: CLI Integration + Documentation
**Goal**: Developer can install any of the 8 chart types via the CLI, import individual charts via subpath exports for tree-shaking, and reference complete interactive docs with API tables and bundle size guidance
**Depends on**: Phase 95
**Requirements**: CLI-01, CLI-02, CLI-03, DOCS-01, DOCS-02
**Success Criteria** (what must be TRUE):
  1. Developer can run `npx lit-ui add line-chart` (and all 7 other chart names) and receive a working copy-source starter template
  2. Developer can import `@lit-ui/charts/line-chart` as a subpath export and their bundler tree-shakes all other chart modules out of the output
  3. Each of the 8 chart types has a docs page with an interactive live demo, complete property API table, and CSS token table
  4. Docs include a bundle size section documenting Canvas vs WebGL impact and per-chart tree-shaking sizes so developers can make informed import decisions
**Plans**: TBD

## Progress

**Execution Order:** 88 → 89 → 90 → 91 → 92 → 93 → 94 → 95 → 96

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 88. Package Foundation + BaseChartElement | 3/3 | Complete    | 2026-02-28 | - |
| 89. Line Chart + Area Chart | 2/2 | Complete    | 2026-02-28 | - |
| 90. Bar Chart | 2/2 | Complete    | 2026-02-28 | - |
| 91. Pie + Donut Chart | 2/2 | Complete    | 2026-02-28 | - |
| 92. Scatter + Bubble Chart with WebGL | 2/2 | Complete    | 2026-02-28 | - |
| 93. Heatmap Chart | 2/2 | Complete    | 2026-02-28 | - |
| 94. Candlestick Chart | 2/2 | Complete    | 2026-03-01 | - |
| 95. Treemap Chart | 2/2 | Complete    | 2026-03-01 | - |
| 96. CLI Integration + Documentation | v9.0 | 0/TBD | Not started | - |
