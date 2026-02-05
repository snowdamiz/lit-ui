/**
 * Data Table component template
 */
export const DATA_TABLE_TEMPLATE = `/**
 * lui-data-table — Starter template.
 * For full features (virtual scrolling, filtering, pagination, inline editing,
 * selection, column reorder, expandable rows, bulk actions),
 * install via NPM: npm install @lit-ui/data-table
 *
 * This starter provides a basic data table with:
 * - Column definitions with headers and accessor keys
 * - Single-column sorting (click header to toggle asc/desc/none)
 * - Sort direction indicators (arrow SVGs)
 * - Striped rows with hover highlighting
 * - CSS custom properties with fallbacks for theming
 * - Accessible ARIA grid pattern (role="grid")
 * - Configurable max-height with overflow scroll
 * - Loading state with skeleton rows
 *
 * @example
 * \\\`\\\`\\\`html
 * <lui-data-table
 *   .columns=\\\${[
 *     { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
 *     { id: 'email', header: 'Email', accessorKey: 'email', sortable: true },
 *     { id: 'role', header: 'Role', accessorKey: 'role' },
 *   ]}
 *   .data=\\\${[
 *     { name: 'Alice', email: 'alice@example.com', role: 'Admin' },
 *     { name: 'Bob', email: 'bob@example.com', role: 'User' },
 *   ]}
 * ></lui-data-table>
 * \\\`\\\`\\\`
 */

import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TailwindElement } from '../../lib/lit-ui/tailwind-element';

/** Column definition for the starter data table. */
export interface StarterColumnDef {
  id: string;
  header: string;
  accessorKey: string;
  sortable?: boolean;
  width?: string;
}

type SortDirection = 'asc' | 'desc' | null;
interface SortState { columnId: string; direction: SortDirection; }

/**
 * A basic data table component with sorting and theming.
 * This is a starter template — for full features, use: npm install @lit-ui/data-table
 *
 * @fires ui-sort-change - Fired when sort state changes
 */
@customElement('lui-data-table')
export class DataTable extends TailwindElement {
  /** Column definitions describing table structure. */
  @property({ type: Array })
  columns: StarterColumnDef[] = [];

  /** Array of row data objects. */
  @property({ type: Array })
  data: Record<string, unknown>[] = [];

  /** Accessible label for the table. */
  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = '';

  /** Maximum height of the table body. Set to 'none' for no limit. */
  @property({ type: String, attribute: 'max-height' })
  maxHeight = '400px';

  /** Whether the table is in a loading state. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Number of skeleton rows to show during loading. */
  @property({ type: Number, attribute: 'skeleton-rows' })
  skeletonRows = 5;

  @state()
  private _sort: SortState = { columnId: '', direction: null };

  private _toggleSort(column: StarterColumnDef) {
    if (!column.sortable) return;
    let nextDirection: SortDirection;
    if (this._sort.columnId !== column.id || this._sort.direction === null) {
      nextDirection = 'asc';
    } else if (this._sort.direction === 'asc') {
      nextDirection = 'desc';
    } else {
      nextDirection = null;
    }
    this._sort = { columnId: nextDirection ? column.id : '', direction: nextDirection };
    this.dispatchEvent(new CustomEvent('ui-sort-change', {
      detail: { columnId: column.id, direction: nextDirection },
      bubbles: true, composed: true,
    }));
  }

  private _handleHeaderKeydown(e: KeyboardEvent, column: StarterColumnDef) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggleSort(column);
    }
  }

  private get _sortedData(): Record<string, unknown>[] {
    if (!this._sort.direction || !this._sort.columnId) return this.data;
    const { columnId, direction } = this._sort;
    return [...this.data].sort((a, b) => {
      const aVal = a[columnId], bVal = b[columnId];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: 'base' });
      return direction === 'asc' ? cmp : -cmp;
    });
  }

  static override styles = css\\\`
    :host {
      display: block;
      --_header-bg: var(--ui-data-table-header-bg, var(--color-muted, #f4f4f5));
      --_row-bg: var(--ui-data-table-row-bg, var(--color-bg, #ffffff));
      --_row-hover-bg: var(--ui-data-table-row-hover-bg, var(--color-muted, #f4f4f5));
      --_border-color: var(--ui-data-table-border-color, var(--color-border, #e4e4e7));
      --_text-color: var(--ui-data-table-text-color, var(--color-foreground, #09090b));
      --_header-text: var(--ui-data-table-header-text, var(--color-muted-foreground, #71717a));
    }
    .table-container {
      border: 1px solid var(--_border-color);
      border-radius: 0.5rem;
      overflow: hidden;
    }
    .table-scroll { overflow-y: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      color: var(--_text-color);
      font-size: 0.875rem;
    }
    thead { position: sticky; top: 0; z-index: 1; }
    th {
      background: var(--_header-bg);
      color: var(--_header-text);
      font-weight: 500;
      text-align: left;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--_border-color);
      white-space: nowrap;
      user-select: none;
    }
    th.sortable { cursor: pointer; }
    th.sortable:hover { color: var(--_text-color); }
    th.sortable:focus-visible {
      outline: 2px solid var(--ui-data-table-focus-ring, var(--color-ring, #3b82f6));
      outline-offset: -2px;
    }
    .header-content {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }
    .sort-icon {
      width: 0.875rem;
      height: 0.875rem;
      flex-shrink: 0;
      opacity: 0.3;
      transition: opacity 150ms, transform 150ms;
    }
    .sort-icon.active { opacity: 1; }
    .sort-icon.desc { transform: rotate(180deg); }
    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--_border-color);
    }
    tbody tr {
      background: var(--_row-bg);
      transition: background-color 150ms;
    }
    tbody tr:nth-child(even) {
      background: color-mix(in srgb, var(--_header-bg) 30%, var(--_row-bg));
    }
    tbody tr:hover { background: var(--_row-hover-bg); }
    tbody tr:last-child td { border-bottom: none; }
    .skeleton-row td { pointer-events: none; }
    .skeleton-cell {
      height: 1rem;
      border-radius: 0.25rem;
      background: linear-gradient(90deg, var(--_border-color) 25%, var(--_header-bg) 50%, var(--_border-color) 75%);
      background-size: 200% 100%;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }
    @keyframes skeleton-pulse {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--_header-text);
    }
  \\\`;

  private _renderSortIcon(column: StarterColumnDef) {
    if (!column.sortable) return nothing;
    const isActive = this._sort.columnId === column.id && this._sort.direction !== null;
    const isDesc = this._sort.direction === 'desc' && this._sort.columnId === column.id;
    return html\\\`
      <svg class="sort-icon \\\${isActive ? 'active' : ''} \\\${isDesc ? 'desc' : ''}"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <path d="M12 5v14M5 12l7-7 7 7" />
      </svg>
    \\\`;
  }

  private _renderHeader() {
    return html\\\`
      <thead>
        <tr role="row">
          \\\${this.columns.map((col) => html\\\`
            <th role="columnheader"
                class="\\\${col.sortable ? 'sortable' : ''}"
                style="\\\${col.width ? 'width: ' + col.width : ''}"
                aria-sort="\\\${this._sort.columnId === col.id && this._sort.direction
                  ? this._sort.direction === 'asc' ? 'ascending' : 'descending'
                  : 'none'}"
                tabindex="\\\${col.sortable ? '0' : '-1'}"
                @click="\\\${() => this._toggleSort(col)}"
                @keydown="\\\${(e: KeyboardEvent) => this._handleHeaderKeydown(e, col)}">
              <span class="header-content">
                \\\${col.header}
                \\\${this._renderSortIcon(col)}
              </span>
            </th>
          \\\`)}
        </tr>
      </thead>
    \\\`;
  }

  private _renderSkeletonRows() {
    return Array.from({ length: this.skeletonRows }, (_, i) => html\\\`
      <tr class="skeleton-row" role="row" aria-rowindex="\\\${i + 2}">
        \\\${this.columns.map(() => html\\\`
          <td role="gridcell">
            <div class="skeleton-cell" style="width: \\\${60 + Math.random() * 30}%"></div>
          </td>
        \\\`)}
      </tr>
    \\\`);
  }

  private _renderBody() {
    if (this.loading) {
      return html\\\`<tbody>\\\${this._renderSkeletonRows()}</tbody>\\\`;
    }
    const rows = this._sortedData;
    if (rows.length === 0) {
      return html\\\`
        <tbody>
          <tr role="row">
            <td colspan="\\\${this.columns.length}" class="empty-state">No data available</td>
          </tr>
        </tbody>
      \\\`;
    }
    return html\\\`
      <tbody>
        \\\${rows.map((row, i) => html\\\`
          <tr role="row" aria-rowindex="\\\${i + 2}">
            \\\${this.columns.map((col) => html\\\`
              <td role="gridcell">\\\${row[col.accessorKey] ?? ''}</td>
            \\\`)}
          </tr>
        \\\`)}
      </tbody>
    \\\`;
  }

  override render() {
    return html\\\`
      <div class="table-container" role="grid"
           aria-label="\\\${this.ariaLabel || 'Data table'}"
           aria-rowcount="\\\${this.data.length + 1}"
           aria-colcount="\\\${this.columns.length}"
           aria-busy="\\\${this.loading}">
        <div class="table-scroll" style="max-height: \\\${this.maxHeight}">
          <table>
            \\\${this._renderHeader()}
            \\\${this._renderBody()}
          </table>
        </div>
      </div>
    \\\`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-data-table': DataTable;
  }
}
`;
