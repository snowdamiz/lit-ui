/**
 * lui-accordion-item - A collapsible accordion item with CSS Grid height animation
 *
 * Features:
 * - Three-layer CSS Grid animation: wrapper (0fr/1fr) > content (min-height:0) > inner (padding)
 * - Click-to-toggle dispatches ui-accordion-toggle event (parent manages state)
 * - aria-expanded and aria-controls for accessibility
 * - Configurable heading level for proper document outline
 * - CSS custom properties for theming
 * - Reduced motion support via prefers-reduced-motion
 * - SSR compatible
 *
 * @slot header - Content for the accordion header button
 * @slot default - Content for the collapsible panel
 */

import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { dispatchCustomEvent } from '@lit-ui/core';

/**
 * An accordion item with a header button and collapsible panel.
 * Expanded state is managed by the parent lui-accordion container.
 *
 * @slot header - Content for the accordion header button
 * @slot default - Content for the collapsible panel
 */
export class AccordionItem extends TailwindElement {
  /**
   * Unique ID for ARIA label/control associations within shadow DOM.
   */
  private itemId = `lui-ai-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique identifier for this item within the accordion group.
   * Used by the parent to track which items are expanded.
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Whether this item's panel is expanded.
   * Set by the parent accordion container — NEVER self-toggled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  expanded = false;

  /**
   * Whether this item is disabled (click interactions blocked).
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * ARIA heading level for the header element.
   * @default 3
   */
  @property({ type: Number, attribute: 'heading-level' })
  headingLevel = 3;

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
        border-bottom: var(--ui-accordion-border-width) solid
          var(--ui-accordion-border);
      }

      :host(:last-of-type) {
        border-bottom: none;
      }

      :host([disabled]) .header-button {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .header-button {
        display: flex;
        align-items: center;
        width: 100%;
        border: none;
        background: var(--ui-accordion-header-bg, transparent);
        color: var(--ui-accordion-header-text, inherit);
        font-weight: var(--ui-accordion-header-font-weight, 500);
        font-size: var(--ui-accordion-header-font-size, inherit);
        padding: var(--ui-accordion-header-padding, 0.75rem 0);
        cursor: pointer;
        text-align: left;
        font-family: inherit;
      }

      .header-button:hover {
        background: var(--ui-accordion-header-hover-bg, transparent);
      }

      .header-button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--ui-accordion-ring, currentColor);
      }

      .panel-wrapper {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows var(--ui-accordion-transition, 200ms) ease;
      }

      :host([expanded]) .panel-wrapper {
        grid-template-rows: 1fr;
      }

      .panel-content {
        min-height: 0;
        overflow: clip;
      }

      .panel-inner {
        padding: var(--ui-accordion-panel-padding, 0 0 0.75rem 0);
        color: var(--ui-accordion-panel-text, inherit);
      }

      @media (prefers-reduced-motion: reduce) {
        .panel-wrapper {
          transition-duration: 0ms;
        }
      }
    `,
  ];

  /**
   * Focus the header button programmatically.
   * Used by parent accordion for roving tabindex keyboard navigation.
   */
  focusHeader(): void {
    const btn = this.shadowRoot?.querySelector(
      '.header-button'
    ) as HTMLElement | null;
    btn?.focus();
  }

  /**
   * Handle click on the header button.
   * Dispatches ui-accordion-toggle internal event for parent to handle.
   * Does NOT self-toggle expanded state.
   */
  private handleToggle(): void {
    if (this.disabled) return;
    dispatchCustomEvent(this, 'ui-accordion-toggle', { value: this.value });
  }

  override render() {
    return html`
      <div role="heading" aria-level="${this.headingLevel}">
        <button
          id="${this.itemId}-header"
          class="header-button"
          aria-expanded="${this.expanded ? 'true' : 'false'}"
          aria-controls="${this.itemId}-panel"
          aria-disabled="${this.disabled ? 'true' : nothing}"
          tabindex="-1"
          @click=${this.handleToggle}
        >
          <slot name="header"></slot>
        </button>
      </div>
      <div class="panel-wrapper">
        <div class="panel-content">
          <div
            class="panel-inner"
            role="region"
            aria-labelledby="${this.itemId}-header"
            id="${this.itemId}-panel"
          >
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}
