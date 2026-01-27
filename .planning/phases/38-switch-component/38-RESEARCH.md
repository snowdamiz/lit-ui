# Phase 38: Switch Component - Research

**Researched:** 2026-01-26
**Domain:** Accessible toggle switch web component with Lit, ElementInternals, CSS transitions
**Confidence:** HIGH

## Summary

The Switch component is the simplest toggle control in the v4.2 milestone -- a standalone form-associated custom element with no group container needed. It follows the exact same patterns already established in `lui-input` (ElementInternals for form participation, `isServer` guards for SSR, CSS custom property tokens for theming) with one key difference: instead of wrapping a native `<input>`, it renders a custom `<div role="switch">` with a track + thumb visual.

The primary technical concerns are: (1) correct `role="switch"` with `aria-checked` (not checkbox role), (2) CSS transition for the thumb slide animation with `prefers-reduced-motion` respect, (3) form participation via ElementInternals with proper `formResetCallback` handling for boolean checked state, and (4) keyboard handling for Space (required) and Enter (optional, recommended).

No new dependencies are needed. Zero external libraries. The component uses CSS `transition` on `transform: translateX()` for thumb animation and `background-color` for track color change. The entire component is one file (`switch.ts`) plus the standard `index.ts`, `jsx.d.ts`, and config files.

**Primary recommendation:** Build `lui-switch` as a standalone `@lit-ui/switch` package following the exact `@lit-ui/input` structure. Use a `<div role="switch">` (not a native checkbox) with ElementInternals for form participation. CSS transitions for animation, CSS custom properties for theming, `isServer` guards for SSR.

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
| `<div role="switch">` | `<input type="checkbox" role="switch">` | Native input gets free form participation but limits Shadow DOM styling; ElementInternals is already proven in this codebase |
| CSS transitions | Web Animations API | WAAPI is more powerful but CSS transitions are simpler for this use case and already the pattern (Button spinner uses CSS keyframes) |
| No mixin/base class | Shared FormAssociated mixin | Mixin creates coupling; codebase intentionally duplicates small form boilerplate per component for CLI copy-source mode |

**Installation:** No new packages needed. Package created with existing workspace dependencies.

## Architecture Patterns

### Recommended Project Structure
```
packages/switch/
  src/
    switch.ts             # lui-switch element (the component)
    index.ts              # Exports + safe element registration
    jsx.d.ts              # JSX type declarations (React, Vue, Svelte)
    vite-env.d.ts         # Vite client types
  package.json            # @lit-ui/switch
  tsconfig.json
  vite.config.ts          # Uses createLibraryConfig()
```

This matches the existing `@lit-ui/button`, `@lit-ui/input` package structure exactly. Switch is standalone (no group container), so it is the simplest package.

### Pattern 1: Form-Associated Custom Element (ElementInternals)
**What:** Use `static formAssociated = true` and `attachInternals()` to participate in native HTML forms.
**When to use:** Every form control component in this library.
**Source:** Existing `packages/input/src/input.ts` lines 46-53, 528-564, 723-737

```typescript
export class Switch extends TailwindElement {
  static formAssociated = true;
  private internals: ElementInternals | null = null;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  private updateFormValue(): void {
    // Submit value when checked, null when unchecked (matches native checkbox)
    this.internals?.setFormValue(this.checked ? (this.value || 'on') : null);
  }

  formResetCallback(): void {
    this.checked = this.defaultChecked;
    this.updateFormValue();
    this.internals?.setValidity({});
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }
}
```

### Pattern 2: ARIA Switch Role
**What:** Use `role="switch"` with `aria-checked` on a focusable `<div>`.
**When to use:** This component specifically (not checkbox or radio).
**Source:** [W3C APG Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)

```typescript
render() {
  return html`
    <div class="switch-wrapper">
      ${this.label ? html`<span id="${this.switchId}-label" class="switch-label" ...>${this.label}</span>` : nothing}
      <div
        role="switch"
        aria-checked=${this.checked ? 'true' : 'false'}
        aria-disabled=${this.disabled ? 'true' : nothing}
        aria-required=${this.required ? 'true' : nothing}
        aria-labelledby=${this.label ? `${this.switchId}-label` : nothing}
        tabindex=${this.disabled ? nothing : '0'}
        class="switch-track ..."
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <span class="switch-thumb"></span>
      </div>
    </div>
  `;
}
```

