# Phase 54: Toast - Research

**Researched:** 2026-02-02
**Domain:** Imperative toast notification system as Lit web components with queuing, animations, swipe gestures, and accessibility
**Confidence:** HIGH

## Summary

The toast component is architecturally distinct from previous overlay components (tooltip, popover) in two important ways: (1) it uses an **imperative API** (`toast.success('Saved')`) rather than a declarative template, and (2) the container element (`<lui-toaster>`) **auto-creates** itself on first call if not in the DOM. This requires a module-level singleton pattern with an observer/subscriber mechanism -- the same architecture that powers Sonner (8M+ weekly npm downloads, the de facto toast standard in the React ecosystem).

The rendering strategy uses `popover="manual"` for top-layer promotion, which ensures toasts render above dialogs and other overlays without z-index management. Unlike `popover="auto"`, manual popovers do not light-dismiss and do not force-close other popovers -- exactly what toasts need. CSS tokens (`--ui-toast-*`) and variant colors (OKLCH with dark mode) are already defined in Phase 51. The animation pattern (`@starting-style` + `transition-behavior: allow-discrete`) is documented in `overlay-animation.css` with a specific toast example using slide+fade.

Key technical challenges are: (1) the observer pattern connecting the imperative `toast()` function to the `<lui-toaster>` web component, (2) queue state management with configurable `maxVisible`, (3) swipe-to-dismiss via Pointer Events with velocity-based thresholds, and (4) accessibility with pre-registered live regions (`role="status"` / `role="alert"`) that must exist in the DOM before content is injected.

**Primary recommendation:** Build two elements (`<lui-toaster>` container + `<lui-toast>` individual toast) connected by a module-level singleton state manager using the observer pattern. The `toast()` function is a plain ES module export that mutates shared state; the toaster subscribes and re-renders. Use `popover="manual"` on the toaster container for top-layer rendering. No new dependencies needed.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `lit` | ^3.3.2 | Web component framework | Project standard |
| `@lit-ui/core` | workspace:* | TailwindElement, tokens, tailwindBaseStyles | All components use this |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@lit-ui/core/tokens` | (subpath export) | Toast CSS custom property references | Accessing `tokens.toast.*` programmatically |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Module-level singleton state | CustomEvent bus on `document` | Singleton is simpler, type-safe, and testable; events require string-based coupling |
| `popover="manual"` | `position: fixed` + high z-index | Popover API gives free top-layer (above dialogs); fixed position fails behind stacking contexts |
| Individual `<lui-toast>` elements | Template-only rendering in toaster | Separate element enables slotted custom content, independent lifecycle, encapsulated styles |
| Pointer Events for swipe | Touch Events | Pointer Events are the modern unified API covering mouse+touch+pen; Touch Events are legacy |

**Installation:**
No new external dependencies. Only workspace packages.

```bash
# Package scaffolding (follows popover pattern)
mkdir -p packages/toast/src
# peerDependencies: lit, @lit-ui/core
# devDependencies: workspace packages (typescript-config, vite-config, etc.)
```

## Architecture Patterns

### Recommended Project Structure
```
packages/toast/
  src/
    toast.ts           # <lui-toast> individual toast element
    toaster.ts         # <lui-toaster> container element
    state.ts           # Singleton state manager (observer pattern)
    api.ts             # Imperative toast() function + variants
    types.ts           # ToastData, ToastPosition, ToastVariant types
    icons.ts           # SVG icon templates for variants (success/error/warning/info)
    index.ts           # Registration + exports
    jsx.d.ts           # React/Vue/Svelte type declarations
    vite-env.d.ts      # Vite types
  package.json
  tsconfig.json
  vite.config.ts
```

### Pattern 1: Observer/Singleton State Manager
**What:** A module-level singleton object that holds toast state (queue, visible list, position config). The imperative `toast()` function pushes to this state. The `<lui-toaster>` component subscribes and re-renders on state changes.
**When to use:** This is the core pattern that enables framework-agnostic imperative API.
**Why:** Same pattern Sonner uses. Decouples the trigger (`toast()` call) from the renderer (`<lui-toaster>`) without requiring any framework context, events, or DOM queries.
**Example:**
```typescript
// state.ts
type Subscriber = (toasts: ToastData[]) => void;

