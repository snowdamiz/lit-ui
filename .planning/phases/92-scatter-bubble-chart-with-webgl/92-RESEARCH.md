# Phase 92: Scatter + Bubble Chart with WebGL - Research

**Researched:** 2026-02-28
**Domain:** ECharts 5.6.0 ScatterChart (Canvas) + echarts-gl 2.0.9 ScatterGLChart (WebGL) — concrete Lit web component extending BaseChartElement with bubble mode, WebGL path switching, and streaming
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCAT-01 | Developer can render a scatter chart with optional bubble size dimension (`bubble` mode) | ECharts `ScatterChart` module with `type: 'scatter'` series; data format `[x, y]` for scatter, `[x, y, r]` for bubble; bubble sizing via `symbolSize` callback that reads `value[2]` (third data dimension); `bubble` attribute on component controls which data format is expected and whether symbolSize callback is installed |
| SCAT-02 | Developer can enable WebGL rendering for 500K+ point datasets via `enable-gl` attribute (ScatterGL via echarts-gl) | `enable-gl` attribute already handled in `BaseChartElement._maybeLoadGl()` which dynamically imports `echarts-gl`; when loaded, component must use `type: 'scatterGL'` series (NOT `type: 'scatter'`); series type selection must be runtime-conditional on `this.enableGl && !this._webglUnavailable`; scatterGL does NOT support `appendData` — GL path uses `setOption` with full buffer, Canvas path also uses circular buffer (both are `_streamingMode = 'buffer'`) |
| SCAT-03 | Developer can stream data points into a scatter chart via `pushData()` with circular buffer | Base class `_streamingMode = 'buffer'` (the default) provides circular buffer + `setOption({ series: [{ data }] }, { lazyUpdate: true })`; scatter data shape is `[number, number]` (scatter) or `[number, number, number]` (bubble); same buffer path for BOTH Canvas and GL rendering |
</phase_requirements>

---

## Summary

Phase 92 builds `LuiScatterChart` (`lui-scatter-chart`) extending `BaseChartElement`. The chart supports two rendering modes at the series level: standard Canvas (`type: 'scatter'`) and WebGL (`type: 'scatterGL'` via echarts-gl). The `enable-gl` attribute from BaseChartElement already triggers the echarts-gl dynamic import; Phase 92's primary responsibility is making `buildScatterOption()` emit the correct series type based on `this.enableGl`.

The most significant Phase 92-specific complexity is the **dual series type selection at option build time**. Unlike all previous chart types (line, bar, pie) which always use the same ECharts series type, scatter must conditionally use `type: 'scatter'` (Canvas) or `type: 'scatterGL'` (WebGL). The component must inspect `this.enableGl && !this._webglUnavailable` and pass that as a flag to `buildScatterOption()`. The BaseChartElement already handles the echarts-gl import — Phase 92 just needs to read the resolved state.

**Critical finding:** echarts-gl 2.0.9's `scatterGL` does NOT implement `appendData` — only `linesGL` does. The success criteria description of "appendData for GL" is misleading relative to the actual echarts-gl source code. For both Canvas and GL modes, scatter uses the circular buffer path (`_streamingMode = 'buffer'`). The `scatterGL` progressive rendering (100K points per chunk via `progressive: 1e5`) handles large datasets via GPU batching, not `appendData`. Do NOT set `_streamingMode = 'appendData'` for scatter charts.

The bubble mode (SCAT-01) adds a third dimension to each data point: `[x, y, size]`. The `symbolSize` callback reads `value[2]` to set per-point symbol sizes. When `bubble` mode is active, the option builder installs the callback; otherwise a fixed `symbolSize` is used.

