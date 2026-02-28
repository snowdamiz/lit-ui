---
phase: 91-pie-donut-chart
plan: 01
subsystem: ui
tags: [echarts, pie, donut, charts, typescript]

# Dependency graph
requires:
  - phase: 90-bar-chart
    provides: bar-option-builder.ts and bar-registry.ts patterns that pie mirrors exactly
  - phase: 88-charts-base
    provides: canvas-core.ts registry with TitleComponent, TooltipComponent, LegendComponent
provides:
  - PieSlice and PieOptionProps types (foundational contracts for LuiPieChart)
  - buildPieOption() — pure TS option builder with small-slice merging and donut mode
  - _mergeSmallSlices() — internal pre-processing that merges below-threshold slices into 'Other'
  - registerPieModules() — ECharts module registry with PieChart tree-shaken import
affects: [91-02-pie-chart-component, future-chart-phases]

# Tech tracking
tech-stack:
  added: []
  patterns: [pie-option-builder mirrors bar-option-builder pure-TS pattern, pie-registry mirrors bar-registry guard pattern]

key-files:
  created:
    - packages/charts/src/shared/pie-option-builder.ts
    - packages/charts/src/pie/pie-registry.ts
  modified: []

key-decisions:
  - "pie-option-builder: _mergeSmallSlices pre-processes data before ECharts — ECharts minAngle only affects rendering, not legend/tooltip"
  - "isDonut guard handles four falsy cases: 0, '0', '0%', '' — '0' is truthy in JS but semantically means no inner radius"
  - "centerLabel title injected only when isDonut && centerLabel — empty title key causes ECharts layout interference"
  - "PieChart is the only pie-specific module; donut mode is a pie series with innerRadius, no separate DonutChart in ECharts"
  - "legend: { type: 'scroll' } chosen over plain show:true — handles crowded legend with many slices"

patterns-established:
  - "pie-registry.ts: same _pieRegistered guard pattern as bar-registry.ts — consistent across all chart types"
  - "Option builder: pure TypeScript, no ECharts imports — data processing layer only"

requirements-completed: [PIE-01, PIE-02]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 91 Plan 01: Pie/Donut Option Builder and Registry Summary

**Pure-TypeScript buildPieOption() with small-slice merging (PIE-01), donut mode via innerRadius array radius (PIE-02), and tree-shaken PieChart ECharts module registry**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T21:44:33Z
- **Completed:** 2026-02-28T21:46:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `pie-option-builder.ts` with PieSlice/PieOptionProps types and buildPieOption() function
- Internal `_mergeSmallSlices()` pre-processes data to merge tiny slices into 'Other' before ECharts sees them
- isDonut logic correctly handles all four falsy cases (0, '0', '0%', '') for innerRadius
- Created `pie-registry.ts` following exact bar-registry.ts guard pattern with tree-shaken PieChart import

## Task Commits

Each task was committed atomically:

1. **Task 1: Create pie-option-builder.ts with buildPieOption and types** - `08fa6c3` (feat)
2. **Task 2: Create pie-registry.ts with registerPieModules** - `de5e7ff` (feat)

**Plan metadata:** *(docs commit to follow)*

## Files Created/Modified
- `packages/charts/src/shared/pie-option-builder.ts` - PieSlice, PieOptionProps types + buildPieOption() + internal _mergeSmallSlices()
- `packages/charts/src/pie/pie-registry.ts` - registerPieModules() with _pieRegistered guard and PieChart tree-shaken import

## Decisions Made
- `_mergeSmallSlices` uses pre-processing approach (not ECharts minAngle) because minAngle only changes rendering — merged slices still appear in legend and tooltip if not pre-processed
- isDonut evaluates `ir !== 0 && ir !== '0%' && ir !== '0' && ir !== ''` — covers all four falsy-semantic values since '0' is truthy in JS but means "no inner radius"
- `legend: { type: 'scroll' }` chosen — handles arbitrarily many slices without wrapping issues
- centerLabel title only injected when both isDonut and centerLabel are truthy — empty title key causes ECharts to reserve space and shift layout
- PieChart module is sufficient for both pie and donut — donut is pie with innerRadius set, no separate ECharts module

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- pie-option-builder.ts and pie-registry.ts are the foundational contracts for Plan 02
- Plan 02 (LuiPieChart component) can import PieSlice, PieOptionProps, buildPieOption from pie-option-builder.ts and registerPieModules from pie-registry.ts
- TypeScript compile clean: zero errors across all packages/charts source files

---
*Phase: 91-pie-donut-chart*
*Completed: 2026-02-28*

## Self-Check: PASSED

- FOUND: packages/charts/src/shared/pie-option-builder.ts
- FOUND: packages/charts/src/pie/pie-registry.ts
- FOUND: .planning/phases/91-pie-donut-chart/91-01-SUMMARY.md
- FOUND commit: 08fa6c3 (feat(91-01): pie-option-builder.ts)
- FOUND commit: de5e7ff (feat(91-01): pie-registry.ts)
- TypeScript compile: zero errors
