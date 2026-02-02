/**
 * Component Templates
 *
 * Embedded component source code for CLI installation.
 * Using Option C from planning: embed as template strings for MVP simplicity.
 */

/**
 * Button component template
 */
export const BUTTON_TEMPLATE = `/**
 * ui-button - A customizable button component
 *
 * Features:
 * - Five visual variants: primary, secondary, outline, ghost, destructive
 * - Three sizes: sm, md, lg
 * - Form participation via ElementInternals (submit/reset)
 * - Disabled state with proper accessibility (aria-disabled, remains in tab order)
 * - Loading state with pulsing dots spinner (aria-busy)
 * - Icon slots (icon-start, icon-end) for icon placement
 * - Inner glow focus ring for visibility across all variants
 * - Keyboard accessible (Enter/Space via native button)
 *
 * @example
 * \`\`\`html
 * <ui-button variant="primary" size="md">Click me</ui-button>
 * <ui-button variant="destructive" disabled>Delete</ui-button>
 * <ui-button loading>Saving...</ui-button>
 * <ui-button type="submit">Submit Form</ui-button>
 * \`\`\`
 */

import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement } from '../../lib/lit-ui/tailwind-element';

/**
 * Button variant types for visual styling
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';

/**
 * Button size types for padding and font sizing
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button type for form behavior
 */
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * A customizable button component with multiple variants and sizes.
 * Supports form participation via ElementInternals for submit/reset behavior.
 *
 * @slot - Default slot for button text content
 * @slot icon-start - Slot for icon before text
 * @slot icon-end - Slot for icon after text
 */
@customElement('ui-button')
export class Button extends TailwindElement {
  /**
   * Enable form association for this custom element.
   * This allows the button to participate in form submission/reset.
   */
  static formAssociated = true;

  /**
   * ElementInternals for form participation and ARIA.
   */
  private internals: ElementInternals;

  /**
   * The visual style variant of the button.
   * @default 'primary'
   */
  @property({ type: String })
  variant: ButtonVariant = 'primary';

  /**
   * The size of the button affecting padding and font size.
   * @default 'md'
   */
  @property({ type: String })
  size: ButtonSize = 'md';

  /**
   * The button type for form behavior.
   * - 'button': No form action (default)
   * - 'submit': Submits the containing form
   * - 'reset': Resets the containing form
   * @default 'button'
   */
  @property({ type: String })
  type: ButtonType = 'button';

  /**
   * Whether the button is disabled.
   * Uses aria-disabled for better screen reader accessibility.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether the button is in a loading state.
   * Shows a pulsing dots spinner and prevents interaction.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  loading = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /**
   * Static styles for focus ring (inner glow) and loading spinner
   * that cannot be expressed with Tailwind utility classes alone.
   */
  static override styles = css\`
    :host {
      display: inline-block;
    }

    :host([disabled]),
    :host([loading]) {
      pointer-events: none;
    }

    button:focus-visible {
      outline: none;
      box-shadow: inset 0 0 0 2px var(--color-ring);
    }

    /* Pulsing dots spinner */
    .spinner {
      display: inline-flex;
      align-items: center;
      gap: 0.2em;
    }

    .spinner::before,
    .spinner::after,
    .spinner > span {
      content: '';
      width: 0.4em;
      height: 0.4em;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 1.2s ease-in-out infinite;
    }

    .spinner::before {
      animation-delay: 0s;
    }
    .spinner > span {
      animation-delay: 0.2s;
    }
    .spinner::after {
      animation-delay: 0.4s;
    }

    @keyframes pulse {
      0%,
      80%,
      100% {
        opacity: 0.3;
        transform: scale(0.7);
      }
      40% {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Icon slots - scale with button font-size via em units */
    ::slotted([slot='icon-start']),
    ::slotted([slot='icon-end']) {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }
  \`;

  /**
   * Get the Tailwind classes for the current variant.
   */
  private getVariantClasses(): string {
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary text-primary-foreground hover:opacity-90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
      outline:
        'border border-border bg-transparent text-foreground hover:bg-accent',
      ghost: 'bg-transparent text-foreground hover:bg-accent',
      destructive:
        'bg-destructive text-destructive-foreground hover:opacity-90',
    };
    return variants[this.variant];
  }

  /**
   * Get the Tailwind classes for the current size.
   * Includes gap for icon spacing.
   */
  private getSizeClasses(): string {
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };
    return sizes[this.size];
  }

  /**
   * Get the base classes common to all button variants.
   */
  private getBaseClasses(): string {
    return 'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150';
  }

  /**
   * Get classes for the disabled/loading state.
   */
  private getDisabledClasses(): string {
    return this.disabled || this.loading
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';
  }

  /**
   * Render the pulsing dots spinner.
   * Uses three dots with staggered animation delays.
   */
  private renderSpinner() {
    return html\`<span class="spinner" aria-hidden="true"><span></span></span>\`;
  }

  /**
   * Handle click events.
   * Prevents action when disabled or loading.
   * Triggers form submission or reset based on button type.
   */
  private handleClick(e: MouseEvent) {
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Handle form actions via ElementInternals
    if (this.type === 'submit' && this.internals.form) {
      this.internals.form.requestSubmit();
    } else if (this.type === 'reset' && this.internals.form) {
      this.internals.form.reset();
    }
  }

  /**
   * Combine all classes into a single string.
   */
  private getButtonClasses(): string {
    return [
      this.getBaseClasses(),
      this.getVariantClasses(),
      this.getSizeClasses(),
      this.getDisabledClasses(),
    ].join(' ');
  }

  override render() {
    return html\`
      <button
        class=\${this.getButtonClasses()}
        ?aria-disabled=\${this.disabled || this.loading}
        ?aria-busy=\${this.loading}
        aria-label=\${this.loading ? 'Loading' : nothing}
        @click=\${this.handleClick}
        type="button"
      >
        <slot name="icon-start"></slot>
        \${this.loading ? this.renderSpinner() : html\`<slot></slot>\`}
        <slot name="icon-end"></slot>
      </button>
    \`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'ui-button': Button;
  }
}
`;

/**
 * Dialog component template
 */
export const DIALOG_TEMPLATE = `/**
 * ui-dialog - An accessible modal dialog component
 *
 * Features:
 * - Native \`<dialog>\` element with showModal() for automatic focus trapping
 * - Three sizes: sm, md, lg (controls max-width)
 * - Escape key handling via native cancel event
 * - Backdrop click detection for dismissible dialogs
 * - ARIA attributes: aria-labelledby, aria-describedby
 * - Named slots for title, content, and footer
 * - Smooth enter/exit animations with reduced-motion support
 * - Focus restoration to trigger element on close
 * - Nested dialogs supported via browser's top layer stack
 * - Optional close button via show-close-button attribute
 *
 * @slot title - Dialog title content
 * @slot - Default slot for dialog body
 * @slot footer - Dialog footer (typically action buttons)
 *
 * @fires close - When dialog closes, detail: { reason: 'escape' | 'backdrop' | 'programmatic' }
 *
 * @example Basic usage
 * \`\`\`html
 * <ui-dialog open>
 *   <span slot="title">Dialog Title</span>
 *   <p>Dialog content goes here.</p>
 *   <div slot="footer">
 *     <ui-button @click=\${() => dialog.close()}>Close</ui-button>
 *   </div>
 * </ui-dialog>
 * \`\`\`
 *
 * @example Nested dialogs
 * To prevent parent dialogs from receiving close events from nested dialogs,
 * use stopPropagation on the close event:
 * \`\`\`html
 * <ui-dialog id="parent">
 *   <ui-dialog id="child" @close=\${(e) => e.stopPropagation()}>
 *   </ui-dialog>
 * </ui-dialog>
 * \`\`\`
 */

import { html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { TailwindElement } from '../../lib/lit-ui/tailwind-element';

/**
 * Dialog size types for max-width
 */
export type DialogSize = 'sm' | 'md' | 'lg';

/**
 * Close reason types for the close event detail
 */
export type CloseReason = 'escape' | 'backdrop' | 'programmatic';

/**
 * An accessible modal dialog component using the native HTML dialog element.
 * Provides automatic focus trapping, Escape key handling, and backdrop via showModal().
 *
 * @slot - Default slot for dialog content
 * @slot title - Slot for dialog title/header
 * @slot footer - Slot for dialog footer/actions
 *
 * @fires close - Fired when the dialog closes, with { reason: CloseReason } detail
 */
@customElement('ui-dialog')
export class Dialog extends TailwindElement {
  /**
   * Whether the dialog is open.
   * When true, the dialog is displayed using showModal().
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  open = false;

  /**
   * The size of the dialog (affects max-width).
   * - sm: max-w-sm (24rem)
   * - md: max-w-md (28rem)
   * - lg: max-w-lg (32rem)
   * @default 'md'
   */
  @property({ type: String })
  size: DialogSize = 'md';

  /**
   * Whether the dialog can be dismissed via Escape key or backdrop click.
   * When false, only programmatic close() works.
   * @default true
   */
  @property({ type: Boolean })
  dismissible = true;

  /**
   * Whether to show an X close button in the top-right corner.
   * @default false
   */
  @property({ type: Boolean, attribute: 'show-close-button' })
  showCloseButton = false;

  /**
   * Reference to the native dialog element.
   */
  @query('dialog')
  private dialogEl!: HTMLDialogElement;

  /**
   * The element that had focus before the dialog opened.
   * Focus is restored to this element on close.
   */
  private triggerElement: HTMLElement | null = null;

  /**
   * Static styles for dialog animations and layout.
   * Uses native CSS transitions with @starting-style for enter animations
   * and transition-behavior: allow-discrete for exit animations.
   */
  static override styles = css\`
    :host {
      display: contents;
    }

    dialog {
      border: none;
      padding: 0;
      background: transparent;
      max-height: 85vh;
      max-width: 90vw;
      margin: auto;

      /* Animation styles */
      opacity: 0;
      transform: scale(0.95);
      transition:
        opacity 150ms ease-out,
        transform 150ms ease-out,
        display 150ms allow-discrete,
        overlay 150ms allow-discrete;
    }

    dialog[open] {
      opacity: 1;
      transform: scale(1);
    }

    @starting-style {
      dialog[open] {
        opacity: 0;
        transform: scale(0.95);
      }
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition:
        opacity 150ms ease-out,
        display 150ms allow-discrete,
        overlay 150ms allow-discrete;
    }

    dialog[open]::backdrop {
      opacity: 1;
    }

    @starting-style {
      dialog[open]::backdrop {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog,
      dialog::backdrop {
        transition: none;
      }
    }

    .dialog-content {
      width: 100%;
    }
  \`;

  /**
   * Called when reactive properties change.
   * Syncs the open property with the native dialog state.
   */
  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      if (this.open && !this.dialogEl.open) {
        this.dialogEl.showModal();
      } else if (!this.open && this.dialogEl.open) {
        this.dialogEl.close();
      }
    }
  }

  /**
   * Opens the dialog.
   * Stores the currently focused element for focus restoration on close.
   */
  show() {
    this.triggerElement = document.activeElement as HTMLElement;
    this.open = true;
  }

  /**
   * Closes the dialog.
   * Emits a close event with the specified reason.
   * @param reason - The reason for closing (default: 'programmatic')
   */
  close(reason: CloseReason = 'programmatic') {
    this.emitClose(reason);
  }

  /**
   * Emits the close event and updates the open state.
   * @param reason - The reason for closing
   */
  private emitClose(reason: CloseReason) {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handles the native cancel event (triggered by Escape key).
   * Prevents default if the dialog is not dismissible.
   */
  private handleCancel(e: Event) {
    if (!this.dismissible) {
      e.preventDefault();
      return;
    }
    this.emitClose('escape');
  }

  /**
   * Handles the native close event.
   * Restores focus to the element that opened the dialog.
   */
  private handleNativeClose() {
    if (
      this.triggerElement &&
      typeof this.triggerElement.focus === 'function'
    ) {
      this.triggerElement.focus();
    }
    this.triggerElement = null;
  }

  /**
   * Handles clicks on the dialog element.
   * Closes if clicking the backdrop area (not the content) and dismissible.
   */
  private handleDialogClick(e: MouseEvent) {
    // Only close if clicking the dialog backdrop area, not content
    if (e.target === this.dialogEl && this.dismissible) {
      this.emitClose('backdrop');
    }
  }

  /**
   * Gets the size class for the dialog content.
   */
  private getSizeClasses(): string {
    const sizeClasses: Record<DialogSize, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
    };
    return sizeClasses[this.size];
  }

  override render() {
    return html\`
      <dialog
        @cancel=\${this.handleCancel}
        @close=\${this.handleNativeClose}
        @click=\${this.handleDialogClick}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div
          class="dialog-content \${this.getSizeClasses()} bg-card text-card-foreground rounded-lg shadow-lg p-6 relative"
          @click=\${(e: Event) => e.stopPropagation()}
        >
          \${this.showCloseButton
            ? html\`
                <button
                  class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click=\${() => this.close('programmatic')}
                  aria-label="Close dialog"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              \`
            : nothing}
          <header id="dialog-title" class="text-lg font-semibold mb-4">
            <slot name="title"></slot>
          </header>
          <div id="dialog-description" class="text-muted-foreground">
            <slot></slot>
          </div>
          <footer class="mt-6 flex justify-end gap-3">
            <slot name="footer"></slot>
          </footer>
        </div>
      </dialog>
    \`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'ui-dialog': Dialog;
  }
}
`;

/**
 * Input component template
 */
