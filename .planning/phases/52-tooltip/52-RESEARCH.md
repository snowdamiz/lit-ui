# Phase 52: Tooltip - Research

**Researched:** 2026-02-02
**Domain:** Accessible tooltip web component with Floating UI positioning, delay management, and touch device handling
**Confidence:** HIGH

## Summary

Phase 52 builds a `<lui-tooltip>` web component as a new `@lit-ui/tooltip` package. The component wraps any trigger element and displays non-interactive hint text on hover and keyboard focus. All positioning infrastructure is already built in Phase 51 (`@lit-ui/core/floating`), CSS tokens are defined (`--ui-tooltip-*`), and the animation pattern is documented (`overlay-animation.css`). This phase is primarily component authoring, not infrastructure.

The tooltip follows WAI-ARIA's tooltip pattern: `role="tooltip"` on the popup, `aria-describedby` linking trigger to tooltip, Escape to dismiss, and non-interactive content only. Since both trigger and tooltip live inside the same Shadow DOM, `aria-describedby` works with standard `id` references (no cross-shadow-root issues). The delay group feature (TIP-09) requires a shared module-level timer that tooltip instances coordinate through, similar to Tippy.js's singleton pattern but implemented as a simple shared state object.

**Primary recommendation:** Build as a single-file `tooltip.ts` component extending TailwindElement. Use `@lit-ui/core/floating` for positioning with `flip`, `shift`, `offset`, and `arrow` middleware. Implement delay group via a module-level `TooltipDelayGroup` singleton. Use `pointerType` check to skip touch events. Use AbortController for all event listener cleanup in `disconnectedCallback`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@lit-ui/core/floating` | workspace | Shadow DOM-safe `computePosition` + `autoUpdatePosition` | Built in Phase 51 specifically for this use case. Includes `composed-offset-position` fix. |
| `lit` | ^3.3.2 | Base framework (peer dep) | Project standard. TailwindElement base class. |
| `@lit-ui/core` | workspace | TailwindElement, tailwindBaseStyles, isServer, dispatchCustomEvent | Project standard base. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@floating-ui/dom` (via core/floating) | ^1.7.4 | `flip`, `shift`, `offset`, `arrow` middleware | All 12 placement options, collision avoidance, arrow positioning |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom delay group | Floating UI React's `FloatingDelayGroup` | React-only, not available in `@floating-ui/dom`. Must implement manually for vanilla JS/Lit. Simple shared timer is ~30 lines. |
| `popover` attribute for top-layer | Absolute/fixed positioning in Shadow DOM | Popover API puts element in top layer (escapes stacking contexts). But tooltips are small and `position: fixed` with Floating UI already handles most cases. `popover` adds complexity (need `showPopover()`/`hidePopover()` lifecycle). **Recommendation: Use `position: fixed` strategy, not Popover API.** Tooltip z-index of 50 is sufficient. |
| CSS-only tooltip (no JS) | `:hover` / `:focus-visible` with CSS | Cannot implement delays, delay groups, touch device filtering, dynamic positioning, or programmatic show/hide. Not viable for requirements. |

**Installation:**
```bash
# No new dependencies needed -- tooltip uses @lit-ui/core/floating which is already built
pnpm create @lit-ui/tooltip  # (new package scaffolding)
```

## Architecture Patterns

### Recommended Package Structure
```
packages/tooltip/
  src/
    tooltip.ts          # Main component (<lui-tooltip>)
    delay-group.ts      # Module-level delay group singleton
    index.ts            # Public exports
    jsx.d.ts            # JSX type declarations
    vite-env.d.ts       # Vite env types
  package.json          # @lit-ui/tooltip package
  tsconfig.json         # Extends shared config
  vite.config.ts        # Uses createLibraryConfig
```

### Pattern 1: Tooltip Component Structure (Wrapper Pattern)

**What:** The tooltip wraps a trigger element via a default slot. The tooltip content is rendered conditionally alongside the trigger, positioned by Floating UI. Both trigger and tooltip are inside the same shadow root.

**When to use:** This is the only pattern for `<lui-tooltip>`.

**Example:**
```html
<!-- Consumer usage -->
<lui-tooltip content="Save document" placement="top">
  <button>Save</button>
</lui-tooltip>
```