class ToastState {
  private toasts: ToastData[] = [];
  private subscribers = new Set<Subscriber>();
  private idCounter = 0;

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  addToast(data: Omit<ToastData, 'id' | 'createdAt'>): string {
    const id = String(++this.idCounter);
    const toast: ToastData = { ...data, id, createdAt: Date.now() };
    this.toasts = [...this.toasts, toast];
    this.notify();
    return id;
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  private notify(): void {
    for (const fn of this.subscribers) fn(this.toasts);
  }
}

export const toastState = new ToastState();
```

### Pattern 2: Auto-Creating Toaster Container
**What:** When `toast()` is called and no `<lui-toaster>` exists in the DOM, one is automatically created and appended to `document.body`.
**When to use:** Always -- this is required by TOAST-04.
**Why:** Developers should be able to call `toast.success('Saved')` without any setup in vanilla JS.
**Example:**
```typescript
// api.ts
function ensureToaster(): void {
  if (typeof document === 'undefined') return; // SSR guard
  if (!document.querySelector('lui-toaster')) {
    const el = document.createElement('lui-toaster');
    document.body.appendChild(el);
  }
}

export function toast(message: string, options?: ToastOptions): string {
  ensureToaster();
  return toastState.addToast({ message, variant: 'default', ...options });
}

toast.success = (message: string, opts?: ToastOptions) =>
  toast(message, { ...opts, variant: 'success' });
toast.error = (message: string, opts?: ToastOptions) =>
  toast(message, { ...opts, variant: 'error' });
toast.warning = (message: string, opts?: ToastOptions) =>
  toast(message, { ...opts, variant: 'warning' });
toast.info = (message: string, opts?: ToastOptions) =>
  toast(message, { ...opts, variant: 'info' });
toast.dismiss = (id: string) => toastState.removeToast(id);
toast.dismissAll = () => toastState.dismissAll();
toast.promise = <T>(
  promise: Promise<T>,
  msgs: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) }
) => { /* see Promise Toast pattern below */ };
```

### Pattern 3: Toaster Uses `popover="manual"` for Top-Layer
**What:** The `<lui-toaster>` container uses `popover="manual"` on its wrapper to render in the browser's top layer, above dialogs and other overlays.
**When to use:** Always -- required by TOAST-17.
**Why:** Unlike `popover="auto"`, manual popovers do not light-dismiss and do not force-close other popovers. Multiple manual popovers can coexist. The top layer eliminates z-index wars.
**Caveat:** There is a known issue (Dec 2025) where toasts in the top layer via `popover="manual"` can appear visually above a modal dialog but remain inert (unable to receive pointer/keyboard events) because `showModal()` makes background content unreachable. Mitigation: re-call `showPopover()` after a dialog opens to re-promote the toaster to the top of the top-layer stack, or accept that toasts behind a modal are visible but non-interactive (which is acceptable behavior for notifications).
**Example:**
```typescript
// In toaster.ts render()
render() {
  return html`
    <div
      class="toaster-container"
      popover="manual"
      part="container"
    >
      ${this.visibleToasts.map(t => html`
        <lui-toast
          .data=${t}
          @toast-dismiss=${() => this.handleDismiss(t.id)}
        ></lui-toast>
      `)}
    </div>
  `;
}

// Show popover on first toast
private showContainer(): void {
  const container = this.renderRoot.querySelector<HTMLElement>('.toaster-container');
  if (container && !container.matches(':popover-open')) {
    try { container.showPopover(); } catch { /* already showing */ }
  }
}
```

### Pattern 4: Queue Management with maxVisible
**What:** Only `maxVisible` (default 3) toasts are rendered at once. Excess toasts go into a queue and appear as earlier ones dismiss.
**When to use:** Always -- required by TOAST-07.
**Example:**
```typescript
// In toaster state/rendering logic
get visibleToasts(): ToastData[] {
  return this.allToasts.slice(0, this.maxVisible);
}

get queuedToasts(): ToastData[] {
  return this.allToasts.slice(this.maxVisible);
}

