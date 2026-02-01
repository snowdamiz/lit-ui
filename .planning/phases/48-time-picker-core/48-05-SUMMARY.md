---
phase: 48-time-picker-core
plan: 05
subsystem: ui
tags: lit, time-picker, form-integration, floating-ui, popup, validation, presets, elementinternals

# Dependency graph
requires:
  - phase: 48-01
    provides: TimeValue, parseTimeISO, timeToISO, formatTimeForDisplay, getDefaultHourCycle, isEndTimeAfterStart
  - phase: 48-02
    provides: TimeInput spinbutton component
  - phase: 48-03
    provides: ClockFace SVG component
  - phase: 48-04
    provides: TimeDropdown listbox component
provides:
  - TimePicker main component composing TimeInput, ClockFace, and TimeDropdown
  - Form participation via ElementInternals (ISO 8601 HH:mm:ss submission)
  - Validation: required, minTime, maxTime, end-after-start with allowOvernight
  - Floating UI popup positioning with flip/shift/offset
  - Preset buttons (Now + Morning/Afternoon/Evening)
  - Timezone label display
  - Full keyboard support (Enter confirms, Escape cancels, Tab trapped)
affects: 48-06 (exports, dark mode, JSX types)

# Tech tracking
tech-stack:
  added: []
  patterns: [Floating UI popup positioning, ElementInternals form association, composedPath click-outside, Tab focus trap, interface tabs pattern]

key-files:
  created: [packages/time-picker/src/time-picker.ts]
  modified: [packages/time-picker/src/index.ts]

key-decisions:
  - "Popup uses Floating UI fixed strategy with offset(4), flip to top-start, shift with 8px padding (consistent with date-picker)"
  - "Click-outside uses pointerdown + composedPath().includes(this) for Shadow DOM compatibility"
  - "Tab focus trap cycles back to TimeInput hour spinbutton (no sentinel elements)"
  - "Enter on spinbuttons confirms and closes; buttons excluded to prevent double-action"
  - "touched state set on closePopup() for validation display timing"
  - "hour12 auto-detected from locale via getDefaultHourCycle when not explicitly set"

# Metrics
duration: 4 min
completed: 2026-01-31
---

# Phase 48 Plan 05: Main TimePicker Component Summary

Public-facing lui-time-picker component orchestrating input display, popup with clock face/dropdown interface switching, form integration via ElementInternals, validation (required/min/max/end-after-start), Now + preset buttons, and timezone label display.

## What Was Built

### Task 1: Main component structure with input display and popup
- Created `TimePicker` class extending TailwindElement with `static formAssociated = true`
- Input display area with formatted time, timezone label, clear button, and clock toggle
- Popup with TimeInput spinbuttons, tabbed interface (Clock/List), ClockFace and TimeDropdown
- Floating UI positioning: `computePosition` with `offset(4)`, `flip(['top-start'])`, `shift({ padding: 8 })`, fixed strategy
- Click-outside via `pointerdown` listener with `composedPath().includes(this)`
- Clock face flow: hour selection -> auto-switch to minute mode -> auto-close on minute select
- Now button + configurable preset buttons (Morning/Afternoon/Evening defaults)
- Exported TimePicker, ClockFace, and TimeDropdown from package index

### Task 2: Form integration, validation, and keyboard confirmation
- `updateFormValue()` calls `setFormValue(value || null)` with ISO 8601 HH:mm:ss
- `validate()` checks: required (valueMissing), minTime (rangeUnderflow), maxTime (rangeOverflow), end-after-start
- Human-readable error messages with locale-aware time formatting
- Form lifecycle: `formResetCallback`, `formDisabledCallback`, `formStateRestoreCallback`
- Enter key on spinbuttons confirms value and closes popup (buttons exempt)
- Escape closes popup without changing value
- Tab trapped within popup, cycles focus to hour spinbutton
- `touched` state set on popup close for validation display timing

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Floating UI fixed strategy with same middleware as date-picker | Consistent popup behavior across date/time pickers |
| pointerdown (not click) for outside detection | More immediate response, consistent with plan spec |
| Tab focus trap with focusTimeInput() | Simple approach matching date-picker Tab-to-calendar pattern |
| Enter exempt on buttons | Prevents double-action (button click + popup close) |
| hour12 auto-detect from locale | Sensible default; explicit prop overrides |
| touched on closePopup() | Validation errors shown after first interaction only |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

1. `npx tsc --noEmit` - clean, no type errors
2. TimePicker class exported from time-picker.ts and index.ts
3. `static formAssociated = true` with `attachInternals()` guarded by `!isServer`
4. `setFormValue` called with ISO 8601 HH:mm:ss on every value change
5. `validate()` checks required, minTime, maxTime, end-after-start
6. Popup positioned via Floating UI with flip/shift middleware
7. Clock face and dropdown both available with tab switching
8. Presets render with Now + Morning/Afternoon/Evening buttons
9. Enter confirms, Escape cancels, Tab trapped, focus managed

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `packages/time-picker/src/time-picker.ts` | 1211 | Main TimePicker component |
| `packages/time-picker/src/index.ts` | 6 | Package exports (added TimePicker, ClockFace, TimeDropdown) |

## Next Phase Readiness

Plan 48-06 (dark mode, exports, JSX types) can proceed. All components are exported and the main TimePicker is complete with full form integration.
