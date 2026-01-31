/**
 * lui-calendar - Accessible calendar display component
 *
 * Renders a 7-column month grid with localized weekday headers,
 * leading/trailing days from adjacent months, and CSS Grid layout.
 */

import { html, css, nothing, isServer, type PropertyValues, type CSSResultGroup } from 'lit';
import { property, state, query } from 'lit/decorators.js';
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
  isSameDay,
  isToday,
  format,
  isBefore,
  isAfter,
  startOfDay,
} from './date-utils.js';
import { parseISO } from 'date-fns';
import { getFirstDayOfWeek, getWeekdayNames, getWeekdayLongNames, getMonthNames } from './intl-utils.js';

/**
 * Represents the parsed date constraint state for the calendar.
 */
export interface DateConstraints {
  minDate: Date | null;
  maxDate: Date | null;
  disabledDates: Date[];
}

/**
 * Result of checking whether a date is disabled.
 */
interface DateDisabledResult {
  disabled: boolean;
  reason: string;
}

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
 * - Date constraints: min-date, max-date, and disabled-dates with ARIA support
 *
 * @element lui-calendar
 * @fires ui-date-select - Dispatched when a date is selected, with { date: Date, isoString: string }
 * @fires ui-month-change - Dispatched when the displayed month changes
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

      .month-year-selectors {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .month-select,
      .year-select {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--ui-calendar-border, #e5e7eb);
        border-radius: var(--ui-calendar-radius, 0.375rem);
        background: var(--ui-calendar-bg, white);
        font-size: 0.875rem;
        cursor: pointer;
        color: inherit;
      }

      .month-select:focus-visible,
      .year-select:focus-visible {
        outline: 2px solid var(--ui-calendar-focus-ring, var(--color-ring, #3b82f6));
        outline-offset: 2px;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
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
        border: 2px solid transparent;
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

      .date-button.today {
        border: 2px solid var(--ui-calendar-today-border, var(--color-primary, #3b82f6));
        font-weight: 600;
      }

      .date-button[aria-selected="true"] {
        background-color: var(--ui-calendar-selected-bg, var(--color-primary, #3b82f6));
        color: var(--ui-calendar-selected-text, white);
      }

      .date-button[aria-selected="true"]:hover {
        background-color: var(--ui-calendar-selected-bg, var(--color-primary, #3b82f6));
        filter: brightness(0.9);
      }

      .date-button:focus-visible {
        outline: 2px solid var(--ui-calendar-focus-ring, var(--color-ring, #3b82f6));
        outline-offset: 2px;
      }

      .date-button[aria-disabled="true"] {
        opacity: var(--ui-calendar-disabled-opacity, 0.5);
        cursor: not-allowed;
        pointer-events: none;
      }

      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      .help-button {
        font-size: 0.75rem;
        color: var(--ui-calendar-weekday-color, #6b7280);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        text-decoration: underline;
      }

      .help-dialog {
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid var(--ui-calendar-border, #e5e7eb);
        max-width: 320px;
      }

      .help-dialog::backdrop {
        background: rgba(0, 0, 0, 0.3);
      }

      .shortcut-list {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0;
        font-size: 0.875rem;
      }

      .shortcut-list li {
        display: flex;
        justify-content: space-between;
        padding: 0.25rem 0;
      }

      .shortcut-list kbd {
        font-family: monospace;
        background: var(--ui-calendar-hover-bg, #f3f4f6);
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
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
   * Minimum selectable date as ISO string (YYYY-MM-DD).
   * Dates before this are visually grayed and not selectable.
   */
  @property({ type: String, attribute: 'min-date' })
  minDate = '';

  /**
   * Maximum selectable date as ISO string (YYYY-MM-DD).
   * Dates after this are visually grayed and not selectable.
   */
  @property({ type: String, attribute: 'max-date' })
  maxDate = '';

  /**
   * Array of specific disabled dates as ISO strings (YYYY-MM-DD).
   * These dates are visually grayed and not selectable.
   */
  @property({ type: Array, attribute: false })
  disabledDates: string[] = [];

  /**
   * Override the first day of week detected from locale.
   * Accepts Intl format values: 1=Monday through 7=Sunday.
   * When empty or invalid, falls back to locale detection.
   */
  @property({ type: String, attribute: 'first-day-of-week' })
  firstDayOfWeekOverride = '';

  /**
   * The currently displayed month.
   */
  @state()
  private currentMonth = new Date();

  /**
   * The currently selected date.
   */
  @state()
  private selectedDate: Date | null = null;

  /**
   * Tracks the selected month index in the dropdown (0-11).
   */
  @state()
  private selectedMonth: number = getMonth(new Date());

  /**
   * Tracks the selected year in the dropdown.
   */
  @state()
  private selectedYear: number = getYear(new Date());

  /**
   * Text for the dedicated aria-live announcement region.
   */
  @state()
  private liveAnnouncement = '';

  /**
   * Whether the keyboard shortcuts help dialog is open.
   */
  @state()
  private showHelp = false;

  /**
   * Parsed date constraints derived from minDate, maxDate, and disabledDates properties.
   */
  private parsedConstraints: DateConstraints = {
    minDate: null,
    maxDate: null,
    disabledDates: [],
  };

  /**
   * Reference to the native dialog element for help shortcuts.
   */
  @query('.help-dialog')
  private helpDialog!: HTMLDialogElement;

  /**
   * Sync dropdown state, value property, and date constraints when reactive properties change.
   */
  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('currentMonth' as keyof this)) {
      this.selectedMonth = getMonth(this.currentMonth);
      this.selectedYear = getYear(this.currentMonth);
    }
    if (changedProperties.has('value') && this.value) {
      this.selectedDate = parseISO(this.value);
    }
    // Parse constraint properties to Date objects when they change
    if (changedProperties.has('minDate')) {
      this.parsedConstraints = {
        ...this.parsedConstraints,
        minDate: this.minDate ? startOfDay(parseISO(this.minDate)) : null,
      };
    }
    if (changedProperties.has('maxDate')) {
      this.parsedConstraints = {
        ...this.parsedConstraints,
        maxDate: this.maxDate ? startOfDay(parseISO(this.maxDate)) : null,
      };
    }
    if (changedProperties.has('disabledDates' as keyof this)) {
      this.parsedConstraints = {
        ...this.parsedConstraints,
        disabledDates: this.disabledDates.map((d) => startOfDay(parseISO(d))),
      };
    }
  }

  /**
   * Check whether a date is disabled based on min/max/disabled constraints.
   *
   * @param date - The date to check
   * @returns Object with disabled flag and human-readable reason
   */
  private isDateDisabled(date: Date): DateDisabledResult {
    const normalized = startOfDay(date);
    const { minDate, maxDate, disabledDates } = this.parsedConstraints;

    if (minDate && isBefore(normalized, minDate)) {
      return { disabled: true, reason: 'before minimum date' };
    }
    if (maxDate && isAfter(normalized, maxDate)) {
      return { disabled: true, reason: 'after maximum date' };
    }
    if (disabledDates.some((d) => isSameDay(d, normalized))) {
      return { disabled: true, reason: 'unavailable' };
    }
    return { disabled: false, reason: '' };
  }

  /**
   * Resolved locale, falling back to navigator.language or 'en-US'.
   */
  private get effectiveLocale(): string {
    return this.locale || (isServer ? 'en-US' : navigator.language);
  }

  /**
   * First day of week in Intl format (1=Mon ... 7=Sun).
   * Uses the override property if valid (1-7), otherwise detects from locale.
   */
  private get firstDayOfWeek(): number {
    if (this.firstDayOfWeekOverride) {
      const parsed = parseInt(this.firstDayOfWeekOverride, 10);
      if (parsed >= 1 && parsed <= 7) {
        return parsed;
      }
    }
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
    this.announceMonthChange();
  }

  /**
   * Navigate to the next month.
   */
  private navigateNextMonth(): void {
    this.currentMonth = addMonths(this.currentMonth, 1);
    this.emitMonthChange();
    this.announceMonthChange();
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

  /**
   * Announce the current month to screen readers via the aria-live region.
   */
  private announceMonthChange(): void {
    this.liveAnnouncement = 'Now showing ' + getMonthYearLabel(this.currentMonth, this.effectiveLocale);
  }

  /**
   * Open the keyboard shortcuts help dialog.
   */
  private openHelpDialog(): void {
    this.showHelp = true;
    if (!isServer) {
      this.updateComplete.then(() => {
        this.helpDialog?.showModal();
      });
    }
  }

  /**
   * Close the keyboard shortcuts help dialog.
   */
  private closeHelpDialog(): void {
    this.showHelp = false;
    if (!isServer) {
      this.helpDialog?.close();
    }
  }

  /**
   * Handle date selection via click.
   * Skips outside-month dates and disabled dates, sets selectedDate, and emits ui-date-select.
   */
  private handleDateSelect(date: Date): void {
    if (!isSameMonth(date, this.currentMonth)) {
      return;
    }
    const { disabled } = this.isDateDisabled(date);
    if (disabled) {
      return;
    }
    this.selectedDate = date;
    dispatchCustomEvent(this, 'ui-date-select', {
      date: date,
      isoString: format(date, 'yyyy-MM-dd'),
    });
    this.liveAnnouncement = 'Selected ' + formatDateLabel(date, this.effectiveLocale);
  }

  /**
   * Handle month dropdown selection change.
   */
  private handleMonthSelect(e: Event): void {
    const month = parseInt((e.target as HTMLSelectElement).value, 10);
    const newDate = new Date(this.currentMonth);
    newDate.setMonth(month);
    this.currentMonth = newDate;
    this.emitMonthChange();
    this.announceMonthChange();
  }

  /**
   * Handle year dropdown selection change.
   */
  private handleYearSelect(e: Event): void {
    const year = parseInt((e.target as HTMLSelectElement).value, 10);
    const newDate = new Date(this.currentMonth);
    newDate.setFullYear(year);
    this.currentMonth = newDate;
    this.emitMonthChange();
    this.announceMonthChange();
  }

  /**
   * Generate a range of years for the year dropdown.
   * Returns 150 years: current year - 100 through current year + 50.
   */
  private getYearRange(): number[] {
    const currentYear = getYear(new Date());
    const years: number[] = [];
    for (let y = currentYear - 100; y <= currentYear + 50; y++) {
      years.push(y);
    }
    return years;
  }

  protected override render() {
    const weekdays = getWeekdayNames(this.effectiveLocale, this.firstDayOfWeek);
    const weekdayLongNames = getWeekdayLongNames(this.effectiveLocale, this.firstDayOfWeek);
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
          <div class="month-year-selectors">
            <h2 id="month-heading" class="sr-only" aria-live="polite">${monthLabel}</h2>
            <select
              class="month-select"
              aria-label="Select month"
              @change="${this.handleMonthSelect}"
            >
              ${getMonthNames(this.effectiveLocale).map(
                (name, i) => html`
                  <option value="${i}" ?selected="${i === this.selectedMonth}">
                    ${name}
                  </option>
                `
              )}
            </select>
            <select
              class="year-select"
              aria-label="Select year"
              @change="${this.handleYearSelect}"
            >
              ${this.getYearRange().map(
                (year) => html`
                  <option value="${year}" ?selected="${year === this.selectedYear}">
                    ${year}
                  </option>
                `
              )}
            </select>
          </div>
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
            (name, i) => html`
              <div
                class="weekday-header"
                role="columnheader"
                aria-label="${weekdayLongNames[i]}"
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
            const today = isToday(day);
            const selected = this.selectedDate !== null && isSameDay(day, this.selectedDate);
            const constraint = this.isDateDisabled(day);
            const isDisabled = outsideMonth || constraint.disabled;
            const label = constraint.disabled
              ? `${formatDateLabel(day, this.effectiveLocale)}, ${constraint.reason}`
              : formatDateLabel(day, this.effectiveLocale);
            return html`
              <button
                class="date-button ${outsideMonth ? 'outside-month' : ''} ${today ? 'today' : ''}"
                aria-label="${label}"
                aria-current="${today ? 'date' : nothing}"
                aria-selected="${selected ? 'true' : 'false'}"
                aria-disabled="${isDisabled ? 'true' : 'false'}"
                @click="${() => this.handleDateSelect(day)}"
              >
                ${day.getDate()}
              </button>
            `;
          })}
        </div>
        <div class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          ${this.liveAnnouncement}
        </div>
        <div style="text-align: center; padding: 0.25rem;">
          <button
            class="help-button"
            @click="${this.openHelpDialog}"
            aria-label="Keyboard shortcuts"
          >
            ? Keyboard shortcuts
          </button>
        </div>
        <dialog class="help-dialog" @close="${() => this.showHelp = false}">
          <h3 style="margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600;">Keyboard Shortcuts</h3>
          <ul class="shortcut-list">
            <li><span>Previous day</span> <kbd>&#8592;</kbd></li>
            <li><span>Next day</span> <kbd>&#8594;</kbd></li>
            <li><span>Previous week</span> <kbd>&#8593;</kbd></li>
            <li><span>Next week</span> <kbd>&#8595;</kbd></li>
            <li><span>Previous month</span> <kbd>PageUp</kbd></li>
            <li><span>Next month</span> <kbd>PageDown</kbd></li>
            <li><span>Start of month</span> <kbd>Home</kbd></li>
            <li><span>End of month</span> <kbd>End</kbd></li>
            <li><span>Select date</span> <kbd>Enter</kbd></li>
          </ul>
          <button
            @click="${this.closeHelpDialog}"
            style="margin-top: 0.5rem; padding: 0.375rem 0.75rem; border: 1px solid var(--ui-calendar-border, #e5e7eb); border-radius: 0.25rem; background: none; cursor: pointer;"
          >
            Close
          </button>
        </dialog>
      </div>
    `;
  }
}
