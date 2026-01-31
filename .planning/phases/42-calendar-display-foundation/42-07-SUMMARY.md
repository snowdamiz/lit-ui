---
phase: 42-calendar-display-foundation
plan: 07
subsystem: ui
tags: intl-api, locale, i18n, first-day-of-week, weekday-names, aria-labels

# Dependency graph
requires:
  - phase: 42-04
    provides: ARIA accessibility foundation
  - phase: 42-05
    provides: Keyboard navigation
  - phase: 42-06
    provides: Date constraints
provides:
  - Full Intl API locale support with first-day-of-week override
  - Long weekday names for aria-label accessibility
  - Locale-reactive calendar rendering
affects: 42-08 (final polish and integration)

# Tech tracking
tech-stack:
  added: []
  patterns: [Intl.DateTimeFormat long weekday names, first-day-of-week attribute override, effectiveLocale reactive chain]

key-files:
  created: []
  modified: [packages/calendar/src/intl-utils.ts, packages/calendar/src/calendar.ts]

key-decisions:
  - "Add first-day-of-week attribute override (1-7) with locale fallback for developer control"
  - "Use getWeekdayLongNames() for aria-label on weekday headers for screen reader accessibility"
  - "Intl format (1=Mon...7=Sun) for override property matches Intl.Locale.getWeekInfo() convention"

patterns-established:
  - "Pattern: attribute override with locale fallback for Intl-derived properties"

# Metrics
duration: 1min
completed: 2026-01-31
---

# Phase 42 Plan 07: Internationalization Support Summary

**Intl API locale enhancements with first-day-of-week override property and long weekday names for aria-labels**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-31T08:22:45Z
- **Completed:** 2026-01-31T08:24:03Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Added `getWeekdayLongNames()` function to intl-utils.ts for locale-aware long weekday names
- Added `first-day-of-week` attribute override property to calendar.ts (accepts 1-7 Intl format)
- Updated `firstDayOfWeek` getter to use override when valid, fallback to locale detection
- Updated weekday header template to use long names in aria-label for screen reader accessibility
- All locale-aware rendering flows through effectiveLocale reactively

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify and enhance Intl utilities and locale reactivity** - `5bb90f2` (feat)

## Files Created/Modified

- `packages/calendar/src/intl-utils.ts` - Added getWeekdayLongNames() for long weekday names
- `packages/calendar/src/calendar.ts` - Added first-day-of-week override, long names in aria-labels

## Decisions Made

- Add first-day-of-week attribute override (1-7) with locale fallback for developer control
- Use getWeekdayLongNames() for aria-label on weekday headers for screen reader accessibility
- Intl format (1=Mon...7=Sun) for override property matches Intl.Locale.getWeekInfo() convention

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- Full Intl API locale support is in place
- Calendar correctly localizes first day of week, weekday names, and month names
- first-day-of-week override allows developer control independent of locale
- Ready for next plan (42-08): Final polish and integration

---
*Phase: 42-calendar-display-foundation*
*Completed: 2026-01-31*
