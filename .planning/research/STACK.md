# Technology Stack: Charts System (@lit-ui/charts v9.0)

**Domain:** WebGL-accelerated chart web component library
**Researched:** 2026-02-28
**Confidence:** HIGH (core stack), MEDIUM (echarts-gl/ECharts 6 interop)

---

## Critical Version Decision: ECharts 5.6.0 + echarts-gl 2.0.9

**Use ECharts 5.6.0, NOT ECharts 6.0.0.**

ECharts 6.0.0 was released on 2024-07-30 and is the latest version on npm. However, **echarts-gl 2.0.9 only supports ECharts ^5.1.2** (peerDependencies: `"echarts": "^5.1.2"`). No echarts-gl 3.x for ECharts 6 exists as of 2026-02-28. The `ecomfe/echarts-gl` GitHub issues tracker shows community requests for ECharts 6 support, but the official repo has no announced roadmap for it. The last echarts-gl release was v2.0.8 on 2024-08-06.

**Consequence:** The @lit-ui/charts package must pin ECharts 5.6.0 and echarts-gl 2.0.9 until an official echarts-gl 3.x release targets ECharts 6. This is documented as a known technical constraint so that a future upgrade path is clear.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| echarts | ^5.6.0 | Chart engine — Canvas/SVG rendering, 40+ chart types, theming, streaming | Latest stable version compatible with echarts-gl 2.x. ECharts 5 provides full tree-shaking support via `echarts/core`, TypeScript built-ins, ESM, and Vite-safe bundling. 63k+ GitHub stars, Apache TLP, actively maintained. Built-in TypeScript types — no @types/echarts needed. |
| echarts-gl | ^2.0.9 | WebGL acceleration — scatterGL, linesGL, bars3D, globeGL, surface3D | Required for 1M+ point scatter plots and real-time streaming at high frequency. peerDep: `echarts ^5.1.2`. Last published: 2024-08-06. Provides `Scatter3DChart`, `ScatterGLChart`, `LinesGLChart` via tree-shaking. Internally uses `zrender ^5.1.1` and `claygl ^1.2.1`. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zrender | (bundled with echarts) | 2D canvas/SVG rendering engine underneath ECharts | Included as transitive dep; do NOT import directly |
| claygl | (bundled with echarts-gl) | WebGL 3D rendering engine underneath echarts-gl | Included as transitive dep; do NOT import directly |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| vite | Build + dev server | Use existing `@lit-ui/vite-config` workspace package. Same Vite 7.x config used by all other packages. |
| vite-plugin-dts | TypeScript declarations | Already used across all packages. |
| typescript | Type checking | Project uses ^5.9.3. ECharts 5 provides built-in types — no @types/echarts. |
| @tailwindcss/vite | Tailwind v4 Vite plugin | For theming tokens if needed; follow existing package pattern. |

---

## Package Configuration

### package.json for @lit-ui/charts

```json
{
  "name": "@lit-ui/charts",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "sideEffects": true,
  "dependencies": {
    "echarts": "^5.6.0",
    "echarts-gl": "^2.0.9"
  },
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  },
  "devDependencies": {
    "@lit-ui/core": "workspace:*",
    "@lit-ui/typescript-config": "workspace:*",
    "@lit-ui/vite-config": "workspace:*",
    "@tailwindcss/vite": "^4.1.18",
    "lit": "^3.3.2",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  }
}
```

**Rationale for bundling echarts instead of peer dep:** ECharts is an internal implementation detail of the chart components, not a framework the user is expected to interact with directly. Users call `<lui-line-chart .data=${...}>`, not `echarts.init()`. Bundling avoids version conflicts and enables tree-shaking to happen at the @lit-ui/charts build level. This matches how TanStack Table is handled in @lit-ui/data-table.

**pnpm peerDependencyRules note:** echarts-gl 2.0.9 was published before echarts 5.6.0, so its peerDep range (`^5.1.2`) will satisfy 5.6.0 — no override needed. pnpm strict mode will not flag this as unmet.

---

## Installation

```bash
# In packages/charts directory
pnpm add echarts@^5.6.0 echarts-gl@^2.0.9

# Dev dependencies (follow existing package pattern)
pnpm add -D lit@^3.3.2 vite@^7.3.1 typescript@^5.9.3 vite-plugin-dts@^4.5.4 @tailwindcss/vite@^4.1.18 tailwindcss@^4.1.18
```

---

## Tree-Shaking Import Patterns

ECharts 5 requires explicit tree-shaking imports via `echarts/core`. Do NOT use `import * as echarts from 'echarts'` in production code — this imports the full ~1MB minified bundle (~300-400KB gzip). Tree-shaken per-chart builds reduce this to ~135KB gzip for typical chart sets.

