# Architecture: Toast, Tooltip, and Popover Overlay Components

**Domain:** Overlay/feedback components for LitUI web component library
**Researched:** 2026-02-02
**Overall confidence:** HIGH (existing patterns well-established, research verified)

## Executive Summary

Toast, Tooltip, and Popover share a common need for floating/overlay rendering but have fundamentally different lifecycle and positioning requirements. The architecture should create a thin shared positioning utility (wrapping the existing Floating UI dependency) and a shared overlay mixin, while keeping each component as its own package. Toast is the outlier -- it needs a container/portal pattern and an imperative API that works across Shadow DOM boundaries. Tooltip and Popover share the most code (both are anchor-positioned floating elements) but differ in trigger mechanism and content model.

## Package Structure

### Recommendation: Three new packages + one shared module in core

| Package | Purpose | Dependencies |
|---------|---------|-------------|
| `packages/toast` | Toast notification system | `@lit-ui/core` |
| `packages/tooltip` | Hover/focus hint overlay | `@lit-ui/core`, `@floating-ui/dom` |
| `packages/popover` | Interactive overlay content | `@lit-ui/core`, `@floating-ui/dom` |

### Shared Positioning: Add to `@lit-ui/core/utils`

Rather than a fourth package, add shared Floating UI utilities to `@lit-ui/core/utils`. This avoids a new package for what is essentially a ~50-line utility module. The Select component currently inlines its Floating UI usage -- Tooltip and Popover should use the shared utility instead. Select can optionally migrate later.

**New file:** `packages/core/src/utils/floating.ts`

```typescript
// Shared Floating UI positioning utility
import { computePosition, flip, shift, offset, arrow, autoUpdate } from '@floating-ui/dom';
import type { Placement, Middleware, Strategy } from '@floating-ui/dom';

export interface PositionOptions {
  placement?: Placement;
  strategy?: Strategy;
  offsetDistance?: number;
  padding?: number;
  arrowElement?: HTMLElement | null;
  fallbackPlacements?: Placement[];
}

export async function positionFloating(
  reference: HTMLElement,
  floating: HTMLElement,
  options: PositionOptions = {}
): Promise<{ x: number; y: number; placement: Placement; arrowData?: { x?: number; y?: number } }> {
  // ... shared implementation
}

export function autoUpdatePosition(
  reference: HTMLElement,
  floating: HTMLElement,
  callback: () => void
): () => void {
  return autoUpdate(reference, floating, callback);
}
```

**Why not Popover API or CSS Anchor Positioning instead of Floating UI?**

- **Popover API (`popover` attribute):** Baseline Widely Available as of April 2025. Handles top-layer rendering and light-dismiss well. However, it does NOT handle positioning -- it centers popovers by default. You still need Floating UI or CSS Anchor Positioning for anchor-relative placement.
- **CSS Anchor Positioning:** Just reached all three engines with Firefox 147 (January 2026). Too new for production use -- Baseline Newly Available means ~37% overall browser support when counting older browser versions. Polyfill exists but has Shadow DOM limitations.
- **`popover="hint"` for tooltips:** Chromium-only (since Chrome 133). Not in Firefox or Safari. Falls back to `popover="manual"`, losing light-dismiss and stacking behavior.

**Decision:** Use Floating UI for positioning (already a dependency via Select). Do NOT adopt native Popover API or CSS Anchor Positioning yet. Revisit when CSS Anchor Positioning reaches Baseline Widely Available (~2028). The Dialog component already uses native `<dialog>` with `showModal()` for top-layer, which is the correct platform primitive for modals. For tooltips and popovers, Floating UI with `position: fixed` and z-index management is the proven, cross-browser approach.

**Confidence:** HIGH -- Floating UI is already in the project, framework-agnostic, 3kB gzipped, and the standard solution for this problem space.

### Dependency Graph (post-implementation)

```
@lit-ui/core (adds floating.ts utility, @floating-ui/dom becomes peer dep)
  |
  +-- @lit-ui/tooltip  (uses core/utils/floating)
  +-- @lit-ui/popover  (uses core/utils/floating)
  +-- @lit-ui/toast    (no Floating UI needed -- fixed positioning)
  +-- @lit-ui/select   (currently inlines Floating UI -- can migrate later)
```