export const INPUT_TEMPLATE = `/**
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
 * \`\`\`html
 * <lui-input type="text" size="md"></lui-input>
 * <lui-input type="email" name="email" placeholder="Enter email"></lui-input>
 * <lui-input type="password" size="lg"></lui-input>
 * \`\`\`
 */

import { html, css, svg, isServer, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';

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
 * @slot prefix - Content displayed before the input text (e.g., currency symbol, icon)
 * @slot suffix - Content displayed after the input text (e.g., unit label, icon)
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
  private inputId = \\\`lui-input-\\\${Math.random().toString(36).substr(2, 9)}\\\`;

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
   * Whether to show a clear button when the input has a value.
   * @default false
   */
  @property({ type: Boolean })
  clearable = false;

  /**
   * Whether to show character count when maxlength is set.
   * Displays "current/max" format (e.g., "45/200").
   * @default false
   */
  @property({ type: Boolean, attribute: 'show-count' })
  showCount = false;

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

  /**
   * Whether the password is currently visible (for type="password").
   */
  @state()
  private passwordVisible = false;

  /**
   * Whether the prefix slot has content.
   */
  @state()
  private hasPrefixContent = false;

  /**
   * Whether the suffix slot has content.
   */
  @state()
  private hasSuffixContent = false;

  /**
   * Eye icon SVG (password hidden state - click to show).
   */
  private eyeIcon = svg\\\`
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke="currentColor" stroke-width="2" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="12" r="3"
            stroke="currentColor" stroke-width="2" fill="none"/>
  \\\`;

  /**
   * Eye-off icon SVG (password visible state - click to hide).
   */
  private eyeOffIcon = svg\\\`
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
          stroke="currentColor" stroke-width="2" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="1" y1="1" x2="23" y2="23"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
  \\\`;

  /**
   * X-circle icon SVG for clear button.
   */
  private xCircleIcon = svg\\\`
    <circle cx="12" cy="12" r="10"
            stroke="currentColor" stroke-width="2" fill="none"/>
    <line x1="15" y1="9" x2="9" y2="15"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="9" y1="9" x2="15" y2="15"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
  \\\`;

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
    css\\\`
      :host {
        display: inline-block;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      /* Input container - flex layout for prefix/suffix slots */
      .input-container {
        display: flex;
        align-items: center;
        border-radius: var(--ui-input-radius);
        border-width: var(--ui-input-border-width);
        border-style: solid;
        border-color: var(--ui-input-border);
        background-color: var(--ui-input-bg);
        transition:
          border-color var(--ui-input-transition),
          box-shadow var(--ui-input-transition);
      }

      .input-container:focus-within {
        border-color: var(--ui-input-border-focus);
      }

      .input-container.container-error {
        border-color: var(--ui-input-border-error);
      }

      .input-container.container-disabled {
        background-color: var(--ui-input-bg-disabled);
        border-color: var(--ui-input-border-disabled);
        cursor: not-allowed;
      }

      .input-container.container-readonly {
        background-color: var(--ui-input-bg-readonly, var(--color-muted));
      }

      /* Input element - remove border/bg when inside container */
      input {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        color: var(--ui-input-text);
        outline: none;
      }

      input::placeholder {
        color: var(--ui-input-placeholder);
      }

      /* Disabled state */
      input:disabled {
        color: var(--ui-input-text-disabled);
        cursor: not-allowed;
      }

      /* Readonly state */
      input:read-only:not(:disabled) {
        cursor: text;
      }

      /* Size variants for input */
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

      /* Slot styling - hidden by default, shown when has content */
      .input-slot {
        display: none;
        align-items: center;
      }

      .input-slot.has-content {
        display: flex;
      }

      .prefix-slot.has-content {
        padding-left: var(--ui-input-padding-x-md);
      }

      .suffix-slot.has-content {
        padding-right: var(--ui-input-padding-x-md);
      }

      /* Size-specific slot padding */
      .container-sm .prefix-slot.has-content {
        padding-left: var(--ui-input-padding-x-sm);
      }

      .container-sm .suffix-slot.has-content {
        padding-right: var(--ui-input-padding-x-sm);
      }

      .container-lg .prefix-slot.has-content {
        padding-left: var(--ui-input-padding-x-lg);
      }

      .container-lg .suffix-slot.has-content {
        padding-right: var(--ui-input-padding-x-lg);
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

      /* Password toggle button */
      .password-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        margin-right: 0.25rem;
        border: none;
        background: transparent;
        color: var(--color-muted-foreground);
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        transition:
          color 150ms,
          background-color 150ms;
      }

      .password-toggle:hover {
        color: var(--ui-input-text);
        background-color: var(--color-muted);
      }

      .password-toggle:focus-visible {
        outline: 2px solid var(--color-ring);
        outline-offset: 1px;
      }

      .toggle-icon {
        width: 1.25em;
        height: 1.25em;
      }

      /* Clear button */
      .clear-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        margin-right: 0.25rem;
        border: none;
        background: transparent;
        color: var(--color-muted-foreground);
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        transition:
          color 150ms,
          background-color 150ms;
      }

      .clear-button:hover {
        color: var(--ui-input-text);
        background-color: var(--color-muted);
      }

      .clear-button:focus-visible {
        outline: 2px solid var(--color-ring);
        outline-offset: 1px;
      }

      .clear-icon {
        width: 1.25em;
        height: 1.25em;
      }

      /* Character counter */
      .character-count {
        font-size: 0.75rem;
        color: var(--color-muted-foreground);
        padding-right: var(--ui-input-padding-x-md);
        white-space: nowrap;
      }

      .container-sm .character-count {
        padding-right: var(--ui-input-padding-x-sm);
      }

      .container-lg .character-count {
        padding-right: var(--ui-input-padding-x-lg);
      }

      /* Visually hidden for screen reader only text */
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    \\\`,
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
   * Handle container click to focus input.
   * Allows clicking on prefix/suffix areas to focus the input,
   * while not interfering with interactive content (buttons, links).
   */
  private handleContainerClick(e: Event): void {
    const target = e.target as HTMLElement;
    // Focus if clicking container directly or slot area (not interactive content)
    if (
      target === e.currentTarget ||
      (target.closest('slot') && !target.closest('button, a, input'))
    ) {
      this.inputEl?.focus();
    }
  }

  /**
   * Handle prefix slot change to track if content exists.
   */
  private handlePrefixSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this.hasPrefixContent = slot.assignedNodes().length > 0;
  }

  /**
   * Handle suffix slot change to track if content exists.
   */
  private handleSuffixSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this.hasSuffixContent = slot.assignedNodes().length > 0;
  }

  /**
   * Toggle password visibility between hidden and visible.
   */
  private togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Render the password visibility toggle button.
   */
  private renderPasswordToggle() {
    return html\\\`
      <button
        type="button"
        class="password-toggle"
        aria-pressed=\\\${this.passwordVisible}
        aria-controls=\\\${this.inputId}
        @click=\\\${this.togglePasswordVisibility}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          class="toggle-icon"
        >
          \\\${this.passwordVisible ? this.eyeOffIcon : this.eyeIcon}
        </svg>
        <span class="visually-hidden">
          \\\${this.passwordVisible ? 'Hide password' : 'Show password'}
        </span>
      </button>
    \\\`;
  }

  /**
   * Render the live region for password toggle announcements.
   */
  private renderPasswordLiveRegion() {
    if (this.type !== 'password') return nothing;
    return html\\\`
      <span class="visually-hidden" role="status" aria-live="polite">
        \\\${this.passwordVisible ? 'Password shown' : 'Password hidden'}
      </span>
    \\\`;
  }

  /**
   * Handle clear button click - empties value and returns focus to input.
   */
  private handleClear(): void {
    this.value = '';
    this.updateFormValue();
    this.inputEl?.focus();

    // Re-validate if already touched
    if (this.touched) {
      const isValid = this.validate();
      this.showError = !isValid;
    }
  }

  /**
   * Render the clear button for clearable inputs with value.
   */
  private renderClearButton() {
    return html\\\`
      <button
        type="button"
        class="clear-button"
        aria-label="Clear input"
        @click=\\\${this.handleClear}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" class="clear-icon">
          \\\${this.xCircleIcon}
        </svg>
      </button>
    \\\`;
  }

  /**
   * Render the character counter if showCount and maxlength are set.
   */
  private renderCharacterCount() {
    if (!this.showCount || !this.maxlength) return nothing;

    return html\\\`
      <span class="character-count" part="counter">
        \\\${this.value.length}/\\\${this.maxlength}
      </span>
    \\\`;
  }

  /**
   * Form lifecycle callback: reset the input to initial state.
   */
  formResetCallback(): void {
    this.value = '';
    this.touched = false;
    this.showError = false;
    this.passwordVisible = false;
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
    return \\\`input-\\\${this.size}\\\`;
  }

  /**
   * Get the CSS classes for the input container.
   */
  private getContainerClasses(): string {
    const classes = [\\\`container-\\\${this.size}\\\`];
    if (this.showError) {
      classes.push('container-error');
    }
    if (this.disabled) {
      classes.push('container-disabled');
    }
    if (this.readonly) {
      classes.push('container-readonly');
    }
    return classes.join(' ');
  }

  /**
   * Compute aria-describedby value based on error or helper state.
   */
  private getAriaDescribedBy(): string | typeof nothing {
    if (this.showError) {
      return \\\`\\\${this.inputId}-error\\\`;
    }
    if (this.helperText) {
      return \\\`\\\${this.inputId}-helper\\\`;
    }
    return nothing;
  }

  override render() {
    return html\\\`
      <div class="input-wrapper" part="wrapper">
        \\\${this.label
          ? html\\\`
              <label
                for=\\\${this.inputId}
                part="label"
                class="input-label label-\\\${this.size}"
              >
                \\\${this.label}
                \\\${this.required
                  ? html\\\`<span class="required-indicator"
                      >\\\${this.requiredIndicator === 'text'
                        ? ' (required)'
                        : '*'}</span
                    >\\\`
                  : nothing}
              </label>
            \\\`
          : nothing}
        \\\${this.helperText
          ? html\\\`
              <span
                id="\\\${this.inputId}-helper"
                part="helper"
                class="helper-text"
                >\\\${this.helperText}</span
              >
            \\\`
          : nothing}

        <div
          class="input-container \\\${this.getContainerClasses()}"
          part="container"
          @click=\\\${this.handleContainerClick}
        >
          <slot
            name="prefix"
            part="prefix"
            class="input-slot prefix-slot \\\${this.hasPrefixContent ? 'has-content' : ''}"
            @slotchange=\\\${this.handlePrefixSlotChange}
          ></slot>
          <input
            id=\\\${this.inputId}
            part="input"
            class=\\\${this.getInputClasses()}
            type=\\\${this.type === 'password' && this.passwordVisible
              ? 'text'
              : this.type}
            name=\\\${this.name}
            .value=\\\${this.value}
            placeholder=\\\${this.placeholder || nothing}
            ?required=\\\${this.required}
            ?disabled=\\\${this.disabled}
            ?readonly=\\\${this.readonly}
            minlength=\\\${this.minlength ?? nothing}
            maxlength=\\\${this.maxlength ?? nothing}
            min=\\\${this.min ?? nothing}
            max=\\\${this.max ?? nothing}
            pattern=\\\${this.pattern || nothing}
            aria-invalid=\\\${this.showError ? 'true' : nothing}
            aria-describedby=\\\${this.getAriaDescribedBy()}
            @input=\\\${this.handleInput}
            @blur=\\\${this.handleBlur}
          />
          \\\${this.type === 'password' ? this.renderPasswordToggle() : nothing}
          \\\${this.clearable && this.value ? this.renderClearButton() : nothing}
          \\\${this.renderCharacterCount()}
          <slot
            name="suffix"
            part="suffix"
            class="input-slot suffix-slot \\\${this.hasSuffixContent ? 'has-content' : ''}"
            @slotchange=\\\${this.handleSuffixSlotChange}
          ></slot>
        </div>

        \\\${this.showError && this.errorMessage
          ? html\\\`
              <span
                id="\\\${this.inputId}-error"
                part="error"
                class="error-text"
                role="alert"
                >\\\${this.errorMessage}</span
              >
            \\\`
          : nothing}
        \\\${this.renderPasswordLiveRegion()}
      </div>
    \\\`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-input': Input;
  }
}
`;

/**
 * Textarea component template
 */
export const TEXTAREA_TEMPLATE = `/**
 * lui-textarea - A customizable textarea component
 *
 * Features:
 * - Vertical resize by default (configurable: none, vertical, horizontal, both)
 * - Three sizes: sm, md, lg
 * - Form participation via ElementInternals - client-side only
 * - Disabled and readonly states with proper accessibility
 * - SSR compatible via isServer guards
 *
 * @example
 * \`\`\`html
 * <lui-textarea size="md"></lui-textarea>
 * <lui-textarea name="comment" placeholder="Enter comment" rows="5"></lui-textarea>
 * <lui-textarea resize="both" label="Description"></lui-textarea>
 * \`\`\`
 */

import { html, css, isServer, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';

/**
 * Textarea size types for padding and font sizing
 */
export type TextareaSize = 'sm' | 'md' | 'lg';

/**
 * Textarea resize types for resize handle behavior
 */
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

/**
 * A customizable textarea component with multiple sizes and resize options.
 * Supports form participation via ElementInternals for value submission.
 * Form participation is client-side only (guarded with isServer check).
 */
export class Textarea extends TailwindElement {
  /**
   * Enable form association for this custom element.
   * This allows the textarea to participate in form submission.
   */
  static formAssociated = true;

  /**
   * ElementInternals for form participation.
   * Null during SSR since attachInternals() is not available.
   */
  private internals: ElementInternals | null = null;

  /**
   * Unique ID for the textarea element, used for label association.
   */
  private textareaId = \\\`lui-textarea-\\\${Math.random().toString(36).substr(2, 9)}\\\`;

  /**
   * Reference to the native textarea element.
   */
  @query('textarea')
  private textareaEl!: HTMLTextAreaElement;

  /**
   * The size of the textarea affecting padding and font size.
   * @default 'md'
   */
  @property({ type: String })
  size: TextareaSize = 'md';

  /**
   * The name of the textarea for form submission.
   * @default ''
   */
  @property({ type: String })
  name = '';

  /**
   * The current value of the textarea.
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Placeholder text displayed when textarea is empty.
   * @default ''
   */
  @property({ type: String })
  placeholder = '';

  /**
   * Label text displayed above the textarea.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * Helper text displayed between label and textarea.
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
   * Initial height of the textarea in rows.
   * @default 3
   */
  @property({ type: Number })
  rows = 3;

  /**
   * Resize behavior of the textarea.
   * @default 'vertical'
   */
  @property({ type: String })
  resize: TextareaResize = 'vertical';

  /**
   * Whether the textarea auto-resizes to fit content.
   * When enabled, resize handle is hidden.
   * @default false
   */
  @property({ type: Boolean })
  autoresize = false;

  /**
   * Maximum number of rows when auto-resizing.
   * Takes precedence after maxHeight.
   */
  @property({ type: Number, attribute: 'max-rows' })
  maxRows?: number;

  /**
   * Maximum height when auto-resizing (CSS value like "200px" or "10rem").
   * Takes precedence over maxRows if both are set.
   */
  @property({ type: String, attribute: 'max-height' })
  maxHeight?: string;

  /**
   * Minimum length for text validation.
   */
  @property({ type: Number })
  minlength?: number;

  /**
   * Maximum length for text validation.
   */
  @property({ type: Number })
  maxlength?: number;

  /**
   * Whether to show character count when maxlength is set.
   * Displays "current/max" format (e.g., "45/200").
   * @default false
   */
  @property({ type: Boolean, attribute: 'show-count' })
  showCount = false;

  /**
   * Whether the textarea is required for form submission.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  required = false;

  /**
   * Whether the textarea is disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether the textarea is readonly.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /**
   * Whether the textarea has been touched (blur occurred).
   * Used for validation display timing.
   */
  @state()
  private touched = false;

  /**
   * Whether to show error state.
   * True when textarea is invalid and has been touched.
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
   * Lifecycle callback when element is first rendered.
   * Sets up initial auto-resize height.
   */
  protected firstUpdated(): void {
    if (this.autoresize) {
      this.adjustHeight();
    }
  }

  /**
   * Adjust textarea height to fit content.
   * Only active when autoresize is enabled.
   */
  private adjustHeight(): void {
    if (!this.autoresize || !this.textareaEl) return;

    const textarea = this.textareaEl;
    const minHeight = this.getMinHeight();

    // Reset height to get accurate scrollHeight
    textarea.style.height = 'auto';

    // Calculate new height
    let newHeight = textarea.scrollHeight;

    // Apply max height constraint if set
    const maxHeightPx = this.getMaxHeightPx();
    if (maxHeightPx && newHeight > maxHeightPx) {
      newHeight = maxHeightPx;
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }

    // Never shrink below initial rows
    if (newHeight < minHeight) {
      newHeight = minHeight;
    }

    textarea.style.height = \\\`\\\${newHeight}px\\\`;
  }

  /**
   * Get minimum height based on rows attribute.
   */
  private getMinHeight(): number {
    const computed = getComputedStyle(this.textareaEl);
    const lineHeight = parseFloat(computed.lineHeight) || 20;
    const paddingTop = parseFloat(computed.paddingTop) || 0;
    const paddingBottom = parseFloat(computed.paddingBottom) || 0;
    const borderTop = parseFloat(computed.borderTopWidth) || 0;
    const borderBottom = parseFloat(computed.borderBottomWidth) || 0;
    return (this.rows * lineHeight) + paddingTop + paddingBottom + borderTop + borderBottom;
  }

  /**
   * Get max height in pixels from maxHeight or maxRows.
   * maxHeight takes precedence if both are set.
   */
  private getMaxHeightPx(): number | null {
    if (this.maxHeight) {
      // Parse CSS value - create temp element for conversion
      const temp = document.createElement('div');
      temp.style.height = this.maxHeight;
      temp.style.position = 'absolute';
      temp.style.visibility = 'hidden';
      document.body.appendChild(temp);
      const height = temp.offsetHeight;
      document.body.removeChild(temp);
      return height > 0 ? height : null;
    }
    if (this.maxRows) {
      const computed = getComputedStyle(this.textareaEl);
      const lineHeight = parseFloat(computed.lineHeight) || 20;
      const paddingTop = parseFloat(computed.paddingTop) || 0;
      const paddingBottom = parseFloat(computed.paddingBottom) || 0;
      const borderTop = parseFloat(computed.borderTopWidth) || 0;
      const borderBottom = parseFloat(computed.borderBottomWidth) || 0;
      return (this.maxRows * lineHeight) + paddingTop + paddingBottom + borderTop + borderBottom;
    }
    return null;
  }

  /**
   * Static styles for the textarea component.
   * Uses CSS custom properties from Phase 26 tokens.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css\\\`
      :host {
        display: inline-block;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      /* Textarea element */
      textarea {
        display: block;
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
      }

      textarea::placeholder {
        color: var(--ui-input-placeholder);
      }

      textarea:focus {
        outline: none;
        border-color: var(--ui-input-border-focus);
      }

      /* Error state */
      textarea.textarea-error {
        border-color: var(--ui-input-border-error);
      }

      /* Disabled state */
      textarea:disabled {
        background-color: var(--ui-input-bg-disabled);
        border-color: var(--ui-input-border-disabled);
        color: var(--ui-input-text-disabled);
        cursor: not-allowed;
      }

      /* Readonly state */
      textarea:read-only:not(:disabled) {
        background-color: var(--ui-input-bg-readonly, var(--color-muted));
        cursor: text;
      }

      /* Size variants */
      textarea.textarea-sm {
        padding: var(--ui-input-padding-y-sm) var(--ui-input-padding-x-sm);
        font-size: var(--ui-input-font-size-sm);
      }

      textarea.textarea-md {
        padding: var(--ui-input-padding-y-md) var(--ui-input-padding-x-md);
        font-size: var(--ui-input-font-size-md);
      }

      textarea.textarea-lg {
        padding: var(--ui-input-padding-y-lg) var(--ui-input-padding-x-lg);
        font-size: var(--ui-input-font-size-lg);
      }

      /* Resize variants */
      textarea.resize-none {
        resize: none;
      }

      textarea.resize-vertical {
        resize: vertical;
      }

      textarea.resize-horizontal {
        resize: horizontal;
      }

      textarea.resize-both {
        resize: both;
      }

      /* Auto-resize mode - hide resize handle, smooth transition */
      textarea.autoresize {
        resize: none;
        overflow-y: hidden;
        transition: height 150ms ease-out,
                    border-color var(--ui-input-transition),
                    box-shadow var(--ui-input-transition);
      }

      /* Wrapper for label structure */
      .textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      /* Label styling - scales with size */
      .textarea-label {
        font-weight: 500;
        color: var(--ui-input-text);
      }

      .textarea-label.label-sm {
        font-size: var(--ui-input-font-size-sm);
      }

      .textarea-label.label-md {
        font-size: var(--ui-input-font-size-md);
      }

      .textarea-label.label-lg {
        font-size: var(--ui-input-font-size-lg);
      }

      .required-indicator {
        color: var(--ui-input-text-error);
        margin-left: 0.125rem;
      }

      /* Helper text - below label, above textarea */
      .helper-text {
        font-size: 0.875em;
        color: var(--color-muted-foreground);
      }

      /* Error text - below textarea */
      .error-text {
        font-size: 0.875em;
        color: var(--ui-input-text-error);
      }

      /* Character counter container */
      .textarea-container {
        position: relative;
        display: inline-block;
        width: 100%;
      }

      /* Character counter - positioned inside textarea bottom-right */
      .character-count {
        position: absolute;
        bottom: 0.5rem;
        right: 0.75rem;
        font-size: 0.75rem;
        color: var(--color-muted-foreground);
        pointer-events: none;
        background: var(--ui-input-bg);
        padding: 0 0.25rem;
      }

      /* Extra bottom padding when counter is shown to avoid text overlap */
      textarea.has-counter {
        padding-bottom: 1.75rem;
      }
    \\\`,
  ];

  /**
   * Sync the textarea value to the form via ElementInternals.
   */
  private updateFormValue(): void {
    this.internals?.setFormValue(this.value);
  }

  /**
   * Validate the textarea and sync validity state to ElementInternals.
   * Mirrors native textarea validity to the custom element for form participation.
   * @returns true if valid, false if invalid
   */
  private validate(): boolean {
    const textarea = this.textareaEl;
    if (!textarea || !this.internals) return true;

    const validity = textarea.validity;

    if (!validity.valid) {
      // Map native validity to ElementInternals
      this.internals.setValidity(
        {
          valueMissing: validity.valueMissing,
          tooShort: validity.tooShort,
          tooLong: validity.tooLong,
        },
        textarea.validationMessage,
        textarea // anchor for popup positioning
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
   * Handle input events from the native textarea.
   */
  private handleInput(e: Event): void {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.updateFormValue();

    // Auto-resize if enabled
    if (this.autoresize) {
      this.adjustHeight();
    }

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
   * Form lifecycle callback: reset the textarea to initial state.
   */
  formResetCallback(): void {
    this.value = '';
    this.touched = false;
    this.showError = false;
    this.internals?.setFormValue('');
    this.internals?.setValidity({});
    if (this.autoresize) {
      // Use requestAnimationFrame to ensure DOM updated
      requestAnimationFrame(() => this.adjustHeight());
    }
  }

  /**
   * Form lifecycle callback: handle disabled state from form.
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * Render the character counter if showCount and maxlength are set.
   */
  private renderCharacterCount() {
    if (!this.showCount || !this.maxlength) return nothing;

    return html\\\`
      <span class="character-count" part="counter">
        \\\${this.value.length}/\\\${this.maxlength}
      </span>
    \\\`;
  }

  /**
   * Get the CSS classes for the textarea element.
   */
  private getTextareaClasses(): string {
    const classes = [\\\`textarea-\\\${this.size}\\\`];

    if (this.autoresize) {
      classes.push('autoresize');
    } else {
      classes.push(\\\`resize-\\\${this.resize}\\\`);
    }

    if (this.showCount && this.maxlength) {
      classes.push('has-counter');
    }

    if (this.showError) {
      classes.push('textarea-error');
    }

    return classes.join(' ');
  }

  /**
   * Compute aria-describedby value based on error or helper state.
   */
  private getAriaDescribedBy(): string | typeof nothing {
    if (this.showError) {
      return \\\`\\\${this.textareaId}-error\\\`;
    }
    if (this.helperText) {
      return \\\`\\\${this.textareaId}-helper\\\`;
    }
    return nothing;
  }

  override render() {
    return html\\\`
      <div class="textarea-wrapper" part="wrapper">
        \\\${this.label
          ? html\\\`
              <label
                for=\\\${this.textareaId}
                part="label"
                class="textarea-label label-\\\${this.size}"
              >
                \\\${this.label}
                \\\${this.required
                  ? html\\\`<span class="required-indicator"
                      >\\\${this.requiredIndicator === 'text'
                        ? ' (required)'
                        : '*'}</span
                    >\\\`
                  : nothing}
              </label>
            \\\`
          : nothing}
        \\\${this.helperText
          ? html\\\`
              <span
                id="\\\${this.textareaId}-helper"
                part="helper"
                class="helper-text"
                >\\\${this.helperText}</span
              >
            \\\`
          : nothing}

        <div class="textarea-container">
          <textarea
            id=\\\${this.textareaId}
            part="textarea"
            class=\\\${this.getTextareaClasses()}
            name=\\\${this.name}
            .value=\\\${this.value}
            placeholder=\\\${this.placeholder || nothing}
            rows=\\\${this.rows}
            ?required=\\\${this.required}
            ?disabled=\\\${this.disabled}
            ?readonly=\\\${this.readonly}
            minlength=\\\${this.minlength ?? nothing}
            maxlength=\\\${this.maxlength ?? nothing}
            aria-invalid=\\\${this.showError ? 'true' : nothing}
            aria-describedby=\\\${this.getAriaDescribedBy()}
            @input=\\\${this.handleInput}
            @blur=\\\${this.handleBlur}
          ></textarea>
          \\\${this.renderCharacterCount()}
        </div>

        \\\${this.showError && this.errorMessage
          ? html\\\`
              <span
                id="\\\${this.textareaId}-error"
                part="error"
                class="error-text"
                role="alert"
                >\\\${this.errorMessage}</span
              >
            \\\`
          : nothing}
      </div>
    \\\`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-textarea': Textarea;
  }
}
`;

