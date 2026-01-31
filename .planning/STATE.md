# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** Phase 42 - Calendar Display Foundation

## Current Position

Phase: 1 of 9 (Calendar Display Foundation)
Plan: 9 of 10 in current phase (9 execution complete, 1 gap closure remaining)
Status: In progress
Last activity: 2026-01-31 — Completed 42-09-PLAN.md (imperative roving tabindex)

Progress: [█████████░] 90%

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 2.8 min
- Total execution time: 0.42 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 42    | 9     | 9     | 2.8 min |

**Recent Trend:**
- Last 3 plans: 2 min (42-07), 4 min (42-08), 2 min (42-09)
- Trend: Consistent execution pace

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
- **Phase 42-08**: Use :host-context(.dark) selectors for dark mode support (follows established project pattern)
- **Phase 42-08**: Define calendar CSS custom properties in core tailwind.css (consistent with other components)
- **Phase 42-08**: Register all calendar utility files in CLI (date-utils.ts, intl-utils.ts, keyboard-nav.ts)
- **Phase 42-09**: Remove tabindex from Lit template; manage imperatively via KeyboardNavigationManager in lifecycle
- **Phase 42-09**: Convert focusedIndex/navigationManager from @state() to private (no re-render on focus change)
- **Phase 42-09**: Use requestAnimationFrame in firstUpdated/updated for post-render tabindex setup

### Pending Todos

None yet.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)

**Incomplete docs site:**
- Docs phases 9-12 incomplete (Framework, Theming, Accessibility, Polish)

## Session Continuity

Last session: 2026-01-31 (42-09 execution)
Stopped at: Completed 42-09-PLAN.md, imperative roving tabindex via KeyboardNavigationManager
Resume file: None
