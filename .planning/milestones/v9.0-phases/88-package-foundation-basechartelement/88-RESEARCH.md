# Phase 88: Package Foundation + BaseChartElement - Research

**Researched:** 2026-02-28
**Domain:** ECharts 5.x + Lit.js 3 web component chart library foundation
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Developer can install `@lit-ui/charts` as an opt-in package separate from other LitUI packages | Package scaffolding section; `@lit-ui/charts` structure mirrors `@lit-ui/data-table` with echarts as dependency |
| INFRA-02 | Developer can use chart components in SSR frameworks (Next.js, Astro) without `window`/`document` crash | SSR guard pattern: dynamic import inside `firstUpdated()` + `isServer` guard from Lit; ECharts crashes at module evaluation, not at init |
| INFRA-03 | Developer can enable WebGL rendering via `enable-gl` attribute with automatic Canvas fallback when WebGL is unavailable | `_maybeLoadGl()` dynamic import of echarts-gl + WebGL feature detection + `webgl-unavailable` event |
| INFRA-04 | Developer can apply dark mode to charts via the `.dark` class (same pattern as all other LitUI components) | MutationObserver on `document.documentElement` class attribute; ThemeBridge re-reads CSS tokens + calls `setOption` with new color arrays |
| INFRA-05 | Developer can customize chart appearance via `--ui-chart-*` CSS custom properties (series palette, grid, axis, tooltip, legend) | ThemeBridge reads `getComputedStyle(this).getPropertyValue()` — canvas cannot resolve `var()` natively |
| CHART-01 | Developer can pass chart data via a `data` property on every chart component | `@property({ attribute: false })` typed property on BaseChartElement; `attribute: false` is required — JSON.parse on large datasets is lossy |
| CHART-02 | Developer can pass a raw ECharts `option` object to override or extend any chart behavior | `@property({ attribute: false }) option?: ECOption` passthrough; merged via `setOption` with `notMerge: false` by default |
| CHART-03 | Developer can access the underlying ECharts instance via a `getChart()` method for event binding and advanced customization | `getChart(): ECharts | undefined` public method; documented as escape hatch |
| CHART-04 | Developer can toggle a loading skeleton state on any chart via a `loading` property | `@property({ type: Boolean }) loading` maps to `showLoading()` / `hideLoading()` in `updated()` lifecycle |
| CHART-05 | Charts automatically resize when their container dimensions change (ResizeObserver, not `window.resize`) | Native `ResizeObserver` on shadow root container; `window.resize` misses container-level resize (flexbox, panel collapse) |
| STRM-01 | Developer can stream data into any chart via a `pushData(point)` method | Public `pushData(point)` method on BaseChartElement; internally manages circular buffer |
| STRM-02 | Developer can configure the circular buffer size via a `maxPoints` property (default 1000) | `@property({ type: Number }) maxPoints = 1000` — circular buffer capacity |
| STRM-03 | Multiple `pushData()` calls within a single animation frame are batched into one render via `requestAnimationFrame` | RAF coalescing in `pushData()`: accumulate `_pendingData`, schedule one `_rafId` per frame, flush in callback |
| STRM-04 | Line and Area charts use ECharts native `appendData` path for streaming; all other chart types use circular buffer + `setOption({ lazyUpdate: true })` | `_streamingMode` property on BaseChartElement; set by concrete chart classes — `'appendData'` vs `'buffer'`; CRITICAL-03 boundary must be established here |
</phase_requirements>

---

## Summary

Phase 88 creates the `@lit-ui/charts` package from scratch and delivers `BaseChartElement` — the abstract Lit base class that every concrete chart component in Phases 89-95 will extend. This phase is the highest-leverage work in the entire v9.0 milestone because all five critical pitfalls identified in project research (zero-dimension init, WebGL context exhaustion, SSR crashes, `appendData`/`setOption` wipeout, CSS token resolution) must be solved here in the base class before any chart type is built. Retrofitting these patterns across 8+ chart components after the fact would be an architectural rewrite.

The package structure mirrors the existing `@lit-ui/data-table` package exactly: a `packages/charts/` directory with `package.json`, `tsconfig.json`, `vite.config.ts`, and `src/`. The core technical challenge is that ECharts accesses `window` at module evaluation time (not just at `init()`) — so the SSR safety pattern is a three-layer defense: dynamic `import()` inside `firstUpdated()`, `isServer` guard from Lit, and a static placeholder in `render()`. The `ThemeBridge` class solves the CSS token problem: ECharts canvas cannot evaluate `var(--ui-chart-*)` strings, so all token values must be resolved via `getComputedStyle(this).getPropertyValue()` before being passed to ECharts.

The streaming infrastructure (`pushData()`, `maxPoints`, RAF batching, `appendData` vs circular buffer routing) is delivered in this phase so all chart components in Phases 89-95 inherit it without duplication. The critical `appendData`/`setOption` architectural boundary (CRITICAL-03) must be locked in here — any `setOption()` call after `appendData()` silently wipes all streamed data, a confirmed unresolved ECharts bug since v4.6.0.

