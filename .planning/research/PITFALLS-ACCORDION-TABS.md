# Pitfalls Research: Accordion & Tabs Layout Components

**Domain:** Accordion and Tabs web components with Shadow DOM (Lit.js 3)
**Researched:** 2026-02-02
**Overall confidence:** HIGH (based on existing codebase patterns, W3C APG specs, and verified Shadow DOM behavior)

---

## Accordion Pitfalls

### 1. CRITICAL: `aria-controls` ID References Broken Across Shadow DOM Boundaries

**Severity:** CRITICAL
**What goes wrong:** The W3C APG Accordion pattern requires each header button to have `aria-controls` pointing to its associated panel's `id`. If the trigger button lives in shadow DOM and the panel content is slotted from light DOM (or vice versa), the ID reference silently fails. Screen readers cannot navigate from header to panel.
**Warning signs:** Screen reader testing shows "controls nothing" or skips the relationship entirely. Automated a11y tools (axe, Lighthouse) may not flag this because they often do not traverse shadow boundaries.
**Prevention:** Keep all ARIA ID references within the same DOM scope. Two viable approaches:
  - (A) Both trigger and panel rendered entirely in shadow DOM, with slot projecting user content into the shadow panel. IDs on the shadow-internal elements reference each other correctly.
  - (B) Use `aria-expanded` on the button (always works, no ID ref) and `role="region"` with `aria-labelledby` on the panel -- but both elements must share the same scope.
**Recommendation:** Approach (A) -- render `<button>` and `<div role="region">` in shadow DOM, slot user content into the region. This matches the existing RadioGroup pattern where all ARIA wiring is shadow-internal.
**Phase:** Must be addressed in initial architecture (Phase 1).

### 2. HIGH: Single-Expand vs Multi-Expand Mode State Confusion

**Severity:** HIGH
**What goes wrong:** In single-expand (exclusive) mode, opening one panel must close others. Developers often implement this by iterating children and toggling state, but timing issues arise when:
  - Multiple `ui-change` events fire in the same microtask
  - A closing animation is interrupted by a new open
  - The component re-renders mid-state-sync
