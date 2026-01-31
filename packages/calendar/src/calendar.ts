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
import { getMonthDays, formatDate, isSameDayCompare, isDateToday, addMonthsTo, subtractMonths, parseDate, isDateDisabled, isWeekendDate, DateConstraints, getMonthWeeks, getISOWeekNumber, WeekInfo } from './date-utils.js';
import { isBefore, isAfter, isSameDay } from 'date-fns';
import { eachDayOfInterval } from 'date-fns';
import { getWeekdayNames, getMonthYearLabel, getMonthName } from './intl-utils.js';
import { KeyboardNavigationManager } from './keyboard-nav.js';
import { AnimationController } from './animation-controller.js';
import { GestureHandler } from './gesture-handler.js';

export type CalendarSize = 'sm' | 'md' | 'lg';
export type CalendarView = 'month' | 'year' | 'decade';

/**
 * State object passed to custom renderDay callback.
 * Provides all relevant state for a day cell so custom renderers
 * can build rich cell content while calendar handles accessibility.
 */
export interface DayCellState {
  date: Date;
  isoDate: string;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isInRange: boolean;
  isWeekend: boolean;
}

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
   * Whether to show ISO 8601 week numbers column.
   * When true, displays a column of week number buttons on the left of the grid.
   * @default false
   */
  @property({ type: Boolean, attribute: 'show-week-numbers' })
  showWeekNumbers = false;

  /**
   * Custom render callback for day cell content.
   * When provided, receives DayCellState and should return Lit template content.
   * The calendar wrapper div retains all accessibility attributes regardless.
   * @default undefined (uses default number rendering)
   */
  @property({ attribute: false })
  renderDay?: (state: DayCellState) => unknown;

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
   * Keyboard navigation manager for roving tabindex (month view, 7 columns).
   * Not reactive - managed imperatively, no re-render needed.
   */
  private navigationManager: KeyboardNavigationManager | null = null;

  /**
   * Animation controller for month transition effects.
   * Manages slide/fade animations and respects prefers-reduced-motion.
   */
  private animationController: AnimationController | null = null;

  /**
   * Gesture handler for swipe navigation on touch devices.
   * Detects horizontal swipes to navigate between months.
   */
  private gestureHandler: GestureHandler | null = null;

  /**
   * Keyboard navigation manager for decade view (4 columns).
   */
  private decadeNavigationManager: KeyboardNavigationManager | null = null;

  /**
   * Keyboard navigation manager for century view (4 columns).
   */
  private centuryNavigationManager: KeyboardNavigationManager | null = null;

  /**
   * Focused index for decade/century grid navigation.
   */
  private viewFocusedIndex: number = 0;

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

    // Initialize animation controller (client-only)
    if (!isServer) {
      this.animationController = new AnimationController(
        () => this.shadowRoot?.querySelector('.month-grid') as HTMLElement | null
      );
    }

    // Initialize keyboard navigation (client-only)
    if (!isServer && this.gridCells) {
      this.initializeNavigationManager();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.animationController?.destroy();
    this.animationController = null;
    this.gestureHandler?.destroy();
    this.gestureHandler = null;
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

    // Initialize gesture handler on the grid container (needs DOM to exist)
    if (!isServer) {
      const gridContainer = this.shadowRoot?.querySelector('.month-grid') as HTMLElement | null;
      if (gridContainer) {
        this.gestureHandler = new GestureHandler(gridContainer, (result) => {
          if (result.direction === 'left') {
            this.handleNextMonth();
          } else if (result.direction === 'right') {
            this.handlePreviousMonth();
          }
        });
      }
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

      /* Year grid (decade view) and decade grid (century view) */
      .year-grid, .decade-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--ui-calendar-gap, 0.25rem);
      }

      .year-grid [role='gridcell'],
      .decade-grid [role='gridcell'] {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 3rem;
        cursor: pointer;
        border-radius: var(--ui-calendar-cell-radius, 0.375rem);
        transition: background-color 150ms;
        font-size: 0.875rem;
      }

      .year-grid [role='gridcell']:hover,
      .decade-grid [role='gridcell']:hover {
        background-color: var(--color-gray-100);
      }

      :host-context(.dark) .year-grid [role='gridcell']:hover,
      :host-context(.dark) .decade-grid [role='gridcell']:hover {
        background-color: var(--color-gray-800);
      }

      .year-grid [role='gridcell'][aria-selected='true'],
      .decade-grid [role='gridcell'][aria-selected='true'] {
        background-color: var(--ui-calendar-selected-bg, var(--color-brand-500));
        color: var(--ui-calendar-selected-text, oklch(0.98 0.01 250));
      }

      :host-context(.dark) .year-grid [role='gridcell'][aria-selected='true'],
      :host-context(.dark) .decade-grid [role='gridcell'][aria-selected='true'] {
        background-color: var(--ui-calendar-selected-bg-dark, var(--color-brand-400));
        color: var(--ui-calendar-selected-text-dark, oklch(0.2 0.01 250));
      }

      .year-grid [role='gridcell']:focus-visible,
      .decade-grid [role='gridcell']:focus-visible {
        outline: 2px solid var(--color-brand-500);
        outline-offset: 2px;
        z-index: 1;
      }

      .year-grid .outside-range,
      .decade-grid .outside-range {
        opacity: 0.4;
      }

      /* Animation styles for month transitions */
      .month-grid {
        transition: transform 200ms ease-out, opacity 200ms ease-out;
      }
      .month-grid.slide-out-left { transform: translateX(-100%); opacity: 0; }
      .month-grid.slide-out-right { transform: translateX(100%); opacity: 0; }
      .month-grid.slide-in-left { transform: translateX(-100%); opacity: 0; }
      .month-grid.slide-in-right { transform: translateX(100%); opacity: 0; }
      .month-grid.fade-out { opacity: 0; }

      @media (prefers-reduced-motion: reduce) {
        .month-grid {
          transition: opacity 150ms ease-out;
          transform: none !important;
        }
      }

      /* Touch swipe: allow vertical scrolling but capture horizontal */
      .grid-container {
        touch-action: pan-y;
      }

      /* Week numbers layout */
      .calendar-with-weeks {
        display: grid;
        grid-template-columns: auto 1fr;
      }

      .week-numbers {
        display: flex;
        flex-direction: column;
        gap: var(--ui-calendar-gap, 0.25rem);
      }

      .week-number-header {
        text-align: center;
        font-weight: 600;
        padding: 0.5rem;
        color: var(--color-gray-400);
        font-size: 0.75rem;
      }

      .week-number {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        cursor: pointer;
        min-height: var(--ui-calendar-cell-size, 2.5rem);
        padding: 0 0.5rem;
        border-radius: var(--ui-calendar-cell-radius, 0.375rem);
        color: var(--color-gray-500);
        font-size: 0.75rem;
        transition: background-color 150ms;
      }

      .week-number:hover {
        background-color: var(--color-gray-100);
      }

      :host-context(.dark) .week-number:hover {
        background-color: var(--color-gray-800);
      }

      .week-number:focus-visible {
        outline: 2px solid var(--color-brand-500);
        outline-offset: 2px;
        z-index: 1;
      }

      :host-context(.dark) .week-number {
        color: var(--color-gray-400);
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
   * Supports custom renderDay callback for cell content while preserving
   * all accessibility attributes on the wrapper div.
   */
  private renderDayCell(date: Date, index: number) {
    const isoDate = formatDate(date);
    const isSelected = this.selectedDate ? isSameDayCompare(date, new Date(this.selectedDate)) : false;
    const isToday = isDateToday(date);
    const isDisabled = this.isCellDisabled(date);
    const weekend = isWeekendDate(date);

    // Generate aria-label with disabled reason
    let ariaLabel = String(date.getDate());
    if (isDisabled) {
      const reason = this.getDisabledReason(date);
      ariaLabel = `${date.getDate()}, ${reason}`;
    }

    // Build DayCellState for custom renderDay callback
    const cellContent = this.renderDay
      ? this.renderDay({
          date,
          isoDate,
          isToday,
          isSelected,
          isDisabled,
          isInRange: !isDisabled,
          isWeekend: weekend,
        })
      : date.getDate();

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
        ${cellContent}
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
   * Navigate to previous month with animation.
   * Uses AnimationController for slide/fade transition.
   * Falls back to direct update if no controller (SSR).
   */
  private handlePreviousMonth(): void {
    const updateFn = () => {
      this.currentMonth = subtractMonths(this.currentMonth, 1);
      this.selectedMonth = this.currentMonth.getMonth();
      this.selectedYear = this.currentMonth.getFullYear();
      this.announceMonthChange();
      this.emitMonthChange();
    };

    if (this.animationController) {
      this.animationController.animateTransition('prev', updateFn);
    } else {
      updateFn();
    }
  }

  /**
   * Navigate to next month with animation.
   * Uses AnimationController for slide/fade transition.
   * Falls back to direct update if no controller (SSR).
   */
  private handleNextMonth(): void {
    const updateFn = () => {
      this.currentMonth = addMonthsTo(this.currentMonth, 1);
      this.selectedMonth = this.currentMonth.getMonth();
      this.selectedYear = this.currentMonth.getFullYear();
      this.announceMonthChange();
      this.emitMonthChange();
    };

    if (this.animationController) {
      this.animationController.animateTransition('next', updateFn);
    } else {
      updateFn();
    }
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
   * Handle week number click. Dispatches ui-week-select event
   * with week number, all 7 ISO date strings, and start/end dates.
   */
  private handleWeekSelect(weekInfo: WeekInfo): void {
    const dates = eachDayOfInterval({ start: weekInfo.startDate, end: weekInfo.endDate });
    const isoDateStrings = dates.map(d => formatDate(d));

    this.dispatchEvent(new CustomEvent('ui-week-select', {
      bubbles: true,
      composed: true,
      detail: {
        week: weekInfo.weekNumber,
        dates: isoDateStrings,
        start: formatDate(weekInfo.startDate),
        end: formatDate(weekInfo.endDate),
      }
    }));
  }

  /**
   * Render the week numbers column for the current month.
   */
  private renderWeekNumbers() {
    const weeks = getMonthWeeks(this.currentMonth);

    return html`
      <div class="week-numbers">
        <div class="week-number-header" aria-hidden="true">W</div>
        ${weeks.map(weekInfo => html`
          <button
            class="week-number"
            type="button"
            aria-label="Select week ${weekInfo.weekNumber}"
            @click=${() => this.handleWeekSelect(weekInfo)}
          >
            ${weekInfo.weekNumber}
          </button>
        `)}
      </div>
    `;
  }

  /**
   * Render the month view (default) with weekday headers and date cells.
   */
  private renderMonthView() {
    const gridContent = html`
      <div class="grid-container">
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
      </div>
    `;

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

        <!-- Month grid wrapper for animation targeting -->
        <div class="month-grid">
          ${this.showWeekNumbers ? html`
            <div class="calendar-with-weeks">
              ${this.renderWeekNumbers()}
              ${gridContent}
            </div>
          ` : gridContent}
        </div>

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
   * Get the start year of the current decade.
   */
  private getDecadeStart(): number {
    return Math.floor(this.currentMonth.getFullYear() / 10) * 10;
  }

  /**
   * Get the start decade of the current century.
   */
  private getCenturyStart(): number {
    return Math.floor(this.currentMonth.getFullYear() / 100) * 100;
  }

  /**
   * Get 12 years for the decade view (1 before + 10 in decade + 1 after).
   */
  private getDecadeYears(): { year: number; inRange: boolean }[] {
    const start = this.getDecadeStart();
    const years: { year: number; inRange: boolean }[] = [];
    for (let i = -1; i <= 10; i++) {
      years.push({
        year: start + i,
        inRange: i >= 0 && i <= 9
      });
    }
    return years;
  }

  /**
   * Get 12 decades for the century view (1 before + 10 in century + 1 after).
   */
  private getCenturyDecades(): { decade: number; inRange: boolean }[] {
    const start = this.getCenturyStart();
    const decades: { decade: number; inRange: boolean }[] = [];
    for (let i = -1; i <= 10; i++) {
      decades.push({
        decade: start + i * 10,
        inRange: i >= 0 && i <= 9
      });
    }
    return decades;
  }

  /**
   * Select a year from decade view, return to month view.
   */
  private selectYear(year: number): void {
    this.currentMonth = new Date(year, this.currentMonth.getMonth(), 1);
    this.selectedMonth = this.currentMonth.getMonth();
    this.selectedYear = year;
    this.view = 'month';
    this.announceViewChange(`${year}, month`);
  }

  /**
   * Select a decade from century view, return to decade (year) view.
   */
  private selectDecade(decade: number): void {
    this.currentMonth = new Date(decade, this.currentMonth.getMonth(), 1);
    this.selectedYear = decade;
    this.view = 'year';
    this.announceViewChange(`${decade}s, year selection`);
  }

  /**
   * Navigate to previous decade (decade view).
   */
  private handlePreviousDecade(): void {
    const year = this.currentMonth.getFullYear() - 10;
    this.currentMonth = new Date(year, this.currentMonth.getMonth(), 1);
    this.selectedYear = year;
    this.liveAnnouncement = `${this.getDecadeStart()} - ${this.getDecadeStart() + 9}`;
  }

  /**
   * Navigate to next decade (decade view).
   */
  private handleNextDecade(): void {
    const year = this.currentMonth.getFullYear() + 10;
    this.currentMonth = new Date(year, this.currentMonth.getMonth(), 1);
    this.selectedYear = year;
    this.liveAnnouncement = `${this.getDecadeStart()} - ${this.getDecadeStart() + 9}`;
  }

  /**
   * Navigate to previous century (century view).
   */
  private handlePreviousCentury(): void {
    const year = this.currentMonth.getFullYear() - 100;
    this.currentMonth = new Date(year, this.currentMonth.getMonth(), 1);
    this.selectedYear = year;
    this.liveAnnouncement = `${this.getCenturyStart()} - ${this.getCenturyStart() + 99}`;
  }

  /**
   * Navigate to next century (century view).
   */
  private handleNextCentury(): void {
    const year = this.currentMonth.getFullYear() + 100;
    this.currentMonth = new Date(year, this.currentMonth.getMonth(), 1);
    this.selectedYear = year;
    this.liveAnnouncement = `${this.getCenturyStart()} - ${this.getCenturyStart() + 99}`;
  }

  /**
   * Handle keyboard navigation in decade view (4-column grid).
   */
  private handleDecadeKeyDown(event: KeyboardEvent): void {
    const currentIndex = this.viewFocusedIndex;
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = this.decadeNavigationManager?.moveFocus(currentIndex, 'right') ?? currentIndex;
        break;
      case 'ArrowLeft':
        nextIndex = this.decadeNavigationManager?.moveFocus(currentIndex, 'left') ?? currentIndex;
        break;
      case 'ArrowDown':
        nextIndex = this.decadeNavigationManager?.moveFocus(currentIndex, 'down') ?? currentIndex;
        break;
      case 'ArrowUp':
        nextIndex = this.decadeNavigationManager?.moveFocus(currentIndex, 'up') ?? currentIndex;
        break;
      case 'Home':
        nextIndex = this.decadeNavigationManager?.moveFocus(currentIndex, 'home') ?? currentIndex;
        break;
      case 'End':
        nextIndex = this.decadeNavigationManager?.moveFocus(currentIndex, 'end') ?? currentIndex;
        break;
      case 'Enter':
      case ' ': {
        const years = this.getDecadeYears();
        if (years[currentIndex]) {
          this.selectYear(years[currentIndex].year);
        }
        event.preventDefault();
        return;
      }
      case 'Escape':
        this.view = 'month';
        this.announceViewChange('Month');
        event.preventDefault();
        return;
      default:
        return;
    }

    event.preventDefault();
    this.viewFocusedIndex = nextIndex;
    const nextElement = this.decadeNavigationManager?.getElement(nextIndex);
    nextElement?.focus();
  }

  /**
   * Handle keyboard navigation in century view (4-column grid).
   */
  private handleCenturyKeyDown(event: KeyboardEvent): void {
    const currentIndex = this.viewFocusedIndex;
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = this.centuryNavigationManager?.moveFocus(currentIndex, 'right') ?? currentIndex;
        break;
      case 'ArrowLeft':
        nextIndex = this.centuryNavigationManager?.moveFocus(currentIndex, 'left') ?? currentIndex;
        break;
      case 'ArrowDown':
        nextIndex = this.centuryNavigationManager?.moveFocus(currentIndex, 'down') ?? currentIndex;
        break;
      case 'ArrowUp':
        nextIndex = this.centuryNavigationManager?.moveFocus(currentIndex, 'up') ?? currentIndex;
        break;
      case 'Home':
        nextIndex = this.centuryNavigationManager?.moveFocus(currentIndex, 'home') ?? currentIndex;
        break;
      case 'End':
        nextIndex = this.centuryNavigationManager?.moveFocus(currentIndex, 'end') ?? currentIndex;
        break;
      case 'Enter':
      case ' ': {
        const decades = this.getCenturyDecades();
        if (decades[currentIndex]) {
          this.selectDecade(decades[currentIndex].decade);
        }
        event.preventDefault();
        return;
      }
      case 'Escape':
        this.view = 'year';
        this.announceViewChange('Year selection');
        event.preventDefault();
        return;
      default:
        return;
    }

    event.preventDefault();
    this.viewFocusedIndex = nextIndex;
    const nextElement = this.centuryNavigationManager?.getElement(nextIndex);
    nextElement?.focus();
  }

  /**
   * Initialize decade/century navigation manager after render.
   */
  private initializeViewNavigationManager(gridClass: string, manager: 'decade' | 'century'): void {
    if (isServer) return;

    requestAnimationFrame(() => {
      const grid = this.shadowRoot?.querySelector(`.${gridClass}`);
      if (!grid) return;
      const cells = Array.from(grid.querySelectorAll('[role="gridcell"]')) as HTMLElement[];
      if (cells.length === 0) return;

      const navManager = new KeyboardNavigationManager(cells, 4);
      if (manager === 'decade') {
        this.decadeNavigationManager = navManager;
      } else {
        this.centuryNavigationManager = navManager;
      }

      this.viewFocusedIndex = 0;
      navManager.setInitialFocus(0);
    });
  }

  /**
   * Render the decade view header with navigation.
   */
  private renderDecadeHeader() {
    const start = this.getDecadeStart();
    const headingText = `${start} - ${start + 9}`;
    const isHeadingClickable = true; // Can drill into century view

    return html`
      <div class="calendar-header">
        <button
          @click=${this.handlePreviousDecade}
          aria-label="Previous decade"
          type="button"
        >
          &lt;
        </button>
        <h2
          id="calendar-heading"
          aria-live="polite"
          role="button"
          tabindex="0"
          class="clickable-heading"
          @click=${this.handleHeadingClick}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.handleHeadingClick();
            }
          }}
        >
          ${headingText}
        </h2>
        <button
          @click=${this.handleNextDecade}
          aria-label="Next decade"
          type="button"
        >
          &gt;
        </button>
      </div>
    `;
  }

  /**
   * Render the century view header with navigation.
   */
  private renderCenturyHeader() {
    const start = this.getCenturyStart();
    const headingText = `${start} - ${start + 99}`;

    return html`
      <div class="calendar-header">
        <button
          @click=${this.handlePreviousCentury}
          aria-label="Previous century"
          type="button"
        >
          &lt;
        </button>
        <h2 id="calendar-heading" aria-live="polite">
          ${headingText}
        </h2>
        <button
          @click=${this.handleNextCentury}
          aria-label="Next century"
          type="button"
        >
          &gt;
        </button>
      </div>
    `;
  }

  /**
   * Render the decade view (4x3 year grid).
   */
  private renderDecadeView() {
    const years = this.getDecadeYears();
    const currentYear = new Date().getFullYear();

    // Initialize navigation manager after render
    this.updateComplete.then(() => {
      this.initializeViewNavigationManager('year-grid', 'decade');
    });

    return html`
      ${this.renderDecadeHeader()}
      <div
        class="year-grid"
        role="grid"
        aria-label="Year selection"
        @keydown=${this.handleDecadeKeyDown}
      >
        ${years.map(({ year, inRange }) => html`
          <div
            role="gridcell"
            aria-selected=${year === this.currentMonth.getFullYear() ? 'true' : 'false'}
            aria-label="${year}"
            class="${!inRange ? 'outside-range' : ''}"
            data-year="${year}"
            @click=${() => this.selectYear(year)}
          >
            ${year}
          </div>
        `)}
      </div>

      <!-- Screen reader live region -->
      <div aria-live="polite" aria-atomic="true" class="sr-only" part="live-region">
        ${this.liveAnnouncement}
      </div>
    `;
  }

  /**
   * Render the century view (4x3 decade grid).
   */
  private renderCenturyView() {
    const decades = this.getCenturyDecades();
    const currentDecade = Math.floor(new Date().getFullYear() / 10) * 10;

    // Initialize navigation manager after render
    this.updateComplete.then(() => {
      this.initializeViewNavigationManager('decade-grid', 'century');
    });

    return html`
      ${this.renderCenturyHeader()}
      <div
        class="decade-grid"
        role="grid"
        aria-label="Decade selection"
        @keydown=${this.handleCenturyKeyDown}
      >
        ${decades.map(({ decade, inRange }) => html`
          <div
            role="gridcell"
            aria-selected=${decade === currentDecade ? 'true' : 'false'}
            aria-label="${decade} to ${decade + 9}"
            class="${!inRange ? 'outside-range' : ''}"
            data-decade="${decade}"
            @click=${() => this.selectDecade(decade)}
          >
            ${decade}s
          </div>
        `)}
      </div>

      <!-- Screen reader live region -->
      <div aria-live="polite" aria-atomic="true" class="sr-only" part="live-region">
        ${this.liveAnnouncement}
      </div>
    `;
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
