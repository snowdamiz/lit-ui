# Project Research Summary

**Project:** @lit-ui/charts v10.0 WebGPU Charts
**Domain:** WebGPU rendering path, 1M+ streaming, and moving average overlay for an ECharts 5.6 + Lit 3 web component chart suite
**Researched:** 2026-03-01
**Confidence:** HIGH (stack, features, pitfalls); MEDIUM (WebGPU/ChartGPU integration specifics)

## Executive Summary

This milestone adds three orthogonal capabilities to the working v9.0 @lit-ui/charts package: a WebGPU auto-detection and rendering path for Line/Area charts (via ChartGPU 0.3.2 as a parallel renderer), 1M+ continuous streaming support with TypedArray ring buffers and progressive ECharts configuration, and O(1) incremental moving average computation for streaming candlestick charts. The correct architectural approach is a two-layer canvas design — WebGPU canvas below (data pixels) + ECharts canvas above (axes, tooltip, DataZoom) — with coordinate synchronization via ECharts' `convertToPixel()` API. All three features are additive; the existing v9.0 stack (ECharts 5.6.0 pinned, echarts-gl 2.0.9, BaseChartElement, ThemeBridge) is unchanged.

The recommended stack adds only one new dependency: ChartGPU 0.3.2 (MIT, dynamic import only — same SSR guard pattern as echarts-gl). ECharts must remain pinned at 5.6.0 because echarts-gl 2.x does not support ECharts 6.x, and no echarts-gl 3.x exists as of 2026-03-01. Moving average computation requires no new npm dependency — O(1) incremental SMA/EMA via a 30-line TypeScript circular buffer state machine replaces the existing O(n) full-recompute approach.

The dominant risks are SSR crashes from unguarded `navigator.gpu` references (replicate the existing `isServer` guard pattern exactly), WebGPU device loss recovery using a consumed GPUAdapter (never cache the adapter — always call `requestAdapter()` fresh on recovery), unbounded `appendData` heap growth (ECharts has no native truncation — implement a periodic clear+reset cycle externally at `maxPoints`), and coordinate misalignment between the two canvas layers after DataZoom events (re-sync via `convertToPixel()` on every `dataZoom` and `rendered` event). WebGPU coverage is approximately 65% of real-world browsers — the Canvas fallback chain must be first-class, not an afterthought.

## Key Findings

### Recommended Stack

The v9.0 stack is fully preserved. ChartGPU 0.3.2 is added as the only new dependency, used exclusively as an opt-in parallel renderer for LuiLineChart and LuiAreaChart when WebGPU is detected. ChartGPU must use dynamic import (`await import('chartgpu')`) — never a static top-level import — to avoid SSR crashes (identical constraint to echarts-gl). ECharts 6.0.0 must not be adopted: echarts-gl 2.0.9 (which enables the `enable-gl` WebGL scatter path) only supports ECharts 5.x. A future v11.x milestone is the correct place for ECharts 6 + echarts-gl 3.x when the latter is published.

**Core technologies:**
- `navigator.gpu` (native browser API): WebGPU tier detection — zero-dependency, null-check gates the entire WebGPU path
- ChartGPU 0.3.2: WebGPU-native renderer for Line/Area at 1M+ points — the only production-ready WebGPU charting library as of 2026; dynamic import only
- ECharts 5.6.0 (pinned): axes, tooltip, DataZoom, legend for all 8 chart types — no WebGPU renderer, none planned by maintainers; must not be upgraded until echarts-gl 3.x exists
- echarts-gl 2.0.9 (pinned): WebGL scatter path via `enable-gl` — must not be broken by an ECharts upgrade
- TypeScript O(1) MA state machine: replaces O(n) `_computeSMA`/`_computeEMA` for streaming candlestick — no npm dependency needed

### Expected Features

