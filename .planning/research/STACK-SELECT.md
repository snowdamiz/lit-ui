# Stack Research: Select Component

**Project:** LitUI Select/Combobox
**Researched:** 2026-01-26
**Confidence:** HIGH (versions verified via npm, browser support via CanIUse)

## Executive Summary

The Select/Combobox component requires **two** new dependencies for core features that cannot be reasonably built from scratch: dropdown positioning and virtual scrolling. Both have excellent Lit-specific solutions with verified current versions.

**Key additions:**
- `@floating-ui/dom` ^1.7.4 - Dropdown positioning with Shadow DOM support
- `@tanstack/lit-virtual` ^3.13.19 - Virtual scrolling for large option lists

**No polyfills required** - Popover API (89.66% support) and IntersectionObserver (native) cover all needs.

---

## Recommended Stack Additions

### 1. Dropdown Positioning: @floating-ui/dom

| Property | Value |
|----------|-------|
| Package | `@floating-ui/dom` |
| Version | `^1.7.4` |
| Bundle size | ~3KB gzipped (core only) |
| Purpose | Position dropdown relative to trigger, handle viewport collision |

**Why Floating UI:**
- Framework-agnostic (perfect for web components)
- Tree-shakeable - only import what you need
- Explicit Shadow DOM support via platform customization
- Mature, widely adopted (1,886 dependents on npm)
- Covers all positioning needs: flip, shift, offset, arrow

**Critical for Select:**
- `autoPlacement` - Dropdown opens above when no room below
- `shift` - Keeps dropdown within viewport bounds
- `size` - Constrains dropdown height to available space
- `offset` - Visual separation between trigger and dropdown

**Shadow DOM Integration:**
```typescript
import { computePosition, flip, shift, offset, size } from '@floating-ui/dom';

// Basic usage - works with open shadow roots
await computePosition(triggerEl, dropdownEl, {
  placement: 'bottom-start',
  strategy: 'fixed', // Use fixed strategy for Shadow DOM
  middleware: [
    offset(4),
    flip(),
    shift({ padding: 8 }),
    size({
      apply({ availableHeight, elements }) {
        elements.floating.style.maxHeight = `${availableHeight}px`;
      },
    }),
  ],
});
```

**When `strategy: 'fixed'` is insufficient** (rare edge cases with transformed ancestors):
```typescript
import { platform } from '@floating-ui/dom';
import { offsetParent } from 'composed-offset-position';

computePosition(triggerEl, dropdownEl, {
  platform: {
    ...platform,
    getOffsetParent: (element) => platform.getOffsetParent(element, offsetParent),
  },
});
```

### 2. Virtual Scrolling: @tanstack/lit-virtual

| Property | Value |
|----------|-------|
| Package | `@tanstack/lit-virtual` |
| Version | `^3.13.19` |
| Bundle size | ~2KB gzipped |
| Purpose | Render only visible options for large lists |

**Why TanStack Virtual over @lit-labs/virtualizer:**

| Criterion | @tanstack/lit-virtual | @lit-labs/virtualizer |
|-----------|----------------------|----------------------|
| Version | 3.13.19 (stable) | 2.1.1 (prerelease) |
| API stability | Stable, semantic versioning | "Breaking changes likely" |
| Scope | @tanstack (production) | @lit-labs (experimental) |
| Integration | Reactive Controller pattern | Custom element or directive |
| Flexibility | Headless, full control | More opinionated |

**TanStack Virtual wins** because:
1. **Stable API** - Not experimental/labs status
2. **Reactive Controller** - Natural Lit integration pattern
3. **Headless** - Complete control over markup and styling
4. **Same ecosystem** - TanStack is battle-tested (Table, Query, etc.)

**Lit Integration Pattern:**
```typescript
import { LitElement, html } from 'lit';
import { VirtualizerController } from '@tanstack/lit-virtual';
import { createRef, ref } from 'lit/directives/ref.js';

class SelectDropdown extends LitElement {
  private scrollRef = createRef<HTMLDivElement>();

  private virtualizer = new VirtualizerController(this, {
    getScrollElement: () => this.scrollRef.value,
    count: () => this.options.length,
    estimateSize: () => 40, // Option height in px
    overscan: 5,
  });

  render() {
    const items = this.virtualizer.getVirtualItems();
    return html`
      <div ${ref(this.scrollRef)} class="max-h-[300px] overflow-auto">
        <div style="height: ${this.virtualizer.getTotalSize()}px; position: relative;">
          ${items.map(item => html`
            <div style="position: absolute; top: ${item.start}px; height: ${item.size}px;">
              ${this.options[item.index].label}
            </div>
          `)}
        </div>
      </div>
    `;
  }
}
```

