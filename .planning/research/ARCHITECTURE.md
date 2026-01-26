# Architecture Research: Select Component

**Domain:** Select/Combobox component for LitUI component library
**Researched:** 2026-01-26
**Confidence:** HIGH (based on existing codebase patterns, W3C APG, and Lit documentation)

## Executive Summary

The Select component should follow LitUI's established patterns: leverage native browser capabilities where possible, use ElementInternals for form participation, and maintain SSR compatibility via `isServer` guards. The key architectural decision is whether to use native `<select>` (limited styling) or build a custom select using the Popover API + CSS Anchor Positioning (modern, accessible, styleable).

**Recommendation:** Build a custom select using the **Popover API** (baseline available April 2025) combined with **CSS Anchor Positioning** for dropdown placement. This follows LitUI's pattern of leveraging native browser capabilities (similar to Dialog using native `<dialog>`) while providing full styling control.

---

## Component Structure

### Recommended Component Composition

```
lui-select (main component)
  |
  +-- lui-option (option items)
  |
  +-- lui-option-group (optional grouping)
```

**Three components** with clear responsibilities:

| Component | Responsibility | API Style |
|-----------|---------------|-----------|
| `lui-select` | Container, form participation, keyboard navigation, state management | Properties + events |
| `lui-option` | Individual option item, displays label/value, handles selection | Slot-based content |
| `lui-option-group` | Groups options with optional label header | Slot-based content |

### Why Slot-Based Options (Not Attribute-Based)

**Slot-based (recommended):**
```html
<lui-select>
  <lui-option value="us">United States</lui-option>
  <lui-option value="ca">Canada</lui-option>
</lui-select>
```

**Attribute-based (not recommended):**
```html
<lui-select options='[{"value":"us","label":"United States"}]'></lui-select>
```

**Rationale for slot-based:**
1. **Declarative HTML** - Options are visible in markup, better for SSR
2. **Rich content** - Options can contain icons, badges, descriptions
3. **Framework agnostic** - Works naturally with any templating system
4. **Accessibility** - Screen readers can enumerate options from DOM
5. **Consistency** - Matches native `<select>` / `<option>` pattern
6. **Dynamic updates** - Lit's MutationObserver can detect slot changes

**Attribute-based options** should be supported as a convenience for simple cases but not be the primary API.

### Component Hierarchy

```typescript
// lui-select.ts
export class Select extends TailwindElement {
  static formAssociated = true;

  @property() value: string | string[] = '';
  @property() multiple = false;
  @property() placeholder = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) open = false;
  @property({ type: Boolean }) searchable = false; // For combobox variant

  // Slot collects lui-option elements
  @queryAssignedElements({ selector: 'lui-option' })
  private options!: Array<HTMLElement>;
}

// lui-option.ts
export class Option extends TailwindElement {
  @property() value = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean, reflect: true }) selected = false;

  // Default slot for label content
}

// lui-option-group.ts
export class OptionGroup extends TailwindElement {
  @property() label = '';
  @property({ type: Boolean }) disabled = false;

  // Default slot for lui-option children
}
```

---

## Data Flow

### State Ownership

```
┌─────────────────────────────────────────────────────────────────┐
│  lui-select (owns all state)                                    │
│                                                                 │
│  State:                                                         │
│  - value: string | string[] (selected value(s))                │
│  - open: boolean (dropdown visibility)                          │
│  - activeDescendant: string (focused option ID for keyboard)   │
│  - searchQuery: string (if searchable)                          │
│  - loading: boolean (if async)                                  │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │ lui-option  │     │ lui-option  │     │ lui-option  │       │
│  │ (stateless) │     │ (stateless) │     │ (stateless) │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│        ↑                   ↑                   ↑                │
│        └───────────────────┴───────────────────┘                │
│                 Selected state derived from                     │
│                 parent's value property                         │
└─────────────────────────────────────────────────────────────────┘
```

### Selection Flow

```
User clicks option
       │
       ▼
┌──────────────────┐
│ Option dispatches│
│ 'option-select'  │
│ event (bubbles)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Select catches   │
│ event, updates   │
│ value property   │
└────────┬─────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌──────────────────┐               ┌──────────────────┐
│ Select dispatches│               │ ElementInternals │
│ 'change' event   │               │ setFormValue()   │
│ (for consumers)  │               │ (form sync)      │
└──────────────────┘               └──────────────────┘
```

### Async Loading Flow

For dynamic/searchable selects with server-side data:

