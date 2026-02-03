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

import { html, css, nothing, isServer, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
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
import type { ColumnDef, LoadingState } from './types.js';

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
   * Accessible label for the grid.
   * Announced by screen readers when entering the table.
   */
  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = 'Data table';

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
   * Render the body row group.
   */
  private renderBody(table: Table<TData>): TemplateResult {
    const rows = table.getRowModel().rows;

    return html`
      <div class="data-table-body" role="rowgroup">
        ${rows.map((row, rowIndex) => html`
          <div
            role="row"
            aria-rowindex="${rowIndex + 2}"
            class="data-table-row"
            style="grid-template-columns: ${this.getGridTemplateColumns()}"
            data-row-id="${row.id}"
          >
            ${row.getVisibleCells().map((cell, colIndex) =>
              this.renderCell(cell, colIndex)
            )}
          </div>
        `)}
      </div>
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
        overflow: auto;
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
