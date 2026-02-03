# Phase 62: Sorting & Selection - Research

**Researched:** 2026-02-03
**Domain:** Data Table Sorting, Row Selection, Bulk Actions
**Confidence:** HIGH

## Summary

This phase adds sorting and selection capabilities to the data table component built in Phase 61. The research confirms that **TanStack Table already provides comprehensive built-in APIs** for both sorting and row selection, eliminating the need for custom state management. The existing `@tanstack/lit-table` integration with `TableController` supports sorting via `getSortedRowModel()` and selection via row selection state, both of which are already re-exported from the package.

Sorting implementation involves enabling `getSortedRowModel()`, adding click handlers with shift-key detection for multi-sort, rendering sort indicators with proper `aria-sort` attributes, and supporting both client-side and server-side (manual) sorting modes. Multi-column sorting is enabled by default when using `column.getToggleSortingHandler()`.

Selection implementation involves enabling row selection state, adding a selection column with checkboxes, implementing shift+click range selection via a `getRowRange` helper, and handling the "select all across pages" pattern with a banner link. The existing `lui-checkbox` component already supports the indeterminate state required for partial selection.

**Primary recommendation:** Use TanStack Table's built-in sorting and selection APIs exclusively. Do not implement custom state management. Extend the existing DataTable component with sorting/selection features, reusing the existing `lui-checkbox` component for selection checkboxes.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/lit-table | 8.21.x | Sorting and selection state | Already in use; provides `getSortedRowModel()`, `RowSelectionState`, built-in multi-sort |
| lui-checkbox | existing | Selection checkboxes | Already supports indeterminate state, matches design system |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/table-core | 8.21.x | Sorting functions | `alphanumeric`, `text`, `datetime`, `basic` sorting functions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack sorting | Custom sort | TanStack handles stable sort, edge cases, multi-column priority |
| TanStack selection | Custom selection state | TanStack handles row IDs, pagination integration |
| lui-checkbox | Native checkbox | lui-checkbox provides consistent styling, indeterminate support |

**Installation:**
```bash
# Already installed - no additional packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
packages/data-table/
├── src/
│   ├── data-table.ts              # Extended with sorting and selection
│   ├── types.ts                   # Add selection events, sort state types
│   ├── selection-column.ts        # Selection checkbox column factory
│   ├── sort-indicator.ts          # Sort arrow/priority indicator component
│   └── keyboard-navigation.ts     # (existing) No changes needed
```

### Pattern 1: TanStack Table Sorting Integration
**What:** Add `getSortedRowModel()` to table configuration and enable sorting on columns
**When to use:** Always for client-side sorting
**Example:**
```typescript
// Source: TanStack Table Sorting Guide
import {
  TableController,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/lit-table';

@customElement('lui-data-table')
export class DataTable<TData extends RowData> extends TailwindElement {
  private tableController = new TableController<TData>(this);

  @property({ type: Array })
  sorting: SortingState = [];

  @property({ type: Boolean, attribute: 'manual-sorting' })
  manualSorting = false;

  protected render() {
    const table = this.tableController.table({
      columns: this.columns,
      data: this.data,
      state: {
        sorting: this.sorting,
      },
      onSortingChange: (updater) => {
        const newSorting = typeof updater === 'function'
          ? updater(this.sorting)
          : updater;
        this.sorting = newSorting;
        dispatchCustomEvent(this, 'ui-sort-change', { sorting: newSorting });
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: this.manualSorting ? undefined : getSortedRowModel(),
      manualSorting: this.manualSorting,
    });
    // ... render
  }
}
```

