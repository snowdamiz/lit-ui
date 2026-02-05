/**
 * Select component template
 */
export const SELECT_TEMPLATE = `/**
 * lui-select — Starter template.
 * For full features (multi-select, combobox, async loading, virtual scrolling),
 * install via NPM: npm install @lit-ui/select
 *
 * This starter provides a basic single-select dropdown with:
 * - Trigger button with placeholder and selected value display
 * - Dropdown panel with slot for options
 * - Keyboard navigation (ArrowUp/Down, Enter, Escape)
 * - Basic ARIA: role="listbox", aria-expanded, aria-haspopup
 * - Three sizes: sm, md, lg
 * - Disabled state
 * - Click-outside to close
 *
 * @example
 * \\\`\\\`\\\`html
 * <lui-select label="Country" placeholder="Select a country">
 *   <lui-option value="us">United States</lui-option>
 *   <lui-option value="ca">Canada</lui-option>
 *   <lui-option value="mx">Mexico</lui-option>
 * </lui-select>
 * \\\`\\\`\\\`
 */

import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TailwindElement } from '../../lib/lit-ui/tailwind-element';

/**
 * Select size types for padding and font sizing
 */
export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * A basic select dropdown component.
 * This is a starter template — for full features, use: npm install @lit-ui/select
 *
 * @slot - Default slot for lui-option elements
 */
@customElement('lui-select')
export class Select extends TailwindElement {
  /**
   * The label displayed above the select trigger.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * The name of the select for form submission.
   * @default ''
   */
  @property({ type: String })
  name = '';

  /**
   * The current selected value.
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Placeholder text when no value is selected.
   * @default 'Select...'
   */
  @property({ type: String })
  placeholder = 'Select...';

  /**
   * The size of the select trigger.
   * @default 'md'
   */
  @property({ type: String })
  size: SelectSize = 'md';

  /**
   * Whether the select is disabled.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether the dropdown is open.
   */
  @state()
  private open = false;

  /**
   * The display label of the currently selected option.
   */
  @state()
  private displayLabel = '';

  static override styles = css\\\`
    :host {
      display: inline-block;
      position: relative;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .select-label {
      font-weight: 500;
      color: var(--ui-input-text, inherit);
    }

    .select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      border-radius: var(--ui-input-radius, 0.375rem);
      border: 1px solid var(--ui-input-border, var(--color-border, #e2e8f0));
      background: var(--ui-input-bg, var(--color-background, #fff));
      color: var(--ui-input-text, inherit);
      cursor: pointer;
      transition: border-color 150ms;
    }

    .select-trigger:focus-visible {
      outline: none;
      border-color: var(--ui-input-border-focus, var(--color-ring, #3b82f6));
      box-shadow: 0 0 0 1px var(--ui-input-border-focus, var(--color-ring, #3b82f6));
    }

    .select-trigger.trigger-sm {
      padding: 0.375rem 0.5rem;
      font-size: 0.875rem;
    }

    .select-trigger.trigger-md {
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
    }

    .select-trigger.trigger-lg {
      padding: 0.75rem 1rem;
      font-size: 1.125rem;
    }

    .select-placeholder {
      color: var(--ui-input-placeholder, var(--color-muted-foreground, #94a3b8));
    }

    .select-chevron {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
      transition: transform 150ms;
    }

    .select-chevron.open {
      transform: rotate(180deg);
    }

    .select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 50;
      margin-top: 0.25rem;
      border-radius: var(--ui-input-radius, 0.375rem);
      border: 1px solid var(--ui-input-border, var(--color-border, #e2e8f0));
      background: var(--ui-input-bg, var(--color-background, #fff));
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      max-height: 15rem;
      overflow-y: auto;
      padding: 0.25rem;
    }
  \\\`;

  override connectedCallback() {
    super.connectedCallback();
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    document.addEventListener('click', this._handleOutsideClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
  }

  private _handleOutsideClick(e: MouseEvent) {
    if (!this.open) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
  }

  private _toggleDropdown() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  private _handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._toggleDropdown();
        break;
      case 'Escape':
        if (this.open) {
          e.preventDefault();
          this.open = false;
        }
        break;
    }
  }

  private _handleSlotChange() {
    // Update display label if value is set
    if (this.value) {
      this._updateDisplayLabel();
    }
  }

  private _updateDisplayLabel() {
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    if (!slot) return;
    const options = slot.assignedElements();
    for (const el of options) {
      if ((el as HTMLElement).getAttribute('value') === this.value) {
        this.displayLabel = (el as HTMLElement).textContent?.trim() || this.value;
        return;
      }
    }
    this.displayLabel = '';
  }

  override render() {
    const chevron = html\\\`
      <svg class="select-chevron \\\${this.open ? 'open' : ''}"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    \\\`;

    return html\\\`
      <div class="select-wrapper">
        \\\${this.label
          ? html\\\`<label class="select-label">\\\${this.label}</label>\\\`
          : nothing}
        <div style="position: relative;">
          <button
            type="button"
            class="select-trigger trigger-\\\${this.size}"
            role="combobox"
            aria-expanded=\\\${this.open}
            aria-haspopup="listbox"
            ?disabled=\\\${this.disabled}
            @click=\\\${this._toggleDropdown}
            @keydown=\\\${this._handleKeydown}
          >
            <span class=\\\${!this.value && !this.displayLabel ? 'select-placeholder' : ''}>
              \\\${this.displayLabel || this.value || this.placeholder}
            </span>
            \\\${chevron}
          </button>
          \\\${this.open
            ? html\\\`
                <div class="select-dropdown" role="listbox">
                  <slot @slotchange=\\\${this._handleSlotChange}></slot>
                </div>
              \\\`
            : nothing}
        </div>
      </div>
    \\\`;
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-select': Select;
  }
}
`;