**Important consideration:** Adding `@floating-ui/dom` as a dependency of `@lit-ui/core` would force all components to carry it. Instead, keep it as an **optional peer dependency** or export the utility from a separate entry point (`@lit-ui/core/floating`) that only Tooltip, Popover, and Select import.

**Revised core package.json exports:**

```json
{
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./tokens": { "import": "./dist/tokens/index.js", "types": "./dist/tokens/index.d.ts" },
    "./utils": { "import": "./dist/utils/index.js", "types": "./dist/utils/index.d.ts" },
    "./floating": { "import": "./dist/utils/floating.js", "types": "./dist/utils/floating.d.ts" },
    "./fouc.css": "./src/fouc.css"
  }
}
```

This way, `@floating-ui/dom` is only pulled in by components that use `@lit-ui/core/floating`.

## Component Architectures

### 1. Toast System

Toast is architecturally the most complex because it requires:
- A **container** that manages toast positioning and stacking
- An **imperative API** that works from anywhere (including outside web components)
- **Cross-Shadow-DOM rendering** so toasts appear above all content

#### Container Strategy: Singleton Element on Document Body

**Recommendation:** Use a `<lui-toast-container>` element that auto-appends to `document.body`.

```
document.body
  +-- <lui-toast-container position="top-right">
  |     #shadow-root
  |       <div class="toast-stack" role="region" aria-label="Notifications" aria-live="polite">
  |         <lui-toast-item variant="success">...</lui-toast-item>
  |         <lui-toast-item variant="error">...</lui-toast-item>
  |       </div>
  +-- [rest of page content]
```

**Why document.body and not inside Shadow DOM?**

- Toasts must visually overlay everything, including dialogs and other overlays
- Rendering inside a component's Shadow DOM limits z-index stacking context
- The Dialog component uses native `<dialog>` with `showModal()` which renders in the top layer -- toasts above dialogs require either the Popover API top layer or very high z-index
- Auto-appending to body is the pattern used by Forge, Adobe Spectrum, and Salesforce LWC

**Container auto-creation:** The imperative API lazily creates the container on first toast:

```typescript
// packages/toast/src/toast-api.ts
function getOrCreateContainer(position: ToastPosition): HTMLElement {
  const id = `lui-toast-container-${position}`;
  let container = document.querySelector(id) as LuiToastContainer | null;
  if (!container) {
    container = document.createElement('lui-toast-container') as LuiToastContainer;
    container.id = id;
    container.position = position;
    document.body.appendChild(container);
  }
  return container;
}
```

**SSR behavior:** Toast container is client-only. During SSR, the toast API is a no-op. Toast is inherently interactive feedback -- there is no meaningful SSR representation.

#### Imperative API Design

Two-layer API: a global function and a CustomEvent bridge.

**Layer 1: Direct function call (preferred)**

```typescript
// packages/toast/src/index.ts
export function toast(message: string, options?: ToastOptions): ToastHandle;
export function toast.success(message: string, options?: ToastOptions): ToastHandle;
export function toast.error(message: string, options?: ToastOptions): ToastHandle;
export function toast.warning(message: string, options?: ToastOptions): ToastHandle;
export function toast.info(message: string, options?: ToastOptions): ToastHandle;
export function toast.dismiss(id: string): void;
export function toast.dismissAll(): void;

interface ToastOptions {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;        // ms, 0 = persistent. Default: 5000
  position?: ToastPosition; // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  action?: { label: string; onClick: () => void };
  description?: string;     // Secondary text
  dismissible?: boolean;    // Show close button. Default: true
}

interface ToastHandle {
  id: string;
  dismiss: () => void;
  update: (options: Partial<ToastOptions>) => void;
}

// Usage from any framework:
import { toast } from '@lit-ui/toast';
toast.success('File saved', { duration: 3000 });
```

**Layer 2: CustomEvent bridge (for non-module contexts)**

```typescript
// Fallback for contexts where imports are awkward (e.g., inline scripts)
window.dispatchEvent(new CustomEvent('lui-toast', {
  detail: { message: 'Hello', variant: 'success' }
}));
```

The container listens for `lui-toast` events on `window` as a secondary trigger mechanism.

**Why this dual approach?**

