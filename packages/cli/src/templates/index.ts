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
 * Map of component names to their templates
 */
export const COMPONENT_TEMPLATES: Record<string, string> = {
  button: BUTTON_TEMPLATE,
  dialog: DIALOG_TEMPLATE,
};

/**
 * Get the template for a component
 */
export function getComponentTemplate(name: string): string | undefined {
  return COMPONENT_TEMPLATES[name];
}
