---
phase: 46-date-range-picker-core
plan: 03
subsystem: ui
tags: lit, date-range-picker, input-field, popup, floating-ui, click-outside, focus-trap, escape, intl-datetimeformat

# Dependency graph
requires:
  - phase: 42
    provides: Calendar component with renderDay callback, DayCellState, display-month, hide-navigation
  - phase: 44-03
    provides: Floating UI pattern (computePosition, flip, shift, offset), click-outside (composedPath), focus trap
  - phase: 46-01
    provides: DateRangePicker class with state machine, range-utils, form integration
  - phase: 46-02
    provides: Dual calendar rendering with range highlighting, navigation
provides:
  - "Input field with Intl.DateTimeFormat display formatting for date ranges"
  - "Calendar popup with Floating UI fixed strategy positioning"
  - "Click-outside detection via composedPath() for Shadow DOM compatibility"
  - "Focus trap (Tab preventDefault) and Escape key handling with view drilling respect"
  - "Focus restoration to trigger element on popup close"
affects: 46-04, 46-05 (keyboard navigation, exports)

# Tech tracking
tech-stack:
  added: []
  patterns: ["Floating UI fixed strategy with offset(4)/flip(top-start)/shift(8)", "composedPath().includes(this) for Shadow DOM click-outside", "Tab preventDefault + refocus calendar for focus trap", "Intl.DateTimeFormat for range display formatting", "readonly input as popup trigger (no typing)"]

key-files:
  created: []
  modified: [packages/date-range-picker/src/date-range-picker.ts]

key-decisions:
  - "Readonly input (not editable) since users select via calendar not typing"
  - "Input click opens popup; calendar icon toggles popup (stopPropagation to avoid double-fire)"
  - "displayValue getter uses Intl.DateTimeFormat with short month format for range display"
  - "Popup wraps existing dual-calendar layout via renderCalendarContent() extraction"
  - "formResetCallback closes popup for clean form reset behavior"

patterns-established:
  - "Pattern: Readonly input + icon button as popup trigger for range pickers"
  - "Pattern: renderCalendarContent() extracted for reuse (inline mode in future)"

# Metrics
duration: 3min
completed: 2026-01-31
---

# Phase 46 Plan 03: Input Field and Popup Interaction Summary

**Input field with Intl.DateTimeFormat range formatting, Floating UI popup positioning, click-outside, focus trap, and Escape key handling**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-31T20:56:35Z
- **Completed:** 2026-01-31T20:59:49Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added input field with readonly display of formatted range via Intl.DateTimeFormat
- Added displayValue getter: "Jan 15 - Jan 22, 2026" (same year), "Dec 28, 2025 - Jan 5, 2026" (cross-year), "Jan 15, 2026 - ..." (partial)
- Added calendar icon SVG button as popup trigger
- Added popup container wrapping dual-calendar layout with Floating UI positioning
- Implemented computePosition with fixed strategy, offset(4), flip(top-start), shift(8px)
- Added click-outside detection via composedPath().includes(this) for Shadow DOM
- Added focus trap: Tab preventDefault + refocus first calendar in popup
- Added Escape key handler respecting calendar's defaultPrevented for view drilling
- Added focus restoration to trigger element via requestAnimationFrame on close
- Added document listener lifecycle (connectedCallback/disconnectedCallback)
- Added CSS styles for input container, popup, action button, label, helper/error text
- Added dark mode styles for all new UI elements
- Added disabled state prevention (aria-disabled, pointer-events: none)
- Added label with for-id association and required indicator

## Task Commits

Each task was committed atomically:

1. **Task 1: Input field, display formatting, and popup toggle** - `b01fe86` (feat)
2. **Task 2: Floating UI positioning, click-outside, focus trap, Escape** - `b5a9174` (fix)

## Files Created/Modified

- `packages/date-range-picker/src/date-range-picker.ts` - Added input field, popup, Floating UI, click-outside, focus trap, Escape handling, display formatting, CSS styles

## Decisions Made

- Readonly input (not editable) since range picker uses calendar-only selection
- Input click opens popup; calendar icon button toggles (stopPropagation prevents double-fire)
- displayValue uses Intl.DateTimeFormat with short month for compact range display
- Popup wraps calendars via extracted renderCalendarContent() method
- formResetCallback closes popup for clean form reset

## Deviations from Plan

None - plan executed exactly as written. Tasks 1 and 2 were implemented together since popup toggle inherently requires positioning, click-outside, and keyboard handling to function correctly.

## Issues Encountered

None.

## Next Phase Readiness

- Input field and popup interaction complete
- Ready for Plan 04: Keyboard navigation enhancements
- Ready for Plan 05: Exports, JSX types, dark mode finalization

---
*Phase: 46-date-range-picker-core*
*Completed: 2026-01-31*