**Primary recommendation:** Implement `LuiScatterChart` following the Phase 90/91 pattern. Create `scatter-registry.ts`, `scatter-option-builder.ts`, and `scatter-chart.ts`. The `bubble` boolean prop controls whether the symbolSize callback is installed. The `enableGl` prop (from base) controls whether `type: 'scatterGL'` is emitted. Both streaming paths use `_streamingMode = 'buffer'` — the base class default.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts | ^5.6.0 (already installed) | Chart engine — `ScatterChart` module | Already in `packages/charts/` dependencies from Phase 88; `ScatterChart` export confirmed in `echarts/charts` type declarations |
| echarts-gl | ^2.0.9 (already installed) | `ScatterGLChart` for WebGL scatter | Already in `packages/charts/` dependencies from Phase 88; `ScatterGLChart` export confirmed in `echarts-gl/lib/export/charts.js`; dynamically imported via base class `_maybeLoadGl()` |
| lit | ^3.3.2 (peer) | Web component base | Project baseline; `BaseChartElement` already extends it |
| @lit-ui/core | workspace:* (peer) | TailwindElement, CSS tokens | Inherited via BaseChartElement |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| echarts/charts — ScatterChart | subpath of echarts@5.6.0 | Registers ECharts 2D scatter series renderer | Imported dynamically in `_registerModules()`; covers both scatter and bubble modes (`symbolSize` callback = bubble) |
| echarts-gl/charts — ScatterGLChart | subpath of echarts-gl@2.0.9 | Registers WebGL-accelerated scatter series | Import from `echarts-gl/charts` in scatter-registry.ts ONLY when GL is needed; base `_maybeLoadGl()` does side-effect `import('echarts-gl')` but the named export is needed for explicit `use()` registration |
| registerCanvasCore | internal (canvas-core.ts) | Registers shared ECharts components (Grid, Tooltip, Legend, etc.) | Already called first in all chart registries |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `symbolSize` callback for bubble | `visualMap` component for size | `visualMap` requires registering `VisualMapComponent` (not in canvas-core.ts) and adds a legend widget. `symbolSize: (val) => val[2]` is zero extra components and directly encodes size. Use `visualMap` only for color-by-value (different use case). |
| GL detection via `this.enableGl` flag | Separate `LuiScatterGLChart` component | Same component with adaptive series type is the correct API per SCAT-02: "no visible change in the component API". |
| Fixed `symbolSize` for bubble | Per-point `symbolSize` in data item | Per-point symbolSize in `ScatterDataItemOption` is valid but requires object data format `[{ value: [x,y], symbolSize: r }, ...]`. The callback form with array data `[x,y,r]` is simpler for streaming. |

**Installation:** No new packages needed. `ScatterChart` and `ScatterGLChart` are already available in the installed packages.

---

## Architecture Patterns

### Recommended Project Structure
```
packages/charts/src/
├── base/
│   ├── base-chart-element.ts      # (Phase 88, complete) — enableGl, _webglUnavailable
│   └── theme-bridge.ts            # (Phase 88, complete)
├── registry/
│   └── canvas-core.ts             # (Phase 88, complete)
├── shared/
│   ├── line-option-builder.ts     # (Phase 89, complete)
│   ├── bar-option-builder.ts      # (Phase 90, complete)
│   ├── pie-option-builder.ts      # (Phase 91, complete)
│   └── scatter-option-builder.ts  # NEW Phase 92 — buildScatterOption() + types
├── scatter/
│   ├── scatter-chart.ts           # NEW Phase 92 — LuiScatterChart class
│   └── scatter-registry.ts        # NEW Phase 92 — registerScatterModules()
└── index.ts                       # Updated to export LuiScatterChart + scatter types
```

### Pattern 1: Conditional Series Type Based on WebGL Availability
**What:** `buildScatterOption()` receives `useGl: boolean` and emits `type: 'scatterGL'` or `type: 'scatter'` accordingly. The component passes `this.enableGl && !this._webglUnavailable` as the flag. BaseChartElement tracks `_webglUnavailable` as a private field — it becomes `true` when `_isWebGLSupported()` returns false inside `_maybeLoadGl()`.

**When to use:** Always — the GL/Canvas split is the core architectural decision for Phase 92.

**Critical note about `_webglUnavailable`:** This field is `private` in BaseChartElement. The concrete scatter chart class needs read access to determine which series type to emit. Options:
1. Make `_webglUnavailable` `protected` in BaseChartElement (cleanest — allows subclass to read it)
2. Or infer from `this.enableGl` alone — but this incorrectly uses scatterGL type even if WebGL probe failed

**Recommendation:** Change `_webglUnavailable` from `private` to `protected` in `base-chart-element.ts` so scatter chart (and future charts) can query it. This is a one-line change with no behavioral impact.

```typescript
// Source: base-chart-element.ts line 123 — change from private to protected
/** Set to true when WebGL probe fails — used for diagnostics. */
protected _webglUnavailable = false;

// In scatter-chart.ts — how the flag is used:
private _applyData(): void {
  if (!this._chart || !this.data) return;
  const useGl = this.enableGl && !this._webglUnavailable;
  const option = buildScatterOption(this.data as ScatterPoint[], {
    bubble: this.bubble,
    useGl,
  });
  this._chart.setOption(option, { notMerge: false });
}
```

### Pattern 2: Scatter Option Builder
**What:** `buildScatterOption()` builds the complete ECharts option for scatter/bubble charts. Key decisions:
- `type: 'scatter'` vs `type: 'scatterGL'` based on `useGl`
- `symbolSize: (val) => val[2]` callback when `bubble: true` (reads third dimension as size)
- Fixed `symbolSize: 10` when `bubble: false`
- Standard `xAxis: { type: 'value' }`, `yAxis: { type: 'value' }` for both modes

