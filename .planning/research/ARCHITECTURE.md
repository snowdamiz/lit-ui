# Architecture Research: v9.0 Charts System (ECharts + Lit)

**Domain:** ECharts integration into Lit.js web components for @lit-ui/charts
**Researched:** 2026-02-28
**Confidence:** HIGH (lifecycle, Shadow DOM, SSR, option API) / MEDIUM (GL strategy)

---

## Critical Pre-Decision: ECharts Version

**Use ECharts 5.6.0, not 6.0.0.**

ECharts 6.0.0 is the npm `latest` tag, but `echarts-gl@2.x` (the WebGL extension) has a peer dependency of `echarts: "^5.1.2"` and was last released August 2024 (v2.0.9). Two PRs are open as of February 2026 to fix GL compatibility with ECharts 6, but neither is merged yet.

| Package | Version to use | Reason |
|---------|----------------|--------|
| `echarts` | `^5.6.0` | Last stable 5.x; GL-compatible |
| `echarts-gl` | `^2.0.9` | Requires echarts ^5.1.2 |

Pin ECharts 5 explicitly in the package. When echarts-gl releases a 6.x-compatible version, upgrade both together. ECharts 5's core API (`init`, `setOption`, `dispose`, `getInstanceByDom`) is unchanged in 6.x, so the upgrade path is low-risk.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Consumer Application                             │
│  <lui-line-chart .option=${...} />                                   │
│  <lui-scatter-chart .option=${...} enable-gl />                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                    @lit-ui/charts Package                            │
│                                                                      │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ lui-line     │  │ lui-bar  │  │lui-scatter│  │  lui-pie     │    │
│  │ lui-area     │  │          │  │lui-bubble │  │  lui-donut   │    │
│  └──────┬───────┘  └────┬─────┘  └─────┬────┘  └──────┬───────┘    │
│         │               │              │              │             │
│  ┌──────┴───────────────┴──────────────┴──────────────┴───────┐    │
│  │                  BaseChartElement (LitElement)               │    │
│  │  - ECharts init/dispose lifecycle                           │    │
│  │  - ResizeObserver management                                │    │
│  │  - Theme bridge (CSS vars → registerTheme)                  │    │
│  │  - isServer guard (SSR no-op)                               │    │
│  │  - option passthrough + setOption update management         │    │
│  └─────────────────────────┬───────────────────────────────────┘    │
│                             │                                        │
│  ┌──────────────────────────▼─────────────────────────────────┐     │
│  │                    echarts-registry.ts                       │     │
│  │  - Central echarts.use([...]) registrations per chart type  │     │
│  │  - CanvasRenderer + LabelLayout + UniversalTransition        │     │
│  │  - Chart-specific: LineChart, BarChart, etc.                 │     │
│  └──────────────────────────┬─────────────────────────────────┘     │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
         ┌────────────────────┴──────────────────┐
         │                                        │
┌────────▼──────────┐               ┌─────────────▼──────────┐
│   echarts@5.6.0   │               │  echarts-gl@2.0.9       │
│   (always loaded) │               │  (dynamic import,       │
│                   │               │   opt-in per chart)     │
└───────────────────┘               └────────────────────────┘
```

---

## Question 1: Lifecycle — init / dispose in Lit

**Recommendation: init in `firstUpdated`, dispose in `disconnectedCallback`, guard with `isServer`.**

Lit's `firstUpdated()` is called once, after the component's initial render, when the shadow DOM is attached and the container `<div>` is in the real DOM. This is the correct place to call `echarts.init()`. Using `connectedCallback` directly risks firing before shadow DOM children exist; using `updated()` for init risks re-initializing on every property change.

```typescript
import { LitElement, html, PropertyValues } from 'lit';
import { isServer } from 'lit';
import * as echarts from 'echarts/core';
import type { ECharts } from 'echarts/core';

export abstract class BaseChartElement extends LitElement {
  private _chart?: ECharts;
  private _resizeObserver?: ResizeObserver;

  protected firstUpdated(_changedProps: PropertyValues): void {
    // isServer guard: firstUpdated does not fire during SSR, but
    // belt-and-suspenders guard prevents issues with future Lit changes.
    if (isServer) return;
    this._initChart();
  }

