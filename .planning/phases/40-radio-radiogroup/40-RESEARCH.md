# Phase 40: Radio + RadioGroup - Research

**Researched:** 2026-01-27
**Domain:** Accessible radio and radio-group web components with Lit, ElementInternals on group, roving tabindex, mutual exclusion, and animated dot transition
**Confidence:** HIGH

## Summary

The Radio + RadioGroup phase builds on Phase 39 (Checkbox + CheckboxGroup) but inverts the form-participation model: the **RadioGroup** is form-associated (owns `ElementInternals`, calls `setFormValue`), while individual **Radio** elements are NOT form-associated. This is the critical architectural difference from CheckboxGroup (where each checkbox submits independently). The inversion is necessary because native radio mutual exclusion relies on browser-internal name-based grouping that cannot work across Shadow DOM boundaries -- the group must own state management.

RadioGroup introduces the **roving tabindex** keyboard pattern, which is new to the codebase. In roving tabindex, only one radio has `tabindex="0"` (the checked one, or the first if none checked); all others have `tabindex="-1"`. Arrow keys move focus AND selection simultaneously with wrapping. Tab exits the group entirely. This differs fundamentally from CheckboxGroup where each checkbox is an independent tab stop.

The Radio component itself is visually simpler than Checkbox (no indeterminate state, no SVG path animation). The selection indicator is a filled circle (dot) inside a circular border, animated via CSS `transform: scale()` transition. The component shares the same base patterns as Checkbox: `TailwindElement` base class, `--ui-radio-*` CSS design tokens, `dispatchCustomEvent` for events, label via property or slot, three size variants, SSR compatibility via `isServer` guards.

**Primary recommendation:** Build `@lit-ui/radio` package containing both `lui-radio` and `lui-radio-group`. RadioGroup is form-associated (ElementInternals); individual radios are NOT. RadioGroup manages mutual exclusion, roving tabindex keyboard navigation, and form submission. Radio is a presentational child that reports selection to the group via `ui-radio-change` events. Follow Checkbox package structure exactly for files, registration, JSX types, and build config.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `lit` | ^3.3.2 | Web component framework | Already used by all components |
| `@lit-ui/core` | workspace:* | TailwindElement base class, dispatchCustomEvent, isServer | Established base for all components |
| `tailwindcss` | ^4.1.18 | Utility CSS + design tokens | Already used by all components |
| `@tailwindcss/vite` | ^4.1.18 | Vite plugin for Tailwind | Build tooling |
| `vite` | ^7.3.1 | Build tool | Already used by all packages |
| `vite-plugin-dts` | ^4.5.4 | TypeScript declaration generation | Already used by all packages |
| `typescript` | ^5.9.3 | Type checking | Already used |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@lit-ui/vite-config` | workspace:* | Shared `createLibraryConfig()` | Build config (vite.config.ts) |
| `@lit-ui/typescript-config` | workspace:* | Shared tsconfig | TypeScript config |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| RadioGroup as form participant | Each Radio as form participant | Breaks mutual exclusion across Shadow DOM; group MUST own form value (architecture decision) |
| Roving tabindex | aria-activedescendant | aria-activedescendant cannot cross Shadow DOM; poor VoiceOver support for radio groups; roving tabindex is W3C APG recommended |
| CSS scale transition for dot | SVG animation | Overkill for a simple circle; CSS transform is simpler, more performant, zero dependencies |
| Internal event `ui-radio-change` | Shared `ui-change` for internal | Separate internal event avoids confusion with consumer-facing `ui-change` on the group |

**Installation:** No new packages needed. Package created with existing workspace dependencies.

## Architecture Patterns

### Recommended Project Structure
```
packages/radio/
  src/
    radio.ts              # lui-radio element (NOT form-associated)
    radio-group.ts        # lui-radio-group element (form-associated)
    index.ts              # Exports + safe element registration for both
    jsx.d.ts              # JSX type declarations (React, Vue, Svelte)
    vite-env.d.ts         # Vite client types
  package.json            # @lit-ui/radio
  tsconfig.json
  vite.config.ts          # Uses createLibraryConfig()
