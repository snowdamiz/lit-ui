# Feature Landscape: Toast, Tooltip, and Popover

**Domain:** Overlay/feedback web components for LitUI component library
**Researched:** 2026-02-02
**Overall confidence:** HIGH

## Sources

- [Sonner GitHub](https://github.com/emilkowalski/sonner) - Toast API patterns (HIGH)
- [shadcn/ui Sonner docs](https://ui.shadcn.com/docs/components/sonner) - Toast integration (HIGH)
- [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip) - Tooltip primitives (HIGH)
- [Radix UI Popover](https://www.radix-ui.com/primitives/docs/components/popover) - Popover primitives (HIGH)
- [Floating UI Tooltip](https://floating-ui.com/docs/tooltip) - Tooltip positioning/interaction (HIGH)
- [Floating UI Popover](https://floating-ui.com/docs/popover) - Popover positioning/focus (HIGH)
- [WAI-ARIA APG Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) - Accessibility spec (HIGH)
- [MDN ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) - Toast accessibility (HIGH)
- [Material Design 3 Snackbar](https://m3.material.io/components/snackbar/specs) - Snackbar specs (HIGH)
- [Material Design 3 Tooltips](https://m3.material.io/components/tooltips/specs) - Tooltip specs (HIGH)
- [web.dev Toast Pattern](https://web.dev/patterns/components/toast) - Web component toast pattern (HIGH)
- [Headless UI Popover](https://headlessui.com/v1/react/popover) - Popover patterns (HIGH)
- [HTML Popover API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using) - Native popover (HIGH)

---

## Toast Notifications

### Table Stakes

Features users expect. Missing any of these makes the toast feel incomplete.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|-------------|------------|-------------|-------|
| **Variant types (success, error, warning, info)** | Every toast library has these. Users need visual distinction between message types. | LOW | Core theming system | Distinct colors, icons per variant. Sonner, shadcn, Material all have these. |
| **Auto-dismiss with configurable duration** | Toasts that stay forever are not toasts. Default 4-5s is standard (Sonner: 4s, Material: 4-10s). | LOW | None | Expose `duration` property. Use `0` or `Infinity` for persistent. |
| **Programmatic imperative API** | `toast('message')` or `toast.success('message')` pattern. Every modern toast library uses imperative calls, not declarative rendering. | MEDIUM | None | Need a singleton `<lui-toaster>` container plus a global `LuiToast.show()` or similar function. This is the core API pattern from Sonner. |
| **Positioning (6 positions)** | top-left, top-center, top-right, bottom-left, bottom-center, bottom-right. Sonner, react-toastify, and all major libraries support all six. | LOW | None | CSS custom property on the toaster container. `position` attribute. |
| **Dismiss button (manual close)** | Users must be able to close toasts before timeout, especially for longer messages. | LOW | None | Small X button. Expose `closable` property (default true). |
| **Stacking/queue management** | Multiple toasts must stack visually without overlapping. Standard is newest on top/bottom depending on position. | MEDIUM | None | Sonner stacks up to `visibleToasts` (default 3) with collapsed preview of remaining. Material shows one at a time (new replaces old). Recommend Sonner-style stacking. |
| **Accessible live region** | Screen readers must announce toasts. `role="status"` with `aria-live="polite"` for info, `role="alert"` with `aria-live="assertive"` for errors. | LOW | None | Use `<output>` element or div with appropriate ARIA. Must be present in DOM before content injection (MDN requirement). |
| **Animation (enter/exit)** | Slide-in and fade-out at minimum. Toasts without animation feel jarring. | MEDIUM | CSS transitions (existing pattern) | web.dev uses FLIP technique. Sonner uses CSS transforms. Use CSS animations with `prefers-reduced-motion` respect. |
| **Description support** | Toast with title + description for richer messages. `toast('Title', { description: 'Details...' })` | LOW | None | Sonner pattern. Two-line layout with smaller description text. |

### Differentiators

Features that set LitUI's toast apart. Not strictly expected, but valued.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|------------------|------------|-------------|-------|
| **Action buttons (undo/retry)** | Inline actions directly in toasts. Sonner's `toast('Deleted', { action: { label: 'Undo', onClick: fn } })` pattern is highly praised. | MEDIUM | lui-button (existing) | One action button max. Keep it simple. Material also supports one action. |
| **Promise toast** | `toast.promise(asyncFn, { loading, success, error })` auto-manages loading/success/error states. Signature Sonner feature. | MEDIUM | None | Single toast transitions through states. Avoids stacking loading + result toasts. |
| **Swipe to dismiss** | Touch-friendly dismissal. Sonner supports this by default. Standard on mobile. | MEDIUM | None | Track touch events, animate opacity/transform based on swipe distance. Threshold-based dismissal. |
| **Pause on hover/focus** | Timer pauses when user hovers over toast or focuses it. Prevents dismissal while user is reading. | LOW | None | Standard UX pattern. Sonner and react-toastify both do this. |
| **Custom content via slot** | Allow arbitrary HTML content in toasts beyond just text. `toast.custom(element)` pattern. | LOW | Lit slot system | Web component advantage: use slots for custom content. |
| **Theme-aware (light/dark)** | Toasts automatically match the current theme. | LOW | Existing theme system | Already have CSS custom properties theming. Apply to toast container. |
| **Framework-agnostic imperative API** | Since LitUI is web components, the toast API must work from vanilla JS, React, Vue, Svelte equally. Event-based or global function. | MEDIUM | None | Key differentiator vs React-only Sonner. Use `document.querySelector('lui-toaster').show()` or a global `LuiToast` import. |

### Anti-Features

Features to deliberately NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|-------------|----------|-------------------|
| **Interactive forms in toasts** | WAI-ARIA explicitly warns against interactive content in timed notifications. Focus management conflicts with auto-dismiss. Toasts with forms violate WCAG 2.2.3 (AAA). | Use `lui-dialog` for anything requiring user input. Toasts get one action button max. |
| **Persistent/blocking toasts by default** | Defeats the purpose of toast as non-intrusive feedback. Material explicitly says: if it blocks the screen, use a dialog. | Toasts auto-dismiss. For persistent messages, use alerts or dialogs. Allow `duration: Infinity` as escape hatch but not default. |
| **Rich media (images, progress bars) in toasts** | Scope creep. Adds complexity without proportional value. Most users need text + optional action. | Keep toasts text-focused. Icon per variant is sufficient. Custom slot covers edge cases. |
| **Toast notification center/history** | Massive scope expansion. Requires state management, UI for notification list, read/unread states. This is a notification system, not a toast component. | Out of scope. If users need notification history, that is an application concern, not a component library concern. |
| **Sound/vibration on toast** | Browser API restrictions, user annoyance, accessibility concerns. No major component library does this. | Leave audio feedback to the application layer. |
| **Stacking more than 5 visible toasts** | Visual clutter. Sonner defaults to 3 visible. If you have 5+ simultaneous toasts, the UX problem is upstream. | Cap `visibleToasts` at 5, default 3. Queue the rest. |

---

## Tooltip

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|-------------|------------|-------------|-------|
| **Hover trigger with delay** | Core tooltip behavior. WAI-ARIA: appears on hover. Delay prevents flicker on mouse pass-through. Radix default: 700ms, Sonner: N/A. | LOW | None | `delay` property. Default 700ms (Radix convention). Delay only on open, not close. |
| **Focus trigger** | WAI-ARIA requirement: tooltip must appear on keyboard focus of trigger element. | LOW | None | Add `focusin`/`focusout` listeners alongside `mouseenter`/`mouseleave`. |
| **Escape to dismiss** | WAI-ARIA requirement. User must be able to dismiss tooltip with Escape key. | LOW | None | Keyboard event listener. Only when tooltip is visible. |
| **Positioning with collision avoidance** | Tooltip must flip/shift when near viewport edges. Radix, Floating UI, and all libraries handle this. | LOW | Floating UI (already in project) | Reuse existing `@floating-ui/dom` with `flip`, `shift`, `offset` middleware (same as Select). |
| **Arrow indicator** | Visual connection between tooltip and trigger. Radix, Material, and most libraries support optional arrows. | LOW | Floating UI `arrow` middleware | Add `arrow` middleware to Floating UI. CSS triangle or SVG. |
| **role="tooltip" and aria-describedby** | WAI-ARIA requirement. Trigger references tooltip via `aria-describedby`. Tooltip has `role="tooltip"`. | LOW | None | Auto-generate ID for tooltip content. Set `aria-describedby` on trigger. |
| **Configurable placement** | top, right, bottom, left (with optional start/end alignment). 12 placements standard. | LOW | Floating UI | Already supported by Floating UI's `placement` option. |
| **Non-interactive content only** | WAI-ARIA explicitly states tooltips do not receive focus and must not contain interactive elements. This is a constraint, not a feature, but must be enforced by design. | LOW | None | Document clearly. For interactive floating content, use Popover. |
| **SSR safe** | No DOM operations during server render. | LOW | Existing `isServer` guards | Same pattern as all other LitUI components. |

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|------------------|------------|-------------|-------|
| **Delay group (skip delay for adjacent tooltips)** | When moving between multiple tooltipped elements, skip the delay for subsequent tooltips. Radix `Tooltip.Provider` has `skipDelayDuration`. Floating UI has `FloatingDelayGroup`. | MEDIUM | None | Track last tooltip close time globally. If within `skipDelay` window (default 300ms), open immediately. Radix and Floating UI both recommend this. |
| **Rich tooltip (title + description)** | Material Design 3 distinguishes plain vs rich tooltips. Rich tooltips have title, description, and optional link. Useful for feature explanations. | MEDIUM | None | Two slots: default (plain text) and a structured variant with heading + body. Rich tooltips can optionally persist on hover (Material pattern). |
| **Portal rendering** | Render tooltip in document body to escape overflow:hidden ancestors. Radix uses `Tooltip.Portal`. | MEDIUM | None | Create a shared portal container element. Teleport tooltip content there. Important for tooltips inside scrollable containers. |
| **Animation with transform-origin awareness** | Radix exposes `--radix-tooltip-content-transform-origin` CSS variable that changes based on placement. Enables scale animations from the correct origin. | LOW | Floating UI | Compute transform-origin from placement. Expose as CSS custom property. |
| **Virtual trigger element** | Allow positioning tooltip relative to cursor position or arbitrary coordinates, not just a DOM element. Floating UI supports `virtualElement`. | MEDIUM | Floating UI | Useful for chart tooltips, canvas overlays. Floating UI already supports this via `virtualElement` reference. |
| **Disabled element support** | Tooltips on disabled buttons. Native `disabled` attr prevents hover/focus events. Radix recommends `aria-disabled` instead. | LOW | None | Document the `aria-disabled` pattern. Optionally wrap disabled elements in a span to receive events. |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|-------------|----------|-------------------|
| **Interactive content in tooltips** | WAI-ARIA explicitly prohibits this. Tooltips do not receive focus. Interactive content in a tooltip is inaccessible to keyboard users. | Use `lui-popover` for interactive floating content. |
| **Click-triggered tooltips** | Violates user expectations. Click-triggered floating content is a popover, not a tooltip. Mixing the two creates confusion. | Use `lui-popover` for click-triggered content. |
| **Touch-triggered tooltips (long press)** | Unreliable UX on mobile. Users do not expect to long-press for information. Material handles this but it is contentious. | On touch devices, consider showing tooltip info inline or using a popover. Do not implement long-press tooltip trigger. |
| **Tooltip with close button** | If it needs a close button, it is a popover. Tooltips dismiss automatically on mouse leave / blur / Escape. | Use `lui-popover` with explicit close. |
| **Custom tooltip positioning logic** | Reinventing Floating UI. The project already depends on it. | Use Floating UI middleware exclusively. No custom positioning math. |

---

## Popover

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|-------------|------------|-------------|-------|
| **Click-to-toggle trigger** | Core popover behavior. Click trigger opens/closes popover. Radix, Headless UI, and Floating UI all use click toggle. | LOW | None | Toggle on trigger click. Track open/closed state. |
| **Escape to dismiss** | Standard behavior across all libraries. WAI-ARIA dialog pattern. | LOW | None | Keyboard listener when open. |
| **Click outside to dismiss (light dismiss)** | Core expectation. Radix, Headless UI, Floating UI all implement this. Native Popover API calls this "light dismiss". | MEDIUM | None | `pointerdown` listener on document. Check if target is within popover or trigger. Handle edge cases with portals. |
| **Positioning with collision avoidance** | Same as tooltip. Must flip/shift near viewport edges. | LOW | Floating UI (existing) | Reuse `@floating-ui/dom` with `flip`, `shift`, `offset`. Same middleware stack as Select and Tooltip. |
| **Arrow indicator** | Optional visual connector. Radix `Popover.Arrow`, Floating UI `arrow` middleware. | LOW | Floating UI `arrow` middleware | Same implementation as Tooltip arrow. Shared utility. |
| **Focus management** | When popover opens, focus should move into the popover content. On close, focus returns to trigger. | MEDIUM | Existing focus restoration pattern from Dialog | Non-modal by default (tab out closes popover). Modal variant traps focus like Dialog. Floating UI distinguishes these explicitly. |
| **Configurable placement (12 positions)** | top, right, bottom, left with start/center/end alignment. | LOW | Floating UI | Same as Tooltip. |
| **Accessible ARIA attributes** | `aria-expanded` on trigger. `aria-haspopup` on trigger. `role="dialog"` on content (Floating UI recommendation). `aria-labelledby` linking to heading if present. | LOW | None | Auto-set on trigger when popover opens/closes. |
| **Controlled and uncontrolled modes** | Radix pattern: works without state management (uncontrolled) or with explicit `open` prop (controlled). | MEDIUM | None | Internal state by default. `open` property + `open-changed` event for controlled mode. Same pattern as Dialog. |
| **SSR safe** | No DOM operations during server render. | LOW | Existing `isServer` guards | Same pattern as all LitUI components. |

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|------------------|------------|-------------|-------|
| **Portal rendering** | Escape overflow:hidden ancestors. Render popover content in document body or custom container. Radix uses `Popover.Portal`. | MEDIUM | None | Share portal infrastructure with Tooltip. Single `lui-portal-container` element. |
| **Anchor element (separate from trigger)** | Radix `Popover.Anchor` allows positioning relative to a different element than the trigger button. Useful when trigger and reference element differ. | LOW | Floating UI | Expose `anchor` property that accepts a CSS selector or element reference. Falls back to trigger. |
| **Nested popover support** | Popovers inside popovers. Headless UI `Popover.Group` manages this. Native Popover API handles stacking natively. | HIGH | None | Need to track parent-child popover relationships. Closing parent closes children. Opening child keeps parent open. Complex but important for toolbar-style UIs. |
| **Modal vs non-modal mode** | Floating UI explicitly distinguishes these. Modal: traps focus, requires close button. Non-modal: tab-out closes popover. | MEDIUM | Focus trap logic from Dialog | Non-modal is default and most common. Modal is for complex popover forms. Reuse Dialog focus trap. |
| **Width matching trigger** | Radix exposes `--radix-popover-trigger-width`. Useful for dropdown-like popovers that match trigger width. | LOW | Floating UI `size` middleware | Already used in Select component. Expose as CSS custom property. |
| **Native Popover API integration** | The HTML `popover` attribute is now well-supported (all major browsers). Renders in top layer, avoids z-index issues, gets light-dismiss for free. | MEDIUM | None | Use `popover="auto"` on the content element. Gets top-layer rendering, light dismiss, and Escape handling natively. Progressive enhancement: fall back to JS-based approach where unsupported. Hint popovers (`popover="hint"`) are ideal for tooltips but only in Chromium currently. |
| **Popover group behavior** | When multiple related popovers exist (like nav menus), opening one closes siblings. Headless UI `Popover.Group` pattern. | MEDIUM | None | Useful for navigation bars with multiple dropdown menus. Track group membership. |
| **Transition/animation hooks** | Expose `data-state="open|closed"` attributes for CSS animation targeting. Radix pattern: `data-side` and `data-align` attributes change at runtime to reflect collision adjustments. | LOW | None | Already used in other LitUI components. Apply same pattern. |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|-------------|----------|-------------------|
| **Hover-triggered popover** | Popovers contain interactive content. Hover-triggered interactive content is inaccessible (disappears when moving to it). This is a tooltip behavior. | Use `lui-tooltip` for hover. `lui-popover` is click-only. If hover + interactive content is truly needed, implement a tooltip with `interactive: true` as a separate pattern (like Tippy.js), but strongly discourage it. |
| **Full form management inside popover** | Popover is a container, not a form component. Adding form validation, submission, and state management to the popover itself creates tight coupling. | Popover provides the container. Users compose their own form elements inside it. LitUI's existing form components (Input, Select, etc.) work inside popovers. |
| **Drag-to-reposition** | Movable popovers are a different UX pattern (floating panels). Adds significant complexity with no clear demand in standard component libraries. | Out of scope. If needed, that is a separate `lui-floating-panel` component. |
| **Popover with built-in header/footer slots** | Over-opinionated. Unlike Dialog which has clear title/content/footer conventions, popovers are general-purpose containers. Forcing structure limits flexibility. | Provide a single default slot. Users structure content as needed. Document common patterns (with heading, with close button, with form). |
| **Auto-sizing to content** | Attempting to auto-measure and resize popovers based on dynamic content leads to layout thrashing. | Set reasonable max-width/max-height via CSS custom properties. Let content determine size within constraints. `--radix-popover-content-available-height` pattern is fine to expose. |

---

## Cross-Cutting Features (Shared Infrastructure)

These features span all three components and should be built as shared utilities.

| Feature | Applies To | Complexity | Notes |
|---------|-----------|------------|-------|
| **Shared Floating UI positioning layer** | Tooltip, Popover | MEDIUM | Abstract `computePosition` + middleware setup into a shared mixin or utility. Select already uses this. Create `FloatingMixin` or `floating-utils.ts`. |
| **Shared portal rendering** | Tooltip, Popover, Toast | MEDIUM | Single portal container approach. Toasts already need a fixed container. Tooltip/Popover need portal for z-index escape. |
| **CSS custom properties for animation** | All three | LOW | `--lui-toast-duration`, `--lui-tooltip-delay`, `--lui-popover-offset`. Consistent with existing theming approach. |
| **prefers-reduced-motion respect** | All three | LOW | Already done in other components. Apply same `@media (prefers-reduced-motion: reduce)` pattern. Reduce/disable animations. |
| **data-state attribute pattern** | All three | LOW | `data-state="open"` / `data-state="closed"` for CSS animation hooks. Consistent with Radix pattern and existing LitUI approach. |
| **Z-index management** | All three | LOW | Define z-index layers: toast > popover > tooltip > base. Use CSS custom properties: `--lui-z-toast: 9999`, `--lui-z-popover: 9000`, `--lui-z-tooltip: 8000`. Or use native Popover API top-layer where available. |

---

## Feature Dependencies

```
Shared Infrastructure
  |
  +-- Floating UI utility layer (positioning, flip, shift, offset, arrow)
  |     |
  |     +-- lui-tooltip (hover/focus trigger + Floating UI)
  |     |
  |     +-- lui-popover (click trigger + Floating UI + focus management)
  |
  +-- Portal rendering utility
  |     |
  |     +-- lui-tooltip (optional portal mode)
  |     |
  |     +-- lui-popover (optional portal mode)
  |     |
  |     +-- lui-toaster (fixed position container)
  |
  +-- lui-toaster (container component)
        |
        +-- lui-toast (individual toast element, managed by toaster)
              |
              +-- Imperative API (LuiToast.show / toast())
```

Key dependency chain:
- Tooltip and Popover both depend on Floating UI utility layer (shared)
- Toast is independent of Floating UI (uses fixed CSS positioning)
- Popover reuses focus management patterns from existing Dialog
- All three share animation/transition patterns and theming

---

## MVP Recommendation

### Phase 1: Toast (standalone, no Floating UI dependency)
Build toast first because it is self-contained and high-impact. Users immediately see value.
1. `<lui-toaster>` container with positioning
2. `<lui-toast>` element with variants, auto-dismiss, close button
3. Imperative API (`LuiToast.success('message')`)
4. Stacking with `visibleToasts` limit
5. Accessible live region

### Phase 2: Tooltip (builds shared Floating UI layer)
Build tooltip second because it establishes the shared Floating UI infrastructure.
1. Extract Floating UI utility from Select into shared layer
2. `<lui-tooltip>` with hover/focus triggers, delay, placement
3. Arrow support
4. Delay groups
5. Portal rendering (shared with Phase 3)

### Phase 3: Popover (builds on tooltip infrastructure)
Build popover last because it reuses tooltip positioning and adds focus management.
1. `<lui-popover>` with click trigger, light dismiss, Escape
2. Focus management (non-modal default, modal option)
3. Controlled/uncontrolled modes
4. Anchor element support
5. Native Popover API progressive enhancement

### Post-MVP / Future
- Promise toasts
- Swipe to dismiss
- Rich tooltips
- Popover groups
- Nested popovers
- Virtual trigger elements

---

## Competitive Comparison Summary

| Feature | Sonner | Radix | Floating UI | Material | LitUI Target |
|---------|--------|-------|-------------|----------|--------------|
| **Framework** | React only | React only | Any | Any | Any (web components) |
| **Toast types** | 5 types | N/A (uses Sonner) | N/A | 1 (snackbar) | 5 types |
| **Toast API** | Imperative | N/A | N/A | Imperative | Imperative |
| **Tooltip delay group** | N/A | Yes (Provider) | Yes (DelayGroup) | No | Yes |
| **Popover focus mgmt** | N/A | Yes | Yes (modal/non-modal) | N/A | Yes |
| **Native Popover API** | No | No (considering) | No | No | Yes (progressive enhancement) |
| **Swipe dismiss** | Yes | Yes (Toast) | No | Yes (snackbar) | Yes (toast) |
| **Bundle size** | 2-3KB | ~5KB per primitive | ~3KB | Large (MUI) | Target: <3KB per component |

LitUI's key differentiator is framework-agnostic web components with the same developer experience quality as React-specific libraries like Sonner and Radix, plus progressive enhancement with native browser APIs (Popover API, CSS Anchor Positioning) where available.
