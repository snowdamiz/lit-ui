# Project Research Summary

**Project:** LitUI v4.2 - Form Controls Milestone (Checkbox, Radio, Switch)
**Domain:** Web component toggle controls with group containers
**Researched:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

This research covers the v4.2 milestone: building production-ready Checkbox, Radio, and Switch components for the LitUI web component library. These are fundamentally simpler than the v4.1 Select component -- they require no positioning logic, no virtualization, and no async operations. **Zero new npm dependencies are needed.** All animation is achievable with pure CSS transitions, and all form participation uses the existing ElementInternals pattern already proven in Button, Input, Textarea, and Select.

The recommended architecture follows established LitUI patterns: three separate packages (`@lit-ui/checkbox`, `@lit-ui/radio`, `@lit-ui/switch`), each extending TailwindElement and using form-associated custom elements. The critical architectural insight is that RadioGroup must own form participation (not individual radios) because native radio mutual exclusion breaks across Shadow DOM boundaries. CheckboxGroup is simpler -- it's a layout/accessibility container only, with each checkbox managing its own form value. Switch is fully standalone with no group needed.

The primary risks are cross-Shadow-DOM challenges inherent to web components: radio grouping requires explicit state management by RadioGroup, roving tabindex must operate on host elements (not shadow internals), and ARIA ID references like `aria-controls` cannot cross shadow boundaries. All of these have proven solutions documented in the W3C APG and reference implementations like Google's HowTo Components. Implementation order matters: build Switch first (simplest standalone pattern), then Checkbox/CheckboxGroup (introduces group communication without form ownership complexity), then Radio/RadioGroup last (combines group communication with form ownership and roving tabindex navigation).

## Key Findings

### Recommended Stack

**Verdict: Zero new dependencies required.** All capabilities needed for Checkbox, Radio, and Switch exist in the current stack: Lit 3.3.2, TailwindElement from `@lit-ui/core`, ElementInternals for form participation, and CSS transitions for animation. No positioning libraries (Floating UI), no virtualization (TanStack Virtual), no async task management.

**Core technologies (all existing):**
- **Lit 3.3.2**: Component framework with `html`, `css`, `svg` template literals, reactive properties, Shadow DOM
- **@lit-ui/core TailwindElement**: Base class providing Tailwind utility injection, design token system, dispatchCustomEvent helper
- **ElementInternals**: Form-associated custom elements API for form submission, validation, reset lifecycle (pattern established in Input/Select)
- **CSS transitions**: GPU-composited animations for checkbox checkmark draw (`stroke-dashoffset`), radio dot scale (`transform: scale`), switch thumb slide (`transform: translateX`)
- **TypeScript 5.9.3**: Type safety for component properties and DOM interactions

**CSS animation techniques (no JS libraries):**
- Checkbox: SVG `<polyline>` with `stroke-dasharray`/`stroke-dashoffset` animation for checkmark drawing (150ms + 50ms delay after box fill)
- Radio: CSS `transform: scale(0)` to `scale(1)` on inner dot element (150ms)
- Switch: CSS `transform: translateX()` on thumb element (150ms), simultaneous `background-color` transition on track

**Package structure:** Three new packages following existing convention (mirroring `@lit-ui/input`, `@lit-ui/button`):
- `@lit-ui/checkbox` contains `lui-checkbox` + `lui-checkbox-group`
- `@lit-ui/radio` contains `lui-radio` + `lui-radio-group`
- `@lit-ui/switch` contains `lui-switch` only

Each package has zero runtime dependencies -- only peer dependencies on `lit ^3.0.0` and `@lit-ui/core ^1.0.0`.

### Expected Features

**Must have (table stakes):**

**Checkbox:**
- Checked/unchecked toggle with `checked` boolean property
- Indeterminate (tri-state) state for "select all" parent checkboxes (set via JS only, matches native behavior)
- Form participation via ElementInternals: `name`, `value`, submit when checked
- `required` validation via `setValidity({ valueMissing })`
- Size variants (sm/md/lg) matching existing LitUI convention
- `role="checkbox"` with `aria-checked="true|false|mixed"`
- Space key toggles (not Enter -- per W3C APG spec)
- CSS design tokens following `--ui-checkbox-*` pattern

