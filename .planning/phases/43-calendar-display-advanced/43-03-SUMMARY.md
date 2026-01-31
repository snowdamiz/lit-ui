---
phase: 43-calendar-display-advanced
plan: 03
subsystem: ui
tags: date-fns, iso-8601, week-numbers, calendar, date-utils

# Dependency graph
requires:
  - phase: 42-01
    provides: Calendar package with date-utils.ts module
provides:
  - ISO week number utility functions (getISOWeekNumber, getISOWeekDates, getMonthWeeks)
  - WeekInfo interface for typed week data
affects: 43-04, 43-05 (week number display column, week selection)

# Tech tracking
tech-stack:
  added: []
  patterns: [ISO 8601 week numbering via date-fns, Thursday-based week determination, Map deduplication for year boundary weeks]

key-files:
  created: []
  modified: [packages/calendar/src/date-utils.ts]

key-decisions:
  - "Use date-fns getISOWeek/startOfISOWeek/endOfISOWeek for ISO 8601 week compliance"
  - "Key WeekInfo map by start timestamp for year boundary deduplication"
  - "Sort getMonthWeeks by startDate for calendar display order"
  - "Determine ISO week number by row's Thursday (ISO 8601 standard)"

patterns-established:
  - "Pattern: WeekInfo interface for structured week data in calendar grid"
  - "Pattern: Reuse getCalendarDays() in higher-level utilities to avoid duplication"

# Metrics
duration: 2min
completed: 2026-01-31
---

# Phase 43 Plan 03: ISO Week Number Utilities Summary

**ISO 8601 week number functions added to date-utils.ts using date-fns getISOWeek/startOfISOWeek/endOfISOWeek**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-31T09:30:01Z
- **Completed:** 2026-01-31T09:31:43Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added getISOWeekNumber() wrapper returning ISO 8601 week numbers (1-53)
- Added getISOWeekDates() returning 7 dates (Monday-Sunday) for any date's ISO week
- Added getMonthWeeks() returning WeekInfo[] with week numbers for calendar grid rows
- Exported WeekInfo interface for type consumers
- Added getISOWeek, startOfISOWeek, endOfISOWeek imports from date-fns
- Re-exported getISOWeek for direct consumer use

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ISO week number utilities to date-utils.ts** - `4349697` (feat)

## Files Created/Modified

- `packages/calendar/src/date-utils.ts` - Added 3 new functions, 1 interface, 3 new date-fns imports

## Decisions Made

- Use date-fns getISOWeek/startOfISOWeek/endOfISOWeek for ISO 8601 compliance
- Determine week number by Thursday of each display row (ISO 8601 standard)
- Deduplicate weeks using Map keyed by startOfISOWeek timestamp (handles year boundaries)
- getMonthWeeks reuses getCalendarDays internally (no grid logic duplication)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- ISO week utilities are ready for week number column display (43-04)
- WeekInfo interface available for week selection feature (43-05)
- All existing exports unchanged, backward compatible

---
*Phase: 43-calendar-display-advanced*
*Completed: 2026-01-31*
