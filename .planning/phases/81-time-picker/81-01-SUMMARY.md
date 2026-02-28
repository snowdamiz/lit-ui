---
phase: 81-time-picker
plan: 01
subsystem: ui
tags: [css, dark-mode, tokens, tailwind, oklch]

# Dependency graph
requires:
  - phase: 80-date-range-picker
    provides: Established pattern of removing .dark var(--color-gray-*) overrides, keeping only oklch literal exceptions
provides:
  - Time Picker .dark block cleaned — 47 var(--color-gray-*) declarations removed; 6 oklch literal exceptions retained
affects: [81-time-picker-02, 81-time-picker-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [semantic .dark cascade for time-picker tokens; oklch exceptions pattern for literal-color tokens]

key-files:
  created: []
  modified:
    - packages/core/src/styles/tailwind.css

key-decisions:
  - "Time Picker dark mode governed by semantic .dark cascade — 47 hardcoded var(--color-gray-*) declarations removed; 6 oklch literal exceptions kept (option-selected-bg, option-selected-text, business-accent, business-bg, business-hover-bg, wheel-highlight-bg)"

patterns-established:
  - "oklch exceptions pattern: keep .dark overrides only when :root value is a literal oklch color with different lightness (not a var() that cascades through semantic tokens)"

requirements-completed: [TMP-01]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 81 Plan 01: Time Picker Dark Mode Cleanup Summary

**Removed 47 hardcoded .dark --ui-time-picker-* var(--color-gray-*) declarations; retained 6 oklch literal exceptions with new comment**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T06:51:18Z
- **Completed:** 2026-02-28T06:52:06Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Removed "/* Time Picker dark mode */" comment and 47 var(--color-gray-*) declarations from .dark block
- Retained 6 oklch exception tokens (option-selected-bg, option-selected-text, business-accent, business-bg, business-hover-bg, wheel-highlight-bg) with updated comment
- :root 67-token block left completely unchanged
- Total ui-time-picker matches: exactly 73 (67 :root + 6 .dark exceptions) — verified

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove .dark time-picker block (keep 6 oklch exceptions)** - `ec3c848` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `packages/core/src/styles/tailwind.css` - .dark Time Picker block replaced: 53 lines (comment + 47 var overrides + 6 oklch) reduced to 7 lines (comment + 6 oklch exceptions)

## Decisions Made
- Time Picker dark mode is governed entirely by the semantic .dark token cascade — no hardcoded per-component .dark overrides except 6 oklch literal exceptions
- Six oklch exceptions remain because their :root values are literal oklch colors with different light/dark lightness values that cannot cascade through the semantic token system

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- tailwind.css Time Picker .dark block is clean; ready for Phase 81-02 (docs update) and 81-03 (SKILL.md update)
- Pattern established: 73 total ui-time-picker occurrences (67 :root + 6 .dark oklch exceptions)

---
*Phase: 81-time-picker*
*Completed: 2026-02-28*
