---
phase: 93-heatmap-chart
plan: 02
subsystem: ui
tags: [echarts, heatmap, visualmap, charts, typescript, streaming, cell-update]

# Dependency graph
requires:
  - phase: 93-heatmap-chart-plan-01
    provides: heatmap-option-builder.ts (HeatmapCell, HeatmapOptionProps, buildHeatmapOption) + heatmap-registry.ts (registerHeatmapModules)
  - phase: 88-charts-base
    provides: BaseChartElement, pushData() override contract

provides:
  - LuiHeatmapChart Lit custom element (lui-heatmap-chart) in heatmap-chart.ts
  - Phase 93 public API exports in index.ts (LuiHeatmapChart, HeatmapCell, HeatmapOptionProps)

affects: [@lit-ui/charts public API, Phase 93 complete]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pushData() fully overridden — base streaming path bypassed entirely for cell-update semantics"
    - "_pendingCells Map + _cellRafId RAF coalescing — last write per [xi,yi] key in same frame wins"
    - "_cellData authoritative matrix synced from this.data in _applyData(), updated in-place by pushData()"
    - "disconnectedCallback() cancels _cellRafId before super.disconnectedCallback() — prevents post-disposal setOption"

key-files:
  created:
    - packages/charts/src/heatmap/heatmap-chart.ts
  modified:
    - packages/charts/src/index.ts

key-decisions:
  - "pushData() overrides base entirely — NEVER calls super.pushData(); base _circularBuffer path bypassed"
  - "disconnectedCallback() cancels _cellRafId BEFORE super.disconnectedCallback() — base disposes chart, component must cancel its own RAF first"
  - "_applyData() uses notMerge:false — notMerge:true would wipe VisualMap component on each data update"
  - "xCategories + yCategories declared attribute:false — JS property only, no HTML serialization"
  - "colorRange declared with attribute:'color-range' as string|null — mirrors LuiPieChart innerRadius pattern"

requirements-completed: [HEAT-01, HEAT-02]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 93 Plan 02: LuiHeatmapChart Component Summary

**LuiHeatmapChart custom element with cell-update streaming semantics using _pendingCells Map + RAF coalescing, Phase 93 public API exports added to index.ts**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T23:33:43Z
- **Completed:** 2026-02-28T23:34:52Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created heatmap-chart.ts implementing LuiHeatmapChart extending BaseChartElement with lui-heatmap-chart custom element registration
- Implemented cell-update semantics: pushData() overrides base, uses _pendingCells Map + _cellRafId RAF coalescing to batch updates within the same animation frame
- _applyData() syncs _cellData from this.data on each property change, uses notMerge:false to preserve VisualMap
- disconnectedCallback() cancels _cellRafId before super.disconnectedCallback() (prevents post-disposal setOption errors)
- Added Phase 93 exports to index.ts: LuiHeatmapChart, HeatmapCell, HeatmapOptionProps
- Full build passes with zero errors, dist/index.d.ts contains all three Phase 93 declarations

## Task Commits

Each task was committed atomically:

1. **Task 1: Create heatmap-chart.ts** - `08d8376` (feat)
2. **Task 2: Add Phase 93 exports to index.ts** - `307e8a6` (feat)

## Files Created/Modified
- `packages/charts/src/heatmap/heatmap-chart.ts` - LuiHeatmapChart with pushData cell-update override, _pendingCells Map, _cellRafId RAF, _flushCellUpdates(), _applyData() with notMerge:false
- `packages/charts/src/index.ts` - Phase 93 exports: LuiHeatmapChart, HeatmapCell, HeatmapOptionProps

## Decisions Made
- pushData() fully overrides base — never calls super.pushData(); avoids base _circularBuffer path that would overwrite _cellData with only streaming points (RESEARCH.md Pitfall 2)
- disconnectedCallback() cancels _cellRafId before super.disconnectedCallback() — base disposes chart, component must cancel its own RAF first to prevent post-disposal setOption errors (Pitfall 3)
- _applyData() uses notMerge:false — notMerge:true would wipe VisualMap component (and its color gradient) on every data update
- xCategories + yCategories declared attribute:false — arrays cannot be safely serialized as HTML attributes per project convention
- colorRange declared with attribute:'color-range' as string|null without type converter — mirrors LuiPieChart.innerRadius pattern (Phase 91 decision)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 93 is complete: heatmap-option-builder.ts, heatmap-registry.ts, heatmap-chart.ts all implemented; LuiHeatmapChart exported from @lit-ui/charts public API
- HEAT-01 and HEAT-02 requirements are fully delivered

## Self-Check: PASSED

- FOUND: packages/charts/src/heatmap/heatmap-chart.ts
- FOUND: packages/charts/src/index.ts (Phase 93 exports added)
- FOUND commit: 08d8376 (Task 1)
- FOUND commit: 307e8a6 (Task 2)
- TypeScript compile: zero errors
- Full build: passed (✓ built in 2.55s)
- dist/index.d.ts: LuiHeatmapChart (line 206), HeatmapCell (line 163), HeatmapOptionProps (line 165) — all confirmed

---
*Phase: 93-heatmap-chart*
*Completed: 2026-02-28*
