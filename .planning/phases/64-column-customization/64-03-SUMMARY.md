---
phase: 64-column-customization
plan: 03
subsystem: ui
tags: [data-table, tanstack, column-reorder, drag-drop, sticky-column]

# Dependency graph
requires:
  - phase: 64-01
    provides: Column resize with drag handles
  - phase: 64-02
    provides: Column visibility picker
provides:
  - Column reordering via drag-and-drop in headers
  - Sticky first column during horizontal scroll
  - ui-column-order-change event for order changes
  - COL-05, COL-04 requirements satisfied
affects: [64-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TanStack columnOrder state management
    - HTML5 native drag-and-drop events
    - CSS position:sticky for pinned column

key-files:
  created: []
  modified:
    - packages/data-table/src/data-table.ts
    - packages/data-table/src/types.ts

key-decisions:
  - "Native drag events over dnd-kit (simpler, no dependency, headers-only drag)"
  - "Disable drag during resize to prevent conflicts"
  - "Sticky column z-index: 11 for header, 2 for body (above sticky header row)"
  - "Shadow hint on sticky edge for visual depth cue"

patterns-established:
  - "handleDragStart/DragOver/DragLeave/Drop/DragEnd methods"
  - "data-dragging attribute on host for global cursor styling"
  - "is-dragging and drop-target classes for visual feedback"
  - "reflect: true on stickyFirstColumn for CSS :host selector"

# Metrics
duration: 8min
completed: 2026-02-03
---

# Phase 64 Plan 03: Column Reorder via Drag-and-Drop, Sticky First Column Summary

**Native drag-and-drop column reordering in headers with visual feedback, plus sticky first column during horizontal scroll**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-03T23:06:00Z
- **Completed:** 2026-02-03T23:14:00Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- Column reordering via drag-and-drop between column headers (COL-05)
- Visual feedback during drag: dragged column fades, drop target highlights with border
- Sticky first column stays visible during horizontal scroll (COL-04)
- Shadow hint on sticky column edge provides visual depth cue
- Proper z-index layering for sticky header vs sticky column intersection

## Task Commits

Each task was committed atomically:

1. **Task 1: Add column ordering state and TanStack integration** - `87a3891` (feat)
2. **Task 2: Implement drag-and-drop column reorder in headers** - `99cb2de` (feat)
3. **Task 3: Implement sticky first column** - `4c5948d` (feat)

## Files Created/Modified
- `packages/data-table/src/data-table.ts` - Added columnOrder property, enableColumnReorder flag, drag handlers, sticky CSS
- `packages/data-table/src/types.ts` - Added ColumnOrderChangeEvent interface

## Decisions Made
- **Native drag events over dnd-kit** - Headers are simple drag targets, native HTML5 drag works well. dnd-kit would add ~10KB for marginal touch improvement.
- **Disable drag during resize** - Prevents accidental column reorder when clicking near resize handle. Better UX separation.
- **Sticky z-index: 11 for header, 2 for body** - Header intersection needs highest z-index (above header row z-index 10). Body cells only need to be above content.
- **Shadow hint on sticky edge** - Subtle gradient (6% opacity light, 20% dark) provides depth without being distracting.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Column reorder and sticky first column integrated and working
- Ready for 64-04: Column Preferences Persistence (localStorage + callback)
- columnOrder state already wired to TanStack Table

---
*Phase: 64-column-customization*
*Completed: 2026-02-03*
