# Phase 67: Export & Expandable Rows - Research

**Researched:** 2026-02-05
**Domain:** Data table CSV export + expandable/detail row rendering with TanStack Table + TanStack Virtual
**Confidence:** HIGH

## Summary

This phase adds two distinct features to `lui-data-table`: CSV data export and expandable detail rows. Both features build on well-established patterns already present in the codebase.

**CSV Export** is a pure utility function (no new UI components). It reads visible/filtered/selected data from TanStack Table's row models, respects column visibility, formats as RFC 4180 CSV, and triggers a browser download via the Blob API. A server-side callback escape hatch covers large datasets.

**Expandable Rows** leverage TanStack Table's built-in `RowExpanding` feature (already imported: `ExpandedState` in types.ts, `getExpandedRowModel` in index.ts). The main complexity is rendering detail panels as full-width content below data rows within the existing CSS Grid + absolute-positioned virtualizer layout. The detail panel must be rendered as part of the same virtual item (NOT as a separate virtual row) and requires switching from fixed to dynamic row heights via TanStack Virtual's `measureElement`.

**Primary recommendation:** Implement export as a standalone `export-csv.ts` utility module and expandable rows as an `expandable-rows.ts` module following the existing `selection-column.ts` / `row-actions.ts` factory pattern. Both integrate into `data-table.ts` via properties, state, and render method changes.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/lit-table | ^8.21.3 | Expanding state management (ExpandedState, onExpandedChange, getRowCanExpand) | Already installed; RowExpanding feature is built-in |
| @tanstack/lit-virtual | ^3.13.6 | Dynamic row height measurement for expanded rows | Already installed; measureElement + estimateSize handles variable heights |
| Blob API + URL.createObjectURL | Native | Client-side CSV file download | No library needed; browser-native pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | No additional dependencies required |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled CSV generation | PapaParse / csv-stringify | Overkill for write-only export; our CSV generation is simple (no parsing needed) |
| FileSaver.js for download | Native Blob + anchor click | FileSaver.js adds a dependency for IE11 edge cases we don't need |
| Separate virtual items for detail rows | Detail panel inside same virtual item | Separate items would double the virtualizer count and break row identity mapping |

**Installation:**
```bash
# No new dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
```
packages/data-table/src/
├── export-csv.ts            # NEW: CSV export utility (EXP-01 to EXP-04)
├── expandable-rows.ts       # NEW: Expand column factory + detail panel renderer (EXPAND-01 to EXPAND-05)
├── data-table.ts            # MODIFIED: Wire up export method + expanding state + detail panel rendering
├── types.ts                 # MODIFIED: Add export and expand event/config types
├── index.ts                 # MODIFIED: Re-export new utilities
├── selection-column.ts      # REFERENCE: Factory pattern to follow
├── bulk-actions.ts          # REFERENCE: Toolbar pattern to follow
└── ... (existing files)
```

### Pattern 1: CSV Export as Utility Function + Public Method

**What:** A standalone `exportToCsv()` function that accepts a TanStack Table instance and options. The DataTable component exposes it as a public method `exportCsv()` callable from consumer code.

**When to use:** Matches the existing pattern where utility logic lives in separate modules (bulk-actions.ts, row-actions.ts) and the DataTable class wires them up.

**Example:**
```typescript
// export-csv.ts
// Source: Verified against RFC 4180 + existing codebase patterns

export interface ExportCsvOptions {
  /** Filename for the download (default: 'export.csv') */
  filename?: string;
  /** Export only selected rows when true (EXP-02) */
  selectedOnly?: boolean;
  /** Include UTF-8 BOM for Excel compatibility (default: true) */
  includeBom?: boolean;
  /** Custom column headers (override accessor-derived headers) */
  headers?: Record<string, string>;
}

