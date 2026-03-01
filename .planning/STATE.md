---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: WebGPU Charts
status: unknown
last_updated: "2026-03-01T19:19:49Z"
progress:
  total_phases: 67
  completed_phases: 67
  total_plans: 241
  completed_plans: 241
---

# Project State: LitUI

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v10.0 WebGPU Charts — Phase 100 complete, Phase 101 (WebGPU canvas layer) next

## Current Position

Phase: 101-webgpu-two-layer-canvas-for-line-area
Plan: 03 complete — LuiAreaChart WebGPU two-layer canvas: _initWebGpuLayer() creates ChartGPU beneath ECharts; DataZoom percent-space coord sync; incremental appendData streaming; full reverse-init disconnectedCallback() teardown (WEBGPU-02). Phase 101 implementation complete.
Status: Phase 101 complete (Plan 03 of 03 done)
Last activity: 2026-03-01 — 101-03 complete: LuiAreaChart has _gpuChart, _gpuResizeObserver, _wasWebGpu, _gpuFlushedLengths; _initChart() override; _initWebGpuLayer() with { device, adapter } shared context; _syncCoordinates(); incremental appendData(seriesIndex, pairs) in _flushLineUpdates(); full reverse-init disconnectedCallback()

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

---
*State initialized: 2026-02-02*
*Last updated: 2026-03-01 — 101-03 complete: LuiAreaChart WebGPU two-layer canvas (WEBGPU-02 line+area SC1-4 satisfied; Phase 101 implementation complete)*
