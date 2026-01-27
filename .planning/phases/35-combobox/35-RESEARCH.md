# Phase 35: Combobox - Research

**Researched:** 2026-01-26
**Domain:** Accessible combobox with filtering, text highlighting, and creatable options
**Confidence:** HIGH

## Summary

This research covers implementing an accessible combobox pattern for the existing lui-select component. The combobox extends the current select by adding a text input for filtering options, highlighting matched text, and optionally allowing users to create new options that don't exist in the list.

The W3C APG defines two combobox types: select-only (what lui-select currently implements) and editable (what this phase adds). The key difference is the editable combobox includes an actual text input that both filters the list and can accept typed values. For this implementation, we're adding a "searchable" mode that filters but still requires selection from the list (aria-autocomplete="list"), plus a "creatable" mode for adding new options.

The existing lui-select already has the correct ARIA foundation with role="combobox", aria-controls, aria-expanded, and aria-activedescendant. The main additions are: converting the trigger to an actual input element when searchable=true, implementing client-side filtering with case-insensitive contains matching, rendering highlighted match text with bold styling, and adding a "Create" option at the bottom when creatable=true.

**Primary recommendation:** Add `searchable` prop to lui-select that transforms the trigger from a button-like div to an actual text input, reusing existing keyboard navigation and ARIA patterns while adding filter logic and match highlighting.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | 3.x | Web component framework | Already in use, provides reactive properties and declarative templates |
| @floating-ui/dom | 1.x | Dropdown positioning | Already integrated in lui-select |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native DOM APIs | - | Text selection, input events | For text input handling |
| CSS `font-weight: bold` | - | Match highlighting | Decision from CONTEXT.md |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Bold text for highlight | `<mark>` element with background | User decided bold only in CONTEXT.md |
| Contains matching | Fuzzy matching (fuse.js) | Over-engineered for this use case; contains is clearer |
| Inline autocomplete | List-only autocomplete | Inline is complex (text selection management); list-only is sufficient |

**Installation:**
```bash
# No additional dependencies needed
# Uses existing Lit and @floating-ui/dom
```

## Architecture Patterns

### Component Structure Changes

The lui-select component needs these additions for searchable mode:

```
lui-select (searchable)
├── input[type="text"]      # Replaces div trigger when searchable
│   ├── role="combobox"     # Same ARIA role
│   ├── aria-autocomplete="list"
│   └── @input handler for filtering
├── dropdown (existing)
│   ├── filtered options with highlighted text
│   ├── "No results found" empty state
│   └── "Create 'xyz'" option (if creatable)
└── existing keyboard navigation
```

### Pattern 1: Filter Function with Match Indices

**What:** Filter function returns both matched options and match positions for highlighting
**When to use:** When filtering options and need to highlight matches
**Example:**
```typescript
// Source: Custom pattern based on research
interface FilterMatch {
  option: SelectOption;
  matchIndices: [start: number, end: number][];
}

function filterOptions(
  options: SelectOption[],
  query: string,
  customFilter?: (option: SelectOption, query: string) => boolean
): FilterMatch[] {
  if (!query) return options.map(o => ({ option: o, matchIndices: [] }));

  const lowerQuery = query.toLowerCase();
  const results: FilterMatch[] = [];

  for (const option of options) {
    // Use custom filter if provided
    if (customFilter) {
      if (customFilter(option, query)) {
        results.push({ option, matchIndices: findAllMatches(option.label, lowerQuery) });
      }
      continue;
    }

    // Default: case-insensitive contains
    const lowerLabel = option.label.toLowerCase();
    if (lowerLabel.includes(lowerQuery)) {
      results.push({ option, matchIndices: findAllMatches(option.label, lowerQuery) });
    }
  }

  return results;
}

function findAllMatches(text: string, query: string): [number, number][] {
  const matches: [number, number][] = [];
  const lowerText = text.toLowerCase();
  let pos = 0;

  while ((pos = lowerText.indexOf(query, pos)) !== -1) {
    matches.push([pos, pos + query.length]);
    pos += 1; // Allow overlapping matches like "aa" in "aaa"
  }

  return matches;
}
```

### Pattern 2: Highlighted Text Rendering

