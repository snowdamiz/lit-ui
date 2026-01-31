---
phase: 45
plan: 04
subsystem: calendar-tooltips
tags: [calendar, tooltips, css, accessibility, date-constraints]
dependency-graph:
  requires: [42-06, 44-02]
  provides: [constraint-tooltips-on-disabled-dates]
  affects: [45-03]
tech-stack:
  added: []
  patterns: [css-pseudo-element-tooltips, data-attribute-driven-ui]
key-files:
  created: []
  modified:
    - packages/calendar/src/calendar.ts
    - packages/date-picker/src/date-picker.ts
decisions:
  - id: D-45-04-01
    description: "Use CSS ::after pseudo-elements with data-tooltip attribute for tooltips (not HTML title attribute, which has Firefox Shadow DOM bug)"
  - id: D-45-04-02
    description: "Auto-enable tooltips on date-picker when min/max constraints are set (no extra property needed on date-picker)"
  - id: D-45-04-03
    description: "Capitalize constraint reason strings for user-facing display (Before minimum date, After maximum date, Unavailable)"
metrics:
  duration: 2 min
  completed: 2026-01-31
---

# Phase 45 Plan 04: Constraint Tooltips Summary

CSS ::after tooltip on disabled calendar dates with data-tooltip attribute, opt-in via show-constraint-tooltips property

## Accomplishments

1. Added `show-constraint-tooltips` boolean property to Calendar component (reflected attribute)
2. Capitalized constraint reason strings for user-facing tooltip display
3. Added `data-tooltip` attribute rendering on disabled date buttons in both standard and renderDay paths
4. Added CSS `::after` pseudo-element tooltip with positioning above date cell
5. Added dark mode tooltip support via `:host-context(.dark)`
6. Wired automatic tooltip enablement from date-picker when min/max constraints are set

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add show-constraint-tooltips property and data-tooltip rendering | 642d435 | packages/calendar/src/calendar.ts |
| 2 | Wire tooltip property from date-picker to calendar | f8a3a25 | packages/date-picker/src/date-picker.ts |

## Files Modified

- `packages/calendar/src/calendar.ts` - Added showConstraintTooltips property, capitalized reason strings, data-tooltip on buttons, tooltip CSS with dark mode
- `packages/date-picker/src/date-picker.ts` - Added ?show-constraint-tooltips binding on popup calendar element

## Decisions Made

1. **CSS ::after pseudo-elements over title attribute** (D-45-04-01): The HTML `title` attribute has a known Firefox bug in Shadow DOM. Using CSS `::after` with `content: attr(data-tooltip)` provides reliable cross-browser tooltip rendering.

2. **Auto-enable tooltips from date-picker** (D-45-04-02): Rather than adding a separate property on date-picker, tooltips are automatically enabled whenever `minDate` or `maxDate` is set. This provides the best UX without additional configuration.

3. **Capitalized constraint reasons** (D-45-04-03): Changed from lowercase ("before minimum date") to title case ("Before minimum date") since these strings now serve as user-facing tooltip text in addition to aria-label content.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript compiles without errors in calendar package
- TypeScript compiles without errors in date-picker package (pre-existing test file error unrelated)
- Tooltip CSS uses proper positioning (absolute, bottom: calc(100% + 4px), centered with transform)
- Dark mode inverts tooltip colors via :host-context(.dark)
- No tooltip rendered on enabled dates (data-tooltip only set when constraint.disabled is true)

## Performance

- **Duration:** 2 min
- **Start:** 2026-01-31T19:40:06Z
- **End:** 2026-01-31T19:41:37Z
- **Tasks:** 2/2
- **Files modified:** 2