### 3. Shadow DOM Positioning Fallback (Optional)

| Property | Value |
|----------|-------|
| Package | `composed-offset-position` |
| Version | `^0.0.6` |
| Bundle size | <1KB |
| Purpose | Fix positioning in edge cases with transformed ancestors |

**Why optional:**
- `strategy: 'fixed'` solves most Shadow DOM positioning issues
- Only needed when Select is inside a dialog/modal with CSS transforms
- Can be added later if issues arise

**Recommendation:** Do not install initially. Add only if positioning bugs appear in specific contexts.

---

## Native APIs to Leverage

### IntersectionObserver (Infinite Scroll)

**Browser support:** 97%+ (universal)
**No library needed** - Use native API directly.

**Why native over library:**
- Zero bundle cost
- Better performance than scroll event listeners
- Async, low-priority callbacks by design
- Built-in rootMargin for "load more" triggers

**Implementation pattern:**
```typescript
private loadMoreObserver?: IntersectionObserver;

private setupInfiniteScroll() {
  this.loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && this.hasMore && !this.loading) {
        this.dispatchEvent(new CustomEvent('load-more'));
      }
    },
    { rootMargin: '100px' } // Trigger 100px before sentinel visible
  );

  const sentinel = this.shadowRoot?.querySelector('.load-sentinel');
  if (sentinel) this.loadMoreObserver.observe(sentinel);
}

disconnectedCallback() {
  this.loadMoreObserver?.disconnect();
}
```

### Popover API (Top Layer Promotion)

**Browser support:** 89.66%
**Consideration:** Useful but NOT required.

**Benefits if used:**
- Automatic top-layer (no z-index battles)
- Light dismiss built-in
- Keyboard handling (Esc to close)

**Why we might NOT use it:**
- Select needs custom keyboard navigation (arrow keys, type-ahead)
- Light dismiss behavior may conflict with multi-select interactions
- More control with manual implementation

**Recommendation:** Evaluate during implementation. Manual approach gives more control for Select-specific behaviors.

### CSS Anchor Positioning

**Browser support:** 76.17%
**Verdict:** DO NOT USE YET

**Why not:**
- Safari 26+ only (released late 2025)
- Firefox 147+ only (very recent)
- Floating UI provides same capabilities with better support
- Can migrate to native anchor positioning in future (2027+)

---

## Rejected Alternatives

### @lit-labs/virtualizer

| Reason | Detail |
|--------|--------|
| Experimental status | "All changes may be breaking until 1.0" |
| Labs scope | Not yet graduated to @lit stable |
| Less flexible | Opinionated element/directive vs headless controller |

The package is well-built but too risky for a production component library.

### Popper.js (predecessor to Floating UI)

| Reason | Detail |
|--------|--------|
| Deprecated | Floating UI is the official successor |
| Larger bundle | ~7KB vs ~3KB gzipped |
| Less modular | Not as tree-shakeable |

### Native `<select>` with customizable styles (CSS appearance: base-select)

| Reason | Detail |
|--------|--------|
| Browser support | Chrome 133+ only (very limited) |
| Flexibility | Limited customization compared to web component |
| Consistency | Cannot guarantee cross-browser appearance |

This may be viable in 2027+ but not today.

### Manual positioning (no library)

| Reason | Detail |
|--------|--------|
| Complexity | Collision detection is surprisingly complex |
| Edge cases | Transform ancestors, scrolling containers, iframe bounds |
| Maintenance | Floating UI handles browser quirks we'd have to track |

Floating UI is only ~3KB and handles dozens of edge cases. Not worth reimplementing.

### scroll event + throttle (instead of IntersectionObserver)

| Reason | Detail |
|--------|--------|
| Performance | Blocks main thread vs async observer callbacks |
| Jank | Even with throttle, can cause scroll jank |
| Unnecessary | IntersectionObserver has 97%+ support |

