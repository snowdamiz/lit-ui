/**
 * Simplified TailwindElement for docs preview
 *
 * This is a standalone version for the documentation site that doesn't
 * depend on external Tailwind CSS compilation. It provides the minimal
 * utilities needed for the Dialog component to render correctly.
 */

import { LitElement, css, type CSSResultGroup } from 'lit';

/**
 * Minimal Tailwind-like utilities for Dialog component
 * Only includes what the dialog actually uses
 */
const minimalTailwindStyles = css`
  /* Base reset */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Background colors using CSS custom properties */
  .bg-card {
    background-color: var(--color-card);
  }

  /* Text colors */
  .text-card-foreground {
    color: var(--color-card-foreground);
  }
  .text-muted-foreground {
    color: var(--color-muted-foreground);
  }
  .text-gray-500 {
    color: rgb(107 114 128);
  }
  .text-gray-400 {
    color: rgb(156 163 175);
  }

  /* Hover text colors */
  .hover\\:text-gray-700:hover {
    color: rgb(55 65 81);
  }
  .dark\\:text-gray-400 {
    color: rgb(156 163 175);
  }
  .dark\\:hover\\:text-gray-200:hover {
    color: rgb(229 231 235);
  }

  /* Typography */
  .text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  .font-semibold {
    font-weight: 600;
  }

  /* Spacing */
  .p-6 {
    padding: 1.5rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .gap-3 {
    gap: 0.75rem;
  }

  /* Layout */
  .flex {
    display: flex;
  }
  .justify-end {
    justify-content: flex-end;
  }
  .relative {
    position: relative;
  }
  .absolute {
    position: absolute;
  }
  .top-4 {
    top: 1rem;
  }
  .right-4 {
    right: 1rem;
  }

  /* Sizing */
  .max-w-sm {
    max-width: 24rem;
  }
  .max-w-md {
    max-width: 28rem;
  }
  .max-w-lg {
    max-width: 32rem;
  }
  .w-5 {
    width: 1.25rem;
  }
  .h-5 {
    height: 1.25rem;
  }

  /* Border radius */
  .rounded-lg {
    border-radius: 0.5rem;
  }

  /* Shadow */
  .shadow-lg {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
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
