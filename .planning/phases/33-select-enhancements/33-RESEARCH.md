# Phase 33: Select Enhancements - Research

**Researched:** 2026-01-26
**Domain:** Option groups, custom option content via slots, clearable select
**Confidence:** HIGH

## Summary

Phase 33 extends the core single-select component from Phase 32 with three enhancement features: option groups with headers (`lui-option-group`), custom content in options via slots (icons, descriptions), and a clearable prop with X button to reset selection.

The research confirms that implementing these enhancements requires:
1. **Option Groups** - Use `role="group"` with `aria-labelledby` per W3C APG listbox with grouped options pattern. Each group contains a label element (not focusable via arrow keys) and option children.
2. **Custom Content via Slots** - Transition from property-based options to slot-based rendering. Support `start` and `end` slots in lui-option for icons. Options should remain selectable with keyboard navigation working correctly.
3. **Clearable Select** - Add clear button inside trigger, visible when value selected. Button must be keyboard accessible (`<button type="button">`), announce "Clear selection" to screen readers.

**Primary recommendation:** Create `lui-option-group` component with proper ARIA grouping, register the existing `lui-option` component for slot-based usage with named slots for custom content, and add `clearable` prop following the existing Input component's clear button pattern.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lit | ^3.3.2 | Web component framework | Existing LitUI framework |
| @lit-ui/core | ^1.0.0 | TailwindElement base class | LitUI architecture |
| @floating-ui/dom | ^1.7.4 | Dropdown positioning | Already installed in Phase 31 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | - | No additional libraries needed for Phase 33 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `role="group"` | No grouping ARIA | Groups improve accessibility; required for A11Y-05 |
| Named slots | Render prop function | Slots are web component native; cleaner API |
| Clear button in trigger | External clear button | In-trigger is standard UX pattern, matches Input component |

**Installation:** No new packages needed.

## Architecture Patterns

### Recommended Component Structure

```
packages/select/src/
├── index.ts           # Entry point - add lui-option, lui-option-group registration
├── select.ts          # Main Select component (modify to support slots)
├── option.ts          # lui-option component (enhance with slots)
├── option-group.ts    # NEW: lui-option-group component
├── jsx.d.ts           # JSX type definitions (update for new components)
└── vite-env.d.ts      # Vite environment types (exists)
```

### Pattern 1: Option Group ARIA Structure

**What:** Proper ARIA grouping with role="group" and aria-labelledby
**When to use:** Always when displaying grouped options

```html
<!-- Source: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-grouped/ -->
<div role="listbox" aria-labelledby="select-label" aria-activedescendant="opt-1">
  <div role="group" aria-labelledby="group-1-label">
    <div id="group-1-label" role="presentation" aria-hidden="true" class="group-label">
      Fruits
    </div>
    <div role="option" id="opt-1" aria-selected="false">Apple</div>
    <div role="option" id="opt-2" aria-selected="true">Banana</div>
  </div>
  <div role="group" aria-labelledby="group-2-label">
    <div id="group-2-label" role="presentation" aria-hidden="true" class="group-label">
      Vegetables
    </div>
    <div role="option" id="opt-3" aria-selected="false">Carrot</div>
  </div>
</div>
```

**Critical ARIA requirements:**
- Group element uses `role="group"` (allowed in listbox per ARIA 1.2)
- Group label uses `aria-hidden="true"` (screen readers read via aria-labelledby)
- Group label is NOT focusable via arrow keys (skipped during navigation)
- Options inside groups still use `role="option"` with unique IDs

### Pattern 2: lui-option-group Component

**What:** Web component wrapping grouped options
**When to use:** Organizing options into labeled sections