**CheckboxGroup:**
- Group label with `role="group"` and `aria-labelledby`
- Vertical layout by default
- Optional group-level required validation ("at least one must be checked")
- Error message display matching Input/Select pattern
- NOT form-associated -- each child checkbox submits independently

**Radio:**
- Checked/unchecked state with mutual exclusion managed by parent group
- `value` attribute identifying which option is selected
- Size variants, label support, disabled state
- `role="radio"` with `aria-checked="true|false"` (no mixed state)
- Individual radios are NOT form-associated

**RadioGroup:**
- Mutual exclusion (checking one unchecks all siblings) -- CRITICAL because native radio grouping breaks across Shadow DOM
- Arrow key navigation with roving tabindex (Up/Left = previous, Down/Right = next, with wrapping)
- `role="radiogroup"` with `aria-labelledby`
- Group IS form-associated, submits selected radio's value
- `required` validation, `name` attribute, `value` property reflecting current selection

**Switch:**
- On/off toggle with `checked` boolean property
- Track + thumb visual (thumb slides left/right)
- Form participation (like individual checkbox)
- `role="switch"` with `aria-checked="true|false"` (no mixed state -- distinct from checkbox semantics)
- Space key toggles (Enter optional but recommended)
- Size variants, CSS design tokens following `--ui-switch-*` pattern

**Should have (competitive differentiators):**
- Animated check transition for checkbox (SVG stroke-dashoffset draw-in)
- Animated radio selection transition (scale transform on dot)
- Animated switch thumb slide (translateX with track color cross-fade)
- `defaultChecked` property for proper form reset behavior
- CSS parts for deep styling (`::part(box)`, `::part(track)`, etc.)
- Help text below controls with `aria-describedby`
- Horizontal layout option for groups (`orientation="horizontal"`)

**Defer to v2+:**
- Select all/none helper (tri-state parent checkbox managing group) -- high complexity, niche use case
- Radio button variant (pill/segmented button style) -- high complexity, defer
- Switch loading state (async operations) -- nice-to-have, can add later
- Min/max validation on CheckboxGroup -- uncommon requirement
- Custom thumb content slot on Switch (icons inside thumb) -- advanced theming

### Architecture Approach

The architecture follows Lit's "properties down, events up" pattern with slot-based parent-child communication, proven in the existing `lui-select` / `lui-option` implementation.

**Major components and responsibilities:**

1. **Individual Toggle Controls** (Checkbox, Radio, Switch) -- Each extends TailwindElement, implements ElementInternals (except Radio), handles keyboard interaction, emits `ui-change` events. Radio is NOT form-associated individually because it depends on group for mutual exclusion.

2. **CheckboxGroup** -- Layout and accessibility container only. Discovers children via `slotchange`, can propagate disabled/size properties, optionally validates "at least N checked." NOT form-associated -- children submit independently.

3. **RadioGroup** -- Owns all state and behavior: form participation (form-associated), mutual exclusion logic (unchecks siblings when one is checked), roving tabindex management (only one radio has `tabindex="0"` at a time), arrow key navigation with wrapping. Discovers children via `slotchange`, sets properties imperatively, listens for `ui-radio-change` events.

**Parent-child communication pattern:**
1. Child discovery via `slotchange` event (same as Select uses for Options)
2. Properties down: parent sets properties directly on child elements (`radio.checked = true`)
3. Events up: children dispatch `composed: true` custom events that bubble to parent (`ui-radio-change`)

**Form ownership:** RadioGroup is form-associated and calls `setFormValue()` with the selected radio's value. Individual radios are presentational. This is the key architectural decision that solves the "radio buttons in Shadow DOM break native grouping" problem.

**Keyboard navigation:** RadioGroup uses roving tabindex on host elements (not shadow DOM internals). Only the checked radio (or first if none checked) has `tabindex="0"`. Arrow keys move focus AND selection simultaneously with wrapping. CheckboxGroup uses standard tabbing (each checkbox is independently focusable).

