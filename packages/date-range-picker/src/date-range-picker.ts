/**
 * lui-date-range-picker - Accessible date range picker component
 *
 * Composes two calendars for selecting a date range with a two-click
 * state machine (idle -> start-selected -> complete).
 * Supports form integration via ElementInternals, range validation,
 * and auto-swap of start/end dates.
 *
 * Features:
 * - Two-click range selection with visual preview on hover
 * - Auto-swap when end date is before start date (DRP-09)
 * - Min/max day constraints for range duration
 * - Form participation via ElementInternals (ISO 8601 interval submission)
 * - SSR compatible via isServer guards
 *
 * @element lui-date-range-picker
 * @fires change - Dispatched when a range is selected or cleared, with { startDate, endDate, isoInterval }
 */

import { html, css, nothing, isServer, svg, type PropertyValues, type CSSResultGroup } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles, dispatchCustomEvent } from '@lit-ui/core';
import { addMonths, subMonths, getYear, format } from '@lit-ui/calendar';
import type { DayCellState } from '@lit-ui/calendar';
import { normalizeRange, validateRangeDuration, formatISOInterval, isDateInRange, isDateInPreview } from './range-utils.js';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';
import { parseISO } from 'date-fns';

/**
 * The three states of the range selection state machine.
 * - 'idle': No selection in progress
 * - 'start-selected': First date clicked, awaiting second click
 * - 'complete': Both dates selected, range is complete
 */
type RangeState = 'idle' | 'start-selected' | 'complete';

/**
 * Date range picker component with two-click selection state machine.
 *
 * @example
 * ```html
 * <lui-date-range-picker label="Trip dates" name="trip"></lui-date-range-picker>
 * <lui-date-range-picker start-date="2026-01-10" end-date="2026-01-20"></lui-date-range-picker>
 * ```
 */
export class DateRangePicker extends TailwindElement {
  /**
   * Enable form association for this custom element.
   */
  static formAssociated = true;

  /**
   * ElementInternals for form participation.
   * Null during SSR since attachInternals() is not available.
   */
  private internals: ElementInternals | null = null;

