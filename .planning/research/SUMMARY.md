# Project Research Summary

**Project:** LitUI v6.0 - Accordion & Tabs Layout Components
**Domain:** Shadow DOM-based disclosure and navigation web components for Lit.js library
**Researched:** 2026-02-02
**Confidence:** HIGH

## Executive Summary

Accordion and Tabs are pure layout/disclosure components that add **zero new dependencies** to the LitUI codebase. Both follow the established parent-child container pattern used by RadioGroup and CheckboxGroup, leveraging Lit's slot-based composition, roving tabindex keyboard navigation, and CSS transitions. The W3C ARIA Authoring Practices Guide (APG) provides authoritative patterns that map cleanly to the existing architecture.

The primary technical challenge is cross-browser height animation for accordion expand/collapse. Research confirms that the `grid-template-rows: 0fr` to `1fr` technique works across all modern browsers today (Chrome, Firefox, Safari, Edge) without JavaScript measurement. The newer `interpolate-size: allow-keywords` CSS property is Chromium-only as of Feb 2026 and should be deferred to progressive enhancement. For tabs, the active indicator animation requires measuring tab button positions imperatively but can use standard CSS transforms for GPU-accelerated sliding.

The critical risk is ARIA ID reference breakage across Shadow DOM boundaries. Both components must render all ARIA-wired elements (buttons, panels) in shadow DOM with `aria-controls` and `aria-labelledby` linking shadow-internal IDs. User content is projected via slots into shadow-rendered wrappers. This pattern is essential for screen reader compatibility and matches the approach validated in RadioGroup. Additional risks include state synchronization in single-expand mode, SSR slotchange hydration, and Safari timing issues -- all mitigated by following established codebase patterns.

## Key Findings

### Recommended Stack

**No new dependencies required.** Both components are entirely implementable with the existing stack:

**Core technologies:**
- **Lit 3 (^3.3.2):** Reactive properties, slot composition, lifecycle methods — already in use across 15+ components
- **TailwindElement base class:** Dual-mode styling (SSR + client), CSS custom property theming — standard for all LitUI components
- **CSS transitions:** For accordion height animation (`grid-template-rows`) and tabs indicator sliding (`transform`) — consistent with project's zero-runtime-overhead philosophy
- **`@lit-ui/core` utilities:** `dispatchCustomEvent()` for events, `isServer` guards for SSR, `tailwindBaseStyles` for Shadow DOM styling — all existing infrastructure

**Animation strategy (accordion):**
Use `grid-template-rows: 0fr` to `1fr` transition as the primary technique. This is cross-browser today and requires no JavaScript height measurement. Optionally progressive-enhance with `interpolate-size: allow-keywords` via `@supports` query where available (Chromium 129+ only). Do NOT use `max-height` hacks or animation libraries.

**Animation strategy (tabs):**
Active tab indicator slides using `transform: translateX()` with CSS transitions. Measure indicator position using `getBoundingClientRect()` on value change and update CSS custom properties. Panel switching is instant (display toggle) or can use subtle opacity fade.

**Reusable patterns:**
- Roving tabindex from RadioGroup for keyboard navigation (Up/Down arrows for accordion headers, Left/Right or Up/Down for tabs)
- Parent-child slot discovery via `slotchange` from RadioGroup/CheckboxGroup
- Disabled state propagation from RadioGroup
- CSS custom property theming (`--ui-accordion-*`, `--ui-tabs-*`) consistent with all components

**What NOT to add:**
- `<details>`/`<summary>` for accordion (limited animation control, Shadow DOM complications, inconsistent with ARIA APG pattern)
- Animation libraries (GSAP, Motion One, Framer Motion) — violates zero-runtime-overhead principle
- `KeyboardNavigationManager` class from Calendar (designed for 2D grids, overkill for 1D lists)
- State management libraries (simple state is handled by Lit reactive properties)

### Expected Features

