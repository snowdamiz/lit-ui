---
phase: 88-package-foundation-basechartelement
plan: 03
subsystem: ui

tags: [echarts, lit, ssr, webgl, streaming, theme, resize, dark-mode, abstract-class]

# Dependency graph
requires:
  - phase: 88-01
    provides: "@lit-ui/charts package scaffold with echarts 5.6.0 and vite build"
  - phase: 88-02
    provides: "ThemeBridge CSS token resolver and registerCanvasCore() ECharts registration utility"
provides:
  - "BaseChartElement abstract Lit class encapsulating all cross-cutting chart concerns"
  - "Complete @lit-ui/charts public API: BaseChartElement, ThemeBridge, registerCanvasCore, EChartsOption"
affects:
  - "All Phase 89-95 concrete chart components (extend BaseChartElement)"
  - "packages/charts/dist/ — production build with full ESM output"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SSR safety pattern: isServer guard in firstUpdated() + dynamic import inside _initChart()"
    - "RAF init pattern: requestAnimationFrame() wrapping echarts.init() to guarantee non-zero container dimensions"
    - "WebGL disposal pattern: loseContext() extension before dispose() before null assignment"
    - "RAF coalescing pattern: pushData() accumulates to _pendingData; single RAF flushes all at once"
    - "Dual streaming pattern: appendData path for time-series, circular-buffer path for all other types"
    - "Incremental dark mode pattern: buildColorUpdate() setOption without touching series data (CRITICAL-03 safe)"
    - "MEDIUM-02 guard: getInstanceByDom check before echarts.init() handles Chrome moveBefore() double-init"

key-files:
  created:
    - packages/charts/src/base/base-chart-element.ts
  modified:
    - packages/charts/src/index.ts

key-decisions:
  - "EChartsOption exported as type alias for EChartsCoreOption (ECBasicOption from echarts/core) — EChartsOption is only in full echarts package, not echarts/core subpath"
  - "index.ts re-exports EChartsOption from base-chart-element.ts (not directly from echarts) for correct tree-shaken type resolution"
  - "_streamingMode defaults to 'buffer' in base class — concrete chart classes override to 'appendData' for time-series"
  - "echarts-gl import uses @ts-ignore per research recommendation — type shims deferred to Phase 92"
  - "lazyUpdate: true in circular-buffer setOption batches render with other pending frame updates"

patterns-established:
  - "Concrete chart pattern: class MyChart extends BaseChartElement { protected async _registerModules() { await registerCanvasCore(); ... } }"
  - "Property pattern: option uses attribute:false to avoid lossy JSON.parse on large datasets"
  - "Streaming pattern: pushData() never calls ECharts directly — always through RAF+_flushPendingData"

requirements-completed: [INFRA-02, INFRA-03, CHART-01, CHART-02, CHART-03, CHART-04, CHART-05, STRM-01, STRM-02, STRM-03, STRM-04]

# Metrics
duration: 4min
completed: 2026-02-28
---

# Phase 88 Plan 03: BaseChartElement Summary

**Abstract Lit base class encapsulating all chart cross-cutting concerns: SSR safety, ECharts lifecycle, ThemeBridge, dark mode, ResizeObserver, WebGL guard, RAF-batched streaming, and full disposal with WebGL context release**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-28T19:48:40Z
- **Completed:** 2026-02-28T19:52:03Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- BaseChartElement implements all 5 critical pitfalls (CRITICAL-01 through CRITICAL-05) and all 11 remaining Phase 88 requirements (INFRA-02, INFRA-03, CHART-01 through CHART-05, STRM-01 through STRM-04)
- SSR-safe: no static echarts value imports; dynamic `await import('echarts/core')` only inside `_initChart()` which is called from `firstUpdated()` (never runs on server)
- CRITICAL-01: `echarts.init()` wrapped in `requestAnimationFrame()` after `await updateComplete` — guarantees non-zero container dimensions
- CRITICAL-02: `loseContext()` on all canvas elements via WEBGL_lose_context extension before `dispose()` before `null` assignment
- CRITICAL-03: `appendData` and `setOption` are strictly separate code paths in `_flushPendingData()`
- CRITICAL-04: `if (isServer) return` guard at top of `firstUpdated()`
- CRITICAL-05: All theme colors resolved via ThemeBridge before reaching ECharts Canvas API
- MEDIUM-02: `getInstanceByDom()` check before `init()` handles Chrome moveBefore() double-init
- RAF coalescing: multiple `pushData()` calls in same frame batch into one ECharts update
- Dark mode: MutationObserver on `document.documentElement` watching `class` attribute
- `pnpm build` in packages/charts produces dist/index.js (11.6 kB) and dist/index.d.ts (8.2 kB) with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement BaseChartElement** - `48c41d5` (feat)
2. **Task 2: Wire index.ts exports and verify build** - `5234f7b` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `packages/charts/src/base/base-chart-element.ts` — 395-line abstract class with all lifecycle methods, properties, streaming, WebGL guard, disposal chain
- `packages/charts/src/index.ts` — package public API: BaseChartElement, ThemeBridge, registerCanvasCore, EChartsOption type

## Decisions Made

- **EChartsOption type resolution:** `EChartsOption` is not exported from `echarts/core` subpath (only `EChartsCoreOption` = `ECBasicOption` is there). Used `EChartsCoreOption` internally and exported it as `EChartsOption` type alias. This is accurate for tree-shaken builds that use `echarts/core` rather than the full `echarts` package.
- **echarts-gl @ts-ignore:** echarts-gl 2.0.9 does not ship subpath type declarations. Single `@ts-ignore` on the dynamic import line as documented in research. Type shims deferred to Phase 92.
- **_streamingMode defaults to 'buffer':** Base class safe default; concrete appendData-mode charts (Line, Area) override to `'appendData'` in their `_registerModules()` or constructor.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] EChartsOption not exported from echarts/core**
- **Found during:** Task 1 (type investigation)
- **Issue:** Plan specified `import type { EChartsType, EChartsOption } from 'echarts/core'` but `EChartsOption` is only exported from the full `echarts` package, not the `echarts/core` tree-shaking subpath.
- **Fix:** Used `EChartsCoreOption` (the `ECBasicOption` alias that IS in `echarts/core`) as the internal option type, then re-exported it under the public name `EChartsOption` via a type alias. The index.ts re-exports this from `base-chart-element.ts` rather than directly from echarts.
- **Files modified:** `packages/charts/src/base/base-chart-element.ts`, `packages/charts/src/index.ts`
- **Impact:** None — consumers get the same `EChartsOption` type alias; the implementation uses the correct subpath export.

## Issues Encountered

None beyond the EChartsOption type deviation above, which was auto-fixed inline.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 89+ concrete chart classes can `extends BaseChartElement` and implement only `_registerModules()`
- All cross-cutting concerns (SSR, WebGL, theming, streaming, disposal) are fully solved in the base class
- Package builds cleanly: `pnpm build` in packages/charts produces correct dist output
- No blockers for Phase 89+

---
*Phase: 88-package-foundation-basechartelement*
*Completed: 2026-02-28*