### Pattern 2: Multi-Sort with Shift-Click
**What:** Use `getToggleSortingHandler()` which automatically handles shift-key for multi-sort
**When to use:** Always - provides expected multi-sort UX
**Example:**
```typescript
// Source: TanStack Table Sorting Guide
private renderHeaderCell(header: Header<TData, unknown>, colIndex: number) {
  const canSort = header.column.getCanSort();
  const sortDirection = header.column.getIsSorted(); // false | 'asc' | 'desc'
  const sortIndex = header.column.getSortIndex(); // -1 if not sorted, 0+ for priority

  return html`
    <div
      role="columnheader"
      aria-colindex="${colIndex + 1}"
      aria-sort=${sortDirection ? (sortDirection === 'asc' ? 'ascending' : 'descending') : nothing}
      class="data-table-header-cell ${canSort ? 'sortable' : ''}"
      @click=${canSort ? header.column.getToggleSortingHandler() : nothing}
      tabindex="${canSort ? '0' : '-1'}"
    >
      <span class="header-content">
        ${flexRender(header.column.columnDef.header, header.getContext())}
      </span>
      ${canSort ? this.renderSortIndicator(sortDirection, sortIndex) : nothing}
    </div>
  `;
}
```

### Pattern 3: Row Selection State Management
**What:** Use TanStack's RowSelectionState with custom row ID getter
**When to use:** Always for selection features
**Example:**
```typescript
// Source: TanStack Table Row Selection Guide
import { type RowSelectionState } from '@tanstack/lit-table';

@property({ type: Object })
rowSelection: RowSelectionState = {};

@property({ attribute: 'row-id-key' })
rowIdKey = 'id';

protected render() {
  const table = this.tableController.table({
    columns: this.columns,
    data: this.data,
    state: {
      rowSelection: this.rowSelection,
    },
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function'
        ? updater(this.rowSelection)
        : updater;
      this.rowSelection = newSelection;
      dispatchCustomEvent(this, 'ui-selection-change', {
        rowSelection: newSelection,
        selectedRows: table.getSelectedRowModel().rows.map(r => r.original),
      });
    },
    getRowId: (row) => String(row[this.rowIdKey]),
    enableRowSelection: this.enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });
}
```

### Pattern 4: Shift+Click Range Selection
**What:** Track last selected ID and select/deselect range on shift+click
**When to use:** Always for SEL-03 requirement
**Example:**
```typescript
// Source: TanStack Table Discussion #3068
private lastSelectedRowId: string | null = null;

private handleRowSelect(row: Row<TData>, event: MouseEvent) {
  if (event.shiftKey && this.lastSelectedRowId) {
    const { rows } = this.tableController.table().getRowModel();
    const range = this.getRowRange(rows, row.id, this.lastSelectedRowId);
    const isLastSelected = rows.find(r => r.id === this.lastSelectedRowId)?.getIsSelected() ?? false;
    range.forEach(r => r.toggleSelected(isLastSelected));
  } else {
    row.toggleSelected();
  }
  this.lastSelectedRowId = row.id;
}

private getRowRange(rows: Row<TData>[], idA: string, idB: string): Row<TData>[] {
  const range: Row<TData>[] = [];
  let foundStart = false;
  let foundEnd = false;

  for (const row of rows) {
    if (row.id === idA || row.id === idB) {
      if (foundStart) {
        foundEnd = true;
      } else {
        foundStart = true;
      }
    }
    if (foundStart) range.push(row);
    if (foundEnd) break;
  }
  return range;
}
```

### Pattern 5: Select All Across Pages Banner
**What:** Show "Select all X items" link when page is fully selected
**When to use:** Required for SEL-04
**Example:**
```typescript
// Source: PatternFly Bulk Selection Pattern
private renderSelectionBanner(table: Table<TData>) {
  const isAllPageSelected = table.getIsAllPageRowsSelected();
  const totalCount = this.manualPagination ? this.totalRowCount : this.data.length;
  const selectedCount = Object.keys(this.rowSelection).length;

  // Only show banner when all page rows are selected but not all rows globally
  if (!isAllPageSelected || selectedCount >= totalCount) {
    return nothing;
  }

  return html`
    <div class="selection-banner" role="status">
      <span>${selectedCount} items on this page selected.</span>
      <button
        class="select-all-link"
        @click=${() => this.selectAllRows(totalCount)}
      >
        Select all ${totalCount} items
      </button>
    </div>
  `;
}

private selectAllRows(totalCount: number) {
  // For client-side: select all data rows
  // For server-side: emit event with intent, let parent handle
  if (this.manualPagination) {
    dispatchCustomEvent(this, 'ui-select-all-requested', { totalCount });
  } else {
    this.tableController.table().toggleAllRowsSelected(true);
  }
}
```

