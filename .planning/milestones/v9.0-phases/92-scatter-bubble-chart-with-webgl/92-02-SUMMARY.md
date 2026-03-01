---
phase: 92-scatter-bubble-chart-with-webgl
plan: 02
subsystem: ui
tags: [echarts, echarts-gl, webgl, scatter, bubble, lit, typescript, custom-element]

# Dependency graph
requires:
  - phase: 92-01-scatter-foundations
    provides: scatter-option-builder.ts, scatter-registry.ts, echarts-gl.d.ts, protected _webglUnavailable
  - phase: 91-pie-donut-chart
    provides: LuiPieChart pattern mirrored exactly for LuiScatterChart

provides:
  - packages/charts/src/scatter/scatter-chart.ts — LuiScatterChart Lit custom element (lui-scatter-chart)
  - packages/charts/src/index.ts — Phase 92 public API: LuiScatterChart, ScatterPoint, ScatterOptionProps

affects: [future-gl-charts, downstream-consumers-of-lit-ui-charts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "LuiScatterChart mirrors LuiPieChart structure exactly — updated() + _applyData() + _registerModules()"
    - "enableGl && !_webglUnavailable useGl guard — runtime series type selection in _applyData()"
    - "No _streamingMode override — base 'buffer' inherited (STRM-04 pattern applied to all chart types)"

key-files:
  created:
    - packages/charts/src/scatter/scatter-chart.ts
  modified:
    - packages/charts/src/index.ts

key-decisions:
  - "No _streamingMode override in LuiScatterChart — base 'buffer' is correct; scatterGL does not support appendData (STRM-04)"
  - "enableGl is a reactive property inherited from BaseChartElement — changed.has('enableGl') in updated() correctly tracks runtime toggles"
  - "bubble @property declared with type: Boolean — consistent with other boolean chart props (showLabels, colorByData)"

patterns-established:
  - "Chart component: no constructor, updated() watches data+chart-specific+enableGl props, _applyData() calls buildOption()"
  - "useGl guard: this.enableGl && !this._webglUnavailable — both flags required for GL path"

requirements-completed: [SCAT-01, SCAT-02, SCAT-03]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 92 Plan 02: Scatter/Bubble Chart Component Summary

**LuiScatterChart Lit custom element wiring together scatter-registry, scatter-option-builder, and BaseChartElement with bubble mode and WebGL path switching via enableGl && !_webglUnavailable guard**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T22:50:08Z
- **Completed:** 2026-02-28T22:51:33Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created LuiScatterChart (scatter-chart.ts) extending BaseChartElement — registers as lui-scatter-chart custom element
- bubble @property (Boolean, SCAT-01) controls Canvas per-point symbolSize callback vs GL fixed size
- enableGl && !_webglUnavailable guard in _applyData() selects scatterGL vs scatter series type at runtime (SCAT-02)
- updated() watches data, bubble, enableGl props — runtime toggle of enable-gl correctly switches series type
- No _streamingMode override — inherits base 'buffer' for STRM-04 compliance (SCAT-03)
- Added Phase 92 export section to index.ts; dist/index.d.ts confirms all three declarations present

## Task Commits

Each task was committed atomically:

1. **Task 1: Create LuiScatterChart component (scatter-chart.ts)** - `0871a4c` (feat)
2. **Task 2: Update index.ts with Phase 92 exports and verify full build** - `664fa66` (feat)

## Files Created/Modified

- `packages/charts/src/scatter/scatter-chart.ts` — LuiScatterChart class with bubble prop, _registerModules(), updated(), _applyData(); customElements.define guard + HTMLElementTagNameMap
- `packages/charts/src/index.ts` — Phase 92 section: export { LuiScatterChart } and export type { ScatterPoint, ScatterOptionProps }

## Decisions Made

- No _streamingMode override: base 'buffer' default is correct for scatter charts — scatterGL does not support appendData (STRM-04 pattern)
- enableGl reactive property inherited from BaseChartElement; changed.has('enableGl') in updated() tracks runtime attribute toggles correctly using camelCase key (not 'enable-gl')
- bubble declared with { type: Boolean } — consistent with showLabels and colorByData patterns from Phase 90

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Build command discovery: root package uses pnpm not npm, so `npm run build --workspace=packages/charts` failed. Used `pnpm --filter @lit-ui/charts run build` instead. This is a deviation in the build invocation only, not in the code; build itself passed with zero errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 92 fully complete: all SCAT-01, SCAT-02, SCAT-03 requirements delivered across plans 01 and 02
- LuiScatterChart, ScatterPoint, ScatterOptionProps exported from @lit-ui/charts public API
- dist/index.d.ts declarations verified: LuiScatterChart (line 215), ScatterOptionProps (line 250), ScatterPoint (line 256)
- Phase 93 can extend the same BaseChartElement pattern without re-solving any chart infrastructure concerns

## Self-Check: PASSED

Files verified:
- packages/charts/src/scatter/scatter-chart.ts — FOUND
- packages/charts/src/index.ts (Phase 92 section) — FOUND
- dist/index.d.ts contains LuiScatterChart, ScatterPoint, ScatterOptionProps — FOUND (lines 215, 256, 250)

Commits verified:
- 0871a4c (Task 1: LuiScatterChart component) — FOUND
- 664fa66 (Task 2: index.ts Phase 92 exports) — FOUND

---
*Phase: 92-scatter-bubble-chart-with-webgl*
*Completed: 2026-02-28*
