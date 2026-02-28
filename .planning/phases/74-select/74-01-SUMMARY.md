---
phase: 74-select
plan: 01
subsystem: ui
tags: [css, tokens, dark-mode, select, tailwind]

# Dependency graph
requires:
  - phase: 69-theme-foundation
    provides: THEME-SPEC.md defining v8.0 monochrome token values and semantic .dark overrides
  - phase: 70-button
    provides: Established pattern of removing hardcoded .dark --ui-*-* token blocks
  - phase: 71-dialog
    provides: Confirmed pattern works for dialog component
  - phase: 72-input
    provides: Confirmed pattern works for input component
  - phase: 73-textarea
    provides: Confirmed pattern works for textarea component
provides:
  - Select dark mode tokens removed from .dark block — semantic cascade drives appearance
  - SEL-01 satisfied: select default styles match v8.0 monochrome theme via double-fallback
affects: [74-select-02, 74-select-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Double-fallback var(--color-*, var(--ui-color-*)) in :root eliminates need for .dark component overrides"

key-files:
  created: []
  modified:
    - packages/core/src/styles/tailwind.css

key-decisions:
  - "Phase 74-01: Select dark mode governed by semantic .dark overrides — hardcoded .dark --ui-select-* declarations removed; double-fallback cascade in :root is sufficient (same pattern as Phase 70-01, 71-01, 72-01, 73-01)"

patterns-established:
  - "Remove .dark --ui-component-* blocks when :root uses double-fallback var(--color-*, var(--ui-color-*))"

requirements-completed: [SEL-01]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 74 Plan 01: Select CSS Token Dark Mode Cleanup Summary

**Removed 20 hardcoded oklch .dark overrides for select component — semantic .dark cascade via double-fallback :root tokens now governs all dark mode appearance**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T03:38:16Z
- **Completed:** 2026-02-28T03:39:01Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Removed `/* Select dark mode */` comment and 20 `--ui-select-*` property declarations from the `.dark` block in `tailwind.css`
- All select dark mode appearance now driven by the semantic `.dark` overrides of `--color-background`, `--color-foreground`, `--color-border`, `--color-muted-foreground`, `--color-ring`, `--color-muted`, `--color-card`, `--color-accent`, `--color-primary`, `--color-secondary`, `--color-secondary-foreground`
- `:root` select tokens with double-fallback pattern remain intact and correct — no changes needed

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove hardcoded select tokens from .dark block in tailwind.css** - `3571948` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `packages/core/src/styles/tailwind.css` - Removed 20 --ui-select-* declarations from .dark block (lines 392-412 per original plan context)

## Before / After

**Before (.dark block contained):**
```css
/* Select dark mode */
--ui-select-bg: oklch(0.10 0 0);
--ui-select-text: oklch(0.985 0 0);
--ui-select-border: oklch(0.37 0 0);
--ui-select-placeholder: oklch(0.55 0 0);
--ui-select-border-focus: oklch(0.71 0 0);
--ui-select-ring: oklch(0.55 0 0);
--ui-select-bg-disabled: oklch(0.18 0 0);
--ui-select-text-disabled: oklch(0.55 0 0);
--ui-select-border-disabled: oklch(0.37 0 0);
--ui-select-dropdown-bg: oklch(0.18 0 0);
--ui-select-dropdown-border: oklch(0.37 0 0);
--ui-select-option-bg-hover: oklch(0.27 0 0);
--ui-select-option-bg-active: oklch(0.27 0 0);
--ui-select-option-text: oklch(0.985 0 0);
--ui-select-option-text-disabled: oklch(0.55 0 0);
--ui-select-option-check: oklch(0.985 0 0);
--ui-select-tag-bg: oklch(0.27 0 0);
--ui-select-tag-text: oklch(0.96 0 0);
--ui-select-checkbox-border: oklch(0.45 0 0);
--ui-select-checkbox-bg-checked: oklch(0.985 0 0);
```

**After (.dark block):** No `--ui-select-*` declarations present. The `.dark` block jumps directly to `/* Switch dark mode */`.

**:root block (unchanged — correct double-fallback pattern):**
```css
--ui-select-bg: var(--color-background, white);
--ui-select-text: var(--color-foreground, var(--ui-color-foreground));
--ui-select-border: var(--color-border, var(--ui-color-border));
/* ... all 20+ tokens use var(--color-*, var(--ui-color-*)) */
```

## Decisions Made
- Phase 74-01: Select dark mode governed by semantic .dark overrides — hardcoded .dark --ui-select-* declarations removed; double-fallback cascade in :root is sufficient (same pattern as Phase 70-01, 71-01, 72-01, 73-01)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Select dark mode token cleanup complete (SEL-01 satisfied)
- Ready for Phase 74-02 (Select docs CSS token table expansion, same pattern as Phase 72-02/73-02)
- Ready for Phase 74-03 (Select SKILL.md update, same pattern as Phase 72-03/73-03)

---
*Phase: 74-select*
*Completed: 2026-02-28*

## Self-Check: PASSED
