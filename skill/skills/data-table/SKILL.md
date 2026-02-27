---
name: lit-ui-data-table
description: >-
  How to use <lui-data-table> — props, slots, events, CSS tokens, JS setup, examples.
---

# Data Table

High-performance data table with virtual scrolling (100K+ rows), sorting, filtering, pagination, inline editing, selection, bulk actions, column customization, and CSV export.

## Usage

**Important:** `columns` and `data` are JS properties set imperatively (not HTML attributes).

```js
import '@lit-ui/data-table';

const table = document.querySelector('lui-data-table');
table.columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];
table.data = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'Editor', status: 'Active' },
];
```

```html
<lui-data-table enable-selection show-column-picker></lui-data-table>
```

```js
// React example
import { useRef, useEffect } from 'react';

function MyTable({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.columns = columns;
      ref.current.data = data;
    }
  }, [data]);
  return <lui-data-table ref={ref} enable-selection />;
}
```

```js
// Row actions
table.rowActions = [
  { id: 'view', label: 'View', variant: 'default' },
  { id: 'edit', label: 'Edit', variant: 'default' },
  { id: 'delete', label: 'Delete', variant: 'destructive' },
];
// 1-2 actions render inline; 3+ use a kebab menu
```

```js
// Server-side data (sorting, filtering, pagination handled by server)
table.dataCallback = async (params, signal) => {
  const res = await fetch(`/api/users?${new URLSearchParams({
    page: String(params.pageIndex),
    size: String(params.pageSize),
    sort: JSON.stringify(params.sorting),
    filters: JSON.stringify(params.columnFilters),
  })}, { signal });
  const json = await res.json();
  return { data: json.rows, totalRowCount: json.total };
};
```

```js
// Inline row editing
table.columns = [
  { accessorKey: 'name', header: 'Name', meta: { editable: true, editType: 'text' } },
  { accessorKey: 'role', header: 'Role', meta: {
      editable: true, editType: 'select',
      editOptions: [{ label: 'Admin', value: 'Admin' }, { label: 'Editor', value: 'Editor' }]
  }},
];
// Combine with enable-row-editing attribute
```

```js
// CSV export
table.exportCsv({ filename: 'users.csv' });
table.exportCsv({ filename: 'selected.csv', selectedOnly: true });
```

## Column Definition

```ts
type ColumnDef = {
  accessorKey: string;      // Maps to row data property
  header: string;           // Column header text
  enableSorting?: boolean;  // Enable sort on this column
  size?: number;            // Column width in pixels
  meta?: {
    filterType?: 'text' | 'select' | 'date';
    filterOptions?: { label: string; value: string }[];
    editable?: boolean;
    editType?: 'text' | 'select' | 'date';
    editOptions?: { label: string; value: string }[];
  };
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | `ColumnDef<TData>[]` | `[]` | Column definitions array. JS property only. |
| data | `TData[]` | `[]` | Row data array. JS property only. |
| loading | `"idle" \| "loading" \| "updating"` | `"idle"` | Loading state. "loading" shows skeleton rows; "updating" shows overlay. |
| aria-label | `string` | `"Data table"` | Accessible label for the grid. |
| max-height | `string` | `"400px"` | Maximum table body height. Enables virtual scrolling when content overflows. |
| row-height | `number` | `48` | Fixed row height in pixels for virtualizer calculations. |
| skeleton-rows | `number` | `5` | Number of skeleton rows during loading state. |
| empty-state-type | `"no-data" \| "no-matches"` | `"no-data"` | Type of empty state to display. |
| no-data-message | `string` | `"No data available"` | Message when table has no data. |
| no-matches-message | `string` | `"No results match your filters"` | Message when filters exclude all rows. |
| sorting | `SortingState` | `[]` | Current sorting state. Array of `{ id, desc }` for multi-column sort. |
| manual-sorting | `boolean` | `false` | Enable server-side sorting via `ui-sort-change` events. |
| enable-selection | `boolean` | `false` | Enable row selection with checkboxes. |
| rowSelection | `RowSelectionState` | `{}` | Current row selection state. JS property. |
| row-id-key | `string` | `"id"` | Property name used as unique row identifier. |
| total-row-count | `number` | `undefined` | Total row count for server-side "select all". |
| preserve-selection-on-filter | `boolean` | `false` | Keep selected rows when filters change. |
| columnFilters | `ColumnFiltersState` | `[]` | Current column filter state. JS property. |
| global-filter | `string` | `""` | Global filter string applied across all columns. |
| manual-filtering | `boolean` | `false` | Enable server-side filtering via `ui-filter-change` events. |
| pagination | `PaginationState` | `{ pageIndex: 0, pageSize: 25 }` | Current pagination state. JS property. |
| manual-pagination | `boolean` | `false` | Enable server-side pagination via `ui-pagination-change` events. |
| page-count | `number` | `undefined` | Total page count for server-side pagination. |
| pageSizeOptions | `number[]` | `[10, 25, 50, 100]` | Available page size options. JS property. |
| enable-column-resizing | `boolean` | `true` | Enable column resizing by dragging header borders. |
| columnSizing | `ColumnSizingState` | `{}` | Current column widths. JS property. |
| column-resize-mode | `"onChange" \| "onEnd"` | `"onChange"` | When to apply resize. |
| columnVisibility | `VisibilityState` | `{}` | Column visibility state. JS property. |
| show-column-picker | `boolean` | `false` | Show column picker toggle in toolbar. |
| columnOrder | `ColumnOrderState` | `[]` | Column display order. JS property. |
| enable-column-reorder | `boolean` | `false` | Enable column reordering by dragging headers. |
| sticky-first-column | `boolean` | `false` | Pin the first column during horizontal scroll. |
| persistence-key | `string` | `""` | LocalStorage key for persisting column preferences. |
| onColumnPreferencesChange | `(prefs) => void` | `undefined` | Callback for server-side preference persistence. JS property. |
| enable-row-editing | `boolean` | `false` | Enable row-level edit mode with save/cancel controls. |
| rowActions | `RowAction[]` | `[]` | Row action definitions. JS property. |
| hover-reveal-actions | `boolean` | `false` | Show row action buttons only on hover. |
| bulkActions | `BulkAction[]` | `[]` | Bulk action definitions shown in toolbar when rows are selected. JS property. |
| onExport | `(params) => void \| Promise<void>` | `undefined` | Server-side export callback. JS property. |
| renderDetailContent | `(rowData, row) => TemplateResult` | `undefined` | Function returning detail content for expanded rows. JS property. |
| expanded | `ExpandedState` | `{}` | Expanded row state. JS property. |
| single-expand | `boolean` | `false` | Only allow one row expanded at a time (accordion mode). |
| dataCallback | `(params, signal) => Promise<DataCallbackResult>` | `undefined` | Async data fetch for server-side data. JS property. |
| debounce-delay | `number` | `300` | Debounce delay for filter changes with dataCallback. |

## Slots

| Slot | Description |
|------|-------------|
| `toolbar-start` | Content at the start (left) of the toolbar. |
| `toolbar-end` | Content at the end (right) of the toolbar. |

## Events

| Event | Detail Type | Description |
|-------|-------------|-------------|
| `ui-sort-change` | `SortChangeEvent` | Fired when sort state changes. |
| `ui-selection-change` | `SelectionChangeEvent` | Fired when row selection changes. Includes selectedRows and count. |
| `ui-filter-change` | `FilterChangeEvent` | Fired when column filters or global filter changes. |
| `ui-pagination-change` | `PaginationChangeEvent` | Fired when page index or page size changes. |
| `ui-column-visibility-change` | `ColumnVisibilityChangeEvent` | Fired when column visibility changes. |
| `ui-column-order-change` | `ColumnOrderChangeEvent` | Fired when column order changes. |
| `ui-column-preferences-change` | `ColumnPreferencesChangeEvent` | Fired when any column preference changes (sizing, order, visibility). |
| `ui-column-preferences-reset` | `{ tableId: string }` | Fired when preferences are reset. |
| `ui-cell-edit` | `CellEditEvent` | Fired when a cell edit is committed. Includes columnId, oldValue, newValue. |
| `ui-row-edit` | `RowEditEvent` | Fired when a row edit is saved. Includes oldValues and newValues. |
| `ui-row-action` | `RowActionEvent` | Fired when a row action button is clicked. Includes actionId and row data. |
| `ui-bulk-action` | `BulkActionEvent` | Fired when a bulk action is executed. Includes actionId and selectedRows. |
| `ui-expanded-change` | `ExpandedChangeEvent` | Fired when expanded row state changes. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-data-table-header-bg` | `var(--color-muted, #f4f4f5)` | Header row background color. |
| `--ui-data-table-row-bg` | `var(--color-background, #ffffff)` | Data row background color. |
| `--ui-data-table-row-hover-bg` | `var(--color-muted, #f4f4f5)` | Data row background on hover. |
| `--ui-data-table-border-color` | `var(--color-border, #e4e4e7)` | Border color for table, rows, and cells. |
| `--ui-data-table-text-color` | `var(--color-foreground, #09090b)` | Primary text color. |
| `--ui-data-table-header-text` | `var(--color-muted-foreground, #71717a)` | Header cell text color. |
| `--ui-data-table-row-height` | `48px` | Minimum row height. |
| `--ui-data-table-header-height` | `48px` | Header row height. |
| `--ui-data-table-cell-padding` | `0.75rem 1rem` | Padding inside cells. |
| `--ui-data-table-font-size` | `0.875rem` | Font size for cell content. |
| `--ui-data-table-header-font-weight` | `500` | Font weight for header cells. |
| `--ui-data-table-header-hover-bg` | `rgba(0, 0, 0, 0.05)` | Sortable header background on hover. |
| `--ui-data-table-selected-bg` | `rgba(59, 130, 246, 0.1)` | Background for selected rows. |
| `--ui-data-table-selected-hover-bg` | `rgba(59, 130, 246, 0.15)` | Selected row background on hover. |
| `--ui-data-table-banner-bg` | `#eff6ff` | Selection banner / bulk actions toolbar background. |
| `--ui-data-table-overlay-bg` | `rgba(255, 255, 255, 0.7)` | Overlay during "updating" loading state. |
| `--ui-data-table-skeleton-base` | `#e4e4e7` | Skeleton animation base color. |
| `--ui-data-table-skeleton-highlight` | `#f4f4f5` | Skeleton animation highlight color. |