  private _initChart(): void {
    const container = this.shadowRoot?.querySelector<HTMLDivElement>('#chart');
    if (!container) return;

    // Guard: dispose stale instance if DOM was reused (e.g. moved via moveBefore())
    const existing = echarts.getInstanceByDom(container);
    if (existing) existing.dispose();

    this._chart = echarts.init(container, this._resolvedTheme, {
      renderer: 'canvas',
    });

    this._resizeObserver = new ResizeObserver(() => {
      this._chart?.resize();
    });
    this._resizeObserver.observe(container);

    // Apply initial option
    if (this.option) {
      this._chart.setOption(this.option);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._chart?.dispose();
    this._chart = undefined;
  }
}
```

**Why `firstUpdated` over `connectedCallback`:**
- `connectedCallback` fires before shadow DOM is rendered — `this.shadowRoot.querySelector('#chart')` returns null.
- `firstUpdated` is Lit-specific and fires after the first `render()` call completes.
- `updated()` is correct for re-applying options on property changes, not for init.

**connectedCallback move-gotcha:** If a DOM node is moved via `moveBefore()` (Chrome 133+), `disconnectedCallback` + `connectedCallback` fire but `firstUpdated` does not fire again. Guard re-init with `echarts.getInstanceByDom()` check.

---

## Question 2: Shadow DOM — Does ECharts Need a Node Outside Shadow Root?

**No. ECharts works inside Shadow DOM when given the container div directly.**

ECharts `init()` accepts any `HTMLElement` — it does not use `document.getElementById` internally. Passing `this.shadowRoot.querySelector('#chart')` works correctly.

The only real issue is **width/height = 0** at init time. If the chart container has no explicit dimensions when `firstUpdated` fires, ECharts logs a warning and renders blank. Two mitigations:

1. Give the host element `display: block` and `min-height` via `:host` CSS — this ensures the container has non-zero dimensions before ECharts measures it.
2. Use `ResizeObserver` — even if the initial size is 0, the observer fires as soon as the layout is complete, triggering `resize()`.

```css
/* In BaseChartElement styles */
:host {
  display: block;   /* custom elements are inline by default */
  min-height: 300px;
}
#chart {
  width: 100%;
  height: 100%;
}
```

**Shadow DOM does NOT require a node outside the shadow root.** The canvas element is rendered inside the shadow root's `#chart` div. ECharts manages its own internal canvas creation from the provided container.

**Shadow DOM CSS isolation note:** ECharts injects its own `<canvas>` and tooltip DOM. The tooltip DOM is injected as a sibling `<div>` inside the container — it stays inside the shadow root, which means global CSS cannot accidentally style it. ECharts tooltip styling must be done via the `option.tooltip.extraCssText` property or ECharts' own theme object, not via external stylesheets.

---

## Question 3: Option API — Full Passthrough, Declarative Props, or Hybrid

**Recommendation: Hybrid — full option passthrough as primary API, declarative props for cross-cutting concerns.**

This is the pattern used by every mature ECharts wrapper (vue-echarts, echarts-for-react). ECharts' option object is intentionally the complete API surface; building declarative props for every series type would replicate ECharts' entire documentation.

### Core API Shape

```typescript
export abstract class BaseChartElement extends LitElement {
  // PRIMARY: Full ECharts option passthrough
  @property({ attribute: false })
  option?: ECOption;

  // CROSS-CUTTING: Declarative props for wrapper concerns
  @property({ type: String })
  theme?: string;               // Named theme: 'dark' or custom registered name

  @property({ type: Boolean })
  loading = false;              // Show ECharts loading animation

  @property({ attribute: false })
  loadingOption?: object;       // Custom loading animation options

  @property({ type: Boolean, attribute: 'enable-gl' })
  enableGl = false;             // Opt-in WebGL via echarts-gl (see Q4)

  @property({ type: Boolean, attribute: 'auto-resize' })
  autoResize = true;            // Default on; disable for fixed-size charts

  // ADVANCED: setOption update control
  @property({ attribute: false })
  updateOptions?: { notMerge?: boolean; replaceMerge?: string | string[]; silent?: boolean };

  // ESCAPE HATCH: Direct ECharts instance access
  getChart(): ECharts | undefined {
    return this._chart;
  }
}
```

