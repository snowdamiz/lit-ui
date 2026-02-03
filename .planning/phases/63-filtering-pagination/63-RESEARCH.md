# Phase 63: Filtering & Pagination - Research

**Researched:** 2026-02-03
**Domain:** Data Table Column Filtering, Global Search, Pagination, Async Data Fetching
**Confidence:** HIGH

## Summary

This phase adds filtering and pagination capabilities to the data table component built in Phases 61-62. The research confirms that **TanStack Table already provides comprehensive built-in APIs** for column filtering, global filtering, and pagination, eliminating the need for custom state management. The existing infrastructure from Phases 61-62 (TableController, VirtualizerController, Lit integration) extends naturally to support these features.

Column filtering requires implementing type-specific filter inputs (text/contains, numeric range, date range, enum/multi-select) that integrate with TanStack Table's `ColumnFiltersState` and `getFilteredRowModel()`. Global search uses a separate `globalFilter` state that searches across all filterable columns simultaneously. Both filtering modes support client-side (automatic via row models) and server-side (manual mode with events) operation.

Pagination implementation uses TanStack Table's `PaginationState` with `getPaginatedRowModel()` for client-side mode. The pagination controls require standard UI patterns: page navigation buttons (first, prev, next, last), page size selector dropdown, and current page/total display. Server-side pagination uses manual mode, passing page/size parameters via the async data callback.

The async data callback pattern requires careful handling: AbortController for request cancellation, debouncing for filter input (300-500ms), loading states, and error handling with retry capability. Existing project components (`lui-input`, `lui-select`, `lui-popover`) can be reused for filter UI.

**Primary recommendation:** Extend the existing DataTable component with TanStack Table's filtering and pagination APIs. Implement type-specific filter components as separate files. Use debounced filter input (300ms) and AbortController for async data handling. Reuse existing `lui-input`, `lui-select`, and `lui-popover` components for filter UI.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/lit-table | 8.21.x | Filter and pagination state | Already in use; provides `getFilteredRowModel()`, `getPaginatedRowModel()`, `ColumnFiltersState`, `PaginationState` |
| lui-input | existing | Text/number filter inputs | Already supports text, number, search types with clearable option |
| lui-select | existing | Enum multi-select filters | Already supports multiple selection with checkboxes |
| lui-popover | existing | Filter popover containers | Already supports click-to-toggle, positioning, light dismiss |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/table-core | 8.21.x | Built-in filter functions | `includesString`, `inNumberRange`, `arrIncludesSome` for filter types |
| @lit/task | existing | Async data state | Task controller for loading/error/success states |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack filtering | Custom filter logic | TanStack handles edge cases, multi-column, manual mode integration |
| TanStack pagination | Custom pagination | TanStack integrates with row models, handles page count calculation |
| lui-input for filters | Native inputs | lui-input provides consistent styling, clearable, validation |
| lui-popover for filter dropdowns | Inline filters | Popover saves space, better for tables with many columns |

**Installation:**
```bash
# Already installed - no additional packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
packages/data-table/
├── src/
│   ├── data-table.ts              # Extended with filtering and pagination
│   ├── types.ts                   # Add filter types, pagination types, async callback types
│   ├── filters/
│   │   ├── index.ts               # Re-export all filter components
│   │   ├── text-filter.ts         # Text/contains filter input
│   │   ├── number-filter.ts       # Numeric range filter (min/max)
│   │   ├── date-filter.ts         # Date range filter
│   │   ├── select-filter.ts       # Enum multi-select filter
│   │   └── global-search.ts       # Global search input
│   ├── pagination/
│   │   ├── index.ts               # Re-export pagination components
│   │   ├── pagination-controls.ts # Page nav buttons, page size selector
│   │   └── pagination-info.ts     # "Showing X-Y of Z" display
│   └── async-handler.ts           # AbortController, debounce, error handling
```

