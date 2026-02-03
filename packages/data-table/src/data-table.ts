/**
 * lui-data-table - A high-performance data table with virtual scrolling
 *
 * Features (Phase 61):
 * - Renders columns and rows from column definitions
 * - TanStack Table for headless state management
 * - Div-based layout with ARIA grid pattern
 * - CSS Grid for column sizing
 * - SSR compatible via isServer guards
 *
 * @example
 * ```html
 * <lui-data-table
 *   .columns=${columns}
 *   .data=${data}
 * ></lui-data-table>
 * ```
 *
 * @slot - Optional slot for custom content (e.g., toolbar, pagination)
 */

import { html, css, nothing, isServer, type TemplateResult, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import {
  TableController,
  getCoreRowModel,
  flexRender,
  type RowData,
  type Table,
  type Header,
  type Cell,
  type Row,
} from '@tanstack/lit-table';
import { VirtualizerController } from '@tanstack/lit-virtual';
import type { ColumnDef, LoadingState, EmptyStateType } from './types.js';

/**
 * A high-performance data table component with TanStack Table integration.
 *
 * Uses div-based layout with ARIA grid pattern for accessibility.
 * Supports column definitions, row data, and theme customization via CSS variables.
 *
 * @template TData - Row data type extending RowData
 */
export class DataTable<TData extends RowData = RowData> extends TailwindElement {
  /**
   * Table controller for TanStack Table integration.
   * Initialized in constructor and used in render() to create table instance.
   */
  private tableController = new TableController<TData>(this);

  /**
   * Unique ID prefix for ARIA associations.
   */
  private tableId = `lui-data-table-${Math.random().toString(36).substring(2, 11)}`;

  /**
   * Reference to the scroll container for virtualization.
   */
  private scrollRef: Ref<HTMLDivElement> = createRef();

  /**
   * VirtualizerController manages which rows are visible for efficient rendering.
   * Only initialized client-side when data is available.
   */
  private virtualizer?: VirtualizerController<HTMLDivElement, Element>;

  /**
   * Number of rows to render outside visible viewport.
   * Provides smooth scrolling by pre-rendering buffer rows.
   */
  private static readonly VIRTUALIZER_OVERSCAN = 5;

  /**
   * Column definitions for the table.
   * Uses TanStack Table's ColumnDef type for full compatibility.
   */
  @property({ type: Array })
  columns: ColumnDef<TData, unknown>[] = [];

  /**
   * Row data array.
   * Each item represents a row in the table.
   */
  @property({ type: Array })
  data: TData[] = [];

  /**
   * Loading state indicator.
   * - 'idle': No loading in progress
   * - 'loading': Initial data fetch (shows skeleton in Phase 04)
   * - 'updating': Data refresh (shows overlay in Phase 04)
   */
  @property({ type: String })
  loading: LoadingState = 'idle';

  /**
   * Fixed row height in pixels for virtualization.
   * Used by VirtualizerController in Phase 03.
   * @default 48
   */
  @property({ type: Number, attribute: 'row-height' })
  rowHeight = 48;

  /**
   * Number of skeleton rows to show during initial loading.
   * @default 5
   */
  @property({ type: Number, attribute: 'skeleton-rows' })
  skeletonRows = 5;

  /**
   * Type of empty state to show when data is empty.
   * - 'no-data': Default empty state (no data available)
   * - 'no-matches': Filter resulted in no matches
   * @default 'no-data'
   */
  @property({ type: String, attribute: 'empty-state-type' })
  emptyStateType: EmptyStateType = 'no-data';

  /**
   * Custom message for no-data empty state.
   * @default 'No data available'
   */
  @property({ type: String, attribute: 'no-data-message' })
  noDataMessage = 'No data available';

  /**
   * Custom message for no-matches empty state.
   * @default 'No results match your filters'
   */
  @property({ type: String, attribute: 'no-matches-message' })
  noMatchesMessage = 'No results match your filters';

  /**
   * Accessible label for the grid.
   * Announced by screen readers when entering the table.
   */
  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = 'Data table';

  /**
   * Maximum height of the table body scroll container.
   * Set to enable vertical scrolling with virtualization.
   * @default '400px'
   */
  @property({ type: String, attribute: 'max-height' })
  maxHeight = '400px';

  // ==========================================================================
  // Lifecycle methods
  // ==========================================================================

  /**
   * Initialize or update virtualizer when data changes.
   */
  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('data') || changedProperties.has('rowHeight')) {
      this.initVirtualizer();
    }
  }

  /**
   * Clean up virtualizer on disconnect.
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.virtualizer = undefined;
  }

  // ==========================================================================
  // Virtualizer methods
  // ==========================================================================

  /**
   * Initialize the virtualizer for efficient row rendering.
   * Only runs client-side when data is available.
   */
  private initVirtualizer(): void {
    if (isServer || this.data.length === 0) {
      this.virtualizer = undefined;
      return;
    }

    // Always recreate to handle count changes correctly
    this.virtualizer = new VirtualizerController(this, {
      getScrollElement: () => this.scrollRef.value ?? null,
      count: this.data.length,
      estimateSize: () => this.rowHeight,
      overscan: DataTable.VIRTUALIZER_OVERSCAN,
    });
  }

  // ==========================================================================
  // Helper methods
  // ==========================================================================

  /**
   * Compute CSS Grid template columns from column definitions.
   * Uses column size or equal distribution if not specified.
   */
  private getGridTemplateColumns(): string {
    if (this.columns.length === 0) return '';

    return this.columns
      .map((col) => {
        // Check for size in column definition
        const size = col.size;
        if (size) {
          return `${size}px`;
        }
        // Check for minSize/maxSize
        const minSize = col.minSize ?? 50;
        const maxSize = col.maxSize ?? 500;
        return `minmax(${minSize}px, ${maxSize}px)`;
      })
      .join(' ');
  }

  /**
   * Render a header cell using flexRender.
   */
  private renderHeaderCell(
    header: Header<TData, unknown>,
    colIndex: number
  ): TemplateResult {
    const headerContent = header.isPlaceholder
      ? nothing
      : flexRender(header.column.columnDef.header, header.getContext());

    return html`
      <div
        role="columnheader"
        aria-colindex="${colIndex + 1}"
        class="data-table-header-cell"
        id="${this.tableId}-header-${header.id}"
      >
        ${headerContent}
      </div>
    `;
  }

  /**
   * Render a data cell using flexRender.
   */
  private renderCell(
    cell: Cell<TData, unknown>,
    colIndex: number
  ): TemplateResult {
    const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());

    return html`
      <div
        role="gridcell"
        aria-colindex="${colIndex + 1}"
        class="data-table-cell"
      >
        ${cellContent}
      </div>
    `;
  }

  /**
   * Render a data row.
   */
  private renderRow(row: Row<TData>, rowIndex: number): TemplateResult {
    return html`
      <div
        role="row"
        aria-rowindex="${rowIndex + 2}"
        class="data-table-row"
        data-row-id="${row.id}"
      >
        ${row.getVisibleCells().map((cell, colIndex) =>
          this.renderCell(cell, colIndex)
        )}
      </div>
    `;
  }

  /**
   * Render the header row group.
   */
  private renderHeader(table: Table<TData>): TemplateResult {
    return html`
      <div class="data-table-header" role="rowgroup">
        ${table.getHeaderGroups().map(
          (headerGroup) => html`
            <div
              role="row"
              aria-rowindex="1"
              class="data-table-row header-row"
              style="grid-template-columns: ${this.getGridTemplateColumns()}"
            >
              ${headerGroup.headers.map((header, colIndex) =>
                this.renderHeaderCell(header, colIndex)
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  /**
   * Render skeleton rows during initial loading.
   */
  private renderSkeletonRows(): TemplateResult {
    const gridTemplateColumns = this.getGridTemplateColumns();

    return html`
      <div
        class="data-table-body skeleton-container"
        role="rowgroup"
        aria-busy="true"
        aria-label="Loading data"
      >
        ${Array.from({ length: this.skeletonRows }).map(
          (_, rowIndex) => html`
            <div
              class="data-table-row skeleton-row"
              role="row"
              aria-rowindex="${rowIndex + 2}"
              style="grid-template-columns: ${gridTemplateColumns}"
            >
              ${this.columns.map(
                (_, colIndex) => html`
                  <div
                    class="data-table-cell skeleton-cell"
                    role="gridcell"
                    aria-colindex="${colIndex + 1}"
                  >
                    <div class="skeleton-pulse"></div>
                  </div>
                `
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  /**
   * Render empty state icon (box with X).
   */
  private renderEmptyIcon(): TemplateResult {
    return html`
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        width="48"
        height="48"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" />
        <line x1="9" y1="9" x2="15" y2="15" stroke-width="2" />
        <line x1="15" y1="9" x2="9" y2="15" stroke-width="2" />
      </svg>
    `;
  }

  /**
   * Render search icon for no-matches state.
   */
  private renderSearchIcon(): TemplateResult {
    return html`
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        width="48"
        height="48"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" stroke-width="2" />
        <path d="M21 21l-4.35-4.35" stroke-width="2" />
      </svg>
    `;
  }

  /**
   * Render empty state when no data is available.
   */
  private renderEmptyState(): TemplateResult {
    const isNoMatches = this.emptyStateType === 'no-matches';
    const message = isNoMatches ? this.noMatchesMessage : this.noDataMessage;
    const description = isNoMatches
      ? 'Try adjusting your search or filter criteria'
      : 'Data will appear here once available';

    return html`
      <div class="data-table-body empty-state-container" role="rowgroup">
        <div class="empty-state" role="row" aria-rowindex="2">
          <div
            role="gridcell"
            aria-colspan="${this.columns.length}"
            class="empty-state-cell"
          >
            <div class="empty-state-icon">
              ${isNoMatches ? this.renderSearchIcon() : this.renderEmptyIcon()}
            </div>
            <p class="empty-state-message">${message}</p>
            <p class="empty-state-description">${description}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render updating overlay during data updates.
   */
  private renderUpdatingOverlay(): TemplateResult {
    if (this.loading !== 'updating') {
      return html``;
    }

    return html`
      <div class="updating-overlay" aria-hidden="true">
        <div class="updating-spinner"></div>
      </div>
    `;
  }

  /**
   * Render the body row group with virtualization.
   */
  private renderBody(table: Table<TData>): TemplateResult {
    // Show skeleton during initial loading
    if (this.loading === 'loading') {
      return this.renderSkeletonRows();
    }

    // Show empty state when no data
    if (this.data.length === 0) {
      return this.renderEmptyState();
    }

    // Use virtual scrolling when virtualizer is available
    if (this.virtualizer) {
      return this.renderVirtualizedBody(table);
    }

    // Fallback: render all rows (for SSR or before virtualizer initializes)
    return this.renderAllRows(table);
  }

  /**
   * Render all rows without virtualization (fallback for SSR/small datasets).
   */
  private renderAllRows(table: Table<TData>): TemplateResult {
    const rows = table.getRowModel().rows;
    const gridTemplateColumns = this.getGridTemplateColumns();

    return html`
      <div
        class="data-table-body"
        role="rowgroup"
        style="max-height: ${this.maxHeight}; overflow-y: auto;"
      >
        ${rows.map(
          (row, rowIndex) => html`
            <div
              role="row"
              aria-rowindex="${rowIndex + 2}"
              class="data-table-row"
              style="grid-template-columns: ${gridTemplateColumns}"
              data-row-id="${row.id}"
            >
              ${row.getVisibleCells().map((cell, colIndex) =>
                this.renderCell(cell, colIndex)
              )}
            </div>
          `
        )}
      </div>
      ${this.renderUpdatingOverlay()}
    `;
  }

  /**
   * Render virtualized rows for efficient 100K+ row handling.
   * Only renders visible rows plus overscan buffer.
   */
  private renderVirtualizedBody(table: Table<TData>): TemplateResult {
    const virtualizer = this.virtualizer!.getVirtualizer();
    const virtualItems = virtualizer.getVirtualItems();
    const totalHeight = virtualizer.getTotalSize();
    const rows = table.getRowModel().rows;
    const gridTemplateColumns = this.getGridTemplateColumns();

    return html`
      <div
        class="data-table-body"
        role="rowgroup"
        ${ref(this.scrollRef)}
        style="max-height: ${this.maxHeight}; overflow-y: auto;"
      >
        <div class="virtual-content" style="height: ${totalHeight}px; position: relative;">
          ${virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return nothing;

            return html`
              <div
                role="row"
                aria-rowindex="${virtualRow.index + 2}"
                class="data-table-row virtual-row"
                style="
                  grid-template-columns: ${gridTemplateColumns};
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: ${virtualRow.size}px;
                  transform: translateY(${virtualRow.start}px);
                "
                data-row-id="${row.id}"
              >
                ${row.getVisibleCells().map((cell, colIndex) =>
                  this.renderCell(cell, colIndex)
                )}
              </div>
            `;
          })}
        </div>
      </div>
      ${this.renderUpdatingOverlay()}
    `;
  }

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
        --ui-data-table-header-bg: var(--color-muted, #f4f4f5);
        --ui-data-table-row-bg: var(--color-background, #ffffff);
        --ui-data-table-row-hover-bg: var(--color-muted, #f4f4f5);
        --ui-data-table-border-color: var(--color-border, #e4e4e7);
        --ui-data-table-text-color: var(--color-foreground, #09090b);
        --ui-data-table-header-text: var(--color-muted-foreground, #71717a);
        --ui-data-table-row-height: 48px;
        --ui-data-table-header-height: 48px;
        --ui-data-table-cell-padding: 0.75rem 1rem;
        --ui-data-table-font-size: 0.875rem;
        --ui-data-table-header-font-weight: 500;
      }

      :host-context(.dark) {
        --ui-data-table-header-bg: #27272a;
        --ui-data-table-row-bg: #09090b;
        --ui-data-table-row-hover-bg: #27272a;
        --ui-data-table-border-color: #3f3f46;
        --ui-data-table-text-color: #fafafa;
        --ui-data-table-header-text: #a1a1aa;
      }

      .data-table-container {
        width: 100%;
        border: 1px solid var(--ui-data-table-border-color);
        border-radius: var(--ui-radius, 0.5rem);
        overflow: hidden;
      }

      .data-table-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--ui-data-table-header-bg);
        border-bottom: 1px solid var(--ui-data-table-border-color);
      }

      .data-table-row {
        display: grid;
        min-height: var(--ui-data-table-row-height);
        align-items: center;
      }

      .data-table-row:not(.header-row) {
        background: var(--ui-data-table-row-bg);
        border-bottom: 1px solid var(--ui-data-table-border-color);
      }

      .data-table-row:not(.header-row):last-child {
        border-bottom: none;
      }

      .data-table-row:not(.header-row):hover {
        background: var(--ui-data-table-row-hover-bg);
      }

      .data-table-cell {
        padding: var(--ui-data-table-cell-padding);
        font-size: var(--ui-data-table-font-size);
        color: var(--ui-data-table-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .data-table-header-cell {
        padding: var(--ui-data-table-cell-padding);
        font-size: var(--ui-data-table-font-size);
        font-weight: var(--ui-data-table-header-font-weight);
        color: var(--ui-data-table-header-text);
        text-align: left;
      }

      .data-table-body {
        overflow-y: auto;
        overflow-x: hidden;
      }

      /* Virtual scrolling styles */
      .virtual-content {
        width: 100%;
      }

      .virtual-row {
        /* Override last-child border-bottom rule for virtual rows */
        border-bottom: 1px solid var(--ui-data-table-border-color) !important;
      }
    `,
  ];

  override render() {
    // Create table instance via controller
    const table = this.tableController.table({
      columns: this.columns,
      data: this.data,
      getCoreRowModel: getCoreRowModel(),
    });

    // Calculate total counts for ARIA
    const rowCount = this.data.length + 1; // +1 for header row
    const colCount = this.columns.length;

    return html`
      <div
        class="data-table-container"
        role="grid"
        aria-rowcount="${rowCount}"
        aria-colcount="${colCount}"
        aria-label="${this.ariaLabel}"
        aria-busy="${this.loading !== 'idle' ? 'true' : 'false'}"
      >
        ${this.renderHeader(table)}
        ${this.renderBody(table)}
      </div>
    `;
  }
}

// Register custom element (client-side only)
if (!isServer) {
  customElements.define('lui-data-table', DataTable);
}

// Type declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-data-table': DataTable;
  }
}