**Key ARIA facts (HIGH confidence - W3C APG):**
- `role="switch"` is required (NOT `role="checkbox"`)
- `aria-checked` values: `"true"` or `"false"` only (NEVER `"mixed"` -- switch is binary)
- Space key: required
- Enter key: optional (recommended to include per prior decision)
- Must have an accessible label via `aria-labelledby`, `aria-label`, or visible text

### Pattern 3: CSS Token Theming
**What:** Define `--ui-switch-*` CSS custom properties in `:root` for full theming control.
**When to use:** All component visual properties that should be customizable.
**Source:** Existing `packages/core/src/styles/tailwind.css` (input/button/select token blocks)

```css
:root {
  /* Switch Component Tokens */
  /* Track dimensions per size */
  --ui-switch-track-width-sm: 2rem;
  --ui-switch-track-height-sm: 1.125rem;
  --ui-switch-track-width-md: 2.5rem;
  --ui-switch-track-height-md: 1.375rem;
  --ui-switch-track-width-lg: 3rem;
  --ui-switch-track-height-lg: 1.625rem;

  /* Thumb dimensions per size */
  --ui-switch-thumb-size-sm: 0.875rem;
  --ui-switch-thumb-size-md: 1.125rem;
  --ui-switch-thumb-size-lg: 1.375rem;

  /* Layout */
  --ui-switch-radius: 9999px;
  --ui-switch-thumb-radius: 9999px;
  --ui-switch-label-gap: 0.5rem;
  --ui-switch-thumb-offset: 2px;
  --ui-switch-transition: 150ms;

  /* Colors - default (unchecked) */
  --ui-switch-track-bg: var(--color-muted, ...);
  --ui-switch-track-border: var(--color-border, ...);
  --ui-switch-thumb-bg: white;

  /* Colors - checked */
  --ui-switch-track-bg-checked: var(--color-primary, ...);

  /* Colors - disabled */
  --ui-switch-track-bg-disabled: var(--color-muted, ...);
  --ui-switch-thumb-bg-disabled: var(--color-muted-foreground, ...);

  /* Colors - focus */
  --ui-switch-ring: var(--color-ring, ...);

  /* Colors - error */
  --ui-switch-border-error: var(--color-destructive, ...);
}
```

### Pattern 4: Animated Slide Transition with Reduced Motion
**What:** CSS transition for thumb translateX + track background-color, disabled when user prefers reduced motion.
**When to use:** The switch toggle animation.
**Source:** [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), existing PITFALLS research Pitfall #9

```css
.switch-thumb {
  transition: transform var(--ui-switch-transition) ease-in-out;
}

.switch-track {
  transition: background-color var(--ui-switch-transition) ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .switch-thumb,
  .switch-track {
    transition-duration: 0ms;
  }
}
```

### Pattern 5: SSR Compatibility
**What:** Guard all browser-only APIs with `isServer` checks.
**When to use:** Constructor (attachInternals), connectedCallback.
**Source:** Existing `packages/input/src/input.ts` constructor, `packages/core/src/tailwind-element.ts`

```typescript
constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}
```

### Pattern 6: Safe Element Registration
**What:** Register custom element with collision detection in `index.ts`.
**When to use:** Every component package's index.ts.
**Source:** Existing `packages/input/src/index.ts`

```typescript
if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-switch')) {
    customElements.define('lui-switch', Switch);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-switch] Custom element already registered.');
  }
}
```