```typescript
// Source: ScatterSeriesOption from echarts/types/dist/shared.d.ts line 9767-9773
// Source: ScatterGLSeries.js defaultOption from echarts-gl 2.0.9 source

export type ScatterPoint = [number, number] | [number, number, number];

export type ScatterOptionProps = {
  // SCAT-01: When true, expects [x, y, size] data; symbolSize reads value[2].
  bubble?: boolean;
  // SCAT-02: When true, emits type: 'scatterGL' (WebGL series). Default: false (Canvas).
  useGl?: boolean;
  // Optional fixed symbol size when bubble is false. Default: 10.
  symbolSize?: number;
};

export function buildScatterOption(
  data: ScatterPoint[],
  props: ScatterOptionProps
): Record<string, unknown> {
  const seriesType = props.useGl ? 'scatterGL' : 'scatter';

  const series: Record<string, unknown> = {
    type: seriesType,
    data,
    // SCAT-01: Bubble mode — symbolSize callback reads value[2] as radius.
    // Fixed size when not in bubble mode. scatterGL supports symbolSize as number; callback
    // is Canvas-only (scatterGL does not support symbolSize callbacks — see pitfall below).
    symbolSize: props.bubble
      ? (value: number[]) => value[2] ?? 10
      : (props.symbolSize ?? 10),
  };

  // scatterGL-specific options for large dataset performance
  if (props.useGl) {
    series['progressive'] = 1e5;        // default in ScatterGLSeries — kept for explicitness
    series['progressiveThreshold'] = 1e5;
    series['blendMode'] = 'source-over';
  }

  return {
    grid: { containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'value' },
    tooltip: {
      trigger: 'item',
      formatter: props.bubble
        ? (params: Record<string, unknown>) => {
            const val = params['value'] as number[];
            return `(${val[0]}, ${val[1]}) size: ${val[2]}`;
          }
        : undefined,
    },
    series: [series],
  };
}
```

### Pattern 3: Scatter Registry
**What:** `scatter-registry.ts` registers both `ScatterChart` (Canvas) and `ScatterGLChart` (WebGL). The scatter chart is the first chart type that needs GL module registration beyond the side-effect `import('echarts-gl')` already done in `_maybeLoadGl()`. The registry needs to call `use([ScatterGLChart])` via the named export from `echarts-gl/charts` to properly register the GL series type with ECharts.

**Critical note:** The base `_maybeLoadGl()` does `await import('echarts-gl')` as a side-effect-only import. This globally registers echarts-gl extensions including scatterGL. However, for the tree-shaken `echarts/core` path used by this project, calling `use([ScatterGLChart])` explicitly is the correct approach for clarity and TypeScript compatibility.

```typescript
// Source: bar-registry.ts Phase 90 pattern + ScatterGLChart confirmed in echarts-gl/lib/export/charts.js
// Source: base-chart-element.ts _maybeLoadGl() — side-effect import already done

let _scatterRegistered = false;

export async function registerScatterModules(): Promise<void> {
  if (_scatterRegistered) return;
  _scatterRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ ScatterChart }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/core'),
  ]);

  use([ScatterChart]);

  // ScatterGLChart registration:
  // Note: base _maybeLoadGl() does side-effect `import('echarts-gl')` which self-registers.
  // The explicit use() call here ensures tree-shaken builds include the correct module.
  // @ts-ignore: echarts-gl 2.0.9 does not ship TypeScript type declarations for subpaths.
  // Type shim (declare module 'echarts-gl/charts') is created in this phase per STATE.md blocker.
  const { ScatterGLChart } = await import('echarts-gl/charts');
  use([ScatterGLChart]);
}
```

### Pattern 4: LuiScatterChart Component
**What:** Extends `BaseChartElement`. Reactive props: `bubble` (boolean). NO `_streamingMode` override — inherits base `'buffer'` default. Both Canvas and GL paths use circular buffer + setOption.