export interface ServerExportParams {
  /** Current column filters */
  columnFilters: ColumnFiltersState;
  /** Current global filter */
  globalFilter: string;
  /** Current sorting state */
  sorting: SortingState;
  /** Column IDs that are visible (EXP-03) */
  visibleColumnIds: string[];
  /** Selected row IDs (empty if none selected) */
  selectedRowIds: string[];
}

/**
 * Export table data to CSV and trigger browser download.
 * Respects current filters, column visibility, and selection state.
 */
export function exportToCsv<TData extends RowData>(
  table: Table<TData>,
  options: ExportCsvOptions = {}
): void {
  const { filename = 'export.csv', selectedOnly = false, includeBom = true } = options;

  // Get rows: selected only or all visible/filtered rows (EXP-01, EXP-02)
  const rows = selectedOnly
    ? table.getSelectedRowModel().rows
    : table.getFilteredRowModel().rows;

  // Get visible columns only, excluding utility columns (EXP-03)
  const columns = table.getVisibleLeafColumns()
    .filter(col => col.id !== '_selection' && col.id !== '_actions');

  // Build CSV header row
  const headerRow = columns.map(col => {
    const header = options.headers?.[col.id] ?? col.id;
    return escapeCsvField(String(header));
  }).join(',');

  // Build data rows
  const dataRows = rows.map(row =>
    columns.map(col => {
      const value = row.getValue(col.id);
      return escapeCsvField(value == null ? '' : String(value));
    }).join(',')
  );

  // Assemble CSV
  const csv = [headerRow, ...dataRows].join('\r\n');

  // Download via Blob API
  const bom = includeBom ? '\uFEFF' : '';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### Pattern 2: Expandable Row Column Factory (Matching createSelectionColumn)

**What:** A `createExpandColumn()` factory function that creates the expand/collapse toggle column, following the same pattern as `createSelectionColumn()`. The column renders a chevron button that calls `row.toggleExpanded()`.

**When to use:** This follows the existing factory pattern exactly. Selection has `createSelectionColumn()`, expanding should have `createExpandColumn()`.

**Example:**
```typescript
// expandable-rows.ts
// Source: Verified against @tanstack/table-core RowExpanding.d.ts + selection-column.ts pattern

import { html, nothing } from 'lit';
import type { ColumnDef, RowData } from './types.js';
import type { Table, Row } from '@tanstack/lit-table';

export function createExpandColumn<TData extends RowData>(): ColumnDef<TData, unknown> {
  return {
    id: '_expand',
    header: () => nothing, // No header needed for expand column
    cell: ({ row }: { row: Row<TData> }) => {
      if (!row.getCanExpand()) return nothing;
      const isExpanded = row.getIsExpanded();
      return html`
        <button
          type="button"
          class="expand-toggle"
          aria-expanded="${isExpanded}"
          aria-label="${isExpanded ? 'Collapse row' : 'Expand row'}"
          @click=${(e: MouseEvent) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
        >
          <svg class="expand-icon ${isExpanded ? 'expanded' : ''}"
            viewBox="0 0 24 24" width="16" height="16"
            fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      `;
    },
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableSorting: false,
    enableColumnFilter: false,
    enableResizing: false,
  };
}
```

### Pattern 3: Detail Panel Rendering Within Virtual Items

**What:** The expanded detail content renders as part of the same virtual item div, below the grid row. This is the critical architectural decision: the detail panel is NOT a separate virtual item. Instead, the virtual item wraps BOTH the data row and the detail panel, and `measureElement` dynamically sizes the virtual item.

**When to use:** Always. Treating the detail panel as a separate virtual item would break row identity, complicate selection, and require mapping between "visual items" and "data rows."

**Example:**
```typescript
// In renderVirtualizedBody, each virtual item becomes a wrapper:
${virtualItems.map((virtualRow) => {
  const row = rows[virtualRow.index];
  if (!row) return nothing;
  const isExpanded = row.getIsExpanded();

  return html`
    <div
      class="virtual-row-wrapper"
      data-index="${virtualRow.index}"
      ${ref((el) => el && virtualizer.measureElement(el))}
      style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        transform: translateY(${virtualRow.start}px);
      "
    >
      <!-- Normal data row (CSS Grid) -->
      <div
        role="row"
        aria-rowindex="${virtualRow.index + 2}"
        class="data-table-row"
        style="grid-template-columns: ${gridTemplateColumns}"
      >
        ${row.getVisibleCells().map((cell, colIndex) =>
          this.renderCell(cell, virtualRow.index, colIndex)
        )}
      </div>
      <!-- Detail panel (full width, shown when expanded) -->
      ${isExpanded && this.renderDetailContent
        ? html`
          <div
            class="detail-panel"
            role="region"
            aria-label="Row details"
          >
            ${this.renderDetailContent(row.original, row)}
          </div>
        `
        : nothing}
    </div>
  `;
})}
```

### Pattern 4: Single-Expand (Accordion) Mode via onExpandedChange

**What:** For EXPAND-04, intercept `onExpandedChange` to enforce at most one expanded row. When a new row expands, collapse any previously expanded rows.

**When to use:** When `singleExpand` property is true on the data table.

**Example:**
```typescript
// In the table options within render():
onExpandedChange: (updater) => {
  const nextExpanded =
    typeof updater === 'function' ? updater(this.expanded) : updater;

  if (this.singleExpand && nextExpanded !== true && typeof nextExpanded === 'object') {
    // Find the newly expanded row
    const prevKeys = this.expanded === true ? [] : Object.keys(this.expanded);
    const nextKeys = Object.keys(nextExpanded);
    const newKey = nextKeys.find(k => !prevKeys.includes(k) || !this.expanded[k]);

    if (newKey) {
      this.expanded = { [newKey]: true };
    } else {
      this.expanded = {};
    }
  } else {
    this.expanded = nextExpanded;
  }
  this.dispatchExpandedChange(this.expanded);
}
```

### Pattern 5: Server-Side Export Callback (EXP-04)

**What:** When a `serverExport` callback is provided, the export button calls it instead of doing client-side CSV generation. The callback receives current filter/sort/visibility/selection state so the server can generate the export.

**When to use:** Large datasets where client-side export isn't practical (server-side pagination, 100K+ rows).

**Example:**
```typescript
// In DataTable class:
@property({ attribute: false })
onExport?: (params: ServerExportParams) => void | Promise<void>;

// Public export method delegates:
public async exportCsv(options?: ExportCsvOptions): Promise<void> {
  if (this.onExport) {
    // Server-side export
    const table = this._tableInstance!;
    const visibleColumnIds = table.getVisibleLeafColumns()
      .filter(c => c.id !== '_selection' && c.id !== '_actions')
      .map(c => c.id);
    const selectedRowIds = Object.keys(this.rowSelection);

    await this.onExport({
      columnFilters: this.columnFilters,
      globalFilter: this.globalFilter,
      sorting: this.sorting,
      visibleColumnIds,
      selectedRowIds,
    });
  } else {
    // Client-side export
    exportToCsv(this._tableInstance!, options);
  }
}
```

### Anti-Patterns to Avoid

- **Separate virtual items for detail rows:** Do NOT create separate virtualizer items for detail panels. This breaks the 1:1 mapping between virtualizer index and data row index, complicates all row lookups, and causes selection/keyboard navigation bugs.
- **Fixed row height with expanding:** Do NOT keep `estimateSize: () => this.rowHeight` as a fixed function. When expanding is enabled, the virtualizer MUST use `measureElement` for dynamic sizing.
- **Rendering detail panels as custom elements:** Do NOT make the detail panel a separate `<lui-detail-panel>` custom element. The detail content must render within the DataTable's shadow DOM, using the same template function pattern as cell renderers.
- **Using TanStack's sub-rows for detail panels:** TanStack's expanding feature is designed for hierarchical sub-rows. For detail panels (custom content, not data rows), use `getRowCanExpand: () => true` and render the detail panel yourself -- do NOT try to create fake sub-row data.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Expanding state management | Custom expand tracking | TanStack Table's `ExpandedState` + `onExpandedChange` | Already imported, handles all edge cases (toggle, expand all, reset) |
| Row can-expand logic | Custom per-row flags | `getRowCanExpand` table option | Integrates with TanStack's row model pipeline |
| Expanded row model | Custom filtering of expanded rows | `getExpandedRowModel()` | Already re-exported in index.ts |
| CSV escaping | Simple replace | RFC 4180 compliant `escapeCsvField()` function | Commas, quotes, newlines, carriage returns all need handling |
| File download trigger | Complex iframe/form approaches | Blob API + URL.createObjectURL + anchor click | Modern pattern, works in all supported browsers |
| Dynamic virtual row sizing | Manual height tracking | TanStack Virtual's `measureElement` | Uses ResizeObserver internally, handles all resize edge cases |

**Key insight:** TanStack Table already has the entire expanding state machine built in. The only work is (a) wiring it into `data-table.ts` properties and table options, (b) rendering the expand toggle column and detail panel, and (c) switching the virtualizer to dynamic mode.

## Common Pitfalls

### Pitfall 1: getRowCanExpand Returns False by Default
**What goes wrong:** Expand toggles don't work; `row.getCanExpand()` always returns `false`.
**Why it happens:** TanStack Table's default `getRowCanExpand` checks for `row.subRows.length > 0`. Detail panels don't use sub-rows.
**How to avoid:** Always set `getRowCanExpand: () => true` (or a per-row function like `getRowCanExpand: (row) => Boolean(this.renderDetailContent)`) in table options when expandable rows are enabled.
**Warning signs:** Expand button appears but clicking does nothing; `row.getIsExpanded()` never becomes `true`.

### Pitfall 2: Virtualizer Not Measuring After Expand/Collapse
**What goes wrong:** Expanded row content overlaps the next row, or scroll position jumps after expanding.
**Why it happens:** The virtualizer was initialized with fixed `estimateSize` and no `measureElement`. When the DOM height changes (detail panel appears), the virtualizer doesn't know.
**How to avoid:** When expanding is enabled, configure the virtualizer with `measureElement` on each virtual item element. Use `data-index` attribute for item identification. Re-measure when expanded state changes.
**Warning signs:** Visual overlap between rows, scroll position jumping, total scroll height not updating.

### Pitfall 3: CSV Export Including Utility Columns
**What goes wrong:** The exported CSV includes "_selection" or "_actions" columns.
**Why it happens:** `table.getVisibleLeafColumns()` returns ALL visible columns including programmatic ones.
**How to avoid:** Filter out columns with IDs starting with `_` (like `_selection`, `_expand`, `_actions`) from the export.
**Warning signs:** CSV has blank first/last columns, or columns labeled "_selection".

### Pitfall 4: CSV Special Character Corruption
**What goes wrong:** Values containing commas, quotes, or newlines break CSV structure. Excel shows garbled non-ASCII characters.
**Why it happens:** Missing RFC 4180 escaping or missing UTF-8 BOM.
**How to avoid:** Always escape fields per RFC 4180 (double-quote fields containing special characters, escape internal quotes by doubling). Always prepend UTF-8 BOM (`\uFEFF`) for Excel compatibility.
**Warning signs:** CSV appears with wrong column alignment, or non-English characters display as `Ã©` etc.

### Pitfall 5: ExpandedState Type Is a Union
**What goes wrong:** Type errors or runtime crashes when handling `ExpandedState`.
**Why it happens:** `ExpandedState` is `true | Record<string, boolean>`. The `true` value means "all rows expanded." Code that does `Object.keys(expanded)` crashes when `expanded === true`.
**How to avoid:** Always check `if (expanded === true)` before accessing as a record. In single-expand mode, never allow `expanded = true` state.
**Warning signs:** `Object.keys is not a function` or `Cannot convert true to object` errors.

### Pitfall 6: Detail Panel Content Not Spanning Full Width
**What goes wrong:** The detail panel is constrained to a single grid cell width.
**Why it happens:** Rendering the detail panel inside the CSS Grid row. The grid's `grid-template-columns` splits it into cells.
**How to avoid:** Render the detail panel OUTSIDE the grid row div, but inside the virtual item wrapper. The wrapper is a plain `div` (not a grid), so the detail panel naturally spans full width.
**Warning signs:** Detail content appears squished into one column cell.

### Pitfall 7: Export of Selected Rows When No Selection Active
**What goes wrong:** Export produces empty CSV when `selectedOnly: true` but no rows are selected.
**Why it happens:** `table.getSelectedRowModel().rows` returns empty array.
**How to avoid:** When `selectedOnly` is true and selection count is 0, fall back to exporting all filtered rows (or warn the user). Document this behavior.
**Warning signs:** Empty CSV file downloaded.

## Code Examples

Verified patterns from official sources and existing codebase:

### TanStack Table Options for Expanding
```typescript
// Source: @tanstack/table-core v8.21.3 RowExpanding.d.ts (verified from node_modules)
const table = this.tableController.table({
  // ... existing options ...
  state: {
    // ... existing state ...
    expanded: this.expanded,
  },
  enableExpanding: Boolean(this.renderDetailContent),
  getRowCanExpand: () => Boolean(this.renderDetailContent),
  getExpandedRowModel: this.renderDetailContent ? getExpandedRowModel() : undefined,
  onExpandedChange: (updater) => {
    const next = typeof updater === 'function' ? updater(this.expanded) : updater;
    // Single-expand logic if needed
    this.expanded = this.singleExpand ? this.enforceSingleExpand(next) : next;
  },
});
```

### VirtualizerController with Dynamic Measurement
```typescript
// Source: @tanstack/virtual-core v3.13.18 (verified from node_modules)
// When expanding is enabled, switch to dynamic mode:
this.virtualizer = new VirtualizerController(this, {
  getScrollElement: () => this.scrollRef.value ?? null,
  count: rows.length,
  estimateSize: () => this.rowHeight, // Initial estimate, overridden by measureElement
  overscan: DataTable.VIRTUALIZER_OVERSCAN,
  measureElement: (el) => {
    // Dynamic measurement for variable-height rows (expanded detail panels)
    if (!el) return this.rowHeight;
    return el.getBoundingClientRect().height;
  },
});
```

### CSV Blob Download Pattern
```typescript
// Source: Browser API (Blob, URL.createObjectURL)
// Verified pattern used across data table libraries (Tabulator, AG Grid, etc.)
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Cleanup after a tick to ensure download starts
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
```

### RFC 4180 CSV Field Escaping
```typescript
// Source: RFC 4180 (https://tools.ietf.org/html/rfc4180)
function escapeCsvField(field: string): string {
  // Must quote if field contains: comma, double-quote, newline, or carriage return
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    // Escape internal double-quotes by doubling them
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
```

### Expand Column Toggle Button CSS
```css
/* Follows existing data-table styling patterns */
.expand-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: var(--ui-radius-sm, 0.25rem);
  cursor: pointer;
  color: var(--ui-data-table-header-text);
  transition: transform 0.15s ease;
}

.expand-toggle:hover {
  background: var(--ui-data-table-row-hover-bg);
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.detail-panel {
  padding: 1rem;
  border-top: 1px solid var(--ui-data-table-border-color);
  background: var(--color-muted, #f4f4f5);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate detail row elements | Detail content within same virtual item | TanStack Virtual v3 (2023) | Dynamic measurement handles variable heights natively |
| FileSaver.js for downloads | Native Blob + anchor.click() | ~2020 (IE11 EOL) | No library needed for file downloads |
| Sub-rows for detail panels | `getRowCanExpand: () => true` + custom UI | TanStack Table v8 (2023) | Sub-rows are for hierarchical data; detail panels are purely UI |

**Deprecated/outdated:**
- `row.getToggleExpandedHandler()` can be unreliable without sub-rows; prefer direct `row.toggleExpanded()` calls
- FileSaver.js is unnecessary for modern browsers (all targets support Blob + createObjectURL)

## Open Questions

1. **Export button placement in toolbar**
   - What we know: Toolbar has `toolbar-start` and `toolbar-end` slots. Export could be a built-in button or consumer-provided via slot.
   - What's unclear: Should the DataTable render a built-in export button, or should export only be accessible as a public method?
   - Recommendation: Provide `exportCsv()` as a public method. Consumers place their own export button in the `toolbar-start` or `toolbar-end` slot and call the method. This is consistent with how the toolbar works today (slots for extensibility, not built-in buttons).

2. **Header labels in CSV export**
   - What we know: Column definitions use `header` which can be a string or template function.
   - What's unclear: How to extract a plain-text header label from a TemplateResult.
   - Recommendation: For columns with string headers, use directly. For TemplateResult headers (rare), fall back to `column.id`. Allow override via `ExportCsvOptions.headers` map.

3. **Virtualizer re-initialization on expand toggle**
   - What we know: Currently the virtualizer is re-initialized in `updated()` when `data` or `rowHeight` changes. Expand/collapse changes row heights but not data count.
   - What's unclear: Whether the virtualizer auto-measures on DOM change or needs a manual nudge.
   - Recommendation: The `measureElement` approach uses ResizeObserver under the hood, so it should auto-detect height changes. Verify during implementation. As a fallback, call `virtualizer.measure()` when expanded state changes.

## Sources

### Primary (HIGH confidence)
- `@tanstack/table-core@8.21.3` RowExpanding.d.ts - Full expanding API surface (ExpandedState, ExpandedOptions, ExpandedRow, ExpandedInstance) verified from installed node_modules
- `@tanstack/virtual-core@3.13.18` index.d.ts - VirtualizerOptions.measureElement, estimateSize, resizeItem verified from installed node_modules
- `@tanstack/lit-table@8.21.3` index.d.ts - Re-exports from table-core confirmed
- Existing codebase: `data-table.ts` (rendering pipeline), `selection-column.ts` (factory pattern), `types.ts` (ExpandedState already imported), `index.ts` (getExpandedRowModel already exported), `bulk-actions.ts` (toolbar pattern)

### Secondary (MEDIUM confidence)
- [TanStack Table Expanding Guide](https://tanstack.com/table/v8/docs/guide/expanding) - Official documentation on expanding feature
- [TanStack Table Expanding API](https://tanstack.com/table/v8/docs/api/features/expanding) - API reference
- [GitHub Discussion #5589](https://github.com/TanStack/table/discussions/5589) - Single-expand accordion pattern
- [GitHub Discussion #5267](https://github.com/TanStack/table/discussions/5267) - Expand one row, collapse others
- [RFC 4180](https://tools.ietf.org/html/rfc4180) - CSV format specification

### Tertiary (LOW confidence)
- WebSearch results on CSV BOM handling and Excel compatibility - Multiple community sources agree on `\uFEFF` BOM approach
- WebSearch results on TanStack Virtual + expanding - Community patterns for measureElement with expanding rows

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and imported; no new dependencies
- Architecture: HIGH - Patterns verified against installed type definitions and existing codebase modules
- Pitfalls: HIGH - Most pitfalls identified from TanStack type definitions, codebase analysis, and verified community discussions

**Research date:** 2026-02-05
**Valid until:** 2026-03-07 (stable; TanStack Table v8 and Virtual v3 are mature)
