---
phase: 44-date-picker-core
plan: 02
subsystem: date-picker
tags: [lit, web-components, date-picker, form-integration, elementinternals, calendar-popup]
depends_on:
  requires: [44-01]
  provides: [lui-date-picker component with input, popup, form integration]
  affects: [44-03, 44-04, 44-05]
tech-stack:
  added: []
  patterns: [ElementInternals form association, calendar popup composition, text input parsing, CSS custom properties with dark mode]
key-files:
  created:
    - packages/date-picker/src/date-picker.ts
  modified:
    - packages/date-picker/src/index.ts
decisions:
  - Use absolute positioning for popup as placeholder; Plan 03 upgrades to Floating UI
  - Popup renders lui-calendar directly (composed, not slotted)
  - Calendar change event listened on element directly (composed event crosses shadow DOM)
  - Escape key checks defaultPrevented to avoid closing popup during calendar view drilling
metrics:
  duration: 5 min
  completed: 2026-01-31
---

# Phase 44 Plan 02: DatePicker Component Core Summary

**One-liner:** DatePicker component with input field, calendar popup, text parsing via parseDateInput, clear button, and ISO 8601 form submission via ElementInternals

## What Was Built

Created the main `lui-date-picker` component (`packages/date-picker/src/date-picker.ts`) that composes an input field with `lui-calendar` inside a popup container. The component handles all primary user interactions:

1. **Input field** with locale-aware placeholder text (MM/DD/YYYY or DD/MM/YYYY)
2. **Calendar popup** renders `lui-calendar` when open, with date selection handling
3. **Text input parsing** on blur via `parseDateInput()` from Plan 01
4. **Clear button** (X icon) when value exists, resets all state
5. **Calendar icon button** to toggle popup open/close
6. **Form integration** via `ElementInternals.setFormValue()` with ISO 8601 values
7. **Validation** for required, min-date, and max-date constraints
8. **Dark mode** via `:host-context(.dark)` with CSS custom property fallbacks

## Key Implementation Details

- **Class:** `DatePicker extends TailwindElement` with `static formAssociated = true`
- **Properties:** value, name, locale, placeholder, helper-text, min-date, max-date, required, disabled, error, label
- **State:** open, displayValue, inputValue, isEditing, touched, internalError
- **Form callbacks:** `formResetCallback()`, `formDisabledCallback()`
- **Events:** Dispatches `change` with `{ date: Date | null, isoString: string }` detail
- **Keyboard:** Enter blurs input (triggers parse), Escape closes popup or blurs, ArrowDown opens popup
- **Popup Escape handling:** Checks `e.defaultPrevented` to respect calendar view drilling (year/decade views handle Escape internally)

## Commits

| Hash | Type | Description |
|------|------|-------------|
| ae8c8b9 | feat | Create DatePicker component with input, calendar popup, and form integration |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Plan 03 (Floating UI positioning) can proceed immediately. The popup currently uses `position: absolute` as a placeholder. The `inputContainerEl` and `popupEl` query refs are already in place for Floating UI's `computePosition()`. Plan 04 (focus management) has `triggerElement` pre-wired for focus restoration.