### Option Change Handling

When `option` changes, call `setOption` with merge semantics (ECharts default). Do NOT reinitialize — `setOption` is incremental and preserves animation state.

```typescript
protected updated(changedProps: PropertyValues): void {
  if (!this._chart) return;
  if (changedProps.has('option') && this.option) {
    this._chart.setOption(this.option, this.updateOptions ?? {});
  }
  if (changedProps.has('loading')) {
    this.loading
      ? this._chart.showLoading('default', this.loadingOption)
      : this._chart.hideLoading();
  }
}
```

**Why not full declarative props:** ECharts has ~400 configurable option fields. A declarative component API covering line series `areaStyle`, `markLine`, `markPoint`, `encode`, `dataset`, `transform` etc. would need to duplicate the entire ECharts option schema. No production wrapper does this. vue-echarts explicitly documents that the `option` prop is the primary API.

**Why not pure passthrough:** Without `loading`, `theme`, `enableGl`, and `autoResize` as props, consumers need to understand ECharts internals for tasks that the wrapper should handle. The hybrid is the right balance.

---

## Question 4: echarts-gl WebGL — Loading Strategy

**Recommendation: Opt-in per chart instance via `enable-gl` attribute + dynamic import.**

echarts-gl's unpackaged size is ~7MB. Importing it unconditionally would add significant weight to every page that uses any chart. The correct strategy is a prop-gated dynamic import.

### Strategy

```typescript
// In BaseChartElement, before echarts.init():
private async _maybeLoadGl(): Promise<void> {
  if (!this.enableGl) return;
  // Dynamic import — bundler creates a separate chunk
  await import('echarts-gl');
  // echarts-gl registers itself with echarts via side-effects on import
}

protected async firstUpdated(_changedProps: PropertyValues): Promise<void> {
  if (isServer) return;
  await this._maybeLoadGl();
  this._initChart();
}
```

The `import('echarts-gl')` is a side-effect import — echarts-gl registers its chart types and components with the global ECharts instance automatically on load. No explicit `echarts.use([...])` call is needed for GL components.

### Which Charts Need GL

| Chart Type | `enable-gl` Required? | Reason |
|------------|----------------------|--------|
| `lui-line` | No | 2D canvas is sufficient |
| `lui-bar` | No | 2D canvas is sufficient |
| `lui-area` | No | 2D canvas is sufficient |
| `lui-pie` / `lui-donut` | No | 2D canvas is sufficient |
| `lui-heatmap` | No | 2D heatmap works without GL |
| `lui-candlestick` | No | Standard 2D chart |
| `lui-treemap` | No | Standard 2D chart |
| `lui-scatter` / `lui-bubble` | Optional | Enable for 1M+ points (`scatter3D`) |

For `lui-scatter`, `enable-gl` activates the `scatter3D` series type instead of `scatter`. The component should fall back to 2D `scatter` when GL is not loaded, or throw a clear error if the consumer passes a `scatter3D` option without `enable-gl`.

**Bundle size guidance for consumers:**
```
echarts (5.x, tree-shaken):    ~200–400KB gzip (varies by chart types registered)
echarts-gl (2.0.9, full):      ~7MB unpacked / ~2MB gzip (loaded only on demand)
```

---

## Question 5: SSR — Pattern for Charts That Cannot Render Server-Side

**Recommendation: Render a sized placeholder div server-side; initialize ECharts only on the client in `firstUpdated`.**

ECharts requires real DOM, `canvas`, and `ResizeObserver` — none exist in the `@lit-labs/ssr` Node.js environment. Charts must not attempt any ECharts API during SSR.

### Why This Works Without Hydration Mismatch

Lit's `firstUpdated()` lifecycle hook **does not fire during SSR**. It is a client-only hook that runs after the component's first browser render. This means no explicit `isServer` guard is needed inside `firstUpdated` — however, one should be added defensively for future Lit version changes.

The server renders the same static HTML the client would render for the container — an empty `<div id="chart">`. ECharts then imperatively fills that div with a canvas on the client. Since ECharts' canvas is not part of Lit's declarative template, there is no Lit hydration mismatch.

### SSR Implementation Pattern