### Anti-Patterns to Avoid
- **Using `<input type="checkbox" role="switch">`:** Adds complexity (hiding native input, syncing states). ElementInternals is the established pattern in this codebase for form participation. A `<div role="switch">` with ElementInternals is cleaner.
- **Using `aria-checked="mixed"` on switch:** The switch role does not support mixed/indeterminate state per spec. Switch is binary only.
- **Creating a shared FormAssociated mixin:** The codebase intentionally duplicates form boilerplate per component. Each component is self-contained for CLI copy-source mode.
- **Using `aria-pressed` instead of `aria-checked`:** `aria-pressed` is for toggle buttons, not switches. Switch uses `role="switch"` + `aria-checked`.
- **Changing the label text based on state:** Labels should describe WHAT is controlled ("Notifications"), not the action ("Enable/Disable"). The aria-checked state communicates on/off.
- **Not preventing Space key default:** Space key must call `preventDefault()` to avoid page scrolling.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom event dispatch | Manual `new CustomEvent()` | `dispatchCustomEvent()` from `@lit-ui/core` | Already sets `bubbles: true, composed: true` defaults correctly |
| Build configuration | Custom Vite config | `createLibraryConfig()` from `@lit-ui/vite-config` | Handles Tailwind plugin, dts, external deps |
| Base class + styles | Raw LitElement | `TailwindElement` + `tailwindBaseStyles` from `@lit-ui/core` | Handles SSR style injection, constructable stylesheets |
| Dark mode | Manual color switching | Token system (`--ui-switch-*` referencing `--color-*`) | Dark mode via `.dark` class automatically changes semantic color tokens |
| Unique IDs | UUID library | `Math.random().toString(36).substr(2, 9)` | Established pattern from Input component for label/aria associations |

**Key insight:** The Switch component introduces ZERO new technical concepts. Every pattern (form participation, SSR guards, token theming, safe registration, JSX types) is already proven in the codebase. The novelty is purely in the visual design (track + thumb) and the ARIA role (`switch` vs `checkbox`).

## Common Pitfalls

