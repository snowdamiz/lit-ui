---
phase: 85-accordion
plan: "02"
subsystem: ui
tags: [accordion, css-tokens, docs, tailwind]

# Dependency graph
requires:
  - phase: 85-accordion-01
    provides: Accordion dark mode cleanup (accordion :root tokens authoritative)
provides:
  - Accurate accordionCSSVars array with 14 entries matching tailwind.css :root
  - Double-fallback var() form for all 5 color token defaults
  - --ui-accordion-gap token documented in AccordionPage.tsx
  - cssVarsCode example using semantic token references
affects: [85-accordion-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [double-fallback var(--color-X, var(--ui-color-X)) for color token defaults in docs CSS var arrays]

key-files:
  created: []
  modified:
    - apps/docs/src/pages/components/AccordionPage.tsx

key-decisions:
  - "Phase 85-02: accordionCSSVars expanded from 13 to 14 entries — added missing --ui-accordion-gap token (default: 0); all 5 color token defaults corrected from single var() to double-fallback var(--color-X, var(--ui-color-X)) form matching tailwind.css :root; cssVarsCode example updated from rgba(0,0,0,0.05) to var(--color-accent, var(--ui-color-accent))"

patterns-established:
  - "Double-fallback var(--color-X, var(--ui-color-X)) for all color token defaults in CSSVarDef arrays (same pattern as Phases 72-02, 73-02, 74-02, 75-02, 77-02, 78-02, 79-02, 80-02, 82-02, 83-02, 84-02)"

requirements-completed: [ACC-02]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 85 Plan 02: Accordion Docs CSS Token Defaults Summary

**accordionCSSVars corrected from 13 stale entries to 14 accurate entries — added missing --ui-accordion-gap, fixed 5 color tokens to double-fallback var() form, updated cssVarsCode to semantic token references**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T08:28:24Z
- **Completed:** 2026-02-28T08:29:12Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added missing `--ui-accordion-gap` token (default: `0`) to accordionCSSVars array (was absent from docs, present in tailwind.css :root)
- Fixed 5 color token defaults from single `var(--color-X)` to double-fallback `var(--color-X, var(--ui-color-X))` form: border, header-text, header-hover-bg, panel-text, ring
- Updated `cssVarsCode` example to replace `rgba(0, 0, 0, 0.05)` with `var(--color-accent, var(--ui-color-accent))` semantic token reference
- Array count badge in UI now shows 14 (was 13)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update accordionCSSVars array and cssVarsCode example** - `193fa42` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `/Users/sn0w/Documents/dev/lit-components/apps/docs/src/pages/components/AccordionPage.tsx` - accordionCSSVars expanded to 14 entries with double-fallback color defaults; cssVarsCode updated to semantic token reference

## Decisions Made
- Phase 85-02: accordionCSSVars expanded from 13 to 14 entries — added missing --ui-accordion-gap token (default: 0); all 5 color token defaults corrected from single var() to double-fallback var(--color-X, var(--ui-color-X)) form matching tailwind.css :root; cssVarsCode example updated from rgba(0,0,0,0.05) to var(--color-accent, var(--ui-color-accent))

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Accordion docs CSS token table complete and accurate (14 entries)
- Ready for Phase 85-03: Accordion SKILL.md CSS token defaults update

---
*Phase: 85-accordion*
*Completed: 2026-02-28*
