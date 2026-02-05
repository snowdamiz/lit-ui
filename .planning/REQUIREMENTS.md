# Requirements: LitUI v7.0 Data Table

**Defined:** 2026-02-02
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v7.0 Requirements

Requirements for Data Table milestone. Each maps to roadmap phases.

### Core Infrastructure

- [x] **CORE-01**: Data Table renders columns and rows from column definition array
- [x] **CORE-02**: Header row is fixed/sticky during vertical scroll
- [x] **CORE-03**: Loading state shows skeleton loaders during initial data fetch
- [x] **CORE-04**: Loading overlay appears during data updates (sort, filter, page change)
- [x] **CORE-05**: Empty state displays "no data" message when data array is empty
- [x] **CORE-06**: Empty state displays "no matches" message when filters return zero results
- [x] **CORE-07**: Table uses role="grid" with proper ARIA attributes for accessibility
- [x] **CORE-08**: Arrow key navigation moves between cells (grid pattern)
- [x] **CORE-09**: Tab navigation moves between interactive elements within cells

### Sorting

- [x] **SORT-01**: User can click column header to sort by that column (ascending/descending toggle)
- [x] **SORT-02**: Sort indicator (arrow) shows current sort direction on sorted column
- [x] **SORT-03**: User can Shift+click additional columns for multi-column sort
- [x] **SORT-04**: Multi-column sort shows priority numbers on sorted columns
- [x] **SORT-05**: Server-side sorting passes sort state to data callback when manual mode enabled

### Filtering

- [x] **FILT-01**: User can filter each column independently via per-column filter inputs
- [x] **FILT-02**: Text columns support text/contains filter
- [x] **FILT-03**: Number columns support numeric comparison filters (equals, greater than, less than, range)
- [x] **FILT-04**: Date columns support date range filters
- [x] **FILT-05**: Select/enum columns support multi-select filter from predefined options
- [x] **FILT-06**: Global search input filters across all searchable columns simultaneously
- [x] **FILT-07**: Server-side filtering passes filter state to data callback when manual mode enabled
- [x] **FILT-08**: Active filters are visually indicated on column headers

### Pagination

- [x] **PAGE-01**: Pagination controls show current page, total pages, and navigation (prev/next, first/last)
- [x] **PAGE-02**: User can select page size from configurable options (e.g., 10, 25, 50, 100)
- [x] **PAGE-03**: Total record count is displayed
- [x] **PAGE-04**: Server-side pagination passes page/size to data callback when manual mode enabled

### Virtual Scrolling

- [x] **VIRT-01**: Virtual scrolling renders only visible rows plus buffer for 100K+ row datasets
- [x] **VIRT-02**: Scroll performance maintains 60fps with 100K+ rows
- [x] **VIRT-03**: Row heights are fixed for consistent virtual scroll behavior
- [x] **VIRT-04**: Scroll position is preserved during data updates (sort, filter)

### Async Data Source

- [x] **ASYNC-01**: Data Table accepts async data callback for server-side data fetching
- [x] **ASYNC-02**: Callback receives current state (page, pageSize, sort, filters) as parameters
- [x] **ASYNC-03**: Previous requests are cancelled via AbortController when new request starts
- [x] **ASYNC-04**: Debounced requests prevent excessive server calls during rapid filter input
- [x] **ASYNC-05**: Error state displays when data fetch fails with retry option

### Selection

- [x] **SEL-01**: Row selection checkbox column is optionally enabled
- [x] **SEL-02**: Header checkbox selects/deselects all rows on current page
- [x] **SEL-03**: Shift+click enables range selection (select all rows between two clicks)
- [x] **SEL-04**: "Select all X items" link appears after page select-all to select entire filtered dataset
- [x] **SEL-05**: Selection state is maintained across pagination (selected IDs tracked)
- [x] **SEL-06**: Selection is cleared when filters change (with configurable option to preserve)

### Bulk Actions

- [ ] **BULK-01**: Floating bulk actions toolbar appears when rows are selected
- [ ] **BULK-02**: Toolbar shows count of selected items
- [ ] **BULK-03**: Developer can configure action buttons (delete, export, custom actions)
- [ ] **BULK-04**: Bulk delete action shows confirmation dialog before executing
- [ ] **BULK-05**: Actions dispatch events with selected row data for developer handling

### Column Customization

- [x] **COL-01**: Column widths are resizable via drag handles between headers
- [x] **COL-02**: Double-click column divider auto-fits column to content width
- [x] **COL-03**: Minimum column width prevents columns from becoming too narrow
- [x] **COL-04**: First column can be configured as fixed/sticky during horizontal scroll
- [x] **COL-05**: Column picker dropdown allows show/hide of individual columns
- [x] **COL-06**: Columns can be reordered via drag-and-drop in header
- [x] **COL-07**: Column preferences (width, order, visibility) persist to localStorage
- [x] **COL-08**: Optional callback receives preference changes for server-side persistence

