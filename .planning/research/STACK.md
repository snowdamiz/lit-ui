# Stack Research

**Domain:** WebGPU chart rendering — adding WebGPU path, 1M+ streaming, and moving average overlay to @lit-ui/charts (v10.0)
**Researched:** 2026-03-01
**Confidence:** HIGH (core findings); MEDIUM (ChartGPU Shadow DOM integration)

---

## Context: What Already Exists (Do Not Re-Research)

This is an additive milestone on top of the working v9.0 stack. These are validated and must not change:

| Technology | Version | Status |
|------------|---------|--------|
| ECharts | 5.6.0 (pinned) | In production — keep pinned, see Version Decision below |
| echarts-gl | 2.0.9 (optional peer dep, dynamic import) | In production |
| BaseChartElement | — | Abstract Lit base class; all 8 chart types extend it |
| `_streamingMode = 'appendData'` | — | Line/Area use native `appendData`; all others use circular buffer |
| ThemeBridge | — | getComputedStyle CSS token resolution |
| Per-chart registry files | — | ~135KB gzipped via tree-shaking |

---

## Critical Version Decision: Keep ECharts 5.6.0 Pinned

**ECharts 6.0.0 shipped July 2025 and is the current npm latest — do NOT upgrade for v10.0.**

echarts-gl 2.x (latest: 2.0.8, Aug 2024) only supports ECharts `^5.1.2`. No echarts-gl 3.x targeting ECharts 6 exists as of 2026-03-01. Upgrading ECharts to 6.0 would:
- Break the WebGL scatter path (`enable-gl` attribute, ScatterGLChart) — the component's primary 500K+ point differentiator
- Require full visual regression of all 8 chart types (ECharts 6 changed default theme, legend position, label overflow behavior)
- Require a separate `echarts/theme/v5.js` import to restore the previous visual baseline

**Action:** Keep `echarts: "^5.6.0"` and `echarts-gl: "^2.0.9"` pinned in `packages/charts/package.json`. Create a future v11.x milestone for ECharts 6 + echarts-gl 3.x upgrade when echarts-gl publishes ECharts 6 support.

---

## New Stack Additions for v10.0

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `navigator.gpu` (WebGPU API) | Native browser — no npm package | WebGPU tier detection in `_initChart()` | Zero-dependency feature detection. `navigator.gpu.requestAdapter()` returns `null` on unsupported browsers — clean null-check gates the entire WebGPU path. Chrome 113+, Edge 113+, Firefox 141+ (Windows/macOS), Safari 26 — approximately 85%+ desktop browser coverage as of late 2025. Mobile: Chrome Android works; iOS requires Safari/iOS 26+. Linux Firefox WebGPU still behind flag (2026-03-01). |
| ChartGPU | 0.3.2 | WebGPU-native renderer for Line/Area at 1M+ points | Only dedicated WebGPU charting library as of 2026 (MIT, Feb 2026). 50M+ points at 60fps benchmark, native `appendData()` for streaming, supports line/area/bar/scatter/candlestick series types, device loss recovery, and canvas lifecycle management. Used as an opt-in parallel renderer for Line/Area charts when WebGPU is detected — avoids building a custom GPU renderer from scratch. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| No new npm library for MA | — | SMA + EMA computation is already in `candlestick-option-builder.ts` | The existing `_computeSMA` and `_computeEMA` are correct but O(n). For streaming, upgrade to an O(1) circular-buffer state machine (see Implementation Notes). Pure TypeScript — no npm dependency needed. |

### Development Tools (No Changes)

The existing Vite 7 + TypeScript 5.9 + pnpm workspace toolchain is unchanged. No new dev tools needed.

---

## Installation

```bash
# ChartGPU — add as a regular dependency to @lit-ui/charts
# (same pattern as echarts: bundled, not a peer dep)
pnpm add chartgpu --filter @lit-ui/charts
```

