# Phase 56: Accordion Core - Research

**Researched:** 2026-02-02
**Domain:** Lit.js parent-child web component with W3C APG accordion pattern
**Confidence:** HIGH

## Summary

Phase 56 implements `lui-accordion` (container) and `lui-accordion-item` (child) elements following the established parent-child container pattern from RadioGroup/CheckboxGroup. The W3C ARIA Authoring Practices Guide defines the authoritative accordion pattern with specific keyboard interactions and ARIA attributes. This maps directly to existing codebase patterns: slot-based child discovery, roving tabindex keyboard navigation, disabled state propagation, and CSS custom property theming.

The primary technical challenge is CSS Grid-based height animation (`grid-template-rows: 0fr` to `1fr`), which requires a specific three-layer DOM structure (grid container > overflow wrapper > content). All other patterns are validated copies of RadioGroup with minor adaptations. Zero new dependencies are needed.

**Primary recommendation:** Clone the RadioGroup parent-child architecture. Accordion container discovers items via `slotchange`, owns expand state (string for single-expand, string array for multi-expand), coordinates keyboard navigation, and dispatches `ui-change`. AccordionItem is presentational: renders header button + collapsible panel in shadow DOM, dispatches internal `ui-accordion-toggle` events upward.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | ^3.3.2 | Reactive properties, shadow DOM, lifecycle | Already used across all 15+ components |
| @lit-ui/core | ^1.0.0 | TailwindElement base, dispatchCustomEvent, isServer, tailwindBaseStyles | Standard base for every LitUI component |
| CSS transitions | N/A | Grid-template-rows animation for expand/collapse | Zero-runtime-overhead, consistent with project philosophy |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lit/decorators.js | ^3.3.2 | @property, @state decorators | All reactive properties |
| lit (nothing) | ^3.3.2 | `nothing` sentinel for conditional ARIA attrs | aria-disabled conditional rendering |
| lit (isServer) | ^3.3.2 | SSR guards | firstUpdated slotchange workaround |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Grid 0fr/1fr | max-height hack | Max-height is fragile (must guess max), causes timing glitches, not recommended |
| CSS Grid 0fr/1fr | interpolate-size: allow-keywords | Chromium 129+ only (Feb 2026), not cross-browser. Defer as progressive enhancement |
| CSS Grid 0fr/1fr | WAAPI / JS measurement | Adds runtime overhead, violates zero-dependency philosophy |
| Custom element | Native details/summary | Cannot animate height, Shadow DOM complicates exclusive grouping, breaks APG pattern |

**Installation:**
No new dependencies. Only `@lit-ui/core` (already a workspace dependency).

## Architecture Patterns

### Recommended Project Structure
```
packages/accordion/
  src/
    accordion.ts          # lui-accordion container element
    accordion-item.ts     # lui-accordion-item child element
    index.ts              # Registration, exports, HTMLElementTagNameMap
    jsx.d.ts              # React/Vue/Svelte type declarations
    vite-env.d.ts         # Vite types
  package.json            # @lit-ui/accordion, peer deps on lit + @lit-ui/core
  tsconfig.json
  vite.config.ts          # createLibraryConfig({ entry: 'src/index.ts' })
```

### Pattern 1: Parent-Child Container (from RadioGroup)
**What:** Parent container discovers children via `slotchange`, owns all state, coordinates keyboard navigation. Children are presentational and dispatch internal events.
**When to use:** Any component where a container manages a collection of child elements.
**Example:**
```typescript
// Source: packages/radio/src/radio-group.ts (lines 212-221)
private handleSlotChange(e: Event): void {
  const slot = e.target as HTMLSlotElement;
  const assigned = slot.assignedElements({ flatten: true });
  this.items = assigned.filter(
    (el) => el.tagName === 'LUI-ACCORDION-ITEM'
  ) as AccordionItem[];
  this.syncChildStates();
  this.syncDisabledState();
}
```

### Pattern 2: State Ownership on Parent
**What:** Parent owns `value` (single string for single-expand) or treats it as comma-separated/array for multi-expand. Children receive `expanded` boolean from parent, never manage their own state.
**When to use:** Prevents race conditions in single-expand mode where opening one must close others.
**Example:**
```typescript
// Accordion container manages which items are expanded
// Single-expand: value = "item-1" (one string)
// Multi-expand: value = "item-1,item-3" (comma-separated) or array
@property({ type: String }) value = '';
@property({ type: String, attribute: 'default-value' }) defaultValue = '';
@property({ type: Boolean }) multiple = false;

private get expandedItems(): Set<string> {
  if (!this.value) return new Set();
  return new Set(this.value.split(',').map(v => v.trim()).filter(Boolean));
}
```