```typescript
// Using Lit's Task controller for async loading
import { Task } from '@lit/task';

class Select extends TailwindElement {
  @property() searchable = false;
  @property() loadOptions?: (query: string) => Promise<OptionData[]>;

  @state() private searchQuery = '';

  // Task controller manages async state
  private _optionsTask = new Task(this, {
    task: async ([query], { signal }) => {
      if (!this.loadOptions) return [];
      return this.loadOptions(query);
    },
    args: () => [this.searchQuery],
    autoRun: false, // Manual trigger on search
  });

  render() {
    return html`
      <div class="listbox">
        ${this._optionsTask.render({
          pending: () => html`<div class="loading">Loading...</div>`,
          complete: (options) => options.map(opt =>
            html`<div role="option">${opt.label}</div>`
          ),
          error: () => html`<div class="error">Failed to load</div>`,
        })}
        <!-- Slotted options always rendered -->
        <slot></slot>
      </div>
    `;
  }
}
```

---

## Positioning Strategy

### Recommended: Popover API + CSS Anchor Positioning

**Why Popover API:**
- Baseline widely available since April 2025
- Automatic top-layer placement (no z-index management)
- Built-in light dismiss (click outside closes)
- Built-in focus management
- Built-in Escape key handling
- Works with Declarative Shadow DOM for SSR

**Why CSS Anchor Positioning:**
- Native browser positioning relative to trigger element
- Automatic flip when insufficient space
- No JavaScript calculations needed
- Works with Popover API

### Implementation Pattern

```html
<!-- Inside lui-select shadow DOM -->
<button
  id="trigger"
  popovertarget="listbox"
  aria-expanded="${this.open}"
  aria-controls="listbox"
>
  <span class="selected-value">${this.displayValue}</span>
  <svg class="chevron">...</svg>
</button>

<div
  id="listbox"
  popover="auto"
  role="listbox"
  anchor="trigger"
  class="dropdown"
>
  <slot></slot>
</div>

<style>
  .dropdown {
    /* Anchor to trigger button */
    position-anchor: --select-trigger;

    /* Position below trigger, flip if needed */
    inset-area: block-end;
    position-try-options: flip-block;

    /* Match trigger width */
    min-width: anchor-size(width);
    max-height: 300px;
    overflow-y: auto;
  }

  #trigger {
    anchor-name: --select-trigger;
  }
</style>
```

### Fallback Strategy

For older browsers without CSS Anchor Positioning, use Floating UI as a progressive enhancement:

```typescript
import { computePosition, flip, offset, size } from '@floating-ui/dom';

private async positionDropdown() {
  if (CSS.supports('anchor-name: --test')) {
    // Native anchor positioning available, CSS handles it
    return;
  }

  // Fallback to Floating UI
  const { x, y } = await computePosition(
    this.triggerEl,
    this.dropdownEl,
    {
      placement: 'bottom-start',
      middleware: [
        offset(4),
        flip(),
        size({
          apply({ availableHeight, elements }) {
            elements.floating.style.maxHeight = `${Math.min(300, availableHeight)}px`;
          },
        }),
      ],
    }
  );

  this.dropdownEl.style.left = `${x}px`;
  this.dropdownEl.style.top = `${y}px`;
}
```

---

## Keyboard Navigation

### State Machine for Keyboard Interactions

```
                    ┌─────────────┐
                    │   CLOSED    │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
      Enter/Space     Down Arrow        Alt+Down
          │                │                │
          ▼                ▼                ▼
    ┌───────────────────────────────────────────┐
    │                  OPEN                      │
    │                                            │
    │  ┌─────────────────────────────────────┐  │
    │  │    Focus on activeDescendant        │  │
    │  │                                     │  │
    │  │  Down Arrow → next option           │  │
    │  │  Up Arrow → previous option         │  │
    │  │  Home → first option                │  │
    │  │  End → last option                  │  │
    │  │  Type char → type-ahead search      │  │
    │  │                                     │  │
    │  │  Enter/Space → select & close       │  │
    │  │  Escape → close without selecting   │  │
    │  │  Tab → close & move focus           │  │
    │  └─────────────────────────────────────┘  │
    │                                            │
    └────────────────────────────────────────────┘
                           │
                     Escape/Tab/Select
                           │
                           ▼
                    ┌─────────────┐
                    │   CLOSED    │
                    └─────────────┘
```

### Implementation