**What:** Render option label with bold highlighting for matched portions
**When to use:** Rendering filtered options in dropdown
**Example:**
```typescript
// Source: Pattern from research - highlight ALL occurrences
function renderHighlightedLabel(label: string, matchIndices: [number, number][]) {
  if (matchIndices.length === 0) {
    return html`${label}`;
  }

  const parts: TemplateResult[] = [];
  let lastEnd = 0;

  // Sort matches by start position
  const sorted = [...matchIndices].sort((a, b) => a[0] - b[0]);

  for (const [start, end] of sorted) {
    // Add text before match
    if (start > lastEnd) {
      parts.push(html`${label.slice(lastEnd, start)}`);
    }
    // Add highlighted match
    parts.push(html`<strong class="highlight">${label.slice(start, end)}</strong>`);
    lastEnd = end;
  }

  // Add remaining text
  if (lastEnd < label.length) {
    parts.push(html`${label.slice(lastEnd)}`);
  }

  return html`${parts}`;
}
```

### Pattern 3: Create Option Rendering

**What:** Render a special "Create" option when no exact match and creatable is enabled
**When to use:** When user types a value that doesn't exist in options
**Example:**
```typescript
// Source: React-Select Creatable pattern
function renderCreateOption(inputValue: string) {
  return html`
    <div
      class="option option-create"
      role="option"
      aria-selected="false"
      @click=${() => this.handleCreate(inputValue)}
    >
      <svg class="plus-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Create "${inputValue}"</span>
    </div>
  `;
}
```

### Pattern 4: Input Event Handling in Searchable Mode

**What:** Handle text input while maintaining combobox keyboard navigation
**When to use:** When searchable prop is enabled
**Example:**
```typescript
// Source: Lit events documentation + W3C APG
private handleInput(e: InputEvent): void {
  const input = e.target as HTMLInputElement;
  this.filterQuery = input.value;

  // Auto-open dropdown when typing starts
  if (!this.open && this.filterQuery) {
    this.openDropdown();
  }

  // Reset active index to first match
  this.activeIndex = this.findFirstEnabledIndex();

  this.requestUpdate();
}

private handleKeydown(e: KeyboardEvent): void {
  // Existing keyboard navigation, with additions for input:

  if (this.searchable && this.open) {
    // Let printable characters go to input (default behavior)
    if (this.isPrintableCharacter(e.key)) {
      return; // Don't prevent default - let input handle it
    }

    // Backspace/Delete: let input handle it
    if (e.key === 'Backspace' || e.key === 'Delete') {
      return;
    }
  }

  // Existing arrow key navigation, Enter, Escape, etc.
  // ...
}
```

### Anti-Patterns to Avoid

- **Inline autocomplete for simple filtering:** aria-autocomplete="both" requires managing text selection, cursor position, and completion strings. For basic filtering, aria-autocomplete="list" is sufficient and much simpler.

- **Filtering options on the server for small option sets:** For local options under ~1000 items, client-side filtering is instant. Only use async/server filtering for large datasets (Phase 36).

- **Debouncing local filter:** Local filtering is synchronous and fast. Only debounce when filtering triggers network requests or expensive computations.

- **Manipulating DOM directly for highlighting:** Use Lit's template system to render highlighted text. Don't use innerHTML or manual DOM manipulation.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown positioning | Manual position calculations | @floating-ui/dom (already used) | Handles viewport overflow, scrolling, flipping |
| Keyboard navigation | Custom focus management | Existing lui-select pattern | Already implements W3C APG, tested |
| ARIA live announcements | Custom announcement system | Existing ARIA live region | Already solves iOS VoiceOver issues |
| Form participation | Custom form handling | ElementInternals (already used) | Native form integration |

**Key insight:** The existing lui-select already has robust keyboard navigation, ARIA implementation, and form participation. Combobox mode adds filtering logic on top of this foundation rather than replacing it.

## Common Pitfalls

### Pitfall 1: Breaking Keyboard Navigation When Adding Input

**What goes wrong:** When converting trigger to input, arrow keys no longer navigate options - they move the text cursor instead.
**Why it happens:** Input elements have default behavior for arrow keys (cursor movement).
**How to avoid:** In searchable mode with dropdown open, intercept ArrowUp/ArrowDown in keydown handler and call preventDefault() before navigating options. Let Left/Right arrow keys move cursor as expected.
**Warning signs:** Arrow keys don't move through options when dropdown is open.