```typescript
// Source: bar-chart.ts Phase 90 pattern + pie-chart.ts Phase 91 pattern
// packages/charts/src/scatter/scatter-chart.ts

import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerScatterModules } from './scatter-registry.js';
import { buildScatterOption, type ScatterPoint } from '../shared/scatter-option-builder.js';

export class LuiScatterChart extends BaseChartElement {
  // NO _streamingMode override — base 'buffer' is correct for scatter charts.
  // SCAT-03: Uses circular buffer path for BOTH Canvas and GL rendering.
  // scatterGL does not support appendData (only linesGL does in echarts-gl 2.0.9).

  // SCAT-01: Bubble mode — adds third dimension as symbol size.
  // When true: data format is [x, y, size]. When false: data format is [x, y].
  @property({ type: Boolean }) bubble = false;

  protected override async _registerModules(): Promise<void> {
    await registerScatterModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // base handles this.option passthrough and this.loading state
    if (!this._chart) return;
    const scatterProps = ['data', 'bubble', 'enableGl'] as const;
    if (scatterProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart || !this.data) return;
    // SCAT-02: useGl requires both enableGl AND successful WebGL probe.
    // _webglUnavailable must be 'protected' (not 'private') in BaseChartElement.
    const useGl = this.enableGl && !this._webglUnavailable;
    const option = buildScatterOption(this.data as ScatterPoint[], {
      bubble: this.bubble,
      useGl,
    });
    this._chart.setOption(option, { notMerge: false });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('lui-scatter-chart')) {
  customElements.define('lui-scatter-chart', LuiScatterChart);
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-scatter-chart': LuiScatterChart;
  }
}
```

### Pattern 5: TypeScript Type Shim for echarts-gl
**What:** echarts-gl 2.0.9 does not ship `.d.ts` declaration files for its subpath exports (`echarts-gl/charts`, `echarts-gl/components`). A module declaration shim is needed so TypeScript does not error on the import. This is the deferred task from Phase 88 (STATE.md blocker for Phase 92).

**Where to put it:** `packages/charts/src/vite-env.d.ts` (already contains `/// <reference types="vite/client" />`) can be extended, OR a dedicated `packages/charts/src/echarts-gl.d.ts` file is cleaner.

```typescript
// Source: STATE.md note "echarts-gl 2.0.9 does not ship type definitions as subpath exports"
// Source: base-chart-element.ts line 373-374 — @ts-ignore pattern from Phase 88
// packages/charts/src/echarts-gl.d.ts

declare module 'echarts-gl' {
  // Side-effect import — registers all echarts-gl extensions globally.
  const _default: unknown;
  export default _default;
}

declare module 'echarts-gl/charts' {
  import type { EChartsExtensionInstallRegisters } from 'echarts/core';

  export type EChartsGLExtension = {
    install(registers: EChartsExtensionInstallRegisters): void;
  };

  export const ScatterGLChart: EChartsGLExtension;
  export const GraphGLChart: EChartsGLExtension;
  export const FlowGLChart: EChartsGLExtension;
  export const LinesGLChart: EChartsGLExtension;
  export const Bar3DChart: EChartsGLExtension;
  export const Line3DChart: EChartsGLExtension;
  export const Scatter3DChart: EChartsGLExtension;
}
```

**Consequence:** With this shim in place, the `@ts-ignore` comment in `base-chart-element.ts` line 373-374 can be removed in a follow-up task, but removing it is optional for Phase 92 scope.

### Anti-Patterns to Avoid
- **Setting `_streamingMode = 'appendData'` for scatter:** scatterGL does NOT implement `appendData` (only linesGL does). Both Canvas and GL paths must use `_streamingMode = 'buffer'` (the base default). Never override this for scatter.
- **Using `type: 'scatterGL'` when `enable-gl` is not set:** The series type in the option must match the registered module. Passing `type: 'scatterGL'` when only `ScatterChart` (not `ScatterGLChart`) is registered causes ECharts to silently fail to render.
- **Using `type: 'scatterGL'` when WebGL probe failed:** Even if `enable-gl` is set, if `_webglUnavailable` is true, the chart must fall back to `type: 'scatter'`. Check both flags: `this.enableGl && !this._webglUnavailable`.
- **`symbolSize` callback with scatterGL:** scatterGL has limited `symbolSize` support — the series defaults show a single numeric `symbolSize: 10`. A callback function that reads `value[2]` is a Canvas-scatter feature. For GL bubble mode, the correct approach is a fixed `symbolSize` OR a pre-scaled value since per-point symbolSize callbacks may not work with scatterGL's GPU-side rendering.
- **Not re-applying data after `enableGl` changes:** If `enableGl` is toggled at runtime, the series type must change (scatter → scatterGL or vice versa). The `updated()` hook must watch `'enableGl'` in addition to `'data'` and `'bubble'`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebGL availability detection | Custom canvas probe logic | `BaseChartElement._isWebGLSupported()` (already built in Phase 88) | Already implemented with proper SSR guard and exception handling |
| echarts-gl dynamic loading | Custom script injection | `BaseChartElement._maybeLoadGl()` (already built in Phase 88) | Already handles dynamic import + `webgl-unavailable` event dispatch |
| Bubble size encoding | Custom canvas overlay or SVG | `symbolSize: (val) => val[2]` callback on scatter series | Native ECharts feature; handles per-point sizing in Canvas rendering pass |
| Large dataset rendering | Custom WebGL renderer | `type: 'scatterGL'` + `progressive: 1e5` from echarts-gl | GPU-accelerated; handles 500K+ points via progressive WebGL batching |
| TypeScript types for echarts-gl | `any` casts everywhere | Module declaration shim in `echarts-gl.d.ts` | One-time 20-line file; gives proper types for all echarts-gl subpath imports |
| Streaming buffer for scatter | Custom circular buffer | Base class `_circularBuffer` + `_flushPendingData()` | Already implemented in BaseChartElement; phase 92 adds zero streaming code |