  /**
   * Unique ID for the input element, used for label association.
   */
  private inputId = `lui-date-range-picker-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Reference to the trigger element for focus restoration after popup close.
   */
  private triggerElement: HTMLElement | null = null;

  // ---------------------------------------------------------------------------
  // Query refs
  // ---------------------------------------------------------------------------

  /**
   * Reference to the input container element (for popup positioning).
   */
  @query('.input-container')
  inputContainerEl!: HTMLElement;

  /**
   * Reference to the popup element (for Floating UI positioning).
   */
  @query('.popup')
  popupEl!: HTMLElement;

  /**
   * Reference to the native input element.
   */
  @query('input')
  inputEl!: HTMLInputElement;

  // ---------------------------------------------------------------------------
  // Properties (reflected attributes)
  // ---------------------------------------------------------------------------

  /**
   * The selected start date as ISO 8601 string (YYYY-MM-DD).
   */
  @property({ type: String, reflect: true, attribute: 'start-date' })
  startDate = '';

  /**
   * The selected end date as ISO 8601 string (YYYY-MM-DD).
   */
  @property({ type: String, reflect: true, attribute: 'end-date' })
  endDate = '';

  /**
   * Form field name for form submission.
   */
  @property({ type: String })
  name = '';

  /**
   * BCP 47 locale tag for localization (e.g., 'en-US', 'de-DE').
   * Defaults to navigator.language on client, 'en-US' on server.
   */
  @property({ type: String })
  locale = '';

  /**
   * Custom placeholder text for the input.
   */
  @property({ type: String })
  placeholder = '';

  /**
   * Accessible label for the date range picker.
   */
  @property({ type: String })
  label = '';

  /**
   * Helper text displayed below the input.
   */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /**
   * Minimum selectable date as ISO string (YYYY-MM-DD).
   */
  @property({ type: String, attribute: 'min-date' })
  minDate = '';

  /**
   * Maximum selectable date as ISO string (YYYY-MM-DD).
   */
  @property({ type: String, attribute: 'max-date' })
  maxDate = '';

  /**
   * Minimum range duration in days (inclusive). 0 = no minimum.
   */
  @property({ type: Number, attribute: 'min-days' })
  minDays = 0;

  /**
   * Maximum range duration in days (inclusive). 0 = unlimited.
   */
  @property({ type: Number, attribute: 'max-days' })
  maxDays = 0;

  /**
   * Whether a range selection is required for form submission.
   */
  @property({ type: Boolean, reflect: true })
  required = false;

  /**
   * Whether the date range picker is disabled.
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * External error message. When set, overrides internal validation errors.
   */
  @property({ type: String })
  error = '';

  // ---------------------------------------------------------------------------
  // State (internal reactive)
  // ---------------------------------------------------------------------------

  /**
   * Current state of the range selection state machine.
   */
  @state()
  private rangeState: RangeState = 'idle';

  /**
   * ISO string of the currently hovered date for preview highlighting.
   */
  @state()
  private hoveredDate = '';

  /**
   * Whether the popup is open.
   */
  @state()
  private isOpen = false;

  /**
   * The first calendar's displayed month.
   */
  @state()
  private currentMonth: Date = new Date();

  /**
   * Internal validation error message.
   */
  @state()
  private internalError = '';

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  static override styles: CSSResultGroup = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: inline-block;
        width: 100%;
        container-type: inline-size;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      .date-range-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        position: relative;
      }

      .date-range-label {
        font-weight: 500;
        font-size: 0.875rem;
        color: var(--ui-date-picker-text, var(--ui-input-text, inherit));
      }

      .required-indicator {
        color: var(--ui-date-picker-error, var(--ui-input-text-error, #ef4444));
        margin-left: 0.125rem;
      }

      .input-container {
        display: flex;
        align-items: center;
        border-radius: var(--ui-date-picker-radius, var(--ui-input-radius, 0.375rem));
        border-width: var(--ui-date-picker-border-width, var(--ui-input-border-width, 1px));
        border-style: solid;
        border-color: var(--ui-date-picker-border, var(--ui-input-border, #d1d5db));
        background-color: var(--ui-date-picker-bg, var(--ui-input-bg, white));
        transition:
          border-color 150ms,
          box-shadow 150ms;
        cursor: pointer;
      }

      .input-container:focus-within {
        border-color: var(--ui-date-picker-border-focus, var(--ui-input-border-focus, #3b82f6));
      }

      .input-container.container-error {
        border-color: var(--ui-date-picker-error, var(--ui-input-border-error, #ef4444));
      }

      .input-container.container-disabled {
        background-color: var(--ui-date-picker-bg-disabled, var(--ui-input-bg-disabled, #f3f4f6));
        border-color: var(--ui-date-picker-border-disabled, var(--ui-input-border-disabled, #e5e7eb));
        cursor: not-allowed;
      }

      input {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        color: var(--ui-date-picker-text, var(--ui-input-text, inherit));
        outline: none;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        cursor: pointer;
      }

      input::placeholder {
        color: var(--ui-date-picker-placeholder, var(--ui-input-placeholder, #9ca3af));
      }

      input:disabled {
        color: var(--ui-date-picker-text-disabled, var(--ui-input-text-disabled, #9ca3af));
        cursor: not-allowed;
      }

      .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        margin-right: 0.25rem;
        border: none;
        background: transparent;
        color: var(--color-muted-foreground, #6b7280);
        cursor: pointer;
        border-radius: 0.25rem;
        transition:
          color 150ms,
          background-color 150ms;
      }

      .action-button:hover {
        color: var(--ui-date-picker-text, var(--ui-input-text, inherit));
        background-color: var(--color-muted, #f3f4f6);
      }

      .action-button:focus-visible {
        outline: 2px solid var(--color-ring, #3b82f6);
        outline-offset: 1px;
      }

      .action-icon {
        width: 1.25em;
        height: 1.25em;
      }

      .popup {
        position: fixed;
        z-index: 50;
        background-color: var(--ui-date-picker-popup-bg, white);
        border: 1px solid var(--ui-date-picker-popup-border, #e5e7eb);
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        padding: 0.5rem;
      }

      .helper-text {
        font-size: 0.75rem;
        color: var(--color-muted-foreground, #6b7280);
      }

      .error-text {
        font-size: 0.75rem;
        color: var(--ui-date-picker-error, var(--ui-input-text-error, #ef4444));
      }

      .range-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
      }

      .range-heading {
        font-size: 0.875rem;
        font-weight: 600;
        margin: 0;
      }

      .calendars-wrapper {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .calendars-wrapper > * {
        min-width: 240px;
        flex: 1 1 280px;
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

      /* Dark mode */
      :host-context(.dark) .input-container {
        border-color: var(--ui-date-picker-border, var(--ui-input-border, #374151));
        background-color: var(--ui-date-picker-bg, var(--ui-input-bg, #111827));
      }

      :host-context(.dark) .input-container:focus-within {
        border-color: var(--ui-date-picker-border-focus, var(--ui-input-border-focus, #3b82f6));
      }

      :host-context(.dark) input {
        color: var(--ui-date-picker-text, var(--ui-input-text, #f9fafb));
      }

      :host-context(.dark) input::placeholder {
        color: var(--ui-date-picker-placeholder, var(--ui-input-placeholder, #6b7280));
      }

      :host-context(.dark) .action-button:hover {
        background-color: var(--color-muted, #1f2937);
      }

      :host-context(.dark) .popup {
        background-color: var(--ui-date-picker-popup-bg, #1f2937);
        border-color: var(--ui-date-picker-popup-border, #374151);
      }

      :host-context(.dark) .date-range-label {
        color: var(--ui-date-picker-text, var(--ui-input-text, #f9fafb));
      }

      :host-context(.dark) .helper-text {
        color: var(--color-muted-foreground, #9ca3af);
      }

      :host-context(.dark) .input-container.container-disabled {
        background-color: var(--ui-date-picker-bg-disabled, var(--ui-input-bg-disabled, #1f2937));
        border-color: var(--ui-date-picker-border-disabled, var(--ui-input-border-disabled, #374151));
      }

      :host-context(.dark) .nav-button:hover {
        background-color: var(--ui-calendar-hover-bg, #1f2937);
      }

      /* Container query: vertical stacking for narrow containers */
      @container (max-width: 599px) {
        .calendars-wrapper {
          flex-direction: column;
        }
      }

      /* Container query: wider gap for spacious containers */
      @container (min-width: 800px) {
        .calendars-wrapper {
          gap: 1.5rem;
        }
      }
    `,
  ];

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  // ---------------------------------------------------------------------------
  // Computed getters
  // ---------------------------------------------------------------------------

  /**
   * Resolved locale, falling back to navigator.language or 'en-US'.
   */
  get effectiveLocale(): string {
    return this.locale || (isServer ? 'en-US' : navigator.language);
  }

  /**
   * Whether the component is in an error state.
   */
  get hasError(): boolean {
    return !!(this.error || this.internalError);
  }

  /**
   * The current error message to display.
   */
  get displayError(): string {
    return this.error || this.internalError;
  }

  /**
   * Formatted display value for the input field.
   * - Both dates: "Jan 15 – Jan 22, 2026"
   * - Only start: "Jan 15, 2026 – ..."
   * - None: empty (shows placeholder)
   */
  get displayValue(): string {
    if (!this.startDate) return '';

    const startDate = parseISO(this.startDate);
    const locale = this.effectiveLocale;

    if (this.startDate && this.endDate) {
      const endDate = parseISO(this.endDate);
      const sameYear = startDate.getFullYear() === endDate.getFullYear();

      if (sameYear) {
        // "Jan 15 – Jan 22, 2026"
        const startFmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
        const endFmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startFmt.format(startDate)} \u2013 ${endFmt.format(endDate)}`;
      }

      // Cross-year: "Dec 28, 2025 – Jan 5, 2026"
      const fullFmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${fullFmt.format(startDate)} \u2013 ${fullFmt.format(endDate)}`;
    }

    // Only start date: "Jan 15, 2026 – ..."
    const startFmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startFmt.format(startDate)} \u2013 ...`;
  }

  /**
   * Effective placeholder text for the input.
   */
  get effectivePlaceholder(): string {
    return this.placeholder || 'Select date range';
  }

  // ---------------------------------------------------------------------------
  // SVG Icons
  // ---------------------------------------------------------------------------

  private calendarIcon = svg`
    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
          stroke="currentColor" stroke-width="2" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
  `;

  // ---------------------------------------------------------------------------
  // State machine methods
  // ---------------------------------------------------------------------------

  /**
   * Handle a date click in the calendar.
   * Implements the two-click state machine:
   * - idle/complete -> start-selected (first click sets start)
   * - start-selected -> complete (second click sets end with auto-swap)
   *
   * @param isoString - ISO 8601 date string of the clicked date
   */
  handleDateClick(isoString: string): void {
    if (this.disabled) return;

    if (this.rangeState === 'idle' || this.rangeState === 'complete') {
      // First click: set start date, reset end, enter start-selected state
      this.startDate = isoString;
      this.endDate = '';
      this.internalError = '';
      this.rangeState = 'start-selected';
    } else if (this.rangeState === 'start-selected') {
      // Second click: normalize order (auto-swap DRP-09), set both dates
      const [normalizedStart, normalizedEnd] = normalizeRange(this.startDate, isoString);
      this.startDate = normalizedStart;
      this.endDate = normalizedEnd;
      this.hoveredDate = '';
      this.rangeState = 'complete';
      this.validateAndEmit();
    }
  }

  /**
   * Validate the current range and emit change event.
   * Updates internal error state and form value.
   */
  validateAndEmit(): void {
    // Validate duration constraints
    const validation = validateRangeDuration(
      this.startDate,
      this.endDate,
      this.minDays || undefined,
      this.maxDays || undefined,
    );

    if (!validation.valid) {
      this.internalError = validation.error;
    } else {
      this.internalError = '';
    }

    // Update form value as ISO interval
    const isoInterval = formatISOInterval(this.startDate, this.endDate);
    this.internals?.setFormValue(isoInterval || null);

    // Dispatch change event
    dispatchCustomEvent(this, 'change', {
      startDate: this.startDate,
      endDate: this.endDate,
      isoInterval,
    });
  }

  /**
   * Handle hover over a day cell for preview highlighting.
   * Only active during start-selected state.
   *
   * @param dateStr - ISO 8601 date string of the hovered date
   */
  handleDayHover(dateStr: string): void {
    if (this.rangeState === 'start-selected') {
      this.hoveredDate = dateStr;
    }
  }

  /**
   * Clear the hover preview state.
   */
  clearHoverPreview(): void {
    this.hoveredDate = '';
  }

  /**
   * Reset the range picker to idle state.
   * Clears all selection and dispatches change with null values.
   */
  handleClear(): void {
    this.startDate = '';
    this.endDate = '';
    this.hoveredDate = '';
    this.internalError = '';
    this.rangeState = 'idle';
    this.internals?.setFormValue(null);

    dispatchCustomEvent(this, 'change', {
      startDate: '',
      endDate: '',
      isoInterval: '',
    });
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Sync range state when properties change externally.
   */
  protected override updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    // If both dates are set externally, ensure state is 'complete'
    if ((changedProps.has('startDate') || changedProps.has('endDate')) && this.startDate && this.endDate) {
      if (this.rangeState !== 'complete') {
        this.rangeState = 'complete';
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Form integration
  // ---------------------------------------------------------------------------

  /**
   * Form lifecycle callback: reset the date range picker to initial state.
   */
  formResetCallback(): void {
    this.startDate = '';
    this.endDate = '';
    this.hoveredDate = '';
    this.internalError = '';
    this.rangeState = 'idle';
    this.internals?.setFormValue(null);
    this.internals?.setValidity({});
  }

  /**
   * Form lifecycle callback: handle disabled state from form.
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  // ---------------------------------------------------------------------------
  // Range day rendering (inline styles for Shadow DOM compatibility)
  // ---------------------------------------------------------------------------

  /**
   * Render callback for calendar day cells with range highlighting.
   * Uses inline styles because CSS classes defined here cannot reach
   * inside the calendar's Shadow DOM (Pitfall 1).
   *
   * Arrow function to preserve `this` binding when passed to lui-calendar.
   */
  renderRangeDay = (state: DayCellState): unknown => {
    const dateStr = state.formattedDate;
    const isStart = dateStr === this.startDate;
    const isEnd = dateStr === this.endDate;
    const inRange = isDateInRange(dateStr, this.startDate, this.endDate);
    const inPreview = this.rangeState === 'start-selected'
      ? isDateInPreview(dateStr, this.startDate, this.hoveredDate)
      : false;

    // Build inline styles array — inline because CSS classes cannot
    // penetrate the calendar's Shadow DOM (Pitfall 1).
    // CSS custom properties DO cascade through Shadow DOM for theming.
    const styles: string[] = [
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'width: 100%',
      'height: 100%',
      'border-radius: 0',
      'transition: background-color 150ms',
    ];

    const isSingleDay = isStart && isEnd;

    if (isSingleDay) {
      // Single-day range: full circle
      styles.push(
        'background-color: var(--ui-range-selected-bg, var(--color-primary, #3b82f6))',
        'color: var(--ui-range-selected-text, white)',
        'border-radius: 9999px',
      );
    } else if (isStart) {
      // Start date: rounded left
      styles.push(
        'background-color: var(--ui-range-selected-bg, var(--color-primary, #3b82f6))',
        'color: var(--ui-range-selected-text, white)',
        'border-radius: 9999px 0 0 9999px',
      );
    } else if (isEnd) {
      // End date: rounded right
      styles.push(
        'background-color: var(--ui-range-selected-bg, var(--color-primary, #3b82f6))',
        'color: var(--ui-range-selected-text, white)',
        'border-radius: 0 9999px 9999px 0',
      );
    } else if (inRange) {
      // In-range: highlight background, no rounding
      styles.push(
        'background-color: var(--ui-range-highlight-bg, #dbeafe)',
        'color: var(--ui-range-highlight-text, inherit)',
      );
    } else if (inPreview) {
      // Preview: lighter highlight background, no rounding
      styles.push(
        'background-color: var(--ui-range-preview-bg, #eff6ff)',
      );
    }

    return html`
      <span
        style="${styles.join('; ')}"
        @mouseenter="${() => this.handleDayHover(dateStr)}"
      >
        ${state.date.getDate()}
      </span>
    `;
  };

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  /**
   * Navigate to the previous month.
   */
  private navigatePrev(): void {
    this.currentMonth = subMonths(this.currentMonth, 1);
  }

  /**
   * Navigate to the next month.
   */
  private navigateNext(): void {
    this.currentMonth = addMonths(this.currentMonth, 1);
  }

  /**
   * Compute the range heading showing the two visible months with en-dash.
   * Examples: "January \u2013 February 2026" or "December 2025 \u2013 January 2026"
   */
  private get rangeHeading(): string {
    const firstMonth = this.currentMonth;
    const secondMonth = addMonths(this.currentMonth, 1);

    const firstYear = getYear(firstMonth);
    const secondYear = getYear(secondMonth);

    const monthFormatter = new Intl.DateTimeFormat(this.effectiveLocale, { month: 'long' });
    const firstName = monthFormatter.format(firstMonth);
    const secondName = monthFormatter.format(secondMonth);

    if (firstYear === secondYear) {
      return `${firstName} \u2013 ${secondName} ${secondYear}`;
    }
    return `${firstName} ${firstYear} \u2013 ${secondName} ${secondYear}`;
  }

  /**
   * Handle date selection from a child calendar's change event.
   * Extracts the ISO string and delegates to the state machine.
   */
  private handleCalendarSelect(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (!detail?.isoString) return;
    this.handleDateClick(detail.isoString);
  }

  // ---------------------------------------------------------------------------
  // Popup management
  // ---------------------------------------------------------------------------

  /**
   * Open the calendar popup and position it via Floating UI.
   * Focuses the first calendar after positioning for keyboard accessibility.
   */
  async openPopup(): Promise<void> {
    if (this.disabled) return;
    this.isOpen = true;
    this.triggerElement = (this.shadowRoot?.activeElement as HTMLElement) || this.inputEl;

    // Wait for popup to render, then position and focus calendar
    await this.updateComplete;
    this.positionPopup();
    requestAnimationFrame(() => {
      this.focusCalendar();
    });
  }

  /**
   * Close the calendar popup and restore focus to the trigger element.
   * Clears hover preview state for clean reopen.
   */
  closePopup(): void {
    this.isOpen = false;
    this.hoveredDate = '';
    requestAnimationFrame(() => {
      this.triggerElement?.focus();
      this.triggerElement = null;
    });
  }

  /**
   * Toggle the calendar popup open/close.
   */
  private togglePopup(): void {
    if (this.isOpen) {
      this.closePopup();
    } else {
      this.openPopup();
    }
  }

  /**
   * Focus the first lui-calendar element inside the popup.
   * The calendar manages its own internal keyboard navigation.
   */
  private focusCalendar(): void {
    const calendar = this.shadowRoot?.querySelector('.popup lui-calendar') as HTMLElement | null;
    calendar?.focus();
  }

  /**
   * Position the popup using Floating UI with flip/shift middleware.
   * Uses fixed strategy to avoid clipping in scrollable containers.
   */
  private async positionPopup(): Promise<void> {
    if (isServer) return;
    if (!this.inputContainerEl || !this.popupEl) return;

    const { x, y } = await computePosition(this.inputContainerEl, this.popupEl, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [
        offset(4),
        flip({ fallbackPlacements: ['top-start'] }),
        shift({ padding: 8 }),
      ],
    });

    Object.assign(this.popupEl.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  // ---------------------------------------------------------------------------
  // Click-outside detection
  // ---------------------------------------------------------------------------

  /**
   * Handle document clicks for closing popup when clicking outside.
   * Uses composedPath() to work correctly with Shadow DOM boundaries.
   */
  private handleDocumentClick = (e: MouseEvent): void => {
    if (this.isOpen && !e.composedPath().includes(this)) {
      this.closePopup();
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    if (!isServer) {
      document.addEventListener('click', this.handleDocumentClick);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (!isServer) {
      document.removeEventListener('click', this.handleDocumentClick);
    }
  }

  // ---------------------------------------------------------------------------
  // Keyboard handling
  // ---------------------------------------------------------------------------

  /**
   * Handle keyboard events on the popup.
   * Traps Tab/Shift+Tab within the popup and handles Escape to close.
   * Respects calendar's defaultPrevented for Escape key (view drilling).
   */
  private handlePopupKeydown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      // Trap focus within the popup — keep focus on the calendar
      e.preventDefault();
      this.focusCalendar();
    } else if (e.key === 'Escape') {
      // If the calendar already handled Escape (e.g., drilling from year to month view),
      // don't close the popup
      if (!e.defaultPrevented) {
        this.closePopup();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  /**
   * Render the dual-calendar popup content (header + calendars).
   */
  private renderCalendarContent() {
    const leftDisplayMonth = format(this.currentMonth, 'yyyy-MM-dd');
    const rightDisplayMonth = format(addMonths(this.currentMonth, 1), 'yyyy-MM-dd');

    return html`
      <div class="range-header">
        <button
          class="nav-button"
          @click="${this.navigatePrev}"
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 class="range-heading">${this.rangeHeading}</h2>
        <button
          class="nav-button"
          @click="${this.navigateNext}"
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <div
        class="calendars-wrapper"
        @mouseleave="${this.clearHoverPreview}"
      >
        <lui-calendar
          display-month="${leftDisplayMonth}"
          hide-navigation
          .renderDay="${this.renderRangeDay}"
          .locale="${this.effectiveLocale}"
          min-date="${this.minDate || nothing}"
          max-date="${this.maxDate || nothing}"
          @change="${this.handleCalendarSelect}"
        ></lui-calendar>
        <lui-calendar
          display-month="${rightDisplayMonth}"
          hide-navigation
          .renderDay="${this.renderRangeDay}"
          .locale="${this.effectiveLocale}"
          min-date="${this.minDate || nothing}"
          max-date="${this.maxDate || nothing}"
          @change="${this.handleCalendarSelect}"
        ></lui-calendar>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="date-range-wrapper">
        ${this.label
          ? html`
              <label
                for=${this.inputId}
                class="date-range-label"
              >
                ${this.label}
                ${this.required
                  ? html`<span class="required-indicator">*</span>`
                  : nothing}
              </label>
            `
          : nothing}

        <div
          class="input-container ${this.hasError ? 'container-error' : ''} ${this.disabled ? 'container-disabled' : ''}"
          @click="${this.openPopup}"
        >
          <input
            id=${this.inputId}
            type="text"
            .value=${this.displayValue}
            placeholder=${this.effectivePlaceholder}
            readonly
            ?disabled=${this.disabled}
            aria-invalid=${this.hasError ? 'true' : nothing}
            aria-errormessage=${this.hasError ? `${this.inputId}-error` : nothing}
            aria-describedby=${this.hasError
              ? `${this.inputId}-error`
              : this.helperText
                ? `${this.inputId}-helper`
                : nothing}
            aria-label=${!this.label ? 'Date range' : nothing}
            aria-disabled=${this.disabled ? 'true' : nothing}
          />

          <button
            type="button"
            class="action-button"
            aria-label="Open calendar"
            ?disabled=${this.disabled}
            @click=${(e: Event) => { e.stopPropagation(); this.togglePopup(); }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" class="action-icon">
              ${this.calendarIcon}
            </svg>
          </button>
        </div>

        ${this.helperText && !this.hasError
          ? html`
              <span
                id="${this.inputId}-helper"
                class="helper-text"
              >${this.helperText}</span>
            `
          : nothing}

        ${this.hasError && this.displayError
          ? html`
              <span
                id="${this.inputId}-error"
                class="error-text"
                role="alert"
              >${this.displayError}</span>
            `
          : nothing}

        ${this.isOpen
          ? html`
              <div
                class="popup"
                role="dialog"
                aria-modal="true"
                aria-label="Choose date range"
                @keydown=${this.handlePopupKeydown}
              >
                ${this.renderCalendarContent()}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-date-range-picker': DateRangePicker;
  }
}
