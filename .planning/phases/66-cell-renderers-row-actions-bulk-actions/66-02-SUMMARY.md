---
phase: 66-cell-renderers-row-actions-bulk-actions
plan: 02
subsystem: ui
tags: [lit, data-table, row-actions, cell-renderers, custom-events, kebab-menu]

# Dependency graph
requires:
  - phase: 66-01
    provides: "cell-renderers.ts, row-actions.ts, types.ts with RowAction/BulkAction"
provides:
  - "DataTable rowActions property with unified actions column rendering"
  - "ui-row-action event dispatch with actionId and row data"
  - "hoverRevealActions CSS-based hover-reveal for row actions"
  - "Cell renderer and row action exports from package entry point"
affects: ["66-03 bulk actions toolbar", "docs site data table examples"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Unified actions column: row actions + row edit in single 72px column"
    - "hasActionsColumn getter unifies rowActions and enableRowEditing"
    - "Special 'edit' actionId bridges row actions to row edit mode"

key-files:
  created: []
  modified:
    - "packages/data-table/src/data-table.ts"
    - "packages/data-table/src/index.ts"

key-decisions:
  - "Unified actions column renders either row actions or edit controls, never both simultaneously"
  - "Special 'edit' actionId in handleRowAction bridges to activateRowEdit when enableRowEditing is true"
  - "row-actions-content wrapper div enables hover-reveal CSS targeting"

patterns-established:
  - "hasActionsColumn getter: single source of truth for actions column presence"
  - "handleRowAction dispatches ui-row-action with composed:true for shadow DOM crossing"

# Metrics
duration: 3min
completed: 2026-02-05
---

# Phase 66 Plan 02: DataTable Row Actions Integration Summary

**Unified actions column in DataTable with rowActions property, ui-row-action events, hover-reveal CSS, and full package exports for cell renderers and row actions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-05T08:08:44Z
- **Completed:** 2026-02-05T08:11:30Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments
- DataTable gains `rowActions` property and `hoverRevealActions` attribute for row-level action buttons
- Unified actions column handles all combinations: row actions only, row editing only, or both (row actions in view mode, save/cancel in edit mode)
- `ui-row-action` CustomEvent dispatches with actionId, row data, and rowId
- Special `edit` action ID bridges to row edit mode activation
- All 7 cell renderer factories, row action utilities, and new types exported from `@lit-ui/data-table`

## Task Commits

Each task was committed atomically:

1. **Task 1: Integrate row actions into DataTable component** - `1fde0ad` (feat)
2. **Task 2: Export cell renderers and row actions from index.ts** - `4aa62f7` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `packages/data-table/src/data-table.ts` - Added rowActions/hoverRevealActions properties, hasActionsColumn getter, handleRowAction method, unified actions column rendering in header/body/virtualized body, cellRendererStyles + rowActionsStyles in static styles, updated keyboard nav bounds and ARIA colCount
- `packages/data-table/src/index.ts` - Added exports for cell-renderers.ts (7 factories + type + styles) and row-actions.ts (renderRowActions + 3 pre-built factories + kebabIcon + styles)

## Decisions Made
- Unified actions column renders either row actions or edit controls, never both simultaneously -- isRowEditing always takes priority showing save/cancel
- Special `edit` actionId in handleRowAction bridges to activateRowEdit when enableRowEditing is true, allowing developers to include createEditAction() in their rowActions array
- Added `row-actions-content` wrapper div inside the gridcell to enable hover-reveal CSS targeting via `:host([hover-reveal-actions]) .row-actions-content`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Row actions fully integrated and exported, ready for Plan 03 (bulk actions toolbar)
- All cell renderer styles active in DataTable shadow DOM
- Hover-reveal mode functional via `hover-reveal-actions` attribute with keyboard and touch fallbacks

---
*Phase: 66-cell-renderers-row-actions-bulk-actions*
*Completed: 2026-02-05*
