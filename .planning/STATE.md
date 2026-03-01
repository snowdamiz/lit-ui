---
gsd_state_version: 1.0
milestone: v10.0
milestone_name: WebGPU Charts
status: defining_requirements
last_updated: "2026-03-01T00:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State: LitUI

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v10.0 WebGPU Charts — defining requirements

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-01 — Milestone v10.0 WebGPU Charts started

## Accumulated Context

### Key Decisions
*Full log in PROJECT.md.*

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

### Roadmap Evolution

- v9.0 complete: all 10 phases (88-97) archived to .planning/milestones/v9.0-ROADMAP.md
- v10.0: phases will continue from 98

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

---
*State initialized: 2026-02-02*
*Last updated: 2026-03-01 — Milestone v10.0 WebGPU Charts started*