**Must have (table stakes):**
- WebGPU auto-detection with SSR-safe `isServer` guard — zero consumer config, automatic upgrade
- Three-tier fallback chain: WebGPU → WebGL (echarts-gl) → Canvas — must be unconditional, not opt-in
- `renderer-selected` custom event and `renderer` readable property on BaseChartElement
- `enable-webgpu` boolean attribute consistent with existing `enable-gl` attribute pattern
- TypedArray data path in appendData flush (`Float32Array`/`Float64Array`) — required for 1M-point GC budget
- `progressive: 2000` + `progressiveThreshold: 500000` + `animation: false` on Line/Area ECharts series
- Multi-series `pushData(point, seriesIndex?)` routing in BaseChartElement
- External `maxPoints` truncation cycle for appendData mode (ECharts has no native truncation)
- O(1) incremental SMA/EMA update in LuiCandlestickChart (`StreamingMAState[]` per MA config)
- CSS token default colors for MA periods (prevents "all MAs black" when color omitted from MAConfig)

**Should have (competitive):**
- `sampling: 'lttb'` on Line/Area series for zoom-out quality (ECharts native option, low complexity)
- Shared GPUDevice singleton across chart instances (avoids browser device-count limit)
- MA warm-up seed-carry across ring buffer truncation boundaries (prevents MA discontinuity at `maxPoints`)
- Named MA types in legend (`showType` on MAConfig: "MA20 (EMA)" vs. "MA20")

**Defer (v11+):**
- ChartGPU full ThemeBridge integration for dark mode toggling (v10.0 accepts the gap — wire CSS tokens at init only; full dark mode toggling is a v10.1 refinement)
- ECharts 6.0 + echarts-gl 3.x upgrade (separate milestone, blocked on echarts-gl publishing ECharts 6 support)
- WMA / MACD / RSI / Bollinger Bands (out of scope; `getChart()` escape hatch covers power users)
- Calendar heatmap mode (deferred from v9.0, independent of all v10.0 features)

### Architecture Approach

The core architecture is a two-layer canvas composition: a WebGPU `<canvas>` at `z-index: 0` (data series pixels, `pointer-events: none`) beneath an ECharts `<canvas>` at `z-index: 1` (axes, legend, tooltip, DataZoom, `background: transparent`). Both canvases live inside the existing `#chart` shadow root div. ECharts holds axis scale state only (series data is empty/placeholder in WebGPU mode); the WebGPU layer reads the coordinate transform via `echartsInstance.convertToPixel()` and re-syncs on every `dataZoom` and `rendered` event. For candlestick MA, the approach is a per-chart `_maStates: MAState[]` array updated O(1) per bar during `pushData()`, with full recompute triggered only on ring buffer trim.

**Major components:**
1. `WebGPUDetector` (new, `base/webgpu-detector.ts`) — async `navigator.gpu → requestAdapter() → requestDevice()` probe; returns `{ renderer, device, adapter }`
2. `WebGPUDataLayer` (new, `webgpu/webgpu-data-layer.ts`) — owns WebGPU canvas, GPURenderPipeline, `appendPoints()`, `resize()`, `destroy()`; reads coordinate transform from ECharts via `convertToPixel()`
3. `downsampleLTTB` (new, `shared/lttb.ts`) — LTTB decimation; ECharts receives at most 2K decimated points for axes while WebGPU renders the full dataset
4. `MAState` / `createMAState` / `updateMAState` (new, `candlestick/incremental-ma.ts`) — O(1) incremental SMA/EMA update per streaming bar
5. WGSL shaders (new, `webgpu/shaders/`) — vertex/fragment shaders for line and area series rendering
6. `BaseChartElement` (modified) — adds `_webgpuLayer`, `_activeRenderer`, `enable-webgpu` prop; modifies `_initChart()`, `_flushPendingData()`, `disconnectedCallback()`
7. `LuiLineChart` / `LuiAreaChart` (modified) — WebGPU-path branch in `_applyData()` using scaffold option builder (no series data in ECharts option when WebGPU active)
8. `LuiCandlestickChart` (modified) — adds `_maStates`, replaces full recompute with `updateMAState()`, adds `_resetMAStates()` on buffer trim

**Classes that do NOT change:** LuiBarChart, LuiPieChart, LuiScatterChart, LuiHeatmapChart, LuiTreemapChart, ThemeBridge, all registry files.

### Critical Pitfalls

