# Phase 28: Input Differentiators - Research

**Researched:** 2026-01-26
**Domain:** Enhanced Input UX - Password toggle, clear button, prefix/suffix slots
**Confidence:** HIGH

## Summary

This phase adds three differentiating UX features to the existing Input component: password visibility toggle, clear button, and prefix/suffix content slots. These features enhance usability beyond native HTML inputs while maintaining accessibility standards.

The implementation approach uses:
1. **Inline SVG icons** via Lit's `svg` template literal for eye/eye-off and X icons
2. **Named slots** (`prefix`, `suffix`) for developer-provided content with click-to-focus delegation
3. **Reactive state** to track password visibility and input value presence
4. **Live regions** (`aria-live`) for screen reader announcements on password toggle
5. **Container restructure** - wrapping input + buttons in a flex container for consistent positioning

The existing Input component already has solid foundations: TailwindElement base class, ElementInternals form participation, CSS custom properties theming, and SSR support via `isServer` guards. This phase extends that foundation without breaking existing functionality.

**Primary recommendation:** Use inline SVG via Lit's `svg` template tag for icons, wrap the input in a container with slots, and use `aria-pressed` + `aria-live` for accessible password toggle.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | ^3.0.0 | Component framework | Already in use, provides `svg` template tag for inline SVG |
| @lit-ui/core | workspace:* | Base class, tokens | Provides TailwindElement, CSS custom properties |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lit/decorators.js | ^3.0.0 | @state, @queryAssignedElements | Already imported, adds slot querying |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG | Icon library (lucide, heroicons) | External dependency; inline SVG keeps icons self-contained, tree-shakeable |
| Custom clear button | type="search" native clear | Native clear styling varies across browsers, can't control visibility logic |

**Installation:**
```bash
# No new dependencies needed - using existing Lit features
```

## Architecture Patterns

### Recommended Component Structure
```
lui-input shadow DOM:
  .input-wrapper
    label (existing)
    .helper-text (existing)
    .input-container (NEW - flex wrapper)
      slot[name="prefix"]
      input (existing)
      button.password-toggle (conditional)
      button.clear-button (conditional)
      slot[name="suffix"]
    .error-text (existing)
```

### Pattern 1: Inline SVG Icons via `svg` Template Tag
**What:** Use Lit's `svg` tagged template literal to define icons inline in the component.
**When to use:** For all internal icons (eye, eye-off, x-circle) in the input component.
**Why:** Avoids external dependencies, enables styling with `currentColor`, tree-shakeable.

**Example:**
```typescript
// Source: https://lit.dev/docs/api/templates/#svg
import { html, svg } from 'lit';

// SVG content (inner elements only, not the <svg> itself)
const eyeIcon = svg`
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
  <circle cx="12" cy="12" r="3"></circle>
`;

const eyeOffIcon = svg`
  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
  <line x1="1" y1="1" x2="23" y2="23"></line>
`;

// In render():
html`
  <svg viewBox="0 0 24 24" aria-hidden="true">
    ${this.passwordVisible ? eyeIcon : eyeOffIcon}
  </svg>
`;
```

### Pattern 2: Named Slots with Click Delegation
**What:** Use `<slot name="prefix">` and `<slot name="suffix">` with click handlers that focus the input.
**When to use:** For prefix/suffix content areas.
**Why:** Allows interactive content in slots while maintaining click-to-focus behavior on non-interactive areas.

**Example:**
```typescript
// Source: https://lit.dev/docs/components/shadow-dom/

private handleContainerClick(e: Event): void {
  // Only focus if click was on container/slot, not on interactive content
  const target = e.target as HTMLElement;
  if (target === e.currentTarget ||
      target.closest('slot') && !target.closest('button, a, input')) {
    this.inputEl?.focus();
  }
}

render() {
  return html`
    <div class="input-container" @click=${this.handleContainerClick}>
      <slot name="prefix" part="prefix"></slot>
      <input ... />
      <slot name="suffix" part="suffix"></slot>
    </div>
  `;
}
```

