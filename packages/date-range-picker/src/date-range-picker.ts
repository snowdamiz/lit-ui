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

import { html, css, nothing, isServer, type PropertyValues, type CSSResultGroup } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles, dispatchCustomEvent } from '@lit-ui/core';
import { normalizeRange, validateRangeDuration, formatISOInterval, isDateInRange, isDateInPreview } from './range-utils.js';

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
        display: block;
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
  // Render (placeholder for Plan 02)
  // ---------------------------------------------------------------------------

  override render() {
    return html`<div class="date-range-picker">Date Range Picker (rendering in Plan 02)</div>`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-date-range-picker': DateRangePicker;
  }
}