```

This matches the `@lit-ui/checkbox` package pattern where related elements ship in one package.

### Pattern 1: RadioGroup Owns Form Participation (NOT Individual Radios)
**What:** `RadioGroup` has `static formAssociated = true` and manages `ElementInternals`. Individual `Radio` elements are NOT form-associated. The group calls `setFormValue()` with the selected radio's value.
**When to use:** Always -- this is the foundational architecture decision.
**Source:** `.planning/research/ARCHITECTURE-TOGGLES.md` (prior architecture decision, HIGH confidence)

```typescript
// RadioGroup owns the form value
export class RadioGroup extends TailwindElement {
  static formAssociated = true;
  private internals: ElementInternals | null = null;
  private defaultValue = '';

  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) label = '';
  @property({ type: String }) error = '';

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.value;
    this.updateFormValue();
  }

  private updateFormValue(): void {
    this.internals?.setFormValue(this.value || null);
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncChildStates();
    this.updateFormValue();
    this.touched = false;
    this.showError = false;
    this.internals?.setValidity({});
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
    this.syncDisabledState();
  }
}

// Radio does NOT participate in forms
export class Radio extends TailwindElement {
  // NO static formAssociated
  // NO internals
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) label = '';
  @property({ type: String }) size: RadioSize = 'md';
}
```

### Pattern 2: Roving Tabindex Keyboard Navigation
**What:** Only the checked radio (or first non-disabled if none checked) has `tabindex="0"`. All others have `tabindex="-1"`. Arrow keys move focus AND select. Tab exits the group. Arrow keys wrap at boundaries.
**When to use:** RadioGroup keyboard handling.
**Source:** [W3C APG Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) (HIGH confidence)

```typescript
// RadioGroup manages roving tabindex
private radios: Radio[] = [];

private updateRovingTabindex(): void {
  const checkedRadio = this.radios.find(r => r.checked && !r.disabled);
  const firstEnabled = this.radios.find(r => !r.disabled);
  const focusTarget = checkedRadio || firstEnabled;

  for (const radio of this.radios) {
    // Set tabindex on the host element (lui-radio), not on shadow internals
    radio.tabIndex = (radio === focusTarget) ? 0 : -1;
  }
}

private handleKeyDown(e: KeyboardEvent): void {
  const arrowKeys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];
  if (!arrowKeys.includes(e.key)) return;
  e.preventDefault();

  const enabledRadios = this.radios.filter(r => !r.disabled);
  if (enabledRadios.length === 0) return;

  const currentIndex = enabledRadios.findIndex(r => r.tabIndex === 0);
  const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
  const nextIndex = forward
    ? (currentIndex + 1) % enabledRadios.length
    : (currentIndex - 1 + enabledRadios.length) % enabledRadios.length;

  // Arrow keys MOVE FOCUS AND SELECT simultaneously
  const nextRadio = enabledRadios[nextIndex];
  this.value = nextRadio.value;
  this.syncChildStates();
  this.updateRovingTabindex();
  this.updateFormValue();
  this.validate();
  nextRadio.focus();

  dispatchCustomEvent(this, 'ui-change', {
    value: this.value,
  });
}
```

**Critical details from W3C APG:**
- Arrow keys WRAP (last to first, first to last) -- mandatory
- Arrow keys both MOVE FOCUS and SELECT (unlike checkbox where arrow keys only move focus)
- All four arrow keys work: Up/Left go backward, Down/Right go forward
- Space also checks the focused radio (redundant if arrows auto-select, but required by spec)
- Tab exits the entire group (the group is a single tab stop)

### Pattern 3: Slot-Based Child Discovery (Same as CheckboxGroup)
**What:** RadioGroup discovers child `lui-radio` elements via `slotchange` event, sets properties directly on children, and listens for events bubbling up.
**When to use:** Parent-child communication.
**Source:** Existing `packages/checkbox/src/checkbox-group.ts` (proven pattern, HIGH confidence)

```typescript
private handleSlotChange(e: Event): void {
  const slot = e.target as HTMLSlotElement;
  const assigned = slot.assignedElements({ flatten: true });
  this.radios = assigned.filter(
    (el) => el.tagName === 'LUI-RADIO'
  ) as Radio[];
  this.syncChildStates();
  this.syncDisabledState();
  this.updateRovingTabindex();
}