**Primary recommendation:** Build `BaseChartElement` and `ThemeBridge` as the complete foundation before any concrete chart class. Every one of the 14 phase requirements (INFRA-01 through STRM-04) is addressed exclusively in these two classes plus the package scaffolding — none of them are deferred to chart-specific phases.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts | ^5.6.0 | Chart engine — Canvas/SVG rendering, 40+ chart types, theming, streaming | MUST be 5.x — echarts-gl 2.0.9 peerDep is `"echarts": "^5.1.2"`, no 3.x released. Built-in TypeScript types, full ESM tree-shaking via `echarts/core`. Apache 2.0. |
| echarts-gl | ^2.0.9 | WebGL acceleration for scatter/line at 500K+ data points | Optional peer dep — dynamic import only when `enable-gl` attribute set. Non-tree-shakeable (~500–600KB gzip), must never appear in main chunk. |
| lit | ^3.3.2 (peer) | Web component base framework | Existing project baseline. `isServer` from `lit` is the SSR guard used by all existing components. |
| @lit-ui/core | workspace:* (peer) | TailwindElement base class, design tokens, dispatchCustomEvent | `BaseChartElement extends TailwindElement` — same pattern as all 18 existing components. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @lit-ui/vite-config | workspace:* | Shared `createLibraryConfig()` Vite helper | Use for `vite.config.ts` — same as `@lit-ui/data-table` and all other packages |
| @lit-ui/typescript-config | workspace:* | Shared TypeScript config (target ES2022, `moduleResolution: bundler`, `isolatedModules: true`) | Extend in `tsconfig.json` — identical to all other packages |
| @tailwindcss/vite | ^4.1.18 | Tailwind v4 Vite plugin | Required in devDependencies per package pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| echarts@^5.6.0 | echarts@^6.0.0 | DO NOT use 6.0.0 — echarts-gl has no 6.x-compatible release as of 2026-02-28 |
| echarts as dependency | echarts as peer dep | Research decision: bundle echarts like data-table bundles @tanstack — it's an implementation detail, not a user-facing dep |
| dynamic `import('echarts/core')` | static `import * as echarts from 'echarts/core'` | Static import crashes SSR at module evaluation; dynamic import is mandatory |

**Installation:**
```bash
# In packages/charts/
pnpm add echarts@^5.6.0 echarts-gl@^2.0.9
pnpm add -D lit@^3.3.2 vite@^7.3.1 typescript@^5.9.3 vite-plugin-dts@^4.5.4 @tailwindcss/vite@^4.1.18 tailwindcss@^4.1.18
# workspace packages added as devDeps with workspace: protocol
```

---

## Architecture Patterns

### Recommended Project Structure
```
packages/charts/
├── src/
│   ├── base/
│   │   ├── base-chart-element.ts      # Abstract base — all lifecycle, props, streaming
│   │   └── theme-bridge.ts            # CSS tokens → ECharts color arrays
│   ├── registry/
│   │   └── canvas-core.ts             # echarts.use([CanvasRenderer, shared components])
│   └── index.ts                       # Re-exports BaseChartElement + ThemeBridge
├── package.json                       # echarts as dep, echarts-gl as dep, lit/@lit-ui/core as peers
├── tsconfig.json                      # extends @lit-ui/typescript-config/library.json
└── vite.config.ts                     # createLibraryConfig({ entry: 'src/index.ts' })
```

Note: Individual chart component directories (`src/line/`, `src/bar/`, etc.) are created in Phases 89-95. Phase 88 only builds `src/base/` and `src/registry/`.

### Pattern 1: SSR-Safe ECharts Initialization
**What:** Dynamic import of ECharts inside `firstUpdated()` with `isServer` belt-and-suspenders guard. Lit's `firstUpdated()` never fires during SSR so ECharts is never imported on the server.
**When to use:** Every chart component that calls `echarts.init()`.
**Example:**
```typescript
// Source: .planning/research/PITFALLS.md (CRITICAL-04 fix)
import { isServer } from 'lit';

export abstract class BaseChartElement extends TailwindElement {
  private _chart: ReturnType<typeof echarts.init> | null = null;

  override async firstUpdated(): Promise<void> {
    // firstUpdated never fires during SSR — isServer guard is belt-and-suspenders
    if (isServer) return;

    await this.updateComplete;
    await this._maybeLoadGl();

    requestAnimationFrame(() => {
      this._initChart();
    });
  }

  private async _initChart(): Promise<void> {
    // Dynamic import — never a static top-level import
    const echarts = await import('echarts/core');
    const container = this.shadowRoot!.querySelector<HTMLDivElement>('#chart')!;

    // Guard against double-init on DOM move (Chrome moveBefore())
    const existing = echarts.getInstanceByDom(container);
    if (existing) existing.dispose();

    this._chart = echarts.init(container, null, { renderer: 'canvas' });
    // ...
  }
}
```

