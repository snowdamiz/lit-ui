# Project State: LitUI v7.0 Data Table

## Project Reference

**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

**Current Focus:** Building a full-featured data table for admin dashboards with 100K+ row virtualization, sorting, filtering, inline editing, selection with bulk actions, and column customization.

## Current Position

**Milestone:** v7.0 Data Table
**Phase:** 68 - Package, CLI & Documentation (in progress)
**Plan:** 2 of 4 complete
**Status:** In progress
**Last activity:** 2026-02-05 - Completed 68-02-PLAN.md

**Progress:**
```
Milestone: [#########-] 93%
Phase:     [#####-----] 50%
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Plans completed | 26 |
| Requirements satisfied | 85/85 |
| Phases completed | 7/8 |

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
| Column picker as function | Allows flexible placement in different toolbar layouts | 64-02 |
| Toolbar slots for extensibility | toolbar-start and toolbar-end slots for custom controls | 64-02 |
| columnResizeMode: 'onChange' | Real-time preview during drag, better UX than 'onEnd' | 64-01 |
| 50px minimum column width | Prevents columns from becoming too narrow (COL-03) | 64-01 |
| Auto-fit visible rows only | Virtualization limitation - off-screen rows not in DOM | 64-01 |
| Native drag events over dnd-kit | Headers are simple drag targets, no need for 10KB library | 64-03 |
| Disable drag during resize | Prevents conflicts between resize and reorder gestures | 64-03 |
| Sticky z-index 11 for header, 2 for body | Header intersection highest, body just above content | 64-03 |
| 300ms debounce for prefs | Matches existing debounce, prevents excessive storage writes | 64-04 |
| Version field in prefs | Enables future migration of stored preferences | 64-04 |
| Load respects explicit props | Only apply stored prefs if current state is empty | 64-04 |
| Callback + event for prefs | Flexibility for imperative and declarative usage | 64-04 |
| Native inputs in edit cells | LitUI components exceed 48px row height; native inputs are compact | 65-01 |
| Standalone edit render functions | Separate module keeps DataTable manageable, functions are testable | 65-01 |
| Double-commit guard pattern | _isCommitting flag prevents Enter+blur race condition | 65-01 |
| Auto-focus with text selection | rAF + focus() + select() for instant edit readiness | 65-01 |
| _tableInstance stored in render | Edit methods need table access outside render cycle | 65-02 |
| Cancel (not commit) on cell switch | Avoids unintended saves when clicking another editable cell | 65-02 |
| Loose equality for value comparison | Handles type coercion between string input values and numeric originals | 65-02 |
| Row edit pending values map | Immutable updates for reactive rendering, not direct mutation | 65-03 |
| Validate ALL fields before save | Row-level save validates every editable column before dispatching event | 65-03 |
| 72px row actions column | Fixed width fits pencil button or save+cancel button pair | 65-03 |
| updateRowEditValue for row inputs | Individual cell inputs update pending state, not commit directly | 65-03 |
| Cell renderers as factory functions | Not custom elements; matches createSelectionColumn pattern, no element overhead | 66-01 |
| Inline/kebab threshold at 2 actions | 1-2 visible actions render inline buttons, 3+ get kebab dropdown | 66-01 |
| lui-popover for kebab dropdown | Top-layer rendering avoids scroll container clipping | 66-01 |
| Pre-built action icons as SVG constants | No external icon library dependency | 66-01 |
| Unified actions column for row actions + edit | Single 72px column renders either row actions or edit controls based on state | 66-02 |
| Special 'edit' actionId bridges to row edit | handleRowAction activates row edit mode when actionId='edit' and enableRowEditing=true | 66-02 |
| row-actions-content wrapper for hover-reveal | CSS targets .row-actions-content for opacity transitions via :host([hover-reveal-actions]) | 66-02 |
| Native confirmation dialog for bulk actions | Native HTML elements avoid lui-dialog dependency overhead, matches project pattern | 66-03 |
| Bulk toolbar replaces selection banner | Toolbar provides superset functionality (count, select-all, clear, actions) | 66-03 |
| alertdialog role for confirmation | Correct ARIA role for confirmations requiring user response | 66-03 |
| Utility column _ prefix exclusion | All columns with _ prefix excluded from CSV export (covers _selection, _actions, _expand) | 67-01 |
| Selected-only empty fallback | selectedOnly=true with no selection falls back to all filtered rows | 67-01 |
| Expand column _expand prefix | Consistent with _selection and _actions utility column naming pattern | 67-02 |
| DetailContentRenderer row as any | Public API simplicity; consumers import Row from TanStack for strong typing | 67-02 |
| virtual-row-wrapper for expand | Container div wraps data-row + detail-panel for virtualizer measurement | 67-02 |
| Conditional measureElement | Only enabled when renderDetailContent set, avoids overhead for fixed-height | 67-02 |
| Collision detection registration | customElements.get guard before define in index.ts, matching accordion/tabs pattern | 68-01 |
| JSX kebab/camelCase split | HTML attributes use kebab-case, JS-only properties use camelCase in JSX declarations | 68-01 |
| 14 events in JSX declarations | 13 JSDoc events + ui-select-all-requested for complete server-side pagination support | 68-01 |
| Starter template for CLI copy-source | Self-contained 310-line template with sorting, matching Select starter pattern | 68-02 |
| TanStack packages as CLI registry deps | Copy-source mode needs @tanstack/lit-table and @tanstack/lit-virtual installed | 68-02 |
| CSS double fallback in starter | --ui-data-table-* -> --color-* -> literal hex, with private --_* vars for internal reuse | 68-02 |

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
- Column visibility: columnVisibility state + showColumnPicker property, renderColumnPicker function with lui-popover/lui-checkbox
- Toolbar: renderToolbar method with toolbar-start/toolbar-end slots for extensibility
- Column resizing: enableColumnResizing + columnSizing state, TanStack's getResizeHandler() for drag, autoFitColumn() for double-click
- Column ordering: columnOrder state + enableColumnReorder property, native drag events for header reorder
- Sticky column: stickyFirstColumn attribute (reflects to host), CSS position:sticky with proper z-index layering
- Column persistence: persistenceKey for localStorage, onColumnPreferencesChange callback for server-side sync, resetColumnPreferences() method
- Inline editing: EditType union (text/number/select/date/checkbox), renderEditInput standalone function, native HTML inputs for 48px row fit, stopPropagation on keydown to prevent grid nav
- Cell editing lifecycle: _editingCell state, activateCellEdit (Enter/F2/click-on-focused), commitCellEdit (validation + ui-cell-edit event), cancelCellEdit (Escape), restoreCellFocus via rAF
- _tableInstance reference stored in render() for edit methods to access TanStack Table outside render cycle
- Row editing lifecycle: _editingRow state, activateRowEdit (pencil click), saveRowEdit (validates all + ui-row-edit event), cancelRowEdit (revert), updateRowEditValue (pending state per field)
- Row edit mutual exclusion: cell edit blocked when _editingRow set, row edit cancels _editingCell on activation
- Unified actions column: 72px, hasActionsColumn getter unifies rowActions + enableRowEditing, renders row actions in view mode and save/cancel in edit mode
- Cell renderers: CellRenderer<TData, TValue> type alias, factory functions (text/number/date/boolean/badge/progress/avatar), cellRendererStyles CSS
- Row actions: renderRowActions with inline (1-2) / kebab (3+) branching, pre-built factories (view/edit/delete), rowActionsStyles CSS with hover-reveal
- Row action events: ui-row-action CustomEvent with {actionId, row, rowId}, special 'edit' actionId bridges to activateRowEdit
- Bulk actions: bulkActions property, renderBulkActionsToolbar standalone function, native HTML confirmation dialog, ui-bulk-action event with selectedRows
- CSV export: exportToCsv standalone utility, exportCsv() public method on DataTable, onExport callback for server delegation, RFC 4180 escaping, UTF-8 BOM
- Expandable rows: renderDetailContent property enables expand toggle column, expanded state (ExpandedState), singleExpand for accordion mode, ui-expanded-change event
- Expand column: createExpandColumn factory (follows createSelectionColumn pattern), _expand ID, 40px fixed, chevron-right SVG with rotate(90deg) on expand
- Virtual row wrapper: wraps data-row + detail-panel in container div, virtualizer.measureElement for dynamic heights, data-index for measurement tracking
- Detail panel: renderDetailPanel helper, role="region", padding-left aligned with data columns (calc(1rem + 40px)), full-width below data row
- Package: 4 peerDependencies (lit, @lit-ui/core, @lit-ui/checkbox, @lit-ui/popover), collision detection registration in index.ts
- JSX declarations: 44 properties + 14 events, React/Vue/Svelte support, 330 lines in jsx.d.ts
- CLI registry: data-table entry with @tanstack/lit-table + @tanstack/lit-virtual dependencies, checkbox/popover registryDependencies
- CLI starter template: 310-line self-contained component with single-column sorting, CSS double fallbacks, ARIA grid, skeleton loading
- CLI npm mapping: data-table -> @lit-ui/data-table in install-component.ts

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

- Executed Phase 68 Plan 02: CLI registry and starter template
- Added data-table to registry.json with TanStack dependencies and checkbox/popover registryDependencies
- Mapped data-table to @lit-ui/data-table in install-component.ts
- Created 310-line starter template with sorting, CSS double fallbacks, ARIA grid, skeleton loading
- Registered DATA_TABLE_TEMPLATE in index.ts COMPONENT_TEMPLATES map
- CLI TypeScript compilation passes cleanly
- Plan 68-02 complete (2/4 plans done in phase 68)

### Next Actions
*Clear starting point for next session.*

1. Phase 68 Plan 03: Documentation page for data-table
2. Phase 68 Plan 04: Remaining CLI/docs work

### Open Questions
*Unresolved questions needing user input.*

*None.*

---
*State initialized: 2026-02-02*
*Last updated: 2026-02-05 (Phase 68 plan 02 complete, CLI registry and starter template done)*
