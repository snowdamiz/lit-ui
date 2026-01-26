/**
 * lui-select - A customizable select/dropdown component
 *
 * Features (Phase 32+):
 * - Single select with dropdown
 * - Keyboard navigation
 * - Form participation via ElementInternals
 * - SSR compatible
 *
 * @example
 * ```html
 * <lui-select placeholder="Select an option">
 *   <lui-option value="1">Option 1</lui-option>
 * </lui-select>
 * ```
 */

import { html, css, isServer } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
// Import Floating UI to validate dependency works - used in Phase 32
import { computePosition, flip, shift, offset, size } from '@floating-ui/dom';

/**
 * Select size types for padding and font sizing
 */
export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * A customizable select component with dropdown.
 * Supports form participation via ElementInternals.
 * Form participation is client-side only (guarded with isServer check).
 *
 * @slot default - Options to display in the dropdown (lui-option elements)
 */
export class Select extends TailwindElement {
  /**
   * Enable form association for this custom element.
   * This allows the select to participate in form submission.
   */
  static formAssociated = true;

  /**
   * ElementInternals for form participation.
   * Null during SSR since attachInternals() is not available.
   */
  private internals: ElementInternals | null = null;

  /**
   * The size of the select affecting padding and font size.
   * @default 'md'
   */
  @property({ type: String })
  size: SelectSize = 'md';

  /**
   * Placeholder text displayed when no option is selected.
   * @default 'Select an option'
   */
  @property({ type: String })
  placeholder = 'Select an option';

  /**
   * The name of the select for form submission.
   * @default ''
   */
  @property({ type: String })
  name = '';

  /**
   * The current value of the select.
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Whether the select is disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether the select is required for form submission.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  required = false;

  constructor() {
    super();
    // Only attach internals on client (not during SSR)
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  /**
   * Static styles for the select component.
   * Uses CSS custom properties from Phase 31 tokens.
   */
  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: inline-block;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      /* Trigger button - the clickable select display */
      .trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        width: 100%;
        border-radius: var(--ui-select-radius);
        border-width: var(--ui-select-border-width);
        border-style: solid;
        border-color: var(--ui-select-border);
        background-color: var(--ui-select-bg);
        color: var(--ui-select-text);
        cursor: pointer;
        transition: border-color var(--ui-select-transition);
      }

      .trigger:focus {
        outline: none;
        border-color: var(--ui-select-border-focus);
      }

      .trigger:focus-visible {
        outline: 2px solid var(--ui-select-ring);
        outline-offset: 2px;
      }

      /* Size variants */
      .trigger-sm {
        padding: var(--ui-select-padding-y-sm) var(--ui-select-padding-x-sm);
        font-size: var(--ui-select-font-size-sm);
      }

      .trigger-md {
        padding: var(--ui-select-padding-y-md) var(--ui-select-padding-x-md);
        font-size: var(--ui-select-font-size-md);
      }

      .trigger-lg {
        padding: var(--ui-select-padding-y-lg) var(--ui-select-padding-x-lg);
        font-size: var(--ui-select-font-size-lg);
      }

      /* Disabled state */
      .trigger-disabled {
        background-color: var(--ui-select-bg-disabled);
        color: var(--ui-select-text-disabled);
        border-color: var(--ui-select-border-disabled);
        cursor: not-allowed;
      }

      /* Placeholder text */
      .placeholder {
        color: var(--ui-select-placeholder);
      }

      /* Chevron icon */
      .chevron {
        flex-shrink: 0;
        width: 1em;
        height: 1em;
        opacity: 0.5;
      }
    `,
  ];

  /**
   * Get the CSS classes for the trigger element.
   */
  private getTriggerClasses(): string {
    const classes = ['trigger', `trigger-${this.size}`];
    if (this.disabled) {
      classes.push('trigger-disabled');
    }
    return classes.join(' ');
  }

  /**
   * Placeholder method for positioning dropdown.
   * Full implementation in Phase 32.
   */
  protected async positionDropdown(
    trigger: HTMLElement,
    dropdown: HTMLElement
  ): Promise<void> {
    // Skip during SSR - dropdown isn't visible anyway
    if (isServer) return;

    const { x, y } = await computePosition(trigger, dropdown, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [
        offset(4),
        flip({ fallbackPlacements: ['top-start'] }),
        shift({ padding: 8 }),
        size({
          apply({ availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxHeight: `${Math.min(availableHeight, 240)}px`,
            });
          },
        }),
      ],
    });

    Object.assign(dropdown.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  override render() {
    return html`
      <div
        class=${this.getTriggerClasses()}
        role="combobox"
        aria-expanded="false"
        aria-haspopup="listbox"
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? '-1' : '0'}
      >
        <span class="placeholder">${this.placeholder}</span>
        <svg
          class="chevron"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    `;
  }
}
