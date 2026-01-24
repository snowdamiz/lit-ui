# Phase 2: Button Component - Research

**Researched:** 2026-01-23
**Domain:** Lit Web Components + Form Association + Accessibility
**Confidence:** HIGH (based on Lit official docs, MDN, W3C APG, established patterns)

## Summary

This phase builds a production-ready button component using the foundation established in Phase 1 (TailwindElement base class). The button requires five variants (primary, secondary, outline, ghost, destructive), three sizes (sm, md, lg), form participation via ElementInternals, loading states with accessibility, and icon slots.

The research confirms that form participation for custom element buttons is achievable via `ElementInternals` with `requestSubmit()` as the submission mechanism. Native button keyboard handling (Enter/Space) comes free when using an actual `<button>` element inside the shadow DOM, avoiding the need to manually implement keyboard listeners. The loading state requires careful handling: combining `aria-busy="true"` with a dynamic `aria-label` update, and preventing interaction via `aria-disabled` (not HTML `disabled`) for better screen reader UX.

**Primary recommendation:** Wrap button content in a native `<button>` element inside Shadow DOM for free keyboard handling. Use `ElementInternals` with `static formAssociated = true` for form integration, calling `this.internals.form?.requestSubmit()` for submit behavior. Implement loading state with pulsing dots animation, `aria-busy`, `aria-disabled`, and dynamic `aria-label`. Use named slots `icon-start` and `icon-end` for icon placement.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lit | 3.x | Component base, decorators, rendering | Already in project, provides TailwindElement base |
| ElementInternals | Native API | Form association, ARIA reflection | Standard web platform API, no dependencies |
| CustomStateSet | Native API | CSS-selectable component states | Standard API via ElementInternals.states |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @lit/reactive-element | 3.x (bundled) | Reactive property handling | Automatic via lit |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<button>` in shadow DOM | `role="button"` on div | Native button provides free keyboard handling, focus, form association |
| `requestSubmit()` | `submit()` | `requestSubmit()` triggers validation, `submit()` bypasses it |
| `aria-disabled` | HTML `disabled` | `aria-disabled` allows focus for screen readers, `disabled` removes from tab order |

**Installation:**
No additional packages needed - all patterns use Lit 3 and native web platform APIs already available.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── button/
│       ├── button.ts           # Main button component
│       └── button.test.ts      # Component tests (future)
├── base/
│   └── tailwind-element.ts     # Already exists from Phase 1
└── styles/
    └── tailwind.css            # Already includes design tokens
```

### Pattern 1: Form-Associated Button with ElementInternals
**What:** Enable the button to participate in HTML forms for submission
**When to use:** All buttons with `type="submit"` need this pattern
**Example:**
```typescript
// Source: MDN ElementInternals + Lit patterns
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-button')
export class Button extends LitElement {
  static formAssociated = true;

  private internals: ElementInternals;

  @property({ type: String }) type: 'button' | 'submit' | 'reset' = 'button';

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  private handleClick() {
    if (this.type === 'submit' && this.internals.form) {
      this.internals.form.requestSubmit();
    } else if (this.type === 'reset' && this.internals.form) {
      this.internals.form.reset();
    }
  }

  render() {
    return html`
      <button @click=${this.handleClick} type="button">
        <slot></slot>
      </button>
    `;
  }
}
```

### Pattern 2: Loading State with Accessibility
**What:** Show loading spinner, disable interaction, announce state to screen readers
**When to use:** When button triggers async action
**Example:**
```typescript
// Source: MDN aria-busy + Bekk Christmas accessible loading button pattern
@property({ type: Boolean }) loading = false;

render() {
  return html`
    <button
      ?aria-busy=${this.loading}
      ?aria-disabled=${this.loading || this.disabled}
      aria-label=${this.loading ? 'Loading' : nothing}
      @click=${this.handleClick}
    >
      ${this.loading
        ? html`<span class="spinner" aria-hidden="true">...</span>`
        : html`<slot></slot>`
      }
    </button>
  `;
}

private handleClick(e: Event) {
  if (this.loading || this.disabled) {
    e.preventDefault();
    return;
  }
  // ... normal click handling
}
```

