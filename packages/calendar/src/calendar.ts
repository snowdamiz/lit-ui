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
import { property, state, query } from 'lit/decorators.js';
import { PropertyValues } from 'lit';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

// Import utility functions
import { getMonthDays, formatDate, isSameDayCompare, isDateToday, addMonthsTo, subtractMonths, parseDate, isDateDisabled, isWeekendDate, DateConstraints } from './date-utils.js';
import { isBefore, isAfter, isSameDay } from 'date-fns';
import { getWeekdayNames, getMonthYearLabel, getMonthName } from './intl-utils.js';
import { KeyboardNavigationManager } from './keyboard-nav.js';

export type CalendarSize = 'sm' | 'md' | 'lg';
export type CalendarView = 'month' | 'year' | 'decade';

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
   * Minimum selectable date in ISO 8601 format (YYYY-MM-DD).
   * Dates before this value are disabled.
   * @default undefined (no minimum)
   */
  @property({ type: String, attribute: 'min-date' })
  minDate?: string;

  /**
   * Maximum selectable date in ISO 8601 format (YYYY-MM-DD).
   * Dates after this value are disabled.
   * @default undefined (no maximum)
   */
  @property({ type: String, attribute: 'max-date' })
  maxDate?: string;

  /**
   * Array of disabled dates in ISO 8601 format (YYYY-MM-DD).
   * These specific dates cannot be selected.
   * @default undefined (no disabled dates)
   */
  @property({ type: Array, attribute: 'disabled-dates' })
  disabledDates?: string[];

  /**
   * Whether to disable weekend dates (Saturday and Sunday).
   * @default false
   */
  @property({ type: Boolean, attribute: 'disable-weekends' })
  disableWeekends = false;

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

  /**
   * Tracks the currently focused cell index for roving tabindex.
   * Not reactive (@state) - focus changes must NOT trigger re-renders,
   * as tabindex is managed imperatively by KeyboardNavigationManager.
   */
  private focusedIndex: number = 0;

  /**
   * Keyboard navigation manager for roving tabindex.
   * Not reactive - managed imperatively, no re-render needed.
   */
  private navigationManager: KeyboardNavigationManager | null = null;

  /**
   * Query all grid cell elements for keyboard navigation.
   */
  @query('[role="gridcell"]')
  gridCells!: NodeListOf<HTMLElement>;

  /**
   * Internal state for screen reader announcements.
   * Updated when dates are selected to announce to screen readers.
   */
  @state()
  private liveAnnouncement: string = '';

  /**
   * Internal state tracking the selected month index for dropdown.
   * @default current month (0-11)
   */
  @state()
  private selectedMonth: number = new Date().getMonth();

  /**
   * Internal state tracking the selected year for dropdown.
   * @default current year
   */
  @state()
  private selectedYear: number = new Date().getFullYear();

  /**
   * Internal state storing parsed minimum date as Date object.
   */
  @state()
  private parsedMinDate?: Date;

  /**
   * Internal state storing parsed maximum date as Date object.
   */
  @state()
  private parsedMaxDate?: Date;

  /**
   * Internal state storing parsed disabled dates as Date objects.
   */
  @state()
  private parsedDisabledDates?: Date[];

  /**
   * Controls keyboard help dialog visibility.
   */
  @state()
  private showKeyboardHelp: boolean = false;

  /**
   * Current calendar view: month (day grid), year (decade/year grid), decade (century/decade grid).
   * @default 'month'
   */
  @state()
  private view: CalendarView = 'month';

  constructor() {
    super();
    // Client-only initialization
    if (!isServer) {
      const now = new Date();

      // Initialize currentMonth to current date
      this.currentMonth = now;
      this.selectedMonth = now.getMonth();
      this.selectedYear = now.getFullYear();

      // Initialize selectedDate from value property
      if (this.value) {
        this.selectedDate = this.value;
        const parsedDate = new Date(this.value);
        if (!isNaN(parsedDate.getTime())) {
          this.currentMonth = parsedDate;
          this.selectedMonth = parsedDate.getMonth();
          this.selectedYear = parsedDate.getFullYear();
        }
      }
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Initialize selectedDate from value when element connects
    if (this.value && !this.selectedDate) {
      this.selectedDate = this.value;
      const parsedDate = new Date(this.value);
      if (!isNaN(parsedDate.getTime())) {
        this.selectedMonth = parsedDate.getMonth();
        this.selectedYear = parsedDate.getFullYear();
      }
    }

    // Initialize keyboard navigation (client-only)
    if (!isServer && this.gridCells) {
      this.initializeNavigationManager();
    }
  }

  /**
   * Initialize navigation manager and set initial focus.
   * Called when element connects and when grid cells change.
   */
  private initializeNavigationManager(): void {
    if (isServer) return;

    const cells = Array.from(this.gridCells);
    if (cells.length === 0) return;

    // Create or update navigation manager
    if (!this.navigationManager) {
      this.navigationManager = new KeyboardNavigationManager(cells);
    } else {
      this.navigationManager.updateElements(cells);
    }

    // Find initial focus index (selected date or today)
    let initialIndex = 0;
    if (this.selectedDate) {
      const selectedIndex = cells.findIndex(cell =>
        cell.getAttribute('data-date') === this.selectedDate
      );
      if (selectedIndex !== -1) {
        initialIndex = selectedIndex;
      }
    } else {
      // Find today's date
      const todayIndex = cells.findIndex(cell => {
        const dateAttr = cell.getAttribute('data-date');
        return dateAttr && isDateToday(new Date(dateAttr));
      });
      if (todayIndex !== -1) {
        initialIndex = todayIndex;
      }
    }

    this.focusedIndex = initialIndex;
    this.navigationManager.setInitialFocus(initialIndex);
  }

  override firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);

    // Set initial tabindex imperatively after first render
    // Template has no tabindex, so we must set it via DOM manipulation
    if (!isServer && this.gridCells) {
      this.initializeNavigationManager();
      requestAnimationFrame(() => {
        const initialIndex = this.focusedIndex;
        this.navigationManager?.setInitialFocus(initialIndex);
      });
    }
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // Parse minDate when it changes
    if (changedProperties.has('minDate')) {
      this.parsedMinDate = this.minDate ? parseDate(this.minDate) : undefined;
    }

    // Parse maxDate when it changes
    if (changedProperties.has('maxDate')) {
      this.parsedMaxDate = this.maxDate ? parseDate(this.maxDate) : undefined;
    }

    // Parse disabledDates when it changes
    if (changedProperties.has('disabledDates')) {
      this.parsedDisabledDates = this.disabledDates?.map(d => parseDate(d));
    }

    // Reinitialize navigation manager when grid cells change (month change)
    if (changedProperties.has('currentMonth') && this.gridCells) {
      this.initializeNavigationManager();

      // Set initial tabindex AFTER render completes via requestAnimationFrame
      // This ensures Lit's declarative render (with NO tabindex in template)
      // completes first, then KeyboardNavigationManager sets tabindex imperatively
      requestAnimationFrame(() => {
        const initialIndex = this.focusedIndex;
        this.navigationManager?.setInitialFocus(initialIndex);
      });
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

      /* Dark mode today indicator */
      :host-context(.dark) [role='gridcell'][aria-current='date'] {
        border-color: var(--ui-calendar-today-border-dark, var(--color-brand-400));
      }

      /* Selected date */
      [role='gridcell'][aria-selected='true'] {
        background-color: var(--ui-calendar-selected-bg, var(--color-brand-500));
        color: var(--ui-calendar-selected-text, oklch(0.98 0.01 250));
      }

      [role='gridcell'][aria-selected='true']:hover {
        opacity: 0.9;
      }

      /* Dark mode selected date */
      :host-context(.dark) [role='gridcell'][aria-selected='true'] {
        background-color: var(--ui-calendar-selected-bg-dark, var(--color-brand-400));
        color: var(--ui-calendar-selected-text-dark, oklch(0.2 0.01 250));
      }

      /* Disabled state */
      [role='gridcell'][aria-disabled='true'] {
        opacity: var(--ui-calendar-disabled-opacity, 0.4);
        pointer-events: none;
      }

      /* Focus visible indicator for keyboard navigation */
      [role='gridcell']:focus-visible {
        outline: 2px solid var(--color-brand-500);
        outline-offset: 2px;
        z-index: 1;
      }

      /* Screen reader only content (visually hidden but accessible) */
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

      /* Keyboard help button */
      .help-button {
        padding: 0.25rem 0.5rem;
        margin-left: 0.5rem;
        border-radius: 0.25rem;
        background: var(--color-gray-200);
        border: 1px solid var(--color-gray-300);
        cursor: pointer;
        font-size: 0.875rem;
      }

      .help-button:hover {
        background: var(--color-gray-300);
      }

      /* Keyboard help dialog */
      .help-dialog {
        position: absolute;
        top: 3rem;
        right: 0;
        background: var(--color-background, #fff);
        border: 1px solid var(--color-border, var(--color-gray-300));
        padding: 1rem;
        border-radius: 0.375rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 10;
        max-width: 300px;
      }

      .help-dialog h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .help-dialog p {
        margin: 0 0 1rem 0;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      .help-dialog button {
        padding: 0.25rem 0.75rem;
        border-radius: 0.25rem;
        background: var(--color-brand-500);
        color: white;
        border: none;
        cursor: pointer;
      }

      /* Calendar header with navigation */
      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
      }

      /* Navigation buttons */
      .calendar-header button {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--ui-calendar-border, var(--color-border, #e5e7eb));
        background: var(--ui-calendar-bg, var(--color-background, #ffffff));
        cursor: pointer;
        border-radius: var(--ui-calendar-radius, 0.25rem);
        color: var(--ui-calendar-text, var(--color-text, #111827));
        transition: background-color 150ms;
        font-size: 1rem;
      }

      .calendar-header button:hover {
        background: var(--ui-calendar-hover-bg, var(--color-muted, #f3f4f6));
      }

      .calendar-header button:focus {
        outline: 2px solid var(--ui-calendar-focus, var(--color-brand-500));
        outline-offset: 2px;
      }

      /* Month/year label in header */
      .calendar-header h2 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        text-align: center;
        flex: 1;
      }

      /* Clickable heading for view drilling */
      .calendar-header h2.clickable-heading {
        cursor: pointer;
        border-radius: var(--ui-calendar-radius, 0.25rem);
        padding: 0.125rem 0.25rem;
        transition: background-color 150ms;
      }

      .calendar-header h2.clickable-heading:hover {
        background: var(--ui-calendar-hover-bg, var(--color-muted, #f3f4f6));
      }

      .calendar-header h2.clickable-heading:focus-visible {
        outline: 2px solid var(--ui-calendar-focus, var(--color-brand-500));
        outline-offset: 2px;
      }

      :host-context(.dark) .calendar-header h2.clickable-heading:hover {
        background: var(--ui-calendar-button-hover-bg-dark, var(--color-muted-dark, var(--color-gray-800)));
      }

      /* Dropdown selectors container */
      .calendar-selectors {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      /* Dropdown select styles */
      .calendar-selectors select {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--ui-calendar-border, var(--color-border, #e5e7eb));
        border-radius: var(--ui-calendar-radius, 0.25rem);
        background: var(--ui-calendar-bg, var(--color-background, #ffffff));
        color: var(--ui-calendar-text, var(--color-text, #111827));
        cursor: pointer;
        transition: border-color 150ms;
      }

      .calendar-selectors select:focus {
        outline: none;
        border-color: var(--ui-calendar-focus, var(--color-brand-500));
        box-shadow: 0 0 0 3px var(--ui-calendar-focus-ring, rgba(59, 130, 246, 0.1));
      }

      /* Dark mode navigation buttons */
      :host-context(.dark) .calendar-header button {
        background: var(--ui-calendar-button-bg-dark, var(--color-background-dark, var(--color-gray-950)));
        border-color: var(--ui-calendar-button-border-dark, var(--color-border-dark, var(--color-gray-800)));
        color: var(--ui-calendar-button-text-dark, var(--color-foreground-dark, var(--color-gray-50)));
      }

      :host-context(.dark) .calendar-header button:hover {
        background: var(--ui-calendar-button-hover-bg-dark, var(--color-muted-dark, var(--color-gray-800)));
      }

      /* Dark mode dropdown selectors */
      :host-context(.dark) .calendar-selectors select {
        background: var(--ui-calendar-button-bg-dark, var(--color-background-dark, var(--color-gray-950)));
        border-color: var(--ui-calendar-button-border-dark, var(--color-border-dark, var(--color-gray-800)));
        color: var(--ui-calendar-button-text-dark, var(--color-foreground-dark, var(--color-gray-50)));
      }

      /* Dark mode help dialog */
      :host-context(.dark) .help-dialog {
        background: var(--color-background-dark, var(--color-gray-900));
        border-color: var(--color-border-dark, var(--color-gray-800));
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
   * Get localized month names for dropdown.
   * Calls getMonthName from intl-utils.
   */
  private getMonthOptions(): string[] {
    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2026, i, 1);
      months.push(getMonthName(date, this.locale));
    }
    return months;
  }

  /**
   * Get year options for dropdown.
   * Returns current year ± 10 years.
   */
  private getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  }

  /**
   * Get keyboard help text.
   * Provides information about keyboard navigation shortcuts.
   */
  private get keyboardHelpText(): string {
    return 'Use arrow keys to navigate dates. Enter or Space to select. Page Up and Page Down change months.';
  }

  /**
   * Check if a date cell should be disabled.
   *
   * Evaluates date constraints (min/max, disabled dates) and weekend setting.
   *
   * @param date - Date to check
   * @returns True if date should be disabled
   */
  private isCellDisabled(date: Date): boolean {
    const constraints: DateConstraints = {
      minDate: this.parsedMinDate,
      maxDate: this.parsedMaxDate,
      disabledDates: this.parsedDisabledDates
    };

    // Check date constraints
    if (isDateDisabled(date, constraints)) {
      return true;
    }

    // Check weekend setting
    if (this.disableWeekends && isWeekendDate(date)) {
      return true;
    }

    return false;
  }

  /**
   * Get the reason why a date is disabled.
   * Used for aria-label to provide context to screen reader users.
   *
   * @param date - Date to check
   * @returns Human-readable disabled reason
   */
  private getDisabledReason(date: Date): string {
    if (this.parsedMinDate && isBefore(date, this.parsedMinDate)) {
      return 'before minimum date';
    }
    if (this.parsedMaxDate && isAfter(date, this.parsedMaxDate)) {
      return 'after maximum date';
    }
    if (this.parsedDisabledDates?.some(d => isSameDay(date, d))) {
      return 'unavailable';
    }
    if (this.disableWeekends && isWeekendDate(date)) {
      return 'weekend';
    }
    return 'not available';
  }

  /**
   * Render a single date cell.
   */
  private renderDayCell(date: Date, index: number) {
    const isoDate = formatDate(date);
    const isSelected = this.selectedDate ? isSameDayCompare(date, new Date(this.selectedDate)) : false;
    const isToday = isDateToday(date);
    const isDisabled = this.isCellDisabled(date);

    // Generate aria-label with disabled reason
    let ariaLabel = String(date.getDate());
    if (isDisabled) {
      const reason = this.getDisabledReason(date);
      ariaLabel = `${date.getDate()}, ${reason}`;
    }

    return html`
      <div
        role="gridcell"
        aria-selected=${isSelected ? 'true' : 'false'}
        aria-current=${isToday ? 'date' : nothing}
        aria-disabled=${isDisabled ? 'true' : nothing}
        aria-label=${ariaLabel}
        data-date="${isoDate}"
        class="calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
        @click=${isDisabled ? nothing : () => this.handleDateClick(date)}
      >
        ${date.getDate()}
      </div>
    `;
  }

  /**
   * Handle date cell click.
   * Updates selectedDate state and emits ui-date-select event.
   * Also sets live announcement for screen readers.
   */
  private handleDateClick(date: Date): void {
    const isoDate = formatDate(date);
    this.selectedDate = isoDate;

    // Format announcement: "Selected Friday, January 30, 2026"
    const formatter = new Intl.DateTimeFormat(this.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.liveAnnouncement = `Selected ${formatter.format(date)}`;

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
   * Handle keyboard navigation on the calendar grid.
   * Implements WAI-ARIA Grid Pattern keyboard interactions.
   *
   * Imperative tabindex flow:
   * 1. navigationManager.moveFocus() updates DOM tabindex directly
   * 2. this.focusedIndex tracks position (no re-render, not @state)
   * 3. nextElement.focus() moves visible focus
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const currentIndex = this.focusedIndex;
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = this.navigationManager?.moveFocus(currentIndex, 'right') ?? currentIndex;
        break;
      case 'ArrowLeft':
        nextIndex = this.navigationManager?.moveFocus(currentIndex, 'left') ?? currentIndex;
        break;
      case 'ArrowDown':
        nextIndex = this.navigationManager?.moveFocus(currentIndex, 'down') ?? currentIndex;
        break;
      case 'ArrowUp':
        nextIndex = this.navigationManager?.moveFocus(currentIndex, 'up') ?? currentIndex;
        break;
      case 'Home':
        nextIndex = this.navigationManager?.moveFocus(currentIndex, 'home') ?? currentIndex;
        break;
      case 'End':
        nextIndex = this.navigationManager?.moveFocus(currentIndex, 'end') ?? currentIndex;
        break;
      case 'PageDown':
        this.handleNextMonth();
        return;
      case 'PageUp':
        this.handlePreviousMonth();
        return;
      case 'Enter':
      case ' ':
        const days = this.getMonthDays();
        const focusedDate = days[currentIndex];
        this.handleDateClick(focusedDate);
        event.preventDefault();
        return;
      default:
        return;
    }

    event.preventDefault();
    this.focusedIndex = nextIndex;
    const nextElement = this.navigationManager?.getElement(nextIndex);
    nextElement?.focus();
  }

  /**
   * Navigate to previous month.
   */
  private handlePreviousMonth(): void {
    this.currentMonth = subtractMonths(this.currentMonth, 1);
    this.selectedMonth = this.currentMonth.getMonth();
    this.selectedYear = this.currentMonth.getFullYear();
    this.announceMonthChange();
    this.emitMonthChange();
  }

  /**
   * Navigate to next month.
   */
  private handleNextMonth(): void {
    this.currentMonth = addMonthsTo(this.currentMonth, 1);
    this.selectedMonth = this.currentMonth.getMonth();
    this.selectedYear = this.currentMonth.getFullYear();
    this.announceMonthChange();
    this.emitMonthChange();
  }

  /**
   * Handle month dropdown change.
   * Updates currentMonth to selected month/year and emits event.
   */
  private handleMonthChange(event: Event): void {
    const month = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedMonth = month;
    this.currentMonth = new Date(this.selectedYear, month, 1);
    this.announceMonthChange();
    this.emitMonthChange();
  }

  /**
   * Handle year dropdown change.
   * Updates currentMonth to selected year/month and emits event.
   */
  private handleYearChange(event: Event): void {
    const year = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedYear = year;
    this.currentMonth = new Date(year, this.selectedMonth, 1);
    this.announceMonthChange();
    this.emitMonthChange();
  }

  /**
   * Set liveAnnouncement for screen readers when month changes.
   * Uses Intl.DateTimeFormat for locale-aware month/year formatting.
   */
  private announceMonthChange(): void {
    const formatter = new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: 'long'
    });
    this.liveAnnouncement = `Navigated to ${formatter.format(this.currentMonth)}`;
  }

  /**
   * Emit ui-month-change event when month changes.
   */
  private emitMonthChange(): void {
    this.dispatchEvent(new CustomEvent('ui-month-change', {
      bubbles: true,
      composed: true,
      detail: {
        year: this.currentMonth.getFullYear(),
        month: this.currentMonth.getMonth()
      }
    }));
  }

  /**
   * Handle clicking the heading to drill into deeper views.
   * month -> year (decade view), year -> decade (century view).
   */
  private handleHeadingClick(): void {
    if (this.view === 'month') {
      this.view = 'year';
      this.announceViewChange('Year selection');
    } else if (this.view === 'year') {
      this.view = 'decade';
      this.announceViewChange('Decade selection');
    }
  }

  /**
   * Render the calendar header with navigation buttons.
   */
  private renderHeader() {
    const isHeadingClickable = this.view !== 'decade';

    return html`
      <div class="calendar-header">
        <button
          @click=${this.handlePreviousMonth}
          aria-label="Previous month"
          type="button"
        >
          &lt;
        </button>
        <h2
          id="calendar-heading"
          aria-live="polite"
          role=${isHeadingClickable ? 'button' : nothing}
          tabindex=${isHeadingClickable ? '0' : nothing}
          class=${isHeadingClickable ? 'clickable-heading' : ''}
          @click=${isHeadingClickable ? this.handleHeadingClick : nothing}
          @keydown=${isHeadingClickable ? (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.handleHeadingClick();
            }
          } : nothing}
        >
          ${this.getMonthYearLabel()}
        </h2>
        <button
          @click=${this.handleNextMonth}
          aria-label="Next month"
          type="button"
        >
          &gt;
        </button>
      </div>
    `;
  }

  /**
   * Render the month/year dropdown selectors.
   */
  private renderSelectors() {
    const monthOptions = this.getMonthOptions();
    const yearOptions = this.getYearOptions();

    return html`
      <div class="calendar-selectors">
        <select
          @change=${this.handleMonthChange}
          aria-label="Select month"
        >
          ${monthOptions.map((name, index) => html`
            <option value=${index} ?selected=${this.selectedMonth === index}>
              ${name}
            </option>
          `)}
        </select>
        <select
          @change=${this.handleYearChange}
          aria-label="Select year"
        >
          ${yearOptions.map(year => html`
            <option value=${year} ?selected=${this.selectedYear === year}>
              ${year}
            </option>
          `)}
        </select>
      </div>
    `;
  }

  /**
   * Announce view changes to screen readers.
   */
  private announceViewChange(viewLabel: string): void {
    this.liveAnnouncement = `${viewLabel} view`;
  }

  /**
   * Render the month view (default) with weekday headers and date cells.
   */
  private renderMonthView() {
    return html`
      <div
        role="grid"
        aria-labelledby="calendar-heading"
        @keydown=${this.handleKeyDown}
      >
        ${this.renderHeader()}
        ${this.renderSelectors()}

        <!-- Keyboard help button -->
        <button
          @click=${() => this.showKeyboardHelp = true}
          aria-label="Keyboard shortcuts help"
          class="help-button"
        >
          ?
        </button>

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
        ${this.getMonthDays().map((date, index) => this.renderDayCell(date, index))}

        <!-- Screen reader live region for announcements -->
        <div aria-live="polite" aria-atomic="true" class="sr-only" part="live-region">
          ${this.liveAnnouncement}
        </div>

        <!-- Keyboard help dialog -->
        ${this.showKeyboardHelp ? html`
          <div role="dialog" aria-modal="true" aria-labelledby="help-title" class="help-dialog">
            <h3 id="help-title">Keyboard Navigation</h3>
            <p aria-live="polite">${this.keyboardHelpText}</p>
            <button @click=${() => this.showKeyboardHelp = false}>Close</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render the decade view (4x3 year grid).
   * Placeholder - implemented in Task 2.
   */
  private renderDecadeView() {
    return html`<div>Decade view</div>`;
  }

  /**
   * Render the century view (4x3 decade grid).
   * Placeholder - implemented in Task 2.
   */
  private renderCenturyView() {
    return html`<div>Century view</div>`;
  }

  /**
   * Main render dispatches to the appropriate view.
   */
  override render() {
    switch (this.view) {
      case 'year':
        return this.renderDecadeView();
      case 'decade':
        return this.renderCenturyView();
      default:
        return this.renderMonthView();
    }
  }
}