### Pattern 3: Accessible Password Toggle with aria-pressed
**What:** Use `aria-pressed` on the toggle button and announce state changes via `aria-live`.
**When to use:** For the password visibility toggle button.
**Why:** Screen readers don't handle dynamic accessible names well, but `aria-pressed` is designed for toggle state.

**Example:**
```typescript
// Source: https://www.makethingsaccessible.com/guides/make-an-accessible-password-reveal-input/

@state() private passwordVisible = false;

private togglePasswordVisibility(): void {
  this.passwordVisible = !this.passwordVisible;
  // Announcement happens via aria-live region in template
}

render() {
  return html`
    <button
      type="button"
      class="password-toggle"
      aria-pressed=${this.passwordVisible}
      aria-controls=${this.inputId}
      @click=${this.togglePasswordVisibility}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" class="toggle-icon">
        ${this.passwordVisible ? this.eyeOffIcon : this.eyeIcon}
      </svg>
      <span class="visually-hidden">
        ${this.passwordVisible ? 'Hide password' : 'Show password'}
      </span>
    </button>

    <!-- Live region for announcements -->
    <span
      class="visually-hidden"
      role="status"
      aria-live="polite"
    >
      ${this.passwordVisible ? 'Password shown' : 'Password hidden'}
    </span>
  `;
}
```

### Pattern 4: Clear Button with Focus Return
**What:** Clear button appears when value exists, returns focus to input after clearing.
**When to use:** When `clearable` attribute is set and input has value.
**Why:** Improves UX by allowing quick clearing without selecting all text.

**Example:**
```typescript
@property({ type: Boolean }) clearable = false;

private handleClear(): void {
  this.value = '';
  this.updateFormValue();
  this.inputEl?.focus();

  // Re-validate if already touched
  if (this.touched) {
    const isValid = this.validate();
    this.showError = !isValid;
  }
}

// In render():
${this.clearable && this.value
  ? html`
      <button
        type="button"
        class="clear-button"
        aria-label="Clear input"
        @click=${this.handleClear}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          ${this.xCircleIcon}
        </svg>
      </button>
    `
  : nothing}
```

### Anti-Patterns to Avoid
- **Using `<use>` with external SVG sprites:** Shadow DOM boundaries prevent referencing external symbols. Use inline SVG instead.
- **Toggling input type without security consideration:** The decision has already been made to use type toggle (password/text), which is the standard approach.
- **aria-live="assertive" for password toggle:** Use "polite" - assertive interrupts users and most screen readers treat both the same anyway.
- **Hiding clear button on blur:** Context decision says "appears when input has value (regardless of focus state)" - don't hide on blur.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG icon rendering | Custom icon component | Lit `svg` template tag | Built into Lit, handles SVG namespace correctly |
| Slot content detection | Manual DOM queries | `@queryAssignedElements` decorator | Handles slotchange events, provides typed array |
| Focus management | Manual focus tracking | Native `focus()` + query decorator | Browser handles focus natively |

**Key insight:** The existing Lit primitives (`svg` tag, slot elements, `@query`/`@queryAssignedElements` decorators) handle all the complexity of Shadow DOM, SVG namespacing, and focus management.

## Common Pitfalls

### Pitfall 1: SVG Not Rendering in Shadow DOM
**What goes wrong:** SVG icons appear blank or don't render.
**Why it happens:** Using `html` tag for SVG content inside `<svg>` element, or incorrect viewBox.
**How to avoid:** Use `svg` template tag for content INSIDE the `<svg>` element. The `<svg>` container itself uses `html`.
**Warning signs:** Empty space where icon should be, no errors in console.

