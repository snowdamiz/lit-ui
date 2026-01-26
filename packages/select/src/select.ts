/**
 * lui-select - A customizable select/dropdown component
 *
 * Features (Phase 32+):
 * - Single select with dropdown
 * - Keyboard navigation
 * - Form participation via ElementInternals
 * - SSR compatible
 * - Slotted lui-option and lui-option-group support (Phase 33)
 *
 * @example
 * ```html
 * <lui-select placeholder="Select an option">
 *   <lui-option value="1">Option 1</lui-option>
 * </lui-select>
 * ```
 *
 * @example
 * ```html
 * <lui-select placeholder="Select a food">
 *   <lui-option-group label="Fruits">
 *     <lui-option value="apple">Apple</lui-option>
 *   </lui-option-group>
 *   <lui-option-group label="Vegetables">
 *     <lui-option value="carrot">Carrot</lui-option>
 *   </lui-option-group>
 * </lui-select>
 * ```
 */

import { html, css, isServer, nothing } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
// Import Floating UI for dropdown positioning
import { computePosition, flip, shift, offset, size } from '@floating-ui/dom';
import { Option } from './option.js';

/**
 * Select size types for padding and font sizing
 */
export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * Option data interface for programmatic options
 */
export interface SelectOption {
  /** The value submitted when this option is selected */
  value: string;
  /** Display label for the option (falls back to value if not provided) */
  label: string;
  /** Whether this option is disabled and cannot be selected */
  disabled?: boolean;
}

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

  /**
   * Label text displayed above the select.
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * Array of options to display in the dropdown.
   * @default []
   */
  @property({ type: Array })
  options: SelectOption[] = [];

  /**
   * Whether the dropdown is currently open.
   */
  @state()
  private open = false;

  /**
   * Index of the currently active (keyboard-focused) option.
   */
  @state()
  private activeIndex = -1;

  /**
   * Slotted lui-option elements (from direct children or inside groups).
   * These take precedence over the options property if present.
   */
  @state()
  private slottedOptions: Option[] = [];

  /**
   * Whether the user has interacted with the select.
   */
  @state()
  private touched = false;

  /**
   * Whether to show validation error state.
   */
  @state()
  private showError = false;

  /**
   * Reference to the trigger element.
   */
  @query('.trigger')
  private triggerEl!: HTMLElement;

  /**
   * Reference to the listbox element.
   */
  @query('.listbox')
  private listboxEl!: HTMLElement;

  /**
   * Unique ID for ARIA references.
   */
  private selectId = `lui-select-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Type-ahead search string accumulator.
   */
  private typeaheadString = '';

  /**
   * Timeout handle for resetting type-ahead string.
   */
  private typeaheadTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Time in milliseconds before type-ahead string resets.
   */
  private static readonly TYPEAHEAD_RESET_MS = 500;

  /**
   * Mutation observer for detecting dynamically added options inside groups.
   */
  private mutationObserver: MutationObserver | null = null;

  constructor() {
    super();
    // Only attach internals on client (not during SSR)
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  /**
   * Validate the select and sync validity state to ElementInternals.
   * @returns true if valid, false if invalid
   */
  private validate(): boolean {
    if (!this.internals) return true;

    if (this.required && !this.value) {
      this.internals.setValidity(
        { valueMissing: true },
        'Please select an option',
        this.triggerEl
      );
      return false;
    }

    // Clear validity when valid
    this.internals.setValidity({});
    return true;
  }

  /**
   * Get the current validation error message.
   */
  private get errorMessage(): string {
    return this.internals?.validationMessage || '';
  }

  /**
   * Form lifecycle callback: reset the select to initial state.
   */
  formResetCallback(): void {
    this.value = '';
    this.touched = false;
    this.showError = false;
    this.internals?.setFormValue('');
    this.internals?.setValidity({});
  }

  /**
   * Form lifecycle callback: handle disabled state from form.
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * Handle blur events for validation display timing.
   */
  private handleBlur(): void {
    this.touched = true;
    const isValid = this.validate();
    this.showError = !isValid;
  }

  /**
   * Handle document clicks for closing dropdown when clicking outside.
   * Uses composedPath() to work correctly with Shadow DOM.
   */
  private handleDocumentClick = (e: MouseEvent): void => {
    if (!e.composedPath().includes(this)) {
      this.closeDropdown();
    }
  };

  /**
   * Handle slot change events to collect slotted options.
   * Detects lui-option children and options inside lui-option-group elements.
   */
  private handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true });

    // Collect options - both direct children and inside groups
    const options: Option[] = [];

    for (const el of assigned) {
      if (el.tagName === 'LUI-OPTION') {
        options.push(el as Option);
      } else if (el.tagName === 'LUI-OPTION-GROUP') {
        // Find options inside the group
        const groupOptions = el.querySelectorAll('lui-option');
        groupOptions.forEach((opt) => options.push(opt as Option));
      }
    }

    this.slottedOptions = options;

    // Attach click handlers to slotted options
    this.slottedOptions.forEach((opt, index) => {
      opt.removeEventListener('click', this.handleSlottedOptionClick);
      opt.addEventListener('click', this.handleSlottedOptionClick);
      // Store index as data attribute for click handling
      opt.dataset.optionIndex = String(index);
    });

    this.syncSlottedOptionStates();
    this.requestUpdate();
  }

  /**
   * Handle click on a slotted option element.
   */
  private handleSlottedOptionClick = (e: Event): void => {
    const target = e.currentTarget as Option;
    const index = parseInt(target.dataset.optionIndex || '0', 10);
    e.stopPropagation();
    this.selectOption(index);
  };

  /**
   * Sync selected state to slotted option elements.
   */
  private syncSlottedOptionStates(): void {
    for (const opt of this.slottedOptions) {
      opt.selected = opt.value === this.value;
    }
  }

  /**
   * Update active visual state on slotted options.
   */
  private syncSlottedActiveState(): void {
    this.slottedOptions.forEach((opt, idx) => {
      if (idx === this.activeIndex) {
        opt.setAttribute('data-active', 'true');
      } else {
        opt.removeAttribute('data-active');
      }
    });
  }

  /**
   * Get the effective options list.
   * Options property takes precedence over slotted options (backwards compatible).
   * Returns array of objects with value, label, disabled.
   */
  private get effectiveOptions(): SelectOption[] {
    // Options property takes precedence (backwards compatible)
    if (this.options.length > 0) {
      return this.options;
    }
    // Otherwise use slotted options
    return this.slottedOptions.map((opt) => ({
      value: opt.value,
      label: opt.getLabel(),
      disabled: opt.disabled,
    }));
  }

  /**
   * Check if using slotted mode (no options property, has slotted children).
   */
  private get isSlottedMode(): boolean {
    return this.options.length === 0 && this.slottedOptions.length > 0;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!isServer) {
      document.addEventListener('click', this.handleDocumentClick);
      // Sync initial value to form
      if (this.value) {
        this.internals?.setFormValue(this.value);
      }

      // Observe for dynamic option changes inside groups
      this.mutationObserver = new MutationObserver(() => {
        this.updateComplete.then(() => {
          // Re-query slotted options when children change
          const slot = this.shadowRoot?.querySelector(
            'slot:not([name])'
          ) as HTMLSlotElement;
          if (slot) {
            this.handleSlotChange({ target: slot } as unknown as Event);
          }
        });
      });
      this.mutationObserver.observe(this, { childList: true, subtree: true });
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (!isServer) {
      document.removeEventListener('click', this.handleDocumentClick);
      // Clear typeahead timeout
      if (this.typeaheadTimeout !== null) {
        clearTimeout(this.typeaheadTimeout);
        this.typeaheadTimeout = null;
      }
      // Disconnect mutation observer
      this.mutationObserver?.disconnect();
      this.mutationObserver = null;
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

      /* Selected value text */
      .selected-value {
        color: var(--ui-select-text);
      }

      /* Chevron icon */
      .chevron {
        flex-shrink: 0;
        width: 1em;
        height: 1em;
        opacity: 0.5;
        transition: transform 150ms;
      }

      /* Chevron rotation when open */
      .chevron-open {
        transform: rotate(180deg);
      }

      /* Listbox dropdown */
      .listbox {
        position: fixed;
        z-index: var(--ui-select-z-index, 50);
        min-width: 100%;
        max-height: var(--ui-select-dropdown-max-height, 240px);
        overflow-y: auto;
        border-radius: var(--ui-select-dropdown-radius);
        border: 1px solid var(--ui-select-dropdown-border);
        background-color: var(--ui-select-dropdown-bg);
        box-shadow: var(--ui-select-dropdown-shadow);
      }

      .listbox[hidden] {
        display: none;
      }

      /* Option items */
      .option {
        display: flex;
        align-items: center;
        padding: var(--ui-select-option-padding-y, 0.5rem)
          var(--ui-select-option-padding-x, 0.75rem);
        cursor: pointer;
        color: var(--ui-select-option-text);
        transition: background-color 150ms;
      }

      .option:hover:not(.option-disabled) {
        background-color: var(--ui-select-option-bg-hover);
      }

      .option-active {
        background-color: var(--ui-select-option-bg-active);
      }

      .option-selected {
        font-weight: 500;
      }

      .option-disabled {
        opacity: 0.5;
        cursor: not-allowed;
        color: var(--ui-select-option-text-disabled);
      }

      .check-icon {
        width: 1em;
        height: 1em;
        margin-right: 0.5rem;
        visibility: hidden;
      }

      .option-selected .check-icon {
        visibility: visible;
        color: var(--ui-select-option-check);
      }

      /* Slotted option active state */
      ::slotted([data-active='true']) {
        background-color: var(--ui-select-option-bg-active);
      }

      /* Select wrapper for label structure */
      .select-wrapper {
        display: flex;
        flex-direction: column;
      }

      /* Label styling - scales with size */
      .select-label {
        font-weight: 500;
        color: var(--ui-select-text);
        margin-bottom: 0.25rem;
      }

      .label-sm {
        font-size: var(--ui-select-font-size-sm);
      }

      .label-md {
        font-size: var(--ui-select-font-size-md);
      }

      .label-lg {
        font-size: var(--ui-select-font-size-lg);
      }

      .required-indicator {
        color: var(--ui-select-text-error, var(--color-destructive));
        margin-left: 0.125rem;
      }

      /* Error state */
      .trigger-error {
        border-color: var(--ui-select-border-error);
      }

      .trigger-error:focus {
        border-color: var(--ui-select-border-error);
      }

      /* Error text below select */
      .error-text {
        font-size: 0.875em;
        color: var(--ui-select-text-error, var(--color-destructive));
        margin-top: 0.25rem;
      }

      /* Visually hidden for screen reader only text */
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
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
    if (this.showError) {
      classes.push('trigger-error');
    }
    return classes.join(' ');
  }

  /**
   * Position the dropdown relative to the trigger using Floating UI.
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

  /**
   * Open the dropdown.
   */
  private openDropdown(): void {
    if (this.disabled || this.open) return;

    this.open = true;

    // Set active to selected option or first enabled
    const opts = this.effectiveOptions;
    const selectedIdx = opts.findIndex((o) => o.value === this.value);
    this.activeIndex =
      selectedIdx >= 0 ? selectedIdx : this.findFirstEnabledIndex();

    this.requestUpdate();

    // Position after render
    this.updateComplete.then(() => {
      this.positionDropdown(this.triggerEl, this.listboxEl);
      // Sync active state for slotted options
      if (this.isSlottedMode) {
        this.syncSlottedActiveState();
      }
    });
  }

  /**
   * Close the dropdown.
   */
  private closeDropdown(): void {
    if (!this.open) return;

    this.open = false;
    this.activeIndex = -1;

    // Clear active state on slotted options
    if (this.isSlottedMode) {
      this.slottedOptions.forEach((opt) => opt.removeAttribute('data-active'));
    }

    this.triggerEl?.focus();
  }

  /**
   * Find the index of the first enabled option.
   */
  private findFirstEnabledIndex(): number {
    return this.effectiveOptions.findIndex((o) => !o.disabled);
  }

  /**
   * Handle trigger click to toggle dropdown.
   */
  private handleTriggerClick(): void {
    if (this.open) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Handle keydown events for keyboard navigation following W3C APG.
   */
  private handleKeydown(e: KeyboardEvent): void {
    const key = e.key;

    // Handle closed state
    if (!this.open) {
      switch (key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.openDropdown();
          if (key === 'ArrowUp') {
            this.focusLastEnabledOption();
          } else {
            this.focusFirstEnabledOption();
          }
          break;
        case 'Home':
          e.preventDefault();
          this.openDropdown();
          this.focusFirstEnabledOption();
          break;
        case 'End':
          e.preventDefault();
          this.openDropdown();
          this.focusLastEnabledOption();
          break;
        default:
          // Printable character - type-ahead
          if (this.isPrintableCharacter(key)) {
            e.preventDefault();
            this.openDropdown();
            this.handleTypeahead(key);
          }
      }
      return;
    }

    // Handle open state
    switch (key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusNextEnabledOption();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusPreviousEnabledOption();
        break;
      case 'Home':
        e.preventDefault();
        this.focusFirstEnabledOption();
        break;
      case 'End':
        e.preventDefault();
        this.focusLastEnabledOption();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectOption(this.activeIndex);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.closeDropdown();
        break;
      case 'Tab':
        // Select current and close on Tab (don't prevent default - let Tab proceed)
        if (this.activeIndex >= 0) {
          this.selectOption(this.activeIndex);
        } else {
          this.closeDropdown();
        }
        break;
      default:
        // Printable character - type-ahead
        if (this.isPrintableCharacter(key)) {
          e.preventDefault();
          this.handleTypeahead(key);
        }
    }
  }

  /**
   * Check if a key is a printable character (for type-ahead).
   */
  private isPrintableCharacter(key: string): boolean {
    return key.length === 1 && !key.match(/[\x00-\x1f\x7f]/);
  }

  /**
   * Handle type-ahead character input.
   * Accumulates characters for 500ms then resets.
   * Repeated same character cycles through matches.
   */
  private handleTypeahead(char: string): void {
    // Clear previous timeout
    if (this.typeaheadTimeout !== null) {
      clearTimeout(this.typeaheadTimeout);
    }

    // Append character to search string
    this.typeaheadString += char.toLowerCase();

    // Find matching option
    const matchIndex = this.findTypeaheadMatch(this.typeaheadString);
    if (matchIndex >= 0) {
      this.setActiveIndex(matchIndex);
    }

    // Set timeout to reset string after 500ms
    this.typeaheadTimeout = setTimeout(() => {
      this.typeaheadString = '';
      this.typeaheadTimeout = null;
    }, Select.TYPEAHEAD_RESET_MS);
  }

  /**
   * Find an option matching the type-ahead search string.
   * If repeating the same character (e.g., "aaa"), cycles through matches.
   */
  private findTypeaheadMatch(searchString: string): number {
    // Get enabled options with their original indices
    const opts = this.effectiveOptions;
    const enabledOptions = opts
      .map((opt, idx) => ({ opt, idx }))
      .filter(({ opt }) => !opt.disabled);

    if (enabledOptions.length === 0) return -1;

    // If repeating same character (e.g., "aaa"), cycle through matches
    const isRepeatedChar =
      searchString.length > 1 &&
      searchString.split('').every((c) => c === searchString[0]);

    if (isRepeatedChar) {
      const char = searchString[0];
      const matches = enabledOptions.filter(({ opt }) =>
        (opt.label || opt.value).toLowerCase().startsWith(char)
      );

      if (matches.length > 0) {
        // Find current position in matches
        const currentMatchIdx = matches.findIndex(
          ({ idx }) => idx === this.activeIndex
        );
        // Move to next match (wrap around)
        const nextMatchIdx = (currentMatchIdx + 1) % matches.length;
        return matches[nextMatchIdx].idx;
      }
      return -1;
    }

    // Otherwise find first match for full string
    const match = enabledOptions.find(({ opt }) =>
      (opt.label || opt.value).toLowerCase().startsWith(searchString)
    );

    return match?.idx ?? -1;
  }

  /**
   * Focus the first enabled option.
   */
  private focusFirstEnabledOption(): void {
    const opts = this.effectiveOptions;
    const index = opts.findIndex((o) => !o.disabled);
    if (index >= 0) {
      this.setActiveIndex(index);
    }
  }

  /**
   * Focus the last enabled option.
   */
  private focusLastEnabledOption(): void {
    const opts = this.effectiveOptions;
    for (let i = opts.length - 1; i >= 0; i--) {
      if (!opts[i].disabled) {
        this.setActiveIndex(i);
        return;
      }
    }
  }

  /**
   * Focus the next enabled option (wraps to first).
   */
  private focusNextEnabledOption(): void {
    const opts = this.effectiveOptions;
    for (let i = this.activeIndex + 1; i < opts.length; i++) {
      if (!opts[i].disabled) {
        this.setActiveIndex(i);
        return;
      }
    }
    // Wrap to first if at end
    this.focusFirstEnabledOption();
  }

  /**
   * Focus the previous enabled option (wraps to last).
   */
  private focusPreviousEnabledOption(): void {
    const opts = this.effectiveOptions;
    for (let i = this.activeIndex - 1; i >= 0; i--) {
      if (!opts[i].disabled) {
        this.setActiveIndex(i);
        return;
      }
    }
    // Wrap to last if at beginning
    this.focusLastEnabledOption();
  }

  /**
   * Set the active option index and scroll into view.
   */
  private setActiveIndex(index: number): void {
    this.activeIndex = index;

    // Sync active state for slotted options
    if (this.isSlottedMode) {
      this.syncSlottedActiveState();
      // Scroll slotted option into view
      const opt = this.slottedOptions[index];
      opt?.scrollIntoView({ block: 'nearest' });
    } else {
      // Scroll property-based option into view
      this.updateComplete.then(() => {
        const optionEl = this.shadowRoot?.getElementById(
          `${this.selectId}-option-${index}`
        );
        optionEl?.scrollIntoView({ block: 'nearest' });
      });
    }
  }

  /**
   * Select an option by index.
   */
  private selectOption(index: number): void {
    const opts = this.effectiveOptions;
    const option = opts[index];
    if (!option || option.disabled) return;

    this.value = option.value;

    // Update form value
    this.internals?.setFormValue(this.value);

    // Sync slotted option states
    this.syncSlottedOptionStates();

    // Validate after selection
    if (this.touched) {
      const isValid = this.validate();
      this.showError = !isValid;
    }

    this.closeDropdown();

    // Dispatch change event
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle option click to select it.
   */
  private handleOptionClick(e: MouseEvent, index: number): void {
    e.stopPropagation();
    this.selectOption(index);
  }

  /**
   * Get the display label for the currently selected value.
   */
  private getSelectedLabel(): string {
    const opts = this.effectiveOptions;
    const selected = opts.find((o) => o.value === this.value);
    return selected?.label || selected?.value || '';
  }

  /**
   * Get the label of the currently active option for ARIA live region.
   */
  private getActiveOptionLabel(): string {
    const opts = this.effectiveOptions;
    if (this.activeIndex < 0 || this.activeIndex >= opts.length) {
      return '';
    }
    const option = opts[this.activeIndex];
    return option.label || option.value;
  }

  /**
   * Get the count of enabled options.
   */
  private getEnabledOptionsCount(): number {
    return this.effectiveOptions.filter((o) => !o.disabled).length;
  }

  /**
   * Render an individual option.
   */
  private renderOption(option: SelectOption, index: number) {
    const isActive = index === this.activeIndex;
    const isSelected = option.value === this.value;
    const classes = ['option'];
    if (isActive) classes.push('option-active');
    if (isSelected) classes.push('option-selected');
    if (option.disabled) classes.push('option-disabled');

    return html`
      <div
        id="${this.selectId}-option-${index}"
        role="option"
        aria-selected=${isSelected ? 'true' : 'false'}
        aria-disabled=${option.disabled ? 'true' : 'false'}
        class=${classes.join(' ')}
        @click=${(e: MouseEvent) => this.handleOptionClick(e, index)}
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
        <span>${option.label || option.value}</span>
      </div>
    `;
  }

  override render() {
    const selectedLabel = this.getSelectedLabel();
    const listboxId = `${this.selectId}-listbox`;

    return html`
      <div class="select-wrapper">
        ${this.label
          ? html`
              <label for=${this.selectId} class="select-label label-${this.size}">
                ${this.label}
                ${this.required
                  ? html`<span class="required-indicator">*</span>`
                  : nothing}
              </label>
            `
          : nothing}

        <div
          id=${this.selectId}
          class=${this.getTriggerClasses()}
          role="combobox"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-haspopup="listbox"
          aria-controls=${listboxId}
          aria-activedescendant=${this.open && this.activeIndex >= 0
            ? this.isSlottedMode
              ? this.slottedOptions[this.activeIndex]?.getId() || ''
              : `${this.selectId}-option-${this.activeIndex}`
            : ''}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-invalid=${this.showError ? 'true' : nothing}
          tabindex=${this.disabled ? '-1' : '0'}
          @click=${this.handleTriggerClick}
          @keydown=${this.handleKeydown}
          @blur=${this.handleBlur}
        >
          ${selectedLabel
            ? html`<span class="selected-value">${selectedLabel}</span>`
            : html`<span class="placeholder">${this.placeholder}</span>`}
          <svg
            class="chevron ${this.open ? 'chevron-open' : ''}"
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

        <!-- Dropdown listbox -->
        <div
          id=${listboxId}
          class="listbox"
          role="listbox"
          aria-labelledby=${this.selectId}
          ?hidden=${!this.open}
        >
          ${this.options.length > 0
            ? this.options.map((option, index) =>
                this.renderOption(option, index)
              )
            : html`<slot @slotchange=${this.handleSlotChange}></slot>`}
        </div>

        ${this.showError && this.errorMessage
          ? html`<span class="error-text" role="alert">${this.errorMessage}</span>`
          : nothing}
      </div>

      <!-- ARIA live region -->
      <div role="status" aria-live="polite" aria-atomic="true" class="visually-hidden">
        ${this.open && this.activeIndex >= 0
          ? `${this.getActiveOptionLabel()}, ${this.activeIndex + 1} of ${this.getEnabledOptionsCount()}`
          : ''}
      </div>
    `;
  }
}
