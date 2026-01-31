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
import { getMonthDays, formatDate, isSameDayCompare, isDateToday } from './date-utils.js';
import { getWeekdayNames, getMonthYearLabel } from './intl-utils.js';
import { KeyboardNavigationManager } from './keyboard-nav.js';

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

  /**
   * Internal state tracking the currently focused cell index.
   * Used for roving tabindex keyboard navigation.
   */
  @state()
  private focusedIndex: number = 0;

  /**
   * Keyboard navigation manager for roving tabindex.
   * Initialized when grid cells are available.
   */
  @state()
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
   * Controls keyboard help dialog visibility.
   */
  @state()
  private showKeyboardHelp: boolean = false;

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

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // Reinitialize navigation manager when grid cells change (month change)
    if (changedProperties.has('currentMonth') && this.gridCells) {
      this.initializeNavigationManager();
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
  private renderDayCell(date: Date, index: number) {
    const isoDate = formatDate(date);
    const isSelected = this.selectedDate ? isSameDayCompare(date, new Date(this.selectedDate)) : false;
    const isToday = isDateToday(date);
    const isFocused = index === this.focusedIndex;

    return html`
      <div
        role="gridcell"
        aria-selected=${isSelected ? 'true' : 'false'}
        aria-current=${isToday ? 'date' : nothing}
        tabindex=${isFocused ? '0' : '-1'}
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
    const newMonth = new Date(this.currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    this.currentMonth = newMonth;
    this.emitMonthChange(newMonth);
  }

  /**
   * Navigate to next month.
   */
  private handleNextMonth(): void {
    const newMonth = new Date(this.currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    this.currentMonth = newMonth;
    this.emitMonthChange(newMonth);
  }

  /**
   * Emit ui-month-change event when month changes.
   */
  private emitMonthChange(date: Date): void {
    this.dispatchEvent(new CustomEvent('ui-month-change', {
      bubbles: true,
      composed: true,
      detail: {
        year: date.getFullYear(),
        month: date.getMonth()
      }
    }));
  }

  /**
   * Render the calendar grid with weekday headers and date cells.
   */
  override render() {
    return html`
      <div
        role="grid"
        aria-labelledby="calendar-heading"
        @keydown=${this.handleKeyDown}
      >
        <h2 id="calendar-heading" class="text-lg font-semibold mb-2" aria-live="polite">
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
        ${this.getMonthDays().map((date, index) => this.renderDayCell(date, index))}

        <!-- Screen reader live region for announcements -->
        <div aria-live="polite" aria-atomic="true" class="sr-only" part="live-region">
          ${this.liveAnnouncement}
        </div>
      </div>
    `;
  }
}
