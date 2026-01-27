# Phase 39: Checkbox + CheckboxGroup - Research

**Researched:** 2026-01-27
**Domain:** Accessible checkbox and checkbox-group web components with Lit, ElementInternals, animated SVG checkmark, indeterminate tri-state, and group coordination
**Confidence:** HIGH

## Summary

The Checkbox + CheckboxGroup phase builds directly on the Switch component (Phase 38) patterns: form participation via ElementInternals, CSS token theming (`--ui-checkbox-*`), SSR guards with `isServer`, and the `TailwindElement` base class. The Checkbox is structurally very similar to Switch -- a form-associated custom element with `role="checkbox"` instead of `role="switch"` -- but adds two new dimensions: (1) an animated SVG checkmark draw-in using `stroke-dasharray`/`stroke-dashoffset` CSS transitions, and (2) indeterminate tri-state support via `aria-checked="mixed"`.

The CheckboxGroup is a layout and accessibility container that does NOT own form participation. Each individual `lui-checkbox` submits its own form value independently (matching native HTML checkbox behavior). The group provides `role="group"` with `aria-labelledby`, disabled propagation to children, select-all/deselect-all coordination with an indeterminate parent checkbox, and group-level validation UI. The group discovers children via `slotchange` (the same pattern used by `lui-select`/`lui-option`) and communicates via properties-down, events-up.

No new dependencies are required. Zero external libraries. The SVG checkmark animation uses CSS `transition` on `stroke-dashoffset` for the draw-in effect, with `prefers-reduced-motion` disabling. The indeterminate dash icon is a simpler SVG path with a cross-fade transition. The entire implementation is two files (`checkbox.ts`, `checkbox-group.ts`) plus the standard `index.ts`, `jsx.d.ts`, and config files, all in a single `@lit-ui/checkbox` package.

**Primary recommendation:** Build `@lit-ui/checkbox` package containing both `lui-checkbox` and `lui-checkbox-group`. Checkbox is form-associated (like Switch); CheckboxGroup is NOT form-associated (it is a layout/a11y/validation container only). Use SVG `<path>` with `stroke-dasharray`/`stroke-dashoffset` CSS transition for the animated checkmark. Follow Switch patterns exactly for form participation, SSR, tokens, and registration.

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
| SVG path with stroke-dashoffset | CSS `clip-path` animation | stroke-dashoffset is the established technique for draw-in effects; clip-path is harder to control timing for path-following animations |
| SVG path with stroke-dashoffset | Lottie/Web Animations API | Overkill for a simple checkmark; adds dependency; CSS transitions are the established zero-dep pattern |
| CheckboxGroup NOT form-associated | CheckboxGroup as form-associated submitting array | Breaks native checkbox pattern; individual checkboxes should submit independently |
| slotchange for child discovery | MutationObserver only | slotchange is primary mechanism (proven in Select); MutationObserver is secondary backup |

**Installation:** No new packages needed. Package created with existing workspace dependencies.

## Architecture Patterns

### Recommended Project Structure
```
packages/checkbox/
  src/
    checkbox.ts           # lui-checkbox element (form-associated)
    checkbox-group.ts     # lui-checkbox-group element (NOT form-associated)
    index.ts              # Exports + safe element registration for both
    jsx.d.ts              # JSX type declarations (React, Vue, Svelte)
    vite-env.d.ts         # Vite client types
  package.json            # @lit-ui/checkbox
  tsconfig.json
  vite.config.ts          # Uses createLibraryConfig()
```

This matches the existing `@lit-ui/select` pattern where multiple related elements ship in one package (select, option, option-group). The checkbox and checkbox-group are tightly coupled (group queries for `lui-checkbox` children).

### Pattern 1: Form-Associated Checkbox (ElementInternals) - Same as Switch
**What:** Use `static formAssociated = true` and `attachInternals()` to participate in native HTML forms. Each checkbox independently submits its value.
**When to use:** The `lui-checkbox` component (NOT the group).
**Source:** Existing `packages/switch/src/switch.ts` (proven in Phase 38)

