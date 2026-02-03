/**
 * lui-pagination-controls - Pagination UI for data tables
 *
 * Provides page navigation (first, prev, next, last), page size selector,
 * and page info display ("Showing 1-25 of 1,000").
 */
import { html, css, nothing, isServer } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

/**
 * Pagination controls component for data tables.
 *
 * Emits:
 * - `page-change` - When page index changes (detail: { pageIndex: number })
 * - `page-size-change` - When page size changes (detail: { pageSize: number })
 *
 * @example
 * ```html
 * <lui-pagination-controls
 *   page-index="0"
 *   page-count="10"
 *   page-size="25"
 *   total-rows="250"
 *   @page-change=${(e) => handlePageChange(e.detail.pageIndex)}
 *   @page-size-change=${(e) => handlePageSizeChange(e.detail.pageSize)}
 * ></lui-pagination-controls>
 * ```
 */
@customElement('lui-pagination-controls')
export class PaginationControls extends TailwindElement {
  /**
   * Current page index (0-based).
   */
  @property({ type: Number, attribute: 'page-index' })
  pageIndex = 0;

  /**
   * Total number of pages.
   */
  @property({ type: Number, attribute: 'page-count' })
  pageCount = 1;

  /**
   * Current page size (rows per page).
   */
  @property({ type: Number, attribute: 'page-size' })
  pageSize = 25;

  /**
   * Available page size options.
   */
  @property({ type: Array, attribute: false })
  pageSizeOptions: number[] = [10, 25, 50, 100];

  /**
   * Total number of rows across all pages.
   */
  @property({ type: Number, attribute: 'total-rows' })
  totalRows = 0;

  /**
   * Whether to show the page size selector.
   */
  @property({ type: Boolean, attribute: 'show-page-size-selector' })
  showPageSizeSelector = true;

  private get canPrevious(): boolean {
    return this.pageIndex > 0;
  }

  private get canNext(): boolean {
    return this.pageIndex < this.pageCount - 1;
  }

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.75rem 1rem;
        border-top: 1px solid var(--color-border, #e4e4e7);
        font-size: 0.875rem;
        color: var(--color-muted-foreground, #71717a);
      }

      .page-info {
        flex-shrink: 0;
      }

      .page-size-selector {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      .page-size-selector label {
        white-space: nowrap;
      }

      .page-nav {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .page-indicator {
        padding: 0 0.5rem;
        white-space: nowrap;
      }

      .nav-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid var(--color-border, #e4e4e7);
        border-radius: var(--ui-radius-sm, 0.25rem);
        background: var(--color-background, #ffffff);
        color: var(--color-foreground, #09090b);
        cursor: pointer;
        transition: background-color 0.15s, border-color 0.15s;
      }

      .nav-button:hover:not(:disabled) {
        background: var(--color-muted, #f4f4f5);
        border-color: var(--color-border, #e4e4e7);
      }

      .nav-button:focus-visible {
        outline: 2px solid var(--color-primary, #3b82f6);
        outline-offset: 2px;
      }

      .nav-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .nav-button svg {
        width: 16px;
        height: 16px;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      :host-context(.dark) {
        border-color: #3f3f46;
      }

      :host-context(.dark) .nav-button {
        background: #09090b;
        border-color: #3f3f46;
        color: #fafafa;
      }

      :host-context(.dark) .nav-button:hover:not(:disabled) {
        background: #27272a;
      }

      @media (max-width: 640px) {
        :host {
          flex-wrap: wrap;
          justify-content: center;
        }
        .page-info {
          order: 1;
          width: 100%;
          text-align: center;
          margin-bottom: 0.5rem;
        }
      }
    `,
  ];

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

  private handlePageSizeChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    this.dispatchEvent(
      new CustomEvent('page-size-change', {
        detail: { pageSize: newSize },
        bubbles: true,
        composed: true,
      })
    );
  }

  private dispatchPageChange(pageIndex: number): void {
    this.dispatchEvent(
      new CustomEvent('page-change', {
        detail: { pageIndex },
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderPageInfo() {
    if (this.totalRows === 0) {
      return html`<div class="page-info">No results</div>`;
    }

    const startRow = this.pageIndex * this.pageSize + 1;
    const endRow = Math.min((this.pageIndex + 1) * this.pageSize, this.totalRows);

    return html`
      <div class="page-info">
        Showing ${startRow.toLocaleString()}-${endRow.toLocaleString()} of
        ${this.totalRows.toLocaleString()}
      </div>
    `;
  }

  private renderPageSizeSelector() {
    if (!this.showPageSizeSelector) return nothing;

    return html`
      <div class="page-size-selector">
        <label for="page-size">Rows per page:</label>
        <select
          id="page-size"
          .value=${this.pageSize.toString()}
          @change=${this.handlePageSizeChange}
        >
          ${this.pageSizeOptions.map(
            (size) => html`
              <option value=${size.toString()} ?selected=${size === this.pageSize}>
                ${size}
              </option>
            `
          )}
        </select>
      </div>
    `;
  }

  override render() {
    return html`
      ${this.renderPageInfo()} ${this.renderPageSizeSelector()}

      <nav class="page-nav" role="navigation" aria-label="Pagination">
        <button
          type="button"
          class="nav-button"
          ?disabled=${!this.canPrevious}
          @click=${this.handleFirst}
          aria-label="First page"
          title="First page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 17l-5-5 5-5" />
            <path d="M18 17l-5-5 5-5" />
          </svg>
        </button>
        <button
          type="button"
          class="nav-button"
          ?disabled=${!this.canPrevious}
          @click=${this.handlePrevious}
          aria-label="Previous page"
          title="Previous page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <span class="page-indicator"> Page ${this.pageIndex + 1} of ${this.pageCount} </span>

        <button
          type="button"
          class="nav-button"
          ?disabled=${!this.canNext}
          @click=${this.handleNext}
          aria-label="Next page"
          title="Next page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button
          type="button"
          class="nav-button"
          ?disabled=${!this.canNext}
          @click=${this.handleLast}
          aria-label="Last page"
          title="Last page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M13 17l5-5-5-5" />
            <path d="M6 17l5-5-5-5" />
          </svg>
        </button>
      </nav>
    `;
  }
}

// JSX type declaration
declare global {
  interface HTMLElementTagNameMap {
    'lui-pagination-controls': PaginationControls;
  }
}
