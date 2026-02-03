# Technology Stack: Data Table Component (v7.0)

**Project:** LitUI Data Table
**Researched:** 2026-02-02
**Mode:** Ecosystem (Stack dimension)

## Executive Summary

The Data Table for LitUI can be built primarily by extending existing stack dependencies. The key addition is **@tanstack/lit-table** (v8.21.3) which provides headless table logic that integrates seamlessly with the already-used **@tanstack/lit-virtual** (v3.13.x). No additional major dependencies are required -- column resizing, column ordering, and drag interactions can be implemented with native browser APIs following patterns already established in the time-picker component.

**Key Recommendation:** Do NOT add TanStack Table as a peer dependency for end users. Instead, use it as an internal implementation detail (bundled). This keeps the component framework-agnostic and avoids version conflicts for users who may already use TanStack Table in their applications.

---

## Recommended Stack Additions

### Core Table Logic

| Technology | Version | Purpose | Why This Choice |
|------------|---------|---------|-----------------|
| @tanstack/lit-table | ^8.21.3 | Headless table state management | Official Lit adapter for TanStack Table. Provides sorting, filtering, pagination, column visibility, column ordering, column pinning, row selection, and column sizing out of the box. Requires Lit 3.1.3+ (project uses 3.3.2). [npm](https://www.npmjs.com/package/@tanstack/lit-table) |

**Integration with existing stack:**
- Works with existing `@tanstack/lit-virtual` for row virtualization
- Shares the same reactive controller pattern (`TableController` mirrors `VirtualizerController`)
- Can use existing `@floating-ui/dom` for column menus and filter dropdowns
- Can use existing form components (Input, Select, Checkbox) for inline editing

### Already Available (No New Dependencies)

| Technology | Current Version | Already Used In | Use for Data Table |
|------------|-----------------|-----------------|-------------------|
| @tanstack/lit-virtual | ^3.13.2 (upgrade to ^3.13.19) | Select component | 2D grid virtualization (rows + columns) |
| @floating-ui/dom | ^1.7.4 | Core, Select | Column header menus, filter dropdowns |
| @lit/task | ^1.0.3 | Select | Async data fetching, server-side operations |
| Pointer Events API | Native | Time-picker | Column resize drag handles |
| ResizeObserver | Native | Select | Auto-column sizing on container resize |
| IntersectionObserver | Native | Select | Infinite scroll / load more |

---

## 2D Grid Virtualization Strategy

### How It Works

TanStack Virtual supports 2D virtualization by creating two separate virtualizer instances:

```typescript
// Row virtualizer (vertical)
private _rowVirtualizer = new VirtualizerController(this, {
  getScrollElement: () => this._scrollContainer,
  count: this._data.length,
  estimateSize: () => ROW_HEIGHT,
  overscan: 5,
});

// Column virtualizer (horizontal)
private _columnVirtualizer = new VirtualizerController(this, {
  getScrollElement: () => this._scrollContainer,
  count: this._visibleColumns.length,
  estimateSize: (index) => this._columnWidths[index] ?? DEFAULT_COLUMN_WIDTH,
  horizontal: true,
  overscan: 2,
});
```

The rendering pattern nests column virtualization inside row virtualization:

```typescript
render() {
  const virtualRows = this._rowVirtualizer.getVirtualizer().getVirtualItems();
  const virtualCols = this._columnVirtualizer.getVirtualizer().getVirtualItems();

  return html`
    <div style="height: ${this._rowVirtualizer.getVirtualizer().getTotalSize()}px;
                width: ${this._columnVirtualizer.getVirtualizer().getTotalSize()}px;">
      ${virtualRows.map(row => html`
        <div style="position: absolute; top: ${row.start}px; height: ${row.size}px;">
          ${virtualCols.map(col => html`
            <div style="position: absolute; left: ${col.start}px; width: ${col.size}px;">
              ${this._renderCell(row.index, col.index)}
            </div>
          `)}
        </div>
      `)}
    </div>
  `;
}
```

**Performance at 100K+ rows:**
- With 2D virtualization, only visible cells render (~50 rows x ~10 cols = 500 DOM nodes max)
- TanStack Virtual benchmarks show 60fps scrolling with 1M cells
- Memory stays constant regardless of data size (O(viewport) not O(data))

**Confidence:** HIGH - Verified via [TanStack Virtual docs](https://tanstack.com/virtual/latest) and [virtualization guide](https://tanstack.com/table/v8/docs/guide/virtualization)

---

## TanStack Table Integration

### TableController Pattern

The @tanstack/lit-table package provides a `TableController` reactive controller:

```typescript
import { TableController, createColumnHelper } from '@tanstack/lit-table';

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('age', { header: 'Age' }),
];

class DataTable extends TailwindElement {
  private _table = new TableController(this);

  render() {
    const table = this._table.table({
      data: this._data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      // Enable features as needed:
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });

    // Use table.getHeaderGroups(), table.getRowModel(), etc.
  }
}
```

### Server-Side Operations (Manual Mode)

For server-side sorting, filtering, and pagination, TanStack Table provides manual mode flags:

```typescript
const table = this._table.table({
  data: this._data, // Current page only
  columns,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  pageCount: this._totalPages,  // From server
  rowCount: this._totalRows,    // From server
  state: {
    pagination: this._paginationState,
    sorting: this._sortingState,
    columnFilters: this._filterState,
  },
  onPaginationChange: this._handlePaginationChange,
  onSortingChange: this._handleSortingChange,
  onColumnFiltersChange: this._handleFilterChange,
});
```

When manual mode is enabled, state changes trigger events but don't process data -- the consumer fetches new data from their server.

**Confidence:** HIGH - Verified via [TanStack Table pagination guide](https://tanstack.com/table/v8/docs/guide/pagination) and [sorting guide](https://tanstack.com/table/v8/docs/guide/sorting)

---

## Column Resizing

### Native Implementation (Recommended)

Column resizing should use native pointer events, matching existing patterns in time-picker/time-range-slider.ts:

```typescript
private _handleResizePointerDown(e: PointerEvent, columnId: string): void {
  this._resizingColumn = columnId;
  this._resizeStartX = e.clientX;
  this._resizeStartWidth = this._columnWidths.get(columnId) ?? DEFAULT_WIDTH;

  (e.target as HTMLElement).setPointerCapture(e.pointerId);
}

private _handleResizePointerMove(e: PointerEvent): void {
  if (!this._resizingColumn) return;

  const delta = e.clientX - this._resizeStartX;
  const newWidth = Math.max(MIN_COLUMN_WIDTH, this._resizeStartWidth + delta);

  // Update column width
  this._table.setColumnSizing({
    ...this._table.getState().columnSizing,
    [this._resizingColumn]: newWidth,
  });
}
```

### TanStack Table Integration

TanStack Table provides `header.getResizeHandler()` as a convenience, but it's designed for React event handlers. For Lit, directly managing pointer events gives more control and matches the project's existing patterns.

Use TanStack Table's column sizing state management:

```typescript
state: {
  columnSizing: this._columnSizingState,
},
onColumnSizingChange: (updater) => {
  this._columnSizingState = typeof updater === 'function'
    ? updater(this._columnSizingState)
    : updater;
  this.requestUpdate();
},
```

**Resize modes:**
- `columnResizeMode: 'onChange'` - Live resize (60fps target)
- `columnResizeMode: 'onEnd'` - Update only when drag ends (simpler, more performant for complex cells)

**Confidence:** HIGH - Verified via [TanStack Table column sizing guide](https://tanstack.com/table/v8/docs/guide/column-sizing)

---

## Column Ordering / Reordering

### Native Drag and Drop (Recommended)

Use native HTML5 Drag and Drop API for column reordering. This is the approach recommended by TanStack Table docs and used by Material React Table.

```typescript
// On header cell
<th
  draggable="true"
  @dragstart=${(e) => this._handleColumnDragStart(e, column.id)}
  @dragover=${(e) => this._handleColumnDragOver(e, column.id)}
  @drop=${(e) => this._handleColumnDrop(e, column.id)}
>
```

### TanStack Table Integration

Column order is managed via `columnOrder` state:

```typescript
state: {
  columnOrder: this._columnOrderState, // string[] of column IDs
},
onColumnOrderChange: (updater) => {
  this._columnOrderState = typeof updater === 'function'
    ? updater(this._columnOrderState)
    : updater;
  this.requestUpdate();
},
```

**Note:** Column pinning takes precedence over column ordering. Pinned columns are always positioned at their pinned location (left/right).

**Confidence:** HIGH - Verified via [TanStack Table column ordering guide](https://tanstack.com/table/v8/docs/guide/column-ordering)

---

## Row Selection and Bulk Actions

TanStack Table provides comprehensive row selection:

```typescript
const table = this._table.table({
  // ...
  enableRowSelection: true,
  // Or conditional selection:
  enableRowSelection: (row) => !row.original.isLocked,

  state: {
    rowSelection: this._rowSelectionState,
  },
  onRowSelectionChange: (updater) => {
    this._rowSelectionState = typeof updater === 'function'
      ? updater(this._rowSelectionState)
      : updater;
    this.requestUpdate();
    this._dispatchSelectionChange();
  },
});
```

**Selection APIs:**
- `table.getSelectedRowModel().rows` - All selected rows
- `table.toggleAllRowsSelected()` - Select/deselect all
- `table.toggleAllPageRowsSelected()` - Select/deselect current page
- `row.getIsSelected()` - Check if row is selected
- `row.toggleSelected()` - Toggle row selection

**Server-side pagination caveat:** `getSelectedRowModel()` only returns rows from current page data. For cross-page selection with server-side pagination, maintain selection state separately using row IDs.

**Confidence:** HIGH - Verified via [TanStack Table row selection guide](https://tanstack.com/table/v8/docs/guide/row-selection)

---

## State Persistence

### localStorage Pattern

Persist user preferences (column visibility, order, sizes) to localStorage:

```typescript
private static STORAGE_KEY = 'lui-data-table-prefs';

private _loadPreferences(): TablePreferences {
  try {
    const stored = localStorage.getItem(DataTable.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

private _savePreferences(prefs: TablePreferences): void {
  try {
    localStorage.setItem(DataTable.STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable or full, fail silently
  }
}

interface TablePreferences {
  columnVisibility?: Record<string, boolean>;
  columnOrder?: string[];
  columnSizing?: Record<string, number>;
}
```

**Best practice:** Use a table-specific key (e.g., `lui-data-table-${tableId}-prefs`) when multiple tables exist on one page.

**Confidence:** HIGH - Standard pattern, verified via [DataTables state saving](https://datatables.net/examples/basic_init/state_save.html)

---

## Accessibility: ARIA Grid vs Table Role

### Recommendation: Use role="grid" for Interactive Data Tables

For a full-featured data table with inline editing, cell navigation, and keyboard interactions, use `role="grid"` instead of a native `<table>` or `role="table"`.

**When to use role="grid":**
- Interactive widgets where cells can be focused
- Arrow key navigation between cells
- Inline editing within cells
- Drag-to-reorder columns
- Cell-level selection

**Keyboard Navigation Requirements:**
| Key | Action |
|-----|--------|
| Arrow keys | Move focus between cells |
| Home/End | Move to first/last cell in row |
| Ctrl+Home/End | Move to first/last cell in grid |
| Enter/Space | Activate cell (enter edit mode, toggle selection) |
| Tab | Move to next interactive element (exit grid, or within cell) |
| Escape | Exit edit mode, deselect |

**Implementation Pattern:**
```typescript
<div role="grid" aria-rowcount="${this._totalRows}" aria-colcount="${this._columns.length}">
  <div role="rowgroup">
    <div role="row">
      ${headers.map(h => html`
        <div role="columnheader" aria-sort="${h.sortDirection ?? 'none'}">
          ${h.label}
        </div>
      `)}
    </div>
  </div>
  <div role="rowgroup">
    ${rows.map((row, i) => html`
      <div role="row" aria-rowindex="${i + 1}">
        ${cells.map((cell, j) => html`
          <div role="gridcell" aria-colindex="${j + 1}" tabindex="-1">
            ${cell.value}
          </div>
        `)}
      </div>
    `)}
  </div>
</div>
```

**Caution:** ARIA grids are complex. Follow the [W3C Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) carefully. Many libraries get this wrong.

**Confidence:** HIGH - Verified via [MDN ARIA grid role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/grid_role) and [W3C ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

---

## What NOT to Add

### Do NOT add these libraries:

| Library | Why Not |
|---------|---------|
| ag-Grid | Heavyweight, commercial license for features, not web-component native |
| @dnd-kit | Unnecessary - native DnD API sufficient for column reordering |
| immer | Over-engineering - direct state updates with requestUpdate() work fine |
| zustand/jotai | Not needed - Lit's reactive properties + TanStack Table state management sufficient |
| react-window/react-virtuoso | Wrong framework - we have @tanstack/lit-virtual |

### Feature-specific decisions:

| Feature | Approach | Rationale |
|---------|----------|-----------|
| Column resize | Pointer events | Already proven in time-picker component |
| Column reorder | Native DnD | Simpler, no dependency, recommended by TanStack |
| Inline editing | Existing components | Use lui-input, lui-select, lui-checkbox |
| Filter dropdowns | @floating-ui/dom | Already used throughout the library |
| Async data | @lit/task | Already used in Select component |

---

## Installation

### For the @lit-ui/data-table package:

```json
{
  "dependencies": {
    "@tanstack/lit-table": "^8.21.3",
    "@tanstack/lit-virtual": "^3.13.19"
  },
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  }
}
```

### npm/pnpm command:

```bash
pnpm add @tanstack/lit-table @tanstack/lit-virtual
```

---

## Architecture Recommendation

```
packages/data-table/
├── src/
│   ├── data-table.ts           # Main component with TableController
│   ├── data-table-header.ts    # Header row with sorting, resize handles
│   ├── data-table-row.ts       # Individual row rendering (optional, for complex cells)
│   ├── data-table-cell.ts      # Cell rendering with editing support
│   ├── data-table-toolbar.ts   # Search, filters, bulk actions
│   ├── data-table-pagination.ts # Page controls
│   ├── column-menu.ts          # Column visibility/pinning menu
│   └── types.ts                # Shared interfaces
└── package.json
```

**Component responsibility:**
- `lui-data-table` - Main orchestrator, holds TableController and VirtualizerControllers
- Child components are internal implementation details, not exported

---

## Version Summary

| Package | Version | Verified Date | Source |
|---------|---------|---------------|--------|
| @tanstack/lit-table | 8.21.3 | 2026-02-02 | [GitHub Releases](https://github.com/TanStack/table/releases) |
| @tanstack/lit-virtual | 3.13.19 | 2026-02-02 | [GitHub Releases](https://github.com/TanStack/virtual/releases) |
| lit (peer) | 3.x (requires 3.1.3+) | - | Project already uses 3.3.2 |

---

## Sources

### Primary (HIGH confidence)
- [TanStack Table Docs](https://tanstack.com/table/latest)
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest)
- [TanStack Table GitHub Releases](https://github.com/TanStack/table/releases) - v8.21.3 (April 14, 2025)
- [TanStack Virtual GitHub Releases](https://github.com/TanStack/virtual/releases) - v3.13.19 (January 7, 2026)
- [TanStack Table Column Sizing Guide](https://tanstack.com/table/v8/docs/guide/column-sizing)
- [TanStack Table Row Selection Guide](https://tanstack.com/table/v8/docs/guide/row-selection)
- [TanStack Table Pagination Guide](https://tanstack.com/table/v8/docs/guide/pagination)
- [TanStack Table Virtualization Guide](https://tanstack.com/table/v8/docs/guide/virtualization)
- [TanStack Table Column Ordering Guide](https://tanstack.com/table/v8/docs/guide/column-ordering)
- [W3C ARIA Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [MDN ARIA grid role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/grid_role)

### Secondary (MEDIUM confidence)
- [Build tables with Lit, TanStack Table and Twind](https://medium.com/@morkadosh/build-beautiful-accessible-tables-that-work-everywhere-with-lit-tanstack-table-and-twind-1275049d53a1)
- [IBM Carbon Design System TanStack Table exploration](https://github.com/carbon-design-system/ibm-products/issues/6069)
- [Adrian Roselli: ARIA Grid as an Anti-Pattern](https://adrianroselli.com/2020/07/aria-grid-as-an-anti-pattern.html)

### Existing Project Patterns (HIGH confidence)
- `/packages/select/src/select.ts` - VirtualizerController usage
- `/packages/time-picker/src/time-range-slider.ts` - Pointer event drag handling
- `/packages/core/src/floating/index.ts` - Shadow DOM-safe Floating UI wrapper
