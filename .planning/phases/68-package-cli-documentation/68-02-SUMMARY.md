---
phase: 68-package-cli-documentation
plan: 02
subsystem: cli
tags: [cli, registry, template, copy-source, data-table, tanstack, starter]

# Dependency graph
requires:
  - phase: 68-01
    provides: Package finalization with peer deps and element registration
provides:
  - CLI registry entry for data-table with TanStack dependencies
  - Starter copy-source template (310 lines) with sorting, CSS variable fallbacks, ARIA grid
  - npm install mapping (data-table -> @lit-ui/data-table)
  - COMPONENT_TEMPLATES entry for CLI consumption
affects: [68-03, 68-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Starter template pattern: self-contained component with npm recommendation for full features (matches Select)"
    - "CSS double fallback: --ui-data-table-* -> --color-* -> literal hex value"
    - "Private CSS custom properties (--_*) for internal reuse within shadow DOM"

key-files:
  created:
    - packages/cli/src/templates/data-table.ts
  modified:
    - packages/cli/src/registry/registry.json
    - packages/cli/src/templates/index.ts
    - packages/cli/src/utils/install-component.ts

key-decisions:
  - "data-table placed after calendar in registry.json (alphabetical among d-components)"
  - "TanStack packages as dependencies (required for copy-source mode even in starter)"
  - "checkbox and popover as registryDependencies (used by full version, declared for completeness)"
  - "Single file entry in registry since starter is self-contained"

patterns-established:
  - "Data table CLI follows same starter template pattern as Select"

# Metrics
duration: 6min
completed: 2026-02-05
---

# Phase 68 Plan 02: CLI Registry & Starter Template Summary

**CLI registry entry for data-table with TanStack dependencies, 310-line starter template with single-column sorting, CSS variable double fallbacks, and ARIA grid pattern**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-05T18:05:05Z
- **Completed:** 2026-02-05T18:11:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added data-table to CLI registry.json with @tanstack/lit-table and @tanstack/lit-virtual dependencies
- Declared checkbox and popover as registryDependencies for full dependency chain
- Mapped data-table to @lit-ui/data-table in install-component.ts for npm install mode
- Created 310-line starter template with basic table rendering, single-column sort cycling (none/asc/desc)
- Template includes 6 CSS custom properties with double fallbacks (component -> theme -> literal)
- Sort icons with SVG arrow, opacity/rotation transitions for visual feedback
- Striped row styling with color-mix() for even rows and hover highlighting
- Loading state with animated skeleton rows (1.5s pulse timing)
- Empty state with "No data available" message
- ARIA grid pattern with role="grid", aria-sort, aria-rowcount, aria-busy
- Keyboard-accessible sortable headers with focus-visible outline
- Registered DATA_TABLE_TEMPLATE export and COMPONENT_TEMPLATES entry in index.ts
- CLI TypeScript compilation passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CLI registry entry and npm mapping** - `62d9a42` (feat)
2. **Task 2: Create starter template and register in template index** - `5f5dd81` (feat)

## Files Modified

- `packages/cli/src/registry/registry.json` - Added data-table component entry with TanStack dependencies and checkbox/popover registryDependencies
- `packages/cli/src/utils/install-component.ts` - Added data-table -> @lit-ui/data-table npm mapping
- `packages/cli/src/templates/data-table.ts` - New 310-line starter template with sorting, CSS variables, ARIA grid, skeleton loading
- `packages/cli/src/templates/index.ts` - Added DATA_TABLE_TEMPLATE export, import, and COMPONENT_TEMPLATES entry

## Decisions Made

- **Registry placement:** data-table inserted after calendar (alphabetical among d-prefixed components), before date-picker
- **TanStack as dependencies:** Even the starter template conceptually needs TanStack packages installed; declaring them in registry ensures copy-source mode installs them
- **checkbox/popover as registryDependencies:** Full data-table uses these; declaring them maintains complete dependency graph even though starter does not use them
- **Single registry file entry:** Starter is self-contained in one file, unlike Select which has option/option-group sub-components

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 68-02 complete: CLI registry and starter template finalized
- Ready for 68-03 (documentation page) and 68-04 (remaining CLI/docs work)
- TypeScript compilation verified passing

---
*Phase: 68-package-cli-documentation*
*Completed: 2026-02-05*