### Base pattern (all chart components use this)

```typescript
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';

echarts.use([
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
]);
```

### Per chart-type imports

```typescript
// Line / Area charts
import { LineChart } from 'echarts/charts';

// Bar / Column charts
import { BarChart } from 'echarts/charts';

// Scatter / Bubble charts (Canvas fallback)
import { ScatterChart } from 'echarts/charts';

// Pie / Donut charts
import { PieChart } from 'echarts/charts';

// Heatmap charts
import { HeatmapChart } from 'echarts/charts';

// Candlestick / OHLC charts
import { CandlestickChart } from 'echarts/charts';

// Treemap charts
import { TreemapChart } from 'echarts/charts';
```

### WebGL chart-type imports (echarts-gl)

```typescript
// WebGL scatter for 1M+ points
import { ScatterGLChart } from 'echarts-gl/charts';

// WebGL lines for large line datasets
import { LinesGLChart } from 'echarts-gl/charts';

// Required 3D/GL grid component
import { Grid3DComponent } from 'echarts-gl/components';

echarts.use([ScatterGLChart, LinesGLChart, Grid3DComponent]);
```

### TypeScript option typing pattern

```typescript
import type {
  LineSeriesOption,
  BarSeriesOption,
  ScatterSeriesOption,
} from 'echarts/charts';
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  LegendComponentOption,
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

// Compose a narrow type for each chart component
type LineChartOption = ComposeOption<
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
>;
```

---

## Lit.js Integration Pattern

### Lifecycle mapping for Shadow DOM

```typescript
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import * as echarts from 'echarts/core';

@customElement('lui-line-chart')
export class LuiLineChart extends TailwindElement {
  @property({ type: Array }) data: DataPoint[] = [];
  @query('.chart-container') private _container!: HTMLDivElement;

  private _chart: echarts.ECharts | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  override firstUpdated(): void {
    // echarts.init must receive a DOM element — only available after firstUpdated
    // Shadow DOM note: pass the element directly, not document.getElementById
    this._chart = echarts.init(this._container);
    this._chart.setOption(this._buildOption());

    // ResizeObserver on the host element — works correctly inside Shadow DOM
    // Native ResizeObserver is sufficient; no polyfill needed for modern browsers
    this._resizeObserver = new ResizeObserver(() => {
      this._chart?.resize();
    });
    this._resizeObserver.observe(this._container);
  }

  override updated(changed: Map<string, unknown>): void {
    if (this._chart && changed.has('data')) {
      this._chart.setOption(this._buildOption());
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._chart?.dispose();
    this._chart = null;
  }

  private _buildOption(): echarts.EChartsOption {
    // build option from this.data and this properties
    return { /* ... */ };
  }

  override render() {
    return html`<div class="chart-container" style="width:100%;height:100%"></div>`;
  }
}
```

**Key Shadow DOM notes:**
- Pass the container div reference directly to `echarts.init()` — do not use `document.getElementById()` which cannot see into Shadow DOM.
- Observe `this._container` (the inner div), not `this` (the host element), so resize events trigger on the actual chart canvas.
- Call `this._chart.dispose()` in `disconnectedCallback` — ECharts holds a WebGL context per instance. Without disposal, WebGL contexts accumulate (browser limit: 16 concurrent).
- `isServer` guard from TailwindElement base class: call `echarts.init` only after `firstUpdated` runs on the client. ECharts has no SSR mode — chart components should render a placeholder server-side.

---

## WebGL Rendering Strategy

### Tiered rendering approach

| Dataset Size | Chart Type | Renderer | Rationale |
|---|---|---|---|
| < 10K points | All 2D charts | Canvas (CanvasRenderer) | Default ECharts renderer, best DX |
| 10K–500K points | Scatter, Lines | Canvas + `large: true` | ECharts progressive rendering handles this range |
| 500K–1M+ points | Scatter, Bubble | ScatterGLChart (echarts-gl) | WebGL required; Canvas cannot sustain 60fps |
| Real-time streaming | Line, Area | Canvas + `appendData` API | ECharts streaming API works well with Canvas |
| 3D datasets | Globe, Surface | echarts-gl 3D components | Only use case that truly needs 3D |

**Important:** ECharts Canvas renderer with `large: true` and `progressive` options handles up to ~500K points smoothly before WebGL becomes necessary. Do not force WebGL for all charts — each WebGL context consumes GPU resources and the browser limits contexts to ~16 per page.

### WebGL context budget

