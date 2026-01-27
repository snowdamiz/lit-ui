# Roadmap: LitUI

## Milestones

- **v1.0 MVP** — Phases 1-5 (shipped 2026-01-24)
- **v1.1 Documentation Site** — Phases 6-12 (in progress)
- **v2.0 NPM + SSR** — Phases 13-20 (shipped 2026-01-25) → [archive](milestones/v2.0-ROADMAP.md)
- **v3.0 Theme Customization** — Phases 21-24 (shipped 2026-01-25) → [archive](milestones/v3.0-ROADMAP.md)
- **v3.1 Docs Dark Mode** — Phase 25 (shipped 2026-01-25)
- **v4.0 Form Inputs** — Phases 26-30 (shipped 2026-01-26)
- **v4.1 Select Component** — Phases 31-37 (current)

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

## v4.1 Select Component

### Phase 31: Select Infrastructure

**Goal:** Foundational CSS tokens, package structure, and positioning library are ready for Select component development

**Dependencies:** None (builds on existing theme system from v3.0, patterns from v4.0)

**Requirements:** INFRA-01, INFRA-02, INFRA-03

**Plans:** 2 plans

Plans:
- [x] 31-01-PLAN.md — Add CSS tokens for select to @lit-ui/core
- [x] 31-02-PLAN.md — Create @lit-ui/select package with Floating UI

**Success Criteria:**

1. Developer can use `--ui-select-*` CSS variables to style select borders, backgrounds, dropdown, and options
2. @lit-ui/select package exists with proper peer dependencies and SSR compatibility
3. Floating UI is integrated and positioning dropdown relative to trigger works with collision detection
4. Package builds successfully and exports are available for consumption

---

### Phase 32: Core Single Select

**Goal:** Users can select a single value from a dropdown with full keyboard navigation, ARIA compliance, and form participation

**Dependencies:** Phase 31 (CSS tokens and package must exist)

**Requirements:** SELECT-01, SELECT-02, SELECT-03, SELECT-04, SELECT-05, SELECT-06, SELECT-07, SELECT-08, SELECT-09, SELECT-10, SELECT-11, SELECT-12, A11Y-01, A11Y-02, A11Y-03, A11Y-04

**Plans:** 4 plans

Plans:
- [x] 32-01-PLAN.md — Dropdown and options infrastructure
- [x] 32-02-PLAN.md — Keyboard navigation and type-ahead
- [x] 32-03-PLAN.md — Form participation and visual states
- [x] 32-04-PLAN.md — Final verification checkpoint

**Success Criteria:**

1. User clicks select trigger and dropdown opens with options; user clicks option and selection is displayed in trigger
2. User navigates options with arrow keys, selects with Enter, and closes with Escape without using mouse
3. User types characters and focus moves to first option starting with those characters (type-ahead)
4. Developer wraps lui-select in native form, submits form, and receives selected value in FormData
5. Screen reader user hears current selection, available options count, and navigation instructions via ARIA

---

### Phase 33: Select Enhancements

**Goal:** Select component supports advanced organization and customization features beyond basic single-select

**Dependencies:** Phase 32 (core single select must work)

**Requirements:** SELECT-13, SELECT-14, SELECT-15, A11Y-05

**Plans:** 4 plans

Plans:
- [x] 33-01-PLAN.md — Slot-based options with custom content
- [x] 33-02-PLAN.md — Option groups component
- [x] 33-03-PLAN.md — Clearable select
- [x] 33-04-PLAN.md — Final verification checkpoint

**Success Criteria:**

1. Developer groups options under labeled headers (lui-option-group) and users see visual grouping with accessible labels
2. Developer adds icons or descriptions inside options via slots and content renders correctly
3. User with clearable select clicks X button and selection resets to empty/placeholder state
4. Screen reader user navigating option groups hears group labels announced correctly

---

### Phase 34: Multi-Select

**Goal:** Users can select multiple values displayed as removable tags with proper form submission

**Dependencies:** Phase 32 (single select foundation required)

**Requirements:** MULTI-01, MULTI-02, MULTI-03, MULTI-04, MULTI-05, MULTI-06, MULTI-07

**Plans:** 4 plans

