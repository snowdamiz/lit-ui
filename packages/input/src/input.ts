/**
 * lui-input - A customizable input component
 *
 * Features:
 * - Five input types: text, email, password, number, search
 * - Three sizes: sm, md, lg
 * - Form participation via ElementInternals - client-side only
 * - Disabled state with proper accessibility
 * - SSR compatible via isServer guards
 *
 * @example
 * ```html
 * <lui-input type="text" size="md"></lui-input>
 * <lui-input type="email" name="email" placeholder="Enter email"></lui-input>
 * <lui-input type="password" size="lg"></lui-input>
 * ```
 */

import { html, css, isServer, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

/**
 * Input type types for HTML input type attribute
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'search';

/**
 * Input size types for padding and font sizing
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * A customizable input component with multiple types and sizes.
 * Supports form participation via ElementInternals for value submission.
 * Form participation is client-side only (guarded with isServer check).
 *
 * @slot - Default slot (not used, input has no slots)
 */
export class Input extends TailwindElement {
  /**
   * Enable form association for this custom element.
   * This allows the input to participate in form submission.
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
  private inputId = `lui-input-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Reference to the native input element.
   */
  @query('input')
  private inputEl!: HTMLInputElement;

  /**
   * The type of input (text, email, password, number, search).
   * @default 'text'
   */
  @property({ type: String })
  type: InputType = 'text';

  /**
   * The size of the input affecting padding and font size.
   * @default 'md'
   */
  @property({ type: String })
  size: InputSize = 'md';

  /**
   * The name of the input for form submission.
   * @default ''
   */
  @property({ type: String })
  name = '';

  /**
   * The current value of the input.
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Placeholder text displayed when input is empty.
   * @default ''
   */
  @property({ type: String })
  placeholder = '';

  /**
   * Whether the input is disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether the input is readonly.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /**
   * Whether the input is required for form submission.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  required = false;

  /**
   * Minimum length for text input validation.
   */
  @property({ type: Number })
  minlength?: number;

  /**
   * Maximum length for text input validation.
   */
  @property({ type: Number })
  maxlength?: number;

  /**
   * Regular expression pattern for validation.
   * @default ''
   */
  @property({ type: String })
  pattern = '';

  /**
   * Minimum value for number input validation.
   */
  @property({ type: Number })
  min?: number;

  /**
   * Maximum value for number input validation.
   */
  @property({ type: Number })
  max?: number;

  /**
   * Label text displayed above the input.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * Helper text displayed between label and input.
   * @default ''
   */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /**
   * Required indicator style: 'asterisk' shows *, 'text' shows "(required)".
   * @default 'asterisk'
   */
  @property({ type: String, attribute: 'required-indicator' })
  requiredIndicator: 'asterisk' | 'text' = 'asterisk';

  /**
   * Whether the input has been touched (blur occurred).
   * Used for validation display timing.
   */
  @state()
  private touched = false;

  /**
   * Whether to show error state.
   * True when input is invalid and has been touched.
   */
  @state()
  private showError = false;

  constructor() {
    super();
    // Only attach internals on client (not during SSR)
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  /**
   * Static styles for the input component.
   * Uses CSS custom properties from Phase 26 tokens.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: inline-block;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      input {
        width: 100%;
        border-radius: var(--ui-input-radius);
        border-width: var(--ui-input-border-width);
        border-style: solid;
        border-color: var(--ui-input-border);
        background-color: var(--ui-input-bg);
        color: var(--ui-input-text);
        transition:
          border-color var(--ui-input-transition),
          box-shadow var(--ui-input-transition);
        outline: none;
      }

      input::placeholder {
        color: var(--ui-input-placeholder);
      }

      /* Focus state */
      input:focus-visible {
        border-color: var(--ui-input-border-focus);
      }

      /* Disabled state */
      input:disabled {
        background-color: var(--ui-input-bg-disabled);
        color: var(--ui-input-text-disabled);
        border-color: var(--ui-input-border-disabled);
        cursor: not-allowed;
      }

      /* Readonly state */
      input:read-only:not(:disabled) {
        background-color: var(--ui-input-bg-readonly, var(--color-muted));
        cursor: text;
      }

      /* Error state */
      input.input-error {
        border-color: var(--ui-input-border-error);
      }

      /* Size variants */
      input.input-sm {
        padding: var(--ui-input-padding-y-sm) var(--ui-input-padding-x-sm);
        font-size: var(--ui-input-font-size-sm);
      }

      input.input-md {
        padding: var(--ui-input-padding-y-md) var(--ui-input-padding-x-md);
        font-size: var(--ui-input-font-size-md);
      }

      input.input-lg {
        padding: var(--ui-input-padding-y-lg) var(--ui-input-padding-x-lg);
        font-size: var(--ui-input-font-size-lg);
      }

      /* Wrapper for label structure */
      .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      /* Label styling - scales with size */
      .input-label {
        font-weight: 500;
        color: var(--ui-input-text);
      }

      .input-label.label-sm {
        font-size: var(--ui-input-font-size-sm);
      }

      .input-label.label-md {
        font-size: var(--ui-input-font-size-md);
      }

      .input-label.label-lg {
        font-size: var(--ui-input-font-size-lg);
      }

      .required-indicator {
        color: var(--ui-input-text-error);
        margin-left: 0.125rem;
      }

      /* Helper text - below label, above input */
      .helper-text {
        font-size: 0.875em;
        color: var(--color-muted-foreground);
      }

      /* Error text - below input */
      .error-text {
        font-size: 0.875em;
        color: var(--ui-input-text-error);
      }
    `,
  ];

  /**
   * Sync the input value to the form via ElementInternals.
   */
  private updateFormValue(): void {
    this.internals?.setFormValue(this.value);
  }

  /**
   * Validate the input and sync validity state to ElementInternals.
   * Mirrors native input validity to the custom element for form participation.
   * @returns true if valid, false if invalid
   */
  private validate(): boolean {
    const input = this.inputEl;
    if (!input || !this.internals) return true;

    const validity = input.validity;

    if (!validity.valid) {
      // Map native validity to ElementInternals
      this.internals.setValidity(
        {
          valueMissing: validity.valueMissing,
          typeMismatch: validity.typeMismatch,
          patternMismatch: validity.patternMismatch,
          tooShort: validity.tooShort,
          tooLong: validity.tooLong,
          rangeUnderflow: validity.rangeUnderflow,
          rangeOverflow: validity.rangeOverflow,
        },
        input.validationMessage,
        input // anchor for popup positioning
      );
      return false;
    }

    // Clear validity when valid
    this.internals.setValidity({});
    return true;
  }

  /**
   * Get the current validation error message.
   */
  private get errorMessage(): string {
    return this.internals?.validationMessage || '';
  }

  /**
   * Handle input events from the native input.
   */
  private handleInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.updateFormValue();

    // Re-validate if already touched (blur occurred)
    if (this.touched) {
      const isValid = this.validate();
      this.showError = !isValid;
    }
  }

  /**
   * Handle blur events for validation display timing.
   */
  private handleBlur(): void {
    this.touched = true;
    const isValid = this.validate();
    this.showError = !isValid;
  }

  /**
   * Form lifecycle callback: reset the input to initial state.
   */
  formResetCallback(): void {
    this.value = '';
    this.touched = false;
    this.showError = false;
    this.internals?.setFormValue('');
    this.internals?.setValidity({});
  }

  /**
   * Form lifecycle callback: handle disabled state from form.
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * Get the CSS classes for the input element.
   */
  private getInputClasses(): string {
    const classes = [`input-${this.size}`];
    if (this.showError) {
      classes.push('input-error');
    }
    return classes.join(' ');
  }

  /**
   * Compute aria-describedby value based on error or helper state.
   */
  private getAriaDescribedBy(): string | typeof nothing {
    if (this.showError) {
      return `${this.inputId}-error`;
    }
    if (this.helperText) {
      return `${this.inputId}-helper`;
    }
    return nothing;
  }

  override render() {
    return html`
      <div class="input-wrapper" part="wrapper">
        ${this.label
          ? html`
              <label
                for=${this.inputId}
                part="label"
                class="input-label label-${this.size}"
              >
                ${this.label}
                ${this.required
                  ? html`<span class="required-indicator"
                      >${this.requiredIndicator === 'text'
                        ? ' (required)'
                        : '*'}</span
                    >`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.helperText
          ? html`
              <span
                id="${this.inputId}-helper"
                part="helper"
                class="helper-text"
                >${this.helperText}</span
              >
            `
          : nothing}

        <input
          id=${this.inputId}
          part="input"
          class=${this.getInputClasses()}
          type=${this.type}
          name=${this.name}
          .value=${this.value}
          placeholder=${this.placeholder || nothing}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          minlength=${this.minlength ?? nothing}
          maxlength=${this.maxlength ?? nothing}
          min=${this.min ?? nothing}
          max=${this.max ?? nothing}
          pattern=${this.pattern || nothing}
          aria-invalid=${this.showError ? 'true' : nothing}
          aria-describedby=${this.getAriaDescribedBy()}
          @input=${this.handleInput}
          @blur=${this.handleBlur}
        />

        ${this.showError && this.errorMessage
          ? html`
              <span
                id="${this.inputId}-error"
                part="error"
                class="error-text"
                role="alert"
                >${this.errorMessage}</span
              >
            `
          : nothing}
      </div>
    `;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-input': Input;
  }
}