```typescript
// Internal shadow DOM structure
render() {
  return html`
    <div class="tooltip-trigger" part="trigger">
      <slot
        @slotchange=${this.handleSlotChange}
        @pointerenter=${this.handlePointerEnter}
        @pointerleave=${this.handlePointerLeave}
        @focusin=${this.handleFocusIn}
        @focusout=${this.handleFocusOut}
        @keydown=${this.handleKeyDown}
      ></slot>
    </div>
    ${this.open ? html`
      <div
        id="tooltip"
        role="tooltip"
        part="tooltip"
        class="tooltip-panel"
        data-open
        @pointerenter=${this.handleTooltipPointerEnter}
        @pointerleave=${this.handleTooltipPointerLeave}
      >
        <div class="tooltip-content" part="content">
          ${this.content}
          <slot name="content"></slot>
        </div>
        ${this.arrow ? html`<div class="tooltip-arrow" part="arrow"></div>` : nothing}
      </div>
    ` : nothing}
  `;
}
```

**Key design decisions:**
- **Wrapper component** (not attribute directive): Lit web components can't be attribute directives. The wrapper pattern is standard for Lit tooltip implementations.
- **`aria-describedby` linking:** Set on the slotted trigger element via `slotchange` handler. Since both trigger and tooltip share the same shadow root, `id="tooltip"` + `aria-describedby="tooltip"` works correctly.
- **Conditional rendering vs. display:none:** Use conditional rendering (`${this.open ? ... : nothing}`) so the tooltip DOM is only present when visible. This is simpler for animations via `@starting-style` -- the element enters the DOM in the "from" state, transitions to "to" state.

### Pattern 2: Delay Group Singleton

**What:** A module-level object that tracks when the last tooltip closed. When a new tooltip opens within a configurable window (default 300ms) of another tooltip closing, it skips the show delay entirely.

**When to use:** TIP-09 requires delay group behavior. All tooltip instances on a page share the same delay group automatically.

**Example:**
```typescript
// delay-group.ts
class TooltipDelayGroup {
  private lastCloseTimestamp = 0;
  private windowMs = 300;

  /** Record that a tooltip just closed */
  notifyClosed(): void {
    this.lastCloseTimestamp = Date.now();
  }

  /** Check if we're within the delay group window */
  isInGroupWindow(): boolean {
    return Date.now() - this.lastCloseTimestamp < this.windowMs;
  }
}

// Singleton shared across all tooltip instances on the page
export const delayGroup = new TooltipDelayGroup();
```

**Usage in tooltip:**
```typescript
private scheduleShow(): void {
  const delay = delayGroup.isInGroupWindow() ? 0 : this.showDelay;
  this.showTimeout = setTimeout(() => this.show(), delay);
}

private scheduleHide(): void {
  this.hideTimeout = setTimeout(() => {
    this.hide();
    delayGroup.notifyClosed();
  }, this.hideDelay);
}
```

### Pattern 3: Touch Device Filtering via pointerType

**What:** Check `event.pointerType` on `pointerenter` to skip tooltip activation for touch input. Tooltips should never appear on touch devices (TIP-12) since there's no hover concept.

**When to use:** Every pointer event handler on the tooltip trigger.

**Example:**
```typescript
private handlePointerEnter(e: PointerEvent): void {
  // Skip touch -- tooltips are hover-only (TIP-12)
  if (e.pointerType === 'touch') return;
  this.scheduleShow();
}
```

### Pattern 4: Arrow Positioning with Floating UI

**What:** The `arrow` middleware from Floating UI calculates the arrow's position relative to the trigger. After `computePosition`, read `middlewareData.arrow` for x/y coordinates and set them on the arrow element. The arrow's side (which edge of the tooltip it appears on) is derived from the resolved `placement`.

**When to use:** When `arrow` property is true (TIP-05).

