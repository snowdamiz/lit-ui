# Roadmap: lit-ui

## Milestones

- v1.0 MVP - Phases 1-5 (shipped 2026-01-24)
- **v1.1 Documentation Site** - Phases 6-12 (in progress)

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

### v1.1 Documentation Site (In Progress)

**Milestone Goal:** Comprehensive documentation site matching landing page theme, enabling developers to learn lit-ui through guides, API reference, and live examples.

#### Phase 6: Docs Foundation
**Goal**: Standalone docs app with navigation and responsive layout
**Depends on**: Phase 5 (v1.0 complete)
**Requirements**: INFRA-01, INFRA-02, INFRA-03
**Success Criteria** (what must be TRUE):
  1. Docs app runs at /docs with same visual style as landing page
  2. Sidebar shows collapsible section navigation
  3. Mobile users see hamburger menu that reveals navigation
  4. Layout adapts correctly from mobile to desktop breakpoints
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — Scaffold docs app with React, Vite, Tailwind, React Router
- [ ] 06-02-PLAN.md — Layout and navigation components (sidebar, header, mobile nav)
- [ ] 06-03-PLAN.md — Wire routes and verify responsive behavior

#### Phase 7: Getting Started
**Goal**: New users can install and use their first component
**Depends on**: Phase 6
**Requirements**: START-01, START-02, START-03
**Success Criteria** (what must be TRUE):
  1. User finds installation instructions for `npx lit-ui init`
  2. User can follow quick start to add first component
  3. User understands project structure after running init
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

#### Phase 8: Component Documentation
**Goal**: Complete API reference and examples for Button and Dialog
**Depends on**: Phase 6
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. User finds Button props, slots, and events documented
  2. User sees live Button examples for all variants and sizes
  3. User finds Dialog props, slots, and events documented
  4. User sees live Dialog examples (basic, nested, dismissible)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

#### Phase 9: Framework Guides
**Goal**: Developers know how to use components in their framework
**Depends on**: Phase 8
**Requirements**: FRAME-01, FRAME-02, FRAME-03
**Success Criteria** (what must be TRUE):
  1. React developers find integration guide with examples
  2. Vue developers find integration guide with examples
  3. Svelte developers find integration guide with examples
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

#### Phase 10: Theming Documentation
**Goal**: Developers can customize component appearance
**Depends on**: Phase 8
**Requirements**: THEME-01, THEME-02, THEME-03
**Success Criteria** (what must be TRUE):
  1. User finds design tokens (colors, spacing, typography) documented
  2. User learns how to customize via CSS custom properties
  3. User can set up dark mode following the guide
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

#### Phase 11: Accessibility Documentation
**Goal**: Developers understand accessibility patterns in components
**Depends on**: Phase 8
**Requirements**: A11Y-01, A11Y-02, A11Y-03
**Success Criteria** (what must be TRUE):
  1. User finds WCAG compliance overview
  2. User understands keyboard navigation patterns for each component
  3. User learns screen reader considerations
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

#### Phase 12: Polish
**Goal**: Docs are discoverable and searchable
**Depends on**: Phase 11
**Requirements**: INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. User can navigate via search or comprehensive anchor links
  2. Landing page header links to documentation
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 6 -> 7 -> 8 -> 9 -> 10 -> 11 -> 12

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 4/4 | Complete | 2026-01-24 |
| 2. Button | v1.0 | 4/4 | Complete | 2026-01-24 |
| 3. Dialog | v1.0 | 4/4 | Complete | 2026-01-24 |
| 4. CLI | v1.0 | 6/6 | Complete | 2026-01-24 |
| 5. Verification | v1.0 | 4/4 | Complete | 2026-01-24 |
| 6. Docs Foundation | v1.1 | 0/3 | Planned | - |
| 7. Getting Started | v1.1 | 0/? | Not started | - |
| 8. Component Docs | v1.1 | 0/? | Not started | - |
| 9. Framework Guides | v1.1 | 0/? | Not started | - |
| 10. Theming Docs | v1.1 | 0/? | Not started | - |
| 11. Accessibility Docs | v1.1 | 0/? | Not started | - |
| 12. Polish | v1.1 | 0/? | Not started | - |

---
*Roadmap created: 2026-01-24*
*Last updated: 2026-01-24*
