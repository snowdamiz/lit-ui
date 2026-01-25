/**
 * lui-dialog - An accessible modal dialog component
 *
 * Features:
 * - Native `<dialog>` element with showModal() for automatic focus trapping
 * - Three sizes: sm, md, lg (controls max-width)
 * - Escape key handling via native cancel event
 * - Backdrop click detection for dismissible dialogs
 * - ARIA attributes: aria-labelledby, aria-describedby
 * - Named slots for title, content, and footer
 * - Smooth enter/exit animations with reduced-motion support
 * - Focus restoration to trigger element on close
 * - Nested dialogs supported via browser's top layer stack
 * - Optional close button via show-close-button attribute
 * - SSR compatible with isServer guards
 *
 * @slot title - Dialog title content
 * @slot - Default slot for dialog body
 * @slot footer - Dialog footer (typically action buttons)
 *
 * @fires close - When dialog closes, detail: { reason: 'escape' | 'backdrop' | 'programmatic' }
 *
 * @example Basic usage
 * ```html
 * <lui-dialog open>
 *   <span slot="title">Dialog Title</span>
 *   <p>Dialog content goes here.</p>
 *   <div slot="footer">
 *     <lui-button @click=${() => dialog.close()}>Close</lui-button>
 *   </div>
 * </lui-dialog>
 * ```
 *
 * @example Nested dialogs
 * To prevent parent dialogs from receiving close events from nested dialogs,
 * use stopPropagation on the close event:
 * ```html
 * <lui-dialog id="parent">
 *   <lui-dialog id="child" @close=${(e) => e.stopPropagation()}>
 *   </lui-dialog>
 * </lui-dialog>
 * ```
 */

import { html, css, nothing } from 'lit';
import { isServer } from 'lit';
import { property, query } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

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
   * Additional CSS classes to apply to the dialog content container.
   * These classes are merged with the component's default classes,
   * allowing customization via Tailwind utilities.
   * @default ''
   *
   * @example
   * ```html
   * <lui-dialog dialog-class="max-w-2xl">Wide Dialog</lui-dialog>
   * ```
   */
  @property({ type: String, attribute: 'dialog-class' })
  customClass = '';

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
   * Static styles for dialog animations, layout, sizes, and component-level CSS custom properties.
   * Uses native CSS transitions with @starting-style for enter animations
   * and transition-behavior: allow-discrete for exit animations.
   * Includes Tailwind base styles for SSR support.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css`
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
      background: var(--ui-dialog-backdrop);
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

    /* -------------------------------------------------------------------------
     * Dialog Content - Use CSS custom properties for layout and colors
     * Consumers can override --ui-dialog-* properties
     * ------------------------------------------------------------------------- */

    .dialog-content {
      width: 100%;
      border-radius: var(--ui-dialog-radius);
      box-shadow: var(--ui-dialog-shadow);
      padding: var(--ui-dialog-padding);
      background-color: var(--ui-dialog-bg);
      color: var(--ui-dialog-text);
    }

    /* Size variants - controlled via CSS custom properties */
    .dialog-content.dialog-sm {
      max-width: var(--ui-dialog-max-width-sm);
    }

    .dialog-content.dialog-md {
      max-width: var(--ui-dialog-max-width-md);
    }

    .dialog-content.dialog-lg {
      max-width: var(--ui-dialog-max-width-lg);
    }

    /* Typography - controlled via CSS custom properties */
    .dialog-title {
      font-size: var(--ui-dialog-title-size);
      font-weight: var(--ui-dialog-title-weight);
      margin-bottom: var(--ui-dialog-header-margin);
    }

    .dialog-body {
      color: var(--ui-dialog-body-color);
    }

    .dialog-footer {
      margin-top: var(--ui-dialog-footer-margin);
      display: flex;
      justify-content: flex-end;
      gap: var(--ui-dialog-footer-gap);
    }
  `,
  ];

  /**
   * Called when reactive properties change.
   * Syncs the open property with the native dialog state.
   * SSR guard: Skip DOM manipulation during server-side rendering.
   */
  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      // Skip DOM manipulation during SSR
      if (isServer) return;

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
   * SSR guard: Only access document during client-side execution.
   */
  show() {
    // Only access document during client-side execution
    if (!isServer) {
      this.triggerElement = document.activeElement as HTMLElement;
    }
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
   * SSR guard: Only attempt focus restoration on client.
   */
  private handleNativeClose() {
    // Only attempt focus restoration during client-side execution
    if (!isServer) {
      if (
        this.triggerElement &&
        typeof this.triggerElement.focus === 'function'
      ) {
        this.triggerElement.focus();
      }
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
   * Size dimensions are controlled via CSS custom properties:
   * --ui-dialog-max-width-{sm,md,lg}
   */
  private getSizeClasses(): string {
    const sizeClasses: Record<DialogSize, string> = {
      sm: 'dialog-sm',
      md: 'dialog-md',
      lg: 'dialog-lg',
    };
    return sizeClasses[this.size];
  }

  /**
   * Gets the combined classes for the dialog content container.
   * User-provided classes are appended last to allow overrides.
   * Layout, colors, and typography are set via CSS custom properties.
   */
  private getContentClasses(): string {
    return [
      'dialog-content',
      this.getSizeClasses(),
      'relative',
      this.customClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    return html`
      <dialog
        part="dialog"
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
        @click=${this.handleDialogClick}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div
          part="content"
          class=${this.getContentClasses()}
          @click=${(e: Event) => e.stopPropagation()}
        >
          ${this.showCloseButton
            ? html`
                <button
                  part="close-button"
                  class="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                  @click=${() => this.close('programmatic')}
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
              `
            : nothing}
          <header part="header" id="dialog-title" class="dialog-title">
            <slot name="title"></slot>
          </header>
          <div part="body" id="dialog-description" class="dialog-body">
            <slot></slot>
          </div>
          <footer part="footer" class="dialog-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </dialog>
    `;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-dialog': Dialog;
  }
}