private syncChildStates(): void {
  for (const radio of this.radios) {
    radio.checked = (radio.value === this.value);
  }
}

private syncDisabledState(): void {
  if (this.disabled) {
    this.radios.forEach(r => r.disabled = true);
  }
}
```

### Pattern 4: Internal Event Communication (Radio -> RadioGroup)
**What:** When a radio is clicked, it dispatches `ui-radio-change` (composed: true) which bubbles to the RadioGroup. The group handles mutual exclusion by updating its `value` and syncing all children.
**When to use:** User interaction on individual radios.
**Source:** `.planning/research/ARCHITECTURE-TOGGLES.md` communication flow diagram

```typescript
// In radio.ts
private handleClick(): void {
  if (this.disabled) return;
  // Radio does NOT toggle itself -- it just notifies the group
  dispatchCustomEvent(this, 'ui-radio-change', {
    value: this.value,
  });
}

private handleKeyDown(e: KeyboardEvent): void {
  if (e.key === ' ') {
    e.preventDefault();
    this.handleClick();
  }
}

// In radio-group.ts render()
render() {
  return html`
    <div
      role="radiogroup"
      aria-labelledby="${this.groupId}-label"
      aria-required=${this.required ? 'true' : nothing}
      @ui-radio-change=${this.handleRadioChange}
      @keydown=${this.handleKeyDown}
    >
      ${this.label
        ? html`<span id="${this.groupId}-label" class="group-label">${this.label}</span>`
        : nothing}
      <div class="group-items">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
      ${this.showError
        ? html`<div class="error-text" role="alert">${this.error || 'Please select an option.'}</div>`
        : nothing}
    </div>
  `;
}

private handleRadioChange(e: CustomEvent): void {
  e.stopPropagation(); // Internal event, don't leak to consumer
  this.value = e.detail.value;
  this.touched = true;
  this.syncChildStates();
  this.updateRovingTabindex();
  this.updateFormValue();
  this.validate();

  // Dispatch consumer-facing event
  dispatchCustomEvent(this, 'ui-change', {
    value: this.value,
  });
}
```

### Pattern 5: Animated Dot Scale Transition
**What:** The radio's inner dot uses CSS `transform: scale()` transition to animate in/out when selected/deselected.
**When to use:** Radio selection visual indicator (RDIO-05).
**Source:** Standard CSS animation technique, zero dependencies

```css
/* Radio circle - the outer border */
.radio-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: var(--ui-radio-border-width) solid var(--ui-radio-border);
  border-radius: 50%;
  background-color: var(--ui-radio-bg);
  cursor: pointer;
  transition:
    border-color var(--ui-radio-transition) ease-in-out;
  flex-shrink: 0;
}

/* Checked state */
.radio-circle[aria-checked='true'] {
  border-color: var(--ui-radio-border-checked);
}

/* Inner dot */
.radio-dot {
  border-radius: 50%;
  background-color: var(--ui-radio-dot-color);
  transform: scale(0);
  transition: transform var(--ui-radio-transition) ease-in-out;
}

