# Project Research Summary

**Project:** LitUI v4.1 Select/Combobox Component
**Domain:** Web Components - Accessible Select/Combobox with Lit.js
**Researched:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

The Select/Combobox component follows the LitUI pattern of leveraging native browser capabilities while providing modern styling and framework-agnostic web components. The recommended approach uses the **Popover API** for dropdown management combined with **CSS Anchor Positioning** for modern browsers, with **Floating UI** as a progressive enhancement fallback. This matches LitUI's existing Dialog pattern of using native browser features (native `<dialog>` element) while maintaining full control over styling.

The component requires **two new dependencies**: `@floating-ui/dom` (v1.7.4) for positioning fallback and `@tanstack/lit-virtual` (v3.13.19) for optional virtual scrolling with large datasets. Both are stable, production-ready libraries with excellent Lit integration patterns. The architecture uses three components: `lui-select` (state management), `lui-option` (individual items), and `lui-option-group` (grouping), with a slot-based API that mirrors native `<select>`/`<option>` for developer familiarity.

The **critical risk** is ARIA implementation. The W3C changed the combobox pattern significantly between ARIA 1.1 and 1.2, and many online tutorials use the outdated pattern. Following only the current [W3C APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and testing with real screen readers (NVDA, JAWS, VoiceOver) from Phase 1 will prevent broken accessibility. Additional mobile-specific concerns include iOS VoiceOver's limited `aria-activedescendant` support and iOS Safari double-UI issues with custom selects, both addressed by early mobile device testing and potential native fallback options.

## Key Findings

### Recommended Stack

Two new dependencies are required for features that should not be built from scratch. Both have excellent Lit-specific solutions with verified stable versions and minimal bundle impact (combined ~5KB gzipped).

**Core technologies:**
- **@floating-ui/dom (v1.7.4)**: Dropdown positioning with collision detection — framework-agnostic, explicit Shadow DOM support, tree-shakeable. Essential for reliable positioning across viewport edges, scrolling containers, and transformed ancestors. Fallback for browsers without CSS Anchor Positioning support (76% as of 2026-01).
- **@tanstack/lit-virtual (v3.13.19)**: Virtual scrolling for large option lists — stable API (vs experimental @lit-labs/virtualizer), Reactive Controller pattern for natural Lit integration, headless design for full control. Optional feature for datasets >100 options.
- **Native APIs**: IntersectionObserver (97% support) for infinite scroll, Popover API (90% support) for top-layer dropdown management, CSS Anchor Positioning (76% support, progressive enhancement).

**Rejected alternatives:**
- `@lit-labs/virtualizer`: Experimental status, breaking changes expected
- Popper.js: Deprecated, replaced by Floating UI
- Native `<select>` styling (appearance: base-select): Chrome 133+ only, insufficient browser support
- Manual positioning: Too complex for edge cases Floating UI already handles

### Expected Features

Research analyzed shadcn/ui, Radix UI, Headless UI, MUI, Chakra UI, and Ariakit. Clear consensus on table stakes and competitive differentiators emerged.

**Must have (table stakes):**
- Single-select with controlled/uncontrolled modes
- Full keyboard navigation (arrows, Enter, Escape, Home/End, type-ahead)
- Complete ARIA combobox implementation per W3C APG
- Dropdown positioning with collision detection (flip when near edge)
- Option disabled states and component disabled state
- Form participation via ElementInternals (consistent with Input/Textarea)
- Placeholder text, clearable selection
- Size variants (sm/md/lg) matching existing components
- Error state styling and required validation
- SSR compatibility with isServer guards

**Should have (competitive advantage):**
- Multi-select with tag/chip display and removal (X button, backspace)
- Combobox mode with text input filtering and custom filter functions
- Highlight matched text in search results (differentiator vs competition)
- Option groups with labels
- Async options loading with loading/error states
- Debounced search (150ms default)
- Creatable options (add new values from input)
- Optional virtual scrolling for 100+ options

**Defer (v2+ or explicit anti-features):**
- Nested/tree select (complex, rare use case)
- Drag-and-drop reordering (scope creep)
- Rich HTML content in options (XSS risk, a11y issues)
- Color/date picker integration (separate components)
- Built-in data fetching (consumer responsibility)
- Heavy animations (performance, motion sickness)

### Architecture Approach

Three-component composition: `lui-select` (container, state, form), `lui-option` (items), `lui-option-group` (grouping). State ownership is centralized in `lui-select` with options as stateless presentational components. Selection state is derived from parent's value property, not stored in child components.

**Major components:**
1. **lui-select** — State management (value, open, activeDescendant, searchQuery), keyboard navigation, ARIA combobox role, form participation via ElementInternals, dropdown positioning via Popover API + CSS Anchor/Floating UI fallback
2. **lui-option** — Stateless display of label/value, selected state reflected from parent, disabled support, emits selection events that bubble to parent
3. **lui-option-group** — Optional grouping with label header, can disable all children, uses slots for contained options

**Key patterns:**
- **Slot-based API** over attribute-based for declarative HTML, SSR-friendliness, framework agnosticism, rich content support
- **Popover API + CSS Anchor Positioning** for dropdown (native top-layer, built-in light dismiss, Esc handling), Floating UI fallback for older browsers
- **aria-activedescendant** for focus management (DOM focus stays on combobox, not options) per W3C APG pattern
- **Lit Task controller** for async loading state management (pending/complete/error states)
- **ElementInternals** for form participation with FormData for multi-select (multiple values with same name)

### Critical Pitfalls

Top 5 pitfalls that cause major issues if not addressed early:

1. **ARIA 1.1 vs 1.2 pattern confusion** — W3C changed combobox pattern significantly. Many tutorials use outdated ARIA 1.1 with `aria-owns` instead of `aria-controls`. Prevention: Follow ONLY current [W3C APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), test with NVDA/JAWS/VoiceOver from Phase 1. Role="combobox" must be on input element, not wrapper.

2. **Click-outside detection fails in Shadow DOM** — Standard `event.target !== element` fails due to event retargeting. Dropdowns close when clicking inside or fail to close when clicking outside. Prevention: Use `event.composedPath().includes(this)` instead of checking `event.target`.

3. **Multi-select form submission loses values** — `setFormValue()` accepts FormData, but `Object.fromEntries()` loses all but last value. Server receives single value instead of array. Prevention: Use `formData.append(name, value)` for each selection, server uses `getAll()` not `get()`.

4. **iOS VoiceOver ignores aria-activedescendant** — Mobile screen readers (iOS/Android) poorly support `aria-activedescendant`. Desktop works, mobile fails. Prevention: Test on real devices, consider native `<select>` fallback on mobile, ensure options are independently accessible.

5. **Async search race conditions** — User types "abc" then "abcd". "abc" results return after "abcd", overwriting correct results. Prevention: Use AbortController to cancel previous requests, debounce 300-500ms, verify query still matches before updating options.

## Implications for Roadmap

Research reveals clear dependencies and natural groupings. Architecture research identified four phases; features research confirms complexity estimates; pitfalls research highlights critical testing requirements in Phase 1.

### Phase 1: Single Select Foundation
**Rationale:** Core functionality with highest complexity. ARIA implementation and keyboard navigation are foundational requirements that all other features depend on. 13 of 18 identified pitfalls occur in this phase, requiring extra attention to accessibility and mobile testing.

**Delivers:** Production-ready single-select component with full keyboard navigation, ARIA compliance, form participation, positioning, and mobile support.

**Addresses (from FEATURES.md):**
- Single-select controlled/uncontrolled modes
- Full keyboard navigation (arrows, Enter, Escape, Home/End, type-ahead)
- Complete ARIA combobox pattern per W3C APG
- Dropdown positioning with collision detection
- Placeholder, clearable, disabled states
- Form participation via ElementInternals
- Required validation
- Size variants (sm/md/lg)
- Error state styling
- SSR compatibility

**Avoids (from PITFALLS.md):**
- Pitfall #1: ARIA 1.1 vs 1.2 confusion (use APG pattern, test early)
- Pitfall #2: Shadow DOM click-outside (use composedPath)
- Pitfall #4: Mobile aria-activedescendant (test real devices)
- Pitfall #6: Missing keyboard nav (implement full APG spec)
- Pitfall #8: CSS Anchor cross-tree (keep popup in same shadow tree)
- Pitfall #12: iOS double UI (no hidden native select)
- Pitfall #13: Sticky hover (use @media hover: hover)
- Pitfall #17: Slotted options a11y (property-based API)
- Pitfall #18: Wrong validity states (Select-specific validation)

**Stack dependencies:**
- `@floating-ui/dom` for positioning fallback
- Native Popover API + CSS Anchor Positioning (progressive enhancement)
- ElementInternals (existing pattern from Input)

### Phase 2: Multi-Select
**Rationale:** Builds on Phase 1 foundation, adds array value handling and tag display. Natural progression after single-select is stable. Two specific pitfalls (FormData handling, state restoration) unique to multi-select.

**Delivers:** Multiple selection with tag/chip display, removal interactions, overflow handling.

**Addresses (from FEATURES.md):**
- Multiple selection mode with array values
- Tag/chip display of selected items
- Tag removal (X button and backspace)
- Optional max selection limit
- Overflow collapse ("+N more")
- Option groups with labels

**Avoids (from PITFALLS.md):**
- Pitfall #3: Multi-select FormData (use FormData.append for each value)
- Pitfall #16: State restoration (handle FormData in formStateRestoreCallback)

**Stack dependencies:**
- Extends Phase 1 architecture
- Tag/chip component (new UI element)

### Phase 3: Combobox/Search
**Rationale:** Text input filtering is independent feature that can be added after selection mechanics are proven. Builds on Phase 1's keyboard navigation for filtered results.

**Delivers:** Type-to-filter functionality with customizable matching, empty states, and highlighted matches.

**Addresses (from FEATURES.md):**
- Text input for filtering options
- Default case-insensitive matching
- Custom filter function support
- Empty state ("No results found")
- Highlight matched text (differentiator)
- `aria-autocomplete` support

**Avoids (from PITFALLS.md):**
- Pitfall #5: VoiceOver with filled input (live region fallback)

**Stack dependencies:**
- Extends Phase 1 architecture
- Input element integration for search field

### Phase 4: Async Loading
**Rationale:** Most complex feature requiring Promise handling, loading states, debouncing, and race condition management. Should come after synchronous features are stable.

**Delivers:** Async options loading, debounced search, loading/error states, optional creatable mode, optional virtual scrolling.

**Addresses (from FEATURES.md):**
- Async options loading with Promise support
- Loading indicator
- Error state display
- Debounced search (150ms default)
- Optional creatable mode (add new values)
- Optional virtual scrolling for 100+ options

**Avoids (from PITFALLS.md):**
- Pitfall #10: Async race conditions (AbortController + debounce + query validation)
- Pitfall #15: No loading state (immediate indicator + live region)
- Pitfall #11: Virtualized list a11y (aria-setsize/posinset)

**Stack dependencies:**
- `@tanstack/lit-virtual` for virtual scrolling (optional)
- Lit Task controller for async state management
- IntersectionObserver for infinite scroll

### Phase Ordering Rationale

- **Dependencies flow naturally:** Phase 2-4 all depend on Phase 1's foundation (ARIA, keyboard, positioning). Phase 3 and 4 are independent and could be reversed, but async is more complex and benefits from combobox input integration being proven first.
- **Risk management:** Highest-risk items (ARIA, Shadow DOM, mobile) are in Phase 1 where they can be addressed before building on them. 13 of 18 pitfalls occur in Phase 1, requiring extra attention and testing.
- **User value delivery:** Each phase delivers a complete, usable feature increment. Phase 1 alone provides a production-ready select component. Phases 2-4 are additive enhancements.
- **Testing strategy:** Accessibility testing (screen readers, keyboard-only, mobile) must start in Phase 1 and continue through all phases. Virtual scrolling (Phase 4) adds new accessibility concerns (aria-setsize, posinset) that need verification.

### Research Flags

**Phases with well-documented patterns (skip additional research):**
- **Phase 1:** W3C APG provides complete specification for ARIA combobox pattern. Floating UI documentation is comprehensive. Existing LitUI patterns cover ElementInternals and SSR.
- **Phase 2:** Multi-select is standard pattern with MDN documentation for FormData handling. Tag/chip UI is straightforward.
- **Phase 3:** String filtering algorithms are well-understood. Input integration follows existing patterns.

**Phases needing validation during implementation:**
- **Phase 1 (Mobile):** Despite research, iOS-specific issues may surface requiring device testing. Consider `/gsd:research-phase` if iOS double-UI problem appears.
- **Phase 4 (Virtual scrolling):** TanStack Virtual's Lit integration is documented but not widely adopted. May need `/gsd:research-phase` if integration issues arise.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified via npm registry, Floating UI and TanStack Virtual have stable APIs and active maintenance. Browser support data from CanIUse is authoritative. |
| Features | HIGH | Analysis of 6 major UI libraries (shadcn, Radix, Headless UI, MUI, Chakra, Ariakit) shows strong consensus on table stakes and differentiators. W3C APG provides authoritative feature requirements. |
| Architecture | HIGH | Based on existing LitUI patterns (Input, Dialog, Button), W3C APG specifications, and Lit official documentation. Component composition pattern is proven in multiple frameworks. |
| Pitfalls | HIGH | All 18 pitfalls sourced from W3C specifications, MDN documentation, official Chrome/webkit blogs, and expert articles (Sarah Higley, etc.). Cross-referenced with real-world issues from GitHub discussions. |

**Overall confidence:** HIGH

### Gaps to Address

While research confidence is high, some areas need validation during implementation:

- **iOS VoiceOver behavior with filled input** — Pitfall #5 has medium confidence. The workaround (live region fallback) needs testing with real devices to verify effectiveness. Consider user testing in Phase 1.
- **CSS Anchor Positioning browser support evolution** — Currently 76% support. Monitor browser releases during implementation. Fallback to Floating UI is proven, but may want to increase threshold before relying on native positioning.
- **Virtual scrolling accessibility** — TanStack Virtual's accessibility approach (aria-setsize/posinset) is theoretically correct but needs validation with actual screen readers. Plan extra testing time in Phase 4 if virtualization is implemented.
- **Mobile native select fallback decision** — Research suggests considering native `<select>` on iOS/Android due to touch-optimized UI and better accessibility. This is a UX decision requiring stakeholder input in Phase 1. Could be implemented as `nativeMobile` prop for progressive enhancement.
- **Popover API adoption** — Currently 90% support. Verify this meets LitUI's browser support policy. If supporting older browsers is critical, may need to rely more heavily on manual dropdown management (still using Floating UI).

## Sources

### Primary (HIGH confidence)

**Official Standards:**
- [W3C ARIA APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) - ARIA structure, keyboard requirements
- [W3C ARIA APG Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) - Option navigation
- [W3C ARIA APG Select-Only Combobox Example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) - Implementation reference
- [MDN ARIA combobox role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/combobox_role) - Browser support
- [MDN aria-activedescendant](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-activedescendant) - Focus management
- [MDN ElementInternals.setFormValue()](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue) - Form API
- [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) - Native popover

**Browser Vendors:**
- [Chrome Developers: Top Layer](https://developer.chrome.com/blog/what-is-the-top-layer) - Popover positioning
- [Chrome Blog: Web UI 2025](https://developer.chrome.com/blog/new-in-web-ui-io-2025-recap) - CSS Anchor + Popover updates
- [WebKit ElementInternals](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) - Safari implementation

**Library Documentation:**
- [Floating UI - Getting Started](https://floating-ui.com/docs/getting-started) - Positioning library
- [Floating UI - Platform (Shadow DOM)](https://floating-ui.com/docs/platform) - Shadow DOM support
- [TanStack Virtual](https://tanstack.com/virtual/latest) - Virtual scrolling
- [Lit Task Controller](https://lit.dev/docs/data/task/) - Async data pattern
- [Lit Reactive Controllers](https://lit.dev/docs/composition/controllers/) - Controller architecture

**Browser Support:**
- [CanIUse: CSS Anchor Positioning](https://caniuse.com/css-anchor-positioning) - 76.17%
- [CanIUse: Popover API](https://caniuse.com/mdn-api_htmlelement_popover) - 89.66%

### Secondary (MEDIUM-HIGH confidence)

**Expert Articles:**
- [Sarah Higley: aria-activedescendant is not focus](https://sarahmhigley.com/writing/activedescendant/) - Mobile a11y concerns
- [OddBird: Anchor Positioning Updates](https://www.oddbird.net/2025/10/13/anchor-position-area-update/) - CSS Anchor evolution
- [HTMHell: Top Layer Troubles](https://www.htmhell.dev/adventcalendar/2025/1/) - Popover + Dialog interactions
- [Hidde de Vries: Positioning Anchored Popovers](https://hidde.blog/positioning-anchored-popovers/) - CSS Anchor patterns
- [Frontend Masters: Popover API Guide](https://frontendmasters.com/blog/menus-toasts-and-more/) - Modern popover patterns
- [Shadow DOM Events](https://javascript.info/shadow-dom-events) - Event retargeting
- [Lamplightdev: Click Outside Web Component](https://lamplightdev.com/blog/2021/04/10/how-to-detect-clicks-outside-of-a-web-component/) - composedPath pattern
- [Zell Liew: Element Focus vs aria-activedescendant](https://zellwk.com/blog/element-focus-vs-aria-activedescendant/) - VoiceOver bug
- [CSS-Tricks: Custom Form Controls with ElementInternals](https://css-tricks.com/creating-custom-form-controls-with-elementinternals/) - Form integration

**UI Library Documentation:**
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/select) - React implementation
- [shadcn/ui Combobox](https://ui.shadcn.com/docs/components/combobox) - Search patterns
- [Radix UI Select Primitive](https://www.radix-ui.com/primitives/docs/components/select) - Accessibility approach
- [Headless UI Listbox](https://headlessui.com/react/listbox) - Keyboard navigation
- [Headless UI Combobox](https://headlessui.com/react/combobox) - Filtering patterns
- [MUI Autocomplete](https://mui.com/material-ui/react-autocomplete/) - Feature completeness
- [Ariakit Select](https://ariakit.org/components/select) - ARIA implementation
- [Ariakit Combobox](https://ariakit.org/reference/combobox) - Component composition

**UX Research:**
- [Baymard: Drop-Down Usability](https://baymard.com/blog/drop-down-usability) - Pre-selection pitfalls
- [Nielsen Norman Group: Dropdown Guidelines](https://www.nngroup.com/articles/drop-down-menus/) - Interaction patterns
- [24 Accessibility: Select Testing Research](https://www.24a11y.com/2019/select-your-poison-part-2/) - Screen reader testing
- [Orange A11y: Listbox Keyboard Navigation](https://a11y-guidelines.orange.com/en/articles/listbox-and-keyboard-navigation/) - Keyboard patterns

### Tertiary (MEDIUM confidence - community issues, requires validation)

**Community Discussions:**
- [Shoelace Multi-select FormData Discussion #1799](https://github.com/shoelace-style/shoelace/discussions/1799) - FormData patterns
- [react-select iOS Issue #904](https://github.com/JedWatson/react-select/issues/904) - Mobile double UI
- [Fluent UI Mobile Combobox #15779](https://github.com/microsoft/fluentui/issues/15779) - Opening behavior
- [shadcn/ui Discussion #1391](https://github.com/shadcn-ui/ui/issues/1391) - Loading states
- [Headless UI Combobox Async Discussion #2788](https://github.com/tailwindlabs/headlessui/discussions/2788) - Async patterns
- [Radix UI Combobox Issue #1342](https://github.com/radix-ui/primitives/issues/1342) - Feature request
- [W3C Web Components CG 2023](https://w3c.github.io/webcomponents-cg/2023.html) - Cross-root ARIA

**Performance/Virtual Scrolling:**
- [Cory Rylan: High Performance Tables with Lit and Virtual Scrolling](https://coryrylan.com/blog/high-performance-html-tables-with-lit-and-virtual-scrolling) - TanStack integration
- [Syncfusion Blazor ComboBox Virtualization](https://blazor.syncfusion.com/documentation/combobox/virtualization) - Patterns
- [Telerik Blazor ComboBox Virtualization](https://www.telerik.com/blazor-ui/documentation/components/combobox/virtualization) - Performance

---
*Research completed: 2026-01-26*
*Ready for roadmap: yes*