**Shared patterns:** All three toggle controls share similar property surfaces (checked, disabled, required, name, value, label, size) but do NOT use a shared mixin/base class. LitUI deliberately avoids mixins to keep components self-contained for CLI copy-source mode. Small duplication is acceptable.

### Critical Pitfalls (Top 5 for Phase 1)

1. **Radio Buttons as Separate Web Components Break Native Grouping** -- Shadow DOM encapsulation prevents native radio mutual exclusion. Multiple radios can be checked simultaneously, arrow keys fail, FormData contains conflicts. **Prevention:** RadioGroup is the form-associated element with `formAssociated = true`. Individual radios are presentational children. Group manages `setFormValue()` with selected value.

2. **Roving Tabindex Fails When Radio Items Are in Separate Shadow DOMs** -- Shadow boundaries prevent parent from manipulating tabindex on elements inside children's shadow roots. **Prevention:** Manage tabindex on host elements (the `<lui-radio>` custom elements themselves), not shadow internals. Use `delegatesFocus: true` on radio components. Arrow keys MUST wrap (first to last, last to first).

3. **aria-controls on Mixed-State Checkbox Cannot Cross Shadow DOM Boundaries** -- ARIA ID references (`aria-controls`, `aria-labelledby`) are scoped to their DOM tree, cannot cross shadow boundaries. Parent "select all" checkbox cannot reference child checkboxes. **Prevention:** Keep parent and children in the same DOM tree, or skip `aria-controls` entirely (has poor screen reader support anyway). Rely on clear labeling instead.

4. **role="switch" Screen Reader Inconsistency** -- `role="switch"` is not consistently announced. VoiceOver and NVDA often announce switches as "checkboxes." **Prevention:** Still use `role="switch"` (correct semantics, improving support). Never use `aria-checked="mixed"` on switches (spec forbids it). Test with VoiceOver+Safari, NVDA+Chrome, TalkBack+Chrome. Use visual design (sliding thumb) to reinforce toggle semantics.

5. **Checkbox Group Form Submission Loses Unchecked Values** -- Native checkboxes submit nothing when unchecked. `setFormValue(null)` removes field from FormData entirely. Server-side code expecting field presence fails. **Prevention:** Decide on submission model early: (1) submit only checked values (matches native), or (2) always submit, empty string when none checked (developer-friendly). Document the chosen approach.

**Additional critical considerations:**
- Indeterminate state is visual/ARIA only (`aria-checked="mixed"`), never a submitted form value
- Radio group arrow keys change selection AND move focus (unlike checkbox groups where arrow keys only move focus)
- Missing form lifecycle callbacks (`formResetCallback`, `formDisabledCallback`, `formStateRestoreCallback`) breaks form reset and bfcache
- Switch animation must respect `prefers-reduced-motion` for WCAG 2.3.3 compliance

## Implications for Roadmap

Based on research, suggested phase structure (3 phases):

### Phase 1: Switch Component (Standalone Fundamentals)
**Rationale:** Switch is the simplest toggle control -- fully standalone, no group coordination needed, no mutual exclusion logic. Validates the toggle visual pattern (track + thumb CSS animation), form participation pattern (ElementInternals), and ARIA semantics (`role="switch"`) before tackling more complex group components.

**Delivers:**
- Complete `@lit-ui/switch` package with `lui-switch` element
- Form-associated custom element with ElementInternals
- CSS `transform: translateX()` animation for thumb slide
- Size variants (sm/md/lg) and design tokens
- ARIA `role="switch"` with `aria-checked`
- Space/Enter keyboard support
- `prefers-reduced-motion` support
- Form lifecycle callbacks (reset, disabled, restore)

**Addresses from FEATURES.md:**
- Table stakes: on/off toggle, track + thumb visual, disabled state, form participation, size variants, keyboard interaction
- Differentiators: animated slide transition, CSS parts for styling

