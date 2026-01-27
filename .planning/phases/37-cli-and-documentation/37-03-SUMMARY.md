---
phase: 37-cli-and-documentation
plan: 03
subsystem: cli
tags: [cli, registry, templates, select, lit]

# Dependency graph
requires:
  - phase: 32-core-select
    provides: Select component implementation that this template references
provides:
  - Select entry in CLI registry.json
  - SELECT_TEMPLATE starter template in templates/index.ts
  - COMPONENT_TEMPLATES map entry for select
affects: [37-04, cli-tests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Minimal starter template for complex components with NPM redirect"

key-files:
  created: []
  modified:
    - packages/cli/src/registry/registry.json
    - packages/cli/src/templates/index.ts

key-decisions:
  - "Starter template pattern for complex components — minimal ~200 line template with NPM redirect JSDoc"
  - "Template includes basic trigger, dropdown, click-outside, keyboard nav — not full features"

patterns-established:
  - "Complex component CLI template: minimal starter + NPM recommendation comment"

# Metrics
duration: 2min
completed: 2026-01-27
---

# Phase 37 Plan 03: CLI Registry Select Entry Summary

**Select added to CLI registry and templates with minimal starter template redirecting to NPM for full features**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-27T05:44:27Z
- **Completed:** 2026-01-27T05:46:30Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Added select entry to registry.json (5th component: button, dialog, input, textarea, select)
- Created SELECT_TEMPLATE with ~200 line minimal starter (trigger, dropdown, keyboard, ARIA)
- Template includes prominent JSDoc directing users to NPM mode for full features
- Added select to COMPONENT_TEMPLATES map so getComponentTemplate('select') returns defined string

## Task Commits

Each task was committed atomically:

1. **Task 1: Add select to registry.json and templates/index.ts** - `cd2ea9c` (feat)

## Files Created/Modified
- `packages/cli/src/registry/registry.json` - Added select component entry with 3 files (select.ts, option.ts, option-group.ts)
- `packages/cli/src/templates/index.ts` - Added SELECT_TEMPLATE export and select entry in COMPONENT_TEMPLATES map

## Decisions Made
- Starter template pattern: ~200 line minimal select with basic trigger/dropdown/keyboard rather than attempting to embed full 1500+ line component
- Template includes NPM recommendation in JSDoc header for users wanting full features (multi-select, combobox, async, virtual scrolling)
- Registry lists 3 files (select.ts, option.ts, option-group.ts) matching the actual package structure
- No dependencies in registry entry since starter template only uses lit basics

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CLI registry now has select entry, closing Gap 1 from VERIFICATION.md
- `lit-ui list` will show select in component listing
- `lit-ui add select` in copy-source mode will return valid starter template
- Ready for Plan 04 (accessibility docs) or phase completion verification

---
*Phase: 37-cli-and-documentation*
*Completed: 2026-01-27*
