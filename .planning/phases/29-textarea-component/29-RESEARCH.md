# Phase 29: Textarea Component - Research

**Researched:** 2026-01-26
**Domain:** Lit 3 form-associated textarea with auto-resize and character count
**Confidence:** HIGH

## Summary

This research covers building a multi-line text input (textarea) component as a form-associated custom element using Lit 3 and the ElementInternals API. The component extends the validation and form participation patterns established in Phase 27 (Input) while adding textarea-specific features: multi-line editing, rows attribute, resize control, auto-resize, and character count display.

The standard approach is to replicate the Input component's structure (extend TailwindElement, use ElementInternals, validate on blur) while replacing the native `<input>` with a native `<textarea>`. Auto-resize uses the scrollHeight technique (set height to auto, then to scrollHeight) with a 150ms CSS transition. Character count displays inside the textarea at bottom-right using absolute positioning.

The existing Input component provides an excellent template with ~95% reusable patterns. The main differences are: no prefix/suffix slots, no type variants, rows/resize attributes instead of type-specific attributes, and auto-resize/character count features.

**Primary recommendation:** Copy Input component structure, replace native input with textarea, add rows/resize/maxRows attributes, implement auto-resize via scrollHeight, add character counter with `showCount` attribute.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | ^3.3.2 | Web component framework | Project standard, SSR support via `isServer` |
| @lit-ui/core | workspace:* | TailwindElement base class, tokens | Provides Tailwind in Shadow DOM, textarea CSS tokens already defined |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lit/decorators.js | ^3.3.2 | @property, @query, @state decorators | All reactive properties and DOM queries |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| scrollHeight auto-resize | CSS Grid replica technique | CSS Grid is more elegant but requires syncing content to pseudo-element; scrollHeight is simpler for Shadow DOM |
| Native textarea resize | Custom resize handle | Native is accessible and familiar; custom would allow more control but adds complexity |

**Installation:**
```bash
# Package will be created in workspace, deps match input package
pnpm add lit@^3.3.2 @lit-ui/core@workspace:*
```

## Architecture Patterns

### Recommended Project Structure
```
packages/textarea/
├── src/
│   ├── index.ts           # Exports, custom element registration
│   ├── textarea.ts        # Textarea class implementation
│   ├── jsx.d.ts           # JSX type declarations (React/Vue/Svelte)
│   └── vite-env.d.ts      # Vite type reference
├── package.json           # Match input package structure
├── tsconfig.json          # Extend @lit-ui/typescript-config
└── vite.config.ts         # Use createLibraryConfig
```

### Pattern 1: Form-Associated Textarea (reuse from Input)
**What:** Use static formAssociated and ElementInternals for native form participation
**When to use:** Any form control component
**Example:**
```typescript
// Source: Existing input.ts pattern
import { html, css, isServer, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export class Textarea extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;
  private textareaId = `lui-textarea-${Math.random().toString(36).substr(2, 9)}`;

  @query('textarea')
  private textareaEl!: HTMLTextAreaElement;

  @property({ type: String })
  value = '';

  @property({ type: String })
  name = '';

  @property({ type: String })
  size: TextareaSize = 'md';

  @property({ type: Number })
  rows = 3;

  @property({ type: String })
  resize: TextareaResize = 'vertical';

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }
}
```

