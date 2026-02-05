# Roadmap: LitUI v7.0 Data Table

## Overview

This roadmap delivers a full-featured data table component for admin dashboards, handling 100K+ row datasets with virtual scrolling, sorting, filtering, inline editing, selection with bulk actions, and column customization. The architecture uses TanStack Table for headless state management and TanStack Virtual for row virtualization, building on patterns proven in the existing Select component.

Phases progress from foundational architecture (virtualization, ARIA grid) through data operations (sort, filter, paginate) to advanced features (editing, bulk actions, export). This ordering ensures architectural decisions that cannot be retrofitted are established first.

## Phases

### Phase 61: Core Table Shell & Virtualization

**Goal:** Users see a performant table with fixed header, virtual scrolling for 100K+ rows, proper loading/empty states, and full ARIA grid keyboard navigation.

**Dependencies:** None (foundation phase)

**Plans:** 5 plans

Plans:
- [x] 61-01-PLAN.md — Package setup with types and TanStack dependencies
- [x] 61-02-PLAN.md — Core DataTable component with TableController
- [x] 61-03-PLAN.md — Virtual scrolling with VirtualizerController
- [x] 61-04-PLAN.md — Loading and empty states
- [x] 61-05-PLAN.md — ARIA grid keyboard navigation

**Requirements:**
- CORE-01: Data Table renders columns and rows from column definition array
- CORE-02: Header row is fixed/sticky during vertical scroll
- CORE-03: Loading state shows skeleton loaders during initial data fetch
- CORE-04: Loading overlay appears during data updates (sort, filter, page change)
- CORE-05: Empty state displays "no data" message when data array is empty
- CORE-06: Empty state displays "no matches" message when filters return zero results
- CORE-07: Table uses role="grid" with proper ARIA attributes for accessibility
- CORE-08: Arrow key navigation moves between cells (grid pattern)
- CORE-09: Tab navigation moves between interactive elements within cells
- VIRT-01: Virtual scrolling renders only visible rows plus buffer for 100K+ row datasets
- VIRT-02: Scroll performance maintains 60fps with 100K+ rows
- VIRT-03: Row heights are fixed for consistent virtual scroll behavior
- VIRT-04: Scroll position is preserved during data updates (sort, filter)

**Success Criteria:**
1. User can render a table with 100K rows and scroll smoothly at 60fps
2. User can navigate cells with arrow keys and hears correct ARIA announcements
3. User sees skeleton loaders while data loads, then content appears
4. User sees "no data" message when providing empty array, "no matches" when filters empty results
5. Header stays visible when scrolling vertically through large datasets

---

### Phase 62: Sorting & Selection

**Goal:** Users can sort data by clicking column headers and select rows individually or in bulk for downstream actions.

**Dependencies:** Phase 61 (requires table rendering and keyboard navigation)

**Plans:** 3 plans

Plans:
- [x] 62-01-PLAN.md — Sorting with TanStack integration and visual indicators
- [x] 62-02-PLAN.md — Row selection core with checkbox column
- [x] 62-03-PLAN.md — Selection enhancements (range, banner, filter clearing)

**Requirements:**
- SORT-01: User can click column header to sort by that column (ascending/descending toggle)
- SORT-02: Sort indicator (arrow) shows current sort direction on sorted column
- SORT-03: User can Shift+click additional columns for multi-column sort
- SORT-04: Multi-column sort shows priority numbers on sorted columns
- SORT-05: Server-side sorting passes sort state to data callback when manual mode enabled
- SEL-01: Row selection checkbox column is optionally enabled
- SEL-02: Header checkbox selects/deselects all rows on current page
- SEL-03: Shift+click enables range selection (select all rows between two clicks)
- SEL-04: "Select all X items" link appears after page select-all to select entire filtered dataset
- SEL-05: Selection state is maintained across pagination (selected IDs tracked)
- SEL-06: Selection is cleared when filters change (with configurable option to preserve)

**Success Criteria:**
1. User can click column header to sort ascending, click again for descending, see arrow indicator
2. User can Shift+click multiple columns and see numbered priority indicators
3. User can check individual rows, use header checkbox for page select-all, and see "Select all X" for dataset
4. User can Shift+click two rows to select entire range between them
5. User's selection persists when navigating pages, clears when filters change (unless configured)

---

### Phase 63: Filtering & Pagination

**Goal:** Users can filter data per-column or globally, paginate through results, and connect to server-side data sources with proper loading states.

**Dependencies:** Phase 62 (builds on sorting pipeline, selection clears on filter)

**Plans:** 4 plans

Plans:
- [x] 63-01-PLAN.md — Filtering infrastructure with TanStack integration
- [x] 63-02-PLAN.md — Filter components (text, number, date, select, global)
- [x] 63-03-PLAN.md — Pagination state and controls
- [x] 63-04-PLAN.md — Async data callback with AbortController

