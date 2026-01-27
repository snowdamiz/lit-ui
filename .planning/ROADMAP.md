# Roadmap: LitUI

## Milestones

- **v1.0 MVP** — Phases 1-5 (shipped 2026-01-24)
- **v1.1 Documentation Site** — Phases 6-12 (in progress)
- **v2.0 NPM + SSR** — Phases 13-20 (shipped 2026-01-25) → [archive](milestones/v2.0-ROADMAP.md)
- **v3.0 Theme Customization** — Phases 21-24 (shipped 2026-01-25) → [archive](milestones/v3.0-ROADMAP.md)
- **v3.1 Docs Dark Mode** — Phase 25 (shipped 2026-01-25)
- **v4.0 Form Inputs** — Phases 26-30 (shipped 2026-01-26)
- **v4.1 Select Component** — Phases 31-37 (shipped 2026-01-27) → [archive](milestones/v4.1-ROADMAP.md)
- **v4.2 Form Controls** — Phases 38-41 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-5) - SHIPPED 2026-01-24</summary>

### Phase 1: Foundation
**Goal**: Project scaffolding with Lit, Tailwind v4, TypeScript, Vite
**Plans**: 4 plans (complete)

### Phase 2: Button Component
**Goal**: Polished button with variants, sizes, form participation, loading states
**Plans**: 4 plans (complete)

### Phase 3: Dialog Component
**Goal**: Accessible modal with focus trap, ARIA, animations, nested support
**Plans**: 4 plans (complete)

### Phase 4: CLI
**Goal**: npx lit-ui commands for init, add, list with build tool detection
**Plans**: 6 plans (complete)

### Phase 5: Framework Verification
**Goal**: Verify components work in React 19, Vue 3, Svelte 5
**Plans**: 4 plans (complete)

</details>

<details>
<summary>v1.1 Documentation Site (Phases 6-12) - IN PROGRESS</summary>

### Phase 6: Docs Foundation
**Goal**: Standalone docs app with navigation and responsive layout
**Plans**: 3 plans (complete)

### Phase 7: Getting Started
**Goal**: New users can install and use their first component
**Plans**: 2 plans (complete)

### Phase 8: Component Documentation
**Goal**: Complete API reference and examples for Button and Dialog
**Plans**: 4 plans (complete)

### Phase 9: Framework Guides
**Goal**: Developers know how to use components in their framework
**Plans**: TBD

### Phase 10: Theming Documentation
**Goal**: Developers can customize component appearance
**Plans**: TBD

### Phase 11: Accessibility Documentation
**Goal**: Developers understand accessibility patterns in components
**Plans**: TBD

### Phase 12: Polish
**Goal**: Docs are discoverable and searchable
**Plans**: TBD

</details>

---

<details>
<summary>v2.0 NPM + SSR (Phases 13-20) — SHIPPED 2026-01-25</summary>

- [x] Phase 13: Monorepo Infrastructure (5/5 plans) — completed 2026-01-25
- [x] Phase 14: Core Package (3/3 plans) — completed 2026-01-25
- [x] Phase 15: Component Packages (3/3 plans) — completed 2026-01-25
- [x] Phase 16: SSR Package (2/2 plans) — completed 2026-01-25
- [x] Phase 17: Framework Integration (3/3 plans) — completed 2026-01-25
- [x] Phase 18: CLI Enhancement (4/4 plans) — completed 2026-01-25
- [x] Phase 19: Publishing (4/4 plans) — completed 2026-01-25
- [x] Phase 20: Documentation (3/3 plans) — completed 2026-01-25

Full details: [milestones/v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md)

</details>

---

<details>
<summary>v3.0 Theme Customization (Phases 21-24) — SHIPPED 2026-01-25</summary>

- [x] Phase 21: Theme System Foundation (5/5 plans) — completed 2026-01-25
- [x] Phase 22: CLI Theme Integration (4/4 plans) — completed 2026-01-25
- [x] Phase 23: Visual Configurator Core (4/4 plans) — completed 2026-01-25
- [x] Phase 24: Presets and Enhanced Features (3/3 plans) — completed 2026-01-25

Full details: [milestones/v3.0-ROADMAP.md](milestones/v3.0-ROADMAP.md)

</details>

---

<details>
<summary>v3.1 Docs Dark Mode (Phase 25) — SHIPPED 2026-01-25</summary>

- [x] Phase 25: Docs Site Dark Mode (5/5 plans) — completed 2026-01-25

</details>

---

<details>
<summary>v4.0 Form Inputs (Phases 26-30) — SHIPPED 2026-01-26</summary>

- [x] Phase 26: CSS Tokens Foundation (1/1 plans) — completed 2026-01-26
- [x] Phase 27: Core Input Component (2/2 plans) — completed 2026-01-26
- [x] Phase 28: Input Differentiators (2/2 plans) — completed 2026-01-26
- [x] Phase 29: Textarea Component (2/2 plans) — completed 2026-01-26
- [x] Phase 30: CLI and Documentation (3/3 plans) — completed 2026-01-26

</details>

---

<details>
<summary>v4.1 Select Component (Phases 31-37) — SHIPPED 2026-01-27</summary>

