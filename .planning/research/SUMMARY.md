# Project Research Summary

**Project:** @lit-ui/charts v9.0
**Domain:** WebGL-accelerated chart web component library (ECharts + Lit.js)
**Researched:** 2026-02-28
**Confidence:** HIGH

## Executive Summary

The @lit-ui/charts v9.0 package adds eight chart types (line, area, bar, scatter/bubble, pie/donut, heatmap, candlestick, treemap) to the existing LitUI component library as a standalone opt-in package. The standard approach for wrapping ECharts in a web component library mirrors what vue-echarts does: manage lifecycle concerns (init, resize, dispose, dark mode, SSR) in a shared base class, expose the full ECharts `option` object as the primary prop for power users, and layer typed convenience props on top for common cases. Each chart component tree-shakes its own ECharts modules via `echarts/core` plus selective `echarts.use()` calls — the full import (`import * as echarts from 'echarts'`) is forbidden in production code, as it imports ~300-400KB gzipped versus ~135KB gzipped for a tree-shaken single chart type.

The critical stack constraint for v9.0 is that ECharts must be pinned to 5.6.0, not the npm `latest` (6.0.0). ECharts GL 2.0.9 — the only published WebGL extension — declares `"echarts": "^5.1.2"` as its peer dependency and has no 3.x release compatible with ECharts 6 (as of 2026-02-28). WebGL acceleration is only justified for scatter/line charts with 500K+ data points; all other chart types stay on Canvas. The WebGL path is further constrained by the browser's ~16 simultaneous WebGL context limit, which requires explicit `WEBGL_lose_context` teardown during disposal, not just `chart.dispose()`.

The five critical pitfalls discovered in research — zero-dimension init timing, WebGL context exhaustion, `appendData`/`setOption` incompatibility, SSR crashes from top-level ECharts imports, and Shadow DOM event retargeting — must all be addressed in Phase 1's `BaseChartElement` before any individual chart type is built. Every one of these pitfalls is either invisible until late in development or requires an architectural rewrite to fix after the fact. Establishing the base class correctly is the highest-leverage action in the entire project.

## Key Findings

### Recommended Stack

ECharts 5.6.0 is the required version — not 6.0.0 — because ECharts GL 2.0.9 (the WebGL extension) only supports ECharts 5.x. This is documented as a known constraint with a clear upgrade trigger: when echarts-gl releases a 3.x version targeting ECharts 6, both packages should be upgraded together. ECharts ships its own TypeScript types (no `@types/echarts` needed), is Apache 2.0 licensed, and provides comprehensive ESM tree-shaking via `echarts/core`. echarts-gl must be treated as an optional peer dependency, loaded exclusively via dynamic `import('echarts-gl')` inside lifecycle methods, never as a static top-level import. The GL bundle is non-tree-shakeable (~500-600KB gzipped) and must never appear in the main chunk of 2D-only chart consumers.

**Core technologies:**
- `echarts@^5.6.0`: Chart engine (Canvas/SVG, 40+ types, theming, streaming) — only stable version compatible with echarts-gl 2.x; built-in TypeScript types; full ESM tree-shaking via `echarts/core`
- `echarts-gl@^2.0.9`: WebGL acceleration for scatter/line at 500K+ data points — optional peer dep; dynamically imported only when `enable-gl` attribute is set; no granular tree-shaking available
- `lit@^3.3.2` (peer): Web component base framework — chart base class extends `TailwindElement` from `@lit-ui/core`, same as all other library packages
- `vite@^7.3.1` / `vite-plugin-dts@^4.5.4`: Build tooling — uses existing `@lit-ui/vite-config` workspace package; per-chart subpath exports via separate entry points

### Expected Features

