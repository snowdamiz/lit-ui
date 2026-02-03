/**
 * lui-tabs - An accessible tabs container with tablist rendering and state management
 *
 * Features:
 * - Container-rendered tablist: all tab buttons are siblings under role="tablist"
 * - Child discovery via slotchange with SSR hydration workaround
 * - Controlled (value) and uncontrolled (default-value) modes
 * - Dynamic panel add/remove updates tab buttons automatically
 * - Dispatches ui-change event with the new active tab value
 * - ARIA roles, aria-selected, aria-controls, aria-labelledby
 * - SSR compatible via isServer guards
 *
 * @example
 * ```html
 * <lui-tabs value="tab-1">
 *   <lui-tab-panel value="tab-1" label="First">Content 1</lui-tab-panel>
 *   <lui-tab-panel value="tab-2" label="Second">Content 2</lui-tab-panel>
 * </lui-tabs>
 * ```
 *
 * @slot default - Child lui-tab-panel elements
 */

import { html, css, nothing, isServer, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { dispatchCustomEvent } from '@lit-ui/core';
import type { TabPanel } from './tab-panel.js';

/**
 * A tabs container that renders tab buttons from slotted lui-tab-panel
 * metadata and manages active tab state. Supports controlled/uncontrolled
 * modes, disabled state, and dynamic panel add/remove.
 *
 * @slot default - Child lui-tab-panel elements
 */
export class Tabs extends TailwindElement {
  /**
   * Discovered child tab panel elements.
   */
  private panels: TabPanel[] = [];

  /**
   * Unique ID prefix for ARIA associations between tabs and panels.
   */
  private tabsId = `lui-tabs-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Active tab value (controlled mode).
   * @default ''
   */
  @property({ type: String })
  value = '';

  /**
   * Initial active tab for uncontrolled mode.
   * Only used if value is not set.
   * @default ''
   */
  @property({ type: String, attribute: 'default-value' })
  defaultValue = '';

  /**
   * Disable all tabs.
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Accessible label for the tablist element.
   * Use when the tablist has no visible label.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * Orientation of the tablist for keyboard navigation.
   * Plan 02 will implement keyboard orientation logic.
   * @default 'horizontal'
   */
  @property({ type: String })
  orientation: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Tab activation mode for keyboard navigation.
   * Plan 02 will implement keyboard activation logic.
   * @default 'automatic'
   */
  @property({ type: String, attribute: 'activation-mode' })
  activationMode: 'automatic' | 'manual' = 'automatic';

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.defaultValue && !this.value) {
      this.value = this.defaultValue;
    }
  }

  /**
   * SSR slotchange workaround: after hydration, manually trigger
   * slotchange to discover children that were server-rendered.
   */
  protected override firstUpdated(): void {
    if (!isServer) {
      const slot = this.shadowRoot?.querySelector(
        'slot:not([name])'
      ) as HTMLSlotElement | null;
      if (slot) {
        slot.dispatchEvent(new Event('slotchange'));
      }
    }
  }

  /**
   * Sync panel states when value changes.
   */
  protected override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('value')) {
      this.syncPanelStates();
    }
  }

  /**
   * Discover child tab panels from slotchange event.
   * Filters for LUI-TAB-PANEL elements, syncs state, and auto-selects
   * the first non-disabled panel if no value is set.
   */
  private handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true });
    this.panels = assigned.filter(
      (el) => el.tagName === 'LUI-TAB-PANEL'
    ) as TabPanel[];

    // Auto-select first non-disabled panel if no value set
    if (!this.value && this.panels.length > 0) {
      const firstEnabled = this.panels.find((p) => !p.disabled);
      if (firstEnabled) {
        this.value = firstEnabled.value;
      }
    }

    this.syncPanelStates();
    this.requestUpdate();
  }

  /**
   * Handle click on a tab button.
   * Sets the active tab, syncs panel states, and dispatches ui-change event.
   */
  private handleTabClick(panelValue: string, panelDisabled: boolean): void {
    if (this.disabled || panelDisabled) return;

    this.value = panelValue;
    this.syncPanelStates();

    dispatchCustomEvent(this, 'ui-change', { value: this.value });
  }

  /**
   * Sync active state and ARIA attributes on all child panels.
   * Sets active, id, and aria-labelledby on each panel host element.
   */
  private syncPanelStates(): void {
    for (const panel of this.panels) {
      panel.active = panel.value === this.value;
      panel.id = `${this.tabsId}-panel-${panel.value}`;
      panel.setAttribute(
        'aria-labelledby',
        `${this.tabsId}-tab-${panel.value}`
      );
    }
  }

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
      }

      :host([disabled]) {
        opacity: 0.5;
        pointer-events: none;
      }

      [role='tablist'] {
        display: flex;
      }

      .tab-button {
        border: none;
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        font-size: inherit;
        padding: 0.5rem 1rem;
      }

      .tab-button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: -2px;
      }
    `,
  ];

  override render() {
    return html`
      <div
        class="tabs-wrapper"
        @ui-tab-panel-update=${() => this.requestUpdate()}
      >
        <div
          role="tablist"
          aria-orientation="${this.orientation}"
          aria-label="${this.label || nothing}"
        >
          ${this.panels.map(
            (panel) => html`
              <button
                id="${this.tabsId}-tab-${panel.value}"
                role="tab"
                aria-selected="${panel.value === this.value ? 'true' : 'false'}"
                aria-controls="${this.tabsId}-panel-${panel.value}"
                aria-disabled="${panel.disabled ? 'true' : nothing}"
                tabindex="${panel.value === this.value ? '0' : '-1'}"
                class="tab-button ${panel.value === this.value
                  ? 'tab-active'
                  : ''}"
                @click=${() => this.handleTabClick(panel.value, panel.disabled)}
              >
                ${panel.label}
              </button>
            `
          )}
        </div>
        <div class="panels-container">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `;
  }
}
