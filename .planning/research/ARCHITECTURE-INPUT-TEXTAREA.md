# Architecture Patterns: Input and Textarea Integration

**Domain:** Form input components for Lit.js component library
**Researched:** 2026-01-26
**Confidence:** HIGH (based on existing codebase patterns + MDN documentation)

## Executive Summary

Input and Textarea components integrate cleanly with the existing LitUI architecture. The TailwindElement base class, ElementInternals pattern established by Button, and package structure are all directly applicable. The main additions are validation APIs (`setFormValue`, `setValidity`, `checkValidity`, `reportValidity`) and form lifecycle callbacks (`formResetCallback`, `formStateRestoreCallback`).

## Existing Architecture Analysis

### TailwindElement Base Class

Location: `/packages/core/src/tailwind-element.ts`

The base class provides:
- Dual-mode CSS: inline for SSR, constructable stylesheets for client
- Automatic Tailwind CSS injection via `adoptedStyleSheets`
- `tailwindBaseStyles` export for subclass static styles
- `isServer` guards for SSR-safe DOM operations

**Integration point for Input/Textarea:** Extend `TailwindElement` exactly as Button and Dialog do.

```typescript
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export class Input extends TailwindElement {
  static override styles = [
    ...tailwindBaseStyles,
    css`/* component-specific styles */`
  ];
}
```

### ElementInternals Pattern (from Button)

Location: `/packages/button/src/Button.ts`

Button establishes the form association pattern:

```typescript
export class Button extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }
}
```

**Key patterns:**
1. `static formAssociated = true` enables form participation
2. `attachInternals()` only on client (SSR guard)
3. `internals?.form` for optional chaining in form operations
4. Form actions via `internals.form.requestSubmit()` and `internals.form.reset()`

### Package Structure

Each component follows this structure:
```
packages/
  input/                    # New package
    src/
      Input.ts              # Main component
      index.ts              # Exports
    package.json
    vite.config.ts
    tsconfig.json
  textarea/                 # New package
    src/
      Textarea.ts
      index.ts
    package.json
    vite.config.ts
    tsconfig.json
```

**package.json pattern:**
```json
{
  "name": "@lit-ui/input",
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  },
  "devDependencies": {
    "@lit-ui/core": "workspace:*",
    "@lit-ui/vite-config": "workspace:*"
  }
}
```

### CSS Custom Properties Pattern

Location: `/packages/core/src/styles/tailwind.css`

Components use `--ui-{component}-*` CSS variables with fallbacks:

```css
:root {
  /* Input tokens (to be added) */
  --ui-input-radius: 0.375rem;
  --ui-input-border-width: 1px;
  --ui-input-bg: var(--color-background, var(--ui-color-background));
  --ui-input-border: var(--color-border, var(--ui-color-border));
  --ui-input-text: var(--color-foreground, var(--ui-color-foreground));
  --ui-input-placeholder: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-input-focus-ring: var(--color-ring, var(--ui-color-ring));
  --ui-input-error-border: var(--color-destructive, var(--ui-color-destructive));
}
```

## Recommended Architecture for Input/Textarea

### Component Hierarchy

```
TailwindElement (from @lit-ui/core)
    |
    +-- Input (lui-input)
    |     - text, email, password, number, tel, url, search
    |     - ElementInternals for form value + validation
    |
    +-- Textarea (lui-textarea)
          - multiline text input
          - auto-resize option
          - ElementInternals for form value + validation
```

### Input Component Structure