### Pattern 2: Auto-Resize via scrollHeight
**What:** Dynamically adjust textarea height to fit content
**When to use:** When `autoresize` attribute is present
**Example:**
```typescript
// Source: CSS-Tricks auto-growing textarea patterns
@property({ type: Boolean })
autoresize = false;

@property({ type: Number, attribute: 'max-rows' })
maxRows?: number;

@property({ type: String, attribute: 'max-height' })
maxHeight?: string;

private adjustHeight(): void {
  if (!this.autoresize || !this.textareaEl) return;

  const textarea = this.textareaEl;
  const minHeight = this.getMinHeight();

  // Reset height to auto to get accurate scrollHeight
  textarea.style.height = 'auto';

  // Calculate new height
  let newHeight = textarea.scrollHeight;

  // Apply max height constraint if set
  const maxHeightPx = this.getMaxHeightPx();
  if (maxHeightPx && newHeight > maxHeightPx) {
    newHeight = maxHeightPx;
    textarea.style.overflowY = 'auto';
  } else {
    textarea.style.overflowY = 'hidden';
  }

  // Never shrink below initial rows
  if (newHeight < minHeight) {
    newHeight = minHeight;
  }

  textarea.style.height = `${newHeight}px`;
}

private getMinHeight(): number {
  // Calculate min height based on rows and line-height
  // This ensures we never shrink below initial rows value
  const lineHeight = parseFloat(getComputedStyle(this.textareaEl).lineHeight) || 20;
  const paddingY = this.getPaddingY();
  return (this.rows * lineHeight) + paddingY;
}

private getMaxHeightPx(): number | null {
  if (this.maxHeight) {
    // Parse CSS value (e.g., "200px", "10rem")
    return this.parseLength(this.maxHeight);
  }
  if (this.maxRows) {
    const lineHeight = parseFloat(getComputedStyle(this.textareaEl).lineHeight) || 20;
    const paddingY = this.getPaddingY();
    return (this.maxRows * lineHeight) + paddingY;
  }
  return null;
}
```

### Pattern 3: Smooth Height Transition
**What:** Animate height changes with CSS transition
**When to use:** When autoresize is enabled
**Example:**
```css
/* Source: CONTEXT.md decision - 150ms matches Button transition */
textarea.autoresize {
  transition: height 150ms ease-out;
  overflow-y: hidden;
}

/* Re-enable scrollbar when content exceeds max height */
textarea.autoresize.capped {
  overflow-y: auto;
}
```

### Pattern 4: Character Counter Display
**What:** Show current character count relative to maxlength
**When to use:** When `showCount` attribute is present and maxlength is set
**Example:**
```typescript
// Source: CONTEXT.md decision - inside textarea, bottom-right corner
@property({ type: Boolean, attribute: 'show-count' })
showCount = false;

private renderCharacterCount() {
  if (!this.showCount || !this.maxlength) return nothing;

  return html`
    <span class="character-count" part="counter">
      ${this.value.length}/${this.maxlength}
    </span>
  `;
}

// CSS for positioning
// .textarea-wrapper { position: relative; }
// .character-count {
//   position: absolute;
//   bottom: 0.5rem;
//   right: 0.75rem;
//   font-size: 0.75rem;
//   color: var(--color-muted-foreground);
//   pointer-events: none;
// }
```

### Pattern 5: Resize Handle Control
**What:** Control native resize behavior via attribute
**When to use:** Always, to provide consistent resize experience
**Example:**
```typescript
// Source: CONTEXT.md decision - vertical only by default
@property({ type: String })
resize: TextareaResize = 'vertical';

// CSS implementation
// textarea.resize-none { resize: none; }
// textarea.resize-vertical { resize: vertical; }
// textarea.resize-horizontal { resize: horizontal; }
// textarea.resize-both { resize: both; }

// Per CONTEXT.md: Claude's discretion on hiding when autoresize
// Recommendation: Hide resize when autoresize is enabled
// textarea.autoresize { resize: none; }
```

### Pattern 6: Validation (reuse from Input)
**What:** Validate on blur, re-validate on input after touched
**When to use:** Required fields, minlength/maxlength constraints
**Example:**
```typescript
// Source: Existing input.ts pattern - copy directly
@state()
private touched = false;

@state()
private showError = false;

private validate(): boolean {
  const textarea = this.textareaEl;
  if (!textarea || !this.internals) return true;

  const validity = textarea.validity;

  if (!validity.valid) {
    this.internals.setValidity(
      {
        valueMissing: validity.valueMissing,
        tooShort: validity.tooShort,
        tooLong: validity.tooLong,
      },
      textarea.validationMessage,
      textarea
    );
    return false;
  }

  this.internals.setValidity({});
  return true;
}

private handleBlur(): void {
  this.touched = true;
  const isValid = this.validate();
  this.showError = !isValid;
}

private handleInput(e: Event): void {
  const textarea = e.target as HTMLTextAreaElement;
  this.value = textarea.value;
  this.internals?.setFormValue(this.value);

  // Adjust height if autoresize enabled
  if (this.autoresize) {
    this.adjustHeight();
  }

  // Re-validate if already touched
  if (this.touched) {
    const isValid = this.validate();
    this.showError = !isValid;
  }
}
```