Each chart instance using echarts-gl consumes one WebGL context. With a 16-context browser limit:
- Allow max ~8 simultaneous WebGL charts (leaving headroom for other page uses)
- Canvas-rendered charts consume zero WebGL contexts — prefer Canvas when dataset size allows
- Call `chart.dispose()` promptly when chart components are removed from DOM

---

## Bundle Size Guidance

| Import Strategy | Approx. Size (gzip) | Use When |
|---|---|---|
| `import * as echarts from 'echarts'` | ~300–400 KB | Never in production |
| Tree-shaken single chart type (e.g., line + grid + tooltip) | ~135 KB | Standard usage |
| Tree-shaken full LitUI chart suite (all 8 chart types) | ~250–320 KB est. | Full @lit-ui/charts install |
| echarts-gl added to above | +~200 KB est. | When WebGL scatter/lines needed |

**Recommendation:** The @lit-ui/charts package is an opt-in heavy dep. Document the bundle size in the README so users know what they are importing. The package pattern (separate `@lit-ui/charts`, not bundled into `@lit-ui/core`) already isolates these heavy deps.

Users who only need pie and bar charts can import just those chart components — Vite will tree-shake the rest at their app build time if the @lit-ui/charts package is built with `preserveModules: true` (or each chart type is a separate entry point).

