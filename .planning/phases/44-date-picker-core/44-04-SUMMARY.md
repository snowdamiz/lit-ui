---
phase: 44-date-picker-core
plan: 04
subsystem: date-picker
tags: [focus-management, validation, accessibility, aria]

dependency-graph:
  requires: [44-03]
  provides: [focus-trap-in-popup, validation-states, aria-attributes]
  affects: [44-05]

tech-stack:
  added: []
  patterns: [focus-trap-via-tab-prevention, requestAnimationFrame-focus-restoration, ElementInternals-validity-sync]

key-files:
  created: []
  modified:
    - packages/date-picker/src/date-picker.ts

decisions:
  - Focus trap uses Tab preventDefault + refocus calendar (no sentinel elements needed)
  - closePopup() handles all focus restoration via requestAnimationFrame
  - handleInputBlur syncs both internalError (display) and ElementInternals validity (form)
  - badInput validity flag used for unparseable date text

metrics:
  duration: 3 min
  completed: 2026-01-31
---

# Phase 44 Plan 04: Focus Management and Validation Summary

Focus trap in popup with Tab key prevention, focus restoration to input on close, and complete validation states with ElementInternals sync for required/badInput/rangeUnderflow/rangeOverflow.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Focus management for popup open/close | eb85566 | focusCalendar(), Tab trap in handlePopupKeydown, closePopup() restores focus |
| 2 | Validation states with inline errors | 7832c07 | badInput/valueMissing/rangeUnderflow/rangeOverflow in handleInputBlur, validate() in updated/handleCalendarSelect, aria-errormessage |

## Decisions Made

1. **Focus trap approach**: Tab/Shift+Tab trapped by calling `preventDefault()` and refocusing the calendar element. No sentinel/dummy focusable elements needed since the calendar manages its own internal keyboard navigation.

2. **Focus restoration timing**: Uses `requestAnimationFrame` in `closePopup()` to ensure DOM updates complete before focusing the trigger element.

3. **Validation dual-track**: `handleInputBlur` sets both `internalError` (for visual display) and `ElementInternals.setValidity()` (for form participation) in each validation branch, ensuring consistency between display and form state.

4. **badInput for unparseable text**: When `parseDateInput()` returns null, the component sets `badInput: true` on ElementInternals, matching the HTML5 validity model.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] Focus moves into calendar when popup opens
- [x] Tab/Shift+Tab trapped within popup
- [x] Focus returns to input when popup closes
- [x] Required empty field shows error after blur
- [x] Min/max date violations show range errors
- [x] Invalid text shows badInput error
- [x] aria-invalid and aria-errormessage properly set
- [x] Package builds without errors

## Next Phase Readiness

Plan 44-05 (package exports/JSX types/stories) can proceed. Focus management and validation are complete, providing the full interactive date picker behavior needed for documentation and testing.