### Anti-Patterns to Avoid
- **CSS Grid replica technique in Shadow DOM:** Requires syncing content to pseudo-element via data attribute; scrollHeight is simpler
- **Custom resize handle:** Native browser resize is accessible and expected; don't rebuild
- **Validating on every keystroke:** Frustrates users; validate on blur (per Input pattern)
- **Character count color changes at limit:** Per CONTEXT.md, keep consistent subtle styling
- **Prefix/suffix slots:** These are Input-specific differentiators; Textarea doesn't need them

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form value submission | Hidden input hack | ElementInternals.setFormValue() | Native API, proper FormData integration |
| Validation state | Custom validity tracking | ElementInternals.setValidity() | Maps to native ValidityState |
| Minlength/maxlength validation | Manual length checking | Native textarea attributes + validity | Browser handles edge cases |
| Resize behavior | Custom drag handle | Native `resize` CSS property | Accessible, familiar, zero JS |
| Line height calculation | Manual math | getComputedStyle().lineHeight | Accounts for font/size variations |

**Key insight:** Wrap a native `<textarea>` element to leverage browser-native validation and resize, then mirror its ValidityState to ElementInternals. This gives you proper text selection, context menus, and validation for free.

## Common Pitfalls

### Pitfall 1: Forgetting isServer Guards
**What goes wrong:** attachInternals() throws during SSR
**Why it happens:** ElementInternals is a browser API not available during server rendering
**How to avoid:** Always guard: `if (!isServer) { this.internals = this.attachInternals(); }`
**Warning signs:** "attachInternals is not defined" errors during SSR/hydration

### Pitfall 2: Height Jump on First Auto-Resize
**What goes wrong:** Textarea visually jumps when first character is typed
**Why it happens:** Initial height not set before first input event
**How to avoid:** Call `adjustHeight()` in `firstUpdated()` and on initial render
**Warning signs:** Textarea shrinks or expands unexpectedly on first interaction

### Pitfall 3: Auto-Resize Below Minimum Rows
**What goes wrong:** Textarea shrinks to single line when content is deleted
**Why it happens:** Not enforcing minimum height based on `rows` attribute
**How to avoid:** Calculate min height from rows * lineHeight + padding; never shrink below
**Warning signs:** Textarea collapses when user deletes content

### Pitfall 4: Character Counter Overlapping Text
**What goes wrong:** Counter covers last line of textarea content
**Why it happens:** Counter positioned inside without reserving space
**How to avoid:** Add bottom padding to textarea when showCount is enabled; position counter in that space
**Warning signs:** User can't see text they're typing near bottom-right

### Pitfall 5: Resize Handle Visible with Auto-Resize
**What goes wrong:** Users try to drag resize while auto-resize is active, causing confusion
**Why it happens:** Not disabling resize when autoresize is enabled
**How to avoid:** Set `resize: none` when `autoresize` attribute is present
**Warning signs:** Conflicting resize behaviors; height jumps

### Pitfall 6: Transition Flicker on Content Change
**What goes wrong:** Visible flicker during height transition
**Why it happens:** Setting height to 'auto' briefly before calculating new height
**How to avoid:** Disable transition during calculation, or use requestAnimationFrame
**Warning signs:** Visual jitter when typing quickly

### Pitfall 7: Not Syncing Value on Every Change
**What goes wrong:** Form submission gets stale value
**Why it happens:** setFormValue() not called after value changes
**How to avoid:** Call `this.internals?.setFormValue(this.value)` in handleInput
**Warning signs:** FormData contains old value or empty string

### Pitfall 8: Missing formResetCallback
**What goes wrong:** Form reset doesn't clear textarea
**Why it happens:** Form-associated element doesn't implement reset callback
**How to avoid:** Implement `formResetCallback()` to restore default value and clear validation
**Warning signs:** Form reset button doesn't affect textarea

## Code Examples

Verified patterns from official sources:

