---
phase: 88-package-foundation-basechartelement
plan: 02
subsystem: ui
tags: [echarts, css-tokens, theme, canvas, tree-shaking, ssr]

# Dependency graph
requires:
  - phase: 88-01
    provides: "@lit-ui/charts package scaffold with echarts 5.6.0 and vite build"
provides:
  - ThemeBridge class that resolves all 16 --ui-chart-* CSS tokens via getComputedStyle into ECharts-compatible theme objects
  - registerCanvasCore() async function that registers CanvasRenderer and shared ECharts components exactly once
affects:
  - 88-03-PLAN.md (BaseChartElement imports ThemeBridge and calls registerCanvasCore)
  - all concrete chart components (call registerCanvasCore from _registerModules)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS token resolution via getComputedStyle before passing to Canvas API (never var() strings)"
    - "ECharts module registration guard pattern with module-level _registered flag"
    - "Dynamic import pattern for SSR safety — all echarts imports inside async functions"

key-files:
  created:
    - packages/charts/src/base/theme-bridge.ts
    - packages/charts/src/registry/canvas-core.ts
  modified: []

key-decisions:
  - "buildThemeObject() called at init and on .dark toggle — avoids dispose+reinit flicker"
  - "buildColorUpdate() provided as cheaper incremental update path for dark mode"
  - "DataZoomComponent, MarkLineComponent, MarkAreaComponent, ToolboxComponent registered in shared canvas-core (used by multiple chart types)"

patterns-established:
  - "Theme resolution pattern: ThemeBridge.readToken() always returns resolved color string, never a var() reference"
  - "Registration guard pattern: module-level let _registered = false prevents double-registration"
  - "SSR safety pattern: all echarts value imports use await import() inside async functions, never static top-level"

requirements-completed: [INFRA-04, INFRA-05]

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 88 Plan 02: ThemeBridge + canvas-core Summary

**CSS token-to-ECharts theme bridge and one-time CanvasRenderer registration utility, both SSR-safe via dynamic imports**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T19:42:20Z
- **Completed:** 2026-02-28T19:43:50Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- ThemeBridge class reads all 16 --ui-chart-* CSS tokens via getComputedStyle, resolving values before Canvas 2D API ever sees them (fixes CRITICAL-05)
- registerCanvasCore() registers CanvasRenderer, TitleComponent, TooltipComponent, GridComponent, LegendComponent, DataZoomComponent, MarkLineComponent, MarkAreaComponent, ToolboxComponent, LabelLayout, and UniversalTransition exactly once
- Both files TypeScript-compile cleanly with no errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ThemeBridge** - `10ee3bc` (feat)
2. **Task 2: Create canvas-core registry** - `7737316` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `packages/charts/src/base/theme-bridge.ts` - CSS token resolver: readToken(), buildThemeObject(), buildColorUpdate() with all 16 --ui-chart-* token defaults
- `packages/charts/src/registry/canvas-core.ts` - ECharts module registration with _registered guard and all dynamic imports

## Decisions Made
- `buildColorUpdate()` included alongside `buildThemeObject()` as a cheaper incremental update path for dark mode color-only changes
- DataZoomComponent, MarkLineComponent, MarkAreaComponent, and ToolboxComponent included in shared canvas-core because they are needed by multiple chart types (Line, Bar, Candlestick) — avoids re-registration per chart type
- buildThemeObject() is called at init and passed to echarts.init() as the theme argument; called again on .dark class toggle — avoids dispose+reinit flicker (research recommendation)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ThemeBridge is ready to be imported by BaseChartElement in Plan 03
- registerCanvasCore() is ready to be called from concrete chart component _registerModules() overrides
- Both files TypeScript-compile cleanly as part of the package build
- No blockers for Plan 03

---
*Phase: 88-package-foundation-basechartelement*
*Completed: 2026-02-28*
