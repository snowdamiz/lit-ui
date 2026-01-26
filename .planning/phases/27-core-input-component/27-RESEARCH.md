# Phase 27: Core Input Component - Research

**Researched:** 2026-01-26
**Domain:** Lit 3 form-associated custom elements with ElementInternals
**Confidence:** HIGH

## Summary

This research covers building a text input component as a form-associated custom element using Lit 3 and the ElementInternals API. The component must support five input types (text, email, password, number, search), three sizes (sm, md, lg), native form participation, constraint validation, and accessible visual states.

The standard approach is to use `static formAssociated = true` with `attachInternals()` to enable form participation, then implement validation using `setValidity()` with the Constraint Validation API flags. The component should wrap a native `<input>` element in Shadow DOM while using ElementInternals to expose form values and validation state to parent forms. CSS tokens from Phase 26 are already available and must be used for styling.

The existing Button component provides an excellent template for structure, SSR handling (`isServer` guards), CSS custom property patterns, and package organization.

**Primary recommendation:** Extend TailwindElement, use ElementInternals for form participation/validation, wrap native input in Shadow DOM, validate on blur using setValidity(), use Phase 26 CSS tokens.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | ^3.3.2 | Web component framework | Project standard, SSR support via `isServer` |
| @lit-ui/core | workspace:* | TailwindElement base class, tokens | Provides Tailwind in Shadow DOM, CSS token exports |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lit/decorators.js | ^3.3.2 | @property, @query, @state decorators | All reactive properties and DOM queries |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native input in Shadow DOM | Slotted input in light DOM | Light DOM fixes autofill but breaks style encapsulation; Shadow DOM is project standard |
| ElementInternals validation | Custom validation library | ElementInternals is native, no dependencies, matches button pattern |

**Installation:**
```bash
# Package already in workspace, deps match button package
pnpm add lit@^3.3.2 @lit-ui/core@workspace:*
```

## Architecture Patterns

### Recommended Project Structure
```
packages/input/
├── src/
│   ├── index.ts           # Exports, custom element registration
│   ├── input.ts           # Input class implementation
│   ├── jsx.d.ts           # JSX type declarations (React/Vue/Svelte)
│   └── vite-env.d.ts      # Vite type reference
├── package.json           # Match button package structure
├── tsconfig.json          # Extend @lit-ui/typescript-config
└── vite.config.ts         # Use createLibraryConfig
```

### Pattern 1: Form-Associated Custom Element
**What:** Use static formAssociated and ElementInternals for native form participation
**When to use:** Any form control component
**Example:**
```typescript
// Source: MDN ElementInternals, existing button.ts pattern
import { html, css, isServer } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export class Input extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;

  @query('input')
  private inputEl!: HTMLInputElement;

  @property({ type: String })
  value = '';

  @property({ type: String })
  name = '';

  @property({ type: String })
  type: InputType = 'text';

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  // Sync value to form
  private updateFormValue() {
    this.internals?.setFormValue(this.value);
  }
}
```

### Pattern 2: Constraint Validation with setValidity
**What:** Use setValidity() to report validation state matching native input behavior
**When to use:** Required fields, pattern validation, type validation
**Example:**
```typescript
// Source: MDN ElementInternals/setValidity
private validate(): boolean {
  const input = this.inputEl;
  if (!input || !this.internals) return true;

  // Leverage native input's validity state
  const validity = input.validity;

  if (!validity.valid) {
    // Map native validity to ElementInternals
    this.internals.setValidity(
      {
        valueMissing: validity.valueMissing,
        typeMismatch: validity.typeMismatch,
        patternMismatch: validity.patternMismatch,
        tooShort: validity.tooShort,
        tooLong: validity.tooLong,
        rangeUnderflow: validity.rangeUnderflow,
        rangeOverflow: validity.rangeOverflow,
      },
      input.validationMessage,
      input // anchor for native popup positioning
    );
    return false;
  }

  // Clear validity when valid
  this.internals.setValidity({});
  return true;
}
```

### Pattern 3: Validate on Blur (per CONTEXT.md decision)
**What:** Trigger validation when input loses focus, not on every keystroke
**When to use:** Form inputs with validation requirements
**Example:**
```typescript
// Source: Constraint Validation API best practices
@state()
private touched = false;

@state()
private showError = false;

private handleBlur() {
  this.touched = true;
  const isValid = this.validate();
  this.showError = !isValid;
  this.requestUpdate();
}

private handleInput(e: Event) {
  const input = e.target as HTMLInputElement;
  this.value = input.value;
  this.updateFormValue();

  // Only re-validate if already touched (blur occurred)
  if (this.touched) {
    const isValid = this.validate();
    this.showError = !isValid;
  }
}
```

