---
phase: 87-data-table
plan: "01"
subsystem: ui
tags: [css, dark-mode, tokens, data-table, tailwind, semantic-cascade]

# Dependency graph
requires:
  - phase: 69-theme-foundation
    provides: semantic .dark token overrides (--color-muted, --color-background, etc.) that data-table tokens cascade through
provides:
  - Data Table .dark block pruned to 19 oklch and value-inversion exceptions only; 10 semantic-cascade tokens removed
affects: [88+, data-table dark mode rendering]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Semantic cascade: remove .dark --ui-data-table-* declarations that resolve via .dark semantic color tokens; keep only oklch literals and value inversions as exceptions"

key-files:
  created: []
  modified:
    - packages/core/src/styles/tailwind.css

key-decisions:
  - "Phase 87-01: Data Table dark mode partially governed by semantic .dark cascade — 10 hardcoded .dark --ui-data-table-* declarations (header-bg, row-bg, row-hover-bg, border-color, text-color, header-text, skeleton-base, skeleton-highlight, menu-bg, badge-default-text) removed; 19 exception tokens retained (oklch literals, value inversions, stronger-opacity shadows)"
  - "Phase 87-01: Unlike simpler components, Data Table has 19 dark mode exceptions due to oklch lightness flips (selected-bg 0.97->0.25, selected-hover-bg 0.94->0.28), value inversions (header-hover-bg rgba black->white, overlay-bg rgba white->black), and stronger opacity (sticky-shadow 0.06->0.2, menu-shadow)"

patterns-established:
  - "Data Table dark mode exceptions: retain oklch literals with dark-specific lightness, retain rgba value-inversions (black<->white), retain stronger-opacity shadow variants"

requirements-completed: [DAT-01]

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 87 Plan 01: Data Table Dark Mode Summary

**Data Table `.dark` block pruned from 29 to 19 tokens — 10 semantic-cascade declarations removed, 19 oklch and value-inversion exceptions retained**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T17:33:42Z
- **Completed:** 2026-02-28T17:35:30Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Removed 11 lines from `.dark` block (comment + 10 hardcoded `--ui-data-table-*` declarations)
- Replaced generic "Data Table dark mode" comment with clarifying "Data Table dark mode exceptions (oklch literals and value inversions that cannot cascade)"
- The 10 removed tokens now cascade via `.dark` semantic overrides: `--color-muted`, `--color-background`, `--color-border`, `--color-foreground`, `--color-muted-foreground`, `--color-card`
- Total `ui-data-table` occurrences reduced from 58 to 48 (29 in `:root` + 19 in `.dark`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove cascadeable data-table dark declarations from .dark block** - `a707d57` (fix)

**Plan metadata:** (pending — docs commit)

## Files Created/Modified

- `packages/core/src/styles/tailwind.css` - Removed 10 data-table dark declarations + comment; updated comment for remaining 19 exception tokens

## Decisions Made

- Data Table follows the v8.0 pattern from Phases 70-86 but with more exceptions than simpler components (19 vs typically 0-2)
- Exceptions justified: selected-bg/hover-bg use oklch(0.25/0.28) vs :root oklch(0.97/0.94) — cannot cascade; header-hover-bg inverts rgba(0,0,0,0.05) to rgba(255,255,255,0.05); overlay-bg inverts rgba(255,255,255,0.6) to rgba(0,0,0,0.5); sticky-shadow strengthens from 0.06 to 0.2 opacity; all 10 badge color variants use dark-specific oklch lightness (0.30 bg, 0.80-0.85 text vs :root 0.93 bg, 0.35-0.40 text)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Data Table dark mode cleanup complete (Phase 87-01 done)
- Phase 87-02 (docs) and 87-03 (skill) can now proceed
- Dark mode renders correctly via semantic cascade for applicable tokens

---
*Phase: 87-data-table*
*Completed: 2026-02-28*
