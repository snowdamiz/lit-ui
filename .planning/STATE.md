---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: WebGPU Charts
status: unknown
last_updated: "2026-03-01T21:23:59.894Z"
progress:
  total_phases: 71
  completed_phases: 71
  total_plans: 252
  completed_plans: 252
---

# Project State: LitUI

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v10.0 WebGPU Charts — Phase 104 fixing ExampleBlock code examples across chart docs pages

## Current Position

Phase: 104-update-code-example-blocks-for-all-chart-types-they-are-not-accurate-most-are-displaying-html-for-all-tabs
Plan: 02 complete — ScatterChartPage, HeatmapChartPage, CandlestickChartPage, TreemapChartPage ExampleBlock props updated with per-framework code strings (HTML/React/Vue/Svelte). Heatmap shows all 3 property assignments; Candlestick includes OHLC order warning and omits enable-webgpu; Treemap shows hierarchical children shape.
Status: Phase 104 in progress (Plan 02 of N done)
Last activity: 2026-03-01 — 104-02 complete: Scatter, Heatmap, Candlestick, Treemap chart pages now have 4 distinct per-framework ExampleBlock code strings

## Accumulated Context

### Key Decisions
*Full log in PROJECT.md.*

- v10.0 (98-01): Use triple-slash directive in webgpu-device.ts (not tsconfig types array) to scope @webgpu/types without base config conflicts
- v10.0 (98-01): GPUDevice singleton caches Promise<GPUDevice> not the adapter — subsequent callers skip requestDevice() without consuming adapters
- v10.0 (98-01): releaseGpuDevice() is Phase 98 stub — device.destroy() teardown is Phase 101's responsibility
- v10.0 (98-02): renderer field is NOT @property() — GPU tier must not trigger Lit reactive updates
- v10.0 (98-02): _detectRenderer() is protected so Phase 101 subclasses can override WebGPU detection
- v10.0 (98-02): Only RendererTier exported from index.ts — acquireGpuDevice is internal Phase 101 infrastructure
- v10.0 (99-01): MAStateMachine uses O(1) ring buffer (SMA) and warm-up accumulator (EMA) with NaN gate before any state mutation
- v10.0 (99-01): MAStateMachine type-only import of MAConfig avoids circular dependency with candlestick-option-builder
- v10.0 (99-02): MAConfig.color made optional — component assigns CSS token defaults in candlestick chart update (Plan 03)
- v10.0 (99-02): readChartToken() uses protected accessor pattern — ThemeBridge stays private, only read access exposed to subclasses
- v10.0 (99-02): maValueArrays/resolvedMAColors in CandlestickOptionProps — streaming state machine passes pre-computed values, skipping O(n) SMA/EMA rebuilds on each tick
- v10.0 (99-03): Default MA colors start at --ui-chart-color-2 (color-1 reserved for ECharts primary theme data)
- v10.0 (99-03): _maStateMachines always fully rebuilt in _applyData() — atomic rebuild handles dynamic MA config count changes without state drift
- v10.0 (99-03): trim() added to MAStateMachine — call after _ohlcBuffer.slice(-maxPoints) to keep MA value array indices aligned
- v10.0 (100-01): _initChart() made protected (not private) — consistent with _detectRenderer() pattern; enables _triggerReset() in Plans 02/03
- v10.0 (100-01): sampling:'lttb' as const required — ECharts type demands literal, TypeScript would widen to string without as const
- v10.0 (100-01): largeThreshold:2000 — below 2000 points large mode is skipped; zero overhead on small datasets
- v10.0 (100-02): maxPoints = 500_000 override on LuiLineChart/LuiAreaChart — base default of 1000 is for circular-buffer charts; 500k allows ~8 min at 1000 pts/sec before dispose+reinit
- v10.0 (100-02): new Float32Array(buf as number[]) for scalar numeric points — line/area xAxis is category (position-indexed), pushData receives numeric y-values only; no .flat() needed
- v10.0 (100-02): slice(0, seriesCount) guard in _flushLineUpdates() prevents setOption errors when multi-series pushData arrives before _applyData() registers all ECharts series
- v10.0 (100-03): Area chart streaming uses identical pattern to line chart (same field names, methods, override signatures) — both committed in 3357c97; only file differs (area-chart.ts vs line-chart.ts)
- v10.0 (101-01): chartgpu@0.3.2 in dependencies (not devDependencies) — runtime dep dynamically imported in Plans 02/03
- v10.0 (101-01): releaseGpuDevice() changed to async Promise<void> — device.destroy() requires awaiting device promise; callers use void releaseGpuDevice() fire-and-forget from disconnectedCallback()
- v10.0 (101-01): getGpuAdapter() new export — Plans 02/03 pass { adapter, device } to ChartGPU.create() for shared-device context; _adapter nulled after device.destroy() to prevent stale reference
- v10.0 (101-02): _GpuChartInstance local interface matches real ChartGPU 0.3.2 API: appendData(seriesIndex, newPoints) — plan spec had wrong single-arg signature; corrected after tsc error
- v10.0 (101-02): ChartGPUCreateContext.adapter is required (not optional) in 0.3.2 — null guard added; standalone ChartGPU.create() fallback when adapter unavailable
- v10.0 (101-02): Incremental appendData tracking via _gpuFlushedLengths[] per series — x-index starts from lastFlushed, reset to [] in _triggerReset()
- v10.0 (101-02): disconnectedCallback() reverse-init order: RAF cancel → gpuResizeObserver.disconnect → gpuChart.dispose → void releaseGpuDevice() → super
- v10.0 (101-03): Area chart WebGPU integration identical to line chart — no new decisions; all patterns inherited from 101-02 (appendData(seriesIndex, pairs), adapter null guard, double-cast, reverse-init order)
- v10.0 (103-03): Candlestick skill shared props reference extended with enableWebGpu and renderer; bull/bear color init-time limitation documented with v10.1 deferral note
- v10.0 (102-01): renderer-selected added to shared charts SKILL.md because all 8 charts inherit _detectRenderer() from BaseChartElement — table note clarifies only line/area activate ChartGPU rendering
- v10.0 (102-01): pushData seriesIndex kept out of shared methods table signature (base is single-arg); documented as note below table and in full in line/area sub-skill files
- v10.0 (102-01): maxPoints override (500,000) documented in sub-skill Props section header rather than shared props table which correctly shows base default of 1000
- v10.0 (102-02): candlestick SKILL.md: MAConfig.color documented as optional; showType, NaN-gap rule, CSS token default color sequence (color-2 to color-5), and LOOKS DONE BUT ISN'T reinit warning added
- v10.0 (102-03): max-points default corrected from 1000 to 500000 in LineChartPage and AreaChartPage docs to match Phase 100 override; renderer PropDef description explicitly warns against synchronous read before renderer-selected event
- v10.0 (103-01): _gpuFlushedLength is a single number (not array) — candlestick is always single-series; no per-series array complexity needed unlike line/area charts
- v10.0 (103-01): _toGpuPoint() prepends bar index to form [index, open, close, low, high] — ECharts OHLC order [open,close,low,high] preserved, index prepended as position coordinate
- v10.0 (103-01): _wasWebGpu flag drives transparent color gate in both _applyData() and _flushBarUpdates() — both paths rebuild full ECharts option independently so both need the gate
- v9.0: ECharts pinned to 5.6.0; echarts-gl as dynamic-import-only optional peer dep
- v9.0: appendData/setOption strict boundary — setOption after appendData wipes streamed data (CRITICAL-03)
- v9.0: BaseChartElement-first — all 5 cross-cutting concerns solved before any chart built
- v9.0: Per-chart registry files for ECharts tree-shaking (~135KB gzipped vs 400KB full import)
- v9.0: OhlcBar order [open,close,low,high] is NOT the OHLC acronym order — ECharts quirk, documented in 3 locations
- v9.0: Treemap pushData() is a no-op — hierarchical data has no circular buffer equivalent; reassign .data instead

