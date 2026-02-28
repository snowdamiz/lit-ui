---
phase: 85-accordion
plan: "01"
subsystem: ui
tags: [css, tailwind, accordion, dark-mode, tokens]

# Dependency graph
requires: []
provides:
  - "Accordion dark mode now fully governed by semantic .dark cascade — no hardcoded var(--color-gray-*) overrides in .dark block"
affects: [85-02, 85-03]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Remove .dark --ui-component-* overrides when :root double-fallback semantic cascade is sufficient"]

key-files:
  created: []
  modified:
    - packages/core/src/styles/tailwind.css

key-decisions:
  - "Phase 85-01: Accordion dark mode governed by semantic .dark cascade — 4 hardcoded .dark --ui-accordion-* declarations removed; double-fallback cascade in :root is sufficient (same pattern as Phases 70-01 through 84-01); no .dark exceptions required (unlike checkbox check-color: white or switch thumb-bg: white)"

patterns-established: []

requirements-completed: [ACC-01]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 85 Plan 01: Accordion Dark Mode Summary

**Accordion dark mode hardcoded overrides removed — 4 .dark --ui-accordion-* declarations deleted; semantic cascade via :root double-fallback var() form is sufficient**

## Performance

- **Duration:** 26s
- **Started:** 2026-02-28T08:28:31Z
- **Completed:** 2026-02-28T08:28:57Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Removed 5 lines (comment + 4 --ui-accordion-* declarations) from the .dark block in tailwind.css
- The .dark block no longer contains any --ui-accordion-* declarations
- The :root block retains all 14 accordion tokens unchanged with double-fallback var() form for color tokens
- Accordion dark mode now cascades correctly via .dark --color-foreground, --color-muted, --color-border, --color-muted-foreground

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove accordion dark mode declarations from .dark block** - `574b7dc` (fix)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `packages/core/src/styles/tailwind.css` - Removed 5 lines from .dark block: comment + --ui-accordion-header-text, --ui-accordion-header-hover-bg, --ui-accordion-border, --ui-accordion-panel-text

## Decisions Made
- Accordion dark mode governed by semantic .dark cascade — 4 hardcoded .dark --ui-accordion-* declarations removed; double-fallback cascade in :root is sufficient (same pattern as Phases 70-01 through 84-01); no .dark exceptions required (unlike checkbox check-color: white or switch thumb-bg: white)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Accordion CSS token style cleanup complete; ready for Phase 85-02 (docs) and 85-03 (skill)
- All 14 :root accordion tokens intact with correct double-fallback var() form

---
*Phase: 85-accordion*
*Completed: 2026-02-28*
