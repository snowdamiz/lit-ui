---
phase: 42-calendar-display-foundation
plan: 09
subsystem: calendar-keyboard-navigation
tags: [roving-tabindex, imperative-dom, keyboard-navigation, accessibility, lit-lifecycle]
dependencies:
  requires: ["42-01", "42-02", "42-03", "42-04", "42-05", "42-06", "42-07", "42-08"]
  provides: ["Imperative roving tabindex via KeyboardNavigationManager"]
  affects: ["42-10"]
tech-stack:
  added: []
  patterns: ["Imperative DOM tabindex via Lit lifecycle (firstUpdated/updated + requestAnimationFrame)"]
key-files:
  created: []
  modified: ["packages/calendar/src/calendar.ts"]
key-decisions:
  - "Remove tabindex from Lit template entirely to prevent declarative/imperative race"
  - "Convert focusedIndex and navigationManager from @state() to private to avoid re-render on focus"
  - "Use requestAnimationFrame in firstUpdated and updated for post-render tabindex setup"
duration: 2 min
completed: 2026-01-31
---

# Phase 42 Plan 09: Imperative Roving Tabindex Summary

Fixed roving tabindex race condition by removing declarative tabindex from Lit template and managing it entirely via KeyboardNavigationManager in lifecycle methods.

## Performance

- **Duration:** 2 minutes
- **Started:** 2026-01-31T03:37:43Z
- **Completed:** 2026-01-31T03:39:54Z
- **Tasks:** 4/4
- **Files modified:** 1

## Accomplishments

1. Removed `tabindex=${isFocused ? '0' : '-1'}` from renderDayCell template to eliminate declarative/imperative race condition
2. Converted `focusedIndex` and `navigationManager` from `@state()` to plain private properties so focus changes do not trigger Lit re-renders
3. Added `firstUpdated()` lifecycle for initial tabindex setup after first render
4. Added `requestAnimationFrame` in `updated()` for post-render tabindex on month changes
5. Verified all 6 navigation directions use `moveFocus()` for imperative DOM updates
6. Build passes with all changes

## Task Commits

| # | Task | Commit | Type |
|---|------|--------|------|
| 1 | Remove tabindex from renderDayCell template | `2cf1b14` | fix |
| 2 | Convert focusedIndex/navigationManager from @state() to private | `b57325e` | fix |
| 3 | Add imperative tabindex in firstUpdated and updated lifecycle | `60b1a30` | feat |
| 4 | Verify and document imperative tabindex flow in handleKeyDown | `274e94e` | refactor |

## Files Modified

- `packages/calendar/src/calendar.ts` - Removed template tabindex, converted state properties, added lifecycle tabindex management, documented imperative flow

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Remove tabindex from template entirely | Prevents Lit declarative render from overwriting imperative DOM tabindex updates |
| Convert focusedIndex to non-reactive | Focus tracking must not trigger re-renders that would reset imperative tabindex |
| Also convert navigationManager to non-reactive | Same reasoning - manager instance changes should not trigger re-renders |
| Add firstUpdated() for initial tabindex | Template has no tabindex, so first render needs imperative setup |
| Use requestAnimationFrame for post-render | Ensures Lit render cycle fully completes before DOM manipulation |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added firstUpdated() lifecycle for initial render**

- **Found during:** Task 3
- **Issue:** Without tabindex in template and no firstUpdated(), cells would have no tabindex after first render
- **Fix:** Added firstUpdated() with initializeNavigationManager() + requestAnimationFrame
- **Files modified:** packages/calendar/src/calendar.ts
- **Commit:** 60b1a30

**2. [Rule 1 - Bug] Removed @state() from navigationManager**

- **Found during:** Task 2
- **Issue:** navigationManager had @state() decorator causing unnecessary re-renders when manager was initialized
- **Fix:** Converted to plain private property
- **Files modified:** packages/calendar/src/calendar.ts
- **Commit:** b57325e

**3. [Rule 1 - Bug] Removed unused isFocused variable**

- **Found during:** Task 4
- **Issue:** isFocused was calculated but never used after tabindex removal
- **Fix:** Removed unused variable to prevent lint warnings
- **Files modified:** packages/calendar/src/calendar.ts
- **Commit:** 274e94e

## Issues Encountered

None.

## Next Phase Readiness

- **42-10 (Screen reader announcements):** Ready to proceed. Roving tabindex is now fully imperative, providing a stable foundation for focus-based announcements.
- **No blockers** for remaining gap closure work.
