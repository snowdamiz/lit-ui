# Pitfalls Research: v9.0 Charts System

**Domain:** ECharts + ECharts GL chart components in Lit.js 3 Shadow DOM web component library
**Researched:** 2026-02-28
**Confidence:** HIGH (verified against Apache ECharts GitHub issues, Lit docs, ECharts handbook, MDN WebGL specs, and multiple community reports)

---

## Critical Pitfalls

Mistakes that cause broken rendering, complete rewrites, or production crashes.

---

### CRITICAL-01: Initializing ECharts Before the Shadow DOM Container Has Layout Dimensions

**What goes wrong:**
`echarts.init()` is called in `connectedCallback()` or the body of `firstUpdated()` before the container div in the shadow root has received browser layout. ECharts reads `container.clientWidth` and `container.clientHeight` at init time — if both are 0, ECharts logs `"Can't get DOM width or height"` and silently renders an empty chart. The chart never draws even after data is set via `setOption`.

**Why it happens:**
Lit's `firstUpdated()` fires after the initial render microtask resolves, but microtasks resolve before the browser performs layout and paint. The shadow root's container element exists in the DOM but has no measured dimensions yet. Developers assume `firstUpdated` means "the DOM is ready" — it means the shadow DOM is rendered into the document, not that layout has completed.

**How to avoid:**
Wrap the `echarts.init()` call inside `requestAnimationFrame` after awaiting `updateComplete`. This defers until after the browser's next layout/paint cycle, guaranteeing real dimensions:

```typescript
async firstUpdated() {
  await this.updateComplete;
  requestAnimationFrame(() => {
    const container = this.shadowRoot!.querySelector<HTMLDivElement>('#chart')!;
    this._chart = echarts.init(container, null, { renderer: 'canvas' });
    this._chart.setOption(this._buildOption());
  });
}
```

Also ensure the container has explicit CSS dimensions before init. Use a CSS custom property with a fallback:

```css
:host {
  display: block;
  width: 100%;
  height: var(--ui-chart-height, 300px);
}
#chart {
  width: 100%;
  height: 100%;
}
```

**Warning signs:**
- Empty chart on first render but data is present
- Chart renders correctly after browser resize
- Console shows `"Can't get dom width or height"`
- Chart works in Storybook but not in production (different layout timing)

**Phase to address:** Phase 1 (Chart base component / `@lit-ui/charts` package setup)

---

### CRITICAL-02: ECharts GL Context Exhaustion — "Too Many Active WebGL Contexts"

**What goes wrong:**
Browsers enforce a hard limit of approximately 16 simultaneous WebGL contexts per page (exact limit varies by browser/driver). Each ECharts GL chart (`scatterGL`, `linesGL`, WebGL renderer) allocates at least one WebGL context per `zlevel`. When the page has more than ~12–16 GL charts simultaneously, or when charts are repeatedly created and destroyed without proper cleanup, the browser starts dropping the oldest contexts with `"WARNING: Too many active WebGL contexts. Oldest context will be lost."` — affected charts show a blank canvas or a frown icon.

**Why it happens:**
`chart.dispose()` alone does NOT fully release the WebGL context. The GPU memory and the WebGL context object itself can remain referenced until the garbage collector runs, which the browser may not do promptly. Each new chart created after hitting the limit causes the browser to forcibly destroy the oldest context on the page, corrupting any chart that was still using it.

**How to avoid:**
Before calling `chart.dispose()` in `disconnectedCallback()`, explicitly release the WebGL context using the `WEBGL_lose_context` extension:

```typescript
disconnectedCallback() {
  super.disconnectedCallback();
  if (this._chart) {
    // Release WebGL context before dispose — dispose() alone is insufficient
    const canvases = this._chart.getDom().getElementsByTagName('canvas');
    for (const canvas of Array.from(canvases)) {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    }
    this._chart.dispose();
    this._chart = null;
  }
  this._resizeObserver?.disconnect();
}
```

Additionally, in dashboards with many GL charts, limit simultaneous GL charts to 8–10 and document this as a constraint in the component API.

**Warning signs:**
- Multiple chart components on the same page (dashboards)
- SPA navigation that mounts/unmounts chart pages
- `echarts-gl` `scatterGL` or `linesGL` series in use
- Console shows "Too many active WebGL contexts" warning

**Phase to address:** Phase 1 (base component) — disposal pattern must be established before any GL chart is built. Phase 2 or 3 (first GL chart) — verify with explicit context release.

---

### CRITICAL-03: `appendData` + `setOption` Data Wipeout