/* Dot visible when checked */
.radio-circle[aria-checked='true'] .radio-dot {
  transform: scale(1);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .radio-dot,
  .radio-circle {
    transition-duration: 0ms;
  }
}
```

**No SVG needed.** Unlike checkbox (which uses SVG path for the checkmark draw-in), radio uses a simple CSS circle with scale transform. This is simpler and more performant.

### Pattern 6: CSS Token Theming (`--ui-radio-*`)
**What:** Define `--ui-radio-*` CSS custom properties in `:root` for full theming control, following the established `--ui-checkbox-*` and `--ui-switch-*` patterns.
**When to use:** All radio visual properties that should be customizable.
**Source:** Existing `packages/core/src/styles/tailwind.css` token blocks

```css
:root {
  /* Radio Component */

  /* Circle dimensions per size */
  --ui-radio-size-sm: 1rem;
  --ui-radio-size-md: 1.25rem;
  --ui-radio-size-lg: 1.5rem;

  /* Dot dimensions per size (inner filled circle) */
  --ui-radio-dot-size-sm: 0.5rem;
  --ui-radio-dot-size-md: 0.625rem;
  --ui-radio-dot-size-lg: 0.75rem;

  /* Layout */
  --ui-radio-label-gap: 0.5rem;
  --ui-radio-transition: 150ms;
  --ui-radio-border-width: 2px;

  /* Label typography (matches checkbox/switch/input pattern) */
  --ui-radio-font-size-sm: 0.875rem;
  --ui-radio-font-size-md: 1rem;
  --ui-radio-font-size-lg: 1.125rem;

  /* Default state (unchecked) */
  --ui-radio-bg: var(--color-background, white);
  --ui-radio-border: var(--color-border, var(--ui-color-border));

  /* Checked state */
  --ui-radio-border-checked: var(--color-primary, var(--ui-color-primary));
  --ui-radio-dot-color: var(--color-primary, var(--ui-color-primary));

  /* Focus state */
  --ui-radio-ring: var(--color-ring, var(--ui-color-ring));

  /* Error state */
  --ui-radio-border-error: var(--color-destructive, var(--ui-color-destructive));
  --ui-radio-text-error: var(--color-destructive, var(--ui-color-destructive));

  /* Group tokens */
  --ui-radio-group-gap: 0.5rem;
}
```

### Anti-Patterns to Avoid
- **Making individual radios form-associated:** RadioGroup owns form participation. Individual radios must NOT have `static formAssociated = true`. There is no web platform mechanism for custom elements to discover same-named siblings across Shadow DOM boundaries.
- **Using aria-activedescendant for radio group focus:** Use roving tabindex instead. aria-activedescendant cannot cross Shadow DOM, has poor VoiceOver support, and does not auto-scroll to the active element.
- **Keyboard handler on individual radios for arrow keys:** Arrow key navigation requires knowledge of all siblings. This logic lives on the RadioGroup, not individual radios.
- **Adding Enter key to radio:** W3C APG radio pattern specifies Space for checking the focused radio. Arrow keys handle navigation+selection. Enter is NOT specified.
- **Treating RadioGroup like CheckboxGroup for form submission:** CheckboxGroup is NOT form-associated (children submit independently). RadioGroup IS form-associated (group submits the selected value). This is a fundamental difference.
- **Creating a shared FormAssociated mixin:** Codebase intentionally duplicates form boilerplate per component for CLI copy-source mode.
- **Using `delegatesFocus: true`:** The existing codebase (Switch, Checkbox) does NOT use `delegatesFocus`. Roving tabindex on the `lui-radio` host element works without it. Adding it could cause unexpected focus behavior when the group container is focused.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom event dispatch | Manual `new CustomEvent()` | `dispatchCustomEvent()` from `@lit-ui/core` | Already sets `bubbles: true, composed: true` defaults |
| Build configuration | Custom Vite config | `createLibraryConfig()` from `@lit-ui/vite-config` | Handles Tailwind plugin, dts, external deps |
| Base class + styles | Raw LitElement | `TailwindElement` + `tailwindBaseStyles` from `@lit-ui/core` | Handles SSR style injection, constructable stylesheets |
| Dark mode | Manual color switching | Token system (`--ui-radio-*` referencing `--color-*`) | Dark mode via `.dark` class automatically changes semantic color tokens |
| Unique IDs | UUID library | `Math.random().toString(36).substr(2, 9)` | Established pattern from Switch/Checkbox/Input |
| Child discovery | MutationObserver alone | `slotchange` event (primary) | Proven in CheckboxGroup and Select components |
| Mutual exclusion | Manual DOM querying | Group `syncChildStates()` on value change | Group already knows all children from slotchange |

**Key insight:** Radio introduces ONE genuinely new pattern to the codebase: **roving tabindex**. Everything else (form participation on group, slot-based child discovery, CSS token theming, safe registration, JSX types, SSR guards) is a copy or adaptation of CheckboxGroup and Checkbox patterns.

## Common Pitfalls

### Pitfall 1: Individual Radios as Form Participants Break Mutual Exclusion
**What goes wrong:** Making each `lui-radio` have `static formAssociated = true` and trying to coordinate form values across siblings. Multiple radios can be checked simultaneously, form data contains duplicate conflicting values.
**Why it happens:** Developers apply the same pattern as Checkbox (where each is form-associated). But native radio mutual exclusion depends on browser-internal name grouping within a form, which Shadow DOM breaks.
**How to avoid:** RadioGroup is the ONLY form-associated element. Individual radios are presentational children that report clicks via events.
**Warning signs:** Multiple radios checked at once; FormData has duplicate radio name entries.
**Confidence:** HIGH -- `.planning/research/ARCHITECTURE-TOGGLES.md`, `.planning/research/PITFALLS-CHECKBOX-RADIO-SWITCH.md` Pitfall 1

### Pitfall 2: Arrow Keys Not Wrapping
**What goes wrong:** Pressing Down arrow on the last radio does nothing instead of wrapping to the first radio. Or pressing Up on the first radio does nothing instead of wrapping to the last.
**Why it happens:** Developer uses clamping (Math.min/max) instead of modular arithmetic for index calculation.
**How to avoid:** Use modular arithmetic: `(currentIndex + 1) % enabledRadios.length` for forward, `(currentIndex - 1 + enabledRadios.length) % enabledRadios.length` for backward.
**Warning signs:** Keyboard navigation stops at group boundaries instead of wrapping.
**Confidence:** HIGH -- [W3C APG Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

### Pitfall 3: Arrow Keys Only Move Focus (Not Selection)
**What goes wrong:** Arrow keys move focus between radios but do not automatically check the newly focused radio. User has to press Space separately to select.
**Why it happens:** Developer applies checkbox keyboard semantics (where arrows only move focus) to radio groups.
**How to avoid:** In the RadioGroup keydown handler, arrow keys BOTH move focus AND update `this.value` to the new radio's value, then call `syncChildStates()`.
**Warning signs:** Pressing arrow key moves focus ring but the dot stays on the previous radio.
**Confidence:** HIGH -- [W3C APG Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

### Pitfall 4: Tab Stops on Every Radio Instead of One
**What goes wrong:** Each radio has `tabindex="0"`, making Tab move between individual radios instead of exiting the group. The group is not a single tab stop.
**Why it happens:** Developer sets all radios to `tabindex="0"` like checkboxes.
**How to avoid:** Implement roving tabindex: only the active radio (checked, or first if none checked) gets `tabindex="0"`. All others get `tabindex="-1"`. Update in `updateRovingTabindex()`.
**Warning signs:** Pressing Tab cycles through radios one by one; pressing Arrow does nothing.
**Confidence:** HIGH -- [W3C APG Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

### Pitfall 5: RadioGroup Not Syncing State After `value` Property Change
**What goes wrong:** Setting `radioGroup.value = 'option2'` programmatically does not update child radio checked states or form value.
**Why it happens:** The `updated()` lifecycle only syncs on specific property changes, and the developer forgets to watch `value`.
**How to avoid:** In `updated()`, watch for `value` property changes and call `syncChildStates()`, `updateRovingTabindex()`, and `updateFormValue()`.
**Warning signs:** Setting group value programmatically does not visually select the corresponding radio.
**Confidence:** HIGH -- Same pattern as CheckboxGroup disabled sync

### Pitfall 6: Space Key Without preventDefault Causes Page Scroll
**What goes wrong:** Pressing Space on a radio scrolls the page down in addition to selecting the radio.
**Why it happens:** Space key default behavior on `<div>` elements is page scroll.
**How to avoid:** Call `e.preventDefault()` in the keydown handler when `e.key === ' '`.
**Warning signs:** Page jumps when selecting radio via keyboard.
**Confidence:** HIGH -- Same pitfall as Checkbox (Phase 39), [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

### Pitfall 7: PropertyValues Type for updated() (api-extractor Bug)
**What goes wrong:** Using `Map<string, unknown>` as the parameter type for `updated()` causes api-extractor DTS rollup to crash.
**Why it happens:** Known issue discovered in Phase 38.
**How to avoid:** Use `PropertyValues` type from Lit: `protected override updated(changedProperties: PropertyValues): void`.
**Warning signs:** Build fails during DTS generation with "Unable to follow symbol for Map" error.
**Confidence:** HIGH -- Phase 38-02 key decision

### Pitfall 8: Disabled Radio Still Receives Arrow Key Focus
**What goes wrong:** Arrow key navigation lands on disabled radios, which cannot be selected. Focus appears stuck.
**Why it happens:** The arrow key handler iterates over ALL radios, not just enabled ones.
**How to avoid:** Filter radios to enabled-only before calculating navigation index: `const enabledRadios = this.radios.filter(r => !r.disabled)`.
**Warning signs:** Arrow keys land on greyed-out disabled radios.
**Confidence:** HIGH -- [W3C APG Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

## Code Examples

Verified patterns from existing codebase and official specs:

### Complete Radio Component Structure
```typescript
// Source: Derived from packages/checkbox/src/checkbox.ts + W3C APG Radio Pattern
import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { dispatchCustomEvent } from '@lit-ui/core';

