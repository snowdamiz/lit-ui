---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Charts System
status: in_progress
last_updated: "2026-02-28T21:50:00.000Z"
progress:
  total_phases: 67
  completed_phases: 67
  total_plans: 240
  completed_plans: 240
---

# Project State: LitUI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-28)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** Phase 91 — Pie/Donut Chart (COMPLETE — 91-01 and 91-02 done)

## Current Position

Phase: 91 of 96 (Pie/Donut Chart — complete)
Plan: 2 of 2 in current phase (91-01 complete, 91-02 complete)
Status: Phase 91 complete — LuiPieChart + full public API (LuiPieChart, PieSlice, PieOptionProps)
Last activity: 2026-02-28 — Completed 91-02: LuiPieChart component + index.ts Phase 91 exports

Progress: [███░░░░░░░] 27% (v9.0 milestone, 9 phases, 5 of 9 complete)

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

### Architecture Notes

- THEME-SPEC.md at `.planning/phases/69-theme-foundation/THEME-SPEC.md` — authoritative v8.0 token reference
- BaseChartElement is highest-leverage Phase 88 deliverable — all 5 critical pitfalls addressed here before any chart is built
- Per-chart registry files (e.g., line-registry.ts) tree-shake ECharts to ~135KB gzipped vs 400KB for full import
- packages/charts/ is now a fully compilable workspace package ready for BaseChartElement implementation
- BaseChartElement (88-03) is complete — all 5 critical pitfalls and 11 requirements implemented; Phases 89-95 extend without re-solving cross-cutting concerns
- Phase 90 complete: LuiBarChart, LuiLineChart, LuiAreaChart all exported from @lit-ui/charts public API
- Phase 91 complete: LuiPieChart (lui-pie-chart) exported from @lit-ui/charts with PieSlice + PieOptionProps types

### TODOs
*None.*

### Blockers/Concerns

- [Phase 92]: echarts-gl 2.0.9 does not ship type definitions as subpath exports — declaration shims needed (Phase 92 scope)

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

## Session Continuity

### Last Session
- 2026-02-28: Completed 91-02 — LuiPieChart component (pie-chart.ts) + index.ts Phase 91 exports (LuiPieChart, PieSlice, PieOptionProps)

### Stopped At
Completed 91-02-PLAN.md

### Next Actions
Phase 91 complete. Continue to Phase 92.

### Open Questions
*None.*

---
*State initialized: 2026-02-02*
*Last updated: 2026-02-28 — 91-02 complete, LuiPieChart component + Phase 91 public API exports, PIE-03 delivered*
