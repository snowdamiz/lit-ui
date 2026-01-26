# Roadmap: LitUI

## Milestones

- **v1.0 MVP** — Phases 1-5 (shipped 2026-01-24)
- **v1.1 Documentation Site** — Phases 6-12 (in progress)
- **v2.0 NPM + SSR** — Phases 13-20 (shipped 2026-01-25) → [archive](milestones/v2.0-ROADMAP.md)
- **v3.0 Theme Customization** — Phases 21-24 (shipped 2026-01-25) → [archive](milestones/v3.0-ROADMAP.md)
- **v3.1 Docs Dark Mode** — Phase 25 (in progress)

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

## v3.1 Docs Dark Mode

### Phase 25: Docs Site Dark Mode

**Goal:** Users can toggle between light and dark mode on the docs site with their preference persisting across sessions

**Dependencies:** None (builds on existing docs site from v1.1)

**Requirements:** DARK-01, DARK-02, DARK-03, DARK-04, DARK-05, DARK-06, DARK-07, DARK-08

**Plans:** 5 plans

Plans:
- [ ] 25-01-PLAN.md — Theme infrastructure (ThemeContext, FOUC prevention, Tailwind dark mode)
- [ ] 25-02-PLAN.md — Theme toggle component and header integration
- [ ] 25-03-PLAN.md — Dark mode styling for navigation components
- [ ] 25-04-PLAN.md — Dark mode styling for content components
- [ ] 25-05-PLAN.md — Configurator toggle sync and component styling

**Success Criteria:**

1. User sees a theme toggle button in the header on every docs page
2. User can click toggle and entire docs site switches between light/dark immediately
3. User closes browser, reopens docs site later, and sees their previously selected theme
4. User with system dark mode preference visits docs for first time and sees dark theme
5. User on configurator page can use either the header toggle or configurator's mode toggle to switch docs theme (both stay in sync)

---

## Progress

**Execution Order:**
- v1.0: Phases 1-5 (complete)
- v1.1: Phases 6-12 (6->7->8->9->10->11->12)
- v2.0: Phases 13-20 (complete)
- v3.0: Phases 21-24 (complete)
- v3.1: Phase 25

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
| 25. Docs Site Dark Mode | v3.1 | 0/5 | Planned | - |

---
*Roadmap created: 2026-01-24*
*Last updated: 2026-01-25 (Phase 25 plans created)*