```typescript
export class Checkbox extends TailwindElement {
  static formAssociated = true;
  private internals: ElementInternals | null = null;
  private defaultChecked = false;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean }) indeterminate = false; // NEW: not on Switch
  @property({ type: String }) name = '';
  @property({ type: String }) value = 'on'; // Match native checkbox default
  @property({ type: String }) label = '';
  @property({ type: String }) size: CheckboxSize = 'md';

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultChecked = this.checked;
    this.updateFormValue();
  }

  private updateFormValue(): void {
    // Submit value when checked, null when unchecked (matches native checkbox)
    this.internals?.setFormValue(this.checked ? this.value : null);
  }

  formResetCallback(): void {
    this.checked = this.defaultChecked;
    this.indeterminate = false;
    this.touched = false;
    this.showError = false;
    this.updateFormValue();
    this.internals?.setValidity({});
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }
}
```

### Pattern 2: ARIA Checkbox Role with Tri-State
**What:** Use `role="checkbox"` with `aria-checked` supporting `"true"`, `"false"`, and `"mixed"` values.
**When to use:** The `lui-checkbox` component.
**Source:** [W3C APG Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)

```typescript
render() {
  // Determine aria-checked value (tri-state)
  const ariaChecked = this.indeterminate ? 'mixed' : this.checked ? 'true' : 'false';

  return html`
    <div class="checkbox-wrapper">
      <div
        role="checkbox"
        aria-checked=${ariaChecked}
        aria-disabled=${this.disabled ? 'true' : nothing}
        aria-required=${this.required ? 'true' : nothing}
        aria-labelledby="${this.checkboxId}-label"
        tabindex=${this.disabled ? '-1' : '0'}
        class="checkbox-box box-${this.size} ${this.showError ? 'has-error' : ''}"
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <!-- SVG checkmark icon (checked state) -->
        <!-- SVG dash icon (indeterminate state) -->
      </div>
      ${this.label
        ? html`<label id="${this.checkboxId}-label" class="checkbox-label label-${this.size}">${this.label}</label>`
        : html`<label id="${this.checkboxId}-label" class="checkbox-label label-${this.size}"><slot></slot></label>`}
    </div>
    ${this.showError
      ? html`<div class="error-text" role="alert">This field is required.</div>`
      : nothing}
  `;
}
```

**Key ARIA facts (HIGH confidence - W3C APG):**
- `role="checkbox"` (NOT `role="switch"`)
- `aria-checked` values: `"true"`, `"false"`, or `"mixed"` (checkbox supports all three, unlike switch)
- Space key: REQUIRED (the only keyboard binding per W3C APG)
- Enter key: NOT specified for checkbox (do NOT add it -- diverges from spec)
- Indeterminate clears on first user interaction (user click/Space always results in checked or unchecked, never mixed)

### Pattern 3: Animated SVG Checkmark Draw-In
**What:** SVG `<path>` with `stroke-dasharray`/`stroke-dashoffset` CSS transition for a checkmark draw-in animation.
**When to use:** The checkbox's checked state visual indicator.
**Source:** Standard SVG animation technique, widely used in component libraries

```typescript
// Inside the checkbox-box div in render()
html`
  <svg class="checkbox-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <!-- Checkmark path (visible when checked) -->
    <path
      class="check-path"
      d="M2 6L5 9L10 3"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Indeterminate dash (visible when indeterminate) -->
    <path
      class="dash-path"
      d="M3 6H9"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
`
```

```css
/* Checkmark draw-in animation via stroke-dashoffset */
.check-path {
  stroke-dasharray: 14; /* Total path length of the checkmark */
  stroke-dashoffset: 14; /* Fully hidden (offset = length) */
  transition: stroke-dashoffset var(--ui-checkbox-transition) ease-in-out;
}

/* When checked: draw in (offset to 0) */
.checkbox-box[aria-checked='true'] .check-path {
  stroke-dashoffset: 0;
}

/* Indeterminate dash - use opacity for cross-fade */
.dash-path {
  opacity: 0;
  transition: opacity var(--ui-checkbox-transition) ease-in-out;
}

.checkbox-box[aria-checked='mixed'] .dash-path {
  opacity: 1;
}

/* Hide checkmark when indeterminate */
.checkbox-box[aria-checked='mixed'] .check-path {
  stroke-dashoffset: 14;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .check-path,
  .dash-path {
    transition-duration: 0ms;
  }
}
```

**How stroke-dasharray/stroke-dashoffset works:**
1. Set `stroke-dasharray` to the total path length (creates a single dash covering the entire path)
2. Set `stroke-dashoffset` to the same value (offsets the dash so nothing is visible)
3. Transition `stroke-dashoffset` to `0` (the dash slides into view, creating a draw-in effect)
4. The path length for a checkmark "M2 6L5 9L10 3" is approximately 14 units (calculate: sqrt((5-2)^2+(9-6)^2) + sqrt((10-5)^2+(3-9)^2) = sqrt(18) + sqrt(61) ~ 4.24 + 7.81 ~ 12.05, round up to 14 for safety)