```typescript
render() {
  // Both server and client render identical markup.
  // ECharts content is imperatively added inside #chart after firstUpdated.
  return html`
    <div id="chart" part="chart"></div>
  `;
}

protected firstUpdated(_changedProps: PropertyValues): void {
  // This hook never fires on the server.
  // isServer guard is belt-and-suspenders.
  if (isServer) return;
  this._initChart();
}
```

### Declarative Shadow DOM Compatibility

This approach is compatible with `@lit-labs/ssr` Declarative Shadow DOM output. The server outputs:

```html
<lui-line-chart>
  <template shadowrootmode="open">
    <div id="chart" part="chart"></div>
    <!-- Constructable stylesheets injected inline for SSR mode -->
  </template>
</lui-line-chart>
```

When the browser parses this, the shadow root is pre-attached. Lit's hydration (`@lit-labs/ssr-client/lit-element-hydrate-support.js`) recognizes the pre-existing shadow root. `firstUpdated` fires, and ECharts init proceeds normally.

### SSR ECharts Option (Advanced — Not Recommended for v9.0)

ECharts 5.3+ supports `{ ssr: true, renderer: 'svg' }` init for generating static SVG strings server-side. This is a valid pattern for above-the-fold charts requiring fast first-contentful-paint (FCP). It is complex to implement (requires a Node.js build step, SVG serialization, and client re-hydration). Skip for v9.0 — the placeholder pattern is sufficient and matches how every other LitUI component handles SSR (form components skip DOM work, calendar skips interaction setup, etc.).

---

## Question 6: Build Order for 8 Chart Types

Build shared infrastructure first, then chart types ordered by simplicity and re-use of shared patterns.

### Build Order

```
Phase 1: BaseChartElement + Package Scaffolding  ← blocks everything
    |
Phase 2: ThemeBridge (CSS vars → ECharts theme)  ← needed before visual polish
    |
Phase 3: lui-line + lui-area (simplest, highest demand)
    |
Phase 4: lui-bar (grouped/stacked variants)
    |
Phase 5: lui-pie + lui-donut (polar/arc, different option shape)
    |
Phase 6: lui-scatter + lui-bubble (GL opt-in path proven here)
    |
Phase 7: lui-heatmap (coordinate system differs from previous)
    |
Phase 8: lui-candlestick (financial, specialized axis)
    |
Phase 9: lui-treemap (hierarchical data, no axes)
    |
Phase 10: CLI integration + docs
```

### Rationale Per Phase

**Phase 1 — BaseChartElement + Package Scaffolding (Foundation)**
All chart components extend this. Build first. Includes:
- `BaseChartElement` extending `TailwindElement` (same as all other @lit-ui/x packages)
- `echarts/core` + `CanvasRenderer` import, `echarts.use()` pattern
- `firstUpdated` init, `disconnectedCallback` dispose, `ResizeObserver` management
- `option` prop, `loading` prop, `theme` prop, `enableGl` prop
- `getChart()` escape hatch
- `@lit-ui/charts` package.json with `echarts ^5.6.0` and `echarts-gl ^2.0.9` as peer/optional deps
- Shared CSS: `:host { display: block; min-height: 300px; }` pattern

**Phase 2 — ThemeBridge (CSS vars → ECharts registerTheme)**
Before any chart looks correct. The ThemeBridge reads `getComputedStyle()` on the host element for `--ui-chart-*` tokens and calls `echarts.registerTheme('lit-ui', ...)`. This runs in `firstUpdated` before `echarts.init()`. The theme name `'lit-ui'` is passed as the second argument to `echarts.init(container, 'lit-ui')`.

**Phase 3 — lui-line, lui-area (simplest 2D)**
- Use `echarts/core` + `LineChart` + `GridComponent` + `TooltipComponent` + `LegendComponent`
- `lui-area` is a line chart with `option.series[].areaStyle` — share the same component class with an `area` boolean attribute, or make it a subclass. Separate components (`<lui-line-chart>`, `<lui-area-chart>`) is cleaner for consumers.
- Establishes the full component pattern all subsequent charts follow.