```typescript
// packages/input/src/Input.ts
import { html, css, nothing, isServer } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

export class Input extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;

  @property({ type: String }) type: InputType = 'text';
  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) size: InputSize = 'md';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: Boolean }) required = false;
  @property({ type: String }) pattern = '';
  @property({ type: Number }) minlength?: number;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) min?: number;
  @property({ type: Number }) max?: number;
  @property({ type: Number }) step?: number;
  @property({ type: String }) autocomplete = '';

  @state() private touched = false;
  @state() private dirty = false;

  @query('input') private inputEl!: HTMLInputElement;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  // Form lifecycle callbacks
  formResetCallback() {
    this.value = this.getAttribute('value') ?? '';
    this.touched = false;
    this.dirty = false;
    this.updateFormValue();
  }

  formStateRestoreCallback(state: string) {
    this.value = state;
    this.updateFormValue();
  }

  // Validation API passthrough
  checkValidity(): boolean {
    return this.internals?.checkValidity() ?? true;
  }

  reportValidity(): boolean {
    return this.internals?.reportValidity() ?? true;
  }

  setCustomValidity(message: string): void {
    if (this.internals) {
      if (message) {
        this.internals.setValidity({ customError: true }, message, this.inputEl);
      } else {
        this.internals.setValidity({});
      }
    }
  }

  // Internal methods
  private updateFormValue(): void {
    this.internals?.setFormValue(this.value || null);
    this.syncValidation();
  }

  private syncValidation(): void {
    if (!this.internals || !this.inputEl) return;

    const validity = this.inputEl.validity;
    if (validity.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(
        {
          valueMissing: validity.valueMissing,
          typeMismatch: validity.typeMismatch,
          patternMismatch: validity.patternMismatch,
          tooShort: validity.tooShort,
          tooLong: validity.tooLong,
          rangeUnderflow: validity.rangeUnderflow,
          rangeOverflow: validity.rangeOverflow,
          stepMismatch: validity.stepMismatch,
          badInput: validity.badInput,
        },
        this.inputEl.validationMessage,
        this.inputEl
      );
    }
  }

  private handleInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dirty = true;
    this.updateFormValue();
    this.dispatchEvent(new CustomEvent('ui-input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  private handleChange(e: Event): void {
    this.dispatchEvent(new CustomEvent('ui-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  private handleBlur(): void {
    this.touched = true;
  }
}
```

### Textarea Component Structure

```typescript
// packages/textarea/src/Textarea.ts
export class Textarea extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;

  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: Number }) rows = 3;
  @property({ type: Boolean }) autoresize = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Number }) minlength?: number;
  @property({ type: Number }) maxlength?: number;

  @query('textarea') private textareaEl!: HTMLTextAreaElement;

  // Same form lifecycle and validation API as Input
  // Plus auto-resize logic for textareas
}
```

### Data Flow