/**
 * Select component template
 */
export const SELECT_TEMPLATE = `/**
 * lui-select — Starter template.
 * For full features (multi-select, combobox, async loading, virtual scrolling),
 * install via NPM: npm install @lit-ui/select
 *
 * This starter provides a basic single-select dropdown with:
 * - Trigger button with placeholder and selected value display
 * - Dropdown panel with slot for options
 * - Keyboard navigation (ArrowUp/Down, Enter, Escape)
 * - Basic ARIA: role="listbox", aria-expanded, aria-haspopup
 * - Three sizes: sm, md, lg
 * - Disabled state
 * - Click-outside to close
 *
 * @example
 * \\\`\\\`\\\`html
 * <lui-select label="Country" placeholder="Select a country">
 *   <lui-option value="us">United States</lui-option>
 *   <lui-option value="ca">Canada</lui-option>
 *   <lui-option value="mx">Mexico</lui-option>
 * </lui-select>
 * \\\`\\\`\\\`
 */

import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TailwindElement } from '../../lib/lit-ui/tailwind-element';

/**
 * Select size types for padding and font sizing
 */
export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * A basic select dropdown component.
 * This is a starter template — for full features, use: npm install @lit-ui/select
 *
 * @slot - Default slot for lui-option elements
 */
@customElement('lui-select')
export class Select extends TailwindElement {
  /**
   * The label displayed above the select trigger.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * The name of the select for form submission.
   * @default ''
   */
  @property({ type: String })
  name = '';

  /**
   * The current selected value.
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Placeholder text when no value is selected.
   * @default 'Select...'
   */
  @property({ type: String })
  placeholder = 'Select...';

  /**
   * The size of the select trigger.
   * @default 'md'
   */
  @property({ type: String })
  size: SelectSize = 'md';

  /**
   * Whether the select is disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether the dropdown is open.
   */
  @state()
  private open = false;

  /**
   * The display label of the currently selected option.
   */
  @state()
  private displayLabel = '';

  static override styles = css\\\`
    :host {
      display: inline-block;
      position: relative;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .select-label {
      font-weight: 500;
      color: var(--ui-input-text, inherit);
    }

    .select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      border-radius: var(--ui-input-radius, 0.375rem);
      border: 1px solid var(--ui-input-border, var(--color-border, #e2e8f0));
      background: var(--ui-input-bg, var(--color-background, #fff));
      color: var(--ui-input-text, inherit);
      cursor: pointer;
      transition: border-color 150ms;
    }

    .select-trigger:focus-visible {
      outline: none;
      border-color: var(--ui-input-border-focus, var(--color-ring, #3b82f6));
      box-shadow: 0 0 0 1px var(--ui-input-border-focus, var(--color-ring, #3b82f6));
    }

    .select-trigger.trigger-sm {
      padding: 0.375rem 0.5rem;
      font-size: 0.875rem;
    }

    .select-trigger.trigger-md {
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
    }

    .select-trigger.trigger-lg {
      padding: 0.75rem 1rem;
      font-size: 1.125rem;
    }

    .select-placeholder {
      color: var(--ui-input-placeholder, var(--color-muted-foreground, #94a3b8));
    }

    .select-chevron {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
      transition: transform 150ms;
    }

    .select-chevron.open {
      transform: rotate(180deg);
    }

    .select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 50;
      margin-top: 0.25rem;
      border-radius: var(--ui-input-radius, 0.375rem);
      border: 1px solid var(--ui-input-border, var(--color-border, #e2e8f0));
      background: var(--ui-input-bg, var(--color-background, #fff));
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      max-height: 15rem;
      overflow-y: auto;
      padding: 0.25rem;
    }
  \\\`;

  override connectedCallback() {
    super.connectedCallback();
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    document.addEventListener('click', this._handleOutsideClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
  }

  private _handleOutsideClick(e: MouseEvent) {
    if (!this.open) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
  }

  private _toggleDropdown() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  private _handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._toggleDropdown();
        break;
      case 'Escape':
        if (this.open) {
          e.preventDefault();
          this.open = false;
        }
        break;
    }
  }

  private _handleSlotChange() {
    // Update display label if value is set
    if (this.value) {
      this._updateDisplayLabel();
    }
  }

  private _updateDisplayLabel() {
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    if (!slot) return;
    const options = slot.assignedElements();
    for (const el of options) {
      if ((el as HTMLElement).getAttribute('value') === this.value) {
        this.displayLabel = (el as HTMLElement).textContent?.trim() || this.value;
        return;
      }
    }
    this.displayLabel = '';
  }

  override render() {
    const chevron = html\\\`
      <svg class="select-chevron \\\${this.open ? 'open' : ''}"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    \\\`;

    return html\\\`
      <div class="select-wrapper">
        \\\${this.label
          ? html\\\`<label class="select-label">\\\${this.label}</label>\\\`
          : nothing}
        <div style="position: relative;">
          <button
            type="button"
            class="select-trigger trigger-\\\${this.size}"
            role="combobox"
            aria-expanded=\\\${this.open}
            aria-haspopup="listbox"
            ?disabled=\\\${this.disabled}
            @click=\\\${this._toggleDropdown}
            @keydown=\\\${this._handleKeydown}
          >
            <span class=\\\${!this.value && !this.displayLabel ? 'select-placeholder' : ''}>
              \\\${this.displayLabel || this.value || this.placeholder}
            </span>
            \\\${chevron}
          </button>
          \\\${this.open
            ? html\\\`
                <div class="select-dropdown" role="listbox">
                  <slot @slotchange=\\\${this._handleSlotChange}></slot>
                </div>
              \\\`
            : nothing}
        </div>
      </div>
    \\\`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-select': Select;
  }
}
`;

/**
 * Switch component template
 */
export const SWITCH_TEMPLATE = `/**
 * lui-switch - An accessible toggle switch component
 *
 * Features:
 * - Toggle between on/off states via click, Space, or Enter
 * - Animated track + thumb with CSS slide transition
 * - Form participation via ElementInternals (setFormValue, setValidity, formResetCallback)
 * - Required validation and disabled state
 * - Label via property or default slot
 * - Three sizes: sm, md, lg using CSS tokens
 * - role="switch" with aria-checked for screen readers
 * - prefers-reduced-motion support
 * - SSR compatible via isServer guards
 *
 * @example
 * \`\`\`html
 * <lui-switch label="Notifications" size="md"></lui-switch>
 * <lui-switch checked name="dark-mode" value="on"></lui-switch>
 * <lui-switch required label="Accept terms"></lui-switch>
 * \`\`\`
 */

import { html, css, nothing, isServer, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';

/**
 * Dispatch a custom event from an element.
 */
function dispatchCustomEvent(el: HTMLElement, name: string, detail?: unknown) {
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}

/**
 * Switch size types for track and thumb dimensions.
 */
export type SwitchSize = 'sm' | 'md' | 'lg';

/**
 * An accessible toggle switch component with form participation.
 * Renders a track + thumb visual with animated CSS slide transition.
 * Form participation is client-side only (guarded with isServer check).
 *
 * @slot default - Custom label content (alternative to label property)
 */
export class Switch extends TailwindElement {
  /**
   * Enable form association for this custom element.
   * This allows the switch to participate in form submission.
   */
  static formAssociated = true;

  /**
   * ElementInternals for form participation.
   * Null during SSR since attachInternals() is not available.
   */
  private internals: ElementInternals | null = null;

  /**
   * Unique ID for label association.
   */
  private switchId = \`lui-switch-\${Math.random().toString(36).substr(2, 9)}\`;

  /**
   * Stores the initial checked state for formResetCallback.
   */
  private defaultChecked = false;

  /**
   * Whether the switch is in the on state.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  checked = false;

  /**
   * Whether the switch is disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether the switch is required for form submission.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  required = false;

  /**
   * The name of the switch for form submission.
   * @default ''
   */
  @property({ type: String })
  name = '';

  /**
   * The value submitted when checked.
   * @default 'on'
   */
  @property({ type: String })
  value = 'on';

  /**
   * Label text displayed next to the switch.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * The size of the switch affecting track and thumb dimensions.
   * @default 'md'
   */
  @property({ type: String })
  size: SwitchSize = 'md';

  /**
   * Whether the switch has been interacted with.
   * Used for validation display timing.
   */
  @state()
  private touched = false;

  /**
   * Whether to show error state.
   * True when switch is invalid and has been touched.
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultChecked = this.checked;
    this.updateFormValue();
  }

  /**
   * Keep form state in sync when checked property changes externally.
   */
  protected override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('checked')) {
      this.updateFormValue();
      this.validate();
    }
  }

  /**
   * Static styles for the switch component.
   * Uses CSS custom properties from the switch token block.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css\`
      :host {
        display: inline-block;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      /* Switch wrapper - flexbox row for label + track */
      .switch-wrapper {
        display: flex;
        flex-direction: row;
        gap: var(--ui-switch-label-gap);
        align-items: center;
      }

      /* Track - the oval background */
      .switch-track {
        display: inline-flex;
        align-items: center;
        position: relative;
        border-radius: var(--ui-switch-radius);
        background-color: var(--ui-switch-track-bg);
        cursor: pointer;
        border: 1px solid var(--ui-switch-track-border);
        transition: background-color var(--ui-switch-transition) ease-in-out;
        flex-shrink: 0;
      }

      .switch-track[aria-checked='true'] {
        background-color: var(--ui-switch-track-bg-checked);
        border-color: var(--ui-switch-track-bg-checked);
      }

      .switch-track[aria-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Thumb - the sliding circle */
      .switch-thumb {
        position: absolute;
        left: var(--ui-switch-thumb-offset);
        top: 50%;
        transform: translateY(-50%);
        border-radius: var(--ui-switch-thumb-radius);
        background-color: var(--ui-switch-thumb-bg);
        transition: transform var(--ui-switch-transition) ease-in-out;
      }

      /* Size: sm */
      .track-sm {
        width: var(--ui-switch-track-width-sm);
        height: var(--ui-switch-track-height-sm);
      }

      .track-sm .switch-thumb {
        width: var(--ui-switch-thumb-size-sm);
        height: var(--ui-switch-thumb-size-sm);
      }

      .track-sm[aria-checked='true'] .switch-thumb {
        transform: translateX(
            calc(
              var(--ui-switch-track-width-sm) - var(--ui-switch-thumb-size-sm) -
                var(--ui-switch-thumb-offset) * 2
            )
          )
          translateY(-50%);
      }

      /* Size: md */
      .track-md {
        width: var(--ui-switch-track-width-md);
        height: var(--ui-switch-track-height-md);
      }

      .track-md .switch-thumb {
        width: var(--ui-switch-thumb-size-md);
        height: var(--ui-switch-thumb-size-md);
      }

      .track-md[aria-checked='true'] .switch-thumb {
        transform: translateX(
            calc(
              var(--ui-switch-track-width-md) - var(--ui-switch-thumb-size-md) -
                var(--ui-switch-thumb-offset) * 2
            )
          )
          translateY(-50%);
      }

      /* Size: lg */
      .track-lg {
        width: var(--ui-switch-track-width-lg);
        height: var(--ui-switch-track-height-lg);
      }

      .track-lg .switch-thumb {
        width: var(--ui-switch-thumb-size-lg);
        height: var(--ui-switch-thumb-size-lg);
      }

      .track-lg[aria-checked='true'] .switch-thumb {
        transform: translateX(
            calc(
              var(--ui-switch-track-width-lg) - var(--ui-switch-thumb-size-lg) -
                var(--ui-switch-thumb-offset) * 2
            )
          )
          translateY(-50%);
      }

      /* Focus ring */
      .switch-track:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--ui-switch-ring);
      }

      /* Error state */
      .switch-track.has-error {
        border-color: var(--ui-switch-border-error);
      }

      /* Label */
      .switch-label {
        font-weight: 500;
        color: var(--ui-input-text, inherit);
      }

      .label-sm {
        font-size: var(--ui-switch-font-size-sm);
      }

      .label-md {
        font-size: var(--ui-switch-font-size-md);
      }

      .label-lg {
        font-size: var(--ui-switch-font-size-lg);
      }

      /* Error text */
      .error-text {
        font-size: 0.75rem;
        color: var(--ui-switch-text-error);
        margin-top: 0.25rem;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .switch-thumb,
        .switch-track {
          transition-duration: 0ms;
        }
      }
    \`,
  ];

  /**
   * Toggle the switch state.
   * Dispatches ui-change event with checked state and value.
   */
  private toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.touched = true;
    this.updateFormValue();
    this.validate();
    dispatchCustomEvent(this, 'ui-change', {
      checked: this.checked,
      value: this.checked ? this.value : null,
    });
  }

  /**
   * Handle click events on the switch track.
   */
  private handleClick(): void {
    this.toggle();
  }

  /**
   * Handle keyboard events for Space and Enter keys.
   * Prevents default to avoid page scroll on Space.
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.toggle();
    }
  }

  /**
   * Sync the checked state to the form via ElementInternals.
   * Submits value when checked, null when unchecked (matches native checkbox).
   */
  private updateFormValue(): void {
    this.internals?.setFormValue(this.checked ? this.value : null);
  }

  /**
   * Validate the switch and sync validity state to ElementInternals.
   * @returns true if valid, false if invalid
   */
  private validate(): boolean {
    if (!this.internals) return true;

    if (this.required && !this.checked) {
      this.internals.setValidity(
        { valueMissing: true },
        'Please toggle this switch.',
        this.shadowRoot?.querySelector('.switch-track') as HTMLElement
      );
      this.showError = this.touched;
      return false;
    }

    this.internals.setValidity({});
    this.showError = false;
    return true;
  }

  /**
   * Form lifecycle callback: reset the switch to initial state.
   */
  formResetCallback(): void {
    this.checked = this.defaultChecked;
    this.touched = false;
    this.showError = false;
    this.updateFormValue();
    this.internals?.setValidity({});
  }

  /**
   * Form lifecycle callback: handle disabled state from form.
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  override render() {
    return html\`
      <div class="switch-wrapper">
        \${this.label
          ? html\`<label
              id="\${this.switchId}-label"
              class="switch-label label-\${this.size}"
              >\${this.label}</label
            >\`
          : html\`<label
              id="\${this.switchId}-label"
              class="switch-label label-\${this.size}"
              ><slot></slot
            ></label>\`}
        <div
          role="switch"
          aria-checked=\${this.checked ? 'true' : 'false'}
          aria-disabled=\${this.disabled ? 'true' : nothing}
          aria-required=\${this.required ? 'true' : nothing}
          aria-labelledby="\${this.switchId}-label"
          tabindex=\${this.disabled ? '-1' : '0'}
          class="switch-track track-\${this.size} \${this.showError
            ? 'has-error'
            : ''}"
          @click=\${this.handleClick}
          @keydown=\${this.handleKeyDown}
        >
          <span class="switch-thumb"></span>
        </div>
      </div>
      \${this.showError
        ? html\`<div class="error-text" role="alert">
            Please toggle this switch.
          </div>\`
        : nothing}
    \`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-switch': Switch;
  }
}
`;