**Key insight:** Phase 92 adds two new files (`scatter-option-builder.ts`, `scatter-registry.ts`) and one new component file (`scatter-chart.ts`), plus a type shim file. The only non-trivial new logic is the `bubble` symbolSize callback and the `useGl` conditional series type. Everything else is inherited from BaseChartElement.

---

## Common Pitfalls

### Pitfall 1: scatterGL Does Not Support appendData
**What goes wrong:** Developer sees "appendData for GL" in success criteria and sets `_streamingMode = 'appendData'` for scatter when `enableGl` is true.
**Why it happens:** Only `linesGL` implements `appendData` in echarts-gl 2.0.9 source. `scatterGL` uses progressive rendering (`progressive: 1e5`) for large datasets, which is a different mechanism.
**How to avoid:** Never override `_streamingMode` in `LuiScatterChart`. The base `'buffer'` default is correct for both Canvas and GL modes. The success criteria description is inaccurate relative to echarts-gl source code.
**Warning signs:** `appendData` call on a scatterGL chart either silently fails or triggers an ECharts internal error.

### Pitfall 2: symbolSize Callback Not Supported by scatterGL
**What goes wrong:** `symbolSize: (val) => val[2]` works perfectly in Canvas scatter mode but scatterGL renders all points at the same default size (10px) and ignores the callback.
**Why it happens:** scatterGL processes data on the GPU side via `PointsBuilder`. It reads a single `symbolSize` number from the series model rather than evaluating per-point callbacks.
**How to avoid:** In `buildScatterOption()`, when `useGl` is true AND `bubble` is true, emit a fixed `symbolSize` instead of a callback. The bubble effect in GL mode requires a different approach — either pre-scale sizes client-side and put them in a separate data column, or document that GL mode does not support per-point bubble sizing.
**Recommendation for Phase 92 scope:** Emit `symbolSize: 10` (fixed) when `useGl` is true, regardless of `bubble`. Log a dev warning. The `bubble` prop in GL mode is visually the same as non-bubble scatter (all same size). Per-point variable sizes in GL are out of Phase 92 scope.
**Warning signs:** GL scatter renders identically regardless of the third data dimension.

### Pitfall 3: Using scatterGL Series Type When Only ScatterChart Module Is Registered
**What goes wrong:** `buildScatterOption()` emits `type: 'scatterGL'` but the chart was initialized before `enable-gl` was evaluated, and `ScatterGLChart` was not registered via `use()`.
**Why it happens:** ECharts silently fails to render unknown series types. No error is thrown.
**How to avoid:** `registerScatterModules()` must always register both `ScatterChart` AND `ScatterGLChart` via `use()`. Since `_maybeLoadGl()` (base class) loads echarts-gl side-effects when `enableGl` is true before `_initChart()` is called, the registration order is: 1) `_maybeLoadGl()` loads echarts-gl, 2) `_initChart()` calls `_registerModules()` which calls `registerScatterModules()`, 3) `use([ScatterGLChart])` completes registration. Register both modules unconditionally in `registerScatterModules()` — the guard flag prevents double-registration.
**Warning signs:** No error, but scatter chart is empty when `enable-gl` is set.

### Pitfall 4: Missing `_webglUnavailable` as Protected Field
**What goes wrong:** `LuiScatterChart._applyData()` cannot read `this._webglUnavailable` because it is `private` in `BaseChartElement`.
**Why it happens:** TypeScript `private` fields are only accessible within the declaring class.
**How to avoid:** Change `private _webglUnavailable = false;` to `protected _webglUnavailable = false;` in `base-chart-element.ts`. This is a one-line change. All existing behavior is identical — the field is still not accessible from outside the class hierarchy.
**Warning signs:** TypeScript compile error: "Property '_webglUnavailable' is private and only accessible within class 'BaseChartElement'."