**Example:**
```typescript
private async updatePosition(): Promise<void> {
  if (!this.triggerEl || !this.tooltipEl) return;

  const middleware = [
    offset(8),
    flip(),
    shift({ padding: 8 }),
  ];

  if (this.arrow && this.arrowEl) {
    middleware.push(arrow({ element: this.arrowEl, padding: 4 }));
  }

  const { x, y, placement, middlewareData } = await computePosition(
    this.triggerEl,
    this.tooltipEl,
    {
      placement: this.placement,
      strategy: 'fixed',
      middleware,
    }
  );

  Object.assign(this.tooltipEl.style, {
    left: `${x}px`,
    top: `${y}px`,
  });

  // Position arrow based on resolved placement
  if (this.arrow && middlewareData.arrow && this.arrowEl) {
    const { x: ax, y: ay } = middlewareData.arrow;
    const side = placement.split('-')[0]; // 'top' | 'bottom' | 'left' | 'right'
    const staticSide = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[side]!;

    Object.assign(this.arrowEl.style, {
      left: ax != null ? `${ax}px` : '',
      top: ay != null ? `${ay}px` : '',
      [staticSide]: '-4px', // half arrow size
    });
  }
}
```

### Pattern 5: AbortController for Event Listener Cleanup (TIP-15)

**What:** Use an AbortController to register all document-level event listeners. Abort in `disconnectedCallback` for clean teardown.

**When to use:** For any listeners added outside the component's shadow DOM template (e.g., document-level Escape key).

**Example:**
```typescript
private abortController?: AbortController;

override connectedCallback(): void {
  super.connectedCallback();
  if (isServer) return;

  this.abortController = new AbortController();
  const { signal } = this.abortController;

  // Escape key listener at document level
  document.addEventListener('keydown', this.handleDocumentKeyDown, { signal });
}

override disconnectedCallback(): void {
  super.disconnectedCallback();
  this.abortController?.abort();
  this.cleanupAutoUpdate?.();
  clearTimeout(this.showTimeout);
  clearTimeout(this.hideTimeout);
}
```

### Anti-Patterns to Avoid

- **Using `@floating-ui/dom` directly instead of `@lit-ui/core/floating`:** The core wrapper includes the Shadow DOM `composed-offset-position` fix. Direct import skips this.
- **Attaching `aria-describedby` to the host element:** It must go on the actual trigger element (the slotted child), not the `<lui-tooltip>` wrapper. Use `slotchange` to find and annotate the first slotted element.
- **Using `mouseenter`/`mouseleave` instead of `pointerenter`/`pointerleave`:** Pointer events provide `pointerType` for touch filtering. Mouse events don't distinguish input type.
- **Forgetting hide delay (TIP-11):** Without a ~100ms hide delay, moving the cursor from trigger to tooltip (crossing the gap) causes flicker. The hide delay gives users time to reach the tooltip content.
- **Using `display: none` toggling for animation:** Conditional rendering (`nothing` in Lit) combined with `@starting-style` is cleaner. The element enters the DOM already in its "from" state, triggering the entry transition.
- **Putting interactive content in tooltip:** Tooltips are `role="tooltip"` -- screen readers treat them as descriptive text, not interactive regions. Interactive content must use Popover (Phase 53).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tooltip positioning | Manual `getBoundingClientRect` + viewport math | `@lit-ui/core/floating` with `computePosition` | 12 placements, collision detection (flip/shift), scroll handling, Shadow DOM fix already integrated |
| Arrow position calculation | Manual trigonometry for arrow placement | `arrow()` middleware from `@lit-ui/core/floating` | Handles placement flips, boundary edges, padding -- returns exact pixel coordinates |
| Scroll/resize repositioning | `scroll`/`resize` event listeners | `autoUpdatePosition` from `@lit-ui/core/floating` | Uses ResizeObserver + IntersectionObserver internally, more efficient than event listeners |
| Enter/exit CSS animations | JS-managed animation states + `transitionend` | `@starting-style` + `allow-discrete` pattern (from `overlay-animation.css`) | Zero JS overhead, proven in Dialog, handles both enter and exit |
| Touch device detection | `navigator.maxTouchPoints` or user agent parsing | `PointerEvent.pointerType === 'touch'` | Per-event accuracy, no false positives on hybrid devices (Surface, iPad with keyboard) |

**Key insight:** Nearly everything complex is already solved by Phase 51 infrastructure or browser APIs. The tooltip component is primarily event handling (show/hide timing), ARIA attribute management, and CSS styling. The hardest custom logic is the delay group (~30 lines) and the show/hide state machine (~50 lines).