/**
 * Checkbox component template
 */
export const CHECKBOX_TEMPLATE = `/**
 * lui-checkbox - An accessible checkbox component with animated SVG checkmark
 *
 * Features:
 * - Toggle between checked/unchecked states via click or Space key
 * - Animated SVG checkmark draw-in transition when checked
 * - Indeterminate tri-state with dash icon and aria-checked="mixed"
 * - Indeterminate clears on user interaction (always results in checked or unchecked)
 * - Form participation via ElementInternals (setFormValue, setValidity, formResetCallback)
 * - Required validation with touched-based error display
 * - Label via property or default slot
 * - Three sizes: sm, md, lg using CSS tokens
 * - role="checkbox" with aria-checked (true/false/mixed) for screen readers
 * - prefers-reduced-motion support
 * - SSR compatible via isServer guards
 *
 * @example
 * \`\`\`html
 * <lui-checkbox label="Accept terms" required></lui-checkbox>
 * <lui-checkbox checked name="newsletter" value="yes"></lui-checkbox>
 * <lui-checkbox indeterminate label="Select all"></lui-checkbox>
 * \`\`\`
 */

import { html, css, nothing, isServer, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';

/**
 * Dispatch a custom event from an element.
 */
function dispatchCustomEvent(el: HTMLElement, name: string, detail?: unknown) {
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}

/**
 * Checkbox size types for box dimensions and label typography.
 */
export type CheckboxSize = 'sm' | 'md' | 'lg';

/**
 * An accessible checkbox component with animated SVG checkmark,
 * indeterminate tri-state, and form participation.
 * Form participation is client-side only (guarded with isServer check).
 *
 * @slot default - Custom label content (alternative to label property)
 */
export class Checkbox extends TailwindElement {
  /**
   * Enable form association for this custom element.
   * This allows the checkbox to participate in form submission.
   */
  static formAssociated = true;

  /**
   * ElementInternals for form participation.
   * Null during SSR since attachInternals() is not available.
   */
  private internals: ElementInternals | null = null;

  /**
   * Unique ID for label association.
   */
  private checkboxId = \`lui-cb-\${Math.random().toString(36).substr(2, 9)}\`;

  /**
   * Stores the initial checked state for formResetCallback.
   */
  private defaultChecked = false;

  /**
   * Whether the checkbox is in the checked state.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  checked = false;

  /**
   * Whether the checkbox is disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether the checkbox is required for form submission.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  required = false;

  /**
   * Whether the checkbox is in an indeterminate state.
   * JS-only property, not reflected (matches native convention).
   * @default false
   */
  @property({ type: Boolean })
  indeterminate = false;

  /**
   * The name of the checkbox for form submission.
   * @default ''
   */
  @property({ type: String })
  name = '';

  /**
   * The value submitted when checked.
   * @default 'on'
   */
  @property({ type: String })
  value = 'on';

  /**
   * Label text displayed next to the checkbox.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * The size of the checkbox affecting box dimensions and label typography.
   * @default 'md'
   */
  @property({ type: String })
  size: CheckboxSize = 'md';

  /**
   * Whether the checkbox has been interacted with.
   * Used for validation display timing.
   */
  @state()
  private touched = false;

  /**
   * Whether to show error state.
   * True when checkbox is invalid and has been touched.
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultChecked = this.checked;
    this.updateFormValue();
  }

  /**
   * Keep form state in sync when checked or indeterminate property changes externally.
   */
  protected override updated(changedProperties: PropertyValues): void {
    if (
      changedProperties.has('checked') ||
      changedProperties.has('indeterminate')
    ) {
      this.updateFormValue();
      this.validate();
    }
  }

  /**
   * Static styles for the checkbox component.
   * Uses CSS custom properties from the checkbox token block.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css\`
      :host {
        display: inline-block;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      /* Checkbox wrapper - flexbox row for label + box */
      .checkbox-wrapper {
        display: flex;
        flex-direction: row;
        gap: var(--ui-checkbox-label-gap);
        align-items: center;
        cursor: pointer;
      }

      /* Checkbox box - the square container */
      .checkbox-box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: var(--ui-checkbox-border-width) solid var(--ui-checkbox-border);
        border-radius: var(--ui-checkbox-radius);
        background-color: var(--ui-checkbox-bg);
        cursor: pointer;
        transition:
          background-color var(--ui-checkbox-transition) ease-in-out,
          border-color var(--ui-checkbox-transition) ease-in-out;
        flex-shrink: 0;
        color: var(--ui-checkbox-check-color);
      }

      /* Checked and indeterminate states */
      .checkbox-box[aria-checked='true'],
      .checkbox-box[aria-checked='mixed'] {
        background-color: var(--ui-checkbox-bg-checked);
        border-color: var(--ui-checkbox-border-checked);
      }

      /* SVG icon sizing */
      .checkbox-icon {
        width: 75%;
        height: 75%;
      }

      /* Checkmark draw-in animation via stroke-dashoffset */
      .check-path {
        stroke-dasharray: 14;
        stroke-dashoffset: 14;
        transition: stroke-dashoffset var(--ui-checkbox-transition) ease-in-out;
      }

      /* When checked: draw in (offset to 0) */
      .checkbox-box[aria-checked='true'] .check-path {
        stroke-dashoffset: 0;
      }

      /* Indeterminate dash - use opacity for cross-fade */
      .dash-path {
        opacity: 0;
        transition: opacity var(--ui-checkbox-transition) ease-in-out;
      }

      .checkbox-box[aria-checked='mixed'] .dash-path {
        opacity: 1;
      }

      /* Hide checkmark when indeterminate */
      .checkbox-box[aria-checked='mixed'] .check-path {
        stroke-dashoffset: 14;
      }

      /* Size: sm */
      .box-sm {
        width: var(--ui-checkbox-size-sm);
        height: var(--ui-checkbox-size-sm);
      }

      /* Size: md */
      .box-md {
        width: var(--ui-checkbox-size-md);
        height: var(--ui-checkbox-size-md);
      }

      /* Size: lg */
      .box-lg {
        width: var(--ui-checkbox-size-lg);
        height: var(--ui-checkbox-size-lg);
      }

      /* Focus ring */
      .checkbox-box:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--ui-checkbox-ring);
      }

      /* Disabled */
      .checkbox-box[aria-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Label */
      .checkbox-label {
        font-weight: 500;
        color: var(--ui-input-text, inherit);
        cursor: pointer;
      }

      .label-sm {
        font-size: var(--ui-checkbox-font-size-sm);
      }

      .label-md {
        font-size: var(--ui-checkbox-font-size-md);
      }

      .label-lg {
        font-size: var(--ui-checkbox-font-size-lg);
      }

      /* Error text */
      .error-text {
        font-size: 0.75rem;
        color: var(--ui-checkbox-text-error);
        margin-top: 0.25rem;
      }

      /* Error border */
      .checkbox-box.has-error {
        border-color: var(--ui-checkbox-border-error);
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .check-path,
        .dash-path,
        .checkbox-box {
          transition-duration: 0ms;
        }
      }
    \`,
  ];

  /**
   * Toggle the checkbox state.
   * Always clears indeterminate on user interaction.
   * Dispatches ui-change event with checked state and value.
   */
  private toggle(): void {
    if (this.disabled) return;
    this.indeterminate = false;
    this.checked = !this.checked;
    this.touched = true;
    this.updateFormValue();
    this.validate();
    dispatchCustomEvent(this, 'ui-change', {
      checked: this.checked,
      value: this.checked ? this.value : null,
    });
  }

  /**
   * Handle click events on the checkbox wrapper.
   * Click handler is on the wrapper so clicking the label also toggles.
   */
  private handleClick(): void {
    this.toggle();
  }

  /**
   * Handle keyboard events for Space key only.
   * Per W3C APG checkbox spec, Space toggles the checkbox.
   * Enter is NOT specified for checkbox (unlike switch).
   * preventDefault stops page scroll on Space.
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === ' ') {
      e.preventDefault();
      this.toggle();
    }
  }

  /**
   * Sync the checked state to the form via ElementInternals.
   * Submits value when checked, null when unchecked.
   * Indeterminate does NOT affect form value.
   */
  private updateFormValue(): void {
    this.internals?.setFormValue(this.checked ? this.value : null);
  }

  /**
   * Validate the checkbox and sync validity state to ElementInternals.
   * @returns true if valid, false if invalid
   */
  private validate(): boolean {
    if (!this.internals) return true;

    if (this.required && !this.checked) {
      this.internals.setValidity(
        { valueMissing: true },
        'Please check this box.',
        this.shadowRoot?.querySelector('.checkbox-box') as HTMLElement
      );
      this.showError = this.touched;
      return false;
    }

    this.internals.setValidity({});
    this.showError = false;
    return true;
  }

  /**
   * Form lifecycle callback: reset the checkbox to initial state.
   */
  formResetCallback(): void {
    this.checked = this.defaultChecked;
    this.indeterminate = false;
    this.touched = false;
    this.showError = false;
    this.updateFormValue();
    this.internals?.setValidity({});
  }

  /**
   * Form lifecycle callback: handle disabled state from form.
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  override render() {
    return html\`
      <div class="checkbox-wrapper" @click=\${this.handleClick}>
        <div
          role="checkbox"
          aria-checked=\${this.indeterminate
            ? 'mixed'
            : this.checked
              ? 'true'
              : 'false'}
          aria-disabled=\${this.disabled ? 'true' : nothing}
          aria-required=\${this.required ? 'true' : nothing}
          aria-labelledby="\${this.checkboxId}-label"
          tabindex=\${this.disabled ? '-1' : '0'}
          class="checkbox-box box-\${this.size} \${this.showError
            ? 'has-error'
            : ''}"
          @keydown=\${this.handleKeyDown}
        >
          <svg
            class="checkbox-icon"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              class="check-path"
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              class="dash-path"
              d="M3 6H9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        \${this.label
          ? html\`<label
              id="\${this.checkboxId}-label"
              class="checkbox-label label-\${this.size}"
              >\${this.label}</label
            >\`
          : html\`<label
              id="\${this.checkboxId}-label"
              class="checkbox-label label-\${this.size}"
              ><slot></slot
            ></label>\`}
      </div>
      \${this.showError
        ? html\`<div class="error-text" role="alert">
            Please check this box.
          </div>\`
        : nothing}
    \`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-checkbox': Checkbox;
  }
}
`;

/**
 * CheckboxGroup component template
 */
export const CHECKBOX_GROUP_TEMPLATE = `/**
 * lui-checkbox-group - An accessible checkbox group container
 *
 * Features:
 * - role="group" with aria-labelledby for screen reader grouping
 * - Label text display for group identification
 * - Disabled propagation to all child lui-checkbox elements
 * - Select-all checkbox with indeterminate (mixed) state coordination
 * - Batch update flag prevents race conditions during select-all toggling
 * - Group-level validation (required: at least one must be checked)
 * - NOT form-associated: each child checkbox submits independently
 * - Child discovery via slotchange event
 * - SSR compatible
 *
 * @example
 * \`\`\`html
 * <lui-checkbox-group label="Preferences" required>
 *   <lui-checkbox label="Email" name="pref" value="email"></lui-checkbox>
 *   <lui-checkbox label="SMS" name="pref" value="sms"></lui-checkbox>
 * </lui-checkbox-group>
 * \`\`\`
 *
 * @example Select-all
 * \`\`\`html
 * <lui-checkbox-group label="Toppings" select-all>
 *   <lui-checkbox label="Cheese" name="topping" value="cheese"></lui-checkbox>
 *   <lui-checkbox label="Pepperoni" name="topping" value="pepperoni"></lui-checkbox>
 * </lui-checkbox-group>
 * \`\`\`
 */

import { html, css, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';
import type { Checkbox } from './checkbox';

/**
 * Dispatch a custom event from an element.
 */
function dispatchCustomEvent(el: HTMLElement, name: string, detail?: unknown) {
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}

/**
 * An accessible checkbox group container with disabled propagation,
 * select-all coordination, and group-level validation.
 * NOT form-associated -- each child checkbox submits independently.
 *
 * @slot default - Child lui-checkbox elements
 */
export class CheckboxGroup extends TailwindElement {
  // NOT form-associated -- children submit themselves

  /**
   * Unique ID for label association.
   */
  private groupId = \`lui-cbg-\${Math.random().toString(36).substr(2, 9)}\`;

  /**
   * Discovered child checkboxes (NOT including select-all).
   */
  private checkboxes: Checkbox[] = [];

  /**
   * Flag to prevent select-all race condition during batch updates.
   * When true, handleChildChange skips recalculation.
   */
  private _batchUpdating = false;

  /**
   * Reference to the internal select-all checkbox element.
   */
  private selectAllEl: Checkbox | null = null;

  /**
   * Label text displayed above the group.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * Whether all child checkboxes should be disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether at least one checkbox must be checked (group-level validation).
   * @default false
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Custom error message for group validation.
   * @default ''
   */
  @property({ type: String })
  error = '';

  /**
   * Whether to show a select-all checkbox.
   * @default false
   */
  @property({ type: Boolean, attribute: 'select-all' })
  selectAll = false;

  /**
   * Whether to show the validation error message.
   */
  @state()
  private showError = false;

  /**
   * Static styles for the checkbox group component.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css\`
      :host {
        display: block;
      }

      :host([disabled]) {
        opacity: 0.5;
      }

      .group-wrapper {
        display: flex;
        flex-direction: column;
      }

      .group-label {
        font-weight: 500;
        margin-bottom: 0.375rem;
        font-size: 0.875rem;
        color: var(--ui-input-text, inherit);
      }

      .group-items {
        display: flex;
        flex-direction: column;
        gap: var(--ui-checkbox-group-gap);
      }

      .select-all-wrapper {
        padding-bottom: var(--ui-checkbox-group-gap);
        border-bottom: 1px solid var(--ui-checkbox-border);
        margin-bottom: var(--ui-checkbox-group-gap);
      }

      .error-text {
        font-size: 0.75rem;
        color: var(--ui-checkbox-text-error);
        margin-top: 0.25rem;
      }
    \`,
  ];

  /**
   * Sync disabled state and select-all reference when properties change.
   */
  protected override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('disabled')) {
      this.syncDisabledState();
    }

    if (changedProperties.has('selectAll') || changedProperties.has('disabled')) {
      // Get select-all checkbox reference after render
      if (this.selectAll) {
        this.selectAllEl = this.shadowRoot?.querySelector(
          '.select-all-wrapper lui-checkbox'
        ) as Checkbox | null;
        this.updateSelectAllState();
      } else {
        this.selectAllEl = null;
      }
    }
  }

  /**
   * Handle slot changes to discover child checkboxes.
   * Filters for LUI-CHECKBOX elements and syncs disabled state.
   */
  private handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true });
    this.checkboxes = assigned.filter(
      (el) => el.tagName === 'LUI-CHECKBOX'
    ) as Checkbox[];
    this.syncDisabledState();
    this.updateSelectAllState();
  }

  /**
   * Propagate disabled state to all child checkboxes.
   * Called when disabled property changes or children are discovered.
   */
  private syncDisabledState(): void {
    if (this.disabled) {
      this.checkboxes.forEach((cb) => (cb.disabled = true));
    }
  }

  /**
   * Handle ui-change events bubbling from child checkboxes.
   * Skips during batch updates to prevent race conditions.
   */
  private handleChildChange(): void {
    if (this._batchUpdating) return;

    if (this.selectAll) {
      this.updateSelectAllState();
    }
    this.validateGroup();
  }

  /**
   * Update the select-all checkbox to reflect the aggregate state of children.
   * - All checked: checked=true, indeterminate=false
   * - None checked: checked=false, indeterminate=false
   * - Some checked: checked=false, indeterminate=true
   */
  private updateSelectAllState(): void {
    if (!this.selectAllEl || this.checkboxes.length === 0) return;

    const enabled = this.checkboxes.filter((cb) => !cb.disabled);
    const checkedCount = enabled.filter((cb) => cb.checked).length;
    const total = enabled.length;

    if (checkedCount === 0) {
      this.selectAllEl.checked = false;
      this.selectAllEl.indeterminate = false;
    } else if (checkedCount === total) {
      this.selectAllEl.checked = true;
      this.selectAllEl.indeterminate = false;
    } else {
      this.selectAllEl.checked = false;
      this.selectAllEl.indeterminate = true;
    }
  }

  /**
   * Handle the select-all checkbox toggle.
   * Uses batch update flag to prevent race conditions.
   * Stops propagation to prevent handleChildChange from also firing.
   */
  private handleSelectAllToggle(e: Event): void {
    e.stopPropagation();

    const shouldCheck = !this.checkboxes
      .filter((cb) => !cb.disabled)
      .every((cb) => cb.checked);

    this._batchUpdating = true;
    this.checkboxes.forEach((cb) => {
      if (!cb.disabled) {
        cb.checked = shouldCheck;
      }
    });
    this._batchUpdating = false;

    this.updateSelectAllState();
    this.validateGroup();

    dispatchCustomEvent(this, 'ui-change', {
      allChecked: shouldCheck,
      checkedCount: this.checkboxes.filter((cb) => cb.checked).length,
      totalCount: this.checkboxes.length,
    });
  }

  /**
   * Validate group-level required constraint.
   * Shows error if required and no children are checked.
   */
  private validateGroup(): void {
    if (this.required && !this.checkboxes.some((cb) => cb.checked)) {
      this.showError = true;
    } else {
      this.showError = false;
    }
  }

  override render() {
    return html\`
      <div
        class="group-wrapper"
        role="group"
        aria-labelledby="\${this.groupId}-label"
        @ui-change=\${this.handleChildChange}
      >
        \${this.label
          ? html\`<span id="\${this.groupId}-label" class="group-label"
              >\${this.label}</span
            >\`
          : nothing}
        \${this.selectAll
          ? html\`
              <div class="select-all-wrapper">
                <lui-checkbox
                  label="Select all"
                  @ui-change=\${this.handleSelectAllToggle}
                  .disabled=\${this.disabled}
                ></lui-checkbox>
              </div>
            \`
          : nothing}
        <div class="group-items">
          <slot @slotchange=\${this.handleSlotChange}></slot>
        </div>
        \${this.showError
          ? html\`<div class="error-text" role="alert">
              \${this.error || 'Please select at least one option.'}
            </div>\`
          : nothing}
      </div>
    \`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-checkbox-group': CheckboxGroup;
  }
}
`;