### Pattern 1: TanStack Table Column Filtering Integration
**What:** Add `getFilteredRowModel()` to table configuration and enable per-column filters
**When to use:** Always for client-side filtering
**Example:**
```typescript
// Source: TanStack Table Column Filtering Guide
import {
  TableController,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
} from '@tanstack/lit-table';

@customElement('lui-data-table')
export class DataTable<TData extends RowData> extends TailwindElement {
  private tableController = new TableController<TData>(this);

  @property({ type: Array })
  columnFilters: ColumnFiltersState = [];

  @property({ type: String, attribute: 'global-filter' })
  globalFilter = '';

  @property({ type: Boolean, attribute: 'manual-filtering' })
  manualFiltering = false;

  protected render() {
    const table = this.tableController.table({
      columns: this.columns,
      data: this.data,
      state: {
        columnFilters: this.columnFilters,
        globalFilter: this.globalFilter,
      },
      onColumnFiltersChange: (updater) => {
        const newFilters = typeof updater === 'function'
          ? updater(this.columnFilters)
          : updater;
        this.columnFilters = newFilters;
        this.dispatchFilterChange(newFilters);
      },
      onGlobalFilterChange: (updater) => {
        const newGlobalFilter = typeof updater === 'function'
          ? updater(this.globalFilter)
          : updater;
        this.globalFilter = newGlobalFilter;
        this.dispatchGlobalFilterChange(newGlobalFilter);
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: this.manualSorting ? undefined : getSortedRowModel(),
      getFilteredRowModel: this.manualFiltering ? undefined : getFilteredRowModel(),
      manualFiltering: this.manualFiltering,
    });
    // ... render
  }
}
```

### Pattern 2: Built-in Filter Functions by Column Type
**What:** Use TanStack's filter functions matched to column data type
**When to use:** Define `filterFn` on each column definition
**Example:**
```typescript
// Source: TanStack Table filterFns.ts
// Text columns - case-insensitive contains
const textColumn: ColumnDef<TData> = {
  accessorKey: 'name',
  header: 'Name',
  filterFn: 'includesString', // Built-in: case-insensitive includes
};

// Number columns - range filter
const numberColumn: ColumnDef<TData> = {
  accessorKey: 'price',
  header: 'Price',
  filterFn: 'inNumberRange', // Built-in: [min, max] tuple
};

// Enum/select columns - multi-select
const statusColumn: ColumnDef<TData> = {
  accessorKey: 'status',
  header: 'Status',
  filterFn: 'arrIncludesSome', // Built-in: value in array of selected
  meta: {
    filterOptions: ['active', 'inactive', 'pending'], // Custom meta for UI
  },
};

// Date columns - custom range filter
const dateColumn: ColumnDef<TData> = {
  accessorKey: 'createdAt',
  header: 'Created',
  filterFn: (row, columnId, filterValue: [Date | null, Date | null]) => {
    const [start, end] = filterValue;
    const value = row.getValue<Date>(columnId);
    if (start && value < start) return false;
    if (end && value > end) return false;
    return true;
  },
};
```

### Pattern 3: Pagination State Management
**What:** Use TanStack's PaginationState with page navigation methods
**When to use:** Always for paginated tables
**Example:**
```typescript
// Source: TanStack Table Pagination Guide
import {
  getPaginatedRowModel,
  type PaginationState,
} from '@tanstack/lit-table';

@property({ type: Object })
pagination: PaginationState = { pageIndex: 0, pageSize: 25 };

@property({ type: Boolean, attribute: 'manual-pagination' })
manualPagination = false;

@property({ type: Number, attribute: 'page-count' })
pageCount?: number; // Required for server-side pagination

protected render() {
  const table = this.tableController.table({
    // ... other config
    state: {
      pagination: this.pagination,
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function'
        ? updater(this.pagination)
        : updater;
      this.pagination = newPagination;
      this.dispatchPaginationChange(newPagination);
    },
    getPaginatedRowModel: this.manualPagination ? undefined : getPaginatedRowModel(),
    manualPagination: this.manualPagination,
    pageCount: this.pageCount, // For manual mode
  });
}
```

