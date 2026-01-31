/**
 * lui-calendar - Accessible calendar component
 *
 * Features:
 * - 7-column month grid with weekday headers
 * - Locale-aware weekday and month names via Intl API
 * - Current month display with all days in grid cells
 * - SSR compatible via TailwindElement base class
 * - date-fns for date calculations (getMonthDays)
 * - WAI-ARIA Grid pattern structure (role="grid", role="columnheader", role="gridcell")
 *
 * @example
 * ```html
 * <lui-calendar locale="en-US"></lui-calendar>
 * <lui-calendar locale="fr-FR" value="2026-01-15"></lui-calendar>
 * ```
 */

import { html, css, nothing, isServer } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

// Import utility functions
import { getMonthDays, formatDate, isSameDayCompare, isDateToday } from './date-utils.js';
import { getWeekdayNames, getMonthYearLabel } from './intl-utils.js';

/**
 * Calendar component displaying a 7-column month grid.
 *
 * Extends TailwindElement for SSR support and Tailwind CSS integration.
 * Uses date-fns for date math and Intl API for localization.
 */
export class Calendar extends TailwindElement {
  /**
   * Locale for date formatting (BCP 47 language tag).
   * Controls weekday names and month/year label formatting.
   * @default 'en-US'
   */
  @property({ type: String })
  locale: string = 'en-US';

  /**
   * Currently selected date in ISO 8601 format (YYYY-MM-DD).
   * @default '' (no selection)
   */
  @property({ type: String })
  value: string = '';

  /**
   * Internal state tracking the currently displayed month.
   * Initialized to current date on client side.
   */
  @state()
  private currentMonth: Date = new Date();

  /**
   * Internal state tracking the currently selected date.
   * Stores ISO date string and syncs with value property.
   */
  @state()
  private selectedDate: string = '';

  constructor() {
    super();
    // Client-only initialization
    if (!isServer) {
      // Initialize currentMonth to current date
      this.currentMonth = new Date();

      // Initialize selectedDate from value property
      if (this.value) {
        this.selectedDate = this.value;
        const parsedDate = new Date(this.value);
        if (!isNaN(parsedDate.getTime())) {
          this.currentMonth = parsedDate;
        }
      }
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Initialize selectedDate from value when element connects
    if (this.value && !this.selectedDate) {
      this.selectedDate = this.value;
    }
  }

  /**
   * Static styles for calendar grid layout.
   * Includes Tailwind base styles for SSR support.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
      }

      /* Grid container with 7 columns */
      [role='grid'] {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--ui-calendar-gap, 0.25rem);
      }

      /* Weekday headers */
      [role='columnheader'] {
        text-align: center;
        font-weight: 600;
        padding: 0.5rem;
        color: var(--color-gray-600);
      }

      /* Dark mode weekday headers */
      :host-context(.dark) [role='columnheader'] {
        color: var(--color-gray-400);
      }

      /* Date cells */
      [role='gridcell'] {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: var(--ui-calendar-cell-size, 2.5rem);
        border-radius: var(--ui-calendar-cell-radius, 0.375rem);
        cursor: pointer;
        transition: background-color 150ms;
      }

      [role='gridcell']:hover {
        background-color: var(--color-gray-100);
      }

      :host-context(.dark) [role='gridcell']:hover {
        background-color: var(--color-gray-800);
      }

      /* Today indicator */
      [role='gridcell'][aria-current='date'] {
        font-weight: var(--ui-calendar-today-font-weight, 600);
        border: var(--ui-calendar-today-border, 2px solid var(--color-brand-500));
      }

      /* Selected date */
      [role='gridcell'][aria-selected='true'] {
        background-color: var(--ui-calendar-selected-bg, var(--color-brand-500));
        color: var(--ui-calendar-selected-text, oklch(0.98 0.01 250));
      }

      [role='gridcell'][aria-selected='true']:hover {
        opacity: 0.9;
      }

      /* Disabled state */
      [role='gridcell'][aria-disabled='true'] {
        opacity: var(--ui-calendar-disabled-opacity, 0.4);
        pointer-events: none;
      }
    `,
  ];

  /**
   * Get all days in the current month.
   * Calls getMonthDays from date-utils.
   */
  private getMonthDays(): Date[] {
    return getMonthDays(this.currentMonth);
  }

  /**
   * Get localized weekday names.
   * Calls getWeekdayNames from intl-utils.
   */
  private getWeekdayNames(): string[] {
    return getWeekdayNames(this.locale);
  }

  /**
   * Get localized month/year label.
   * Calls getMonthYearLabel from intl-utils.
   */
  private getMonthYearLabel(): string {
    return getMonthYearLabel(this.currentMonth, this.locale);
  }

  /**
   * Render a single date cell.
   */
  private renderDayCell(date: Date) {
    const isoDate = formatDate(date);
    const isSelected = this.selectedDate ? isSameDayCompare(date, new Date(this.selectedDate)) : false;
    const isToday = isDateToday(date);

    return html`
      <div
        role="gridcell"
        aria-selected=${isSelected ? 'true' : 'false'}
        aria-current=${isToday ? 'date' : nothing}
        tabindex="0"
        data-date="${isoDate}"
        @click=${() => this.handleDateClick(date)}
      >
        ${date.getDate()}
      </div>
    `;
  }

  /**
   * Handle date cell click.
   * Updates selectedDate state and emits ui-date-select event.
   */
  private handleDateClick(date: Date): void {
    const isoDate = formatDate(date);
    this.selectedDate = isoDate;
    this.emitDateSelect(date);
  }

  /**
   * Emit ui-date-select event with selected date.
   */
  private emitDateSelect(date: Date): void {
    const isoDate = formatDate(date);
    this.dispatchEvent(new CustomEvent('ui-date-select', {
      bubbles: true,
      composed: true,
      detail: { date: isoDate }
    }));
  }

  /**
   * Render the calendar grid with weekday headers and date cells.
   */
  override render() {
    return html`
      <div role="grid" aria-labelledby="calendar-heading">
        <h2 id="calendar-heading" class="text-lg font-semibold mb-2">
          ${this.getMonthYearLabel()}
        </h2>

        <!-- Weekday headers -->
        <div role="row">
          ${this.getWeekdayNames().map(
            (day) => html`
              <div role="columnheader" aria-label="${day}">
                ${day}
              </div>
            `
          )}
        </div>

        <!-- Date cells -->
        ${this.getMonthDays().map((date) => this.renderDayCell(date))}
      </div>
    `;
  }
}
