---
phase: 096-cli-integration-documentation
plan: 02
subsystem: cli
tags: [lit, echarts, cli, charts, templates, registry]

# Dependency graph
requires:
  - phase: 095-treemap-chart
    provides: LuiTreemapChart and all 8 chart components exported from @lit-ui/charts

provides:
  - 8 chart entries in CLI registry.json (line-chart, area-chart, bar-chart, pie-chart, scatter-chart, heatmap-chart, candlestick-chart, treemap-chart)
  - 8 chart name -> '@lit-ui/charts' mappings in install-component.ts componentToPackage
  - 8 chart template files with subpath imports and firstUpdated() .data assignment pattern
  - Updated templates/index.ts with 8 chart exports and COMPONENT_TEMPLATES entries

affects:
  - 096-03 (docs pages reference these templates and registry entries)
  - 096-04 (final docs pages for remaining 4 charts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Chart templates import from '@lit-ui/charts/[name]' subpath (not root) for tree-shaking"
    - "Chart templates use 'void (null as unknown as typeof LuiXxx)' pattern to preserve side effects"
    - "Chart templates set data in firstUpdated() via JS property (not HTML attribute)"
    - "All 8 chart names map to single '@lit-ui/charts' package in componentToPackage"
    - "Chart registry entries use 'components/charts/[name].ts' file path convention"

key-files:
  created:
    - packages/cli/src/templates/line-chart.ts
    - packages/cli/src/templates/area-chart.ts
    - packages/cli/src/templates/bar-chart.ts
    - packages/cli/src/templates/pie-chart.ts
    - packages/cli/src/templates/scatter-chart.ts
    - packages/cli/src/templates/heatmap-chart.ts
    - packages/cli/src/templates/candlestick-chart.ts
    - packages/cli/src/templates/treemap-chart.ts
  modified:
    - packages/cli/src/registry/registry.json
    - packages/cli/src/utils/install-component.ts
    - packages/cli/src/templates/index.ts

key-decisions:
  - "All 8 chart names map to single '@lit-ui/charts' package in componentToPackage (not separate packages like '@lit-ui/line-chart')"
  - "Chart registry files use 'components/charts/[name].ts' path — getTargetPath() maps this to {cwd}/{componentsPath}/[name].ts"
  - "Templates use subpath '@lit-ui/charts/[name]' imports to demonstrate tree-shaking benefit to developers"
  - "void trick pattern used: 'void (null as unknown as typeof LuiXxx)' ensures bundler keeps side effect import"

patterns-established:
  - "Chart template pattern: subpath import + void trick + firstUpdated() data assignment + sui wrapper LitElement"
  - "Heatmap template sets xCategories/yCategories as reactive properties before data (order matters)"
  - "Candlestick template warns [open, close, low, high] is NOT OHLC acronym order (ECharts internal order)"

requirements-completed: [CLI-01, CLI-03]

# Metrics
duration: 8min
completed: 2026-03-01
---

# Phase 96 Plan 02: CLI Chart Integration Summary

**8 chart templates + registry entries added to CLI enabling 'npx lit-ui add [chart-name]' for all chart types, with subpath imports and JS property data-assignment patterns**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-01T04:39:37Z
- **Completed:** 2026-03-01T04:47:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Added 8 chart entries to registry.json with `"dependencies": ["@lit-ui/charts"]` and `components/charts/[name].ts` file paths
- Added 8 chart name -> `@lit-ui/charts` mappings to `componentToPackage` in install-component.ts (all 8 charts install the single shared package)
- Created 8 chart template files, each demonstrating subpath imports, the void trick for side-effect preservation, and `firstUpdated()` `.data` property assignment
- Updated `templates/index.ts` with 8 new exports, imports, and `COMPONENT_TEMPLATES` entries; CLI builds cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Add 8 chart entries to registry.json and update install-component.ts** - `705b7c3` (feat)
2. **Task 2: Create 8 chart template files and update templates/index.ts** - `7784440` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `packages/cli/src/registry/registry.json` - Added 8 chart entries with @lit-ui/charts dependency
- `packages/cli/src/utils/install-component.ts` - Added 8 chart name -> '@lit-ui/charts' mappings to componentToPackage
- `packages/cli/src/templates/line-chart.ts` - LINE_CHART_TEMPLATE: smooth/zoom, two series, firstUpdated() pattern
- `packages/cli/src/templates/area-chart.ts` - AREA_CHART_TEMPLATE: smooth/stacked, two series
- `packages/cli/src/templates/bar-chart.ts` - BAR_CHART_TEMPLATE: BarChartSeries with categories and show-labels
- `packages/cli/src/templates/pie-chart.ts` - PIE_CHART_TEMPLATE: 5 PieSlice entries, min-percent/inner-radius/center-label
- `packages/cli/src/templates/scatter-chart.ts` - SCATTER_CHART_TEMPLATE: 10 ScatterPoint entries, bubble/enable-gl notes
- `packages/cli/src/templates/heatmap-chart.ts` - HEATMAP_CHART_TEMPLATE: 3x3 grid, sets xCategories/yCategories before data
- `packages/cli/src/templates/candlestick-chart.ts` - CANDLESTICK_CHART_TEMPLATE: 5 OhlcBar entries, warns about [open,close,low,high] order
- `packages/cli/src/templates/treemap-chart.ts` - TREEMAP_CHART_TEMPLATE: 2 top-level nodes each with 2 children, breadcrumb/rounded
- `packages/cli/src/templates/index.ts` - Added 8 chart exports, imports, and COMPONENT_TEMPLATES entries

## Decisions Made

- All 8 chart names map to single `@lit-ui/charts` package in `componentToPackage` (not separate packages) — matches the npm mode design where all charts are bundled in one package
- Chart registry entries use `components/charts/[name].ts` path convention — `getTargetPath()` maps this correctly
- Templates import from `@lit-ui/charts/[name]` subpaths to show tree-shaking benefit (these subpaths are created by Plan 01)
- Used `void (null as unknown as typeof LuiXxx)` pattern to preserve custom element registration side effects from bundler dead-code elimination

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 complete: All 8 charts are first-class CLI citizens
- Plan 03 (depends on Plan 01) will add docs pages for line-chart, area-chart, bar-chart, pie-chart
- Plan 04 will add docs pages for scatter-chart, heatmap-chart, candlestick-chart, treemap-chart
- CLI builds successfully with all 8 new templates

## Self-Check: PASSED

All files verified present and both task commits (705b7c3, 7784440) confirmed in git log.

---
*Phase: 096-cli-integration-documentation*
*Completed: 2026-03-01*
