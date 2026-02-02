# Stack Research: Toast, Tooltip, and Popover Overlay Components

**Project:** LitUI Overlay/Feedback Components
**Researched:** 2026-02-02
**Confidence:** HIGH (existing stack verified in codebase, browser APIs verified via CanIUse/MDN, Floating UI docs verified via official site)

## Executive Summary

Toast, Tooltip, and Popover require **zero new npm dependencies**. The existing `@floating-ui/dom` (^1.7.4) already in the project covers all positioning needs, including arrow middleware for tooltips. The Popover API (Baseline Widely Available, ~95%+ support) provides top-layer rendering for all three components. CSS `@starting-style` (~88% support) enables pure-CSS enter/exit animations for top-layer elements. Swipe-to-dismiss for toasts uses the same Pointer Events + `setPointerCapture` pattern already proven in the Time Picker.

**Key decisions:**
- Reuse `@floating-ui/dom` with `arrow` and `autoUpdate` middleware (already a dependency)
- Use native Popover API (`popover="manual"`) for top-layer promotion -- no z-index management needed
- Build toast queue management from scratch (no library -- framework-agnostic requirement eliminates all existing toast libraries)
- CSS `@starting-style` + `transition-behavior: allow-discrete` for enter/exit animations, with `@keyframes` fallback
- Pointer Events for swipe-to-dismiss (pattern exists in `time-range-slider.ts` and `clock-face.ts`)

---

## Recommended Stack (All Existing -- Zero New Dependencies)

### Core Framework (No Changes)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Lit | ^3.3.2 | Component framework | Already in use |
| @lit-ui/core | workspace:* | TailwindElement base class, design tokens | Already in use |
| Tailwind CSS | ^4.x | Utility classes in Shadow DOM | Already in use |
| TypeScript | ^5.9.x | Type safety | Already in use |

### Existing Dependency Reuse

| Package | Version | Already Used By | New Usage |
|---------|---------|----------------|-----------|
| `@floating-ui/dom` | ^1.7.4 | Select, DatePicker, TimePicker | Tooltip positioning + arrow, Popover positioning |

### New Floating UI Imports (Same Package, New Middleware)

The following are **already installed** via `@floating-ui/dom` but not yet used in the project:

| Import | Purpose | Used For |
|--------|---------|----------|
| `arrow` | Position arrow element relative to reference | Tooltip arrow, Popover arrow |
| `autoUpdate` | Keep floating element positioned during scroll/resize | Tooltip, Popover (auto-reposition while open) |

The existing Select component uses `computePosition`, `flip`, `shift`, `offset`, and `size`. Tooltip and Popover add `arrow` and `autoUpdate` from the same package.

---

## 1. Toast Notification Management: Build From Scratch

### Why Not Use a Library

| Library | Why Not |
|---------|---------|
| Sonner | React-only. Uses React state, portals, and hooks. Cannot be used in web components. |
| React Hot Toast | React-only. Same issue. |
| React Toastify | React-only. Same issue. |
| toast-queue | Vanilla JS but opinionated about DOM structure. Would fight Shadow DOM encapsulation. |
| Notyf / Toastify-js | Vanilla JS but inject their own styles globally. Incompatible with Shadow DOM styling. |

**Verdict:** All mature toast libraries are either React-specific or inject global DOM/styles, both incompatible with a framework-agnostic web component library using Shadow DOM. Build it.

### Toast Architecture Pattern