- The function API is type-safe, tree-shakeable, and works in all module-based frameworks
- The event API is a fallback for edge cases (server-rendered HTML with inline `<script>` tags, non-module contexts)
- Both patterns are established in the ecosystem (Salesforce uses both, Spectrum uses method-based, dile-toast uses method-based)

#### Toast Internal Components

```
@lit-ui/toast
  src/
    index.ts            # Public API: toast(), toast.success(), etc.
    toast-container.ts  # <lui-toast-container> - manages stack, positioning, animations
    toast-item.ts       # <lui-toast-item> - individual toast rendering
    types.ts            # Shared types
    constants.ts        # Default durations, positions
```

`<lui-toast-item>` extends TailwindElement. It handles:
- Variant styling (icon + colors via `--ui-toast-*` tokens)
- Auto-dismiss countdown with pause-on-hover
- Swipe-to-dismiss via Pointer Events (same pattern as Time Picker)
- Enter/exit CSS transitions (same `@starting-style` pattern as Dialog)
- `role="alert"` with `aria-live="polite"` for screen reader announcements
- Minimum 6 seconds visibility for accessibility (configurable but enforced minimum)

`<lui-toast-container>` extends TailwindElement. It handles:
- Position-based layout (`position: fixed` with edge alignment)
- Stack ordering (newest on top or bottom, configurable)
- Queue management (limit visible toasts, e.g., max 5)
- Animation coordination (stagger entry, collapse on exit)

#### Toast Data Flow

```
toast.success('Saved')
  -> getOrCreateContainer('top-right')
  -> container.addToast({ message: 'Saved', variant: 'success', ... })
    -> creates <lui-toast-item> element
    -> appends to shadow root's stack div
    -> starts auto-dismiss timer
    -> returns ToastHandle { id, dismiss(), update() }

timer expires OR user clicks close OR swipe-to-dismiss:
  -> toast-item triggers exit animation
  -> after animation completes, container removes element
  -> container re-stacks remaining toasts
```

### 2. Tooltip

Tooltip is the simplest overlay: non-interactive content anchored to a trigger element, shown on hover/focus.

#### Rendering Strategy: Inline in Shadow DOM

Tooltip content renders inside its own Shadow DOM, positioned with Floating UI using `position: fixed` and high z-index. No portaling needed because:
- Tooltip content is simple text (no interactive elements that need focus management)
- `position: fixed` escapes overflow:hidden containers
- The existing Select dropdown uses this same approach successfully

#### Component Structure

```html
<!-- Usage -->
<lui-tooltip content="Save your work">
  <lui-button>Save</lui-button>
</lui-tooltip>

<!-- Rendered DOM -->
<lui-tooltip>
  #shadow-root
    <slot></slot>  <!-- trigger: the button -->
    <div role="tooltip" id="tooltip-{uid}" class="tooltip-content"
         style="position: fixed; left: Xpx; top: Ypx;">
      <div class="tooltip-arrow"></div>
      <span>{content}</span>
    </div>
</lui-tooltip>
```

**Important:** The trigger element gets `aria-describedby="tooltip-{uid}"` added dynamically. Since the tooltip text is in Shadow DOM, we need to use `aria-describedby` pointing to a `slot` strategy OR use the `ElementInternals.ariaDescribedByElements` approach. However, cross-Shadow-DOM ARIA references are problematic.

**Preferred ARIA approach:** Use `aria-label` on the trigger when tooltip provides the only label, or render a visually-hidden span in the light DOM for `aria-describedby` reference. This is a known web component accessibility pattern.

#### Hover/Focus Across Shadow DOM Boundaries

**Problem:** `mouseenter`/`mouseleave` events respect Shadow DOM boundaries. Moving from the trigger to the tooltip arrow can fire `mouseleave` on the trigger.

**Solution:**

1. Listen for `pointerenter`/`pointerleave` on the host element (`<lui-tooltip>`) rather than the slotted trigger. Since the host contains both the trigger slot and the tooltip content, pointer events on either keep the tooltip open.

2. Use a delay pattern:
   - **Show delay:** 300ms (prevents flash on quick mouse-through)
   - **Hide delay:** 100ms (allows moving from trigger to tooltip without flicker)
   - **Shared delay group:** When one tooltip closes, nearby tooltips open immediately (no show delay). This is a UX pattern Floating UI documents.

