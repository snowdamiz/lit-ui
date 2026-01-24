/**
 * TailwindElement Base Class
 *
 * A base class for Lit components that automatically injects Tailwind CSS
 * into the Shadow DOM via constructable stylesheets.
 *
 * Key features:
 * - Parses Tailwind CSS ONCE at module level (shared across all instances)
 * - Injects styles into Shadow DOM using adoptedStyleSheets
 * - Extracts @property rules and applies them to document (Shadow DOM workaround)
 * - Includes host defaults for Tailwind's @property-dependent utilities
 *
 * Usage:
 * ```typescript
 * import { TailwindElement } from 'lit-ui';
 * import { html } from 'lit';
 * import { customElement } from 'lit/decorators.js';
 *
 * @customElement('my-button')
 * export class MyButton extends TailwindElement {
 *   render() {
 *     return html`<button class="px-4 py-2 bg-primary text-white">Click</button>`;
 *   }
 * }
 * ```
 */

import { LitElement, type CSSResultGroup } from 'lit';

// Import compiled Tailwind CSS as inline string (processed by Vite)
import tailwindStyles from '../styles/tailwind.css?inline';
// Import host defaults for Shadow DOM @property workaround
import hostDefaults from '../styles/host-defaults.css?inline';

// =============================================================================
// SHARED STYLESHEETS (parse once, share across all component instances)
// =============================================================================

/**
 * Create constructable stylesheets from the imported CSS.
 * These are parsed once at module load and shared across all component instances.
 */
const tailwindSheet = new CSSStyleSheet();
tailwindSheet.replaceSync(tailwindStyles);

const hostDefaultsSheet = new CSSStyleSheet();
hostDefaultsSheet.replaceSync(hostDefaults);

// =============================================================================
// @property RULES WORKAROUND
// =============================================================================

/**
 * Extract @property rules from Tailwind CSS and apply them to the document.
 *
 * CSS @property declarations only work at the document level, not inside
 * Shadow DOM (W3C spec limitation: csswg-drafts#10541). This workaround
 * extracts these rules and applies them globally so they take effect.
 *
 * The host-defaults.css provides fallback values for all @property-dependent
 * variables within Shadow DOM.
 */
const propertyRulePattern = /@property\s+[^{]+\{[^}]+\}/g;
const propertyRules = tailwindStyles.match(propertyRulePattern) || [];

/**
 * Extract :root rules containing component tokens (--ui-*) and apply them
 * to the document. CSS custom properties in :root only work at the document
 * level and cascade into Shadow DOM from there.
 */
const rootRulePattern = /:root\s*\{[^}]*--ui-[^}]+\}/g;
const rootRules = tailwindStyles.match(rootRulePattern) || [];

if (typeof document !== 'undefined') {
  const documentRules: string[] = [];

  if (propertyRules.length > 0) {
    documentRules.push(...propertyRules);
  }

  if (rootRules.length > 0) {
    documentRules.push(...rootRules);
  }

  if (documentRules.length > 0) {
    const documentSheet = new CSSStyleSheet();
    documentSheet.replaceSync(documentRules.join('\n'));
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, documentSheet];
  }
}

// =============================================================================
// TAILWIND ELEMENT BASE CLASS
// =============================================================================

/**
 * Base class for Tailwind-enabled web components.
 *
 * Extends LitElement and automatically injects Tailwind CSS into the
 * component's Shadow DOM. All components in this library should extend
 * this class to get full Tailwind utility class support.
 *
 * @example
 * ```typescript
 * @customElement('ui-button')
 * export class Button extends TailwindElement {
 *   render() {
 *     return html`<button class="px-4 py-2 bg-primary rounded-md">Click</button>`;
 *   }
 * }
 * ```
 */
export class TailwindElement extends LitElement {
  /**
   * Static styles that can be extended by subclasses.
   * Subclasses can define their own styles which will be applied
   * AFTER Tailwind styles, allowing for component-specific overrides.
   *
   * @example
   * ```typescript
   * static styles = css`
   *   :host { display: block; }
   * `;
   * ```
   */
  static styles: CSSResultGroup = [];

  /**
   * Called when the element is connected to the document's DOM.
   * Injects Tailwind styles into the Shadow DOM.
   */
  override connectedCallback(): void {
    super.connectedCallback();
    this._adoptTailwindStyles();
  }

  /**
   * Adopts Tailwind stylesheets into this component's Shadow DOM.
   *
   * Prepends Tailwind and host-defaults sheets before any existing
   * adopted stylesheets, ensuring component-specific styles can override
   * Tailwind utilities when needed.
   *
   * @private
   */
  private _adoptTailwindStyles(): void {
    if (this.shadowRoot) {
      const existingSheets = this.shadowRoot.adoptedStyleSheets;

      // Prepend Tailwind styles so component-specific styles can override
      // Order: tailwind -> host-defaults -> component styles
      this.shadowRoot.adoptedStyleSheets = [
        tailwindSheet,
        hostDefaultsSheet,
        ...existingSheets,
      ];
    }
  }
}