### Pattern 4: Label Association (per CONTEXT.md decision)
**What:** Optional built-in label with proper for/id association
**When to use:** When developer provides label prop
**Example:**
```typescript
// Generate unique ID for label association
private inputId = `lui-input-${Math.random().toString(36).substr(2, 9)}`;

@property({ type: String })
label = '';

render() {
  return html`
    ${this.label ? html`
      <label for=${this.inputId} class="input-label" part="label">
        ${this.label}
        ${this.required ? html`<span class="required-indicator">${this.requiredIndicator === 'text' ? '(required)' : '*'}</span>` : nothing}
      </label>
    ` : nothing}
    ${this.helperText ? html`<span class="helper-text" part="helper">${this.helperText}</span>` : nothing}
    <input
      id=${this.inputId}
      part="input"
      ...
    />
    ${this.showError && this.errorMessage ? html`<span class="error-text" part="error">${this.errorMessage}</span>` : nothing}
  `;
}
```

### Pattern 5: Form Lifecycle Callbacks
**What:** Respond to form events (reset, disabled state changes)
**When to use:** All form-associated elements
**Example:**
```typescript
// Source: WHATWG HTML Standard, WebKit ElementInternals article
formResetCallback() {
  // Called when parent form is reset
  this.value = this.defaultValue;
  this.touched = false;
  this.showError = false;
  this.updateFormValue();
  this.internals?.setValidity({});
}

formDisabledCallback(disabled: boolean) {
  // Called when disabled state changes via form/fieldset
  this.disabled = disabled;
  this.requestUpdate();
}
```

### Anti-Patterns to Avoid
- **Validating on every keystroke:** Frustrates users; validate on blur instead (per CONTEXT.md)
- **Creating custom validation state tracking:** Use ElementInternals validity state instead
- **Bypassing native input:** Keep a native `<input>` in Shadow DOM for accessibility, autofill support
- **Manual focus management without :focus-visible:** Use CSS :focus-visible for keyboard focus, not :focus

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form value submission | Hidden input hack | ElementInternals.setFormValue() | Native API, proper FormData integration |
| Validation state | Custom validity tracking | ElementInternals.setValidity() | Maps to native ValidityState, triggers :invalid CSS |
| Email/URL validation | Regex patterns | Native input type + validity.typeMismatch | Browser-native patterns, i18n-aware |
| Min/max number validation | Manual number comparison | Native input min/max + validity.rangeUnderflow/Overflow | Handles edge cases (NaN, step) |
| Pattern validation | Manual regex testing | Native input pattern + validity.patternMismatch | Consistent with platform behavior |
| Unique IDs for labels | Counter or timestamp | crypto.randomUUID() or Math.random().toString(36) | Collision-resistant |

**Key insight:** Wrap a native `<input>` element to leverage browser-native validation, then mirror its ValidityState to ElementInternals. This gives you email keyboards on mobile, password managers working, number steppers, and proper validation for free.

## Common Pitfalls

### Pitfall 1: Forgetting isServer Guards
**What goes wrong:** attachInternals() throws during SSR
**Why it happens:** ElementInternals is a browser API not available during server rendering
**How to avoid:** Always guard: `if (!isServer) { this.internals = this.attachInternals(); }`
**Warning signs:** "attachInternals is not defined" errors during SSR/hydration

### Pitfall 2: Not Syncing Value on Every Change
**What goes wrong:** Form submission gets stale value
**Why it happens:** setFormValue() not called after value changes
**How to avoid:** Call `this.internals?.setFormValue(this.value)` in handleInput
**Warning signs:** FormData contains old value or empty string

### Pitfall 3: Validation Anchor Missing
**What goes wrong:** Native validation popup appears in wrong position
**Why it happens:** setValidity() called without anchor parameter
**How to avoid:** Pass the native input element as third argument: `setValidity(flags, message, this.inputEl)`
**Warning signs:** Browser validation popups floating in wrong location

