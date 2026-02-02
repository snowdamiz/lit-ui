---
phase: 49-time-picker-advanced
plan: 01
subsystem: time-picker
tags: [clock-face, dropdown, interval-snapping, business-hours]
depends_on: [48]
provides: [step-aware-minute-mode, business-hours-indicator, business-hours-dropdown]
affects: [49-06]
tech_stack:
  added: []
  patterns: [interval-snapping, business-hours-highlighting]
key_files:
  created: []
  modified:
    - packages/time-picker/src/clock-face.ts
    - packages/time-picker/src/time-dropdown.ts
decisions:
  - "Business hours indicator uses small green dot (r=3) below hour numbers, not arc segments"
  - "Step-aware minute mode renders only step-interval labels as major labels (same style as i%5 labels)"
  - "_snapToInterval returns modulo 60 to handle boundary wrapping"
  - "12h business hours check uses current AM/PM context from this.hour >= 12"
metrics:
  duration: 2 min
  completed: 2026-02-02
---

# Phase 49 Plan 01: Interval Snapping and Business Hours Highlighting Summary

Step-aware minute snapping via _snapToInterval on ClockFace + business hours green dot indicators on hours and green-bordered dropdown options.

## What Was Done

### Task 1: Step-aware minute rendering and interval snapping (ClockFace)
- Added `step` property (default 1) controlling minute mode behavior
- Added `businessHours` property (`{ start, end } | false`) for visual indicators
- Implemented `_snapToInterval(minute)` that rounds to nearest step interval
- Step-aware `_renderMinuteMode()` renders only labels at step positions when step > 1
- Applied snapping in `_calculateValueFromPointer` for minute mode
- Added `_isBusinessHour(hour24)` helper for range checking
- Business hours green dot indicator in both `_renderHour12` and `_renderHour24`
- CSS custom property `--ui-time-picker-business-hour-accent` with dark mode variant

### Task 2: Business hours highlighting (TimeDropdown)
- Added `businessHours` property matching ClockFace interface
- Conditional `business-hour` CSS class on qualifying time options (hour within range)
- Green left border (3px solid) and tinted background (#f0fdf4 light, #052e16 dark)
- Hover and selected state variants for business hour options
- Full dark mode support via `:host-context(.dark)` selectors

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Green dot indicator (not arc) for business hours on clock | Simpler SVG rendering, clear visual signal without cluttering the clock face |
| Business hour dot positioned below number (y + MARKER_RADIUS + 4) | Avoids overlapping with selection marker circle |
| Hidden when hour is selected | Selected marker already provides visual feedback; dot would be occluded |
| 12h mode uses isPM from this.hour >= 12 | Correctly maps display hours to 24h for business range comparison |

## Verification

- TypeScript compilation: PASS (no errors)
- clock-face.ts contains: step property, _snapToInterval, businessHours, business-indicator CSS
- time-dropdown.ts contains: businessHours property, business-hour CSS class, conditional rendering

## Next Phase Readiness

Plan 49-06 will wire these properties from the parent TimePicker component. Both `step` and `businessHours` are reactive Lit properties ready for attribute/property binding.