// When a visible toast is dismissed, the next queued toast
// automatically becomes visible (reactive via Lit's rendering)
```

### Pattern 5: Promise Toast State Machine
**What:** `toast.promise()` creates a toast that transitions through loading -> success/error states based on promise resolution.
**When to use:** For async operations like API calls.
**State transitions:** `loading` -> `success` | `error`
**Example:**
```typescript
toast.promise = <T>(
  promise: Promise<T>,
  msgs: { loading: string; success: string | ((d: T) => string); error: string | ((e: unknown) => string) }
): string => {
  const id = toast(msgs.loading, { variant: 'default', duration: 0 }); // persistent while loading

  promise.then(
    (data) => {
      const msg = typeof msgs.success === 'function' ? msgs.success(data) : msgs.success;
      toastState.updateToast(id, { message: msg, variant: 'success', duration: 5000 });
    },
    (err) => {
      const msg = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
      toastState.updateToast(id, { message: msg, variant: 'error', duration: 5000 });
    }
  );

  return id;
};
```

### Pattern 6: Swipe-to-Dismiss via Pointer Events
**What:** Users can swipe a toast horizontally to dismiss it. Uses `setPointerCapture()` for reliable tracking, velocity-based threshold for natural feel.
**When to use:** TOAST-13 requirement.
**Key values:** Distance threshold ~80px OR velocity threshold ~0.11px/ms (from Sonner's implementation).
**Example:**
```typescript
// In lui-toast element
private startX = 0;
private startTime = 0;
private currentX = 0;

private handlePointerDown = (e: PointerEvent): void => {
  this.startX = e.clientX;
  this.startTime = Date.now();
  this.currentX = 0;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};

private handlePointerMove = (e: PointerEvent): void => {
  if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
  this.currentX = e.clientX - this.startX;
  // Apply transform for visual feedback
  this.style.setProperty('--swipe-x', `${this.currentX}px`);
  this.style.setProperty('--swipe-opacity', String(1 - Math.abs(this.currentX) / 200));
};

