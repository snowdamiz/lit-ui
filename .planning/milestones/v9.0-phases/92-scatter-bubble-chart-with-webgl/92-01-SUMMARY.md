---
phase: 92-scatter-bubble-chart-with-webgl
plan: 01
subsystem: ui
tags: [echarts, echarts-gl, webgl, scatter, bubble, typescript, type-shim]

# Dependency graph
requires:
  - phase: 91-pie-donut-chart
    provides: pie-option-builder pattern and pie-registry guard pattern mirrored for scatter
  - phase: 88-base-chart-element
    provides: BaseChartElement with _webglUnavailable field and _maybeLoadGl() infrastructure

provides:
  - packages/charts/src/echarts-gl.d.ts — TypeScript module declarations for echarts-gl and echarts-gl/charts subpaths
  - packages/charts/src/base/base-chart-element.ts — protected _webglUnavailable accessible to subclasses
  - packages/charts/src/shared/scatter-option-builder.ts — ScatterPoint, ScatterOptionProps, buildScatterOption()
  - packages/charts/src/scatter/scatter-registry.ts — registerScatterModules() with _scatterRegistered guard

affects: [92-02-scatter-component, future-gl-charts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TypeScript module declaration shim pattern for untyped npm packages (echarts-gl)"
    - "Conditional series type switching via useGl flag (scatter vs scatterGL)"
    - "Bubble symbolSize: callback for Canvas, fixed number for GL (GPU limitation)"
    - "scatter-registry.ts mirrors pie-registry.ts guard pattern exactly"

key-files:
  created:
    - packages/charts/src/echarts-gl.d.ts
    - packages/charts/src/shared/scatter-option-builder.ts
    - packages/charts/src/scatter/scatter-registry.ts
  modified:
    - packages/charts/src/base/base-chart-element.ts

key-decisions:
  - "echarts-gl.d.ts is a separate file (not added to vite-env.d.ts) — per plan interface spec"
  - "scatterGL bubble mode uses fixed symbolSize with console.warn — GPU-side rendering cannot support per-point callbacks"
  - "ScatterGLChart always registered in registerScatterModules() (not conditionally) — unconditional use() ensures tree-shaken build includes the module"
  - "GL series options: progressive=1e5, progressiveThreshold=1e5, blendMode='source-over' — standard echarts-gl high-perf pattern"

patterns-established:
  - "Option builder: bubble && !useGl => symbolSize callback; bubble && useGl => fixed size + warn"
  - "Registry pattern: _guard flag, registerCanvasCore() first, chart modules parallel, GL module last"

requirements-completed: [SCAT-01, SCAT-02, SCAT-03]

# Metrics
duration: 4min
completed: 2026-02-28
---

# Phase 92 Plan 01: Scatter/Bubble Chart Foundations Summary

**TypeScript type shim for echarts-gl subpaths + scatter-option-builder with Canvas/GL switching + scatter-registry with dual ScatterChart/ScatterGLChart registration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-28T22:46:24Z
- **Completed:** 2026-02-28T22:50:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created echarts-gl.d.ts resolving the Phase 88 @ts-ignore workaround with full TypeScript type declarations for echarts-gl and echarts-gl/charts subpath imports
- Promoted _webglUnavailable from private to protected in BaseChartElement enabling LuiScatterChart to read it for runtime series type selection
- Implemented scatter-option-builder.ts with ScatterPoint/ScatterOptionProps types and buildScatterOption() handling four cases: plain scatter, bubble Canvas, plain GL, bubble GL
- Implemented scatter-registry.ts with _scatterRegistered guard registering both ScatterChart (Canvas) and ScatterGLChart (GL) via ECharts use()
- TypeScript compiles packages/charts with zero errors after all changes

## Task Commits

Each task was committed atomically:

1. **Task 1: echarts-gl type shim + BaseChartElement _webglUnavailable visibility** - `91b6910` (feat)
2. **Task 2: scatter-option-builder.ts + scatter-registry.ts** - `786d474` (feat)

## Files Created/Modified

- `packages/charts/src/echarts-gl.d.ts` — Module declarations for 'echarts-gl' (side-effect) and 'echarts-gl/charts' (7 named exports including ScatterGLChart)
- `packages/charts/src/base/base-chart-element.ts` — _webglUnavailable changed from private to protected with updated JSDoc
- `packages/charts/src/shared/scatter-option-builder.ts` — ScatterPoint type, ScatterOptionProps type, buildScatterOption() with Canvas/GL/bubble logic
- `packages/charts/src/scatter/scatter-registry.ts` — registerScatterModules() with _scatterRegistered guard, registers ScatterChart + ScatterGLChart

## Decisions Made

- echarts-gl.d.ts is created as a separate file, not appended to vite-env.d.ts, per plan interface spec
- scatterGL bubble mode emits console.warn and uses fixed symbolSize — GPU-side rendering cannot support per-point size callbacks; this is a real GL limitation, not an oversight
- ScatterGLChart is always registered unconditionally (not gated on enableGl) — _maybeLoadGl() handles the side-effect import; use() must be called for the tree-shaken build to include the module
- GL series adds progressive=1e5, progressiveThreshold=1e5, blendMode='source-over' — standard echarts-gl pattern for high-density datasets

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All foundational contracts for Plan 02 (LuiScatterChart component) are in place
- echarts-gl.d.ts eliminates @ts-ignore requirement for echarts-gl/charts imports in scatter-registry.ts
- protected _webglUnavailable allows LuiScatterChart to select series type at runtime
- buildScatterOption() tested by TypeScript compile; behavior logic is pure and directly verifiable
- scatter-registry.ts registers both chart modules; LuiScatterChart only needs to call registerScatterModules()

## Self-Check: PASSED

All files verified present, all task commits verified in git log.

---
*Phase: 92-scatter-bubble-chart-with-webgl*
*Completed: 2026-02-28*
