/**
 * lui-button - A customizable button component
 *
 * Features:
 * - Five visual variants: primary, secondary, outline, ghost, destructive
 * - Three sizes: sm, md, lg
 * - Form participation via ElementInternals (submit/reset) - client-side only
 * - Disabled state with proper accessibility (aria-disabled, remains in tab order)
 * - Loading state with pulsing dots spinner (aria-busy)
 * - Icon slots (icon-start, icon-end) for icon placement
 * - Inner glow focus ring for visibility across all variants
 * - Keyboard accessible (Enter/Space via native button)
 * - SSR compatible via isServer guards
 *
 * @example
 * ```html
 * <lui-button variant="primary" size="md">Click me</lui-button>
 * <lui-button variant="destructive" disabled>Delete</lui-button>
 * <lui-button loading>Saving...</lui-button>
 * <lui-button type="submit">Submit Form</lui-button>
 * ```
 */

import { html, css, nothing, isServer } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

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
 * Form participation is client-side only (guarded with isServer check).
 *
 * @slot - Default slot for button text content
 * @slot icon-start - Slot for icon before text
 * @slot icon-end - Slot for icon after text
 */
export class Button extends TailwindElement {
  /**
   * Enable form association for this custom element.
   * This allows the button to participate in form submission/reset.
   */
  static formAssociated = true;

  /**
   * ElementInternals for form participation and ARIA.
   * Null during SSR since attachInternals() is not available.
   */
  private internals: ElementInternals | null = null;

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

  /**
   * Additional CSS classes to apply to the inner button element.
   * These classes are merged with the component's default classes,
   * allowing customization via Tailwind utilities.
   * @default ''
   *
   * @example
   * ```html
   * <lui-button btn-class="rounded-full shadow-lg">Pill Button</lui-button>
   * ```
   */
  @property({ type: String, attribute: 'btn-class' })
  customClass = '';

