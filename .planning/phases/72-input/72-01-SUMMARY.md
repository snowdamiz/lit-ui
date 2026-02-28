---
phase: 72-input
plan: 01
subsystem: ui
tags: [css, tokens, dark-mode, input, tailwind]

# Dependency graph
requires:
  - phase: 69-theme-foundation
    provides: THEME-SPEC.md with v8.0 monochrome token values and semantic .dark override pattern
  - phase: 70-button-01
    provides: Established pattern for removing hardcoded .dark component token overrides
  - phase: 71-dialog-01
    provides: Confirmed double-fallback cascade pattern works correctly for dark mode without explicit component-level .dark overrides
provides:
  - Input dark mode tokens removed from .dark block; semantic cascade now drives dark appearance
affects: [72-input-02, 72-input-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Remove hardcoded oklch .dark component token overrides — semantic .dark { --color-* } cascade sufficient via double-fallback :root pattern"

key-files:
  created: []
  modified:
    - packages/core/src/styles/tailwind.css

key-decisions:
  - "Input dark mode governed by semantic .dark overrides — hardcoded .dark --ui-input-* declarations removed; double-fallback cascade in :root is sufficient (same pattern as Phase 70-01 and Phase 71-01)"

patterns-established:
  - "Pattern: All component dark mode appearance comes from .dark { --color-background, --color-foreground, --color-border, --color-muted-foreground, --color-ring, --color-muted } semantic overrides, not from explicit component-level .dark token declarations"

requirements-completed: [INP-01]

# Metrics
duration: 1min
completed: 2026-02-27
---

# Phase 72 Plan 01: Input CSS Token Dark Mode Cleanup Summary

**Removed 9 hardcoded oklch --ui-input-* overrides from .dark block in tailwind.css so input dark mode inherits via the semantic color cascade**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-28T02:52:43Z
- **Completed:** 2026-02-28T02:53:30Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Removed `/* Input dark mode */` comment and all 9 `--ui-input-*` oklch overrides from the `.dark` block in tailwind.css
- Input dark mode appearance now relies entirely on the semantic `.dark` overrides of `--color-background`, `--color-foreground`, `--color-border`, `--color-muted-foreground`, `--color-ring`, and `--color-muted`
- The `:root` double-fallback pattern (`var(--color-background, white)`) correctly picks up dark values without any explicit input component overrides in `.dark`

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove hardcoded input tokens from .dark block in tailwind.css** - `45af628` (fix)

**Plan metadata:** (docs commit - see below)

## Files Created/Modified

- `packages/core/src/styles/tailwind.css` - Removed `/* Input dark mode */` section (10 lines: 1 comment + 9 `--ui-input-*` oklch declarations) from `.dark` block

## Before / After

**Before (.dark block contained):**
```css
/* Input dark mode */
--ui-input-bg: oklch(0.10 0 0);
--ui-input-text: oklch(0.985 0 0);
--ui-input-border: oklch(0.37 0 0);
--ui-input-placeholder: oklch(0.55 0 0);
--ui-input-border-focus: oklch(0.71 0 0);
--ui-input-ring: oklch(0.55 0 0);
--ui-input-bg-disabled: oklch(0.18 0 0);
--ui-input-text-disabled: oklch(0.55 0 0);
--ui-input-border-disabled: oklch(0.37 0 0);
```

**After (.dark block):** No `--ui-input-*` declarations. Input tokens now inherit dark values via the cascade:
- `--color-background: oklch(0.10 0 0)` in `.dark` → `--ui-input-bg: var(--color-background, white)` resolves correctly
- `--color-foreground: oklch(0.985 0 0)` in `.dark` → `--ui-input-text` resolves correctly
- `--color-border: oklch(0.37 0 0)` in `.dark` → `--ui-input-border`, `--ui-input-border-disabled` resolve correctly
- `--color-muted-foreground: oklch(0.71 0 0)` in `.dark` → `--ui-input-placeholder` resolves (note: border-focus was oklch(0.71) before, now correctly comes from `--color-ring: oklch(0.55 0 0)`)
- `--color-ring: oklch(0.55 0 0)` in `.dark` → `--ui-input-border-focus`, `--ui-input-ring` resolve correctly
- `--color-muted: oklch(0.27 0 0)` in `.dark` → `--ui-input-bg-disabled` resolves correctly (was oklch(0.18) before; oklch(0.27) matches THEME-SPEC.md)

## Decisions Made

- Input dark mode governed by semantic `.dark` overrides — hardcoded `.dark --ui-input-*` declarations removed; double-fallback cascade in `:root` is sufficient (same pattern as Phase 70-01 for Button and Phase 71-01 for Dialog)
- The `:root` block was left completely unchanged — it already matches THEME-SPEC.md exactly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Input CSS token cleanup complete; dark mode tokens now inherit correctly via semantic cascade
- Ready for Phase 72-02 (Input docs update) and Phase 72-03 (Input skill update)

---
*Phase: 72-input*
*Completed: 2026-02-27*