### Pitfall 1: role="switch" Screen Reader Inconsistency
**What goes wrong:** VoiceOver (macOS/iOS) and NVDA+Firefox announce `role="switch"` as "checkbox" instead of "switch". Users may not understand it is a toggle.
**Why it happens:** `role="switch"` is newer than `role="checkbox"`. Screen reader support is inconsistent.
**How to avoid:** Still use `role="switch"` (it is the correct semantic). Reinforce with visual design -- the sliding thumb track clearly communicates "toggle" visually. Screen reader support is improving.
**Warning signs:** VoiceOver says "checkbox" for the switch. This is expected on some platforms and NOT a bug in the component.
**Confidence:** HIGH -- [Adrian Roselli: Switch Role Support](https://adrianroselli.com/2021/10/switch-role-support.html)

### Pitfall 2: Switch Animation Without prefers-reduced-motion
**What goes wrong:** The sliding thumb animation plays even when the user has enabled "Reduce Motion" in OS settings.
**Why it happens:** Developers forget the media query or treat it as an afterthought.
**How to avoid:** Include `@media (prefers-reduced-motion: reduce)` from day one. Set `transition-duration: 0ms` for thumb and track transitions. Keep focus ring transitions (functional, not decorative).
**Warning signs:** Thumb slides smoothly with OS "Reduce Motion" enabled.
**Confidence:** HIGH -- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

### Pitfall 3: Missing formResetCallback for Boolean State
**What goes wrong:** Form reset does not restore switch to its initial checked/unchecked state. Unlike Input (which resets `value` to empty string), Switch must reset `checked` to its default.
**Why it happens:** Copying Input's formResetCallback directly (resetting value to '') does not apply. Switch needs to track `defaultChecked` and reset to that.
**How to avoid:** Store `defaultChecked` in `connectedCallback`. In `formResetCallback`, set `this.checked = this.defaultChecked` and update form value accordingly.
**Warning signs:** Clicking form reset button does not toggle switch back to initial state.
**Confidence:** HIGH -- [MDN ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)

### Pitfall 4: Space Key Without preventDefault Causes Page Scroll
**What goes wrong:** Pressing Space toggles the switch but also scrolls the page down.
**Why it happens:** Space key default behavior on `<div>` elements is page scroll. Must call `e.preventDefault()` in keydown handler.
**How to avoid:** In the keydown handler, call `e.preventDefault()` before toggling when `e.key === ' '`.
**Warning signs:** Page jumps when toggling switch via keyboard.
**Confidence:** HIGH -- [W3C APG Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)

### Pitfall 5: Form Value Submission When Unchecked
**What goes wrong:** Switch submits a value even when unchecked, or developers expect the field to always be present in FormData.
**Why it happens:** Confusion between `setFormValue('')` and `setFormValue(null)`.
**How to avoid:** When unchecked, call `setFormValue(null)` to omit from FormData entirely (matches native checkbox behavior). When checked, submit `this.value || 'on'`.
**Warning signs:** FormData contains the switch field when unchecked.
**Confidence:** HIGH -- [MDN setFormValue](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue)

### Pitfall 6: Required Validation on Unchecked Switch
**What goes wrong:** Switch with `required` attribute should prevent form submission when unchecked but does not.
**Why it happens:** Developer forgets to call `setValidity()` with `valueMissing` when required and unchecked.
**How to avoid:** In validation method: if `this.required && !this.checked`, call `this.internals.setValidity({ valueMissing: true }, 'Please toggle this switch.', anchorElement)`. Clear validity when checked.
**Warning signs:** Form submits even though required switch is off.
**Confidence:** HIGH -- Existing Input validation pattern

## Code Examples

Verified patterns from existing codebase and official specs:

### Complete Switch Component Structure
```typescript
// Source: Derived from packages/input/src/input.ts + W3C APG Switch Pattern
import { html, css, nothing, isServer } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export type SwitchSize = 'sm' | 'md' | 'lg';

export class Switch extends TailwindElement {
  static formAssociated = true;
  private internals: ElementInternals | null = null;
  private switchId = `lui-switch-${Math.random().toString(36).substr(2, 9)}`;
  private defaultChecked = false;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: String }) name = '';
  @property({ type: String }) value = 'on';
  @property({ type: String }) label = '';
  @property({ type: String }) size: SwitchSize = 'md';

  @state() private touched = false;
  @state() private showError = false;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.defaultChecked = this.checked;
  }

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host { display: inline-block; }
      :host([disabled]) { pointer-events: none; }

      .switch-track {
        display: inline-flex;
        align-items: center;
        border-radius: var(--ui-switch-radius);
        background-color: var(--ui-switch-track-bg);
        cursor: pointer;
        transition: background-color var(--ui-switch-transition) ease-in-out;
        position: relative;
      }

      .switch-track[aria-checked='true'] {
        background-color: var(--ui-switch-track-bg-checked);
      }

      .switch-track[aria-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .switch-thumb {
        border-radius: var(--ui-switch-thumb-radius);
        background-color: var(--ui-switch-thumb-bg);
        transition: transform var(--ui-switch-transition) ease-in-out;
        position: absolute;
        left: var(--ui-switch-thumb-offset);
      }

      /* Size: sm */
      .track-sm {
        width: var(--ui-switch-track-width-sm);
        height: var(--ui-switch-track-height-sm);
      }
      .track-sm .switch-thumb {
        width: var(--ui-switch-thumb-size-sm);
        height: var(--ui-switch-thumb-size-sm);
      }
      .track-sm[aria-checked='true'] .switch-thumb {
        transform: translateX(calc(
          var(--ui-switch-track-width-sm) - var(--ui-switch-thumb-size-sm) - var(--ui-switch-thumb-offset) * 2
        ));
      }

      /* (md and lg follow same pattern with their size tokens) */

      /* Focus ring */
      .switch-track:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px var(--ui-switch-ring);
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .switch-thumb, .switch-track {
          transition-duration: 0ms;
        }
      }
    `
  ];

  private toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.updateFormValue();
    this.validate();
    // Dispatch change event
    dispatchCustomEvent(this, 'ui-change', {
      checked: this.checked,
      value: this.checked ? this.value : null,
    });
  }

  private handleClick(): void { this.toggle(); }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.toggle();
    }
  }

  private updateFormValue(): void {
    this.internals?.setFormValue(this.checked ? this.value : null);
  }

  private validate(): boolean {
    if (!this.internals) return true;
    if (this.required && !this.checked) {
      this.internals.setValidity(
        { valueMissing: true },
        'Please toggle this switch.',
        this.shadowRoot?.querySelector('.switch-track') as HTMLElement
      );
      return false;
    }
    this.internals.setValidity({});
    return true;
  }

  formResetCallback(): void {
    this.checked = this.defaultChecked;
    this.touched = false;
    this.showError = false;
    this.updateFormValue();
    this.internals?.setValidity({});
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  render() {
    return html`
      <div class="switch-wrapper">
        ${this.label ? html`
          <label id="${this.switchId}-label" class="switch-label label-${this.size}">
            ${this.label}
          </label>
        ` : nothing}
        <div
          role="switch"
          aria-checked=${this.checked ? 'true' : 'false'}
          aria-disabled=${this.disabled ? 'true' : nothing}
          aria-required=${this.required ? 'true' : nothing}
          aria-labelledby=${this.label ? `${this.switchId}-label` : nothing}
          tabindex=${this.disabled ? '-1' : '0'}
          class="switch-track track-${this.size}"
          @click=${this.handleClick}
          @keydown=${this.handleKeyDown}
        >
          <span class="switch-thumb"></span>
        </div>
      </div>
    `;
  }
}
```

### Package.json Template
```json
{
  "name": "@lit-ui/switch",
  "version": "1.0.0",
  "description": "Accessible switch/toggle component built with Lit and Tailwind CSS",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "sideEffects": true,
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  },
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  },
  "devDependencies": {
    "@lit-ui/core": "workspace:*",
    "@lit-ui/typescript-config": "workspace:*",
    "@lit-ui/vite-config": "workspace:*",
    "@tailwindcss/vite": "^4.1.18",
    "lit": "^3.3.2",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  }
}
```

### JSX Type Declarations Template
```typescript
// Source: Derived from packages/input/src/jsx.d.ts
import type { Switch, SwitchSize } from './switch.js';