### Pattern 4: CheckboxGroup as Layout/A11y Container (NOT Form-Associated)
**What:** CheckboxGroup provides `role="group"` with `aria-labelledby`, discovers children via slotchange, propagates disabled state, and provides select-all coordination + validation UI. It does NOT participate in forms itself.
**When to use:** When checkboxes need grouping, disabled propagation, select-all, or group validation.
**Source:** Architecture decision from `.planning/research/ARCHITECTURE-TOGGLES.md`

```typescript
export class CheckboxGroup extends TailwindElement {
  // NOT form-associated -- children submit themselves
  private groupId = `lui-cbg-${Math.random().toString(36).substr(2, 9)}`;
  private checkboxes: Checkbox[] = [];

  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean }) required = false; // Group-level: at least one must be checked
  @property({ type: String }) error = ''; // Custom error message

  @state() private showError = false;

  private handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true });
    this.checkboxes = assigned.filter(
      (el) => el.tagName === 'LUI-CHECKBOX'
    ) as Checkbox[];
    this.syncDisabledState();
  }

  private syncDisabledState(): void {
    if (this.disabled) {
      this.checkboxes.forEach(cb => cb.disabled = true);
    }
  }

  render() {
    return html`
      <div
        role="group"
        aria-labelledby="${this.groupId}-label"
      >
        <span id="${this.groupId}-label" class="group-label">${this.label}</span>
        <div class="group-items">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
        ${this.showError
          ? html`<div class="error-text" role="alert">${this.error || 'Please select at least one option.'}</div>`
          : nothing}
      </div>
    `;
  }
}
```

### Pattern 5: Select-All / Deselect-All with Indeterminate Parent
**What:** A parent checkbox inside CheckboxGroup that reflects the aggregate state of all children. When all are checked, parent shows checked. When none are checked, parent shows unchecked. When some are checked, parent shows indeterminate (mixed).
**When to use:** CheckboxGroup with `select-all` feature.
**Source:** [W3C APG Mixed-State Checkbox Example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/)

```typescript
// Inside CheckboxGroup, listening for child changes
private handleChildChange(): void {
  const checkedCount = this.checkboxes.filter(cb => cb.checked).length;
  const totalCount = this.checkboxes.length;

  if (this.selectAllCheckbox) {
    if (checkedCount === 0) {
      this.selectAllCheckbox.checked = false;
      this.selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === totalCount) {
      this.selectAllCheckbox.checked = true;
      this.selectAllCheckbox.indeterminate = false;
    } else {
      this.selectAllCheckbox.checked = false;
      this.selectAllCheckbox.indeterminate = true;
    }
  }
  this.validateGroup();
}

// When parent select-all is clicked
private handleSelectAllChange(e: CustomEvent): void {
  const shouldCheck = e.detail.checked;
  this.checkboxes.forEach(cb => {
    if (!cb.disabled) {
      cb.checked = shouldCheck;
    }
  });
}
```

**Key detail from W3C APG:** The spec describes that Space on a mixed-state parent checkbox "cycles the tri-state checkbox among unchecked, mixed, and checked states" and may "return to the last combination of states." However, the simpler and more common implementation is: clicking the parent when mixed/unchecked checks all children; clicking the parent when all checked unchecks all. This simpler approach is what Shoelace and most libraries implement.

**Prior decision (skip aria-controls):** The `aria-controls` attribute that W3C APG recommends on the parent checkbox cannot cross Shadow DOM boundaries. Per prior project research decision, skip `aria-controls` entirely due to poor screen reader support and the cross-shadow-boundary issue. Use clear labeling ("Select all") instead.

### Pattern 6: CSS Token Theming
**What:** Define `--ui-checkbox-*` CSS custom properties in `:root` for full theming control.
**When to use:** All checkbox visual properties that should be customizable.
**Source:** Existing `--ui-switch-*` token pattern in `packages/core/src/styles/tailwind.css`