export type RadioSize = 'sm' | 'md' | 'lg';

export class Radio extends TailwindElement {
  // NOT form-associated -- group owns form participation

  private radioId = `lui-radio-${Math.random().toString(36).substr(2, 9)}`;

  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) label = '';
  @property({ type: String }) size: RadioSize = 'md';

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: inline-block;
      }
      :host([disabled]) {
        pointer-events: none;
      }
      /* ... radio-specific styles ... */
    `,
  ];

  private handleClick(): void {
    if (this.disabled) return;
    dispatchCustomEvent(this, 'ui-radio-change', {
      value: this.value,
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === ' ') {
      e.preventDefault();
      this.handleClick();
    }
  }

  override render() {
    return html`
      <div class="radio-wrapper" @click=${this.handleClick}>
        <div
          role="radio"
          aria-checked=${this.checked ? 'true' : 'false'}
          aria-disabled=${this.disabled ? 'true' : nothing}
          aria-labelledby="${this.radioId}-label"
          tabindex="-1"
          class="radio-circle circle-${this.size}"
          @keydown=${this.handleKeyDown}
        >
          <span class="radio-dot dot-${this.size}"></span>
        </div>
        ${this.label
          ? html`<label id="${this.radioId}-label" class="radio-label label-${this.size}">${this.label}</label>`
          : html`<label id="${this.radioId}-label" class="radio-label label-${this.size}"><slot></slot></label>`}
      </div>
    `;
  }
}
```