### Pitfall 2: Filter Clearing Value on Blur

**What goes wrong:** When user selects an option and then clicks away, the filter input shows the filter text instead of the selected label.
**Why it happens:** Input value bound to filter query instead of selected value.
**How to avoid:** On blur or selection, set input value to selected option's label. Store filter query separately from display value.
**Warning signs:** Input shows partial text instead of full selected option label.

### Pitfall 3: Active Index Out of Bounds After Filter

**What goes wrong:** Keyboard navigation breaks after filtering reduces options list.
**Why it happens:** activeIndex was 5 but filtered list only has 3 items.
**How to avoid:** After filtering, clamp activeIndex to valid range or reset to 0.
**Warning signs:** Console errors about accessing undefined option, or keyboard navigation stops working.

### Pitfall 4: Create Option Appearing for Existing Values

**What goes wrong:** "Create 'Apple'" appears even when "Apple" is already in options.
**Why it happens:** Case sensitivity mismatch or checking wrong field (value vs label).
**How to avoid:** Check both label and value with case-insensitive comparison before showing create option.
**Warning signs:** Duplicate options can be created.

### Pitfall 5: ARIA Attributes Conflict in Searchable Mode

**What goes wrong:** Screen readers announce "edit" instead of "combobox" or miss the expanded state.
**Why it happens:** Input element doesn't have proper combobox ARIA attributes, or conflicts with native input semantics.
**How to avoid:** Explicitly set role="combobox" on input, ensure aria-expanded, aria-controls, aria-autocomplete="list" are all present.
**Warning signs:** Screen reader doesn't announce filtered results count or active option.

### Pitfall 6: iOS VoiceOver Double-Tap Issue

**What goes wrong:** Users must double-tap to type in searchable combobox on iOS.
**Why it happens:** VoiceOver requires double-tap to activate focusable elements.
**How to avoid:** This is expected iOS VoiceOver behavior. Ensure the component is announced correctly so users know to double-tap. The existing ARIA live region pattern from Phase 32 helps.
**Warning signs:** User testing on iOS reveals friction with input.

## Code Examples

Verified patterns from official sources:

### Searchable Input Trigger Template

```typescript
// Source: W3C APG Combobox with List Autocomplete
private renderSearchableTrigger() {
  return html`
    <input
      type="text"
      id=${this.selectId}
      class=${this.getTriggerClasses()}
      role="combobox"
      aria-expanded=${this.open ? 'true' : 'false'}
      aria-haspopup="listbox"
      aria-controls=${`${this.selectId}-listbox`}
      aria-autocomplete="list"
      aria-activedescendant=${this.open && this.activeIndex >= 0
        ? `${this.selectId}-option-${this.activeIndex}`
        : ''}
      aria-invalid=${this.showError ? 'true' : nothing}
      placeholder=${this.placeholder}
      .value=${this.open ? this.filterQuery : this.getSelectedLabel()}
      ?disabled=${this.disabled}
      @input=${this.handleInput}
      @keydown=${this.handleKeydown}
      @focus=${this.handleFocus}
      @blur=${this.handleBlur}
    />
  `;
}
```

### Filter Implementation with Debounce (Optional)

```typescript
// Source: Research on debounce timing
// For local filtering, debounce is optional (0ms is fine)
// For preparing async patterns in Phase 36, 150ms is reasonable

private filterTimeout: ReturnType<typeof setTimeout> | null = null;
private static readonly FILTER_DEBOUNCE_MS = 0; // Instant for local

private handleInput(e: InputEvent): void {
  const input = e.target as HTMLInputElement;
  const query = input.value;

  if (this.filterTimeout) {
    clearTimeout(this.filterTimeout);
  }

  if (Select.FILTER_DEBOUNCE_MS === 0) {
    this.applyFilter(query);
  } else {
    this.filterTimeout = setTimeout(() => {
      this.applyFilter(query);
    }, Select.FILTER_DEBOUNCE_MS);
  }
}

private applyFilter(query: string): void {
  this.filterQuery = query;

  // Auto-open on typing
  if (!this.open && query) {
    this.openDropdown();
  }

  // Reset active index
  this.activeIndex = this.filteredOptions.length > 0 ? 0 : -1;
  this.requestUpdate();
}
```

