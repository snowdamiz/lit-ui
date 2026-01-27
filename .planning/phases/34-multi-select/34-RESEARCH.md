# Phase 34: Multi-Select - Research

**Researched:** 2026-01-26
**Domain:** Multi-select dropdown component (Lit web component)
**Confidence:** HIGH

## Summary

Phase 34 extends the single-select foundation from Phase 32 to support multiple selections. The key technical challenges are: (1) displaying multiple selections as removable tags/chips in the trigger area, (2) handling tag overflow with "+N more" indicator using ResizeObserver, (3) proper FormData submission with multiple values, and (4) adapting keyboard interactions for multi-select semantics.

The existing lui-select component provides a solid foundation with dropdown positioning (Floating UI), keyboard navigation, ARIA patterns, and form participation via ElementInternals. Multi-select requires extending these patterns rather than rebuilding from scratch.

**Primary recommendation:** Extend lui-select with a `multiple` boolean prop that switches behavior to multi-select mode. Use ResizeObserver for dynamic tag overflow calculation. Submit form values via repeated FormData.append() calls.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | 3.x | Web component base | Already in use, provides reactive properties |
| @floating-ui/dom | 1.x | Dropdown positioning | Already integrated from Phase 32 |
| ResizeObserver (native) | N/A | Tag overflow calculation | Native browser API, no library needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | - | No additional libraries needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ResizeObserver | Fixed tag count | Less flexible, doesn't adapt to container width |
| FormData.append() | JSON.stringify(array) | Non-standard, requires server parsing |
| Inline tags | External tag list | Different UX pattern, more complex DOM |

**Installation:** No new dependencies required.

## Architecture Patterns

### Recommended Component Structure

```
packages/select/src/
├── select.ts        # Extend with multiple prop and multi-select logic
├── option.ts        # Add checkbox indicator for multi-select
├── option-group.ts  # No changes needed
└── index.ts         # Export existing components
```

### Pattern 1: Multi-Select Prop Mode Switching

**What:** Single `multiple` prop controls behavior mode
**When to use:** Component API design for mode variants

```typescript
// Source: W3C APG multi-select listbox pattern
@property({ type: Boolean })
multiple = false;

// Mode-specific behavior in methods
private selectOption(index: number): void {
  if (this.multiple) {
    // Toggle selection, keep dropdown open
    this.toggleSelection(index);
  } else {
    // Replace selection, close dropdown
    this.value = option.value;
    this.closeDropdown();
  }
}
```

### Pattern 2: Array Value Management

**What:** Value property becomes string[] in multi-select mode
**When to use:** Storing multiple selections

```typescript
// Source: Standard multi-select patterns
// Internal storage
@state()
private selectedValues: Set<string> = new Set();

// Public value getter adapts to mode
get value(): string | string[] {
  if (this.multiple) {
    return Array.from(this.selectedValues);
  }
  return this._singleValue;
}

set value(val: string | string[]) {
  if (this.multiple && Array.isArray(val)) {
    this.selectedValues = new Set(val);
  } else if (!this.multiple && typeof val === 'string') {
    this._singleValue = val;
  }
}
```

### Pattern 3: Tag Overflow with ResizeObserver

**What:** Dynamically calculate visible tags based on available width
**When to use:** "+N more" overflow display

```typescript
// Source: ResizeObserver API best practices
private resizeObserver: ResizeObserver | null = null;

@state()
private visibleTagCount: number = Infinity;

connectedCallback() {
  super.connectedCallback();
  if (!isServer) {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        this.calculateVisibleTags(width);
      }
    });
    // Observe after first render
    this.updateComplete.then(() => {
      const tagContainer = this.shadowRoot?.querySelector('.tag-container');
      if (tagContainer) {
        this.resizeObserver?.observe(tagContainer);
      }
    });
  }
}

disconnectedCallback() {
  super.disconnectedCallback();
  this.resizeObserver?.disconnect();
}

private calculateVisibleTags(containerWidth: number): void {
  // Measure actual tag widths and determine how many fit
  const tags = this.shadowRoot?.querySelectorAll('.tag');
  let totalWidth = 0;
  let count = 0;
  const moreButtonWidth = 60; // Reserve space for "+N more"

  for (const tag of tags || []) {
    const tagWidth = tag.getBoundingClientRect().width + 4; // + gap
    if (totalWidth + tagWidth + moreButtonWidth > containerWidth) {
      break;
    }
    totalWidth += tagWidth;
    count++;
  }

  this.visibleTagCount = count > 0 ? count : 1; // At least show 1
}
```

### Pattern 4: FormData Multiple Values

**What:** Use FormData.append() for each selected value
**When to use:** Form submission with multiple selections