1. **SSR crash from unguarded `navigator.gpu`** (CRITICAL-01) — all WebGPU initialization must live inside `firstUpdated()`, guarded by `if (isServer) return` at the top of the init function. Never reference `navigator.gpu` in class field initializers, module-level code, or `_registerModules()`. Same three-layer defense pattern as the existing ECharts SSR guard.

2. **Consumed GPUAdapter reuse on device loss recovery** (CRITICAL-02) — never store `this._gpuAdapter` past the initial `requestDevice()` call. Always call `navigator.gpu.requestAdapter()` fresh inside device loss recovery. The consumed adapter silently returns an already-lost device with no exception. Handle `device.lost` with `.then()`, never `await`.

3. **Dual-canvas context conflict** (CRITICAL-03) — a single `<canvas>` element cannot hold both a WebGPU context and a Canvas 2D context. Use two separate canvas elements; WebGPU at `z-index: 0` with `pointer-events: none`, ECharts at `z-index: 1` with `background: transparent`. Pass `{ backgroundColor: 'transparent' }` to `echarts.init()` theme.

4. **Coordinate mismatch between canvas layers** (CRITICAL-04) — the WebGPU layer must not compute its own data-to-pixel transform independently. Read ECharts' transform via `chart.convertToPixel()` before every WebGPU render frame. Re-sync on every `dataZoom` and `rendered` event. Handle DPR identically in both layers — WebGPU canvas `width`/`height` attributes must be set to `clientWidth * devicePixelRatio`.

5. **Unbounded `appendData` heap growth** (CRITICAL-05) — ECharts has no `removeData()` API and no maximum-points option for `appendData`. At 1000 pts/sec, the tab crashes after 20-30 minutes. Implement an external truncation cycle: at `maxPoints`, call `chart.clear()` + structural `setOption` + re-append from typed array ring buffer. The ring buffer itself must be a pre-allocated `Float32Array`/`Float64Array` — never a plain `number[]` — to prevent GC pauses at 1M+ points.

## Implications for Roadmap

Build order is constrained by three dependency chains identified in architecture research: WebGPU detection must precede WebGPU layer code; WebGPUDataLayer requires GPUDevice from the detector; incremental MA update is fully independent. The architecture research defines a Phase A-F sequence that maps cleanly to the roadmap phases below.

### Phase 1: WebGPU Foundation (Detection + Fallback Chain)

**Rationale:** Every subsequent WebGPU capability depends on the detector existing and the SSR guard being established. The fallback chain must be unconditional — build this first to prevent every downstream phase from needing to retrofit it. Zero visual change to users; pure infrastructure.
**Delivers:** `WebGPUDetector.probe()`, `enable-webgpu` property on BaseChartElement, `_activeRenderer` state, `renderer-selected` custom event, `renderer` readable property, SSR guard verified in CI (Next.js App Router build must pass).
**Addresses:** WebGPU auto-detect table stakes, renderer readable property.
**Avoids:** CRITICAL-01 (SSR crash), HIGH-01 (fallback chain first-class), HIGH-02 (device.lost must use `.then()` not `await`), CRITICAL-02 (adapter consumption pattern established from the start).

### Phase 2: Incremental Moving Average (Independent)

**Rationale:** MA streaming correctness is fully independent of all WebGPU work — no dependency on Phase 1 or any later phase. It has the lowest implementation complexity and fixes a bug in the existing v9.0 feature: MA computation is currently broken during high-rate streaming (O(n) per frame). Ship this independently to deliver user value without waiting for the more complex WebGPU phases.
**Delivers:** `MAState`, `createMAState`, `updateMAState` in `candlestick/incremental-ma.ts`; `_maStates` in LuiCandlestickChart replacing the full-recompute path; CSS token default colors for MA periods; NaN-safe SMA/EMA computation; warm-up seed-carry across buffer truncation.
**Implements:** Incremental MA component (Architecture item 4).
**Avoids:** HIGH-04 (MA off-by-one on truncation), MEDIUM-01 (O(N) EMA per flush), MEDIUM-04 (NaN propagation).

### Phase 3: 1M+ Streaming Infrastructure (TypedArray + Progressive + Truncation)