### Anti-Patterns to Avoid
- **Custom sorting logic:** TanStack Table provides optimized, stable sorting with proper edge case handling
- **Storing selection as row objects:** Store row IDs, not objects. Objects change on re-fetch
- **Resetting selection on any data change:** Only reset on filter changes (configurable), not on page changes
- **Using `aria-sort="none"`:** Remove `aria-sort` attribute entirely when column is not sorted
- **Tab navigation to sort headers:** Headers should be clickable but not in tab order by default (arrow key navigation via grid pattern)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sort state management | Custom sorting array | TanStack `SortingState` | Handles multi-sort priority, stable sort |
| Sort direction toggle | Manual asc/desc/none cycle | `column.getToggleSortingHandler()` | Handles shift-key multi-sort automatically |
| Selection state | Custom Set/Map of IDs | TanStack `RowSelectionState` | Integrates with row models, pagination |
| Select all page | Manual iteration | `table.toggleAllPageRowsSelected()` | Handles edge cases, pagination |
| Indeterminate checkbox | Custom CSS | `lui-checkbox indeterminate` | Already implemented, accessible |
| Row range calculation | Manual index math | `getRowRange` helper | Handles edge cases, bidirectional |

**Key insight:** TanStack Table was specifically designed for these features. The APIs handle edge cases like stable sorting, pagination-aware selection, and multi-sort priority that are easy to get wrong in custom implementations.

## Common Pitfalls

### Pitfall 1: Selection Lost on Data Refresh
**What goes wrong:** Selected row IDs exist but rows with those IDs are no longer in data array after refresh
**Why it happens:** Data fetched from server has different object references or IDs changed
**How to avoid:**
- Use stable row IDs (database IDs, not array indices)
- Keep selection state separate from row data
- Validate selection IDs exist in current data before rendering
**Warning signs:** Console errors about undefined rows, checkboxes appear unchecked after data refresh

### Pitfall 2: Shift+Click Selects Wrong Range with Virtualization
**What goes wrong:** Range selection includes rows that aren't visible or skips rows
**Why it happens:** Virtual rows have different indices than data array; using DOM order instead of data order
**How to avoid:**
- Use TanStack row model for range calculation, not DOM queries
- Track row IDs, not DOM indices or virtual indices
- Calculate range against `table.getRowModel().rows`, not virtualized items
**Warning signs:** Selecting rows 5-10 actually selects rows 3-8, or some rows in range stay unselected

### Pitfall 3: Multi-Sort Priority Display Confusion
**What goes wrong:** Users don't understand which column is primary sort vs secondary
**Why it happens:** Only showing direction arrows without priority numbers
**How to avoid:**
- Display priority numbers (1, 2, 3) on sorted columns when multiple columns are sorted
- Use `column.getSortIndex()` to get 0-based priority (-1 if not sorted)
- Show visual distinction between primary and secondary sorts
**Warning signs:** Users repeatedly clicking columns trying to change primary sort

### Pitfall 4: Server-Side Sort Ignores Multi-Sort
**What goes wrong:** Only first sort column is sent to server, secondary sorts ignored
**Why it happens:** Backend API only accepts single sort parameter
**How to avoid:**
- Design API to accept array of sort objects: `[{ column: 'name', direction: 'asc' }, ...]`
- Limit `maxMultiSortColCount` if backend has limits
- Document multi-sort behavior for server-side mode
**Warning signs:** UI shows multi-sort indicators but data order doesn't reflect all sorts

### Pitfall 5: Select All Across Pages Creates Memory Issues
**What goes wrong:** Selecting all 100K rows crashes browser or causes extreme lag
**Why it happens:** Storing 100K row IDs in selection state, or trying to render all as selected
**How to avoid:**
- For very large datasets, use "select all" flag instead of storing all IDs
- Track exceptions (deselected rows) instead of selected rows
- Consider selection model: `{ mode: 'all' | 'none' | 'some', excludedIds: string[], includedIds: string[] }`
**Warning signs:** Browser becomes unresponsive after clicking "Select all X items"