private handlePointerUp = (e: PointerEvent): void => {
  const distance = Math.abs(this.currentX);
  const elapsed = Date.now() - this.startTime;
  const velocity = distance / elapsed; // px/ms

  if (distance > 80 || velocity > 0.11) {
    // Dismiss
    this.dispatchEvent(new CustomEvent('toast-dismiss', { bubbles: true, composed: true }));
  } else {
    // Snap back
    this.style.removeProperty('--swipe-x');
    this.style.removeProperty('--swipe-opacity');
  }
};
```

### Anti-Patterns to Avoid
- **Using `popover="auto"` for toast container:** Auto popovers light-dismiss on outside click and force-close other auto popovers. Toasts must persist until timer/explicit dismiss. Use `popover="manual"`.
- **Creating live regions dynamically:** Screen readers may not announce content in a live region that was just added to the DOM. The live region container must exist in the DOM before content is injected. Pre-register the `role="status"` container in `connectedCallback`.
- **Using React Context or framework-specific state:** The imperative API must work from vanilla JS. A module-level singleton is the only approach that works across all frameworks identically.
- **Moving focus to toast notifications:** Toasts are out-of-band status updates. Stealing focus disrupts the user's current action. Use `aria-live` for announcements, never `focus()`.
- **Setting both `role="alert"` and `aria-live="assertive"` together:** `role="alert"` already implies `aria-live="assertive"`. Doubling up causes duplicate announcements in VoiceOver on iOS.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Observer/pub-sub pattern | Event-based system on DOM | Simple class with `Set<Subscriber>` | ~20 lines, type-safe, testable, no DOM dependency |
| Top-layer rendering | z-index management | `popover="manual"` | Free top-layer, works above dialogs, no stacking context issues |
| Overlay animations | JS-based animation | `@starting-style` + `transition-behavior: allow-discrete` | Pure CSS, GPU-accelerated, pattern proven in popover/dialog |
| Swipe velocity tracking | Full gesture library | ~30 lines of Pointer Events + simple velocity calc | No dependency needed; `distance/elapsed` is sufficient |
| Accessible announcements | Custom screen reader hacks | `role="status"` / `role="alert"` on pre-existing container | Native browser/AT contract; no JS needed for announcement |
| Auto-dismiss timers | Complex timer management | `setTimeout` with pause/resume via captured `remaining` time | Simple arithmetic: `remaining -= (Date.now() - pausedAt)` |
| SVG variant icons | Icon library dependency | Inline SVG templates in `icons.ts` | 5 small SVGs (check, X-circle, triangle-alert, info-circle, loader); no dependency needed |

**Key insight:** The toast component has no external dependency needs. All technical challenges (observer, swipe, timers) are simple enough to implement in <50 lines each. The complexity is in the integration and state management, not in any individual feature.

## Common Pitfalls

### Pitfall 1: Live Region Not Announcing in Screen Readers
**What goes wrong:** Toast content is injected but screen readers don't announce it.
**Why it happens:** The live region (`role="status"` or `role="alert"`) was dynamically created at the same time as the content. Screen readers need the container to exist first, then observe content changes.
**How to avoid:** Create the `<lui-toaster>` element (with its live region wrapper) on `connectedCallback` or `ensureToaster()` call. Only inject toast content after the container is in the DOM and has been observed by the AT for at least one frame.
**Warning signs:** Toasts work visually but screen readers are silent.

### Pitfall 2: Toast Above Modal Dialog Is Inert
**What goes wrong:** A toast notification appears visually above a modal dialog (via top layer), but clicking the toast's action button or dismiss button does nothing.
**Why it happens:** `showModal()` makes all content outside the dialog inert. Even though the toast's `popover="manual"` promotes it to the top layer visually, the inertness from the modal still applies if the toast was promoted before the dialog.
**How to avoid:** Re-call `showPopover()` on the toaster container whenever a new toast is added. This re-promotes it to the top of the top-layer stack. Alternatively, accept that toasts behind modals are visual-only (most toast libraries behave this way). The re-promotion approach is more robust.
**Warning signs:** Toasts render correctly outside modals but action buttons stop working when a dialog is open.

### Pitfall 3: Animation Interruption on Rapid Toast Creation
**What goes wrong:** When toasts appear rapidly, older toasts "jump" instead of smoothly sliding to their new position.
**Why it happens:** CSS keyframe animations are not retargetable -- they restart from the beginning when properties change. CSS transitions, however, retarget smoothly.
**How to avoid:** Use CSS transitions (not keyframes) for all toast position changes. The `translateY` for stacking should be a transition, not an animation. Sonner learned this the hard way.
**Warning signs:** Toasts visually glitch when multiple appear within 500ms.

### Pitfall 4: Timer Not Pausing on Hover/Focus
**What goes wrong:** Toast auto-dismisses while user is reading it or hovering to click the action button.
**Why it happens:** A simple `setTimeout` doesn't support pause/resume.
**How to avoid:** Track `remaining` time. On `pointerenter`/`focusin`, capture `remaining = duration - (Date.now() - startTime)` and clear the timeout. On `pointerleave`/`focusout`, start a new timeout with `remaining`.
**Warning signs:** Toasts disappear while user is interacting with them.

### Pitfall 5: Swipe Interfering with Vertical Scroll
**What goes wrong:** Attempting to scroll the page over a toast area triggers the swipe-to-dismiss gesture instead.
**Why it happens:** `touch-action: none` disables all browser touch behaviors including scroll.
**How to avoid:** Use `touch-action: pan-y` on the toast element (allow vertical scroll, capture horizontal). Only set `touch-action: none` after detecting a primarily horizontal movement (delta-x > delta-y). Or simply use `touch-action: pan-y` always since swipe-to-dismiss is horizontal.
**Warning signs:** Mobile users can't scroll past toast notifications.

### Pitfall 6: SSR Crash on `document` Access
**What goes wrong:** `toast()` function throws during server-side rendering because it tries to access `document.querySelector` or `document.createElement`.
**Why it happens:** The auto-create logic runs in a Node.js environment where `document` doesn't exist.
**How to avoid:** Guard all DOM access with `typeof document !== 'undefined'`. The `toast()` function should silently no-op during SSR (TOAST-18). Queue the toast data in memory -- if a toaster connects later (client hydration), it will pick up queued toasts.
**Warning signs:** SSR build fails with `ReferenceError: document is not defined`.

## Code Examples

### Toast Types Definition
```typescript
// types.ts
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  description?: string;
  duration: number;       // ms, 0 = persistent
  dismissible: boolean;
  createdAt: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  // Promise toast state
  loading?: boolean;
}

export interface ToastOptions {
  variant?: ToastVariant;
  description?: string;
  duration?: number;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
}
```

### Toaster Container with Position Support
```typescript
// toaster.ts - simplified structure
import { html, css, nothing } from 'lit';
import { isServer } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { toastState } from './state.js';
import type { ToastData, ToastPosition } from './types.js';

export class Toaster extends TailwindElement {
  @property({ type: String })
  position: ToastPosition = 'bottom-right';

  @property({ type: Number, attribute: 'max-visible' })
  maxVisible = 3;

  @state()
  private toasts: ToastData[] = [];