**Requirements:**
- FILT-01: User can filter each column independently via per-column filter inputs
- FILT-02: Text columns support text/contains filter
- FILT-03: Number columns support numeric comparison filters (equals, greater than, less than, range)
- FILT-04: Date columns support date range filters
- FILT-05: Select/enum columns support multi-select filter from predefined options
- FILT-06: Global search input filters across all searchable columns simultaneously
- FILT-07: Server-side filtering passes filter state to data callback when manual mode enabled
- FILT-08: Active filters are visually indicated on column headers
- PAGE-01: Pagination controls show current page, total pages, and navigation (prev/next, first/last)
- PAGE-02: User can select page size from configurable options (e.g., 10, 25, 50, 100)
- PAGE-03: Total record count is displayed
- PAGE-04: Server-side pagination passes page/size to data callback when manual mode enabled
- ASYNC-01: Data Table accepts async data callback for server-side data fetching
- ASYNC-02: Callback receives current state (page, pageSize, sort, filters) as parameters
- ASYNC-03: Previous requests are cancelled via AbortController when new request starts
- ASYNC-04: Debounced requests prevent excessive server calls during rapid filter input
- ASYNC-05: Error state displays when data fetch fails with retry option

**Success Criteria:**
1. User can open per-column filter and use appropriate filter type (text, number range, date, multi-select)
2. User can type in global search and see all matching rows across columns
3. User sees filter indicator icon on columns with active filters
4. User can navigate pages, change page size, and see "Page 1 of 100 (10,000 total)" style display
5. User can connect to async data source; sees loading during fetch, error with retry on failure

---

### Phase 64: Column Customization

**Goal:** Users can resize, reorder, and show/hide columns, with preferences persisted for return visits.

**Dependencies:** Phase 61 (requires stable header rendering)

**Plans:** 4 plans

Plans:
- [x] 64-01-PLAN.md — Column resize with drag handles and auto-fit
- [x] 64-02-PLAN.md — Column visibility picker with lui-popover
- [x] 64-03-PLAN.md — Column reorder via drag-and-drop, sticky first column
- [x] 64-04-PLAN.md — Persistence to localStorage with optional callback

**Requirements:**
- COL-01: Column widths are resizable via drag handles between headers
- COL-02: Double-click column divider auto-fits column to content width
- COL-03: Minimum column width prevents columns from becoming too narrow
- COL-04: First column can be configured as fixed/sticky during horizontal scroll
- COL-05: Column picker dropdown allows show/hide of individual columns
- COL-06: Columns can be reordered via drag-and-drop in header
- COL-07: Column preferences (width, order, visibility) persist to localStorage
- COL-08: Optional callback receives preference changes for server-side persistence

**Success Criteria:**
1. User can drag column dividers to resize; double-click auto-fits to content
2. User cannot shrink columns below readable minimum (50px)
3. User can drag column headers to reorder, with visual feedback during drag
4. User can open column picker and toggle visibility of individual columns
5. User returns to site and sees their previous column widths/order/visibility restored

---

### Phase 65: Inline Editing

**Goal:** Users can edit data directly in the table at cell level (click-to-edit) or row level (edit mode), with validation and save/cancel workflow.

**Dependencies:** Phase 61-64 (requires stable table, virtualization, keyboard nav)

**Plans:** 3 plans

Plans:
- [x] 65-01-PLAN.md — Editing types and inline-editing module (input renderers, helpers)
- [x] 65-02-PLAN.md — Cell-level inline editing (click-to-edit, commit/cancel, validation, events)
- [x] 65-03-PLAN.md — Row-level inline editing (pencil action, save/cancel, row validation, events)

**Requirements:**
- EDIT-01: Cells marked as editable show visual indicator on hover/focus
- EDIT-02: Click on editable cell activates inline edit mode
- EDIT-03: Edit mode renders appropriate input type (text, number, select, date, checkbox)
- EDIT-04: Enter or blur commits the edit; Escape cancels
- EDIT-05: Validation errors display inline with the cell
- EDIT-06: Edit commit dispatches event with old/new values for developer handling
- EDIT-07: Arrow keys exit edit mode and navigate to adjacent cell (optional)
- ROWEDIT-01: Row edit mode activates via action button (pencil icon)
- ROWEDIT-02: Entire row becomes editable with appropriate inputs
- ROWEDIT-03: Save and Cancel buttons appear in row during edit mode
- ROWEDIT-04: Save validates all fields before committing
- ROWEDIT-05: Save dispatches event with complete row data for developer handling
- ROWEDIT-06: Only one row can be in edit mode at a time

**Success Criteria:**
1. User sees pencil/edit indicator on editable cells, clicks to enter edit mode with appropriate input
2. User can press Enter to save, Escape to cancel, or click away to commit
3. User sees validation error inline if edit fails validation
4. User can click row edit button, edit multiple cells, then Save/Cancel entire row
5. User editing one row automatically closes any other row in edit mode

---

### Phase 66: Cell Renderers, Row Actions & Bulk Actions

**Goal:** Users can customize cell display with renderers, access row-level actions, and perform bulk operations on selected rows.

**Dependencies:** Phase 62 (selection), Phase 65 (edit mode integration with actions)

**Plans:** 3 plans