interface LuiSwitchAttributes {
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  label?: string;
  size?: SwitchSize;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-switch': React.DetailedHTMLProps<
        React.HTMLAttributes<Switch> & LuiSwitchAttributes,
        Switch
      >;
    }
  }
}

declare module 'vue' {
  export interface GlobalComponents {
    'lui-switch': import('vue').DefineComponent<LuiSwitchAttributes>;
  }
}

declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-switch': LuiSwitchAttributes & {
      'on:ui-change'?: (e: CustomEvent) => void;
    };
  }
}
```

### CSS Design Tokens Block (for tailwind.css)
```css
/* Source: Pattern from existing --ui-input-* and --ui-button-* token blocks */

/* -------------------------------------------------------------------------
 * Switch Component
 * ------------------------------------------------------------------------- */

/* Track dimensions - Small */
--ui-switch-track-width-sm: 2rem;
--ui-switch-track-height-sm: 1.125rem;
--ui-switch-thumb-size-sm: 0.875rem;

/* Track dimensions - Medium */
--ui-switch-track-width-md: 2.5rem;
--ui-switch-track-height-md: 1.375rem;
--ui-switch-thumb-size-md: 1.125rem;

/* Track dimensions - Large */
--ui-switch-track-width-lg: 3rem;
--ui-switch-track-height-lg: 1.625rem;
--ui-switch-thumb-size-lg: 1.375rem;

/* Layout */
--ui-switch-radius: 9999px;
--ui-switch-thumb-radius: 9999px;
--ui-switch-thumb-offset: 2px;
--ui-switch-label-gap: 0.5rem;
--ui-switch-transition: 150ms;

/* Label typography (matches input pattern) */
--ui-switch-font-size-sm: 0.875rem;
--ui-switch-font-size-md: 1rem;
--ui-switch-font-size-lg: 1.125rem;

/* Default state (unchecked) */
--ui-switch-track-bg: var(--color-muted, var(--ui-color-muted));
--ui-switch-track-border: var(--color-border, var(--ui-color-border));
--ui-switch-thumb-bg: white;

/* Checked state */
--ui-switch-track-bg-checked: var(--color-primary, var(--ui-color-primary));

/* Disabled state */
--ui-switch-track-bg-disabled: var(--color-muted, var(--ui-color-muted));
--ui-switch-thumb-bg-disabled: var(--color-muted-foreground, var(--ui-color-muted-foreground));

/* Focus state */
--ui-switch-ring: var(--color-ring, var(--ui-color-ring));

