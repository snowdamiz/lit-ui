/**
 * lui-calendar - Accessible calendar display component
 *
 * Renders a 7-column month grid with localized weekday headers,
 * leading/trailing days from adjacent months, and CSS Grid layout.
 */

import { html, css, isServer, type PropertyValues, type CSSResultGroup } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles, dispatchCustomEvent } from '@lit-ui/core';
import {
  addMonths,
  subMonths,
  getYear,
  getMonth,
  getCalendarDays,
  getMonthYearLabel,
  intlFirstDayToDateFns,
  isSameMonth,
} from './date-utils.js';
import { getFirstDayOfWeek, getWeekdayNames } from './intl-utils.js';

/**
 * Format a date as a full accessible label for screen readers.
 *
 * @param date - The date to format
 * @param locale - BCP 47 locale tag
 * @returns Localized string like "Thursday, January 1, 2026"
 */
function formatDateLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Calendar display component that renders a 7-column month grid.
 *
 * Features:
 * - Localized weekday headers via Intl API
 * - Leading/trailing days from adjacent months with reduced opacity
 * - CSS Grid layout with customizable sizing via CSS custom properties
 * - SSR-safe with isServer guards
 *
 * @element lui-calendar
 */
export class Calendar extends TailwindElement {
  static override styles: CSSResultGroup = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
      }

      .calendar {
        width: var(--ui-calendar-width, 320px);
      }

      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
      }

      .calendar-header h2 {
        font-size: 0.875rem;
        font-weight: 600;
        margin: 0;
      }

      .nav-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: var(--ui-calendar-radius, 0.375rem);
        color: var(--ui-calendar-nav-color, currentColor);
      }

      .nav-button:hover {
        background-color: var(--ui-calendar-hover-bg, #f3f4f6);
      }

      .nav-button:focus-visible {
        outline: 2px solid var(--ui-calendar-focus-ring, var(--color-ring, #3b82f6));
        outline-offset: 2px;
      }

      .nav-button svg {
        width: 1rem;
        height: 1rem;
      }

      .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--ui-calendar-gap, 0.125rem);
        text-align: center;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--ui-calendar-gap, 0.125rem);
      }

      .weekday-header {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ui-calendar-weekday-color, #6b7280);
        padding: 0.5rem 0;
      }

      .date-button {
        width: var(--ui-calendar-day-size, 2.5rem);
        height: var(--ui-calendar-day-size, 2.5rem);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ui-calendar-radius, 0.375rem);
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.875rem;
        margin: 0 auto;
        color: inherit;
      }

      .date-button:hover {
        background-color: var(--ui-calendar-hover-bg, #f3f4f6);
      }

      .date-button.outside-month {
        opacity: var(--ui-calendar-outside-opacity, 0.4);
      }
    `,
  ];

  /**
   * Selected date as ISO string (YYYY-MM-DD).
   */
  @property({ type: String })
  value = '';

  /**
   * BCP 47 locale tag for localization.
   * Defaults to navigator.language on client, 'en-US' on server.
   */
  @property({ type: String })
  locale = '';

  /**
   * The currently displayed month.
   */
  @state()
  private currentMonth = new Date();

  /**
   * Resolved locale, falling back to navigator.language or 'en-US'.
   */
  private get effectiveLocale(): string {
    return this.locale || (isServer ? 'en-US' : navigator.language);
  }

  /**
   * First day of week in Intl format (1=Mon ... 7=Sun).
   */
  private get firstDayOfWeek(): number {
    return getFirstDayOfWeek(this.effectiveLocale);
  }

  /**
   * First day of week in date-fns format (0=Sun ... 6=Sat).
   */
  private get weekStartsOn(): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
    return intlFirstDayToDateFns(this.firstDayOfWeek);
  }

  /**
   * Navigate to the previous month.
   */
  private navigatePrevMonth(): void {
    this.currentMonth = subMonths(this.currentMonth, 1);
    this.emitMonthChange();
  }

  /**
   * Navigate to the next month.
   */
  private navigateNextMonth(): void {
    this.currentMonth = addMonths(this.currentMonth, 1);
    this.emitMonthChange();
  }

  /**
   * Emit ui-month-change event with the current year and month.
   */
  private emitMonthChange(): void {
    dispatchCustomEvent(this, 'ui-month-change', {
      year: getYear(this.currentMonth),
      month: getMonth(this.currentMonth),
    });
  }

  protected override render() {
    const weekdays = getWeekdayNames(this.effectiveLocale, this.firstDayOfWeek);
    const days = getCalendarDays(this.currentMonth, this.weekStartsOn);
    const monthLabel = getMonthYearLabel(this.currentMonth, this.effectiveLocale);

    return html`
      <div class="calendar">
        <div class="calendar-header">
          <button
            class="nav-button"
            @click="${this.navigatePrevMonth}"
            aria-label="Previous month, ${getMonthYearLabel(subMonths(this.currentMonth, 1), this.effectiveLocale)}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 id="month-heading">${monthLabel}</h2>
          <button
            class="nav-button"
            @click="${this.navigateNextMonth}"
            aria-label="Next month, ${getMonthYearLabel(addMonths(this.currentMonth, 1), this.effectiveLocale)}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <div class="calendar-weekdays" role="row">
          ${weekdays.map(
            (name) => html`
              <div
                class="weekday-header"
                role="columnheader"
                aria-label="${name}"
              >
                ${name}
              </div>
            `
          )}
        </div>
        <div
          class="calendar-grid"
          role="grid"
          aria-labelledby="month-heading"
        >
          ${days.map((day) => {
            const outsideMonth = !isSameMonth(day, this.currentMonth);
            return html`
              <button
                class="date-button ${outsideMonth ? 'outside-month' : ''}"
                aria-label="${formatDateLabel(day, this.effectiveLocale)}"
                ?aria-disabled="${outsideMonth}"
              >
                ${day.getDate()}
              </button>
            `;
          })}
        </div>
      </div>
    `;
  }
}