**Rationale:** The typed array ring buffer and external truncation cycle are shared infrastructure consumed by both the ECharts appendData path and the WebGPU data layer. The LTTB decimation utility built here is also required by Phase 4. Must be in place before any WebGPU rendering work begins.
**Delivers:** Pre-allocated `Float32Array`/`Float64Array` ring buffer in BaseChartElement; external `maxPoints` truncation cycle for appendData mode; `progressive: 2000` / `progressiveThreshold: 500000` / `animation: false` on Line/Area ECharts series; `sampling: 'lttb'` config; multi-series `pushData(point, seriesIndex?)` routing; `downsampleLTTB()` utility in `shared/lttb.ts`; `replaceMerge` fix in `_applyThemeUpdate()` to prevent stream data wipe on dark mode toggle.
**Avoids:** CRITICAL-05 (unbounded appendData heap growth), HIGH-03 (plain JS array GC pauses), HIGH-05 (theme update wipes stream data).

### Phase 4: WebGPU Data Layer (Canvas Layering + Coordinate Sync + WGSL Shaders)

**Rationale:** Depends on Phase 1 (GPUDevice from detector) and Phase 3 (LTTB decimation utility, ring buffer infrastructure). The two-canvas architecture and coordinate sync mechanism are implemented here. This is the highest-complexity phase and requires early Safari 26 validation to catch platform-specific device loss issues.
**Delivers:** `WebGPUDataLayer` class with two-canvas shadow DOM injection, GPURenderPipeline, `appendPoints()`, `resize()` (canvas.width/height + `configure()` re-call), `destroy()`; coordinate sync via `convertToPixel()` on `dataZoom` and `rendered` events; WGSL line/area shaders using `Float32Array` vertex buffers; shared GPUDevice singleton for multi-chart pages.
**Avoids:** CRITICAL-03 (dual-canvas context conflict), CRITICAL-04 (coordinate mismatch), HIGH-06 (WebGPU canvas not resized in sync with ECharts), MEDIUM-02 (DataView vs Float32Array), MEDIUM-03 (Safari pipeline device loss — conservative shader features only: no `f16`, no depth/stencil, `requiredFeatures: []`).

### Phase 5: Line/Area ChartGPU Integration + BaseChartElement Wiring

**Rationale:** Depends on Phase 4 (WebGPUDataLayer exists). Wires the data layer into BaseChartElement's lifecycle and adds the WebGPU branch to LuiLineChart and LuiAreaChart. Only these two chart types gain the WebGPU path — all other 6 chart types continue using ECharts Canvas exclusively.
**Delivers:** Modified `_initChart()` calling `WebGPUDataLayer.create()` when WebGPU active; modified `_flushPendingData()` routing to WebGPU layer vs. ECharts appendData; `LuiLineChart._applyData()` and `LuiAreaChart._applyData()` WebGPU branches with scaffold option (axes only, no series data); `buildLineScaffold()` ECharts option variant; ResizeObserver syncing both layers; `disconnectedCallback()` calling `webgpuLayer.destroy()`.
**Uses:** ChartGPU 0.3.2 (dynamic import only), WebGPUDetector, WebGPUDataLayer, downsampleLTTB.

### Phase 6: Skill File and Documentation Updates

**Rationale:** All implementation complete. Document constraints and attributes for downstream consumers and the AI skill system before declaring the milestone done.
**Delivers:** Updated `line-chart`, `area-chart`, `candlestick-chart` skill files covering `enable-webgpu` attribute behavior, streaming MA constraints (changing `movingAverages` after streaming starts requires chart reinit), bundle size guidance, WebGPU browser support table, and the "Looks Done But Isn't" verification checklist from PITFALLS.md.

### Phase Ordering Rationale