### Pattern 3: CSS Grid Height Animation
**What:** Three-layer DOM structure for animating height from 0 to auto using CSS Grid.
**When to use:** Accordion expand/collapse animation.
**Example:**
```typescript
// Source: CSS-Tricks, Stefan Judis, Chrome Developers (verified cross-browser)
// Outer: display: grid with grid-template-rows transition
// Middle: overflow: clip with min-height: 0
// Inner: slotted content

// In AccordionItem shadow DOM:
html`
  <div class="panel-wrapper" style="display: grid; grid-template-rows: ${this.expanded ? '1fr' : '0fr'}">
    <div class="panel-content" style="min-height: 0; overflow: clip">
      <div role="region" aria-labelledby="${this.itemId}-header" id="${this.itemId}-panel">
        <slot></slot>
      </div>
    </div>
  </div>
`

// CSS:
.panel-wrapper {
  transition: grid-template-rows var(--ui-accordion-transition) ease;
}
@media (prefers-reduced-motion: reduce) {
  .panel-wrapper { transition-duration: 0ms; }
}
```

### Pattern 4: Shadow-Internal ARIA ID Wiring
**What:** All ARIA-connected elements (button with aria-controls, panel with aria-labelledby) rendered in shadow DOM with shadow-internal IDs. User content projected via slots.
**When to use:** Any component with aria-controls/aria-labelledby cross-references.
**Example:**
```typescript
// Source: Research SUMMARY.md Pitfall 1 — ARIA IDs must be shadow-internal
private itemId = `lui-ai-${Math.random().toString(36).substr(2, 9)}`;

// In AccordionItem shadow DOM:
html`
  <div role="heading" aria-level="${this.headingLevel}">
    <button
      id="${this.itemId}-header"
      aria-expanded="${this.expanded ? 'true' : 'false'}"
      aria-controls="${this.itemId}-panel"
      aria-disabled="${this.disabled ? 'true' : nothing}"
    >
      <slot name="header"></slot>
    </button>
  </div>
  <div role="region" aria-labelledby="${this.itemId}-header" id="${this.itemId}-panel">
    <!-- panel content -->
  </div>
`
```

### Pattern 5: Roving Tabindex for Keyboard Navigation (from RadioGroup)
**What:** Arrow keys move focus between accordion headers with wrapping. Only one header has tabindex=0 at a time. Enter/Space toggles the focused header's panel.
**When to use:** Accordion header keyboard navigation per W3C APG.
**Example:**
```typescript
// Source: packages/radio/src/radio-group.ts (lines 263-290)
// Adapted for accordion: arrows move focus ONLY (not selection)
// Enter/Space toggles panel (separate from focus movement)
private handleKeyDown(e: KeyboardEvent): void {
  const enabledItems = this.items.filter(i => !i.disabled);
  if (enabledItems.length === 0) return;

  const currentIndex = enabledItems.findIndex(i => i.tabIndex === 0);

  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    const next = (currentIndex + 1) % enabledItems.length;
    this.moveFocusTo(enabledItems, next);
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const prev = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
    this.moveFocusTo(enabledItems, prev);
  } else if (e.key === 'Home') {
    e.preventDefault();
    this.moveFocusTo(enabledItems, 0);
  } else if (e.key === 'End') {
    e.preventDefault();
    this.moveFocusTo(enabledItems, enabledItems.length - 1);
  }
  // Enter/Space handled by AccordionItem button click -> ui-accordion-toggle
}
```

### Pattern 6: Controlled/Uncontrolled Mode (from RadioGroup)
**What:** `value` attribute for controlled mode (parent drives state), `default-value` for uncontrolled (internal state management with initial value).
**When to use:** All stateful LitUI components.
**Example:**
```typescript
// Source: packages/radio/src/radio-group.ts (lines 79-95)
@property({ type: String }) value = '';
@property({ type: String, attribute: 'default-value' }) defaultValue = '';

override connectedCallback(): void {
  super.connectedCallback();
  if (this.defaultValue && !this.value) {
    this.value = this.defaultValue;
  }
}
```

