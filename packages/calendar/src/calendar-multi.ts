/**
 * lui-calendar-multi - Multi-month calendar wrapper component
 *
 * Renders 2-3 Calendar instances side by side with synchronized navigation.
 * Each child calendar uses display-month and hide-navigation props for
 * external control by this wrapper.
 *
 * @example
 * ```html
 * <lui-calendar-multi months="2" locale="en-US"></lui-calendar-multi>
 * <lui-calendar-multi months="3" value="2026-03-15"></lui-calendar-multi>
 * ```
 */

import { html, css, nothing, isServer } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { addMonths, subMonths } from 'date-fns';

// Ensure Calendar is registered
import './calendar.js';

// Import formatDate for ISO string generation
import { formatDate } from './date-utils.js';

/**
 * Multi-month calendar wrapper that renders 2-3 synchronized Calendar instances.
 *
 * Owns navigation (prev/next month) and passes display-month and hide-navigation
 * to each child Calendar. Date selection events bubble from children.
 */
export class CalendarMulti extends TailwindElement {
  /**
   * Number of months to display (clamped to 2-3).
   * @default 2
   */
  @property({ type: Number })
  months: number = 2;

  /**
   * Locale for date formatting (BCP 47 language tag).
   * Passed through to child Calendar instances.
   * @default 'en-US'
   */
  @property({ type: String })
  locale: string = 'en-US';

  /**
   * Currently selected date in ISO 8601 format (YYYY-MM-DD).
   * Passed through to child Calendar instances.
   * @default ''
   */
  @property({ type: String })
  value: string = '';

  /**
   * Minimum selectable date in ISO 8601 format (YYYY-MM-DD).
   * Passed through to child Calendar instances.
   */
  @property({ type: String, attribute: 'min-date' })
  minDate?: string;

  /**
   * Maximum selectable date in ISO 8601 format (YYYY-MM-DD).
   * Passed through to child Calendar instances.
   */
  @property({ type: String, attribute: 'max-date' })
  maxDate?: string;

  /**
   * Array of disabled dates in ISO 8601 format (YYYY-MM-DD).
   * Passed through to child Calendar instances.
   */
  @property({ type: Array, attribute: 'disabled-dates' })
  disabledDates?: string[];

  /**
   * Whether to disable weekend dates.
   * Passed through to child Calendar instances.
   * @default false
   */
  @property({ type: Boolean, attribute: 'disable-weekends' })
  disableWeekends = false;

  /**
   * Whether to show ISO 8601 week numbers.
   * Passed through to child Calendar instances.
   * @default false
   */
  @property({ type: Boolean, attribute: 'show-week-numbers' })
  showWeekNumbers = false;

  /**
   * Component size variant.
   * Passed through to child Calendar instances.
   * @default 'md'
   */
  @property({ type: String })
  size: string = 'md';

  /**
   * The base month for the leftmost calendar.
   * Other calendars display consecutive months from this base.
   */
  @state()
  private baseMonth: Date = new Date();

  /**
   * Navigate to previous month.
   * Shifts all displayed calendars back by one month.
   */
  private handlePreviousMonth(): void {
    this.baseMonth = subMonths(this.baseMonth, 1);
    this.dispatchEvent(new CustomEvent('ui-month-change', {
      bubbles: true,
      composed: true,
      detail: {
        year: this.baseMonth.getFullYear(),
        month: this.baseMonth.getMonth()
      }
    }));
  }

  /**
   * Navigate to next month.
   * Shifts all displayed calendars forward by one month.
   */
  private handleNextMonth(): void {
    this.baseMonth = addMonths(this.baseMonth, 1);
    this.dispatchEvent(new CustomEvent('ui-month-change', {
      bubbles: true,
      composed: true,
      detail: {
        year: this.baseMonth.getFullYear(),
        month: this.baseMonth.getMonth()
      }
    }));
  }

  /**
   * Handle date selection from a child calendar.
   * Re-dispatches the event so consumers listen on the wrapper.
   */
  private handleDateSelect(e: CustomEvent): void {
    // Event already bubbles from child; re-dispatch from this host
    this.dispatchEvent(new CustomEvent('ui-date-select', {
      bubbles: true,
      composed: true,
      detail: e.detail
    }));
  }