### Pitfall 2: Password Toggle Announces Type Change
**What goes wrong:** Screen reader announces "edit text, password" becoming "edit text" on toggle.
**Why it happens:** The input type change causes screen reader to re-announce the input.
**How to avoid:** Use a separate aria-live region for intentional announcements. The type change announcement is unavoidable but the live region ensures the user gets meaningful feedback.
**Warning signs:** Double announcements on toggle.

### Pitfall 3: Clear Button Stealing Focus
**What goes wrong:** After clearing, focus goes to the clear button or is lost.
**Why it happens:** Not explicitly returning focus to input after clear operation.
**How to avoid:** Always call `this.inputEl.focus()` in the clear handler after setting value.
**Warning signs:** User has to click/tab back into input after clearing.

### Pitfall 4: Prefix/Suffix Breaking Input Padding
**What goes wrong:** Text overlaps with prefix/suffix content.
**Why it happens:** Input padding doesn't account for slot content width.
**How to avoid:** Use flexbox container with the input taking `flex: 1`. Slots naturally take their content width, input fills remaining space.
**Warning signs:** Text under icons, cramped appearance.

### Pitfall 5: Password Toggle Shows on Non-Password Inputs
**What goes wrong:** Eye icon appears on text, email, etc. inputs.
**Why it happens:** Not checking `this.type === 'password'` before rendering toggle.
**How to avoid:** Conditional render: `${this.type === 'password' ? this.renderPasswordToggle() : nothing}`
**Warning signs:** Eye icon on email or search inputs.

## Code Examples

Verified patterns from official sources:

### Complete Input Container Structure
```typescript
// Based on existing input.ts + Lit slots documentation

render() {
  const showPasswordToggle = this.type === 'password';
  const showClearButton = this.clearable && this.value;
  const actualType = this.type === 'password' && this.passwordVisible ? 'text' : this.type;

  return html`
    <div class="input-wrapper" part="wrapper">
      ${this.renderLabel()}
      ${this.renderHelperText()}

      <div
        class="input-container ${this.getContainerClasses()}"
        part="container"
        @click=${this.handleContainerClick}
      >
        <slot name="prefix" part="prefix" class="input-slot prefix-slot"></slot>

        <input
          id=${this.inputId}
          part="input"
          class=${this.getInputClasses()}
          type=${actualType}
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
          aria-describedby=${this.getAriaDescribedBy()}
          @input=${this.handleInput}
          @blur=${this.handleBlur}
        />

        ${showPasswordToggle ? this.renderPasswordToggle() : nothing}
        ${showClearButton ? this.renderClearButton() : nothing}

        <slot name="suffix" part="suffix" class="input-slot suffix-slot"></slot>
      </div>

      ${this.renderError()}
      ${this.renderLiveRegion()}
    </div>
  `;
}
```

### SVG Icon Definitions
```typescript
// Source: Lit svg template tag documentation

import { svg } from 'lit';

// Eye icon (password visible = show)
private eyeIcon = svg`
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor" stroke-width="2" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="12" cy="12" r="3"
          stroke="currentColor" stroke-width="2" fill="none"/>
`;

// Eye-off icon (password hidden = hide)
private eyeOffIcon = svg`
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="currentColor" stroke-width="2" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="1" y1="1" x2="23" y2="23"
        stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
`;

// X-circle icon for clear button
private xCircleIcon = svg`
  <circle cx="12" cy="12" r="10"
          stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="15" y1="9" x2="9" y2="15"
        stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="9" y1="9" x2="15" y2="15"
        stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
`;
```

