---
phase: 68-package-cli-documentation
plan: 01
subsystem: packaging
tags: [npm, package-json, peer-dependencies, jsx, tsx, react, vue, svelte, custom-elements, collision-detection]

# Dependency graph
requires:
  - phase: 67
    provides: All data table features complete (export, expandable rows)
  - phase: 66
    provides: Cell renderers, row actions, bulk actions
  - phase: 65
    provides: Inline editing, row editing
  - phase: 64
    provides: Column resize, reorder, visibility, preferences
  - phase: 63
    provides: Filtering, pagination, async data
  - phase: 62
    provides: Sorting, selection
  - phase: 61
    provides: Core data table, TanStack integration, virtual scrolling
provides:
  - Complete package.json with all 4 peer dependencies (lit, @lit-ui/core, @lit-ui/checkbox, @lit-ui/popover)
  - Element registration with collision detection pattern in index.ts
  - HTMLElementTagNameMap declaration in index.ts
  - Comprehensive jsx.d.ts with 44 properties and 14 events for React, Vue, Svelte
affects: [68-02, 68-03, 68-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Collision detection registration: customElements.get guard before define (matches accordion/tabs pattern)"
    - "JSX attribute/event split: LuiDataTableAttributes for properties, LuiDataTableEvents for event handlers"
    - "Svelte on: event prefix pattern for typed CustomEvent handlers"

key-files:
  created: []
  modified:
    - packages/data-table/package.json
    - packages/data-table/src/index.ts
    - packages/data-table/src/data-table.ts
    - packages/data-table/src/jsx.d.ts

key-decisions:
  - "Element registration moved from data-table.ts to index.ts with collision detection"
  - "isServer imported from lit (not @lit-ui/core) for registration guard, matching accordion pattern"
  - "JSX properties use kebab-case for HTML attributes, camelCase for JS-only properties (attribute: false)"
  - "14 events included (13 from JSDoc + ui-select-all-requested for server-side pagination)"

patterns-established:
  - "Data table follows same registration pattern as all other LitUI components"

# Metrics
duration: 4min
completed: 2026-02-05
---

# Phase 68 Plan 01: Package Finalization & JSX Declarations Summary

**npm package peer dependencies, collision detection element registration, and comprehensive JSX/TSX type declarations for all 44 properties and 14 events across React, Vue, and Svelte**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-05T18:05:04Z
- **Completed:** 2026-02-05T18:09:09Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added @lit-ui/checkbox and @lit-ui/popover as peerDependencies and devDependencies in package.json
- Moved element registration from data-table.ts to index.ts with collision detection (customElements.get guard)
- Rewrote jsx.d.ts from 69-line placeholder to 330-line comprehensive type declarations
- LuiDataTableAttributes interface covers all 44 @property declarations grouped by feature area
- LuiDataTableEvents interface covers all 14 custom events with typed CustomEvent details
- React JSX via DetailedHTMLProps, Vue via DefineComponent, Svelte via on: event handlers
- TypeScript compilation and vite build both pass with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix package.json and update element registration** - `951fc77` (feat)
2. **Task 2: Complete JSX/TSX type declarations** - `a8cb3a9` (feat)

## Files Modified

- `packages/data-table/package.json` - Added @lit-ui/checkbox and @lit-ui/popover to peerDependencies and devDependencies
- `packages/data-table/src/index.ts` - Added isServer import, collision detection registration block, HTMLElementTagNameMap
- `packages/data-table/src/data-table.ts` - Removed element registration and HTMLElementTagNameMap (moved to index.ts)
- `packages/data-table/src/jsx.d.ts` - Complete rewrite with 44 properties, 14 events, React/Vue/Svelte support

## Decisions Made

- **Collision detection pattern:** Matches accordion/tabs index.ts exactly -- `customElements.get` guard before `customElements.define`, DEV-only warning for duplicates
- **isServer from lit:** Direct import from `lit` for the registration guard, separate from the re-export of isServer from `@lit-ui/core`
- **JSX attribute naming:** HTML attributes use kebab-case (e.g., `'row-height'`), JS-only properties use camelCase (e.g., `rowActions`, `dataCallback`)
- **14 events vs 13:** Included `ui-select-all-requested` (server-side pagination select-all) in addition to the 13 JSDoc-listed events

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 68-01 complete: package.json, element registration, and JSX declarations finalized
- Ready for 68-02 (CLI registry), 68-03 (CLI template), 68-04 (documentation page)
- Build and TypeScript compilation verified passing

---
*Phase: 68-package-cli-documentation*
*Completed: 2026-02-05*