### Pitfall 5: Not Re-applying Data After enableGl Change
**What goes wrong:** Developer sets `enable-gl` attribute after initial render. The chart continues to render with `type: 'scatter'` (Canvas) even after WebGL is loaded.
**Why it happens:** `_applyData()` is only called from `updated()` when `data`, `bubble`, or `enableGl` changes. If `enableGl` is not in the watched props list, the series type does not update.
**How to avoid:** Include `'enableGl'` in the watched property keys in `updated()`:
```typescript
const scatterProps = ['data', 'bubble', 'enableGl'] as const;
```
**Warning signs:** After adding `enable-gl` attribute to the element, chart still renders the same (Canvas) without any visual change or series type switch.

### Pitfall 6: Data Shape Mismatch Between Scatter and Bubble Modes
**What goes wrong:** When `bubble` is false, passing `[x, y, r]` data causes r to be ignored. When `bubble` is true, passing `[x, y]` data causes the callback to receive `undefined` for `value[2]`, resulting in `NaN` symbol sizes.
**Why it happens:** The symbolSize callback `(val) => val[2] ?? 10` returns the fallback (10) when `val[2]` is `undefined` — but if the developer passes `[x, y, z]` data without setting `bubble: true`, z is silently ignored.
**How to avoid:** Document the data shape contract in the TypeScript types:
- `bubble: false` (default): `data` should be `[x, y][]`
- `bubble: true`: `data` should be `[x, y, size][]` where size is a positive number
The `?? 10` fallback in the callback provides graceful degradation but does not signal the error.
**Warning signs:** All bubbles render at the same size (10px) when `bubble: true` but data is `[x, y]` format.

---

## Code Examples

Verified patterns from installed packages and existing Phase 88-91 codebase:

### ScatterChart Registration (scatter-registry.ts)
```typescript
// Source: bar-registry.ts Phase 90 pattern
// Source: ScatterChart confirmed in echarts/types/dist/charts.d.ts
// Source: ScatterGLChart confirmed in echarts-gl/lib/export/charts.js
let _scatterRegistered = false;

export async function registerScatterModules(): Promise<void> {
  if (_scatterRegistered) return;
  _scatterRegistered = true;

  const { registerCanvasCore } = await import('../registry/canvas-core.js');
  await registerCanvasCore();

  const [{ ScatterChart }, { use }] = await Promise.all([
    import('echarts/charts'),
    import('echarts/core'),
  ]);
  use([ScatterChart]);

  // ScatterGLChart — always register so scatterGL type works when enable-gl is set.
  // @ts-ignore: echarts-gl 2.0.9 does not ship subpath .d.ts files.
  // Type shim in echarts-gl.d.ts eliminates this ignore comment.
  const { ScatterGLChart } = await import('echarts-gl/charts');
  use([ScatterGLChart]);
}
```

### ECharts ScatterSeriesOption Properties (verified from shared.d.ts line 9767-9773)
```typescript
// Verified: ScatterSeriesOption key properties from installed echarts@5.6.0 types
// interface ScatterSeriesOption {
//   type?: 'scatter';
//   coordinateSystem?: string;
//   cursor?: string;
//   clip?: boolean;
//   data?: (ScatterDataItemOption | OptionDataValue | OptionDataValue[])[] | ArrayLike<number>;
//   // Inherited from SeriesLargeOptionMixin:
//   large?: boolean;              // ECharts Canvas large mode (alternative to scatterGL)
//   largeThreshold?: number;      // Threshold to enter large mode
//   // Inherited from SymbolOptionMixin<CallbackDataParams>:
//   symbolSize?: number | number[] | SymbolSizeCallback<CallbackDataParams>;
//   symbol?: string | SymbolCallback<CallbackDataParams>;
// }

// symbolSize callback signature (from shared.d.ts line 6753):
// type SymbolSizeCallback<T> = (rawValue: any, params: T) => number | number[];

// Data format for scatter: [x, y]
// Data format for bubble: [x, y, r]  where r drives symbolSize callback
```

### scatterGL Series Configuration (verified from echarts-gl 2.0.9 ScatterGLSeries.js)
```typescript
// Verified: ScatterGLSeries defaultOption from echarts-gl/src/chart/scatterGL/ScatterGLSeries.js
// series type string: 'scatterGL' (NOT 'scatter')
// {
//   type: 'scatterGL',
//   coordinateSystem: 'cartesian2d',
//   zlevel: 10,
//   progressive: 1e5,         // 100K points per progressive render chunk
//   progressiveThreshold: 1e5,
//   large: false,
//   symbol: 'circle',
//   symbolSize: 10,           // Number only — callbacks are Canvas-scatter feature
//   zoomScale: 0,
//   blendMode: 'source-over', // Can use 'lighter' for density visualization
//   itemStyle: { opacity: 0.8 }
// }
//
// KEY: scatterGL does NOT implement appendData() — source confirmed.
// appendData is only in linesGL. Use setOption() with full data array for streaming.
```