### Pitfall 6: aria-sort on Multiple Columns
**What goes wrong:** Screen reader announces confusing sort states
**Why it happens:** Setting `aria-sort` on multiple column headers simultaneously
**How to avoid:**
- Only set `aria-sort` on the PRIMARY sorted column (sortIndex === 0)
- Use visual indicators (numbers) for secondary sorts, not aria-sort
- Alternative: set `aria-sort` on most recently clicked column
**Warning signs:** Screen reader says "sorted ascending" on multiple columns

## Code Examples

Verified patterns from official sources:

### Selection Column Factory
```typescript
// Source: TanStack Table Row Selection Guide + lui-checkbox integration
import { type ColumnDef } from '@tanstack/lit-table';
import { html } from 'lit';

export function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: '_selection',
    header: ({ table }) => html`
      <lui-checkbox
        size="sm"
        .checked=${table.getIsAllPageRowsSelected()}
        .indeterminate=${table.getIsSomePageRowsSelected()}
        @ui-change=${() => table.toggleAllPageRowsSelected()}
        aria-label="Select all rows on this page"
      ></lui-checkbox>
    `,
    cell: ({ row }) => html`
      <lui-checkbox
        size="sm"
        .checked=${row.getIsSelected()}
        .disabled=${!row.getCanSelect()}
        @ui-change=${() => row.toggleSelected()}
        aria-label="Select row"
      ></lui-checkbox>
    `,
    size: 48,
    enableSorting: false,
    enableColumnFilter: false,
  };
}
```

### Sort Indicator Component
```typescript
// Source: W3C APG Sortable Table Pattern
private renderSortIndicator(
  direction: false | 'asc' | 'desc',
  sortIndex: number
): TemplateResult {
  const showPriority = sortIndex > 0; // Only show for secondary+ sorts

  return html`
    <span class="sort-indicator" aria-hidden="true">
      ${direction === 'asc' ? html`
        <svg viewBox="0 0 12 12" class="sort-icon">
          <path d="M6 3L10 9H2L6 3Z" fill="currentColor"/>
        </svg>
      ` : direction === 'desc' ? html`
        <svg viewBox="0 0 12 12" class="sort-icon">
          <path d="M6 9L2 3H10L6 9Z" fill="currentColor"/>
        </svg>
      ` : html`
        <svg viewBox="0 0 12 12" class="sort-icon unsorted">
          <path d="M6 2L9 5H3L6 2ZM6 10L3 7H9L6 10Z" fill="currentColor" opacity="0.3"/>
        </svg>
      `}
      ${showPriority ? html`<span class="sort-priority">${sortIndex + 1}</span>` : nothing}
    </span>
  `;
}
```

### Server-Side Sorting Handler
```typescript
// Source: TanStack Table Manual Sorting pattern
@property({ type: Boolean, attribute: 'manual-sorting' })
manualSorting = false;

private handleSortChange(sortingState: SortingState): void {
  this.sorting = sortingState;

  if (this.manualSorting) {
    // Emit event for parent to fetch sorted data from server
    dispatchCustomEvent(this, 'ui-sort-change', {
      sorting: sortingState,
      // Helper format for REST APIs
      sortParams: sortingState.map(s => ({
        column: s.id,
        direction: s.desc ? 'desc' : 'asc',
      })),
    });
  }
}
```

### Selection Persistence Across Pagination
```typescript
// Source: TanStack Table + Helios Design System pattern
@property({ type: Boolean, attribute: 'preserve-selection-on-filter' })
preserveSelectionOnFilter = false;

private previousFilters: string = '';

protected updated(changedProperties: PropertyValues): void {
  super.updated(changedProperties);

  // SEL-06: Clear selection when filters change (unless configured to preserve)
  if (changedProperties.has('columnFilters') || changedProperties.has('globalFilter')) {
    const currentFilters = JSON.stringify({
      columnFilters: this.columnFilters,
      globalFilter: this.globalFilter,
    });

    if (this.previousFilters && currentFilters !== this.previousFilters) {
      if (!this.preserveSelectionOnFilter) {
        this.rowSelection = {};
        dispatchCustomEvent(this, 'ui-selection-change', {
          rowSelection: {},
          selectedRows: [],
          reason: 'filter-changed',
        });
      }
    }
    this.previousFilters = currentFilters;
  }
}
```