### Pattern 3: Named Slots for Icons
**What:** Allow consumers to inject icons at start/end positions
**When to use:** All button instances that need icons
**Example:**
```typescript
// Source: Lit Shadow DOM docs
render() {
  return html`
    <button class="button-inner">
      <slot name="icon-start"></slot>
      <span class="label"><slot></slot></span>
      <slot name="icon-end"></slot>
    </button>
  `;
}

// Consumer usage:
// <ui-button>
//   <svg slot="icon-start">...</svg>
//   Save
// </ui-button>
```

### Pattern 4: Inset Focus Ring (Inner Glow)
**What:** Focus ring appears as inner glow using inset box-shadow
**When to use:** All focusable button states per CONTEXT.md decision
**Example:**
```css
/* Source: CONTEXT.md decision + Tailwind inset-ring pattern */
button:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-ring);
}
```

### Pattern 5: Pulsing Dots Spinner
**What:** Three dots that pulse in sequence for loading indication
**When to use:** Loading state per CONTEXT.md decision
**Example:**
```css
/* Source: CSS-Tricks single element loaders + codepen patterns */
.spinner {
  display: inline-flex;
  gap: 0.25em;
}

.spinner::before,
.spinner::after,
.spinner span {
  content: '';
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.2s ease-in-out infinite;
}

.spinner::before { animation-delay: 0s; }
.spinner span { animation-delay: 0.2s; }
.spinner::after { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
```

### Pattern 6: CustomStateSet for CSS-Selectable States
**What:** Expose loading/disabled states for external CSS styling via `:state()`
**When to use:** When consumers need to style based on button state
**Example:**
```typescript
// Source: MDN CustomStateSet
private updateStates() {
  if (this.loading) {
    this.internals.states.add('loading');
  } else {
    this.internals.states.delete('loading');
  }
}

// External CSS can then use:
// ui-button:state(loading) { ... }
```

### Anti-Patterns to Avoid
- **Manual keyboard handling on `<button>`:** Don't add keydown listeners for Enter/Space on native `<button>` elements - they handle this automatically
- **Using `disabled` attribute for loading:** Use `aria-disabled` instead - keeps button in tab order for screen readers
- **Preventing click without visual feedback:** Always show disabled/loading state visually when blocking interaction
- **Spinner alongside text:** Per CONTEXT.md, spinner replaces text (not shown alongside)
- **Layout shift on loading:** Button width must remain constant - use min-width or fixed width based on content

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard handling | Manual keydown listeners | Native `<button>` element | Enter/Space/click/focus all handled automatically |
| Form association | Hidden input tricks | `ElementInternals` with `formAssociated` | Standard API, works with form validation |
| ARIA state reflection | Manual attribute setting | `ElementInternals.ariaLabel`, etc. | Proper accessibility tree integration |
| Focus management | Manual tabindex | Native `<button>` with `aria-disabled` | Maintains focus for screen readers |
| State-based CSS | Attribute selectors | `CustomStateSet` + `:state()` | Clean API, proper encapsulation |

**Key insight:** The native `<button>` element inside Shadow DOM gives you 90% of what you need for free. `ElementInternals` bridges the remaining gap for form participation. Don't fight the platform.

## Common Pitfalls

### Pitfall 1: Using HTML `disabled` Instead of `aria-disabled`
**What goes wrong:** Screen reader users can't tab to the button to understand why it's disabled
**Why it happens:** HTML `disabled` removes element from tab order entirely
**How to avoid:** Use `aria-disabled="true"` and manually prevent click/keyboard interaction
**Warning signs:** QA reports that screen reader users can't find disabled buttons