### Inline Editing (Cell Level)

- [x] **EDIT-01**: Cells marked as editable show visual indicator on hover/focus
- [x] **EDIT-02**: Click on editable cell activates inline edit mode
- [x] **EDIT-03**: Edit mode renders appropriate input type (text, number, select, date, checkbox)
- [x] **EDIT-04**: Enter or blur commits the edit; Escape cancels
- [x] **EDIT-05**: Validation errors display inline with the cell
- [x] **EDIT-06**: Edit commit dispatches event with old/new values for developer handling
- [x] **EDIT-07**: Arrow keys exit edit mode and navigate to adjacent cell (optional)

### Inline Editing (Row Level)

- [x] **ROWEDIT-01**: Row edit mode activates via action button (pencil icon)
- [x] **ROWEDIT-02**: Entire row becomes editable with appropriate inputs
- [x] **ROWEDIT-03**: Save and Cancel buttons appear in row during edit mode
- [x] **ROWEDIT-04**: Save validates all fields before committing
- [x] **ROWEDIT-05**: Save dispatches event with complete row data for developer handling
- [x] **ROWEDIT-06**: Only one row can be in edit mode at a time

### Custom Cell Renderers

- [ ] **CELL-01**: Column definition accepts custom Lit template for cell rendering
- [ ] **CELL-02**: Cell template receives row data and column definition as context
- [ ] **CELL-03**: Built-in cell renderers provided: text, number, date, boolean, badge, progress, avatar
- [ ] **CELL-04**: Custom renderers work correctly with virtual scrolling (no stale data)

### Row Actions

- [ ] **ACT-01**: Row actions column displays action buttons or kebab menu
- [ ] **ACT-02**: Hover-reveal pattern optionally shows actions only on row hover
- [ ] **ACT-03**: Action click dispatches event with row data
- [ ] **ACT-04**: Common actions (edit, delete, view) are pre-built with customizable labels

### Export

- [ ] **EXP-01**: Export to CSV downloads current filtered/visible data
- [ ] **EXP-02**: Export to CSV downloads selected rows only when selection active
- [ ] **EXP-03**: Column visibility is respected in export (hidden columns excluded)
- [ ] **EXP-04**: Export callback allows server-side export for large datasets

### Expandable Rows

- [ ] **EXPAND-01**: Rows can be marked as expandable with expand/collapse toggle
- [ ] **EXPAND-02**: Expanded row shows detail content below the main row
- [ ] **EXPAND-03**: Detail content slot accepts custom Lit template
- [ ] **EXPAND-04**: Single-expand mode optionally collapses other rows when one expands
- [ ] **EXPAND-05**: Expanded state can be controlled (controlled/uncontrolled pattern)

### Package & Integration

- [ ] **PKG-01**: @lit-ui/data-table package with peer dependencies on lit and @lit-ui/core
- [ ] **PKG-02**: TypeScript types exported for column definitions, row data, events
- [ ] **PKG-03**: JSX/TSX declarations for React/Preact compatibility
- [ ] **PKG-04**: SSR support via Declarative Shadow DOM (matching existing pattern)
- [ ] **PKG-05**: CSS custom properties for full theming (--ui-data-table-*)
- [ ] **PKG-06**: Dark mode support via :host-context(.dark)

### CLI & Documentation

- [ ] **CLI-01**: CLI registry includes data-table component
- [ ] **CLI-02**: Copy-source templates with CSS variable fallbacks
- [ ] **CLI-03**: Documentation page with interactive demos
- [ ] **CLI-04**: API reference for all properties, events, CSS custom properties
- [ ] **CLI-05**: Accessibility documentation (keyboard navigation, screen reader behavior)
- [ ] **CLI-06**: Example patterns: basic table, server-side data, inline editing, bulk actions

## Future Requirements (v7.1+)

Features considered but deferred to maintain v7.0 scope.

### Column Enhancements
- **Column pinning (left/right)** — Pin columns beyond just first column
- **Column groups** — Group related columns under shared header

### Advanced Features
- **Row pinning** — Pin important rows to top/bottom
- **Copy to clipboard** — Copy selected rows as TSV
- **Keyboard shortcuts** — Power user shortcuts (Ctrl+A select all, etc.)