### Pattern 2: ThemeBridge — CSS Token Resolution
**What:** Read `--ui-chart-*` CSS custom properties via `getComputedStyle` before building ECharts color arrays. ECharts canvas API cannot evaluate `var()` strings.
**When to use:** In `_buildTheme()` called at init and again when `.dark` class toggles on `document.documentElement`.
**Example:**
```typescript
// Source: .planning/research/PITFALLS.md (HIGH-05 fix)
export class ThemeBridge {
  constructor(private readonly host: BaseChartElement) {}

  readToken(name: string, fallback: string): string {
    // getComputedStyle on the host element — sees inherited --ui-* from :root
    return getComputedStyle(this.host).getPropertyValue(name).trim() || fallback;
  }

  buildColors(): string[] {
    return [
      this.readToken('--ui-chart-color-1', '#3b82f6'),
      this.readToken('--ui-chart-color-2', '#8b5cf6'),
      this.readToken('--ui-chart-color-3', '#10b981'),
      this.readToken('--ui-chart-color-4', '#f59e0b'),
      this.readToken('--ui-chart-color-5', '#ef4444'),
      this.readToken('--ui-chart-color-6', '#06b6d4'),
      this.readToken('--ui-chart-color-7', '#f97316'),
      this.readToken('--ui-chart-color-8', '#84cc16'),
    ];
  }

  buildThemeObject(): object {
    return {
      color: this.buildColors(),
      backgroundColor: 'transparent',
      textStyle: {
        color: this.readToken('--ui-chart-axis-label', '#6b7280'),
        fontFamily: this.readToken('--ui-chart-font-family', 'system-ui, sans-serif'),
      },
      grid: {
        borderColor: this.readToken('--ui-chart-grid-line', '#e5e7eb'),
      },
      tooltip: {
        backgroundColor: this.readToken('--ui-chart-tooltip-bg', '#ffffff'),
        borderColor: this.readToken('--ui-chart-tooltip-border', '#e5e7eb'),
        textStyle: { color: this.readToken('--ui-chart-tooltip-text', '#111827') },
      },
      legend: {
        textStyle: { color: this.readToken('--ui-chart-legend-text', '#374151') },
      },
    };
  }
}
```

### Pattern 3: Dark Mode MutationObserver
**What:** Observe class attribute changes on `document.documentElement` to detect `.dark` toggle. Rebuild theme and call `setOption` with new color arrays.
**When to use:** In `firstUpdated()` setup, cleaned up in `disconnectedCallback()`.
**Example:**
```typescript
// Source: .planning/research/PITFALLS.md (MEDIUM-04 fix)
private _colorSchemeObserver?: MutationObserver;

private _setupColorSchemeObserver(): void {
  this._colorSchemeObserver = new MutationObserver(() => {
    this._applyTheme();
  });
  this._colorSchemeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

private _applyTheme(): void {
  if (!this._chart) return;
  const theme = this._themeBridge.buildThemeObject();
  // Use setOption to push new color arrays — cheaper than dispose+reinit
  this._chart.setOption({
    color: theme.color,
    textStyle: theme.textStyle,
  });
}
```

### Pattern 4: Full Disposal Chain
**What:** Complete cleanup sequence in `disconnectedCallback()` — WebGL context release before dispose, null assignment after dispose, ResizeObserver disconnect, MutationObserver disconnect.
**When to use:** Always — this is the mandatory disposal pattern for every chart component.
**Example:**
```typescript
// Source: .planning/research/PITFALLS.md (CRITICAL-02 + HIGH-04 fix)
override disconnectedCallback(): void {
  super.disconnectedCallback();

  // 1. Disconnect observers first
  this._resizeObserver?.disconnect();
  this._resizeObserver = undefined;
  this._colorSchemeObserver?.disconnect();
  this._colorSchemeObserver = undefined;

  if (this._chart) {
    // 2. Release WebGL context before dispose — dispose() alone is insufficient
    // Browsers limit ~16 concurrent WebGL contexts; explicit release is required
    const canvases = this._chart.getDom().getElementsByTagName('canvas');
    for (const canvas of Array.from(canvases)) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    }

    // 3. Dispose + null — dispose alone leaves JS reference alive (memory leak)
    this._chart.dispose();
    this._chart = null;
  }
}
```

### Pattern 5: RAF Batching for `pushData()`
**What:** Accumulate streaming data points in `_pendingData` array, coalesce all pushes within one animation frame into a single ECharts update.
**When to use:** In the `pushData()` public method — mandatory for any streaming chart.
**Example:**
```typescript
// Source: .planning/research/PITFALLS.md (HIGH-03 fix)
private _pendingData: unknown[] = [];
private _rafId?: number;

// STRM-01: Public streaming API
pushData(point: unknown): void {
  this._pendingData.push(point);
  // STRM-03: Coalesce all pushes in one animation frame
  if (this._rafId === undefined) {
    this._rafId = requestAnimationFrame(() => {
      this._flushPendingData();
      this._rafId = undefined;
    });
  }
}

private _flushPendingData(): void {
  if (!this._chart || !this._pendingData.length) return;

  if (this._streamingMode === 'appendData') {
    // STRM-04: appendData path (Line, Area) — NEVER call setOption after this
    this._chart.appendData({
      seriesIndex: 0,
      data: this._pendingData,
    });
  } else {
    // STRM-04: Circular buffer path (all other chart types)
    this._circularBuffer.push(...this._pendingData);
    if (this._circularBuffer.length > this.maxPoints) {
      this._circularBuffer = this._circularBuffer.slice(-this.maxPoints);
    }
    this._chart.setOption(
      { series: [{ data: this._circularBuffer }] },
      { lazyUpdate: true }
    );
  }

  this._pendingData = [];
}
```

