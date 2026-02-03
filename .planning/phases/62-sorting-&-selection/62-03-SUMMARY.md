---
phase: 62-sorting-selection
plan: 03
subsystem: ui
tags: [data-table, selection, range-select, shift-click, selection-banner]

# Dependency graph
requires:
  - phase: 62-sorting-selection
    plan: 02
    provides: Row selection checkbox column
provides:
  - Shift+click range selection (select rows between two clicks)
  - Select-all-across-pages banner when page is fully selected
  - Selection clearing on filter change (configurable)
affects: [63-pagination, 64-bulk-actions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TanStack row model for virtualization-safe range calculation
    - Dataset shiftKey for tracking shift state across events
    - JSON.stringify for filter state change detection

key-files:
  created: []
  modified:
    - packages/data-table/src/data-table.ts
    - packages/data-table/src/selection-column.ts

key-decisions:
  - "Range selection uses TanStack row model (virtualization-safe, not DOM indices)"
  - "Range selection matches state of last selected row (select or deselect range)"
  - "Selection banner appears only when page is fully selected but not all data"
  - "Filter change detection via JSON.stringify comparison"
  - "Selection clearing is configurable via preserve-selection-on-filter"

patterns-established:
  - "handleRowSelect public method for external selection control"
  - "Dataset attribute bridging click to change event for shift state"
  - "Filter state tracking via _previousFilterState"

# Metrics
duration: 6m 47s
completed: 2026-02-03
---

# Phase 62 Plan 03: Advanced Selection Summary

**Shift+click range selection, select-all-across-pages banner, and filter-change clearing**

## Performance

- **Duration:** 6m 47s
- **Started:** 2026-02-03T21:16:16Z
- **Completed:** 2026-02-03T21:23:03Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- Shift+click selects all rows between the last clicked row and current row
- Range is calculated using TanStack row model (virtualization-safe)
- Selection state matches the last selected row's state (select or deselect entire range)
- "Select all X items" banner appears when all page rows are selected
- Banner link toggles all rows selected (client-side) or emits event (server-side ready)
- Selection auto-clears when filters change (configurable via preserve-selection-on-filter)
- Filter change event includes reason: 'filter-changed' for parent awareness

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement shift+click range selection** - `f3536f4` (feat)
2. **Task 2: Add select-all-across-pages banner** - `91fb07f` (feat)
3. **Task 3: Clear selection on filter change** - `c8d73a8` (feat)

## Files Modified
- `packages/data-table/src/data-table.ts` - Range selection, banner, filter clearing
- `packages/data-table/src/selection-column.ts` - Shift key detection

## Decisions Made
- **Range calculation:** Uses TanStack row model `getRowModel().rows` to safely iterate through rows regardless of virtualization - DOM indices would break with virtualized rows
- **Range selection direction:** Both anchor and target rows are included in range, selection state matches whatever the last selected row's state was
- **Banner visibility logic:** Only shows when `isAllPageSelected && selectedCount < totalCount` - hides when nothing selected or all data selected
- **Filter state tracking:** Uses JSON.stringify comparison instead of deep equality for simplicity - handles both columnFilters array and globalFilter string

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## API Reference

### New Properties
- `total-row-count: number` - Total rows across all pages (for server-side pagination)
- `preserve-selection-on-filter: boolean` - Keep selection when filters change (default: false)
- `column-filters: ColumnFiltersState` - Column filter state (Phase 63 placeholder)
- `global-filter: string` - Global filter string (Phase 63 placeholder)

### New Methods
- `handleRowSelect(row: Row<TData>, shiftKey: boolean): void` - Handle row selection with shift support

### New Events
- `ui-select-all-requested` - Fired when "Select all X items" clicked (server-side mode)
  - `detail.totalCount: number` - Total number of rows to select

### Event Updates
- `ui-selection-change` now includes `reason: 'filter-changed'` when selection cleared due to filter changes

## Next Phase Readiness
- Selection features complete: checkbox, range, select-all, filter-clearing
- Ready for Plan 04: Multi-column sorting refinements
- Pagination (Phase 63) can use totalRowCount for banner
- Filters (Phase 63) can leverage columnFilters/globalFilter properties

---
*Phase: 62-sorting-selection*
*Completed: 2026-02-03*
