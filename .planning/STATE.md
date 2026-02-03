# Project State: LitUI v7.0 Data Table

## Project Reference

**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

**Current Focus:** Building a full-featured data table for admin dashboards with 100K+ row virtualization, sorting, filtering, inline editing, selection with bulk actions, and column customization.

## Current Position

**Milestone:** v7.0 Data Table
**Phase:** 63 - Filtering & Pagination
**Plan:** 4 of 4 complete - PHASE COMPLETE
**Status:** Phase complete

**Progress:**
```
Milestone: [######--] 78%
Phase:     [##########] 100%
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Plans completed | 12 |
| Requirements satisfied | 38/76 |
| Phases completed | 3/8 |

## Accumulated Context

### Key Decisions
*Decisions made during this milestone. Updated during planning and execution.*

| Decision | Rationale | Phase |
|----------|-----------|-------|
| TanStack Table for state | Headless, Lit-native reactive controller, handles sort/filter/pagination | Research |
| TanStack Virtual for rows | Already used in Select, proven for 100K+ items | Research |
| Fixed 48px row height | Variable heights break virtual scroll performance | Research |
| Container-rendered grid | ARIA IDs work in single shadow root | Research |
| Client/server dual mode | manual=false for local, manual=true for callbacks | Research |
| Type alias for ColumnDef | TanStack's ColumnDef is union type, cannot extend with interface | 61-01 |
| LitUI extensions via meta | Column customizations (editable, filter) go in meta property | 61-01 |
| Re-export TanStack utilities | Developer convenience - single import source | 61-01 |
| Div-based ARIA grid layout | Required for virtualization, native table elements incompatible | 61-02 |
| CSS Grid with minmax() columns | Flexible sizing from column.size or defaults | 61-02 |
| aria-rowindex starts at 1 | Header is row 1, data starts at row 2 per W3C APG | 61-02 |
| Skeleton pulse 1.5s timing | Smooth visual feedback without being distracting | 61-04 |
| Overlay 0.7 opacity | Preserves content visibility during updates | 61-04 |
| Flex container layout | Proper body sizing with virtualization | 61-04 |
| Header cells not focusable | Data rows only in grid navigation per W3C APG | 61-05 |
| Focus outline -2px offset | Stays inside cell boundaries for clean appearance | 61-05 |
| Announcement format | "Row X of Y, ColumnHeader, Column X of Y" for screen readers | 61-05 |
| aria-sort on primary only | Avoid screen reader confusion with multi-sort | 62-01 |
| Priority badge from 2+ | Primary sort has no badge, secondary shows "2", etc. | 62-01 |
| Unsorted indicator visible | Faded bi-directional arrow for discoverability | 62-01 |
| Selection column 48px fixed | Consistent checkbox sizing, no sort/filter/resize | 62-02 |
| Page-level select all | Header checkbox toggles current page, not all data | 62-02 |
| Row ID tracking via rowIdKey | Selection persists across pagination via unique IDs | 62-02 |
| Range via TanStack row model | Virtualization-safe, not DOM indices | 62-03 |
| Filter state via JSON.stringify | Simple change detection for columnFilters + globalFilter | 62-03 |
| FilterType union type | text\|number\|date\|select matches TanStack filter function types | 63-01 |
| Native select for page size | HTML select simpler than lui-select for pagination UI | 63-03 |
| Page reset on filter change | Prevents empty page when filtered results reduce page count | 63-03 |
| 300ms debounce delay | Balance between responsiveness and avoiding excessive re-renders | 63-02 |
| Native button for retry | Simpler than lui-button dependency in error state | 63-04 |
| AbortError silently ignored | Intentional cancellation should not show error state | 63-04 |

### Architecture Notes
*Technical context that spans multiple plans.*

- Data table follows Select pattern: hybrid API with both `columns` property and `<lui-column>` declarative children
- `lui-data-table` owns TanStack controllers (TableController + VirtualizerController)
- Row/cell rendering as templates in container shadow DOM (NOT separate custom elements)
- Scroll architecture: separate containers for header and body with synchronized scrollLeft
- Form integration via ElementInternals (for inline editing validation)
- ColumnDef<TData, TValue> is type alias (not interface) due to TanStack union type structure
- Loading states: loading='loading' shows skeleton, loading='updating' shows overlay
- Keyboard navigation: KeyboardNavigationManager utility handles position calculation, DataTable handles focus
- Sorting: getSortedRowModel for client-side, manualSorting=true for server-side with ui-sort-change events
- Selection: enableRowSelection + getRowId for persistent selection, createSelectionColumn factory for checkbox column
- Range selection: handleRowSelect() with shiftKey parameter, uses getRowRange() with row model
- Filtering: getFilteredRowModel for client-side, manualFiltering=true for server-side with ui-filter-change events
- Pagination: getPaginationRowModel for client-side, manualPagination=true for server-side with ui-pagination-change events
- Filter components: lui-column-text-filter, lui-column-number-filter, lui-column-date-filter, lui-column-select-filter, lui-global-search
- Async data: dataCallback receives (params, signal) returns Promise<DataCallbackResult>, filter changes debounced, pagination/sort immediate

### TODOs
*Items to address that emerged during work.*

*None yet.*

### Blockers
*Issues preventing progress.*

*None.*

### Tech Debt (carried forward)
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)
- CalendarMulti exported but unused by other packages
- CLI registry.json incorrect time-picker->calendar dependency

## Quick Tasks

| ID | Name | Duration | Date |
|----|------|----------|------|
| quick-001 | Cmd+K command palette with full-text search | 2m 55s | 2026-02-02 |

## Session Continuity

### Last Session
*Summary of previous session's work. Updated at session end.*

- Completed 63-04: Async Data Callback Pattern
- Added DataCallback, DataCallbackParams, DataCallbackResult types
- Implemented fetchData with AbortController cancellation
- Added debounced fetch for filter changes (300ms default)
- Added error state rendering with retry button
- Phase 63 (Filtering & Pagination) complete

### Next Actions
*Clear starting point for next session.*

1. Plan Phase 64: Inline Editing
2. Research contenteditable vs input-based cell editing
3. Design edit mode state management

### Open Questions
*Unresolved questions needing user input.*

*None.*

---
*State initialized: 2026-02-02*
*Last updated: 2026-02-03*
