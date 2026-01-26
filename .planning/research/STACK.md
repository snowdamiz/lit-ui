# Technology Stack: Input & Textarea Components

**Project:** LitUI Form Inputs
**Researched:** 2026-01-26
**Focus:** Stack additions for Input/Textarea with built-in validation

---

## Executive Summary

**No new dependencies required.** The existing stack provides everything needed for form-participating Input and Textarea components with built-in validation. ElementInternals (proven in Button) combined with native HTML constraint validation delivers a complete, standards-based solution.

---

## Existing Stack (Already Validated - DO NOT CHANGE)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Lit | ^3.3.2 | Web component framework | In use |
| Tailwind CSS | ^4.1.18 | Styling with constructable stylesheets | In use |
| TailwindElement | @lit-ui/core | Base class with SSR support | In use |
| ElementInternals | Native | Form participation | Proven in Button |
| TypeScript | ^5.9.3 | Type safety | In use |
| Vite | ^7.3.1 | Build tooling | In use |

---

## Stack Additions for Form Inputs

### Required: NONE

The native browser APIs provide everything needed:

| API | Purpose | Browser Support |
|-----|---------|-----------------|
| ElementInternals.setValidity() | Set validation state | Baseline since March 2023 |
| ElementInternals.setFormValue() | Set form submission value | Baseline since March 2023 |
| ElementInternals.checkValidity() | Check validity without UI | Baseline since March 2023 |
| ElementInternals.reportValidity() | Validate and show native UI | Baseline since March 2023 |
| ValidityState flags | Structured error reasons | Part of ElementInternals |

**Why native APIs are sufficient:**

1. **Zero bundle size impact** - Browser provides these APIs natively
2. **Proven in codebase** - Button already uses `static formAssociated = true` and `attachInternals()`
3. **Framework-agnostic** - Native APIs work everywhere
4. **SSR compatible** - Existing `isServer` guard pattern handles this
5. **Full validation coverage** - setValidity() supports all ValidityState flags

---

## Validation Implementation Pattern

### Strategy: Delegate to Native Input

Wrap a native `<input>` or `<textarea>` in Shadow DOM and sync its ValidityState to ElementInternals.

```typescript
// Pattern proven in Button, extended for input validation
static formAssociated = true;
private internals: ElementInternals | null = null;

constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}

// Sync internal input validity to ElementInternals
private syncValidity() {
  if (!this.internals || !this.inputEl) return;

  if (this.inputEl.validity.valid) {
    this.internals.setValidity({});
  } else {
    const validity = this.inputEl.validity;
    const flags: ValidityStateFlags = {};

    if (validity.valueMissing) flags.valueMissing = true;
    else if (validity.typeMismatch) flags.typeMismatch = true;
    else if (validity.patternMismatch) flags.patternMismatch = true;
    else if (validity.tooShort) flags.tooShort = true;
    else if (validity.tooLong) flags.tooLong = true;
    else if (validity.rangeUnderflow) flags.rangeUnderflow = true;
    else if (validity.rangeOverflow) flags.rangeOverflow = true;
    else if (validity.stepMismatch) flags.stepMismatch = true;

    this.internals.setValidity(
      flags,
      this.inputEl.validationMessage,
      this.inputEl // anchor for native validation popup
    );
  }
}
```

**Key insight:** Passing the internal `<input>` as the anchor parameter positions the browser's native validation popup correctly relative to the visible input element.

---

## ValidityState Flags Reference

All flags supported by `setValidity()`:

| Flag | Triggers When | Input Types |
|------|---------------|-------------|
| `valueMissing` | `required` attribute, no value | All |
| `typeMismatch` | Invalid format | email, url |
| `patternMismatch` | Value doesn't match `pattern` | text, search, tel, url, email, password |
| `tooShort` | Value length < `minlength` | text, search, url, tel, email, password, textarea |
| `tooLong` | Value length > `maxlength` | text, search, url, tel, email, password, textarea |
| `rangeUnderflow` | Value < `min` | number, range, date, time, datetime-local, month, week |
| `rangeOverflow` | Value > `max` | number, range, date, time, datetime-local, month, week |
| `stepMismatch` | Value doesn't match `step` | number, range, date, time, datetime-local, month, week |
| `badInput` | Browser can't convert input | number (non-numeric text) |
| `customError` | `setCustomValidity()` called | All |

---

## Form Lifecycle Callbacks

ElementInternals provides lifecycle callbacks that Input/Textarea should implement:

```typescript
// Called when containing form is reset
formResetCallback() {
  this.value = this.defaultValue;
  this.syncValidity();
}

// Called when form is restored (back/forward navigation, autofill)
formStateRestoreCallback(state: string, reason: 'restore' | 'autocomplete') {
  this.value = state;
  this.syncValidity();
}

// Called when form association changes
formAssociatedCallback(form: HTMLFormElement | null) {
  // Optional: track associated form
}

// Called when disabled state changes via fieldset
formDisabledCallback(disabled: boolean) {
  this.disabled = disabled;
}
```

---

## Attribute Forwarding

Input attributes that must be forwarded to the internal `<input>`:

| Component Attribute | Forwarded To | Validation Effect |
|--------------------|--------------|-------------------|
| `required` | input.required | Enables valueMissing |
| `minlength` | input.minLength | Enables tooShort |
| `maxlength` | input.maxLength | Enables tooLong |
| `min` | input.min | Enables rangeUnderflow |
| `max` | input.max | Enables rangeOverflow |
| `step` | input.step | Enables stepMismatch |
| `pattern` | input.pattern | Enables patternMismatch |
| `type` | input.type | Affects typeMismatch |
| `placeholder` | input.placeholder | - |
| `autocomplete` | input.autocomplete | - |
| `readonly` | input.readOnly | - |
| `disabled` | input.disabled | - |

---

## Libraries Evaluated and Rejected

### @open-wc/form-control (v1.0.0)

| Factor | Assessment |
|--------|------------|
| Last publish | October 2023 (2+ years stale) |
| Weekly downloads | ~1,500 (low adoption) |
| Value add | Minimal over native APIs |

**Why NOT to use:**
- Adds abstraction without benefit - ElementInternals API is straightforward
- Stale package - No updates in 2+ years
- Validation pattern mismatch - Uses its own validator abstraction; we delegate to native `<input>`
- Bundle size cost - Adds ~20KB for functionality already available natively

### lit-reactive-forms

**Status:** Does not exist on npm (GitHub repo only, no published package)

### Custom FormControlController

**Status:** NOT recommended for this milestone

**Rationale:** Could be useful for many form components (select, checkbox, radio). For Input and Textarea only:
- Validation sync logic is ~30 lines
- Controller adds complexity without reducing it
- Can refactor to controller later if pattern proves reusable across 3+ components

---

## Validation Error Display

### Recommended: Native Browser Validation UI

Use `reportValidity()` which triggers the browser's built-in validation popup.

**Pros:**
- Zero implementation cost
- Accessible by default
- Localized error messages
- Positioning handled by browser

**Cons:**
- Cannot style the popup
- Popup styling varies by browser

### Future: Custom Validation Messages

Custom-styled validation messages using CSS Anchor Positioning.

**Browser support:**
- Chrome/Edge: Supported
- Safari 26+: Supported (September 2025)
- Firefox: In development

**If implementing custom messages later:**
1. Use Popover API for error tooltip
2. Use CSS `anchor-name` / `position-anchor`
3. Polyfill available: `@oddbird/css-anchor-positioning` (v0.7.0 supports Shadow DOM)

**Recommendation:** Start with native validation UI. Custom styling is a future milestone when Firefox ships support.

---

## CSS Custom Properties

Follow established pattern from Button and Dialog:

```css
/* Input tokens (add to theme system) */
--ui-input-bg: var(--ui-color-background);
--ui-input-border: var(--ui-color-border);
--ui-input-border-focus: var(--ui-color-ring);
--ui-input-text: var(--ui-color-foreground);
--ui-input-placeholder: var(--ui-color-muted-foreground);
--ui-input-radius: var(--ui-radius);
--ui-input-padding-x: 0.75rem;
--ui-input-padding-y: 0.5rem;

/* Error state */
--ui-input-border-error: var(--ui-color-destructive);
--ui-input-text-error: var(--ui-color-destructive);

/* Textarea-specific */
--ui-textarea-min-height: 5rem;
--ui-textarea-resize: vertical;
```

---

## Integration Points

### TailwindElement Base Class

```typescript
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export class Input extends TailwindElement {
  static formAssociated = true;

  static override styles = [
    ...tailwindBaseStyles,
    css`/* component-specific styles */`
  ];
}
```

### SSR Compatibility

```typescript
import { isServer } from 'lit';

constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}
```

### Event Utilities

```typescript
import { dispatchCustomEvent } from '@lit-ui/core/utils';

// Emit change event
dispatchCustomEvent(this, 'ui-change', { value: this.value });
```

---

## Package Structure

```
packages/input/
  package.json        # peer deps: lit, @lit-ui/core
  src/
    input.ts          # lui-input component
    textarea.ts       # lui-textarea component
    index.ts          # exports
    jsx.d.ts          # JSX types for React/Preact
  vite.config.ts
  tsconfig.json
```

---

## What NOT to Add

| Library/Approach | Reason to Avoid |
|------------------|-----------------|
| @open-wc/form-control | Stale, adds abstraction without benefit |
| Zod/Yup/etc | Schema validation is consumer responsibility |
| Custom validation message component | Premature; use native UI first |
| FormControlController | Over-engineering for 2 components |
| element-internals-polyfill | Safari 16.4+ is baseline; no legacy browser support needed |

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| ElementInternals API | HIGH | MDN docs verified, proven in Button |
| setValidity() flags | HIGH | MDN docs explicit, all flags documented |
| Native input delegation | HIGH | Established web component pattern |
| No new deps needed | HIGH | All APIs are native browser features |

---

## Sources

- [MDN: ElementInternals.setValidity()](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setValidity) - Complete API reference
- [MDN: Constraint Validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation) - Native validation overview
- [WebKit: ElementInternals and Form-Associated Custom Elements](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) - Safari baseline announcement
- [Native Form Validation of Web Components](https://www.dannymoerkerke.com/blog/native-form-validation-of-web-components/) - Implementation pattern reference
- [OddBird: Anchor Positioning Updates](https://www.oddbird.net/2025/10/13/anchor-position-area-update/) - CSS anchor positioning browser status
- Existing codebase: `packages/button/src/button.ts` - Proven ElementInternals pattern

---

*Stack research for: LitUI Input & Textarea milestone*
*Researched: 2026-01-26*