### Complete Textarea Component Structure
```typescript
// Source: Existing input.ts pattern adapted for textarea
import { html, css, nothing, isServer } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export class Textarea extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;
  private textareaId = `lui-textarea-${Math.random().toString(36).substr(2, 9)}`;

  @query('textarea') private textareaEl!: HTMLTextAreaElement;

  @property({ type: String }) size: TextareaSize = 'md';
  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) label = '';
  @property({ type: String, attribute: 'helper-text' }) helperText = '';
  @property({ type: Number }) rows = 3;
  @property({ type: String }) resize: TextareaResize = 'vertical';
  @property({ type: Number }) minlength?: number;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: Boolean }) autoresize = false;
  @property({ type: Number, attribute: 'max-rows' }) maxRows?: number;
  @property({ type: String, attribute: 'max-height' }) maxHeight?: string;
  @property({ type: Boolean, attribute: 'show-count' }) showCount = false;
  @property({ type: String, attribute: 'required-indicator' })
  requiredIndicator: 'asterisk' | 'text' = 'asterisk';

  @state() private touched = false;
  @state() private showError = false;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  // Form lifecycle callbacks (copy from Input)
  formResetCallback() {
    this.value = '';
    this.touched = false;
    this.showError = false;
    this.internals?.setFormValue('');
    this.internals?.setValidity({});
    if (this.autoresize) {
      this.adjustHeight();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  // Auto-resize methods
  protected firstUpdated() {
    if (this.autoresize) {
      this.adjustHeight();
    }
  }

  private adjustHeight() { /* see Pattern 2 above */ }
}
```

### CSS Custom Properties Usage
```css
/* Source: Phase 26 tokens, existing input.ts pattern */
:host {
  display: inline-block;
}

:host([disabled]) {
  pointer-events: none;
}

.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
}

textarea {
  border-radius: var(--ui-textarea-radius);
  border-width: var(--ui-textarea-border-width);
  border-style: solid;
  border-color: var(--ui-textarea-border);
  background-color: var(--ui-textarea-bg);
  color: var(--ui-textarea-text);
  font-family: inherit;
  transition: border-color var(--ui-textarea-transition),
              box-shadow var(--ui-textarea-transition);
}

textarea::placeholder {
  color: var(--ui-textarea-placeholder);
}

/* Focus state */
textarea:focus-visible {
  outline: none;
  border-color: var(--ui-textarea-border-focus);
}

/* Error state */
textarea.textarea-error {
  border-color: var(--ui-textarea-border-error);
}

/* Disabled state */
textarea:disabled {
  background-color: var(--ui-textarea-bg-disabled);
  color: var(--ui-textarea-text-disabled);
  border-color: var(--ui-textarea-border-disabled);
  cursor: not-allowed;
}

/* Readonly state */
textarea:read-only:not(:disabled) {
  background-color: var(--ui-textarea-bg-readonly, var(--color-muted));
  cursor: text;
}

/* Size variants */
textarea.textarea-sm {
  padding: var(--ui-textarea-padding-y-sm) var(--ui-textarea-padding-x-sm);
  font-size: var(--ui-textarea-font-size-sm);
}

textarea.textarea-md {
  padding: var(--ui-textarea-padding-y-md) var(--ui-textarea-padding-x-md);
  font-size: var(--ui-textarea-font-size-md);
}

textarea.textarea-lg {
  padding: var(--ui-textarea-padding-y-lg) var(--ui-textarea-padding-x-lg);
  font-size: var(--ui-textarea-font-size-lg);
}

/* Resize variants */
textarea.resize-none { resize: none; }
textarea.resize-vertical { resize: vertical; }
textarea.resize-horizontal { resize: horizontal; }
textarea.resize-both { resize: both; }

/* Auto-resize mode */
textarea.autoresize {
  resize: none;
  overflow-y: hidden;
  transition: height 150ms ease-out,
              border-color var(--ui-textarea-transition),
              box-shadow var(--ui-textarea-transition);
}

/* Character counter */
.character-count {
  position: absolute;
  bottom: 0.5rem;
  right: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
  pointer-events: none;
  background: var(--ui-textarea-bg);
  padding: 0 0.25rem;
}

/* Extra bottom padding when counter is shown */
textarea.has-counter {
  padding-bottom: 1.75rem;
}
```

