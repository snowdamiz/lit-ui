---
phase: 67-export-expandable-rows
plan: 02
subsystem: ui
tags: [lit, data-table, expandable-rows, tanstack-table, virtualizer, accordion, detail-panel]

# Dependency graph
requires:
  - phase: 67-01
    provides: CSV export, _prefix column exclusion pattern
  - phase: 66
    provides: Cell renderers, row actions, bulk actions, unified actions column
  - phase: 65
    provides: Inline editing, row editing, renderRowEditActions
provides:
  - createExpandColumn factory with chevron toggle and ARIA attributes
  - expandColumnStyles CSS for toggle, icon rotation, detail panel
  - renderDetailPanel helper for accessible detail content rendering
  - DetailContentRenderer type alias and ExpandedChangeEvent interface
  - DataTable renderDetailContent property enabling expandable rows
  - DataTable expanded property for controlled expand state
  - DataTable singleExpand attribute for accordion mode
  - Virtualizer dynamic measurement via measureElement for expanded rows
  - ui-expanded-change event for two-way binding
affects: [68-package-cli-documentation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Column factory pattern reuse (createExpandColumn follows createSelectionColumn)"
    - "Virtual row wrapper div for dynamic height measurement"
    - "enforceSingleExpand interceptor for accordion mode"
    - "Conditional measureElement on virtualizer for expand support"

key-files:
  created:
    - packages/data-table/src/expandable-rows.ts
  modified:
    - packages/data-table/src/types.ts
    - packages/data-table/src/data-table.ts
    - packages/data-table/src/index.ts

key-decisions:
  - "Expand column ID uses _expand prefix, consistent with _selection and _actions for utility column exclusion"
  - "Row data typed as `any` for row parameter in DetailContentRenderer public API for simplicity"
  - "Virtual row wrapper div used for both virtualized and non-virtualized render paths"
  - "measureElement only enabled when renderDetailContent is set (avoids overhead for fixed-height tables)"

patterns-established:
  - "virtual-row-wrapper: Container div wrapping data-row + detail-panel for virtualizer measurement"
  - "enforceSingleExpand: Interceptor pattern for constraining TanStack state updates"

# Metrics
duration: 5min
completed: 2026-02-05
---

# Phase 67 Plan 02: Expandable Detail Rows Summary

**Expandable detail rows with chevron toggle, detail panel rendering, single-expand accordion mode, controlled state, and virtualizer dynamic measurement**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-05T17:26:57Z
- **Completed:** 2026-02-05T17:31:35Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created expandable-rows.ts module with createExpandColumn factory, expandColumnStyles CSS, and renderDetailPanel helper
- Added DetailContentRenderer type alias and ExpandedChangeEvent interface to types.ts
- Integrated full expanding support into DataTable: renderDetailContent property, expanded state, singleExpand accordion mode
- Updated virtualizer to use measureElement for dynamic row heights when expanding is enabled
- Both virtualized and SSR fallback render paths support expandable rows with detail panels
- Added ui-expanded-change event for controlled state management

## Task Commits

Each task was committed atomically:

1. **Task 1: Create expandable-rows.ts module and add expand types** - `8e5b7f0` (feat)
2. **Task 2: Integrate expanding into DataTable with virtualizer dynamic measurement** - `092da9b` (feat)

## Files Created/Modified

- `packages/data-table/src/expandable-rows.ts` - Expand column factory, styles, and detail panel helper (new)
- `packages/data-table/src/types.ts` - DetailContentRenderer type, ExpandedChangeEvent interface
- `packages/data-table/src/data-table.ts` - Full DataTable integration (properties, table options, render paths, virtualizer, events)
- `packages/data-table/src/index.ts` - Re-exports for createExpandColumn, expandColumnStyles, renderDetailPanel

## Decisions Made

- **Expand column _expand prefix:** Consistent with existing _selection and _actions utility column naming, automatically excluded from CSV export
- **DetailContentRenderer row typed as `any`:** Public API simplicity; consumers can import Row from TanStack if strong typing needed
- **virtual-row-wrapper for all paths:** Both renderVirtualizedBody and renderAllRows wrap row+detail in container div for consistent layout
- **Conditional measureElement:** Only added to virtualizer options when renderDetailContent is set, avoiding overhead for fixed-height tables

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 67 (Export & Expandable Rows) is complete: both CSV export (67-01) and expandable rows (67-02) are done
- All 85+ requirements from the data table milestone are satisfied
- Ready for Phase 68: Package, CLI & Documentation (PKG-01 to PKG-06, CLI-01 to CLI-06)

---
*Phase: 67-export-expandable-rows*
*Completed: 2026-02-05*
