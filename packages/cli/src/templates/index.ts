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
 * Map of component names to their templates
 */
export const COMPONENT_TEMPLATES: Record<string, string> = {
  button: BUTTON_TEMPLATE,
  dialog: DIALOG_TEMPLATE,
  input: INPUT_TEMPLATE,
  textarea: TEXTAREA_TEMPLATE,
};

/**
 * Get the template for a component
 */
export function getComponentTemplate(name: string): string | undefined {
  return COMPONENT_TEMPLATES[name];
}
