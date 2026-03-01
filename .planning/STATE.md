---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Charts System
status: unknown
last_updated: "2026-03-01T00:28:43.252Z"
progress:
  total_phases: 71
  completed_phases: 71
  total_plans: 248
  completed_plans: 248
---

# Project State: LitUI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-28)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** Phase 94 — Candlestick Chart (complete — all 4 CNDL requirements delivered)

## Current Position

Phase: 94 of 96 (Candlestick Chart — complete)
Plan: 2 of 2 in current phase (94-02 complete — Phase 94 done)
Status: Phase 94 complete — LuiCandlestickChart (lui-candlestick-chart) exported from @lit-ui/charts; all CNDL-01/CNDL-02/CNDL-03/CNDL-04 requirements delivered
Last activity: 2026-03-01 — Completed 94-02: candlestick-chart.ts (LuiCandlestickChart component) + index.ts Phase 94 exports

Progress: [███░░░░░░░] 27% (v9.0 milestone, 9 phases, 6 of 9 complete)

## Accumulated Context

### Key Decisions
*Full log in PROJECT.md.*

- v8.0: Semantic dark mode cascade — hardcoded .dark token blocks removed; only oklch literals and white values retained
- v8.0: Double-fallback var() form standard for all CSS token docs/skill tables
- v9.0 research: Pin ECharts to 5.6.0 — echarts-gl 2.0.9 only supports ECharts 5.x (no 3.x release yet)
- v9.0 research: echarts-gl is optional peer dep, dynamic import only (never static top-level import)
- v9.0 research: appendData/setOption strict boundary — setOption after appendData wipes streamed data (CRITICAL-03)
- v9.0 research: loseContext() before dispose() required for WebGL GPU context cleanup (CRITICAL-02)
- v9.0 research: ThemeBridge reads CSS tokens via getComputedStyle — ECharts canvas cannot resolve var() natively
- 88-01: echarts/echarts-gl in dependencies (not peerDependencies) — bundled implementation details like @tanstack in data-table
- 88-01: vite-plugin-dts rollupTypes requires at least one export — comment-only placeholder causes api-extractor failure
- 88-02: buildThemeObject() called at init and on .dark toggle to avoid dispose+reinit flicker
- 88-02: DataZoomComponent/MarkLine/MarkArea/Toolbox registered in shared canvas-core — avoids per-chart-type re-registration
- 88-02: buildColorUpdate() provided as cheaper incremental dark mode update path vs full buildThemeObject()
- 88-03: EChartsOption exported as type alias for EChartsCoreOption — EChartsOption not in echarts/core subpath
- 88-03: echarts-gl @ts-ignore on dynamic import — type shims deferred to Phase 92
- 88-03: _streamingMode defaults to 'buffer' in base; concrete appendData-mode charts override
- 89-01: buildLineOption mode param ('line'|'area') — single function for both chart types
- 89-01: markLine on index-0 series only — prevents N duplicate threshold lines with N series
- 89-01: stack uses string 'total' not boolean — ECharts requires string group name to activate stacking
- 89-02: LuiAreaChart reuses registerLineModules() — ECharts has no separate AreaChart module; areaStyle is a line series property
- 89-02: stacked prop Boolean on component but translates to string 'total' in buildLineOption() — consistent with Plan 01 decision
- 90-01: bar-option-builder stack uses string 'total' not boolean — consistent with Phase 89 pattern
- 90-01: label position adapts to orientation: 'top' vertical, 'right' horizontal — avoids clipping at bar boundaries
- 90-01: colorBy: 'data' uses ThemeBridge palette automatically; no manual color lookup needed in bar charts
- 90-01: categories field optional in BarOptionProps — omit for ECharts integer index defaults
- 90-02: No _streamingMode override in LuiBarChart — inherits 'buffer' default from BaseChartElement (STRM-04)
- 90-02: categories not a reactive property on LuiBarChart — passed via option prop (BaseChartElement passthrough)
- 90-02: show-labels and color-by-data use kebab-case attribute names; JS properties are camelCase (showLabels, colorByData)
- 91-01: _mergeSmallSlices pre-processes data before ECharts — minAngle only affects rendering, not legend/tooltip data
- 91-01: isDonut guard handles four falsy cases: 0, '0', '0%', '' — '0' is truthy in JS but semantically means no inner radius
- 91-01: centerLabel title injected only when isDonut && centerLabel truthy — empty title key causes ECharts layout interference
- 91-01: PieChart module covers both pie and donut — donut is pie with innerRadius, no separate DonutChart ECharts module
- 91-02: No _streamingMode override in LuiPieChart — inherits 'buffer' default from BaseChartElement (STRM-04)
- 91-02: centerLabel passed as undefined when empty string — prevents ECharts layout interference from empty title key
- 91-02: innerRadius declared @property without type converter — HTML attribute arrives as string; buildPieOption handles string '0' as pie mode
- 92-01: echarts-gl.d.ts is a separate file (not added to vite-env.d.ts) — per plan interface spec
- 92-01: scatterGL bubble mode uses fixed symbolSize with console.warn — GPU-side rendering cannot support per-point callbacks
- 92-01: ScatterGLChart always registered unconditionally in registerScatterModules() — use() must be called for tree-shaken build to include module
- 92-01: GL series options: progressive=1e5, progressiveThreshold=1e5, blendMode='source-over' — standard echarts-gl high-perf pattern
- 92-02: No _streamingMode override in LuiScatterChart — base 'buffer' is correct; scatterGL does not support appendData (STRM-04)
- 92-02: enableGl is a reactive property inherited from BaseChartElement — changed.has('enableGl') correctly tracks runtime toggles using camelCase key
- 92-02: bubble @property declared with { type: Boolean } — consistent with other boolean chart props (showLabels, colorByData)
- 93-01: VisualMapContinuousComponent (NOT VisualMapComponent) registered — specific continuous variant for smaller bundle
- 93-01: visualMap min/max default to [0, 100] — prevents color drift during streaming (Pitfall 6 from RESEARCH.md)
- 93-01: splitArea: { show: true } on both heatmap axes — required for visible cell grid borders; omitting causes cells to blend
- 93-01: coordinateSystem: 'cartesian2d' explicitly set on heatmap series — heatmap supports geo/calendar/cartesian2d modes
- 93-01: type: 'category' on both heatmap axes — heatmap indices are integer positions into category arrays, not raw values
- 93-02: pushData() overrides base entirely — NEVER calls super.pushData(); base _circularBuffer path bypassed for cell-update semantics
- 93-02: disconnectedCallback() cancels _cellRafId BEFORE super.disconnectedCallback() — base disposes chart, component must cancel its own RAF first
- 93-02: _applyData() uses notMerge:false — notMerge:true would wipe VisualMap component on each data update
- 94-01: OhlcBar order is [open, close, low, high] — NOT OHLC acronym order; ECharts expects this specific order (documented with JSDoc warning)
- 94-01: Bull/bear colors use ECharts-native itemStyle.color / itemStyle.color0 (NOT upColor/downColor which don't exist in ECharts)
- 94-01: DataZoom xAxisIndex: [0, 1] in showVolume=true path synchronizes both grid panels (Pitfall 3)
- 94-01: BarChart + LineChart registered alongside CandlestickChart — omitting either causes silent rendering failure (Pitfall 1)
- 94-02: pushData() never calls super.pushData() — _ohlcBuffer is sole authoritative bar store; base _circularBuffer path bypassed
- 94-02: _flushBarUpdates() uses lazyUpdate:true (not notMerge:false) — preserves DataZoom state during streaming
- 94-02: bullColor/bearColor coerced from string|null to string|undefined via ?? undefined before passing to buildCandlestickOption

### Architecture Notes

- THEME-SPEC.md at `.planning/phases/69-theme-foundation/THEME-SPEC.md` — authoritative v8.0 token reference
- BaseChartElement is highest-leverage Phase 88 deliverable — all 5 critical pitfalls addressed here before any chart is built
- Per-chart registry files (e.g., line-registry.ts) tree-shake ECharts to ~135KB gzipped vs 400KB for full import
- packages/charts/ is now a fully compilable workspace package ready for BaseChartElement implementation
- BaseChartElement (88-03) is complete — all 5 critical pitfalls and 11 requirements implemented; Phases 89-95 extend without re-solving cross-cutting concerns
- Phase 90 complete: LuiBarChart, LuiLineChart, LuiAreaChart all exported from @lit-ui/charts public API
- Phase 91 complete: LuiPieChart (lui-pie-chart) exported from @lit-ui/charts with PieSlice + PieOptionProps types
- Phase 92 complete: LuiScatterChart (lui-scatter-chart) exported from @lit-ui/charts with ScatterPoint + ScatterOptionProps types; all SCAT requirements delivered
- Phase 93 plan 01 complete: heatmap-option-builder.ts (HeatmapCell, HeatmapOptionProps, buildHeatmapOption) + heatmap-registry.ts (registerHeatmapModules with HeatmapChart + VisualMapContinuousComponent)
- Phase 93 complete: LuiHeatmapChart (lui-heatmap-chart) exported from @lit-ui/charts with HeatmapCell + HeatmapOptionProps types; HEAT-01/HEAT-02 delivered
- Phase 94 plan 01 complete: candlestick-option-builder.ts (OhlcBar, MAConfig, CandlestickBarPoint, CandlestickOptionProps, buildCandlestickOption) + candlestick-registry.ts (registerCandlestickModules with CandlestickChart + BarChart + LineChart)
- Phase 94 complete: LuiCandlestickChart (lui-candlestick-chart) exported from @lit-ui/charts with OhlcBar + MAConfig + CandlestickBarPoint + CandlestickOptionProps types; all CNDL requirements delivered

### TODOs
*None.*

### Blockers/Concerns

*None.*

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

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 88 | 01 | 2min | 2 | 6 |
| 88 | 02 | 2min | 2 | 2 |
| 88 | 03 | 4min | 2 | 2 |
| 89 | 01 | 2min | 2 | 3 |
| 89 | 02 | 1min | 2 | 2 |
| 90 | 01 | 1min | 2 | 2 |
| 90 | 02 | 1min | 2 | 2 |
| 91 | 01 | 1min | 2 | 2 |
| 91 | 02 | 2min | 2 | 2 |
| 92 | 01 | 4min | 2 | 4 |
| 92 | 02 | 1min | 2 | 2 |
| 93 | 01 | 1min | 2 | 2 |
| 93 | 02 | 1min | 2 | 2 |
| 94 | 01 | 2min | 2 | 2 |
| 94 | 02 | 2min | 2 | 2 |

## Session Continuity

### Last Session
- 2026-03-01: Completed 94-02 — candlestick-chart.ts (LuiCandlestickChart component with pushData override, RAF streaming, all CNDL properties) + index.ts Phase 94 exports; Phase 94 complete

### Stopped At
Completed 94-02-PLAN.md

### Next Actions
Phase 94 complete. Continue to Phase 95 (next chart phase per ROADMAP).

### Open Questions
*None.*

---
*State initialized: 2026-02-02*
*Last updated: 2026-03-01 — 94-02 complete, candlestick-chart.ts + index.ts Phase 94 exports, Phase 94 complete*