/* Error state */
--ui-switch-border-error: var(--color-destructive, var(--ui-color-destructive));
--ui-switch-text-error: var(--color-destructive, var(--ui-color-destructive));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hidden `<input type="checkbox">` in Shadow DOM | `ElementInternals` + `setFormValue()` | ElementInternals shipped in all browsers 2023 | No hidden inputs needed; cleaner Shadow DOM |
| `role="checkbox"` for toggles | `role="switch"` (distinct role) | WAI-ARIA 1.1+ | Semantic distinction between check/uncheck (checkbox) and on/off (switch) |
| Custom animation libraries | CSS `transition` property | CSS3 | Zero-dependency slide animations |
| `@keyframes` for simple transitions | `transition: transform` + `translateX()` | CSS3 | Simpler for single-property animations like thumb slide |

**Deprecated/outdated:**
- Hidden native `<input>` inside Shadow DOM for form participation: Replaced by ElementInternals (established pattern in this codebase)
- `aria-pressed` for toggle controls: Use `aria-checked` with `role="switch"` instead

## Open Questions

1. **Label position: before or after the track?**
   - What we know: Most UI libraries place the label to the right of the switch track. Some place it to the left.
   - What's unclear: Project has no design spec for label placement.
   - Recommendation: Place label to the right of the track (most common convention). Use CSS flexbox so the planner can easily flip via `flex-direction: row-reverse` if needed.

2. **Default slot vs label property for label content**
   - What we know: Requirements specify "label property or default slot." Input component uses a `label` property.
   - What's unclear: Whether the default slot should wrap the entire switch (like a native `<label>` wrapping `<input>`) or just provide label text.
   - Recommendation: Support both `label` property (renders text label) and a default `<slot>` for custom label content. The `<slot>` should be for label text only (not wrapping the track). This matches Input's pattern of supporting a `label` property.

3. **Error text display for required validation**
   - What we know: Input shows error text below the field. Switch with `required` should show similar feedback.
   - What's unclear: Exact visual placement of error text relative to track + label.
   - Recommendation: Show error text below the switch wrapper, same pattern as Input. Include `role="alert"` on error text element.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/input/src/input.ts` -- Form participation pattern, formResetCallback, validation, SSR guards
- Existing codebase: `packages/button/src/button.ts` -- CSS token styling, disabled state, variant/size pattern
- Existing codebase: `packages/core/src/tailwind-element.ts` -- Base class, SSR style injection
- Existing codebase: `packages/core/src/styles/tailwind.css` -- Token definition pattern
- Existing codebase: `packages/core/src/utils/events.ts` -- dispatchCustomEvent helper
- Existing codebase: `packages/button/package.json` -- Package structure template
- Existing codebase: `packages/vite-config/library.js` -- Build config
- [W3C WAI-ARIA APG: Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) -- ARIA role, keyboard interaction, states
- [MDN: role="switch"](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/switch_role) -- ARIA switch role reference
- [MDN: ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) -- Form participation API
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) -- Motion preference media query
- `.planning/research/ARCHITECTURE-TOGGLES.md` -- Architecture decisions for toggle controls
- `.planning/research/FEATURES-CHECKBOX-RADIO-SWITCH.md` -- Feature requirements for switch
- `.planning/research/PITFALLS-CHECKBOX-RADIO-SWITCH.md` -- Pitfalls to avoid

### Secondary (MEDIUM confidence)
- [Adrian Roselli: Switch Role Support](https://adrianroselli.com/2021/10/switch-role-support.html) -- Screen reader support matrix
- [Scott O'Hara: ARIA Switch Control](https://scottaohara.github.io/aria-switch-control/) -- Reference implementation
- [Kitty Giraudel: Accessible Toggle](https://kittygiraudel.com/2021/04/05/an-accessible-toggle/) -- Reduced motion patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Zero new dependencies; all libraries already in use across the monorepo
- Architecture: HIGH -- Follows exact patterns from existing Input/Button components; all patterns proven in codebase
- Pitfalls: HIGH -- Well-documented in project research docs (PITFALLS-CHECKBOX-RADIO-SWITCH.md) and W3C APG

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (stable domain, no fast-moving dependencies)