### Pattern 6: WebGL Feature Detection + Fallback
**What:** Detect WebGL support before loading echarts-gl. Fall back to Canvas and dispatch `webgl-unavailable` event.
**When to use:** In `_maybeLoadGl()` called from `firstUpdated()` when `enableGl` is true.
**Example:**
```typescript
// Source: .planning/research/PITFALLS.md (HIGH-06 fix)
private _isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      (canvas.getContext as Function)('experimental-webgl')
    );
  } catch {
    return false;
  }
}

private async _maybeLoadGl(): Promise<void> {
  if (!this.enableGl) return;

  if (!this._isWebGLSupported()) {
    this._webglUnavailable = true;
    // INFRA-03: Fire webgl-unavailable event for host app to handle
    dispatchCustomEvent(this, 'webgl-unavailable', {
      reason: 'WebGL context unavailable in this environment',
    });
    return;
  }

  // Dynamic import — bundler creates a separate chunk; never in main bundle
  await import('echarts-gl');
  // echarts-gl registers itself via side-effects on import
}
```

### Pattern 7: Absolute-Fill Shadow DOM Layout
**What:** `:host { display: block; position: relative; }` with `#chart { position: absolute; inset: 0; }`. Guarantees that shadow host and chart canvas have identical bounding rects, fixing Shadow DOM event hit-testing.
**When to use:** Static styles in BaseChartElement — inherited by all chart components.
**Example:**
```typescript
// Source: .planning/research/PITFALLS.md (CRITICAL-05 + CRITICAL-01 fix)
static override styles = [
  ...tailwindBaseStyles,
  css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: var(--ui-chart-height, 300px);
    }
    #chart {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
  `,
];
```

### Anti-Patterns to Avoid
- **Static top-level ECharts import:** `import * as echarts from 'echarts/core'` at the file top crashes `@lit-labs/ssr` with `window is not defined` at module evaluation — use dynamic `import()` inside `firstUpdated()`.
- **`connectedCallback` init:** Shadow DOM children do not exist at `connectedCallback` time — `querySelector('#chart')` returns null. Always init in `firstUpdated()`.
- **`notMerge: true` as default `setOption` flag:** Destroys animation state and all chart elements on every update. Default is `notMerge: false`; only use `true` for structural chart reconfiguration.
- **`var(--ui-chart-*)` passed directly to ECharts option:** Canvas 2D API does not evaluate CSS custom properties. All token values must be resolved via `getComputedStyle` before passing to ECharts.
- **`chart.dispose()` without null assignment:** Leaves JS reference alive; ECharts instance and its DOM references survive GC. Always null after dispose.
- **`setOption()` after `appendData()` has run:** Silently wipes all streamed data (CRITICAL-03). The `appendData` path and the `setOption` path must be strictly separated per series.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 40+ chart type rendering | Custom Canvas/SVG drawing code | `echarts/core` + per-chart module registry | ECharts handles layout, animation, tooltip, legend, zoom, theming natively |
| WebGL scatter rendering at 1M points | Custom WebGL shader pipeline | `echarts-gl` ScatterGLChart (dynamic import) | ClayGL under the hood handles GPU memory management correctly |
| ResizeObserver debouncing | Custom debounce wrapper | Raw `ResizeObserver` on container | `chart.resize()` is cheap — no debounce needed; raw ResizeObserver is the pattern |
| Dark mode detection | `prefers-color-scheme` media query | MutationObserver on `document.documentElement` class | Project uses `.dark` class pattern, not media query — must watch class changes |
| Canvas color interpolation | Custom `var()` resolution | `getComputedStyle(host).getPropertyValue('--token')` | Canvas 2D does not resolve CSS custom properties; `getComputedStyle` is the only correct approach |
| WebGL context management | Manual context pool | `WEBGL_lose_context` extension + `dispose()` pattern | Browser WebGL context limit is ~16; explicit release via extension is required |
| Streaming data buffer | Rolling array implementation | `_circularBuffer.slice(-this.maxPoints)` + ECharts `appendData` | The `appendData`/`setOption` boundary (CRITICAL-03) means you need explicit path routing, not just a buffer |

**Key insight:** ECharts handles chart rendering, theming, animation, and interaction. The base class only needs to handle the web-component-specific concerns: lifecycle bridging, SSR safety, CSS token resolution, ResizeObserver, and disposal. Do not re-implement anything ECharts provides natively.

---

## Common Pitfalls

### Pitfall 1: Zero-Dimension ECharts Init (CRITICAL-01)
**What goes wrong:** `echarts.init()` reads container dimensions at call time. If called before browser layout, both width and height are 0 and ECharts renders blank forever.
**Why it happens:** `firstUpdated()` fires after Lit's render microtask, but before browser layout completes. The shadow DOM container exists but has no measured dimensions.
**How to avoid:** Wrap `echarts.init()` inside `requestAnimationFrame()` after `await this.updateComplete`. Also set `:host { display: block; height: var(--ui-chart-height, 300px); }` to guarantee non-zero layout before init.
**Warning signs:** Empty chart on first render despite data being set; chart appears after browser resize; console shows "Can't get dom width or height."

### Pitfall 2: SSR Crash from ECharts Module Evaluation (CRITICAL-04)
**What goes wrong:** Any static `import ... from 'echarts/core'` at the top of a chart component file causes `ReferenceError: window is not defined` during `@lit-labs/ssr` server rendering.
**Why it happens:** ECharts probes `window` at module evaluation time (not just at `init()`), crashing the entire SSR pipeline.
**How to avoid:** Never static import `echarts` or `echarts-gl`. Use `await import('echarts/core')` inside `firstUpdated()`. TypeScript types can be imported with `import type` (type-only imports are erased at compile time).
**Warning signs:** Next.js App Router build fails; Astro build crashes; works in client-only apps but fails in SSR builds.

### Pitfall 3: appendData + setOption Data Wipeout (CRITICAL-03)
**What goes wrong:** Any `setOption()` call after `appendData()` silently clears all streamed data.
**Why it happens:** Confirmed ECharts bug since v4.6.0 (GitHub Issue #12327), unresolved in 5.x. `setOption` performs a full diff-and-replace; it treats absent `data` in the new option as "remove all data."
**How to avoid:** BaseChartElement must establish a strict boundary: `_streamingMode === 'appendData'` charts NEVER call `setOption()` after the first init `setOption`. Option updates that need `setOption` must reinitialize the chart. The `_streamingMode` must be set by concrete chart classes (Line/Area use `'appendData'`; all others use `'buffer'`).
**Warning signs:** Streaming line chart clears during unrelated option updates; dark mode toggle wipes streaming data.

### Pitfall 4: WebGL Context Exhaustion (CRITICAL-02)
**What goes wrong:** Browsers allow ~16 simultaneous WebGL contexts. `chart.dispose()` alone does not release the GPU context promptly. Above 12-16 GL charts, browser silently destroys the oldest context.
**Why it happens:** GPU context is reference-counted at the browser level; GC may not run promptly after `dispose()`.
**How to avoid:** Before `dispose()`, call `gl.getExtension('WEBGL_lose_context')?.loseContext()` on each canvas element. The full disposal chain is: `loseContext()` → `dispose()` → `null` → `observer.disconnect()`.
**Warning signs:** Multiple GL chart components on one page; "Too many active WebGL contexts" console warning; charts go blank in dashboard views.

### Pitfall 5: CSS Tokens Not Resolved in Canvas (HIGH-05)
**What goes wrong:** Passing `'var(--ui-chart-color-1)'` directly to ECharts option yields an invalid color in the canvas context — chart renders with default ECharts colors instead of design system colors.
**Why it happens:** CSS custom properties are not evaluated by the Canvas 2D API. ECharts explicitly does not support CSS variables (GitHub Issue #16044).
**How to avoid:** `ThemeBridge._readToken(name, fallback)` uses `getComputedStyle(this).getPropertyValue(name).trim()` to resolve tokens before building the ECharts theme object. All token reads MUST have non-empty fallback values (copy-source users may not have the `--ui-chart-*` tokens defined).
**Warning signs:** Chart colors are default ECharts blue/orange/green; colors don't match rest of design system; dark mode toggle has no effect on chart colors.

### Pitfall 6: Dark Mode Not Updating (MEDIUM-04)
**What goes wrong:** `.dark` class toggled on `<html>` updates all CSS-styled components, but chart colors remain unchanged.
**Why it happens:** ECharts theme is a JavaScript object built at init time. CSS cascade changes do not propagate into the canvas automatically.
**How to avoid:** `MutationObserver` on `document.documentElement` watching the `class` attribute. When class changes, `ThemeBridge.buildThemeObject()` re-reads all token values and `setOption()` pushes new color/style arrays.
**Warning signs:** Docs site dark mode toggle changes all other components but not charts; chart appears "stuck" in light mode.

### Pitfall 7: Double-Init on DOM Move (MEDIUM-02)
**What goes wrong:** ECharts throws "Already have an echarts instance" when a chart component is moved in the DOM. In Chrome 133+ `moveBefore()` fires `connectedCallback` without `firstUpdated`.
**Why it happens:** ECharts' internal `getInstanceByDom()` registry still references the previous instance on the same container.
**How to avoid:** Check `echarts.getInstanceByDom(container)` before `echarts.init()`. If an instance exists and is not disposed, call `existing.dispose()` first.

---

## Code Examples

### BaseChartElement Full Skeleton
```typescript
// Source: .planning/research/ARCHITECTURE.md + PITFALLS.md synthesis
import { html, css, isServer, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles, dispatchCustomEvent } from '@lit-ui/core';
import { ThemeBridge } from './theme-bridge.js';

