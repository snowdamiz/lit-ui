---
phase: 42-calendar-display-foundation
plan: 07
subsystem: calendar
tags: lit, intl-api, i18n, locale, first-day-of-week, getWeekInfo

# Dependency graph
requires:
  - phase: 42-01
    provides: Calendar grid structure and intl-utils.ts
provides:
  - Locale-aware first day of week using Intl.Locale.getWeekInfo()
  - Weekday names that start from locale-specific first day
  - Month dropdown with localized names
  - Automatic locale change reactivity via @property decorator
affects: 42-08 (subsequent calendar plans)

# Tech tracking
tech-stack:
  added: []
  patterns: [Intl.Locale.getWeekInfo() API, locale fallback pattern, Lit @property reactivity]

key-files:
  created: []
  modified: [packages/calendar/src/intl-utils.ts, packages/calendar/src/calendar.ts]

key-decisions:
  - "Use Intl.Locale.getWeekInfo() for locale-aware first day of week (Chrome 99+, Safari 17+)"
  - "Fallback to Sunday (7) for en-US/he-IL, Monday (1) for other locales"
  - "Weekday names array starts from locale-specific first day, not hardcoded Sunday"
  - "Locale property reactivity is automatic via Lit @property decorator"

patterns-established:
  - "Pattern: Intl.Locale.getWeekInfo() with try/catch fallback for browser support"
  - "Pattern: getFirstDayOfWeek returns 1=Monday, 7=Sunday matching getWeekInfo spec"
  - "Pattern: Weekday array generation starts from getFirstDayOfWeek(locale) offset"

# Metrics
duration: 1min
completed: 2026-01-31
---

# Phase 42 Plan 07: Internationalization - First Day of Week and Locale Support Summary

**Locale-aware calendar with Intl.Locale.getWeekInfo() for first day of week, localized weekday/month names, and automatic reactivity**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-31T03:16:10Z
- **Completed:** 2026-01-31T03:17:17Z
- **Tasks:** 4
- **Files modified:** 2

## Accomplishments

- Implemented getFirstDayOfWeek() utility using Intl.Locale.getWeekInfo() API
- Added fallback for browsers without getWeekInfo support (Sunday for US/IL, Monday for others)
- Updated getWeekdayNames() to start from locale-specific first day
- Calendar now uses getMonthName() utility for month dropdown localization
- Locale property changes trigger automatic re-render via Lit @property reactivity

## Task Commits

Each task was committed atomically:

1. **Task 1: Add getFirstDayOfWeek utility with fallback** - `ee0a560` (feat)
2. **Task 2: Update getWeekdayNames to use locale-specific first day** - `d93860a` (feat)
3. **Task 3: Update calendar to use getMonthName utility** - `6384191` (feat)
4. **Task 4: Locale change reactivity is automatic via @property** - `8b2a280` (feat)

**Deviations:** None - plan executed exactly as written.

**Plan metadata:** (to be created after SUMMARY.md)

## Files Created/Modified

- `packages/calendar/src/intl-utils.ts` - Added getFirstDayOfWeek() with getWeekInfo() and fallback, updated getWeekdayNames() to start from locale-specific first day
- `packages/calendar/src/calendar.ts` - Added getMonthName import, updated getMonthOptions() to use utility, documented locale reactivity

## Decisions Made

- Use Intl.Locale.getWeekInfo() for locale-aware first day of week (modern browsers)
- Fallback to Sunday (7) for en-US/he-IL, Monday (1) for other locales when getWeekInfo unavailable
- Weekday names array starts from locale-specific first day, not hardcoded Sunday-first order
- Locale property reactivity is automatic via Lit @property decorator - no manual change handling needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed as planned.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Calendar is now fully internationalized with locale-aware first day of week
- Weekday and month names localize correctly for different locales
- Locale property changes trigger immediate re-render with correct formatting
- Ready for next plan (42-08): Calendar styling and theming

## Locale Examples

The calendar now correctly adapts to different locales:

- **en-US**: Sunday first, "January" month, ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] weekdays
- **en-GB**: Monday first, "January" month, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] weekdays
- **fr-FR**: Monday first, "janvier" month, ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] weekdays
- **de-DE**: Monday first, "Januar" month, ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] weekdays
- **es-ES**: Monday first, "enero" month, ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] weekdays
- **ja-JP**: Sunday first, "1月" month, ["日", "月", "火", "水", "木", "金", "土"] weekdays

---
*Phase: 42-calendar-display-foundation*
*Completed: 2026-01-31*
