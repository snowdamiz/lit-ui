# Phase 53: Popover - Research

**Researched:** 2026-02-02
**Domain:** Interactive overlay web component with Popover API, Floating UI positioning, focus management
**Confidence:** HIGH

## Summary

The popover component builds directly on the tooltip infrastructure from Phase 52, adding click-to-toggle behavior, light dismiss, focus management, controlled/uncontrolled modes, and optional modal focus trapping. The core positioning stack (Floating UI + composed-offset-position) is already built in `@lit-ui/core/floating`. CSS custom property tokens for popover are already defined in `tailwind.css` and `tokens/index.ts`. The overlay animation pattern (scale+fade with `@starting-style`) is documented in `overlay-animation.css`.

The key architectural decision is whether to use the native Popover API (`popover="auto"`) for top-layer rendering and light dismiss, or use `position: fixed` with manual click-outside detection (like the existing select and tooltip components). Research shows that while the Popover API has ~95% support, there is an **open WHATWG spec issue** (whatwg/html#11537) about `popovertarget` buttons inside shadow DOM not working correctly when the event path crosses shadow boundaries. Since this library is built entirely on web components with shadow DOM, this is a real risk. However, using `popover="auto"` on the content element itself (without relying on `popovertarget` declarative attributes) and controlling show/hide via `showPopover()`/`hidePopover()` JS APIs avoids most of these issues. The nesting bug in WebKit (259261) is resolved.

**Primary recommendation:** Use native Popover API with `popover="auto"` and JavaScript control (`showPopover()`/`hidePopover()`) for top-layer rendering and built-in light dismiss. Do NOT use declarative `popovertarget` attributes (shadow DOM spec issues). Fall back to `position: fixed` + manual click-outside detection as a codepath for the rare case where Popover API is unsupported.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@floating-ui/dom` | Already in workspace | Positioning with collision avoidance | Already used by tooltip; shared via `@lit-ui/core/floating` |
| `composed-offset-position` | Already in workspace | Fix offsetParent in Shadow DOM | Already integrated in `@lit-ui/core/floating` |
| `lit` | ^3.3.2 | Web component framework | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@lit-ui/core` | workspace:* | TailwindElement, floating utilities, tokens | Always - base class and shared infrastructure |
| `@lit-ui/core/floating` | (subpath export) | `computePosition`, `autoUpdatePosition`, `flip`, `shift`, `offset`, `arrow`, `size` | Positioning the popover panel relative to trigger |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native Popover API | `position: fixed` + manual z-index (like tooltip) | Popover API gives free top-layer rendering and light dismiss; fixed positioning requires manual click-outside detection and z-index management |
| JS `showPopover()`/`hidePopover()` | Declarative `popovertarget` attribute | Declarative approach has shadow DOM spec issues (whatwg/html#11537); JS control is safer |
| Manual focus trap | `<dialog>` element for modal mode | Dialog provides native focus trapping but adds complexity for non-modal default case |

**Installation:**
No new dependencies needed. All required packages already in the workspace.

## Architecture Patterns

### Recommended Project Structure
```
packages/popover/
├── src/
│   ├── popover.ts          # Main Popover component class
│   ├── index.ts            # Registration + exports (follows tooltip pattern)
│   ├── jsx.d.ts            # React/Vue/Svelte type declarations
│   └── vite-env.d.ts       # Vite types
├── package.json            # @lit-ui/popover
├── tsconfig.json
└── vite.config.ts
```

### Pattern 1: Wrapper Component with Trigger Slot + Content Slot
**What:** The popover wraps a trigger element (default slot) and a content panel (named `content` slot). Click on trigger toggles the popover panel.
**When to use:** This is the standard pattern already established by tooltip.
**Example:**
```html
<lui-popover placement="bottom">
  <button slot="trigger">Open Menu</button>
  <div slot="content">
    <p>Popover content here</p>
  </div>
</lui-popover>
```

### Pattern 2: Native Popover API with JS Control
**What:** The popover content panel gets `popover="auto"` attribute for top-layer rendering and automatic light dismiss. Show/hide via `showPopover()`/`hidePopover()` JS APIs instead of declarative `popovertarget`.
**When to use:** Default behavior for all popover instances.
**Why:** Avoids shadow DOM issues with `popovertarget` while getting free light dismiss and top-layer rendering.
**Example:**
```typescript
// In the component's show() method:
private show(): void {
  const panel = this.renderRoot.querySelector<HTMLElement>('.popover-panel');
  if (panel && typeof panel.showPopover === 'function') {
    panel.showPopover();
  }
  this._open = true;
  // ... positioning, focus management, events
}
```

### Pattern 3: Controlled + Uncontrolled Mode
**What:** Internal state by default (uncontrolled), with `open` property + `open-changed` event for controlled mode.
**When to use:** Uncontrolled for simple cases, controlled when parent needs to manage state.
**Example:**
```typescript
// Uncontrolled (default) - component manages its own state
@state() private _open = false;

// Controlled - external property overrides internal state
@property({ type: Boolean, reflect: true })
set open(val: boolean) {
  const old = this._open;
  this._open = val;
  this.requestUpdate('open', old);
  // Sync native popover state
}
get open(): boolean { return this._open; }
```

### Pattern 4: Nested Popover Support via Parent Tracking
**What:** When a child popover opens inside a parent popover, the parent stays open. Closing the parent closes all children.
**When to use:** Menus, cascading dropdowns, multi-level navigation.
**How:** The native Popover API handles this automatically when popovers are DOM descendants or connected via `anchor` attribute. For popovers in separate shadow roots, manual parent-child tracking is needed.
**Strategy:** Track parent popover via DOM traversal (walk up composed tree looking for ancestor `lui-popover` elements). When closing, dispatch a custom event that children listen for to close themselves.

### Pattern 5: AbortController Cleanup (Established Pattern)
**What:** All event listeners registered in `connectedCallback` use a shared `AbortController`. Cleanup in `disconnectedCallback` via `abort()`.
**Source:** Proven in tooltip component.
```typescript
override connectedCallback(): void {
  super.connectedCallback();
  if (isServer) return;
  this.abortController = new AbortController();
  const { signal } = this.abortController;
  // All listeners use { signal }
}

override disconnectedCallback(): void {
  super.disconnectedCallback();
  this.abortController?.abort();
}
```

### Anti-Patterns to Avoid
- **Using `popovertarget` attribute:** Shadow DOM spec issues make declarative popover targets unreliable in web components. Use JS API (`showPopover()`/`hidePopover()`) instead.
- **Manual click-outside detection as primary strategy:** The native Popover API handles light dismiss correctly (including edge cases like iframes, cross-origin content). Only fall back to manual detection when Popover API is unsupported.
- **Forgetting `overlay` in CSS transitions:** When animating popover exit, the `overlay` property with `allow-discrete` keeps the element in the top layer during the exit animation. Without it, the popover disappears instantly on close.
- **Using `display: none` to hide:** The Popover API manages display automatically. Don't fight it with manual display toggling.
- **Not using `composedPath()` for click detection:** If implementing manual click-outside as fallback, `event.target` doesn't cross shadow boundaries. Always use `event.composedPath().includes(element)`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Positioning with collision avoidance | Custom position calculation | `@lit-ui/core/floating` (`computePosition` + `flip` + `shift` + `offset`) | Already built, handles Shadow DOM, 12 placements |
| Auto-repositioning on scroll/resize | Manual scroll/resize listeners | `autoUpdatePosition` from `@lit-ui/core/floating` | Handles all edge cases including ancestor scroll containers |
| Light dismiss (click outside) | Manual document click listener | Native Popover API `popover="auto"` | Handles iframes, nested popovers, shadow DOM correctly |
| Top-layer rendering | z-index management | Native Popover API top layer | No z-index fighting, always above other content |
| Arrow positioning | Manual arrow math | `arrow` middleware from `@floating-ui/dom` | Handles placement flips, padding, edge clamping |
| Trigger width matching | Manual width measurement | `size` middleware from `@floating-ui/dom` | Already exported from `@lit-ui/core/floating` |
| Focus trap for modal mode | Custom tabindex management | Adapted from dialog's `<dialog>` approach or manual focus trap | Native dialog handles edge cases (iframes, shadow DOM) |
| CSS overlay animations | JS-based animation | `@starting-style` + `transition-behavior: allow-discrete` + `:popover-open` | Pure CSS, GPU-accelerated, pattern documented in `overlay-animation.css` |

**Key insight:** The Popover API + Floating UI combination solves the two hardest problems (stacking context / z-index and light dismiss) natively. Manual alternatives are error-prone and incomplete.

## Common Pitfalls

### Pitfall 1: Popover API + Floating UI Positioning Conflict
**What goes wrong:** The Popover API renders elements in the top layer, which has no relation to the normal document flow. Floating UI calculates position relative to the DOM, but the popover is visually detached from the DOM tree.
**Why it happens:** Top-layer elements have `position: fixed` and `margin: auto` by default (UA stylesheet).
**How to avoid:** Override the UA styles on the popover element: `margin: 0; position: fixed;` (or `position: absolute` if not using top layer). Then apply Floating UI coordinates via `left`/`top` as normal. The tooltip already does this successfully with `position: fixed`.
**Warning signs:** Popover appears centered in viewport instead of near trigger.

### Pitfall 2: Nested Popovers Across Shadow DOM Boundaries
**What goes wrong:** The Popover API's nesting algorithm checks DOM ancestry. When popovers are in different shadow roots, the browser may not recognize them as nested, causing the parent to close when the child opens.
**Why it happens:** The nesting detection uses `anchor` attribute or DOM tree, and shadow DOM boundaries can obscure the relationship.
**How to avoid:** Ensure the child popover's content element has its `anchor` attribute pointing to a DOM element that is a descendant of the parent popover (or is the parent popover itself). Alternatively, if nesting detection fails, use `popover="manual"` for child popovers and manage close-on-parent-close manually.
**Warning signs:** Opening a nested popover closes the parent.

### Pitfall 3: Focus Return on Close
**What goes wrong:** After closing a popover, focus doesn't return to the trigger element, leaving the user lost on the page.
**Why it happens:** The Popover API doesn't automatically restore focus. The `hidePopover()` call just hides the element.
**How to avoid:** Store the trigger element reference. On the `toggle` event with `newState === 'closed'`, call `triggerEl.focus()`. The tooltip already implements this pattern (implicit via hover, but popover needs explicit focus return).
**Warning signs:** After Escape or click-outside dismiss, pressing Tab doesn't continue from the expected position.

### Pitfall 4: Race Condition Between Popover API Events and Lit Updates
**What goes wrong:** The Popover API fires `beforetoggle`/`toggle` events synchronously when calling `showPopover()`/`hidePopover()`. If Lit reactive updates haven't completed, querying the DOM for the popover panel element may fail.
**Why it happens:** Lit renders asynchronously. The popover panel may not exist in the DOM yet when `showPopover()` is called.
**How to avoid:** Wait for `this.updateComplete` before calling `showPopover()`. Position the popover after `updateComplete` as well (same pattern as tooltip).
**Warning signs:** "Cannot read property 'showPopover' of null" errors.

### Pitfall 5: CSS Transition Not Animating on Close
**What goes wrong:** The popover disappears instantly on close instead of animating out.
**Why it happens:** Without `transition-behavior: allow-discrete` on the `display` and `overlay` properties, the browser removes the element from rendering immediately when `hidePopover()` is called.
**How to avoid:** Include `display` and `overlay` in the transition declaration with `allow-discrete`:
```css
transition:
  opacity 150ms ease-out,
  transform 150ms ease-out,
  display 150ms allow-discrete,
  overlay 150ms allow-discrete;
```
**Warning signs:** Entry animation works but exit is instant.

### Pitfall 6: Popover API Feature Detection
**What goes wrong:** Calling `showPopover()` on an element without `popover` attribute, or in a browser that doesn't support it, throws an error.
**Why it happens:** Not all environments support the Popover API (~95% support but not universal).
**How to avoid:** Feature detection: `'popover' in HTMLElement.prototype`. Fall back to `position: fixed` + manual click-outside (like the select component's `handleDocumentClick` pattern).
**Warning signs:** JavaScript errors in older browsers or test environments (JSDOM).

## Code Examples

### Popover Component Skeleton
```typescript
// Source: Adapted from tooltip.ts pattern + Popover API MDN docs
import { html, css, nothing } from 'lit';
import { isServer } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import {
  computePosition,
  autoUpdatePosition,
  flip,
  shift,
  offset,
  arrow,
  size,
  type Placement,
} from '@lit-ui/core/floating';

export class Popover extends TailwindElement {
  @property({ type: String }) placement: Placement = 'bottom';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) arrow = false;
  @property({ type: Boolean }) modal = false;
  @property({ type: Number }) offset = 8;
  @property({ type: Boolean, attribute: 'match-trigger-width' }) matchTriggerWidth = false;

  @state() private _internalOpen = false;

  private triggerEl: HTMLElement | null = null;
  private cleanupAutoUpdate?: () => void;
  private abortController?: AbortController;

  private get isOpen(): boolean {
    return this._internalOpen;
  }

  // ... lifecycle, positioning, event handling
}
```

### Popover API Integration with Floating UI
```typescript
// Source: MDN Popover API docs + Floating UI computePosition pattern
private async showPopover(): Promise<void> {
  this._internalOpen = true;
  this.dispatchEvent(new CustomEvent('open-changed', {
    detail: { open: true },
    bubbles: true,
    composed: true,
  }));

  await this.updateComplete;

  const panel = this.renderRoot.querySelector<HTMLElement>('.popover-panel');
  if (!panel) return;

  // Use Popover API if available
  if ('popover' in HTMLElement.prototype && panel.popover) {
    try { panel.showPopover(); } catch { /* already showing */ }
  }

  this.updatePosition();
  this.startAutoUpdate();
}

private hidePopover(): void {
  const panel = this.renderRoot.querySelector<HTMLElement>('.popover-panel');
  if (panel && 'popover' in HTMLElement.prototype && panel.popover) {
    try { panel.hidePopover(); } catch { /* already hidden */ }
  }

  this._internalOpen = false;
  this.cleanupAutoUpdate?.();
  this.cleanupAutoUpdate = undefined;

  // Restore focus to trigger
  this.triggerEl?.focus();

  this.dispatchEvent(new CustomEvent('open-changed', {
    detail: { open: false },
    bubbles: true,
    composed: true,
  }));
}
```

### Trigger Width Matching via `size` Middleware
```typescript
// Source: @floating-ui/dom size middleware
private getMiddleware() {
  const mw = [offset(this.offset), flip(), shift({ padding: 8 })];

  if (this.matchTriggerWidth) {
    mw.push(size({
      apply: ({ rects, elements }) => {
        Object.assign(elements.floating.style, {
          width: `${rects.reference.width}px`,
        });
        // Also expose as CSS custom property
        elements.floating.style.setProperty(
          '--ui-popover-trigger-width',
          `${rects.reference.width}px`
        );
      },
    }));
  }

  if (this.arrow) {
    const arrowEl = this.renderRoot.querySelector<HTMLElement>('.popover-arrow');
    if (arrowEl) mw.push(arrow({ element: arrowEl, padding: 4 }));
  }

  return mw;
}
```

### CSS Animation for Popover (using :popover-open)
```css
/* Source: overlay-animation.css reference + MDN Popover API animation docs */
.popover-panel {
  margin: 0;
  border: none;
  padding: 0;
  background: transparent;

  /* Position applied by Floating UI */
  position: fixed;

  opacity: 0;
  transform: scale(0.95);
  transition:
    opacity 150ms ease-out,
    transform 150ms ease-out,
    display 150ms allow-discrete,
    overlay 150ms allow-discrete;
}

/* When Popover API is active */
.popover-panel:popover-open {
  opacity: 1;
  transform: scale(1);
}

/* Fallback when Popover API not used */
.popover-panel[data-open] {
  opacity: 1;
  transform: scale(1);
}

@starting-style {
  .popover-panel:popover-open,
  .popover-panel[data-open] {
    opacity: 0;
    transform: scale(0.95);
  }
}

@media (prefers-reduced-motion: reduce) {
  .popover-panel {
    transition: none;
  }
}
```

### Escape Key and Toggle Event Handling
```typescript
// Source: MDN Popover API Using guide
private setupPopoverEvents(): void {
  const panel = this.renderRoot.querySelector<HTMLElement>('.popover-panel');
  if (!panel || !this.abortController) return;
  const { signal } = this.abortController;

  // Listen for Popover API toggle events (handles light dismiss + Escape)
  panel.addEventListener('toggle', (e: Event) => {
    const toggleEvent = e as ToggleEvent;
    if (toggleEvent.newState === 'closed' && this._internalOpen) {
      // Popover was dismissed via light dismiss or Escape
      this._internalOpen = false;
      this.cleanupAutoUpdate?.();
      this.triggerEl?.focus();
      this.dispatchEvent(new CustomEvent('open-changed', {
        detail: { open: false },
        bubbles: true,
        composed: true,
      }));
    }
  }, { signal });
}
```

### ARIA Attributes Pattern
```typescript
// Source: WAI-ARIA Authoring Practices for disclosure/popover
render() {
  return html`
    <div class="popover-trigger" part="trigger">
      <slot
        @slotchange=${this.handleSlotChange}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleTriggerKeyDown}
      ></slot>
    </div>
    ${this.isOpen && !isServer ? html`
      <div
        class="popover-panel"
        part="popover"
        popover="auto"
        role="dialog"
        aria-label=${this.ariaLabel || nothing}
      >
        <div class="popover-content" part="content">
          <slot name="content"></slot>
        </div>
        ${this.arrow ? html`<div class="popover-arrow" part="arrow"></div>` : nothing}
      </div>
    ` : nothing}
  `;
}

// Set aria-expanded and aria-haspopup on trigger element
private updateTriggerAria(): void {
  if (this.triggerEl) {
    this.triggerEl.setAttribute('aria-expanded', String(this.isOpen));
    this.triggerEl.setAttribute('aria-haspopup', 'dialog');
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `z-index` stacking with `position: fixed/absolute` | Native Popover API top layer | Baseline 2024 | No z-index fighting; always above normal content |
| Manual click-outside listeners | Popover API `auto` light dismiss | Baseline 2024 | Handles edge cases (iframes, shadow DOM) automatically |
| JS-based enter/exit animations | CSS `@starting-style` + `allow-discrete` + `:popover-open` | Baseline 2024 | Pure CSS, declarative, GPU-accelerated |
| Popper.js | Floating UI | 2022 | Smaller, tree-shakeable, middleware-based architecture |
| CSS Anchor Positioning (future) | Floating UI positioning | CSS Anchor Positioning in Interop 2025 | Not yet cross-browser; Floating UI remains the practical choice |

**Deprecated/outdated:**
- `popover="hint"`: Not yet in Baseline. Excluded per requirements (Safari negative).
- CSS Anchor Positioning: Excluded per requirements (too new, not cross-browser).
- Popper.js: Replaced by Floating UI.

## Open Questions

1. **Modal Focus Trapping Strategy**
   - What we know: POP-07 requires modal mode that traps focus like Dialog. The dialog component uses native `<dialog>` with `showModal()` for this. The popover component is non-modal by default.
   - What's unclear: Whether to use a `<dialog>` element for modal mode (provides native focus trap) or implement a manual focus trap. Using `<dialog>` in modal mode would conflict with the popover panel's `popover` attribute behavior.
   - Recommendation: For modal mode, implement a manual focus trap (sentinel focus elements at start/end that redirect focus back into the popover). This avoids mixing `<dialog>` and popover semantics. The focus trap only activates when `modal` property is true.

2. **Nested Popover Detection Across Shadow DOM**
   - What we know: Native Popover API handles nesting via DOM ancestry or `anchor` attribute. Shadow DOM can obscure these relationships.
   - What's unclear: Whether `popover="auto"` nesting detection works reliably when popovers are in separate shadow roots (e.g., `<lui-popover>` inside another `<lui-popover>`).
   - Recommendation: Test during implementation. If native nesting fails, implement manual parent-child tracking: walk up the composed DOM tree in `connectedCallback` to find ancestor `lui-popover` elements. Use a `WeakSet` or custom events to coordinate close behavior.

3. **Popover API in JSDOM (Testing)**
   - What we know: JSDOM does not implement the Popover API. Tests using JSDOM will not be able to test `showPopover()`/`hidePopover()`.
   - What's unclear: What testing infrastructure the project uses (Vitest with JSDOM vs browser-based testing).
   - Recommendation: Feature-detect `'popover' in HTMLElement.prototype` and provide the `position: fixed` fallback path. This ensures the component works in test environments without Popover API support.

## Sources

### Primary (HIGH confidence)
- Codebase: `packages/tooltip/src/tooltip.ts` - Reference implementation for Floating UI + Lit pattern
- Codebase: `packages/core/src/floating/index.ts` - Shared positioning utilities with Shadow DOM fix
- Codebase: `packages/core/src/styles/tailwind.css` - Popover CSS custom properties already defined (lines 707-718)
- Codebase: `packages/core/src/styles/overlay-animation.css` - Animation pattern reference with popover example
- Codebase: `packages/core/src/tokens/index.ts` - Popover token type definitions already defined
- Codebase: `packages/dialog/src/dialog.ts` - Focus restoration and modal behavior reference
- Codebase: `packages/select/src/select.ts` - Click-outside detection pattern (`handleDocumentClick` with `composedPath()`)
- Codebase: `packages/cli/src/registry/registry.json` - Registry entry format for CLI
- Codebase: `packages/cli/src/templates/index.ts` - Copy-source template format
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) - API overview and browser support
- [MDN: Using the Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using) - Nesting, events, animation patterns

### Secondary (MEDIUM confidence)
- [Floating UI Discussion #2196](https://github.com/floating-ui/floating-ui/discussions/2196) - Popover API integration discussion
- [WebKit Bug 259261](https://bugs.webkit.org/show_bug.cgi?id=259261) - Shadow DOM popover nesting fix (RESOLVED FIXED)

### Tertiary (LOW confidence)
- [WHATWG HTML Issue #11537](https://github.com/whatwg/html/issues/11537) - Open spec issue about `popovertarget` across shadow DOM boundaries (UNRESOLVED). Affects declarative `popovertarget` but NOT programmatic `showPopover()`/`hidePopover()`.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in workspace, patterns proven by tooltip
- Architecture: HIGH - Direct extension of tooltip pattern with well-documented Popover API
- Pitfalls: HIGH - Shadow DOM issues identified with specific mitigations; animation patterns verified against MDN
- Nested popovers: MEDIUM - Native API nesting works in theory, but cross-shadow-root behavior needs testing during implementation

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (stable domain, Popover API is Baseline)