### Architecture Notes

- v9.0: @lit-ui/charts — 22nd package, 8 chart components, ECharts 5.6 + echarts-gl 2.0.9, BaseChartElement abstract base
- v9.0/v10.0: Line/Area use per-series ring buffers + RAF coalescing + Float32Array flush (replaced appendData path in 100-02/03); circular buffer for Bar/Pie/Scatter/Heatmap/Candlestick; no-op for Treemap
- v9.0: ThemeBridge resolves CSS tokens via getComputedStyle (ECharts canvas cannot read var() natively)
- v9.0: Per-chart registry files tree-shake ECharts to ~135KB gzipped; full import is ~400KB
- v9.0: 9 AI skill files — main router (entries 24-32) + skills/charts router + 8 chart sub-skills
- v10.0: WebGPU detection lives in firstUpdated(), guarded by isServer — same pattern as echarts-gl SSR guard
- v10.0: Two-layer canvas — WebGPU canvas at z-index:0 (data), ECharts canvas at z-index:1 (axes/tooltip/DataZoom)
- v10.0: GPUDevice singleton shared across all chart instances (browser device count limit constraint)
- v10.0: ChartGPU 0.3.2 dynamic import only — same SSR constraint as echarts-gl
- v10.0: ECharts must remain at 5.6.0 — echarts-gl 2.0.9 does not support ECharts 6.x