```typescript
// Source: MDN FormData.append() documentation
// When value changes in multi-select mode
private updateFormValue(): void {
  if (!this.internals) return;

  if (this.multiple) {
    // Create FormData with multiple values
    const formData = new FormData();
    for (const val of this.selectedValues) {
      formData.append(this.name, val);
    }
    this.internals.setFormValue(formData);
  } else {
    this.internals.setFormValue(this._singleValue);
  }
}
```

### Pattern 5: Checkbox Indicator for Options

**What:** Show checkbox visual instead of checkmark in multi-select mode
**When to use:** Option selection indicator (MULTI-02)

```typescript
// In lui-option render method
private renderSelectionIndicator() {
  // Check if parent is multi-select (via CSS custom property or attribute)
  const isMulti = this.closest('lui-select')?.hasAttribute('multiple');

  if (isMulti) {
    return html`
      <span class="checkbox-indicator ${this.selected ? 'checked' : ''}">
        ${this.selected ? html`
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 8l4 4 6-7"/>
          </svg>
        ` : nothing}
      </span>
    `;
  }

  // Single-select checkmark (existing pattern)
  return this.selected ? html`
    <svg class="check-icon" viewBox="0 0 16 16">
      <path d="M3 8l4 4 6-7"/>
    </svg>
  ` : nothing;
}
```

### Anti-Patterns to Avoid

- **Closing dropdown on multi-select:** Keep dropdown open so user can make multiple selections without reopening
- **Using set() instead of append() for FormData:** FormData.set() overwrites previous values, use append() for multiple
- **Fixed tag count:** Don't hardcode "show 3 tags max" - use ResizeObserver for responsive overflow
- **Checkbox as input element:** Don't add actual `<input type="checkbox">` - it breaks focus management; use visual-only indicator

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown positioning | Custom position logic | @floating-ui/dom | Already integrated, handles edge cases |
| Container width observation | window resize listener | ResizeObserver | Per-element accuracy, not window-level |
| Keyboard navigation | Custom key handling | Extend existing | Phase 32 already has robust implementation |
| Form value submission | Custom serialization | FormData.append() | Native browser API, server-compatible |

**Key insight:** Multi-select is an extension of single-select, not a separate component. Reuse Phase 32 foundation.

## Common Pitfalls

### Pitfall 1: Tag Overflow Layout Thrashing

**What goes wrong:** ResizeObserver callback triggers layout, causing infinite loop
**Why it happens:** Changing visible tag count causes container resize
**How to avoid:** Use requestAnimationFrame to defer DOM changes; set explicit container dimensions
**Warning signs:** Browser DevTools shows constant layout recalculation, jerky UI

### Pitfall 2: FormData Value Format Server Expectations

**What goes wrong:** Server receives unexpected format (comma-separated vs multiple entries)
**Why it happens:** Different servers expect different multi-value formats
**How to avoid:** Document that FormData.getAll(name) retrieves array on server; this is the standard approach
**Warning signs:** Server logs show single concatenated string instead of array

### Pitfall 3: ARIA Multi-Select State

**What goes wrong:** Screen reader announces single selection behavior
**Why it happens:** Missing aria-multiselectable="true" on listbox
**How to avoid:** Set aria-multiselectable on listbox element when multiple prop is true
**Warning signs:** VoiceOver announces "1 of N" instead of checkbox states

### Pitfall 4: Value Property Type Confusion

**What goes wrong:** TypeScript errors or runtime bugs from string vs string[] mismatch
**Why it happens:** Same property has different types based on mode
**How to avoid:** Use union type `value: string | string[]` with runtime checks; document behavior
**Warning signs:** Console errors about array methods on string or string methods on array

### Pitfall 5: Select All with Groups

**What goes wrong:** "Select All" selects disabled options or ignores groups
**Why it happens:** Naive implementation iterates all options
**How to avoid:** Filter to only enabled options; respect group boundaries if scoped select-all is needed
**Warning signs:** Disabled options become selected; group-specific select-all affects other groups

## Code Examples

Verified patterns from official sources:

### Multi-Select ARIA Attributes

```typescript
// Source: W3C APG Listbox Pattern
// On the listbox element
role="listbox"
aria-multiselectable="true"
aria-label="${this.label}"

// On each option
role="option"
aria-selected="${this.selectedValues.has(option.value) ? 'true' : 'false'}"
```

### Tag Chip Styling

```css
/* Source: CONTEXT.md decisions - pill-shaped, filled background */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background-color: var(--ui-select-tag-bg, var(--color-secondary));
  color: var(--ui-select-tag-text, var(--color-secondary-foreground));
  border-radius: var(--radius-full); /* Pill shape */
  font-size: 0.875em;
  max-width: 100%;
  overflow: hidden;
}

.tag-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: currentColor;
  cursor: pointer;
  opacity: 0.7;
  flex-shrink: 0;
}

.tag-remove:hover {
  opacity: 1;
}
```

### Keyboard Interaction for Multi-Select