/**
 * Radio component template
 */
export const RADIO_TEMPLATE = `/**
 * lui-radio - An accessible radio button component with animated dot transition
 *
 * Features:
 * - Circular radio button with animated dot scale transition when checked
 * - Click or Space key dispatches ui-radio-change event to parent RadioGroup
 * - Radio does NOT toggle its own checked state (group manages mutual exclusion)
 * - NOT form-associated (RadioGroup owns form participation)
 * - Label via property or default slot
 * - Three sizes: sm, md, lg using CSS tokens
 * - role="radio" with aria-checked for screen readers
 * - prefers-reduced-motion support
 * - SSR compatible via isServer guards
 *
 * @example
 * \`\`\`html
 * <lui-radio value="option1" label="Option 1"></lui-radio>
 * <lui-radio value="option2" checked label="Option 2"></lui-radio>
 * <lui-radio value="option3" disabled label="Option 3"></lui-radio>
 * \`\`\`
 *
 * @slot default - Custom label content (alternative to label property)
 */

import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';

/**
 * Dispatch a custom event from an element.
 */
function dispatchCustomEvent(el: HTMLElement, name: string, detail?: unknown) {
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}

/**
 * Radio size types for circle dimensions and label typography.
 */
export type RadioSize = 'sm' | 'md' | 'lg';

/**
 * An accessible radio button component with animated dot transition.
 * Presentational child of RadioGroup -- does NOT participate in forms.
 *
 * @slot default - Custom label content (alternative to label property)
 */
export class Radio extends TailwindElement {
  // NOT form-associated -- RadioGroup owns form participation
  // NO internals / attachInternals()

  /**
   * Unique ID for label association.
   */
  private radioId = \`lui-radio-\${Math.random().toString(36).substr(2, 9)}\`;

  /**
   * The value this radio represents.
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Whether the radio is in the checked state.
   * Set by RadioGroup, not by the radio itself.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  checked = false;

  /**
   * Whether the radio is disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Label text displayed next to the radio.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * The size of the radio affecting circle dimensions and label typography.
   * @default 'md'
   */
  @property({ type: String })
  size: RadioSize = 'md';

  /**
   * Static styles for the radio component.
   * Uses CSS custom properties from the radio token block.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css\`
      :host {
        display: inline-block;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      /* Radio wrapper - flexbox row for label + circle */
      .radio-wrapper {
        display: flex;
        flex-direction: row;
        gap: var(--ui-radio-label-gap);
        align-items: center;
        cursor: pointer;
      }

      /* Radio circle - the outer border */
      .radio-circle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: var(--ui-radio-border-width) solid var(--ui-radio-border);
        border-radius: 50%;
        background-color: var(--ui-radio-bg);
        cursor: pointer;
        transition: border-color var(--ui-radio-transition) ease-in-out;
        flex-shrink: 0;
      }

      /* Checked state */
      .radio-circle[aria-checked='true'] {
        border-color: var(--ui-radio-border-checked);
      }

      /* Inner dot */
      .radio-dot {
        border-radius: 50%;
        background-color: var(--ui-radio-dot-color);
        transform: scale(0);
        transition: transform var(--ui-radio-transition) ease-in-out;
      }

      /* Dot visible when checked */
      .radio-circle[aria-checked='true'] .radio-dot {
        transform: scale(1);
      }

      /* Size: sm */
      .circle-sm {
        width: var(--ui-radio-size-sm);
        height: var(--ui-radio-size-sm);
      }

      .dot-sm {
        width: var(--ui-radio-dot-size-sm);
        height: var(--ui-radio-dot-size-sm);
      }

      /* Size: md */
      .circle-md {
        width: var(--ui-radio-size-md);
        height: var(--ui-radio-size-md);
      }

      .dot-md {
        width: var(--ui-radio-dot-size-md);
        height: var(--ui-radio-dot-size-md);
      }

      /* Size: lg */
      .circle-lg {
        width: var(--ui-radio-size-lg);
        height: var(--ui-radio-size-lg);
      }

      .dot-lg {
        width: var(--ui-radio-dot-size-lg);
        height: var(--ui-radio-dot-size-lg);
      }

      /* Focus ring */
      .radio-circle:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--ui-radio-ring);
      }

      /* Disabled */
      .radio-circle[aria-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Label */
      .radio-label {
        font-weight: 500;
        color: var(--ui-input-text, inherit);
        cursor: pointer;
      }

      .label-sm {
        font-size: var(--ui-radio-font-size-sm);
      }

      .label-md {
        font-size: var(--ui-radio-font-size-md);
      }

      .label-lg {
        font-size: var(--ui-radio-font-size-lg);
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .radio-dot,
        .radio-circle {
          transition-duration: 0ms;
        }
      }
    \`,
  ];

  /**
   * Handle click events on the radio wrapper.
   * Click handler is on the wrapper so clicking the label also triggers selection.
   * Radio does NOT toggle its own checked state -- it dispatches ui-radio-change
   * and the RadioGroup handles mutual exclusion.
   */
  private handleClick(): void {
    if (this.disabled) return;
    dispatchCustomEvent(this, 'ui-radio-change', {
      value: this.value,
    });
  }

  /**
   * Handle keyboard events for Space key only.
   * Per W3C APG radio spec, Space checks the focused radio.
   * Arrow keys are handled by the RadioGroup, not individual radios.
   * preventDefault stops page scroll on Space.
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === ' ') {
      e.preventDefault();
      this.handleClick();
    }
  }

  override render() {
    return html\`
      <div class="radio-wrapper" @click=\${this.handleClick}>
        <div
          role="radio"
          aria-checked=\${this.checked ? 'true' : 'false'}
          aria-disabled=\${this.disabled ? 'true' : nothing}
          aria-labelledby="\${this.radioId}-label"
          tabindex="-1"
          class="radio-circle circle-\${this.size}"
          @keydown=\${this.handleKeyDown}
        >
          <span class="radio-dot dot-\${this.size}"></span>
        </div>
        \${this.label
          ? html\`<label
              id="\${this.radioId}-label"
              class="radio-label label-\${this.size}"
              >\${this.label}</label
            >\`
          : html\`<label
              id="\${this.radioId}-label"
              class="radio-label label-\${this.size}"
              ><slot></slot
            ></label>\`}
      </div>
    \`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-radio': Radio;
  }
}
`;

/**
 * RadioGroup component template
 */
export const RADIO_GROUP_TEMPLATE = `/**
 * lui-radio-group - An accessible radio group with mutual exclusion and roving tabindex
 *
 * Features:
 * - role="radiogroup" with aria-labelledby for screen reader grouping
 * - Mutual exclusion: only one radio checked at a time
 * - Roving tabindex: single tab stop, arrow keys move focus AND selection with wrapping
 * - Form participation via ElementInternals (setFormValue, setValidity, formResetCallback)
 * - Required validation prevents form submission when nothing selected
 * - Disabled propagation to all child lui-radio elements
 * - Child discovery via slotchange event
 * - SSR compatible via isServer guards
 *
 * Keyboard navigation (W3C APG Radio Group pattern):
 * - Tab/Shift+Tab: Move into/out of group (single tab stop)
 * - ArrowDown/ArrowRight: Move focus and selection to next radio (wraps)
 * - ArrowUp/ArrowLeft: Move focus and selection to previous radio (wraps)
 * - Space: Selects the focused radio (handled by individual lui-radio)
 *
 * @example
 * \`\`\`html
 * <lui-radio-group name="color" label="Favorite color" required>
 *   <lui-radio value="red" label="Red"></lui-radio>
 *   <lui-radio value="green" label="Green"></lui-radio>
 *   <lui-radio value="blue" label="Blue"></lui-radio>
 * </lui-radio-group>
 * \`\`\`
 *
 * @example With initial value
 * \`\`\`html
 * <lui-radio-group name="size" value="md" label="Size">
 *   <lui-radio value="sm" label="Small"></lui-radio>
 *   <lui-radio value="md" label="Medium"></lui-radio>
 *   <lui-radio value="lg" label="Large"></lui-radio>
 * </lui-radio-group>
 * \`\`\`
 *
 * @slot default - Child lui-radio elements
 */

import { html, css, nothing, isServer, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';
import type { Radio } from './radio';

/**
 * Dispatch a custom event from an element.
 */
function dispatchCustomEvent(el: HTMLElement, name: string, detail?: unknown) {
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}

/**
 * An accessible radio group container with mutual exclusion, roving tabindex,
 * form participation via ElementInternals, and group-level validation.
 *
 * @slot default - Child lui-radio elements
 */
export class RadioGroup extends TailwindElement {
  /**
   * Enable form association for this custom element.
   * RadioGroup owns form participation (individual radios do not).
   */
  static formAssociated = true;

  /**
   * ElementInternals for form participation.
   * Null during SSR since attachInternals() is not available.
   */
  private internals: ElementInternals | null = null;

  /**
   * Unique ID for label association.
   */
  private groupId = \`lui-rg-\${Math.random().toString(36).substr(2, 9)}\`;

  /**
   * Discovered child radio elements.
   */
  private radios: Radio[] = [];

  /**
   * Stores the initial value for formResetCallback.
   */
  private defaultValue = '';

  /**
   * The name of the radio group for form submission.
   * @default ''
   */
  @property({ type: String })
  name = '';

  /**
   * The currently selected radio's value.
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Whether a selection is required for form validity.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  required = false;

  /**
   * Whether all child radios should be disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Label text displayed above the group.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * Custom error message for required validation.
   * @default ''
   */
  @property({ type: String })
  error = '';

  /**
   * Whether the user has interacted with the group.
   * Used for validation display timing.
   */
  @state()
  private touched = false;

  /**
   * Whether to show the validation error message.
   */
  @state()
  private showError = false;

  /**
   * Static styles for the radio group component.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css\`
      :host {
        display: block;
      }

      :host([disabled]) {
        opacity: 0.5;
      }

      .group-wrapper {
        display: flex;
        flex-direction: column;
      }

      .group-label {
        font-weight: 500;
        margin-bottom: 0.375rem;
        font-size: 0.875rem;
        color: var(--ui-input-text, inherit);
      }

      .group-items {
        display: flex;
        flex-direction: column;
        gap: var(--ui-radio-group-gap);
      }

      .error-text {
        font-size: 0.75rem;
        color: var(--ui-radio-text-error);
        margin-top: 0.25rem;
      }
    \`,
  ];

  constructor() {
    super();
    // Only attach internals on client (not during SSR)
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.value;
    this.updateFormValue();
  }

  /**
   * Sync child states and form value when properties change.
   * Uses PropertyValues type (not Map) to avoid api-extractor DTS rollup crash.
   */
  protected override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('value')) {
      this.syncChildStates();
      this.updateRovingTabindex();
      this.updateFormValue();
      this.validate();
    }

    if (changedProperties.has('disabled')) {
      this.syncDisabledState();
      this.updateRovingTabindex();
    }
  }

  /**
   * Handle slot changes to discover child radio elements.
   * Filters for LUI-RADIO elements and syncs state.
   */
  private handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true });
    this.radios = assigned.filter(
      (el) => el.tagName === 'LUI-RADIO'
    ) as Radio[];
    this.syncChildStates();
    this.syncDisabledState();
    this.updateRovingTabindex();
  }

  /**
   * Enforce mutual exclusion: only the radio matching group value is checked.
   */
  private syncChildStates(): void {
    for (const radio of this.radios) {
      radio.checked = radio.value === this.value;
    }
  }

  /**
   * Propagate disabled state to all child radios.
   * Called when disabled property changes or children are discovered.
   */
  private syncDisabledState(): void {
    if (this.disabled) {
      this.radios.forEach((r) => (r.disabled = true));
    }
  }

  /**
   * Manage roving tabindex: only the checked (or first enabled) radio gets tabindex 0.
   * All other radios get tabindex -1. This creates a single tab stop for the group.
   */
  private updateRovingTabindex(): void {
    const enabledRadios = this.radios.filter((r) => !r.disabled);
    if (enabledRadios.length === 0) return;

    const checkedRadio = enabledRadios.find((r) => r.checked);
    const focusTarget = checkedRadio || enabledRadios[0];

    for (const radio of this.radios) {
      // Set tabIndex on the HOST element (lui-radio), not inner shadow DOM
      radio.tabIndex = radio === focusTarget && !radio.disabled ? 0 : -1;
    }
  }

  /**
   * Handle arrow key navigation within the group.
   * Arrow keys move focus AND selection simultaneously with wrapping.
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const arrowKeys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];
    if (!arrowKeys.includes(e.key)) return;
    e.preventDefault();

    const enabledRadios = this.radios.filter((r) => !r.disabled);
    if (enabledRadios.length === 0) return;

    const currentIndex = enabledRadios.findIndex((r) => r.tabIndex === 0);
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    const nextIndex = forward
      ? (currentIndex + 1) % enabledRadios.length
      : (currentIndex - 1 + enabledRadios.length) % enabledRadios.length;

    // Arrow keys MOVE FOCUS AND SELECT simultaneously
    const nextRadio = enabledRadios[nextIndex];
    this.value = nextRadio.value;
    this.touched = true;
    this.syncChildStates();
    this.updateRovingTabindex();
    this.updateFormValue();
    this.validate();
    nextRadio.focus();

    dispatchCustomEvent(this, 'ui-change', {
      value: this.value,
    });
  }

  /**
   * Handle internal ui-radio-change events from child radios.
   * Stops propagation (internal event) and dispatches consumer-facing ui-change.
   */
  private handleRadioChange(e: CustomEvent): void {
    e.stopPropagation(); // Internal event, don't leak to consumer
    this.value = e.detail.value;
    this.touched = true;
    this.syncChildStates();
    this.updateRovingTabindex();
    this.updateFormValue();
    this.validate();

    // Dispatch consumer-facing event
    dispatchCustomEvent(this, 'ui-change', {
      value: this.value,
    });
  }

  /**
   * Sync the selected value to the form via ElementInternals.
   * Submits value when selected, null when nothing selected.
   */
  private updateFormValue(): void {
    this.internals?.setFormValue(this.value || null);
  }

  /**
   * Validate required constraint and sync validity to ElementInternals.
   * @returns true if valid, false if invalid
   */
  private validate(): boolean {
    if (!this.internals) return true;

    if (this.required && !this.value) {
      this.internals.setValidity(
        { valueMissing: true },
        this.error || 'Please select an option.',
        this.radios[0] ||
          (this.shadowRoot?.querySelector('.group-items') as HTMLElement)
      );
      this.showError = this.touched;
      return false;
    }

    this.internals.setValidity({});
    this.showError = false;
    return true;
  }

  /**
   * Form lifecycle callback: reset the group to initial value.
   */
  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncChildStates();
    this.updateRovingTabindex();
    this.updateFormValue();
    this.touched = false;
    this.showError = false;
    this.internals?.setValidity({});
  }

  /**
   * Form lifecycle callback: handle disabled state from fieldset or form.
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
    this.syncDisabledState();
    this.updateRovingTabindex();
  }

  override render() {
    return html\`
      <div
        class="group-wrapper"
        role="radiogroup"
        aria-labelledby="\${this.groupId}-label"
        aria-required=\${this.required ? 'true' : nothing}
        @ui-radio-change=\${this.handleRadioChange}
        @keydown=\${this.handleKeyDown}
      >
        \${this.label
          ? html\`<span id="\${this.groupId}-label" class="group-label"
              >\${this.label}</span
            >\`
          : nothing}
        <div class="group-items">
          <slot @slotchange=\${this.handleSlotChange}></slot>
        </div>
        \${this.showError
          ? html\`<div class="error-text" role="alert">
              \${this.error || 'Please select an option.'}
            </div>\`
          : nothing}
      </div>
    \`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-radio-group': RadioGroup;
  }
}
`;