### Pattern 7: SSR Slotchange Workaround
**What:** Manually dispatch `slotchange` in `firstUpdated()` after SSR hydration because the event does not fire on hydration.
**When to use:** All parent-child containers that discover children via slotchange.
**Example:**
```typescript
// Source: STATE.md decision, SUMMARY.md Pitfall 5
override firstUpdated(): void {
  // SSR hydration does not fire slotchange — manually trigger child discovery
  const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
  if (slot) {
    slot.dispatchEvent(new Event('slotchange'));
  }
}
```

### Anti-Patterns to Avoid
- **Distributed state on children:** Never let AccordionItem manage its own `expanded` boolean. Parent MUST be single source of truth to prevent multi-open bugs in single-expand mode.
- **ARIA IDs across shadow boundaries:** Never use `aria-controls` pointing to an ID outside the shadow root. Screen readers cannot resolve cross-boundary ID refs.
- **max-height animation hack:** Never use `max-height: 9999px` for height animation. Causes timing mismatches and overflow issues.
- **Native details/summary:** Do not use; cannot animate height, Shadow DOM complicates exclusive behavior, breaks WAI-ARIA APG pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Height animation 0 to auto | JS measurement + WAAPI | CSS Grid `grid-template-rows: 0fr/1fr` | Cross-browser, zero JS, proven technique |
| Event dispatching | Manual `new CustomEvent()` | `dispatchCustomEvent()` from @lit-ui/core | Ensures `bubbles: true, composed: true` defaults |
| Base class setup | Raw LitElement | TailwindElement from @lit-ui/core | Handles Tailwind injection, SSR dual-mode |
| Unique ID generation | UUID library | `Math.random().toString(36).substr(2, 9)` | Pattern used by all existing components, lightweight |

**Key insight:** Every building block for accordion already exists in the codebase. The only new pattern is the CSS Grid height animation DOM structure.

## Common Pitfalls

### Pitfall 1: ARIA ID References Across Shadow DOM (CRITICAL)
**What goes wrong:** `aria-controls` and `aria-labelledby` point to IDs outside the shadow root. Screen readers cannot resolve cross-boundary references. Fails silently -- no error, just broken accessibility.
**Why it happens:** Developer puts `aria-controls="panel-1"` on a shadow DOM button, but `panel-1` is in light DOM or a different shadow root.
**How to avoid:** Render ALL ARIA-linked elements (header button + panel region) inside the same shadow root with shadow-internal IDs. Slot user content into these shadow-rendered containers.
**Warning signs:** Screen reader does not announce "expanded/collapsed" or cannot navigate from trigger to panel.

### Pitfall 2: Single-Expand State Race Condition (HIGH)
**What goes wrong:** In single-expand mode, two panels briefly appear open simultaneously because each child toggles its own state before the parent can enforce exclusivity.
**Why it happens:** State is distributed across children rather than owned by parent.
**How to avoid:** Parent is single source of truth. Parent updates `value`, then syncs all children in `updated()`. Children NEVER self-toggle; they dispatch events and wait for parent to update them.
**Warning signs:** Flickering during expand/collapse, multiple panels open momentarily.

### Pitfall 3: CSS Grid Animation Requires Exact DOM Structure (HIGH)
**What goes wrong:** Content overflows during collapse animation, or animation doesn't work at all.
**Why it happens:** Missing the middle wrapper (`min-height: 0; overflow: clip`) between the grid container and the content.
**How to avoid:** Use exact three-layer structure: outer `display: grid; grid-template-rows: Xfr` > middle `min-height: 0; overflow: clip` > inner content.
**Warning signs:** Content visible below collapsed item, animation jumps rather than slides.

### Pitfall 4: slotchange Not Firing After SSR Hydration (CRITICAL)
**What goes wrong:** Component renders server-side with Declarative Shadow DOM, but `slotchange` never fires on client hydration. Child items array stays empty.
**Why it happens:** Browser hydration attaches existing DOM to shadow root without re-assigning slots.
**How to avoid:** In `firstUpdated()`, manually dispatch `slotchange` on the default slot. This triggers the `handleSlotChange` handler and populates the items array.
**Warning signs:** Accordion items don't respond to clicks/keyboard after SSR.

### Pitfall 5: Accordion Keyboard Differs from RadioGroup (MEDIUM)
**What goes wrong:** Developer copies RadioGroup keyboard nav verbatim, making arrow keys both move focus AND toggle panel (radio behavior).
**Why it happens:** RadioGroup arrows move focus AND select simultaneously. Accordion arrows should ONLY move focus. Enter/Space toggles.
**How to avoid:** Separate focus movement (arrow keys) from activation (Enter/Space). Arrow keys update which item has `tabindex=0` and call `focus()`, but do NOT toggle panels.
**Warning signs:** Panels expand/collapse as user navigates with arrows.

