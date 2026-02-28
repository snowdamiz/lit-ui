---
phase: 87-data-table
plan: "02"
subsystem: ui
tags: [data-table, css-vars, docs, tailwind, oklch]

# Dependency graph
requires:
  - phase: 87-data-table-01
    provides: Data Table dark mode cleanup establishing correct :root token cascade
provides:
  - dataTableCSSVars array with 35 entries matching tailwind.css :root exactly
  - All color token defaults use double-fallback var() form or exact oklch/rgba values
  - Badge tokens (10 color variants) and structural tokens fully documented
affects: [87-data-table-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Double-fallback var() form for color tokens: var(--color-X, var(--ui-color-X))"
    - "oklch() literal values for selected-bg and badge color tokens (no semantic fallback)"
    - "color-mix() for editing-bg and banner-bg component defaults"

key-files:
  created: []
  modified:
    - apps/docs/src/pages/components/DataTablePage.tsx

key-decisions:
  - "87-02: dataTableCSSVars expanded from 18 stale entries to 35 accurate entries — all color defaults use double-fallback var() form or exact oklch/rgba matching tailwind.css :root; selected-bg uses oklch(0.97 0.01 250) not rgba(59,130,246,0.1); banner-bg uses color-mix() form matching component default; 17 previously missing tokens (sticky-shadow, menu-bg, menu-shadow, editable-hover-bg, editing-bg, 12 badge tokens) added"

patterns-established:
  - "Pattern: Color tokens in CSS vars docs use double-fallback var(--color-X, var(--ui-color-X)) form matching tailwind.css :root exactly (same as Phases 72-86)"
  - "Pattern: oklch literal values for tokens without semantic color fallback (selected-bg, badge variants)"
  - "Pattern: color-mix() for tokens that blend primary with background (editing-bg, banner-bg)"

requirements-completed: [DAT-02]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 87 Plan 02: Data Table CSS Vars Docs Summary

**dataTableCSSVars expanded from 18 stale entries to 35 accurate entries — all color defaults match tailwind.css :root with double-fallback var() form; selected-bg and badge tokens use exact oklch values; 17 previously missing tokens documented**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T17:33:44Z
- **Completed:** 2026-02-28T17:35:43Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Replaced all stale hex literals (`#f4f4f5`, `#ffffff`, `#09090b`, `#71717a`, `#e4e4e7`, `#eff6ff`) with double-fallback `var(--color-X, var(--ui-color-X))` form
- Fixed `selected-bg` from `rgba(59, 130, 246, 0.1)` to `oklch(0.97 0.01 250)` and `selected-hover-bg` from `rgba(59, 130, 246, 0.15)` to `oklch(0.94 0.02 250)` matching tailwind.css :root exactly
- Added 17 previously missing tokens: `sticky-shadow`, `menu-bg`, `menu-shadow`, `editable-hover-bg`, `editing-bg`, `badge-default-bg`, `badge-default-text`, and all 10 badge color variant tokens (green, blue, red, yellow, purple bg/text)
- Fixed `banner-bg` from `#eff6ff` to `color-mix(in oklch, var(--color-primary, var(--ui-color-primary)) 8%, var(--color-background, white))` matching component default
- Fixed `overlay-bg` from `rgba(255, 255, 255, 0.7)` to `rgba(255, 255, 255, 0.6)` matching tailwind.css :root

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace dataTableCSSVars with 35-entry accurate array** - `68d861d` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `apps/docs/src/pages/components/DataTablePage.tsx` - `dataTableCSSVars` array expanded from 18 to 35 entries with corrected defaults

## Decisions Made

- Followed same double-fallback var() pattern established across Phases 72-86 for all semantic color tokens
- oklch literal values used for tokens without semantic color fallback (`selected-bg`, `selected-hover-bg`, all badge color variants) — matches tailwind.css :root exactly
- `color-mix()` form used for `editing-bg` and `banner-bg` — these blend primary color with background, consistent with component defaults in data-table.ts

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Data Table docs CSS vars table now accurate and complete with 35 entries
- Ready for Phase 87-03 (Data Table SKILL.md CSS token documentation update)

---
*Phase: 87-data-table*
*Completed: 2026-02-28*
