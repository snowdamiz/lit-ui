/**
 * lui-option - An option within a lui-select component
 *
 * This component represents a selectable option in the dropdown.
 * It provides visual states for selected, disabled, and active (keyboard navigation).
 *
 * Note: In Phase 32, options are rendered inline by the Select component
 * using the SelectOption interface. This component is created for potential
 * future slot-based usage where consumers provide <lui-option> children.
 */
import { html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

/**
 * An option element for use within lui-select.
 * Provides value, label, disabled, and selected states.
 */
export class Option extends TailwindElement {
  /**
   * The value submitted when this option is selected.
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Display label for the option. Falls back to value if not provided.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * Whether this option is disabled and cannot be selected.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether this option is currently selected.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  selected = false;

  /**
   * Unique ID for aria-activedescendant reference.
   */
  private optionId = `lui-option-${Math.random().toString(36).substr(2, 9)}`;

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      .option {
        display: flex;
        align-items: center;
        padding: var(--ui-select-option-padding-y, 0.5rem)
          var(--ui-select-option-padding-x, 0.75rem);
        cursor: pointer;
        color: var(--ui-select-option-text);
        background-color: transparent;
        transition: background-color 150ms;
      }

      .option:hover:not(.option-disabled) {
        background-color: var(--ui-select-option-bg-hover);
      }

      .option-active {
        background-color: var(--ui-select-option-bg-active);
      }

      .option-selected {
        color: var(--ui-select-option-text-selected);
        font-weight: 500;
      }

      .option-disabled {
        color: var(--ui-select-option-text-disabled);
        cursor: not-allowed;
        opacity: 0.5;
      }

      .check-icon {
        width: 1em;
        height: 1em;
        margin-right: 0.5rem;
        color: var(--ui-select-option-check);
        visibility: hidden;
      }

      .option-selected .check-icon {
        visibility: visible;
      }
    `,
  ];

  /**
   * Get the unique ID for this option (for aria-activedescendant).
   */
  getId(): string {
    return this.optionId;
  }

  override render() {
    const classes = ['option'];
    if (this.disabled) classes.push('option-disabled');
    if (this.selected) classes.push('option-selected');

    return html`
      <div
        id=${this.optionId}
        role="option"
        aria-selected=${this.selected ? 'true' : 'false'}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        class=${classes.join(' ')}
      >
        <svg
          class="check-icon"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M3 8l4 4 6-7"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>${this.label || this.value}</span>
      </div>
    `;
  }
}

/**
 * Type alias for the Option element.
 */
export type OptionElement = Option;
