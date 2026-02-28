---
phase: 70-button
plan: 01
subsystem: ui
tags: [css, design-tokens, dark-mode, button, tailwind]

# Dependency graph
requires:
  - phase: 69-theme-foundation
    provides: THEME-SPEC.md with authoritative token values and dark mode override strategy
provides:
  - Button .dark block cleaned of hardcoded oklch overrides — semantic token cascade now governs dark mode button colors
affects: [70-02, 70-03, any phase that references button dark mode behavior]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Remove .dark --ui-button-* overrides: semantic --ui-color-* cascades via double-fallback pattern without explicit button-level dark overrides"

key-files:
  created: []
  modified:
    - packages/core/src/styles/tailwind.css

key-decisions:
  - "Button dark mode governed entirely by semantic .dark overrides — no --ui-button-* declarations needed in .dark block"
  - "The double-fallback pattern var(--color-primary, var(--ui-color-primary)) in :root is sufficient: when .dark overrides --color-primary, button tokens inherit automatically"

patterns-established:
  - "Dark mode button token inheritance: .dark overrides semantic --color-* tokens; button :root tokens using double-fallback pick these up without explicit button dark overrides"

requirements-completed: [BTN-01]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 70 Plan 01: Button Dark Mode Token Cleanup Summary

**Removed 14 hardcoded oklch button overrides from .dark block — button dark mode now inherits correctly via semantic token cascade**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-28T01:42:32Z
- **Completed:** 2026-02-28T01:43:10Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Removed `/* Button dark mode */` comment and all 14 `--ui-button-*` property declarations from the `.dark` block
- The `.dark` block no longer contains any `--ui-button-*` declarations
- Button dark mode now works correctly via semantic cascade: `.dark` sets `--color-primary: var(--color-brand-50)` (near-white), and `:root --ui-button-primary-bg: var(--color-primary, var(--ui-color-primary))` inherits it automatically
- All 5 button variants (primary, secondary, outline, ghost, destructive) respect the double-fallback contract in dark mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove hardcoded button tokens from .dark block** - `3d3a43b` (fix)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified
- `packages/core/src/styles/tailwind.css` - Removed the `/* Button dark mode */` block (14 property declarations + comment) from the `.dark` selector

## Before / After

**Before (lines 392-406 in .dark block — removed):**
```css
/* Button dark mode */
--ui-button-primary-bg: oklch(0.985 0 0);
--ui-button-primary-text: oklch(0.18 0 0);
--ui-button-secondary-bg: oklch(0.27 0 0);
--ui-button-secondary-text: oklch(0.96 0 0);
--ui-button-secondary-hover-bg: oklch(0.37 0 0);
--ui-button-outline-bg: transparent;
--ui-button-outline-text: oklch(0.985 0 0);
--ui-button-outline-border: oklch(0.37 0 0);
--ui-button-outline-hover-bg: oklch(0.27 0 0);
--ui-button-ghost-bg: transparent;
--ui-button-ghost-text: oklch(0.985 0 0);
--ui-button-ghost-hover-bg: oklch(0.27 0 0);
--ui-button-destructive-bg: oklch(0.55 0.22 25);
--ui-button-destructive-text: white;
```

**After:** These 15 lines (comment + 14 declarations) are fully removed from the `.dark` block.

**Why this is correct:** The `.dark` class already overrides `--color-primary` to `var(--color-brand-50)` (near-white), `--color-secondary` to `var(--color-gray-800)`, etc. The `:root` button tokens use `var(--color-primary, var(--ui-color-primary))`. When the browser is in dark mode (`.dark` class applied), `--color-primary` resolves to near-white, so `--ui-button-primary-bg` automatically becomes near-white without any explicit override. The hardcoded `.dark` button overrides were not only redundant but also bypassed the semantic layer.

## Decisions Made
- Removed all 14 `--ui-button-*` dark mode overrides (including `outline-bg: transparent` and `ghost-bg: transparent` which matched `:root` values — redundant in either case)
- Did not modify `button.ts` component code — only token layer cleanup
- Did not modify `:root` block — it was already correct per THEME-SPEC.md

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Button dark mode token inheritance is now correct via semantic cascade
- Ready for phase 70-02 (button docs) and 70-03 (button skill)
- The pattern established here (removing redundant .dark component overrides) applies as a model for any other components found to have similar issues in phases 71-87

## Self-Check: PASSED

- FOUND: `.planning/phases/70-button/70-01-SUMMARY.md`
- FOUND: `packages/core/src/styles/tailwind.css` (modified)
- FOUND commit: `3d3a43b`
- VERIFIED: 0 occurrences of `ui-button-primary-bg: oklch` in file (was 1 before)
- VERIFIED: All 32 `--ui-button-*` references are in `:root` block, none in `.dark` block

---
*Phase: 70-button*
*Completed: 2026-02-28*