**Key differences from Checkbox:**
- NO `static formAssociated = true`
- NO `internals` / `attachInternals()`
- NO `formResetCallback` / `formDisabledCallback`
- NO `indeterminate` property
- NO SVG -- uses CSS dot with scale transition
- `tabindex="-1"` by default (group manages via roving tabindex on host)
- Dispatches `ui-radio-change` (internal) not `ui-change` (consumer-facing)

### RadioGroup Form Participation + Validation
```typescript
// Source: Derived from checkbox-group.ts + ARCHITECTURE-TOGGLES.md
private validate(): boolean {
  if (!this.internals) return true;

  if (this.required && !this.value) {
    this.internals.setValidity(
      { valueMissing: true },
      this.error || 'Please select an option.',
      // Anchor to first radio for popup positioning
      this.radios[0] || (this.shadowRoot?.querySelector('.group-items') as HTMLElement)
    );
    this.showError = this.touched;
    return false;
  }

  this.internals.setValidity({});
  this.showError = false;
  return true;
}
```

### index.ts Registration Pattern
```typescript
// Source: Derived from packages/checkbox/src/index.ts
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

export { Radio } from './radio.js';
export { RadioGroup } from './radio-group.js';
export type { RadioSize } from './radio.js';

export { TailwindElement, isServer } from '@lit-ui/core';

import { Radio } from './radio.js';
import { RadioGroup } from './radio-group.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-radio')) {
    customElements.define('lui-radio', Radio);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-radio] Custom element already registered.');
  }

  if (!customElements.get('lui-radio-group')) {
    customElements.define('lui-radio-group', RadioGroup);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-radio-group] Custom element already registered.');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-radio': Radio;
    'lui-radio-group': RadioGroup;
  }
}
```