## Common Pitfalls

### Pitfall 1: aria-describedby Not Announcing in Screen Readers

**What goes wrong:** Screen reader doesn't announce tooltip text when trigger receives focus.
**Why it happens:** `aria-describedby` references an `id` that doesn't exist in the same scope. If the tooltip DOM is not yet rendered (conditional rendering), the ID doesn't exist when the screen reader queries it.
**How to avoid:** Two approaches: (1) Always render the tooltip DOM but use `display: none` / `opacity: 0`, so the `id` target always exists. (2) Dynamically set `aria-describedby` only when the tooltip is visible, and remove it when hidden. **Recommendation: Use approach (2)** -- set `aria-describedby` on the trigger when tooltip opens, remove when it closes. This is the Floating UI React pattern and works reliably. The screen reader re-queries the description when `aria-describedby` changes.
**Warning signs:** Tooltip visually appears on focus but NVDA/VoiceOver doesn't announce tooltip text.

### Pitfall 2: Tooltip Flickers When Moving Cursor from Trigger to Tooltip

**What goes wrong:** Moving the mouse from the trigger element to the tooltip causes the tooltip to briefly hide and reshow.
**Why it happens:** There's typically a gap between the trigger and the tooltip (from the `offset` middleware). When the cursor leaves the trigger, `pointerleave` fires and starts the hide timer. If the cursor reaches the tooltip before the timer expires, the tooltip stays open. But if the gap is too large or there's no hide delay, the tooltip disappears.
**How to avoid:** Implement the 100ms hide delay (TIP-11). On `pointerenter` of the tooltip element itself, cancel the hide timer. This gives users time to "bridge the gap."
**Warning signs:** Tooltip works when cursor stays on trigger but disappears when user tries to read the tooltip content.

### Pitfall 3: Tooltip Shows on Touch Tap

**What goes wrong:** On mobile devices, tapping a button with a tooltip briefly shows the tooltip.
**Why it happens:** Touch taps generate `pointerenter` events on some browsers. Without `pointerType` filtering, the tooltip opens.
**How to avoid:** Check `event.pointerType === 'touch'` in the `pointerenter` handler and bail early (TIP-12). Do NOT use `@media (hover: hover)` CSS queries alone -- they don't prevent JS event handlers from firing.
**Warning signs:** Tooltip appears briefly on tap on iOS Safari or Android Chrome.

### Pitfall 4: Multiple Tooltips Open Simultaneously

**What goes wrong:** Two tooltips appear at once when quickly moving between triggers.
**Why it happens:** The hide delay on the first tooltip hasn't expired when the second tooltip's show delay completes. Both are now visible.
**How to avoid:** When a new tooltip starts its show sequence, it should check if any other tooltip is currently visible and immediately close it. The delay group singleton can track the currently-open tooltip instance and close it before opening a new one.
**Warning signs:** Moving quickly between tooltip triggers shows stacked tooltips.

### Pitfall 5: Memory Leak from autoUpdate Not Cleaned Up

**What goes wrong:** After component removal, scroll/resize listeners continue running.
**Why it happens:** `autoUpdatePosition` returns a cleanup function that must be called. If the component is removed from the DOM without calling it, the listeners leak.
**How to avoid:** Store the cleanup function and call it in `disconnectedCallback`. Also call it when hiding the tooltip (no need to track position when invisible). Only start `autoUpdate` when the tooltip becomes visible.
**Warning signs:** Performance degrades over time in SPAs where tooltip components are frequently added/removed.

### Pitfall 6: SSR Renders Tooltip Content Visibly

**What goes wrong:** During SSR, tooltip content appears as visible text next to the trigger.
**Why it happens:** No isServer guard on tooltip rendering. The tooltip DOM renders in the SSR output without CSS to hide it.
**How to avoid:** Guard tooltip rendering with `!isServer` check (TIP-14). Only the trigger slot should render during SSR. The tooltip panel should be completely absent from SSR output.
**Warning signs:** Server-rendered page shows tooltip text before hydration.

## Code Examples

### Complete Tooltip Property Interface