```css
:root {
  /* Checkbox Component Tokens */

  /* Box dimensions per size */
  --ui-checkbox-size-sm: 1rem;
  --ui-checkbox-size-md: 1.25rem;
  --ui-checkbox-size-lg: 1.5rem;

  /* Layout */
  --ui-checkbox-radius: 0.25rem; /* Slightly rounded corners, not fully round */
  --ui-checkbox-label-gap: 0.5rem;
  --ui-checkbox-transition: 150ms;
  --ui-checkbox-border-width: 2px;

  /* Label typography (matches switch/input pattern) */
  --ui-checkbox-font-size-sm: 0.875rem;
  --ui-checkbox-font-size-md: 1rem;
  --ui-checkbox-font-size-lg: 1.125rem;

  /* Default state (unchecked) */
  --ui-checkbox-bg: var(--color-background, white);
  --ui-checkbox-border: var(--color-border, var(--ui-color-border));

  /* Checked state */
  --ui-checkbox-bg-checked: var(--color-primary, var(--ui-color-primary));
  --ui-checkbox-border-checked: var(--color-primary, var(--ui-color-primary));
  --ui-checkbox-check-color: white;

  /* Indeterminate state (same as checked for background) */
  --ui-checkbox-bg-indeterminate: var(--color-primary, var(--ui-color-primary));
  --ui-checkbox-border-indeterminate: var(--color-primary, var(--ui-color-primary));

  /* Focus state */
  --ui-checkbox-ring: var(--color-ring, var(--ui-color-ring));

  /* Error state */
  --ui-checkbox-border-error: var(--color-destructive, var(--ui-color-destructive));
  --ui-checkbox-text-error: var(--color-destructive, var(--ui-color-destructive));

  /* Group tokens */
  --ui-checkbox-group-gap: 0.5rem;
}
```

### Anti-Patterns to Avoid
- **Making CheckboxGroup form-associated:** CheckboxGroup is a layout/a11y container. Each checkbox submits independently. Making the group form-associated breaks the native checkbox pattern and forces consumers to parse a joined value.
- **Adding Enter key to checkbox:** W3C APG specifies Space only for checkbox. Enter is NOT in the spec. Adding it diverges from ARIA spec (unlike Switch where Enter is optional/recommended).
- **Treating indeterminate as a form value:** `aria-checked="mixed"` is visual/ARIA only. The checkbox's form value is determined solely by `checked` (true/false). Never submit "mixed" or "indeterminate" as a form value.
- **Using `aria-controls` on select-all checkbox:** Cannot cross Shadow DOM boundaries. Poor screen reader support. Project prior decision: skip it, use clear labeling.
- **Creating a shared FormAssociated mixin:** Codebase intentionally duplicates form boilerplate per component for CLI copy-source mode.
- **Reflecting `indeterminate` as HTML attribute:** Native `<input>` indeterminate is a JS-only property, not reflected. Follow the same convention: `indeterminate` is a JS property only (not `reflect: true`).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom event dispatch | Manual `new CustomEvent()` | `dispatchCustomEvent()` from `@lit-ui/core` | Already sets `bubbles: true, composed: true` defaults correctly |
| Build configuration | Custom Vite config | `createLibraryConfig()` from `@lit-ui/vite-config` | Handles Tailwind plugin, dts, external deps |
| Base class + styles | Raw LitElement | `TailwindElement` + `tailwindBaseStyles` from `@lit-ui/core` | Handles SSR style injection, constructable stylesheets |
| Dark mode | Manual color switching | Token system (`--ui-checkbox-*` referencing `--color-*`) | Dark mode via `.dark` class automatically changes semantic color tokens |
| Unique IDs | UUID library | `Math.random().toString(36).substr(2, 9)` | Established pattern from Switch/Input components |
| SVG checkmark path calculation | Manual measurement | Hardcode `stroke-dasharray` value slightly larger than actual path length | The path `M2 6L5 9L10 3` has length ~12; use 14 for safety margin |
| Child discovery in group | MutationObserver alone | `slotchange` event (primary) | Proven in Select component; MutationObserver as optional secondary |

**Key insight:** The Checkbox component introduces ONE new technical concept compared to Switch: the animated SVG checkmark with `stroke-dasharray`/`stroke-dashoffset`. CheckboxGroup introduces the parent-child communication pattern already proven in Select. Everything else (form participation, SSR guards, token theming, safe registration, JSX types) is copy from Switch.

## Common Pitfalls