**Recommended approach** (based on web.dev toast component pattern and Sonner's UX patterns):

```
lui-toast-provider (singleton container, renders in top-layer)
  --> manages queue, stacking, position
  --> renders lui-toast instances

lui-toast (individual toast element)
  --> handles swipe-to-dismiss
  --> auto-dismiss timer
  --> pause-on-hover
```

**Queue Management:**
- Configurable `maxVisible` (default: 3-5)
- FIFO queue: oldest toast dismissed first when max exceeded
- Toasts stack via CSS flexbox with `gap`, using `flex-direction: column-reverse` for bottom positioning or `column` for top
- New toasts animate in; displaced toasts animate position via CSS transitions on `transform`

**Position Management:**
- 6 positions: `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`, `bottom-end`
- Container uses `position: fixed` + logical properties (`inset-block-start`/`inset-block-end`, `inset-inline-start`/`inset-inline-end`)
- No Floating UI needed for toast positioning (toasts are viewport-anchored, not element-anchored)

**Stacking Algorithm:**
- Visible toasts rendered in a flex container with gap
- Behind-stack toasts (beyond maxVisible) get `transform: scale(0.95) translateY(8px)` with decreasing opacity
- When front toast dismisses, next queued toast animates in from the entry edge

### HTML Element and Accessibility

Use `<output>` element with `role="status"` inside the toast, following web.dev guidance:
- `<output>` is announced to screen readers without requiring focus
- `role="status"` provides a live region with `aria-live="polite"` semantics
- Action toasts (with buttons) use `role="alert"` + `aria-live="assertive"` for urgency

### Auto-Dismiss Timing

| Toast Type | Default Duration | Rationale |
|------------|-----------------|-----------|
| Info/success | 5000ms | Standard notification duration |
| Warning | 8000ms | Slightly longer for user to read |
| Error | Infinity (manual dismiss) | Errors should not auto-dismiss |
| With action | Infinity | User needs time to act |

Timer pauses on hover (`pointerenter`) and resumes on leave (`pointerleave`).

---

## 2. Tooltip and Popover Positioning: Reuse Floating UI

### Tooltip: Floating UI + Arrow Middleware

The existing `@floating-ui/dom` package includes everything needed:

```typescript
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,    // NEW: arrow positioning
  autoUpdate // NEW: reposition on scroll/resize
} from '@floating-ui/dom';
```

**Arrow middleware usage** (verified via Floating UI official docs):

```typescript
const arrowEl = this.shadowRoot!.querySelector('.tooltip-arrow')!;

const cleanup = autoUpdate(referenceEl, tooltipEl, async () => {
  const { x, y, placement, middlewareData } = await computePosition(
    referenceEl,
    tooltipEl,
    {
      placement: 'top',
      middleware: [
        offset(8), // gap between reference and tooltip (arrow height + visual gap)
        flip(),
        shift({ padding: 8 }),
        arrow({ element: arrowEl, padding: 4 }), // padding avoids rounded corners
      ],
    }
  );

  // Position tooltip
  Object.assign(tooltipEl.style, { left: `${x}px`, top: `${y}px` });

  // Position arrow
  if (middlewareData.arrow) {
    const { x: arrowX, y: arrowY } = middlewareData.arrow;
    const side = placement.split('-')[0];
    const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side]!;
    Object.assign(arrowEl.style, {
      left: arrowX != null ? `${arrowX}px` : '',
      top: arrowY != null ? `${arrowY}px` : '',
      [staticSide]: '-4px', // half of arrow size
    });
  }
});

// Call cleanup() when tooltip hides
```

**Key detail:** `arrow()` must be placed after `shift()` in the middleware array. `offset()` must be first.

### Popover: Same Pattern, No Arrow (by Default)

Popover uses the same Floating UI pattern as the existing Select dropdown:

```typescript
// Identical to Select's positioning, already proven
const { x, y } = await computePosition(triggerEl, popoverEl, {
  placement: 'bottom-start',
  middleware: [
    offset(4),
    flip({ fallbackPlacements: ['top-start'] }),
    shift({ padding: 8 }),
    size({ apply: ({ availableHeight, elements }) => {
      elements.floating.style.maxHeight = `${availableHeight}px`;
    }}),
  ],
});
```

**Optional arrow:** Popover may optionally include an arrow. Add `arrow()` middleware when `arrow` property is set.

### autoUpdate: Keep Position Current

**Why needed for Tooltip/Popover but not Select:** The Select dropdown opens and closes quickly. Tooltips and popovers may stay open while the user scrolls or the page layout shifts. `autoUpdate` handles this by repositioning on scroll, resize, and layout shift.

**Usage** (verified via official Floating UI docs):
```typescript
// Returns a cleanup function
const cleanup = autoUpdate(referenceEl, floatingEl, () => {
  computePosition(referenceEl, floatingEl, { middleware: [...] })
    .then(({ x, y }) => { /* apply position */ });
});

// Call when hiding the floating element
cleanup();
```

**Performance:** `autoUpdate` uses `IntersectionObserver`, `ResizeObserver`, and scroll event listeners internally. The `animationFrame` option (polling via rAF) is available but should NOT be enabled by default -- only when the reference element is animating.

### Hover/Focus Interaction (Build From Scratch)

Floating UI's interaction hooks (`useHover`, `useFocus`, `useDismiss`) are React-only (`@floating-ui/react`). For vanilla DOM / Lit web components, implement hover/focus logic directly:

```typescript
// Tooltip show/hide triggers
referenceEl.addEventListener('mouseenter', showTooltip);
referenceEl.addEventListener('mouseleave', hideTooltip);
referenceEl.addEventListener('focusin', showTooltip);
referenceEl.addEventListener('focusblur', hideTooltip);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideTooltip();
});
```

**Delay management:**
- Show delay: 200-300ms (prevents flicker on mouse pass-through)
- Hide delay: 100ms (allows moving cursor from reference to tooltip content)
- Cancel pending show on mouseleave
- Cancel pending hide on mouseenter (tooltip content should be hoverable)

This is ~30 lines of timer management. No library needed.

---

## 3. Animation Strategy: CSS-First with Progressive Enhancement

### Recommended: CSS `@starting-style` + `transition-behavior: allow-discrete`

**Browser support:** ~88% (`@starting-style`), Baseline since August 2024 (Chrome 117, Safari 17.5, Firefox 129).

This is the modern CSS approach for animating elements entering/exiting the top layer. It works natively with the Popover API.

```css
/* Tooltip enter/exit animation */
[popover] {
  /* Exit state (default) */
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 150ms ease-out,
    transform 150ms ease-out,
    overlay 150ms allow-discrete,
    display 150ms allow-discrete;
}

[popover]:popover-open {
  /* Open state */
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  [popover]:popover-open {
    /* Entry starting state (animates FROM here TO open state) */
    opacity: 0;
    transform: translateY(4px);
  }
}
```

**Why this works for overlays:**
- `@starting-style` defines where the entry animation starts (from invisible)
- The default selector defines where the exit animation ends (to invisible)
- `transition-behavior: allow-discrete` enables transitioning `display` and `overlay` properties
- `overlay` transition keeps the element in the top layer during exit animation (prevents snap-disappear)

### Fallback: CSS `@keyframes` for Unsupported Browsers

For the ~12% of browsers that don't support `@starting-style`, use `@keyframes` as fallback:

```css
/* Fallback for browsers without @starting-style */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Apply only when @starting-style is NOT supported */
@supports not (selector(:popover-open)) {
  .tooltip.visible {
    animation: fade-in 150ms ease-out;
  }
}
```

**Detection strategy:** Use `@supports` to check for `@starting-style` support or check for `:popover-open` pseudo-class support, which shipped at the same time in all browsers.

### Toast-Specific Animations

Toasts need directional enter/exit based on position:

| Position | Enter Animation | Exit Animation |
|----------|----------------|----------------|
| top-* | Slide down from above (`translateY(-100%)` to `0`) | Slide up (`0` to `translateY(-100%)`) |
| bottom-* | Slide up from below (`translateY(100%)` to `0`) | Slide down (`0` to `translateY(100%)`) |

Swipe-to-dismiss overrides exit animation with pointer-driven `translateX`/`translateY`.

### Why NOT Web Animations API (WAAPI)

| Factor | CSS Transitions | WAAPI |
|--------|----------------|-------|
| Existing pattern | Already used everywhere in codebase | Not used anywhere |
| Declarative | Yes (CSS only) | Imperative (JS required) |
| Top-layer integration | Native via `@starting-style` | Requires manual coordination |
| `prefers-reduced-motion` | `@media` query in CSS | Must check in JS |
| Complexity | Low | Medium |

**Verdict:** WAAPI is more powerful but unnecessary. CSS transitions + `@starting-style` handle all overlay animation needs. The one exception would be if complex sequenced animations are needed, but toast/tooltip/popover animations are simple fades and slides.

### Why NOT Animation Libraries (Motion One, GSAP)

| Library | Why Not |
|---------|---------|
| Motion One (now `motion`) | 3KB+ added for animations achievable in CSS. Adds JS dependency for cosmetic behavior. |
| GSAP | 25KB+. Massively overkill. Licensed (not MIT for all features). |
| Framer Motion | React-only. |

**Verdict:** Zero animation libraries. CSS handles everything needed.

---

## 4. Gesture Handling: Pointer Events (Existing Pattern)

### Swipe-to-Dismiss for Toasts

The Time Picker already implements Pointer Events with `setPointerCapture` in `time-range-slider.ts` and `clock-face.ts`. Toast swipe-to-dismiss follows the exact same pattern:

```typescript
// Same pattern as time-range-slider.ts lines 213-249
private _handlePointerDown(e: PointerEvent): void {
  this._dragging = true;
  this._startY = e.clientY;
  this._startTime = Date.now();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

private _handlePointerMove(e: PointerEvent): void {
  if (!this._dragging) return;
  const deltaY = e.clientY - this._startY;
  // Update transform via CSS custom property
  this.style.setProperty('--swipe-offset', `${deltaY}px`);
  // Reduce opacity based on drag distance
  const opacity = 1 - Math.abs(deltaY) / this._dismissThreshold;
  this.style.setProperty('--swipe-opacity', `${Math.max(0, opacity)}`);
}

private _handlePointerUp(e: PointerEvent): void {
  this._dragging = false;
  (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

  const deltaY = e.clientY - this._startY;
  const elapsed = Date.now() - this._startTime;
  const velocity = Math.abs(deltaY) / elapsed;

  // Dismiss if dragged past threshold OR velocity is high enough
  if (Math.abs(deltaY) > this._dismissThreshold || velocity > 0.11) {
    this._dismiss();
  } else {
    this._snapBack(); // Animate back to original position
  }
}
```

**Key design decisions (from Sonner's proven approach):**
- Use `setPointerCapture()` so drag continues even if pointer leaves the toast element
- Velocity-based dismissal: fast swipe dismisses even if distance is short (threshold: velocity > 0.11 px/ms)
- Distance-based fallback: slow drag past threshold also dismisses (threshold: ~40% of toast height)
- Swipe direction matches toast position: bottom toasts swipe down, top toasts swipe up, side toasts swipe to their edge
- CSS custom property `--swipe-offset` drives the transform, keeping animation in CSS

**No gesture library needed.** The pattern is ~50 lines and the codebase already has two working implementations.

---

## 5. Portal / Top-Layer Strategy: Popover API

### Recommended: Native Popover API with `popover="manual"`

**Browser support:** ~95%+ (Baseline Widely Available since April 2025). Safe for production use.

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Popover API** (`popover="manual"`) | Top-layer (above everything), no z-index, native light-dismiss support, works in Shadow DOM | 5% unsupported browsers | **USE THIS** |
| Manual portal (append to body) | Works everywhere | z-index battles, escapes Shadow DOM styles, breaks encapsulation | Reject |
| CSS `z-index` stacking | Simple | Fails inside `overflow: hidden`, stacking context issues, unreliable | Reject |
| `<dialog>` element | Top-layer | Designed for modal, not tooltip/popover. Traps focus. | Wrong tool |

### Popover API + Shadow DOM: What Works

Elements **inside** a Shadow DOM can use the Popover API. The popover element gets promoted to the top layer regardless of Shadow DOM nesting:

```typescript
// In a Lit web component's render()
render() {
  return html`
    <button @click=${this._toggle}>Toggle</button>
    <div id="content" popover="manual">
      <slot></slot>
    </div>
  `;
}

private _toggle() {
  const el = this.shadowRoot!.querySelector('#content')!;
  el.togglePopover();
}
```

**Important:** Use `popover="manual"` (not `popover="auto"`) for maximum control:
- `auto`: Browser manages open/close, light-dismiss built-in. Good for simple popovers.
- `manual`: Full programmatic control. No auto-close. Required for toasts and custom tooltip interactions.
- `hint`: Chrome 133+ only, Safari opposed. NOT safe to rely on. Use `manual` instead.

### Popover API + Shadow DOM: Known Limitations

| Limitation | Workaround |
|-----------|------------|
| `popovertarget` attribute cannot cross Shadow DOM boundaries (ID scoping) | Use programmatic `showPopover()` / `hidePopover()` instead of declarative `popovertarget` |
| `popovertarget` only works on native `<button>`, not custom elements | Same -- use JS API |
| Declarative light-dismiss may not work across Shadow boundaries in some browsers | Use manual dismiss logic (click-outside detection via `pointerdown` on document, same as Time Picker) |

**All limitations are bypassed by using `popover="manual"` with programmatic control.** This is the correct approach for a web component library.

### Which Popover Mode for Each Component

| Component | Popover Mode | Rationale |
|-----------|-------------|-----------|
| Toast container | `popover="manual"` | Toasts self-manage lifecycle. No light dismiss. |
| Tooltip | `popover="manual"` | Show/hide controlled by hover/focus JS. No light dismiss. |
| Popover | `popover="auto"` or `popover="manual"` | `auto` for simple use (light dismiss), `manual` for complex (nested interactions) |

### CSS for Top-Layer Elements

```css
/* Reset top-layer default styles */
[popover] {
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  inset: unset; /* Remove default centering */
  overflow: visible;
}

/* Top-layer backdrop (optional, for dimming behind popovers) */
[popover]::backdrop {
  background: transparent; /* No backdrop for tooltips/toasts */
}
```

### Fallback for ~5% Without Popover API

For browsers without Popover API support, fall back to `position: fixed` + high `z-index`:

```typescript
private _showElement(el: HTMLElement) {
  if ('showPopover' in HTMLElement.prototype) {
    el.showPopover();
  } else {
    // Fallback: fixed positioning
    el.style.position = 'fixed';
    el.style.zIndex = '9999';
    el.hidden = false;
  }
}
```

This is progressive enhancement -- the component works everywhere, with top-layer benefits in modern browsers.

---

## 6. New Dependencies Assessment: None Required

### What NOT to Add (and Why)

| Temptation | Why to Avoid |
|------------|-------------|
| **Sonner / react-hot-toast / react-toastify** | React-only. Cannot be used in web components. |
| **toast-queue** | Vanilla JS but injects global DOM. Incompatible with Shadow DOM encapsulation. |
| **@floating-ui/react** | React-specific interaction hooks. Vanilla `@floating-ui/dom` covers positioning. Interactions are ~30 lines of JS. |
| **Motion One / GSAP** | CSS `@starting-style` handles all animations. No JS animation library needed. |
| **any gesture library** | Pointer Events + `setPointerCapture` is already proven in codebase. Swipe is ~50 lines. |
| **Popover API polyfill** (`@oddbird/popover-polyfill`) | 95%+ support. Fallback to `position: fixed` is simpler than a polyfill. |
| **@lit/context** | Toast provider-to-toast communication can use DOM events. Context adds complexity. |

### What IS Needed (Already Installed)

| Need | Solution | Status |
|------|----------|--------|
| Tooltip/Popover positioning | `@floating-ui/dom` (arrow, autoUpdate) | Already installed (^1.7.4) |
| Enter/exit animations | CSS `@starting-style` + transitions | Native browser API |
| Top-layer rendering | Popover API (`popover="manual"`) | Native browser API |
| Swipe-to-dismiss | Pointer Events + `setPointerCapture` | Native browser API |
| Accessibility announcements | `<output>` + `role="status"` | Native HTML |
| Timer management (auto-dismiss) | `setTimeout` / `clearTimeout` | Native JS |

---

## Integration Points with Existing Codebase

### Shared Floating UI Utility

The Select, DatePicker, DateRangePicker, and TimePicker all independently import and configure Floating UI. Consider extracting a shared positioning utility in `@lit-ui/core` or a shared internal package:

```typescript
// packages/core/src/floating.ts (optional consolidation)
import { computePosition, flip, shift, offset, arrow, autoUpdate } from '@floating-ui/dom';

export interface PositionOptions {
  placement?: Placement;
  offset?: number;
  arrowElement?: HTMLElement;
  onPosition?: (data: ComputePositionReturn) => void;
}

export function createFloatingPosition(
  reference: HTMLElement,
  floating: HTMLElement,
  options: PositionOptions
): () => void {
  // Returns cleanup function
  return autoUpdate(reference, floating, async () => {
    const middleware = [
      offset(options.offset ?? 4),
      flip(),
      shift({ padding: 8 }),
    ];
    if (options.arrowElement) {
      middleware.push(arrow({ element: options.arrowElement, padding: 4 }));
    }
    const result = await computePosition(reference, floating, {
      placement: options.placement ?? 'bottom',
      middleware,
    });
    options.onPosition?.(result);
  });
}
```

**Decision:** Optional but recommended. This would reduce ~20 lines of boilerplate per component. Can be introduced when building Tooltip (first new consumer) without modifying existing components.

### TailwindElement Pattern

Same as all existing components:

```typescript
export class Tooltip extends TailwindElement {
  static override styles = [
    ...tailwindBaseStyles,
    css`/* component-specific styles */`,
  ];
}
```

### SSR Compatibility

All overlay behavior is client-only (positioning, popover API, animations):

```typescript
import { isServer } from 'lit';

// Skip all overlay logic during SSR
private _show() {
  if (isServer) return;
  // ... Floating UI positioning, popover API
}
```

Toasts, tooltips, and popovers render nothing on the server. The trigger elements (buttons, reference elements) render normally.

### Design Tokens

New tokens following `--ui-{component}-{property}` convention:

**Toast:** `--ui-toast-radius`, `--ui-toast-shadow`, `--ui-toast-bg`, `--ui-toast-border`, `--ui-toast-text`, `--ui-toast-duration` (animation), `--ui-toast-gap`

**Tooltip:** `--ui-tooltip-radius`, `--ui-tooltip-bg`, `--ui-tooltip-text`, `--ui-tooltip-shadow`, `--ui-tooltip-arrow-size`, `--ui-tooltip-delay`

**Popover:** `--ui-popover-radius`, `--ui-popover-bg`, `--ui-popover-shadow`, `--ui-popover-border`, `--ui-popover-padding`

---

## Package Structure

### New Packages

```
packages/toast/
  package.json          # Peer: lit + @lit-ui/core. No runtime deps.
  src/
    index.ts
    toast.ts            # Individual toast element
    toast-provider.ts   # Container/manager (queue, stacking, positioning)
    jsx.d.ts

packages/tooltip/
  package.json          # Deps: @floating-ui/dom. Peer: lit + @lit-ui/core.
  src/
    index.ts
    tooltip.ts          # Tooltip component with arrow
    jsx.d.ts

packages/popover/
  package.json          # Deps: @floating-ui/dom. Peer: lit + @lit-ui/core.
  src/
    index.ts
    popover.ts          # Popover component
    jsx.d.ts
```

**Note:** `@floating-ui/dom` is a `dependency` of tooltip and popover packages (same pattern as Select), not a peer dependency. Toast does NOT need Floating UI (viewport-anchored, not element-anchored).

### Package Dependencies

```json
// packages/tooltip/package.json
{
  "name": "@lit-ui/tooltip",
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  },
  "dependencies": {
    "@floating-ui/dom": "^1.7.4"
  }
}

// packages/popover/package.json
{
  "name": "@lit-ui/popover",
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  },
  "dependencies": {
    "@floating-ui/dom": "^1.7.4"
  }
}

// packages/toast/package.json
{
  "name": "@lit-ui/toast",
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  }
  // NO runtime dependencies
}
```

---

## Browser API Summary

| API | Usage | Support | Fallback |
|-----|-------|---------|----------|
| Popover API (`showPopover`/`hidePopover`) | Top-layer rendering for all 3 components | ~95%+ (Baseline Widely Available) | `position: fixed` + `z-index: 9999` |
| `@starting-style` | Enter/exit animations for top-layer elements | ~88% | `@keyframes` animation |
| `transition-behavior: allow-discrete` | Animate `display` and `overlay` properties | ~88% (ships with `@starting-style`) | Skip exit animation (snap-hide) |
| Pointer Events + `setPointerCapture` | Swipe-to-dismiss for toasts | 97%+ | Touch events fallback (not needed in practice) |
| `<output>` + `role="status"` | Screen reader announcements for toasts | Universal | N/A |
| `prefers-reduced-motion` | Respect motion preferences | 97%+ | N/A |

### `popover="hint"` -- NOT Recommended

Chrome 133 introduced `popover="hint"` specifically for tooltips (allows hint popover without closing `auto` popovers). However:
- Safari/WebKit has expressed a **negative** position on the feature
- Firefox is positive but has not shipped yet
- Falls back to `popover="manual"` in unsupporting browsers

**Verdict:** Do not use `popover="hint"`. Use `popover="manual"` for tooltips. Revisit in 2027 if Safari ships it.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Toast management | Build from scratch | Sonner / toast-queue | React-only or global DOM injection, incompatible with Shadow DOM |
| Tooltip positioning | Floating UI (existing) | CSS Anchor Positioning | 76% support, too low. Floating UI is already installed. |
| Animations | CSS `@starting-style` + transitions | Web Animations API | WAAPI requires JS orchestration, no native top-layer integration |
| Animations | CSS `@starting-style` + transitions | Motion One | Unnecessary dependency for simple fade/slide |
| Top-layer | Popover API | Manual portal (append to body) | Breaks Shadow DOM encapsulation, z-index battles |
| Top-layer | Popover API | `<dialog>` | Dialog traps focus, wrong semantics for tooltip/popover |
| Swipe gesture | Pointer Events (native) | Hammer.js / use-gesture | Already have pattern in codebase, ~50 lines vs new dependency |
| Tooltip interaction | Manual hover/focus handlers | @floating-ui/react | React-only interaction hooks |

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Zero new deps needed | HIGH | All capabilities exist via existing Floating UI + native browser APIs |
| Floating UI arrow/autoUpdate | HIGH | Verified via official Floating UI documentation |
| Popover API for top-layer | HIGH | Baseline Widely Available since April 2025, ~95%+ support |
| CSS `@starting-style` for animations | HIGH | ~88% support, ships in all modern browsers, graceful degradation |
| Toast build-from-scratch | HIGH | All mature libraries are React-specific or incompatible with Shadow DOM |
| Swipe via Pointer Events | HIGH | Pattern proven in `time-range-slider.ts` and `clock-face.ts` in this codebase |
| `popover="hint"` avoidance | HIGH | Safari negative, only Chrome ships it. Too early. |

---

## Sources

### Official Documentation (HIGH confidence)
- [Floating UI - arrow middleware](https://floating-ui.com/docs/arrow) -- Arrow positioning API and usage
- [Floating UI - autoUpdate](https://floating-ui.com/docs/autoupdate) -- Auto-reposition on scroll/resize
- [Floating UI - Tooltip guide](https://floating-ui.com/docs/tooltip) -- Tooltip implementation pattern
- [MDN - Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) -- Native popover specification
- [MDN - @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style) -- CSS entry animation rule
- [MDN - transition-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior) -- allow-discrete for display transitions

### Browser Support (HIGH confidence)
- [Can I Use - Popover API](https://caniuse.com/mdn-api_htmlelement_popover) -- ~95%+ global support
- [Can I Use - @starting-style](https://caniuse.com/mdn-css_at-rules_starting-style) -- ~88% global support
- [web.dev - @starting-style Baseline](https://web.dev/blog/baseline-entry-animations) -- Baseline since August 2024

### Architecture References (HIGH confidence)
- [web.dev - Building a Toast Component](https://web.dev/articles/building/a-toast-component) -- `<output>` element, accessibility pattern
- [Chrome Developers - popover=hint](https://developer.chrome.com/blog/popover-hint) -- hint popover (Chrome-only)
- [Chrome Developers - Entry/Exit Animations](https://developer.chrome.com/blog/entry-exit-animations) -- `@starting-style` + `allow-discrete` pattern

### Shadow DOM + Popover API (HIGH confidence)
- [WHATWG HTML Issue #9109](https://github.com/whatwg/html/issues/9109) -- `popovertarget` and Shadow DOM limitations
- [WHATWG HTML Issue #10442](https://github.com/whatwg/html/issues/10442) -- Imperative popover invoker relationships

### npm Registry (HIGH confidence)
- [@floating-ui/dom](https://www.npmjs.com/package/@floating-ui/dom) -- v1.7.4 (latest, verified Feb 2026)

### Existing Codebase (HIGH confidence)
- `packages/select/src/select.ts` -- Floating UI usage pattern (computePosition, flip, shift, offset, size)
- `packages/time-picker/src/time-range-slider.ts` -- Pointer Events + setPointerCapture pattern
- `packages/time-picker/src/clock-face.ts` -- Pointer Events + setPointerCapture pattern
- `packages/time-picker/src/time-picker.ts` -- Document pointerdown for click-outside detection