Plans:
- [x] 66-01-PLAN.md — Types, cell renderer factories, and row actions module
- [x] 66-02-PLAN.md — Row actions integration into DataTable component
- [x] 66-03-PLAN.md — Bulk actions toolbar and confirmation dialog integration

**Requirements:**
- CELL-01: Column definition accepts custom Lit template for cell rendering
- CELL-02: Cell template receives row data and column definition as context
- CELL-03: Built-in cell renderers provided: text, number, date, boolean, badge, progress, avatar
- CELL-04: Custom renderers work correctly with virtual scrolling (no stale data)
- ACT-01: Row actions column displays action buttons or kebab menu
- ACT-02: Hover-reveal pattern optionally shows actions only on row hover
- ACT-03: Action click dispatches event with row data
- ACT-04: Common actions (edit, delete, view) are pre-built with customizable labels
- BULK-01: Floating bulk actions toolbar appears when rows are selected
- BULK-02: Toolbar shows count of selected items
- BULK-03: Developer can configure action buttons (delete, export, custom actions)
- BULK-04: Bulk delete action shows confirmation dialog before executing
- BULK-05: Actions dispatch events with selected row data for developer handling

**Success Criteria:**
1. User sees formatted cells (dates, badges, progress bars, avatars) via built-in renderers
2. User can define custom cell template and it renders correctly during virtual scroll
3. User sees action buttons/menu on rows, clicks to trigger action with row data
4. User selects rows and sees floating toolbar with "3 selected" and action buttons
5. User clicks bulk delete, sees confirmation dialog, and receives event on confirm

---

### Phase 67: Export & Expandable Rows

**Goal:** Users can export table data to CSV and expand rows to see additional detail content.

**Dependencies:** Phase 62 (selection for export selected), Phase 63 (filters for export filtered)

**Plans:** 2 plans

Plans:
- [x] 67-01-PLAN.md — CSV export utility with client-side and server-side callback support
- [x] 67-02-PLAN.md — Expandable detail rows with column factory, dynamic virtualizer measurement, and single-expand mode

**Requirements:**
- EXP-01: Export to CSV downloads current filtered/visible data
- EXP-02: Export to CSV downloads selected rows only when selection active
- EXP-03: Column visibility is respected in export (hidden columns excluded)
- EXP-04: Export callback allows server-side export for large datasets
- EXPAND-01: Rows can be marked as expandable with expand/collapse toggle
- EXPAND-02: Expanded row shows detail content below the main row
- EXPAND-03: Detail content slot accepts custom Lit template
- EXPAND-04: Single-expand mode optionally collapses other rows when one expands
- EXPAND-05: Expanded state can be controlled (controlled/uncontrolled pattern)

**Success Criteria:**
1. User clicks export and downloads CSV of visible/filtered data with visible columns only
2. User with rows selected exports only selected rows
3. User can click expand toggle and see detail panel below row
4. User in single-expand mode sees other rows collapse when expanding a new row
5. Developer can control expanded state programmatically via property

---

### Phase 68: Package, CLI & Documentation

**Goal:** Data Table is distributed as npm package and CLI template with comprehensive documentation for all features.

**Dependencies:** Phases 61-67 (all features complete)

**Requirements:**
- PKG-01: @lit-ui/data-table package with peer dependencies on lit and @lit-ui/core
- PKG-02: TypeScript types exported for column definitions, row data, events
- PKG-03: JSX/TSX declarations for React/Preact compatibility
- PKG-04: SSR support via Declarative Shadow DOM (matching existing pattern)
- PKG-05: CSS custom properties for full theming (--ui-data-table-*)
- PKG-06: Dark mode support via :host-context(.dark)
- CLI-01: CLI registry includes data-table component
- CLI-02: Copy-source templates with CSS variable fallbacks
- CLI-03: Documentation page with interactive demos
- CLI-04: API reference for all properties, events, CSS custom properties
- CLI-05: Accessibility documentation (keyboard navigation, screen reader behavior)
- CLI-06: Example patterns: basic table, server-side data, inline editing, bulk actions

**Success Criteria:**
1. User can `npm install @lit-ui/data-table` and import working component
2. User can `npx lit-ui add data-table` and get copy-source files
3. User can visit docs page and try interactive demos of all major features
4. User finds complete API reference with all properties, events, and CSS variables
5. User finds accessibility guide explaining keyboard navigation and ARIA behavior

---

## Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 61 | Core Table Shell & Virtualization | Complete | 5/5 |
| 62 | Sorting & Selection | Complete | 3/3 |
| 63 | Filtering & Pagination | Complete | 4/4 |
| 64 | Column Customization | Complete | 4/4 |
| 65 | Inline Editing | Complete | 3/3 |
| 66 | Cell Renderers, Row Actions & Bulk Actions | Complete | 3/3 |
| 67 | Export & Expandable Rows | Complete | 2/2 |
| 68 | Package, CLI & Documentation | Pending | 0/0 |

**Total:** 8 phases, 76 requirements mapped

---
*Roadmap created: 2026-02-02*
*Last updated: 2026-02-05 (Phase 67 complete)*