### Pitfall 4: Missing formResetCallback
**What goes wrong:** Form reset doesn't clear/restore input
**Why it happens:** Form-associated element doesn't implement reset callback
**How to avoid:** Implement `formResetCallback()` to restore default value and clear validation
**Warning signs:** Form reset button doesn't affect custom input

### Pitfall 5: Error State Not Clearing
**What goes wrong:** Error styling persists after user fixes input
**Why it happens:** Not re-validating or clearing showError when value becomes valid
**How to avoid:** Re-validate on input if `touched = true`, clear error state when valid
**Warning signs:** Red border remains after entering valid value

### Pitfall 6: Placeholder Color Inconsistency
**What goes wrong:** Placeholder text invisible or wrong color in some states
**Why it happens:** Not using ::placeholder pseudo-element with proper color
**How to avoid:** Style `input::placeholder { color: var(--ui-input-placeholder); }`
**Warning signs:** Placeholder hard to read or disappears unexpectedly

### Pitfall 7: Readonly vs Disabled Confusion
**What goes wrong:** Readonly input looks/behaves same as disabled
**Why it happens:** Using same styling for both states
**How to avoid:** Per CONTEXT.md: readonly has selectable text, normal cursor, slightly different background
**Warning signs:** Users can't select/copy text from readonly fields

## Code Examples

Verified patterns from official sources:

### Complete Input Component Structure
```typescript
// Source: Existing button.ts pattern + MDN ElementInternals
import { html, css, nothing, isServer } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

export class Input extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;
  private inputId = `lui-input-${Math.random().toString(36).substr(2, 9)}`;

  @query('input') private inputEl!: HTMLInputElement;

  @property({ type: String }) type: InputType = 'text';
  @property({ type: String }) size: InputSize = 'md';
  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) label = '';
  @property({ type: String, attribute: 'helper-text' }) helperText = '';
  @property({ type: String }) pattern = '';
  @property({ type: Number }) minlength?: number;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) min?: number;
  @property({ type: Number }) max?: number;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: String, attribute: 'required-indicator' }) requiredIndicator: 'asterisk' | 'text' = 'asterisk';

  @state() private touched = false;
  @state() private showError = false;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  // Form lifecycle callbacks
  formResetCallback() {
    this.value = '';
    this.touched = false;
    this.showError = false;
    this.internals?.setFormValue('');
    this.internals?.setValidity({});
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  // ... validation and render methods
}
```

### CSS Custom Properties Usage
```css
/* Source: Phase 26 tokens, existing button.ts pattern */
:host {
  display: inline-block;
}

:host([disabled]) {
  pointer-events: none;
}

input {
  border-radius: var(--ui-input-radius);
  border-width: var(--ui-input-border-width);
  border-style: solid;
  border-color: var(--ui-input-border);
  background-color: var(--ui-input-bg);
  color: var(--ui-input-text);
  transition: border-color var(--ui-input-transition), box-shadow var(--ui-input-transition);
}

input::placeholder {
  color: var(--ui-input-placeholder);
}

/* Focus state (per CONTEXT.md: border color changes, no outer ring) */
input:focus-visible {
  outline: none;
  border-color: var(--ui-input-border-focus);
}

/* Error state */
input.input-error {
  border-color: var(--ui-input-border-error);
}

/* Disabled state */
input:disabled {
  background-color: var(--ui-input-bg-disabled);
  color: var(--ui-input-text-disabled);
  border-color: var(--ui-input-border-disabled);
  cursor: not-allowed;
}

/* Readonly state (per CONTEXT.md: distinct from disabled) */
input:read-only:not(:disabled) {
  background-color: var(--ui-input-bg-readonly, var(--color-muted));
  cursor: text;
}

/* Size variants */
input.input-sm {
  padding: var(--ui-input-padding-y-sm) var(--ui-input-padding-x-sm);
  font-size: var(--ui-input-font-size-sm);
}

input.input-md {
  padding: var(--ui-input-padding-y-md) var(--ui-input-padding-x-md);
  font-size: var(--ui-input-font-size-md);
}

input.input-lg {
  padding: var(--ui-input-padding-y-lg) var(--ui-input-padding-x-lg);
  font-size: var(--ui-input-font-size-lg);
}
```