**Must have (table stakes) — all 8 chart types at v9.0 launch:**
- All 8 chart components with `data`, `loading`, and `option` escape-hatch props
- ResizeObserver on the shadow root container (not `window.resize`) — inherited from `BaseChartElement`
- Proper `disconnectedCallback` disposal: `loseContext()` then `dispose()` then null assignment then `resizeObserver.disconnect()`
- Dark mode via `getComputedStyle` CSS token re-reading triggered by MutationObserver on `document.documentElement`
- CSS token system: `--ui-chart-color-1..8`, `--ui-chart-grid-*`, `--ui-chart-tooltip-*`
- ECharts tree-shaking per component — each chart registers only its own modules via `echarts.use()`
- `getChart()` raw instance escape hatch for ECharts event binding and advanced customization
- SSR safety: dynamic ECharts import inside `firstUpdated()` guarded by `isServer`
- `zoom` prop (dataZoom) on Line, Area, Bar, Scatter, Candlestick
- CLI integration: `npx lit-ui add line-chart` (and all 7 others)
- Tooltip on hover, legend toggle, loading/empty states

**Should have (differentiators) — target v9.1:**
- `pushData(point)` / `pushDataset(points[])` imperative streaming API with RAF batching and circular buffer — for IoT/monitoring dashboards
- WebGL mode via `enable-gl` attribute on Line, Scatter, Area — dynamic import of echarts-gl with Canvas fallback when WebGL is unavailable
- Moving average overlays on Candlestick (SMA/EMA computed from OHLC data in `willUpdate()`)
- Calendar heatmap mode (`mode="calendar"` prop switching to ECharts `calendar` component)

**Defer (v10+):**
- ECharts 6.x integration (blocked on echarts-gl 3.x release — no timeline announced)
- Geographic map chart (`lui-map-chart`) — requires GeoJSON bundling strategy decision
- SSR SVG rendering with client rehydration (ECharts 5.5 `ssr: true` mode) — complex, out of v9.0 scope
- Waterfall chart mode on Bar — HIGH implementation complexity, LOW user value currently
- Drilldown animation on Pie (ECharts 5.5 groupId feature)

**Anti-features (never implement):**
- Attribute-serialized `data` property (`data="[...]"`) — attributes are strings; JSON.parse on large datasets is lossy and slow
- Built-in WebSocket management — component cannot know authentication, reconnect policy, or message format
- Exposing raw ECharts instance as a public reactive property — `getChart()` method with stability warning is the correct escape hatch
- Full ECharts import in any component file — defeats tree-shaking and bloats every consumer bundle

### Architecture Approach