// Import type only — erased at compile time, never triggers SSR crash
import type * as EChartsTypes from 'echarts/core';

export abstract class BaseChartElement extends TailwindElement {
  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: var(--ui-chart-height, 300px);
      }
      #chart {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
    `,
  ];

  // CHART-02: Raw ECharts option passthrough
  @property({ attribute: false })
  option?: EChartsTypes.EChartsOption;

  // CHART-04: Loading skeleton
  @property({ type: Boolean })
  loading = false;

  // INFRA-03: WebGL opt-in
  @property({ type: Boolean, attribute: 'enable-gl' })
  enableGl = false;

  // STRM-02: Circular buffer capacity
  @property({ type: Number })
  maxPoints = 1000;

  protected _chart: EChartsTypes.ECharts | null = null;
  protected _streamingMode: 'appendData' | 'buffer' = 'buffer';
  private _themeBridge = new ThemeBridge(this);
  private _resizeObserver?: ResizeObserver;
  private _colorSchemeObserver?: MutationObserver;
  private _pendingData: unknown[] = [];
  private _circularBuffer: unknown[] = [];
  private _rafId?: number;
  private _webglUnavailable = false;

  // CHART-03: Escape hatch
  getChart(): EChartsTypes.ECharts | undefined {
    return this._chart ?? undefined;
  }

  // STRM-01: Public streaming API
  pushData(point: unknown): void {
    this._pendingData.push(point);
    if (this._rafId === undefined) {
      this._rafId = requestAnimationFrame(() => {
        this._flushPendingData();
        this._rafId = undefined;
      });
    }
  }

  override async firstUpdated(_changed: PropertyValues): Promise<void> {
    if (isServer) return;
    await this.updateComplete;
    await this._maybeLoadGl();
    requestAnimationFrame(() => this._initChart());
  }

  override updated(changed: PropertyValues): void {
    if (!this._chart) return;
    if (changed.has('option') && this.option) {
      this._chart.setOption(this.option);
    }
    if (changed.has('loading')) {
      this.loading ? this._chart.showLoading() : this._chart.hideLoading();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._colorSchemeObserver?.disconnect();
    this._colorSchemeObserver = undefined;
    if (this._rafId !== undefined) {
      cancelAnimationFrame(this._rafId);
      this._rafId = undefined;
    }
    if (this._chart) {
      const canvases = this._chart.getDom().getElementsByTagName('canvas');
      for (const canvas of Array.from(canvases)) {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
      }
      this._chart.dispose();
      this._chart = null;
    }
  }

  override render() {
    return html`<div id="chart" part="chart"></div>`;
  }

  // Concrete chart classes register their ECharts modules here
  protected abstract _registerModules(): Promise<void>;

  private async _initChart(): Promise<void> {
    await this._registerModules();
    const { init, getInstanceByDom } = await import('echarts/core');
    const container = this.shadowRoot!.querySelector<HTMLDivElement>('#chart')!;
    const existing = getInstanceByDom(container);
    if (existing) existing.dispose();

    const theme = this._themeBridge.buildThemeObject();
    this._chart = init(container, theme, { renderer: 'canvas' });

    this._resizeObserver = new ResizeObserver(() => this._chart?.resize());
    this._resizeObserver.observe(container);

    this._colorSchemeObserver = new MutationObserver(() => this._applyTheme());
    this._colorSchemeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    if (this.option) this._chart.setOption(this.option);
    if (this.loading) this._chart.showLoading();
  }

  private _applyTheme(): void {
    if (!this._chart) return;
    const theme = this._themeBridge.buildThemeObject();
    this._chart.setOption({ color: (theme as Record<string, unknown>).color });
  }

  private _flushPendingData(): void {
    if (!this._chart || !this._pendingData.length) return;
    const points = this._pendingData.splice(0);
    if (this._streamingMode === 'appendData') {
      this._chart.appendData({ seriesIndex: 0, data: points });
    } else {
      this._circularBuffer.push(...points);
      if (this._circularBuffer.length > this.maxPoints) {
        this._circularBuffer = this._circularBuffer.slice(-this.maxPoints);
      }
      this._chart.setOption({ series: [{ data: this._circularBuffer }] }, { lazyUpdate: true } as object);
    }
  }

  private _isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch { return false; }
  }

  private async _maybeLoadGl(): Promise<void> {
    if (!this.enableGl) return;
    if (!this._isWebGLSupported()) {
      this._webglUnavailable = true;
      dispatchCustomEvent(this, 'webgl-unavailable', { bubbles: true, composed: true });
      return;
    }
    await import('echarts-gl');
  }
}
```