- [x] Phase 31: Select Infrastructure (2/2 plans) — completed 2026-01-26
- [x] Phase 32: Core Single Select (4/4 plans) — completed 2026-01-26
- [x] Phase 33: Select Enhancements (4/4 plans) — completed 2026-01-26
- [x] Phase 34: Multi-Select (4/4 plans) — completed 2026-01-27
- [x] Phase 35: Combobox (4/4 plans) — completed 2026-01-27
- [x] Phase 36: Async Loading (6/6 plans) — completed 2026-01-27
- [x] Phase 37: CLI and Documentation (4/4 plans) — completed 2026-01-27

Full details: [milestones/v4.1-ROADMAP.md](milestones/v4.1-ROADMAP.md)

</details>

---

## v4.2 Form Controls (Phases 38-41)

**Milestone Goal:** Add Checkbox, Radio, and Switch toggle components with group containers, completing the core form primitive toolkit. Zero new dependencies -- all capabilities exist in current stack.

- [ ] **Phase 38: Switch Component** - Standalone toggle proving form participation and animation patterns
- [ ] **Phase 39: Checkbox + CheckboxGroup** - Checked/indeterminate states with group communication
- [ ] **Phase 40: Radio + RadioGroup** - Mutual exclusion with roving tabindex and group form ownership
- [ ] **Phase 41: CLI and Documentation** - Registry entries and docs pages for all three controls

### Phase 38: Switch Component
**Goal**: Users can toggle a switch control on/off with animated slide transition, form submission, and full keyboard/screen reader accessibility
**Depends on**: Nothing (first phase of v4.2; builds on established patterns from v4.0/v4.1)
**Requirements**: SWCH-01, SWCH-02, SWCH-03, SWCH-04, SWCH-05, SWCH-06, SWCH-07, SWCH-08, SWCH-09, SWCH-10, SWCH-11, SWCH-12, SWCH-13, SWCH-14
**Success Criteria** (what must be TRUE):
  1. User can click or press Space/Enter to toggle a switch between on and off, with the thumb sliding smoothly across the track
  2. A switch inside a `<form>` submits its value when checked and omits when unchecked, and resets to its default state on form reset
  3. A switch with `required` prevents form submission when unchecked, showing validation feedback
  4. Switch renders correctly at sm/md/lg sizes, in light and dark mode, and with `disabled` state visually distinct and non-interactive
  5. Screen readers announce the switch with `role="switch"` and current on/off state; animations respect `prefers-reduced-motion`
**Plans**: 2 plans
Plans:
- [ ] 38-01-PLAN.md — Package scaffolding + CSS design tokens
- [ ] 38-02-PLAN.md — Switch component implementation + build

### Phase 39: Checkbox + CheckboxGroup
**Goal**: Users can check/uncheck individual checkboxes (including indeterminate tri-state) and use groups with disabled propagation, select-all coordination, and group validation
**Depends on**: Phase 38 (form participation pattern, animation approach, CSS token conventions)
**Requirements**: CHKB-01, CHKB-02, CHKB-03, CHKB-04, CHKB-05, CHKB-06, CHKB-07, CHKB-08, CHKB-09, CHKB-10, CHKB-11, CHKB-12, CHKB-13, CHKB-14, CGRP-01, CGRP-02, CGRP-03, CGRP-04, CGRP-05
**Success Criteria** (what must be TRUE):
  1. User can click or press Space to toggle a checkbox between checked and unchecked, with an animated SVG checkmark draw-in transition
  2. A checkbox set to indeterminate displays a dash icon and announces `aria-checked="mixed"` to screen readers; indeterminate clears on user interaction
  3. Each checkbox inside a `<form>` submits independently with its name/value, supports `required` validation, and resets correctly
  4. A CheckboxGroup with `disabled` greys out all child checkboxes; a select-all parent checkbox reflects indeterminate when some children are checked
  5. CheckboxGroup displays a validation error message when group-level validation fails (e.g., required group with nothing checked)
**Plans**: TBD

### Phase 40: Radio + RadioGroup
**Goal**: Users can select one option from a radio group with arrow key navigation, mutual exclusion enforced by the group, and the group submitting the selected value to forms
**Depends on**: Phase 39 (slot-based group communication pattern from CheckboxGroup)
**Requirements**: RDIO-01, RDIO-02, RDIO-03, RDIO-04, RDIO-05, RDIO-06, RDIO-07, RDIO-08, RGRP-01, RGRP-02, RGRP-03, RGRP-04, RGRP-05, RGRP-06, RGRP-07, RGRP-08
**Success Criteria** (what must be TRUE):
  1. Clicking a radio option selects it (with animated dot scale transition) and deselects all siblings -- only one radio in a group is ever selected
  2. Arrow keys (Up/Down/Left/Right) move focus AND selection through radio options with wrapping, and Tab exits the group entirely (roving tabindex)
  3. RadioGroup participates in forms via ElementInternals: submits the selected radio's value, supports `required` validation, and resets on form reset
  4. RadioGroup with `disabled` makes all child radios non-interactive; individual radios can also be independently disabled
  5. Screen readers announce `role="radiogroup"` on the group and `role="radio"` with checked state on each option, with proper group labeling