### Render Template
```typescript
// Source: Input pattern adapted for textarea
render() {
  return html`
    <div class="textarea-wrapper" part="wrapper">
      ${this.label ? html`
        <label for=${this.textareaId} part="label" class="textarea-label label-${this.size}">
          ${this.label}
          ${this.required ? html`<span class="required-indicator">${this.requiredIndicator === 'text' ? ' (required)' : '*'}</span>` : nothing}
        </label>
      ` : nothing}

      ${this.helperText ? html`
        <span id="${this.textareaId}-helper" part="helper" class="helper-text">
          ${this.helperText}
        </span>
      ` : nothing}

      <div class="textarea-container ${this.getContainerClasses()}" part="container">
        <textarea
          id=${this.textareaId}
          part="textarea"
          class=${this.getTextareaClasses()}
          name=${this.name}
          .value=${this.value}
          rows=${this.rows}
          placeholder=${this.placeholder || nothing}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          minlength=${this.minlength ?? nothing}
          maxlength=${this.maxlength ?? nothing}
          aria-invalid=${this.showError ? 'true' : nothing}
          aria-describedby=${this.getAriaDescribedBy()}
          @input=${this.handleInput}
          @blur=${this.handleBlur}
        ></textarea>
        ${this.renderCharacterCount()}
      </div>

      ${this.showError && this.errorMessage ? html`
        <span id="${this.textareaId}-error" part="error" class="error-text" role="alert">
          ${this.errorMessage}
        </span>
      ` : nothing}
    </div>
  `;
}

private getTextareaClasses(): string {
  const classes = [`textarea-${this.size}`];

  if (this.autoresize) {
    classes.push('autoresize');
  } else {
    classes.push(`resize-${this.resize}`);
  }

  if (this.showError) {
    classes.push('textarea-error');
  }

  if (this.showCount && this.maxlength) {
    classes.push('has-counter');
  }

  return classes.join(' ');
}

private renderCharacterCount() {
  if (!this.showCount || !this.maxlength) return nothing;

  return html`
    <span class="character-count" part="counter">
      ${this.value.length}/${this.maxlength}
    </span>
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
| CSS Grid auto-grow | scrollHeight technique | Both valid 2023+ | scrollHeight simpler in Shadow DOM |
| JavaScript resize libraries | Native CSS `resize` property | Long-standing | Zero dependencies |

**Deprecated/outdated:**
- Slotting native textarea to light DOM: No longer needed with ElementInternals
- Autosize libraries (like Jack Moore's autosize.js): Native JS is sufficient

## Open Questions

Things that couldn't be fully resolved:

1. **Character Count Format**
   - What we know: CONTEXT.md gives Claude discretion on format (x/max vs remaining)
   - What's unclear: User preference
   - Recommendation: Use x/max format (e.g., "45/200") as it's more common in modern UIs (Twitter, Slack)

2. **Max Height Units**
   - What we know: Need to support both `maxRows` and `maxHeight` per CONTEXT.md
   - What's unclear: Priority when both are set
   - Recommendation: `maxHeight` takes precedence if both are set; it's more explicit

3. **Character Counter Position with Autoresize**
   - What we know: Counter should stay at bottom-right inside textarea
   - What's unclear: Whether to reposition when height changes
   - Recommendation: Use absolute positioning from bottom; it will track automatically

4. **Label/Helper/Error Patterns**
   - What we know: CONTEXT.md gives Claude discretion on whether identical to Input or adapted
   - What's unclear: Whether multi-line warrants different treatment
   - Recommendation: Keep identical to Input for consistency; label above, helper below label, error below textarea

## Sources

### Primary (HIGH confidence)
- MDN ElementInternals - https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
- Existing packages/input/src/input.ts - Complete reference implementation
- Phase 26 CSS tokens in packages/core/src/tokens/index.ts - Textarea tokens defined
- Phase 27 RESEARCH.md - Validation and form participation patterns

### Secondary (MEDIUM confidence)
- CSS-Tricks Auto-Growing Textareas - https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/
- WebKit ElementInternals blog - https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/
- Phase 28 patterns - Container styling and focus delegation

### Tertiary (LOW confidence)
- Various auto-resize blog posts - Techniques vary; scrollHeight approach verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project patterns with well-documented APIs
- Architecture: HIGH - Input component provides ~95% reusable template
- Auto-resize: HIGH - scrollHeight technique is well-established
- Character count: MEDIUM - Position/format decisions are discretionary

**Research date:** 2026-01-26
**Valid until:** 60 days (ElementInternals API is stable; patterns well-established)
