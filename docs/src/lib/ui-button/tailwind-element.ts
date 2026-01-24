/**
 * Simplified TailwindElement for docs preview
 *
 * This is a standalone version for the documentation site that doesn't
 * depend on external Tailwind CSS compilation. It provides the minimal
 * utilities needed for the Button component to render correctly.
 */

import { LitElement, css, type CSSResultGroup } from 'lit';

/**
 * Minimal Tailwind-like utilities for Button component
 * Only includes what the button actually uses
 */
const minimalTailwindStyles = css`
  /* Base reset */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Color utilities - use CSS custom properties from light DOM */
  .bg-primary {
    background-color: var(--color-primary);
  }
  .bg-secondary {
    background-color: var(--color-secondary);
  }
  .bg-destructive {
    background-color: var(--color-destructive);
  }
  .bg-accent {
    background-color: var(--color-accent);
  }
  .bg-transparent {
    background-color: transparent;
  }

  .text-primary-foreground {
    color: var(--color-primary-foreground);
  }
  .text-secondary-foreground {
    color: var(--color-secondary-foreground);
  }
  .text-destructive-foreground {
    color: var(--color-destructive-foreground);
  }
  .text-foreground {
    color: var(--color-foreground);
  }

  /* Border utilities */
  .border {
    border-width: 1px;
    border-style: solid;
  }
  .border-border {
    border-color: var(--color-border);
  }

  /* Spacing utilities */
  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  .py-1\\.5 {
    padding-top: 0.375rem;
    padding-bottom: 0.375rem;
  }
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .py-3 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }

  /* Gap utilities */
  .gap-1\\.5 {
    gap: 0.375rem;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .gap-2\\.5 {
    gap: 0.625rem;
  }

  /* Typography utilities */
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }
  .text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  .font-medium {
    font-weight: 500;
  }

  /* Layout utilities */
  .inline-flex {
    display: inline-flex;
  }
  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }

  /* Border radius */
  .rounded-md {
    border-radius: 0.375rem;
  }

  /* Transitions */
  .transition-colors {
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  .duration-150 {
    transition-duration: 150ms;
  }

  /* Cursor utilities */
  .cursor-pointer {
    cursor: pointer;
  }
  .cursor-not-allowed {
    cursor: not-allowed;
  }

  /* Opacity utilities */
  .opacity-50 {
    opacity: 0.5;
  }

  /* Hover states */
  .hover\\:opacity-90:hover {
    opacity: 0.9;
  }
  .hover\\:bg-accent:hover {
    background-color: var(--color-accent);
  }
`;

/**
 * Base class for Tailwind-enabled web components in docs preview.
 *
 * This is a simplified version that includes minimal inline Tailwind utilities
 * rather than importing compiled CSS.
 */
export class TailwindElement extends LitElement {
  /**
   * Static styles that can be extended by subclasses.
   */
  static styles: CSSResultGroup = [];

  /**
   * Called when the element is connected to the document's DOM.
   * Injects minimal Tailwind styles into the Shadow DOM.
   */
  override connectedCallback(): void {
    super.connectedCallback();
    this._adoptTailwindStyles();
  }

  /**
   * Adopts minimal Tailwind stylesheet into this component's Shadow DOM.
   */
  private _adoptTailwindStyles(): void {
    if (this.shadowRoot) {
      const existingSheets = this.shadowRoot.adoptedStyleSheets;

      // Create stylesheet from CSS template literal
      const tailwindSheet = new CSSStyleSheet();
      tailwindSheet.replaceSync(minimalTailwindStyles.cssText);

      // Prepend Tailwind styles so component-specific styles can override
      this.shadowRoot.adoptedStyleSheets = [tailwindSheet, ...existingSheets];
    }
  }
}
