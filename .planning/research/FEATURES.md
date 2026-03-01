# Feature Research: v10.0 WebGPU Charts

**Domain:** High-performance rendering extensions for ECharts-backed Lit web component chart suite
**Project:** LitUI v10.0 (subsequent milestone — adds to existing @lit-ui/charts v9.0)
**Researched:** 2026-03-01
**Confidence:** HIGH for 1M+ streaming and MA overlay (verified against ECharts docs/issues + existing source); MEDIUM for WebGPU path (no ECharts-native WebGPU renderer exists; strategy is ChartGPU integration or navigator.gpu-gated rendering swap)

---

## Context: What Already Exists

The v9.0 charts package already ships:

- `BaseChartElement` with `pushData()`, RAF coalescing, `appendData` vs. `buffer` streaming modes
- `LuiLineChart` / `LuiAreaChart` already set `_streamingMode = 'appendData'` — they use `this._chart.appendData()` internally on flush
- `LuiCandlestickChart` fully overrides `pushData()` with its own `_ohlcBuffer` + `buildCandlestickOption()` call
- `buildCandlestickOption()` already computes SMA and EMA from `MAConfig[]` and renders them as overlay `line` series on `xAxisIndex: 0 / yAxisIndex: 0`
- Moving average config is already accepted as a `moving-averages` JSON attribute — the infrastructure exists; the gap is behavioral correctness during streaming
- Canvas-only renderer in `_initChart()` — hardcoded `renderer: 'canvas'` passed to `echarts.init()`

v10.0 extends three orthogonal areas without changing the public API for consumers.

---

## Feature 1: Native appendData at 1M+ Continuous Points (Line/Area)

### What "1M+ Points" Means

**Data model:** At 1M points, a single series of `[timestamp, value]` pairs requires ~16 bytes per point (two 64-bit floats) = ~16MB raw JS array. ECharts recommends using TypedArray for large datasets — `Float32Array` or `Float64Array` instead of plain JS `number[]` halves memory pressure and improves GC behavior.

**Rendering pipeline:** ECharts uses `appendData({ seriesIndex, data })` for incremental ingestion. Each call appends to an internal progressive rendering queue — it does NOT re-process the full dataset. This is the only path that scales past ~100K points on the main thread without frame drops.

