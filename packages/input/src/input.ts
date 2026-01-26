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

import { html, css, isServer } from 'lit';
import { property, query } from 'lit/decorators.js';
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
    `,
  ];

  /**
   * Sync the input value to the form via ElementInternals.
   */
  private updateFormValue(): void {
    this.internals?.setFormValue(this.value);
  }

  /**
   * Handle input events from the native input.
   */
  private handleInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.updateFormValue();
  }

  /**
   * Get the CSS class for the current size.
   */
  private getInputClasses(): string {
    const sizes: Record<InputSize, string> = {
      sm: 'input-sm',
      md: 'input-md',
      lg: 'input-lg',
    };
    return sizes[this.size];
  }

  override render() {
    return html`
      <input
        id=${this.inputId}
        part="input"
        class=${this.getInputClasses()}
        type=${this.type}
        name=${this.name}
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        @input=${this.handleInput}
      />
    `;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-input': Input;
  }
}
