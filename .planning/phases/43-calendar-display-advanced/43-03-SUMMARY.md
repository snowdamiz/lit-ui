---
phase: 43-calendar-display-advanced
plan: 03
subsystem: ui
tags: date-fns, calendar, iso-week, date-utils

# Dependency graph
requires:
  - phase: 42
    provides: Calendar package with date-utils.ts foundation
provides:
  - ISO 8601 week number utilities (getISOWeekNumber, getWeekRange, getMonthWeeks)
  - WeekInfo interface for week metadata
affects: 43-04, 43-05 (week number column display, week selection)

# Tech tracking
tech-stack:
  added: []
  patterns: [date-fns wrapper functions for ISO week calculations]

key-files:
  created: []
  modified: [packages/calendar/src/date-utils.ts]

key-decisions:
  - "Use date-fns getISOWeek/startOfISOWeek/endOfISOWeek for ISO 8601 compliance"
  - "Key WeekInfo map by start timestamp to handle year boundary deduplication"
  - "Sort getMonthWeeks by startDate for calendar display order"

patterns-established:
  - "Pattern: WeekInfo interface as standard week metadata type"

# Metrics
duration: 1min
completed: 2026-01-31
---

# Phase 43 Plan 03: ISO Week Number Utilities Summary

**ISO 8601 week number utilities wrapping date-fns getISOWeek, startOfISOWeek, endOfISOWeek for calendar week display and selection**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-31T06:15:34Z
- **Completed:** 2026-01-31T06:16:12Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added `getISOWeekNumber()` wrapping date-fns `getISOWeek` with JSDoc showing year boundary edge cases
- Added `getWeekRange()` returning Monday-Sunday ISO week start/end dates
- Added `WeekInfo` interface with weekNumber, startDate, endDate fields
- Added `getMonthWeeks()` returning all unique weeks for a displayed month, sorted by calendar order
- Year boundary handling: uses start timestamp as map key to correctly deduplicate weeks spanning year boundaries

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ISO week number functions to date-utils.ts** - `32d830b` (feat)

## Files Created/Modified

- `packages/calendar/src/date-utils.ts` - Added 3 new date-fns imports, 3 exported functions, 1 exported interface (+99 lines)

## Decisions Made

- Use date-fns getISOWeek/startOfISOWeek/endOfISOWeek for ISO 8601 compliance (consistent with existing date-fns wrapper pattern)
- Key WeekInfo map by week start timestamp rather than week number to handle year boundaries where both week 52/53 and week 1 appear in same month
- Sort getMonthWeeks results by startDate for predictable calendar display order

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- ISO week utilities ready for calendar week number column integration
- WeekInfo interface provides standard type for week-related features
- getMonthWeeks provides the data source for rendering week numbers alongside month grid

---
*Phase: 43-calendar-display-advanced*
*Completed: 2026-01-31*
