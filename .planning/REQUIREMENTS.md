# Requirements: LitUI v4.2 Form Controls

**Defined:** 2026-01-26
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v4.2 Requirements

Requirements for Checkbox, Radio, and Switch components. Each maps to roadmap phases.

### Checkbox

- [ ] **CHKB-01**: User can toggle a checkbox between checked and unchecked states
- [ ] **CHKB-02**: Checkbox supports indeterminate (tri-state) visual and ARIA (`aria-checked="mixed"`)
- [ ] **CHKB-03**: Checkbox participates in forms via ElementInternals (`name`, `value`, `setFormValue`)
- [ ] **CHKB-04**: Checkbox supports `required` validation with `setValidity`
- [ ] **CHKB-05**: Checkbox supports `disabled` state with `aria-disabled`
- [ ] **CHKB-06**: Checkbox renders label text via `label` property or default slot
- [ ] **CHKB-07**: Checkbox has size variants (sm/md/lg) matching existing components
- [ ] **CHKB-08**: Checkbox has animated SVG checkmark draw-in transition
- [ ] **CHKB-09**: Checkbox has CSS design tokens (`--ui-checkbox-*`) for full theming
- [ ] **CHKB-10**: Checkbox supports dark mode via token system
- [ ] **CHKB-11**: Checkbox is SSR-compatible with `isServer` guards
- [ ] **CHKB-12**: Checkbox toggles on Space key (not Enter, per WAI-ARIA)
- [ ] **CHKB-13**: Checkbox respects `prefers-reduced-motion` for animations
- [ ] **CHKB-14**: Checkbox supports form reset via `formResetCallback`

### Checkbox Group

- [ ] **CGRP-01**: CheckboxGroup renders with `role="group"` and `aria-labelledby`
- [ ] **CGRP-02**: CheckboxGroup displays label text
- [ ] **CGRP-03**: CheckboxGroup propagates `disabled` state to all children
- [ ] **CGRP-04**: CheckboxGroup supports select all / deselect all with indeterminate parent checkbox
- [ ] **CGRP-05**: CheckboxGroup displays error state with validation message

### Radio

- [ ] **RDIO-01**: User can select a radio option (checked/unchecked visual state)
- [ ] **RDIO-02**: Radio renders label text via `label` property or default slot
- [ ] **RDIO-03**: Radio supports `disabled` state
- [ ] **RDIO-04**: Radio has size variants (sm/md/lg)
- [ ] **RDIO-05**: Radio has animated dot scale transition on selection
- [ ] **RDIO-06**: Radio has CSS design tokens (`--ui-radio-*`) for full theming
- [ ] **RDIO-07**: Radio supports dark mode via token system
- [ ] **RDIO-08**: Radio is SSR-compatible with `isServer` guards

### Radio Group

- [ ] **RGRP-01**: RadioGroup enforces mutual exclusion (only one radio selected at a time)
- [ ] **RGRP-02**: RadioGroup participates in forms via ElementInternals (`name`, `value`, `setFormValue`)
- [ ] **RGRP-03**: RadioGroup implements roving tabindex keyboard navigation (arrow keys move + select, Tab exits group)
- [ ] **RGRP-04**: RadioGroup supports `required` validation with `setValidity`
- [ ] **RGRP-05**: RadioGroup renders with `role="radiogroup"` and `aria-labelledby`
- [ ] **RGRP-06**: RadioGroup propagates `disabled` state to all children
- [ ] **RGRP-07**: RadioGroup supports form reset via `formResetCallback`
- [ ] **RGRP-08**: RadioGroup displays error state with validation message

### Switch

- [x] **SWCH-01**: User can toggle a switch between on and off states
- [x] **SWCH-02**: Switch renders as track + thumb visual with animated slide transition
- [x] **SWCH-03**: Switch participates in forms via ElementInternals (`name`, `value`, `setFormValue`)
- [x] **SWCH-04**: Switch supports `required` validation with `setValidity`
- [x] **SWCH-05**: Switch supports `disabled` state with `aria-disabled`
- [x] **SWCH-06**: Switch renders label text via `label` property or default slot
- [x] **SWCH-07**: Switch has size variants (sm/md/lg)
- [x] **SWCH-08**: Switch uses `role="switch"` with `aria-checked` (not checkbox role)
- [x] **SWCH-09**: Switch toggles on Space key (and Enter key, per WAI-ARIA switch pattern)
- [x] **SWCH-10**: Switch has CSS design tokens (`--ui-switch-*`) for full theming
- [x] **SWCH-11**: Switch supports dark mode via token system
- [x] **SWCH-12**: Switch is SSR-compatible with `isServer` guards
- [x] **SWCH-13**: Switch respects `prefers-reduced-motion` for animations
- [x] **SWCH-14**: Switch supports form reset via `formResetCallback`

### CLI and Documentation

