# Roadmap: lit-ui

## Overview

This roadmap delivers a framework-agnostic component library built on Lit.js with Tailwind styling, distributed via a CLI tool. The journey starts with foundation work (Shadow DOM + Tailwind integration, TypeScript, design tokens), progresses through two MVP components (Button and Dialog) that validate all critical patterns, then builds the CLI distribution system, and concludes with framework verification testing.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Shadow DOM + Tailwind integration, TypeScript setup, design token system
- [x] **Phase 2: Button Component** - Full-featured button with variants, states, accessibility, form participation
- [ ] **Phase 3: Dialog Component** - Modal dialog with focus trap, ARIA, keyboard navigation, animations
- [ ] **Phase 4: CLI** - Distribution tool with init, add, registry, build tool detection
- [ ] **Phase 5: Framework Verification** - Verify components work in React 19+, Vue 3, Svelte 5

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the technical foundation that all components depend on — Shadow DOM + Tailwind integration works, TypeScript is configured, design tokens are defined
**Depends on**: Nothing (first phase)
**Requirements**: FNDN-01, FNDN-02, FNDN-03
**Success Criteria** (what must be TRUE):
  1. A TailwindElement base class exists that injects compiled Tailwind CSS into Shadow DOM via constructable stylesheets
  2. TypeScript compiles with strict mode and Lit 3 decorators work correctly
  3. CSS custom properties (design tokens) defined at :root cascade into Shadow DOM via :host
  4. A minimal test component using TailwindElement renders with Tailwind utility classes visible
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Project setup with TypeScript, Vite, and dependencies
- [x] 01-02-PLAN.md — Design token system with Tailwind v4 @theme and dark mode
- [x] 01-03-PLAN.md — TailwindElement base class with Shadow DOM CSS injection
- [x] 01-04-PLAN.md — Demo component and dev server validation

### Phase 2: Button Component
**Goal**: A production-ready button component that validates styling patterns, state management, form participation, and basic accessibility
**Depends on**: Phase 1
**Requirements**: BTN-01, BTN-02, BTN-03, BTN-04, BTN-05, BTN-06, BTN-07, BTN-08
**Success Criteria** (what must be TRUE):
  1. Button renders in all five variants (primary, secondary, outline, ghost, destructive) and three sizes (sm, md, lg)
  2. Button responds to keyboard activation (Enter/Space) and shows visible focus ring
  3. Button placed inside a `<form>` can submit the form (form participation via ElementInternals)
  4. Button in loading state shows spinner, is disabled, and announces loading via aria-busy
  5. Button accepts icons in leading/trailing slots via named slots
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Core button component with variants and sizes
- [x] 02-02-PLAN.md — Form participation and keyboard accessibility
- [x] 02-03-PLAN.md — Loading state with spinner and icon slots
- [x] 02-04-PLAN.md — Demo page and visual verification

### Phase 3: Dialog Component
**Goal**: A fully accessible modal dialog that validates complex accessibility patterns (focus management, ARIA across shadow boundaries, keyboard navigation)
**Depends on**: Phase 2
**Requirements**: DLG-01, DLG-02, DLG-03, DLG-04, DLG-05, DLG-06, DLG-07, DLG-08, DLG-09
**Success Criteria** (what must be TRUE):
  1. Dialog opens/closes via `open` property and traps focus within while open
  2. Pressing Escape closes the dialog and returns focus to the element that triggered it
  3. Dialog has proper ARIA (aria-labelledby/describedby pointing to title/description elements)
  4. Dialog has enter/exit animations that respect prefers-reduced-motion
  5. Nested dialogs work correctly (opening dialog from within dialog)
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — Core dialog with native `<dialog>`, open/close, focus trap, ARIA
- [ ] 03-02-PLAN.md — Focus return, backdrop click, close event with reason
- [ ] 03-03-PLAN.md — Enter/exit animations, reduced motion, body scroll lock
- [ ] 03-04-PLAN.md — Nested dialogs, demo page, visual verification

### Phase 4: CLI
**Goal**: A distribution tool that lets users install components via `npx lit-ui add <component>` with build tool detection and Tailwind v4 support
**Depends on**: Phase 3
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05
**Success Criteria** (what must be TRUE):
  1. Running `npx lit-ui init` creates lit-ui.json config and installs required dependencies
  2. Running `npx lit-ui add button` copies button component source to user's project
  3. CLI detects user's build tool (Vite, Webpack, esbuild) and provides appropriate setup instructions
  4. Running `npx lit-ui list` shows available components with descriptions
  5. CLI configures Tailwind v4 CSS-based setup (not legacy config file)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Framework Verification
**Goal**: Verify that Button and Dialog components work correctly in React 19+, Vue 3, and Svelte 5 without framework-specific wrappers
**Depends on**: Phase 4
**Requirements**: FWK-01, FWK-02, FWK-03
**Success Criteria** (what must be TRUE):
  1. Button and Dialog work in a React 19+ app: events fire, props bind, no console errors
  2. Button and Dialog work in a Vue 3 app: v-model works if applicable, events emit correctly
  3. Button and Dialog work in a Svelte 5 app: bindings work, events dispatch correctly
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-01-24 |
| 2. Button Component | 4/4 | Complete | 2026-01-24 |
| 3. Dialog Component | 0/4 | Not started | - |
| 4. CLI | 0/? | Not started | - |
| 5. Framework Verification | 0/? | Not started | - |

---
*Roadmap created: 2026-01-23*
*Coverage: 28/28 v1 requirements mapped*