**Avoids from PITFALLS.md:**
- Pitfall 4: role="switch" screen reader inconsistency (test across SR/browser combos)
- Pitfall 9: missing `prefers-reduced-motion` (include from start)
- Pitfall 10: missing form lifecycle callbacks (copy pattern from Input)
- Pitfall 12: dynamic switch labels (document: labels describe setting, not action)
- Pitfall 15: missing `delegatesFocus` (set in shadowRootOptions)

**Testing requirements:** Switch is a new ARIA role for LitUI. Must test with VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android) to verify announcement behavior. Document observed inconsistencies.

### Phase 2: Checkbox + CheckboxGroup (Parent-Child Communication)
**Rationale:** Checkbox standalone works like Switch (same form participation pattern). CheckboxGroup introduces slot-based child discovery and parent-child communication without the complexity of form ownership (children are independently form-associated). This establishes the group communication pattern before tackling RadioGroup's form ownership.

**Delivers:**
- Complete `@lit-ui/checkbox` package with `lui-checkbox` and `lui-checkbox-group` elements
- Checkbox: checked/unchecked, indeterminate tri-state, form participation, `role="checkbox"`
- SVG checkmark animation with `stroke-dashoffset` (draw-in effect)
- CheckboxGroup: slot discovery, `role="group"`, optional aggregate validation (min/max selections)
- Vertical/horizontal layout options
- Group propagation of disabled/size to children

**Addresses from FEATURES.md:**
- Table stakes: checked/unchecked/indeterminate, form submission, required validation, size variants, ARIA semantics, Space key toggle
- CheckboxGroup: group label, layout, error display, disabled propagation
- Differentiators: animated check transition, `defaultChecked`, CSS parts, help text

**Avoids from PITFALLS.md:**
- Pitfall 3: `aria-controls` cross-shadow boundary (skip `aria-controls` for select-all pattern, use clear labeling)
- Pitfall 5: checkbox group form submission model (document: each checkbox submits independently)
- Pitfall 6: indeterminate as form value (document: mixed is visual/ARIA only)
- Pitfall 11: missing group role/label (add `role="group"` with `aria-labelledby` from start)

**Dependencies:** Builds on Switch's form participation pattern. Uses same ElementInternals approach, same event naming convention (`ui-change`), same CSS animation timing.

**Research flags:** Indeterminate state and parent-child checkbox relationships have nuanced ARIA semantics. Reference W3C APG mixed-state checkbox example during implementation. Consider deferring "select all/none" helper to post-MVP (listed as high complexity differentiator).

### Phase 3: Radio + RadioGroup (Form Ownership + Roving Tabindex)
**Rationale:** Radio is the most complex component due to RadioGroup owning form participation AND managing mutual exclusion AND implementing roving tabindex keyboard navigation. Benefits from lessons learned in CheckboxGroup's slot communication pattern. Must be built last because it combines all complexity.

**Delivers:**
- Complete `@lit-ui/radio` package with `lui-radio` and `lui-radio-group` elements
- RadioGroup: form-associated, owns form value submission
- Mutual exclusion logic (checking one radio unchecks all siblings)
- Roving tabindex navigation (only one radio focusable at a time)
- Arrow key navigation (Up/Left = previous, Down/Right = next) with wrapping
- `role="radiogroup"` on group, `role="radio"` on children
- Space key checks focused radio

**Addresses from FEATURES.md:**
- Table stakes: checked state, value attribute, mutual exclusion, arrow key navigation with roving tabindex, form participation (group owns), required validation
- Differentiators: animated selection transition (scale transform), CSS parts, horizontal layout option

**Avoids from PITFALLS.md:**
- Pitfall 1: separate radio web components break grouping (group is form-associated, radios are presentational)
- Pitfall 2: roving tabindex across shadow boundaries (manage on host elements, arrow keys wrap)
- Pitfall 7: radio vs checkbox keyboard differences (arrows change selection in radio, only move focus in checkbox)
- Pitfall 8: avoid `aria-activedescendant` for radio group (use roving tabindex, not activedescendant)

**Uses from STACK.md:**
- ElementInternals for RadioGroup form participation
- Slot discovery pattern from CheckboxGroup
- CSS `transform: scale()` animation for radio dot
- `dispatchCustomEvent` from `@lit-ui/core` for `ui-radio-change` internal event