### Skeleton Loading Options

```typescript
// Source: Common UI pattern for loading states
private renderSkeletonOptions(count: number = 3) {
  return html`
    ${Array(count).fill(0).map(() => html`
      <div class="option option-skeleton" aria-hidden="true">
        <span class="skeleton-bar"></span>
      </div>
    `)}
  `;
}

// CSS for skeleton animation
css`
  .option-skeleton {
    pointer-events: none;
  }

  .skeleton-bar {
    display: block;
    height: 1em;
    width: 70%;
    background: var(--ui-select-option-bg-hover);
    border-radius: var(--radius-sm);
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
`
```

### Empty State with Custom Message

```typescript
// Source: Pattern from requirements
private renderEmptyState() {
  return html`
    <div class="empty-state" role="status" aria-live="polite">
      ${this.noResultsMessage || 'No results found'}
    </div>
  `;
}

css`
  .empty-state {
    padding: var(--ui-select-option-padding-y) var(--ui-select-option-padding-x);
    color: var(--ui-select-placeholder);
    text-align: center;
  }
`
```

### Highlight CSS Tokens

```typescript
// Source: CONTEXT.md decision on CSS tokens
css`
  .highlight {
    font-weight: var(--ui-select-highlight-weight, 600);
    color: var(--ui-select-highlight-text, inherit);
  }
`
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| aria-owns for popup reference | aria-controls | ARIA 1.2 (2023) | Already applied in lui-select |
| aria-autocomplete="inline" for completion | aria-autocomplete="list" for filter-only | Ongoing | List is simpler, appropriate for filtering |
| Select-only combobox for all use cases | Editable combobox for searchable | Established | Better UX for large option sets |

**Deprecated/outdated:**
- `aria-owns`: Replaced by aria-controls in ARIA 1.2 (already handled in Phase 32)
- Inline autocomplete for simple filters: Overkill; list autocomplete is sufficient

## Open Questions

Things that couldn't be fully resolved:

1. **Debounce timing for local filtering**
   - What we know: 0ms works fine for local filtering (synchronous), 150-300ms common for async
   - What's unclear: Whether any perceived lag with 0ms on very large local option sets
   - Recommendation: Start with 0ms, configurable via private constant. Phase 36 async will need debounce.

2. **Create option keyboard shortcut**
   - What we know: Enter on create option should work, React-Select allows comma/tab for creation
   - What's unclear: Whether a dedicated shortcut (Ctrl+Enter?) improves UX
   - Recommendation: Enter when create option is focused. Defer special shortcuts to user feedback.

3. **Filter behavior when dropdown closes**
   - What we know: Input should show selected value label when closed
   - What's unclear: Should filter query persist when reopening? Or reset?
   - Recommendation: Reset filter on open (show all options initially), clear on selection.

## Sources

### Primary (HIGH confidence)
- [W3C WAI ARIA APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) - Core ARIA requirements and keyboard patterns
- [W3C APG Editable Combobox with List Autocomplete Example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/) - Reference implementation
- [Lit Events Documentation](https://lit.dev/docs/components/events/) - Event handling patterns for Lit
- Existing lui-select implementation - Validated ARIA patterns and keyboard navigation

### Secondary (MEDIUM confidence)
- [Reach UI Combobox](https://reach.tech/combobox/) - ComboboxOptionText pattern for highlighting
- [React-Select Creatable](https://react-select.com/creatable) - Create option UX patterns
- [Debounce timing research](https://dev.to/raffizulvian/beyond-the-keystrokes-solving-real-time-suggestions-with-debounce-k18) - 250-500ms standard for async

### Tertiary (LOW confidence)
- MDN KeyboardEvent documentation - Verified behavior but general reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing dependencies only
- Architecture: HIGH - Builds on validated lui-select patterns
- Pitfalls: HIGH - Based on W3C APG guidance and existing implementation experience
- Code examples: MEDIUM - Patterns are standard but specific implementation will need validation

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable patterns)