### Performance
- **Column virtualization** — For tables with 50+ columns
- **Web Worker sorting/filtering** — Offload heavy computation

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Formula support | Admin tables display data, not compute it. Formulas belong in data layer. |
| Cell-to-cell references | Spreadsheet feature, creates hidden dependencies |
| Row insertion in table | CRUD belongs in forms/dialogs, not inline |
| Multi-cell selection | Excel feature for copying ranges; admin tables select rows |
| Merged cells | Breaks sorting, filtering, editing; destroys table semantics |
| Conditional formatting rules | UI complexity; provide predefined cell renderers instead |
| Pivot tables | Data analysis feature, completely different UX paradigm |
| Undo/redo stack | Edit history adds state complexity; confirm before destructive actions |
| Infinite scroll | Users lose position; hard to reach specific items |
| Variable row heights | Breaks virtual scrolling performance; use fixed heights with tooltip/expand |
| Real-time collaborative editing | Massive complexity (OT/CRDT); single-user editing with optimistic locking |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CORE-01 | 61 | Complete |
| CORE-02 | 61 | Complete |
| CORE-03 | 61 | Complete |
| CORE-04 | 61 | Complete |
| CORE-05 | 61 | Complete |
| CORE-06 | 61 | Complete |
| CORE-07 | 61 | Complete |
| CORE-08 | 61 | Complete |
| CORE-09 | 61 | Complete |
| VIRT-01 | 61 | Complete |
| VIRT-02 | 61 | Complete |
| VIRT-03 | 61 | Complete |
| VIRT-04 | 61 | Complete |
| SORT-01 | 62 | Complete |
| SORT-02 | 62 | Complete |
| SORT-03 | 62 | Complete |
| SORT-04 | 62 | Complete |
| SORT-05 | 62 | Complete |
| SEL-01 | 62 | Complete |
| SEL-02 | 62 | Complete |
| SEL-03 | 62 | Complete |
| SEL-04 | 62 | Complete |
| SEL-05 | 62 | Complete |
| SEL-06 | 62 | Complete |
| FILT-01 | 63 | Complete |
| FILT-02 | 63 | Complete |
| FILT-03 | 63 | Complete |
| FILT-04 | 63 | Complete |
| FILT-05 | 63 | Complete |
| FILT-06 | 63 | Complete |
| FILT-07 | 63 | Complete |
| FILT-08 | 63 | Complete |
| PAGE-01 | 63 | Complete |
| PAGE-02 | 63 | Complete |
| PAGE-03 | 63 | Complete |
| PAGE-04 | 63 | Complete |
| ASYNC-01 | 63 | Complete |
| ASYNC-02 | 63 | Complete |
| ASYNC-03 | 63 | Complete |
| ASYNC-04 | 63 | Complete |
| ASYNC-05 | 63 | Complete |
| COL-01 | 64 | Complete |
| COL-02 | 64 | Complete |
| COL-03 | 64 | Complete |
| COL-04 | 64 | Complete |
| COL-05 | 64 | Complete |
| COL-06 | 64 | Complete |
| COL-07 | 64 | Complete |
| COL-08 | 64 | Complete |
| EDIT-01 | 65 | Complete |
| EDIT-02 | 65 | Complete |
| EDIT-03 | 65 | Complete |
| EDIT-04 | 65 | Complete |
| EDIT-05 | 65 | Complete |
| EDIT-06 | 65 | Complete |
| EDIT-07 | 65 | Complete |
| ROWEDIT-01 | 65 | Complete |
| ROWEDIT-02 | 65 | Complete |
| ROWEDIT-03 | 65 | Complete |
| ROWEDIT-04 | 65 | Complete |
| ROWEDIT-05 | 65 | Complete |
| ROWEDIT-06 | 65 | Complete |
| CELL-01 | 66 | Pending |
| CELL-02 | 66 | Pending |
| CELL-03 | 66 | Pending |
| CELL-04 | 66 | Pending |
| ACT-01 | 66 | Pending |
| ACT-02 | 66 | Pending |
| ACT-03 | 66 | Pending |
| ACT-04 | 66 | Pending |
| BULK-01 | 66 | Pending |
| BULK-02 | 66 | Pending |
| BULK-03 | 66 | Pending |
| BULK-04 | 66 | Pending |
| BULK-05 | 66 | Pending |
| EXP-01 | 67 | Pending |
| EXP-02 | 67 | Pending |
| EXP-03 | 67 | Pending |
| EXP-04 | 67 | Pending |
| EXPAND-01 | 67 | Pending |
| EXPAND-02 | 67 | Pending |
| EXPAND-03 | 67 | Pending |
| EXPAND-04 | 67 | Pending |
| EXPAND-05 | 67 | Pending |
| PKG-01 | 68 | Pending |
| PKG-02 | 68 | Pending |
| PKG-03 | 68 | Pending |
| PKG-04 | 68 | Pending |
| PKG-05 | 68 | Pending |
| PKG-06 | 68 | Pending |
| CLI-01 | 68 | Pending |
| CLI-02 | 68 | Pending |
| CLI-03 | 68 | Pending |
| CLI-04 | 68 | Pending |
| CLI-05 | 68 | Pending |
| CLI-06 | 68 | Pending |

**Coverage:**
- v7.0 requirements: 76 total
- Mapped to phases: 76
- Unmapped: 0

---
*Requirements defined: 2026-02-02*
*Last updated: 2026-02-04 (Phases 61-65 complete)*