**What goes wrong:**
A streaming chart uses `appendData()` to incrementally add data points. At some point, any call to `setOption()` — even to update a title, legend, color, or a completely unrelated option — silently clears all data previously loaded via `appendData`. The chart goes blank. This is a confirmed ECharts bug reported since v4.6.0 (GitHub Issue #12327) that has not been resolved as of ECharts 5.x.

**Why it happens:**
`setOption` performs a full diff-and-replace of the series data by design. When it detects that the new option has no explicit `data` field on a series that previously used `appendData`, it treats this as "remove all data." The two data-loading APIs (`appendData` and `setOption`) are architecturally incompatible for concurrent use on the same series.

**How to avoid:**
Choose one data loading strategy per chart component and never mix them:

- **For real-time streaming charts (line, scatter GL):** Use `appendData()` exclusively. Never call `setOption()` after the initial configuration. Store the full option at init time and do not update it during streaming. If chart options need to change during streaming (e.g., axis range, colors), `dispose()` and reinitialize the chart from scratch.

- **For charts with periodic full data replacement (bar, heatmap, pie):** Use `setOption({ notMerge: false })` exclusively. Never use `appendData`.

- **Architectural pattern:** Set the initial ECharts option once at component creation with all structural options (axes, grid, series config). After that, if streaming, use only `appendData`. Separate "structural update" from "data update."

**Warning signs:**
- Line/scatter chart clears during updates
- Streaming data disappears after style changes
- `setOption` called anywhere after `appendData` has run

**Phase to address:** Phase 2 (Line Chart with real-time streaming) — establish the boundary before building any streaming chart.

---

### CRITICAL-04: ECharts Crashes During SSR with `@lit-labs/ssr`

**What goes wrong:**
The existing LitUI library uses `@lit-labs/ssr` for server-side rendering. When a chart component is imported and rendered on the server, ECharts immediately throws `ReferenceError: window is not defined` during module evaluation — not during `echarts.init()`, but at import time, because ECharts probes `window` for environment detection when the module is first loaded. This crashes the entire SSR render pipeline for Next.js App Router and Astro users.

**Why it happens:**
ECharts accesses `window` and `document` at module evaluation time (confirmed in GitHub Issue #20475). Unlike most browser libraries that gate browser API access behind function calls, ECharts runs detection code at the module level. Node.js has no `window` object, so importing echarts in a Node.js process throws immediately.

**How to avoid:**
Apply a three-layer defense:

1. **Dynamic import in Lit lifecycle:** Never statically import `echarts` or `echarts-gl` at the top of a chart component module. Use dynamic `import()` inside `firstUpdated()` or a client-only lifecycle method:

```typescript
// WRONG — crashes SSR at module evaluation
import * as echarts from 'echarts/core';

// CORRECT — deferred to browser
async firstUpdated() {
  await this.updateComplete;
  const { init } = await import('echarts/core');
  // ... rest of init
}
```

2. **`isServer` guard from LitUI core:** Wrap any ECharts-related logic (consistent with the project's existing `isServer` guard pattern):

```typescript
import { isServer } from '@lit-labs/ssr/lib/is-server.js';

connectedCallback() {
  super.connectedCallback();
  if (isServer) return; // Skip all chart init on server
}
```

3. **Render a static placeholder during SSR:** In `render()`, detect server-side context and return a sized `<div>` placeholder with a `<slot>` for a static image fallback. This gives SSR something to render without importing ECharts.

**Warning signs:**
- Next.js App Router build fails with `window is not defined`
- Astro build crashes on chart component import
- Works in client-only apps but fails in SSR builds

**Phase to address:** Phase 1 (package setup) — the dynamic import pattern must be the foundation before any chart is built. Add SSR test in the existing Express/Node.js SSR example.

---

### CRITICAL-05: Shadow DOM Event Retargeting Breaks ECharts Pointer Hit Detection

**What goes wrong:**
ECharts' internal rendering engine (ZRender) calculates which chart element the user clicked on using `event.target` and the canvas's bounding rect. Inside a Shadow DOM, browser event retargeting changes `event.target` from the canvas element to the shadow host custom element. ZRender then calculates pointer coordinates relative to the wrong element, causing tooltip, click, and brush interactions to fire on wrong data points or not fire at all.

**Why it happens:**
When a composed event (click, mousemove, pointerdown) crosses a shadow boundary, the browser retargets `event.target` to the shadow host (`<lui-line-chart>`) to preserve encapsulation. ZRender uses `event.target.getBoundingClientRect()` internally for coordinate calculation. The shadow host and the canvas are the same size, but the canvas may have a different offsetParent, causing subtly wrong coordinates in certain layout contexts.

**How to avoid:**
This is primarily a ZRender/ECharts issue, but it manifests specifically in Shadow DOM contexts. The mitigation for v9.0 is:

1. **Ensure the canvas fills the shadow host 1:1:** Keep the `#chart` container at `position: absolute; inset: 0;` inside `:host { display: block; position: relative; }`. This makes the shadow host and canvas bounding rects identical, eliminating coordinate discrepancy.

2. **Do not use `position: fixed` or complex nesting** for chart containers in shadow roots — this is what causes the bounding rect mismatch.

3. **Test tooltip/click events early in Phase 1.** If events are wrong, the fix is layout-level, not a code patch.

4. **Note:** standard pointer events (`click`, `mousemove`) have `composed: true` and do cross the shadow boundary — the issue is retargeting the hit-test element, not event propagation itself.

**Warning signs:**
- Tooltip shows wrong data on hover
- Click events fire on adjacent data points
- Interaction issues only when chart is inside shadow DOM, not in a plain div

**Phase to address:** Phase 1 (base component) — verify event hit-testing works before building any interactive chart.

---

## High-Severity Pitfalls

Mistakes that cause significant bugs, performance failures, or developer experience problems.

---

### HIGH-01: `window.resize` Instead of `ResizeObserver` for Chart Resizing

**What goes wrong:**
Chart is initialized at 600px wide. Parent container is resized by CSS or JavaScript to 400px. The chart remains at 600px — it does not resize. `chart.resize()` is never called because the resize only affects the shadow root container, not the browser window.

**Why it happens:**
`window.addEventListener('resize', ...)` only fires when the browser viewport changes. Container-level resizing (caused by flex/grid layout changes, parent resizes, panel collapses) does not trigger window resize. Developers familiar with older charting libraries (Chart.js pre-3.0, ECharts without ResizeObserver) use window resize as a default.

**How to avoid:**
Use native `ResizeObserver` on the shadow root's chart container. Do NOT use `window.resize` or polyfill-based observers (`@juggle/resize-observer` — polyfills only observe main document mutations, not shadow root mutations):

```typescript
private _resizeObserver?: ResizeObserver;

firstUpdated() {
  // ... echarts.init() ...
  const container = this.shadowRoot!.querySelector('#chart')!;
  this._resizeObserver = new ResizeObserver(() => {
    this._chart?.resize();
  });
  this._resizeObserver.observe(container);
}

disconnectedCallback() {
  super.disconnectedCallback();
  this._resizeObserver?.disconnect();
  this._resizeObserver = undefined;
}
```

**Warning signs:**
- Chart overflows its container after layout changes
- Chart correct on initial render but wrong size after tab/panel changes
- Resize only works on browser window drag

**Phase to address:** Phase 1 (base component) — build this into the base `LitChartElement` class so all chart types inherit correct resize behavior.

---

### HIGH-02: Bundle Contamination — Importing `echarts-gl` into the Main LitUI Bundle

**What goes wrong:**
`import 'echarts-gl'` or `import { ScatterGLChart } from 'echarts-gl'` appears at the top of any chart component. Any user who installs `@lit-ui/charts` and imports even a simple line chart also downloads the full ECharts GL package (~1.5–2MB minified, ~500–600KB gzipped) even if they never use a WebGL chart. This makes the charts package unusable for projects with bundle size budgets.

**Why it happens:**
Tree-shaking does not eliminate ECharts GL. Unlike the base `echarts` package which has proper tree-shakeable subpath exports (`echarts/core`, `echarts/charts`, `echarts/components`), `echarts-gl` does not support the same granular tree-shaking and must be imported as a whole. Any static top-level import of `echarts-gl` loads the entire library unconditionally.

**How to avoid:**
Use dynamic imports at the component level for all GL-dependent chart types. GL charts (`ScatterGL`, `LinesGL`, `Bar3D`) must be separate component classes from their 2D counterparts:

```typescript
// lui-scatter-gl.ts — ONLY imports echarts-gl, dynamically
async firstUpdated() {
  await this.updateComplete;
  // Dynamically import both echarts and echarts-gl
  const [{ init, use }, { ScatterGLChart }, { CanvasRenderer }] = await Promise.all([
    import('echarts/core'),
    import('echarts-gl/charts'),
    import('echarts/renderers'),
  ]);
  use([ScatterGLChart, CanvasRenderer]);
  // ... init chart
}
```

Additionally, in the package's `package.json`, list `echarts-gl` as an optional peer dependency (not a regular dependency), so users who only need 2D charts don't install it at all:

```json
{
  "peerDependencies": {
    "echarts": ">=5.3.0",
    "echarts-gl": ">=2.0.0"
  },
  "peerDependenciesMeta": {
    "echarts-gl": { "optional": true }
  }
}
```

**Warning signs:**
- Bundle analyzer shows `echarts-gl` in the initial chunk
- `npx lit-ui add line-chart` installs echarts-gl as a dependency
- Any non-GL chart component file has a static `import ... from 'echarts-gl'`

**Phase to address:** Phase 1 (package setup) — the package.json peer dependency structure must be correct before any GL chart is built.

---

### HIGH-03: Real-Time Update Rate Exceeding ECharts Render Capacity

**What goes wrong:**
A streaming line chart connected to a WebSocket receives data at 50ms intervals (20 updates/second). `setOption()` is called on every message. The chart renders at only 3–5fps, appears to freeze, accumulates a backlog of pending updates, and eventually locks the browser's main thread.

**Why it happens:**
ECharts `setOption()` is a synchronous operation that performs a full diff of the chart state, recomputes layouts, and schedules a re-render. Calling it at 20Hz on a line chart with 10,000 points consumes ~10–30ms per call — far more than the 50ms update interval. The main thread is never free to process the render queue.

Additionally, ECharts internally batches renders using `requestAnimationFrame` (max ~60fps), so calling `setOption` at 20Hz with animations enabled means each update triggers an animated transition that won't complete before the next update arrives.

**How to avoid:**
1. **Disable ECharts animations for real-time streaming:**
   ```typescript
   this._chart.setOption({
     animation: false,
     animationDuration: 0,
   });
   ```

2. **Batch incoming data and call `setOption` (or `appendData`) at most once per animation frame using RAF coalescing:**
   ```typescript
   private _pendingData: [number, number][] = [];
   private _rafId?: number;

   onMessage(point: [number, number]) {
     this._pendingData.push(point);
     if (this._rafId === undefined) {
       this._rafId = requestAnimationFrame(() => {
         this._flush();
         this._rafId = undefined;
       });
     }
   }

   private _flush() {
     if (!this._pendingData.length) return;
     // appendData with accumulated points
     this._chart?.appendData({ seriesIndex: 0, data: this._pendingData });
     this._pendingData = [];
   }
   ```

3. **Use `TypedArray` (`Float32Array`) for data in appendData** — reduces garbage collection pressure compared to plain JS arrays.

4. **Cap displayed data window:** For a streaming line chart showing the last N seconds, maintain a circular buffer and only render a bounded dataset rather than accumulating all points indefinitely.

**Warning signs:**
- Chart update rate appears much lower than incoming data rate
- `setOption` calls visible in flame chart consuming main thread
- Browser tab becomes unresponsive during streaming
- `requestAnimationFrame` callbacks queuing behind each other

**Phase to address:** Phase 2 (Line Chart) — streaming architecture must be established at the first real-time chart.

---

### HIGH-04: ECharts Memory Leak — `dispose()` Without `null` Assignment

**What goes wrong:**
`chart.dispose()` is called in `disconnectedCallback()`, but the component property `this._chart` retains the reference to the disposed ECharts instance. Chrome heap snapshots show ECharts instance objects accumulating in memory, each holding references to DOM nodes (the chart container divs from previous shadow roots), keeping them alive even after disconnection. Memory grows on every SPA navigation.

**Why it happens:**
`chart.dispose()` cleans up internal ECharts state and removes canvas elements but does not release the JavaScript reference to the ECharts instance object itself. The instance object has closures and internal references that keep a subgraph of objects alive. The Lit component property `this._chart` is the remaining root reference preventing GC.

**How to avoid:**
Always `null` the reference immediately after `dispose()`:

```typescript
disconnectedCallback() {
  super.disconnectedCallback();
  this._resizeObserver?.disconnect();
  this._resizeObserver = undefined;
  if (this._chart) {
    this._chart.dispose();
    this._chart = null; // REQUIRED — dispose() alone leaves the reference alive
  }
}
```

Also null the reference in error recovery paths and component property setters.

**Warning signs:**
- Memory profiler shows ECharts instances accumulating across route navigations
- `echarts.getInstanceByDom(container)` returns an instance after disconnect
- Component count in memory grows unbounded

**Phase to address:** Phase 1 (base component) — establish the disposal pattern in the base class so all chart types inherit it correctly.

---

### HIGH-05: CSS Custom Properties Not Resolved When Building ECharts Theme Object

**What goes wrong:**
The LitUI design system uses `--ui-*` CSS custom properties for all theming (colors, radius, spacing). A developer tries to use these tokens directly in the ECharts option object:

```typescript
// BROKEN — ECharts canvas does not resolve CSS variables
this._chart.setOption({
  color: ['var(--ui-color-primary)', 'var(--ui-color-secondary)'],
});
```

The chart renders with `var(--ui-color-primary)` as a literal string color, which is invalid CSS for a canvas context. Canvas `fillStyle` does not evaluate CSS custom properties. ECharts silently ignores invalid colors and falls back to its own defaults.

**Why it happens:**
ECharts renders to a `<canvas>` element. The Canvas 2D API resolves colors at draw time using the browser's CSS parser, but CSS custom properties are not evaluated by the canvas context — only by the CSS cascade. The ECharts team has explicitly declined to add native CSS variable support, stating they want to keep the API platform-independent. (GitHub Issue #16044)

**How to avoid:**
Read resolved CSS custom property values before building the ECharts option. Use `getComputedStyle` on the host element, which is inside the shadow DOM and can access inherited `--ui-*` values:

```typescript
private _readToken(name: string, fallback: string): string {
  return (
    getComputedStyle(this).getPropertyValue(name).trim() || fallback
  );
}

private _buildTheme() {
  return {
    color: [
      this._readToken('--ui-color-primary', '#3b82f6'),
      this._readToken('--ui-color-secondary', '#8b5cf6'),
      this._readToken('--ui-color-success', '#10b981'),
      this._readToken('--ui-color-warning', '#f59e0b'),
      this._readToken('--ui-color-danger', '#ef4444'),
    ],
    textStyle: {
      color: this._readToken('--ui-color-foreground', '#0f172a'),
      fontFamily: this._readToken('--ui-font-sans', 'system-ui'),
    },
  };
}
```

Call `_buildTheme()` inside `firstUpdated()` (after the element is in the DOM and can see inherited CSS), and rebuild when the host document switches dark/light mode.

For dark mode support: `setOption` must be called again when `.dark` class toggles on the document root. Observe this with a `MutationObserver` on `document.documentElement`.

**Warning signs:**
- Chart colors don't match the rest of the design system
- Chart colors are ECharts defaults (blue, orange, green) not `--ui-*` values
- `var(--ui-...)` visible as literal text in a canvas debugger

**Phase to address:** Phase 1 (base component) — establish the `_readToken` / `_buildTheme` pattern before any chart uses color tokens.

---

### HIGH-06: WebGL Not Available — No Fallback to 2D Canvas

**What goes wrong:**
A user runs a WebGL chart on a corporate machine with GPU acceleration disabled (common in enterprise environments, VMs, and some mobile browsers). `echarts-gl` silently fails to initialize or logs a cryptic WebGL error. The chart renders as a blank space with no error message to the user.

**Why it happens:**
ECharts GL assumes WebGL is available and does not provide automatic fallback. In environments where WebGL is blocked (corporate proxy, hardware acceleration disabled, headless browser), `canvas.getContext('webgl')` returns `null` and ECharts GL throws or silently no-ops.

**How to avoid:**
Implement WebGL feature detection before initializing any GL chart, and provide a graceful fallback:

```typescript
private _isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

async firstUpdated() {
  await this.updateComplete;
  requestAnimationFrame(async () => {
    if (!this._isWebGLSupported()) {
      this._webglUnavailable = true;
      this.requestUpdate();
      return;
    }
    // Proceed with echarts-gl init
  });
}
```

Render a fallback message or a 2D chart equivalent when `_webglUnavailable` is true. Expose a `webgl-unavailable` custom event so the host application can handle it.

**Warning signs:**
- Blank chart space in enterprise/VM environments
- No console error shown to user
- Works in Chrome/Firefox dev machines but not in QA environment

**Phase to address:** Phase 3 or whichever phase introduces the first GL chart (Scatter GL).

---

## Medium-Severity Pitfalls

Mistakes that cause technical debt, DX problems, or non-obvious bugs.

---

### MEDIUM-01: Using `notMerge: true` on Every `setOption` Call

**What goes wrong:**
The developer sets `notMerge: true` on every `setOption` call to ensure a "clean" update. This causes ECharts to destroy and recreate every chart element on each update — axes, legend, grid, tooltip, series — rather than diffing. The smooth update animations stop working. CPU usage spikes on each update. Canvas flickers on fast updates.

**Why it happens:**
`notMerge: true` is found in many ECharts code snippets and tutorials as a safe default. Developers use it to avoid stale option merging without understanding the performance cost.

**How to avoid:**
Use `notMerge: false` (the default) for most updates. Use `notMerge: true` only when fundamentally changing the chart type or removing series. For data updates, let ECharts' diff engine handle transitions. For option structure changes, `notMerge: true` is appropriate exactly once during a reconfiguration, not as a runtime default.

**Phase to address:** Phase 2+ (all chart update paths)

---

### MEDIUM-02: Initializing Multiple ECharts Instances with the Same Container DOM Element

**What goes wrong:**
A chart component is disconnected and reconnected to the DOM (e.g., by moving it in the document, or via framework keyed list reconciliation). On reconnect, `firstUpdated` is called again and `echarts.init()` is called on a container that still has an ECharts instance attached (from the previous connection). ECharts throws `"Already have an echarts instance"` and the chart does not reinitialize.

**Why it happens:**
`firstUpdated` in Lit runs only once per component lifetime — but if the component is moved in the DOM (not disconnected/reconnected as a new element), `connectedCallback` fires without `firstUpdated`. If `echarts.init()` is called in `connectedCallback` without checking for an existing instance, the double-init error occurs.

**How to avoid:**
Always check for an existing ECharts instance before calling `init()`:

```typescript
connectedCallback() {
  super.connectedCallback();
  if (this._chart && !this._chart.isDisposed()) {
    // Chart already initialized — just call resize in case dimensions changed
    this._chart.resize();
    return;
  }
}
```

Or, use `echarts.getInstanceByDom(container)` and dispose before reinitializing:

```typescript
const existing = echarts.getInstanceByDom(container);
if (existing) existing.dispose();
this._chart = echarts.init(container, ...);
```

**Phase to address:** Phase 1 (base component) — guard this in the base class.

---

### MEDIUM-03: `appendData` Is Incompatible with `dataset`

**What goes wrong:**
A developer reads the ECharts handbook chapter on `dataset` for efficient data sharing across series. They implement a streaming chart using `dataset` for data management, then try to use `appendData` to incrementally add points. `appendData` silently does nothing when a series is bound to a `dataset` — it only works with inline series `data` arrays.

**Why it happens:**
ECharts documentation for `appendData` and `dataset` is in separate handbook sections. The incompatibility is noted in a footnote of the `appendData` docs: "Note: Streaming cannot be used with datasets."

**How to avoid:**
For any chart that needs streaming, use inline `series.data` arrays (not `dataset`). Reserve `dataset` for static or fully-replaced charts (bar, pie, heatmap). Document this constraint in the streaming chart API.

**Phase to address:** Phase 2 (Line Chart) — streaming architecture decision.

---

### MEDIUM-04: Dark Mode Theme Not Rebuilt on Document Class Change

**What goes wrong:**
ECharts theme is built from `--ui-*` CSS tokens at component init time. User toggles dark mode on the page (`.dark` class added to `<html>`). All other LitUI components update via `:host-context(.dark)` CSS. The chart does not update because ECharts themes are JavaScript objects passed to the chart at init — CSS cascade changes do not propagate into the canvas.

**Why it happens:**
Unlike HTML elements styled via CSS, ECharts draws to a canvas using JavaScript-resolved color values. Once the theme object is built and passed to ECharts, changing the CSS tokens has no effect unless the chart is explicitly told to re-read them.

**How to avoid:**
Observe `document.documentElement` for class mutations and rebuild the theme on dark/light toggle:

```typescript
private _colorSchemeObserver?: MutationObserver;

firstUpdated() {
  // ... chart init ...
  this._colorSchemeObserver = new MutationObserver(() => {
    this._applyTheme(); // Re-read --ui-* tokens and call setOption with new colors
  });
  this._colorSchemeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

disconnectedCallback() {
  super.disconnectedCallback();
  this._colorSchemeObserver?.disconnect();
  // ...
}
```

**Phase to address:** Phase 1 (base component) or Phase 5 (CSS token theming system phase).

---

### MEDIUM-05: `echarts-gl` `scatterGL` Cannot Be Tree-Shaken

**What goes wrong:**
A developer follows ECharts' tree-shaking guide and imports only `LineChart`, `BarChart`, `CanvasRenderer` from `echarts/charts` and `echarts/renderers`. This produces a correctly minimized bundle for 2D charts. They then add `scatterGL` from `echarts-gl`. Unlike base ECharts, `echarts-gl` does not expose subpath exports for individual chart types — importing `echarts-gl/charts` for just `ScatterGLChart` pulls in the entire `echarts-gl` module including all 3D primitives, globe, and bar3D.

**How to avoid:**
Accept this limitation. Isolate `echarts-gl` entirely to GL-specific component files (never imported by 2D chart components), use dynamic `import()` to lazy-load the GL module, and list `echarts-gl` as an optional peer dependency. The GL bundle will always be ~500–600KB gzipped for any GL chart — there is no granular tree-shaking available as of early 2026.

**Phase to address:** Phase 1 (package architecture decision) — document this constraint explicitly.

---

## Performance Traps

Patterns that work at small scale but degrade severely with larger datasets or higher update frequencies.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Plain JS arrays for streaming data | GC pauses during rapid updates, stuttering | Use `Float32Array`/`Int32Array` for appendData | > 10,000 points / > 10 updates/sec |
| `setOption` on every incoming data event | Main thread lock, <5fps chart updates | Batch with RAF coalescing, call at most 1× per frame | > 5 updates/sec |
| ResizeObserver without debounce | Multiple resize calls per drag pixel | Not critical for ECharts (resize is cheap), but add 16ms debounce if triggering redraws elsewhere | Continuous resize drag |
| Multiple GL charts on same page without context limits | "Too many WebGL contexts" warning, charts go blank | Cap at 8 simultaneous GL chart instances, explicit loseContext on dispose | > 12 GL charts visible simultaneously |
| `animation: true` (default) on streaming charts | Transitions pile up behind real-time data, visible lag | Set `animation: false` at chart init for any streaming chart type | > 5 updates/sec with animations |
| Loading full `echarts` (not tree-shaken) in each chart component | All chart types download 1MB+ even if user only uses one | Use `echarts/core` + selective imports + `echarts.use()` in every chart file | Always — this is a baseline requirement |
| `notMerge: true` as default `setOption` flag | CPU spike per update, animation disabled | Use `notMerge: false` (default); only use `true` for structural chart reconfiguration | Any update faster than ~2 seconds |

---

## Integration Gotchas

Common mistakes when connecting to external systems.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SSR frameworks (Next.js, Astro) | Static import of `echarts` at module top level | Dynamic `import()` inside `firstUpdated()` with `isServer` guard |
| CSS token system (`--ui-*`) | Passing `var(--ui-...)` strings directly to ECharts | `getComputedStyle(this).getPropertyValue('--ui-...')` to resolve values before passing to ECharts |
| Dark mode toggle | Build theme once at init, never update | MutationObserver on `document.documentElement` class, rebuild theme on change |
| WebSocket streaming | Call `setOption` on every message | Batch in RAF queue; use `appendData` for line/scatter series |
| SPA navigation (Vue Router, React Router) | `dispose()` without nulling reference, no `loseContext()` | Full cleanup: `loseContext()` → `dispose()` → `null` → `observer.disconnect()` |
| CLI `npx lit-ui add scatter-gl` | Installing `echarts-gl` as a regular dependency for 2D-only users | Make `echarts-gl` an optional peer dependency in `@lit-ui/charts` |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Chart renders:** Verify it also renders correctly when the host container has `display: none` → `display: block` transition (common with tab panels). ECharts may have zero-dimension on first render if inside a hidden panel.
- [ ] **Real-time chart:** Verify WebSocket disconnect and reconnect does not accumulate duplicate ECharts instances or unbounded memory growth.
- [ ] **Dark mode:** Verify chart colors actually change when `.dark` is toggled on `<html>`, not just CSS-styled elements around the chart.
- [ ] **SSR build:** Verify `npm run build` for the Next.js App Router example does not crash with `window is not defined` after adding any chart component.
- [ ] **Multiple charts on page:** Verify 10 GL charts on a single page show no "too many WebGL contexts" warning and all render correctly.
- [ ] **Dispose on unmount:** Verify memory profiler shows no chart instance or canvas element accumulation after 10 mount/unmount cycles.
- [ ] **CSS token theming:** Verify `getPropertyValue` returns a non-empty string — in copy-source mode, `--ui-color-primary` may not be defined if the user hasn't imported the token system. All `_readToken` calls need a non-empty fallback value.
- [ ] **Chart resize in tab panel:** Verify chart calls `resize()` when a hidden tab becomes visible. Lit's tab component dispatches a custom `tab-changed` event — the chart component should listen and call `this._chart?.resize()`.
- [ ] **appendData max data cap:** Verify the streaming chart does not grow unbounded in memory — implement a max-points cap and rolling window.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CRITICAL-01: Zero-dimension init | LOW | Add `requestAnimationFrame` wrapper around `echarts.init()`. Redeploy. |
| CRITICAL-02: WebGL context exhaustion | MEDIUM | Add `loseContext()` before `dispose()` in all GL chart components. Test in isolation then with full dashboard. |
| CRITICAL-03: appendData + setOption wipeout | HIGH | Audit all `setOption` calls in streaming chart components. Split into "init setOption" (once) and "data update via appendData" (streaming). Possible architectural rewrite of streaming chart. |
| CRITICAL-04: SSR crash | MEDIUM | Convert all ECharts imports to dynamic `import()` in lifecycle methods. Add `isServer` guard. Add SSR test to CI. |
| CRITICAL-05: Shadow DOM event offset | LOW-MEDIUM | Fix host element layout to `position: relative; display: block` with chart container `position: absolute; inset: 0`. Verify bounding rects match. |
| HIGH-01: window.resize instead of ResizeObserver | LOW | Replace `window.addEventListener('resize', ...)` with `ResizeObserver` on container. Clean up in disconnect. |
| HIGH-02: Bundle contamination from echarts-gl | HIGH | Move all GL chart components to dynamic imports. Update package.json to optional peer dependency. Requires restructuring component module graph. |
| HIGH-05: CSS tokens not resolving | LOW | Add `getComputedStyle` resolution step. Add non-empty fallbacks to all token reads. |
| MEDIUM-04: Dark mode not updating | LOW | Add MutationObserver on documentElement. Rebuild theme on class change. |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CRITICAL-01: Zero-dimension init | Phase 1 (base component) | Automated test: render chart in hidden container, show, verify dimensions |
| CRITICAL-02: WebGL context exhaustion | Phase 1 (disposal pattern) + Phase 3 (first GL chart) | Manual test: 15 GL chart instances on one page, verify zero warnings |
| CRITICAL-03: appendData + setOption wipeout | Phase 2 (Line Chart streaming) | Unit test: appendData, then setOption(title), verify data not cleared |
| CRITICAL-04: SSR crash | Phase 1 (package setup) | CI: add chart import to Next.js App Router example, verify build |
| CRITICAL-05: Shadow DOM event hit-test | Phase 1 (base component) | Manual test: click data points in shadow DOM, verify correct tooltip |
| HIGH-01: ResizeObserver | Phase 1 (base component) | Manual test: resize container via CSS, verify chart resizes |
| HIGH-02: Bundle contamination | Phase 1 (package structure) | Bundle analyzer: verify echarts-gl absent from line-chart chunk |
| HIGH-03: Update rate overload | Phase 2 (streaming architecture) | Performance test: 50ms interval, verify 60fps chart rendering |
| HIGH-04: Dispose memory leak | Phase 1 (base component) | Memory profiler: 10 mount/unmount cycles, verify no instance growth |
| HIGH-05: CSS tokens not resolving | Phase 1 (base component) + Phase 5 (theming) | Visual test: verify chart colors match `--ui-color-primary` |
| HIGH-06: WebGL not available fallback | Phase 3 (first GL chart) | Test with hardware acceleration disabled, verify fallback renders |
| MEDIUM-01: notMerge: true default | Phase 2+ (chart updates) | Code review: search for `notMerge: true` in update call paths |
| MEDIUM-02: Double-init on reconnect | Phase 1 (base component) | Test: move chart element in DOM, verify no double-init error |
| MEDIUM-04: Dark mode not updating | Phase 5 (theming) | Manual test: toggle dark mode, verify chart colors change |
| MEDIUM-05: echarts-gl tree-shaking | Phase 1 (package architecture) | Bundle analyzer: verify GL code absent from 2D chart bundles |

---

## Sources

- [Apache ECharts GitHub Issue #12327](https://github.com/apache/echarts/issues/12327) — `setOption` clears data after `appendData`
- [Apache ECharts GitHub Issue #20475](https://github.com/apache/echarts/issues/20475) — `window is not defined` in Next.js SSR
- [Apache ECharts GitHub Issue #16044](https://github.com/apache/echarts/issues/16044) — CSS variables not supported natively
- [Apache ECharts GitHub Issue #18312](https://github.com/apache/echarts/issues/18312) — Real-time updates performance regression in ECharts 5
- [ECharts GL GitHub Issue #253](https://github.com/ecomfe/echarts-gl/issues/253) — Too many active WebGL contexts, loseContext workaround
- [ECharts GL GitHub Issue #439](https://github.com/ecomfe/echarts-gl/issues/439) — Shared WebGL context solution proposal
- [Apache ECharts Handbook — Import (Tree Shaking)](https://apache.github.io/echarts-handbook/en/basics/import/)
- [Apache ECharts Handbook — Server-Side Rendering](https://apache.github.io/echarts-handbook/en/how-to/cross-platform/server/)
- [Apache ECharts Handbook — Dynamic Data](https://apache.github.io/echarts-handbook/en/how-to/data/dynamic-data/)
- [Apache ECharts Handbook — Chart Container and Size](https://apache.github.io/echarts-handbook/en/concepts/chart-size/)
- [DEV Community — Using Apache ECharts with Lit and TypeScript](https://dev.to/manufac/using-apache-echarts-with-lit-and-typescript-1597)
- [Medium — Memory Leak from ECharts if Not Properly Disposed](https://medium.com/@kelvinausoftware/memory-leak-from-echarts-occurs-if-not-properly-disposed-7050c5d93028)
- [GitHub vue-echarts Issue #613](https://github.com/ecomfe/vue-echarts/issues/613) — Chart does not render in Shadow DOM
- [Lit GitHub Issue #3770](https://github.com/lit/lit/issues/3770) — `window is not defined` in SSR with Lit
- [Khronos WebGL Wiki — Handling Context Lost](https://www.khronos.org/webgl/wiki/HandlingContextLost)
- [MDN — webglcontextlost event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event)
- [MDN — ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [ECharts Design Token Discussion](https://github.com/apache/echarts/issues/20202)

---
*Pitfalls research for: ECharts + ECharts GL in Lit.js 3 Shadow DOM component library (v9.0 Charts System)*
*Researched: 2026-02-28*