### ThemeBridge CSS Token System
```typescript
// Source: .planning/research/PITFALLS.md + REQUIREMENTS.md (INFRA-04, INFRA-05)
export class ThemeBridge {
  // INFRA-05: Full --ui-chart-* token set
  // Colors 1-8 are the series palette
  private readonly _tokenDefaults: Record<string, string> = {
    '--ui-chart-color-1': '#3b82f6',
    '--ui-chart-color-2': '#8b5cf6',
    '--ui-chart-color-3': '#10b981',
    '--ui-chart-color-4': '#f59e0b',
    '--ui-chart-color-5': '#ef4444',
    '--ui-chart-color-6': '#06b6d4',
    '--ui-chart-color-7': '#f97316',
    '--ui-chart-color-8': '#84cc16',
    '--ui-chart-grid-line': '#e5e7eb',
    '--ui-chart-axis-label': '#6b7280',
    '--ui-chart-axis-line': '#d1d5db',
    '--ui-chart-tooltip-bg': '#ffffff',
    '--ui-chart-tooltip-border': '#e5e7eb',
    '--ui-chart-tooltip-text': '#111827',
    '--ui-chart-legend-text': '#374151',
    '--ui-chart-font-family': 'system-ui, sans-serif',
  };

  constructor(private readonly host: Element) {}

  readToken(name: string): string {
    const fallback = this._tokenDefaults[name] ?? '';
    return getComputedStyle(this.host).getPropertyValue(name).trim() || fallback;
  }

  buildThemeObject(): object {
    return {
      color: Array.from({ length: 8 }, (_, i) =>
        this.readToken(`--ui-chart-color-${i + 1}`)
      ),
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: this.readToken('--ui-chart-font-family'),
        color: this.readToken('--ui-chart-axis-label'),
      },
      grid: { borderColor: this.readToken('--ui-chart-grid-line') },
      categoryAxis: {
        axisLine: { lineStyle: { color: this.readToken('--ui-chart-axis-line') } },
        axisLabel: { color: this.readToken('--ui-chart-axis-label') },
      },
      valueAxis: {
        axisLine: { lineStyle: { color: this.readToken('--ui-chart-axis-line') } },
        axisLabel: { color: this.readToken('--ui-chart-axis-label') },
        splitLine: { lineStyle: { color: this.readToken('--ui-chart-grid-line') } },
      },
      tooltip: {
        backgroundColor: this.readToken('--ui-chart-tooltip-bg'),
        borderColor: this.readToken('--ui-chart-tooltip-border'),
        textStyle: { color: this.readToken('--ui-chart-tooltip-text') },
      },
      legend: {
        textStyle: { color: this.readToken('--ui-chart-legend-text') },
      },
    };
  }
}
```

