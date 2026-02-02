---
phase: 49-time-picker-advanced
plan: 04
subsystem: time-picker
tags: [scroll-wheel, css-scroll-snap, mobile, ios-style]
dependency-graph:
  requires: [48-01]
  provides: [time-scroll-wheel-component]
  affects: [49-06]
tech-stack:
  added: []
  patterns: [css-scroll-snap, scrollend-with-debounce-fallback]
key-files:
  created:
    - packages/time-picker/src/time-scroll-wheel.ts
  modified: []
decisions:
  - CSS scroll-snap handles all physics (no JS momentum/spring)
  - scrollend event with debounce fallback for older browsers
  - Padding items above/below allow first/last items to center in highlight
  - ReturnType<typeof setTimeout> for cross-environment timer compatibility
metrics:
  duration: 1 min
  completed: 2026-02-02
---

# Phase 49 Plan 04: Scroll Wheel Component Summary

iOS-style scroll wheel time picker using CSS scroll-snap with hour/minute/AM-PM columns, scrollend detection, and debounce fallback for older browsers.

## What Was Done

### Task 1: Create TimeScrollWheel component with CSS scroll-snap columns

Created `lui-time-scroll-wheel` internal component with:

- **Three scroll columns**: hour (0-23 or 1-12), minute (step-configurable), and optional AM/PM
- **CSS scroll-snap**: `scroll-snap-type: y mandatory` with `scroll-snap-align: center` on each item
- **Highlight row**: Centered indicator with border lines and subtle background, positioned at 50% via CSS transform
- **Opacity fade**: Non-selected items at 0.4 opacity, selected at 1.0 with 600 font-weight
- **scrollend detection**: Native `scrollend` event with 200ms `setTimeout` debounce fallback when `'onscrollend' in window` is false
- **Padding items**: 2 empty items rendered above and below real items so first/last can center in highlight
- **Dark mode**: `:host-context(.dark)` selectors for item text, highlight borders, and separator

Key implementation details:
- `ITEM_HEIGHT = 40px`, `VISIBLE_ITEMS = 5` (200px container height)
- `_scrollColumnTo()` calculates scrollTop from item index + padding offset
- `_handleScrollEnd()` reads `Math.round(scrollTop / ITEM_HEIGHT)` and clamps to valid range
- `_emitChange()` converts 12h selection via `to24Hour()` before dispatching `ui-scroll-wheel-change`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed setTimeout return type for cross-environment compatibility**
- **Found during:** Task 1 type checking
- **Issue:** `window.setTimeout` caused TS error `Property 'setTimeout' does not exist on type 'never'` due to environment type resolution
- **Fix:** Used bare `setTimeout` with `ReturnType<typeof setTimeout>` for Map type
- **Files modified:** packages/time-picker/src/time-scroll-wheel.ts
- **Commit:** ff0e8f0

## Verification

1. `npx tsc --noEmit` passes with no type errors
2. File contains scroll-snap CSS, scrollend handling, ITEM_HEIGHT constant, and wheel-container class
3. Component dispatches `ui-scroll-wheel-change` event with `{ value: TimeValue }`

## Next Phase Readiness

- TimeScrollWheel is ready for composition by TimePicker in Plan 06 (interface-mode="wheel")
- No blockers for downstream plans