### RadioGroup Render with ARIA
```typescript
override render() {
  return html`
    <div
      class="group-wrapper"
      role="radiogroup"
      aria-labelledby="${this.groupId}-label"
      aria-required=${this.required ? 'true' : nothing}
      @ui-radio-change=${this.handleRadioChange}
      @keydown=${this.handleKeyDown}
    >
      ${this.label
        ? html`<span id="${this.groupId}-label" class="group-label">${this.label}</span>`
        : nothing}
      <div class="group-items">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
      ${this.showError
        ? html`<div class="error-text" role="alert">
            ${this.error || 'Please select an option.'}
          </div>`
        : nothing}
    </div>
  `;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hidden `<input type="radio">` in Shadow DOM | `ElementInternals` on group + `setFormValue()` | ElementInternals shipped in all browsers 2023 | No hidden inputs needed; group owns form value cleanly |
| Individual radios as form participants | RadioGroup as sole form participant | Standard for custom element radio groups | Solves cross-shadow-DOM mutual exclusion |
| aria-activedescendant for radio focus | Roving tabindex on host elements | W3C APG recommendation | Better screen reader support, works across Shadow DOM |
| Manual tabindex management | Roving tabindex pattern | Established pattern | Single tab stop for group, arrow key navigation |

**Deprecated/outdated:**
- Hidden native `<input type="radio">` inside Shadow DOM for form participation: Replaced by ElementInternals on group
- `aria-activedescendant` for radio groups: Poor screen reader support, Shadow DOM crossing issues; use roving tabindex

## Open Questions

1. **Should Radio handle Space key, or should RadioGroup handle all keyboard events?**
   - What we know: W3C APG says Space checks the focused radio. Arrow keys are handled by the group. The group already has a `@keydown` handler.
   - What's unclear: If the group handles all keys (including Space), the radio's own keydown handler is unnecessary. But if the radio has a click handler already, Space on a div with role="radio" should also work via the radio's own handler.
   - Recommendation: Let the group handle arrow keys via `@keydown` on the radiogroup container. Let individual radios handle Space and click via their own handlers (which dispatch `ui-radio-change`). This separation is cleaner -- radios handle "select me" gestures, group handles "navigate between" gestures.

2. **Should tabindex live on the `lui-radio` host element or the inner `div[role="radio"]`?**
   - What we know: The existing Checkbox/Switch pattern puts `tabindex` on the inner `div[role="checkbox/switch"]` inside shadow DOM. But for roving tabindex, the group needs to SET tabindex on children, and it can only set it on the host element (it cannot reach into shadow DOM).
   - What's unclear: Can focus work correctly if tabindex is on the host AND the inner element has a role?
   - Recommendation: Set tabindex on the `lui-radio` **host element** (via `this.tabIndex` property or `radio.tabIndex = 0/-1` from the group). The inner `div[role="radio"]` should NOT have its own tabindex. When the host receives focus, the component is focused. This matches the approach recommended in the pitfalls research doc (Pitfall 2: "roving tabindex on host elements, not shadow internals"). The inner role="radio" div should still exist for ARIA semantics but should not be a separate focus target.

3. **Radio click handler: on wrapper or on inner element?**
   - What we know: Checkbox puts click handler on the wrapper div so clicking the label also toggles. This pattern works well.
   - Recommendation: Same as Checkbox -- click handler on the wrapper div so clicking label or circle both trigger selection.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/checkbox/src/checkbox.ts` -- Form participation pattern, validation, SSR guards, CSS token styling
