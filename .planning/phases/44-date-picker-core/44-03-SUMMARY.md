---
phase: 44-date-picker-core
plan: 03
subsystem: date-picker
tags: [floating-ui, popup-positioning, click-outside, shadow-dom]
depends_on: [44-02]
provides: [floating-ui-positioning, click-outside-detection]
affects: [44-04, 44-05]
tech-stack:
  added: []
  patterns: [floating-ui-fixed-positioning, composedPath-click-outside]
key-files:
  created: []
  modified:
    - packages/date-picker/src/date-picker.ts
decisions:
  - id: dp-popup-fixed
    description: "Popup uses Floating UI fixed strategy with offset(4), flip to top-start, shift with 8px padding"
  - id: dp-click-outside
    description: "Click-outside uses composedPath().includes(this) for Shadow DOM compatibility"
metrics:
  duration: 2 min
  completed: 2026-01-31
---

# Phase 44 Plan 03: Popup Positioning and Click-Outside Summary

Floating UI fixed positioning with flip/shift middleware and composedPath() click-outside detection for the date picker calendar popup.

## What Was Done

### Task 1: Add Floating UI positioning for calendar popup
- Imported `computePosition`, `flip`, `shift`, `offset` from `@floating-ui/dom`
- Added `positionPopup()` private method using fixed strategy with bottom-start placement
- Middleware chain: `offset(4)` for 4px gap, `flip({ fallbackPlacements: ['top-start'] })` for viewport flip, `shift({ padding: 8 })` for horizontal clipping
- Updated popup CSS from `position: absolute` with `top: 100%` and `margin-top` to `position: fixed` (coordinates set by Floating UI)
- Updated `openPopup()` to await `updateComplete` then call `positionPopup()`
- **Commit:** `98e6fbe`

### Task 2: Add click-outside detection with composedPath()
- Added `handleDocumentClick` arrow function that checks `composedPath().includes(this)` for Shadow DOM traversal
- Added `connectedCallback()` override registering document click listener (guarded with `isServer`)
- Added `disconnectedCallback()` override removing document click listener (guarded with `isServer`)
- **Commit:** `94d1b4f`

## Decisions Made

1. **Fixed positioning strategy** - Matches lui-select pattern; avoids clipping in scrollable containers
2. **composedPath() for click-outside** - Required for Shadow DOM; regular `event.target` doesn't cross shadow boundaries

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- Build succeeds without errors
- Floating UI imports present (computePosition, flip, shift, offset)
- positionPopup() uses fixed strategy with bottom-start placement
- Click-outside handler uses composedPath().includes(this)
- Listeners added in connectedCallback, removed in disconnectedCallback

## Next Phase Readiness

Plan 04 (keyboard navigation and focus management) can proceed. The popup open/close infrastructure and trigger element tracking are in place.