### Pattern 4: Async Data Callback with AbortController
**What:** Provide async function that receives table state and returns data
**When to use:** Server-side filtering/sorting/pagination (manual mode)
**Example:**
```typescript
// Source: AbortController best practices
export type DataCallback<TData> = (
  params: DataCallbackParams,
  signal: AbortSignal
) => Promise<DataCallbackResult<TData>>;

export interface DataCallbackParams {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
}

export interface DataCallbackResult<TData> {
  data: TData[];
  totalRowCount: number;
  pageCount?: number;
}

// In DataTable component
@property({ attribute: false })
dataCallback?: DataCallback<TData>;

private abortController?: AbortController;
private debounceTimeout?: ReturnType<typeof setTimeout>;

private async fetchData(): Promise<void> {
  if (!this.dataCallback) return;

  // Cancel any pending request
  this.abortController?.abort();
  this.abortController = new AbortController();

  const params: DataCallbackParams = {
    pageIndex: this.pagination.pageIndex,
    pageSize: this.pagination.pageSize,
    sorting: this.sorting,
    columnFilters: this.columnFilters,
    globalFilter: this.globalFilter,
  };

  this.loading = 'updating';

  try {
    const result = await this.dataCallback(params, this.abortController.signal);
    this.data = result.data;
    this.totalRowCount = result.totalRowCount;
    if (result.pageCount !== undefined) {
      this.pageCount = result.pageCount;
    }
    this.loading = 'idle';
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // Request was cancelled, ignore
      return;
    }
    this.errorState = { message: (error as Error).message, canRetry: true };
    this.loading = 'idle';
  }
}
```

### Pattern 5: Debounced Filter Input
**What:** Delay data fetch until user stops typing
**When to use:** Always for filter inputs that trigger server requests
**Example:**
```typescript
// Source: Debounce best practices (300-500ms recommended)
private debouncedFetchData = (): void => {
  clearTimeout(this.debounceTimeout);
  this.debounceTimeout = setTimeout(() => {
    this.fetchData();
  }, 300); // 300ms debounce for filter input
};

// Cancel debounce on disconnect
override disconnectedCallback(): void {
  super.disconnectedCallback();
  clearTimeout(this.debounceTimeout);
  this.abortController?.abort();
}

// Call debounced version for filter changes
private handleFilterChange(): void {
  if (this.manualFiltering && this.dataCallback) {
    this.debouncedFetchData();
  }
}

// Call immediate version for pagination (user expects instant response)
private handlePaginationChange(): void {
  if (this.manualPagination && this.dataCallback) {
    this.fetchData(); // No debounce for page navigation
  }
}
```

### Anti-Patterns to Avoid
- **Filtering every keystroke without debounce:** Causes excessive server requests; use 300-500ms debounce
- **Not cancelling previous requests:** Leads to race conditions where stale data overwrites current; always use AbortController
- **Resetting page to 0 on every filter change:** Should reset pageIndex when filters change, but not on sorting
- **Using `filterFn: 'arrIncludesSome'` on string columns:** Only works with array data; use `includesString` for strings
- **Inline filter inputs in narrow columns:** Use popover approach for columns narrower than ~150px
- **Forgetting to handle AbortError:** Don't show error UI for intentionally cancelled requests

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Filter state management | Custom filter array | TanStack `ColumnFiltersState` | Integrates with row models, handles multi-column |
| Text contains filter | Manual `includes()` | TanStack `includesString` | Case-insensitive, handles null/undefined |
| Number range filter | Manual comparison | TanStack `inNumberRange` | Handles NaN, Infinity, swapped min/max |
| Multi-select filter | Custom Set logic | TanStack `arrIncludesSome` | Handles edge cases, empty arrays |
| Pagination math | Custom page calculations | TanStack pagination API | `getPageCount()`, `getCanPreviousPage()`, etc. |
| Request cancellation | Custom flag tracking | AbortController | Native API, works with fetch |
| Debounce implementation | Custom setTimeout | Utility function or library | Handles cleanup, cancellation |
| Filter input component | Custom input | `lui-input` with `type="search"` | Already styled, clearable, accessible |
| Multi-select dropdown | Custom checkbox list | `lui-select` with `multiple` | Already virtualized, styled, accessible |