### Pitfall 1: Indeterminate State Treated as a Form Value
**What goes wrong:** Developers implement `aria-checked="mixed"` and treat indeterminate as a submittable form value. A checkbox is either checked or unchecked for form submission purposes, regardless of indeterminate display.
**Why it happens:** The visual mixed state looks like a distinct value. Developers assume it corresponds to a third form value.
**How to avoid:** `aria-checked="mixed"` is for ARIA/screen readers only. The checkbox's actual form value is determined solely by `checked`/`unchecked`. Never call `setFormValue('mixed')`. In `updateFormValue()`, use only `this.checked ? this.value : null`.
**Warning signs:** Code has three-way value logic for form submission; `setFormValue('mixed')` in codebase.
**Confidence:** HIGH -- [W3C APG Mixed Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/), [MDN :indeterminate](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:indeterminate)

### Pitfall 2: Indeterminate Not Clearing on User Interaction
**What goes wrong:** After user clicks/presses Space on an indeterminate checkbox, it stays indeterminate instead of transitioning to checked or unchecked.
**Why it happens:** Developer forgets to clear the `indeterminate` property in the toggle handler.
**How to avoid:** In the `toggle()` method, always set `this.indeterminate = false` before toggling `checked`. User interaction always results in a determinate state.
**Warning signs:** Checkbox stays in indeterminate/mixed state after user clicks it.
**Confidence:** HIGH -- [MDN HTMLInputElement.indeterminate](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/indeterminate)

### Pitfall 3: SVG Checkmark Path Length Miscalculation
**What goes wrong:** The `stroke-dasharray` value does not match the actual SVG path length. If too small, the checkmark appears partially drawn. If the transition timing assumes a specific length, the animation speed looks wrong.
**Why it happens:** Developer estimates path length by eye or uses an incorrect calculation.
**How to avoid:** For the checkmark path `M2 6L5 9L10 3`: segment 1 = sqrt(9+9) = 4.24, segment 2 = sqrt(25+36) = 7.81, total = ~12.05. Set `stroke-dasharray` to 14 (round up generously). Set `stroke-dashoffset` to 14 (hidden) and transition to 0 (visible). The slight over-estimate creates a brief pause before draw-in begins, which feels natural.
**Warning signs:** Checkmark animation looks incomplete or has a visible "jump" at the end.
**Confidence:** HIGH -- Standard SVG technique

### Pitfall 4: Space Key Without preventDefault Causes Page Scroll
**What goes wrong:** Pressing Space toggles the checkbox but also scrolls the page down.
**Why it happens:** Space key default behavior on `<div>` elements is page scroll. Must call `e.preventDefault()` in keydown handler.
**How to avoid:** In the keydown handler, call `e.preventDefault()` when `e.key === ' '` before toggling.
**Warning signs:** Page jumps when toggling checkbox via keyboard.
**Confidence:** HIGH -- [W3C APG Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)

### Pitfall 5: CheckboxGroup Disabled Propagation Not Synced on Property Change
**What goes wrong:** Setting `disabled` on the group after initial render does not propagate to children. Children remain enabled.
**Why it happens:** Disabled propagation happens only in `handleSlotChange` (initial discovery) but not in the `updated()` lifecycle when the `disabled` property changes.
**How to avoid:** In `updated()`, watch for `disabled` property changes and re-sync to all discovered children. Also handle new children added after initial render.
**Warning signs:** Adding `disabled` attribute to group via JS does not grey out children.
**Confidence:** HIGH -- Derived from Select component patterns

### Pitfall 6: Select-All Race Condition with Event Bubbling
**What goes wrong:** When select-all toggles all children, each child fires a `ui-change` event. The group's child-change handler fires for each event, recalculating the select-all state mid-way through the batch update. This can cause flickering between mixed and checked states.
**Why it happens:** Setting `checked` on each child triggers Lit's `updated()` and event dispatch synchronously or in rapid succession.
**How to avoid:** When the select-all checkbox is toggled, batch-update all children and skip individual event handling during the batch. Use a flag like `this._batchUpdating = true` and check it in the child-change handler. Clear the flag after the batch.
**Warning signs:** Select-all checkbox briefly flickers to indeterminate before settling on checked.
**Confidence:** MEDIUM -- Derived from common event coordination patterns

### Pitfall 7: PropertyValues Type for updated() (api-extractor Bug)
**What goes wrong:** Using `Map<string, unknown>` as the parameter type for `updated()` causes api-extractor DTS rollup to crash with "Unable to follow symbol for Map".
**Why it happens:** Known issue discovered in Phase 38-02. api-extractor cannot resolve the Map type in DTS rollup.
**How to avoid:** Use `PropertyValues` type from Lit instead: `protected override updated(changedProperties: PropertyValues): void`. Functionally equivalent, resolves cleanly.
**Warning signs:** Build fails during DTS generation with "Unable to follow symbol for Map" error.
**Confidence:** HIGH -- Phase 38-02 key decision

