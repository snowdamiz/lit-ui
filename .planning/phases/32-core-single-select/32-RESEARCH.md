# Phase 32: Core Single Select - Research

**Researched:** 2026-01-26
**Domain:** ARIA combobox pattern, keyboard navigation, form participation, dropdown positioning
**Confidence:** HIGH

## Summary

Phase 32 implements the full single-select dropdown component with ARIA 1.2 combobox pattern compliance, keyboard navigation, form participation, and all visual states. This phase builds on the skeleton component from Phase 31, which established the package structure, CSS tokens, and Floating UI integration.

The research confirms that implementing an accessible single-select requires:
1. **ARIA 1.2 combobox pattern** with `aria-controls` (not `aria-owns`), `aria-activedescendant` for virtual focus, and proper `role="listbox"` / `role="option"` structure
2. **Comprehensive keyboard navigation** including arrow keys, Enter/Space, Escape, Home/End, and type-ahead search with debounced character matching
3. **Form participation** via ElementInternals (already scaffolded) with `setFormValue()` and `setValidity()` for required field validation
4. **Shadow DOM considerations** for click-outside detection using `event.composedPath()`

**Primary recommendation:** Follow the W3C APG select-only combobox example exactly for ARIA structure, implement keyboard navigation per the APG specification, and add ARIA live regions for VoiceOver compatibility (since `aria-activedescendant` has limited mobile support).

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @floating-ui/dom | ^1.7.4 | Dropdown positioning | Already installed in Phase 31, industry standard |
| lit | ^3.3.2 | Web component framework | Existing LitUI framework |
| @lit-ui/core | ^1.0.0 | TailwindElement base class | LitUI architecture |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | - | No additional libraries needed for Phase 32 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| aria-activedescendant | element.focus() roving tabindex | DOM focus provides better mobile screen reader support but is more complex to implement |
| Manual typeahead | @floating-ui/react useTypeahead | React-only, we need vanilla JS implementation |

**Installation:** No new packages needed - Floating UI already installed in Phase 31.

## Architecture Patterns

### Recommended Component Structure

```
packages/select/src/
├── index.ts           # Entry point with element registration (exists)
├── select.ts          # Main Select component (expand from skeleton)
├── option.ts          # lui-option component (new)
├── jsx.d.ts           # JSX type definitions (exists)
└── vite-env.d.ts      # Vite environment types (exists)
```

### Pattern 1: ARIA 1.2 Combobox Structure

**What:** Proper ARIA roles and attributes for select-only combobox
**When to use:** Always - this is the required accessibility pattern

```html
<!-- Source: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/ -->
<div class="select-wrapper">
  <div
    role="combobox"
    aria-expanded="false"
    aria-haspopup="listbox"
    aria-controls="listbox-id"
    aria-activedescendant=""
    aria-labelledby="label-id"
    tabindex="0"
  >
    <span class="selected-value">Select an option</span>
    <svg aria-hidden="true"><!-- chevron --></svg>
  </div>
  <div
    role="listbox"
    id="listbox-id"
    aria-labelledby="label-id"
    hidden
  >
    <div role="option" id="option-1" aria-selected="false">Option 1</div>
    <div role="option" id="option-2" aria-selected="true">Option 2</div>
    <div role="option" id="option-3" aria-disabled="true">Disabled</div>
  </div>
</div>
```

**Critical ARIA requirements:**
- `aria-controls` (NOT `aria-owns`) references the listbox
- `aria-activedescendant` points to currently focused option when open
- `aria-selected="true"` only on the actually selected option
- `aria-expanded` reflects open/closed state

### Pattern 2: Keyboard Navigation State Machine

**What:** Complete keyboard handling for APG compliance
**When to use:** Always - keyboard accessibility is mandatory

