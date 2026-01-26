# Project Research Summary

**Project:** LitUI v4.0 Form Inputs
**Domain:** Lit.js Web Components - Form Input Elements
**Researched:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

Form input components for Lit.js web components are well-understood with clear implementation patterns. The existing LitUI architecture provides everything needed: TailwindElement base class, ElementInternals pattern (proven in Button), and SSR support. Input and Textarea components follow native HTML closely, delegating validation to internal native elements and syncing ValidityState to ElementInternals for form participation.

The recommended approach is to wrap native `<input>` and `<textarea>` elements inside Shadow DOM, forward all validation attributes, and use ElementInternals API for form value management and validation. This delivers zero-bundle-size validation using browser APIs, works across all frameworks, and requires no new dependencies beyond the existing stack. The key architectural insight is delegation: let native inputs handle constraint validation, then mirror their ValidityState to ElementInternals.

Critical risks center on validation UX patterns (when to show errors), auto-resize complexity for Textarea, and ensuring SSR compatibility with attachInternals guards. These are all mitigated through established patterns already validated in Button component and documented in web component best practices.

## Key Findings

### Recommended Stack

**No new dependencies required.** The existing stack provides complete coverage for form input components with built-in validation.

**Core technologies:**
- **Lit ^3.3.2**: Web component framework — already in use, no changes needed
- **TailwindElement (@lit-ui/core)**: Base class with SSR support — proven pattern from Button/Dialog
- **ElementInternals (native)**: Form participation and validation — proven in Button, extends naturally to inputs
- **Native Constraint Validation**: Built-in HTML5 validation APIs — zero bundle cost, framework-agnostic
- **TypeScript ^5.9.3**: Type safety — existing tooling

**Key validation pattern:**
Wrap a native `<input>` or `<textarea>` in Shadow DOM. Forward validation attributes (required, minlength, pattern, etc.) to internal element. On value changes, sync internal element's `validity` property to ElementInternals via `setValidity()`. Pass internal element as anchor parameter for correct popup positioning.

**Rejected alternatives:**
- @open-wc/form-control: Stale (2+ years), adds abstraction without value
- Schema validation libraries (Zod/Yup): Consumer responsibility, not component concern
- Custom FormControlController: Over-engineering for 2 components; extract later if pattern reused across 3+ components

### Expected Features

**Must have (table stakes):**
- Core input types: text, email, password, number, search
- Form participation via ElementInternals (setFormValue, setValidity)
- Native validation attributes: required, minlength, maxlength, pattern, min, max, step
- Size variants (sm/md/lg) matching existing Button sizing
- Visual states: default, focus, hover, disabled, readonly, error
- Focus ring styling matching Button pattern
- Dark mode support via existing `:host-context(.dark)` pattern
- SSR compatibility with `isServer` guards
- Label association via aria-labelledby
- Value binding with input/change events
- Textarea: multi-line input, rows control, resize property

**Should have (competitive advantage):**
- Password visibility toggle (eye icon, accessible)
- Search clear button (X icon when value non-empty)
- Prefix/suffix slots for icons/buttons
- Character counter for maxlength fields
- Inline validation timing (validate on blur, not every keystroke)
- Auto-resize textarea (CSS field-sizing with bounds)
- Custom validation messages (override browser defaults)

**Defer (v2+ or anti-features):**
- Integrated label component (breaks composition; use separate Label or slot)
- Automatic error message display (opinionated layout; emit events instead)
- Input masking (complex edge cases; recommend external library)
- Rich text/markdown in Textarea (different component entirely)
- Date/time/color/range input types (need dedicated picker components)
- Floating labels (accessibility concerns, animation complexity)

### Architecture Approach

Input and Textarea integrate cleanly with existing LitUI patterns. Both extend TailwindElement, use ElementInternals for form association, and follow the SSR-safe pattern from Button. The validation strategy delegates to native elements: internal `<input>`/`<textarea>` handles constraint validation, component mirrors its ValidityState to ElementInternals.

