---
phase: 97-update-skills-to-include-recent-addition-of-chart-system-there-should-be-a-detailed-sub-skill-for-each-chart-type-and-main-router-skill-needs-to-be-updated-too
plan: 04
subsystem: ui
tags: [skills, charts, candlestick, treemap, echarts, documentation]

# Dependency graph
requires:
  - phase: 97-03
    provides: pie-chart, scatter-chart, heatmap-chart sub-skills (established chart sub-skill pattern)
  - phase: 94
    provides: LuiCandlestickChart implementation (OhlcBar order, pushData with lazyUpdate)
  - phase: 95
    provides: LuiTreemapChart implementation (pushData no-op, notMerge:false, levelColors string[][])
provides:
  - skill/skills/candlestick-chart/SKILL.md — OHLC order pitfall, bull/bear colors, volume panel, moving averages
  - skill/skills/treemap-chart/SKILL.md — pushData() NOT SUPPORTED, TreemapNode type, breadcrumb/rounded/levelColors props
affects: [future chart usage, AI code generation for candlestick/treemap, skills/charts router]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Chart sub-skill pattern: CRITICAL/IMPORTANT warning at top of file for silent failure pitfalls"
    - "Chart sub-skill pattern: defer shared props/methods/CSS to skills/charts cross-reference"
    - "Chart sub-skill pattern: show WRONG/CORRECT code side-by-side for non-obvious traps"

key-files:
  created:
    - skill/skills/candlestick-chart/SKILL.md
    - skill/skills/treemap-chart/SKILL.md
  modified: []

key-decisions:
  - "candlestick OHLC order [open,close,low,high] warning placed as top-of-file CRITICAL notice — ECharts order diverges from OHLC acronym and produces silent visual failures"
  - "treemap pushData() NOT SUPPORTED placed as top-of-file IMPORTANT notice — overridden with console.warn no-op to protect hierarchical data from circular buffer"
  - "levelColors array-of-arrays (string[][]) requirement documented with silent rejection warning — flat string[] silently applies no colors"
  - "movingAverages documented as JSON string attribute (not JS object) with JSON.stringify guidance"

patterns-established:
  - "Silent failure pitfall pattern: place CRITICAL/IMPORTANT block immediately after component description, before Usage section"
  - "Wrong/correct code pattern: show commented-out wrong approach with explanation before showing correct approach"

requirements-completed: [SKILL-CANDLESTICK-CHART, SKILL-TREEMAP-CHART]

# Metrics
duration: 3min
completed: 2026-03-01
---

# Phase 97 Plan 04: Candlestick and Treemap Chart Skills Summary

**candlestick-chart skill (OHLC order trap: [open,close,low,high] NOT OHLC acronym) + treemap-chart skill (pushData() NOT SUPPORTED — console.warn no-op, reassign .data instead)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T07:01:54Z
- **Completed:** 2026-03-01T07:05:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created candlestick-chart/SKILL.md with top-of-file CRITICAL OHLC order warning, OhlcBar/CandlestickBarPoint/MAConfig types, all 4 chart-specific props (bullColor, bearColor, showVolume, movingAverages), React useRef+useEffect pattern, and pushData streaming behavior
- Created treemap-chart/SKILL.md with top-of-file IMPORTANT pushData() NOT SUPPORTED warning, TreemapNode type, all 3 chart-specific props (breadcrumb, rounded, levelColors), levelColors array-of-arrays requirement, and drill-down state preservation via notMerge:false

## Task Commits

Each task was committed atomically:

1. **Task 1: Create skill/skills/candlestick-chart/SKILL.md** - `1c11d51` (feat)
2. **Task 2: Create skill/skills/treemap-chart/SKILL.md** - `74b8c50` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `skill/skills/candlestick-chart/SKILL.md` — Candlestick chart skill: OHLC order pitfall, OhlcBar/MAConfig types, showVolume/movingAverages props, pushData streaming
- `skill/skills/treemap-chart/SKILL.md` — Treemap chart skill: pushData NOT SUPPORTED, TreemapNode type, breadcrumb/rounded/levelColors props, levelColors array-of-arrays format

## Decisions Made

- OHLC order `[open,close,low,high]` warning placed at top of file as CRITICAL notice — ECharts order diverges from the OHLC acronym order and produces silently incorrect candlesticks (wrong wick positions, reversed colors) with no error thrown
- treemap `pushData()` NOT SUPPORTED notice placed at top of file — overridden with `console.warn` no-op; the wrong pattern (calling pushData) is shown as commented-out code alongside the correct pattern (reassign `.data`)
- `levelColors` `array-of-arrays` (string[][]) requirement documented with explicit note that flat `string[]` is silently rejected — this matches the Phase 95 implementation decision
- `movingAverages` documented as JSON string attribute with `JSON.stringify()` guidance — consistent with how heatmap skill documents its JSON string attributes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 97 complete — all 4 plans delivered: skills/charts router (01), line/area/bar sub-skills (02), pie/scatter/heatmap sub-skills (03), candlestick/treemap sub-skills (04)
- All 8 chart types now have dedicated sub-skill files under skill/skills/
- v9.0 Charts System milestone fully documented in skill system

---
*Phase: 97-update-skills-to-include-recent-addition-of-chart-system-there-should-be-a-detailed-sub-skill-for-each-chart-type-and-main-router-skill-needs-to-be-updated-too*
*Completed: 2026-03-01*