## Code Examples

Verified patterns from existing codebase and official specs:

### Complete Checkbox Component Structure (Key Sections)
```typescript
// Source: Derived from packages/switch/src/switch.ts + W3C APG Checkbox Pattern
import { html, css, nothing, isServer, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { dispatchCustomEvent } from '@lit-ui/core';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export class Checkbox extends TailwindElement {
  static formAssociated = true;
  private internals: ElementInternals | null = null;
  private checkboxId = `lui-cb-${Math.random().toString(36).substr(2, 9)}`;
  private defaultChecked = false;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean }) indeterminate = false; // JS only, not reflected
  @property({ type: String }) name = '';
  @property({ type: String }) value = 'on'; // Match native checkbox default
  @property({ type: String }) label = '';
  @property({ type: String }) size: CheckboxSize = 'md';

  @state() private touched = false;
  @state() private showError = false;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultChecked = this.checked;
    this.updateFormValue();
  }

  protected override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('checked') || changedProperties.has('indeterminate')) {
      this.updateFormValue();
      this.validate();
    }
  }

  private toggle(): void {
    if (this.disabled) return;
    this.indeterminate = false; // Always clear indeterminate on user interaction
    this.checked = !this.checked;
    this.touched = true;
    this.updateFormValue();
    this.validate();
    dispatchCustomEvent(this, 'ui-change', {
      checked: this.checked,
      value: this.checked ? this.value : null,
    });
  }

  private handleClick(): void { this.toggle(); }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === ' ') { // Space only -- NOT Enter (per W3C APG checkbox spec)
      e.preventDefault();
      this.toggle();
    }
  }

  private updateFormValue(): void {
    // Indeterminate does NOT affect form value -- only checked/unchecked matters
    this.internals?.setFormValue(this.checked ? this.value : null);
  }

  private validate(): boolean {
    if (!this.internals) return true;
    if (this.required && !this.checked) {
      this.internals.setValidity(
        { valueMissing: true },
        'Please check this box.',
        this.shadowRoot?.querySelector('.checkbox-box') as HTMLElement
      );
      this.showError = this.touched;
      return false;
    }
    this.internals.setValidity({});
    this.showError = false;
    return true;
  }

  formResetCallback(): void {
    this.checked = this.defaultChecked;
    this.indeterminate = false;
    this.touched = false;
    this.showError = false;
    this.updateFormValue();
    this.internals?.setValidity({});
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  override render() {
    const ariaChecked = this.indeterminate ? 'mixed' : this.checked ? 'true' : 'false';
    return html`
      <div class="checkbox-wrapper">
        <div
          role="checkbox"
          aria-checked=${ariaChecked}
          aria-disabled=${this.disabled ? 'true' : nothing}
          aria-required=${this.required ? 'true' : nothing}
          aria-labelledby="${this.checkboxId}-label"
          tabindex=${this.disabled ? '-1' : '0'}
          class="checkbox-box box-${this.size} ${this.showError ? 'has-error' : ''}"
          @click=${this.handleClick}
          @keydown=${this.handleKeyDown}
        >
          <svg class="checkbox-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path class="check-path" d="M2 6L5 9L10 3"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
            <path class="dash-path" d="M3 6H9"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round" />
          </svg>
        </div>
        ${this.label
          ? html`<label id="${this.checkboxId}-label" class="checkbox-label label-${this.size}">${this.label}</label>`
          : html`<label id="${this.checkboxId}-label" class="checkbox-label label-${this.size}"><slot></slot></label>`}
      </div>
      ${this.showError
        ? html`<div class="error-text" role="alert">Please check this box.</div>`
        : nothing}
    `;
  }
}
```