**Implements from ARCHITECTURE.md:**
- Group owns form value (calls `setFormValue()`)
- Roving tabindex on host elements via `updateTabindex()` method
- Keyboard handler on group container, not individual radios
- Arrow keys wrap at boundaries

**Testing requirements:** Roving tabindex is a new navigation pattern for LitUI. Must test keyboard navigation thoroughly (arrow wrapping, disabled skipping, Tab exit). Test with screen readers to verify "X of Y" position announcements and group context.

**Research flags:** Roving tabindex keyboard navigation is well-documented in W3C APG but new to this codebase. Reference W3C APG Radio Group example and Google HowTo Radio Group implementation during development. Consider creating keyboard nav utility if complexity warrants extraction.

### Phase Ordering Rationale

- **Switch first** because it's fully standalone with zero group complexity. Establishes toggle form participation, CSS animation, and ARIA semantics foundation.
- **Checkbox second** because CheckboxGroup introduces parent-child slot communication without form ownership complexity. Each checkbox manages its own form value, making the group a simpler coordination container.
- **Radio last** because RadioGroup combines group communication (from CheckboxGroup) with form ownership (new) AND roving tabindex navigation (new). It's the most complex integration.

This ordering allows incremental complexity addition: standalone toggle → group coordination → group + form ownership + advanced keyboard nav.

Each phase is independently shippable and valuable. Users can consume Switch alone, or Switch + Checkbox, or all three.

### Research Flags

**Phases needing focused implementation research:**
- **Phase 2 (Indeterminate):** W3C APG mixed-state checkbox example should be referenced for tri-state semantics. Consider whether parent "select all" checkbox belongs in Phase 2 or deferred to v4.3.
- **Phase 3 (Roving Tabindex):** First implementation of roving tabindex in LitUI. Reference W3C APG keyboard practices and Google HowTo Radio Group code. May warrant keyboard navigation utility abstraction if other components need this pattern.

**Phases with standard patterns (minimal additional research):**
- **Phase 1 (Switch):** Straightforward form participation and CSS animation. Pattern established in Input/Select.
- **Phase 2 (Checkbox standalone):** Form participation matches Switch pattern exactly.
- **Phase 2 (CheckboxGroup):** Slot discovery matches Select/Option pattern.

**Cross-phase considerations:**
- Shadow DOM + ARIA challenges are consistent across all phases. Keep ARIA ID references in same DOM tree or avoid them.
- Form lifecycle callbacks must be implemented in Phase 1 and copied to Phases 2-3.
- Animation `prefers-reduced-motion` support must be in Phase 1 and copied to Phases 2-3.
- Test coverage for screen readers should be established in Phase 1 and reused in later phases.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new dependencies needed. All capabilities (Lit, ElementInternals, CSS transitions) proven in existing components. |
| Features | HIGH | W3C APG patterns are stable, well-documented standards. Shoelace provides production reference implementations. |
| Architecture | HIGH | Package structure, parent-child communication, form ownership decisions all follow established LitUI patterns or proven web component practices. |
| Pitfalls | HIGH | Cross-Shadow-DOM ARIA challenges are well-documented by experts (Nolan Lawson, Adrian Roselli, Alice Boxhall). Solutions proven in Google HowTo Components. |

**Overall confidence:** HIGH

### Gaps to Address

**Screen reader support variability for role="switch":**
- Research documents inconsistent switch announcements across SR/browser combos
- VoiceOver and NVDA often announce switches as "checkboxes"
- **Mitigation:** Document observed behavior in component API docs. Ensure visual design clearly communicates toggle semantics. Still use `role="switch"` (correct semantics, support improving).

**Indeterminate checkbox "select all" pattern:**
- Research confirms the pattern exists and ARIA semantics are clear
- Implementation complexity is high (listed as Phase 4 or defer)
- **Mitigation:** Implement basic indeterminate state in Phase 2 (tri-state property, mixed aria-checked, dash icon). Defer parent-child "select all" coordination to post-MVP unless users strongly request it.