**Major components:**
1. **lui-input** (@lit-ui/input package) — Single-line text input supporting 5 types (text, email, password, number, search), sizes, validation, form participation
2. **lui-textarea** (@lit-ui/textarea package) — Multi-line text input with optional auto-resize, same validation/form patterns as Input
3. **CSS tokens addition** (@lit-ui/core) — `--ui-input-*` and `--ui-textarea-*` custom properties following existing theme system

**Data flow:**
```
User types → Internal <input> updates value → Component sets internals.setFormValue(value)
→ Component syncs internals.setValidity(flags) from input.validity
→ Parent form includes value in FormData
→ Form validation includes component
→ Component emits ui-input/ui-change events
```

**Component boundaries:**
- Input/Textarea: Value management, validation sync, event emission
- ElementInternals: Form value transmission, validity state, lifecycle callbacks
- @lit-ui/core: Base class, Tailwind injection, theme tokens
- Native browser: Constraint validation logic, error messages, popup positioning

### Critical Pitfalls

1. **Tailwind CSS fails inside Shadow DOM** — Already solved in existing codebase via constructable stylesheets in TailwindElement. Input/Textarea inherit this solution automatically by extending TailwindElement. No action needed for this milestone.

2. **ElementInternals crashes in SSR** — Guard `attachInternals()` with `if (!isServer)` check. Pattern proven in Button component. Apply same pattern to Input/Textarea constructors and form lifecycle callbacks.

3. **Validation state out of sync** — Sync internal input's ValidityState to ElementInternals on every value change. Must copy all flags (valueMissing, typeMismatch, patternMismatch, tooShort, tooLong, rangeUnderflow, rangeOverflow, stepMismatch, badInput). Pass internal input as anchor parameter to position native validation popup correctly.

4. **Form reset doesn't clear input** — Implement `formResetCallback()` lifecycle method to reset value to default. Also implement `formStateRestoreCallback()` for browser back/forward navigation autofill support.

5. **Auto-resize textarea performance** — CSS `field-sizing: content` is ideal but browser support incomplete (Chrome/Edge only as of 2026). Fallback: ResizeObserver pattern with debouncing, or accept manual resize. Recommend manual resize for MVP, add auto-resize as enhancement.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: CSS Tokens Foundation
**Rationale:** Input/Textarea styling depends on theme tokens. Must exist before component implementation begins.
**Delivers:** `--ui-input-*` and `--ui-textarea-*` CSS custom properties in @lit-ui/core
**Addresses:** Theme system consistency (feature requirement)
**Avoids:** Hardcoded colors pitfall from PITFALLS.md
**Complexity:** LOW — Copy existing Button token pattern
**Research needed:** NO — well-established pattern

### Phase 2: Core Input Component
**Rationale:** Input is simpler than Textarea (no auto-resize complexity). Validates ElementInternals validation pattern before duplicating to Textarea.
**Delivers:** `@lit-ui/input` package with text/email/password/number/search types, form participation, validation
**Addresses:** Core input types (table stakes), form participation (table stakes), native validation (table stakes)
**Avoids:** ElementInternals SSR crashes, validation sync issues
**Complexity:** MEDIUM — New component but proven patterns
**Research needed:** NO — Stack/architecture research complete, patterns documented

### Phase 3: Core Textarea Component
**Rationale:** Reuses Input validation patterns. Auto-resize deferred to later phase to avoid blocking MVP.
**Delivers:** `@lit-ui/textarea` package with multi-line input, rows control, resize property, form participation, validation
**Addresses:** Textarea (table stakes), form participation (table stakes)
**Avoids:** Auto-resize performance pitfalls
**Complexity:** MEDIUM — Similar to Input, skip auto-resize initially
**Research needed:** NO — Same patterns as Input

### Phase 4: Enhanced Features (Optional)
**Rationale:** Password toggle, search clear, prefix/suffix slots, character counter are differentiators but not blockers for release.
**Delivers:** Password visibility toggle, search clear button, prefix/suffix slots, character counter
**Addresses:** Competitive advantage features from FEATURES.md
**Complexity:** MEDIUM — Accessibility considerations for interactive slots
**Research needed:** YES — Pattern research for accessible icon buttons inside inputs