**Architecture recommendation:** Consider per-chart entry points in the package exports:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./line-chart": "./dist/line-chart.js",
    "./bar-chart": "./dist/bar-chart.js",
    "./scatter-chart": "./dist/scatter-chart.js",
    "./pie-chart": "./dist/pie-chart.js"
  }
}
```

This lets users import `import '@lit-ui/charts/line-chart'` and get only that chart's deps tree-shaken in their final bundle.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| ECharts 5.6.0 | ECharts 6.0.0 | Use ECharts 6 when echarts-gl 3.x is released with ECharts 6 support. Monitor [ecomfe/echarts-gl releases](https://github.com/ecomfe/echarts-gl/releases). |
| ECharts 5.6.0 | Plotly.js + regl | Plotly is better for scientific/statistical charts (histograms, violin plots, contours). However, Plotly hits a hard 8-chart WebGL context limit and has larger full bundle (~3MB). Not web-component native. |
| ECharts 5.6.0 | deck.gl | Use deck.gl only for geospatial (map-based) visualizations. deck.gl is not designed for standard business charts (line, bar, pie). |
| ECharts 5.6.0 | Observable Plot | Observable Plot is SVG/Canvas only — no WebGL path. Excellent for exploratory/statistical work but not suited for 1M-point performance requirements. |
| ECharts 5.6.0 | D3.js | D3 is a primitive — not a chart library. Building chart components on D3 requires implementing every chart type from scratch. ECharts provides chart types ready-made with theming, tooltips, and legends. |
| ECharts 5.6.0 | Highcharts | Highcharts is commercial (requires license for non-personal use). ECharts is Apache 2.0. |
| echarts-gl 2.0.9 | regl directly | regl is what echarts-gl uses internally. Using it directly means reimplementing all the chart-to-WebGL mapping logic. Not worth it when echarts-gl wraps it correctly. |
| Canvas CanvasRenderer | SVGRenderer | Use SVGRenderer only when SVG export is a hard requirement (accessibility/print). Canvas is ~2-5x faster for large datasets. SVG creates one DOM element per data point — unusable at 10K+ points. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `import * as echarts from 'echarts'` (full import) | Imports entire ~1MB bundle including chart types you don't use | Tree-shaking via `import * as echarts from 'echarts/core'` + per-chart imports |
| `@types/echarts` | Now a stub — ECharts 5 ships its own TypeScript types | Built-in types from `echarts` package |
| `window.resize` event for chart resize | Doesn't fire when container resizes without window resizing (e.g., flexbox layout changes, sidebar toggle) | `ResizeObserver` on the chart container element |
| ECharts 6.0.0 | No echarts-gl equivalent for WebGL acceleration | ECharts 5.6.0 until echarts-gl 3.x is available |
| Multiple echarts instances with WebGL per page without disposal | Browser WebGL context limit is ~16 — contexts accumulate without `chart.dispose()` | Dispose on `disconnectedCallback`, prefer Canvas renderer for non-WebGL chart types |
| echarts-gl for ALL chart types | WebGL context budget is finite; Canvas handles most 2D charts well | Reserve echarts-gl for scatter/lines with 500K+ points only |
| plotly.js | 8 WebGL context hard limit, ~3MB bundle, not web-component native | ECharts for business charts |
| chart.js | No WebGL path, weak TypeScript types, limited chart types vs ECharts | ECharts for this use case |
| LightningChart JS / SciChart.js | Commercial licenses, high per-developer cost | ECharts (Apache 2.0) is sufficient for stated requirements |

---

## Stack Patterns by Variant

**If chart needs Canvas rendering only (line, bar, area, pie, heatmap, candlestick, treemap):**
- Import `CanvasRenderer` from `echarts/renderers`
- Import only the specific chart type from `echarts/charts`
- Do NOT import echarts-gl
- Zero WebGL context usage

**If chart needs WebGL (scatter/bubble with 500K+ points, real-time lines):**
- Import `CanvasRenderer` from `echarts/renderers` (still needed as base renderer)
- Import `ScatterGLChart` or `LinesGLChart` from `echarts-gl/charts`
- Call `echarts.use([ScatterGLChart, Grid3DComponent])` at module level
- Track WebGL context usage — warn if page has >8 active WebGL charts

**If user's project uses ECharts directly:**
- Advise against sharing the ECharts instance between @lit-ui/charts internals and user code
- @lit-ui/charts bundles echarts as a dependency — two ECharts instances on one page is fine but wastes ~135KB
- Future: expose `echarts` instance via a property for advanced users who need direct access

**If SSR is required:**
- Return a placeholder `<div class="chart-placeholder">` server-side using `isServer` guard
- ECharts cannot render in Node.js without a DOM (no SSR mode for canvas)
- ECharts 5.3+ offers SVG string rendering for Node.js, but this is complex to integrate with the Lit SSR pipeline — out of scope for v9.0

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| echarts@^5.6.0 | echarts-gl@^2.0.9 | echarts-gl peerDep is `^5.1.2` — satisfied by 5.6.0 |
| echarts@^5.6.0 | lit@^3.3.2 | No direct dependency; echarts is DOM-agnostic |
| echarts@^5.6.0 | vite@^7.3.1 | ECharts 5.5+ explicitly tested against Vite |
| echarts@^5.6.0 | typescript@^5.9.3 | Built-in types; `ComposeOption` utility works with TS 5.x |
| echarts@6.0.0 | echarts-gl@^2.0.9 | NOT compatible — do not use ECharts 6 until echarts-gl 3.x exists |
| echarts-gl@^2.0.9 | claygl@^1.2.1 | Bundled transitive dep — do not import separately |
| echarts-gl@^2.0.9 | zrender@^5.1.1 | Bundled transitive dep — do not import separately |

---

## Sources

### HIGH Confidence (official sources, verified)

- [Apache ECharts GitHub Releases](https://github.com/apache/echarts/releases) — v6.0.0 released 2024-07-30; v5.6.0 released 2023-12-28
- [ecomfe/echarts-gl GitHub](https://github.com/ecomfe/echarts-gl) — v2.0.9 latest; peerDep `"echarts": "^5.1.2"` confirmed from raw package.json
- [ecomfe/echarts-gl Releases](https://github.com/ecomfe/echarts-gl/releases) — v2.0.8 released 2024-08-06; no v3.x announced
- [ECharts Import Handbook](https://apache.github.io/echarts-handbook/en/basics/import/) — tree-shaking patterns, CanvasRenderer vs SVGRenderer, TypeScript ComposeOption
- [ECharts 6 Upgrade Guide](https://echarts.apache.org/handbook/en/basics/release-note/v6-upgrade-guide/) — breaking changes from v5 to v6
- [ECharts Changelog](https://echarts.apache.org/en/changelog.html) — v6 features and v5.6 features

### MEDIUM Confidence (WebSearch, multiple corroborating sources)

- [DEV Community: ECharts + Lit TypeScript](https://dev.to/manufac/using-apache-echarts-with-lit-and-typescript-1597) — lifecycle pattern: `firstUpdated` init, `updated` setOption, `disconnectedCallback` dispose + ResizeObserver disconnect
- [DEV Community: ECharts bundle size optimization](https://dev.to/manufac/using-apache-echarts-with-react-and-typescript-optimizing-bundle-size-29l8) — tree-shaking reduces bundle significantly
- [WebSearch: echarts-gl ECharts 6 support](https://github.com/ecomfe/echarts-gl/issues) — confirmed no ECharts 6 support in echarts-gl as of 2025
- [WebSearch: ECharts bundle size](https://bundlephobia.com/package/echarts) — ~300-400KB gzip full; ~135KB gzip tree-shaken pie+title example (from official docs)
- [@types/echarts npm stub confirmation](https://www.npmjs.com/package/@types/echarts) — stub only since ECharts 5 ships built-in types
- [7 WebGL data viz tools 2025](https://cybergarden.au/blog/7-powerful-open-source-webgl-data-visualization-tools-2025) — competitive landscape verified

---

*Stack research for: @lit-ui/charts — ECharts + ECharts GL web component chart library*
*Researched: 2026-02-28*