  constructor() {
    super();
    // Only attach internals on client (not during SSR)
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  /**
   * Static styles for focus ring (inner glow), loading spinner,
   * variant colors, sizes, and component-level CSS custom properties.
   * Includes Tailwind base styles for SSR support.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css`
    :host {
      display: inline-block;
    }

    :host([disabled]),
    :host([loading]) {
      pointer-events: none;
    }

    button {
      border-radius: var(--ui-button-radius);
      box-shadow: var(--ui-button-shadow);
      font-weight: var(--ui-button-font-weight);
    }

    button:focus-visible {
      outline: 2px solid var(--ui-focus-ring-color, var(--color-ring, var(--ui-color-ring)));
      outline-offset: 2px;
    }

    /* -------------------------------------------------------------------------
     * Variant Styles - Use CSS custom properties for colors
     * Consumers can override --ui-button-{variant}-* properties
     * ------------------------------------------------------------------------- */

    /* Contrast threshold for auto-contrast calculation (0.6 = 60% lightness) */
    :host {
      --_contrast-threshold: var(--ui-contrast-threshold, 0.7);
    }

    /* Primary variant */
    button.btn-primary {
      --_bg: var(--ui-button-primary-bg);
      background-color: var(--_bg);
      /* Fallback for browsers without relative color syntax */
      color: var(--ui-button-primary-text);
    }
    button.btn-primary:hover:not([aria-disabled='true']) {
      opacity: var(--ui-button-primary-hover-opacity);
    }

    /* Secondary variant */
    button.btn-secondary {
      --_bg: var(--ui-button-secondary-bg);
      background-color: var(--_bg);
      /* Fallback for browsers without relative color syntax */
      color: var(--ui-button-secondary-text);
    }
    button.btn-secondary:hover:not([aria-disabled='true']) {
      background-color: var(--ui-button-secondary-hover-bg);
    }

    /* Outline variant - uses foreground color (no auto-contrast needed) */
    button.btn-outline {
      background-color: var(--ui-button-outline-bg);
      color: var(--ui-button-outline-text);
      border: var(--ui-button-border-width) solid var(--ui-button-outline-border);
    }
    button.btn-outline:hover:not([aria-disabled='true']) {
      background-color: var(--ui-button-outline-hover-bg);
    }

    /* Ghost variant - uses foreground color (no auto-contrast needed) */
    button.btn-ghost {
      background-color: var(--ui-button-ghost-bg);
      color: var(--ui-button-ghost-text);
    }
    button.btn-ghost:hover:not([aria-disabled='true']) {
      background-color: var(--ui-button-ghost-hover-bg);
    }

    /* Destructive variant */
    button.btn-destructive {
      --_bg: var(--ui-button-destructive-bg);
      background-color: var(--_bg);
      /* Fallback for browsers without relative color syntax */
      color: var(--ui-button-destructive-text);
    }
    button.btn-destructive:hover:not([aria-disabled='true']) {
      opacity: var(--ui-button-destructive-hover-opacity);
    }

    /* -------------------------------------------------------------------------
     * Auto-contrast: Automatically calculate text color from background
     * Uses CSS relative color syntax to extract lightness and compute contrast
     * Formula: if lightness < threshold → white text, else → black text
     * ------------------------------------------------------------------------- */
    @supports (color: oklch(from oklch(0.5 0.1 250) l c h)) {
      /* Primary auto-contrast */
      button.btn-primary {
        /* Auto-calculate contrasting text color based on background lightness */
        color: oklch(from var(--_bg) clamp(0, (l / var(--_contrast-threshold) - 1) * -infinity, 1) 0.02 h);
      }

      /* Secondary auto-contrast */
      button.btn-secondary {
        color: oklch(from var(--_bg) clamp(0, (l / var(--_contrast-threshold) - 1) * -infinity, 1) 0.02 h);
      }

      /* Destructive auto-contrast */
      button.btn-destructive {
        color: oklch(from var(--_bg) clamp(0, (l / var(--_contrast-threshold) - 1) * -infinity, 1) 0.02 h);
      }
    }

    /* -------------------------------------------------------------------------
     * Size Styles - Use CSS custom properties for spacing
     * Consumers can override --ui-button-{size}-* properties
     * ------------------------------------------------------------------------- */

    button.btn-sm {
      padding: var(--ui-button-padding-y-sm) var(--ui-button-padding-x-sm);
      font-size: var(--ui-button-font-size-sm);
      gap: var(--ui-button-gap-sm);
    }

    button.btn-md {
      padding: var(--ui-button-padding-y-md) var(--ui-button-padding-x-md);
      font-size: var(--ui-button-font-size-md);
      gap: var(--ui-button-gap-md);
    }

    button.btn-lg {
      padding: var(--ui-button-padding-y-lg) var(--ui-button-padding-x-lg);
      font-size: var(--ui-button-font-size-lg);
      gap: var(--ui-button-gap-lg);
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
  `,
  ];

  /**
   * Get the CSS class for the current variant.
   * Variant colors are controlled via CSS custom properties:
   * --ui-button-{variant}-bg, --ui-button-{variant}-text, etc.
   */
  private getVariantClasses(): string {
    const variants: Record<ButtonVariant, string> = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      destructive: 'btn-destructive',
    };
    return variants[this.variant];
  }

  /**
   * Get the CSS class for the current size.
   * Size dimensions are controlled via CSS custom properties:
   * --ui-button-padding-{x,y}-{size}, --ui-button-font-size-{size}, --ui-button-gap-{size}
   */
  private getSizeClasses(): string {
    const sizes: Record<ButtonSize, string> = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    };
    return sizes[this.size];
  }

  /**
   * Get the base classes common to all button variants.
   * Note: border-radius, box-shadow, and font-weight are set via CSS custom properties.
   */
  private getBaseClasses(): string {
    return 'inline-flex items-center justify-center transition-colors duration-150';
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
    return html`<span class="spinner" aria-hidden="true"><span></span></span>`;
  }

  /**
   * Handle click events.
   * Prevents action when disabled or loading.
   * Triggers form submission or reset based on button type.
   * Form actions are guarded with optional chaining for SSR safety.
   */
  private handleClick(e: MouseEvent) {
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Handle form actions via ElementInternals (client-side only)
    if (this.internals?.form && this.type === 'submit') {
      this.internals.form.requestSubmit();
    } else if (this.internals?.form && this.type === 'reset') {
      this.internals.form.reset();
    }
  }

  /**
   * Combine all classes into a single string.
   * User-provided classes via the class attribute are appended last,
   * allowing them to override default styles.
   */
  private getButtonClasses(): string {
    return [
      this.getBaseClasses(),
      this.getVariantClasses(),
      this.getSizeClasses(),
      this.getDisabledClasses(),
      this.customClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    return html`
      <button
        part="button"
        class=${this.getButtonClasses()}
        ?aria-disabled=${this.disabled || this.loading}
        ?aria-busy=${this.loading}
        aria-label=${this.loading ? 'Loading' : nothing}
        @click=${this.handleClick}
        type="button"
      >
        <slot name="icon-start" part="icon-start"></slot>
        ${this.loading ? this.renderSpinner() : html`<slot part="content"></slot>`}
        <slot name="icon-end" part="icon-end"></slot>
      </button>
    `;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-button': Button;
  }
}