  private unsubscribe?: () => void;

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: contents; /* no layout impact */
      }

      .toaster-container {
        /* Override UA popover styles */
        margin: 0;
        border: none;
        padding: 0;
        background: transparent;
        /* Fixed position from popover API top layer */
        position: fixed;
        display: flex;
        flex-direction: column;
        gap: var(--ui-toast-gap);
        z-index: var(--ui-toast-z-index);
        max-width: var(--ui-toast-max-width);
        pointer-events: none;
      }

      /* Position classes applied via attribute */
      :host([position="bottom-right"]) .toaster-container {
        bottom: 1rem; right: 1rem;
      }
      :host([position="bottom-left"]) .toaster-container {
        bottom: 1rem; left: 1rem;
      }
      :host([position="bottom-center"]) .toaster-container {
        bottom: 1rem; left: 50%; transform: translateX(-50%);
      }
      :host([position="top-right"]) .toaster-container {
        top: 1rem; right: 1rem;
      }
      :host([position="top-left"]) .toaster-container {
        top: 1rem; left: 1rem;
      }
      :host([position="top-center"]) .toaster-container {
        top: 1rem; left: 50%; transform: translateX(-50%);
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    if (isServer) return;
    this.unsubscribe = toastState.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }
}
```

### Toast Animation CSS (Slide + Fade)
```css
/* Adapted from overlay-animation.css toast example */
/* Direction depends on position -- top positions slide down, bottom slide up */

lui-toast {
  pointer-events: auto;
  opacity: 0;
  transform: translateY(var(--toast-slide-dir, 100%));
  transition:
    opacity 200ms ease-out,
    transform 200ms ease-out,
    display 200ms allow-discrete;
}

lui-toast[data-visible] {
  opacity: 1;
  transform: translateY(0) translateX(var(--swipe-x, 0px));
}

@starting-style {
  lui-toast[data-visible] {
    opacity: 0;
    transform: translateY(var(--toast-slide-dir, 100%));
  }
}

@media (prefers-reduced-motion: reduce) {
  lui-toast {
    transition: none;
  }
}
```

### Accessible Live Region Setup
```typescript
// The toaster must have TWO live regions pre-registered:
// 1. role="status" aria-live="polite" for info/success/warning
// 2. role="alert" for errors (implicit aria-live="assertive")

render() {
  const visibleToasts = this.toasts.slice(0, this.maxVisible);

  return html`
    <div
      class="toaster-container"
      popover="manual"
      part="container"
    >
      <!-- Polite live region for non-error toasts -->
      <div role="status" aria-live="polite" aria-atomic="false" class="sr-only">
        ${visibleToasts
          .filter(t => t.variant !== 'error')
          .map(t => html`<div>${t.message}</div>`)}
      </div>
      <!-- Assertive live region for error toasts -->
      <div role="alert" class="sr-only">
        ${visibleToasts
          .filter(t => t.variant === 'error')
          .map(t => html`<div>${t.message}</div>`)}
      </div>
      <!-- Visual toast rendering -->
      ${visibleToasts.map(t => html`
        <lui-toast
          .data=${t}
          data-visible
          @toast-dismiss=${() => this.handleDismiss(t.id)}
        ></lui-toast>
      `)}
    </div>
  `;
}
```

### Pausable Auto-Dismiss Timer
```typescript
// In lui-toast element
private timeoutId?: ReturnType<typeof setTimeout>;
private remaining: number = 0;
private pausedAt: number = 0;
private startedAt: number = 0;

startTimer(duration: number): void {
  if (duration <= 0) return; // persistent toast
  this.remaining = duration;
  this.startedAt = Date.now();
  this.timeoutId = setTimeout(() => this.dismiss(), duration);
}

pauseTimer(): void {
  if (!this.timeoutId) return;
  clearTimeout(this.timeoutId);
  this.remaining -= (Date.now() - this.startedAt);
  this.timeoutId = undefined;
}