**Roving tabindex keyboard navigation:**
- Pattern is well-documented but new to this codebase
- Arrow key wrapping and disabled item skipping need careful implementation
- **Mitigation:** Reference W3C APG example code directly. Add comprehensive keyboard navigation tests. Consider extracting reusable utility if pattern is needed elsewhere (unlikely for v4.2 scope).

**CSS animation timing:**
- Research provides specific durations (150ms base, 200ms for checkbox with 50ms delay) based on existing Button transition patterns
- Actual perceived quality needs user testing
- **Mitigation:** Start with researched timings. Add CSS custom properties for transition durations so consumers can tune. Gather feedback during beta.

## Sources

### Primary (HIGH confidence)
- [W3C WAI-ARIA APG: Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) -- ARIA roles, keyboard interaction, indeterminate state
- [W3C WAI-ARIA APG: Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) -- Roving tabindex specification, mutual exclusion, arrow key wrapping
- [W3C WAI-ARIA APG: Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) -- role="switch" vs role="checkbox" semantics, aria-checked values
- [MDN: ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) -- Form-associated custom elements API, setFormValue, lifecycle callbacks
- [MDN: ElementInternals.ariaChecked](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/ariaChecked) -- Setting ARIA checked state via ElementInternals
- [WebKit: ElementInternals and Form-Associated Custom Elements](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) -- Form participation patterns, lifecycle callbacks
- [Shoelace: Checkbox](https://shoelace.style/components/checkbox), [Radio](https://shoelace.style/components/radio), [Switch](https://shoelace.style/components/switch) -- Production reference implementations
- Existing LitUI codebase: `packages/input/src/input.ts`, `packages/select/src/select.ts`, `packages/core/src/tailwind-element.ts` -- Established patterns for ElementInternals, slot communication, TailwindElement

### Expert Articles (HIGH confidence)
- [Adrian Roselli: Switch Role Support](https://adrianroselli.com/2021/10/switch-role-support.html) -- Screen reader support matrix for role="switch"
- [Nolan Lawson: Shadow DOM and Accessibility](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) -- Cross-root ARIA problem documentation
- [Alice Boxhall: Shadow DOM and Accessibility in Conflict](https://alice.pages.igalia.com/blog/how-shadow-dom-and-accessibility-are-in-conflict/) -- aria-controls, aria-labelledby cross-boundary challenges
- [Google HowTo Components: Radio Group](https://googlechromelabs.github.io/howto-components/howto-radio-group/) -- Reference implementation of roving tabindex and group form ownership
- [Kitty Giraudel: Accessible Toggle](https://kittygiraudel.com/2021/04/05/an-accessible-toggle/) -- prefers-reduced-motion pattern for switch animation
- [Benny Powers: Form-Associated Custom Elements](https://bennypowers.dev/posts/form-associated-custom-elements/) -- ElementInternals patterns, form lifecycle

### Implementation References (MEDIUM-HIGH confidence)
- [MDN: Using CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using) -- GPU-composited animation techniques
- [Modern CSS Solutions: Pure CSS Custom Styled Radio Buttons](https://moderncss.dev/pure-css-custom-styled-radio-buttons/) -- Scale transform technique for radio dot
- [Go Make Things: Creating a Toggle Switch with CSS](https://gomakethings.com/creating-a-toggle-switch-with-just-css/) -- translateX pattern for switch thumb
- [Fluent UI: ElementInternals Radio/RadioGroup PR](https://github.com/microsoft/fluentui/pull/31783) -- RadioGroup with ElementInternals pattern
- [Noah Liebman: Radio Button Web Component](https://noahliebman.net/2023/12/radio-button-with-host-has/) -- Documents Shadow DOM radio pitfall

---
**Research completed:** 2026-01-26
**Ready for roadmap:** Yes
**Dependencies resolved:** Yes (zero new dependencies required)
**Critical risks identified:** Yes (5 critical pitfalls with prevention strategies)
**Phase suggestions:** 3 phases (Switch → Checkbox/CheckboxGroup → Radio/RadioGroup)