**Phase 4 — lui-bar**
- Register `BarChart`
- Add `stacked` and `horizontal` boolean attributes (map to `option.series[].stack` and `option.yAxis/xAxis` swap)
- Grouped bars need no extra API — consumers control series configuration.

**Phase 5 — lui-pie, lui-donut**
- Register `PieChart`
- No Cartesian grid — different coordinate system from previous charts
- `lui-donut` = `lui-pie` with `option.series[].radius: ['40%', '70%']` — expose as `inner-radius` attribute
- Validate this works correctly with ThemeBridge (polar vs. Cartesian color application differs).

**Phase 6 — lui-scatter, lui-bubble (GL path)**
- Register `ScatterChart`
- This is where `enableGl` + dynamic `import('echarts-gl')` is implemented and tested.
- `lui-bubble` = scatter with `symbolSize` mapped from data dimension.
- Proves the GL lazy-load path before proceeding.

**Phase 7 — lui-heatmap**
- Register `HeatmapChart` + `VisualMapComponent`
- Cartesian heatmap (x/y axis + value) differs from calendar heatmap — implement Cartesian first.
- New VisualMap component registration not previously needed.

**Phase 8 — lui-candlestick**
- Register `CandlestickChart` + `DataZoomComponent`
- Most specialized data format (OHLC array per item).
- DataZoom component for pan/zoom is specific to financial charts.

**Phase 9 — lui-treemap**
- Register `TreemapChart`
- Hierarchical/nested data shape unlike all previous charts.
- No axes — pure space-filling layout.

**Phase 10 — CLI + Docs**
- CLI registry entries for all 8 chart types (`npx lit-ui add line-chart`)
- Copy-source templates (charts are complex enough that starter shells are valuable)
- Documentation pages with interactive demos
- CSS token reference (`--ui-chart-*` complete table)

---

## Package Structure

```
packages/charts/
├── src/
│   ├── base/
│   │   ├── base-chart-element.ts      # BaseChartElement (LitElement subclass)
│   │   └── theme-bridge.ts            # CSS vars → echarts registerTheme
│   ├── registry/
│   │   ├── canvas-core.ts             # echarts.use([CanvasRenderer, ...shared...])
│   │   ├── line-registry.ts           # echarts.use([LineChart, GridComponent, ...])
│   │   ├── bar-registry.ts            # echarts.use([BarChart, ...])
│   │   └── ... (one per chart type)
│   ├── line/
│   │   └── lui-line-chart.ts
│   ├── area/
│   │   └── lui-area-chart.ts
│   ├── bar/
│   │   └── lui-bar-chart.ts
│   ├── pie/
│   │   └── lui-pie-chart.ts
│   ├── donut/
│   │   └── lui-donut-chart.ts
│   ├── scatter/
│   │   └── lui-scatter-chart.ts       # enableGl → dynamic import('echarts-gl')
│   ├── heatmap/
│   │   └── lui-heatmap-chart.ts
│   ├── candlestick/
│   │   └── lui-candlestick-chart.ts
│   ├── treemap/
│   │   └── lui-treemap-chart.ts
│   └── index.ts                       # Re-exports all components
├── package.json                       # peerDeps: lit, @lit-ui/core, echarts@^5.6.0
└── tsconfig.json
```

### Structure Rationale

- **`base/`**: Shared lifecycle and theme logic — every chart extends `BaseChartElement`.
- **`registry/`**: Centralized `echarts.use()` calls. Each chart type imports its own registry file which registers only the ECharts components it needs (tree-shaking). All share `canvas-core.ts` (CanvasRenderer + universal features).
- **`src/[type]/`**: One folder per chart component, matching the pattern of other @lit-ui packages.
- **`echarts-gl` is not registered in any registry file** — it is always loaded via dynamic `import('echarts-gl')` gated on `enableGl`.

---

## Data Flow: option Property → ECharts Instance

```
Consumer sets .option = { series: [...], xAxis: {...}, ... }
    │
    ▼
Lit reactive property setter fires
    │
    ▼ (next microtask)
Lit calls updated(changedProps)
    │
    ├─ changedProps.has('option')? → this._chart.setOption(this.option, this.updateOptions)
    │     ECharts merges new option with existing state (incremental update)
    │     Animations play for changed data points
    │
    └─ changedProps.has('loading')? → showLoading() / hideLoading()
```