### Roadmap Evolution

- v9.0 complete: all 10 phases (88-97) archived to .planning/milestones/v9.0-ROADMAP.md
- v10.0: 5 phases (98-102) — WebGPU detector, MA state machine, streaming infra, WebGPU canvas layer, docs
- Phase 103 added: Candlestick chart WebGPU support — implement WebGPU rendering, update docs, update skill; docs page uses WebGPU by default if available
- Phase 104 added: Update code example blocks for all chart types. They are not accurate (most are displaying html for all tabs)
- v10.0 (104-01): ExampleBlock per-framework code strings — React uses useRef+useEffect+if(ref.current) guard, Vue uses ref()+onMounted+chart.value.data, Svelte uses let chart+onMount+bind:this; all 4 chart pages (Line/Area/Bar/Pie) updated
- v10.0 (104-02): Candlestick code examples omit enable-webgpu — kept clean for basic usage; WebGPU feature documented separately in props table and callout box
- v10.0 (104-02): All 4 candlestick framework variants include the OHLC order warning comment inline
- v10.0 (104-02): Heatmap: all 4 framework variants assign all 3 properties (xCategories, yCategories, data) — critical for chart to render

### TODOs
*None.*

### Blockers/Concerns

- Phase 101 (WebGPU data layer): ChartGPU Shadow DOM compatibility not confirmed — build minimal prototype at Phase 101 start before committing to full integration. Fallback: raw WebGPU + custom WGSL shaders. (Plan 01 done — ChartGPU installed; Plans 02/03 will prototype.)
- Phase 101 (ChartGPU): Color config API not fully documented — research before theme wiring. If insufficient, accept init-time CSS token wiring only; full dark mode toggling deferred to v10.1.

### Tech Debt (carried forward)
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)
- CalendarMulti exported but unused by other packages
- CLI registry.json incorrect time-picker->calendar dependency

## Quick Tasks

| ID | Name | Duration | Date |
|----|------|----------|------|
| quick-001 | Cmd+K command palette with full-text search | 2m 55s | 2026-02-02 |
| quick-002 | Agents skill with progressive disclosure router + global installer | 5m 25s | 2026-02-27 |
| quick-003 | Split components skill into 18 individual per-component skills based on docs pages | - | 2026-02-27 |
| quick-004 | Deploy latest changes to npm — publish @lit-ui/charts@1.0.0 | 2m 54s | 2026-03-01 |
| quick-005 | Publish @lit-ui/charts with README to npm — @lit-ui/charts@1.0.1 | ~4m | 2026-03-01 |

---
*State initialized: 2026-02-02*
*Last updated: 2026-03-01 — quick-005 complete: @lit-ui/charts@1.0.1 published to npm with README; awaiting human verification at npmjs.com/package/@lit-ui/charts.*
