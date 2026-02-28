---
phase: 79-date-picker
plan: 02
subsystem: ui
tags: [lit, web-components, css-tokens, date-picker, docs]

# Dependency graph
requires:
  - phase: 79-01
    provides: Date Picker .dark block cleared — :root 21 tokens unchanged

provides:
  - DatePickerPage.tsx datePickerCSSVars expanded to 21 entries with correct tailwind.css :root defaults

affects: [79-03, date-picker skill]

# Tech tracking
tech-stack:
  added: []
  patterns: [CSS token docs expanded to match tailwind.css :root exactly — double-fallback var() for color tokens, exact literals for structural tokens]

key-files:
  created: []
  modified:
    - apps/docs/src/pages/components/DatePickerPage.tsx

key-decisions:
  - "Date Picker docs CSS token table expanded from 12 to 21 entries matching tailwind.css :root; border-focus, radius, border-width excluded (not in :root; inherited via --ui-input-* fallbacks)"
  - "Color token defaults use double-fallback var(--color-*, var(--ui-color-*)) form; popup-shadow uses exact literal; z-index is '40'"

patterns-established:
  - "CSS docs table includes only tokens declared in tailwind.css :root, not component-internal fallback tokens"

requirements-completed: [DTP-02]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 79 Plan 02: Date Picker CSS Token Docs Summary

**datePickerCSSVars expanded from 12 stale hex-default entries to 21 entries matching tailwind.css :root with double-fallback var() color defaults**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T05:50:02Z
- **Completed:** 2026-02-28T05:51:05Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced 12 stale token entries (hardcoded hex values like `white`, `#d1d5db`, `#3b82f6`) with 21 entries from tailwind.css :root
- All color token defaults now use double-fallback `var(--color-*, var(--ui-color-*))` form for correct light/dark cascade
- Added 9 previously missing tokens: label-text, ring, popup-shadow, hover-bg, disabled-bg, disabled-border, helper-text, action-text, preset-text, preset-hover-bg, preset-hover-border, z-index
- Removed 3 non-:root tokens (border-focus, radius, border-width) — these are not part of the public token API as they are inherited from --ui-input-* fallbacks in the component

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand datePickerCSSVars to 21 entries with correct defaults** - `3f85da7` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `apps/docs/src/pages/components/DatePickerPage.tsx` - datePickerCSSVars array replaced: 12 stale entries → 21 entries matching tailwind.css :root

## Decisions Made
- Excluded `--ui-date-picker-border-focus`, `--ui-date-picker-radius`, and `--ui-date-picker-border-width` from the docs table — these are used by `date-picker.ts` with `var(--ui-input-*)` fallbacks but are NOT declared in `tailwind.css :root`, so they are not part of the public override API
- Followed tailwind.css :root ordering for the 21 entries
- `popup-shadow` uses an exact literal string value (not a var() reference) matching the :root declaration

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 79-02 complete: docs CSS token table is now authoritative and aligned with tailwind.css :root
- Ready for Phase 79-03 (Date Picker SKILL.md CSS token expansion)

---
*Phase: 79-date-picker*
*Completed: 2026-02-28*