**Key behavior**: `setOption` is incremental by default. Passing a new series array updates the series without removing unchanged axes, grid, or legend. To do a full replace, consumer passes `updateOptions: { notMerge: true }` or the component detects structural changes and applies `notMerge` automatically (not recommended — keep it simple, let consumer control).

---

## Integration Points with Existing LitUI

| Existing Infrastructure | How Charts Use It |
|-------------------------|-------------------|
| `TailwindElement` | `BaseChartElement extends TailwindElement` — dual-mode styling (SSR inline CSS, client constructable stylesheets) |
| `isServer` guard | `firstUpdated` guard prevents any ECharts API on server |
| `--ui-[component]-*` CSS token pattern | `--ui-chart-*` tokens read by ThemeBridge and passed to `echarts.registerTheme()` |
| `:host-context(.dark)` pattern | ThemeBridge re-reads CSS vars and calls `echarts.registerTheme()` + re-initializes chart when `prefers-color-scheme` or `.dark` class changes |
| pnpm workspaces + lockstep versioning | `@lit-ui/charts` follows same versioning as all other packages |
| `dispatchCustomEvent` | Chart events (`ui-chart-click`, `ui-chart-ready`, `ui-chart-datazoom`) follow `ui-*` naming |
| CLI registry pattern | Each chart type gets an entry in CLI registry; copy-source templates are chart-specific |

---

## New vs Modified Components

### New Components (to be created in @lit-ui/charts)

| Component | Tag | Notes |
|-----------|-----|-------|
| `BaseChartElement` | (abstract, not a custom element) | Shared lifecycle base |
| ThemeBridge | (utility class) | CSS vars → ECharts theme |
| `LuiLineChart` | `<lui-line-chart>` | Line series |
| `LuiAreaChart` | `<lui-area-chart>` | Line + areaStyle |
| `LuiBarChart` | `<lui-bar-chart>` | Bar, stacked, horizontal |
| `LuiPieChart` | `<lui-pie-chart>` | Pie |
| `LuiDonutChart` | `<lui-donut-chart>` | Pie with inner-radius |
| `LuiScatterChart` | `<lui-scatter-chart>` | Scatter; enableGl → Scatter3D |
| `LuiHeatmapChart` | `<lui-heatmap-chart>` | Cartesian heatmap |
| `LuiCandlestickChart` | `<lui-candlestick-chart>` | OHLC financial |
| `LuiTreemapChart` | `<lui-treemap-chart>` | Hierarchical treemap |

### Existing Components (not modified)

No existing @lit-ui components require modification. Charts are fully isolated in a new package.

### New Package

`@lit-ui/charts` is a new package alongside existing `@lit-ui/button`, `@lit-ui/data-table`, etc. It is opt-in heavy (ECharts + optional echarts-gl) and should never be included in a meta-package that auto-imports all components.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Calling echarts.init() in connectedCallback

**What:** `connectedCallback() { this._chart = echarts.init(this.querySelector('#chart')); }`
**Why bad:** Shadow DOM children do not exist yet when `connectedCallback` fires. `querySelector` returns null, ECharts init fails silently or throws.
**Instead:** Init in `firstUpdated()` — shadow DOM is guaranteed to be rendered.

### Anti-Pattern 2: Reinitializing on Every option Change

**What:** `updated(props) { if (props.has('option')) { this._chart.dispose(); this._chart = echarts.init(...); } }`
**Why bad:** Destroys animation state, causes flicker, expensive DOM operation on every data update.
**Instead:** Use `this._chart.setOption(newOption)` — ECharts merges incrementally and animates the diff.

### Anti-Pattern 3: Importing All of echarts + echarts-gl Unconditionally

**What:** `import * as echarts from 'echarts'; import 'echarts-gl';` at the top of base-chart-element.ts
**Why bad:** Every page using any chart downloads the full ~7MB GL bundle, even pages with only a pie chart.
**Instead:** Tree-shake ECharts with `echarts/core` + per-chart `echarts.use([...])`. Dynamic `import('echarts-gl')` gated on `enableGl`.

### Anti-Pattern 4: Global CSS for ECharts Tooltip

