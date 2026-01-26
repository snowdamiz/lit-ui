# Roadmap: LitUI

## Milestones

- **v1.0 MVP** — Phases 1-5 (shipped 2026-01-24)
- **v1.1 Documentation Site** — Phases 6-12 (in progress)
- **v2.0 NPM + SSR** — Phases 13-20 (shipped 2026-01-25) → [archive](milestones/v2.0-ROADMAP.md)
- **v3.0 Theme Customization** — Phases 21-24 (shipped 2026-01-25) → [archive](milestones/v3.0-ROADMAP.md)
- **v3.1 Docs Dark Mode** — Phase 25 (shipped 2026-01-25)
- **v4.0 Form Inputs** — Phases 26-30 (in progress)

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

## v4.0 Form Inputs

### Phase 26: CSS Tokens Foundation

**Goal:** Input and Textarea styling tokens exist in the theme system for consistent visual design

**Dependencies:** None (builds on existing theme system from v3.0)

**Requirements:** INFRA-01

**Plans:** 1 plan

Plans:
- [x] 26-01-PLAN.md — Add CSS tokens and TypeScript exports for Input/Textarea

**Success Criteria:**

1. Developer can use `--ui-input-*` CSS variables to style input borders, backgrounds, and text
2. Developer can use `--ui-textarea-*` CSS variables to style textarea elements
3. Theme tokens integrate with existing theme system and respond to light/dark mode
4. Visual configurator (future) can customize input/textarea colors

---

### Phase 27: Core Input Component

**Goal:** Developers can add a fully functional text input to any form with native validation and form participation

**Dependencies:** Phase 26 (CSS tokens must exist)

**Requirements:** INPUT-01, INPUT-02, INPUT-03, INPUT-04, INPUT-05, INPUT-06, INPUT-07, INPUT-08, INPUT-09, INPUT-10, INPUT-11, INPUT-12, INFRA-02

**Plans:** 2 plans

Plans:
- [x] 27-01-PLAN.md — Package infrastructure + component shell with types, sizes, form association
- [x] 27-02-PLAN.md — Visual states, validation, label/helper/error display

**Success Criteria:**

1. User can type into input fields of all supported types (text, email, password, number, search) and see appropriate browser behaviors (email keyboard on mobile, number steppers, etc.)
2. User submits form with empty required input and sees browser validation error preventing submission
3. User fills invalid input (wrong email format, too short text, pattern mismatch) and sees visual error state with validation message
4. Developer wraps lui-input in native form, submits form, and receives input value in FormData
5. User navigates to input via Tab key and sees focus ring indicating keyboard focus

---

### Phase 28: Input Differentiators

**Goal:** Input component has enhanced UX features that distinguish it from native inputs

**Dependencies:** Phase 27 (core input must exist)

**Requirements:** INPUT-13, INPUT-14, INPUT-15, INPUT-16, INPUT-17

**Success Criteria:**

1. User can toggle password visibility using an eye icon button inside the password input
2. User typing in search input sees a clear button that empties the field when clicked
3. Developer can add prefix content (icon, currency symbol) that appears before the input text
4. Developer can add suffix content (icon, unit label) that appears after the input text
5. User with maxlength input sees character count (e.g., "42/100") updating as they type

---

### Phase 29: Textarea Component

**Goal:** Developers can add a multi-line text input with the same form participation and validation as the Input component

**Dependencies:** Phase 26 (CSS tokens), Phase 27 patterns (validation, form participation)

**Requirements:** TEXTAREA-01, TEXTAREA-02, TEXTAREA-03, TEXTAREA-04, TEXTAREA-05, TEXTAREA-06, TEXTAREA-07, TEXTAREA-08, TEXTAREA-09, TEXTAREA-10, TEXTAREA-11, INFRA-03

**Success Criteria:**

1. User can type multiple lines of text and see content wrap naturally within the textarea
2. Developer can control initial textarea height via rows attribute and resize behavior via resize property
3. User submits form with empty required textarea and sees browser validation error preventing submission
4. Developer enables auto-resize and textarea grows taller as user types more content
5. User with maxlength textarea sees character count updating as they type

---

### Phase 30: CLI and Documentation

**Goal:** Developers can install Input and Textarea via CLI and learn usage from docs

**Dependencies:** Phase 27 (Input package), Phase 29 (Textarea package)

**Requirements:** INFRA-04, INFRA-05

**Success Criteria:**

1. Developer runs `npx lit-ui add input` and input component is installed in their project
2. Developer runs `npx lit-ui add textarea` and textarea component is installed in their project
3. Developer visits docs Input page and sees usage examples, props table, and validation patterns
4. Developer visits docs Textarea page and sees usage examples, props table, and auto-resize demo

---

## Progress

**Execution Order:**
- v1.0: Phases 1-5 (complete)
- v1.1: Phases 6-12 (6->7->8->9->10->11->12)
- v2.0: Phases 13-20 (complete)
- v3.0: Phases 21-24 (complete)
- v3.1: Phase 25 (complete)
- v4.0: Phases 26-30 (26->27->28->29->30)

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
| 28. Input Differentiators | v4.0 | 0/? | Planned | - |
| 29. Textarea Component | v4.0 | 0/? | Planned | - |
| 30. CLI and Documentation | v4.0 | 0/? | Planned | - |

---
*Roadmap created: 2026-01-24*
*Last updated: 2026-01-26 (Phase 27 complete)*