### Render Template
```typescript
// Source: Button pattern adapted for input with label structure (per CONTEXT.md)
render() {
  return html`
    <div class="input-wrapper">
      ${this.label ? html`
        <label for=${this.inputId} part="label" class="input-label ${this.getLabelSizeClass()}">
          ${this.label}
          ${this.required ? html`<span class="required-indicator">${this.requiredIndicator === 'text' ? ' (required)' : ' *'}</span>` : nothing}
        </label>
      ` : nothing}

      ${this.helperText ? html`
        <span part="helper" class="helper-text">${this.helperText}</span>
      ` : nothing}

      <input
        id=${this.inputId}
        part="input"
        class=${this.getInputClasses()}
        type=${this.type}
        name=${this.name}
        .value=${this.value}
        placeholder=${this.placeholder || nothing}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        minlength=${this.minlength ?? nothing}
        maxlength=${this.maxlength ?? nothing}
        min=${this.min ?? nothing}
        max=${this.max ?? nothing}
        pattern=${this.pattern || nothing}
        aria-invalid=${this.showError ? 'true' : nothing}
        aria-describedby=${this.showError ? `${this.inputId}-error` : nothing}
        @input=${this.handleInput}
        @blur=${this.handleBlur}
      />

      ${this.showError && this.errorMessage ? html`
        <span id="${this.inputId}-error" part="error" class="error-text" role="alert">
          ${this.errorMessage}
        </span>
      ` : nothing}
    </div>
  `;
}

private get errorMessage(): string {
  return this.internals?.validationMessage || '';
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hidden input for form values | ElementInternals.setFormValue() | Safari 16.4 (March 2023) | No DOM hacks needed |
| Custom validation state | ElementInternals.setValidity() | Safari 16.4 (March 2023) | Native :invalid/:valid CSS |
| Slotted light DOM input | Native input in Shadow DOM | 2023+ | Style encapsulation preserved |
| :focus for all focus | :focus-visible for keyboard only | Widely supported 2022+ | Better UX for mouse users |

**Deprecated/outdated:**
- Slotting native inputs to light DOM: No longer needed with ElementInternals
- Custom FormData workarounds: ElementInternals handles this natively

## Open Questions

Things that couldn't be fully resolved:

1. **Autofill/Password Manager Support in Shadow DOM**
   - What we know: Chrome autofill works with Shadow DOM; Firefox has partial issues; Password manager extensions vary
   - What's unclear: Whether ElementInternals fully bridges autofill gap
   - Recommendation: Test with major password managers (1Password, LastPass, Dashlane); document any issues for Phase 28

2. **Cross-root ARIA (Reference Target)**
   - What we know: New "Reference Target" proposal in origin trial (Chrome May 2025); would fix label-input association across Shadow boundary
   - What's unclear: When it will be widely available; Safari/Firefox status
   - Recommendation: Use current workaround (label inside Shadow DOM with internal for/id); can enhance later

3. **formStateRestoreCallback for Autofill**
   - What we know: "restore" reason works; "autocomplete" reason not fully supported across browsers
   - What's unclear: Whether this affects our component
   - Recommendation: Implement callback but don't rely on "autocomplete" reason

4. **Readonly Background Token**
   - What we know: Phase 26 tokens don't include explicit `--ui-input-bg-readonly`
   - What's unclear: Whether to add new token or use existing `--color-muted`
   - Recommendation: Use `var(--ui-input-bg-readonly, var(--color-muted))` fallback pattern; can add token later

## Sources

### Primary (HIGH confidence)
- MDN ElementInternals - https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
- MDN setValidity - https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setValidity
- Existing button.ts and dialog.ts patterns in codebase
- Phase 26 CSS tokens in packages/core/src/tokens/index.ts

### Secondary (MEDIUM confidence)
- WebKit ElementInternals blog - https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/
- Benny Powers FACE article - https://bennypowers.dev/posts/form-associated-custom-elements/
- CSS-Tricks ElementInternals - https://css-tricks.com/creating-custom-form-controls-with-elementinternals/
- Lit Reactive Controllers - https://lit.dev/docs/composition/controllers/

### Tertiary (LOW confidence)
- Shadow DOM autofill discussions - WebSearch results; varies by browser/extension
- Reference Target proposal - In origin trial, not stable

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project patterns with well-documented APIs
- Architecture: HIGH - Button and Dialog provide proven templates; ElementInternals is mature
- Pitfalls: HIGH - Common issues well-documented in MDN and community articles
- Autofill/accessibility edge cases: MEDIUM - Browser support varies, some issues documented

**Research date:** 2026-01-26
**Valid until:** 60 days (ElementInternals API is stable; autofill landscape may shift)