**Critical constraint (confirmed from ECharts issue #12327):** Calling `setOption()` after `appendData()` wipes all incrementally appended data. The existing code already guards against this (CRITICAL-03 comments throughout base-chart-element.ts). v10.0 must preserve this boundary rigorously.

**Current gap in v9.0:** `_flushPendingData()` calls `this._chart.appendData({ seriesIndex: 0, data: points })` — this only appends to series at index 0. Multi-series line charts (multiple named series) each need their own `seriesIndex`. At high volume, no back-pressure or TypedArray optimization exists.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| appendData path already working for single series | v9.0 shipped it | — | Already exists; this milestone extends it |
| Multi-series appendData routing | `pushData` with a `seriesIndex` target | LOW | Requires `pushData(point, seriesIndex?)` signature change or overload; base class currently hardcodes `seriesIndex: 0` |
| RAF coalescing already working | Batches multiple pushes per frame | — | Already in BaseChartElement._flushPendingData |
| No setOption after streaming starts | CRITICAL-03 already documented | LOW | Enforce: theme updates must use color-only setOption (already done); other prop changes require reinit guard |
| Back-pressure / drop policy at 1M+ | Memory protection | MEDIUM | Need max-points behavior for appendData mode — appendData grows unbounded unlike buffer mode; require an explicit eviction strategy or document that consumer must use windowed pushes |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| TypedArray data path | Halves memory for 1M-point datasets | MEDIUM | Accept `Float32Array` / `Float64Array` in `pushData()` — pass directly to `appendData()` rather than converting to `number[]` |
| Progressive rendering config | ECharts `progressive: 2000, progressiveThreshold: 3000` on series | LOW | These options tell ECharts to render in 2000-point chunks per frame rather than all at once; add to `buildLineOption()` when data exceeds threshold |
| `sampling: 'lttb'` for zoomed-out views | LTTB reduces rendered points without data loss | LOW | ECharts native `sampling` option on line series; enable automatically when `maxPoints > 100_000` |
| Streaming-only init path | Skip full `setOption` on first render if no static data | MEDIUM | If chart is streaming-only (no `.data` prop), start with a minimal seed option and never call `setOption` again |

### Anti-Features

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Automatic data decimation / downsampling on push | "Don't lose data" | Lossy downsampling silently degrades analytical accuracy; users must make explicit choices | Document LTTB as opt-in via `sampling` prop; let users pre-aggregate on server |
| Unbounded in-memory accumulation in appendData mode | "Keep all history" | At 1M+ points, JS heap grows continuously; tab crashes or GC pauses become visible | Document that appendData mode is intended for windowed streaming (fixed window via `max-points`); full history requires server-side storage |
| Per-point animation during appendData streaming | "Smooth line growth" | ECharts animation is disabled by design during appendData — enabling it causes multi-second lag as the chart tries to animate millions of points simultaneously | Keep `animation: false` default for streaming; document as intentional |

### Dependency on Existing Architecture

- `BaseChartElement._flushPendingData()` needs a `seriesIndex` parameter propagated through `pushData()`
- `buildLineOption()` needs a `progressive` option path
- `CRITICAL-03` boundary must remain inviolable: `_applyThemeUpdate()` (the only setOption call on a live streaming chart) must never include series data keys

---

## Feature 2: Moving Average Computed Series Overlay for Streaming Candlestick

### What Moving Average Overlay Means

A moving average overlay renders one or more additional `line` series on top of the candlestick price panel. Each MA series is computed from the closing prices of the OHLC bars in `_ohlcBuffer`.

**Standard periods (HIGH confidence — verified against StockCharts, TradingView, Fidelity):**

| Period | Classification | Type preference | Typical use |
|--------|---------------|-----------------|-------------|
| 5 | Very short-term | EMA | Scalping, intraday |
| 9 or 10 | Short-term | EMA | Day trading momentum |
| 20 | Short-to-medium | SMA or EMA | Swing trading, Bollinger Band basis |
| 50 | Medium-term | SMA | Trend confirmation |
| 100 | Medium-long | SMA | Bridge between 50 and 200 |
| 200 | Long-term | SMA or EMA | Major trend filter, golden/death cross |

**Industry standard:** Most professional financial charting tools (TradingView, Bloomberg) default to showing 20-EMA, 50-SMA, and 200-SMA when MAs are enabled. Users expect to configure periods and colors independently.

### Current State in v9.0

The infrastructure already exists and works for static data:
- `MAConfig` type: `{ period: number; color: string; type?: 'sma' | 'ema' }`
- `_computeSMA()` and `_computeEMA()` in `candlestick-option-builder.ts` — both implemented and correct
- `movingAverages` attribute accepted as JSON string
- MA series are rendered as line overlays on `xAxisIndex: 0 / yAxisIndex: 0`
- MA series use `symbol: 'none'` (no dots), `smooth: true`, `lineStyle.width: 1.5`

**The gap v10.0 addresses:** During streaming (`pushData()`), `_flushBarUpdates()` calls `buildCandlestickOption(_ohlcBuffer, ...)` on every RAF frame. This recomputes all MA series from scratch every frame. At 1000+ bars with multiple MA periods, this is O(n * periods) computation per frame (e.g., at 1000 bars, 3 MAs = 3000 array iterations per RAF flush).

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| MA overlay renders correctly on static data | Already shipped in v9.0 | — | Confirmed working; this milestone adds streaming correctness |
| MA recomputed after each streaming update | New bars must affect the MA line | LOW | Already done in _flushBarUpdates via full recompute; issue is performance not correctness |
| Warm-up period (null for first N-1 bars) | Correct MA behavior — cannot compute MA20 until 20 bars exist | LOW | Already implemented: _computeSMA and _computeEMA return null for warm-up indices |
| MA visible in legend | Users need to toggle MA series | LOW | Already implemented: legendData includes `MA${period}` entries |
| MA tooltip value shown on crosshair | Standard financial chart behavior | LOW | Already implemented: `tooltip: { show: true }` on each MA series |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Incremental MA update (append only the new tail value) | O(1) per frame instead of O(n * periods) on streaming | MEDIUM | Cache last EMA value per period; on new bar, compute only the new tail point and append to MA series data rather than full recompute. Requires splitting compute path for streaming vs. static |
| CSS token default colors for MA periods | Auto-assigns colors from `--ui-chart-color-2..5` if no color specified in MAConfig | LOW | Prevents "all MAs black" default; users should be able to add `moving-averages='[{"period":20},{"period":50}]'` without specifying colors |
| Named MA types in legend | "MA20 (EMA)" vs. just "MA20" | LOW | Expose `showType` boolean on MAConfig; appends type label to legend name |

### Anti-Features

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Server-side MA computation (consume pre-computed MA data) | "More accurate" or "offload compute" | Server-side MA creates a tight coupling between data format and backend; the MA type/period config would need to match server computation exactly | Keep client-side computation as the primary path; if users have server-computed MAs, they can pass them as a custom `option` series via the escape hatch |
| WMA (Weighted Moving Average) type | More MA types = more completeness | WMA is rarely used in practice; adds code complexity for minimal gain; SMA and EMA cover >95% of real financial charting needs | Document how to pass custom series via `option` prop for exotic indicator types |
| MACD / RSI / Bollinger Bands | "Complete technical analysis suite" | Each is a separate complex indicator with its own display requirements (sub-panels, signal lines, histogram bars). Well outside the scope of a simple MA overlay. | Out of scope; document that `getChart()` escape hatch enables custom ECharts series for power users |
| Automatic MA period detection based on data range | "Smart defaults" | Arbitrary heuristics for period selection would surprise users; financial analysis requires intentional MA period choice | Require explicit `period` in MAConfig; add sensible default periods to docs (20, 50, 200) |

### Dependency on Existing Architecture

- `LuiCandlestickChart._flushBarUpdates()` currently calls `buildCandlestickOption()` on every RAF. The optimization is to cache MA state between flushes.
- `buildCandlestickOption()` receives the full `_ohlcBuffer` — the function must remain pure (no internal state) to keep testability; state caching should live in `LuiCandlestickChart`.
- The `_parseMovingAverages()` helper parses from attribute on each call — this is fine since attribute changes are rare; only the compute loop needs optimization.

---

## Feature 3: Auto-Detecting WebGPU Renderer (All 8 Chart Types)

### What Auto-Detect + Upgrade Means at Runtime

**Detection pattern (HIGH confidence — verified against MDN, Chrome for Developers):**

```typescript
// Step 1: Check for WebGPU API presence
const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

// Step 2: Request adapter (confirms GPU hardware access, not just API presence)
const adapter = hasWebGPU ? await navigator.gpu.requestAdapter() : null;

// Result: true only if both API exists AND hardware adapter available
const webGPUAvailable = !!adapter;
```

This check must run async before `echarts.init()`. If WebGPU is unavailable, fall through to WebGL, then Canvas.

**What changes in the render pipeline:**
When WebGPU is available, ECharts is NOT the rendering target — ECharts has no official WebGPU renderer (confirmed: ECharts GitHub issue #21421, December 2025; maintainer response: no current plans). This means the "WebGPU upgrade" for v10.0 is not a drop-in `renderer: 'webgpu'` parameter.

**The realistic v10.0 scope is:**
- Auto-detect WebGPU availability and expose it as a readable property / event
- For all 8 ECharts-backed chart types: still use Canvas (or WebGL via echarts-gl for Scatter)
- For new high-throughput line/area cases: optionally use **ChartGPU** as the renderer when WebGPU is available, with ECharts Canvas as fallback

**ChartGPU** (MIT license, published January 2026, HN-validated) is the only production-ready WebGPU charting library as of March 2026:
- 35M points at ~72 FPS on consumer hardware
- 1M points at 60 FPS on standard hardware
- Supports line, area, bar, scatter, pie, candlestick
- Has `appendData(seriesIndex, newPoints)` API
- No Canvas 2D fallback — requires `navigator.gpu`
- Pure WebGPU, no ECharts dependency

### User-Visible Benefit

| Scenario | Canvas (current) | WebGPU (upgrade) |
|---------|---------|---------|
| 1,000 points line chart | 60fps | 60fps (no benefit) |
| 100,000 points line chart | ~55fps | 60fps (marginal) |
| 1,000,000 points line chart | ~20-30fps (frame drops) | 60fps |
| 10,000,000 points scatter | Unusable | ~45fps |
| Zoom/pan at 1M points | Stutters (CPU-bound transform) | Smooth (GPU transform) |

The benefit is meaningful only above ~100K points on a single series. For the typical use case (monitoring dashboards with a few thousand points), Canvas is equivalent.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| No API change to consumers | "Auto-upgrade" means zero-config | LOW | Consumers should not need to change any attributes or properties; the chart silently uses the best available renderer |
| WebGL → Canvas fallback already works | v9.0 ships this for Scatter via `enable-gl` | — | The fallback chain exists; extend it to include WebGPU at the top |
| SSR safety for navigator.gpu check | navigator is undefined in Node.js | LOW | Existing `isServer` guard in `firstUpdated()` covers this; add `typeof navigator !== 'undefined'` guard to WebGPU probe |
| Emit event when renderer selected | Consumers may want to know which renderer is active | LOW | Fire `renderer-selected` custom event with `{ renderer: 'webgpu' | 'webgl' | 'canvas' }` after init |
| Graceful WebGPU init failure handling | GPU adapter request can fail even with navigator.gpu present | LOW | Wrap `requestAdapter()` in try/catch; fall back to WebGL/Canvas on any error |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `renderer` readable property | Consumers can query which renderer is active | LOW | `get renderer(): 'webgpu' | 'webgl' | 'canvas'` property on BaseChartElement |
| WebGPU path for Line/Area via ChartGPU | True 1M+ points at 60fps without ECharts limitation | HIGH | Requires maintaining two render paths: ChartGPU (WebGPU) and ECharts (Canvas). API bridging required: map `pushData()` to `chartGPU.appendData()`; map `data` prop to initial data load; map CSS tokens to ChartGPU theme config |
| Shared GPUDevice across chart instances | Multiple charts on same page share one WebGPU device | MEDIUM | ChartGPU supports `ChartGPU.create(container, options, { adapter, device })` shared-device mode; BaseChartElement can hold a module-level singleton GPUDevice |
| Progressive WebGPU init (off main thread) | WebGPU adapter request is async; don't block render | LOW | Already async since `firstUpdated()` is async; `requestAdapter()` fits naturally in the await chain |

### Anti-Features

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Building a custom WebGPU renderer for ECharts | "Seamless integration" | ECharts maintainers explicitly said this requires enormous work and they have no plans; ZRender is deeply tied to Canvas/SVG primitives | Use ChartGPU as a parallel render path for eligible chart types; ECharts Canvas remains for all 8 chart types as fallback |
| WebGPU for Pie/Bar/Treemap/Heatmap/Candlestick | "Consistent upgrade path" | These chart types have bounded point counts (hundreds to low thousands); WebGPU overhead (adapter init, buffer allocation) exceeds the benefit | WebGPU only for Line/Area (streaming); all other chart types stay Canvas |
| Forcing WebGPU on all browsers as soon as it's available | "Modern by default" | WebGPU on Linux is still partial (Chrome 144+ Intel Gen12 only); Firefox WebGPU on Android is behind a flag; mobile support is fragmented | Feature-detect per session; never assume WebGPU works just because `navigator.gpu` exists — always validate with `requestAdapter()` |
| Separate `<lui-webgpu-line-chart>` component | "Clean separation of concerns" | Doubles the component API surface; consumers have to know which to use; defeats "auto-upgrade, no API change" goal | Single component with internal renderer selection |

### Dependency on Existing Architecture

- `_initChart()` currently hardcodes `init(container, theme, { renderer: 'canvas' })`. The WebGPU path requires a pre-init async check before this call.
- `_maybeLoadGl()` is the existing hook for pre-init async work (WebGL probe). A `_maybeLoadWebGPU()` equivalent fits the same slot.
- For ChartGPU integration, `_chart` (currently typed as `EChartsType | null`) would need a union type or the WebGPU path would use a separate `_webGPUChart` field.
- `disconnectedCallback()` already handles WebGL context cleanup; a WebGPU path must also call `chartGPU.dispose()` for GPU resource cleanup.
- `ThemeBridge` maps CSS tokens to ECharts theme objects — a parallel mapping to ChartGPU's theme format would be required for the WebGPU path.

---

## Feature Dependencies

```
[Feature 3: WebGPU Auto-Detect]
    └──affects──> [Feature 1: 1M+ Streaming]
                      ChartGPU provides the render backend that makes
                      1M+ points actually smooth. Without WebGPU, 1M+
                      points work via ECharts appendData but with frame
                      drops; with WebGPU + ChartGPU, they hit 60fps.

[Feature 2: MA Overlay Streaming Correctness]
    └──independent──> Features 1 and 3
                      MA streaming optimization is internal to
                      LuiCandlestickChart and buildCandlestickOption.
                      No dependency on WebGPU renderer selection.

[Feature 1: 1M+ Streaming]
    └──uses──> [Existing: appendData path in BaseChartElement]
                   Already present; needs multi-series + TypedArray ext.

[Feature 3: WebGPU Auto-Detect]
    └──uses──> [Existing: _maybeLoadGl() hook pattern in BaseChartElement]
                   Existing async pre-init hook is the right insertion point.
    └──requires──> [New: ChartGPU library for actual WebGPU rendering]
                   ECharts has no WebGPU renderer; external library needed.
```

### Dependency Notes

- **Feature 2 is fully independent** and has the lowest risk. All infrastructure exists; the work is performance optimization (incremental MA update) and CSS token default colors.
- **Feature 1 extends existing appendData path** — multi-series routing + TypedArray + progressive config. Medium risk due to CRITICAL-03 boundary constraints.
- **Feature 3 is the highest complexity** because it requires integrating a second charting library (ChartGPU) alongside ECharts. The integration surface (theme bridging, event forwarding, lifecycle management) must be carefully scoped.

---

## MVP Definition for v10.0

### Launch With (All Three Features Required by Milestone)

- [ ] **1M+ Streaming:** Multi-series `pushData(point, seriesIndex?)` routing in BaseChartElement; TypedArray support in appendData flush; `progressive` + `sampling: 'lttb'` config in buildLineOption for high-volume series
- [ ] **MA Overlay Streaming:** Incremental EMA/SMA tail computation in LuiCandlestickChart (cache last EMA per period); CSS token default color assignment when MAConfig omits `color`; no full recompute on every RAF flush
- [ ] **WebGPU Auto-Detect:** `_maybeLoadWebGPU()` probe in BaseChartElement with `navigator.gpu → requestAdapter()` check; `renderer-selected` event emission; `renderer` readable property; SSR guard

### Defer Post-Launch

- [ ] **ChartGPU integration** for actual WebGPU render path — high complexity; auto-detect (above) provides the foundation; actual ChartGPU rendering is a follow-on phase
- [ ] **TypedArray streaming API** — useful optimization but not blocking for launch; document `Float32Array` compatibility as experimental
- [ ] **Calendar heatmap mode** (PERF-02 — deferred from v9.0) — independent of all three v10.0 features

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| MA overlay streaming correctness | HIGH (existing MA feature broken during streaming) | LOW (incremental compute, cache EMA state) | P1 |
| WebGPU auto-detect + renderer event | MEDIUM (sets up future WebGPU work) | LOW (probe + event only) | P1 |
| Multi-series appendData routing | MEDIUM (multi-series line charts streaming) | LOW (seriesIndex param propagation) | P1 |
| `progressive` + `sampling: lttb` for line | MEDIUM (1M point render quality) | LOW (two ECharts options in buildLineOption) | P1 |
| CSS token defaults for MA colors | MEDIUM (usability of MA overlay) | LOW | P1 |
| TypedArray data path in appendData | MEDIUM (memory at 1M+ points) | MEDIUM (API change + type narrowing) | P2 |
| ChartGPU WebGPU render integration | HIGH (true 60fps at 1M+ points) | HIGH (second renderer lifecycle, theme bridging) | P2 |
| Shared GPUDevice across chart instances | LOW (optimization for multi-chart pages) | MEDIUM | P3 |
| WMA / exotic indicators | LOW | HIGH | Out of scope |

---

## Competitor Feature Analysis

| Feature | TradingView | ChartGPU | ECharts (current) | Our Approach |
|---------|------------|---------|-------------------|--------------|
| MA overlay (SMA/EMA) | Yes — built-in indicator panel | Line series overlay only | Via custom series | Built-in via MAConfig; computed client-side from OHLC closes |
| 1M+ points streaming | Yes — proprietary GPU pipeline | Yes — WebGPU native | Yes — appendData (CPU) | appendData today; ChartGPU WebGPU path in follow-on phase |
| WebGPU rendering | Internal | Yes (primary renderer) | No official support | Auto-detect + ChartGPU for eligible chart types |
| Fallback chain | N/A | None (WebGPU required) | Canvas/SVG/VML | WebGPU → WebGL → Canvas (3-tier) |
| Zero API change on upgrade | N/A | N/A | N/A | Target: consumers change nothing; renderer selected automatically |

---

## Sources

### High Confidence (Official Documentation and Source Code)

- [ECharts appendData documentation](https://echarts.apache.org/en/api.html#echartsInstance.appendData) — official API, confirmed 1M+ use case
- [ECharts Issue #12327](https://github.com/apache/incubator-echarts/issues/12327) — confirmed setOption wipes appendData data
- [ECharts Issue #21421 (December 2025)](http://www.mail-archive.com/commits@echarts.apache.org/msg79551.html) — WebGPU feature request; maintainer response: no current plans
- [MDN WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) — navigator.gpu detection, requestAdapter pattern
- [StockCharts MA reference](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential) — standard periods, SMA vs EMA tradeoffs
- Existing source: `packages/charts/src/base/base-chart-element.ts` — CRITICAL-03 boundary, appendData flush path
- Existing source: `packages/charts/src/shared/candlestick-option-builder.ts` — MA compute functions, MAConfig type

### Medium Confidence (WebSearch Verified)

- [ChartGPU GitHub](https://github.com/ChartGPU/ChartGPU) — WebGPU charting library, appendData API, no Canvas fallback, MIT license
- [ChartGPU HN thread](https://news.ycombinator.com/item?id=46706528) — community validation, 35M points benchmark
- [web.dev WebGPU browser support announcement](https://web.dev/blog/webgpu-supported-major-browsers) — all major browsers as of November 2025
- [WebGPU vs WebGL benchmarks 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12061801/) — 5-100x performance advantage for parallel workloads
- [ECharts progressive rendering](https://echarts.apache.org/en/feature.html) — progressive + sampling options confirmed

### Low Confidence (Directional Only)

- ChartGPU shared-device API — described in library docs but not independently verified for correctness in Shadow DOM contexts

---

*Feature research for: LitUI v10.0 WebGPU Charts milestone (PERF-01, PERF-03, WEBGPU-01)*
*Researched: 2026-03-01*