### CheckboxGroup Select-All Coordination
```typescript
// Source: Pattern from ARCHITECTURE-TOGGLES.md + W3C APG Mixed Checkbox
// The group listens for ui-change events from child checkboxes
private handleChildChange(): void {
  if (this._batchUpdating) return; // Avoid race condition during select-all

  const enabled = this.checkboxes.filter(cb => !cb.disabled);
  const checkedCount = enabled.filter(cb => cb.checked).length;
  const total = enabled.length;

  // Update select-all checkbox state
  if (this.selectAllEl) {
    if (checkedCount === 0) {
      this.selectAllEl.checked = false;
      this.selectAllEl.indeterminate = false;
    } else if (checkedCount === total) {
      this.selectAllEl.checked = true;
      this.selectAllEl.indeterminate = false;
    } else {
      this.selectAllEl.checked = false;
      this.selectAllEl.indeterminate = true;
    }
  }

  // Group validation
  this.validateGroup();
}

private handleSelectAllToggle(): void {
  const shouldCheck = !this.checkboxes.every(cb => cb.disabled || cb.checked);
  this._batchUpdating = true;
  this.checkboxes.forEach(cb => {
    if (!cb.disabled) cb.checked = shouldCheck;
  });
  this._batchUpdating = false;
  this.handleChildChange(); // Sync state after batch
}
```

### CSS Styles for Checkbox (Key Sections)
```css
/* Checkbox box - the square container */
.checkbox-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: var(--ui-checkbox-border-width) solid var(--ui-checkbox-border);
  border-radius: var(--ui-checkbox-radius);
  background-color: var(--ui-checkbox-bg);
  cursor: pointer;
  transition: background-color var(--ui-checkbox-transition) ease-in-out,
              border-color var(--ui-checkbox-transition) ease-in-out;
  flex-shrink: 0;
  color: var(--ui-checkbox-check-color);
}

/* Checked state */
.checkbox-box[aria-checked='true'],
.checkbox-box[aria-checked='mixed'] {
  background-color: var(--ui-checkbox-bg-checked);
  border-color: var(--ui-checkbox-border-checked);
}

/* SVG icon sizing */
.checkbox-icon {
  width: 75%;
  height: 75%;
}

/* Checkmark draw-in */
.check-path {
  stroke-dasharray: 14;
  stroke-dashoffset: 14;
  transition: stroke-dashoffset var(--ui-checkbox-transition) ease-in-out;
}
.checkbox-box[aria-checked='true'] .check-path {
  stroke-dashoffset: 0;
}

/* Indeterminate dash */
.dash-path {
  opacity: 0;
  transition: opacity var(--ui-checkbox-transition) ease-in-out;
}
.checkbox-box[aria-checked='mixed'] .dash-path {
  opacity: 1;
}
.checkbox-box[aria-checked='mixed'] .check-path {
  stroke-dashoffset: 14; /* Hide checkmark when indeterminate */
}

/* Size variants */
.box-sm { width: var(--ui-checkbox-size-sm); height: var(--ui-checkbox-size-sm); }
.box-md { width: var(--ui-checkbox-size-md); height: var(--ui-checkbox-size-md); }
.box-lg { width: var(--ui-checkbox-size-lg); height: var(--ui-checkbox-size-lg); }

/* Focus ring */
.checkbox-box:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--ui-checkbox-ring);
}

/* Disabled */
.checkbox-box[aria-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .check-path,
  .dash-path,
  .checkbox-box {
    transition-duration: 0ms;
  }
}
```

