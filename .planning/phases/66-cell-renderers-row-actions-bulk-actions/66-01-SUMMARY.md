---
phase: 66-cell-renderers-row-actions-bulk-actions
plan: 01
subsystem: ui
tags: [lit, tanstack-table, cell-renderers, row-actions, data-table, intl, svg]

# Dependency graph
requires:
  - phase: 65-inline-editing
    provides: "Standalone render function pattern (inline-editing.ts), row actions column pattern (72px), RowEditEvent types"
provides:
  - "RowAction, BulkAction, RowActionEvent, BulkActionEvent type interfaces"
  - "7 built-in cell renderer factories (text, number, date, boolean, badge, progress, avatar)"
  - "CellRenderer type alias compatible with TanStack CellContext"
  - "renderRowActions function with inline/kebab branching"
  - "Pre-built action factories: createViewAction, createEditAction, createDeleteAction"
  - "cellRendererStyles and rowActionsStyles CSS including dark mode"
affects:
  - 66-02 (row actions integration into DataTable)
  - 66-03 (bulk actions integration into DataTable)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cell renderer factory pattern: function returning CellRenderer<TData, TValue>"
    - "Row action factory pattern: function returning RowAction<TData>"
    - "Inline vs kebab branching based on visible action count (1-2 inline, 3+ kebab)"
    - "Hover-reveal CSS via :host([hover-reveal-actions]) with visibility/opacity transition"

key-files:
  created:
    - packages/data-table/src/cell-renderers.ts
    - packages/data-table/src/row-actions.ts
  modified:
    - packages/data-table/src/types.ts

key-decisions:
  - "Cell renderers as factory functions returning CellRenderer type, not custom elements"
  - "Row action inline/kebab threshold at 2 actions"
  - "lui-popover for kebab dropdown (top-layer avoids scroll clipping)"
  - "Pre-built actions use SVG icon constants, not external icon library"

patterns-established:
  - "CellRenderer<TData, TValue> type alias for TanStack cell functions"
  - "Factory function pattern for pre-built row actions"
  - "Hover-reveal mode via host attribute and CSS transitions"

# Metrics
duration: 3min
completed: 2026-02-05
---

# Phase 66 Plan 01: Standalone Modules Summary

**7 built-in cell renderer factories (text/number/date/boolean/badge/progress/avatar) with row action rendering (inline + kebab menu) and RowAction/BulkAction type interfaces**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-05T08:01:17Z
- **Completed:** 2026-02-05T08:04:50Z
- **Tasks:** 2/2
- **Files modified:** 3

## Accomplishments
- Extended types.ts with RowAction, BulkAction, RowActionEvent, BulkActionEvent interfaces supporting generics, per-row disabled/hidden, and confirmation dialog config
- Created cell-renderers.ts with 7 factory functions using Intl.NumberFormat/DateTimeFormat for locale-aware formatting, SVG icons for booleans, color-mapped badges, progress bars with ARIA progressbar role, and avatar with initials fallback
- Created row-actions.ts with renderRowActions function that branches between inline buttons (1-2 actions) and lui-popover kebab menu (3+ actions), plus 3 pre-built action factories with SVG icons
- All CSS styles include dark mode overrides, focus-visible outlines, and hover-reveal mode for row actions

## Task Commits

Each task was committed atomically:

1. **Task 1: Add action types to types.ts and create cell-renderers.ts** - `bed8f01` (feat)
2. **Task 2: Create row-actions.ts with rendering and pre-built actions** - `9d55e77` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `packages/data-table/src/types.ts` - Added RowAction, BulkAction, RowActionEvent, BulkActionEvent interfaces; added TemplateResult import from lit
- `packages/data-table/src/cell-renderers.ts` - 7 built-in cell renderer factories, CellRenderer type alias, cellRendererStyles CSS with badge colors and dark mode
- `packages/data-table/src/row-actions.ts` - renderRowActions (inline/kebab), 3 pre-built action factories, rowActionsStyles CSS with hover-reveal and dark mode

## Decisions Made
- Cell renderers as factory functions (not custom elements) matching createSelectionColumn pattern
- Inline/kebab threshold at 2 visible actions (1-2 inline, 3+ kebab dropdown)
- lui-popover for kebab dropdown to leverage top-layer rendering and avoid scroll clipping
- Pre-built action icons as SVG template constants (no external icon dependency)
- Avatar initials fallback uses row.original accessor with explicit nameKey option
- Progress renderer wraps bar in a flex wrapper for optional label alignment

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All standalone modules ready for integration by Plan 02 (row actions into DataTable) and Plan 03 (bulk actions)
- Types are exported from types.ts which is already re-exported via index.ts (`export * from './types.js'`)
- cell-renderers.ts and row-actions.ts need to be added to index.ts exports in Plan 02/03
- No blockers or concerns

---
*Phase: 66-cell-renderers-row-actions-bulk-actions*
*Completed: 2026-02-05*