Plans:
- [x] 34-01-PLAN.md — Core multi-select mode with selection tracking and form participation
- [x] 34-02-PLAN.md — Tag display with removal functionality
- [x] 34-03-PLAN.md — Tag overflow and select all / deselect all actions
- [x] 34-04-PLAN.md — Human verification checkpoint

**Success Criteria:**

1. User clicks multiple options and each selection appears as a tag/chip in the trigger area
2. User clicks X on a tag and that selection is removed without affecting other selections
3. Developer submits form with multi-select and server receives array of values via FormData.getAll()
4. User with many selections sees overflow display ("+N more") instead of squished tags
5. User clicks "select all" action and all options become selected; clicks again to deselect all

---

### Phase 35: Combobox

**Goal:** Users can type to filter options with highlighted matches and optional ability to create new options

**Dependencies:** Phase 32 (single select foundation), benefits from Phase 34 patterns

**Requirements:** COMBO-01, COMBO-02, COMBO-03, COMBO-04, COMBO-05, COMBO-06, A11Y-06

**Plans:** 4 plans

Plans:
- [x] 35-01-PLAN.md — Searchable mode foundation with filtering and input trigger
- [x] 35-02-PLAN.md — Match highlighting and empty state
- [x] 35-03-PLAN.md — Custom filter function and creatable mode
- [x] 35-04-PLAN.md — Human verification checkpoint

**Success Criteria:**

1. User types in combobox input and options filter to show only matching items in real-time
2. User sees matching text highlighted within option labels (e.g., typed "app" highlights "app" in "Apple")
3. User types query with no matches and sees empty state message ("No options found")
4. Developer enables creatable mode and user can add new option when no match exists
5. Keyboard navigation in filtered list follows W3C APG combobox pattern (arrows move through filtered options)

---

### Phase 36: Async Loading

**Goal:** Select supports loading options from async sources with proper loading states, error handling, and performance optimization

**Dependencies:** Phase 32 (core select), Phase 35 (combobox for async search)

**Requirements:** ASYNC-01, ASYNC-02, ASYNC-03, ASYNC-04, ASYNC-05, ASYNC-06, INFRA-04

**Plans:** 6 plans

Plans:
- [ ] 36-01-PLAN.md — Add dependencies and skeleton loading placeholders
- [ ] 36-02-PLAN.md — Promise-based options with loading/error states
- [ ] 36-03-PLAN.md — Async search with debounce and AbortController
- [ ] 36-04-PLAN.md — Virtual scrolling integration
- [ ] 36-05-PLAN.md — Infinite scroll pagination
- [ ] 36-06-PLAN.md — Human verification checkpoint

**Success Criteria:**

1. Developer provides Promise for options prop and select shows loading skeleton until resolved
2. User sees error state with retry button when async options fail to load; clicking retry re-fetches
3. User types in async combobox and API is called after debounce period; results replace options
4. User scrolls to bottom of long option list and next page of options loads automatically (infinite scroll)
5. Developer with 1000+ options enables virtual scrolling and dropdown remains performant (60fps scroll)

---

### Phase 37: CLI and Documentation

**Goal:** Developers can install Select via CLI and learn all features from comprehensive documentation

**Dependencies:** Phase 32-36 (Select component features complete)

**Requirements:** INFRA-05, INFRA-06

**Plans:** TBD

**Success Criteria:**

1. Developer runs `npx lit-ui add select` and select component is installed in their project
2. Developer visits docs Select page and sees basic usage, all props, events, and slots documented
3. Developer finds working examples for single-select, multi-select, combobox, and async loading
4. Developer understands keyboard navigation and ARIA implementation from accessibility section

---

## Progress

**Execution Order:**
- v1.0: Phases 1-5 (complete)
- v1.1: Phases 6-12 (6->7->8->9->10->11->12)
- v2.0: Phases 13-20 (complete)
- v3.0: Phases 21-24 (complete)
- v3.1: Phase 25 (complete)
- v4.0: Phases 26-30 (complete)
- v4.1: Phases 31-37 (31->32->33->34->35->36->37)

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
| 36. Async Loading | v4.1 | 0/? | Not started | - |
| 37. CLI and Documentation | v4.1 | 0/? | Not started | - |

---
*Roadmap created: 2026-01-24*
*Last updated: 2026-01-27 (Phase 35 planned)*