### Pitfall 6: Collapsible vs Non-Collapsible Single Mode (MEDIUM)
**What goes wrong:** In single-expand mode without `collapsible`, clicking the currently open panel should do nothing (panel stays open). With `collapsible`, it should close.
**Why it happens:** Developer always toggles on click without checking the `collapsible` flag.
**How to avoid:** In the toggle handler: if single-expand mode, not collapsible, and the clicked item is already expanded, return early (no-op).
**Warning signs:** Panel closes when it shouldn't, or vice versa.

### Pitfall 7: Safari slotchange Timing (LOW)
**What goes wrong:** Safari may fire `slotchange` before `connectedCallback` finishes, causing handlers to run against uninitialized state.
**Why it happens:** Safari's implementation fires slotchange synchronously during initial connection.
**How to avoid:** Initialize all state as class field defaults (not in connectedCallback). Guard slotchange handlers to handle empty/partial state gracefully.
**Warning signs:** Errors on first render in Safari only.

## Code Examples

### Complete AccordionItem Shadow DOM Structure
```typescript
// Verified pattern combining APG spec + CSS Grid animation + shadow-internal ARIA
render() {
  return html`
    <div role="heading" aria-level="${this.headingLevel}">
      <button
        id="${this.itemId}-header"
        class="header-button"
        aria-expanded="${this.expanded ? 'true' : 'false'}"
        aria-controls="${this.itemId}-panel"
        aria-disabled="${this.disabled ? 'true' : nothing}"
        tabindex="-1"
        @click=${this.handleToggle}
        @keydown=${this.handleKeyDown}
      >
        <slot name="header"></slot>
      </button>
    </div>
    <div
      class="panel-wrapper"
      role="region"
      aria-labelledby="${this.itemId}-header"
      id="${this.itemId}-panel"
    >
      <div class="panel-content">
        <slot></slot>
      </div>
    </div>
  `;
}
```

### Accordion Container Toggle Logic
```typescript
// Source: Adapted from RadioGroup handleRadioChange pattern
private handleItemToggle(e: CustomEvent): void {
  e.stopPropagation(); // Internal event, don't leak
  const itemValue = e.detail.value as string;

  if (this.multiple) {
    // Multi-expand: toggle individual item
    const expanded = new Set(this.expandedItems);
    if (expanded.has(itemValue)) {
      expanded.delete(itemValue);
    } else {
      expanded.add(itemValue);
    }
    this.value = [...expanded].join(',');
  } else {
    // Single-expand
    if (this.expandedItems.has(itemValue)) {
      // Already open — only close if collapsible
      if (this.collapsible) {
        this.value = '';
      }
      // else: no-op (non-collapsible)
    } else {
      this.value = itemValue;
    }
  }

  this.syncChildStates();
  dispatchCustomEvent(this, 'ui-change', {
    value: this.value,
    expandedItems: [...this.expandedItems],
  });
}
```

### CSS Custom Properties Block (for tailwind.css :root)
```css
/* -------------------------------------------------------------------------
 * Accordion Component
 * ------------------------------------------------------------------------- */

/* Layout */
--ui-accordion-border: var(--color-border, var(--ui-color-border));
--ui-accordion-border-width: 1px;
--ui-accordion-radius: 0.375rem;
--ui-accordion-gap: 0;

/* Header */
--ui-accordion-header-padding: 1rem;
--ui-accordion-header-font-weight: 500;
--ui-accordion-header-font-size: 1rem;
--ui-accordion-header-text: var(--color-foreground, var(--ui-color-foreground));
--ui-accordion-header-bg: transparent;
--ui-accordion-header-hover-bg: var(--color-muted, var(--ui-color-muted));

/* Panel */
--ui-accordion-panel-padding: 0 1rem 1rem;
--ui-accordion-panel-text: var(--color-muted-foreground, var(--ui-color-muted-foreground));

/* Animation */
--ui-accordion-transition: 200ms;

/* Focus */
--ui-accordion-ring: var(--color-ring, var(--ui-color-ring));
```