```typescript
// Source: WAI-ARIA tooltip pattern + requirements TIP-01 through TIP-16
import { property, state, query } from 'lit/decorators.js';
import type { Placement } from '@lit-ui/core/floating';

export class Tooltip extends TailwindElement {
  /** Text content for the tooltip. Alternative to the content slot. */
  @property({ type: String })
  content = '';

  /** Preferred placement relative to trigger. Floating UI may flip if space is insufficient. */
  @property({ type: String })
  placement: Placement = 'top';

  /** Delay in ms before showing tooltip on hover (TIP-01) */
  @property({ type: Number, attribute: 'show-delay' })
  showDelay = 300;

  /** Delay in ms before hiding tooltip after pointer leaves (TIP-11) */
  @property({ type: Number, attribute: 'hide-delay' })
  hideDelay = 100;

  /** Whether to show an arrow pointing at the trigger (TIP-05) */
  @property({ type: Boolean })
  arrow = true;

  /** Whether the tooltip is currently visible */
  @state()
  private open = false;

  /** Offset distance from trigger in pixels */
  @property({ type: Number })
  offset = 8;

  /** Whether this is a rich tooltip with title + description (TIP-10) */
  @property({ type: Boolean })
  rich = false;

  /** Title text for rich tooltip variant */
  @property({ type: String })
  title = '';
}
```

### CSS Styles with Token Variables (TIP-16)

```css
/* Source: overlay-animation.css tooltip example + --ui-tooltip-* tokens */
:host {
  display: inline-block;
  position: relative;
}

.tooltip-panel {
  position: fixed;
  z-index: var(--ui-tooltip-z-index);
  pointer-events: auto;
  max-width: var(--ui-tooltip-max-width);

  /* Animation (TIP-13 respected via prefers-reduced-motion) */
  opacity: 0;
  transition:
    opacity 100ms ease-out,
    display 100ms allow-discrete,
    overlay 100ms allow-discrete;
}

.tooltip-panel[data-open] {
  opacity: 1;
}

@starting-style {
  .tooltip-panel[data-open] {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tooltip-panel {
    transition: none;
  }
}

.tooltip-content {
  background: var(--ui-tooltip-bg);
  color: var(--ui-tooltip-text);
  border-radius: var(--ui-tooltip-radius);
  padding: var(--ui-tooltip-padding-y) var(--ui-tooltip-padding-x);
  font-size: var(--ui-tooltip-font-size);
  box-shadow: var(--ui-tooltip-shadow);
  line-height: 1.4;
}

/* Rich tooltip variant (TIP-10) */
:host([rich]) .tooltip-content {
  padding: 0.75rem 1rem;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.tooltip-description {
  opacity: 0.9;
}

/* Arrow (TIP-05) */
.tooltip-arrow {
  position: absolute;
  width: var(--ui-tooltip-arrow-size);
  height: var(--ui-tooltip-arrow-size);
  background: var(--ui-tooltip-bg);
  transform: rotate(45deg);
}
```

### SlotChange Handler for aria-describedby

```typescript
// Source: WAI-ARIA tooltip pattern requirement (TIP-06)
private triggerEl: HTMLElement | null = null;

private handleSlotChange(e: Event): void {
  const slot = e.target as HTMLSlotElement;
  const assigned = slot.assignedElements({ flatten: true });
  const trigger = assigned[0] as HTMLElement | undefined;

  if (trigger) {
    this.triggerEl = trigger;
    // Don't set aria-describedby yet -- only when tooltip is visible
  }
}

private show(): void {
  this.open = true;
  // Set aria-describedby when tooltip becomes visible
  if (this.triggerEl) {
    this.triggerEl.setAttribute('aria-describedby', 'tooltip');
  }
  // Start autoUpdate for repositioning (TIP-08)
  this.updateComplete.then(() => {
    this.startAutoUpdate();
  });
}

private hide(): void {
  this.open = false;
  // Remove aria-describedby when tooltip hides
  if (this.triggerEl) {
    this.triggerEl.removeAttribute('aria-describedby');
  }
  // Stop autoUpdate (no need to reposition when invisible)
  this.cleanupAutoUpdate?.();
}
```

### Complete Show/Hide State Machine

