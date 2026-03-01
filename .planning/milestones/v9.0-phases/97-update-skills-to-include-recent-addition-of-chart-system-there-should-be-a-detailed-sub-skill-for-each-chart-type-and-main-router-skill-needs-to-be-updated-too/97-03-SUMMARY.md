---
phase: 97-update-skills-to-include-recent-addition-of-chart-system-there-should-be-a-detailed-sub-skill-for-each-chart-type-and-main-router-skill-needs-to-be-updated-too
plan: 03
subsystem: ui
tags: [echarts, lit, charts, skill-files, pie-chart, scatter-chart, heatmap-chart]

# Dependency graph
requires:
  - phase: 97-02
    provides: line-chart/area-chart/bar-chart skill files — established chart sub-skill pattern to follow
provides:
  - skill/skills/pie-chart/SKILL.md — lui-pie-chart skill with donut mode, innerRadius/centerLabel, PieSlice type
  - skill/skills/scatter-chart/SKILL.md — lui-scatter-chart skill with bubble+enable-gl limitation warning, ScatterPoint type
  - skill/skills/heatmap-chart/SKILL.md — lui-heatmap-chart skill with xCategories/yCategories JS-only warnings, HeatmapCell type
affects: [chart-skills, skills/charts, phase-97-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Chart sub-skill: defer shared props/methods/CSS to skills/charts cross-reference to avoid duplicating 17-token table"
    - "Chart sub-skill: React useRef+useEffect pattern for JS-only properties shown in Usage section"
    - "Chart sub-skill: critical pitfall warnings placed in Behavior Notes with bold labels"

key-files:
  created:
    - skill/skills/pie-chart/SKILL.md
    - skill/skills/scatter-chart/SKILL.md
    - skill/skills/heatmap-chart/SKILL.md
  modified: []

key-decisions:
  - "pie-chart innerRadius falsy check documented: 0/'0'/'0%' all mean filled pie — '0' is truthy in JS but semantically no inner radius"
  - "scatter-chart bubble+enable-gl fixed size limitation prominently warned — GPU cannot support per-point size callbacks"
  - "heatmap-chart xCategories/yCategories JS-only warning placed in Usage header, Props table, and Behavior Notes (3 locations)"
  - "HeatmapCell integer index type clarified: [xIdx,yIdx,value] are positions into arrays, not category string values"
  - "heatmap pushData() cell-update-in-place semantics documented (overrides base circular buffer)"

patterns-established:
  - "Pitfall warning pattern: critical limitations appear in both attribute column (Props table) and Behavior Notes section"
  - "JS-only props pattern: marked '— (JS only)' in Attribute column, bold warning in Usage preamble and Behavior Notes"

requirements-completed: [SKILL-PIE-CHART, SKILL-SCATTER-CHART, SKILL-HEATMAP-CHART]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 97 Plan 03: Pie/Scatter/Heatmap Chart Skills Summary

**Three chart skill files with high-density pitfall warnings: pie donut mode (innerRadius falsy quirk), scatter bubble+WebGL fixed-size limitation, and heatmap JS-only category arrays with integer-index cell addressing**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T06:53:31Z
- **Completed:** 2026-03-01T06:55:08Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- skill/skills/pie-chart/SKILL.md: PieSlice type, all 4 chart-specific props (minPercent/innerRadius/centerLabel/labelPosition), donut mode with innerRadius falsy check ('0' is truthy but means pie mode), centerLabel dependency on innerRadius
- skill/skills/scatter-chart/SKILL.md: ScatterPoint tuple type, bubble prop, prominent bubble+enable-gl=fixed-size GPU limitation warning, WebGL lazy-load impact, circular buffer streaming
- skill/skills/heatmap-chart/SKILL.md: HeatmapCell [xIdx,yIdx,value] integer-index type, xCategories/yCategories JS-only warnings in 3 locations (Usage header, Props table, Behavior Notes), pushData() cell-update-in-place semantics, VisualMap [0,100] default

## Task Commits

Each task was committed atomically:

1. **Task 1: Create skill/skills/pie-chart/SKILL.md** - `ee4a2c2` (feat)
2. **Task 2: Create skill/skills/scatter-chart/SKILL.md and skill/skills/heatmap-chart/SKILL.md** - `010dfdb` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `skill/skills/pie-chart/SKILL.md` - Pie/donut chart skill with PieSlice type, donut props, innerRadius falsy guard
- `skill/skills/scatter-chart/SKILL.md` - Scatter/bubble chart skill with ScatterPoint type, bubble+enable-gl limitation warning
- `skill/skills/heatmap-chart/SKILL.md` - Heatmap chart skill with HeatmapCell integer-index type, JS-only category warnings, cell-update streaming

## Decisions Made
- innerRadius falsy check documented explicitly: 0, '0', and '0%' all mean pie mode; '0' is truthy in JS but the component handles it as "no inner radius"
- bubble+enable-gl warning placed as the first Behavior Note to maximize visibility
- xCategories/yCategories JS-only warning placed in Usage preamble ("they CANNOT be set as HTML attributes"), Props table (Attribute column shows "— (JS only)"), and Behavior Notes section — three locations for maximum coverage
- HeatmapCell index semantics clarified: values are integer array positions, not category strings (common mistake)
- colorRange format clarified: comma-separated hex pair with min-color first

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 03 complete — pie-chart, scatter-chart, heatmap-chart skill files delivered
- Plan 04 (candlestick-chart and treemap-chart skill files) is the final plan in Phase 97
- All chart sub-skills will be complete after plan 04

---
*Phase: 97-update-skills-to-include-recent-addition-of-chart-system-there-should-be-a-detailed-sub-skill-for-each-chart-type-and-main-router-skill-needs-to-be-updated-too*
*Completed: 2026-03-01*