---

## Integration Points

### With TailwindElement Base Class

New packages work seamlessly with existing architecture:

```typescript
import { html, css } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { computePosition, flip, shift, offset, size } from '@floating-ui/dom';
import { VirtualizerController } from '@tanstack/lit-virtual';

export class Select extends TailwindElement {
  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host { display: inline-block; }
      /* Component-specific styles */
    `,
  ];

  // ... implementation
}
```

### With ElementInternals (Form Participation)

Same pattern as Input/Textarea - no changes needed:

```typescript
static formAssociated = true;
private internals: ElementInternals | null = null;

constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}

// Multi-select: set FormData with multiple values
private updateFormValue() {
  if (this.multiple) {
    const formData = new FormData();
    this.selectedValues.forEach(v => formData.append(this.name, v));
    this.internals?.setFormValue(formData);
  } else {
    this.internals?.setFormValue(this.value);
  }
}
```

### With SSR (@lit-labs/ssr)

Both new libraries are client-only (positioning and scrolling), which is correct:

```typescript
import { isServer } from 'lit';

// Skip positioning during SSR - dropdown is closed anyway
private async positionDropdown() {
  if (isServer || !this.open) return;
  // ... Floating UI positioning
}

// Skip virtualizer during SSR - render full list for hydration
private virtualizer = !isServer
  ? new VirtualizerController(this, { /* ... */ })
  : null;
```

### Package Structure

Add dependencies to the new `@lit-ui/select` package:

```json
{
  "name": "@lit-ui/select",
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  },
  "dependencies": {
    "@floating-ui/dom": "^1.7.4",
    "@tanstack/lit-virtual": "^3.13.19"
  }
}
```

**Note:** These are `dependencies` not `peerDependencies` because:
- Users don't directly interact with these libraries
- Version management is simpler
- Tree-shaking still works (both libraries are ESM)

---

## Installation

```bash
# In packages/select directory
pnpm add @floating-ui/dom@^1.7.4 @tanstack/lit-virtual@^3.13.19
```

---

## Summary

### What to Add

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `@floating-ui/dom` | ^1.7.4 | Dropdown positioning | HIGH |
| `@tanstack/lit-virtual` | ^3.13.19 | Virtual scrolling | HIGH |

### What NOT to Add

| Package | Reason |
|---------|--------|
| `@lit-labs/virtualizer` | Experimental, breaking changes likely |
| `composed-offset-position` | Not needed initially, add if issues arise |
| Any scroll event library | IntersectionObserver is native and better |
| Popover API polyfill | 89.66% support is sufficient for progressive enhancement |

### Native APIs to Use

| API | Purpose | Support |
|-----|---------|---------|
| IntersectionObserver | Infinite scroll trigger | 97%+ |
| ElementInternals | Form participation | (already using) |
| ResizeObserver | Reposition on size change | 97%+ |

### Future Considerations

- **CSS Anchor Positioning** - Revisit in 2027 when Safari/Firefox support matures
- **Customizable `<select>`** - Revisit when browser support reaches 90%+
- **Popover API** - Consider for simpler dropdowns, but Select needs custom keyboard handling

---

## Sources

### Verified via npm registry
- @floating-ui/dom: 1.7.4
- @tanstack/lit-virtual: 3.13.19
- @lit-labs/virtualizer: 2.1.1
- composed-offset-position: 0.0.6

### Official Documentation
- [Floating UI - Getting Started](https://floating-ui.com/docs/getting-started)
- [Floating UI - Platform (Shadow DOM)](https://floating-ui.com/docs/platform)
- [TanStack Virtual](https://tanstack.com/virtual/latest)

### Browser Support
- [CSS Anchor Positioning - CanIUse](https://caniuse.com/css-anchor-positioning) - 76.17%
- [Popover API - CanIUse](https://caniuse.com/mdn-api_htmlelement_popover) - 89.66%

### Community Resources
- [High Performance Tables with Lit and Virtual Scrolling](https://coryrylan.com/blog/high-performance-html-tables-with-lit-and-virtual-scrolling)
- [Lit Labs - @lit-labs/virtualizer status](https://lit.dev/docs/libraries/labs/)