**Key insight:** TanStack Table and existing LitUI components handle the complex edge cases. Filter functions like `inNumberRange` handle NaN, Infinity, and swapped ranges. Components like `lui-select` already handle virtualization for large option lists.

## Common Pitfalls

### Pitfall 1: Race Conditions with Async Filtering
**What goes wrong:** User types "abc", server returns results for "ab" after results for "abc" arrive
**Why it happens:** Earlier requests complete after later ones due to network timing
**How to avoid:**
- Always abort previous request before starting new one
- Check if component is still mounted when handling response
- Handle AbortError separately from actual errors
**Warning signs:** Stale data appearing after filter changes, filter input not matching displayed results

### Pitfall 2: Page Reset Logic on Filter Changes
**What goes wrong:** User on page 5, changes filter, stays on page 5 but only has 2 pages of results
**Why it happens:** Filter changes reduce total results but pageIndex not reset
**How to avoid:**
- Reset `pageIndex` to 0 whenever `columnFilters` or `globalFilter` changes
- TanStack's `autoResetPageIndex` option handles this automatically for client-side
- For server-side, emit event and let parent handle reset
**Warning signs:** Empty pages, "Page 5 of 2" display, blank table after filtering

### Pitfall 3: Filter Popover Positioning in Scrollable Tables
**What goes wrong:** Filter popover appears in wrong position after scrolling, or gets cut off
**Why it happens:** Using `position: absolute` relative to table header, not accounting for scroll
**How to avoid:**
- Use `lui-popover` which uses Floating UI with `position: fixed`
- Enable `autoUpdate` to reposition on scroll
- Set proper z-index above table header sticky positioning
**Warning signs:** Popovers appearing below table, cut off at container edges, misaligned after scroll

### Pitfall 4: Date Filtering Timezone Issues
**What goes wrong:** Filtering by "today" includes or excludes wrong records
**Why it happens:** Comparing Date objects without normalizing timezone/time component
**How to avoid:**
- Compare timestamps or date strings, not Date objects directly
- Normalize to start/end of day in appropriate timezone
- Document expected date format in API contract
**Warning signs:** Off-by-one day errors, different behavior in different timezones

### Pitfall 5: Memory Leaks with Debounce Timeouts
**What goes wrong:** Component unmounts but timeout callback fires, updates unmounted component
**Why it happens:** Not clearing timeout in `disconnectedCallback`
**How to avoid:**
- Always call `clearTimeout()` in `disconnectedCallback`
- Always call `abortController.abort()` in `disconnectedCallback`
- Check for mounted state in async callbacks
**Warning signs:** Console warnings about updating unmounted components, memory increasing over time

### Pitfall 6: Filter Input Focus Loss on Re-render
**What goes wrong:** User types, filter updates, input loses focus
**Why it happens:** Conditional rendering destroys and recreates input element
**How to avoid:**
- Keep filter inputs always rendered, hide with CSS if needed
- Use `keyed` directive with stable key
- Maintain focus state across re-renders
**Warning signs:** Cursor jumping to end of input, focus lost mid-typing

## Code Examples

Verified patterns from official sources:

### Text Filter Component
```typescript
// Source: lui-input integration + TanStack Table
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('lui-column-text-filter')
export class ColumnTextFilter extends LitElement {
  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = 'Filter...';

  @property({ type: String, attribute: 'column-id' })
  columnId = '';

  private debounceTimeout?: ReturnType<typeof setTimeout>;

  static styles = css`
    :host { display: block; }
    lui-input { width: 100%; }
  `;

  private handleInput(e: CustomEvent): void {
    const value = (e.target as HTMLInputElement).value;
    this.value = value;

    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('filter-change', {
        detail: { columnId: this.columnId, value: value || undefined },
        bubbles: true,
        composed: true,
      }));
    }, 300);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.debounceTimeout);
  }

  render() {
    return html`
      <lui-input
        type="search"
        size="sm"
        .value=${this.value}
        placeholder=${this.placeholder}
        clearable
        @input=${this.handleInput}
      ></lui-input>
    `;
  }
}
```

### Number Range Filter Component
```typescript
// Source: TanStack inNumberRange filter + lui-input
@customElement('lui-column-number-filter')
export class ColumnNumberFilter extends LitElement {
  @property({ type: Array })
  value: [number | null, number | null] = [null, null];

  @property({ type: String, attribute: 'column-id' })
  columnId = '';

  private handleMinChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const min = input.value ? parseFloat(input.value) : null;
    this.emitChange([min, this.value[1]]);
  }

  private handleMaxChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const max = input.value ? parseFloat(input.value) : null;
    this.emitChange([this.value[0], max]);
  }

  private emitChange(value: [number | null, number | null]): void {
    // Only emit if at least one value is set
    const filterValue = (value[0] === null && value[1] === null) ? undefined : value;
    this.dispatchEvent(new CustomEvent('filter-change', {
      detail: { columnId: this.columnId, value: filterValue },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="number-filter">
        <lui-input
          type="number"
          size="sm"
          placeholder="Min"
          .value=${this.value[0]?.toString() ?? ''}
          @change=${this.handleMinChange}
        ></lui-input>
        <span class="separator">-</span>
        <lui-input
          type="number"
          size="sm"
          placeholder="Max"
          .value=${this.value[1]?.toString() ?? ''}
          @change=${this.handleMaxChange}
        ></lui-input>
      </div>
    `;
  }
}
```

### Multi-Select Filter Component
```typescript
// Source: lui-select multiple mode + TanStack arrIncludesSome
@customElement('lui-column-select-filter')
export class ColumnSelectFilter extends LitElement {
  @property({ type: Array })
  value: string[] = [];

  @property({ type: Array })
  options: Array<{ value: string; label: string }> = [];

  @property({ type: String, attribute: 'column-id' })
  columnId = '';

  @property({ type: String })
  placeholder = 'Select...';