- Existing codebase: `packages/checkbox/src/checkbox-group.ts` -- Slot-based child discovery, disabled propagation, group validation, event coordination
- Existing codebase: `packages/checkbox/src/index.ts` -- Multi-element registration pattern
- Existing codebase: `packages/checkbox/src/jsx.d.ts` -- JSX type declarations template
- Existing codebase: `packages/checkbox/package.json` -- Package structure template
- Existing codebase: `packages/switch/src/switch.ts` -- Form-associated pattern, SSR guards
- Existing codebase: `packages/core/src/styles/tailwind.css` -- Token definition pattern (`--ui-checkbox-*` and `--ui-switch-*` blocks as template)
- Existing codebase: `packages/core/src/utils/events.ts` -- `dispatchCustomEvent` helper with `composed: true` default
- `.planning/research/ARCHITECTURE-TOGGLES.md` -- Architecture decisions: RadioGroup form-associated, individual radios NOT; roving tabindex; keyboard handler on group
- `.planning/research/FEATURES-CHECKBOX-RADIO-SWITCH.md` -- Feature requirements, ARIA quick reference for radio/radiogroup
- `.planning/research/PITFALLS-CHECKBOX-RADIO-SWITCH.md` -- Pitfalls: radio grouping across Shadow DOM, roving tabindex, arrow key wrapping
- [W3C WAI-ARIA APG: Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) -- ARIA role, keyboard interaction (arrow + Space), roving tabindex
- [MDN: ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) -- Form participation API
- [MDN: ARIA radiogroup role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/radiogroup_role) -- Role and attribute requirements
- `.planning/phases/39-checkbox-checkboxgroup/39-RESEARCH.md` -- Phase 39 research (direct predecessor)

### Secondary (MEDIUM confidence)
- [Shoelace Radio Group](https://shoelace.style/components/radio-group) -- Reference implementation: group owns form value, propagates size to children
- [Shoelace Radio](https://shoelace.style/components/radio) -- Reference child component: value, size, disabled properties
- [Google HowTo Radio Group](https://googlechromelabs.github.io/howto-components/howto-radio-group/) -- Reference roving tabindex implementation
- [Benny Powers: Form-Associated Custom Elements](https://bennypowers.dev/posts/form-associated-custom-elements/) -- ElementInternals patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Zero new dependencies; all libraries already in use across the monorepo
- Architecture: HIGH -- Follows exact patterns from Checkbox/CheckboxGroup (form participation inverted per architecture docs), roving tabindex from W3C APG
- Pitfalls: HIGH -- Well-documented in project research docs, W3C APG, and Phase 39 experience

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (stable domain, no fast-moving dependencies)