### CSS for Input Container and Icons
```css
/* Input container - flex layout */
.input-container {
  display: flex;
  align-items: center;
  border-radius: var(--ui-input-radius);
  border-width: var(--ui-input-border-width);
  border-style: solid;
  border-color: var(--ui-input-border);
  background-color: var(--ui-input-bg);
  transition: border-color var(--ui-input-transition);
}

.input-container:focus-within {
  border-color: var(--ui-input-border-focus);
}

.input-container.input-error {
  border-color: var(--ui-input-border-error);
}

/* Input element - remove its own border/bg when inside container */
.input-container input {
  flex: 1;
  min-width: 0; /* Allow shrinking */
  border: none;
  background: transparent;
  outline: none;
  color: var(--ui-input-text);
}

/* Slot styling */
.input-slot {
  display: flex;
  align-items: center;
}

.prefix-slot {
  padding-left: var(--ui-input-padding-x-md);
}

.suffix-slot {
  padding-right: var(--ui-input-padding-x-md);
}

/* Size-specific slot padding */
.input-container.container-sm .prefix-slot { padding-left: var(--ui-input-padding-x-sm); }
.input-container.container-sm .suffix-slot { padding-right: var(--ui-input-padding-x-sm); }
.input-container.container-lg .prefix-slot { padding-left: var(--ui-input-padding-x-lg); }
.input-container.container-lg .suffix-slot { padding-right: var(--ui-input-padding-x-lg); }

/* Icon buttons (password toggle, clear) */
.password-toggle,
.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  margin-right: 0.25rem;
  border: none;
  background: transparent;
  color: var(--color-muted-foreground);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color 150ms, background-color 150ms;
}

.password-toggle:hover,
.clear-button:hover {
  color: var(--ui-input-text);
  background-color: var(--color-muted);
}

.password-toggle:focus-visible,
.clear-button:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 1px;
}

/* Icon sizing */
.toggle-icon,
.clear-icon {
  width: 1.25em;
  height: 1.25em;
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
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Icon fonts | Inline SVG | ~2018 | Better accessibility, no FOIT, smaller bundle |
| `aria-label` toggle | `aria-pressed` + live region | ~2020 | Better screen reader support for toggles |
| Browser native clear (type=search) | Custom clear button | Ongoing | Consistent cross-browser UX |
| External icon sprites | Inline SVG via template | Ongoing | Works in Shadow DOM, no external requests |

**Deprecated/outdated:**
- `<use>` with external SVG sprites: Doesn't work across Shadow DOM boundaries
- Icon fonts: Accessibility issues, Flash of Invisible Text (FOIT), larger payload

## Open Questions

1. **Slot Padding per Size**
   - What we know: Decisions say slot padding should scale with input size (sm/md/lg)
   - What's unclear: Exact pixel/rem values for each size
   - Recommendation: Use existing `--ui-input-padding-x-{size}` tokens for consistency

2. **Security Reset on Form Submit**
   - What we know: Best practice is to reset password type to "password" on form submit
   - What's unclear: Whether this is needed given browser autocomplete behavior
   - Recommendation: Implement it - low cost, provides security benefit

## Sources

### Primary (HIGH confidence)
- [Lit Shadow DOM documentation](https://lit.dev/docs/components/shadow-dom/) - Slots, @queryAssignedElements, slotchange events
- [Lit svg template tag](https://lit.dev/docs/api/templates/#svg) - Inline SVG in Lit components
- [Make Things Accessible - Password Reveal](https://www.makethingsaccessible.com/guides/make-an-accessible-password-reveal-input/) - Accessible password toggle implementation
- Existing codebase: `/packages/input/src/input.ts`, `/packages/button/src/button.ts` patterns

### Secondary (MEDIUM confidence)
- [MDN ARIA aria-pressed](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed) - Toggle button accessibility
- [MDN aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) - Live region announcements
- [Compound Design System Input Group](https://compound.thephoenixgroup.com/) - Prefix/suffix slot patterns

### Tertiary (LOW confidence)
- WebSearch results on 2026 UX trends - General direction, not specific implementation
- Community discussions on shadcn-ui clear button - Validates demand, not implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing Lit features, no new dependencies
- Architecture: HIGH - Patterns verified against Lit documentation and existing codebase
- Pitfalls: HIGH - Based on MDN documentation and accessibility guides

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable domain, established patterns)