3. Use `focusin`/`focusout` (which bubble, unlike `focus`/`blur`) for keyboard accessibility.

```typescript
// Simplified event flow
connectedCallback() {
  this.addEventListener('pointerenter', this._handleShow);
  this.addEventListener('pointerleave', this._handleHide);
  this.addEventListener('focusin', this._handleShow);
  this.addEventListener('focusout', this._handleHide);
  this.addEventListener('keydown', this._handleEscape); // Escape closes tooltip
}
```

#### Tooltip Props and API

```typescript
export class Tooltip extends TailwindElement {
  @property() content: string = '';          // Text content
  @property() placement: Placement = 'top'; // Floating UI placement
  @property({ type: Number }) showDelay = 300;
  @property({ type: Number }) hideDelay = 100;
  @property({ type: Number }) offset = 8;   // px from trigger
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean, attribute: 'show-arrow' }) showArrow = true;
}
```

**No imperative API needed.** Tooltip is purely declarative -- wrap a trigger and provide content. Programmatic show/hide can be done via the `disabled` property.

### 3. Popover

Popover is the most architecturally similar to the existing Select dropdown, but generalized for arbitrary content.

#### Rendering Strategy: Inline in Shadow DOM with Floating UI

Same as Tooltip -- render content in Shadow DOM with `position: fixed`. The Select component already proves this pattern works.

#### Component Structure

```html
<!-- Usage -->
<lui-popover>
  <lui-button slot="trigger">Settings</lui-button>
  <div>
    <p>Popover content here</p>
    <lui-button>Action</lui-button>
  </div>
</lui-popover>

<!-- Rendered DOM -->
<lui-popover>
  #shadow-root
    <slot name="trigger"></slot>
    <div class="popover-content" role="dialog" aria-label="Popover"
         style="position: fixed; left: Xpx; top: Ypx;"
         tabindex="-1">
      <div class="popover-arrow"></div>
      <slot></slot>  <!-- default slot: popover content -->
    </div>
</lui-popover>
```

#### Trigger Mechanisms

```typescript
export type PopoverTrigger = 'click' | 'hover' | 'manual';

export class Popover extends TailwindElement {
  @property() trigger: PopoverTrigger = 'click';
  @property() placement: Placement = 'bottom';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Number }) offset = 8;
  @property({ type: Boolean }) dismissible = true;     // Click outside closes
  @property({ type: Boolean, attribute: 'show-arrow' }) showArrow = true;
  @property({ type: Boolean, attribute: 'close-on-escape' }) closeOnEscape = true;
}
```

**Click trigger:** Click on trigger slot toggles open. Click outside (light-dismiss) closes. Escape closes.

**Hover trigger:** Same behavior as Tooltip but with interactive content. Must keep popover open when pointer moves into popover content.

**Manual trigger:** Only `open` property controls visibility. For programmatic use.

#### Focus Management

Unlike Tooltip, Popover contains interactive content and needs focus management:

1. On open: Move focus to first focusable element inside popover, or the popover container itself
2. Tab key: Cycles through focusable elements inside the popover (but does NOT trap -- popover is not modal)
3. On close: Return focus to trigger element
4. `aria-expanded` on trigger, `aria-controls` pointing to popover content

#### Nested Popover Support

A popover inside a popover should work naturally:
- Child popover's click-outside handler must not close parent
- Use `event.composedPath()` to detect if click is inside any ancestor popover
- This is the same pattern Dialog uses for nested dialogs (stopPropagation on close events)

### Code Sharing: Tooltip vs Popover

Tooltip and Popover share:
- Floating UI positioning logic (via `@lit-ui/core/floating`)
- Arrow rendering
- Show/hide delay logic
- Enter/exit CSS transitions

**Do NOT create a shared base class.** Instead, share via:
1. **Utility functions** in `@lit-ui/core/floating` (positioning, arrow math)
2. **CSS** -- shared transition patterns via CSS custom properties
3. **Mixin** (optional) -- a `FloatingMixin` that adds positioning lifecycle methods

**Why no shared base class?** Tooltip and Popover have different:
- Slot structures (Tooltip wraps content; Popover uses named trigger slot)
- ARIA patterns (tooltip role vs dialog role)
- Focus management (none vs active)
- Content models (text-only vs arbitrary slotted content)