resumeTimer(): void {
  if (this.remaining <= 0) return;
  this.startedAt = Date.now();
  this.timeoutId = setTimeout(() => this.dismiss(), this.remaining);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `position: fixed` + z-index for toasts | `popover="manual"` for top-layer | Baseline 2024 | Toasts above dialogs without z-index wars |
| CSS keyframe animations | CSS transitions with `@starting-style` | Baseline 2024 | Retargetable animations, no jump on rapid creation |
| React Context for toast state | Module-level singleton (observer pattern) | Sonner popularized ~2023 | Framework-agnostic, works from vanilla JS |
| Touch Events for swipe | Pointer Events with `setPointerCapture` | Widely supported 2020+ | Unified API for mouse+touch+pen |
| `role="alert"` for all toasts | `role="status"` (polite) for info, `role="alert"` (assertive) for errors only | WAI-ARIA best practice | Prevents over-announcing; errors interrupt, info waits |

**Deprecated/outdated:**
- Using `position: fixed` + `z-index: 9999` for toast positioning (stacking context issues, fails behind modals)
- Touch Events API for gesture recognition (Pointer Events supersede)
- CSS keyframe animations for toast entry/exit (not retargetable)

## Open Questions

1. **Top-Layer Inertness Behind Modal Dialogs**
   - What we know: `showModal()` makes non-dialog content inert. Toast popover may be visually above but non-interactive. Re-calling `showPopover()` may re-promote to top of stack.
   - What's unclear: Whether re-promoting via `showPopover()` actually resolves the inertness issue across all browsers, or if the `showModal()` inert behavior applies regardless of top-layer order.
   - Recommendation: Test during implementation. If re-promotion doesn't work, accept that toast action buttons are not clickable while a modal is open (standard behavior in most toast libraries). Toasts behind modals remain visible for awareness.

2. **Stacking Animation Height Calculation**
   - What we know: Sonner calculates dynamic heights per toast and uses `translateY` offsets with scaling for visual depth.
   - What's unclear: Whether the simpler approach (flexbox `gap` for stacking) is sufficient, or whether the Sonner-style height-aware stacking with scale is needed for the intended UX.
   - Recommendation: Start with flexbox `gap`-based stacking (simpler, works with variable heights). Add Sonner-style collapsed stacking later if needed.

3. **Shadow DOM and Live Region Announcements**
   - What we know: ARIA live regions work best when they exist in the light DOM. Content inside shadow DOM may not be announced by all screen readers.
   - What's unclear: Whether `role="status"` on an element inside a web component's shadow DOM is reliably announced across NVDA, JAWS, and VoiceOver.
   - Recommendation: The toaster's live region elements should use `aria-live` and `role` attributes. Test with at least VoiceOver. If shadow DOM causes issues, consider rendering the live region content into a light DOM element outside the shadow root.

## Sources

### Primary (HIGH confidence)
- Codebase: `packages/popover/src/popover.ts` - Reference for Lit component patterns, Popover API integration, AbortController cleanup
- Codebase: `packages/core/src/styles/tailwind.css` (lines 214-231, 722-745) - Toast CSS custom properties already defined with OKLCH variant colors
- Codebase: `packages/core/src/tokens/index.ts` (lines 254-277) - Toast token type definitions already defined
- Codebase: `packages/core/src/styles/overlay-animation.css` (lines 134-167) - Toast-specific animation pattern (slide+fade)
- Codebase: `packages/popover/package.json` - Package scaffolding pattern
- Codebase: `packages/cli/src/registry/registry.json` - Registry entry format
- Codebase: `packages/cli/src/templates/index.ts` - Copy-source template format
- [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) - `popover="manual"` behavior for toasts
- [MDN ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) - Live region pre-registration requirement

### Secondary (MEDIUM confidence)
- [Emil Kowalski: Building a Toast Component](https://emilkowal.ski/ui/building-a-toast-component) - Observer pattern, swipe velocity (0.11px/ms), CSS transition retargeting insight
- [Frontend Masters: Menus, Toasts and More with Popover API](https://frontendmasters.com/blog/menus-toasts-and-more/) - `popover="manual"` toast pattern with `@starting-style`
- [web.dev: Toast Component Pattern](https://web.dev/patterns/components/toast) - `<output>` element, `role="status"`, FLIP animation
- [Sara Soueidan: Accessible Notifications with ARIA Live Regions](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) - Pre-register live regions, don't move focus
- [Top Layer Troubles: Popover vs Dialog (Dec 2025)](https://web-standards.dev/news/2025/12/top-layer-troubles-popover-dialog/) - Toast inertness behind modal dialogs

### Tertiary (LOW confidence)
- Sonner swipe velocity threshold of 0.11px/ms - Reported from Emil Kowalski's article but not independently verified via source code inspection
- Shadow DOM live region announcement reliability across screen readers - Community reports vary; needs testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; all infrastructure already exists in workspace
- Architecture: HIGH - Observer pattern is proven (Sonner), Popover API manual mode is well-documented, animation pattern already documented in codebase
- Pitfalls: HIGH - Top-layer inertness, live region pre-registration, timer pause/resume, and swipe vs. scroll are all well-documented problems with known solutions
- Swipe thresholds: MEDIUM - Velocity value from Sonner, may need tuning during implementation
- Shadow DOM + live regions: MEDIUM - May need light DOM fallback; needs testing

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (stable domain, Popover API manual mode is Baseline)
