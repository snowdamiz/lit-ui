---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: WebGPU Charts
status: in-progress
last_updated: "2026-03-01T17:44:30Z"
progress:
  total_phases: 65
  completed_phases: 65
  total_plans: 235
  completed_plans: 235
---

# Project State: LitUI

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v10.0 WebGPU Charts — Phase 99 Plan 04 next (if any) or Phase 100

## Current Position

Phase: 99-incremental-moving-average-state-machine
Plan: 03 complete — all MA requirements wired
Status: In progress
Last activity: 2026-03-01 — 99-03 complete: MAStateMachine[] integrated into LuiCandlestickChart, O(1) incremental flush via sm.push(), CSS token MA colors via _resolveMAColors(), trim() aligned with _ohlcBuffer

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
- v9.0: ECharts pinned to 5.6.0; echarts-gl as dynamic-import-only optional peer dep
- v9.0: appendData/setOption strict boundary — setOption after appendData wipes streamed data (CRITICAL-03)
- v9.0: BaseChartElement-first — all 5 cross-cutting concerns solved before any chart built
- v9.0: Per-chart registry files for ECharts tree-shaking (~135KB gzipped vs 400KB full import)
- v9.0: OhlcBar order [open,close,low,high] is NOT the OHLC acronym order — ECharts quirk, documented in 3 locations
- v9.0: Treemap pushData() is a no-op — hierarchical data has no circular buffer equivalent; reassign .data instead

### Architecture Notes

- v9.0: @lit-ui/charts — 22nd package, 8 chart components, ECharts 5.6 + echarts-gl 2.0.9, BaseChartElement abstract base
- v9.0: appendData for Line/Area (streaming); circular buffer for Bar/Pie/Scatter/Heatmap/Candlestick; no-op for Treemap
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

- Phase 101 (WebGPU data layer): ChartGPU Shadow DOM compatibility not confirmed — build minimal prototype at Phase 101 start before committing to full integration. Fallback: raw WebGPU + custom WGSL shaders.
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
*Last updated: 2026-03-01 — 99-03 complete: MAStateMachine integrated into LuiCandlestickChart, O(1) incremental MA flush, MA-01..MA-04 all observable*
