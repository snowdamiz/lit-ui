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
import { property, state } from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import {
  TableController,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type RowData,
  type Table,
  type Header,
  type Cell,
  type Row,
  type SortingState,
} from '@tanstack/lit-table';
import { VirtualizerController } from '@tanstack/lit-virtual';
import type { ColumnDef, LoadingState, EmptyStateType } from './types.js';
import { KeyboardNavigationManager, type GridPosition } from './keyboard-navigation.js';

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
   * Keyboard navigation manager for ARIA grid pattern.
   */
  private navManager = new KeyboardNavigationManager();

  /**
   * Current focused cell position for roving tabindex.
   */
  @state()
  private _focusedCell: GridPosition = { row: 0, col: 0 };

  /**
   * Announcement for screen readers on navigation.
   */
  @state()
  private _announcement = '';

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

  /**
   * Current sorting state.
   * Array of sort objects with column ID and direction.
   * Supports multi-column sorting via Shift+click.
   */
  @property({ type: Array })
  sorting: SortingState = [];

  /**
   * Enable manual/server-side sorting mode.
   * When true, sorting is handled externally and ui-sort-change events are emitted.
   * When false (default), client-side sorting is performed via getSortedRowModel.
   */
  @property({ type: Boolean, attribute: 'manual-sorting' })
  manualSorting = false;

  // ==========================================================================
  // Lifecycle methods
  // ==========================================================================

  /**
   * Initialize or update virtualizer when data changes.
   * Update keyboard navigation bounds when data/columns change.
   */
  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('data') || changedProperties.has('rowHeight')) {
      this.initVirtualizer();
    }

    // Update keyboard navigation bounds when data or columns change
    if (changedProperties.has('data') || changedProperties.has('columns')) {
      const maxHeightPx = parseInt(this.maxHeight, 10) || 400;
      const visibleRowCount = Math.floor(maxHeightPx / (this.rowHeight || 48));
      this.navManager.setBounds({
        rowCount: this.data.length,
        colCount: this.columns.length,
        visibleRowCount,
      });
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
  // Keyboard navigation methods
  // ==========================================================================

  /**
   * Handle keyboard navigation on the grid.
   * Delegates to KeyboardNavigationManager for position calculation.
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Don't handle if target is interactive element within cell
    const target = e.target as HTMLElement;
    if (this.isInteractiveElement(target)) {
      return;
    }

    const newPos = this.navManager.handleKeyDown(e);
    if (newPos) {
      e.preventDefault();
      this._focusedCell = newPos;
      this.focusCell(newPos);
      this.announcePosition(newPos);

      // Scroll virtualized row into view
      if (this.virtualizer) {
        this.virtualizer.getVirtualizer().scrollToIndex(newPos.row, {
          align: 'auto',
          behavior: 'auto',
        });
      }
    }
  }

  /**
   * Check if element is interactive (should handle its own keyboard events).
   */
  private isInteractiveElement(el: HTMLElement): boolean {
    const interactiveTags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'];
    return interactiveTags.includes(el.tagName) || el.hasAttribute('contenteditable');
  }

  /**
   * Focus a cell by its position.
   * Updates roving tabindex and focuses the cell element.
   */
  private focusCell(pos: GridPosition): void {
    // Account for header row in aria-rowindex (1-indexed, header = 1, first data = 2)
    const ariaRow = pos.row + 2;
    const ariaCol = pos.col + 1;

    // Find cell by ARIA attributes
    const cell = this.shadowRoot?.querySelector(
      `[role="row"][aria-rowindex="${ariaRow}"] [aria-colindex="${ariaCol}"]`
    ) as HTMLElement | null;

    if (cell) {
      // Make this cell tabbable, others not
      this.updateRovingTabindex(pos);
      cell.focus();
    }
  }

  /**
   * Update roving tabindex: active cell gets 0, all others get -1.
   */
  private updateRovingTabindex(activePos: GridPosition): void {
    // Remove tabindex from all cells
    const allCells = this.shadowRoot?.querySelectorAll('[role="gridcell"], [role="columnheader"]');
    allCells?.forEach((cell) => cell.setAttribute('tabindex', '-1'));

    // Set tabindex=0 on active cell
    const ariaRow = activePos.row + 2;
    const ariaCol = activePos.col + 1;
    const activeCell = this.shadowRoot?.querySelector(
      `[role="row"][aria-rowindex="${ariaRow}"] [aria-colindex="${ariaCol}"]`
    );
    activeCell?.setAttribute('tabindex', '0');
  }

  /**
   * Handle cell click to update focus position.
   */
  private handleCellClick(rowIndex: number, colIndex: number): void {
    this._focusedCell = { row: rowIndex, col: colIndex };
    this.navManager.setPosition(this._focusedCell);
    this.updateRovingTabindex(this._focusedCell);
  }

  /**
   * Announce position change to screen readers via live region.
   */
  private announcePosition(pos: GridPosition): void {
    const column = this.columns[pos.col];
    const colHeader = column?.header;
    const headerText =
      typeof colHeader === 'function' ? 'Column' : String(colHeader || 'Column');

    this._announcement = `Row ${pos.row + 1} of ${this.data.length}, ${headerText}, Column ${pos.col + 1} of ${this.columns.length}`;
  }

  // ==========================================================================
  // Helper methods
  // ==========================================================================

  /**
   * Dispatch sort change event with both TanStack and REST API formats.
   */
  private dispatchSortChange(sorting: SortingState): void {
    const event = new CustomEvent('ui-sort-change', {
      detail: {
        sorting,
        sortParams: sorting.map((s) => ({
          column: s.id,
          direction: s.desc ? 'desc' : 'asc',
        })),
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

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
   * Render sort direction indicator with priority number for multi-sort.
   * @param direction - Current sort direction (false if unsorted, 'asc' or 'desc')
   * @param sortIndex - Sort priority index (-1 if not sorted, 0+ for priority)
   */
  private renderSortIndicator(
    direction: false | 'asc' | 'desc',
    sortIndex: number
  ): TemplateResult {
    const showPriority = sortIndex > 0; // Show priority number for secondary+ sorts

    return html`
      <span class="sort-indicator" aria-hidden="true">
        ${direction === 'asc'
          ? html`
              <svg viewBox="0 0 12 12" class="sort-icon">
                <path d="M6 3L10 9H2L6 3Z" fill="currentColor" />
              </svg>
            `
          : direction === 'desc'
            ? html`
                <svg viewBox="0 0 12 12" class="sort-icon">
                  <path d="M6 9L2 3H10L6 9Z" fill="currentColor" />
                </svg>
              `
            : html`
                <svg viewBox="0 0 12 12" class="sort-icon unsorted">
                  <path
                    d="M6 2L9 5H3L6 2ZM6 10L3 7H9L6 10Z"
                    fill="currentColor"
                    opacity="0.3"
                  />
                </svg>
              `}
        ${showPriority
          ? html`<span class="sort-priority">${sortIndex + 1}</span>`
          : nothing}
      </span>
    `;
  }

  /**
   * Render a header cell using flexRender.
   * Sortable headers have click handlers and visual indicators.
   */
  private renderHeaderCell(
    header: Header<TData, unknown>,
    colIndex: number
  ): TemplateResult {
    const headerContent = header.isPlaceholder
      ? nothing
      : flexRender(header.column.columnDef.header, header.getContext());

    const canSort = header.column.getCanSort();
    const sortDirection = header.column.getIsSorted(); // false | 'asc' | 'desc'
    const sortIndex = header.column.getSortIndex(); // -1 if not sorted, 0+ for priority

    // Only set aria-sort on primary sorted column (sortIndex === 0)
    const ariaSort =
      sortDirection && sortIndex === 0
        ? sortDirection === 'asc'
          ? 'ascending'
          : 'descending'
        : nothing;

    return html`
      <div
        role="columnheader"
        aria-colindex="${colIndex + 1}"
        aria-sort=${ariaSort}
        class="data-table-header-cell ${canSort ? 'sortable' : ''}"
        id="${this.tableId}-header-${header.id}"
        tabindex="-1"
        @click=${canSort ? header.column.getToggleSortingHandler() : nothing}
      >
        <span class="header-content">${headerContent}</span>
        ${canSort ? this.renderSortIndicator(sortDirection, sortIndex) : nothing}
      </div>
    `;
  }

  /**
   * Render a data cell using flexRender.
   * Includes roving tabindex and click handler for focus management.
   */
  private renderCell(
    cell: Cell<TData, unknown>,
    rowIndex: number,
    colIndex: number
  ): TemplateResult {
    const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());
    const isFocused =
      this._focusedCell.row === rowIndex && this._focusedCell.col === colIndex;

    return html`
      <div
        role="gridcell"
        aria-colindex="${colIndex + 1}"
        class="data-table-cell"
        tabindex="${isFocused ? '0' : '-1'}"
        @click=${() => this.handleCellClick(rowIndex, colIndex)}
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
          this.renderCell(cell, rowIndex, colIndex)
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
                this.renderCell(cell, rowIndex, colIndex)
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
                  this.renderCell(cell, virtualRow.index, colIndex)
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
        display: flex;
        flex-direction: column;
        width: 100%;
        border: 1px solid var(--ui-data-table-border-color);
        border-radius: var(--ui-radius, 0.5rem);
        overflow: hidden;
      }

      .data-table-header {
        flex-shrink: 0;
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
        outline: none;
      }

      .data-table-cell:focus-visible {
        outline: 2px solid var(--color-primary, #3b82f6);
        outline-offset: -2px;
        border-radius: 2px;
      }

      .data-table-header-cell {
        padding: var(--ui-data-table-cell-padding);
        font-size: var(--ui-data-table-font-size);
        font-weight: var(--ui-data-table-header-font-weight);
        color: var(--ui-data-table-header-text);
        text-align: left;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .data-table-header-cell .header-content {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Sortable header styles */
      .data-table-header-cell.sortable {
        cursor: pointer;
        user-select: none;
      }

      .data-table-header-cell.sortable:hover {
        background: var(--ui-data-table-header-hover-bg, rgba(0, 0, 0, 0.05));
      }

      .data-table-header-cell.sortable:focus-visible {
        outline: 2px solid var(--color-primary, #3b82f6);
        outline-offset: -2px;
        border-radius: 2px;
      }

      :host-context(.dark) .data-table-header-cell.sortable:hover {
        --ui-data-table-header-hover-bg: rgba(255, 255, 255, 0.05);
      }

      /* Sort indicator styles */
      .sort-indicator {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
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
        background: var(--color-primary, #3b82f6);
        color: var(--color-primary-foreground, #ffffff);
        border-radius: 50%;
      }

      .data-table-body {
        flex: 1;
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

      /* Skeleton Loading Styles */
      .skeleton-cell {
        padding: var(--ui-data-table-cell-padding);
      }

      .skeleton-pulse {
        height: 1em;
        background: linear-gradient(
          90deg,
          var(--ui-data-table-skeleton-base, #e4e4e7) 25%,
          var(--ui-data-table-skeleton-highlight, #f4f4f5) 50%,
          var(--ui-data-table-skeleton-base, #e4e4e7) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-pulse 1.5s ease-in-out infinite;
        border-radius: 4px;
      }

      :host-context(.dark) .skeleton-pulse {
        --ui-data-table-skeleton-base: #3f3f46;
        --ui-data-table-skeleton-highlight: #52525b;
      }

      @keyframes skeleton-pulse {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .skeleton-pulse {
          animation: none;
          background: var(--ui-data-table-skeleton-base, #e4e4e7);
        }
      }

      /* Empty State Styles */
      .empty-state-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
      }

      .empty-state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
      }

      .empty-state-icon {
        color: var(--ui-data-table-header-text);
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .empty-state-message {
        font-size: 1rem;
        font-weight: 500;
        color: var(--ui-data-table-text-color);
        margin: 0 0 0.5rem 0;
      }

      .empty-state-description {
        font-size: 0.875rem;
        color: var(--ui-data-table-header-text);
        margin: 0;
      }

      /* Updating Overlay Styles */
      .data-table-container {
        position: relative;
      }

      .updating-overlay {
        position: absolute;
        inset: 0;
        background: var(--ui-data-table-overlay-bg, rgba(255, 255, 255, 0.7));
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20;
      }

      :host-context(.dark) .updating-overlay {
        --ui-data-table-overlay-bg: rgba(9, 9, 11, 0.7);
      }

      .updating-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--ui-data-table-border-color);
        border-top-color: var(--color-primary, #3b82f6);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .updating-spinner {
          animation: none;
          border-top-color: var(--ui-data-table-border-color);
          opacity: 0.5;
        }
      }

      /* Screen reader only - for ARIA live region */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ];

  override render() {
    // Create table instance via controller
    const table = this.tableController.table({
      columns: this.columns,
      data: this.data,
      state: {
        sorting: this.sorting,
      },
      onSortingChange: (updater) => {
        const newSorting =
          typeof updater === 'function' ? updater(this.sorting) : updater;
        this.sorting = newSorting;
        this.dispatchSortChange(newSorting);
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: this.manualSorting ? undefined : getSortedRowModel(),
      manualSorting: this.manualSorting,
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
        @keydown=${this.handleKeyDown}
      >
        ${this.renderHeader(table)}
        ${this.renderBody(table)}
        <div
          class="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          ${this._announcement}
        </div>
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