### Phase 5: Auto-Resize Textarea (Future)
**Rationale:** Complex feature with browser inconsistencies. Defer until CSS field-sizing has better support or until user demand validates priority.
**Delivers:** Auto-resize textarea with min/max row bounds
**Addresses:** Differentiator feature
**Avoids:** Performance pitfalls, browser compatibility issues
**Complexity:** HIGH — Browser API differences, performance tuning
**Research needed:** YES — Browser support validation, performance testing patterns

### Phase Ordering Rationale

- **Tokens first:** Prevents rework. Components can't be styled without tokens.
- **Input before Textarea:** Validates ElementInternals validation pattern once, reuse in Textarea. Lower complexity (no auto-resize).
- **Enhanced features after core:** Separates MVP from nice-to-haves. Core components ship faster.
- **Auto-resize last:** High complexity, uncertain value. Let user feedback guide prioritization.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 4 (Enhanced Features):** Accessible icon button patterns inside input slots need UX research
- **Phase 5 (Auto-Resize):** Browser API compatibility research, performance profiling patterns

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (CSS Tokens):** Copy existing token pattern from Button/Dialog
- **Phase 2 (Input):** Architecture research complete, implementation straightforward
- **Phase 3 (Textarea):** Reuses Input patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new dependencies needed; all APIs are native or proven in codebase |
| Features | HIGH | Comprehensive feature research across shadcn/ui, MUI, Chakra UI, Radix UI |
| Architecture | HIGH | Existing TailwindElement and ElementInternals patterns apply directly |
| Pitfalls | HIGH | All critical pitfalls already solved in existing codebase; Input/Textarea inherit solutions |

**Overall confidence:** HIGH

### Gaps to Address

Minor gaps requiring attention during implementation:

- **Validation message customization:** Research complete on APIs (setCustomValidity), but localization patterns need consumer documentation. Not blocking implementation.
- **Auto-resize performance:** Deferred to Phase 5. Gap remains on optimal implementation approach (CSS vs. JS), acceptable for MVP without this feature.
- **Input type tel/url priority:** Research indicates text/email/password/number/search are P0. tel/url are P1. Defer P1 types if timeline pressure.

No critical gaps blocking MVP development. All must-have features have clear implementation paths.

## Sources

### Primary (HIGH confidence)
- [MDN: ElementInternals.setValidity()](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setValidity) — Complete validation API reference
- [MDN: Constraint Validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation) — Native validation overview
- [WebKit: ElementInternals and Form-Associated Custom Elements](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) — Safari implementation, baseline announcement
- [shadcn/ui Input](https://ui.shadcn.com/docs/components/input) — Feature benchmarking
- [shadcn/ui Textarea](https://ui.shadcn.com/docs/components/textarea) — Feature benchmarking
- Existing codebase: `/packages/button/src/Button.ts` — Proven ElementInternals pattern
- Existing codebase: `/packages/core/src/tailwind-element.ts` — Base class pattern

### Secondary (MEDIUM confidence)
- [Native Form Validation of Web Components (Danny Moerkerke)](https://www.dannymoerkerke.com/blog/native-form-validation-of-web-components/) — Implementation pattern reference
- [Creating Custom Form Controls with ElementInternals (CSS-Tricks)](https://css-tricks.com/creating-custom-form-controls-with-elementinternals/) — Pattern examples
- [MUI TextField](https://mui.com/material-ui/react-text-field/) — Feature comparison
- [Chakra UI Input](https://chakra-ui.com/docs/components/input) — Feature comparison
- [Form Validation UX (Smashing Magazine)](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/) — Validation timing best practices

### Tertiary (LOW confidence)
- [OddBird: Anchor Positioning Updates](https://www.oddbird.net/2025/10/13/anchor-position-area-update/) — CSS anchor positioning for custom validation messages (future feature, browser support incomplete)
- [Cleanest Trick for Autogrowing Textareas (CSS-Tricks)](https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/) — Auto-resize patterns (Phase 5 research)

---
*Research completed: 2026-01-26*
*Ready for roadmap: yes*