/**
 * Tooltip delay group template
 */
export const TOOLTIP_DELAY_GROUP_TEMPLATE = `/**
 * Tooltip Delay Group - Module-level singleton for coordinating tooltip delays.
 *
 * When moving between adjacent tooltips, the delay group allows the second
 * tooltip to skip its show delay if the first tooltip closed recently
 * (within the group window, default 300ms). This creates a smooth "hover
 * through" experience similar to native menu bars.
 *
 * Also tracks the currently-active tooltip instance to force-close it
 * when a new tooltip opens, preventing visual overlap.
 */

/**
 * Interface that tooltip instances must implement to participate
 * in the delay group's active instance tracking.
 */
export interface TooltipInstance {
  hide(): void;
}

class TooltipDelayGroup {
  /** Timestamp of the last tooltip close event */
  private lastCloseTimestamp = 0;

  /** Currently-open tooltip instance (for force-close on new open) */
  private activeInstance: TooltipInstance | null = null;

  /** Time window in ms for skip-delay behavior */
  private windowMs = 300;

  /** Record that a tooltip just closed */
  notifyClosed(): void {
    this.lastCloseTimestamp = Date.now();
    this.activeInstance = null;
  }

  /** Check if we're within the delay group window */
  isInGroupWindow(): boolean {
    return Date.now() - this.lastCloseTimestamp < this.windowMs;
  }

  /** Set the currently-active tooltip, force-closing the previous one if different */
  setActive(instance: TooltipInstance): void {
    if (this.activeInstance && this.activeInstance !== instance) {
      this.activeInstance.hide();
    }
    this.activeInstance = instance;
  }

  /** Clear active instance if it matches the given instance */
  clearActive(instance: TooltipInstance): void {
    if (this.activeInstance === instance) {
      this.activeInstance = null;
    }
  }
}

/** Singleton shared across all tooltip instances on the page */
export const delayGroup = new TooltipDelayGroup();
`;

/**
 * Tooltip component template
 */
export const TOOLTIP_TEMPLATE = `/**
 * lui-tooltip - An accessible tooltip component
 *
 * Features:
 * - Hover trigger with configurable show delay
 * - Keyboard focus trigger with same delay behavior
 * - Escape key dismissal
 * - 12 Floating UI placement options with collision avoidance
 * - Optional arrow indicator positioned by Floating UI
 * - aria-describedby linking trigger to tooltip content
 * - Non-interactive content only (role="tooltip")
 * - Auto-repositioning on scroll/resize via autoUpdate
 * - Delay group for skip-delay when moving between tooltips
 * - Rich variant with title + description
 * - Hide delay cursor bridge for gap traversal
 * - Touch device filtering via pointerType
 * - Reduced motion support via prefers-reduced-motion
 * - SSR safety with isServer guard
 * - AbortController cleanup in disconnectedCallback
 * - CSS custom properties (--ui-tooltip-*) for theming
 *
 * @slot - Default slot for trigger element
 * @slot content - Named slot for rich tooltip content (overrides content property)
 * @slot title - Named slot for rich tooltip title (overrides tooltip-title property)
 *
 * @csspart trigger - The trigger wrapper
 * @csspart tooltip - The tooltip panel
 * @csspart content - The tooltip content container
 * @csspart arrow - The arrow indicator
 *
 * @example Basic usage
 * \`\`\`html
 * <lui-tooltip content="Save document">
 *   <button>Save</button>
 * </lui-tooltip>
 * \`\`\`
 *
 * @example Rich tooltip
 * \`\`\`html
 * <lui-tooltip rich tooltip-title="Keyboard Shortcut" content="Ctrl+S to save" placement="bottom">
 *   <button>Save</button>
 * </lui-tooltip>
 * \`\`\`
 */

import { html, css, nothing } from 'lit';
import { isServer } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';
import {
  computePosition as _computePosition,
  autoUpdate as _autoUpdate,
  platform,
  flip,
  shift,
  offset,
  arrow,
  type Placement,
  type ComputePositionConfig,
  type ComputePositionReturn,
  type AutoUpdateOptions,
} from '@floating-ui/dom';
import { offsetParent } from 'composed-offset-position';
import { delayGroup, type TooltipInstance } from './delay-group';

export type { Placement };

// Shadow DOM-safe platform configuration
const shadowDomPlatform = {
  ...platform,
  getOffsetParent: (element: Element) =>
    platform.getOffsetParent(element, offsetParent),
};

function computePosition(
  reference: Element,
  floating: HTMLElement,
  config?: Partial<ComputePositionConfig>
): Promise<ComputePositionReturn> {
  return _computePosition(reference, floating, {
    ...config,
    platform: shadowDomPlatform,
  });
}

function autoUpdatePosition(
  reference: Element,
  floating: HTMLElement,
  update: () => void,
  options?: AutoUpdateOptions
): () => void {
  return _autoUpdate(reference, floating, update, options);
}

@customElement('lui-tooltip')
export class Tooltip extends TailwindElement implements TooltipInstance {
  // ---------------------------------------------------------------------------
  // Public properties
  // ---------------------------------------------------------------------------

  /** Text content for the tooltip. Alternative to the content slot. */
  @property({ type: String })
  content = '';

  /** Preferred placement relative to trigger. Floating UI may flip if space is insufficient. */
  @property({ type: String })
  placement: Placement = 'top';

  /** Delay in ms before showing tooltip on hover */
  @property({ type: Number, attribute: 'show-delay' })
  showDelay = 300;

  /** Delay in ms before hiding tooltip after pointer leaves */
  @property({ type: Number, attribute: 'hide-delay' })
  hideDelay = 100;

  /** Whether to show an arrow pointing at the trigger */
  @property({ type: Boolean })
  arrow = true;

  /** Offset distance from trigger in pixels */
  @property({ type: Number })
  offset = 8;

  /** Whether this is a rich tooltip with title + description */
  @property({ type: Boolean })
  rich = false;

  /** Title text for rich tooltip variant */
  @property({ type: String, attribute: 'tooltip-title' })
  tooltipTitle = '';

  /** Disable tooltip display */
  @property({ type: Boolean })
  disabled = false;

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  @state()
  private open = false;

  private triggerEl: HTMLElement | null = null;
  private showTimeout?: ReturnType<typeof setTimeout>;
  private hideTimeout?: ReturnType<typeof setTimeout>;
  private cleanupAutoUpdate?: () => void;
  private abortController?: AbortController;

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  static override styles = [
    ...tailwindBaseStyles,
    css\`
      :host {
        display: inline-block;
        position: relative;
      }

      .tooltip-panel {
        position: fixed;
        z-index: var(--ui-tooltip-z-index);
        pointer-events: auto;
        max-width: var(--ui-tooltip-max-width);
        width: max-content;

        /* Animation: fade only */
        opacity: 0;
        transition:
          opacity 100ms ease-out,
          display 100ms allow-discrete,
          overlay 100ms allow-discrete;
      }

      .tooltip-panel[data-open] {
        opacity: 1;
      }

      @starting-style {
        .tooltip-panel[data-open] {
          opacity: 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .tooltip-panel {
          transition: none;
        }
      }

      .tooltip-content {
        background: var(--ui-tooltip-bg);
        color: var(--ui-tooltip-text);
        border-radius: var(--ui-tooltip-radius);
        padding: var(--ui-tooltip-padding-y) var(--ui-tooltip-padding-x);
        font-size: var(--ui-tooltip-font-size);
        box-shadow: var(--ui-tooltip-shadow);
        line-height: 1.4;
      }

      /* Rich tooltip variant */
      :host([rich]) .tooltip-content {
        padding: 0.75rem 1rem;
      }

      .tooltip-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .tooltip-description {
        opacity: 0.9;
      }

      /* Arrow */
      .tooltip-arrow {
        position: absolute;
        width: var(--ui-tooltip-arrow-size);
        height: var(--ui-tooltip-arrow-size);
        background: var(--ui-tooltip-bg);
        transform: rotate(45deg);
      }
    \`,
  ];

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    if (isServer) return;

    this.abortController = new AbortController();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.abortController?.abort();
    this.cleanupAutoUpdate?.();
    clearTimeout(this.showTimeout);
    clearTimeout(this.hideTimeout);

    if (this.open) {
      this.open = false;
      if (this.triggerEl) {
        this.triggerEl.removeAttribute('aria-describedby');
      }
      delayGroup.clearActive(this);
      delayGroup.notifyClosed();
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  override render() {
    return html\`
      <div class="tooltip-trigger" part="trigger">
        <slot
          @slotchange=\${this.handleSlotChange}
          @pointerenter=\${this.handlePointerEnter}
          @pointerleave=\${this.handlePointerLeave}
          @focusin=\${this.handleFocusIn}
          @focusout=\${this.handleFocusOut}
          @keydown=\${this.handleKeyDown}
        ></slot>
      </div>
      \${this.open && !isServer
        ? html\`
            <div
              id="tooltip"
              role="tooltip"
              part="tooltip"
              class="tooltip-panel"
              data-open
              @pointerenter=\${this.handleTooltipPointerEnter}
              @pointerleave=\${this.handleTooltipPointerLeave}
            >
              <div class="tooltip-content" part="content">
                \${this.rich
                  ? html\`
                      <div class="tooltip-title">
                        \${this.tooltipTitle}
                        <slot name="title"></slot>
                      </div>
                      <div class="tooltip-description">
                        \${this.content}
                        <slot name="content"></slot>
                      </div>
                    \`
                  : html\`
                      \${this.content}
                      <slot name="content"></slot>
                    \`}
              </div>
              \${this.arrow
                ? html\`<div class="tooltip-arrow" part="arrow"></div>\`
                : nothing}
            </div>
          \`
        : nothing}
    \`;
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  private handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true });
    const trigger = assigned[0] as HTMLElement | undefined;

    if (trigger) {
      this.triggerEl = trigger;
    }
  }

  private handlePointerEnter = (e: PointerEvent): void => {
    // Skip touch -- tooltips are hover-only
    if (e.pointerType === 'touch') return;
    if (this.disabled) return;
    this.scheduleShow();
  };

  private handlePointerLeave = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    this.scheduleHide();
  };

  private handleFocusIn = (): void => {
    if (this.disabled) return;
    this.scheduleShow();
  };

  private handleFocusOut = (): void => {
    this.scheduleHide();
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.open) {
      e.preventDefault();
      this.hide();
      delayGroup.notifyClosed();
    }
  };

  private handleTooltipPointerEnter = (): void => {
    clearTimeout(this.hideTimeout);
  };

  private handleTooltipPointerLeave = (): void => {
    this.scheduleHide();
  };

  // ---------------------------------------------------------------------------
  // Show/hide state machine
  // ---------------------------------------------------------------------------

  private scheduleShow(): void {
    clearTimeout(this.hideTimeout);
    if (this.open) return;

    const delay = delayGroup.isInGroupWindow() ? 0 : this.showDelay;
    this.showTimeout = setTimeout(() => this.show(), delay);
  }

  private scheduleHide(): void {
    clearTimeout(this.showTimeout);
    if (!this.open) return;

    this.hideTimeout = setTimeout(() => {
      this.hide();
      delayGroup.notifyClosed();
    }, this.hideDelay);
  }

  private show(): void {
    this.open = true;

    // Set aria-describedby when tooltip becomes visible
    if (this.triggerEl) {
      this.triggerEl.setAttribute('aria-describedby', 'tooltip');
    }

    // Track in delay group for force-close behavior
    delayGroup.setActive(this);

    // Position after render
    this.updateComplete.then(() => {
      this.updatePosition();
      this.startAutoUpdate();
    });
  }

  hide(): void {
    this.open = false;

    // Remove aria-describedby when tooltip hides
    if (this.triggerEl) {
      this.triggerEl.removeAttribute('aria-describedby');
    }

    // Stop auto-update (no need to reposition when invisible)
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;

    // Clear from delay group
    delayGroup.clearActive(this);

    // Clear pending timeouts
    clearTimeout(this.showTimeout);
    clearTimeout(this.hideTimeout);
  }

  // ---------------------------------------------------------------------------
  // Positioning
  // ---------------------------------------------------------------------------

  private async updatePosition(): Promise<void> {
    const tooltipEl = this.renderRoot.querySelector<HTMLElement>('#tooltip');
    const arrowEl = this.renderRoot.querySelector<HTMLElement>('.tooltip-arrow');

    if (!this.triggerEl || !tooltipEl) return;

    const middleware = [
      offset(this.offset),
      flip(),
      shift({ padding: 8 }),
    ];

    if (this.arrow && arrowEl) {
      middleware.push(arrow({ element: arrowEl, padding: 4 }));
    }

    const { x, y, placement: resolvedPlacement, middlewareData } =
      await computePosition(this.triggerEl, tooltipEl, {
        placement: this.placement,
        strategy: 'fixed',
        middleware,
      });

    Object.assign(tooltipEl.style, {
      left: \`\${x}px\`,
      top: \`\${y}px\`,
    });

    // Position arrow based on resolved placement
    if (this.arrow && middlewareData.arrow && arrowEl) {
      const { x: ax, y: ay } = middlewareData.arrow;
      const side = resolvedPlacement.split('-')[0];
      const staticSide: Record<string, string> = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
      };

      Object.assign(arrowEl.style, {
        left: ax != null ? \`\${ax}px\` : '',
        top: ay != null ? \`\${ay}px\` : '',
        [staticSide[side]!]: '-4px',
      });
    }
  }

  private startAutoUpdate(): void {
    const tooltipEl = this.renderRoot.querySelector<HTMLElement>('#tooltip');

    if (!this.triggerEl || !tooltipEl) return;

    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = autoUpdatePosition(
      this.triggerEl,
      tooltipEl,
      () => this.updatePosition()
    );
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-tooltip': Tooltip;
  }
}
`;

/**
 * Popover component template
 */