### Dark Mode Overrides (for tailwind.css .dark block)
```css
/* Accordion dark mode */
--ui-accordion-header-text: var(--color-gray-50);
--ui-accordion-header-hover-bg: var(--color-gray-800);
--ui-accordion-border: var(--color-gray-800);
--ui-accordion-panel-text: var(--color-gray-400);
```

### Element Registration Pattern (index.ts)
```typescript
// Source: packages/radio/src/index.ts
import { isServer } from 'lit';
export { Accordion } from './accordion.js';
export { AccordionItem } from './accordion-item.js';

import { Accordion } from './accordion.js';
import { AccordionItem } from './accordion-item.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-accordion')) {
    customElements.define('lui-accordion', Accordion);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-accordion] Custom element already registered.');
  }
  if (!customElements.get('lui-accordion-item')) {
    customElements.define('lui-accordion-item', AccordionItem);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-accordion-item] Custom element already registered.');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-accordion': Accordion;
    'lui-accordion-item': AccordionItem;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| max-height hack for height animation | CSS Grid grid-template-rows 0fr/1fr | 2023 (cross-browser support) | Reliable, no JS measurement needed |
| JS height measurement + WAAPI | CSS-only with grid transition | 2023 | Zero runtime overhead |
| interpolate-size: allow-keywords | Still Chromium-only (129+) | Feb 2026 | Defer as progressive enhancement |
| details/summary for disclosure | Custom elements with APG pattern | N/A | Full animation control, ARIA compliance |

**Deprecated/outdated:**
- `max-height: 9999px` animation trick: unreliable timing, visible glitches
- `interpolate-size` as primary strategy: Chromium 129+ only, not cross-browser

## Open Questions

1. **Role="region" threshold**
   - What we know: W3C APG recommends `role="region"` on panels but warns against it when >6 panels
   - What's unclear: Should we conditionally omit `role="region"` based on item count?
   - Recommendation: Always apply `role="region"` (matches Radix, Shoelace, Material Web). Users with many items can override via CSS/ARIA. Simpler implementation.

2. **`overflow: clip` vs `overflow: hidden`**
   - What we know: Both prevent content overflow during collapse. `clip` is newer and doesn't create a new scroll container.
   - What's unclear: Edge cases with `overflow: clip` in older browsers
   - Recommendation: Use `overflow: clip` (supported in all modern browsers since 2022). Falls back gracefully.

## Sources

### Primary (HIGH confidence)
- [W3C WAI-ARIA APG Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) — Authoritative ARIA spec, verified via WebFetch
- Existing codebase: `packages/radio/src/radio-group.ts` — Parent-child pattern, roving tabindex, form association, disabled propagation
- Existing codebase: `packages/radio/src/radio.ts` — Presentational child pattern, internal event dispatch
- Existing codebase: `packages/checkbox/src/checkbox-group.ts` — Multi-select group pattern, batch update guards
- Existing codebase: `packages/core/src/tailwind-element.ts` — TailwindElement base class, SSR dual-mode styling
- Existing codebase: `packages/core/src/utils/events.ts` — dispatchCustomEvent utility
- Existing codebase: `packages/core/src/styles/tailwind.css` — CSS custom property token pattern (:root + .dark blocks)
- Existing codebase: `packages/radio/src/index.ts` — Element registration pattern
- Existing codebase: `packages/radio/src/jsx.d.ts` — JSX type declaration pattern
- Existing codebase: `packages/radio/package.json` — Package structure with peer deps
- Existing codebase: `packages/radio/vite.config.ts` — Vite library config
- `.planning/research/SUMMARY.md` — Comprehensive project research with 23 identified pitfalls
- `.planning/STATE.md` — Prior decisions (CSS Grid animation, parent-child pattern, ARIA shadow DOM, SSR slotchange)

### Secondary (MEDIUM confidence)
- [CSS-Tricks: CSS Grid Can Do Auto Height Transitions](https://css-tricks.com/css-grid-can-do-auto-height-transitions/) — Grid animation technique verification
- [Stefan Judis: How to Animate Height with CSS Grid](https://www.stefanjudis.com/snippets/how-to-animate-height-with-css-grid/) — Grid animation DOM structure

### Tertiary (LOW confidence)
- None — all findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Zero new dependencies, all capabilities exist in current codebase
- Architecture: HIGH — Direct clone of RadioGroup/CheckboxGroup parent-child pattern with verified CSS Grid animation
- Pitfalls: HIGH — 7 pitfalls identified from W3C APG spec, existing codebase patterns, and project research summary

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (30 days — stable domain, no moving parts)