Forcing a shared base class would create awkward conditionals. Keep them as separate classes using shared utilities.

## Z-Index Management

### Layering Strategy

Use CSS custom properties for z-index values, set at the document level via `@lit-ui/core`:

```css
:root {
  --ui-z-tooltip: 9000;
  --ui-z-popover: 9100;
  --ui-z-toast: 9200;
}
```

**Layering order (back to front):**

| Layer | Z-Index | Element | Rationale |
|-------|---------|---------|-----------|
| Base content | auto | Page content | Normal flow |
| Select dropdown | 8000 | `<lui-select>` dropdown | Current implicit value |
| Tooltip | 9000 | `<lui-tooltip>` content | Informational, non-blocking |
| Popover | 9100 | `<lui-popover>` content | Interactive overlay |
| Dialog | top layer | `<lui-dialog>` via showModal() | Native top layer (above all z-index) |
| Toast | 9200 | `<lui-toast-container>` | Must be visible over popovers |

**Note:** Dialog uses the browser's top layer (via `showModal()`), which renders above all z-index values. Toasts should also be visible when a dialog is open. Two options:
1. Give toast container a very high z-index (9200) -- works for non-modal dialogs but NOT for `showModal()` top layer
2. Use `popover="manual"` on toast container to put it in top layer too

**Recommendation:** Use `popover="manual"` on the toast container element. The Popover API (`popover="auto"` / `popover="manual"`) is Baseline Widely Available since April 2025. `popover="manual"` gives us top-layer rendering without light-dismiss behavior, which is exactly what toasts need. This ensures toasts appear above `showModal()` dialogs.

```html
<lui-toast-container popover="manual">
  <!-- toasts render here, in top layer -->
</lui-toast-container>
```

The container calls `this.showPopover()` on creation and stays open permanently. Individual toast items animate in/out within it.

## SSR Strategy Per Component

| Component | SSR Behavior | Rationale |
|-----------|-------------|-----------|
| Toast | **No SSR rendering** | Toasts are runtime feedback. Container auto-creates on first use. During SSR, `toast()` is a no-op (guarded by `isServer`). |
| Tooltip | **Render trigger only** | The slotted trigger renders normally. Tooltip content div renders with `display: none` or is not rendered at all during SSR. On hydration, tooltip behavior activates. |
| Popover | **Render trigger only** | Same as Tooltip. Slotted trigger content renders via Declarative Shadow DOM. Popover content panel is hidden by default (rendered closed). |

**SSR implementation patterns (matching existing codebase):**

```typescript
// Toast: No-op during SSR
export function toast(message: string, options?: ToastOptions): ToastHandle | null {
  if (isServer) return null;
  // ... client implementation
}

// Tooltip: Guard positioning
override updated(changed: Map<string, unknown>) {
  if (isServer) return;
  if (changed.has('open') && this.open) {
    this.positionTooltip();
  }
}

// Popover: Guard positioning and focus
show() {
  if (isServer) return;
  this.open = true;
}
```

This follows the exact same `isServer` guard pattern used by Dialog (`showModal()`) and Select (`computePosition()`).

## CSS Custom Properties (Theming Tokens)

Following the established `--ui-{component}-*` pattern:

### Toast Tokens
```css
--ui-toast-bg
--ui-toast-text
--ui-toast-border
--ui-toast-radius
--ui-toast-shadow
--ui-toast-padding
--ui-toast-gap              /* space between stacked toasts */
--ui-toast-max-width
--ui-toast-success-bg
--ui-toast-success-text
--ui-toast-success-border
--ui-toast-error-bg
--ui-toast-error-text
--ui-toast-error-border
--ui-toast-warning-bg
--ui-toast-warning-text
--ui-toast-warning-border
--ui-toast-info-bg
--ui-toast-info-text
--ui-toast-info-border
```

### Tooltip Tokens
```css
--ui-tooltip-bg
--ui-tooltip-text
--ui-tooltip-radius
--ui-tooltip-padding
--ui-tooltip-shadow
--ui-tooltip-font-size
--ui-tooltip-max-width
--ui-tooltip-arrow-size
```

### Popover Tokens
```css
--ui-popover-bg
--ui-popover-text
--ui-popover-border
--ui-popover-radius
--ui-popover-shadow
--ui-popover-padding
--ui-popover-arrow-size
--ui-popover-max-width
```

