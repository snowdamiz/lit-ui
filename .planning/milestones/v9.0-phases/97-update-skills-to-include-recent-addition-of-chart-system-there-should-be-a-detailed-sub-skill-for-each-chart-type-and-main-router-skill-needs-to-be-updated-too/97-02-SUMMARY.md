---
phase: 97-update-skills-to-include-recent-addition-of-chart-system-there-should-be-a-detailed-sub-skill-for-each-chart-type-and-main-router-skill-needs-to-be-updated-too
plan: 02
subsystem: ui
tags: [echarts, charts, skills, line-chart, area-chart, bar-chart, streaming, react]

# Dependency graph
requires:
  - phase: 97-01
    provides: skill/skills/charts/SKILL.md secondary router and shared chart API docs
provides:
  - skill/skills/line-chart/SKILL.md — lui-line-chart sub-skill with appendData streaming warning
  - skill/skills/area-chart/SKILL.md — lui-area-chart sub-skill with stacked and streaming docs
  - skill/skills/bar-chart/SKILL.md — lui-bar-chart sub-skill with colorByData and categories workaround
affects: [skills router, chart documentation, AI assistant chart question handling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Chart sub-skill follows: frontmatter -> intro -> Usage (JS/HTML/React) -> Data Type -> Props table -> Methods/Events/CSS (defer to charts) -> Behavior Notes"
    - "Props table columns: Prop | Attribute | Type | Default | Description"
    - "Attribute column shows — (JS only) for non-serializable properties"

key-files:
  created:
    - skill/skills/line-chart/SKILL.md
    - skill/skills/area-chart/SKILL.md
    - skill/skills/bar-chart/SKILL.md
  modified: []

key-decisions:
  - "appendData streaming warning placed in both line-chart and area-chart Behavior Notes — critical to prevent data wipe on setOption after streaming starts"
  - "area-chart Data Type references LineChartSeries — area is a line series with areaStyle, no separate type"
  - "bar-chart documents categories workaround: pass via option prop or buildBarOption() — categories is not a reactive property"
  - "Methods/Events/CSS sections all defer to skills/charts via cross-reference — avoids duplication of 17 token table across 8 sub-skills"
  - "colorByData prop documented with both camelCase JS name and color-by-data HTML attribute name"

patterns-established:
  - "Chart sub-skill pattern: usage examples first (JS, HTML, React, streaming), then data types, then props table, then defer shared API to skills/charts"
  - "Behavior Notes section documents critical pitfalls: JS property required, streaming mode constraints, internal ECharts translation details"

requirements-completed: [SKILL-LINE-CHART, SKILL-AREA-CHART, SKILL-BAR-CHART]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 97 Plan 02: Line, Area, and Bar Chart Skills Summary

**Three chart sub-skill SKILL.md files created covering appendData streaming, stacked areas, colorByData bars, React useRef+useEffect pattern, and category axis workaround**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T06:49:12Z
- **Completed:** 2026-03-01T06:50:54Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created skill/skills/line-chart/SKILL.md with smooth/zoom/markLines props and critical appendData streaming warning
- Created skill/skills/area-chart/SKILL.md with stacked/zoom/labelPosition props and appendData streaming note
- Created skill/skills/bar-chart/SKILL.md with stacked/horizontal/showLabels/labelPosition/colorByData props and categories workaround

## Task Commits

Each task was committed atomically:

1. **Task 1: Create skill/skills/line-chart/SKILL.md** - `3a4f51e` (feat)
2. **Task 2: Create skill/skills/area-chart/SKILL.md and skill/skills/bar-chart/SKILL.md** - `68819fc` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `skill/skills/line-chart/SKILL.md` - lui-line-chart sub-skill: LineChartSeries data type, smooth/zoom/markLines props, appendData streaming warning, React useRef+useEffect pattern
- `skill/skills/area-chart/SKILL.md` - lui-area-chart sub-skill: reuses LineChartSeries, stacked/zoom/labelPosition props, appendData streaming warning, stacked->string translation note
- `skill/skills/bar-chart/SKILL.md` - lui-bar-chart sub-skill: BarChartSeries data type, stacked/horizontal/showLabels/labelPosition/colorByData props, categories workaround via option prop

## Decisions Made
- Methods, Events, and CSS Custom Properties sections all defer to `skills/charts` via cross-reference rather than duplicating the 17-token table across every sub-skill
- Area chart data type section explicitly notes it reuses LineChartSeries — clarifies there is no separate AreaChartSeries type
- Bar chart documents categories as non-reactive prop with option prop workaround — this is a known gotcha from Phase 90

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Line, area, and bar chart sub-skills complete — ready for Phase 97 plan 03 (pie-chart, scatter-chart, heatmap-chart sub-skills)
- All three files follow the established sub-skill format; plans 03 and 04 can use these as format reference

---
*Phase: 97-update-skills*
*Completed: 2026-03-01*
