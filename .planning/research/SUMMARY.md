# Project Research Summary

**Project:** LitUI v5.0 - Toast, Tooltip, and Popover Overlay Components
**Domain:** Feedback/overlay web components for Shadow DOM-based Lit.js component library
**Researched:** 2026-02-02
**Confidence:** HIGH

## Executive Summary

Toast, Tooltip, and Popover are overlay/feedback components that share positioning needs but have fundamentally different lifecycles and interaction models. The research reveals a zero-dependency approach: the existing `@floating-ui/dom` dependency (already used by Select, DatePicker, TimePicker) handles all positioning needs for Tooltip and Popover, while Toast requires no positioning library at all (viewport-anchored). The native Popover API (Baseline Widely Available, ~95% support) provides top-layer rendering for all three components, eliminating z-index battles and stacking context issues.

The recommended architecture uses three separate packages with a thin shared positioning utility in `@lit-ui/core/floating`. Toast is architecturally distinct: it needs an imperative API (`toast.success('message')`) and a singleton container that auto-appends to document.body. Tooltip and Popover share positioning infrastructure but differ in trigger mechanisms (hover/focus vs click) and content models (text-only vs interactive). All three components leverage modern CSS `@starting-style` + `transition-behavior: allow-discrete` for enter/exit animations, following the exact pattern already established in LitUI's Dialog component.

The most critical risks center on Shadow DOM limitations: ARIA attributes cannot cross shadow root boundaries (breaking tooltips for screen readers), Floating UI's `offsetParent` calculation fails in nested shadow roots without the `composed-offset-position` ponyfill, and toast live regions must exist in the DOM before content is injected. These pitfalls have specific, proven solutions documented in the research. Build order matters: Tooltip first (establishes shared positioning utility), Popover second (reuses utility, adds focus management), Toast last (most complex, standalone architecture).

## Key Findings

### Recommended Stack