**Plans**: TBD

### Phase 41: CLI and Documentation
**Goal**: All three new components are installable via CLI and documented with interactive examples on the docs site
**Depends on**: Phases 38, 39, 40 (all components must exist)
**Requirements**: CLIDOC-01, CLIDOC-02, CLIDOC-03, CLIDOC-04, CLIDOC-05
**Success Criteria** (what must be TRUE):
  1. Running `npx lit-ui add checkbox`, `npx lit-ui add radio`, and `npx lit-ui add switch` installs the respective component with correct dependencies
  2. Docs site has dedicated pages for Checkbox, Radio, and Switch, each with interactive examples covering variants, states, groups, and form integration
  3. Docs navigation includes all three new component pages in the correct section
**Plans**: TBD

## Progress

**Execution Order:**
- v1.0: Phases 1-5 (complete)
- v1.1: Phases 6-12 (6->7->8->9->10->11->12)
- v2.0: Phases 13-20 (complete)
- v3.0: Phases 21-24 (complete)
- v3.1: Phase 25 (complete)
- v4.0: Phases 26-30 (complete)
- v4.1: Phases 31-37 (complete)
- v4.2: Phases 38-41 (38->39->40->41)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 4/4 | Complete | 2026-01-24 |
| 2. Button | v1.0 | 4/4 | Complete | 2026-01-24 |
| 3. Dialog | v1.0 | 4/4 | Complete | 2026-01-24 |
| 4. CLI | v1.0 | 6/6 | Complete | 2026-01-24 |
| 5. Verification | v1.0 | 4/4 | Complete | 2026-01-24 |
| 6. Docs Foundation | v1.1 | 3/3 | Complete | 2026-01-24 |
| 7. Getting Started | v1.1 | 2/2 | Complete | 2026-01-24 |
| 8. Component Docs | v1.1 | 4/4 | Complete | 2026-01-24 |
| 9. Framework Guides | v1.1 | 0/? | Not started | - |
| 10. Theming Docs | v1.1 | 0/? | Not started | - |
| 11. Accessibility Docs | v1.1 | 0/? | Not started | - |
| 12. Polish | v1.1 | 0/? | Not started | - |
| 13. Monorepo Infrastructure | v2.0 | 5/5 | Complete | 2026-01-25 |
| 14. Core Package | v2.0 | 3/3 | Complete | 2026-01-25 |
| 15. Component Packages | v2.0 | 3/3 | Complete | 2026-01-25 |
| 16. SSR Package | v2.0 | 2/2 | Complete | 2026-01-25 |
| 17. Framework Integration | v2.0 | 3/3 | Complete | 2026-01-25 |
| 18. CLI Enhancement | v2.0 | 4/4 | Complete | 2026-01-25 |
| 19. Publishing | v2.0 | 4/4 | Complete | 2026-01-25 |
| 20. Documentation | v2.0 | 3/3 | Complete | 2026-01-25 |
| 21. Theme System Foundation | v3.0 | 5/5 | Complete | 2026-01-25 |
| 22. CLI Theme Integration | v3.0 | 4/4 | Complete | 2026-01-25 |
| 23. Visual Configurator Core | v3.0 | 4/4 | Complete | 2026-01-25 |
| 24. Presets and Enhanced Features | v3.0 | 3/3 | Complete | 2026-01-25 |
| 25. Docs Site Dark Mode | v3.1 | 5/5 | Complete | 2026-01-25 |
| 26. CSS Tokens Foundation | v4.0 | 1/1 | Complete | 2026-01-26 |
| 27. Core Input Component | v4.0 | 2/2 | Complete | 2026-01-26 |
| 28. Input Differentiators | v4.0 | 2/2 | Complete | 2026-01-26 |
| 29. Textarea Component | v4.0 | 2/2 | Complete | 2026-01-26 |
| 30. CLI and Documentation | v4.0 | 3/3 | Complete | 2026-01-26 |
| 31. Select Infrastructure | v4.1 | 2/2 | Complete | 2026-01-26 |
| 32. Core Single Select | v4.1 | 4/4 | Complete | 2026-01-26 |
| 33. Select Enhancements | v4.1 | 4/4 | Complete | 2026-01-26 |
| 34. Multi-Select | v4.1 | 4/4 | Complete | 2026-01-27 |
| 35. Combobox | v4.1 | 4/4 | Complete | 2026-01-27 |
| 36. Async Loading | v4.1 | 6/6 | Complete | 2026-01-27 |
| 37. CLI and Documentation | v4.1 | 4/4 | Complete | 2026-01-27 |
| 38. Switch Component | v4.2 | 0/? | Not started | - |
| 39. Checkbox + CheckboxGroup | v4.2 | 0/? | Not started | - |
| 40. Radio + RadioGroup | v4.2 | 0/? | Not started | - |
| 41. CLI and Documentation | v4.2 | 0/? | Not started | - |

---
*Roadmap created: 2026-01-24*
*Last updated: 2026-01-26 (v4.2 milestone roadmapped)*