**CRITICAL: ChartGPU must use a dynamic import only — never top-level.**
Same constraint that applies to echarts-gl. Static import crashes SSR environments (Node.js has no `navigator.gpu`):

```typescript
// CORRECT — lazy, SSR-safe, same pattern as echarts-gl
const { ChartGPU } = await import('chartgpu');

// WRONG — crashes SSR (navigator is undefined in Node.js)
import { ChartGPU } from 'chartgpu';
```

---

## Implementation Notes (Per Feature)

### Feature 1: WebGPU Auto-Detection + Three-Tier Renderer

**No library needed for detection.** Use native `navigator.gpu` with null-check pattern:

```typescript
// In BaseChartElement or a new RendererDetector utility
async function detectRendererTier(): Promise<'webgpu' | 'webgl' | 'canvas'> {
  // Tier 1: WebGPU — Chrome 113+, Edge 113+, Firefox 141+, Safari 26
  if (typeof navigator !== 'undefined' && navigator.gpu) {
    const adapter = await navigator.gpu.requestAdapter();
    // null adapter = no hardware WebGPU support
    // isFallbackAdapter: always false in Chrome 136 (not yet implemented) — skip check
    if (adapter) return 'webgpu';
  }
  // Tier 2: WebGL — existing probe from _isWebGLSupported()
  try {
    const canvas = document.createElement('canvas');
    if (canvas.getContext('webgl2') || canvas.getContext('webgl')) {
      return 'webgl';
    }
  } catch { /* ignore */ }
  // Tier 3: Canvas — always available
  return 'canvas';
}
```

**Integration with BaseChartElement:**
- Add `enable-webgpu` boolean attribute (consistent with existing `enable-gl` attribute pattern)
- Call `detectRendererTier()` once in `_maybeLoadWebGPU()`, called from `firstUpdated()` before the RAF fires
- Store result in `protected _rendererTier: 'webgpu' | 'webgl' | 'canvas' = 'canvas'`
- Only Line and Area charts enter the ChartGPU path when `_rendererTier === 'webgpu'`
- Dispatch `webgpu-active` custom event when WebGPU path activates (mirrors existing `webgl-unavailable` event)

**Shadow DOM note:** `navigator.gpu.requestAdapter()` is a JavaScript call — Shadow DOM does not affect it. ChartGPU's `ChartGPU.create(container, options)` requires a real DOM container. Pass `this.shadowRoot?.querySelector('#chart')` (the existing inner `<div id="chart">`) directly. ChartGPU creates its own `<canvas>` inside the provided container — this works inside an open-mode Shadow DOM, same way ECharts does today. Confidence: MEDIUM (no explicit ChartGPU Shadow DOM docs; inferred from same DOM-container pattern used by ECharts which already works in this codebase).

### Feature 2: ChartGPU as Parallel Renderer for Line/Area

ChartGPU is used alongside ECharts — not replacing it. Architecture:

```
BaseChartElement._initChart()
  ↓
  if enable-webgpu AND _rendererTier === 'webgpu' AND _streamingMode === 'appendData':
    → _initChartGPU()    ← new path: ChartGPU instance
  else:
    → _initECharts()    ← existing path: ECharts instance (unchanged)
```

Only `LuiLineChart` and `LuiAreaChart` enter the ChartGPU path. All other 6 chart types (Bar, Pie, Scatter/WebGL, Heatmap, Candlestick, Treemap) continue using ECharts exclusively.

**Disposal:** ChartGPU exposes `chart.dispose()`. Call it in `disconnectedCallback()` before `super.disconnectedCallback()` — same as the existing `_barRafId` cancellation pattern in `LuiCandlestickChart`.

**ThemeBridge gap:** ChartGPU has its own color configuration API that does not consume ECharts theme objects. In v10.0, accept this gap — wire CSS token colors into ChartGPU's color config at init time. Full ThemeBridge integration for dark mode toggling on ChartGPU can be a v10.1 refinement.

### Feature 3: ECharts appendData at 1M+ Points

