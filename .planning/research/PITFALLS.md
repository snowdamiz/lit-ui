# Domain Pitfalls: Toast, Tooltip, and Popover Overlay Components

**Domain:** Overlay/feedback components in a Shadow DOM web component library (LitUI)
**Researched:** 2026-02-02
**Confidence:** HIGH (verified against existing codebase patterns + authoritative sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, accessibility failures, or fundamental architecture problems.

---

### Pitfall 1: aria-describedby Cannot Cross Shadow DOM Boundaries

**Severity:** CRITICAL
**Affects:** Tooltip, Popover
**Phase:** Tooltip (must solve before shipping)

**What goes wrong:** The standard tooltip pattern requires `aria-describedby` on the trigger element pointing to the tooltip's ID. When the tooltip content lives inside a Shadow DOM (as all LitUI components do), and the trigger lives in a different shadow root or the light DOM, the IDREF-based association silently fails. Screen readers never announce the tooltip content. The developer sees no error -- it just does not work.

**Why it happens:** Shadow DOM encapsulation prevents ID references from crossing shadow root boundaries. This is by W3C spec design, not a bug. The `aria-describedby="tooltip-id"` attribute on a trigger element can only reference elements within the same shadow root or document scope.

**Consequences:**
- Tooltips are invisible to screen reader users -- a fundamental accessibility violation
- No browser error or warning is surfaced, so it ships undetected
- Popovers with `aria-labelledby` or `aria-describedby` pointing across roots also break

**Prevention:**
1. **Keep trigger and tooltip in the same DOM scope.** The tooltip component should render its tooltip content as a sibling to the slot where the trigger lives, within the same shadow root. Do NOT put the tooltip text in a nested shadow root.
2. **Use `ariaDescribedByElements` (Element Reflection) where supported.** Chromium and WebKit support element reference properties that bypass the ID requirement: `triggerEl.ariaDescribedByElements = [tooltipEl]`. This works across shadow boundaries.
3. **Fallback: use `aria-label` on the trigger** when the tooltip is purely descriptive (most common case). This avoids the cross-root reference entirely.
4. **Test with screen readers in CI.** Automated accessibility testing (axe-core) catches missing ARIA associations.

**Detection:** Test with VoiceOver/NVDA. If the tooltip text is never announced when the trigger is focused, this pitfall has occurred.

**Sources:**
- [Shadow DOM and accessibility: the trouble with ARIA](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) (HIGH confidence)
- [Solving Cross-root ARIA Issues in Shadow DOM](https://blogs.igalia.com/mrego/solving-cross-root-aria-issues-in-shadow-dom/) (HIGH confidence)
- [How Shadow DOM and accessibility are in conflict](https://alice.pages.igalia.com/blog/how-shadow-dom-and-accessibility-are-in-conflict/) (HIGH confidence)
- [Angular Material AriaDescriber Shadow DOM bug](https://github.com/angular/components/issues/24919) (HIGH confidence -- real-world example of this exact failure)

---

### Pitfall 2: Toast aria-live Region Must Exist Before Content is Injected

**Severity:** CRITICAL
**Affects:** Toast
**Phase:** Toast (foundational architecture decision)

**What goes wrong:** A toast component renders an `aria-live="polite"` container only when a toast notification appears (e.g., dynamically creating the live region via `display: none` toggling or DOM insertion). Screen readers never announce the toast because the live region was not in the accessibility tree before content was injected.

**Why it happens:** Screen readers build their model of live regions at page load or when elements first appear in the accessibility tree. A live region that transitions from `display: none` to `display: block` (or is dynamically inserted) at the moment content arrives is effectively "new" -- the screen reader has not registered it for monitoring. This is documented behavior across NVDA, JAWS, and VoiceOver.

**Consequences:**
- Toast notifications are completely silent for screen reader users
- The toast appears to work visually, so it ships to production undetected
- Retrofitting requires architectural change to the toast mounting strategy

**Prevention:**
1. **Mount an empty live region container at application startup**, not when the first toast appears. The `<lui-toast-region>` (or similar orchestrator element) should be placed in the document once and persist for the page lifetime.
2. **Never use `display: none` or `aria-hidden="true"` on the live region container.** Use `visibility: hidden` or position it off-screen if it must be visually hidden when empty.
3. **Clear then re-inject content** for repeated identical messages. If the same toast text is shown twice, screen readers may not re-announce it. Briefly clear the live region content before injecting the new message.
4. **Use `role="status"` (polite) for informational toasts and `role="alert"` (assertive) only for error/critical toasts.** Overusing `role="alert"` is disruptive and violates WCAG guidance.

**Detection:** Test with NVDA + Firefox and VoiceOver + Safari. If the first toast after page load is never announced, this pitfall has occurred.

**LitUI-specific note:** The existing Dialog component uses the native `<dialog>` element which handles accessibility natively. Toasts have no equivalent native element -- the accessibility architecture must be built from scratch.

**Sources:**
- [Accessible notifications with ARIA Live Regions (Part 1)](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) (HIGH confidence)
- [Accessible notifications with ARIA Live Regions (Part 2)](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-2/) (HIGH confidence)
- [Shoelace Alert live region issue #1359](https://github.com/shoelace-style/shoelace/issues/1359) (HIGH confidence -- web component library that hit this exact bug)
- [MDN ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) (HIGH confidence)

---

### Pitfall 3: Overlay Trapped Inside Shadow DOM Stacking Context

**Severity:** CRITICAL
**Affects:** Tooltip, Popover, Toast
**Phase:** Shared (architecture decision before any component)

**What goes wrong:** A tooltip or popover renders inside its Shadow DOM host, but a parent element has `overflow: hidden`, `transform`, `filter`, `will-change`, or a `z-index` that creates a stacking context. The overlay is visually clipped or hidden behind other content. Setting `z-index: 999999` on the tooltip does nothing because z-index only competes within the same stacking context.

**Why it happens:** CSS stacking contexts are inescapable. Once a parent creates one (even unintentionally, e.g., via `transform: translateZ(0)` for GPU acceleration), all descendants are confined to it. Shadow DOM does not change stacking context rules.

**Consequences:**
- Tooltips/popovers are cut off or invisible in common layouts (cards with `overflow: hidden`, scrollable containers, transformed elements)
- Users report "tooltip doesn't show" in specific contexts that are hard to reproduce
- No CSS-only fix exists once the overlay is inside the stacking context

**Prevention:**
1. **Use the Popover API (`popover` attribute) for top-layer rendering.** Elements with the `popover` attribute are promoted to the browser's top layer, escaping all stacking contexts. The Popover API is Baseline Widely Available as of April 2025. LitUI's Dialog already uses the top layer via `<dialog>.showModal()` -- tooltips and popovers should follow the same strategy.
2. **Fallback for non-popover-API browsers:** Append the overlay to `document.body` (portal pattern). This is the pre-Popover-API standard workaround used by virtually all component libraries.
3. **Use `strategy: 'fixed'` with Floating UI** (LitUI already does this in Select and DatePicker). Fixed positioning is relative to the viewport, not the parent, which avoids most `overflow: hidden` clipping.
4. **Do NOT attempt to "fix" this with high z-index values.** It fundamentally cannot work across stacking contexts.

**Detection:** Place the component inside a parent with `overflow: hidden; transform: scale(1);` and verify the overlay is still fully visible.

**LitUI-specific note:** The existing Select component renders its dropdown inside the shadow root and uses `strategy: 'fixed'` -- this works for most cases but will fail inside transformed containers. The Popover API is the proper solution for new overlay components.

**Sources:**
- [What The Heck, z-index? (Josh Comeau)](https://www.joshwcomeau.com/css/stacking-contexts/) (HIGH confidence)
- [UI5 Web Components Popover API migration](https://sap.github.io/ui5-webcomponents/blog/releases/popover-api-in-v2/) (HIGH confidence -- real library migration)
- [Tooltip should use Popover API to avoid z-index issues (Primer)](https://github.com/primer/react/issues/2124) (HIGH confidence)

---

### Pitfall 4: Floating UI offsetParent Miscalculation in Shadow DOM

**Severity:** CRITICAL
**Affects:** Tooltip, Popover
**Phase:** Shared (positioning infrastructure)

**What goes wrong:** Floating UI uses `offsetParent` to calculate element positions. Inside Shadow DOM, browsers return incorrect `offsetParent` values per the CSS spec (Shadow DOM encapsulation hides the actual offset parent). Tooltips and popovers appear in the wrong position -- sometimes hundreds of pixels off.

**Why it happens:** The CSS spec intentionally prevents `offsetParent` from leaking nodes inside shadow trees. Chrome 109+, Firefox, and Safari all follow this spec. Floating UI's default `getOffsetParent` implementation does not account for this.

**Consequences:**
- Overlays appear at wrong coordinates, sometimes off-screen
- Only manifests when the component is nested inside other Shadow DOM components (which is the default in LitUI since everything extends TailwindElement with Shadow DOM)
- Works in simple test cases, fails in real application layouts

**Prevention:**
1. **Install and configure `composed-offset-position` ponyfill.** This is Floating UI's official recommendation:
   ```typescript
   import { platform } from '@floating-ui/dom';
   import { offsetParent } from 'composed-offset-position';

   computePosition(reference, floating, {
     platform: {
       ...platform,
       getOffsetParent: (element) =>
         platform.getOffsetParent(element, offsetParent),
     },
   });
   ```
2. **Create a shared `computeOverlayPosition` utility** in `@lit-ui/core` that all overlay components use, so this fix is applied consistently. The existing Select and DatePicker components could also benefit from this.
3. **Use `strategy: 'fixed'`** as an additional safety measure (already done in existing components).
4. **Note:** `composed-offset-position` does NOT work with closed shadow roots (only open). LitUI uses open shadow roots (Lit default), so this is fine.

**Detection:** Nest a tooltip inside 2-3 levels of LitUI Shadow DOM components and verify positioning accuracy.

**LitUI-specific note:** The existing Select and DatePicker use `computePosition` directly without `composed-offset-position`. They currently rely on `strategy: 'fixed'` which masks the problem in most cases, but new overlay components should use the ponyfill from the start. Consider retrofitting existing components later.

**Sources:**
- [Floating UI Platform documentation](https://floating-ui.com/docs/platform) (HIGH confidence)
- [Floating UI Shadow DOM offsetParent issue #1345](https://github.com/floating-ui/floating-ui/issues/1345) (HIGH confidence)
- [Mozilla Bug 1583562: Incorrect offset measurement in shadow DOM](https://bugzilla.mozilla.org/show_bug.cgi?id=1583562) (HIGH confidence)

---

## High Pitfalls

Mistakes that cause significant bugs, accessibility issues, or user experience failures.

---

### Pitfall 5: Toast Queue Race Conditions During Rapid Fire

**Severity:** HIGH
**Affects:** Toast
**Phase:** Toast

**What goes wrong:** Multiple toasts are triggered in rapid succession (e.g., form validation showing 5 errors at once, or a WebSocket stream producing notifications). The toast queue manager tries to show, animate-out, and remove toasts concurrently. Toasts stack on top of each other, exit animations interrupt entry animations, or toasts get stuck in a partially-visible state.

**Why it happens:** Toast show/dismiss involves async operations (CSS transitions, `requestAnimationFrame`, timeouts). Without a proper state machine, concurrent operations interleave unpredictably. The `transitionend` event may not fire if the element is removed mid-transition or if the transition is interrupted.

**Consequences:**
- Visual glitches: toasts overlapping, jumping, or freezing mid-animation
- Stuck toasts that never dismiss (timeout was cleared but never restarted)
- Memory leaks from toast elements that were "dismissed" but never removed from DOM

**Prevention:**
1. **Implement a toast queue as a state machine** with explicit states: `queued`, `entering`, `visible`, `exiting`, `removed`. Only allow valid transitions.
2. **Use the Web Animations API (`element.animate()`)** instead of CSS transitions for programmatic control. The returned `Animation` object has `.finished` (a Promise) and `.cancel()` for clean interruption.
3. **Set a maximum queue length** (e.g., 5-10) and drop oldest toasts when exceeded. An unbounded queue is a memory leak waiting to happen.
4. **Never rely on `transitionend` as the sole mechanism for state advancement.** Always pair it with a timeout fallback -- if `transitionend` does not fire within `duration + 100ms`, advance the state anyway.
5. **Use `requestAnimationFrame` to batch DOM mutations** when adding/removing multiple toasts.

**Detection:** Fire 20 toasts in a tight loop (e.g., in a `for` loop with no delay). Verify all 20 eventually show and dismiss cleanly.

**LitUI-specific note:** The Dialog component does not have a queue -- it is a single modal. The calendar's `AnimationController` handles animation cancellation well (`this.currentAnimation?.cancel()`) and could serve as a reference pattern for toast animations.

---

### Pitfall 6: Tooltip Hover Intent -- Showing on Accidental Mouse Passes

**Severity:** HIGH
**Affects:** Tooltip
**Phase:** Tooltip

**What goes wrong:** A tooltip shows instantly on `mouseenter` with no delay. When the user moves their mouse across a toolbar with many tooltip-enabled buttons, every tooltip flashes briefly as the cursor crosses each element. This creates a jarring, distracting experience. On touch devices, a `mouseenter` is synthesized from touch events, causing tooltips to appear unexpectedly after a tap.

**Why it happens:** The `mouseenter` event fires immediately when the cursor enters the element boundary, even if the user is just passing through. Touch devices synthesize mouse events to maintain compatibility, creating false hover states.

**Consequences:**
- Rapid tooltip flickering across dense UIs (toolbars, icon grids)
- Tooltips appearing on mobile after tap, overlapping the element the user just tapped
- Performance degradation from rapid Floating UI position calculations

**Prevention:**
1. **Add a show delay** (100-200ms). Only show the tooltip if the cursor is still over the element after the delay. Cancel on `mouseleave`.
2. **Implement "warm-up" behavior:** After one tooltip has been shown, subsequent tooltips in the same area show with a shorter delay (or instantly). This is how native OS tooltips work.
3. **Add a hide delay** (50-100ms). This prevents the tooltip from flickering when the cursor briefly leaves and re-enters (e.g., moving to the tooltip itself for interactive tooltips).
4. **Detect touch devices** and use a different interaction model: long-press to show, tap-elsewhere to dismiss. Do NOT show tooltips on the synthetic `mouseenter` from a touch event. Use `pointerenter` with `pointerType` checking instead:
   ```typescript
   handlePointerEnter(e: PointerEvent) {
     if (e.pointerType === 'touch') return; // skip touch-synthesized hover
     this.startShowDelay();
   }
   ```
5. **Cancel pending show on `pointerleave`** and clear any running delay timers.

**Detection:** Move the cursor quickly across 5+ tooltip-enabled elements. None should flash their tooltip. On a touch device, tap a tooltip element -- no tooltip should appear (only on long-press).

---

### Pitfall 7: Click-Outside Detection Fails with Multiple Overlays

**Severity:** HIGH
**Affects:** Popover, Tooltip (interactive)
**Phase:** Popover

**What goes wrong:** A popover is open. The user clicks on a tooltip (or another popover) that is rendered in a different shadow root or appended to `document.body`. The first popover's click-outside handler sees the click as "outside" and closes it, even though the user clicked on related UI. Conversely, clicking inside a popover that was portaled to `document.body` might not register as "inside" via `composedPath()` because the DOM ancestry has changed.

**Why it happens:** LitUI's existing click-outside pattern (`!e.composedPath().includes(this)`) checks if the click target is a DOM descendant of the component. When overlays are portaled to `document.body` or rendered in the top layer via the Popover API, the DOM ancestry no longer reflects the logical UI hierarchy.

**Consequences:**
- Popovers close unexpectedly when interacting with related overlays
- Nested popover-in-popover scenarios break entirely
- Users cannot interact with overlay content without the parent overlay closing

**Prevention:**
1. **Implement a global overlay stack/registry.** When a new overlay opens, it registers itself with a shared manager. Click-outside handlers consult the stack: only the topmost overlay should close on an outside click.
2. **Use the Popover API's built-in light-dismiss behavior** (`popover="auto"`). The browser handles click-outside natively and correctly manages a stack of auto popovers -- clicking inside a nested popover does not close the parent.
3. **For non-Popover-API fallback:** check `composedPath()` against ALL open overlay elements, not just `this`. A click is "inside" if it lands on any element in the overlay hierarchy.
4. **Use `pointerdown` instead of `click`** for outside detection (prevents the overlay from closing and the click from also activating whatever is underneath).

**LitUI-specific note:** The existing Select and DatePicker each have their own `handleDocumentClick` with `composedPath().includes(this)`. This works for single-overlay scenarios but will not scale to overlapping overlays. A shared overlay manager should be built before the Popover component.

---

### Pitfall 8: Focus Management -- Popover Steals Focus from Active Input

**Severity:** HIGH
**Affects:** Popover, Toast
**Phase:** Popover

**What goes wrong:** A popover opens (e.g., a rich tooltip or a contextual menu) and immediately moves focus into the popover. The user was typing in a form input -- their cursor position and selection are lost. Alternatively, a toast with an action button announces itself, and the user's focus is yanked to the toast.

**Why it happens:** Dialog's focus-trapping pattern (`showModal()` moves focus into the dialog) is incorrectly applied to non-modal overlays. Popovers and toasts are non-modal by definition -- they should not steal or trap focus.

**Consequences:**
- Users lose their place in forms
- Screen reader users are disoriented by unexpected focus movement
- Keyboard users cannot dismiss the popover without tabbing through it first

**Prevention:**
1. **Popovers: Do NOT auto-focus on open.** Focus should remain on the trigger element. The user can Tab into the popover if it contains interactive content.
2. **Toasts: NEVER steal focus.** Toast content is announced via `aria-live`, not by moving focus. If the toast has an action button, the user should be able to reach it via keyboard (e.g., F6 landmark navigation) but focus should not move automatically.
3. **Focus restoration after popover close:** When a popover closes, return focus to the trigger element (LitUI's Dialog already does this via `triggerElement.focus()` -- reuse this pattern).
4. **Focus trapping is ONLY for modals.** Popovers with `tabindex` content should allow Tab to naturally move in and out. Only trap focus if the popover is explicitly modal (in which case, use `<dialog>` or the Dialog component instead).
5. **Exception: Popovers with complex forms** (e.g., a date picker popup) may move focus on open, but this should be opt-in via an attribute, not the default.

**LitUI-specific note:** The Dialog component correctly uses `showModal()` for focus trapping and stores `triggerElement` for focus restoration. Popover should reuse the focus restoration logic but skip the trapping.

---

## Moderate Pitfalls

Mistakes that cause technical debt, inconsistent behavior, or developer experience issues.

---

### Pitfall 9: Tooltip/Popover Event Listeners Not Cleaned Up on Disconnect

**Severity:** MEDIUM
**Affects:** Tooltip, Popover
**Phase:** Tooltip, Popover

**What goes wrong:** A tooltip component adds `mouseenter`/`mouseleave` listeners to the trigger element (possibly in the light DOM) and a `scroll`/`resize` listener on `window` for repositioning. When the component is removed from the DOM (e.g., in a SPA route change), `disconnectedCallback` does not clean up all listeners. If the component is in a list that virtualizes, it is connected/disconnected repeatedly, accumulating orphaned listeners.

**Why it happens:** Listeners added to elements outside the component's shadow root (the trigger, `document`, `window`) are not automatically cleaned up when the component is removed. Arrow functions used as listeners cannot be removed by reference if not stored.

**Prevention:**
1. **Use an `AbortController` for all external listeners.** Create one in `connectedCallback`, pass `{ signal: this.abortController.signal }` to every `addEventListener`, and call `this.abortController.abort()` in `disconnectedCallback`. This guarantees cleanup of ALL listeners with one call.
   ```typescript
   private abortController?: AbortController;

   connectedCallback() {
     super.connectedCallback();
     this.abortController = new AbortController();
     document.addEventListener('click', this.handleOutsideClick, {
       signal: this.abortController.signal
     });
   }

   disconnectedCallback() {
     super.disconnectedCallback();
     this.abortController?.abort();
   }
   ```
2. **Clean up Floating UI `autoUpdate`** if used. `autoUpdate()` returns a cleanup function that must be called when the overlay closes or the component disconnects. Store and call it.
3. **Store all timer IDs** (show delay, hide delay, auto-dismiss) and clear them in `disconnectedCallback`.

**LitUI-specific note:** The existing Select removes its `document.addEventListener('click', ...)` in `disconnectedCallback` -- the pattern exists but uses manual add/remove. The `AbortController` pattern is cleaner and less error-prone for components with many listeners.

---

### Pitfall 10: SSR Renders Overlay in Visible/Open State

**Severity:** MEDIUM
**Affects:** Toast, Tooltip, Popover
**Phase:** Shared

**What goes wrong:** During server-side rendering with `@lit-labs/ssr`, the overlay component renders its template including the floating/overlay content. On the client before hydration, the user briefly sees tooltip text, popover content, or toast messages that should be hidden. After hydration, the content disappears as JavaScript takes control.

**Why it happens:** Lit SSR renders the full template to HTML. If the component's `render()` method always includes the overlay markup (just hidden via CSS or JS-controlled attributes), that markup is in the server-rendered HTML. CSS that hides it (e.g., via `display: none` on a class toggled by state) works, but if hiding depends on JavaScript-set attributes or the Popover API's `hidden-until-found` behavior, it will be visible in the SSR output.

**Prevention:**
1. **Conditionally render overlay content.** Use Lit's `nothing` sentinel or conditional rendering so the overlay markup is not in the template at all when closed:
   ```typescript
   render() {
     return html`
       <slot></slot>
       ${this.open ? html`<div class="tooltip">...</div>` : nothing}
     `;
   }
   ```
2. **Guard all DOM APIs with `isServer` checks** (LitUI already does this consistently -- maintain the pattern).
3. **For toast regions:** Render the empty container on the server (the `aria-live` region should exist early), but do not render any toast content.
4. **Do NOT call `showPopover()`, `computePosition()`, or any positioning API** from methods that run during SSR. LitUI's existing pattern of guarding `updated()` with `if (isServer) return;` is correct -- apply it to all overlay components.

**LitUI-specific note:** The existing Dialog guards `showModal()` with `isServer` in `updated()`. Follow the exact same pattern for all overlay components.

---

### Pitfall 11: Multiple Tooltip Instances Competing for the Same Trigger

**Severity:** MEDIUM
**Affects:** Tooltip
**Phase:** Tooltip

**What goes wrong:** Two or more `<lui-tooltip>` elements target the same trigger element (e.g., due to a rendering bug, dynamic content, or nested components). Both try to show on hover, both add `aria-describedby`, and the result is overlapping tooltips, duplicate screen reader announcements, or one tooltip overwriting the other's ARIA attributes.

**Alternatively:** A tooltip wraps a slotted trigger element, but the trigger is moved in the DOM (e.g., by a framework reconciliation). The old tooltip still has listeners on the trigger; the new tooltip also adds listeners. Both fire.

**Prevention:**
1. **Design the tooltip API so the trigger is always a direct child (slotted).** This creates a 1:1 DOM relationship that cannot have conflicts:
   ```html
   <lui-tooltip text="Help text">
     <button>Hover me</button>
   </lui-tooltip>
   ```
2. **Clean up ARIA attributes on disconnect.** In `disconnectedCallback`, remove any `aria-describedby` the tooltip added to the trigger.
3. **Use a WeakMap or WeakSet** to track which triggers have active tooltips, preventing double-binding.
4. **If using an imperative API** (e.g., `tooltip.attach(element)`), validate that no other tooltip is already attached to that element and warn in dev mode.

---

### Pitfall 12: Popover API Fallback Strategy Creates Two Code Paths

**Severity:** MEDIUM
**Affects:** Popover, Tooltip
**Phase:** Shared

**What goes wrong:** The team builds a Popover component using the native Popover API (`popover="auto"`) for modern browsers, plus a JavaScript fallback for older browsers. The two paths have subtly different behavior: the native path gets top-layer rendering, automatic light-dismiss, and correct stacking; the fallback path uses `position: fixed` + manual click-outside + manual z-index. Bugs appear in only one path, and testing must cover both.

**Why it happens:** The Popover API handles a surprising number of behaviors automatically (top-layer promotion, light dismiss, focus management, stacking). Replicating all of these in JavaScript is non-trivial, and edge cases differ.

**Prevention:**
1. **Drop the fallback.** The Popover API is Baseline Widely Available (April 2025). As of February 2026, browser support is universal in current browser versions. Unless LitUI explicitly supports browsers older than ~2 years, a fallback is unnecessary complexity.
2. **If a fallback IS required:** Use [OddBird's popover polyfill](https://popover.oddbird.net/) rather than building a custom one. It replicates the native behavior closely.
3. **Feature-detect and document the support boundary:**
   ```typescript
   const supportsPopover = typeof HTMLElement.prototype.popover !== 'undefined';
   ```
4. **Do NOT mix native and custom light-dismiss logic.** If using `popover="auto"`, the browser handles click-outside. Do not also add a `document.addEventListener('click', ...)` handler -- they will conflict.

**LitUI-specific note:** The existing Dialog uses native `<dialog>` with `showModal()` without a fallback -- this is the right precedent. New overlay components should similarly rely on modern APIs without fallbacks, matching the library's existing browser support posture.

---

### Pitfall 13: Animation Timing Mismatch Between Enter and Exit

**Severity:** MEDIUM
**Affects:** Toast, Tooltip, Popover
**Phase:** Shared

**What goes wrong:** The enter animation (e.g., fade-in + scale) uses CSS `@starting-style` and `transition` on `[open]`. The exit animation relies on `transition-behavior: allow-discrete` to animate `display` changes. But the exit never plays because the element is removed from the DOM (or the `popover` is toggled) before the transition completes. The element just vanishes.

**Why it happens:** `@starting-style` + `transition-behavior: allow-discrete` is the modern CSS pattern for animating overlay entry/exit (LitUI's Dialog already uses it). However, it requires that the element remain in the DOM during the exit transition. If JavaScript removes the element or changes `display: none` immediately, the exit transition is skipped.

**Prevention:**
1. **Follow the Dialog pattern exactly.** LitUI's Dialog already handles this correctly with `@starting-style` for enter and `transition-behavior: allow-discrete` for exit. The native `<dialog>` and Popover API both support this pattern.
2. **For toasts that are removed from DOM:** Use the Web Animations API or listen for `transitionend` before removing the element. The Dialog does not have this problem because it stays in the DOM (just closed), but toasts may be fully removed.
3. **Always include `prefers-reduced-motion: reduce` handling** that disables transitions entirely (not just shortens them). LitUI already does this consistently -- maintain it.
4. **For the Popover API:** `popover` elements animate naturally with `@starting-style` and `transition-behavior: allow-discrete` -- the same pattern as `<dialog>`. No special handling needed beyond what Dialog already does.

**LitUI-specific note:** The Dialog's animation CSS is the template for all overlay animations. Reuse the exact `@starting-style` / `transition-behavior: allow-discrete` / `@media (prefers-reduced-motion)` pattern.

---

### Pitfall 14: Tooltip Positioning Fails During Scroll Without autoUpdate

**Severity:** MEDIUM
**Affects:** Tooltip, Popover
**Phase:** Tooltip, Popover

**What goes wrong:** A tooltip is shown, then the user scrolls the page. The tooltip stays at its original viewport position while the trigger element scrolls away. The tooltip appears to "detach" from its trigger and float in space.

**Why it happens:** LitUI's existing Select and DatePicker call `computePosition` once when the dropdown opens but do NOT use Floating UI's `autoUpdate` to reposition during scroll/resize. For Select, this is acceptable because the dropdown is interacted with quickly. For tooltips (which may persist while the user scrolls) and popovers (which may contain forms the user scrolls past), this becomes visible.

**Prevention:**
1. **Use `autoUpdate` for tooltips and popovers.** It returns a cleanup function:
   ```typescript
   private cleanupAutoUpdate?: () => void;

   showOverlay() {
     this.cleanupAutoUpdate = autoUpdate(
       this.triggerEl,
       this.overlayEl,
       () => this.updatePosition()
     );
   }

   hideOverlay() {
     this.cleanupAutoUpdate?.();
   }
   ```
2. **Clean up in `disconnectedCallback`** -- if the component is removed while the overlay is open, the `autoUpdate` listener leaks.
3. **Consider `autoUpdate` options** for performance: `{ ancestorScroll: true, ancestorResize: true, elementResize: false, layoutShift: false }` for tooltips (lightweight). Enable more options for popovers if needed.
4. **Alternative: Close on scroll.** For simple tooltips, hiding the tooltip on scroll is acceptable and avoids the `autoUpdate` overhead. Many libraries do this.

**LitUI-specific note:** The DatePicker research (Phase 44) explicitly decided to skip `autoUpdate` and position once. Tooltips have different interaction patterns (longer visibility, scroll while visible) that justify the overhead.

---

## Minor Pitfalls

Mistakes that cause annoyance or minor inconsistency but are fixable without major rework.

---

### Pitfall 15: Toast Action Buttons Are Inaccessible to Keyboard Users

**Severity:** LOW
**Affects:** Toast
**Phase:** Toast

**What goes wrong:** A toast has an "Undo" action button, but because the toast is in an `aria-live` region and focus is never moved to it, keyboard users have no way to reach the button before the toast auto-dismisses.

**Prevention:**
1. **Extend auto-dismiss timer when the toast has interactive content.** Give the user more time.
2. **Allow keyboard users to navigate to the toast region** via a landmark shortcut (the toast region should be an ARIA landmark with `role="region"` and `aria-label="Notifications"`).
3. **Pause auto-dismiss on hover and focus.** If the user is interacting with the toast, do not dismiss it.
4. **Consider whether the action should even be in a toast.** If the action is critical (e.g., "Undo delete"), an alert dialog is more accessible.

---

### Pitfall 16: Tooltip Text Truncation in Narrow Containers

**Severity:** LOW
**Affects:** Tooltip
**Phase:** Tooltip

**What goes wrong:** A long tooltip text overflows its container or wraps awkwardly because `max-width` was not set, or the tooltip was positioned near the viewport edge and Floating UI's `shift` middleware pushed it into a narrow space.

**Prevention:**
1. **Set a reasonable `max-width`** on tooltips (e.g., 250-300px via CSS custom property).
2. **Use Floating UI's `size` middleware** to dynamically adjust width based on available space.
3. **Allow multi-line wrapping** -- tooltips should wrap text, not truncate with ellipsis.

---

### Pitfall 17: Popover Arrow Does Not Track Position Flips

**Severity:** LOW
**Affects:** Popover, Tooltip
**Phase:** Popover, Tooltip

**What goes wrong:** A popover has a decorative arrow pointing at the trigger. When Floating UI's `flip` middleware moves the popover from bottom to top (because the viewport edge was reached), the arrow still points downward instead of upward. The visual looks broken.

**Prevention:**
1. **Use Floating UI's `arrow` middleware** which provides the correct arrow position and handles flips.
2. **Rotate the arrow based on the resolved `placement`** returned by `computePosition`.
3. **Consider CSS Anchor Positioning** for the arrow in the future -- it handles this natively. CSS Anchor Positioning reached cross-browser support in late 2025, but may still have edge cases. Floating UI remains the safer choice for now.

---

## Phase-Specific Warnings

| Phase/Component | Likely Pitfall | Severity | Mitigation |
|-----------------|---------------|----------|------------|
| **Shared (before any component)** | Stacking context trapping (P3) | CRITICAL | Decide on Popover API as primary strategy |
| **Shared (before any component)** | Floating UI offsetParent in Shadow DOM (P4) | CRITICAL | Build shared `computeOverlayPosition` utility with `composed-offset-position` |
| **Shared (before any component)** | Fallback strategy complexity (P12) | MEDIUM | Decide on browser support boundary; prefer no fallback |
| **Toast** | aria-live region timing (P2) | CRITICAL | Design toast region architecture (mount-at-startup) |
| **Toast** | Queue race conditions (P5) | HIGH | Implement state machine for queue management |
| **Toast** | Focus stealing (P8) | HIGH | Never auto-focus toasts |
| **Toast** | Action button accessibility (P15) | LOW | Landmark navigation + pause on focus |
| **Tooltip** | aria-describedby cross-shadow (P1) | CRITICAL | Keep trigger+tooltip in same scope; use aria-label fallback |
| **Tooltip** | Hover intent / mobile touch (P6) | HIGH | Delay timers + pointerType detection |
| **Tooltip** | Listener cleanup (P9) | MEDIUM | AbortController pattern |
| **Tooltip** | Multiple instances competing (P11) | MEDIUM | 1:1 slot-based trigger design |
| **Tooltip** | Positioning during scroll (P14) | MEDIUM | autoUpdate or close-on-scroll |
| **Popover** | Click-outside with multiple overlays (P7) | HIGH | Overlay stack registry or Popover API auto light-dismiss |
| **Popover** | Focus management (P8) | HIGH | No auto-focus; reuse Dialog's focus restoration |
| **All overlays** | SSR visible flash (P10) | MEDIUM | Conditional rendering with `nothing` |
| **All overlays** | Animation enter/exit mismatch (P13) | MEDIUM | Follow Dialog's @starting-style pattern |

---

## Sources

### Primary (HIGH confidence)
- [Floating UI Platform docs -- Shadow DOM offsetParent fix](https://floating-ui.com/docs/platform) -- Official recommendation for `composed-offset-position`
- [Nolan Lawson: Shadow DOM and accessibility](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) -- Authoritative analysis of ARIA cross-root limitations
- [Sara Soueidan: Accessible notifications with ARIA Live Regions](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) -- Definitive guide to live region implementation
- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) -- Official documentation
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) -- Official API documentation
- [Can I Use: Popover API](https://caniuse.com/mdn-api_htmlelement_popover) -- Browser support data
- LitUI codebase: `packages/dialog/src/dialog.ts`, `packages/select/src/select.ts`, `packages/core/src/tailwind-element.ts` -- Existing patterns

### Secondary (MEDIUM confidence)
- [UI5 Web Components: Popover API migration](https://sap.github.io/ui5-webcomponents/blog/releases/popover-api-in-v2/) -- Real-world web component library migration
- [Igalia: Solving Cross-root ARIA Issues in Shadow DOM](https://blogs.igalia.com/mrego/solving-cross-root-aria-issues-in-shadow-dom/) -- Cross-root ARIA reference target proposal status
- [Shoelace Alert live region issue](https://github.com/shoelace-style/shoelace/issues/1359) -- Web component library that encountered the live region pitfall
- [Floating UI Shadow DOM issues #1345, #2934](https://github.com/floating-ui/floating-ui/issues/1345) -- Real bug reports of positioning failures
- [Josh Comeau: What The Heck, z-index??](https://www.joshwcomeau.com/css/stacking-contexts/) -- Stacking context explanation
- [Can I Use: CSS Anchor Positioning](https://caniuse.com/css-anchor-positioning) -- Future positioning alternative
- [OddBird Popover Polyfill](https://popover.oddbird.net/) -- Fallback option if needed