### index.ts Registration Pattern (Multi-Element Package)
```typescript
// Source: Derived from packages/select/src/index.ts (multi-element registration)
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

export { Checkbox } from './checkbox.js';
export { CheckboxGroup } from './checkbox-group.js';
export type { CheckboxSize } from './checkbox.js';

export { TailwindElement, isServer } from '@lit-ui/core';

import { Checkbox } from './checkbox.js';
import { CheckboxGroup } from './checkbox-group.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-checkbox')) {
    customElements.define('lui-checkbox', Checkbox);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-checkbox] Custom element already registered.');
  }

  if (!customElements.get('lui-checkbox-group')) {
    customElements.define('lui-checkbox-group', CheckboxGroup);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-checkbox-group] Custom element already registered.');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-checkbox': Checkbox;
    'lui-checkbox-group': CheckboxGroup;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS `clip-path` or `opacity` for checkmark | SVG `stroke-dasharray`/`stroke-dashoffset` for draw-in | Widely adopted ~2018+ | Natural draw-in animation without JavaScript |
| Hidden `<input type="checkbox">` in Shadow DOM | `ElementInternals` + `setFormValue()` | ElementInternals shipped in all browsers 2023 | No hidden inputs needed; cleaner Shadow DOM |
| `aria-controls` for parent-child checkbox | Skip `aria-controls` (poor SR support) | Recognition of cross-shadow-boundary ARIA limitation | Simpler implementation, no loss of practical accessibility |
| Native `indeterminate` property only | `aria-checked="mixed"` on custom element | Custom elements cannot use native `:indeterminate` pseudo-class | Full ARIA support for screen readers |

**Deprecated/outdated:**
- Hidden native `<input>` inside Shadow DOM for form participation: Replaced by ElementInternals
- `aria-controls` for select-all patterns: Poor screen reader support, cross-shadow-boundary issue; skip it

## Open Questions

1. **Should CheckboxGroup render its own select-all checkbox or require it in slot?**
   - What we know: The W3C APG pattern shows the parent checkbox as part of the group. The group needs to manage it internally for proper coordination.
   - What's unclear: Whether the select-all checkbox should be a built-in rendered element (via boolean property like `show-select-all`) or slotted.
   - Recommendation: Render it internally via a `select-all` boolean property on CheckboxGroup. This simplifies the API and ensures proper state coordination. The alternative (requiring a slotted "controller" checkbox) adds API complexity without benefit.

2. **CheckboxGroup validation: ElementInternals or property-based UI only?**
   - What we know: Architecture docs say CheckboxGroup is NOT form-associated. Individual checkboxes handle their own form submission.
   - What's unclear: How does "group required" validation integrate with native form validation (`:invalid`, `reportValidity()`)?
   - Recommendation: CheckboxGroup provides visual validation UI (error message, red border) via properties. It does NOT use ElementInternals. For native form validation integration, consumers can use individual checkbox `required` attributes. The group `required` property means "show error if zero children are checked" -- this is a UX enhancement, not a form-level constraint.

3. **Checkbox label click behavior**
   - What we know: The label is associated via `aria-labelledby`. Clicking it should toggle the checkbox.
   - What's unclear: With the label rendered as `<label>` inside shadow DOM, clicking it does not natively toggle a `<div role="checkbox">` (that only works with `<input>`).
   - Recommendation: Add a click handler on the label element that delegates to `this.toggle()`. The label and checkbox-box are siblings in a flex container; clicking either toggles the checkbox.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/switch/src/switch.ts` -- Form participation pattern, formResetCallback, validation, SSR guards, CSS token styling (the direct predecessor)
- Existing codebase: `packages/switch/src/index.ts` -- Safe element registration pattern
- Existing codebase: `packages/switch/src/jsx.d.ts` -- JSX type declarations template
- Existing codebase: `packages/switch/package.json` -- Package structure template
- Existing codebase: `packages/select/src/select.ts` -- slotchange child discovery pattern, MutationObserver backup
- Existing codebase: `packages/core/src/styles/tailwind.css` -- Token definition pattern (`--ui-switch-*` block as template)
- Existing codebase: `packages/core/src/utils/events.ts` -- dispatchCustomEvent helper
- `.planning/research/ARCHITECTURE-TOGGLES.md` -- Architecture decisions: CheckboxGroup not form-associated, individual checkboxes submit independently
- `.planning/research/FEATURES-CHECKBOX-RADIO-SWITCH.md` -- Feature requirements, ARIA quick reference, anti-features
- `.planning/research/PITFALLS-CHECKBOX-RADIO-SWITCH.md` -- Pitfalls: indeterminate as form value, space key scroll, form callbacks, aria-controls cross-shadow-DOM
- `.planning/phases/38-switch-component/38-02-SUMMARY.md` -- PropertyValues type fix for api-extractor
- [W3C WAI-ARIA APG: Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) -- ARIA role, keyboard interaction (Space only), states
- [W3C APG: Mixed-State Checkbox Example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/) -- Parent checkbox coordination, tri-state behavior
- [MDN: ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) -- Form participation API
- [MDN: HTMLInputElement.indeterminate](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/indeterminate) -- Indeterminate behavior reference
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) -- Motion preference media query

### Secondary (MEDIUM confidence)
- SVG stroke-dasharray/stroke-dashoffset animation technique -- widely documented, standard SVG animation pattern used by major component libraries
- [Nolan Lawson: Shadow DOM and ARIA](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) -- Cross-root ARIA problem (why aria-controls is skipped)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Zero new dependencies; all libraries already in use across the monorepo
- Architecture: HIGH -- Follows exact patterns from Switch (form participation), Select (slot-based child discovery), and project architecture docs
- Pitfalls: HIGH -- Well-documented in project research docs and W3C APG; Phase 38 PropertyValues fix directly applicable

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (stable domain, no fast-moving dependencies)