export const POPOVER_TEMPLATE = `/**
 * lui-popover - An accessible popover component
 *
 * Features:
 * - Click-to-toggle trigger interaction (POP-01)
 * - Escape key dismissal (POP-02)
 * - Light dismiss via Popover API auto mode (POP-03)
 * - Floating UI positioning with 12 placements and collision avoidance (POP-04)
 * - Optional arrow indicator tracking placement flips (POP-05)
 * - Focus management: moves into popover on open, restores on close (POP-06)
 * - Modal mode with focus trapping (POP-07)
 * - Controlled and uncontrolled modes (POP-08)
 * - Nested popover support (POP-09)
 * - ARIA attributes: aria-expanded, aria-haspopup, role=dialog (POP-10)
 * - Native Popover API with position:fixed fallback (POP-11)
 * - Trigger width matching via size middleware (POP-12)
 * - Auto-update positioning on scroll/resize (POP-13)
 * - Reduced motion support (POP-14)
 * - SSR safe rendering (POP-15)
 * - AbortController cleanup on disconnect (POP-16)
 * - CSS custom properties for theming (POP-17)
 */

import { html, css, nothing, type PropertyValues } from 'lit';
import { isServer } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';
import {
  computePosition as _computePosition,
  autoUpdate as _autoUpdate,
  platform,
  flip,
  shift,
  offset,
  arrow,
  size,
  type Placement,
  type ComputePositionConfig,
  type ComputePositionReturn,
  type AutoUpdateOptions,
} from '@floating-ui/dom';
import { offsetParent } from 'composed-offset-position';

export type { Placement };

// Shadow DOM-safe platform configuration
const shadowDomPlatform = {
  ...platform,
  getOffsetParent: (element: Element) =>
    platform.getOffsetParent(element, offsetParent),
};

function computePosition(
  reference: Element,
  floating: HTMLElement,
  config?: Partial<ComputePositionConfig>
): Promise<ComputePositionReturn> {
  return _computePosition(reference, floating, {
    ...config,
    platform: shadowDomPlatform,
  });
}

function autoUpdatePosition(
  reference: Element,
  floating: HTMLElement,
  update: () => void,
  options?: AutoUpdateOptions
): () => void {
  return _autoUpdate(reference, floating, update, options);
}

/** Whether the native Popover API is supported */
const supportsPopoverApi =
  !isServer && typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;

/** Counter for generating unique IDs */
let idCounter = 0;

@customElement('lui-popover')
export class Popover extends TailwindElement {
  // --- Public properties ---

  @property({ type: String })
  placement: Placement = 'bottom';

  @property({ type: Boolean, reflect: true })
  get open(): boolean {
    return this._internalOpen;
  }
  set open(value: boolean) {
    const old = this._internalOpen;
    this._controlled = true;
    this._internalOpen = value;
    this.requestUpdate('open', old);
  }

  @property({ type: Boolean })
  arrow = false;

  @property({ type: Boolean })
  modal = false;

  @property({ type: Number })
  offset = 8;

  @property({ type: Boolean, attribute: 'match-trigger-width' })
  matchTriggerWidth = false;

  @property({ type: Boolean })
  disabled = false;

  // --- Internal state ---

  @state()
  private _internalOpen = false;

  @state()
  private _currentPlacement: Placement = 'bottom';

  private _controlled = false;
  private _uniqueId = \\\`lui-popover-\\\${++idCounter}\\\`;
  private _panelId = \\\`\\\${this._uniqueId}-panel\\\`;
  private triggerEl: HTMLElement | null = null;
  private cleanupAutoUpdate?: () => void;
  private abortController?: AbortController;

  static override styles = [
    ...tailwindBaseStyles,
    css\\\`
      :host {
        display: inline-block;
        position: relative;
      }

      .popover-panel {
        position: fixed;
        z-index: var(--ui-popover-z-index);
        pointer-events: auto;
        max-width: var(--ui-popover-max-width);
        width: max-content;
        opacity: 0;
        transform: scale(0.95);
        transition:
          opacity 150ms ease-out,
          transform 150ms ease-out,
          display 150ms allow-discrete,
          overlay 150ms allow-discrete;
      }

      /* Override UA popover styles so Floating UI coordinates work */
      .popover-panel[popover] {
        margin: 0;
        position: fixed;
        border: none;
        padding: 0;
        overflow: visible;
        background: transparent;
        color: inherit;
      }

      .popover-panel[data-open] {
        opacity: 1;
        transform: scale(1);
      }

      .popover-panel:popover-open {
        opacity: 1;
        transform: scale(1);
      }

      @starting-style {
        .popover-panel[data-open] {
          opacity: 0;
          transform: scale(0.95);
        }
        .popover-panel:popover-open {
          opacity: 0;
          transform: scale(0.95);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .popover-panel {
          transition: none;
        }
      }

      .popover-content {
        background: var(--ui-popover-bg);
        color: var(--ui-popover-text);
        border: 1px solid var(--ui-popover-border);
        border-radius: var(--ui-popover-radius);
        padding: var(--ui-popover-padding);
        box-shadow: var(--ui-popover-shadow);
      }

      .popover-arrow {
        position: absolute;
        width: var(--ui-popover-arrow-size);
        height: var(--ui-popover-arrow-size);
        background: var(--ui-popover-bg);
        border: 1px solid var(--ui-popover-border);
        transform: rotate(45deg);
        z-index: -1;
      }

      .focus-sentinel {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    \\\`,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    if (isServer) return;

    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // Listen for parent popover close events (POP-09)
    this.addEventListener(
      'popover-close-children',
      this.handleParentClose as EventListener,
      { signal }
    );

    // Fallback: document click for light dismiss when Popover API unavailable
    if (!supportsPopoverApi) {
      document.addEventListener('click', this.handleDocumentClick, { signal });
      document.addEventListener('keydown', this.handleDocumentKeydown, { signal });
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.abortController?.abort();
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;

    if (this._internalOpen) {
      this._internalOpen = false;
    }
  }

  override render() {
    return html\\\`
      <div
        class="popover-trigger"
        part="trigger"
        aria-haspopup="dialog"
        aria-expanded="\\\${this._internalOpen}"
        aria-controls="\\\${this._panelId}"
      >
        <slot
          @slotchange=\\\${this.handleSlotChange}
          @click=\\\${this.handleTriggerClick}
          @keydown=\\\${this.handleTriggerKeydown}
        ></slot>
      </div>
      \\\${this._internalOpen && !isServer
        ? html\\\`
            <div
              id="\\\${this._panelId}"
              role="dialog"
              part="popover"
              class="popover-panel"
              data-open
              \\\${supportsPopoverApi ? html\\\`\\\` : nothing}
              aria-modal="\\\${this.modal ? 'true' : 'false'}"
              @toggle=\\\${this.handlePopoverToggle}
            >
              \\\${this.modal
                ? html\\\`<div
                    class="focus-sentinel"
                    tabindex="0"
                    @focus=\\\${this.handleSentinelStartFocus}
                  ></div>\\\`
                : nothing}
              <div class="popover-content" part="content">
                <slot name="content"></slot>
              </div>
              \\\${this.arrow
                ? html\\\`<div class="popover-arrow" part="arrow"></div>\\\`
                : nothing}
              \\\${this.modal
                ? html\\\`<div
                    class="focus-sentinel"
                    tabindex="0"
                    @focus=\\\${this.handleSentinelEndFocus}
                  ></div>\\\`
                : nothing}
            </div>
          \\\`
        : nothing}
    \\\`;
  }

  override async updated(changedProps: PropertyValues): Promise<void> {
    super.updated(changedProps);

    if (changedProps.has('_internalOpen') || changedProps.has('open')) {
      if (this._internalOpen) {
        await this.updateComplete;
        this.setupPanel();
        this.updatePosition();
        this.startAutoUpdate();
        this.moveFocusToContent();
      } else {
        this.cleanupAutoUpdate?.();
        this.cleanupAutoUpdate = undefined;
        this.restoreFocusToTrigger();
      }
    }
  }

  // --- Event handlers ---

  private handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true });
    const trigger = assigned[0] as HTMLElement | undefined;
    if (trigger) {
      this.triggerEl = trigger;
    }
  }

  private handleTriggerClick = (e: MouseEvent): void => {
    if (this.disabled) return;
    // Prevent click from immediately triggering the document click handler
    e.stopPropagation();
    this.toggle();
  };

  private handleTriggerKeydown = (e: KeyboardEvent): void => {
    if (this.disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggle();
    }
  };

  private handlePopoverToggle = (e: Event): void => {
    // Native Popover API toggle event (handles Escape and light dismiss)
    const toggleEvent = e as ToggleEvent;
    if (toggleEvent.newState === 'closed') {
      this.handleClose();
    }
  };

  private handleDocumentClick = (e: MouseEvent): void => {
    // Fallback light dismiss for non-Popover API browsers
    if (!this._internalOpen) return;
    if (e.composedPath().includes(this)) return;
    this.handleClose();
  };

  private handleDocumentKeydown = (e: KeyboardEvent): void => {
    // Fallback Escape handling for non-Popover API browsers
    if (e.key === 'Escape' && this._internalOpen) {
      e.preventDefault();
      this.handleClose();
    }
  };

  private handleParentClose = (): void => {
    // Close this popover when a parent popover closes (POP-09)
    if (this._internalOpen) {
      this.handleClose();
    }
  };

  private handleSentinelStartFocus = (): void => {
    // Focus trap: wrap to last focusable element
    const focusable = this.getFocusableElements();
    if (focusable.length > 0) {
      focusable[focusable.length - 1]!.focus();
    }
  };

  private handleSentinelEndFocus = (): void => {
    // Focus trap: wrap to first focusable element
    const focusable = this.getFocusableElements();
    if (focusable.length > 0) {
      focusable[0]!.focus();
    }
  };

  // --- Core behavior ---

  private toggle(): void {
    if (this._internalOpen) {
      this.handleClose();
    } else {
      this.handleOpen();
    }
  }

  private handleOpen(): void {
    if (this._controlled) {
      this.dispatchEvent(
        new CustomEvent('open-changed', {
          detail: { open: true },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }
    this._internalOpen = true;
  }

  private handleClose(): void {
    // Dispatch close event to nested child popovers (POP-09)
    this.dispatchEvent(
      new CustomEvent('popover-close-children', {
        bubbles: true,
        composed: true,
      })
    );

    if (this._controlled) {
      this.dispatchEvent(
        new CustomEvent('open-changed', {
          detail: { open: false },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }
    this._internalOpen = false;
  }

  /**
   * Setup the native popover panel after it renders.
   * Must call showPopover() imperatively since shadow DOM
   * doesn't support declarative popovertarget reliably.
   */
  private setupPanel(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>(\\\`#\\\${this._panelId}\\\`);
    if (!panel) return;

    if (supportsPopoverApi) {
      // Set popover attribute and show via API
      if (!panel.hasAttribute('popover')) {
        panel.setAttribute('popover', 'auto');
      }
      try {
        panel.showPopover();
      } catch {
        // Panel may already be showing or popover attribute not yet applied
      }
    }
  }

  private async updatePosition(): Promise<void> {
    const panel = this.renderRoot.querySelector<HTMLElement>(\\\`#\\\${this._panelId}\\\`);
    const arrowEl = this.renderRoot.querySelector<HTMLElement>('.popover-arrow');
    if (!this.triggerEl || !panel) return;

    const middleware = [
      offset(this.offset),
      flip(),
      shift({ padding: 8 }),
    ];

    if (this.arrow && arrowEl) {
      middleware.push(arrow({ element: arrowEl, padding: 4 }));
    }

    if (this.matchTriggerWidth) {
      middleware.push(
        size({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              width: \\\`\\\${rects.reference.width}px\\\`,
            });
          },
        })
      );
    }

    const { x, y, placement: resolvedPlacement, middlewareData } =
      await computePosition(this.triggerEl, panel, {
        placement: this.placement,
        strategy: 'fixed',
        middleware,
      });

    this._currentPlacement = resolvedPlacement;

    Object.assign(panel.style, {
      left: \\\`\\\${x}px\\\`,
      top: \\\`\\\${y}px\\\`,
    });

    if (this.arrow && middlewareData.arrow && arrowEl) {
      const { x: ax, y: ay } = middlewareData.arrow;
      const side = resolvedPlacement.split('-')[0];
      const staticSide: Record<string, string> = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
      };

      Object.assign(arrowEl.style, {
        left: ax != null ? \\\`\\\${ax}px\\\` : '',
        top: ay != null ? \\\`\\\${ay}px\\\` : '',
        [staticSide[side!]!]: '-4px',
      });
    }
  }

  private startAutoUpdate(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>(\\\`#\\\${this._panelId}\\\`);
    if (!this.triggerEl || !panel) return;
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = autoUpdatePosition(
      this.triggerEl,
      panel,
      () => this.updatePosition()
    );
  }

  // --- Focus management ---

  private moveFocusToContent(): void {
    // Delay to ensure DOM is fully settled after render + popover show
    requestAnimationFrame(() => {
      const panel = this.renderRoot.querySelector<HTMLElement>(\\\`#\\\${this._panelId}\\\`);
      if (!panel) return;

      const focusable = this.getFocusableElements();
      if (focusable.length > 0) {
        focusable[0]!.focus();
      } else {
        // Focus the panel itself if no focusable children
        panel.setAttribute('tabindex', '-1');
        panel.focus();
      }

      // For non-modal: close on focus leaving the popover
      if (!this.modal) {
        panel.addEventListener('focusout', this.handleFocusOut, {
          signal: this.abortController?.signal,
        });
      }
    });
  }

  private handleFocusOut = (e: FocusEvent): void => {
    if (!this._internalOpen || this.modal) return;
    const relatedTarget = e.relatedTarget as Node | null;
    if (!relatedTarget) return;

    // Check if focus is moving outside the popover host
    const path = e.composedPath();
    if (!path.includes(this)) {
      // Defer close to allow click events to complete first
      requestAnimationFrame(() => {
        if (this._internalOpen) {
          this.handleClose();
        }
      });
    }
  };

  private restoreFocusToTrigger(): void {
    if (this.triggerEl) {
      this.triggerEl.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const panel = this.renderRoot.querySelector<HTMLElement>(\\\`#\\\${this._panelId}\\\`);
    if (!panel) return [];

    // Get focusable elements from the content slot
    const contentSlot = panel.querySelector<HTMLSlotElement>('slot[name="content"]');
    if (!contentSlot) return [];

    const assigned = contentSlot.assignedElements({ flatten: true });
    const focusable: HTMLElement[] = [];

    for (const el of assigned) {
      // Check the element itself
      if (this.isFocusable(el as HTMLElement)) {
        focusable.push(el as HTMLElement);
      }
      // Check children
      const children = (el as HTMLElement).querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      for (const child of children) {
        focusable.push(child as HTMLElement);
      }
    }

    return focusable;
  }

  private isFocusable(el: HTMLElement): boolean {
    if (el.hasAttribute('disabled')) return false;
    const tabindex = el.getAttribute('tabindex');
    if (tabindex !== null && tabindex !== '-1') return true;
    const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    return focusableTags.includes(el.tagName);
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-popover': Popover;
  }
}
`;

/**
 * Toast types template
 */
export const TOAST_TYPES_TEMPLATE = `export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  variant?: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;        // ms, default 5000, 0 = persistent
  dismissible?: boolean;    // default true, show close X
  action?: ToastAction;
  position?: ToastPosition; // only used if toaster not already configured
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

export interface ToastData extends Required<Pick<ToastOptions, 'id' | 'variant' | 'dismissible'>> {
  title?: string;
  description?: string;
  duration: number;
  action?: ToastAction;
  position: ToastPosition;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  createdAt: number;
  // Promise toast support
  promiseState?: 'loading' | 'success' | 'error';
  promiseMessages?: { loading: string; success: string | ((data: unknown) => string); error: string | ((err: unknown) => string) };
}

export type Subscriber = () => void;
`;

/**
 * Toast icons template
 */
export const TOAST_ICONS_TEMPLATE = `import { html, nothing, type TemplateResult } from 'lit';
import type { ToastVariant } from './types.js';

/**
 * Inline SVG icon templates for toast variants.
 * Each SVG is 20x20, stroke-based, using currentColor.
 * The containing element sets color via CSS custom properties.
 */
export const toastIcons: Record<ToastVariant, TemplateResult | typeof nothing> = {
  default: nothing,

  success: html\`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true" class="toast-icon">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  \`,

  error: html\`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true" class="toast-icon">
      <circle cx="12" cy="12" r="10"/>
      <path d="m15 9-6 6"/>
      <path d="m9 9 6 6"/>
    </svg>
  \`,

  warning: html\`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true" class="toast-icon">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  \`,

  info: html\`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true" class="toast-icon">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  \`,

  loading: html\`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true" class="toast-icon toast-icon-loading">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  \`,
};
`;

/**
 * Toast state template
 */
export const TOAST_STATE_TEMPLATE = `import type { ToastData, Subscriber } from './types.js';

/**
 * Singleton state manager for toast notifications.
 * Connects the imperative toast() API to the <lui-toaster> web component
 * via the observer pattern (subscribe/notify).
 */
class ToastState {
  private _toasts: ToastData[] = [];
  private _subscribers = new Set<Subscriber>();

  get toasts(): readonly ToastData[] {
    return this._toasts;
  }

  subscribe(fn: Subscriber): () => void {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  }

  private _notify(): void {
    this._subscribers.forEach(fn => fn());
  }

  add(toast: ToastData): void {
    this._toasts = [toast, ...this._toasts];
    this._notify();
  }

  dismiss(id: string): void {
    const toast = this._toasts.find(t => t.id === id);
    this._toasts = this._toasts.filter(t => t.id !== id);
    toast?.onDismiss?.();
    this._notify();
  }

  dismissAll(): void {
    this._toasts.forEach(t => t.onDismiss?.());
    this._toasts = [];
    this._notify();
  }

  update(id: string, updates: Partial<ToastData>): void {
    this._toasts = this._toasts.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    this._notify();
  }
}

export const toastState = new ToastState();
`;

/**
 * Toast API template
 */
export const TOAST_API_TEMPLATE = `import { toastState } from './state.js';
import type { ToastData, ToastOptions } from './types.js';

let idCounter = 0;

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return \\\`toast-\\\${++idCounter}\\\`;
}

function ensureToaster(): void {
  if (typeof document === 'undefined') return;
  if (!document.querySelector('lui-toaster')) {
    const el = document.createElement('lui-toaster');
    document.body.appendChild(el);
  }
}

/**
 * Imperative toast API.
 *
 * @example
 * \\\`\\\`\\\`ts
 * import { toast } from './api.js';
 * toast('Hello world');
 * toast.success('Saved!');
 * toast.error('Something went wrong');
 * toast.promise(fetchData(), { loading: 'Loading...', success: 'Done!', error: 'Failed' });
 * \\\`\\\`\\\`
 */
export function toast(
  messageOrOptions: string | ToastOptions,
  options?: ToastOptions,
): string {
  // SSR guard
  if (typeof document === 'undefined') return '';

  const opts: ToastOptions = typeof messageOrOptions === 'string'
    ? { ...options, title: messageOrOptions }
    : messageOrOptions;

  const id = opts.id ?? generateId();

  const data: ToastData = {
    id,
    variant: opts.variant ?? 'default',
    title: opts.title,
    description: opts.description,
    duration: opts.duration ?? 5000,
    dismissible: opts.dismissible ?? true,
    action: opts.action,
    position: opts.position ?? 'bottom-right',
    onDismiss: opts.onDismiss,
    onAutoClose: opts.onAutoClose,
    createdAt: Date.now(),
  };

  ensureToaster();
  toastState.add(data);
  return id;
}

toast.success = (message: string, opts?: ToastOptions): string =>
  toast(message, { ...opts, variant: 'success' });

toast.error = (message: string, opts?: ToastOptions): string =>
  toast(message, { ...opts, variant: 'error' });

toast.warning = (message: string, opts?: ToastOptions): string =>
  toast(message, { ...opts, variant: 'warning' });

toast.info = (message: string, opts?: ToastOptions): string =>
  toast(message, { ...opts, variant: 'info' });

toast.dismiss = (id: string): void => toastState.dismiss(id);

toast.dismissAll = (): void => toastState.dismissAll();

toast.promise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: unknown) => string);
  },
  opts?: ToastOptions,
): Promise<T> => {
  const id = toast(messages.loading, { ...opts, variant: 'loading', duration: 0 });
  promise.then(
    (data) => toastState.update(id, {
      variant: 'success',
      title: typeof messages.success === 'function' ? messages.success(data) : messages.success,
      promiseState: 'success',
      duration: opts?.duration ?? 5000,
      createdAt: Date.now(),
    }),
    (err) => toastState.update(id, {
      variant: 'error',
      title: typeof messages.error === 'function' ? messages.error(err) : messages.error,
      promiseState: 'error',
      duration: opts?.duration ?? 5000,
      createdAt: Date.now(),
    }),
  );
  return promise;
};
`;

/**
 * Toast element template (lui-toast)
 */