```
User Input
    |
    v
[Internal <input>/<textarea>]
    |
    +---> value property updated
    |
    +---> internals.setFormValue(value)
    |         |
    |         v
    |     [Parent <form>]
    |         |
    |         +---> FormData includes value
    |         +---> form.elements includes component
    |
    +---> syncValidation()
    |         |
    |         v
    |     internals.setValidity(flags, message, anchor)
    |         |
    |         +---> :invalid/:valid CSS pseudo-classes
    |         +---> form.checkValidity() includes this component
    |
    +---> dispatch ui-input event
    +---> dispatch ui-change event (on blur/enter)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `lui-input` | Single-line text input, validation, form value | Parent form via ElementInternals |
| `lui-textarea` | Multi-line text input, auto-resize, validation | Parent form via ElementInternals |
| `@lit-ui/core` | Base class, Tailwind injection, CSS tokens | Consumed by all components |
| Theme CSS | `--ui-input-*` and `--ui-textarea-*` tokens | Applied to components |

## New Components Needed

### 1. `@lit-ui/input` Package (New)

**Files to create:**
- `packages/input/package.json`
- `packages/input/vite.config.ts`
- `packages/input/tsconfig.json`
- `packages/input/src/Input.ts`
- `packages/input/src/index.ts`

**Features:**
- Input types: text, email, password, number, tel, url, search
- Sizes: sm, md, lg
- States: disabled, readonly, required, error
- Validation: native constraint validation via ElementInternals
- Events: ui-input, ui-change, ui-focus, ui-blur

### 2. `@lit-ui/textarea` Package (New)

**Files to create:**
- `packages/textarea/package.json`
- `packages/textarea/vite.config.ts`
- `packages/textarea/tsconfig.json`
- `packages/textarea/src/Textarea.ts`
- `packages/textarea/src/index.ts`

**Features:**
- Auto-resize option
- Row configuration
- Sizes: sm, md, lg
- Same validation pattern as Input

## Modifications to Existing Components

### `@lit-ui/core` - CSS Tokens Addition

Add to `packages/core/src/styles/tailwind.css`:

```css
:root {
  /* Input Component Tokens */
  --ui-input-radius: 0.375rem;
  --ui-input-border-width: 1px;
  --ui-input-padding-x-sm: 0.5rem;
  --ui-input-padding-y-sm: 0.25rem;
  --ui-input-padding-x-md: 0.75rem;
  --ui-input-padding-y-md: 0.5rem;
  --ui-input-padding-x-lg: 1rem;
  --ui-input-padding-y-lg: 0.75rem;
  --ui-input-font-size-sm: 0.875rem;
  --ui-input-font-size-md: 1rem;
  --ui-input-font-size-lg: 1.125rem;

  /* Colors */
  --ui-input-bg: var(--color-background, var(--ui-color-background));
  --ui-input-text: var(--color-foreground, var(--ui-color-foreground));
  --ui-input-border: var(--color-border, var(--ui-color-border));
  --ui-input-placeholder: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-input-focus-border: var(--color-ring, var(--ui-color-ring));
  --ui-input-error-border: var(--color-destructive, var(--ui-color-destructive));
  --ui-input-disabled-bg: var(--color-muted, var(--ui-color-muted));
  --ui-input-disabled-opacity: 0.5;

  /* Textarea Component Tokens */
  --ui-textarea-radius: 0.375rem;
  --ui-textarea-border-width: 1px;
  --ui-textarea-min-height: 5rem;
  /* ... same pattern as input */
}
```

### CLI Templates Addition

Add templates to `packages/cli/src/templates/index.ts`:

```typescript
export const INPUT_TEMPLATE = `...`;
export const TEXTAREA_TEMPLATE = `...`;

export const COMPONENT_TEMPLATES: Record<string, string> = {
  button: BUTTON_TEMPLATE,
  dialog: DIALOG_TEMPLATE,
  input: INPUT_TEMPLATE,
  textarea: TEXTAREA_TEMPLATE,
};
```

## Patterns to Follow

### Pattern 1: SSR-Safe ElementInternals

**What:** Guard `attachInternals()` and all DOM-dependent operations with `isServer` checks.

**When:** Always in form-associated components.

**Example:**
```typescript
constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}

formResetCallback() {
  if (isServer) return;
  // ... reset logic
}
```

### Pattern 2: Validation Sync with Native Input

**What:** Mirror the internal native input's ValidityState to ElementInternals.

**When:** After every value change.

**Example:**
```typescript
private syncValidation(): void {
  if (!this.internals || !this.inputEl) return;

  const validity = this.inputEl.validity;
  if (validity.valid) {
    this.internals.setValidity({});
  } else {
    this.internals.setValidity(
      { ...validity }, // Copy all flags
      this.inputEl.validationMessage,
      this.inputEl // Anchor for popup positioning
    );
  }
}
```

### Pattern 3: CSS Custom Properties for Theming

**What:** Use `--ui-{component}-*` variables with `var(--color-*, var(--ui-color-*))` fallback chain.

**When:** All visual properties that should be themeable.

**Example:**
```css
.input-field {
  background-color: var(--ui-input-bg);
  border-color: var(--ui-input-border);
  color: var(--ui-input-text);
}

.input-field::placeholder {
  color: var(--ui-input-placeholder);
}