**Zero new dependencies required.** All capabilities exist via existing dependencies and native browser APIs. The project already has `@floating-ui/dom` (^1.7.4) for Select/DatePicker positioning — Tooltip and Popover add the `arrow` and `autoUpdate` middleware from the same package. Toast needs no external dependencies. Native Popover API (`popover="manual"`) provides top-layer rendering for all three components. CSS `@starting-style` (~88% support, Baseline since August 2024) enables pure-CSS enter/exit animations. Pointer Events with `setPointerCapture` (pattern already proven in Time Picker's time-range-slider.ts) handles swipe-to-dismiss for toasts.

**Core technologies:**
- `@floating-ui/dom` (^1.7.4, existing): Tooltip and Popover positioning with arrow middleware — zero new dependencies
- Native Popover API (`popover="manual"`): Top-layer rendering for all three components, escapes z-index stacking contexts — ~95% browser support
- CSS `@starting-style` + `transition-behavior: allow-discrete`: Enter/exit animations — ~88% support, fallback to `@keyframes` for older browsers
- Pointer Events + `setPointerCapture`: Swipe-to-dismiss toasts — pattern exists in time-range-slider.ts and clock-face.ts

**What NOT to add:**
- React-specific toast libraries (Sonner, react-hot-toast): Framework-specific, incompatible with web components
- Animation libraries (Motion One, GSAP): CSS handles all needed animations
- Popover API polyfills: 95% support is sufficient, fallback to `position: fixed` is simpler than polyfill
- Gesture libraries: Pointer Events pattern already exists in codebase

### Expected Features

**Must have (table stakes):**

**Toast:**
- Variant types (success, error, warning, info) with distinct colors and icons
- Auto-dismiss with configurable duration (default 4-5s, 0 for persistent)
- Programmatic imperative API (`toast.success('message')`) — signature pattern from Sonner
- Six positioning options (top/bottom × left/center/right)
- Manual dismiss button (closable by default)
- Queue management and stacking (max 3-5 visible toasts)
- Accessible live region (`role="status"` + `aria-live="polite"` for info, `role="alert"` + `aria-live="assertive"` for errors)
- Enter/exit animations (slide-in, fade-out)
- Description support (title + secondary text)

**Tooltip:**
- Hover trigger with delay (300-700ms prevents flicker on mouse pass-through)
- Focus trigger (WAI-ARIA requirement: keyboard users must access tooltips)
- Escape to dismiss
- Positioning with collision avoidance (flip, shift via Floating UI)
- Arrow indicator
- `role="tooltip"` and `aria-describedby` (with Shadow DOM workaround)
- 12 configurable placements (top/right/bottom/left with start/center/end alignment)
- Non-interactive content only (WAI-ARIA constraint)

**Popover:**
- Click-to-toggle trigger
- Escape to dismiss
- Click-outside to dismiss (light dismiss)
- Positioning with collision avoidance (same Floating UI stack as Select dropdown)
- Optional arrow indicator
- Focus management (move focus to popover on open, return to trigger on close)
- `aria-expanded`, `aria-haspopup` on trigger; `role="dialog"` on content
- Controlled and uncontrolled modes (same pattern as Dialog)

**Should have (competitive):**

**Toast:**
- Action buttons (Sonner's `toast('Deleted', { action: { label: 'Undo', onClick: fn } })` pattern)
- Promise toast (`toast.promise(asyncFn, { loading, success, error })` — Sonner signature feature)
- Swipe to dismiss (touch-friendly, Material and Sonner both support)
- Pause on hover/focus (prevents dismissal while reading)
- Custom content via slot (arbitrary HTML in toasts)

**Tooltip:**
- Delay group (skip delay for adjacent tooltips — Radix `skipDelayDuration` pattern)
- Rich tooltip (title + description, Material Design 3 pattern)
- Transform-origin awareness (animations from correct origin based on placement)

**Popover:**
- Portal rendering (escape overflow:hidden ancestors)
- Anchor element (position relative to different element than trigger)
- Nested popover support (Headless UI `Popover.Group` pattern)
- Modal vs non-modal mode (non-modal default, modal for complex forms)
- Native Popover API integration (`popover="auto"` for light-dismiss)

**Defer (v2+):**
- Toast notification center/history (massive scope expansion, requires state management)
- Rich media in toasts (images, progress bars — adds complexity without proportional value)
- Interactive forms in toasts (violates WAI-ARIA, use Dialog instead)
- Touch-triggered tooltips (unreliable UX on mobile)

### Architecture Approach

Three separate packages (`@lit-ui/toast`, `@lit-ui/tooltip`, `@lit-ui/popover`) with a shared positioning utility added to `@lit-ui/core/floating` export. Toast is architecturally distinct: it uses an imperative API with a singleton `<lui-toast-container>` that auto-appends to document.body, managing queue state and stacking. Tooltip and Popover render inline in their own Shadow DOM using `position: fixed` + Floating UI (same pattern as existing Select dropdown), but share positioning logic via the new `@lit-ui/core/floating` utility. All three use the native Popover API (`popover="manual"`) for top-layer rendering, ensuring overlays appear above all z-index content including the Dialog's `showModal()` top layer.

**Major components:**

1. **Toast System** — Two-part architecture: `<lui-toast-container>` (manages queue, stacking, positioning, renders in top layer via `popover="manual"`) + `<lui-toast-item>` (individual toast with auto-dismiss, swipe-to-dismiss, variants). Imperative API (`toast()`, `toast.success()`, etc.) auto-creates container on first use. No Floating UI dependency (toasts are viewport-anchored, not element-anchored).

2. **Tooltip** — Single `<lui-tooltip>` component wrapping a slotted trigger. Uses `@lit-ui/core/floating` utility with Floating UI's `arrow` and `autoUpdate` middleware. Hover/focus triggers with delay timers. No imperative API (purely declarative). Content renders in Shadow DOM with `position: fixed`.

3. **Popover** — Single `<lui-popover>` component with named trigger slot. Reuses `@lit-ui/core/floating` for positioning (same infrastructure as Tooltip). Click trigger with light-dismiss via click-outside detection. Focus management pattern reused from Dialog (move focus on open, restore on close). Supports nested popovers via event composition path checking.

4. **Shared Floating UI utility** — New `@lit-ui/core/floating` export wrapping `@floating-ui/dom` with `composed-offset-position` ponyfill to fix Shadow DOM `offsetParent` calculation. Abstracts `computePosition` + middleware setup (arrow, flip, shift, offset, size) and `autoUpdate` lifecycle. Tooltip and Popover both consume this; existing Select/DatePicker can optionally migrate later.

### Critical Pitfalls

1. **`aria-describedby` cannot cross Shadow DOM boundaries** — Tooltip text in Shadow DOM cannot be referenced by trigger in light DOM via IDREF. Screen readers never announce tooltips. **Prevention:** Use `ariaDescribedByElements` (Element Reflection API, Chromium/WebKit) or fallback to `aria-label` on trigger. Keep trigger and tooltip content in same DOM scope.

2. **Toast `aria-live` region must exist before content injection** — Screen readers only monitor live regions present at page load. Dynamically creating the live region when the first toast appears causes silent toasts. **Prevention:** Mount empty `<lui-toast-container>` with `aria-live` region on first `toast()` call (before injecting content), never use `display: none` on the live region container (use `visibility: hidden` if needed).

3. **Overlay trapped inside Shadow DOM stacking context** — Parent elements with `overflow: hidden`, `transform`, `filter`, or `z-index` create inescapable stacking contexts. Tooltips/popovers clipped or hidden. `z-index: 999999` cannot fix it. **Prevention:** Use native Popover API (`popover="manual"`) for top-layer rendering. Fallback to portal-to-body for unsupported browsers.

4. **Floating UI `offsetParent` miscalculation in Shadow DOM** — Browsers return incorrect `offsetParent` inside shadow trees per CSS spec. Tooltips appear hundreds of pixels off. **Prevention:** Use `composed-offset-position` ponyfill in shared `@lit-ui/core/floating` utility. Configure Floating UI's `platform.getOffsetParent` to use ponyfill.

5. **Toast queue race conditions during rapid fire** — Concurrent async operations (CSS transitions, timeouts) on multiple toasts cause overlapping, stuck, or memory-leaked toasts. **Prevention:** Implement toast queue as state machine with explicit states (queued, entering, visible, exiting, removed). Use Web Animations API's `.finished` Promise instead of `transitionend` events. Set max queue length (5-10).

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Shared Positioning Utility
**Rationale:** Tooltip and Popover both depend on a shared Floating UI wrapper. Building this first avoids duplicating code and forces architectural decisions (Popover API strategy, `composed-offset-position` integration, `autoUpdate` lifecycle) that both components need.

**Delivers:** `@lit-ui/core/floating` export with `positionFloating()` and `autoUpdatePosition()` utilities wrapping `@floating-ui/dom` + `composed-offset-position` ponyfill.

**Addresses:** Pitfall 4 (offsetParent miscalculation in Shadow DOM), establishes pattern for Pitfall 3 (top-layer rendering via Popover API configuration).

**Complexity:** LOW — ~100 lines wrapping existing dependency.

**Research flag:** Standard pattern (Floating UI is well-documented). No additional research needed.

### Phase 2: Tooltip
**Rationale:** Simplest overlay component. No imperative API, no portal, no focus management. Establishes hover/focus delay patterns, ARIA cross-shadow solutions, and CSS animation patterns that Popover and Toast will reuse.

**Delivers:** `@lit-ui/tooltip` package with declarative wrapping API (`<lui-tooltip content="..."><button>Trigger</button></lui-tooltip>`). Hover/focus triggers, arrow positioning, delay groups, `@starting-style` animations.

**Uses:** Phase 1's `@lit-ui/core/floating` utility, Floating UI's `arrow` and `autoUpdate` middleware.

**Addresses:** Pitfall 1 (ARIA cross-shadow via `aria-label` strategy), Pitfall 6 (hover intent with delay timers and pointerType detection), Pitfall 14 (positioning during scroll via `autoUpdate`).

**Complexity:** MEDIUM — Shadow DOM ARIA workaround requires careful testing.

**Research flag:** Standard pattern (Radix/Floating UI docs cover this thoroughly). Skip phase-specific research.

### Phase 3: Popover
**Rationale:** Builds on Tooltip's positioning infrastructure, adds click trigger and focus management. Validates that shared utility works for multiple component types.

**Delivers:** `@lit-ui/popover` package with trigger slot API. Click-to-toggle, light-dismiss, focus management (non-modal default, modal option), nested popover support, controlled/uncontrolled modes.

**Uses:** Phase 1's `@lit-ui/core/floating` utility (same as Tooltip), Dialog's focus restoration pattern.

**Implements:** Click-outside detection via `composedPath()`, overlay stack registry for nested popovers.

**Addresses:** Pitfall 7 (click-outside with multiple overlays via overlay registry), Pitfall 8 (focus management — no auto-focus, return to trigger on close).

**Complexity:** MEDIUM — Focus management and nested support add complexity over Tooltip.

**Research flag:** Standard pattern (Headless UI, Radix patterns well-documented). Skip phase-specific research.

### Phase 4: Toast
**Rationale:** Most architecturally complex (imperative API, queue management, portal). Independent of Tooltip/Popover code, so can be built in parallel if needed, but benefits from animation and `isServer` guard patterns established in Phases 2-3.

**Delivers:** `@lit-ui/toast` package with imperative API (`toast()`, `toast.success()`, etc.). Singleton `<lui-toast-container>` with queue management, stacking, positioning. `<lui-toast-item>` with variants, auto-dismiss, swipe-to-dismiss, action buttons.

**Addresses:** Pitfall 2 (aria-live region timing via early container mount), Pitfall 5 (queue race conditions via state machine), Pitfall 8 (never steal focus from toasts).

**Complexity:** HIGH — Imperative API design, queue state machine, swipe gesture handling (reuse Time Picker pattern).

**Research flag:** **Needs deeper research during planning.** Toast queue state machine, imperative API crossing Shadow DOM boundaries, and swipe gesture thresholds warrant phase-specific research. Web.dev toast pattern and Sonner's source code are primary references.

### Phase Ordering Rationale

- **Shared utility first (Phase 1)** because both Tooltip and Popover depend on it. Building Tooltip without the shared utility would force refactoring when Popover is added.
- **Tooltip before Popover (Phases 2-3)** because Tooltip is simpler (no focus management, no click-outside) and forces resolution of critical Shadow DOM ARIA issues (Pitfall 1) that affect both. Popover adds complexity incrementally.
- **Toast last (Phase 4)** because it has zero code dependency on Tooltip/Popover (different positioning strategy, different lifecycle). However, it can start in parallel after Phase 1 if resources allow, since it shares only CSS animation patterns and `isServer` guards (conventions, not code).
- **Dependency chain:** Phase 2 → Phase 1 (hard dependency). Phase 3 → Phase 1 (hard dependency). Phase 4 → none (can parallelize after Phase 1).

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 4 (Toast):** Queue state machine implementation, imperative API that works across frameworks, swipe-to-dismiss threshold tuning. Reference: web.dev toast component pattern, Sonner source code, existing time-range-slider.ts for swipe pattern.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Shared utility):** Floating UI wrapper — official docs and existing Select component provide complete pattern.
- **Phase 2 (Tooltip):** Hover/focus tooltip — Radix UI Tooltip and Floating UI tooltip guide cover all patterns. Shadow DOM ARIA workaround documented in Nolan Lawson's article.
- **Phase 3 (Popover):** Click popover with focus management — Headless UI Popover and Radix UI Popover provide proven patterns. Dialog component already has focus restoration pattern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All capabilities verified via existing dependency (`@floating-ui/dom` ^1.7.4), native browser APIs (Popover API ~95% support, Pointer Events 97%+), and existing codebase patterns (Dialog animations, Time Picker gestures). Zero new dependencies required. |
| Features | HIGH | Feature landscape derived from authoritative sources (Sonner, Radix UI, Floating UI, Material Design 3, WAI-ARIA APG) with consistent patterns across all major libraries. Table stakes, differentiators, and anti-features validated against multiple implementations. |
| Architecture | HIGH | Package structure follows existing LitUI conventions (TailwindElement base, Shadow DOM, SSR guards). Shared utility approach proven by existing Dialog/Select patterns. Native Popover API and Floating UI integration verified via official documentation and real-world web component library migrations (UI5, Shoelace). |
| Pitfalls | HIGH | All critical pitfalls verified via authoritative sources (Nolan Lawson Shadow DOM ARIA analysis, Sara Soueidan live regions guide, Floating UI platform docs) and real-world bug reports (Angular Material #24919, Shoelace #1359, Floating UI #1345). Prevention strategies proven in production libraries. |

**Overall confidence:** HIGH

### Gaps to Address

- **Browser support boundary:** Research assumes Popover API support (~95%) is acceptable. If LitUI targets browsers older than ~2 years, a fallback strategy (portal-to-body with manual light-dismiss) is needed. Decision required during Phase 1. **Recommendation:** Match Dialog's precedent (uses native `<dialog>` without fallback).

- **Tooltip ARIA strategy:** Multiple approaches exist (Element Reflection API `ariaDescribedByElements`, `aria-label` fallback, visually-hidden light DOM span). Research recommends Element Reflection with `aria-label` fallback, but specific strategy should be prototyped in Phase 2 to validate screen reader behavior across VoiceOver, NVDA, and JAWS.

- **Toast queue state machine:** Research identifies the need but does not specify exact state transitions. Phase 4 planning should define states (queued, entering, visible, exiting, removed) and valid transitions. Sonner's source code provides reference implementation.

- **Swipe-to-dismiss thresholds:** Time Picker uses Pointer Events + `setPointerCapture`, but toast swipe thresholds (distance: ~40% of height, velocity: >0.11 px/ms) come from Sonner. Phase 4 should validate these feel correct for LitUI's design system via user testing.

## Sources

### Primary (HIGH confidence)

**Stack research:**
- [Floating UI - arrow middleware](https://floating-ui.com/docs/arrow) — Arrow positioning API
- [Floating UI - autoUpdate](https://floating-ui.com/docs/autoupdate) — Auto-reposition on scroll/resize
- [MDN - Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) — Native popover specification
- [MDN - @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) — CSS entry animation rule
- [Can I Use - Popover API](https://caniuse.com/mdn-api_htmlelement_popover) — ~95% browser support
- [Can I Use - @starting-style](https://caniuse.com/mdn-css_at-rules_starting-style) — ~88% browser support
- [web.dev - Building a Toast Component](https://web.dev/articles/building/a-toast-component) — `<output>` element, accessibility
- LitUI codebase: `packages/select/src/select.ts`, `packages/time-picker/src/time-range-slider.ts`, `packages/dialog/src/dialog.ts`

**Features research:**
- [Sonner GitHub](https://github.com/emilkowalski/sonner) — Toast API patterns
- [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip) — Tooltip primitives
- [Radix UI Popover](https://www.radix-ui.com/primitives/docs/components/popover) — Popover primitives
- [Floating UI Tooltip](https://floating-ui.com/docs/tooltip) — Tooltip positioning/interaction
- [WAI-ARIA APG Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) — Accessibility spec
- [MDN ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) — Toast accessibility
- [Material Design 3 Snackbar](https://m3.material.io/components/snackbar/specs) — Snackbar specs

**Architecture research:**
- [Floating UI Platform docs](https://floating-ui.com/docs/platform) — `composed-offset-position` recommendation
- [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) — Baseline Widely Available April 2025
- [UI5 Web Components Popover API migration](https://sap.github.io/ui5-webcomponents/blog/releases/popover-api-in-v2/) — Real library migration
- [Adobe Spectrum Toast](https://opensource.adobe.com/spectrum-web-components/components/toast/) — Web component reference

**Pitfalls research:**
- [Nolan Lawson: Shadow DOM and accessibility](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) — ARIA cross-root limitations
- [Sara Soueidan: Accessible notifications with ARIA Live Regions](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) — Live region implementation
- [Floating UI Shadow DOM issue #1345](https://github.com/floating-ui/floating-ui/issues/1345) — offsetParent bug reports
- [Shoelace Alert live region issue #1359](https://github.com/shoelace-style/shoelace/issues/1359) — Real bug example
- [Angular Material AriaDescriber bug #24919](https://github.com/angular/components/issues/24919) — ARIA cross-root failure

### Secondary (MEDIUM confidence)
- [Headless UI Popover](https://headlessui.com/v1/react/popover) — Popover patterns
- [Igalia: Solving Cross-root ARIA Issues](https://blogs.igalia.com/mrego/solving-cross-root-aria-issues-in-shadow-dom/) — Element Reflection proposal
- [Josh Comeau: What The Heck, z-index??](https://www.joshwcomeau.com/css/stacking-contexts/) — Stacking context explanation
- [OddBird Popover Polyfill](https://popover.oddbird.net/) — Fallback option

---
*Research completed: 2026-02-02*
*Ready for roadmap: yes*