- Phase 1 before Phase 4/5: SSR guard and fallback chain are the foundation — no GPU code without the detection pattern fully established.
- Phase 2 is independent: MA streaming fix can ship as a self-contained improvement without waiting for any WebGPU work.
- Phase 3 before Phase 4: The typed array ring buffer and LTTB decimation utility are consumed by the WebGPU data layer and must exist first.
- Phase 4 before Phase 5: WebGPUDataLayer must exist and be tested before BaseChartElement wires it in.
- Phase 6 last: Documentation accurately reflects the final implementation.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 4 (WebGPU Data Layer):** WGSL shader authoring for line/area is niche — coordinate system (NDC vs screen space), instanced quad vs polyline tessellation, and alpha compositing with the ECharts canvas above need validation against the gpuweb spec and ChartGPU source before implementation.
- **Phase 4 (WebGPU Data Layer):** ChartGPU Shadow DOM integration is MEDIUM confidence — no explicit docs confirm `ChartGPU.create(shadowRootDiv, options)` works inside an open-mode Shadow DOM. Build a minimal prototype at the start of Phase 4 before committing to the full integration. If incompatible, fallback is raw WebGPU via custom WGSL shaders (WebGPUDataLayer without ChartGPU).
- **Phase 5 (ChartGPU Integration):** ChartGPU 0.3.2 color configuration API is not fully documented in available research. Research the ChartGPU color config API before implementing theme wiring. If insufficient, accept the v10.0 gap (CSS tokens wired at init only; full dark mode toggling deferred to v10.1).

Phases with standard patterns (skip research-phase):