### Bubble Chart Data Format
```typescript
// Source: ECharts handbook https://apache.github.io/echarts-handbook/en/how-to/chart-types/scatter/basic-scatter/
// Source: symbolSize callback signature from shared.d.ts line 6753

// Standard scatter: [x, y] data, fixed symbolSize
const scatterOption = {
  xAxis: { type: 'value' },
  yAxis: { type: 'value' },
  series: [{
    type: 'scatter',
    data: [[10, 20], [15, 30], [7, 25]],
    symbolSize: 10,  // fixed
  }]
};

// Bubble mode: [x, y, r] data, symbolSize callback reads value[2]
const bubbleOption = {
  xAxis: { type: 'value' },
  yAxis: { type: 'value' },
  series: [{
    type: 'scatter',
    data: [[10, 20, 5], [15, 30, 12], [7, 25, 8]],
    symbolSize: (value: number[]) => value[2],  // r drives size
  }]
};
```

### webgl-unavailable Event (already in BaseChartElement)
```typescript
// Source: base-chart-element.ts lines 361-370 — event dispatch pattern already implemented
// Consumer usage (for SCAT-02 success criteria):
document.querySelector('lui-scatter-chart')?.addEventListener('webgl-unavailable', (e) => {
  console.warn('WebGL unavailable:', (e as CustomEvent).detail.reason);
  // Chart automatically falls back to Canvas 2D rendering
});
```

