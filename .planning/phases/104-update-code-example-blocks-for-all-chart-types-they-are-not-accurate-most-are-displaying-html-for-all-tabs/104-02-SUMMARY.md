---
phase: 104-update-code-example-blocks-for-all-chart-types-they-are-not-accurate-most-are-displaying-html-for-all-tabs
plan: "02"
subsystem: ui
tags: [docs, react, vue, svelte, lit, web-components, charts, examples]

# Dependency graph
requires:
  - phase: 104-update-code-example-blocks-for-all-chart-types-they-are-not-accurate-most-are-displaying-html-for-all-tabs
    provides: Research phase identifying which chart pages have broken per-framework ExampleBlock code strings

provides:
  - ScatterChartPage with 4 per-framework ExampleBlock strings (HTML/React/Vue/Svelte) showing [x,y] tuple data
  - HeatmapChartPage with 4 per-framework ExampleBlock strings all assigning xCategories, yCategories, and data
  - CandlestickChartPage with 4 per-framework ExampleBlock strings including OHLC order warning comment, no enable-webgpu
  - TreemapChartPage with 4 per-framework ExampleBlock strings showing hierarchical children data with breadcrumb

affects: [104-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-framework ExampleBlock pattern: 4 separate const variables (html/react/vue/svelte) each idiomatic for that framework"
    - "React pattern: useRef+useEffect for DOM property assignment on web components"
    - "Vue pattern: ref(null)+onMounted with chart.value.* for property assignment"
    - "Svelte pattern: let chart + onMount + bind:this={chart} for property assignment"

key-files:
  created: []
  modified:
    - apps/docs/src/pages/charts/ScatterChartPage.tsx
    - apps/docs/src/pages/charts/HeatmapChartPage.tsx
    - apps/docs/src/pages/charts/CandlestickChartPage.tsx
    - apps/docs/src/pages/charts/TreemapChartPage.tsx

key-decisions:
  - "Candlestick code examples omit enable-webgpu — kept clean for basic usage; WebGPU feature documented separately in props table and callout box"
  - "All 4 candlestick framework variants include the OHLC order warning comment inline"
  - "Heatmap: all 4 framework variants assign all 3 properties (xCategories, yCategories, data) — critical for chart to render"

patterns-established:
  - "ExampleBlock per-framework pattern: distinct const per framework, not shared HTML string; each shows idiomatic lifecycle and import"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-03-01
---

# Phase 104 Plan 02: Scatter, Heatmap, Candlestick, Treemap ExampleBlock Fix Summary

**Per-framework code strings added to 4 chart pages: React uses useRef+useEffect, Vue uses ref+onMounted, Svelte uses bind:this+onMount — replacing the HTML-repeated-to-all-tabs pattern**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T21:17:01Z
- **Completed:** 2026-03-01T21:19:51Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- ScatterChartPage: replaced single `scatterChartHtmlCode` with 4 per-framework variables showing `[x,y]` tuple data; ExampleBlock passes distinct var to each tab
- HeatmapChartPage: replaced single `heatmapChartHtmlCode` with 4 per-framework variables all assigning `xCategories`, `yCategories`, and `data`
- CandlestickChartPage: replaced single `candlestickChartHtmlCode` with 4 per-framework variables each including the OHLC order warning comment; no `enable-webgpu` in examples
- TreemapChartPage: replaced single `treemapChartHtmlCode` with 4 per-framework variables showing hierarchical `children` data shape with `breadcrumb` attribute

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Scatter and Heatmap chart page code examples** - `fb91098` (feat)
2. **Task 2: Fix Candlestick and Treemap chart page code examples** - `cd46d9c` (feat)

## Files Created/Modified
- `apps/docs/src/pages/charts/ScatterChartPage.tsx` - Added `scatterChartHtml`, `scatterChartReact`, `scatterChartVue`, `scatterChartSvelte`; updated ExampleBlock
- `apps/docs/src/pages/charts/HeatmapChartPage.tsx` - Added `heatmapChartHtml`, `heatmapChartReact`, `heatmapChartVue`, `heatmapChartSvelte`; updated ExampleBlock
- `apps/docs/src/pages/charts/CandlestickChartPage.tsx` - Added `candlestickChartHtml`, `candlestickChartReact`, `candlestickChartVue`, `candlestickChartSvelte`; updated ExampleBlock
- `apps/docs/src/pages/charts/TreemapChartPage.tsx` - Added `treemapChartHtml`, `treemapChartReact`, `treemapChartVue`, `treemapChartSvelte`; updated ExampleBlock

## Decisions Made
- Candlestick code examples omit `enable-webgpu` — the basic example should stay clean; WebGPU is documented in the props table and the purple callout box above the example
- All 4 candlestick framework variants carry the OHLC order warning comment inline because the data shape is the primary gotcha
- Heatmap requires all 3 property assignments in every framework variant — the chart will not render without all three

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- 4 of the 8 chart pages now have correct per-framework ExampleBlock code strings
- Plan 03 (if exists) should cover the remaining chart pages: BarChartPage, LineChartPage, AreaChartPage, PieChartPage

---
*Phase: 104-update-code-example-blocks-for-all-chart-types-they-are-not-accurate-most-are-displaying-html-for-all-tabs*
*Completed: 2026-03-01*

## Self-Check: PASSED

- FOUND: apps/docs/src/pages/charts/ScatterChartPage.tsx
- FOUND: apps/docs/src/pages/charts/HeatmapChartPage.tsx
- FOUND: apps/docs/src/pages/charts/CandlestickChartPage.tsx
- FOUND: apps/docs/src/pages/charts/TreemapChartPage.tsx
- FOUND: .planning/phases/104-.../104-02-SUMMARY.md
- FOUND: commit fb91098 (Task 1)
- FOUND: commit cd46d9c (Task 2)