**No ECharts upgrade needed.** ECharts 5.6.0 supports 1M+ point incremental rendering via `appendData`. Apply these specific optimizations:

**TypedArray for point data (reduces GC pressure):**

```typescript
// Current — plain JS array:
this._chart.appendData({ seriesIndex: 0, data: points });

// Optimized for 1M+ — TypedArray avoids heap allocation:
const floatData = new Float64Array(points.flatMap(([x, y]) => [x, y]));
this._chart.appendData({ seriesIndex: 0, data: floatData });
```

**Progressive rendering configuration (mandatory for 1M+ points):**
Set on the Line/Area series option at init:
```typescript
{
  type: 'line',
  progressive: 2000,
  progressiveThreshold: 500000,
  animation: false   // MUST be false — animations block the rendering thread at high data rates
}
```

Without `progressive`/`progressiveThreshold`, ECharts renders synchronously on `appendData` and blocks the main thread at ~100K+ points.

**CRITICAL-03 constraint unchanged:** `setOption` must never be called after `appendData` has been used on a series. This is already enforced in BaseChartElement. Do not relax this constraint.

**Important: Do NOT add `progressive` to Candlestick.** ECharts bug #13197: progressive rendering breaks grid boundary tracking when `dataZoom` is active. Candlestick always has `dataZoom` — progressive would cause visible rendering glitches on zoom.

### Feature 4: Moving Average for Streaming Candlestick

**No new npm library needed.** The existing `_computeSMA` and `_computeEMA` in `candlestick-option-builder.ts` are correct for batch data but are O(n) — they iterate the full close array on every flush. At 1M bars this becomes catastrophic.

**Solution: O(1) per-update streaming MA state (pure TypeScript):**

```typescript
interface StreamingMAState {
  period: number;
  type: 'sma' | 'ema';
  // SMA: circular window buffer of close prices
  windowBuf: Float64Array;
  windowIdx: number;
  windowSum: number;
  filledCount: number;
  // EMA: single last-ema value (no window buffer needed)
  lastEma: number | null;
}

// O(1) SMA update:
function updateSMA(state: StreamingMAState, newClose: number): number | null {
  const outgoing = state.windowBuf[state.windowIdx];
  state.windowBuf[state.windowIdx] = newClose;
  state.windowIdx = (state.windowIdx + 1) % state.period;
  state.windowSum += newClose - outgoing;
  state.filledCount = Math.min(state.filledCount + 1, state.period);
  if (state.filledCount < state.period) return null;  // warm-up
  return state.windowSum / state.period;
}

// O(1) EMA update:
function updateEMA(state: StreamingMAState, newClose: number): number | null {
  if (state.lastEma === null) {
    // Use first close as seed until we have enough data for a proper seed
    state.lastEma = newClose;
    return null;  // or return seed — matches current _computeEMA warm-up behavior
  }
  const k = 2 / (state.period + 1);
  state.lastEma = newClose * k + state.lastEma * (1 - k);
  return state.lastEma;
}
```

**Streaming MA code path is separate from batch MA.** The batch path (`buildCandlestickOption`) is unchanged — used when `this.data` is set statically. The streaming path requires:
1. `StreamingMAState[]` stored in `LuiCandlestickChart` (one per MAConfig entry)
2. On each `pushData()` call: update OHLC buffer AND update each MAState
3. In `_flushBarUpdates()`: call `appendData` for both seriesIndex 0 (candlestick) AND each MA line series (seriesIndex 1+N)
4. Change `_flushBarUpdates` to route through `appendData` for streaming mode, not `setOption`

