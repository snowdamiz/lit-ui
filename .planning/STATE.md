# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** Phase 50 Documentation — In progress

## Current Position

Phase: 9 of 9 (Documentation)
Plan: 4 of 6 in current phase (2 executions complete)
Status: In progress
Last activity: 2026-02-02 — Completed 50-04-PLAN.md

Progress: [██████████░░░░░░░░░░░░░░░░░░░░░░] 33% (2/6 plans in phase 50)

## Performance Metrics

**Velocity:**
- Total plans completed: 50
- Average duration: 2.1 min
- Total execution time: 1.71 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 42    | 12    | 12    | 2.5 min |
| 43    | 8     | 8     | 1.9 min |

**Recent Trend:**
- Last 3 plans: 2 min (49-06), 2 min (50-01), 2 min (50-04)
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
- **Phase 44-01**: Use Intl.DateTimeFormat for display formatting instead of date-fns format() (zero bundle cost)
- **Phase 44-01**: en-US/en-CA use MM/dd ordering; all other locales use dd/MM for date input parsing
- **Phase 44-02**: Popup uses absolute positioning as placeholder; Plan 03 upgrades to Floating UI
- **Phase 44-02**: Calendar popup composed directly (not slotted); Escape checks defaultPrevented for view drilling
- **Phase 44-03**: Popup uses Floating UI fixed strategy with offset(4), flip to top-start, shift with 8px padding
- **Phase 44-03**: Click-outside uses composedPath().includes(this) for Shadow DOM compatibility
- **Phase 44-04**: Focus trap uses Tab preventDefault + refocus calendar (no sentinel elements)
- **Phase 44-04**: closePopup() handles all focus restoration via requestAnimationFrame
- **Phase 44-04**: handleInputBlur syncs both internalError (display) and ElementInternals validity (form)
- **Phase 44-04**: badInput validity flag used for unparseable date text
- **Phase 44-05**: HTMLElementTagNameMap kept in date-picker.ts (not duplicated in index.ts) to avoid TS duplicate identifier error
- **Phase 45-04**: Use CSS ::after pseudo-elements with data-tooltip for tooltips (not HTML title attribute, Firefox Shadow DOM bug)
- **Phase 45-04**: Auto-enable tooltips on date-picker when min/max constraints are set (no extra property needed)
- **Phase 45-04**: Capitalize constraint reason strings for user-facing tooltip display
- **Phase 45-01**: NL resolver functions called at evaluation time (not import) for SSR safety
- **Phase 45-01**: Natural language parsing runs before format-based parsing in parseDateInput pipeline
- **Phase 45-02**: Presets property accepts boolean | DatePreset[] — true uses DEFAULT_PRESETS, array for custom
- **Phase 45-02**: Format property is JS-only (attribute: false) since Intl.DateTimeFormatOptions is an object
- **Phase 45-02**: Preset resolver functions called at click time (not render time) for SSR safety
- **Phase 45-03**: Inline mode skips all popup infrastructure (Floating UI, click-outside, focus trap, document listeners)
- **Phase 45-03**: validate() uses optional anchor (this.inputEl ?? undefined) since inline mode has no input element
- **Phase 45-03**: Inline label rendered as span (not label-for) since there is no input to associate
- **Phase 45-05**: LuiDatePickerProperties interface separates JS-only props (presets, format) from HTML attributes in JSX types
- **Phase 46-01**: Two-click state machine: idle -> start-selected -> complete with auto-swap on second click
- **Phase 46-01**: Range utilities are pure functions with ISO string inputs/outputs
- **Phase 46-01**: Form value submitted as ISO 8601 interval (YYYY-MM-DD/YYYY-MM-DD) via ElementInternals
- **Phase 46-02**: Inline styles for renderDay output (Shadow DOM CSS boundary — classes cannot reach calendar internals)
- **Phase 46-02**: CSS custom properties (--ui-range-*) for range theming (cascade through Shadow DOM)
- **Phase 46-02**: Listen for @change on lui-calendar (not @ui-change) matching date-picker pattern
- **Phase 46-03**: Readonly input (not editable) since range picker uses calendar-only selection
- **Phase 46-03**: Input click opens popup; calendar icon toggles (stopPropagation prevents double-fire)
- **Phase 46-03**: displayValue getter uses Intl.DateTimeFormat with short month format for range display
- **Phase 46-03**: Popup wraps dual-calendar layout via renderCalendarContent() extraction
- **Phase 46-03**: formResetCallback closes popup for clean form reset behavior
- **Phase 46-04**: validate() checks required (valueMissing) before duration (customError), matching date-picker pattern
- **Phase 46-04**: Popup auto-closes on valid complete range selection
- **Phase 46-04**: Input clear button visible when startDate set; footer clear only on complete range
- **Phase 46-05**: HTMLElementTagNameMap kept in date-range-picker.ts per Phase 44-05 decision
- **Phase 46-05**: JSX types separate LuiDateRangePickerAttributes and LuiDateRangePickerEvents interfaces
- **Phase 47-01**: DateRangePreset.resolve() called at click time for SSR safety; computeRangeDuration uses differenceInCalendarDays + 1 for inclusive counting
- **Phase 47-02**: Drag selection reuses two-click state machine transitions (no new states); Pointer Events API with preventDefault for text selection prevention
- **Phase 47-03**: Presets property uses attribute: false (boolean | DateRangePreset[]); duration text takes priority over selectionStatus in footer; container query stacks presets horizontally at <600px
- **Phase 47-04**: Use selectionTarget ('primary' | 'comparison') state to route all interactions; primary range takes visual precedence on overlapping days; pipe-delimited format for dual-range form submission; amber/orange CSS custom properties for comparison range
- **Phase 47-05**: CSS custom properties for comparison dark mode (cascades through Shadow DOM); :host-context(.dark) nested inside @container queries; presets excluded from JSX attributes (attribute: false)
- **Phase 48-01**: Store time internally as 24-hour (TimeValue.hour 0-23), convert to 12h only for display
- **Phase 48-01**: Use regex for ISO time parsing (date-fns parseISO does not support time-only strings)
- **Phase 48-01**: Time preset resolver functions called at click time for SSR safety
- **Phase 48-02**: Type-ahead buffer uses 750ms timeout with immediate apply at 2 digits
- **Phase 48-02**: AM/PM toggle preserves display hour, converts via to24Hour utility
- **Phase 48-02**: Wrapping arithmetic uses modulo for clean boundary handling (23->0, 12->1, 59->0)
- **Phase 48-03**: SVG viewBox 240x240 with center (120,120), outer radius 100, inner radius 55 for clock face
- **Phase 48-03**: Inner/outer ring threshold at 70% of outer radius for 24h ring detection
- **Phase 48-03**: Clock hand rendered before numbers in SVG for correct paint order (text on top)
- **Phase 48-04**: WAI-ARIA Listbox pattern (role=listbox/option) for dropdown time selection
- **Phase 48-04**: CSS custom properties --ui-time-picker-* with fallback to --ui-input-* for theming
- **Phase 48-04**: TimeDropdown is internal component (no custom element registration), composed by parent
- **Phase 48-05**: TimePicker popup uses Floating UI fixed strategy with same middleware as date-picker (offset/flip/shift)
- **Phase 48-05**: Click-outside uses pointerdown + composedPath().includes(this) for Shadow DOM compatibility
- **Phase 48-05**: Tab focus trap cycles back to TimeInput hour spinbutton; Enter on spinbuttons confirms and closes
- **Phase 48-05**: hour12 auto-detected from locale via getDefaultHourCycle when not explicitly set
- **Phase 48-06**: CSS classes on SVG elements for dark mode (attribute selectors don't match var() inline attrs)
- **Phase 48-06**: Internal components self-register in their own files (imported via side-effect imports in index.ts)
- **Phase 48-06**: presets property excluded from JSX attributes (attribute: false, JS-only)
- **Phase 49-02**: Use Intl.DateTimeFormat exclusively for timezone conversion (no hardcoded offsets)
- **Phase 49-02**: Primary timezone defaults to browser local via resolvedOptions().timeZone
- **Phase 49-02**: role="status" for screen reader timezone display updates
- **Phase 49-02**: CSS custom properties --ui-time-picker-timezone-* for timezone theming
- **Phase 49-04**: CSS scroll-snap handles all physics (no JS momentum/spring)
- **Phase 49-04**: scrollend event with debounce fallback for older browsers
- **Phase 49-04**: Padding items above/below allow first/last items to center in highlight
- **Phase 49-01**: Business hours indicator uses small green dot (r=3) below hour numbers on clock face
- **Phase 49-01**: Step-aware minute mode renders only step-interval labels as major labels
- **Phase 49-01**: _snapToInterval returns modulo 60 to handle boundary wrapping
- **Phase 49-01**: 12h business hours check uses current AM/PM context from this.hour >= 12
- **Phase 49-05**: Progressive enhancement: voice input renders nothing when Speech API unavailable
- **Phase 49-05**: Runtime window access only for SpeechRecognition (never module-level import)
- **Phase 49-05**: Time-only parsing from voice transcript; date references ignored
- **Phase 49-05**: Use any type for SpeechRecognition (runtime-only API, no TS declarations)
- **Phase 49-06**: Wheel and range are standalone interface modes (not added to tabbed 'both' view)
- **Phase 49-06**: JSX event detail type enriched with timeValue: TimeValue | null alongside value string

### Pending Todos

None yet.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)

**Incomplete docs site:**
- Docs phases 9-12 incomplete (Framework, Theming, Accessibility, Polish)

## Session Continuity

Last session: 2026-02-02 (50-04 complete)
Stopped at: Completed 50-04-PLAN.md (Date Range Picker docs)
Resume file: None
