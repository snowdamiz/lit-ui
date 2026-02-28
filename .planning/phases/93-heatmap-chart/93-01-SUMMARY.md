---
phase: 93-heatmap-chart
plan: 01
subsystem: ui
tags: [echarts, heatmap, visualmap, charts, typescript]

# Dependency graph
requires:
  - phase: 88-charts-base
    provides: BaseChartElement, canvas-core registry pattern, registerCanvasCore()
  - phase: 91-pie-chart
    provides: pie-option-builder pattern and pie-registry pattern (mirrored exactly)

provides:
  - HeatmapCell type ([xIdx, yIdx, value] tuple) in heatmap-option-builder.ts
  - HeatmapOptionProps type (xCategories, yCategories, colorRange, min, max) in heatmap-option-builder.ts
  - buildHeatmapOption() function returning valid ECharts option with category axes, visualMap, heatmap series
  - registerHeatmapModules() in heatmap-registry.ts with HeatmapChart + VisualMapContinuousComponent registration

affects: [93-heatmap-chart-plan-02, LuiHeatmapChart component]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "heatmap-option-builder.ts mirrors pie-option-builder.ts pattern exactly"
    - "heatmap-registry.ts mirrors pie-registry.ts pattern with additional VisualMapContinuousComponent"
    - "_heatmapRegistered guard prevents double-registration across multiple chart instances"

key-files:
  created:
    - packages/charts/src/shared/heatmap-option-builder.ts
    - packages/charts/src/heatmap/heatmap-registry.ts
  modified: []

key-decisions:
  - "VisualMapContinuousComponent (NOT VisualMapComponent) registered — specific continuous variant for smaller bundle, no piecewise bloat"
  - "visualMap min/max default to [0, 100] to prevent color drift during pushData() streaming (Pitfall 6)"
  - "splitArea: { show: true } on BOTH axes — creates visible cell border grid, cells blend without it"
  - "coordinateSystem: 'cartesian2d' explicitly set on series — heatmap supports geo/calendar/cartesian2d modes"
  - "type: 'category' on BOTH axes — heatmap indices are integer positions into category arrays, not raw values"

patterns-established:
  - "Heatmap registry pattern: registerCanvasCore() first, then Promise.all for HeatmapChart + VisualMapContinuousComponent + use"
  - "colorRange tuple [minColor, maxColor] defaults to blue-to-red ['#313695', '#d73027']"

requirements-completed: [HEAT-01, HEAT-02]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 93 Plan 01: Heatmap Foundations Summary

**ECharts heatmap option builder with category axes and visualMap, plus registry registering HeatmapChart and VisualMapContinuousComponent**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T23:29:47Z
- **Completed:** 2026-02-28T23:30:52Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created heatmap-option-builder.ts exporting HeatmapCell, HeatmapOptionProps, and buildHeatmapOption with correct category axes, explicit visualMap min/max, and cartesian2d series
- Created packages/charts/src/heatmap/ directory and heatmap-registry.ts registering HeatmapChart + VisualMapContinuousComponent via use()
- TypeScript compile passes with zero errors across both files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create heatmap-option-builder.ts** - `da66458` (feat)
2. **Task 2: Create heatmap-registry.ts** - `5ef6723` (feat)

## Files Created/Modified
- `packages/charts/src/shared/heatmap-option-builder.ts` - HeatmapCell tuple type, HeatmapOptionProps, buildHeatmapOption returning full ECharts option
- `packages/charts/src/heatmap/heatmap-registry.ts` - registerHeatmapModules() with _heatmapRegistered guard, HeatmapChart + VisualMapContinuousComponent registration

## Decisions Made
- Used VisualMapContinuousComponent (not VisualMapComponent) — specific continuous variant keeps bundle smaller; heatmap always uses continuous visualMap
- Set visualMap min/max default [0, 100] — prevents color scale drift during pushData() streaming (RESEARCH.md Pitfall 6)
- splitArea: { show: true } on both axes — required for visible cell borders; omitting causes cells to blend together
- coordinateSystem: 'cartesian2d' explicit on series — heatmap supports multiple coordinate systems, must specify Cartesian

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- heatmap-option-builder.ts and heatmap-registry.ts are complete contracts for Plan 02 (LuiHeatmapChart component)
- Plan 02 can proceed immediately — _registerModules() calls registerHeatmapModules(), option builder provides correct ECharts option structure

---
*Phase: 93-heatmap-chart*
*Completed: 2026-02-28*