**CRITICAL-03 applies to candlestick streaming too:** Once streaming MA via `appendData` starts, `setOption` cannot rebuild the full option without wiping streamed MA data. This means changing `movingAverages` attribute after streaming starts requires a chart reinit (document this as a constraint in the skill file).

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| ChartGPU 0.3.2 for WebGPU line/area | Raw WebGPU WGSL shaders written from scratch | ChartGPU is purpose-built, MIT licensed, handles GPU buffer management, device loss recovery, and canvas lifecycle. Writing equivalent shader code is 3–6 weeks of low-level GPU work for marginal control gain. |
| `navigator.gpu` feature detection (no library) | wgpu-web (Rust/WASM wgpu port) | wgpu-web adds 500KB+ WASM binary, requires SharedArrayBuffer (cross-origin isolation headers), provides no charting abstractions — overhead without benefit for chart rendering. |
| In-source O(1) MA circular buffer | `moving-averages` npm (4.0.0) | Package adds ~3KB for SMA/EMA that is already partially implemented in this codebase. The streaming O(1) version is ~30 lines of TypeScript. No justification for the additional dependency. |
| ECharts 5.6.0 pinned | Upgrade to ECharts 6.0 | echarts-gl 2.x incompatible with ECharts 6.x — would break the `enable-gl` WebGL scatter path and require full visual regression. Separate future milestone. |
| ChartGPU for Line/Area only (partial WebGPU) | ChartGPU for all 8 chart types | ChartGPU 0.3.2 lacks heatmap (density mode is scatter-only), treemap, and candlestick with volume panel. ECharts handles these at higher fidelity. Bounded scope reduces integration risk. |
| ECharts appendData + TypedArray + progressive | deck.gl / Observable Plot for 1M+ Line | deck.gl is a geospatial library, not a time-series chart library. Observable Plot has no WebGPU path and no appendData streaming API. Neither integrates with ECharts' existing ThemeBridge, DataZoom, or tooltip system. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `import { ChartGPU } from 'chartgpu'` at top level | `navigator.gpu` is undefined in Node.js — crashes SSR. Same failure mode as a top-level `import 'echarts-gl'`. | `await import('chartgpu')` inside `_initChartGPU()`, gated behind `isServer` guard from BaseChartElement. |
| ECharts 6.0.0 | echarts-gl 2.0.9 only supports ECharts 5.x. Upgrading breaks the WebGL scatter path (enable-gl). | Keep ECharts 5.6.0 pinned. Create a separate v11.x milestone for ECharts 6 + echarts-gl 3.x. |
| `progressive: true` on Candlestick series | ECharts bug #13197: progressive rendering breaks grid boundary tracking with active DataZoom. Candlestick always has DataZoom. Causes visible rendering glitches on zoom. | Do not set `progressive`/`progressiveThreshold` on CandlestickChart. Use existing `maxPoints` circular buffer for memory control. |
| `setOption` after `appendData` streaming starts | CRITICAL-03: wipes all previously streamed data silently. Already enforced in BaseChartElement. Applies to streaming MA series (MA line series via appendData) as well. | Keep appendData and setOption paths strictly separate. Document streaming MA as a one-way mode in the skill file. |
| `adapter.isFallbackAdapter` as primary WebGPU quality gate | Chrome 136 docs: `isFallbackAdapter` is always `false` currently — Chrome has not yet shipped software fallback adapters. Cannot reliably distinguish hardware vs. software WebGPU. | Use `requestAdapter()` returning non-null as the primary gate. If performance-critical filtering of software GPU is needed later, use `adapter.limits` to detect low-capability devices. |
| Replacing ECharts with ChartGPU for non-Line/Area types | ChartGPU 0.3.2 does not have heatmap, treemap, or volume-panel candlestick. Replacing working ECharts code is unnecessary scope. | ChartGPU as opt-in parallel renderer for Line/Area only. |

---

## Stack Patterns by Variant

**If `enable-webgpu` attribute is set AND WebGPU is available AND chart is Line or Area:**
- Use ChartGPU instance, skip ECharts init for this chart
- Route `pushData()` to `ChartGPU.appendData()`
- Wire CSS token colors into ChartGPU color config at init
- Dispatch `webgpu-active` event

