# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** Phase 43 Calendar Display Advanced — complete

## Current Position

Phase: 2 of 9 (Calendar Display Advanced)
Plan: 8 of 8 in current phase (8 execution complete)
Status: Phase complete
Last activity: 2026-01-31 — Completed 43-08-PLAN.md (package exports and JSX types)

Progress: [████████████████████] 100% (19/19 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 19
- Average duration: 2.2 min
- Total execution time: 0.71 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 42    | 10    | 10    | 2.6 min |
| 43    | 8     | 8     | 1.9 min |

**Recent Trend:**
- Last 3 plans: 2 min (43-06), 1 min (43-07), 2 min (43-08)
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
- **Phase 42-10**: Use shared announceMonthChange() method for all four navigation handlers (DRY)
- **Phase 42-10**: Belt-and-suspenders: keep aria-live on heading AND dedicated liveAnnouncement region
- **Phase 43-03**: Use date-fns getISOWeek/startOfISOWeek/endOfISOWeek for ISO 8601 week compliance
- **Phase 43-03**: Key WeekInfo map by start timestamp for year boundary deduplication
- **Phase 43-03**: Sort getMonthWeeks by startDate for calendar display order
- **Phase 43-02**: Use Pointer Events API (not Touch Events) for unified swipe detection
- **Phase 43-02**: 50px swipe threshold with 1.5x horizontal ratio to distinguish from scroll
- **Phase 43-02**: prefers-reduced-motion replaces slide with fade (not remove animation)
- **Phase 43-02**: isAnimating guard skips animation on rapid navigation (instant update)
- **Phase 43-04**: CalendarView type uses 'month'|'year'|'decade' with view dispatch in render()
- **Phase 43-04**: Decade view shows 12 years (1 before + 10 in decade + 1 after) in 4x3 grid
- **Phase 43-04**: Century view shows 12 decades in 4x3 grid with KeyboardNavigationManager(cells, 4)
- **Phase 43-04**: Escape key navigates back one view level (decade->year->month)
- **Phase 43-04**: Heading uses role="button" with tabindex="0" for view drilling
- **Phase 43-05**: AnimationController targets .month-grid wrapper div for transition isolation
- **Phase 43-05**: GestureHandler initialized in firstUpdated (needs DOM to exist)
- **Phase 43-05**: renderDay callback receives DayCellState, wrapper retains all ARIA attributes
- **Phase 43-05**: Week numbers use button elements with aria-label for keyboard accessibility
- **Phase 43-05**: DayCellState.isInRange is inverse of isDisabled for simplicity
- **Phase 43-06**: CalendarMulti owns navigation; child Calendars use display-month and hide-navigation
- **Phase 43-06**: display-month supports YYYY-MM-DD and YYYY-MM formats with auto-parsing in updated()
- **Phase 43-06**: Months clamped to 2-3 in CalendarMulti, flexbox layout with 280px min-width
- **Phase 43-06**: Month range heading uses Intl.DateTimeFormat with en-dash, handles cross-year display
- **Phase 43-07**: Use container queries (not viewport media queries) for component-level responsiveness
- **Phase 43-07**: Three breakpoints: compact (<280px), standard (280-380px default), spacious (>380px)
- **Phase 43-07**: CalendarMulti stacks vertically at 600px container width
- **Phase 43-08**: Export GestureHandler and AnimationController as advanced-usage public API
- **Phase 43-08**: JSX types include event handler types for ui-date-select, ui-month-change, ui-week-select

### Pending Todos

None yet.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)

**Incomplete docs site:**
- Docs phases 9-12 incomplete (Framework, Theming, Accessibility, Polish)

## Session Continuity

Last session: 2026-01-31 (phase 43 complete)
Stopped at: Completed 43-08-PLAN.md (package exports and JSX types) - Phase 43 complete
Resume file: None