### Accessible Sort Header CSS
```css
/* Source: W3C APG Sortable Table + MDN aria-sort */
.data-table-header-cell.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table-header-cell.sortable:hover {
  background: var(--ui-data-table-header-hover-bg);
}

.data-table-header-cell.sortable:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.sort-indicator {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
}

.sort-icon {
  width: 12px;
  height: 12px;
}

.sort-icon.unsorted {
  opacity: 0.3;
}

.sort-priority {
  font-size: 10px;
  font-weight: 600;
  min-width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border-radius: 50%;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom sort comparators | TanStack built-in sorting functions | TanStack Table v8 (2022) | Stable sort, localization support |
| Row index selection | Row ID-based selection | TanStack Table v8 | Pagination-safe selection |
| Tri-state checkbox JS | Native indeterminate + aria-checked="mixed" | ~2020 | Better accessibility |
| aria-sort on all columns | aria-sort on primary only | W3C APG clarification | Clearer screen reader UX |

**Deprecated/outdated:**
- `aria-sort="none"`: Remove attribute instead of setting to "none"
- Index-based selection: Use unique row IDs for stability across pagination/sorting

## Open Questions

Things that couldn't be fully resolved:

1. **Maximum Multi-Sort Columns**
   - What we know: TanStack supports `maxMultiSortColCount` option
   - What's unclear: Optimal UX limit (2? 3? unlimited?)
   - Recommendation: Default to 3, make configurable. Most users won't need more than 3 sort columns.

2. **Select All with Server-Side Pagination**
   - What we know: `getSelectedRowModel()` only returns current page rows with manual pagination
   - What's unclear: Best pattern for "select all 100K items" with server-side data
   - Recommendation: Use "intent" model - track `selectAllMode: boolean` flag plus `excludedIds: string[]` for deselected items. Emit event for parent to handle.

3. **Sort Keyboard Shortcut**
   - What we know: Headers are clickable for sorting
   - What's unclear: Should Enter/Space on focused header trigger sort?
   - Recommendation: Yes, since headers with sorting have `tabindex="0"`. Follow button semantics.

## Sources

### Primary (HIGH confidence)
- [TanStack Table Sorting Guide](https://github.com/TanStack/table/blob/main/docs/guide/sorting.md) - SortingState, getSortedRowModel, multi-sort
- [TanStack Table Row Selection Guide](https://github.com/TanStack/table/blob/main/docs/guide/row-selection.md) - RowSelectionState, selection APIs
- [MDN aria-sort](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-sort) - Attribute values, single-column rule
- [W3C APG Sortable Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/) - Button in header pattern, visual indicators

### Secondary (MEDIUM confidence)
- [TanStack Discussion #3068](https://github.com/TanStack/table/discussions/3068) - Shift+click range selection pattern
- [Helios Design System Table Multi-Select](https://helios.hashicorp.design/patterns/table-multi-select) - Selection scopes, banner pattern
- [PatternFly Bulk Selection](https://www.patternfly.org/patterns/bulk-selection/) - Indeterminate checkbox, select all link
- [Adrian Roselli: Sortable Table Columns](https://adrianroselli.com/2021/04/sortable-table-columns.html) - Accessibility best practices

### Tertiary (LOW confidence)
- [Eleken Bulk Action UX](https://www.eleken.co/blog-posts/bulk-actions-ux) - UX guidelines for bulk selection
- Community discussions on scroll position preservation during sort

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - TanStack APIs verified against official documentation
- Architecture: HIGH - Patterns based on official guides and existing Phase 61 implementation
- Pitfalls: MEDIUM - Based on GitHub issues, discussions, and common virtualization challenges

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - TanStack Table stable, patterns well-established)