**If `enable-webgpu` attribute is set AND WebGPU is NOT available:**
- Fall through to the existing `enable-gl` / Canvas check
- Do NOT dispatch `webgpu-active` — chart runs on ECharts as before

**If chart is Line or Area AND WebGPU NOT available or attribute not set:**
- Use ECharts appendData path with TypedArray + `progressive: 2000` + `progressiveThreshold: 500000`
- `animation: false` mandatory on the series

**If chart is Candlestick AND `moving-averages` attribute has entries AND streaming via `pushData()`:**
- Maintain `StreamingMAState[]` in `LuiCandlestickChart` (one per MAConfig)
- Update MA state O(1) per bar in `pushData()`
- Use `appendData` for both candlestick series AND MA line series in `_flushBarUpdates()`
- Document: changing `movingAverages` attribute after streaming starts requires chart reinit

**If chart is Candlestick AND `moving-averages` attribute has entries AND data set statically (no streaming):**
- Use existing `buildCandlestickOption` batch path — `_computeSMA`/`_computeEMA` are fine for batch
- No changes needed

**If chart is Bar, Pie, Scatter (WebGL), Heatmap, Treemap:**
- No changes from v9.0 — WebGPU path does not apply to these types
- Circular buffer + `setOption` stays unchanged

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| echarts@5.6.0 | echarts-gl@2.0.9 | Pinned pair — do not upgrade echarts independently. |
| echarts@5.6.0 | chartgpu@0.3.2 | No shared dependency — independent renderers sharing only a DOM container. |
| chartgpu@0.3.2 | Chrome 113+, Edge 113+, Firefox 141+, Safari 26 | Requires `navigator.gpu`. Build WebGPU detection gates usage. Linux Firefox still behind flag (2026-03-01). |
| echarts@6.0.0 | echarts-gl@2.0.9 | NOT compatible. Do not use ECharts 6 until echarts-gl 3.x is available. |

---

## Sources

- [ChartGPU GitHub](https://github.com/ChartGPU/ChartGPU) — API surface, appendData, version 0.3.2 (HIGH confidence — official repo, Feb 2026)
- [ChartGPU HN thread](https://news.ycombinator.com/item?id=46693978) — 1M+ point claims, Feb 2026 release date (MEDIUM confidence — community discussion)
- [ECharts WebGPU feature request](http://www.mail-archive.com/commits@echarts.apache.org/msg79551.html) — official maintainer confirmed no WebGPU plans for ECharts (HIGH confidence — official maintainer, Dec 2025)
- [ECharts Features page](https://echarts.apache.org/en/feature.html) — appendData for 1M+ points, TypedArray, progressive rendering (HIGH confidence — official docs)
- [echarts-gl releases](https://github.com/ecomfe/echarts-gl/releases) — v2.0.8 latest, ECharts 5.x only, no ECharts 6 version (HIGH confidence — official releases page)
- [ECharts 6 upgrade guide](https://echarts.apache.org/handbook/en/basics/release-note/v6-upgrade-guide/) — breaking changes confirmed (HIGH confidence — official docs)
- [MDN: GPU.requestAdapter()](https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter) — feature detection pattern, isFallbackAdapter behavior (HIGH confidence — MDN official)
- [web.dev: WebGPU supported in major browsers](https://web.dev/blog/webgpu-supported-major-browsers) — Chrome, Firefox 141, Safari 26 coverage as of Nov 2025 (HIGH confidence — Google/web.dev)
- [ECharts progressive rendering + dataZoom bug #13197](https://github.com/apache/echarts/issues/13197) — DO NOT add progressive to Candlestick (MEDIUM confidence — confirmed GitHub issue)
- [ECharts TypedArray issue #13335](https://github.com/apache/incubator-echarts/issues/13335) — TypedArray as series data (MEDIUM confidence — GitHub issue)

---

*Stack research for: @lit-ui/charts v10.0 WebGPU Charts milestone*
*Researched: 2026-03-01*