**Warning signs:** Two panels briefly visible simultaneously in single-expand mode. Panels "flash" open then close. State desync after rapid clicking.
**Prevention:**
  - Use a single source of truth: one `expandedItems` Set (multi) or `expandedItem` string (single) on the parent, not distributed state on children.
  - The parent accordion container owns all state; children are "presentational" (same pattern as RadioGroup where the group owns `value`, not individual radios).
  - Guard against re-entrant updates with a `_batchUpdating` flag (same pattern as CheckboxGroup's select-all coordination).
**Phase:** Core implementation (Phase 1).

### 3. HIGH: CSS Height Animation from 0 to Auto

**Severity:** HIGH
**What goes wrong:** CSS cannot interpolate between `height: 0` and `height: auto`. The transition snaps instantly instead of animating. This is the single most common accordion implementation bug.
**Warning signs:** Expand/collapse has no animation despite `transition: height` being set. Works on Chrome but not Firefox/Safari.
**Prevention:** Three-tier progressive enhancement strategy:
  1. **Baseline (all browsers):** `overflow: clip` + `grid-template-rows: 0fr/1fr` trick. Wrap content in a grid container; transition `grid-template-rows` from `0fr` to `1fr`. This works in all modern browsers and produces smooth animation.
  2. **Enhanced (Chromium):** `interpolate-size: allow-keywords` on `:host` allows `height: 0` to `height: auto` transitions directly. Use `@supports (interpolate-size: allow-keywords)` feature query.
  3. **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all transitions (already established pattern in toaster component).
**Important:** Do NOT use `max-height` hack (transition to a large fixed value). It creates mismatched timing -- a 500px panel with `max-height: 9999px` takes the wrong duration to close.
**Phase:** Animation implementation (Phase 2 or within Phase 1 styling).

### 4. MEDIUM: Heading Level Mismatch in Accordion Headers

**Severity:** MEDIUM
**What goes wrong:** The W3C APG pattern wraps each accordion button in a heading element (`<h3>`, etc.). If the component hardcodes a heading level (e.g., always `<h3>`), it breaks document outline when nested inside an `<h2>` section or when the accordion itself is inside another accordion.
**Warning signs:** axe/Lighthouse reports "Heading levels should only increase by one." Screen readers announce incorrect hierarchy.
**Prevention:** Expose a `heading-level` property (number 1-6) on the accordion item, defaulting to `3`. The parent accordion can set a default that children inherit. Render as `<div role="heading" aria-level="${level}">` rather than literal `<h1>`-`<h6>` tags, giving runtime flexibility without needing to switch tag names.
**Phase:** Initial implementation (Phase 1).

### 5. MEDIUM: Accordion Items Not Discoverable After Dynamic Add/Remove

**Severity:** MEDIUM
**What goes wrong:** If accordion items are added or removed dynamically (conditional rendering in a framework), the parent accordion loses track of its children. The `slotchange` event fires but child references go stale.
**Warning signs:** Dynamically added items do not participate in keyboard navigation. Removing an item leaves a "ghost" in the internal items array.
**Prevention:** Use the established `slotchange` pattern from RadioGroup/CheckboxGroup -- re-scan `slot.assignedElements({ flatten: true })` on every slotchange event, filter by expected tag name, and re-sync all state.
**Phase:** Core implementation (Phase 1).

### 6. MEDIUM: `disabled` Accordion Items Still Keyboard-Navigable

**Severity:** MEDIUM
**What goes wrong:** Per WAI-ARIA, disabled accordion headers should still be focusable but not activatable (unlike disabled radios which are skipped). Developers often skip disabled items entirely in keyboard navigation, making them invisible to screen reader users.
**Warning signs:** Disabled items are unreachable via keyboard. Or the opposite: disabled items can be activated by Enter/Space.
**Prevention:** Include disabled items in the arrow-key navigation sequence. Set `aria-disabled="true"` (not the `disabled` HTML attribute, which removes from tab order). Ignore Enter/Space activation on disabled items but allow focus.
**Phase:** Keyboard navigation implementation (Phase 1).

---

## Tabs Pitfalls

### 7. CRITICAL: Tab-Panel ARIA Relationship Across Shadow Boundary

**Severity:** CRITICAL
**What goes wrong:** The WAI-ARIA Tabs pattern requires `aria-controls` on each `tab` pointing to its `tabpanel`, and `aria-labelledby` on each `tabpanel` pointing back to its `tab`. This bidirectional ID reference is impossible when tabs and panels are in different DOM scopes (shadow vs light).
**Warning signs:** Screen readers announce tabs without associated panels. NVDA/JAWS cannot navigate from tab to panel with Ctrl+PageDown.
**Prevention:** Same principle as Accordion Pitfall 1 -- render the `role="tablist"` container and `role="tab"` buttons in shadow DOM, and render `role="tabpanel"` wrappers in shadow DOM with `<slot>` elements inside them to project user content. All ARIA ID wiring stays within the shadow root.
**API design:** `<lui-tabs>` renders tablist + tab buttons from declarative `<lui-tab>` children (light DOM), reading their labels. Panel content is slotted. The key is that the actual ARIA-wired elements live in shadow DOM.
**Phase:** Must be addressed in initial architecture (Phase 1).

### 8. HIGH: Automatic vs Manual Tab Activation Confusion

**Severity:** HIGH
**What goes wrong:** WAI-ARIA defines two activation modes:
  - **Automatic:** Arrow keys move focus AND activate the tab (show its panel). This is the default recommendation.
  - **Manual:** Arrow keys move focus only; Enter/Space activates. Used when tab switching has side effects (e.g., network requests).
Developers often implement only automatic mode, or implement manual mode incorrectly (focus moves but `aria-selected` also moves, which is wrong).
**Warning signs:** In manual mode, `aria-selected` follows focus instead of staying on the activated tab. In automatic mode, panels do not switch until Enter is pressed.
**Prevention:** Separate "focused tab index" from "selected tab index" in the component state. In automatic mode, changing focus also changes selection. In manual mode, focus and selection are independent until Enter/Space.
**Phase:** Keyboard navigation (Phase 1).

### 9. HIGH: Roving Tabindex Conflict with Existing Pattern

**Severity:** HIGH
**What goes wrong:** Tabs use roving tabindex (same as RadioGroup). But tabs have a key difference: in manual activation mode, the focused tab is NOT the selected tab. RadioGroup always moves selection with focus. If the Tabs implementation copies RadioGroup's keyboard handler directly, manual mode breaks.
**Warning signs:** Cannot focus a non-selected tab without activating it.
**Prevention:** Extract roving tabindex as a shared utility but parameterize it:
  - `moveFocusAndSelect` (RadioGroup behavior, Tabs automatic mode)
  - `moveFocusOnly` (Tabs manual mode, Enter/Space to select)
  Use a property like `activation="automatic|manual"` to switch between modes.
**Phase:** Keyboard navigation (Phase 1). Good opportunity to refactor RadioGroup's keyboard logic into a shared mixin.

### 10. HIGH: Vertical Tabs Arrow Key Direction

**Severity:** HIGH
**What goes wrong:** For horizontal tabs, Left/Right arrows navigate tabs. For vertical tabs, Up/Down arrows navigate. Developers hardcode one set of arrow keys and forget the other orientation.
**Warning signs:** Arrow keys do nothing in vertical tab layout. Both orientations respond to the same keys.
**Prevention:** Expose an `orientation` property (`horizontal` | `vertical`). Map arrow keys based on orientation:
  - Horizontal: ArrowLeft = previous, ArrowRight = next
  - Vertical: ArrowUp = previous, ArrowDown = next
  Set `aria-orientation` on the tablist accordingly. The existing RadioGroup already handles all four arrow keys -- tabs should conditionally enable only the relevant pair.
**Phase:** Phase 1 implementation.

### 11. MEDIUM: Tab Panel Not in Tab Sequence When It Has No Focusable Content

**Severity:** MEDIUM
**What goes wrong:** Per W3C APG: "When the tabpanel does not contain any focusable elements or the first element with content is not focusable, the tabpanel should set `tabindex="0"`." If this is not implemented, Tab from a tab button skips over the panel content entirely, leaving keyboard users stranded.
**Warning signs:** Pressing Tab from the tablist jumps past the panel to the next page element. Panel content unreachable by keyboard.
**Prevention:** On tab activation, inspect the panel's slotted content for focusable elements. If none found, set `tabindex="0"` on the panel wrapper. When content changes (e.g., lazy-loaded), re-check and remove `tabindex="0"` if focusable content now exists. Use a MutationObserver or re-check on slotchange.
**Phase:** Accessibility polish (Phase 1 or 2).

### 12. MEDIUM: Lazy-Loaded Tab Content Flickers or Loses State

**Severity:** MEDIUM
**What goes wrong:** If inactive tab panels are not rendered (lazy loading / conditional rendering), switching tabs causes:
  - Flash of empty content before lazy content loads
  - Loss of scroll position, form state, or component state in previously active panels
  - `slotchange` fires repeatedly as content is added/removed
**Warning signs:** Switching back to a previously visited tab resets its content. Forms in tabs lose input.
**Prevention:** Offer both strategies via a property:
  - `lazy` mode: Only render active panel's slot. Use `display: none` on inactive panels (keeps DOM, preserves state) rather than conditional rendering (destroys DOM).
  - `eager` mode (default): All panels rendered, only active one visible. Simpler, preserves state, costs more DOM.
  Use `visibility: hidden` + `position: absolute` + `height: 0` + `overflow: hidden` for hidden panels to keep them in DOM but invisible and non-interactive.
**Phase:** Phase 1 (architecture decision) with lazy mode in Phase 2 if needed.

---

## Shadow DOM / Web Component Pitfalls

### 13. CRITICAL: `slotchange` Does Not Fire After SSR Hydration

**Severity:** CRITICAL
**What goes wrong:** When a component is server-rendered with Declarative Shadow DOM and then hydrated on the client, the `slotchange` event does NOT fire automatically. This means child discovery (the pattern used by RadioGroup, CheckboxGroup, and now Accordion/Tabs) silently fails. The component renders but has zero discovered children.
**Warning signs:** Component works in client-side rendering but is empty/broken after SSR. Children exist in the DOM but the parent does not "see" them.
**Prevention:** In `firstUpdated`, if the element was SSR-hydrated (detectable via `Boolean(this.shadowRoot)` in constructor before `super()`), manually dispatch `slotchange` on all `<slot>` elements:
```typescript
override firstUpdated() {
  if (this._wasSSR) {
    this.shadowRoot?.querySelectorAll('slot').forEach(slot => {
      slot.dispatchEvent(new Event('slotchange', { bubbles: true }));
    });
  }
}
```
Check how existing components (RadioGroup, Select) handle this -- if they already have this workaround, follow the same pattern. If not, this is a latent bug in those components too.
**Phase:** SSR compatibility (Phase 1 -- do not defer).

### 14. HIGH: `tabindex="-1"` on Custom Element Host Traps All Shadow DOM Children

**Severity:** HIGH
**What goes wrong:** Setting `tabindex="-1"` on a custom element's host (`<lui-accordion-item tabindex="-1">`) makes ALL children inside its shadow DOM non-tabbable. This is a browser behavior specific to custom elements and is not intuitive -- `tabindex` does not normally propagate.
**Warning signs:** Accordion/tab header buttons are unreachable by keyboard when the host has `tabindex="-1"`.
**Prevention:** Never set `tabindex` on the custom element host for accordion items or tab panels. Instead, manage `tabindex` on the shadow-internal interactive elements (buttons). The existing RadioGroup correctly manages `tabindex` on individual `lui-radio` hosts because they are the focusable endpoints -- accordion items are different because the focusable element is a button INSIDE the shadow DOM.
**Phase:** Phase 1 keyboard implementation.

### 15. HIGH: Event Bubbling Across Shadow DOM Boundaries

**Severity:** HIGH
**What goes wrong:** Custom events dispatched from shadow DOM must be created with `{ composed: true, bubbles: true }` to cross shadow boundaries. If accordion items dispatch events without `composed: true`, the parent accordion container never receives them.
**Warning signs:** Parent component's event listener never fires. Events "disappear" at the shadow boundary.
**Prevention:** Use the existing `dispatchCustomEvent` utility from `@lit-ui/core` which already sets `composed: true` and `bubbles: true`. Use internal event names (e.g., `ui-accordion-item-toggle`) that are stopped at the parent, then re-dispatch consumer-facing events (e.g., `ui-change`). This matches the RadioGroup pattern where `ui-radio-change` is internal and `ui-change` is external.
**Phase:** Phase 1 event architecture.

### 16. MEDIUM: CSS Custom Properties Must Cascade Through Shadow DOM Correctly

**Severity:** MEDIUM
**What goes wrong:** The project uses `--ui-*` CSS custom properties for theming. For accordion/tabs, tokens like `--ui-accordion-border-color` must be defined at the document level (via `:root` rules extracted by TailwindElement) to cascade into shadow DOM. If tokens are only defined inside a component's shadow styles, they cannot be overridden from outside.
**Warning signs:** Theme customization has no effect on accordion/tabs. Dark mode colors do not apply.
**Prevention:** Follow the established pattern:
  - Define `--ui-accordion-*` and `--ui-tabs-*` tokens in the Tailwind CSS layer (same as `--ui-radio-*`, `--ui-button-*`)
  - Use `var(--ui-accordion-border, fallback)` in component shadow styles
  - TailwindElement base class extracts `:root` and `.dark` rules to document level automatically
**Phase:** Theming setup (Phase 1).

---

## Animation Pitfalls

### 17. HIGH: Grid Row Transition Requires Wrapper Element

**Severity:** HIGH
**What goes wrong:** The `grid-template-rows: 0fr` to `1fr` animation trick requires a specific DOM structure: an outer grid container and an inner element with `min-height: 0` and `overflow: hidden`. If the slot is directly inside the grid container without a wrapper, the animation fails or content overflows during collapse.
**Warning signs:** Content visible below the accordion item during collapse animation. Animation works for expand but not collapse. Content overflows during transition.
**Prevention:** Use this specific structure in the accordion item shadow DOM:
```html
<div class="content-wrapper" style="display: grid; grid-template-rows: 0fr; transition: grid-template-rows 200ms;">
  <div style="min-height: 0; overflow: hidden;">
    <slot name="content"></slot>
  </div>
</div>
```
When expanded, set `grid-template-rows: 1fr`. This is the most cross-browser-compatible approach that does not require `interpolate-size`.
**Phase:** Animation implementation (Phase 1).

### 18. HIGH: `overflow: hidden` vs `overflow: clip` During Animation

**Severity:** HIGH
**What goes wrong:** During accordion collapse animation, content must be clipped. Using `overflow: hidden` creates a new scroll container which can cause layout shifts, eat scroll events, and interfere with `position: sticky` children. Using `overflow: clip` avoids these issues but has slightly different behavior (no programmatic scrolling).
**Warning signs:** Sticky headers inside accordion panels jump during animation. Scroll events are swallowed during transition. Layout shifts when panel opens.
**Prevention:** Use `overflow: clip` (not `hidden`) on the collapsing content wrapper. This is the modern recommendation and avoids creating a scroll container. If children need programmatic scrolling, apply `overflow: hidden` only to a nested inner wrapper.
**Phase:** Animation implementation (Phase 1).

### 19. MEDIUM: `prefers-reduced-motion` Must Disable ALL Transitions

**Severity:** MEDIUM
**What goes wrong:** Some implementations only disable the height transition but leave opacity or transform transitions active. Users who set `prefers-reduced-motion: reduce` expect no motion at all.
**Warning signs:** Content still fades or slides even with reduced motion enabled.
**Prevention:** Follow the established toaster pattern:
```css
@media (prefers-reduced-motion: reduce) {
  .content-wrapper,
  .tab-indicator {
    transition: none !important;
  }
}
```
Apply to ALL animated elements in both accordion and tabs.
**Phase:** Phase 1 (include from the start, not as an afterthought).

### 20. MEDIUM: Tab Active Indicator Animation Jank

**Severity:** MEDIUM
**What goes wrong:** Tabs often have an animated underline/indicator that slides between tabs. If implemented by moving/resizing a pseudo-element based on the active tab's position, the indicator can:
  - Jump on window resize (position becomes stale)
  - Miscalculate width when tab labels have different lengths
  - Not animate on initial render (no "from" position)
**Warning signs:** Indicator teleports instead of sliding. Indicator width does not match tab width after resize. No animation on first tab selection.
**Prevention:**
  - Use `ResizeObserver` on the tablist to recalculate indicator position on resize.
  - Calculate indicator position in `updated()` using `getBoundingClientRect()` of the active tab.
  - Use CSS `transform: translateX()` + `width` transitions (transforms are GPU-accelerated).
  - Skip animation on initial render (no transition for the first positioning).
  - Guard with `isServer` -- `getBoundingClientRect()` is not available during SSR.
**Phase:** Phase 2 (visual polish) or late Phase 1. Can ship without indicator initially.

---

## Integration Pitfalls (Specific to This Codebase)

### 21. HIGH: CLI Template Complexity for Multi-Element Components

**Severity:** HIGH
**What goes wrong:** Accordion requires at least 2 custom elements (`lui-accordion`, `lui-accordion-item`). Tabs requires at least 3 (`lui-tabs`, `lui-tab`, `lui-tab-panel`). The CLI copy-source template system uses namespaced keys (established in v5.0 for toast). If the template keys or registry dependencies are misconfigured, `npx lit-ui add accordion` installs incomplete components.
**Warning signs:** Missing files after CLI install. Import errors because one element references another that was not copied.
**Prevention:** Follow the toast template pattern exactly:
  - Use namespaced keys: `accordion/accordion`, `accordion/accordion-item`
  - Register the top-level `accordion` component in registry with all sub-files as dependencies
  - Test `npx lit-ui add accordion` end-to-end to verify all files are copied
  - Include `var()` fallbacks in copy-source templates for standalone usage without the token system
**Phase:** CLI integration (Phase 2 or 3).

### 22. MEDIUM: Safari `slotchange` Fires Before `connectedCallback`

**Severity:** MEDIUM
**What goes wrong:** In Safari, `slotchange` can fire before `connectedCallback` completes. If your `slotchange` handler references properties initialized in `connectedCallback`, it will read `undefined` or default values.
**Warning signs:** Component works in Chrome/Firefox but accordion items are not discovered in Safari on first render.
**Prevention:** Initialize all state in the constructor or as class field defaults, not in `connectedCallback`. The existing RadioGroup initializes `radios: Radio[] = []` as a class field (correct). Guard `slotchange` handlers with a `this.hasUpdated` or `this.isConnected` check if they depend on lifecycle-initialized state.
**Phase:** Phase 1 -- test in Safari early.

### 23. LOW: Copy-Source Templates Need CSS Variable Fallbacks

**Severity:** LOW
**What goes wrong:** When users install via CLI copy-source mode without the theme system, CSS custom properties like `--ui-accordion-border-color` are undefined, causing missing borders/colors.
**Warning signs:** Components look unstyled when installed standalone.
**Prevention:** Always include fallback values: `var(--ui-accordion-border-color, #e5e7eb)`. This is the established pattern from v5.0 overlay components.
**Phase:** CLI template creation (Phase 2 or 3).

---

## Phase-Specific Warnings Summary

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Architecture | Pitfall 1, 7: ARIA ID references across shadow boundary | Render all ARIA-wired elements in shadow DOM, slot user content into them |
| Architecture | Pitfall 2: State ownership | Parent container owns expanded/selected state, children are presentational |
| Keyboard Nav | Pitfall 8, 9: Automatic vs manual activation | Separate focus index from selection index; parameterize roving tabindex |
| Keyboard Nav | Pitfall 10: Vertical orientation | Map arrow keys to orientation; set `aria-orientation` |
| Animation | Pitfall 3, 17: Height animation | Use `grid-template-rows: 0fr/1fr` as baseline; progressive enhance with `interpolate-size` |
| Animation | Pitfall 18: Overflow during animation | Use `overflow: clip` not `overflow: hidden` |
| SSR | Pitfall 13: `slotchange` not firing after hydration | Manual dispatch in `firstUpdated` |
| CLI | Pitfall 21: Multi-file templates | Follow toast namespaced template pattern |
| Cross-browser | Pitfall 22: Safari slotchange timing | Initialize state as class fields, guard handlers |

---

## Sources

- [W3C APG Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
- [W3C APG Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [W3C APG Tabs Example - Manual Activation](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-manual/)
- [Nolan Lawson - Shadow DOM and Accessibility: The Trouble with ARIA](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/)
- [w3c/aria Issue #864 - aria-controls in web components](https://github.com/w3c/aria/issues/864)
- [Erik Kroes - The Guide to Accessible Web Components](https://www.erikkroes.nl/blog/accessibility/the-guide-to-accessible-web-components-draft/)
- [Chrome for Developers - Animate to height: auto](https://developer.chrome.com/docs/css-ui/animate-to-height-auto)
- [Chrome for Developers - More Options for Styling details](https://developer.chrome.com/blog/styling-details)
- [Patrick Brosset - Implementing an Accordion Component in 2026](https://patrickbrosset.com/lab/accordion/)
- [Josh W. Comeau - interpolate-size Snippet](https://www.joshwcomeau.com/snippets/html/interpolate-size/)
- [Konnor Rogers - Running Lit SSR in Web Awesome](https://www.konnorrogers.com/posts/2024/running-lit-ssr-in-web-awesome)
- [Lit Docs - Working with Shadow DOM](https://lit.dev/docs/components/shadow-dom/)
- [Lit Docs - SSR Client Usage](https://lit.dev/docs/ssr/client-usage/)
- [Cory Rylan - Understanding Slot Updates with Web Components](https://coryrylan.com/blog/understanding-slot-updates-with-web-components)
- [lit/lit-element Issue #619 - slotchange lifecycle in Safari](https://github.com/lit/lit-element/issues/619)
- [Manuel Matuzovic - Pros and Cons of Shadow DOM](https://www.matuzo.at/blog/2023/pros-and-cons-of-shadow-dom/)
- [Marcy Sutton - Accessibility and the Shadow DOM](https://marcysutton.com/accessibility-and-the-shadow-dom/)
- Existing codebase: RadioGroup (`packages/radio/src/radio-group.ts`), CheckboxGroup (`packages/checkbox/src/checkbox-group.ts`), Toaster (`packages/toast/src/toaster.ts`), TailwindElement (`packages/core/src/tailwind-element.ts`)