The architecture uses an abstract `BaseChartElement` class (extending the project's existing `TailwindElement`) that owns the ECharts instance lifecycle, ResizeObserver, ThemeBridge, SSR guard, and the option/loading prop update cycle. Each of the nine concrete chart components (including `LuiDonutChart` as a variant of pie) extends this base, registers only the ECharts modules it needs via a per-chart registry file, and implements chart-specific props. echarts-gl is loaded via a single async dynamic import in `BaseChartElement._maybeLoadGl()`, gated on the `enable-gl` attribute, before `echarts.init()` runs. The package structure mirrors the other `@lit-ui/x` packages with one directory per chart type under `src/`.

**Major components:**
1. `BaseChartElement` (`src/base/base-chart-element.ts`) — ECharts init/dispose lifecycle, ResizeObserver management, `option`/`loading`/`enableGl` props, `getChart()` escape hatch, isServer SSR guard
2. `ThemeBridge` (`src/base/theme-bridge.ts`) — reads `--ui-chart-*` CSS tokens via `getComputedStyle(this).getPropertyValue()`, builds ECharts theme object, observes `document.documentElement` class changes for dark mode re-theming
3. Per-chart registry files (`src/registry/[type]-registry.ts`) — `echarts.use([ChartType, ...components])` calls registering only what each chart needs
4. Nine chart component classes (`src/[type]/lui-[type]-chart.ts`) — each defines chart-specific props (e.g., `stacked`, `horizontal`, `smooth`, `zoom`, `bull-color`, `bear-color`) and calls base class methods
5. Package index and subpath exports: `src/index.ts` re-exports all components; per-chart subpath exports (`@lit-ui/charts/line-chart`) for granular consumer bundling

### Critical Pitfalls

1. **Zero-dimension init (CRITICAL-01)** — `echarts.init()` reads container dimensions at call time. If the shadow root container has not yet received browser layout, both width and height are 0 and ECharts silently renders blank forever. Fix: wrap `echarts.init()` in `await this.updateComplete` followed by `requestAnimationFrame()`. Also set `:host { display: block; height: var(--ui-chart-height, 300px); }` to guarantee non-zero layout before init fires.

2. **WebGL context exhaustion (CRITICAL-02)** — Browsers allow ~16 simultaneous WebGL contexts per page. `chart.dispose()` alone does not promptly release the GPU context. Fix: before `dispose()`, iterate canvas elements and call `gl.getExtension('WEBGL_lose_context')?.loseContext()`. Cap simultaneous GL chart instances to 8 and document this constraint prominently on the `enable-gl` API.

3. **SSR crash from top-level ECharts import (CRITICAL-04)** — ECharts accesses `window` at module evaluation time (not just during `init()`), crashing the entire `@lit-labs/ssr` pipeline with `ReferenceError: window is not defined`. Fix: never statically import `echarts` or `echarts-gl` at the top of any component file. Use dynamic `import('echarts/core')` inside `firstUpdated()`, which never fires during SSR.

4. **appendData + setOption data wipeout (CRITICAL-03)** — Any `setOption()` call after `appendData()` has loaded data silently clears all streamed data (confirmed ECharts bug since v4.6.0, GitHub Issue #12327, unresolved). Fix: establish a strict architectural boundary — initial chart configuration via one `setOption()` call at init; all subsequent streaming via `appendData()` only. Never call `setOption()` after streaming begins on the same series.

5. **CSS tokens not resolved in ECharts canvas (HIGH-05)** — `var(--ui-color-primary)` passed as a color string to ECharts option is treated as a literal invalid color by the Canvas 2D API. ECharts explicitly does not support CSS custom properties (GitHub Issue #16044). Fix: `ThemeBridge._readToken(name, fallback)` uses `getComputedStyle(this).getPropertyValue(name)` to resolve tokens to hex/rgb values before building the ECharts theme object. All token reads must have non-empty fallback values.

## Implications for Roadmap

Based on research, all five critical pitfalls and the four high-severity architectural decisions (tree-shaking strategy, SSR import pattern, disposal pattern, ThemeBridge) converge on Phase 1. The remaining phases follow the natural dependency and complexity order identified in ARCHITECTURE.md's recommended build sequence.

### Phase 1: Package Foundation + BaseChartElement

**Rationale:** Every pitfall classified as CRITICAL or HIGH maps directly to "Phase to address: Phase 1" in the pitfalls research. The base class owns every cross-cutting concern. Building it correctly before any concrete chart type is the single highest-leverage action in the project. Retrofitting a broken base after 8 chart types exist would require touching every component file.

**Delivers:**
- `@lit-ui/charts` package scaffolding (package.json with `echarts@^5.6.0` as dep and `echarts-gl@^2.0.9` as optional peer dep, tsconfig, vite config)
- `BaseChartElement` with `firstUpdated` init pattern (`await updateComplete` + `requestAnimationFrame`), full `disconnectedCallback` cleanup chain (`loseContext()` then `dispose()` then null then `resizeObserver.disconnect()`), `echarts.getInstanceByDom()` double-init guard
- `ThemeBridge` reading `--ui-chart-*` CSS tokens via `getComputedStyle`, MutationObserver for dark mode re-theming
- Dynamic import pattern for ECharts — no static top-level imports anywhere (SSR safety)
- `enable-gl` attribute plus `_maybeLoadGl()` dynamic import of echarts-gl
- WebGL feature detection with graceful Canvas fallback and `webgl-unavailable` custom event
- Shadow DOM layout pattern (`:host { display: block; position: relative; }` with `#chart { position: absolute; inset: 0; }`) for correct pointer event hit-testing
- `option`, `loading`, `updateOptions`, `autoResize`, `enableGl` props and `getChart()` escape hatch

**Avoids:** CRITICAL-01, CRITICAL-02, CRITICAL-04, HIGH-01, HIGH-02, HIGH-04, HIGH-05, HIGH-06, MEDIUM-02, MEDIUM-05

### Phase 2: Line Chart + Area Chart

**Rationale:** Simplest 2D chart types with the highest user demand. This phase must also establish the streaming architecture and the `appendData`/`setOption` boundary before that pattern proliferates into multiple chart types. Area chart is a thin variant (line + `areaStyle`) and should be built in the same phase to share the implementation.

**Delivers:**
- `LuiLineChart` and `LuiAreaChart` with `data`, `smooth`, `zoom`, `markLines` props
- `pushData(seriesIndex, point)` method with RAF coalescing, `maxPoints` circular buffer, and `animation: false` default for streaming
- Strict `appendData`/`setOption` boundary established in base class with unit test coverage
- `line-registry.ts` registering only `LineChart`, `GridComponent`, `TooltipComponent`, `LegendComponent`, `DataZoomComponent`

**Avoids:** CRITICAL-03 (appendData/setOption wipeout), HIGH-03 (real-time update rate overload), MEDIUM-01 (notMerge: true as default), MEDIUM-03 (appendData/dataset incompatibility)

### Phase 3: Bar Chart

**Rationale:** Categorical data is the most common business chart use case after line/area. Establishes `stacked`, `horizontal`, `showLabels`, `colorByData` prop patterns. No streaming, no WebGL — straightforward Canvas-only component.

**Delivers:**
- `LuiBarChart` with `stacked`, `horizontal`, `show-labels`, `color-by-data`, `zoom` props
- Grouped, stacked, horizontal, and 100%-normalized bar variants
- Rounded bar ends and background bars via ECharts native options
- `bar-registry.ts` registering `BarChart`, `GridComponent`, `DataZoomComponent`

### Phase 4: Pie Chart + Donut Chart

**Rationale:** Polar coordinate system differs from Cartesian charts built in Phases 2-3. Building together validates that ThemeBridge applies correctly to non-Cartesian color schemes. Donut is a trivial variant (`radius: ['40%', '70%']`) and warrants its own element name for consumer ergonomics.

**Delivers:**
- `LuiPieChart` and `LuiDonutChart` with `data`, `inner-radius`, `center-label`, `rose`, `shape`, `gap` (padAngle) props
- Slice threshold merging (slices below `minPercent` collapsed into "Other") computed in `willUpdate()`
- Legend with percentages via `legend.formatter`
- `pie-registry.ts` registering `PieChart` only — no Cartesian components needed

### Phase 5: Scatter Chart + Bubble Chart (with WebGL path)

**Rationale:** This is where the `enable-gl` dynamic import path is proven in a concrete chart component. Scatter GL for 500K+ points is the primary WebGL use case for the library. Must validate WebGL feature detection, graceful Canvas fallback, `loseContext` disposal, and that echarts-gl is completely absent from the 2D scatter bundle (verified via bundle analyzer).

**Delivers:**
- `LuiScatterChart` with `data`, `bubble`, `color-dimension`, `zoom`, `brush`, `progressive` props
- `enable-gl` attribute activating dynamic echarts-gl import (`ScatterGLChart` + density blending mode via `blendMode: 'lighter'`)
- WebGL unavailability fallback: `webgl-unavailable` custom event plus 2D Canvas fallback render
- Bundle analyzer verification confirming echarts-gl is absent from non-GL chart chunks

**Avoids:** CRITICAL-02 (WebGL context budget), HIGH-02 (bundle contamination from echarts-gl), HIGH-06 (WebGL unavailable — no fallback), MEDIUM-05 (echarts-gl tree-shaking limitation)

### Phase 6: Heatmap Chart

**Rationale:** Cartesian heatmap introduces `VisualMapComponent` (color scale), which is new to the component registry. Calendar heatmap mode is deferred to v9.1 — v9.0 ships Cartesian heatmap only. `animation: false` is the correct default here because cell transitions on matrix data are visually jarring.

**Delivers:**
- `LuiHeatmapChart` with `data`, `x-categories`, `y-categories`, `color-range`, `color-scale`, `show-labels`, `square-cells`, `null-color` props
- `heatmap-registry.ts` registering `HeatmapChart` plus `VisualMapComponent`

### Phase 7: Candlestick Chart

**Rationale:** Most specialized data format (OHLC array per item), requires `DataZoomComponent` and crosshair tooltip (`axisPointer.type: 'cross'`). Financial chart users expect `zoom` to always be enabled by default. Build late in the 2D chart sequence where the full prop vocabulary is well established.

**Delivers:**
- `LuiCandlestickChart` with `data` (OHLC format), `bull-color`, `bear-color`, `show-volume`, `log-scale`, `zoom` (default true) props
- Crosshair tooltip configured by default
- `moving-averages` prop (`[{ period: 20, color: '...' }]`) — MA series computed from OHLC data in `willUpdate()`
- `candlestick-registry.ts` registering `CandlestickChart`, `BarChart` (for volume secondary axis), `DataZoomComponent`

### Phase 8: Treemap Chart

**Rationale:** Hierarchical/nested data shape is unlike all previous charts. No axes. Space-filling rect-packing layout. Fewest cross-chart dependencies. Natural last position in the chart build sequence before CLI integration.

**Delivers:**
- `LuiTreemapChart` with `data` (nested `{ name, value, children[] }` format), `color-dimension`, `color-range`, `breadcrumb`, `rounded`, `level-colors` props
- `animation: false` default (re-layout on update is computationally expensive and visually confusing)
- Label overflow truncation below minimum cell size threshold
- `treemap-registry.ts` registering `TreemapChart` only

### Phase 9: CLI Integration + Documentation

**Rationale:** All 8 chart types exist as working components with stable APIs. CLI registry and copy-source templates can now be added without API churn risk. Documentation requires working interactive demos.

**Delivers:**
- CLI registry entries for all 8 chart types (`npx lit-ui add line-chart` and all others)
- Copy-source starter shells for each chart type (charts are complex enough to warrant them vs. blank stubs)
- Complete `--ui-chart-*` CSS token reference table
- Per-chart subpath exports in `package.json` (`@lit-ui/charts/line-chart`, etc.)
- Bundle size documentation in README so consumers understand what they are importing

### Phase Ordering Rationale

- **Foundation before anything (Phase 1):** All 5 CRITICAL pitfalls must be solved in the base class before any concrete chart exists. These pitfalls are architectural, not additive — they cannot be fixed incrementally across 8 components later.
- **Simplest chart type first (Phase 2 — Line/Area):** Establishes the complete component pattern (props, registry, option build) and the streaming architecture that subsequent charts reference.
- **Canvas-only charts before WebGL (Phases 2-4, 6-8 before Phase 5):** Validates base class and ThemeBridge correctness without the GL complexity layer. Phase 5 (Scatter) introduces GL only after the Canvas pattern is proven.
- **Pie before Scatter (Phase 4 before 5):** Non-Cartesian coordinate system validation in Phase 4 confirms ThemeBridge works across coordinate systems before adding WebGL complexity in Phase 5.
- **Treemap last among charts (Phase 8):** Hierarchical data model is most unlike other charts; no dependencies on other chart types; safest to defer.
- **CLI last (Phase 9):** Requires stable component APIs. Premature CLI entries lock API surface before components are mature.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 1 (BaseChartElement — SSR dynamic import):** The recommended pattern avoids top-level `import * as echarts from 'echarts/core'` for SSR safety, but TypeScript still needs the types. The exact interaction between static type-only imports, dynamic value imports, `isServer`, and `@lit-labs/ssr` in this project's specific setup needs validation before implementation begins.
- **Phase 2 (Streaming architecture):** The `appendData`/`setOption` boundary and RAF coalescing are documented patterns, but the interaction between the circular buffer implementation and `lazyUpdate: true` at 50ms update intervals needs benchmarking. The branching logic for Canvas vs. GL scatter in `pushData()` (to avoid CRITICAL-03 at 1M+ points) requires careful design.
- **Phase 5 (Scatter GL — TypeScript types):** echarts-gl 2.0.9 type definitions may not be organized as subpath exports compatible with `import('echarts-gl/charts')`. May require declaration file shims or `@ts-ignore` annotations for the dynamic import path.

Phases with standard patterns (skip research-phase):

- **Phase 3 (Bar):** Well-documented ECharts `BarChart` with straightforward prop mapping. No novel integration concerns.
- **Phase 4 (Pie/Donut):** `PieChart` is the simplest ECharts option shape. `donut` is a single `radius` array change. Established pattern.
- **Phase 6 (Heatmap):** `HeatmapChart` plus `VisualMapComponent` is a documented ECharts combination. New component registration but no new architectural concerns.
- **Phase 7 (Candlestick):** Financial chart with known ECharts OHLC format. Moving average computation is straightforward array reduction.
- **Phase 8 (Treemap):** Hierarchical data with no novel integration concerns. ECharts handles rect-packing natively.
- **Phase 9 (CLI):** Follows established CLI registry pattern from all other LitUI packages.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | ECharts 5.6.0 vs 6.0.0 decision verified from official GitHub peerDependency inspection; tree-shaking patterns from official ECharts handbook; TypeScript types from npm package inspection; bundle sizes from official docs |
| Features | HIGH | Feature set verified against ECharts official docs, echarts-gl GitHub, vue-echarts reference implementation (official ecomfe project), and existing community Lit+ECharts wrappers |
| Architecture | HIGH | Lifecycle patterns (firstUpdated, disconnectedCallback) verified from official Lit docs plus DEV community ECharts+Lit articles; option API design modeled on vue-echarts (official ecomfe reference implementation) |
| Pitfalls | HIGH | All 5 critical pitfalls sourced from confirmed Apache ECharts GitHub issues (linked by issue number), Lit GitHub issues, Khronos WebGL specs, and MDN documentation |

**Overall confidence:** HIGH

### Gaps to Address

- **ECharts module dynamic import + TypeScript types:** The recommended pattern uses `await import('echarts/core')` inside `firstUpdated()` to avoid SSR crashes. TypeScript type inference for dynamically imported modules can require static type-only imports (`import type`) alongside the dynamic value import. The exact approach needs validation against the project's tsconfig `moduleResolution` and `isolatedModules` settings before Phase 1 implementation begins.

- **echarts-gl TypeScript types in dynamic import:** echarts-gl 2.0.9 may not ship type definitions as subpath exports matching `import('echarts-gl/charts')`. May require a declaration file shim or `@ts-ignore` for the GL dynamic import path. Verify before Phase 5.

- **Dark mode re-theme implementation detail:** Research identifies two technically valid approaches — `echarts.registerTheme()` plus dispose-and-reinit with the new theme name (expensive, causes flicker), or `setOption()` with new color arrays (incremental, but only updates colors not the full theme object). The correct approach for this project's use case needs an implementation decision during Phase 1.

- **echarts-gl 3.x monitoring:** There is no official echarts-gl release for ECharts 6 as of 2026-02-28. GitHub issues tracker has open PRs but no merge timeline. Pin monitoring of the [ecomfe/echarts-gl releases](https://github.com/ecomfe/echarts-gl/releases) page — the ECharts 5.x pin should be upgraded to ECharts 6 as soon as a compatible echarts-gl is available.

- **appendData for WebGL scatter at 1M+ points:** The `pushData()` method must internally use `appendData` for GL scatter (Canvas path can use `setOption` with the circular buffer). This internal branching logic must be encapsulated so consumers see a uniform `pushData()` API regardless of renderer, while avoiding CRITICAL-03 on the GL path.

## Sources

### Primary (HIGH confidence)

- [Apache ECharts GitHub Releases](https://github.com/apache/echarts/releases) — v5.6.0 vs v6.0.0 version decision
- [ecomfe/echarts-gl GitHub](https://github.com/ecomfe/echarts-gl) — v2.0.9 peerDep `"echarts": "^5.1.2"` confirmed; no v3.x released
- [ECharts Import Handbook](https://apache.github.io/echarts-handbook/en/basics/import/) — tree-shaking patterns, CanvasRenderer vs SVGRenderer, TypeScript ComposeOption
- [ECharts Server-Side Rendering Handbook](https://apache.github.io/echarts-handbook/en/how-to/cross-platform/server/) — SSR init pattern and placeholder approach
- [ECharts Dynamic Data Handbook](https://apache.github.io/echarts-handbook/en/how-to/data/dynamic-data/) — `appendData` limitations and `setOption` merge semantics
- [ECharts Chart Container and Size Handbook](https://apache.github.io/echarts-handbook/en/concepts/chart-size/) — zero-dimension init issue
- [Apache ECharts GitHub Issue #12327](https://github.com/apache/echarts/issues/12327) — `setOption` clears data after `appendData`
- [Apache ECharts GitHub Issue #20475](https://github.com/apache/echarts/issues/20475) — `window is not defined` in Next.js SSR
- [Apache ECharts GitHub Issue #16044](https://github.com/apache/echarts/issues/16044) — CSS variables not supported in canvas context
- [ECharts GL GitHub Issue #253](https://github.com/ecomfe/echarts-gl/issues/253) — WebGL context exhaustion plus `loseContext` workaround
- [ecomfe/vue-echarts](https://github.com/ecomfe/vue-echarts) — reference implementation for option API design (official ecomfe project)
- [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/) — `firstUpdated` behavior during SSR, Declarative Shadow DOM hydration
- [Khronos WebGL Wiki — Handling Context Lost](https://www.khronos.org/webgl/wiki/HandlingContextLost) — `WEBGL_lose_context` extension pattern
- [MDN ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) — Shadow DOM resize observation

### Secondary (MEDIUM confidence)

- [DEV Community: ECharts + Lit + TypeScript](https://dev.to/manufac/using-apache-echarts-with-lit-and-typescript-1597) — lifecycle pattern: `firstUpdated` init, `updated` setOption, `disconnectedCallback` dispose
- [GitHub: cherie-xf/lit-echarts](https://github.com/cherie-xf/lit-echarts) — existing Lit+ECharts wrapper reference implementation
- [Medium: ECharts Memory Leak from Dispose](https://medium.com/@kelvinausoftware/memory-leak-from-echarts-occurs-if-not-properly-disposed-7050c5d93028) — `dispose()` plus null pattern requirement
- [DEV Community: ECharts bundle size optimization](https://dev.to/manufac/using-apache-echarts-with-react-and-typescript-optimizing-bundle-size-29l8) — tree-shaking bundle reduction measurements
- [ECharts Streaming/Scheduling DeepWiki](https://deepwiki.com/apache/echarts/2.4-streaming-and-scheduling) — internal streaming architecture

### Tertiary (LOW confidence — directional only)

- [Canvas vs WebGL Performance: SVG Genie](https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025) — 10x-20x WebGL advantage at 100K+ points (benchmarks should be verified in context)
- [Real-Time Dashboard WebGL vs Canvas: Dev3lop](https://dev3lop.com/real-time-dashboard-performance-webgl-vs-canvas-rendering-benchmarks/) — init latency comparison (directional only)

---
*Research completed: 2026-02-28*
*Ready for roadmap: yes*