  /**
   * Get a formatted label showing the range of displayed months.
   * Example: "January - February 2026" or "January - March 2026"
   */
  private getMonthRange(): string {
    const monthCount = Math.min(Math.max(this.months, 2), 3);
    const lastMonth = addMonths(this.baseMonth, monthCount - 1);

    const firstFormatter = new Intl.DateTimeFormat(this.locale, { month: 'long' });
    const lastFormatter = new Intl.DateTimeFormat(this.locale, {
      month: 'long',
      year: 'numeric'
    });

    const firstMonthName = firstFormatter.format(this.baseMonth);
    const lastMonthLabel = lastFormatter.format(lastMonth);

    // If same year, show "Month1 - MonthN Year"
    // If different years, show full labels for both
    if (this.baseMonth.getFullYear() === lastMonth.getFullYear()) {
      return `${firstMonthName} – ${lastMonthLabel}`;
    } else {
      const firstFullFormatter = new Intl.DateTimeFormat(this.locale, {
        month: 'long',
        year: 'numeric'
      });
      return `${firstFullFormatter.format(this.baseMonth)} – ${lastMonthLabel}`;
    }
  }

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
        container-name: calendar-multi;
      }

      .calendar-multi-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
      }

      .calendar-multi-header button {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--ui-calendar-border, var(--color-border, #e5e7eb));
        background: var(--ui-calendar-bg, var(--color-background, #ffffff));
        cursor: pointer;
        border-radius: var(--ui-calendar-radius, 0.25rem);
        color: var(--ui-calendar-text, var(--color-text, #111827));
        transition: background-color 150ms;
        font-size: 1rem;
      }

      .calendar-multi-header button:hover {
        background: var(--ui-calendar-hover-bg, var(--color-muted, #f3f4f6));
      }

      .calendar-multi-header button:focus {
        outline: 2px solid var(--ui-calendar-focus, var(--color-brand-500));
        outline-offset: 2px;
      }

      .calendar-multi-header h2 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        text-align: center;
        flex: 1;
      }

      .calendar-grid-container {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .calendar-grid-container > * {
        flex: 1 1 280px;
      }

      /* Dark mode navigation buttons */
      :host-context(.dark) .calendar-multi-header button {
        background: var(--ui-calendar-button-bg-dark, var(--color-background-dark, var(--color-gray-950)));
        border-color: var(--ui-calendar-button-border-dark, var(--color-border-dark, var(--color-gray-800)));
        color: var(--ui-calendar-button-text-dark, var(--color-foreground-dark, var(--color-gray-50)));
      }

      :host-context(.dark) .calendar-multi-header button:hover {
        background: var(--ui-calendar-button-hover-bg-dark, var(--color-muted-dark, var(--color-gray-800)));
      }

      :host-context(.dark) .calendar-multi-header h2 {
        color: var(--ui-calendar-button-text-dark, var(--color-foreground-dark, var(--color-gray-50)));
      }

      /* Container query: stack vertically on narrow containers */
      @container calendar-multi (max-width: 600px) {
        .calendar-grid-container {
          flex-direction: column;
        }
        .calendar-grid-container > * {
          flex: 1 1 auto;
        }
      }
    `,
  ];

  override render() {
    const monthCount = Math.min(Math.max(this.months, 2), 3);

    return html`
      <div class="calendar-multi" role="group" aria-label="Multi-month calendar">
        <div class="calendar-multi-header">
          <button
            @click=${this.handlePreviousMonth}
            aria-label="Previous month"
            type="button"
          >
            &lt;
          </button>
          <h2 aria-live="polite">${this.getMonthRange()}</h2>
          <button
            @click=${this.handleNextMonth}
            aria-label="Next month"
            type="button"
          >
            &gt;
          </button>
        </div>
        <div class="calendar-grid-container">
          ${Array.from({ length: monthCount }, (_, i) => {
            const month = addMonths(this.baseMonth, i);
            const isoMonth = formatDate(month);
            return html`
              <lui-calendar
                .locale=${this.locale}
                display-month=${isoMonth}
                hide-navigation
                .value=${this.value}
                .minDate=${this.minDate}
                .maxDate=${this.maxDate}
                .disabledDates=${this.disabledDates}
                .disableWeekends=${this.disableWeekends}
                .showWeekNumbers=${this.showWeekNumbers}
                .size=${this.size}
                @ui-date-select=${this.handleDateSelect}
              ></lui-calendar>
            `;
          })}
        </div>
      </div>
    `;
  }
}