```typescript
// Source: W3C APG Combobox Pattern
private handleKeydown(e: KeyboardEvent): void {
  const key = e.key;

  // When closed
  if (!this.open) {
    switch (key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.openDropdown();
        if (key === 'ArrowUp') {
          this.focusLastOption();
        } else {
          this.focusFirstOption();
        }
        break;
      case 'Home':
        e.preventDefault();
        this.openDropdown();
        this.focusFirstOption();
        break;
      case 'End':
        e.preventDefault();
        this.openDropdown();
        this.focusLastOption();
        break;
      default:
        // Printable character - type-ahead
        if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
          this.openDropdown();
          this.handleTypeahead(key);
        }
    }
    return;
  }

  // When open
  switch (key) {
    case 'ArrowDown':
      e.preventDefault();
      this.focusNextOption();
      break;
    case 'ArrowUp':
      e.preventDefault();
      this.focusPreviousOption();
      break;
    case 'Home':
      e.preventDefault();
      this.focusFirstOption();
      break;
    case 'End':
      e.preventDefault();
      this.focusLastOption();
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      this.selectFocusedOption();
      this.closeDropdown();
      break;
    case 'Escape':
      e.preventDefault();
      this.closeDropdown();
      break;
    case 'Tab':
      // Select and close on Tab
      this.selectFocusedOption();
      this.closeDropdown();
      // Let Tab proceed naturally
      break;
    default:
      // Printable character - type-ahead
      if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
        this.handleTypeahead(key);
      }
  }
}
```

### Pattern 3: Type-Ahead Search Implementation

**What:** Character matching with debounced string concatenation
**When to use:** Required for full APG compliance

```typescript
// Source: Floating UI useTypeahead pattern adapted for vanilla JS
private typeaheadString = '';
private typeaheadTimeout: number | null = null;
private static TYPEAHEAD_RESET_MS = 500; // Reset after 500ms of no typing

private handleTypeahead(char: string): void {
  // Clear previous timeout
  if (this.typeaheadTimeout !== null) {
    clearTimeout(this.typeaheadTimeout);
  }

  // Append character to search string
  this.typeaheadString += char.toLowerCase();

  // Find matching option
  const match = this.findTypeaheadMatch(this.typeaheadString);
  if (match) {
    this.setActiveDescendant(match);
    this.scrollOptionIntoView(match);
  }

  // Set timeout to reset string
  this.typeaheadTimeout = window.setTimeout(() => {
    this.typeaheadString = '';
    this.typeaheadTimeout = null;
  }, Select.TYPEAHEAD_RESET_MS);
}

private findTypeaheadMatch(searchString: string): string | null {
  const options = this.getEnabledOptions();

  // If repeating same character, cycle through matches
  if (searchString.length > 1 &&
      searchString.split('').every(c => c === searchString[0])) {
    const char = searchString[0];
    const matches = options.filter(opt =>
      this.getOptionLabel(opt).toLowerCase().startsWith(char)
    );
    if (matches.length > 0) {
      const currentIndex = matches.indexOf(this.activeOptionId);
      const nextIndex = (currentIndex + 1) % matches.length;
      return matches[nextIndex];
    }
    return null;
  }

  // Otherwise find first match for full string
  return options.find(opt =>
    this.getOptionLabel(opt).toLowerCase().startsWith(searchString)
  ) ?? null;
}
```

### Pattern 4: Click-Outside with Shadow DOM

**What:** Detect clicks outside component using composedPath()
**When to use:** Closing dropdown when clicking elsewhere

```typescript
// Source: https://javascript.info/shadow-dom-events
private handleDocumentClick = (e: MouseEvent): void => {
  // composedPath() traverses Shadow DOM boundaries
  if (!e.composedPath().includes(this)) {
    this.closeDropdown();
  }
};

connectedCallback(): void {
  super.connectedCallback();
  if (!isServer) {
    document.addEventListener('click', this.handleDocumentClick);
  }
}

disconnectedCallback(): void {
  super.disconnectedCallback();
  if (!isServer) {
    document.removeEventListener('click', this.handleDocumentClick);
  }
}
```

### Pattern 5: Form Validation

**What:** Required field validation via ElementInternals
**When to use:** When `required` attribute is set

```typescript
// Source: Existing LitUI Input pattern adapted for Select
private validate(): boolean {
  if (!this.internals) return true;

  if (this.required && !this.value) {
    this.internals.setValidity(
      { valueMissing: true },
      'Please select an option',
      this.triggerRef.value // anchor element for validation popup
    );
    return false;
  }

  this.internals.setValidity({});
  return true;
}

formResetCallback(): void {
  this.value = '';
  this.internals?.setFormValue('');
  this.internals?.setValidity({});
}

formDisabledCallback(disabled: boolean): void {
  this.disabled = disabled;
}
```

### Pattern 6: ARIA Live Region for Mobile Support

**What:** Announce option changes for VoiceOver compatibility
**When to use:** Always - compensates for poor aria-activedescendant mobile support