- [ ] **CLIDOC-01**: CLI registry entries for checkbox, radio, and switch components
- [ ] **CLIDOC-02**: Docs page for Checkbox with interactive examples
- [ ] **CLIDOC-03**: Docs page for Radio with interactive examples
- [ ] **CLIDOC-04**: Docs page for Switch with interactive examples
- [ ] **CLIDOC-05**: Navigation updated with new component pages

## Future Requirements

Deferred to later milestones.

### Checkbox Enhancements

- **CHKB-F01**: CSS parts for deep styling (`::part(box)`, `::part(check)`, `::part(label)`)
- **CHKB-F02**: Help text with `aria-describedby` association

### CheckboxGroup Enhancements

- **CGRP-F01**: Horizontal layout option (`orientation="horizontal"`)
- **CGRP-F02**: Min/max validation ("Select between 2 and 5")

### Radio Enhancements

- **RDIO-F01**: CSS parts for deep styling (`::part(circle)`, `::part(dot)`, `::part(label)`)
- **RDIO-F02**: Help text per radio option

### RadioGroup Enhancements

- **RGRP-F01**: Horizontal layout option (`orientation="horizontal"`)
- **RGRP-F02**: Radio button variant (pill/segmented button bar)

### Switch Enhancements

- **SWCH-F01**: On/off text labels inside track
- **SWCH-F02**: Custom thumb/track content via slots
- **SWCH-F03**: CSS parts (`::part(track)`, `::part(thumb)`)
- **SWCH-F04**: Loading state for async operations

## Out of Scope

| Feature | Reason |
|---------|--------|
| Shared FormAssociated mixin | Codebase avoids mixins; self-contained components for CLI copy-source |
| `@lit/context` for group communication | Slotchange + properties is simpler, proven in Select |
| Drag-to-toggle on Switch | Nice-to-have, not table stakes; few lines of pointer events if added later |
| Native `<input>` wrapped in Shadow DOM | Unnecessary with ElementInternals (already established pattern) |
| Switch `aria-checked="mixed"` | WAI-ARIA explicitly forbids mixed state on switch role |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SWCH-01 | Phase 38 | Complete |
| SWCH-02 | Phase 38 | Complete |
| SWCH-03 | Phase 38 | Complete |
| SWCH-04 | Phase 38 | Complete |
| SWCH-05 | Phase 38 | Complete |
| SWCH-06 | Phase 38 | Complete |
| SWCH-07 | Phase 38 | Complete |
| SWCH-08 | Phase 38 | Complete |
| SWCH-09 | Phase 38 | Complete |
| SWCH-10 | Phase 38 | Complete |
| SWCH-11 | Phase 38 | Complete |
| SWCH-12 | Phase 38 | Complete |
| SWCH-13 | Phase 38 | Complete |
| SWCH-14 | Phase 38 | Complete |
| CHKB-01 | Phase 39 | Pending |
| CHKB-02 | Phase 39 | Pending |
| CHKB-03 | Phase 39 | Pending |
| CHKB-04 | Phase 39 | Pending |
| CHKB-05 | Phase 39 | Pending |
| CHKB-06 | Phase 39 | Pending |
| CHKB-07 | Phase 39 | Pending |
| CHKB-08 | Phase 39 | Pending |
| CHKB-09 | Phase 39 | Pending |
| CHKB-10 | Phase 39 | Pending |
| CHKB-11 | Phase 39 | Pending |
| CHKB-12 | Phase 39 | Pending |
| CHKB-13 | Phase 39 | Pending |
| CHKB-14 | Phase 39 | Pending |
| CGRP-01 | Phase 39 | Pending |
| CGRP-02 | Phase 39 | Pending |
| CGRP-03 | Phase 39 | Pending |
| CGRP-04 | Phase 39 | Pending |
| CGRP-05 | Phase 39 | Pending |
| RDIO-01 | Phase 40 | Pending |
| RDIO-02 | Phase 40 | Pending |
| RDIO-03 | Phase 40 | Pending |
| RDIO-04 | Phase 40 | Pending |
| RDIO-05 | Phase 40 | Pending |
| RDIO-06 | Phase 40 | Pending |
| RDIO-07 | Phase 40 | Pending |
| RDIO-08 | Phase 40 | Pending |
| RGRP-01 | Phase 40 | Pending |
| RGRP-02 | Phase 40 | Pending |
| RGRP-03 | Phase 40 | Pending |
| RGRP-04 | Phase 40 | Pending |
| RGRP-05 | Phase 40 | Pending |
| RGRP-06 | Phase 40 | Pending |
| RGRP-07 | Phase 40 | Pending |
| RGRP-08 | Phase 40 | Pending |
| CLIDOC-01 | Phase 41 | Pending |
| CLIDOC-02 | Phase 41 | Pending |
| CLIDOC-03 | Phase 41 | Pending |
| CLIDOC-04 | Phase 41 | Pending |
| CLIDOC-05 | Phase 41 | Pending |

**Coverage:**
- v4.2 requirements: 54 total
- Mapped to phases: 54
- Unmapped: 0

---
*Requirements defined: 2026-01-26*
*Last updated: 2026-01-27 — Phase 38 SWCH requirements complete*