```typescript
// Source: Radix UI SelectGroup pattern adapted for Lit
import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export class OptionGroup extends TailwindElement {
  /**
   * Label text for the group header.
   */
  @property({ type: String })
  label = '';

  /**
   * Unique ID for aria-labelledby reference.
   */
  private groupId = `lui-option-group-${Math.random().toString(36).substr(2, 9)}`;

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
      }

      .group-label {
        padding: var(--ui-select-option-padding-y, 0.5rem) var(--ui-select-option-padding-x, 0.75rem);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ui-select-option-text-disabled);
        user-select: none;
      }

      .group-separator {
        height: 1px;
        background-color: var(--ui-select-dropdown-border);
        margin: 0.25rem 0;
      }
    `,
  ];

  override render() {
    return html`
      <div role="group" aria-labelledby=${this.groupId}>
        ${this.label
          ? html`
              <div
                id=${this.groupId}
                class="group-label"
                role="presentation"
                aria-hidden="true"
              >
                ${this.label}
              </div>
            `
          : nothing}
        <slot></slot>
      </div>
    `;
  }
}
```

### Pattern 3: Custom Content in Options via Slots

**What:** Named slots in lui-option for icons and descriptions
**When to use:** Adding visual elements to options

```typescript
// Source: Web Awesome select option pattern
export class Option extends TailwindElement {
  @property({ type: String }) value = '';
  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) selected = false;

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
      }

      .option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: var(--ui-select-option-padding-y, 0.5rem)
          var(--ui-select-option-padding-x, 0.75rem);
        cursor: pointer;
      }

      .option-start {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      .option-content {
        flex: 1;
        min-width: 0; /* Allow text truncation */
      }

      .option-end {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      .option-description {
        font-size: 0.75rem;
        color: var(--ui-select-option-text-disabled);
        margin-top: 0.125rem;
      }

      ::slotted([slot="start"]) {
        width: 1em;
        height: 1em;
      }

      ::slotted([slot="end"]) {
        width: 1em;
        height: 1em;
      }
    `,
  ];

  override render() {
    return html`
      <div
        role="option"
        aria-selected=${this.selected ? 'true' : 'false'}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        class="option ${this.disabled ? 'option-disabled' : ''} ${this.selected ? 'option-selected' : ''}"
      >
        <span class="option-start">
          <slot name="start"></slot>
        </span>
        <span class="option-content">
          <span class="option-label">${this.label || html`<slot></slot>`}</span>
          <slot name="description"></slot>
        </span>
        <span class="option-end">
          <slot name="end"></slot>
        </span>
      </div>
    `;
  }
}
```

**Usage example:**
```html
<lui-select>
  <lui-option value="email">
    <svg slot="start"><!-- email icon --></svg>
    Email
    <span slot="description">Send notification via email</span>
  </lui-option>
  <lui-option value="sms">
    <svg slot="start"><!-- phone icon --></svg>
    SMS
  </lui-option>
</lui-select>
```

### Pattern 4: Clearable Select with Clear Button

**What:** X button to reset selection, keyboard accessible
**When to use:** When `clearable` prop is true and value is selected

```typescript
// Source: Existing LitUI Input component clear button pattern
@property({ type: Boolean })
clearable = false;

private xCircleIcon = svg`
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
`;

private handleClear(e: Event): void {
  e.stopPropagation(); // Don't open dropdown
  this.value = '';
  this.internals?.setFormValue('');

  // Validate after clearing
  if (this.touched) {
    const isValid = this.validate();
    this.showError = !isValid;
  }

  // Emit clear event
  this.dispatchEvent(new CustomEvent('clear', { bubbles: true, composed: true }));

  // Focus trigger after clearing
  this.triggerEl?.focus();
}

private renderClearButton() {
  if (!this.clearable || !this.value) return nothing;

  return html`
    <button
      type="button"
      class="clear-button"
      aria-label="Clear selection"
      @click=${this.handleClear}
      @keydown=${(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleClear(e);
        }
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" class="clear-icon">
        ${this.xCircleIcon}
      </svg>
    </button>
  `;
}
```

**CSS for clear button (following Input pattern):**
```css
.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  margin-left: 0.25rem;
  border: none;
  background: transparent;
  color: var(--ui-select-placeholder);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color 150ms, background-color 150ms;
}

.clear-button:hover {
  color: var(--ui-select-text);
  background-color: var(--color-muted);
}

.clear-button:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 1px;
}

.clear-icon {
  width: 1em;
  height: 1em;
}
```

### Pattern 5: Transitioning Select to Support Slot-Based Options

**What:** Modify Select to render slotted lui-option children
**When to use:** Phase 33 - enables custom content in options

```typescript
// Mixed mode: support both options prop AND slotted children
@property({ type: Array })
options: SelectOption[] = [];

@state()
private slottedOptions: Option[] = [];

private handleSlotChange(e: Event): void {
  const slot = e.target as HTMLSlotElement;
  this.slottedOptions = slot
    .assignedElements({ flatten: true })
    .filter((el): el is Option => el.tagName === 'LUI-OPTION');

  // Update keyboard navigation indices
  this.requestUpdate();
}

private getAllOptions(): Array<{ value: string; label: string; disabled: boolean; element?: HTMLElement }> {
  // If options prop provided, use those (backwards compatibility)
  if (this.options.length > 0) {
    return this.options.map(o => ({
      value: o.value,
      label: o.label,
      disabled: o.disabled || false,
    }));
  }

  // Otherwise use slotted options
  return this.slottedOptions.map(opt => ({
    value: opt.value,
    label: opt.label || opt.textContent?.trim() || opt.value,
    disabled: opt.disabled,
    element: opt,
  }));
}

// In render():
private renderListbox() {
  if (this.options.length > 0) {
    // Render from options prop (Phase 32 behavior)
    return this.options.map((option, index) => this.renderOption(option, index));
  }

  // Render slotted content
  return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
}
```

### Anti-Patterns to Avoid

- **Using `<optgroup>` semantics on `<div>`:** Native optgroup is for `<select>`, use `role="group"` for custom implementation
- **Making group labels focusable:** Labels should be skipped during arrow key navigation
- **Forgetting aria-labelledby on groups:** Each group needs its label referenced
- **Clear button as link or div:** Must be `<button type="button">` for keyboard accessibility
- **Clear button opening dropdown:** Must stop event propagation

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Option group ARIA | Custom roles | `role="group"` + `aria-labelledby` | Standard pattern, screen reader tested |
| Clear button semantics | `<div onclick>` | `<button type="button">` | Native keyboard support, focus management |
| Slot change detection | MutationObserver | `@slotchange` event | Built into Lit, more efficient |
| Option text extraction | innerHTML parsing | `textContent` or label property | Simpler, safer |

**Key insight:** The complexity in Phase 33 is in correctly structuring ARIA relationships and managing the transition from property-based to slot-based options while maintaining backwards compatibility.

## Common Pitfalls

### Pitfall 1: Group Labels Receiving Keyboard Focus

**What goes wrong:** Arrow key navigation stops on group labels instead of moving to next option
**Why it happens:** Group labels rendered as options or missing skip logic
**How to avoid:** Group labels have `role="presentation"` or are not included in navigation array. Keyboard navigation should only include elements with `role="option"`.
**Warning signs:** Users can "select" a group header

### Pitfall 2: Missing aria-labelledby on Groups

**What goes wrong:** Screen readers don't announce group names
**Why it happens:** Group label ID not properly referenced
**How to avoid:** Each `role="group"` element must have `aria-labelledby` pointing to its label element ID
**Warning signs:** VoiceOver just says "group" without context

### Pitfall 3: Clear Button Triggering Dropdown

**What goes wrong:** Clicking clear opens the dropdown instead of just clearing
**Why it happens:** Click event bubbles to trigger element
**How to avoid:** Call `e.stopPropagation()` in clear button handler
**Warning signs:** Dropdown flashes open then closes after clear

### Pitfall 4: Clear Button Not Keyboard Accessible

**What goes wrong:** Users can't Tab to clear button or activate with Enter/Space
**Why it happens:** Using `<div>` instead of `<button>`, missing tabindex
**How to avoid:** Use semantic `<button type="button">` element
**Warning signs:** Tab skips clear button; screen reader doesn't announce as button

### Pitfall 5: Slot-Based Options Breaking Type-Ahead

**What goes wrong:** Type-ahead search doesn't find slotted options
**Why it happens:** Options array is empty when using slots; text extraction fails
**How to avoid:** Build options list from both `options` prop AND slotted elements. Extract text via `option.label || option.textContent`.
**Warning signs:** Type-ahead works with options prop but not slots

### Pitfall 6: Custom Content Breaking Option Height

**What goes wrong:** Options with icons/descriptions have inconsistent heights
**Why it happens:** Flex layout not constrained; descriptions wrap unexpectedly
**How to avoid:** Set `min-height` on options, use `text-overflow: ellipsis` for long content
**Warning signs:** Jumpy dropdown height, horizontal scrolling in options

## Code Examples

### Complete lui-option-group Component

```typescript
// Source: W3C APG grouped listbox pattern adapted for Lit
import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export class OptionGroup extends TailwindElement {
  @property({ type: String })
  label = '';

  private groupId = `lui-option-group-${Math.random().toString(36).substr(2, 9)}`;

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
      }

      :host(:not(:first-child)) {
        border-top: 1px solid var(--ui-select-dropdown-border);
        margin-top: 0.25rem;
        padding-top: 0.25rem;
      }

      .group-label {
        padding: 0.375rem var(--ui-select-option-padding-x, 0.75rem);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ui-select-option-text-disabled);
        user-select: none;
        pointer-events: none;
      }
    `,
  ];

  override render() {
    return html`
      <div role="group" aria-labelledby=${this.groupId}>
        ${this.label
          ? html`
              <div
                id=${this.groupId}
                class="group-label"
                role="presentation"
                aria-hidden="true"
              >
                ${this.label}
              </div>
            `
          : nothing}
        <slot></slot>
      </div>
    `;
  }
}
```

### Enhanced lui-option with Slots

```typescript
// Source: Existing lui-option + Web Awesome slot pattern
import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export class Option extends TailwindElement {
  @property({ type: String }) value = '';
  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) selected = false;

  private optionId = `lui-option-${Math.random().toString(36).substr(2, 9)}`;

  getId(): string {
    return this.optionId;
  }

  getLabel(): string {
    return this.label || this.textContent?.trim() || this.value;
  }

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
        gap: 0.5rem;
        padding: var(--ui-select-option-padding-y, 0.5rem)
          var(--ui-select-option-padding-x, 0.75rem);
        cursor: pointer;
        color: var(--ui-select-option-text);
        background-color: transparent;
        transition: background-color 150ms;
        min-height: var(--ui-select-option-height, 2.25rem);
      }

      :host(:hover) .option:not(.option-disabled) {
        background-color: var(--ui-select-option-bg-hover);
      }

      .option-active {
        background-color: var(--ui-select-option-bg-active);
      }

      .option-selected {
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
        flex-shrink: 0;
        color: var(--ui-select-option-check);
        visibility: hidden;
      }

      .option-selected .check-icon {
        visibility: visible;
      }

      .slot-start {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .option-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .option-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .slot-end {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      ::slotted([slot="start"]) {
        width: 1.25em;
        height: 1.25em;
      }

      ::slotted([slot="description"]) {
        font-size: 0.75rem;
        color: var(--ui-select-option-text-disabled);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ];

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
        <span class="slot-start">
          <slot name="start"></slot>
        </span>
        <span class="option-content">
          <span class="option-label">${this.label || html`<slot></slot>`}</span>
          <slot name="description"></slot>
        </span>
        <span class="slot-end">
          <slot name="end"></slot>
        </span>
      </div>
    `;
  }
}
```

### Clearable Select Integration

```typescript
// In Select component - add to trigger rendering
private renderTrigger() {
  return html`
    <div
      class=${this.getTriggerClasses()}
      role="combobox"
      aria-expanded=${this.open ? 'true' : 'false'}
      tabindex=${this.disabled ? '-1' : '0'}
      ...
    >
      ${this.value
        ? html`<span class="selected-value">${this.getSelectedLabel()}</span>`
        : html`<span class="placeholder">${this.placeholder}</span>`}

      <div class="trigger-actions">
        ${this.clearable && this.value ? this.renderClearButton() : nothing}
        <svg class="chevron ${this.open ? 'chevron-open' : ''}" ...>
          <!-- chevron icon -->
        </svg>
      </div>
    </div>
  `;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Property-only options | Slot-based + property fallback | Phase 33 | Enables custom content |
| No grouping support | role="group" + aria-labelledby | ARIA 1.2 | Screen reader announces groups |
| `<div onclick>` clear | `<button type="button">` clear | Best practice | Keyboard accessible |

**Deprecated/outdated:**
- `<optgroup>` styling in custom select: Use ARIA groups instead
- Rendering all options via property: Support both property AND slots

## Open Questions

1. **Backwards compatibility approach**
   - What we know: Phase 32 uses `options` property for all options
   - What's unclear: Should we deprecate options prop or keep both forever?
   - Recommendation: Support both - options prop for simple cases, slots for custom content. No deprecation.

2. **Clear button position**
   - What we know: Input has clear button before suffix slot
   - What's unclear: Should Select clear button be before or after chevron?
   - Recommendation: Clear button before chevron (matches Input pattern and Shoelace/Web Awesome)

3. **Option group collapsibility**
   - What we know: A11Y-05 only requires groups with headers, not collapsible
   - What's unclear: Is collapsible groups needed in future phases?
   - Recommendation: Keep groups always expanded in Phase 33; defer collapsibility

## Sources

### Primary (HIGH confidence)
- [W3C APG Listbox with Grouped Options](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-grouped/) - ARIA grouping pattern
- [Radix UI Select](https://www.radix-ui.com/primitives/docs/components/select) - SelectGroup/SelectLabel pattern
- [Web Awesome Select](https://webawesome.com/docs/components/select/) - Slot-based icons, clearable
- Existing LitUI Input component - Clear button implementation

### Secondary (MEDIUM confidence)
- [MDN ARIA listbox role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/listbox_role) - Group role support
- [W3C ARIA Issue #719](https://github.com/w3c/aria/issues/719) - Groups in listbox discussion
- [React Select Issue #4988](https://github.com/JedWatson/react-select/issues/4988) - Clear button accessibility

### Prior Research (HIGH confidence)
- `.planning/research/FEATURES-SELECT.md` - Feature prioritization (option groups, custom content)
- `.planning/research/PITFALLS-SELECT.md` - Pitfall #17 on slotted options accessibility
- `.planning/phases/32-core-single-select/32-RESEARCH.md` - Phase 32 patterns to build on

## Metadata

**Confidence breakdown:**
- Option groups: HIGH - W3C APG provides exact specification
- Custom content slots: HIGH - Standard web component pattern
- Clearable: HIGH - Following existing Input component pattern
- Backwards compatibility: MEDIUM - Need to verify slot change detection works correctly

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable ARIA patterns)