### canvas-core Registry
```typescript
// Source: .planning/research/STACK.md — tree-shaking patterns
// Called by each concrete chart in _registerModules() — registered once per module
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';

let _registered = false;

export async function registerCanvasCore(): Promise<void> {
  if (_registered) return;
  _registered = true;
  // NOTE: These imports must be inside an async function, not at module top level
  // to avoid SSR crashes (same dynamic import requirement as echarts/core itself)
  const echarts = await import('echarts/core');
  echarts.use([
    CanvasRenderer,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    LabelLayout,
    UniversalTransition,
  ]);
}
```

### package.json for @lit-ui/charts
```json
{
  "name": "@lit-ui/charts",
  "version": "1.0.0",
  "description": "High-performance chart components with WebGL rendering, real-time streaming, and CSS token theming built with Lit and ECharts",
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
  "files": ["dist"],
  "sideEffects": true,
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  },
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

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import * as echarts from 'echarts'` (full import) | Tree-shaking via `echarts/core` + per-chart `echarts.use()` | ECharts 5.0 (2021) | ~300-400KB → ~135KB gzip per chart type |
| `window.resize` event for chart resize | Native `ResizeObserver` on container | ResizeObserver baseline support ~2020 | Correctly handles container-level resize, not just viewport |
| ECharts 6.0.0 (npm `latest`) | Pin to ECharts 5.6.0 | echarts-gl 2.0.9 peerDep constraint | WebGL acceleration available; echarts-gl 3.x not yet released |
| `echarts.registerTheme()` + dispose + reinit for dark mode | `setOption({ color: [...] })` with re-read tokens | Project decision | Avoids chart flicker on dark mode toggle; incremental update is sufficient |
| `@types/echarts` separate package | Built-in types from `echarts` package | ECharts 5.0 | No `@types/echarts` needed — built-in types only |

**Deprecated/outdated:**
- `@types/echarts`: Now a stub. ECharts 5+ ships built-in TypeScript types.
- `echarts@6.0.0` for this project: No echarts-gl 3.x available; pin to 5.6.0.
- `window.addEventListener('resize', ...)`: Replaced by ResizeObserver for container-aware resize.
- Static top-level ECharts import in any component file: SSR crash at module evaluation time.

---

## Open Questions

1. **TypeScript `import type` + dynamic `import()` interaction with `isolatedModules: true`**
   - What we know: Project tsconfig uses `moduleResolution: "bundler"` and `isolatedModules: true`. Type-only imports (`import type * as EChartsTypes from 'echarts/core'`) are erased at compile time and do not trigger module evaluation. Dynamic `import('echarts/core')` provides values at runtime.
   - What's unclear: Whether TypeScript's type inference for `await import('echarts/core')` provides sufficient types without a parallel `import type` declaration. Some configurations require the static type-only import for IDE support even when the runtime import is dynamic.
   - Recommendation: Start with `import type * as echarts from 'echarts/core'` for types only + `await import('echarts/core')` for runtime values. Validate that the TypeScript compiler accepts this with `isolatedModules: true`. If not, use `// @ts-ignore` only as last resort.

