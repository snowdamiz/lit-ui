# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** Phase 42 - Calendar Display Foundation

## Current Position

Phase: 1 of 9 (Calendar Display Foundation)
Plan: 6 of 8 in current phase
Status: In progress
Last activity: 2026-01-31 — Completed 42-06-PLAN.md (Date Constraints with min/max, disabled dates, weekend disabling)

Progress: [██████░░] 75%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 2.8 min
- Total execution time: 0.28 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 42    | 6     | 8     | 2.8 min |

**Recent Trend:**
- Last 3 plans: 3 min (42-03), 2 min (42-04), 2 min (42-06)
- Trend: Steady progress

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **Phase 42**: Calendar Display is standalone component (NOT slotted like Option), emits ui-date-select/ui-month-change events
- **Phase 42**: Use date-fns v4.1.0 for date manipulation (modular, tree-shakeable, v4 has timezone support)
- **Phase 42**: Use native Intl API for localization (Intl.DateTimeFormat, Intl.Locale.getWeekInfo())
- **Phase 42**: Follow WAI-ARIA APG Grid Pattern with roving tabindex for keyboard navigation
- **Phase 42**: Submit form values as ISO 8601 format (YYYY-MM-DD for dates, HH:mm:ss for times)
- **Phase 42-01**: Extend TailwindElement base class for SSR support with isServer guards
- **Phase 42-02**: Use CSS custom properties (--ui-calendar-*) for calendar theming with fallback values
- **Phase 42-02**: Today indicator uses aria-current="date" per WCAG recommendation
- **Phase 42-02**: Selected date state tracked via @state() private selectedDate with click handler emitting ui-date-select event
- **Phase 42-03**: Use date-fns addMonths/subMonths for month navigation (handles edge cases)
- **Phase 42-03**: Sync dropdown state (selectedMonth/selectedYear) with currentMonth for consistency
- **Phase 42-03**: Emit ui-month-change event after all navigation actions (buttons, dropdowns, keyboard)
- **Phase 42-03**: Use aria-live="polite" on heading for screen reader announcements
- **Phase 42-04**: Use aria-live="polite" region for date selection announcements
- **Phase 42-05**: Add keyboard navigation help dialog with shortcuts list
- **Phase 42-05**: Implement WAI-ARIA Grid Pattern keyboard navigation (arrows, Home, End, PageUp, PageDown)
- **Phase 42-06**: Use DateConstraints interface for type-safe date validation (minDate, maxDate, disabledDates)
- **Phase 42-06**: Parse ISO strings to Date objects in updated() lifecycle for reactive constraint updates
- **Phase 42-06**: Provide human-readable disabled reasons in aria-label (before minimum date, after maximum date, unavailable, weekend)
- **Phase 42-06**: Use CSS custom property --ui-calendar-disabled-opacity for theming disabled state
- **Phase 42-07**: Use Intl.Locale.getWeekInfo() for locale-aware first day of week (Chrome 99+, Safari 17+)
- **Phase 42-07**: Fallback to Sunday (7) for en-US/he-IL, Monday (1) for other locales
- **Phase 42-07**: Weekday names array starts from locale-specific first day via getFirstDayOfWeek()
- **Phase 42-07**: Locale property reactivity is automatic via Lit @property decorator

### Pending Todos

None yet.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)

**Incomplete docs site:**
- Docs phases 9-12 incomplete (Framework, Theming, Accessibility, Polish)

## Session Continuity

Last session: 2026-01-31 (42-06 execution)
Stopped at: Completed 42-06-PLAN.md, added date constraints with min/max, disabled dates, and weekend disabling
Resume file: None