export const TOAST_ELEMENT_TEMPLATE = `/**
 * lui-toast - An individual toast notification element
 *
 * Features:
 * - Auto-dismiss timer with pause on hover/focus
 * - Swipe-to-dismiss via Pointer Events with velocity threshold
 * - Close button for manual dismiss
 * - Action button with callback
 * - Accessible: role=status/alert based on variant
 * - Title + description text support
 * - Custom content via slot
 * - CSS custom properties for theming
 * - Reduced motion support
 * - AbortController cleanup
 *
 * @slot - Default slot for custom content
 * @fires toast-close - When toast should be removed (detail: { id, reason })
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { toastIcons } from './icons.js';
import type { ToastAction, ToastVariant, ToastPosition } from './types.js';

@customElement('lui-toast')
export class Toast extends LitElement {
  // ---------------------------------------------------------------------------
  // Public properties
  // ---------------------------------------------------------------------------

  @property({ type: String, attribute: 'toast-id' })
  toastId = '';

  @property({ type: String, reflect: true })
  variant: ToastVariant = 'default';

  @property({ type: String, attribute: 'toast-title' })
  toastTitle?: string;

  @property({ type: String })
  description?: string;

  @property({ type: Number })
  duration = 5000;

  @property({ type: Boolean })
  dismissible = true;

  /** Set via property only (not attribute) */
  @property({ attribute: false })
  action?: ToastAction;

  @property({ type: String })
  position: ToastPosition = 'bottom-right';

  /** Callback when auto-close fires */
  @property({ attribute: false })
  onAutoClose?: () => void;

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  private _remaining = 0;
  private _startTime = 0;
  private _timerId: ReturnType<typeof setTimeout> | null = null;
  private _paused = false;
  private _swiping = false;
  private _swipeX = 0;
  private _swipeStartX = 0;
  private _swipeStartTime = 0;
  private _abortController?: AbortController;

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  static override styles = [
    css\`
      :host {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: var(--ui-toast-padding, 0.875rem 1rem);
        background: var(--ui-toast-bg, #fff);
        color: var(--ui-toast-text, #1a1a1a);
        border: 1px solid var(--ui-toast-border, #e5e5e5);
        border-radius: var(--ui-toast-radius, 0.5rem);
        box-shadow: var(--ui-toast-shadow, 0 4px 12px rgba(0,0,0,0.1));
        max-width: var(--ui-toast-max-width, 420px);
        width: 100%;
        position: relative;
        touch-action: pan-y;
        cursor: grab;
        user-select: none;
        box-sizing: border-box;
        pointer-events: auto;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.875rem;
      }

      /* Variant backgrounds and borders */
      :host([variant="success"]) {
        background: var(--ui-toast-success-bg, #f0fdf4);
        border-color: var(--ui-toast-success-border, #bbf7d0);
      }
      :host([variant="error"]) {
        background: var(--ui-toast-error-bg, #fef2f2);
        border-color: var(--ui-toast-error-border, #fecaca);
      }
      :host([variant="warning"]) {
        background: var(--ui-toast-warning-bg, #fffbeb);
        border-color: var(--ui-toast-warning-border, #fde68a);
      }
      :host([variant="info"]) {
        background: var(--ui-toast-info-bg, #eff6ff);
        border-color: var(--ui-toast-info-border, #bfdbfe);
      }

      /* Variant icon colors */
      :host([variant="success"]) .toast-icon-wrapper { color: var(--ui-toast-success-icon, #16a34a); }
      :host([variant="error"]) .toast-icon-wrapper { color: var(--ui-toast-error-icon, #dc2626); }
      :host([variant="warning"]) .toast-icon-wrapper { color: var(--ui-toast-warning-icon, #d97706); }
      :host([variant="info"]) .toast-icon-wrapper { color: var(--ui-toast-info-icon, #2563eb); }
      :host([variant="loading"]) .toast-icon-wrapper { color: var(--ui-toast-info-icon, #2563eb); }

      .toast-icon-wrapper {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding-top: 0.125rem;
      }

      .toast-icon-loading {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .toast-content {
        flex: 1;
        min-width: 0;
      }

      .toast-title {
        font-weight: 600;
        line-height: 1.4;
      }

      .toast-description {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        opacity: 0.9;
        line-height: 1.4;
      }

      .toast-action {
        appearance: none;
        background: none;
        border: none;
        color: inherit;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
        padding: 0;
        margin-top: 0.5rem;
      }

      .toast-action:hover {
        opacity: 0.8;
      }

      .toast-close {
        appearance: none;
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0.25rem;
        margin: -0.25rem -0.25rem -0.25rem 0;
        flex-shrink: 0;
        opacity: 0.5;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.25rem;
        transition: opacity 150ms;
      }

      .toast-close:hover {
        opacity: 1;
      }

      @media (prefers-reduced-motion: reduce) {
        .toast-icon-loading {
          animation: none;
        }
      }
    \`,
  ];

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    this._abortController = new AbortController();
    const signal = this._abortController.signal;

    // Start auto-dismiss timer
    this._remaining = this.duration;
    if (this.duration > 0) {
      this._startTimer();
    }

    // Pointer events for swipe-to-dismiss
    this.addEventListener('pointerdown', this._handlePointerDown, { signal });
    this.addEventListener('pointermove', this._handlePointerMove, { signal });
    this.addEventListener('pointerup', this._handlePointerUp, { signal });
    this.addEventListener('pointercancel', this._handlePointerUp, { signal });

    // Pause on hover
    this.addEventListener('pointerenter', this._handlePointerEnter, { signal });
    this.addEventListener('pointerleave', this._handlePointerLeave, { signal });

    // Pause on focus
    this.addEventListener('focusin', this._handleFocusIn, { signal });
    this.addEventListener('focusout', this._handleFocusOut, { signal });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._abortController?.abort();
    this._clearTimer();
  }

  // ---------------------------------------------------------------------------
  // Timer management
  // ---------------------------------------------------------------------------

  private _startTimer(): void {
    this._startTime = Date.now();
    this._timerId = setTimeout(() => this._handleAutoClose(), this._remaining);
  }

  private _pauseTimer(): void {
    if (this._timerId === null) return;
    clearTimeout(this._timerId);
    this._timerId = null;
    this._remaining -= (Date.now() - this._startTime);
    if (this._remaining < 0) this._remaining = 0;
    this._paused = true;
  }

  private _resumeTimer(): void {
    if (!this._paused || this._remaining <= 0 || this.duration === 0) return;
    this._paused = false;
    this._startTimer();
  }

  private _clearTimer(): void {
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
  }

  private _handleAutoClose(): void {
    this.onAutoClose?.();
    this.dispatchEvent(new CustomEvent('toast-close', {
      bubbles: true,
      composed: true,
      detail: { id: this.toastId, reason: 'auto' },
    }));
  }

  // ---------------------------------------------------------------------------
  // Swipe-to-dismiss
  // ---------------------------------------------------------------------------

  private _handlePointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return; // only primary button
    this._swipeStartX = e.clientX;
    this._swipeStartTime = Date.now();
    this._swipeX = 0;
    this._swiping = true;
    this.setPointerCapture(e.pointerId);
    this._pauseTimer();
  };

  private _handlePointerMove = (e: PointerEvent): void => {
    if (!this._swiping) return;
    this._swipeX = e.clientX - this._swipeStartX;
    this.style.transform = \\\`translateX(\\\${this._swipeX}px)\\\`;
    this.style.opacity = String(1 - Math.abs(this._swipeX) / 200);
  };

  private _handlePointerUp = (e: PointerEvent): void => {
    if (!this._swiping) return;
    this._swiping = false;
    this.releasePointerCapture(e.pointerId);

    const distance = Math.abs(this._swipeX);
    const elapsed = Date.now() - this._swipeStartTime;
    const velocity = elapsed > 0 ? distance / elapsed : 0; // px/ms

    if (distance > 80 || velocity > 0.11) {
      // Dismiss via swipe
      this.dispatchEvent(new CustomEvent('toast-close', {
        bubbles: true,
        composed: true,
        detail: { id: this.toastId, reason: 'swipe' },
      }));
    } else {
      // Snap back
      this.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out';
      this.style.transform = '';
      this.style.opacity = '';
      // Remove transition after snap back completes
      const cleanup = () => {
        this.style.transition = '';
        this.removeEventListener('transitionend', cleanup);
      };
      this.addEventListener('transitionend', cleanup, { once: true });
      this._resumeTimer();
    }
  };

  // ---------------------------------------------------------------------------
  // Hover/focus pause
  // ---------------------------------------------------------------------------

  private _handlePointerEnter = (): void => {
    if (!this._swiping) {
      this._pauseTimer();
    }
  };

  private _handlePointerLeave = (): void => {
    if (!this._swiping) {
      this._resumeTimer();
    }
  };

  private _handleFocusIn = (): void => {
    this._pauseTimer();
  };

  private _handleFocusOut = (): void => {
    if (!this._swiping) {
      this._resumeTimer();
    }
  };

  // ---------------------------------------------------------------------------
  // Close / Action handlers
  // ---------------------------------------------------------------------------

  private _handleClose(): void {
    this.dispatchEvent(new CustomEvent('toast-close', {
      bubbles: true,
      composed: true,
      detail: { id: this.toastId, reason: 'dismiss' },
    }));
  }

  private _handleAction(): void {
    this.action?.onClick();
    this.dispatchEvent(new CustomEvent('toast-close', {
      bubbles: true,
      composed: true,
      detail: { id: this.toastId, reason: 'action' },
    }));
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  override render() {
    // Accessibility: error gets role="alert" (implies assertive), others get role="status" + polite
    const isError = this.variant === 'error';
    const icon = toastIcons[this.variant];

    return html\\\`
      <div
        class="toast-inner"
        role=\\\${isError ? 'alert' : 'status'}
        aria-live=\\\${isError ? nothing : 'polite'}
        aria-atomic="true"
        style="display:contents"
      >
        \\\${icon !== nothing
          ? html\\\`<div class="toast-icon-wrapper">\\\${icon}</div>\\\`
          : nothing}

        <div class="toast-content">
          \\\${this.toastTitle
            ? html\\\`<div class="toast-title">\\\${this.toastTitle}</div>\\\`
            : nothing}
          \\\${this.description
            ? html\\\`<div class="toast-description">\\\${this.description}</div>\\\`
            : nothing}
          <slot></slot>
          \\\${this.action
            ? html\\\`<button class="toast-action" @click=\\\${this._handleAction}>\\\${this.action.label}</button>\\\`
            : nothing}
        </div>

        \\\${this.dismissible
          ? html\\\`
            <button class="toast-close" @click=\\\${this._handleClose} aria-label="Close notification">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          \\\`
          : nothing}
      </div>
    \\\`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-toast': Toast;
  }
}
`;

/**
 * Toast toaster template (lui-toaster)
 */
export const TOAST_TOASTER_TEMPLATE = `/**
 * lui-toaster - Container element for toast notifications
 *
 * Features:
 * - Subscribes to singleton toastState for reactive rendering
 * - Queue management with configurable maxVisible
 * - 6 position options via CSS positioning
 * - Top-layer rendering via popover="manual"
 * - Pre-registered accessible live regions
 * - Enter/exit animations with @starting-style
 * - SSR safe with isServer guard
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { toastState } from './state.js';
import type { ToastData, ToastPosition } from './types.js';

const isServer = typeof document === 'undefined';

@customElement('lui-toaster')
export class Toaster extends LitElement {
  // ---------------------------------------------------------------------------
  // Public properties
  // ---------------------------------------------------------------------------

  @property({ type: String, reflect: true })
  position: ToastPosition = 'bottom-right';

  @property({ type: Number, attribute: 'max-visible' })
  maxVisible = 3;

  @property({ type: Number })
  gap = 12;

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  @state()
  private _toasts: ToastData[] = [];

  private _unsubscribe: (() => void) | null = null;
  private _exitingIds = new Set<string>();
  private _popoverEl: HTMLElement | null = null;

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  private get _visibleToasts(): ToastData[] {
    return this._toasts.slice(0, this.maxVisible);
  }

  private get _isTopPosition(): boolean {
    return this.position.startsWith('top');
  }

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  static override styles = [
    css\`
      :host {
        display: contents;
      }

      .toaster-wrapper {
        /* Override UA popover styles */
        margin: 0;
        border: none;
        padding: 0;
        background: transparent;
        overflow: visible;
        /* Layout */
        position: fixed;
        z-index: var(--ui-toast-z-index, 9999);
        display: flex;
        flex-direction: column;
        gap: var(--ui-toast-gap, 12px);
        pointer-events: none;
        max-height: 100vh;
        width: var(--ui-toast-max-width, 420px);
      }

      /* Bottom positions: newest at bottom (column-reverse stacks upward) */
      :host([position="bottom-right"]) .toaster-wrapper,
      :host([position="bottom-left"]) .toaster-wrapper,
      :host([position="bottom-center"]) .toaster-wrapper {
        flex-direction: column-reverse;
      }

      /* Position mapping */
      :host([position="bottom-right"]) .toaster-wrapper { bottom: 1rem; right: 1rem; }
      :host([position="bottom-left"]) .toaster-wrapper { bottom: 1rem; left: 1rem; }
      :host([position="bottom-center"]) .toaster-wrapper { bottom: 1rem; left: 50%; transform: translateX(-50%); }
      :host([position="top-right"]) .toaster-wrapper { top: 1rem; right: 1rem; }
      :host([position="top-left"]) .toaster-wrapper { top: 1rem; left: 1rem; }
      :host([position="top-center"]) .toaster-wrapper { top: 1rem; left: 50%; transform: translateX(-50%); }

      /* Toast entry/exit animations */
      lui-toast {
        opacity: 0;
        transition:
          opacity 200ms ease-out,
          transform 200ms ease-out;
      }

      lui-toast[data-open] {
        opacity: 1;
        transform: translateY(0);
      }

      @starting-style {
        lui-toast[data-open] {
          opacity: 0;
        }
      }

      /* Exiting state */
      lui-toast[data-exiting] {
        opacity: 0;
        transition:
          opacity 150ms ease-in,
          transform 150ms ease-in;
      }

      @media (prefers-reduced-motion: reduce) {
        lui-toast,
        lui-toast[data-open],
        lui-toast[data-exiting] {
          transition: none;
        }
      }

      /* Screen reader only */
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
    \`,
  ];

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    if (isServer) return;

    this._unsubscribe = toastState.subscribe(() => {
      this._toasts = [...toastState.toasts];
      // Show popover if we have toasts
      if (this._toasts.length > 0) {
        this.updateComplete.then(() => this._showPopover());
      }
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsubscribe?.();
    this._unsubscribe = null;
  }

  // ---------------------------------------------------------------------------
  // Popover management
  // ---------------------------------------------------------------------------

  private _showPopover(): void {
    if (!this._popoverEl) {
      this._popoverEl = this.renderRoot.querySelector<HTMLElement>('.toaster-wrapper');
    }
    if (this._popoverEl && !this._popoverEl.matches(':popover-open')) {
      try {
        this._popoverEl.showPopover();
      } catch {
        // Already showing or not supported
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  private _handleToastClose(e: CustomEvent<{ id: string; reason: string }>): void {
    const { id } = e.detail;
    toastState.dismiss(id);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  override render() {
    const visible = this._visibleToasts;

    return html\\\`
      <!-- Pre-registered live regions for accessibility -->
      <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
        \\\${visible
          .filter(t => t.variant !== 'error')
          .map(t => html\\\`<div>\\\${t.title ?? ''}\\\${t.description ? \\\` \\\${t.description}\\\` : ''}</div>\\\`)}
      </div>
      <div role="alert" aria-atomic="true" class="sr-only">
        \\\${visible
          .filter(t => t.variant === 'error')
          .map(t => html\\\`<div>\\\${t.title ?? ''}\\\${t.description ? \\\` \\\${t.description}\\\` : ''}</div>\\\`)}
      </div>

      <div
        class="toaster-wrapper"
        popover="manual"
        part="container"
      >
        \\\${repeat(
          visible,
          (t) => t.id,
          (t) => html\\\`
            <lui-toast
              toast-id=\\\${t.id}
              variant=\\\${t.variant}
              toast-title=\\\${t.title ?? ''}
              description=\\\${t.description ?? ''}
              .duration=\\\${t.duration}
              .dismissible=\\\${t.dismissible}
              .action=\\\${t.action}
              .position=\\\${this.position}
              .onAutoClose=\\\${t.onAutoClose}
              data-open
              @toast-close=\\\${this._handleToastClose}
            >
            </lui-toast>
          \\\`,
        )}
      </div>
    \\\`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-toaster': Toaster;
  }
}
`;

/**
 * Map of component names to their templates
 */
export const COMPONENT_TEMPLATES: Record<string, string> = {
  button: BUTTON_TEMPLATE,
  dialog: DIALOG_TEMPLATE,
  input: INPUT_TEMPLATE,
  textarea: TEXTAREA_TEMPLATE,
  select: SELECT_TEMPLATE,
  switch: SWITCH_TEMPLATE,
  checkbox: CHECKBOX_TEMPLATE,
  'checkbox-group': CHECKBOX_GROUP_TEMPLATE,
  radio: RADIO_TEMPLATE,
  'radio-group': RADIO_GROUP_TEMPLATE,
  tooltip: TOOLTIP_TEMPLATE,
  'tooltip/delay-group': TOOLTIP_DELAY_GROUP_TEMPLATE,
  popover: POPOVER_TEMPLATE,
  'toast/types': TOAST_TYPES_TEMPLATE,
  'toast/icons': TOAST_ICONS_TEMPLATE,
  'toast/state': TOAST_STATE_TEMPLATE,
  'toast/api': TOAST_API_TEMPLATE,
  toast: TOAST_ELEMENT_TEMPLATE,
  'toast/toaster': TOAST_TOASTER_TEMPLATE,
};

/**
 * Get the template for a component
 */
export function getComponentTemplate(name: string): string | undefined {
  return COMPONENT_TEMPLATES[name];
}