**What:** Adding `.echarts-tooltip { ... }` to the host app's global stylesheet.
**Why bad:** ECharts tooltip is injected inside the shadow root. Global CSS cannot pierce shadow DOM. The styles are silently ignored.
**Instead:** Use `option.tooltip.extraCssText` for inline styles, or the ECharts theme object's `tooltip` key for structured styling. Expose `--ui-chart-tooltip-*` tokens and map them in ThemeBridge.

### Anti-Pattern 5: Not Disposing on disconnectedCallback

**What:** Forgetting to call `this._chart.dispose()` when the component is removed.
**Why bad:** ECharts instances maintain internal timers, event listeners, and WebGL contexts. Accumulated leaks cause page slowdown and crashes on long-running dashboards. Chrome heap snapshots show instances surviving after DOM removal if only `dispose()` is called without nulling the reference.
**Instead:** `this._chart.dispose(); this._chart = undefined;` + `this._resizeObserver.disconnect(); this._resizeObserver = undefined;`

### Anti-Pattern 6: Skipping the isServer Guard

**What:** Allowing `echarts.init()` to run during SSR.
**Why bad:** `@lit-labs/ssr` runs in Node.js. `canvas`, `ResizeObserver`, and `HTMLElement.getBoundingClientRect` do not exist. The import itself may fail depending on the ECharts build.
**Instead:** The `firstUpdated` hook never fires during SSR, so the guard is implicit. Add an explicit `if (isServer) return;` check as safety net.

---

## Scaling Considerations

| Concern | Approach |
|---------|----------|
| Many charts on one page | Each chart is an independent ECharts instance. Memory grows linearly. For dashboards with 10+ charts, consider lazy rendering (IntersectionObserver to defer init until chart enters viewport). |
| Real-time streaming (1K updates/sec) | Use `setOption` with `lazyUpdate: true` to batch redraws. ECharts defers rendering until the next frame. Do not recreate the option object on each update — mutate the data array and call `setOption({ series: [{ data: newData }] })`. |
| 1M+ data points | Use `enableGl` to activate echarts-gl's WebGL renderer (scatter3D). For 2D charts at 1M points, use `echarts/features` `LargeScaleFeature` and `series.large: true` (Canvas boost mode). |
| SSR with fast FCP needed | Not in scope for v9.0. ECharts 5 SSR mode (`ssr: true`, `renderer: 'svg'`, `renderToSVGString()`) is available if future requirements demand it. |

---

## Sources

- [Using Apache ECharts with Lit and TypeScript (DEV Community)](https://dev.to/manufac/using-apache-echarts-with-lit-and-typescript-1597) — HIGH confidence, direct Lit+ECharts implementation pattern
- [GitHub: cherie-xf/lit-echarts](https://github.com/cherie-xf/lit-echarts) — MEDIUM confidence, existing Lit ECharts wrapper
- [Apache ECharts SSR Handbook](https://apache.github.io/echarts-handbook/en/how-to/cross-platform/server/) — HIGH confidence, official docs
- [Apache ECharts Import Handbook](https://apache.github.io/echarts-handbook/en/basics/import/) — HIGH confidence, official tree-shaking docs
- [Apache ECharts v6 Migration Guide](https://echarts.apache.org/handbook/en/basics/release-note/v6-upgrade-guide/) — HIGH confidence, official docs
- [GitHub: ecomfe/echarts-gl](https://github.com/ecomfe/echarts-gl) — HIGH confidence, official repo — confirmed v2.x only supports ECharts 5.x
- [GitHub: ecomfe/vue-echarts](https://github.com/ecomfe/vue-echarts) — HIGH confidence, reference implementation for option API design
- [ECharts Memory Leak from Dispose (Medium)](https://medium.com/@kelvinausoftware/memory-leak-from-echarts-occurs-if-not-properly-disposed-7050c5d93028) — MEDIUM confidence, documents dispose + null pattern
- [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/) — HIGH confidence, official Lit SSR docs
- [echarts-gl npm metadata](https://www.npmjs.com/package/echarts-gl) — HIGH confidence, confirmed v2.0.9, peerDep echarts ^5.1.2

---

*Architecture research for: @lit-ui/charts — ECharts + Lit.js web components*
*Researched: 2026-02-28*