```typescript
class Select extends TailwindElement {
  @state() private activeIndex = -1;

  private handleKeyDown(e: KeyboardEvent) {
    const options = this.getVisibleOptions();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this.open) {
          this.open = true;
          this.activeIndex = 0;
        } else {
          this.activeIndex = Math.min(this.activeIndex + 1, options.length - 1);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (this.open) {
          this.activeIndex = Math.max(this.activeIndex - 1, 0);
        }
        break;

      case 'Home':
        e.preventDefault();
        if (this.open) this.activeIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        if (this.open) this.activeIndex = options.length - 1;
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this.open && this.activeIndex >= 0) {
          this.selectOption(options[this.activeIndex]);
          this.open = false;
        } else {
          this.open = true;
        }
        break;

      case 'Escape':
        if (this.open) {
          e.preventDefault();
          this.open = false;
        }
        break;

      case 'Tab':
        if (this.open) {
          this.open = false;
          // Let default tab behavior proceed
        }
        break;

      default:
        // Type-ahead: single character search
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          this.handleTypeAhead(e.key);
        }
    }
  }

  private typeAheadBuffer = '';
  private typeAheadTimeout: number | null = null;

  private handleTypeAhead(char: string) {
    // Clear existing timeout
    if (this.typeAheadTimeout) clearTimeout(this.typeAheadTimeout);

    // Accumulate characters typed in quick succession
    this.typeAheadBuffer += char.toLowerCase();

    // Find matching option
    const options = this.getVisibleOptions();
    const matchIndex = options.findIndex(opt =>
      opt.textContent?.toLowerCase().startsWith(this.typeAheadBuffer)
    );

    if (matchIndex >= 0) {
      this.activeIndex = matchIndex;
      if (!this.open) this.open = true;
    }

    // Clear buffer after 500ms of no typing
    this.typeAheadTimeout = window.setTimeout(() => {
      this.typeAheadBuffer = '';
    }, 500);
  }
}
```

### ARIA Implementation

```typescript
render() {
  const activeOption = this.options[this.activeIndex];
  const activeId = activeOption?.id || '';

  return html`
    <div
      role="combobox"
      aria-expanded="${this.open}"
      aria-haspopup="listbox"
      aria-controls="listbox"
      aria-activedescendant="${this.open ? activeId : ''}"
      tabindex="0"
      @keydown=${this.handleKeyDown}
    >
      ...
    </div>

    <div
      id="listbox"
      role="listbox"
      aria-label="${this.label}"
      popover="auto"
    >
      <slot @slotchange=${this.handleSlotChange}></slot>
    </div>
  `;
}
```

---

## SSR Considerations

### What Works Naturally

1. **Popover API with Declarative Shadow DOM** - The `popover` attribute is declarative HTML
2. **ARIA attributes** - Static attributes render correctly during SSR
3. **Slot-based options** - Children are in light DOM, render server-side
4. **CSS-only initial state** - Dropdown closed by default via CSS

### What Needs Guards

```typescript
class Select extends TailwindElement {
  static formAssociated = true;
  private internals: ElementInternals | null = null;

  constructor() {
    super();
    // Guard: attachInternals not available during SSR
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  // Guard: positioning calculations require DOM
  private positionDropdown() {
    if (isServer) return;
    // ... positioning logic
  }

  // Guard: Floating UI fallback is client-only
  override connectedCallback() {
    super.connectedCallback();
    if (isServer) return;

    // Initialize Floating UI if needed
    if (!CSS.supports('anchor-name: --test')) {
      this.initFloatingUI();
    }
  }
}
```

### SSR-Safe Patterns from Existing Components

Following Input/Textarea pattern:
```typescript
// From input.ts - Pattern to follow
constructor() {
  super();
  // Only attach internals on client (not during SSR)
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}
```

### Hydration Considerations

The Select component should hydrate cleanly because:
1. Initial state (closed dropdown) matches SSR output
2. Event listeners attach during `connectedCallback`
3. No DOM manipulation required until user interaction
4. `aria-activedescendant` only populated after keyboard interaction

---

## Build Order

### Phase 1: Core Select (Foundation)

**Goal:** Basic select with slot-based options, form participation, keyboard navigation

1. **lui-option component** (no dependencies)
   - Value/label properties
   - Selected state (visual only, parent manages)
   - Disabled state
   - Emits selection events

2. **lui-select component** (depends on lui-option)
   - Trigger button with selected value display
   - Popover-based dropdown using `popover="auto"`
   - Single-select value management
   - ElementInternals form participation
   - Full keyboard navigation
   - ARIA combobox pattern

