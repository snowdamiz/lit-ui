---
phase: 81-time-picker
plan: 02
subsystem: ui
tags: [css-custom-properties, time-picker, docs, design-tokens]

# Dependency graph
requires:
  - phase: 81-01
    provides: Time Picker dark mode cleanup — semantic .dark cascade, 6 oklch exceptions retained
provides:
  - timePickerCSSVars array with 67 accurate --ui-time-picker-* entries matching tailwind.css :root
affects: [81-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [double-fallback var() form for color tokens, exact literal values for structural tokens (shadow, z-index, oklch)]

key-files:
  created: []
  modified:
    - apps/docs/src/pages/components/TimePickerPage.tsx

key-decisions:
  - "Phase 81-02: timePickerCSSVars expanded from 20 stale entries (--ui-time-picker-primary, --ui-time-picker-radius, --ui-time-picker-border-focus, --ui-time-picker-bg-disabled, --ui-time-picker-border-width, --ui-time-picker-tab-bg-hover) to 67 accurate --ui-time-picker-* tokens matching tailwind.css :root; cssVarsCode example updated to reference correct token names"

patterns-established:
  - "Token expansion pattern: replace stale hardcoded hex/invalid entries with double-fallback var() form matching tailwind.css :root exactly"
  - "Structural tokens (popup-shadow, z-index, oklch literals) use exact literal string values from :root"

requirements-completed: [TMP-02]

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 81 Plan 02: Time Picker CSS Vars Expansion Summary

**timePickerCSSVars expanded from 20 stale entries (stale names, hardcoded hex defaults) to 67 accurate --ui-time-picker-* tokens matching tailwind.css :root, covering all token groups: core input, popup, tabs, presets, dropdown, spinbutton, clock, voice, range slider, scroll wheel, and timezone**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T06:54:23Z
- **Completed:** 2026-02-28T06:55:46Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced 20-entry stale `timePickerCSSVars` array (containing nonexistent tokens like `--ui-time-picker-primary`, `--ui-time-picker-radius`, `--ui-time-picker-border-focus`, `--ui-time-picker-bg-disabled`, `--ui-time-picker-border-width`, `--ui-time-picker-tab-bg-hover`) with 67 accurate entries from tailwind.css :root
- All color token defaults updated to double-fallback var() form (e.g., `var(--color-background, white)`, `var(--color-foreground, var(--ui-color-foreground))`)
- Structural tokens use exact literal values: `popup-shadow` literal, `z-index: 40`, oklch literals for selected options, business hours, and wheel highlight
- Updated `cssVarsCode` example to remove stale references (`--ui-time-picker-primary`, `--ui-time-picker-radius`, hardcoded `#fafafa`) and use correct token names

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace timePickerCSSVars with 67 accurate entries** - `642a4fb` (feat)

**Plan metadata:** _(to be added in final commit)_

## Files Created/Modified
- `apps/docs/src/pages/components/TimePickerPage.tsx` - `timePickerCSSVars` array replaced (20 -> 67 entries); `cssVarsCode` example updated with correct token names

## Decisions Made
- timePickerCSSVars expanded from 20 stale entries to 67 accurate --ui-time-picker-* tokens matching tailwind.css :root; cssVarsCode example updated to reference correct token names

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 67-entry CSS vars table ready; Phase 81-03 (Time Picker SKILL.md) can now use this as reference for the skill file token count
- No blockers

---
*Phase: 81-time-picker*
*Completed: 2026-02-28*

## Self-Check: PASSED

- FOUND: apps/docs/src/pages/components/TimePickerPage.tsx
- FOUND: .planning/phases/81-time-picker/81-02-SUMMARY.md
- FOUND commit: 642a4fb (feat(81-02): expand timePickerCSSVars from 20 stale entries to 67 accurate --ui-time-picker-* tokens)