Research analyzed Radix UI, Ark UI, Headless UI, Shoelace, Material Web, and W3C APG specs to establish feature expectations.

**Accordion — Must Have (table stakes):**
- Single-expand mode (default, only one panel open at a time)
- Multi-expand mode (via `multiple` attribute, each panel toggles independently)
- Collapsible (allow all panels to close, default `true` for better UX than Radix's `false`)
- Full WAI-ARIA keyboard support (Enter/Space to toggle, Tab/Shift+Tab, arrow keys between headers, Home/End)
- `aria-expanded`, `aria-controls`, `aria-labelledby` on appropriate elements
- Heading wrapper with configurable `aria-level` (default 3)
- Animated expand/collapse with `prefers-reduced-motion` support
- Disabled items (skipped in keyboard navigation, `aria-disabled`)
- Default expanded value via `value`/`default-value` attribute
- Controlled and uncontrolled modes (matches RadioGroup pattern)
- CSS custom properties for theming (`--ui-accordion-*`)
- `data-state="open|closed"` attributes for CSS-only styling

**Accordion — Should Have (differentiators):**
- Arrow key navigation between headers (WAI-ARIA APG optional but recommended, reuse RadioGroup pattern)
- Expand/collapse indicator (chevron SVG with rotation animation, allow override via slot)
- Horizontal orientation support (uncommon visually but keyboard nav direction per APG)
- SSR with Declarative Shadow DOM (unique to web component implementations)
- Slot-based content API (natural for web components)

**Accordion — Defer (v2+):**
- Lazy mounting of content (low demand, accordion panels typically lightweight)
- Nested accordion special handling (users can compose naturally)

**Tabs — Must Have (table stakes):**
- Full WAI-ARIA structure (`role="tablist"`, `role="tab"`, `role="tabpanel"`)
- `aria-selected`, `aria-controls`, `aria-labelledby` linking
- Automatic activation mode (default, arrow keys focus AND activate)
- Manual activation mode (arrow keys focus only, Enter/Space activates)
- Horizontal orientation (default, Left/Right arrows)
- Vertical orientation (Up/Down arrows, `aria-orientation="vertical"`)
- Arrow key navigation with wrapping, Home/End keys
- Disabled tabs (skipped in navigation, `aria-disabled`)
- Default selected tab via `value`/`default-value`
- Controlled and uncontrolled modes
- Animated active indicator (sliding underline/highlight)
- CSS custom properties for theming (`--ui-tabs-*`)
- `data-state="active|inactive"` attributes

**Tabs — Should Have (differentiators):**
- Lazy rendering of tab panels (render on first activation, keep in DOM — significant for heavy content)
- Overflow scroll with navigation buttons (auto-detect with ResizeObserver, common in data-heavy dashboards)
- Tab placement variants (top, bottom, start, end)
- SSR with Declarative Shadow DOM
- Keyboard-accessible panels without focusable content (`tabindex="0"` on panel when empty)

**Tabs — Defer (v2+):**
- Closable/removable tabs (niche, IDE-like interfaces)
- Panel transition animations (polish, not blocking)

### Architecture Approach

Both components follow the **parent-child container pattern** established by RadioGroup/CheckboxGroup. The parent container discovers children via `slotchange`, owns state (which items are expanded/selected), and coordinates keyboard navigation. Children are presentational and dispatch internal events upward.

**Accordion structure:**
```
lui-accordion (container, manages expand state)
  -> slot[default] discovers lui-accordion-item children
  -> manages value (single-expand) or value array (multi-expand)
  -> coordinates keyboard navigation (roving tabindex)

lui-accordion-item (child, presentational)
  -> slot[name="header"] for trigger content
  -> slot[default] for panel content
  -> receives expanded boolean from parent
  -> dispatches internal ui-accordion-toggle events
```

**Tabs structure:**
```
lui-tabs (container, renders tablist, manages active tab)
  -> internally renders role="tablist" with tab buttons from panel metadata
  -> slot[default] discovers lui-tab-panel children
  -> manages value (active tab)
  -> coordinates keyboard navigation and activation modes

lui-tab-panel (child, presentational)
  -> label property (rendered in tab button by parent)
  -> slot[name="icon"] for tab icon (optional)
  -> slot[default] for panel content
  -> lazy attribute for conditional rendering
```

**Key architectural decisions:**

1. **ARIA ID wiring in shadow DOM:** All ARIA-connected elements (buttons, panels, headers) must be rendered in shadow DOM with shadow-internal IDs. User content is slotted into shadow-rendered wrappers. This is the only way to make `aria-controls` and `aria-labelledby` work across Shadow DOM boundaries.

2. **State ownership:** Parent owns all state (expanded items for accordion, active tab for tabs). Children are stateless presenters. Prevents race conditions in single-expand mode where opening one item must close others.

3. **Animation approach:** Accordion uses CSS Grid `grid-template-rows: 0fr/1fr` transition with a specific wrapper structure (outer grid container, inner overflow wrapper, slotted content). Tabs use `transform` transitions on an absolutely-positioned indicator element.

4. **Keyboard navigation:** Both reuse the roving tabindex pattern from RadioGroup with wrapping. Tabs add automatic vs. manual activation modes (focus = activate vs. focus separate from activate). Arrow key directions change based on orientation.

5. **Lazy loading (tabs only):** Per-panel `lazy` attribute uses a `_hasBeenActive` boolean flag and Lit conditional rendering (`${this.visited ? html`<slot>` : nothing}`). No IntersectionObserver or dynamic imports needed.

**Major components:**
1. **Accordion container (`lui-accordion`)** — Slot discovery, single/multi-expand state management, keyboard navigation
2. **AccordionItem (`lui-accordion-item`)** — Header button with chevron, collapsible content panel, grid-based height animation
3. **Tabs container (`lui-tabs`)** — Slot discovery, tablist rendering, active tab state, automatic/manual activation, indicator animation
4. **TabPanel (`lui-tab-panel`)** — Label metadata, active/hidden states, lazy mounting, panel content slot

### Critical Pitfalls

Research identified 23 pitfalls specific to Shadow DOM accordion/tabs implementations. Top 7 critical/high-severity issues:

1. **ARIA ID references across Shadow DOM boundaries (CRITICAL)** — `aria-controls` and `aria-labelledby` fail silently when pointing across shadow boundaries. Screen readers cannot navigate from trigger to panel. **Mitigation:** Render all ARIA-wired elements in shadow DOM with shadow-internal IDs. Slot user content into shadow-rendered wrappers.

2. **Single-expand state synchronization (HIGH)** — In single-expand mode, multiple panels can briefly appear open due to timing issues or re-entrant updates. **Mitigation:** Single source of truth on parent (one `expandedItem` string or `expandedItems` Set), not distributed state. Use batch update guards like CheckboxGroup.

3. **CSS height animation from 0 to auto (HIGH)** — Cannot interpolate `height: 0` to `height: auto` without the Chromium-only `interpolate-size` property. **Mitigation:** Use `grid-template-rows: 0fr` to `1fr` transition (cross-browser today). Progressive enhance with `interpolate-size` via `@supports` query.

4. **Automatic vs. manual tab activation confusion (HIGH)** — Developers often implement only automatic mode or conflate focus state with selection state in manual mode. **Mitigation:** Separate "focused tab index" from "selected tab index." In automatic mode, focus change triggers selection. In manual mode, focus and selection are independent until Enter/Space.

5. **`slotchange` does not fire after SSR hydration (CRITICAL)** — When server-rendered with Declarative Shadow DOM, `slotchange` event does not fire on client hydration. Child discovery silently fails. **Mitigation:** In `firstUpdated()`, manually dispatch `slotchange` on all slots if SSR-hydrated.

6. **Grid row transition requires specific DOM structure (HIGH)** — The `grid-template-rows` animation trick requires outer grid container + inner element with `min-height: 0` and `overflow: clip`. Missing wrapper causes content overflow during collapse. **Mitigation:** Use exact structure verified in research: `<div style="display: grid; grid-template-rows: 0fr"><div style="min-height: 0; overflow: clip"><slot></slot></div></div>`.

7. **Vertical tabs arrow key direction (HIGH)** — Developers hardcode Left/Right arrows and forget to swap to Up/Down for vertical orientation. **Mitigation:** Expose `orientation` property, map arrow keys conditionally, set `aria-orientation` on tablist.

## Implications for Roadmap

Based on architectural dependencies, feature complexity, and pattern reuse, the recommended phase structure is:

### Phase 1: Accordion Foundation
**Rationale:** Accordion is structurally simpler than Tabs — no indicator animation, no lazy loading, no orientation variants. The CSS Grid height animation is the main technical challenge. Solving it first establishes a pattern and validates the parent-child discovery approach.

**Delivers:**
- Fully accessible accordion component with single/multi-expand modes
- CSS Grid-based height animation with `prefers-reduced-motion` support
- Roving tabindex keyboard navigation (Up/Down, Home/End)
- Disabled items, controlled/uncontrolled modes, CSS theming

**Addresses:** All accordion table stakes from FEATURES.md, including arrow key navigation differentiator.

**Avoids:**
- Pitfall 1 (ARIA ID references) via shadow-internal wiring
- Pitfall 2 (state sync) via parent-owned state
- Pitfall 3 (height animation) via Grid technique
- Pitfall 5 (SSR slotchange) via manual dispatch

**Components:** `lui-accordion`, `lui-accordion-item`

### Phase 2: Tabs Foundation
**Rationale:** Tabs reuses the parent-child discovery and keyboard navigation patterns from Accordion. Adds orientation, automatic/manual activation modes, and active indicator animation. Building second allows pattern refinement.

**Delivers:**
- Fully accessible tabs component with automatic/manual activation
- Horizontal/vertical orientation with correct arrow key mapping
- Animated active indicator (sliding underline)
- Disabled tabs, controlled/uncontrolled modes, CSS theming

**Addresses:** All tabs table stakes from FEATURES.md.

**Uses:** Reuses roving tabindex pattern from Accordion/RadioGroup, CSS transition pattern from Accordion.

**Avoids:**
- Pitfall 7 (ARIA ID references) via same pattern as Accordion
- Pitfall 8 (activation modes) via separate focus/selection state
- Pitfall 9 (roving tabindex) via parameterized activation mode
- Pitfall 10 (vertical orientation) via conditional arrow key mapping

**Components:** `lui-tabs`, `lui-tab-panel`

### Phase 3: Tabs Enhancements
**Rationale:** Lazy rendering and overflow scrolling are differentiators that add polish but are not blocking for basic tab functionality. Building these after foundation reduces initial complexity.

**Delivers:**
- Lazy panel rendering (per-panel `lazy` attribute)
- Overflow scroll with navigation buttons (ResizeObserver-based)
- Tab placement variants (top/bottom/start/end)
- Panel transition animations (optional fade)

**Implements:** Lazy mounting pattern (boolean flag + conditional rendering), overflow detection with ResizeObserver.

**Avoids:** Pitfall 12 (lazy content flickers) via `display: none` (keeps in DOM) vs. conditional rendering (destroys DOM).

### Phase 4: Integration & Polish
**Rationale:** After components work in isolation, integrate with CLI, documentation, and SSR.

**Delivers:**
- CLI templates (accordion, accordion-item, tabs, tab-panel)
- CLI registry entries with dependencies
- CSS custom property definitions in `@lit-ui/core`
- Documentation pages with interactive demos
- SSR verification with Astro/Next.js

**Addresses:** Pitfall 21 (CLI multi-file templates) via toast namespaced pattern, Pitfall 23 (CSS fallbacks) via `var()` defaults.

### Phase Ordering Rationale

- **Accordion before Tabs:** Simpler pattern (no activation modes, no indicator animation). Validates parent-child discovery and CSS animation approach.
- **Foundation before Enhancements:** Table stakes features are blocking for any real usage. Differentiators add polish but are not essential for initial release.
- **Integration last:** Components must work independently before CLI templates, docs, and SSR verification.

**Dependency chain:**
1. Accordion validates parent-child slot discovery pattern and CSS Grid animation
2. Tabs reuses patterns from Accordion, adds orientation and activation modes
3. Tabs enhancements build on stable foundation
4. Integration depends on stable component APIs

### Research Flags

**Phases with standard patterns (skip additional research):**
- **Phase 1 (Accordion Foundation):** W3C APG pattern is authoritative and maps directly to existing RadioGroup pattern. No unknowns.
- **Phase 2 (Tabs Foundation):** W3C APG pattern is equally well-documented. Roving tabindex is already validated in RadioGroup.
- **Phase 4 (Integration):** CLI template pattern established in v5.0 Toast. SSR tested across multiple components.

**Phases that may need deeper research during planning:**
- **Phase 3 (Tabs Enhancements):** Overflow scroll with navigation buttons is complex (ResizeObserver, dynamic button visibility, smooth scrolling, RTL handling). If implementation issues arise, consider `/gsd:research-phase` focused on overflow scroll patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Zero new dependencies. All capabilities exist in current stack. CSS Grid animation verified via multiple authoritative sources (CSS-Tricks, MDN, Chrome Developers). |
| Features | **HIGH** | Cross-referenced 6+ major libraries (Radix, Ark UI, Headless UI, Shoelace, Material Web) and W3C APG specs. Feature expectations are consistent across ecosystem. |
| Architecture | **HIGH** | Parent-child pattern is proven in existing codebase (RadioGroup, CheckboxGroup). W3C APG patterns map cleanly to Lit slot composition. Shadow DOM ARIA wiring validated via research sources. |
| Pitfalls | **HIGH** | 23 pitfalls identified from authoritative sources (W3C APG, Nolan Lawson Shadow DOM research, Lit SSR docs) and existing codebase analysis. All have concrete mitigations. |

**Overall confidence:** **HIGH**

All four research dimensions (stack, features, architecture, pitfalls) are backed by:
- Authoritative sources (W3C APG, MDN, official Lit docs)
- Established codebase patterns (RadioGroup, CheckboxGroup, Dialog, Toast)
- Cross-referenced ecosystem libraries (Radix, Ark UI, Headless UI, Shoelace)
- Verified browser compatibility data (Can I Use)

### Gaps to Address

1. **Tab overflow scroll implementation details:** While the pattern is established (ResizeObserver + scroll buttons), the exact scrolling behavior (instant vs. animated, button visibility threshold, RTL handling) may require iteration during Phase 3. Mitigation: Build foundation first, defer enhancements.

2. **Progressive enhancement for `interpolate-size`:** Research confirms `interpolate-size: allow-keywords` is Chromium-only (Feb 2026). Plan to add as progressive enhancement via `@supports` query later. Not blocking — Grid technique is sufficient baseline.

3. **Safari `slotchange` timing:** Research flags Safari firing `slotchange` before `connectedCallback`. Mitigation already documented (initialize state as class fields, guard handlers). Validate during Phase 1 Safari testing.

4. **Heading level inheritance for nested accordions:** If accordion is nested inside another accordion, the inner accordion's heading level should auto-increment. Research indicates this is rare enough to defer to user configuration via `heading-level` prop. Not blocking.

## Sources

### Primary (HIGH confidence)
- [W3C WAI-ARIA APG Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) — Authoritative accessibility spec
- [W3C WAI-ARIA APG Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) — Authoritative accessibility spec
- [W3C APG Tabs Automatic Activation Example](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-automatic/) — Reference implementation
- [W3C APG Tabs Manual Activation Example](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-manual/) — Reference implementation
- [MDN: grid-template-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-rows) — CSS animation technique
- [MDN: interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size) — Progressive enhancement option
- [CSS-Tricks: CSS Grid Can Do Auto Height Transitions](https://css-tricks.com/css-grid-can-do-auto-height-transitions/) — Animation technique verification
- [Stefan Judis: How to Animate Height with CSS Grid](https://www.stefanjudis.com/snippets/how-to-animate-height-with-css-grid/) — Animation technique verification
- [Can I Use: interpolate-size](https://caniuse.com/mdn-css_properties_interpolate-size_allow-keywords) — Browser compatibility data
- [Radix UI Accordion](https://www.radix-ui.com/primitives/docs/components/accordion) — Headless primitive reference
- [Radix UI Tabs](https://www.radix-ui.com/primitives/docs/components/tabs) — Headless primitive reference
- [Ark UI Accordion](https://ark-ui.com/docs/components/accordion) — Headless primitive reference
- [Ark UI Tabs](https://ark-ui.com/docs/components/tabs) — Headless primitive reference
- [Shoelace Tab Group](https://shoelace.style/components/tab-group) — Web component reference
- [Material Web Tabs](https://material-web.dev/components/tabs/) — Web component reference
- [Headless UI Disclosure](https://headlessui.com/react/disclosure) — Disclosure patterns
- [Headless UI Tabs](https://headlessui.com/v1/react/tabs) — Tab patterns
- Existing codebase: `packages/radio/src/radio-group.ts` — Parent-child pattern, roving tabindex
- Existing codebase: `packages/radio/src/radio.ts` — Presentational child pattern
- Existing codebase: `packages/checkbox/src/checkbox-group.ts` — Multi-select group pattern
- Existing codebase: `packages/dialog/src/dialog.ts` — CSS transition pattern
- Existing codebase: `packages/core/src/tailwind-element.ts` — Base class, SSR pattern
- Existing codebase: `packages/toast/` — Multi-file CLI template pattern

### Secondary (MEDIUM confidence)
- [Nolan Lawson: Shadow DOM and Accessibility](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) — ARIA ID reference pitfalls
- [w3c/aria Issue #864](https://github.com/w3c/aria/issues/864) — ARIA controls in web components discussion
- [Erik Kroes: Guide to Accessible Web Components](https://www.erikkroes.nl/blog/accessibility/the-guide-to-accessible-web-components-draft/) — Shadow DOM accessibility patterns
- [Chrome for Developers: Animate to height auto](https://developer.chrome.com/docs/css-ui/animate-to-height-auto) — Animation techniques
- [Patrick Brosset: Implementing an Accordion in 2026](https://patrickbrosset.com/lab/accordion/) — Modern patterns
- [Josh W. Comeau: interpolate-size Snippet](https://www.joshwcomeau.com/snippets/html/interpolate-size/) — Progressive enhancement
- [Lit Docs: Working with Shadow DOM](https://lit.dev/docs/components/shadow-dom/) — Shadow DOM patterns
- [Lit Docs: SSR Client Usage](https://lit.dev/docs/ssr/client-usage/) — SSR hydration
- [Cory Rylan: Understanding Slot Updates](https://coryrylan.com/blog/understanding-slot-updates-with-web-components) — Slotchange patterns
- [216digital: Accordion Accessibility](https://216digital.com/accordion-accessibility-common-issues-fixes/) — Common pitfalls
- [Aditus: Accessible Accordion](https://www.aditus.io/patterns/accordion/) — Accessibility patterns
- [Builder.io: Animated CSS Accordions](https://www.builder.io/blog/animated-css-accordions) — CSS animation patterns

### Tertiary (LOW confidence)
- [lit/lit-element Issue #619](https://github.com/lit/lit-element/issues/619) — Safari slotchange timing (historical issue, may be resolved)

---
*Research completed: 2026-02-02*
*Ready for roadmap: yes*