3. **lui-option-group component** (depends on lui-option)
   - Groups options with label header
   - Disables all children when group disabled

**Deliverable:** Working single-select with keyboard navigation and form participation

### Phase 2: Positioning & Polish

**Goal:** Reliable dropdown positioning across all layouts

4. **CSS Anchor Positioning**
   - Native positioning when supported
   - Floating UI fallback integration
   - Position flipping when near viewport edge
   - Width matching to trigger

5. **Styling & Theming**
   - CSS custom properties for all visual tokens
   - Size variants (sm, md, lg) matching Input
   - Focus ring consistent with other components
   - Dark mode support

**Deliverable:** Production-ready visual component with reliable positioning

### Phase 3: Multi-Select Variant

**Goal:** Support multiple selection

6. **Multi-select mode**
   - `multiple` property enables multi-select
   - Checkbox rendering in options
   - Array value handling
   - Tags/chips display in trigger
   - Shift+click range selection
   - Ctrl/Cmd+A select all

**Deliverable:** Multi-select variant

### Phase 4: Searchable/Combobox Variant

**Goal:** Type-to-filter and async loading support

7. **Searchable mode**
   - `searchable` property enables text input
   - Filter options by search query
   - Highlight matching text in options
   - Clear search on selection

8. **Async loading**
   - `loadOptions` callback property
   - Task controller for loading state
   - Loading indicator in dropdown
   - Debounced search requests

**Deliverable:** Full combobox with async support

### Phase 5: Advanced Features (Future)

9. **Virtual scrolling** (for 1000+ options)
10. **Creatable options** (add new values)
11. **Nested/tree select**

---

## Summary

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Component composition** | Select + Option + OptionGroup | Follows native pattern, enables rich content |
| **Options API** | Slot-based primary, attribute backup | Declarative, SSR-friendly, framework agnostic |
| **Dropdown positioning** | Popover API + CSS Anchor | Baseline available, native browser capability |
| **Positioning fallback** | Floating UI | Mature library, covers older browsers |
| **Form participation** | ElementInternals | Consistent with Input/Textarea pattern |
| **Keyboard navigation** | ARIA combobox pattern | W3C APG compliance |
| **Async loading** | Lit Task controller | Official Lit pattern for async state |
| **State management** | Select owns all state | Single source of truth, options are stateless |

### Integration Points with Existing Components

| Component | Integration |
|-----------|-------------|
| TailwindElement | Base class for all Select components |
| tailwindBaseStyles | Include in static styles for SSR |
| CSS tokens | Use `--ui-select-*` custom properties |
| Input patterns | Match size variants (sm, md, lg) |
| Dialog patterns | Similar popover/overlay handling |
| Button patterns | Similar focus ring, disabled states |

### New vs Modified Components

| Type | Component | Notes |
|------|-----------|-------|
| NEW | `@lit-ui/select` package | New package following monorepo structure |
| NEW | `lui-select` | Main select component |
| NEW | `lui-option` | Option item component |
| NEW | `lui-option-group` | Optional grouping component |
| MODIFY | `@lit-ui/core` tokens | Add `--ui-select-*` CSS custom properties |
| MODIFY | Docs app | Add Select documentation page |

---

## Sources

- [W3C ARIA APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) - Accessibility requirements
- [W3C ARIA APG Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) - Keyboard navigation requirements
- [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) - Native popover documentation
- [Floating UI Documentation](https://floating-ui.com/) - Positioning fallback library
- [Lit Task Controller](https://lit.dev/docs/data/task/) - Async data loading pattern
- [Lit Reactive Controllers](https://lit.dev/docs/composition/controllers/) - Controller architecture
- [Orange A11y Listbox Keyboard Navigation](https://a11y-guidelines.orange.com/en/articles/listbox-and-keyboard-navigation/) - Keyboard patterns
- [Frontend Masters Popover API Guide](https://frontendmasters.com/blog/menus-toasts-and-more/) - Modern popover patterns
- [Hidde de Vries - Positioning Anchored Popovers](https://hidde.blog/positioning-anchored-popovers/) - CSS Anchor Positioning
- Existing codebase analysis:
  - `/packages/input/src/input.ts` - Form participation pattern
  - `/packages/dialog/src/dialog.ts` - Popover/overlay pattern
  - `/packages/core/src/tailwind-element.ts` - Base class pattern
