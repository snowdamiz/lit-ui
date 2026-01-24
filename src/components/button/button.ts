/**
 * ui-button - A customizable button component
 *
 * Features:
 * - Five visual variants: primary, secondary, outline, ghost, destructive
 * - Three sizes: sm, md, lg
 * - Disabled state with proper accessibility (aria-disabled)
 * - Inner glow focus ring for visibility across all variants
 *
 * @example
 * ```html
 * <ui-button variant="primary" size="md">Click me</ui-button>
 * <ui-button variant="destructive" disabled>Delete</ui-button>
 * ```
 */

import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement } from '../../base/tailwind-element';

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
 * A customizable button component with multiple variants and sizes.
 *
 * @slot - Default slot for button text content
 */
@customElement('ui-button')
export class Button extends TailwindElement {
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
   * Whether the button is disabled.
   * Uses aria-disabled for better screen reader accessibility.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Static styles for focus ring (inner glow) that cannot be expressed
   * with Tailwind utility classes alone.
   */
  static override styles = css`
    :host {
      display: inline-block;
    }

    :host([disabled]) {
      pointer-events: none;
    }

    button:focus-visible {
      outline: none;
      box-shadow: inset 0 0 0 2px var(--color-ring);
    }
  `;

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
   */
  private getSizeClasses(): string {
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
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
   * Get classes for the disabled state.
   */
  private getDisabledClasses(): string {
    return this.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
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
    return html`
      <button
        class=${this.getButtonClasses()}
        ?aria-disabled=${this.disabled}
      >
        <slot></slot>
      </button>
    `;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'ui-button': Button;
  }
}