## Suggested Build Order

Based on dependency analysis and incremental complexity:

### Phase 1: Tooltip (simplest, establishes Floating UI shared utility)

1. Add `floating.ts` utility to `@lit-ui/core/floating` export
2. Build `<lui-tooltip>` using the shared utility
3. Establishes: Floating UI integration, arrow rendering, hover/focus delay pattern, CSS transitions for overlays

**Why first:** Simplest component, no imperative API, no portal. Forces creation of the shared Floating UI utility that Popover will reuse.

### Phase 2: Popover (builds on Tooltip's foundation)

1. Build `<lui-popover>` using same `@lit-ui/core/floating` utility
2. Adds: Click trigger, focus management, light-dismiss, nested support, `aria-expanded`
3. Validates that the shared utility works for multiple components

**Why second:** Reuses Phase 1's Floating UI utility. Adds focus management complexity but no portal/imperative API.

### Phase 3: Toast (most complex, standalone architecture)

1. Build `<lui-toast-container>` and `<lui-toast-item>`
2. Build imperative `toast()` API
3. Adds: Body-level portal, queue management, swipe-to-dismiss, `popover="manual"` for top-layer

**Why last:** Most complex architecture (portal, imperative API, queue management). No dependency on Tooltip or Popover code. Can be built in parallel if needed, but benefits from patterns established in Phases 1-2 (CSS transitions, `isServer` guards for new component types).

## Integration With Existing Components

### Select Component

The Select component currently inlines Floating UI calls. After the shared utility is created:
- **No immediate migration required.** Select works fine as-is.
- **Future cleanup:** Select's `positionDropdown()` could be refactored to use `@lit-ui/core/floating`, reducing ~15 lines of boilerplate. This is tech debt, not a blocker.

### Dialog Component

No integration needed. Dialog uses native `<dialog>` with `showModal()` (top layer). This is a different rendering strategy than Tooltip/Popover (Floating UI positioning). They coexist naturally.

### CLI Registry

Each new component needs CLI registration:
- `packages/cli/src/registry.ts` -- add toast, tooltip, popover entries
- Copy-source templates for each component
- Dependency declarations (tooltip and popover depend on `@lit-ui/core/floating`)

### Docs Site

New documentation pages for each component, following existing patterns:
- Usage examples
- Props/API reference
- Accessibility notes
- CSS custom properties table

## Accessibility Summary

| Component | ARIA Pattern | Key Requirements |
|-----------|-------------|-----------------|
| Toast | `role="alert"`, `aria-live="polite"` | Min 6s visibility, screen reader announcement, keyboard-dismissible |
| Tooltip | `role="tooltip"`, `aria-describedby` | Show on focus (not just hover), Escape to dismiss, no interactive content |
| Popover | `role="dialog"` or `role="menu"`, `aria-expanded`, `aria-controls` | Focus management, Escape to close, return focus to trigger |

## Sources

- [Floating UI documentation](https://floating-ui.com/) -- positioning, tooltip, middleware
- [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) -- Baseline Widely Available April 2025
- [Can I Use: CSS Anchor Positioning](https://caniuse.com/css-anchor-positioning) -- Baseline Newly Available January 2026
- [Chrome: popover="hint"](https://developer.chrome.com/blog/popover-hint) -- Chromium-only since Chrome 133
- [OddBird Polyfill Updates](https://www.oddbird.net/2025/05/06/polyfill-updates/) -- Shadow DOM support status
- [Lit Web Component Portal Pattern](https://davidwcai.medium.com/implement-react-portals-in-lit-web-components-ed41257f4a67) -- createRenderRoot approach
- [Forge Design System Shadow DOM](https://guide.forge.athena.io/guidelines/shadow-dom) -- portal-to-body pattern
- [Adobe Spectrum Toast](https://opensource.adobe.com/spectrum-web-components/components/toast/) -- web component toast reference
- [Radix Toast](https://www.radix-ui.com/primitives/docs/components/toast) -- imperative API pattern reference
- [jschof.dev Web Components + Popover API](https://jschof.dev/posts/2024/9/love-letter-to-the-platform/) -- practical Lit + Popover API guide
- [Firefox 147 Release Notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/147) -- CSS Anchor Positioning enabled by default