```typescript
// Source: React Aria LiveAnnouncer pattern
render() {
  return html`
    <!-- Visually hidden live region for screen reader announcements -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="visually-hidden"
    >
      ${this.open && this.activeOptionLabel
        ? `${this.activeOptionLabel}, ${this.activeOptionIndex + 1} of ${this.optionCount}`
        : ''}
    </div>

    <!-- Rest of component -->
  `;
}
```

### Anti-Patterns to Avoid

- **Using `aria-owns` instead of `aria-controls`:** ARIA 1.2 deprecates aria-owns for combobox; use aria-controls
- **Moving DOM focus to options:** Keep focus on combobox trigger, use aria-activedescendant for virtual focus
- **Forgetting type-ahead reset timeout:** Without timeout, typeahead breaks after first character
- **Using `event.target` for click-outside:** Shadow DOM retargets events; use `event.composedPath()`
- **Pre-selecting first option:** Users expect placeholder/empty state; pre-selection causes accidental submissions
- **Auto-opening on focus:** Only open on explicit user action (click, Enter, Space, ArrowDown)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown positioning | getBoundingClientRect() calculations | @floating-ui/dom | Already installed, handles viewport collision, scroll, transforms |
| Click-outside detection | event.target !== this | event.composedPath().includes(this) | Shadow DOM event retargeting |
| Option ID generation | Manual counters | crypto.randomUUID() or Math.random().toString(36) | Guaranteed uniqueness |
| Scroll into view | Manual offset calculations | element.scrollIntoView({ block: 'nearest' }) | Native, handles all edge cases |

**Key insight:** The complexity in select components is in the interaction patterns and accessibility, not the visual rendering. Use established patterns from APG.

## Common Pitfalls

### Pitfall 1: ARIA 1.1 vs 1.2 Pattern Confusion

**What goes wrong:** Using outdated ARIA patterns (aria-owns, role on wrapper) that have poor screen reader support
**Why it happens:** Old tutorials and documentation; ARIA 1.2 relatively recent
**How to avoid:** Reference ONLY the W3C APG select-only combobox example; use aria-controls not aria-owns
**Warning signs:** Screen readers announce incorrectly; role="combobox" on wrapper div instead of trigger

### Pitfall 2: Mobile Screen Reader aria-activedescendant Failure

**What goes wrong:** iOS VoiceOver and Android TalkBack largely ignore aria-activedescendant
**Why it happens:** Mobile screen readers use touch navigation, not keyboard focus
**How to avoid:** Add ARIA live region announcements for option focus changes
**Warning signs:** Desktop screen readers work; mobile fails to announce option changes

### Pitfall 3: Type-Ahead State Not Resetting

**What goes wrong:** User types "a", waits, types "b", but component searches for "ab" instead of "b"
**Why it happens:** Missing timeout to reset typeahead string
**How to avoid:** Clear typeahead string after 500ms of no typing (APG recommendation)
**Warning signs:** Type-ahead works initially but breaks after pause

### Pitfall 4: Form Submission Without Value

**What goes wrong:** Form submits but select value not included
**Why it happens:** Missing setFormValue() call when value changes
**How to avoid:** Call internals.setFormValue(this.value) on every value change
**Warning signs:** Form data missing select field; works in tests but fails in real forms

### Pitfall 5: Dropdown Behind Other Elements

**What goes wrong:** Dropdown appears behind modals, other positioned elements
**Why it happens:** z-index stacking context issues
**How to avoid:** Use position: fixed with Floating UI; use --ui-select-z-index: 50 token
**Warning signs:** Works standalone; fails inside dialogs or complex layouts

### Pitfall 6: Focus Lost on Value Change

**What goes wrong:** After selecting an option, focus moves to body instead of staying on select
**Why it happens:** Closing dropdown without explicit focus management
**How to avoid:** Always refocus the trigger after closing dropdown
**Warning signs:** User has to Tab back to select to continue form navigation

## Code Examples

### Complete Select Component Structure