### Updated index.ts (Phase 92 additions)
```typescript
// packages/charts/src/index.ts additions for Phase 92
// Append after Phase 91 exports:

// Phase 92: Scatter + Bubble Chart
export { LuiScatterChart } from './scatter/scatter-chart.js';
export type { ScatterPoint, ScatterOptionProps } from './shared/scatter-option-builder.js';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate scatter and bubble components | Single component with `bubble` prop | ECharts design (always) | Bubble is scatter with `symbolSize` callback — no separate chart type |
| Full ECharts import for scatter | Tree-shaken `ScatterChart` from `echarts/charts` | ECharts 5.0 (2021) | ~400KB → ~160KB gzip for Canvas path |
| Canvas-only large scatter | `type: 'scatterGL'` via echarts-gl | echarts-gl 2.x (ECharts 5.x) | GPU-accelerated; 500K+ points at interactive frame rates |
| `appendData` for GL streaming | `setOption` with circular buffer for GL | echarts-gl 2.0.9 reality | scatterGL does not support appendData; setOption with full buffer is the only streaming path |
| Static `@ts-ignore` on echarts-gl import | Module declaration shim `echarts-gl.d.ts` | Phase 92 (new) | Removes `@ts-ignore` from base element; named exports from `echarts-gl/charts` are type-safe |

**Deprecated/outdated:**
- Using ECharts `large: true` + `largeThreshold` on Canvas scatter for 500K+ points: Works but CPU-bound, slower than GPU. Use `scatterGL` when `enable-gl` is set.
- Passing raw `ArrayLike<number>` to scatter `data`: TypedArray works for performance but loses `ScatterDataItemOption` per-point customization. Standard `[x, y][]` array format is correct for Phase 92 scope.

---

## Open Questions

1. **symbolSize callback support in scatterGL for bubble mode**
   - What we know: scatterGL's `ScatterGLSeries.js` uses `symbolSize: 10` (number) as default. The GPU-side `PointsBuilder` reads the series model's `symbolSize` value, not per-point callbacks. Per-point callbacks work for Canvas `type: 'scatter'` but their behavior in GL is unverified from source code alone.
   - What's unclear: Whether scatterGL can read `symbolSize` as a per-point function or only as a single scalar. The echarts-gl source shows `hasSymbolVisual: true` on the series model, which may enable callback support, but this is not confirmed without a running test.
   - Recommendation: For Phase 92, emit a fixed `symbolSize` when `useGl` is true (regardless of `bubble` mode). Document this limitation. If a running environment is available, test whether scatterGL accepts symbolSize callbacks — if it does, the conditional can be removed in a follow-up.

2. **ScatterGLChart explicit `use()` vs relying on side-effect import**
   - What we know: `_maybeLoadGl()` does `await import('echarts-gl')` which auto-registers all GL chart types globally. The explicit `use([ScatterGLChart])` from `echarts-gl/charts` should also work since `echarts-gl/charts` exports the same install functions.
   - What's unclear: Whether calling `use([ScatterGLChart])` after the global side-effect import causes double-registration or errors.
   - Recommendation: Follow the explicit `use()` pattern for consistency with the project's tree-shaking philosophy. If double-registration causes issues, fall back to relying solely on the side-effect import from `_maybeLoadGl()` and remove the explicit `use()` from the registry.

3. **`_webglUnavailable` visibility change in BaseChartElement**
   - What we know: It is currently `private`. Phase 92 needs it `protected`.
   - What's unclear: Whether other planned phases (93-95) also need to read this field.
   - Recommendation: Change to `protected` in Phase 92 Plan 01 as a prerequisite task before implementing scatter-chart.ts.

---

## Validation Architecture

> Skipped — `workflow.nyquist_validation` is not present in `.planning/config.json` (validation mode not enabled for this project).

---

## Sources

### Primary (HIGH confidence)
- `packages/charts/node_modules/echarts/types/dist/charts.d.ts` — `ScatterChart` and `ScatterSeriesOption` exports confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` line 9767-9773 — `ScatterSeriesOption` interface: `type: 'scatter'`, `data`, `SeriesLargeOptionMixin`, `SymbolOptionMixin` confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` line 6753 — `SymbolSizeCallback<T> = (rawValue: any, params: T) => number | number[]` confirmed
- `packages/charts/node_modules/echarts/types/dist/shared.d.ts` line 7342-7344 — `SeriesLargeOptionMixin { large?: boolean; largeThreshold?: number; }` confirmed
- `packages/charts/node_modules/echarts-gl/lib/export/charts.js` — `ScatterGLChart` named export confirmed
- `packages/charts/node_modules/echarts-gl/src/chart/scatterGL/ScatterGLSeries.js` — `type: 'series.scatterGL'`, `progressive: 1e5`, `symbolSize: 10` (number), `large: false` confirmed; NO `appendData` method
- `packages/charts/node_modules/echarts-gl/src/chart/scatterGL/ScatterGLView.js` — `incrementalPrepareRender` + `incrementalRender` confirmed (progressive batching, NOT appendData)
- `packages/charts/node_modules/echarts-gl/src/chart/linesGL/LinesGLSeries.js` line 37 — `appendData` method ONLY in linesGL, confirmed absent from scatterGL
- `packages/charts/src/base/base-chart-element.ts` — `enableGl: boolean`, `_webglUnavailable: private boolean`, `_maybeLoadGl()` side-effect import of `echarts-gl`, `_streamingMode = 'buffer'` default, `_flushPendingData()` circular buffer path confirmed
- `packages/charts/src/bar/bar-chart.ts` + `bar-registry.ts` — Phase 90 concrete chart pattern confirmed for replication
- `.planning/STATE.md` — "echarts-gl 2.0.9 does not ship type definitions as subpath exports — declaration shims needed (Phase 92 scope)" confirmed as blocker

### Secondary (MEDIUM confidence)
- [Apache ECharts Scatter Handbook](https://apache.github.io/echarts-handbook/en/how-to/chart-types/scatter/basic-scatter/) — `[x, y]` data format, `symbolSize` callback `(value) => value / 10` pattern confirmed
- Web search findings on echarts scatterGL performance — progressive rendering for 500K+ points via GPU; `setOption` with full data array is the streaming path (not `appendData`)
- `echarts-gl/lib/export/charts.js` — `ScatterGLChart`, `GraphGLChart`, `FlowGLChart`, `LinesGLChart` named exports all confirmed

### Tertiary (LOW confidence)
- Web search: symbolSize callback support in scatterGL — unconfirmed from official source; likely Canvas-only feature based on scatterGL GPU architecture

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `ScatterChart` confirmed in echarts@5.6.0 types; `ScatterGLChart` confirmed in echarts-gl@2.0.9 exports; no new packages needed
- Architecture (dual series type): HIGH — `type: 'scatter'` vs `type: 'scatterGL'` series selection confirmed from scatterGL source; `_webglUnavailable` field access pattern identified; one-line BaseChartElement change required
- Streaming (buffer-only, no appendData for GL): HIGH — confirmed by inspecting echarts-gl 2.0.9 source code; only `linesGL` implements `appendData`; scatterGL uses progressive rendering
- Bubble mode (symbolSize callback): HIGH for Canvas; MEDIUM for GL — Canvas callback confirmed from ECharts types; GL per-point callback behavior is not definitively confirmed from scatterGL source (see Open Questions)
- TypeScript type shims: HIGH — echarts-gl ships no `.d.ts` files confirmed by filesystem scan; module declaration shim pattern is standard TypeScript practice; `EChartsExtensionInstallRegisters` type may need verification from echarts/core exports

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (echarts@5.6.0 and echarts-gl@2.0.9 pinned; architecture stable)