### Pitfall 2: Form Submit Not Working
**What goes wrong:** Custom button inside `<form>` doesn't submit the form
**Why it happens:** Custom elements aren't native form submitters by default
**How to avoid:** Set `static formAssociated = true`, attach internals, call `requestSubmit()`
**Warning signs:** Click handler fires but form doesn't submit, no validation runs

### Pitfall 3: Layout Shift During Loading
**What goes wrong:** Button changes width when transitioning to/from loading state
**Why it happens:** Spinner has different dimensions than text content
**How to avoid:** Use `min-width` to preserve button dimensions, or measure initial width
**Warning signs:** Page content jumps when button starts/stops loading

### Pitfall 4: Loading State Not Announced
**What goes wrong:** Screen readers don't announce loading state change
**Why it happens:** `aria-busy` alone doesn't trigger immediate announcement
**How to avoid:** Update `aria-label` to "Loading" when entering loading state
**Warning signs:** Screen reader testing shows no loading announcement

### Pitfall 5: Duplicate Click Events
**What goes wrong:** Click handler fires multiple times or fires when loading/disabled
**Why it happens:** Not guarding click handler, or event propagation issues
**How to avoid:** Check `loading` and `disabled` at start of click handler, early return
**Warning signs:** Multiple form submissions, actions during loading state

### Pitfall 6: Focus Ring Not Visible in All Themes
**What goes wrong:** Inset focus ring blends with button background in certain variants
**Why it happens:** Ring color doesn't contrast well with variant's background
**How to avoid:** Use `--color-ring` token that has sufficient contrast, or adjust per variant
**Warning signs:** Focus state invisible on ghost/outline buttons in certain themes

## Code Examples

Verified patterns from official sources:

### Complete Button Component Structure
```typescript
// Source: Lit docs + MDN ElementInternals + W3C APG
import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement } from '../../base/tailwind-element';

@customElement('ui-button')
export class Button extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals;

  @property({ type: String }) variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' = 'primary';
  @property({ type: String }) size: 'sm' | 'md' | 'lg' = 'md';
  @property({ type: String }) type: 'button' | 'submit' | 'reset' = 'button';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) loading = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  static styles = css`
    :host {
      display: inline-block;
    }
    :host([disabled]) {
      pointer-events: none;
    }
  `;

  private handleClick(e: Event) {
    if (this.loading || this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (this.type === 'submit' && this.internals.form) {
      this.internals.form.requestSubmit();
    } else if (this.type === 'reset' && this.internals.form) {
      this.internals.form.reset();
    }
  }

  render() {
    return html`
      <button
        class=${this.getButtonClasses()}
        ?aria-disabled=${this.disabled || this.loading}
        ?aria-busy=${this.loading}
        aria-label=${this.loading ? 'Loading' : nothing}
        @click=${this.handleClick}
      >
        <slot name="icon-start"></slot>
        ${this.loading
          ? this.renderSpinner()
          : html`<slot></slot>`
        }
        <slot name="icon-end"></slot>
      </button>
    `;
  }

  private getButtonClasses(): string {
    // Implementation uses Tailwind classes based on variant/size
    return '...';
  }

  private renderSpinner() {
    return html`<span class="spinner" aria-hidden="true"></span>`;
  }
}
```

### Variant Class Mapping
```typescript
// Source: Project patterns, Tailwind utilities
private getVariantClasses(): string {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
    outline: 'border border-border bg-transparent text-foreground hover:bg-accent',
    ghost: 'bg-transparent text-foreground hover:bg-accent',
    destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  };
  return variants[this.variant];
}

private getSizeClasses(): string {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };
  return sizes[this.size];
}
```