```typescript
// Source: Requirements TIP-01, TIP-02, TIP-03, TIP-11, TIP-12
private showTimeout?: ReturnType<typeof setTimeout>;
private hideTimeout?: ReturnType<typeof setTimeout>;
private cleanupAutoUpdate?: () => void;

private scheduleShow(): void {
  clearTimeout(this.hideTimeout);
  if (this.open) return;

  const delay = delayGroup.isInGroupWindow() ? 0 : this.showDelay;
  this.showTimeout = setTimeout(() => this.show(), delay);
}

private scheduleHide(): void {
  clearTimeout(this.showTimeout);
  if (!this.open) return;

  this.hideTimeout = setTimeout(() => {
    this.hide();
    delayGroup.notifyClosed();
  }, this.hideDelay);
}

private cancelScheduledHide(): void {
  clearTimeout(this.hideTimeout);
}

// Pointer handlers (TIP-01, TIP-12)
private handlePointerEnter = (e: PointerEvent): void => {
  if (e.pointerType === 'touch') return;
  this.scheduleShow();
};

private handlePointerLeave = (e: PointerEvent): void => {
  if (e.pointerType === 'touch') return;
  this.scheduleHide();
};

// Tooltip hover bridge (TIP-11)
private handleTooltipPointerEnter = (): void => {
  this.cancelScheduledHide();
};

private handleTooltipPointerLeave = (): void => {
  this.scheduleHide();
};

// Focus handlers (TIP-02)
private handleFocusIn = (): void => {
  this.scheduleShow();
};

private handleFocusOut = (): void => {
  this.scheduleHide();
};

// Escape key (TIP-03)
private handleKeyDown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape' && this.open) {
    e.preventDefault();
    this.hide();
    delayGroup.notifyClosed();
  }
};
```

### Package Configuration

```json
// packages/tooltip/package.json (following button/dialog pattern)
{
  "name": "@lit-ui/tooltip",
  "version": "1.0.0",
  "description": "Accessible tooltip component built with Lit and Tailwind CSS",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "sideEffects": true,
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  },
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  },
  "devDependencies": {
    "@lit-ui/core": "workspace:*",
    "@lit-ui/typescript-config": "workspace:*",
    "@lit-ui/vite-config": "workspace:*",
    "@tailwindcss/vite": "^4.1.18",
    "lit": "^3.3.2",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  }
}
```

```typescript
// packages/tooltip/vite.config.ts
import { createLibraryConfig } from '@lit-ui/vite-config/library';

export default createLibraryConfig({
  entry: 'src/index.ts'
});
```

### CLI Registry Entry (TIP-17)