```typescript
// Source: W3C APG Multi-Select Listbox
// In handleKeydown method
case ' ':
  e.preventDefault();
  if (this.multiple) {
    // Space toggles selection without closing
    this.toggleSelection(this.activeIndex);
  } else {
    // Single select: select and close
    this.selectOption(this.activeIndex);
  }
  break;

case 'Enter':
  e.preventDefault();
  if (this.multiple) {
    // In multi-select, Enter closes dropdown (selection via Space)
    this.closeDropdown();
  } else {
    this.selectOption(this.activeIndex);
  }
  break;
```

### Select All / Clear All Implementation

```typescript
// Source: W3C APG recommends separate controls for select/deselect all
private selectAll(): void {
  const enabledOptions = this.effectiveOptions.filter(o => !o.disabled);
  this.selectedValues = new Set(enabledOptions.map(o => o.value));
  this.updateFormValue();
  this.requestUpdate();
}

private deselectAll(): void {
  this.selectedValues.clear();
  this.updateFormValue();
  this.requestUpdate();
}

// Render select/deselect all actions
private renderSelectAllActions() {
  if (!this.multiple || !this.showSelectAll) return nothing;

  const enabledCount = this.effectiveOptions.filter(o => !o.disabled).length;
  const allSelected = this.selectedValues.size === enabledCount;

  return html`
    <div class="select-all-actions">
      <button
        type="button"
        @click=${allSelected ? this.deselectAll : this.selectAll}
      >
        ${allSelected ? 'Clear all' : 'Select all'}
      </button>
    </div>
  `;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| aria-checked for multi-select | aria-selected consistently | ARIA 1.1+ | Use aria-selected for all listbox options, regardless of single/multi |
| window.onresize for responsive | ResizeObserver | 2020+ (Baseline) | Per-element observation, more accurate |
| Custom form serialization | ElementInternals + FormData | 2021+ | Native form participation for web components |

**Deprecated/outdated:**
- aria-owns: Replaced by aria-controls in ARIA 1.2 combobox pattern (already applied in Phase 32)
- contentRect in ResizeObserver: Still works but prefer contentBoxSize for future compatibility

## Open Questions

Things that couldn't be fully resolved:

1. **X button visibility (always vs hover)**
   - What we know: CONTEXT.md leaves to Claude's discretion; Gmail shows always, some UIs show on hover
   - What's unclear: User preference for touch devices (hover doesn't work)
   - Recommendation: Show X button always for accessibility and touch support; can add token for hiding if requested

2. **Popover removal capability for "+N more"**
   - What we know: CONTEXT.md leaves to Claude's discretion; mature UIs like MUI allow removal from popover
   - What's unclear: Implementation complexity vs UX benefit
   - Recommendation: Start without removal from popover (simpler); add if requested in verification

3. **Validation scope (min/max counts)**
   - What we know: required + maxSelections from prop recommended in CONTEXT.md
   - What's unclear: Whether to add minSelections or complex validation
   - Recommendation: Implement required (at least 1 when set) and maxSelections prop; skip minSelections for v1

## CSS Tokens Needed

New tokens for multi-select tag styling (extend existing `--ui-select-*` namespace):

```css
/* Tag/chip styling */
--ui-select-tag-bg: var(--color-secondary, var(--ui-color-secondary));
--ui-select-tag-text: var(--color-secondary-foreground, var(--ui-color-secondary-foreground));
--ui-select-tag-gap: 0.25rem;

/* Checkbox indicator (option left side) */
--ui-select-checkbox-border: var(--color-border, var(--ui-color-border));
--ui-select-checkbox-bg-checked: var(--color-primary, var(--ui-color-primary));
--ui-select-checkbox-check: white;
```

## Sources

### Primary (HIGH confidence)
- [W3C WAI-ARIA APG Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) - Multi-select keyboard interaction, ARIA attributes
- [MDN aria-multiselectable](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-multiselectable) - ARIA attribute usage
- [MDN FormData.append()](https://developer.mozilla.org/en-US/docs/Web/API/FormData/append) - Multiple value submission
- [MDN ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) - Element size observation API
- Existing codebase: packages/select/src/select.ts - Phase 32 foundation patterns

### Secondary (MEDIUM confidence)
- [Lit Reactive Controllers](https://lit.dev/docs/composition/controllers/) - ResizeObserver integration pattern
- [Material Design Chips Guidelines](https://m3.material.io/components/chips/guidelines) - Tag/chip design patterns
- [web.dev ResizeObserver article](https://web.dev/articles/resize-observer) - Practical implementation guidance

### Tertiary (LOW confidence)
- Various blog posts on multi-select overflow patterns (consistent with official sources)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing libraries + native APIs
- Architecture: HIGH - Extending proven Phase 32 patterns
- ARIA patterns: HIGH - Verified against W3C APG
- Tag overflow: MEDIUM - ResizeObserver is standard but calculation logic is custom
- Pitfalls: MEDIUM - Based on common patterns and official docs

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable domain)