  private handleChange(e: CustomEvent): void {
    const selectedValues = e.detail.value as string[];
    this.dispatchEvent(new CustomEvent('filter-change', {
      detail: {
        columnId: this.columnId,
        value: selectedValues.length > 0 ? selectedValues : undefined,
      },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <lui-select
        multiple
        size="sm"
        placeholder=${this.placeholder}
        .value=${this.value}
        @ui-change=${this.handleChange}
      >
        ${this.options.map(opt => html`
          <lui-option value=${opt.value}>${opt.label}</lui-option>
        `)}
      </lui-select>
    `;
  }
}
```

### Pagination Controls Component
```typescript
// Source: Shadcn/UI pagination pattern + TanStack Table API
@customElement('lui-pagination-controls')
export class PaginationControls extends LitElement {
  @property({ type: Number, attribute: 'page-index' })
  pageIndex = 0;

  @property({ type: Number, attribute: 'page-count' })
  pageCount = 1;

  @property({ type: Number, attribute: 'page-size' })
  pageSize = 25;

  @property({ type: Array, attribute: 'page-size-options' })
  pageSizeOptions = [10, 25, 50, 100];

  @property({ type: Number, attribute: 'total-rows' })
  totalRows = 0;

  private get canPrevious(): boolean {
    return this.pageIndex > 0;
  }

  private get canNext(): boolean {
    return this.pageIndex < this.pageCount - 1;
  }

  private handleFirst(): void {
    this.dispatchPageChange(0);
  }

  private handlePrevious(): void {
    if (this.canPrevious) {
      this.dispatchPageChange(this.pageIndex - 1);
    }
  }

  private handleNext(): void {
    if (this.canNext) {
      this.dispatchPageChange(this.pageIndex + 1);
    }
  }

  private handleLast(): void {
    this.dispatchPageChange(this.pageCount - 1);
  }

  private handlePageSizeChange(e: CustomEvent): void {
    const newSize = parseInt(e.detail.value, 10);
    this.dispatchEvent(new CustomEvent('page-size-change', {
      detail: { pageSize: newSize },
      bubbles: true,
      composed: true,
    }));
  }

  private dispatchPageChange(pageIndex: number): void {
    this.dispatchEvent(new CustomEvent('page-change', {
      detail: { pageIndex },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const startRow = this.pageIndex * this.pageSize + 1;
    const endRow = Math.min((this.pageIndex + 1) * this.pageSize, this.totalRows);

    return html`
      <div class="pagination-controls" role="navigation" aria-label="Pagination">
        <div class="page-info">
          Showing ${startRow}-${endRow} of ${this.totalRows.toLocaleString()}
        </div>

        <div class="page-size-selector">
          <label for="page-size">Rows per page:</label>
          <lui-select
            id="page-size"
            size="sm"
            .value=${this.pageSize.toString()}
            @ui-change=${this.handlePageSizeChange}
          >
            ${this.pageSizeOptions.map(size => html`
              <lui-option value=${size.toString()}>${size}</lui-option>
            `)}
          </lui-select>
        </div>

        <div class="page-nav" role="group" aria-label="Page navigation">
          <lui-button
            variant="ghost"
            size="sm"
            ?disabled=${!this.canPrevious}
            @click=${this.handleFirst}
            aria-label="First page"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" stroke="currentColor" fill="none"/>
            </svg>
          </lui-button>
          <lui-button
            variant="ghost"
            size="sm"
            ?disabled=${!this.canPrevious}
            @click=${this.handlePrevious}
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" fill="none"/>
            </svg>
          </lui-button>

          <span class="page-indicator">
            Page ${this.pageIndex + 1} of ${this.pageCount}
          </span>

          <lui-button
            variant="ghost"
            size="sm"
            ?disabled=${!this.canNext}
            @click=${this.handleNext}
            aria-label="Next page"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M9 18l6-6-6-6" stroke="currentColor" fill="none"/>
            </svg>
          </lui-button>
          <lui-button
            variant="ghost"
            size="sm"
            ?disabled=${!this.canNext}
            @click=${this.handleLast}
            aria-label="Last page"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" stroke="currentColor" fill="none"/>
            </svg>
          </lui-button>
        </div>
      </div>
    `;
  }
}
```

### Error State with Retry
```typescript
// Source: Accessibility best practices
interface ErrorState {
  message: string;
  canRetry: boolean;
}

private renderErrorState(): TemplateResult {
  if (!this.errorState) return html``;

  return html`
    <div class="error-state" role="alert" aria-live="polite">
      <div class="error-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
      </div>
      <p class="error-message">${this.errorState.message}</p>
      <p class="error-description">Unable to load data. Please try again.</p>
      ${this.errorState.canRetry ? html`
        <lui-button
          variant="outline"
          @click=${this.handleRetry}
        >
          Retry
        </lui-button>
      ` : nothing}
    </div>
  `;
}

private handleRetry(): void {
  this.errorState = null;
  this.fetchData();
}
```

### Filter Indicator on Column Header
```typescript
// Source: FILT-08 requirement
private renderFilterIndicator(column: Column<TData, unknown>): TemplateResult {
  const filterValue = column.getFilterValue();
  const isFiltered = filterValue !== undefined && filterValue !== null && filterValue !== '';

  if (!isFiltered) return html``;

  return html`
    <span
      class="filter-indicator"
      aria-label="Column is filtered"
      title="Column has active filter"
    >
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <path
          d="M1.5 1.5h13L9 7v5.5l-2 1.5V7L1.5 1.5z"
          fill="currentColor"
        />
      </svg>
    </span>
  `;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline filter inputs | Popover-based filters | ~2023 | Better UX for narrow columns, cleaner table appearance |
| Full-page reload filtering | Client-side + debounced server | ~2020 | Faster UX, reduced server load |
| Custom pagination math | TanStack Table pagination | 2022 (v8) | Standardized API, edge case handling |
| setTimeout/clearTimeout | AbortController | ~2020 | Native cancellation, cleaner code |
| Flag-based request cancellation | AbortController.abort() | ~2020 | Works with fetch, standard pattern |

**Deprecated/outdated:**
- Index-based pagination: Use `pageIndex`/`pageSize` tuple, not skip/take
- Manual `includes()` for text filtering: Use TanStack's `includesString` for consistency
- Storing filter values in DOM: Store in component state, let TanStack manage row model

## Open Questions

Things that couldn't be fully resolved:

1. **Filter Popover vs Inline Input Threshold**
   - What we know: Popover saves space, inline is faster to access
   - What's unclear: Exact column width threshold for switching approaches
   - Recommendation: Default to popover for columns < 150px, inline otherwise. Make configurable via column meta.

2. **Date Filter Component Choice**
   - What we know: Need date range filter for FILT-04
   - What's unclear: Whether to use native date inputs or custom date picker
   - Recommendation: Start with native `<input type="date">` for simplicity. Can enhance with custom picker in future phase if needed.

3. **Global Search Debounce vs Column Filter Debounce**
   - What we know: Both need debouncing for server-side mode
   - What's unclear: Should they have different debounce values?
   - Recommendation: Use same 300ms for both. Global search typically affects more columns so could justify longer, but consistency is simpler.

4. **Filter Persistence Across Navigation**
   - What we know: TanStack doesn't persist filters across component unmount
   - What's unclear: Should filters be persisted (localStorage, URL params)?
   - Recommendation: Out of scope for this phase. Document as future enhancement.

## Sources

### Primary (HIGH confidence)
- [TanStack Table Column Filtering Guide](https://tanstack.com/table/v8/docs/guide/column-filtering) - ColumnFiltersState, filter functions, manual filtering
- [TanStack Table Pagination Guide](https://tanstack.com/table/v8/docs/guide/pagination) - PaginationState, page navigation APIs
- [TanStack Table filterFns.ts](https://github.com/TanStack/table/blob/main/packages/table-core/src/filterFns.ts) - Built-in filter function implementations
- [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) - Request cancellation pattern
- [MDN aria-expanded](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded) - Filter popover accessibility

### Secondary (MEDIUM confidence)
- [Helios Design System Pagination](https://helios.hashicorp.design/components/pagination) - Page size selector, control patterns
- [Material React Table Column Filtering](https://www.material-react-table.com/docs/guides/column-filtering) - Filter UI patterns, popover approach
- [FreeCodeCamp Debouncing](https://www.freecodecamp.org/news/optimize-search-in-javascript-with-debouncing/) - 300-500ms recommendation
- [Pencil & Paper Filter UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering) - Enterprise filtering best practices

### Tertiary (LOW confidence)
- [bazza/ui data-table-filter](https://ui.bazza.dev/docs/data-table-filter) - Third-party TanStack Table filter component
- TanStack GitHub Discussions - Date range filter patterns, multi-select implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - TanStack APIs verified against official documentation, existing components confirmed in codebase
- Architecture: HIGH - Patterns based on official guides and existing Phase 61-62 implementation
- Pitfalls: MEDIUM - Based on GitHub issues, discussions, and async programming best practices

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - TanStack Table stable, patterns well-established)