2. **`echarts-gl` dynamic import TypeScript type availability**
   - What we know: echarts-gl 2.0.9 ships some type definitions but may not export them as subpath-compatible types for `import('echarts-gl/charts')` patterns. This is flagged in STATE.md as a known blocker for Phase 92 (Scatter GL), but the dynamic `import('echarts-gl')` side-effect import in BaseChartElement needs to typecheck cleanly.
   - What's unclear: Whether `await import('echarts-gl')` compiles cleanly without explicit type declarations, or whether a declaration shim is needed.
   - Recommendation: In Phase 88, `import('echarts-gl')` is a side-effect import; types are not needed. Add `// @ts-ignore` only if the import causes a type error. Defer type investigation to Phase 92 (Scatter GL).

3. **Dark mode theme re-application strategy: `setOption` color arrays vs. dispose+reinit**
   - What we know: Two valid approaches — (a) dispose + reinit chart with new theme object (expensive, causes visual flicker); (b) `setOption({ color: [...] })` to push new color arrays incrementally (cheap, no flicker, but may not update all theme properties like axis text color).
   - What's unclear: Whether incremental `setOption` with new color arrays fully re-applies `textStyle`, `grid.borderColor`, and `tooltip` styling, or whether these require a full `registerTheme` + reinit cycle.
   - Recommendation: Use incremental `setOption` for Phase 88. Test that axis labels, grid lines, and tooltip backgrounds update correctly on dark mode toggle. If any theme properties do not update, add them to the `setOption` payload incrementally rather than falling back to dispose+reinit.

4. **`canvas-core.ts` registry — static vs dynamic imports for module registration**
   - What we know: `echarts.use([CanvasRenderer, TooltipComponent, ...])` must be called before `echarts.init()`. If `echarts.use()` itself comes from a dynamic `import('echarts/core')`, the registration call is async and must complete before `_initChart()` runs.
   - What's unclear: Whether calling `echarts.use()` from within a dynamically imported context correctly registers modules globally for subsequent `echarts.init()` calls, or whether it requires the same import reference.
   - Recommendation: The `registerCanvasCore()` function uses `await import('echarts/core')` internally and calls `use()` on the returned object. Since ECharts uses a module-level global registry, this should work regardless of which dynamic import invocation calls `use()`. Validate during Phase 88 implementation.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` — skip this section.

---

## Sources

### Primary (HIGH confidence)
- `.planning/research/PITFALLS.md` — All 5 CRITICAL pitfalls + 6 HIGH pitfalls with code fixes; sourced from Apache ECharts GitHub issues #12327, #20475, #16044, echarts-gl GitHub Issue #253
- `.planning/research/STACK.md` — ECharts 5.6.0 vs 6.0.0 decision, echarts-gl peerDep constraint, tree-shaking patterns, package.json configuration
- `.planning/research/ARCHITECTURE.md` — Lifecycle mapping, Shadow DOM patterns, SSR approach, build order rationale
- `.planning/research/SUMMARY.md` — Cross-cutting summary with phase rationale for Phase 88 deliverables
- `.planning/research/FEATURES.md` — Per-requirement feature specification
- `.planning/REQUIREMENTS.md` — Phase 88 requirement IDs (INFRA-01 through STRM-04)
- `packages/core/src/tailwind-element.ts` — TailwindElement base class pattern; `isServer` import from `lit`
- `packages/data-table/package.json` — Canonical package.json structure for @lit-ui packages
- `packages/vite-config/library.js` — `createLibraryConfig()` Vite helper function
- `packages/typescript-config/base.json` — `moduleResolution: "bundler"`, `isolatedModules: true` — affects dynamic import typing approach

### Secondary (MEDIUM confidence)
- [Apache ECharts Import Handbook](https://apache.github.io/echarts-handbook/en/basics/import/) — tree-shaking patterns, ComposeOption utility
- [Apache ECharts SSR Handbook](https://apache.github.io/echarts-handbook/en/how-to/cross-platform/server/) — SSR placeholder approach
- [ecomfe/vue-echarts](https://github.com/ecomfe/vue-echarts) — Reference implementation for option API design (hybrid passthrough + declarative props)
- [DEV Community: ECharts + Lit + TypeScript](https://dev.to/manufac/using-apache-echarts-with-lit-and-typescript-1597) — Lifecycle pattern reference

### Tertiary (LOW confidence — directional only)
- None for this phase — all critical findings verified against official sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — ECharts 5.6.0/echarts-gl 2.0.9 decision verified from official peerDep inspection; package structure verified from existing @lit-ui packages in codebase
- Architecture: HIGH — BaseChartElement patterns verified from official Lit docs, ECharts handbook, and existing project codebase patterns (TailwindElement, isServer, dispatchCustomEvent)
- Pitfalls: HIGH — All 5 CRITICAL pitfalls traced to official Apache ECharts GitHub issues; confirmed unresolved as of 2026-02-28
- Streaming: HIGH — appendData/setOption boundary is a verified CRITICAL bug (Issue #12327); RAF batching pattern is standard browser API
- Open questions: MEDIUM — TypeScript dynamic import typing and dark mode re-application strategy require validation during implementation

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (stable ECharts ecosystem; valid until echarts-gl 3.x release which would change stack decision)