```json
// Addition to packages/cli/src/registry/registry.json
{
  "name": "tooltip",
  "description": "Accessible tooltip with hover/focus triggers, Floating UI positioning, delay groups, and arrow indicators",
  "files": [
    { "path": "components/tooltip/tooltip.ts", "type": "component" }
  ],
  "dependencies": ["@floating-ui/dom", "composed-offset-position"],
  "registryDependencies": []
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `title` attribute for native tooltip | Custom `role="tooltip"` element with `aria-describedby` | WAI-ARIA 1.1+ (long-standing) | Styled, positioned, accessible tooltip with delay control |
| `mouseenter`/`mouseleave` for show/hide | `pointerenter`/`pointerleave` with `pointerType` check | Pointer Events baseline (~2020) | Unified mouse/pen/touch handling, touch filtering per event |
| JS animation management | `@starting-style` + `transition-behavior: allow-discrete` | Baseline Aug 2024 (~88%+ support) | Pure CSS enter/exit animations, zero JS overhead |
| `z-index: 99999` stacking | `position: fixed` + Floating UI collision detection | Floating UI v1+ | Reliable viewport-aware positioning without z-index wars |
| Tippy.js / Popper.js for positioning | `@floating-ui/dom` (Popper.js successor) | Floating UI v1 (2022) | Smaller, framework-agnostic, better middleware system |

**Deprecated/outdated:**
- **Tippy.js**: Still works but is in maintenance mode. The author (atomiks) recommends Floating UI + custom implementation for new projects.
- **`title` attribute**: Not stylable, inconsistent delay, no accessibility control. Not suitable for design system components.
- **`@media (hover: hover)` as sole touch guard**: Doesn't prevent JS event handlers from firing. Must use `pointerType` check in addition.

## Open Questions

1. **Should tooltip use `popover` attribute for top-layer rendering?**
   - What we know: The Popover API puts elements in the top layer, escaping all stacking contexts. This is important for z-index reliability.
   - What's unclear: Whether `popover="manual"` adds UX or complexity for a tooltip (small, non-interactive, transient). Popover API requires `showPopover()`/`hidePopover()` calls and has its own lifecycle.
   - Recommendation: **Start without Popover API.** Use `position: fixed` with `z-index: 50` (the token default). Tooltips are small and non-interactive -- stacking context issues are less common than with full overlays. Can add Popover API later if stacking issues arise in practice.

2. **Should the delay group track the currently-open instance to force-close it?**
   - What we know: Moving quickly between tooltip triggers can cause brief overlap if hide delay on the old tooltip hasn't expired when the new one opens.
   - What's unclear: Whether force-closing the old tooltip (via the delay group singleton tracking the active instance) is better UX than letting hide delays run naturally.
   - Recommendation: **Track and force-close.** The delay group singleton should store a reference to the currently-open tooltip. When a new tooltip calls `scheduleShow()`, it immediately closes the previous one. This prevents visual overlap and is the behavior users expect from well-polished tooltip systems.

3. **Rich tooltip (TIP-10): content slot or title/description properties?**
   - What we know: TIP-10 specifies "title + description text for feature explanations." This could be two string properties or two named slots.
   - What's unclear: Which API is more ergonomic for consumers.
   - Recommendation: **Both.** Provide `title` property and `content` property for simple cases, plus named slots (`slot="title"`, `slot="content"`) for rich HTML content. Property values render first; slot content overrides if provided. This matches the existing Dialog pattern (string title property + title slot).

## Sources

### Primary (HIGH confidence)
- [WAI-ARIA Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) - `role="tooltip"`, `aria-describedby`, Escape key, non-interactive content
- [Floating UI tooltip guide](https://floating-ui.com/docs/tooltip) - Delay groups, hover/focus/dismiss behavior, touch handling notes
- [Floating UI arrow middleware](https://floating-ui.com/docs/arrow) - Arrow positioning data structure, padding option
- [MDN PointerEvent.pointerType](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType) - Touch vs mouse vs pen detection
- LitUI codebase: `packages/core/src/floating/index.ts` - Shadow DOM-safe positioning wrapper (Phase 51)
- LitUI codebase: `packages/core/src/styles/overlay-animation.css` - Tooltip animation reference pattern
- LitUI codebase: `packages/core/src/tokens/index.ts` - Tooltip token objects
- LitUI codebase: `packages/core/src/styles/tailwind.css` - `--ui-tooltip-*` CSS custom properties
- LitUI codebase: `packages/dialog/src/dialog.ts` - TailwindElement pattern, animation CSS, static styles pattern
- LitUI codebase: `packages/button/package.json` - Package structure, vite.config, peer dependencies
- LitUI codebase: `packages/cli/src/registry/registry.json` - CLI registry entry format

### Secondary (MEDIUM confidence)
- [web.dev Building a Tooltip Component](https://web.dev/articles/building/a-tooltip-component) - CSS-first tooltip custom element approach, `inert` attribute, screen reader prompts
- [Tooltips on Touchscreens](https://mayank.co/blog/tooltips-on-touchscreens/) - `pointerType` filtering, `isTapping` state, long-press detection approach (recommended against long-press for our case per TIP-12)

### Tertiary (LOW confidence)
- None - all findings verified against official docs or codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in codebase (`@lit-ui/core/floating`, `lit`, Tailwind). No new external dependencies.
- Architecture: HIGH - Wrapper pattern follows existing Lit component conventions. All code examples derived from codebase patterns (Dialog, Select) and verified Floating UI APIs.
- Pitfalls: HIGH - Pitfalls 1-3 verified via WAI-ARIA spec, Floating UI docs, and PointerEvent MDN. Pitfalls 4-6 derived from codebase analysis and common tooltip implementation issues.
- Code examples: HIGH - All examples follow verified patterns from existing packages and Phase 51 infrastructure.

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (stable domain, 30 days)
