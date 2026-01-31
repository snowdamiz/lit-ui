---
phase: 42-calendar-display-foundation
plan: 02
subsystem: ui
tags: lit, calendar, today-indicator, date-selection, aria-current, aria-selected, custom-events

# Dependency graph
requires:
  - phase: 42-01
    provides: Calendar package with grid layout and date utilities
provides:
  - Today indicator with border ring and aria-current="date"
  - Selected date visual state with aria-selected attribute
  - Date selection click handler emitting ui-date-select event
  - Value property sync to selectedDate via parseISO
affects: 42-03, 42-04, 42-05, 42-06 (keyboard nav, constraints, and advanced features build on selection)

# Tech tracking
tech-stack:
  added: []
  patterns: [aria-current="date" for today, aria-selected for selection state, Lit nothing sentinel for conditional attributes, CSS attribute selectors for state styling]

key-files:
  created: []
  modified: [packages/calendar/src/calendar.ts]

key-decisions:
  - "Use aria-current='date' for today indicator per WCAG recommendation"
  - "Use CSS custom properties for all visual states (--ui-calendar-today-border, --ui-calendar-selected-bg, --ui-calendar-selected-text)"
  - "Use border: 2px solid transparent as base for smooth today border transition"
  - "Outside-month dates skip selection handler (early return in handleDateSelect)"
  - "Use Lit nothing sentinel to conditionally render aria-current attribute"

patterns-established:
  - "Pattern: dispatchCustomEvent for ui-date-select with { date, isoString } payload"
  - "Pattern: Value property parsed via parseISO in updated() lifecycle for external sync"
  - "Pattern: CSS attribute selectors [aria-selected='true'] for state-driven styling"

# Metrics
duration: 3min
completed: 2026-01-31
---

# Phase 42 Plan 02: Today Indicator, Selected State, and Date Selection Summary

**Today border ring with aria-current, selected date highlight with aria-selected, and click handler emitting ui-date-select CustomEvent**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-31T08:09:45Z
- **Completed:** 2026-01-31T08:12:53Z
- **Tasks:** 1/1
- **Files modified:** 1

## Accomplishments

- Added today indicator with 2px solid border ring and `aria-current="date"` attribute
- Added selected date highlight using `aria-selected="true"` with filled background color
- Implemented `handleDateSelect` click handler that skips outside-month dates
- Added `ui-date-select` CustomEvent emission with `{ date: Date, isoString: string }` payload
- Added `selectedDate` @state() for internal selection tracking
- Added value property sync via `parseISO()` in `updated()` lifecycle
- Added focus-visible outline for keyboard accessibility on date buttons
- Changed base button border from `none` to `2px solid transparent` for smooth today indicator

## Task Commits

Each task was committed atomically:

1. **Task 1: Add today indicator, selected state, and date selection events** - `b037e0a` (feat)

## Files Modified

- `packages/calendar/src/calendar.ts` - Added today/selected CSS, selectedDate state, handleDateSelect handler, value sync, template ARIA attributes

## Decisions Made

- Use `aria-current="date"` for today indicator per WCAG recommendation
- Use Lit `nothing` sentinel for conditional `aria-current` attribute (removes attribute when not today)
- Use CSS attribute selectors `[aria-selected="true"]` for state-driven styling
- Base button border set to `2px solid transparent` to prevent layout shift when today border appears
- Outside-month dates return early from handleDateSelect (no selection, no event)
- CSS custom properties for all visual states: `--ui-calendar-today-border`, `--ui-calendar-selected-bg`, `--ui-calendar-selected-text`, `--ui-calendar-focus-ring`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Today indicator and selected state are in place for keyboard navigation (42-05)
- Date selection event ready for consumer integration
- Value property sync enables external date setting
- Ready for Plan 03: Month/year navigation with dropdowns

---
*Phase: 42-calendar-display-foundation*
*Completed: 2026-01-31*