.input-field:focus {
  border-color: var(--ui-input-focus-border);
  box-shadow: inset 0 0 0 1px var(--ui-input-focus-border);
}
```

### Pattern 4: Custom Event Emission

**What:** Emit custom events with `ui-` prefix for framework-agnostic event handling.

**When:** On meaningful user interactions (input, change, focus, blur).

**Example:**
```typescript
private handleInput(e: Event): void {
  this.dispatchEvent(new CustomEvent('ui-input', {
    detail: { value: this.value },
    bubbles: true,
    composed: true, // Cross shadow boundary
  }));
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct DOM Manipulation Without SSR Guards

**What:** Calling `attachInternals()`, `querySelector()`, or accessing `document` without checking `isServer`.

**Why bad:** Breaks SSR with "document is not defined" or "attachInternals is not a function" errors.

**Instead:**
```typescript
if (!isServer) {
  this.internals = this.attachInternals();
}
```

### Anti-Pattern 2: Relying Solely on Attribute Reflection for Value

**What:** Using only `@property({ reflect: true })` for the `value` attribute.

**Why bad:** Form values need to sync with ElementInternals, not just DOM attributes. Also causes performance issues with frequent reflection.

**Instead:**
```typescript
@property({ type: String }) value = '';  // No reflect

updated(changed: Map<string, unknown>) {
  if (changed.has('value')) {
    this.updateFormValue();
  }
}
```

### Anti-Pattern 3: Validating Only on Submit

**What:** Deferring all validation to form submission time.

**Why bad:** Users expect immediate feedback. Also, `:invalid` CSS pseudo-class won't work correctly.

**Instead:** Validate on every input change, but only show error messages after `touched` is true (first blur).

### Anti-Pattern 4: Hardcoded Colors/Sizes

**What:** Using Tailwind utility classes directly for colors instead of CSS variables.

**Why bad:** Breaks theming capability. Components can't be restyled without code changes.

**Instead:**
```css
/* Bad */
.input { @apply bg-white border-gray-300; }

/* Good */
.input {
  background-color: var(--ui-input-bg);
  border-color: var(--ui-input-border);
}
```

## Suggested Build Order

Based on dependencies and complexity:

### Phase 1: Core Token Foundation

1. **Add CSS tokens to `@lit-ui/core`** - Prerequisite for both components
   - `--ui-input-*` variables
   - `--ui-textarea-*` variables
   - Update `tailwind.css` in core package

### Phase 2: Input Component

2. **Create `@lit-ui/input` package structure**
   - `package.json`, `vite.config.ts`, `tsconfig.json`

3. **Implement Input component**
   - Basic text input with form association
   - All input types (text, email, password, number, etc.)
   - Validation via ElementInternals
   - Size variants (sm, md, lg)
   - States (disabled, readonly, error)

4. **Add Input to CLI templates**

### Phase 3: Textarea Component

5. **Create `@lit-ui/textarea` package structure**
   - Same structure as input

6. **Implement Textarea component**
   - Multi-line input with form association
   - Auto-resize feature
   - Validation via ElementInternals

7. **Add Textarea to CLI templates**

### Phase 4: Documentation and Testing

8. **Add documentation pages to apps/docs**
   - Input component page
   - Textarea component page
   - Form integration examples

9. **Add Storybook stories** (if applicable)

## Accessibility Considerations

### Required ARIA Properties

| Property | When to Use | Implementation |
|----------|-------------|----------------|
| `aria-invalid` | When validation fails | `aria-invalid=${this.internals?.validity.valid === false}` |
| `aria-required` | When input is required | `aria-required=${this.required}` |
| `aria-disabled` | When input is disabled | `aria-disabled=${this.disabled}` |
| `aria-describedby` | When error message shown | Link to error message element |

### Label Association

ElementInternals provides automatic label association via the `labels` property:

```typescript
get labels(): NodeList | null {
  return this.internals?.labels ?? null;
}
```

External `<label for="id">` elements will automatically associate with the component.

### Focus Management

- Internal `<input>` must be focusable
- Use `delegatesFocus: true` in `attachShadow()` for proper focus delegation
- Maintain visible focus ring using `--ui-input-focus-border`

## Sources

- [MDN ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) - Form validation API reference
- [MDN aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid) - Accessibility for invalid state
- [CSS-Tricks: Creating Custom Form Controls with ElementInternals](https://css-tricks.com/creating-custom-form-controls-with-elementinternals/) - Implementation patterns
- [WebKit: ElementInternals and Form-Associated Custom Elements](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) - Browser implementation details
- Existing codebase: Button.ts, Dialog.ts, TailwindElement.ts patterns