- **Phase 1 (WebGPU Detection):** `navigator.gpu → requestAdapter()` detection is thoroughly documented in MDN and web.dev. The fallback chain pattern mirrors the existing `_maybeLoadGl()` hook exactly.
- **Phase 2 (Incremental MA):** O(1) sliding window SMA and incremental EMA are textbook algorithms. The implementation site is fully understood from existing v9.0 source.
- **Phase 3 (Streaming Infrastructure):** TypedArray ring buffers and ECharts `progressive`/`sampling` options are well-documented. The external truncation cycle pattern is straightforward.
- **Phase 6 (Documentation):** Follows established skill file format from v9.0.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | ECharts 5.6 pinning rationale verified against echarts-gl releases. ChartGPU 0.3.2 confirmed MIT, Feb 2026, official GitHub repo. navigator.gpu detection from MDN official. ECharts 6 incompatibility confirmed from echarts-gl releases page and ECharts 6 upgrade guide. |
| Features | HIGH | Table stakes verified against ECharts official docs, existing v9.0 source code, and StockCharts MA reference. ChartGPU feature set from official GitHub. One gap: ChartGPU shared-device API and color config API need validation (MEDIUM). |
| Architecture | HIGH (ECharts/MA) / MEDIUM (WebGPU layer) | Two-canvas layered pattern is well-established (Greggman gist, WebGL2Fundamentals). ECharts `convertToPixel()` coordinate sync confirmed from ECharts API docs. WebGPU layer specifics (ChartGPU Shadow DOM, WGSL shader details) are inferred from analogous patterns, not directly verified against ChartGPU docs. |
| Pitfalls | HIGH | All critical pitfalls sourced from official specs (MDN, gpuweb spec), toji.dev best practices guide, confirmed ECharts GitHub issues (#12327, #21075, #13197), and Lit SSR docs. Safari 26 device loss from imgui issue #9103 is MEDIUM (single source, plausible). |

**Overall confidence:** HIGH for the approach and build order; MEDIUM for WebGPU/ChartGPU integration specifics that require early prototyping to validate.

### Gaps to Address

- **ChartGPU Shadow DOM compatibility:** No explicit documentation confirms `ChartGPU.create(shadowRootElement, ...)` works inside an open-mode Shadow DOM. Build a minimal prototype at the start of Phase 4. If incompatible, fallback plan is raw WebGPU with custom WGSL shaders rather than ChartGPU.
- **ChartGPU ThemeBridge mapping:** ChartGPU 0.3.2 color configuration API is not fully described in available research. Research before Phase 5 theme wiring. If insufficient, accept the v10.0 gap (CSS tokens at init only; full dark mode toggling deferred to v10.1).
- **ECharts `appendData` + `replaceMerge` theme update interaction:** The claim that `_applyThemeUpdate()` is "safe" because it passes only `{ color: [...] }` without series keys needs an explicit test against ECharts 5.6.0 to confirm no data wipe occurs. Add to Phase 3 verification.
- **WGSL line/area shader design:** If ChartGPU is used as the renderer this is moot (ChartGPU provides the shaders). If raw WebGPU is needed as the Shadow DOM fallback, the shader design needs a dedicated spike at the start of Phase 4.

## Sources

### Primary (HIGH confidence)
- [ECharts features page](https://echarts.apache.org/en/feature.html) — appendData, TypedArray, progressive rendering
- [ECharts API: appendData](https://echarts.apache.org/en/api.html#echartsInstance.appendData) — official API
- [ECharts Issue #12327](https://github.com/apache/incubator-echarts/issues/12327) — setOption wipes appendData data (confirmed)
- [echarts-gl releases](https://github.com/ecomfe/echarts-gl/releases) — v2.0.9 latest, ECharts 5.x only
- [ECharts 6 upgrade guide](https://echarts.apache.org/handbook/en/basics/release-note/v6-upgrade-guide/) — breaking changes confirmed
- [MDN: GPU.requestAdapter()](https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter) — detection pattern, isFallbackAdapter behavior
- [MDN: GPUDevice.lost](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/lost) — device loss promise API
- [MDN: GPUCanvasContext](https://developer.mozilla.org/en-US/docs/Web/API/GPUCanvasContext) — one-context-per-canvas rule, configure() requirements
- [MDN: TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) — GC characteristics vs plain Array
- [toji.dev: WebGPU Device Loss Best Practices](https://toji.dev/webgpu-best-practices/device-loss.html) — adapter consumption, recovery patterns, .then() vs await
- [gpuweb/gpuweb Error Handling Design](https://github.com/gpuweb/gpuweb/blob/main/design/ErrorHandling.md) — spec-level error handling
- [web.dev: WebGPU supported in major browsers](https://web.dev/blog/webgpu-supported-major-browsers) — Chrome, Firefox 141, Safari 26 coverage (Nov 2025)
- [Lit SSR Server Usage](https://lit.dev/docs/ssr/server-usage/) — isServer guard patterns
- [WebGL2Fundamentals: Canvas 2D overlay layering](https://webgl2fundamentals.org/webgl/lessons/webgl-text-canvas2d.html) — two-canvas pattern
- [StockCharts MA reference](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential) — standard periods, SMA vs EMA
- [ECharts Issue #13197](https://github.com/apache/echarts/issues/13197) — progressive rendering breaks DataZoom on Candlestick

### Secondary (MEDIUM confidence)
- [ChartGPU GitHub](https://github.com/ChartGPU/ChartGPU) — API surface, appendData, version 0.3.2 (Feb 2026)
- [ChartGPU HN thread](https://news.ycombinator.com/item?id=46693978) — 1M+ point claims, community validation
- [ECharts Issue #21075](https://github.com/apache/echarts/issues/21075) — real-time performance ceiling (~80K samples at 10fps)
- [ECharts Issue #21421](http://www.mail-archive.com/commits@echarts.apache.org/msg79551.html) — maintainer confirmed no WebGPU plans for ECharts
- [gpuweb Implementation Status Wiki](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) — browser support matrix, March 2026
- [ECharts streaming/scheduling (DeepWiki)](https://deepwiki.com/apache/echarts/2.4-streaming-and-scheduling) — internal scheduler
- [WebGPU with Canvas 2D sync (Greggman gist)](https://gist.github.com/greggman/6eddf8a75ca99ba4533f75ffa624c5ea) — canonical two-canvas pattern
- [WebGPU vs WebGL benchmarks 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12061801/) — 5-100x performance advantage for parallel workloads

### Tertiary (LOW confidence / needs validation)
- ChartGPU shared-device API (`{ adapter, device }` shared-device mode) — described in library docs, not independently verified for Shadow DOM contexts
- [ocornut/imgui Issue #9103](https://github.com/ocornut/imgui/issues/9103) — Safari 26 WebGPU device lost on specific render passes (single source)

---
*Research completed: 2026-03-01*
*Ready for roadmap: yes*