### Pulsing Dots Spinner CSS
```css
/* Source: CSS-Tricks, codepen patterns */
.spinner {
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
}

.spinner::before,
.spinner::after {
  content: '';
  width: 0.4em;
  height: 0.4em;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.2s ease-in-out infinite;
}

.spinner::before { animation-delay: 0s; }
.spinner::after { animation-delay: 0.4s; }

/* Middle dot via pseudo-element workaround or add a span */

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.7);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Focus Ring Styles
```css
/* Source: CONTEXT.md decision - inner glow */
button:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-ring);
}

/* Ensure visibility on all variants */
button:focus-visible {
  position: relative;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hidden `<input>` for form values | `ElementInternals.setFormValue()` | 2023 (Safari 16.4) | Clean form association, no DOM hacks |
| Custom `role="button"` | Native `<button>` in Shadow DOM | Always best practice | Free keyboard/focus handling |
| Manual ARIA attributes | `ElementInternals.ariaLabel` etc. | 2023+ | Proper accessibility tree integration |
| Attribute-based state CSS | `CustomStateSet` + `:state()` | 2024 (Baseline) | Cleaner encapsulation |
| CSS outline for focus | Inset box-shadow | Design trend | More customizable, contained |

**Deprecated/outdated:**
- **Using `::slotted()` for deep icon styling:** `:slotted()` only works on direct children; pass icon size via CSS custom properties instead
- **Polyfills for ElementInternals:** All modern browsers support it since Safari 16.4 (March 2023)

## Open Questions

Things that couldn't be fully resolved:

1. **Submit Button API Standardization**
   - What we know: `requestSubmit()` works for triggering submission with validation
   - What's unclear: Native "submit button" behavior (`:default` pseudo-class, implicit submission) requires a future spec addition (`ElementInternals.submitButton`)
   - Recommendation: Use `requestSubmit()` for now; this covers the explicit click case. Document that implicit Enter-to-submit from other form fields won't trigger this custom button.

2. **Spinner Accessibility During Replacement**
   - What we know: `aria-busy` + `aria-label="Loading"` announces state change
   - What's unclear: Whether replacement of button text (vs showing alongside) impacts some screen readers
   - Recommendation: Test with VoiceOver and NVDA during development; the `aria-label` override should handle text replacement correctly.

3. **Icon Sizing Across Sizes**
   - What we know: Icons should scale with button size per CONTEXT.md
   - What's unclear: Exact pixel/em ratios for each size variant
   - Recommendation: Use `1em` for icon width/height so they scale with button font-size automatically

## Sources

### Primary (HIGH confidence)
- [MDN ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) - Form association API, ARIA reflection
- [MDN CustomStateSet](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet) - CSS :state() pseudo-class
- [MDN aria-busy](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-busy) - Loading state announcement
- [W3C WAI-ARIA APG Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) - Keyboard interaction requirements
- [Lit Shadow DOM Docs](https://lit.dev/docs/components/shadow-dom/) - Named slots, slot fallback content

### Secondary (MEDIUM confidence)
- [WebKit ElementInternals Blog](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) - Safari implementation details
- [Benny Powers FACE Guide](https://bennypowers.dev/posts/form-associated-custom-elements/) - Form-associated patterns
- [CSS-Tricks ElementInternals](https://css-tricks.com/creating-custom-form-controls-with-elementinternals/) - Form control patterns
- [Bekk Christmas Accessible Loading Button](https://www.bekk.christmas/post/2023/24/accessible-loading-button) - Loading state a11y

### Tertiary (LOW confidence)
- [WICG Submit Button Issue #814](https://github.com/WICG/webcomponents/issues/814) - Future spec for submit button API
- Various CodePen patterns for pulsing dots animation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native web platform APIs, no external dependencies
- Architecture patterns: HIGH - Established patterns from MDN and W3C
- Form participation: HIGH - ElementInternals is well-documented and widely supported
- Accessibility: HIGH - W3C APG is the authoritative source
- Pitfalls: MEDIUM - Some edge cases around screen reader behavior may vary

**Research date:** 2026-01-23
**Valid until:** ~90 days (Web platform APIs are stable, patterns are mature)