```typescript
// Source: Existing LitUI patterns + W3C APG
import { html, css, isServer, nothing } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { computePosition, flip, shift, offset, size } from '@floating-ui/dom';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export class Select extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;
  private typeaheadString = '';
  private typeaheadTimeout: number | null = null;

  @property({ type: String }) size: SelectSize = 'md';
  @property({ type: String }) placeholder = 'Select an option';
  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Array }) options: SelectOption[] = [];

  @state() private open = false;
  @state() private activeIndex = -1;
  @state() private touched = false;
  @state() private showError = false;

  @query('.trigger') private triggerEl!: HTMLElement;
  @query('.listbox') private listboxEl!: HTMLElement;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  // ... implementation
}
```

### Focus Management Pattern

```typescript
// Virtual focus with aria-activedescendant
private setActiveOption(index: number): void {
  // Clamp to valid range
  const enabledOptions = this.options.filter(o => !o.disabled);
  if (enabledOptions.length === 0) return;

  this.activeIndex = Math.max(0, Math.min(index, enabledOptions.length - 1));

  // Update aria-activedescendant
  const optionId = `${this.id}-option-${this.activeIndex}`;
  this.triggerEl.setAttribute('aria-activedescendant', optionId);

  // Scroll into view
  const optionEl = this.shadowRoot?.getElementById(optionId);
  optionEl?.scrollIntoView({ block: 'nearest' });
}
```

### Positioning Integration

```typescript
// Use Phase 31 Floating UI setup
private async positionDropdown(): Promise<void> {
  if (isServer || !this.open) return;

  const { x, y } = await computePosition(this.triggerEl, this.listboxEl, {
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(4),
      flip({ fallbackPlacements: ['top-start'] }),
      shift({ padding: 8 }),
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(availableHeight - 8, 240)}px`,
          });
        },
      }),
    ],
  });

  Object.assign(this.listboxEl.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    width: `${this.triggerEl.offsetWidth}px`,
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| aria-owns for combobox | aria-controls (ARIA 1.2) | 2021 | Better screen reader support |
| role="combobox" on wrapper | role="combobox" on trigger | ARIA 1.2 | Correct semantic structure |
| Full DOM focus on options | aria-activedescendant virtual focus | Best practice | Simpler, better UX |
| Manual positioning | Floating UI | 2022+ | Handles edge cases |

**Deprecated/outdated:**
- ARIA 1.1 combobox pattern: Use ARIA 1.2 (aria-controls, role on trigger)
- Popper.js: Replaced by Floating UI

## Open Questions

1. **Option rendering strategy**
   - What we know: Options can be passed via property (array) or slots
   - What's unclear: Best API for LitUI - property-only or support both?
   - Recommendation: Use property-based options for Phase 32; evaluate slots for future phase if needed

2. **Native mobile fallback**
   - What we know: aria-activedescendant has poor mobile support
   - What's unclear: Should we detect mobile and show native `<select>`?
   - Recommendation: Start with custom implementation + live regions; evaluate native fallback based on user feedback

## Sources

### Primary (HIGH confidence)
- [W3C APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) - ARIA specification
- [W3C APG Select-Only Combobox Example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) - Implementation reference
- [Floating UI Documentation](https://floating-ui.com/docs/getting-started) - Positioning API
- Existing LitUI codebase - Input, Dialog patterns

### Secondary (MEDIUM confidence)
- [Shadow DOM Events](https://javascript.info/shadow-dom-events) - composedPath() usage
- [Floating UI useTypeahead](https://floating-ui.com/docs/usetypeahead) - Type-ahead pattern
- [ElementInternals and FACE](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) - Form participation
- [React Aria Combobox Blog](https://react-spectrum.adobe.com/blog/building-a-combobox.html) - Live region patterns

### Tertiary (LOW confidence)
- [Sarah Higley on aria-activedescendant](https://sarahmhigley.com/writing/activedescendant/) - Mobile limitations
- [WebKit Bug 231724](https://bugs.webkit.org/show_bug.cgi?id=231724) - VoiceOver issues

### Prior Research (HIGH confidence)
- `.planning/research/STACK-SELECT.md` - Stack decisions
- `.planning/research/FEATURES-SELECT.md` - Feature prioritization
- `.planning/research/PITFALLS-SELECT.md` - Comprehensive pitfall analysis
- `.planning/phases/31-select-infrastructure/31-RESEARCH.md` - Phase 31 infrastructure

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Phase 31 established Floating UI integration
- Architecture: HIGH - W3C APG provides exact specification
- Pitfalls: HIGH - Prior research thoroughly documented
- Code examples: HIGH - Based on existing LitUI patterns

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable ARIA patterns)
